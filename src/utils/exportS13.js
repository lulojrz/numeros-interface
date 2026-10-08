import { PDFDocument, rgb } from 'pdf-lib';

export const exportarS13 = async (territorios) => {
    try {
        const url = '/S-13-S_rellenable.pdf'; 
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

        const mergedPdf = await PDFDocument.create();
        const currentYear = new Date().getFullYear();
        
        const territoriosOrdenados = [...territorios].sort((a, b) => parseInt(a.numero || 0) - parseInt(b.numero || 0));

        const maxRowsPerPage = 32;
        const numPages = Math.ceil(territoriosOrdenados.length / maxRowsPerPage) || 1;

        for (let p = 0; p < numPages; p++) {
            const doc = await PDFDocument.load(existingPdfBytes);
            const form = doc.getForm();
            const page = doc.getPage(0);
            
            // Dibujar el año arriba
            page.drawText(currentYear.toString(), { x: 150, y: 715, size: 10, color: rgb(0,0,0) });

            const startIndex = p * maxRowsPerPage;
            const endIndex = Math.min(startIndex + maxRowsPerPage, territoriosOrdenados.length);
            const batch = territoriosOrdenados.slice(startIndex, endIndex);

            for (let i = 0; i < batch.length; i++) {
                const t = batch[i];
                const rowNum = (i + 1).toString().padStart(2, '0');
                
                try {
                    // El campo 'ultima_fecha' en este PDF en realidad corresponde a la columna de 'Número de Territorio'
                    const fNum = form.getTextField(`T${rowNum}_ultima_fecha`);
                    if (fNum) {
                        fNum.setText((t.numero || '').toString());
                        fNum.setFontSize(9);
                        fNum.setAlignment(1); // Center
                    }

                    let blockIdx = 1;
                    
                    if (t.fechasTrabajado && t.fechasTrabajado.length > 0) {
                        const fechas = [...t.fechasTrabajado].sort((a,b) => new Date(a) - new Date(b));
                        const ultimasFechas = fechas.slice(-4); 
                        
                        ultimasFechas.forEach((f) => {
                            if(blockIdx > 4) return;
                            const dateStr = new Date(f).toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit', year: '2-digit'});
                            
                            const fComp = form.getTextField(`T${rowNum}_g${blockIdx}_fecha_completado`);
                            if(fComp) {
                                fComp.setText(dateStr);
                                fComp.setFontSize(8);
                                fComp.setAlignment(1);
                            }
                            
                            blockIdx++;
                        });
                    }

                    if (t.asignadoA) {
                        if (blockIdx > 4) blockIdx = 4;
                        const nombreCorto = (t.asignadoA.nombre + ' ' + (t.asignadoA.apellido || '')).substring(0, 15);
                        const fAsig = form.getTextField(`T${rowNum}_g${blockIdx}_asignado_a`);
                        if(fAsig) {
                            fAsig.setText(nombreCorto);
                            fAsig.setFontSize(8);
                        }
                    }

                } catch (e) {
                    console.error(`Error al llenar campos fila ${rowNum}:`, e);
                }
            }

            form.flatten();
            const pageBytes = await doc.save();
            const loadedPageDoc = await PDFDocument.load(pageBytes);
            const [copiedPage] = await mergedPdf.copyPages(loadedPageDoc, [0]);
            mergedPdf.addPage(copiedPage);
        }

        const pdfBytes = await mergedPdf.save();
        
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
