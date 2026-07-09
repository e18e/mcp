import type {
	KnownUrl,
	ManifestModule,
	ModuleReplacement,
	NativeModuleReplacement,
	ModuleReplacementMapping,
	SimpleModuleReplacement,
} from 'module-replacements';
import {
	microUtilsReplacements,
	nativeReplacements,
	preferredReplacements,
	resolveDocUrl,
} from 'module-replacements';
import { get_docs } from '../docs/index.js';

const docs = await get_docs();

function get_mapping_replacements(
	manifest: ManifestModule,
	mapping: ModuleReplacementMapping,
) {
	return mapping.replacements
		.map((replacement_id) => manifest.replacements[replacement_id])
		.filter((replacement) => replacement !== undefined);
}

function get_e18e_doc_path(url?: KnownUrl) {
	return typeof url === 'object' && url.type === 'e18e'
		? `${url.id}.md`
		: undefined;
}

function describe_replacement(replacement: ModuleReplacement) {
	if (replacement.type === 'documented') return replacement.replacementModule;
	if (replacement.type === 'native')
		return replacement.description ?? replacement.id;
	if (replacement.type === 'simple' && replacement.example)
		return `\`${replacement.example}\``;
	return replacement.description;
}

function format_replacements(
	mapping: ModuleReplacementMapping,
	replacements: ModuleReplacement[],
) {
	return replacements.length > 0
		? replacements.map(describe_replacement).join('\n\n')
		: `use ${mapping.replacements.join(', ')}`;
}

export type LookupResult = {
	source: 'native' | 'micro-utility' | 'preferred';
	module_name: string;
	type: string;
	description?: string;
	documentation?: string;
	replacement?: string;
	url?: string;
};

export function get_suggestions_for_package(pkg: string) {
	const micro_utils_mapping = microUtilsReplacements.mappings[pkg];
	if (micro_utils_mapping) {
		return `Don't use \`${pkg}\` instead ${format_replacements(
			micro_utils_mapping,
			get_mapping_replacements(microUtilsReplacements, micro_utils_mapping),
		)}`;
	}

	const preferred_mapping = preferredReplacements.mappings[pkg];
	if (preferred_mapping) {
		const doc_path = get_e18e_doc_path(preferred_mapping.url);
		const documentation = doc_path ? docs[doc_path] : undefined;
		if (documentation) {
			return `Don't use \`${pkg}\` instead read the following document:\n\n${documentation}`;
		}

		return `Don't use \`${pkg}\` instead ${format_replacements(
			preferred_mapping,
			get_mapping_replacements(preferredReplacements, preferred_mapping),
		)}`;
	}

	return;
}

export function lookup_replacements(query: string) {
	const normalized_query = query.toLowerCase().trim();
	if (!normalized_query) return [];

	const results: LookupResult[] = [];

	for (const mapping of Object.values(nativeReplacements.mappings)) {
		const replacements = get_mapping_replacements(nativeReplacements, mapping);
		if (
			!mapping.moduleName.toLowerCase().includes(normalized_query) &&
			!mapping.replacements.some((replacement) =>
				replacement.toLowerCase().includes(normalized_query),
			)
		) {
			continue;
		}
		const native_replacement = replacements.find(
			(replacement): replacement is NativeModuleReplacement =>
				replacement.type === 'native',
		);
		const node_engine = native_replacement?.engines?.find(
			(engine) => engine.engine === 'nodejs',
		);
		const url = resolveDocUrl(native_replacement?.url ?? mapping.url);

		results.push({
			source: 'native',
			module_name: mapping.moduleName,
			type: native_replacement?.type ?? mapping.type,
			description: node_engine?.minVersion
				? `Native replacement available in Node.js ${node_engine.minVersion} and newer. Use the built-in API instead.`
				: 'Native replacement available. Use the built-in API instead.',
			replacement: mapping.replacements.join(', '),
			...(url ? { url } : {}),
		});
	}

	for (const mapping of Object.values(microUtilsReplacements.mappings)) {
		const replacements = get_mapping_replacements(
			microUtilsReplacements,
			mapping,
		);
		const simple_replacements = replacements.filter(
			(replacement): replacement is SimpleModuleReplacement =>
				replacement.type === 'simple',
		);
		if (
			!mapping.moduleName.toLowerCase().includes(normalized_query) &&
			!simple_replacements.some((replacement) =>
				`${replacement.description}\n${replacement.example ?? ''}`
					.toLowerCase()
					.includes(normalized_query),
			)
		) {
			continue;
		}

		results.push({
			source: 'micro-utility',
			module_name: mapping.moduleName,
			type: simple_replacements[0]?.type ?? mapping.type,
			description: format_replacements(mapping, simple_replacements),
			replacement: format_replacements(mapping, simple_replacements),
		});
	}

	for (const mapping of Object.values(preferredReplacements.mappings)) {
		const doc_path = get_e18e_doc_path(mapping.url);
		const documentation = doc_path ? docs[doc_path] : undefined;
		const url = resolveDocUrl(mapping.url);
		if (
			!mapping.moduleName.toLowerCase().includes(normalized_query) &&
			!mapping.replacements.some((replacement) =>
				replacement.toLowerCase().includes(normalized_query),
			) &&
			!(doc_path ?? '').toLowerCase().includes(normalized_query) &&
			!documentation?.toLowerCase().includes(normalized_query)
		) {
			continue;
		}

		results.push({
			source: 'preferred',
			module_name: mapping.moduleName,
			type: documentation ? 'documented' : mapping.type,
			documentation,
			replacement: mapping.replacements.join(', '),
			...(url ? { url } : {}),
		});
	}

	return results;
}
