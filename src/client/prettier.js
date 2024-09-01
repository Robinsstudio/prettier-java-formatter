const vscode = require('vscode');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const { join } = require('path');
const { promisify } = require('util');
const { buildProtocol } = require('../protocol');

const execAsync = promisify(exec);
const configuration = vscode.workspace.getConfiguration('prettier-java-formatter');

async function startPrettier() {
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

    const protocol = buildProtocol(process).subscribe();

    process.on('exit', () => console.log('Server exited!'));

    return async function format(fileName, code) {
        const [formattedCode] = await protocol.sendFormatRequest(fileName, code);
        return formattedCode;
    }
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
    const path = configuration.get(property);

    if (path) {
        return path;
    }

    return join(globalNodeModules, module);
}

function buildNodeCommand(executable) {
    const nodePath = configuration.get('pathToNode');

    if (nodePath) {
        return join(nodePath, executable);
    }

    return executable;
}

module.exports = { startPrettier };