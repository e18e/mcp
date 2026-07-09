import microUtilsReplacements from 'module-replacements/manifests/micro-utilities.json' with { type: 'json' };
import preferredReplacements from 'module-replacements/manifests/preferred.json' with { type: 'json' };
import { get_docs } from '../docs/index.js';

type ModuleReplacement =
	| (typeof microUtilsReplacements.moduleReplacements)[number]
	| (typeof preferredReplacements.moduleReplacements)[number];

const docs = await get_docs();

export function get_suggestions_for_package(pkg: string) {
	let replacement: ModuleReplacement | undefined =
		microUtilsReplacements.moduleReplacements.find(
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
		if ('docPath' in replacement) {
			if (!docs[replacement.docPath + '.md']) return;
			return `Don't use \`${pkg}\` instead read the following document:\n\n${
				docs[replacement.docPath + '.md']
			}`;
		}
		if (!('replacement' in replacement)) return;
		return `Don't use \`${pkg}\` instead ${replacement.replacement}`;
	}
	return;
}
