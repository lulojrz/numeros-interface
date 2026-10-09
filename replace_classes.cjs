
const fs = require('fs');
const glob = require('glob'); // Not available natively? We'll just read src/Components and src/Pages

const updateClasses = (file) => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace hardcoded Bootstrap classes with theme-aware ones
    content = content.replace(/\bbg-white\b/g, 'bg-body');
    content = content.replace(/\bbg-light\b/g, 'bg-body-tertiary');
    content = content.replace(/\btext-dark\b/g, 'text-body');
    content = content.replace(/\btext-secondary\b/g, 'text-body-secondary');
    
    // Some borders might need adjustments too, but these are the main ones
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
}

const walkDir = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const path = dir + '/' + file;
        if (fs.statSync(path).isDirectory()) {
            walkDir(path);
        } else if (path.endsWith('.jsx')) {
            updateClasses(path);
        }
    }
}

walkDir('src/Components');
walkDir('src/Pages');
console.log('Done');

