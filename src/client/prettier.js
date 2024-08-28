const vscode = require('vscode');
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

    args.push(buildArgument({
        globalNodeModules,
        property: 'pathToPrettier',
        module: 'prettier',
        entryPoint: 'index.mjs'
    }));

    args.push(buildArgument({
        globalNodeModules,
        property: 'pathToPrettierJavaPlugin',
        module: 'prettier-plugin-java',
        entryPoint: 'dist/index.js'
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

function buildNodeCommand(executable) {
    const nodePath = configuration.get('pathToNode');

    if (nodePath) {
        return join(nodePath, executable);
    }

    return executable;
}

function buildArgument({ globalNodeModules, property, module, entryPoint }) {
    const path = configuration.get(property);

    if (path) {
        return join(path, entryPoint);
    }

    return join(globalNodeModules, module, entryPoint);
}

module.exports = { startPrettier };