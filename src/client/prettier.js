const vscode = require('vscode');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const { join } = require('path');
const { promisify } = require('util');
const { buildProtocol } = require('../protocol');
const { output } = require('./output');

const execAsync = promisify(exec);

async function startServer() {
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

    const protocol = buildProtocol(process)
        .onError(([, stack]) => output.appendLine(stack))
        .subscribe();

    let exitCallback;
    process.on('exit', (code, signal) => exitCallback?.(code, signal));

    return {
        async format(fileName, code) {
            const [formattedCode] = await protocol.sendFormatRequest(fileName, code);
            return formattedCode;
        },

        onExit(callback) {
            exitCallback = callback;
        }
    };
}

async function buildModulePath({ globalNodeModules, property, module, entryPoint }) {
    const directoryPath = buildModuleDirectoryPath({ globalNodeModules, property, module });
    const fullPath = join(directoryPath, `${entryPoint}.js`);

    const exists = await fs.promises.stat(fullPath).then(() => true).catch(() => false);
    if (exists) {
        return fullPath;
    }

    return join(directoryPath, `${entryPoint}.cjs`);
}

function buildModuleDirectoryPath({ globalNodeModules, property, module }) {
    const path = getConfiguration().get(property);

    if (path) {
        return path;
    }

    return join(globalNodeModules, module);
}

function buildNodeCommand(executable) {
    const nodePath = getConfiguration().get('pathToNode');

    if (nodePath) {
        return join(nodePath, executable);
    }

    return executable;
}

function getConfiguration() {
    return vscode.workspace.getConfiguration('prettier-java-formatter');
}

module.exports = { startServer };