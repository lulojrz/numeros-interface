import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import Swal from 'sweetalert2';

const obtenerNombreRol = (privilegio) => {
    const rol = String(privilegio || '').trim().toUpperCase();
    switch (rol) {
        case 'ROLE_ANC':
        case 'ANC':
            return 'Anciano';
        case 'ROLE_SM':
        case 'SM':
            return 'Siervo Ministerial';
        case 'ROLE_PR':
        case 'PR':
            return 'Precursor Regular';
        case 'ROLE_PUB':
        case 'PUB':
        default:
            return 'Publicador';
    }
};

export const exportarInformePublicaPDF = async (apiUrl) => {
    const api = apiUrl || import.meta.env.VITE_API_URL;

    Swal.fire({
        title: 'Generando informe...',
        text: 'Obteniendo publicadores habilitados y registro de turnos...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // 1. Obtener usuarios habilitados, turnos y puntos en paralelo
        const hoy = new Date();
        const anioActual = hoy.getFullYear();
        const [resUsuarios, resTurnos, resPuntos] = await Promise.all([
            fetch(`${api}/usuarios/habilitados/publica`, { credentials: 'include' }),
            fetch(`${api}/api/turnos/obtener?year=${anioActual}`, { credentials: 'include' }),
            fetch(`${api}/api/turnos/puntos`, { credentials: 'include' }).catch(() => ({ ok: false }))
        ]);

        if (!resUsuarios.ok) {
            throw new Error('No se pudo obtener la lista de usuarios habilitados.');
        }

        const usuarios = await resUsuarios.json();
        const turnos = resTurnos.ok ? await resTurnos.json() : [];
        const puntos = resPuntos.ok ? await resPuntos.json() : [];

        // 2. Asegurar filtro y orden alfabético por apellido y nombre
        const publicadoresAptos = (Array.isArray(usuarios) ? usuarios : []).filter(u =>
            u.habilitacionPublica === true || u.habilitacionPublica === 1 || u.aptoPredicacionPublica === true
        );

        if (publicadoresAptos.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin publicadores habilitados',
                text: 'No hay publicadores con habilitación para predicación pública registrados actualmente en el sistema.',
                confirmButtonColor: 'var(--bs-primary)'
            });
            return;
        }

        publicadoresAptos.sort((a, b) => {
            const apeA = (a.apellido || '').trim().toLowerCase();
            const apeB = (b.apellido || '').trim().toLowerCase();
            if (apeA !== apeB) return apeA.localeCompare(apeB, 'es');
            return (a.nombre || '').trim().toLowerCase().localeCompare((b.nombre || '').trim().toLowerCase(), 'es');
        });

        // 3. Procesar turnos trabajados hasta el momento (fecha <= hoy)
        
        const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

        const turnosValidos = (Array.isArray(turnos) ? turnos : []).filter(t => t.fecha && t.fecha <= hoyStr);

        const statsPorUsuario = {};
        let granTotalTurnos = 0;

        publicadoresAptos.forEach(u => {
            statsPorUsuario[u.usuario] = {
                totalTurnos: 0,
                puntosMap: {}
            };
        });

        // Estadísticas agregadas por punto
        const statsPorPunto = {};
        (Array.isArray(puntos) ? puntos : []).forEach(p => {
            const nombrePto = (p.nombre || 'Punto').trim();
            statsPorPunto[nombrePto] = {
                nombre: nombrePto,
                direccion: (p.direccion || p.ubicacion || '').trim(),
                activo: p.activo !== false,
                turnosRealizados: 0,
                participaciones: 0
            };
        });

        turnosValidos.forEach(t => {
            const u1 = t.publicador1?.usuario;
            const u2 = t.publicador2?.usuario;
            const puntoNombre = (t.punto?.nombre || 'Punto').trim();

            if (!statsPorPunto[puntoNombre]) {
                statsPorPunto[puntoNombre] = {
                    nombre: puntoNombre,
                    direccion: (t.punto?.direccion || t.punto?.ubicacion || '').trim(),
                    activo: t.punto?.activo !== false,
                    turnosRealizados: 0,
                    participaciones: 0
                };
            }

            if (u1 || u2) {
                statsPorPunto[puntoNombre].turnosRealizados += 1;
            }

            if (u1) {
                statsPorPunto[puntoNombre].participaciones += 1;
                if (statsPorUsuario[u1]) {
                    statsPorUsuario[u1].totalTurnos += 1;
                    statsPorUsuario[u1].puntosMap[puntoNombre] = (statsPorUsuario[u1].puntosMap[puntoNombre] || 0) + 1;
                    granTotalTurnos++;
                }
            }
            if (u2) {
                statsPorPunto[puntoNombre].participaciones += 1;
                if (statsPorUsuario[u2]) {
                    statsPorUsuario[u2].totalTurnos += 1;
                    statsPorUsuario[u2].puntosMap[puntoNombre] = (statsPorUsuario[u2].puntosMap[puntoNombre] || 0) + 1;
                    granTotalTurnos++;
                }
            }
        });

        const listaPuntosResumen = Object.values(statsPorPunto).sort((a, b) =>
            a.nombre.localeCompare(b.nombre, 'es')
        );

        // 4. Crear Documento PDF (A4 Apaisado / Landscape)
        const pdfDoc = await PDFDocument.create();
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const PAGE_WIDTH = 841.89;
        const PAGE_HEIGHT = 595.28;
        const MARGIN = 36;
        const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

        const colorPrimario = rgb(0.05, 0.43, 0.99);
        const colorSecundario = rgb(0.3, 0.35, 0.4);
        const colorGrisFondo = rgb(0.96, 0.97, 0.98);
        const colorGrisBorde = rgb(0.85, 0.88, 0.92);
        const colorTexto = rgb(0.12, 0.14, 0.17);
        const colorBlanco = rgb(1, 1, 1);
        const colorVerde = rgb(0.1, 0.6, 0.3);
        const colorNaranja = rgb(0.8, 0.5, 0.1);

        const cols = [
            { id: 'nombre', header: 'Publicador / Hermano', width: 170 },
            { id: 'rol', header: 'Rol / Privilegio', width: 110 },
            { id: 'grupo', header: 'Grupo', width: 50 },
            { id: 'telefono', header: 'Teléfono', width: 90 },
            { id: 'inventario', header: 'Inventario', width: 65 },
            { id: 'turnos', header: 'Turnos', width: 55 },
            { id: 'puntos', header: 'Puntos Trabajados (Detalle)', width: 230 }
        ];

        const ROW_HEIGHT = 22;

        // Dibuja solo el membrete superior de página (reutilizable con o sin tabla de publicadores)
        const crearNuevaPagina = (pageNumber, conTablaUsuarios = true) => {
            const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

            page.drawRectangle({
                x: 0,
                y: PAGE_HEIGHT - 6,
                width: PAGE_WIDTH,
                height: 6,
                color: colorPrimario
            });

            page.drawText('CONGREGACIÓN COLEGIALES — PREDICACIÓN PÚBLICA', {
                x: MARGIN,
                y: PAGE_HEIGHT - 32,
                size: 14,
                font: fontBold,
                color: colorPrimario
            });

            page.drawText('Informe de Hermanos Habilitados y Puntos Trabajados', {
                x: MARGIN,
                y: PAGE_HEIGHT - 48,
                size: 11,
                font: fontBold,
                color: colorTexto
            });

            const fechaHora = hoy.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }) + ' ' + hoy.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

            page.drawText(`Generado: ${fechaHora} hs | Colegiales, CABA`, {
                x: PAGE_WIDTH - MARGIN - 230,
                y: PAGE_HEIGHT - 32,
                size: 8.5,
                font: fontRegular,
                color: colorSecundario
            });

            let tablaStartY = PAGE_HEIGHT - 70;
            if (pageNumber === 1) {
                const cardY = PAGE_HEIGHT - 100;
                const cardHeight = 36;
                const cardWidth = (CONTENT_WIDTH - 20) / 3;

                // Card 1: Total Hermanos Aptos
                page.drawRectangle({
                    x: MARGIN,
                    y: cardY,
                    width: cardWidth,
                    height: cardHeight,
                    color: rgb(0.93, 0.96, 1),
                    borderColor: rgb(0.75, 0.85, 1),
                    borderWidth: 1
                });
                page.drawText('PUBLICADORES HABILITADOS', {
                    x: MARGIN + 10,
                    y: cardY + 22,
                    size: 7.5,
                    font: fontBold,
                    color: colorPrimario
                });
                page.drawText(`${publicadoresAptos.length} hermanos`, {
                    x: MARGIN + 10,
                    y: cardY + 8,
                    size: 12,
                    font: fontBold,
                    color: colorTexto
                });

                // Card 2: Total Turnos Trabajados
                page.drawRectangle({
                    x: MARGIN + cardWidth + 10,
                    y: cardY,
                    width: cardWidth,
                    height: cardHeight,
                    color: rgb(0.93, 0.98, 0.94),
                    borderColor: rgb(0.75, 0.92, 0.8),
                    borderWidth: 1
                });
                page.drawText('PARTICIPACIONES EN TURNOS (HASTA HOY)', {
                    x: MARGIN + cardWidth + 20,
                    y: cardY + 22,
                    size: 7.5,
                    font: fontBold,
                    color: colorVerde
                });
                page.drawText(`${granTotalTurnos} asignaciones cumplidas`, {
                    x: MARGIN + cardWidth + 20,
                    y: cardY + 8,
                    size: 12,
                    font: fontBold,
                    color: colorTexto
                });

                // Card 3: Puntos Activos
                const cantPuntosActivos = listaPuntosResumen.filter(p => p.activo).length;
                page.drawRectangle({
                    x: MARGIN + (cardWidth + 10) * 2,
                    y: cardY,
                    width: cardWidth,
                    height: cardHeight,
                    color: rgb(0.98, 0.96, 0.92),
                    borderColor: rgb(0.92, 0.85, 0.7),
                    borderWidth: 1
                });
                page.drawText('PUNTOS DE PREDICACIÓN ACTIVOS', {
                    x: MARGIN + (cardWidth + 10) * 2 + 10,
                    y: cardY + 22,
                    size: 7.5,
                    font: fontBold,
                    color: colorNaranja
                });
                page.drawText(`${cantPuntosActivos} puntos habilitados`, {
                    x: MARGIN + (cardWidth + 10) * 2 + 10,
                    y: cardY + 8,
                    size: 12,
                    font: fontBold,
                    color: colorTexto
                });

                tablaStartY = cardY - 20;
            }

            if (conTablaUsuarios) {
                page.drawRectangle({
                    x: MARGIN,
                    y: tablaStartY - ROW_HEIGHT,
                    width: CONTENT_WIDTH,
                    height: ROW_HEIGHT,
                    color: colorPrimario
                });

                let currentX = MARGIN;
                cols.forEach(col => {
                    page.drawText(col.header, {
                        x: currentX + 6,
                        y: tablaStartY - ROW_HEIGHT + 7,
                        size: 8.5,
                        font: fontBold,
                        color: colorBlanco
                    });
                    currentX += col.width;
                });

                return {
                    page,
                    nextY: tablaStartY - ROW_HEIGHT
                };
            }

            return {
                page,
                nextY: tablaStartY
            };
        };

        let pageCount = 1;
        let setup = crearNuevaPagina(pageCount, true);
        let currentPage = setup.page;
        let y = setup.nextY - ROW_HEIGHT;

        // 5. Imprimir filas de publicadores
        publicadoresAptos.forEach((u, index) => {
            if (y < 45) {
                pageCount++;
                setup = crearNuevaPagina(pageCount, true);
                currentPage = setup.page;
                y = setup.nextY - ROW_HEIGHT;
            }

            if (index % 2 === 0) {
                currentPage.drawRectangle({
                    x: MARGIN,
                    y: y,
                    width: CONTENT_WIDTH,
                    height: ROW_HEIGHT,
                    color: colorGrisFondo
                });
            }

            currentPage.drawLine({
                start: { x: MARGIN, y: y },
                end: { x: MARGIN + CONTENT_WIDTH, y: y },
                thickness: 0.5,
                color: colorGrisBorde
            });

            const stats = statsPorUsuario[u.usuario] || { totalTurnos: 0, puntosMap: {} };

            const puntosDetalle = Object.entries(stats.puntosMap)
                .map(([pto, cant]) => `${pto} (${cant})`)
                .join(', ') || (stats.totalTurnos === 0 ? 'Sin turnos registrados' : 'Varios');

            const nombreCompleto = [u.apellido, u.nombre].map(s => (s || '').trim()).filter(Boolean).join(', ') || u.usuario;
            const rolTexto = obtenerNombreRol(u.privilegio);
            const grupoTexto = u.grupo ? `G${String(u.grupo).replace(/\D/g, '') || u.grupo}` : '-';
            const telTexto = (u.telefono || '').trim() || '-';

            let invParts = [];
            if (u.carrito) invParts.push('Carrito');
            if (u.banner) invParts.push('Banner');
            const invTexto = invParts.length > 0 ? invParts.join(' / ') : '-';

            let currentX = MARGIN;

            // Col 1: Nombre
            currentPage.drawText(truncarTexto(nombreCompleto, 26), {
                x: currentX + 6,
                y: y + 6.5,
                size: 8,
                font: fontBold,
                color: colorTexto
            });
            currentX += cols[0].width;

            // Col 2: Rol
            currentPage.drawText(truncarTexto(rolTexto, 18), {
                x: currentX + 6,
                y: y + 6.5,
                size: 8,
                font: fontRegular,
                color: colorSecundario
            });
            currentX += cols[1].width;

            // Col 3: Grupo
            currentPage.drawText(truncarTexto(grupoTexto, 8), {
                x: currentX + 6,
                y: y + 6.5,
                size: 8,
                font: fontRegular,
                color: colorTexto
            });
            currentX += cols[2].width;

            // Col 4: Teléfono
            currentPage.drawText(truncarTexto(telTexto, 15), {
                x: currentX + 6,
                y: y + 6.5,
                size: 8,
                font: fontRegular,
                color: colorTexto
            });
            currentX += cols[3].width;

            // Col 5: Inventario
            currentPage.drawText(truncarTexto(invTexto, 14), {
                x: currentX + 6,
                y: y + 6.5,
                size: 7.5,
                font: fontRegular,
                color: colorSecundario
            });
            currentX += cols[4].width;

            // Col 6: Turnos
            currentPage.drawText(`${stats.totalTurnos}`, {
                x: currentX + 16,
                y: y + 6.5,
                size: 8.5,
                font: fontBold,
                color: stats.totalTurnos > 0 ? colorPrimario : colorSecundario
            });
            currentX += cols[5].width;

            // Col 7: Puntos trabajados
            currentPage.drawText(truncarTexto(puntosDetalle, 44), {
                x: currentX + 6,
                y: y + 6.5,
                size: 7.5,
                font: fontRegular,
                color: stats.totalTurnos > 0 ? colorTexto : colorSecundario
            });

            y -= ROW_HEIGHT;
        });

        // 5.5 Mini tabla informativa por cada Punto de Predicación
        if (listaPuntosResumen.length > 0) {
            const colsPuntos = [
                { header: 'Punto de Predicación', width: 220 },
                { header: 'Ubicación / Referencia', width: 270 },
                { header: 'Estado', width: 90 },
                { header: 'Turnos Cubiertos', width: 95 },
                { header: 'Participaciones', width: 95 }
            ];

            // Altura necesaria para título + cabecera + al menos 2 filas
            const altoMinimoBloque = 28 + ROW_HEIGHT * Math.min(listaPuntosResumen.length + 1, 3);
            if (y - altoMinimoBloque < 45) {
                pageCount++;
                setup = crearNuevaPagina(pageCount, false);
                currentPage = setup.page;
                y = setup.nextY;
            } else {
                y -= 18;
            }

            const dibujarCabeceraPuntos = () => {
                currentPage.drawText('RESUMEN POR PUNTO DE PREDICACIÓN (HASTA HOY)', {
                    x: MARGIN,
                    y: y - 4,
                    size: 9.5,
                    font: fontBold,
                    color: colorSecundario
                });

                y -= 14;

                currentPage.drawRectangle({
                    x: MARGIN,
                    y: y - ROW_HEIGHT,
                    width: CONTENT_WIDTH,
                    height: ROW_HEIGHT,
                    color: colorSecundario
                });

                let cx = MARGIN;
                colsPuntos.forEach(col => {
                    currentPage.drawText(col.header, {
                        x: cx + 6,
                        y: y - ROW_HEIGHT + 7,
                        size: 8.5,
                        font: fontBold,
                        color: colorBlanco
                    });
                    cx += col.width;
                });

                y = y - ROW_HEIGHT * 2;
            };

            dibujarCabeceraPuntos();

            listaPuntosResumen.forEach((pto, idx) => {
                if (y < 45) {
                    pageCount++;
                    setup = crearNuevaPagina(pageCount, false);
                    currentPage = setup.page;
                    y = setup.nextY;
                    dibujarCabeceraPuntos();
                }

                if (idx % 2 === 0) {
                    currentPage.drawRectangle({
                        x: MARGIN,
                        y: y,
                        width: CONTENT_WIDTH,
                        height: ROW_HEIGHT,
                        color: colorGrisFondo
                    });
                }

                currentPage.drawLine({
                    start: { x: MARGIN, y: y },
                    end: { x: MARGIN + CONTENT_WIDTH, y: y },
                    thickness: 0.5,
                    color: colorGrisBorde
                });

                let cx = MARGIN;

                // Nombre del punto
                currentPage.drawText(truncarTexto(pto.nombre, 34), {
                    x: cx + 6,
                    y: y + 6.5,
                    size: 8,
                    font: fontBold,
                    color: colorTexto
                });
                cx += colsPuntos[0].width;

                // Ubicación / Dirección
                currentPage.drawText(truncarTexto(pto.direccion || '-', 46), {
                    x: cx + 6,
                    y: y + 6.5,
                    size: 8,
                    font: fontRegular,
                    color: colorSecundario
                });
                cx += colsPuntos[1].width;

                // Estado
                currentPage.drawText(pto.activo ? 'Activo' : 'Inactivo', {
                    x: cx + 6,
                    y: y + 6.5,
                    size: 8,
                    font: fontBold,
                    color: pto.activo ? colorVerde : colorSecundario
                });
                cx += colsPuntos[2].width;

                // Turnos cubiertos en ese punto
                currentPage.drawText(`${pto.turnosRealizados}`, {
                    x: cx + 32,
                    y: y + 6.5,
                    size: 8.5,
                    font: fontBold,
                    color: pto.turnosRealizados > 0 ? colorPrimario : colorSecundario
                });
                cx += colsPuntos[3].width;

                // Participaciones totales de hermanos
                currentPage.drawText(`${pto.participaciones}`, {
                    x: cx + 32,
                    y: y + 6.5,
                    size: 8,
                    font: fontRegular,
                    color: colorTexto
                });

                y -= ROW_HEIGHT;
            });
        }

        // 6. Pie de página
        const allPages = pdfDoc.getPages();
        allPages.forEach((page, idx) => {
            page.drawLine({
                start: { x: MARGIN, y: 26 },
                end: { x: PAGE_WIDTH - MARGIN, y: 26 },
                thickness: 0.5,
                color: colorGrisBorde
            });

            page.drawText('COLEGIALES CRM — Sistema de Organización de la Predicación', {
                x: MARGIN,
                y: 14,
                size: 7.5,
                font: fontRegular,
                color: colorSecundario
            });

            page.drawText(`Página ${idx + 1} de ${allPages.length}`, {
                x: PAGE_WIDTH - MARGIN - 70,
                y: 14,
                size: 7.5,
                font: fontRegular,
                color: colorSecundario
            });
        });

        // 7. Descargar archivo
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const urlBlob = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = `Hermanos_Aptos_Predicacion_Publica_${hoyStr}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(urlBlob);

        Swal.fire({
            icon: 'success',
            title: '¡Informe descargado!',
            text: `Se descargó el PDF con ${publicadoresAptos.length} hermanos habilitados y el resumen de ${listaPuntosResumen.length} puntos.`,
            confirmButtonColor: 'var(--bs-primary)'
        });

    } catch (error) {
        console.error('Error al generar PDF de Predicación Pública:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al generar el informe',
            text: error.message || 'Ocurrió un problema de red o procesando los datos.',
            confirmButtonColor: 'var(--bs-primary)'
        });
    }
};

function truncarTexto(str, maxLen) {
    if (!str) return '';
    const limpio = String(str)
        .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
        .trim();
    if (limpio.length <= maxLen) return limpio;
    return limpio.slice(0, maxLen - 3) + '...';
}