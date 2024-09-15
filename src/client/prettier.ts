import vscode from 'vscode';
import fs from 'fs';
import { spawn, exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';
import { buildProtocol } from '../protocol';
import { output } from './output';

interface ModuleArguments {
    globalNodeModules: string;
    property: string;
    module: string;
    entryPoint: string;
}

type ExitListener = (code: number | null, signal: NodeJS.Signals | null) => void;

export type PrettierInstance = Awaited<ReturnType<typeof startServer>>;

const execAsync = promisify(exec);

export async function startServer() {
    const DEBUG = false;

    const entryPoint = join(__dirname, '..', 'server', 'index.js');
    const args = [];

    if (DEBUG) {
        args.push('--inspect-brk');
    }

    args.push(entryPoint);

    const { stdout } = await execAsync(`${buildNodeCommand('npm')} root -g`);
    const globalNodeModules = stdout.trim();

    args.push(await buildModulePath({
        globalNodeModules,
        property: 'pathToPrettier',
        module: 'prettier',
        entryPoint: 'index'
    }));

    args.push(await buildModulePath({
        globalNodeModules,
        property: 'pathToPrettierJavaPlugin',
        module: 'prettier-plugin-java',
        entryPoint: join('dist', 'index')
    }));

    const process = spawn(buildNodeCommand('node'), args, {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });

    let exited = false;
    let exitCallback: ExitListener | null = null;

    const protocol = buildProtocol(process)
        .onError(([, stack]) => output.appendLine(stack))
        .subscribe();

    const exitListener: ExitListener = (code, signal) => exitCallback?.(code, signal);

    process.on('exit', exitListener);

    process.on('exit', (code, signal) => {
		exited = true;

		if (signal) {
			output.appendLine(`Prettier server received signal ${signal}.`);
		}

		if (code) {
			output.appendLine(`Prettier server exited with code ${code}.`);
		}
    });

    output.appendLine('Prettier server started!');

    return {
        async format(fileName: string, code: string) {
            const [formattedCode] = await protocol.sendFormatRequest(fileName, code);
            return formattedCode;
        },

        stopServer() {
            if (!exited) {
                process.removeListener('exit', exitListener);
                process.kill();
            }
        },

        onExit(callback: ExitListener) {
            exitCallback = callback;
        }
    };
}

async function buildModulePath({ globalNodeModules, property, module, entryPoint }: ModuleArguments) {
    const directoryPath = buildModuleDirectoryPath({ globalNodeModules, property, module });
    const fullPath = join(directoryPath, `${entryPoint}.js`);

    const exists = await fs.promises.stat(fullPath).then(() => true).catch(() => false);
    if (exists) {
        return fullPath;
    }

    return join(directoryPath, `${entryPoint}.cjs`);
}

function buildModuleDirectoryPath({ globalNodeModules, property, module }: Omit<ModuleArguments, 'entryPoint'>) {
    const path = getConfiguration().get<string>(property);

    if (path) {
        return path;
    }

    return join(globalNodeModules, module);
}

function buildNodeCommand(executable: string) {
    const nodePath = getConfiguration().get<string>('pathToNode');

    if (nodePath) {
        return join(nodePath, executable);
    }

    return executable;
}

function getConfiguration() {
    return vscode.workspace.getConfiguration('prettier-java-formatter');
}