import * as fs from 'fs/promises';

const [, , dev] = process.argv;

const files = await fetch(
	'https://api.github.com/repos/es-tooling/module-replacements/contents/docs/modules'
).then((res) => res.json());

if (!Array.isArray(files))
	throw new Error('Unexpected response: files is not an array');

const docs: Record<string, string> = {};
const promises: Array<Promise<void>> = [];

for (let file of files) {
	if (!('download_url' in file)) {
		console.warn(`Skipping file ${file.name}, no download_url`);
		continue;
	}
	promises.push(
		fetch(file.download_url)
			.then((res) => res.text())
			.then(async (content) => {
				docs[file.name] = content;
				console.log(`Saved /docs/${file.name}`);
			})
	);
}

await Promise.allSettled(promises);

const folder = dev ? './src/docs' : './dist/docs';

await fs.mkdir(folder, { recursive: true });

await fs.writeFile(
	`${folder}/docs.json`,
	JSON.stringify(docs, null, 2),
	'utf8'
);
