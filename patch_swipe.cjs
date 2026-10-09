const fs = require('fs');
let content = fs.readFileSync('src/Components/PredicacionEdificios.jsx', 'utf8');

if (!content.includes('import { useSwipeable }')) {
    content = content.replace("import Loading from './Loading';", "import Loading from './Loading';\nimport { useSwipeable } from 'react-swipeable';");
}

if (!content.includes('const DptoButton =')) {
    const dptoButtonCode = `
const DptoButton = ({ dpto, btnClass, icon, abrirMenuDpto, actualizarDpto }) => {
    const handlers = useSwipeable({
        onSwipedLeft: () => {
            // Swipe a la izquierda: Marcar como No Visitado
            actualizarDpto(dpto, 'No visitado', dpto.tocar);
        },
        onSwipedRight: () => {
            // Swipe a la derecha: Marcar como Atendió
            actualizarDpto(dpto, 'Atendió', dpto.tocar);
        },
        preventDefaultTouchmoveEvent: false,
        trackMouse: true
    });

    return (
        <div className="col-4 col-sm-3 col-md-2" {...handlers}>
            <button 
                className={\`btn w-100 py-3 \${btnClass} d-flex flex-column align-items-center justify-content-center h-100\`}
                onClick={() => abrirMenuDpto(dpto)}
            >
                <i className={\`bi \${icon} fs-4 mb-1\`}></i>
                <span className="fw-bold" style={{fontSize: '0.9rem'}}>{dpto.piso}-{dpto.letra}</span>
                {dpto.estado && dpto.estado !== 'No visitado' && dpto.tocar && (
                    <span style={{fontSize: '0.65rem'}} className="mt-1 text-truncate w-100">{dpto.estado}</span>
                )}
                {dpto.ultimaFechaTrabajada && (
                    <span style={{fontSize: '0.55rem', opacity: 0.8}} className="text-truncate w-100">
                        {new Date(dpto.ultimaFechaTrabajada).toLocaleDateString()}
                    </span>
                )}
            </button>
        </div>
    );
};
`;
    content = content.replace('const PredicacionEdificios = () => {', dptoButtonCode + '\nconst PredicacionEdificios = () => {');
}

content = content.replace(/return \(\s*<div className="col-4 col-sm-3 col-md-2" key=\{dpto\.id\}>.*?<\/div>\s*\);/s,
    'return <DptoButton key={dpto.id} dpto={dpto} btnClass={btnClass} icon={icon} abrirMenuDpto={abrirMenuDpto} actualizarDpto={actualizarDpto} />;'
);

if (!content.includes('Restablecer')) {
    content = content.replace(
        /<button id="btn-ocupado" class="btn btn-secondary fw-bold">Ocupado \/ Vuelvo Luego<\/button>/,
        `<button id="btn-ocupado" class="btn btn-secondary fw-bold">Ocupado / Vuelvo Luego</button>
                      <button id="btn-novisitado" class="btn btn-outline-secondary fw-bold">Restablecer (No visitado)</button>`
    );
    
    // Using a more robust regex for the didOpen listener
    const ocupadoListenerRegex = /document\.getElementById\('btn-ocupado'\)\.addEventListener\('click',\s*\(\)\s*=>\s*\{\s*Swal\.close\(\);\s*actualizarDpto\(dpto,\s*'Ocupado',\s*dpto\.tocar\);\s*\}\);/;
    
    content = content.replace(
        ocupadoListenerRegex,
        `document.getElementById('btn-ocupado').addEventListener('click', () => {
                      Swal.close(); actualizarDpto(dpto, 'Ocupado', dpto.tocar);
                  });
                  document.getElementById('btn-novisitado')?.addEventListener('click', () => {
                      Swal.close(); actualizarDpto(dpto, 'No visitado', dpto.tocar);
                  });`
    );
}

fs.writeFileSync('src/Components/PredicacionEdificios.jsx', content);
console.log('Done!');
