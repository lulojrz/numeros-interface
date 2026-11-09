import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const formatearFecha = (fecha) => {
    if (!fecha) return '';

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

export const obtenerAsignacionesParaS13 = (territorio) => {
    const asignaciones = (Array.isArray(territorio?.asignaciones) ? territorio.asignaciones : [])
        .filter(asignacion => asignacion && typeof asignacion === 'object')
        .filter(asignacion =>
            asignacion.usuario?.nombre ||
            asignacion.usuario?.apellido ||
            [asignacion.fechaAsignacion, asignacion.fechaDevolucion].some(fecha =>
                fecha && !Number.isNaN(new Date(fecha).getTime())
            )
        );
    const conFecha = asignaciones
        .filter(asignacion => asignacion.fechaAsignacion && !Number.isNaN(new Date(asignacion.fechaAsignacion).getTime()))
        .sort((a, b) => new Date(b.fechaAsignacion) - new Date(a.fechaAsignacion))
        .slice(0, 4);
    const sinFecha = asignaciones
        .filter(asignacion => !asignacion.fechaAsignacion || Number.isNaN(new Date(asignacion.fechaAsignacion).getTime()))
        .slice(0, Math.max(0, 4 - conFecha.length));

    return [...conFecha, ...sinFecha].sort((a, b) => {
        const fechaA = a.fechaAsignacion ? new Date(a.fechaAsignacion).getTime() : Number.POSITIVE_INFINITY;
        const fechaB = b.fechaAsignacion ? new Date(b.fechaAsignacion).getTime() : Number.POSITIVE_INFINITY;
        return fechaA - fechaB;
    });
};

const agregarContinuacionS13 = (doc, font, territorios) => {
    const filas = territorios.flatMap(({ territorio, asignaciones }) =>
        asignaciones.map(asignacion => ({
            numero: String(territorio.numero ?? 'S/N'),
            nombre: [asignacion.usuario?.nombre, asignacion.usuario?.apellido].filter(Boolean).join(' ').slice(0, 32),
            fechaAsignacion: formatearFecha(asignacion.fechaAsignacion),
            fechaDevolucion: formatearFecha(asignacion.fechaDevolucion)
        }))
    );
    const pageSize = doc.getPage(0).getSize();
    const margin = 36;
    const columnWidths = [55, 205, 105, 105];
    const rowHeight = 22;
    const headers = ['Territorio', 'Asignado a', 'Fecha asignado', 'Fecha devuelto'];
    let page;
    let y;

    filas.forEach((fila, index) => {
        if (index % 30 === 0) {
            page = doc.addPage([pageSize.width, pageSize.height]);
            page.drawText('REGISTRO S-13 - CONTINUACIÓN', {
                x: margin,
                y: pageSize.height - 42,
                size: 13,
                font
            });
            page.drawText('Territorios cuyas filas no están incluidas en la plantilla original.', {
                x: margin,
                y: pageSize.height - 60,
                size: 8,
                font
            });

            y = pageSize.height - 92;
            let x = margin;
            headers.forEach((header, columnIndex) => {
                page.drawRectangle({
                    x,
                    y: y - rowHeight,
                    width: columnWidths[columnIndex],
                    height: rowHeight,
                    borderWidth: 0.5,
                    borderColor: rgb(0, 0, 0)
                });
                page.drawText(header, { x: x + 4, y: y - 15, size: 8, font });
                x += columnWidths[columnIndex];
            });
            y -= rowHeight;
        }

        const values = [fila.numero, fila.nombre, fila.fechaAsignacion, fila.fechaDevolucion];
        let x = margin;
        values.forEach((value, columnIndex) => {
            page.drawRectangle({
                x,
                y: y - rowHeight,
                width: columnWidths[columnIndex],
                height: rowHeight,
                borderWidth: 0.5,
                borderColor: rgb(0, 0, 0)
            });
            page.drawText(value, {
                x: x + 4,
                y: y - 15,
                size: 8,
                font,
                maxWidth: columnWidths[columnIndex] - 8
            });
            x += columnWidths[columnIndex];
        });
        y -= rowHeight;
    });
};

export const exportarS13 = async (territorios) => {
    try {
        if (!Array.isArray(territorios) || territorios.length === 0) {
            throw new Error('No hay territorios cargados para exportar.');
        }

        const url = '/S-13-S_rellenable.pdf'; 
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`No se pudo cargar la plantilla S-13 (HTTP ${response.status})`);
        }
        const existingPdfBytes = await response.arrayBuffer();

        const doc = await PDFDocument.load(existingPdfBytes);
        const form = doc.getForm();
        const fieldNames = new Set(form.getFields().map(field => field.getName()));
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const currentYear = new Date().getFullYear();
        let asignacionesExportadas = 0;
        const territoriosContinuacion = [];

        for (const t of territorios) {
            const numero = Number(t.numero);
            if (!Number.isInteger(numero) || numero < 1) {
                const asignaciones = obtenerAsignacionesParaS13(t);
                if (asignaciones.length > 0) territoriosContinuacion.push({ territorio: t, asignaciones });
                continue;
            }
            const rowNum = String(numero).padStart(2, '0');
            const nombreField = `T${rowNum}_g1_asignado_a`;
            if (!fieldNames.has(nombreField)) {
                const asignaciones = obtenerAsignacionesParaS13(t);
                if (asignaciones.length > 0) territoriosContinuacion.push({ territorio: t, asignaciones });
                continue;
            }
            
            try {
                const asignaciones = obtenerAsignacionesParaS13(t);
                if (asignaciones.length === 0) continue;

                const fechaUltimaCompletada = asignaciones
                    .filter(asignacion => asignacion.fechaDevolucion && !Number.isNaN(new Date(asignacion.fechaDevolucion).getTime()))
                    .sort((a, b) => new Date(b.fechaDevolucion) - new Date(a.fechaDevolucion))[0]?.fechaDevolucion;
                if (fechaUltimaCompletada && fieldNames.has(`T${rowNum}_ultima_fecha`)) {
                    const fieldUltima = form.getTextField(`T${rowNum}_ultima_fecha`);
                    fieldUltima.setText(formatearFecha(fechaUltimaCompletada));
                    fieldUltima.setFontSize(8);
                    fieldUltima.setAlignment(1);
                    asignacionesExportadas++;
                }

                asignaciones.forEach((asignacion, index) => {
                    const blockNum = index + 1;
                    const fechaAsignadoField = `T${rowNum}_g${blockNum}_fecha_asignado`;
                    if (asignacion.fechaAsignacion && !Number.isNaN(new Date(asignacion.fechaAsignacion).getTime()) && fieldNames.has(fechaAsignadoField)) {
                        const fechaAsignado = form.getTextField(fechaAsignadoField);
                        fechaAsignado.setText(formatearFecha(asignacion.fechaAsignacion));
                        fechaAsignado.setFontSize(8);
                        fechaAsignado.setAlignment(1);
                        asignacionesExportadas++;
                    }

                    const fechaCompletadoField = `T${rowNum}_g${blockNum}_fecha_completado`;
                    if (asignacion.fechaDevolucion && !Number.isNaN(new Date(asignacion.fechaDevolucion).getTime()) && fieldNames.has(fechaCompletadoField)) {
                        const fechaCompletado = form.getTextField(fechaCompletadoField);
                        fechaCompletado.setText(formatearFecha(asignacion.fechaDevolucion));
                        fechaCompletado.setFontSize(8);
                        fechaCompletado.setAlignment(1);
                        asignacionesExportadas++;
                    }

                    if (asignacion.usuario) {
                        const nombre = [asignacion.usuario.nombre, asignacion.usuario.apellido].filter(Boolean).join(' ').substring(0, 15);
                        const asignadoAField = `T${rowNum}_g${blockNum}_asignado_a`;
                        if (nombre && fieldNames.has(asignadoAField)) {
                            const asignadoA = form.getTextField(asignadoAField);
                            asignadoA.setText(nombre);
                            asignadoA.setFontSize(8);
                            asignacionesExportadas++;
                        }
                    }
                });

            } catch (e) {
                console.error(`Error al llenar campos fila ${rowNum}:`, e);
            }
        }

        const asignacionesEnContinuacion = territoriosContinuacion.reduce(
            (total, { asignaciones }) => total + asignaciones.length,
            0
        );
        if (asignacionesExportadas === 0 && asignacionesEnContinuacion === 0) {
            throw new Error('No se encontraron asignaciones exportables en el historial asignaciones_territorio.');
        }

        if (territoriosContinuacion.length > 0) {
            agregarContinuacionS13(doc, font, territoriosContinuacion);
        }
        form.updateFieldAppearances(font);
        form.flatten();
        const pdfBytes = await doc.save();
        
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = `S-13_Territorios_${currentYear}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        
    } catch (error) {
        console.error('Error al exportar S-13 rellenable:', error);
        throw error;
    }
};
