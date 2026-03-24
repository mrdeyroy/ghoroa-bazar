import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, 'import.meta.env.VITE_API_URL + "$1"');
    content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, "import.meta.env.VITE_API_URL + '$1'");
    content = content.replace(/http:\/\/localhost:5000/g, '${import.meta.env.VITE_API_URL}');

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Updated: " + filePath);
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

const srcPath = path.join(__dirname, 'src');
console.log('Replacing URLs in:', srcPath);
traverse(srcPath);
