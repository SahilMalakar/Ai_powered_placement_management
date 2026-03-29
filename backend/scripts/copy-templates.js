import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src/utils/templates');
const distDir = path.join(process.cwd(), 'dist/utils/templates');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
files.forEach(file => {
    if (file.endsWith('.hbs')) {
        fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
        console.log(`Copied ${file} to dist`);
    }
});
