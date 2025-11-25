import {
	microUtilsReplacements,
	preferredReplacements,
} from 'module-replacements';
import { get_docs } from '../docs/index.js';

const docs = await get_docs();

export function get_suggestions_for_package(pkg: string) {
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
			if (!docs[replacement.docPath + '.md']) return;
			return `Don't use \`${pkg}\` instead read the following document:\n\n${
				docs[replacement.docPath + '.md']
			}`;
		}
		return `Don't use \`${pkg}\` instead ${replacement.replacement}`;
	}
	return;
}
