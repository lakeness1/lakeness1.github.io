/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FUNCIONES UTILITARIAS
 * Logística Lakeness - Inventario Nexxus
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este archivo contiene funciones auxiliares para:
 * - Generación de datos iniciales
 * - Exportación a Excel
 * - Importación desde Excel
 */

// ─────────────────────────────────────────────────────────────────────────────
// GENERACIÓN DE DATOS INICIALES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera la estructura de datos inicial del inventario
 * Crea espacios vacíos para los 3 turnos con andenes y patio
 * 
 * @returns {Object} Objeto con la estructura completa del inventario
 * 
 * Estructura del objeto retornado:
 * {
 *   1: { docks: [...18 slots], yard: [...20 slots] },  // Turno 1
 *   2: { docks: [...18 slots], yard: [...20 slots] },  // Turno 2
 *   3: { docks: [...18 slots], yard: [...20 slots] }   // Turno 3
 * }
 */
function generateInitialData() {
    const data = {};

    // Generar datos para cada turno
    SHIFTS.forEach(shift => {
        data[shift] = {
            // Generar andenes (18 espacios)
            docks: Array(DOCK_COUNT).fill(null).map((_, index) => ({
                ...emptySlotData,
                id: `D${shift}-${index + 1}`,  // Ej: "D1-5" = Turno 1, Andén 5
                number: index + 1,
                type: 'docks'
            })),
            // Generar patio (20 espacios)
            yard: Array(YARD_COUNT).fill(null).map((_, index) => ({
                ...emptySlotData,
                id: `Y${shift}-${index + 1}`,  // Ej: "Y2-10" = Turno 2, Patio 10
                number: index + 1,
                type: 'yard'
            }))
        };
    });

    return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTACIÓN A EXCEL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exporta el inventario del turno actual a un archivo Excel con estilos
 * Utiliza la librería xlsx-js-style para formato profesional
 * 
 * @param {Object} inventory - Objeto completo del inventario
 * @param {number} currentShift - Número del turno a exportar (1, 2 o 3)
 */
function exportToExcel(inventory, currentShift) {
    // Verificar que la librería XLSX esté cargada
    if (!window.XLSX) {
        return alert("Cargando librería Excel...");
    }

    // Crear nuevo libro de trabajo
    const wb = window.XLSX.utils.book_new();

    // ─── Definir estilos ───
    const borderStyle = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
    };

    const titleStyle = {
        font: { bold: true, sz: 14, name: "Calibri" },
        alignment: { horizontal: "left" }
    };

    const headerStyle = {
        font: { bold: true, sz: 11, name: "Calibri" },
        fill: { fgColor: { rgb: "E0E0E0" } },
        border: borderStyle,
        alignment: { horizontal: "center", vertical: "center" }
    };

    const dataStyle = {
        font: { sz: 11, name: "Calibri" },
        border: borderStyle,
        alignment: { horizontal: "center", vertical: "center" }
    };

    const separatorStyle = {
        font: { bold: true, sz: 11, name: "Calibri" }
    };

    // Obtener datos del turno actual
    const currentData = inventory[currentShift];

    // ─── Construir filas de datos ───
    const wsData = [];

    // Título
    wsData.push([{ v: "Inventario Nexxus", s: titleStyle }]);

    // Encabezados
    const headers = ["Ubicación", "FT", "Eco.", "Línea", "Sello #1", "Sello #2", "Status", "Observaciones"];
    wsData.push(headers.map(h => ({ v: h, s: headerStyle })));

    // ─── Sección: Andenes (excluyendo frenteadas) ───
    currentData.docks.forEach(slot => {
        const isFrenteada = (slot.status || '').toLowerCase() === 'frenteada';
        const show = !isFrenteada;  // No mostrar datos si está frenteada (van en otra sección)

        wsData.push([
            { v: `Andén ${slot.number}`, s: dataStyle },
            { v: show ? slot.size : '', s: dataStyle },
            { v: show ? slot.eco : '', s: dataStyle },
            { v: show ? slot.line : '', s: dataStyle },
            { v: show ? slot.sealLeft : '', s: dataStyle },
            { v: show ? slot.sealRight : '', s: dataStyle },
            { v: show && slot.status !== 'Vacía' ? (slot.status + '.') : '', s: dataStyle },
            { v: show ? slot.observations : '', s: dataStyle }
        ]);
    });

    // ─── Separador: Frenteadas ───
    const sepRow = new Array(8).fill({ v: "", s: {} });
    sepRow[1] = { v: "Frenteada", s: separatorStyle };
    wsData.push(sepRow);

    // ─── Sección: Frenteadas (datos de andenes que están frenteadas) ───
    currentData.docks.forEach(slot => {
        const isFrenteada = (slot.status || '').toLowerCase() === 'frenteada';

        wsData.push([
            { v: `Frenteada ${slot.number}`, s: dataStyle },
            { v: isFrenteada ? slot.size : '', s: dataStyle },
            { v: isFrenteada ? slot.eco : '', s: dataStyle },
            { v: isFrenteada ? slot.line : '', s: dataStyle },
            { v: isFrenteada ? slot.sealLeft : '', s: dataStyle },
            { v: isFrenteada ? slot.sealRight : '', s: dataStyle },
            { v: isFrenteada ? (slot.status + '.') : '', s: dataStyle },
            { v: isFrenteada ? slot.observations : '', s: dataStyle }
        ]);
    });

    // ─── Separador: Patio ───
    const sepRow2 = new Array(8).fill({ v: "", s: {} });
    sepRow2[1] = { v: "Patio", s: separatorStyle };
    wsData.push(sepRow2);

    // ─── Sección: Patio ───
    currentData.yard.forEach(slot => {
        wsData.push([
            { v: `Patio ${slot.number}`, s: dataStyle },
            { v: slot.size, s: dataStyle },
            { v: slot.eco, s: dataStyle },
            { v: slot.line, s: dataStyle },
            { v: slot.sealLeft, s: dataStyle },
            { v: slot.sealRight, s: dataStyle },
            { v: slot.status !== 'Vacía' ? (slot.status + '.') : '', s: dataStyle },
            { v: slot.observations, s: dataStyle }
        ]);
    });

    // ─── Crear hoja de cálculo ───
    const ws = window.XLSX.utils.aoa_to_sheet(wsData);

    // Definir anchos de columna
    ws['!cols'] = [
        { wch: 15 },  // Ubicación
        { wch: 6 },   // FT
        { wch: 12 },  // Eco
        { wch: 15 },  // Línea
        { wch: 12 },  // Sello #1
        { wch: 12 },  // Sello #2
        { wch: 15 },  // Status
        { wch: 30 }   // Observaciones
    ];

    // Agregar hoja al libro
    window.XLSX.utils.book_append_sheet(wb, ws, "Inventario");

    // Generar nombre de archivo con fecha
    const dateStr = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
    const fileName = `Inventario Nexxus - ${dateStr}.xlsx`;

    // Descargar archivo
    window.XLSX.writeFile(wb, fileName);
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTACIÓN DESDE EXCEL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Procesa una hoja de Excel e importa los datos al inventario
 * Detecta automáticamente andenes y patio por el nombre de la ubicación
 * 
 * @param {Object} wb - Libro de trabajo (workbook) de XLSX
 * @param {string} sheetName - Nombre de la hoja a procesar
 * @param {Object} inventory - Inventario actual
 * @param {number} currentShift - Turno actual
 * @param {Function} setInventory - Función para actualizar el inventario (setState)
 * @param {Function} triggerSaveFeedback - Función para mostrar confirmación visual
 */
function processSheetImport(wb, sheetName, inventory, currentShift, setInventory, triggerSaveFeedback) {
    try {
        // Convertir hoja a JSON (columnas A-H)
        const data = window.XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
            header: "A",  // Usar letras como claves
            defval: ""    // Valor por defecto para celdas vacías
        });

        // Clonar inventario para modificar
        const newInventory = JSON.parse(JSON.stringify(inventory));
        let countDocks = 0;
        let countYard = 0;

        /**
         * Resuelve el status basándose en múltiples indicadores
         */
        const resolveStatus = (raw, seal1, seal2, eco, allowedStatuses) => {
            let cleaned = (raw || '').toString().replace(/\.$/, '').trim();

            // Capitalizar primera letra
            if (cleaned) {
                cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
            }

            // Si el status es válido, usarlo
            if (allowedStatuses.includes(cleaned)) return cleaned;

            // Si tiene sellos, asumir que está cargada
            if (seal1 || seal2) return 'Cargada';

            // Si tiene económico, asumir cargada
            if (eco && allowedStatuses.includes('Cargada')) return 'Cargada';

            // Por defecto, vacía
            return 'Vacía';
        };

        // ─── Procesar cada fila ───
        data.forEach(row => {
            // Normalizar ubicación (quitar acentos, minúsculas)
            const ubicacion = (row['A'] || '')
                .toString()
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

            if (!ubicacion) return;

            // Extraer datos comunes
            const seal1 = (row['E'] || '').toString();
            const seal2 = (row['F'] || '').toString();
            const eco = (row['C'] || '').toString();

            const commonData = {
                size: (row['B'] || '').toString(),
                eco: eco,
                line: (row['D'] || '').toString(),
                sealLeft: seal1,
                sealRight: seal2,
                observations: (row['H'] || '').toString()
            };

            // ─── Detectar tipo de ubicación ───
            if (ubicacion.includes('anden')) {
                // Es un andén
                const num = parseInt(ubicacion.replace(/[^0-9]/g, ''));
                if (num > 0 && num <= DOCK_COUNT) {
                    newInventory[currentShift].docks[num - 1] = {
                        ...newInventory[currentShift].docks[num - 1],
                        ...commonData,
                        status: resolveStatus(row['G'], seal1, seal2, eco, DOCK_STATUSES)
                    };
                    countDocks++;
                }
            } else if (ubicacion.includes('frenteada') || ubicacion.includes('patio')) {
                // Es patio
                const num = parseInt(ubicacion.replace(/[^0-9]/g, ''));
                if (num > 0 && num <= YARD_COUNT) {
                    // Solo importar si tiene datos relevantes
                    if (eco || seal1 || seal2 || commonData.size) {
                        newInventory[currentShift].yard[num - 1] = {
                            ...newInventory[currentShift].yard[num - 1],
                            ...commonData,
                            status: resolveStatus(row['G'], seal1, seal2, eco, YARD_STATUSES)
                        };
                        countYard++;
                    }
                }
            }
        });

        // Actualizar estado
        setInventory(newInventory);

        // Mostrar resumen
        alert(`✅ Hoja "${sheetName}" importada.\n\n📦 Andenes: ${countDocks}\n🚚 Patio: ${countYard}`);
        triggerSaveFeedback();

    } catch (error) {
        console.error('Error al importar Excel:', error);
        alert("Error procesando la hoja.");
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR AL ÁMBITO GLOBAL
// ─────────────────────────────────────────────────────────────────────────────

window.generateInitialData = generateInitialData;
window.exportToExcel = exportToExcel;
window.processSheetImport = processSheetImport;
