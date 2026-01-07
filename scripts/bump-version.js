import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.resolve(__dirname, '../package.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Split version into major.minor.patch
const versionParts = packageJson.version.split('.').map(Number);

// Increment patch version
versionParts[2] += 1;

const newVersion = versionParts.join('.');
packageJson.version = newVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Version bumped to ${newVersion}`);
