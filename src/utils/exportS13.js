import { PDFDocument } from 'pdf-lib';

const formatearFecha = (fecha) => {
    if (!fecha) return '';

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

export const exportarS13 = async (territorios) => {
    try {
        const url = '/S-13-S_rellenable.pdf'; 
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

        const doc = await PDFDocument.load(existingPdfBytes);
        const form = doc.getForm();
        const currentYear = new Date().getFullYear();

        for (const t of territorios) {
            const rowNum = (t.numero || '').toString().padStart(2, '0');
            
            try {
                const asignaciones = (Array.isArray(t.asignaciones) ? t.asignaciones : [])
                    .filter(asignacion => asignacion.fechaAsignacion && !Number.isNaN(new Date(asignacion.fechaAsignacion).getTime()))
                    .sort((a, b) => new Date(a.fechaAsignacion) - new Date(b.fechaAsignacion))
                    .slice(-4);

                const ultimaAsignacion = asignaciones[asignaciones.length - 1];
                if (ultimaAsignacion) {
                    const fieldUltima = form.getTextField(`T${rowNum}_ultima_fecha`);
                    fieldUltima.setText(formatearFecha(ultimaAsignacion.fechaAsignacion));
                    fieldUltima.setFontSize(8);
                    fieldUltima.setAlignment(1);
                }

                asignaciones.forEach((asignacion, index) => {
                    const blockNum = index + 1;
                    const fechaAsignado = form.getTextField(`T${rowNum}_g${blockNum}_fecha_asignado`);
                    fechaAsignado.setText(formatearFecha(asignacion.fechaAsignacion));
                    fechaAsignado.setFontSize(8);
                    fechaAsignado.setAlignment(1);

                    if (asignacion.fechaDevolucion) {
                        const fechaCompletado = form.getTextField(`T${rowNum}_g${blockNum}_fecha_completado`);
                        fechaCompletado.setText(formatearFecha(asignacion.fechaDevolucion));
                        fechaCompletado.setFontSize(8);
                        fechaCompletado.setAlignment(1);
                    }

                    if (asignacion.usuario) {
                        const nombre = [asignacion.usuario.nombre, asignacion.usuario.apellido].filter(Boolean).join(' ').substring(0, 15);
                        const asignadoA = form.getTextField(`T${rowNum}_g${blockNum}_asignado_a`);
                        asignadoA.setText(nombre);
                        asignadoA.setFontSize(8);
                    }
                });

            } catch (e) {
                console.error(`Error al llenar campos fila ${rowNum}:`, e);
            }
        }

        form.flatten();
        const pdfBytes = await doc.save();
        
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
