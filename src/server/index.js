const { buildProtocol } = require('../protocol');

(async function () {
	const { default: prettier } = await import(process.argv[2]);
	const { default: prettierPluginJava } = await import(process.argv[3]);

	async function format(fileName, code) {
		const prettierConfig = await prettier.resolveConfig(fileName, { editorconfig: true });

		return prettier.format(code, {
			parser: 'java',
			plugins: [prettierPluginJava],
			...prettierConfig
		});
	}

	const protocol = buildProtocol(process)
		.onFormatRequest(async ([id, fileName, code]) =>
			protocol.sendFormatResponse(id, await format(fileName, code))
		)
		.subscribe();
})();

