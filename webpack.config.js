const path = require('path');

module.exports = {
	mode: 'production',
	entry: './src/extension.js',
	output: {
		filename: 'extension.js',
		path: path.resolve(__dirname, 'dist'),
		library: {
			type: 'commonjs2'
		}
	},
	externals: {
		vscode: 'vscode'
	},
	target: 'node',
};
