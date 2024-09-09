const { buildProtocol } = require('../protocol');

(async function() {
	const protocol = buildProtocol(process)
		.onFormatRequest(async ([id, fileName, code]) =>
			protocol.sendFormatResponse(id, await protocol.runAsync(() => format(fileName, code)))
		)
		.subscribe();

	const { default: prettier } = await protocol.runAsync(() => import(process.argv[2]));
	const { default: prettierPluginJava } = await protocol.runAsync(() => import(process.argv[3]));

	async function format(fileName, code) {
		const prettierConfig = await prettier.resolveConfig(fileName, { editorconfig: true });

		return prettier.format(code, {
			parser: 'java',
			plugins: [prettierPluginJava],
			...prettierConfig
		});
	}
})();