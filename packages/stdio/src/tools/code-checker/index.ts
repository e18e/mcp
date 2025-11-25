import { init, parse } from 'es-module-lexer';
import { tool } from 'tmcp/utils';
import * as v from 'valibot';
import { icons } from '../../icons/index.js';
import type { E18EMcpServer } from '../../index.js';
import { get_suggestions_for_package } from '../utils.js';

export function code_checker(server: E18EMcpServer) {
	server.tool(
		{
			name: 'code-checker',
			description:
				'Check if the code contains some inefficient or outdated packages imported and suggests alternatives.',
			icons,
			schema: v.object({
				code: v.pipe(v.string(), v.description('The code to check.')),
			}),
			outputSchema: v.object({
				suggestions: v.array(v.string()),
			}),
		},
		async ({ code }) => {
			await init;
			const [imports] = parse(code);
			const suggestions: string[] = [];
			for (const imported of imports) {
				if (imported.n) {
					const suggestion = get_suggestions_for_package(imported.n);
					if (suggestion) {
						suggestions.push(suggestion);
					}
				}
			}
			return tool.structured({
				suggestions,
			});
		},
	);
}
