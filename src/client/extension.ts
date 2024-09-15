// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import vscode from 'vscode';
import { PrettierInstance, startServer } from './prettier';
import { output } from './output';

let prettierInstance: PrettierInstance | null = null;

function startPrettier() {
	stopPrettier();

	startServer()
		.then(instance => {
			prettierInstance = instance;
			prettierInstance.onExit(displayRestartErrorMessage);
		})
		.catch((error: Error) => {
			output.appendLine(error.stack || JSON.stringify(error, Object.getOwnPropertyNames(error)));
			displayRestartErrorMessage();
		});
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

async function displayErrorMessage(message: string, button: string) {
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

async function format(document: vscode.TextDocument) {
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
async function activate(context: vscode.ExtensionContext) {
	startPrettier();

	const formatter = vscode.languages.registerDocumentFormattingEditProvider('java', {
		async provideDocumentFormattingEdits(document) {
			return format(document)
				.catch((error: Error) => {
					output.appendLine(error.stack || JSON.stringify(error, Object.getOwnPropertyNames(error)));
					return [];
				});
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