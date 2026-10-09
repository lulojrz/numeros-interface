const fs = require('fs');

const filesToUpdate = [
    {
        file: 'src/Components/PredicacionEdificios.jsx',
        type: 'table', count: 5,
        regex: /if\s*\(loading\)\s*return\s*<div.*?spinner-border.*?<\/div>\s*<\/div>;/s
    },
    {
        file: 'src/Components/ProgramaPredicacion.jsx',
        type: 'cards', count: 3,
        regex: /if\s*\(loading\)\s*return\s*<div.*?spinner-border.*?<\/div>\s*<\/div>;/s
    },
    {
        file: 'src/Pages/Campanas.jsx',
        type: 'cards', count: 4,
        regex: /if\s*\(loading\)\s*return\s*<div.*?spinner-border.*?<\/div>\s*<\/div>;/s
    },
    {
        file: 'src/Pages/MisRevisitas.jsx',
        type: 'list', count: 4,
        regex: /if\s*\(loading\)\s*return\s*<div.*?spinner-border.*?<\/div>\s*<\/div>;/s
    }
];

filesToUpdate.forEach(({ file, type, count, regex }) => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Ensure Loading is imported
        if (!content.includes('import Loading')) {
            // Find a good place to put it
            if (content.includes('import Swal from')) {
                content = content.replace(/import Swal from.*?;\n/, match => match + "import Loading from '../Components/Loading';\n");
            } else if (content.includes('import {')) {
                content = content.replace(/import {.*?;\n/, match => match + "import Loading from '../Components/Loading';\n");
            }
        }
        // Fix relative path if needed
        if (file.startsWith('src/Components')) {
            content = content.replace("import Loading from '../Components/Loading';", "import Loading from './Loading';");
        }

        // Replace loading
        if (regex.test(content)) {
            content = content.replace(regex, `if (loading) return <div className="mt-4"><Loading type="${type}" count={${count}} /></div>;`);
            fs.writeFileSync(file, content);
            console.log(`Updated ${file}`);
        } else {
            console.log(`Regex not matched in ${file}`);
        }
    }
});
