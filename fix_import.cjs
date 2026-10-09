const fs = require('fs');
let content = fs.readFileSync('src/Components/ProgramaPredicacion.jsx', 'utf8');
content = content.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate } from 'react-router-dom';\nimport Loading from './Loading';");
fs.writeFileSync('src/Components/ProgramaPredicacion.jsx', content);
