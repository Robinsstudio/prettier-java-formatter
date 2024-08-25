const { spawn } = require('child_process');
const { join } = require('path');
const { buildProtocol } = require('../protocol');

const DEBUG = false;

const entryPoint = join(__dirname, '..', 'server', 'index.js');
const args = DEBUG ? ['--inspect-brk', entryPoint] : [entryPoint];

const process = spawn('node', args, {
	stdio: ['inherit', 'inherit', 'inherit', 'ipc']
});

const protocol = buildProtocol(process).subscribe();

process.on('exit', () => console.log('Server exited!'));

async function format(fileName, code) {
    const [formattedCode] = await protocol.sendFormatRequest(fileName, code);
    return formattedCode;
}


module.exports = { format };