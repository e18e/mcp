import type { E18EMcpServer } from '../../index.js';
import * as v from 'valibot';
import {
	microUtilsReplacements,
	preferredReplacements,
} from 'module-replacements';
import { get_docs } from '../../docs/index.js';
import { tool } from 'tmcp/utils';

const docs = await get_docs();

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
			// remove the install command as we don't need it...this can technically include flasgs but they would simple not match any package names
			const [, , ...packages] = command.split(' ');
			for (const pkg of packages) {
				if (pkg.startsWith('-')) continue;
				let replacement = microUtilsReplacements.moduleReplacements.find(
					(replacement) => replacement.moduleName === pkg,
				);
				replacement =
					replacement ??
					preferredReplacements.moduleReplacements.find(
						(replacement) => replacement.moduleName === pkg,
					);
				if (
					replacement &&
					replacement.type !== 'native' &&
					replacement.type !== 'none'
				) {
					if (replacement.type === 'documented') {
						if (!docs[replacement.docPath + '.md']) continue;
						suggestions.push(
							`Don't use \`${pkg}\` instead read the following document:\n\n${
								docs[replacement.docPath + '.md']
							}`,
						);
						continue;
					}
					suggestions.push(
						`Don't use \`${pkg}\` instead ${replacement.replacement}`,
					);
				}
			}
			return tool.structured({ suggestions });
		},
	);
}
