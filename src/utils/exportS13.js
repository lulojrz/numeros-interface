import { PDFDocument, rgb } from 'pdf-lib';

export const exportarS13 = async (territorios) => {
    try {
        const url = '/S-13_S_rellenable.pdf';
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

        const mergedPdf = await PDFDocument.create();
        const currentYear = new Date().getFullYear();
        
        // Ordenar territorios numéricamente
        const territoriosOrdenados = [...territorios].sort((a, b) => parseInt(a.numero || 0) - parseInt(b.numero || 0));

        const maxRowsPerPage = 32;
        const numPages = Math.ceil(territoriosOrdenados.length / maxRowsPerPage) || 1;

        for (let p = 0; p < numPages; p++) {
            // Cargar una copia fresca del PDF rellenable para cada página
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const form = pdfDoc.getForm();
            const page = pdfDoc.getPage(0);
            
            const startY = 665;
            const rowHeight = 17.5;

            // Año de servicio (no es un campo rellenable, lo dibujamos)
            page.drawText(currentYear.toString(), { x: 150, y: 700, size: 10, color: rgb(0,0,0) });

            const startIndex = p * maxRowsPerPage;
            const endIndex = Math.min(startIndex + maxRowsPerPage, territoriosOrdenados.length);
            const batch = territoriosOrdenados.slice(startIndex, endIndex);

            for (let i = 0; i < batch.length; i++) {
                const t = batch[i];
                const rowNum = (i + 1).toString().padStart(2, '0');
                
                // Dibujar Número de Territorio (no es un campo rellenable)
                const yName = startY - (i * rowHeight) + 9;
                page.drawText((t.numero || '').toString(), { x: 75, y: yName, size: 7, color: rgb(0,0,0) });

                try {
                    // Última fecha
                    if (t.ultimaFechaTrabajada) {
                        const dateStr = new Date(t.ultimaFechaTrabajada).toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit', year: '2-digit'});
                        const fieldUltima = form.getTextField(`T${rowNum}_ultima_fecha`);
                        if(fieldUltima) fieldUltima.setText(dateStr);
                    }

                    // Historial y Asignación (Mapeo a los 4 grupos del formulario)
                    let blockIdx = 1;
                    
                    if (t.fechasTrabajado && t.fechasTrabajado.length > 0) {
                        const fechas = [...t.fechasTrabajado].sort((a,b) => new Date(a) - new Date(b));
                        const ultimasFechas = fechas.slice(-4); // Últimas 4 veces completado
                        
                        ultimasFechas.forEach((f) => {
                            if(blockIdx > 4) return;
                            const dateStr = new Date(f).toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit', year: '2-digit'});
                            
                            const fComp = form.getTextField(`T${rowNum}_g${blockIdx}_fecha_completado`);
                            if(fComp) fComp.setText(dateStr);
                            
                            blockIdx++;
                        });
                    }

                    // Asignación actual (va en el siguiente bloque disponible o sobreescribe el último si está lleno)
                    if (t.asignadoA) {
                        if (blockIdx > 4) blockIdx = 4;
                        const nombreCorto = (t.asignadoA.nombre + ' ' + (t.asignadoA.apellido || '')).substring(0, 15);
                        const fAsig = form.getTextField(`T${rowNum}_g${blockIdx}_asignado_a`);
                        if(fAsig) fAsig.setText(nombreCorto);
                        // Como no guardamos la fecha en la que se asignó, la dejamos en blanco o usamos la de hoy
                        // pero es mejor dejarla vacía para que el hermano anote a mano o se vea que está en curso.
                    }

                } catch (e) {
                    console.error(`Error al llenar campos fila ${rowNum}:`, e);
                }
            }

            // Acoplar los campos (flatten) para que queden como texto impreso y evitar problemas al unir páginas
            form.flatten();

            // Copiar la página llena al documento final
            const [copiedPage] = await mergedPdf.copyPages(pdfDoc, [0]);
            mergedPdf.addPage(copiedPage);
        }

        const pdfBytes = await mergedPdf.save();
        
        // Descargar el PDF
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `S-13_Territorios_${currentYear}.pdf`;
        link.click();
        
    } catch (error) {
        console.error('Error al exportar S-13 rellenable:', error);
        throw error;
    }
};
