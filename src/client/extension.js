// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

const vscode = require('vscode');
const { startServer } = require('./prettier');
const { output } = require('./output');

let prettierInstance = null;

async function startPrettier() {
	stopPrettier();

	try {
		prettierInstance = await startServer();
		prettierInstance.onExit(displayRestartErrorMessage);
	} catch (error) {
		output.appendLine(error.stack);
		displayRestartErrorMessage();
	}
}

function displayStartErrorMessage() {
	return displayErrorMessage(
		'Unable to format Java code as Prettier server isn\'t running.',
		'Start server'
	);
}

function displayRestartErrorMessage() {
	return displayErrorMessage(
		'Prettier server exited unexpectedly. Please verify paths to Node, Prettier and Prettier Java plugin and try again.',
		'Restart server'
	);
}

async function displayErrorMessage(message, button) {
	stopPrettier();

	const clickedButton = await vscode.window.showErrorMessage(message, button);

	if (clickedButton === button) {
		return startPrettier();
	}
}

function stopPrettier() {
	if (prettierInstance === null) {
		return;
	}

	prettierInstance.stopServer();
	prettierInstance = null;
}

async function format(document) {
	if (prettierInstance === null) {
		displayStartErrorMessage();
		return [];
	}

	const formattedCode = await prettierInstance.format(document.fileName, document.getText());

	const range = new vscode.Range(
		document.lineAt(0).range.start,
		document.lineAt(document.lineCount - 1).range.end
	);

	return [vscode.TextEdit.replace(range, formattedCode)];
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	await startPrettier();

	const formatter = vscode.languages.registerDocumentFormattingEditProvider('java', {
		async provideDocumentFormattingEdits(document) {
			try {
				return await format(document);
			} catch (error) {
				output.appendLine(error.stack);
				return [];
			}
		}
	});

	const configurationListener = vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('prettier-java-formatter')) {
			startPrettier();
		}
	});

	const restartCommand = vscode.commands.registerCommand('prettier-java-formatter.restart', startPrettier);

	context.subscriptions.push(formatter);
	context.subscriptions.push(configurationListener);
	context.subscriptions.push(restartCommand);

	output.appendLine('Prettier Java formatter is now active!');
}

// This method is called when your extension is deactivated
function deactivate() {
	stopPrettier();
	output.appendLine('Prettier Java formatter is now deactivated.');
}

module.exports = {
	activate,
	deactivate
}