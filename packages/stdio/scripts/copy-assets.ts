import { copyFile } from 'node:fs/promises';

const assets = ['./src/icons/icon.svg', './src/icons/icon.png'];

for (const asset of assets) {
	await copyFile(asset, asset.replace('/src/', '/dist/'));
}
