import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

let docs_cache: Record<string, string> | null = null;

export async function get_docs() {
	if (docs_cache) return docs_cache;
	try {
		const file = await readFile(
			join(import.meta.dirname, './docs.json'),
			'utf8',
		);
		return (docs_cache = JSON.parse(file));
	} catch {
		return {};
	}
}
