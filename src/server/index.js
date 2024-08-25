const { buildProtocol } = require('../protocol');

(async function() {
    const prettier = await import('prettier');
    const prettierPluginJava = await import('prettier-plugin-java');

    async function format(fileName, code) {
		const prettierConfig = await prettier.resolveConfig(fileName, { editorconfig: true });

		return prettier.format(code, {
			parser: 'java',
			plugins: [prettierPluginJava.default],
			...prettierConfig
		});
    }

    const protocol = buildProtocol(process)
        .onFormatRequest(async ([id, fileName, code]) =>
            protocol.sendFormatResponse(id, await format(fileName, code))
        )
        .subscribe();
})();

