// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

// const vscode = require('vscode');
// const prettier = require('prettier/standalone');
// const prettierPluginJava = require('prettier-plugin-java');

const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "prettier-java-formatter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('prettier-java-formatter.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from prettier-java-formatter!');
	});

	const command = vscode.commands.registerCommand('prettier-java-formatter.format', async () => {
		const { activeTextEditor } = vscode.window;

		if (activeTextEditor && activeTextEditor.document.languageId === 'java') {
			const { document } = activeTextEditor;

			const prettier = await import('prettier/standalone');
			const prettierPluginJava = await import('prettier-plugin-java');

			const formattedText = await prettier.format(document.getText(), {
				parser: 'java',
				plugins: [prettierPluginJava.default],
			});

			const start = document.positionAt(0);
			const end = document.positionAt(document.getText().length - 1);

			console.log(formattedText);
			console.log('Formatted!');

			return [vscode.TextEdit.replace(new vscode.Range(start, end), formattedText)];
		}
	});

	const formatter = vscode.languages.registerDocumentFormattingEditProvider('java', {
		async provideDocumentFormattingEdits(document) {
			const prettier = await import('prettier/standalone');
			const prettierPluginJava = await import('prettier-plugin-java');

			const formattedText = await prettier.format(document.getText(), {
				parser: 'java',
				plugins: [prettierPluginJava.default],
				tabWidth: 4
			});

			const start = document.positionAt(0);
			const end = document.positionAt(document.getText().length - 1);

			return [vscode.TextEdit.replace(new vscode.Range(start, end), formattedText)];
		}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(command);
	context.subscriptions.push(formatter);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
