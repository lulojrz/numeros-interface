const fs = require('fs');
let content = fs.readFileSync('src/Pages/Home.jsx', 'utf8');
content = content.replace(
    /\{s\.territorio && <span className="badge bg-success text-white shadow-sm px-3 py-2"><i className="bi bi-map-fill me-2"><\/i>Territorio \{s\.territorio\.numero\}<\/span>\}/g,
    `{s.territorio && (
            <Link 
              to="/edificios" 
              state={{ territorioId: s.territorio.id, territorioNumero: s.territorio.numero }} 
              className="badge bg-success text-white shadow-sm px-3 py-2 text-decoration-none"
            >
              <i className="bi bi-map-fill me-2"></i>Territorio {s.territorio.numero} <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          )}`
);
fs.writeFileSync('src/Pages/Home.jsx', content);
console.log(content.includes('bi-arrow-right') ? 'Success' : 'Failed');
