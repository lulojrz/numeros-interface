import { PDFDocument, rgb } from 'pdf-lib';

export const exportarS13 = async (territorios) => {
    try {
        // Cargar el PDF original
        const url = '/S-13_S.pdf';
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        
        // Copiamos la primera página para usarla como plantilla
        const templatePage = pdfDoc.getPage(0);
        
        const size = 7;
        const startY = 665;
        const rowHeight = 17.5;
        const maxRowsPerPage = 32;

        let currentPage = templatePage;
        let rowIndex = 0;
        let pageCount = 1;

        // Limpiar el doc (si queremos duplicar, mejor guardamos el documento original y creamos uno nuevo vacío y copiamos la página)
        const newPdfDoc = await PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [0]);
        newPdfDoc.addPage(copiedPage);
        currentPage = newPdfDoc.getPage(0);

        // Añadir el año de servicio
        const currentYear = new Date().getFullYear();
        currentPage.drawText(currentYear.toString(), { x: 150, y: 700, size: 10, color: rgb(0,0,0) });

        // Ordenar territorios numéricamente
        const territoriosOrdenados = [...territorios].sort((a, b) => parseInt(a.numero || 0) - parseInt(b.numero || 0));

        for (const t of territoriosOrdenados) {
            if (rowIndex >= maxRowsPerPage) {
                const [nextPage] = await newPdfDoc.copyPages(pdfDoc, [0]);
                newPdfDoc.addPage(nextPage);
                pageCount++;
                currentPage = newPdfDoc.getPage(pageCount - 1);
                rowIndex = 0;
                currentPage.drawText(currentYear.toString(), { x: 150, y: 700, size: 10, color: rgb(0,0,0) });
            }

            const yName = startY - (rowIndex * rowHeight) + 9;
            const yDate = startY - (rowIndex * rowHeight) + 2;

            // Num Territorio
            currentPage.drawText((t.numero || '').toString(), { x: 75, y: yName, size, color: rgb(0,0,0) });

            // Última fecha
            if (t.ultimaFechaTrabajada) {
                const dateStr = new Date(t.ultimaFechaTrabajada).toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit', year: '2-digit'});
                currentPage.drawText(dateStr, { x: 140, y: yName, size, color: rgb(0,0,0) });
            }

            // Historial (últimos 4 registros para que entren)
            // Asumimos que t.fechasTrabajado es una lista de fechas que podemos agrupar, pero necesitamos los nombres también.
            // Actualmente la base de datos de territorios tiene: asignadoA y fechasTrabajado. 
            // Como no guarda el historial de quién lo tuvo en cada fecha en la entidad Territorio, 
            // ponemos el Asignado actual y las fechas recientes, o simplemente rellenamos con la info disponible.
            
            // Simulamos los 4 bloques
            const bloques = [
                { nameX: 230, f1X: 228, f2X: 268 },
                { nameX: 308, f1X: 305, f2X: 345 },
                { nameX: 385, f1X: 383, f2X: 420 },
                { nameX: 462, f1X: 460, f2X: 500 }
            ];

            // Llenar con el historial disponible
            if (t.fechasTrabajado && t.fechasTrabajado.length > 0) {
                const fechas = [...t.fechasTrabajado].sort((a,b) => new Date(a) - new Date(b));
                // Tomar hasta 4 fechas
                const ultimasFechas = fechas.slice(-4);
                
                ultimasFechas.forEach((f, idx) => {
                    const dateStr = new Date(f).toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit', year: '2-digit'});
                    currentPage.drawText(dateStr, { x: bloques[idx].f2X, y: yDate, size: 6, color: rgb(0,0,0) });
                });
            }

            // Si está asignado actualmente, poner el nombre en el último bloque activo
            if (t.asignadoA) {
                const nombreCorto = (t.asignadoA.nombre + ' ' + (t.asignadoA.apellido || '')).substring(0, 15);
                // Determinar el índice del bloque: si hay fechas, lo ponemos en el siguiente, o en el actual si no se completó
                let blockIdx = t.fechasTrabajado ? t.fechasTrabajado.length : 0;
                if (blockIdx > 3) blockIdx = 3;
                
                currentPage.drawText(nombreCorto, { x: bloques[blockIdx].nameX, y: yName, size: 6, color: rgb(0,0,0) });
            }

            rowIndex++;
        }

        const pdfBytes = await newPdfDoc.save();
        
        // Descargar el PDF
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `S-13_Territorios_${currentYear}.pdf`;
        link.click();
        
    } catch (error) {
        console.error('Error al exportar S-13:', error);
        throw error;
    }
};
