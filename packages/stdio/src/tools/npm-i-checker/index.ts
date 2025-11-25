import { tool } from 'tmcp/utils';
import * as v from 'valibot';
import type { E18EMcpServer } from '../../index.js';
import { get_suggestions_for_package } from '../utils.js';

export function npm_i_checker(server: E18EMcpServer) {
	server.tool(
		{
			name: 'npm-i-checker',
			description:
				'Check for outdated or insecure npm packages in an install script like `npm i` or `pnpm add` or `yarn add` or `bun i`.',
			schema: v.object({
				command: v.pipe(
					v.string(),
					v.description(
						'The install command to check, e.g. `npm i express lodash` or `pnpm add express lodash` or `yarn add express lodash` or `bun i express lodash`.',
					),
				),
			}),
			outputSchema: v.object({
				suggestions: v.array(v.string()),
			}),
		},
		async ({ command }) => {
			const suggestions: string[] = [];
			// remove the install command as we don't need it...this can technically include flags but they would simple not match any package names
			const [, , ...packages] = command.split(' ');
			for (const pkg of packages) {
				if (pkg.startsWith('-')) continue;
				const suggestion = get_suggestions_for_package(pkg);
				if (suggestion) {
					suggestions.push(suggestion);
				}
			}
			return tool.structured({ suggestions });
		},
	);
}
