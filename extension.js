// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	const prettier = await import('prettier/standalone');
	const prettierPluginJava = await import('prettier-plugin-java');

	const formatter = vscode.languages.registerDocumentFormattingEditProvider('java', {
		async provideDocumentFormattingEdits(document) {
			const formattedText = await prettier.format(document.getText(), {
				parser: 'java',
				plugins: [prettierPluginJava.default],
				tabWidth: 4
			});

			const range = new vscode.Range(
				document.lineAt(0).range.start,
				document.lineAt(document.lineCount - 1).range.end
			);

			return [vscode.TextEdit.replace(range, formattedText)];
		}
	});

	context.subscriptions.push(formatter);

	console.log('Prettier Java formatter is now active!');
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}