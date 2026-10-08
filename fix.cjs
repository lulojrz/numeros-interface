const fs = require('fs');
let content = fs.readFileSync('src/Components/ProgramaPredicacion.jsx', 'utf8');
content = content.replace(
    /<div className="d-flex align-items-center text-muted">\s*<div className="bg-success bg-opacity-10 rounded-circle p-2 me-3 text-success">\s*<i className="bi bi-map-fill fs-5"><\/i>\s*<\/div>\s*<div>\s*<div className="small fw-bold text-uppercase text-success">Territorio<\/div>\s*<div className="text-dark fw-bold">N. \{s\.territorio\.numero\}<\/div>\s*<\/div>\s*<\/div>/,
    `<div className="d-flex align-items-center justify-content-between text-muted w-100">
        <div className="d-flex align-items-center">
            <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3 text-success">
                <i className="bi bi-map-fill fs-5"></i>
            </div>
            <div>
                <div className="small fw-bold text-uppercase text-success">Territorio</div>
                <div className="text-dark fw-bold">Nº {s.territorio.numero}</div>
            </div>
        </div>
        <button 
            className="btn btn-sm btn-outline-success rounded-pill px-3 shadow-sm"
            onClick={() => navigate('/edificios', { state: { territorioId: s.territorio.id, territorioNumero: s.territorio.numero } })}
        >
            <i className="bi bi-box-arrow-in-right me-1"></i> Ir
        </button>
    </div>`
);
fs.writeFileSync('src/Components/ProgramaPredicacion.jsx', content);
console.log(content.includes('bi-box-arrow-in-right') ? 'Success' : 'Failed to replace');
