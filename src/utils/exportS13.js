import { PDFDocument } from 'pdf-lib';

const formatearFecha = (fecha) => {
    if (!fecha) return '';

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

export const obtenerAsignacionesParaS13 = (territorio) => {
    const historial = Array.isArray(territorio?.asignaciones)
        ? territorio.asignaciones.filter(asignacion => asignacion && typeof asignacion === 'object')
        : [];
    const asignadoActual = territorio?.asignadoA;
    const esAsignacionActual = (asignacion) =>
        !asignacion.fechaDevolucion &&
        (asignacion.usuario?.id != null && asignadoActual.id != null
            ? String(asignacion.usuario.id) === String(asignadoActual.id)
            : Boolean(asignacion.usuario?.nombre || asignacion.usuario?.apellido) &&
              asignacion.usuario?.nombre === asignadoActual.nombre &&
              asignacion.usuario?.apellido === asignadoActual.apellido);
    const tieneAsignacionActualEnHistorial = asignadoActual && historial.some(esAsignacionActual);

    if (asignadoActual && !tieneAsignacionActualEnHistorial) {
        historial.push({ usuario: asignadoActual });
    }

    const asignacionesConFecha = historial
        .filter(asignacion => asignacion.fechaAsignacion && !Number.isNaN(new Date(asignacion.fechaAsignacion).getTime()))
        .sort((a, b) => new Date(b.fechaAsignacion) - new Date(a.fechaAsignacion))
        .slice(0, 4);

    const asignacionActualEnHistorial = asignadoActual && historial.find(esAsignacionActual);
    if (asignacionActualEnHistorial && !asignacionesConFecha.includes(asignacionActualEnHistorial)) {
        if (asignacionesConFecha.length === 4) asignacionesConFecha.pop();
        asignacionesConFecha.push(asignacionActualEnHistorial);
    }

    return asignacionesConFecha.sort((a, b) => {
        const fechaA = a.fechaAsignacion ? new Date(a.fechaAsignacion).getTime() : Number.POSITIVE_INFINITY;
        const fechaB = b.fechaAsignacion ? new Date(b.fechaAsignacion).getTime() : Number.POSITIVE_INFINITY;
        return fechaA - fechaB;
    });
};

export const exportarS13 = async (territorios) => {
    try {
        const url = '/S-13-S_rellenable.pdf'; 
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`No se pudo cargar la plantilla S-13 (HTTP ${response.status})`);
        }
        const existingPdfBytes = await response.arrayBuffer();

        const doc = await PDFDocument.load(existingPdfBytes);
        const form = doc.getForm();
        const fieldNames = new Set(form.getFields().map(field => field.getName()));
        const currentYear = new Date().getFullYear();

        for (const t of territorios) {
            const numero = Number(t.numero);
            if (!Number.isInteger(numero) || numero < 1) {
                console.warn(`Se omitió del S-13 un territorio con número no válido: ${t.numero}`);
                continue;
            }
            const rowNum = String(numero).padStart(2, '0');
            const nombreField = `T${rowNum}_g1_asignado_a`;
            if (!fieldNames.has(nombreField)) {
                console.warn(`La plantilla S-13 no tiene una fila para el territorio ${t.numero}`);
                continue;
            }
            
            try {
                const asignaciones = obtenerAsignacionesParaS13(t);

                const ultimaAsignacion = asignaciones[asignaciones.length - 1];
                if (ultimaAsignacion?.fechaAsignacion && fieldNames.has(`T${rowNum}_ultima_fecha`)) {
                    const fieldUltima = form.getTextField(`T${rowNum}_ultima_fecha`);
                    fieldUltima.setText(formatearFecha(ultimaAsignacion.fechaAsignacion));
                    fieldUltima.setFontSize(8);
                    fieldUltima.setAlignment(1);
                }

                asignaciones.forEach((asignacion, index) => {
                    const blockNum = index + 1;
                    const fechaAsignadoField = `T${rowNum}_g${blockNum}_fecha_asignado`;
                    if (asignacion.fechaAsignacion && fieldNames.has(fechaAsignadoField)) {
                        const fechaAsignado = form.getTextField(fechaAsignadoField);
                        fechaAsignado.setText(formatearFecha(asignacion.fechaAsignacion));
                        fechaAsignado.setFontSize(8);
                        fechaAsignado.setAlignment(1);
                    }

                    const fechaCompletadoField = `T${rowNum}_g${blockNum}_fecha_completado`;
                    if (asignacion.fechaDevolucion && fieldNames.has(fechaCompletadoField)) {
                        const fechaCompletado = form.getTextField(fechaCompletadoField);
                        fechaCompletado.setText(formatearFecha(asignacion.fechaDevolucion));
                        fechaCompletado.setFontSize(8);
                        fechaCompletado.setAlignment(1);
                    }

                    if (asignacion.usuario) {
                        const nombre = [asignacion.usuario.nombre, asignacion.usuario.apellido].filter(Boolean).join(' ').substring(0, 15);
                        const asignadoAField = `T${rowNum}_g${blockNum}_asignado_a`;
                        if (nombre && fieldNames.has(asignadoAField)) {
                            const asignadoA = form.getTextField(asignadoAField);
                            asignadoA.setText(nombre);
                            asignadoA.setFontSize(8);
                        }
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
