import { Args, buildProtocol } from '../protocol';

(async function() {
	const protocol = buildProtocol(process)
		.onFormatRequest(async ([id, fileName, code]) =>
			protocol.sendFormatResponse(id, await protocol.runAsync(() => format(fileName, code)))
		)
		.subscribe();

	const { argv } = process;

	function checkArguments(args: string[]): args is Args<4> {
		return args.length === 4;
	}

	if (!checkArguments(argv)) {
		const message = 'Prettier server requires two arguments: path to Prettier and path to Prettier Java.';
		const error = new Error(message);

		protocol.sendError(error);
		throw error;
	}

	const { default: prettier } = await protocol.runAsync(() => import(argv[2]));
	const { default: prettierPluginJava } = await protocol.runAsync(() => import(argv[3]));

	async function format(fileName: string, code: string): Promise<string> {
		const prettierConfig = await prettier.resolveConfig(fileName, { editorconfig: true });

		return prettier.format(code, {
			parser: 'java',
			plugins: [prettierPluginJava],
			...prettierConfig
		});
	}
})();