import { DOCK_COUNT, YARD_COUNT, emptySlotData, DOCK_STATUSES, YARD_STATUSES } from './constants.js';

export const generateInitialData = () => ({
    1: { docks: Array(DOCK_COUNT).fill(null).map((_, i) => ({ ...emptySlotData, id: `D1-${i + 1}`, number: i + 1, type: 'docks' })), yard: Array(YARD_COUNT).fill(null).map((_, i) => ({ ...emptySlotData, id: `Y1-${i + 1}`, number: i + 1, type: 'yard' })) },
    2: { docks: Array(DOCK_COUNT).fill(null).map((_, i) => ({ ...emptySlotData, id: `D2-${i + 1}`, number: i + 1, type: 'docks' })), yard: Array(YARD_COUNT).fill(null).map((_, i) => ({ ...emptySlotData, id: `Y2-${i + 1}`, number: i + 1, type: 'yard' })) },
    3: { docks: Array(DOCK_COUNT).fill(null).map((_, i) => ({ ...emptySlotData, id: `D3-${i + 1}`, number: i + 1, type: 'docks' })), yard: Array(YARD_COUNT).fill(null).map((_, i) => ({ ...emptySlotData, id: `Y3-${i + 1}`, number: i + 1, type: 'yard' })) },
});

// Export/Import Logic
export const exportToExcel = (inventory, currentShift) => {
    if (!window.XLSX) return alert("Cargando...");
    const wb = window.XLSX.utils.book_new();
    const borderStyle = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    const titleStyle = { font: { bold: true, sz: 14, name: "Calibri" }, alignment: { horizontal: "left" } };
    const headerStyle = { font: { bold: true, sz: 11, name: "Calibri" }, fill: { fgColor: { rgb: "E0E0E0" } }, border: borderStyle, alignment: { horizontal: "center", vertical: "center" } };
    const dataStyle = { font: { sz: 11, name: "Calibri" }, border: borderStyle, alignment: { horizontal: "center", vertical: "center" } };
    const separatorStyle = { font: { bold: true, sz: 11, name: "Calibri" } };
    const currentData = inventory[currentShift];
    const wsData = [[{ v: "Inventario Nexxus", s: titleStyle }]];
    wsData.push(["Ubicación", "FT", "Eco.", "Línea", "Sello #1", "Sello #2", "Status", "Observaciones"].map(h => ({ v: h, s: headerStyle })));
    currentData.docks.forEach(slot => {
        const isFrenteada = (slot.status || '').toLowerCase() === 'frenteada'; const show = !isFrenteada;
        wsData.push([{ v: `Andén ${slot.number}`, s: dataStyle }, { v: show ? slot.size : '', s: dataStyle }, { v: show ? slot.eco : '', s: dataStyle }, { v: show ? slot.line : '', s: dataStyle }, { v: show ? slot.sealLeft : '', s: dataStyle }, { v: show ? slot.sealRight : '', s: dataStyle }, { v: show && slot.status !== 'Vacía' ? (slot.status + '.') : '', s: dataStyle }, { v: show ? slot.observations : '', s: dataStyle }]);
    });
    const sepRow = new Array(8).fill({ v: "", s: {} }); sepRow[1] = { v: "Frenteada", s: separatorStyle }; wsData.push(sepRow);
    currentData.docks.forEach(slot => {
        const isFrenteada = (slot.status || '').toLowerCase() === 'frenteada';
        wsData.push([{ v: `Frenteada ${slot.number}`, s: dataStyle }, { v: isFrenteada ? slot.size : '', s: dataStyle }, { v: isFrenteada ? slot.eco : '', s: dataStyle }, { v: isFrenteada ? slot.line : '', s: dataStyle }, { v: isFrenteada ? slot.sealLeft : '', s: dataStyle }, { v: isFrenteada ? slot.sealRight : '', s: dataStyle }, { v: isFrenteada ? (slot.status + '.') : '', s: dataStyle }, { v: isFrenteada ? slot.observations : '', s: dataStyle }]);
    });
    const sepRow2 = new Array(8).fill({ v: "", s: {} }); sepRow2[1] = { v: "Patio", s: separatorStyle }; wsData.push(sepRow2);
    currentData.yard.forEach(slot => {
        wsData.push([{ v: `Patio ${slot.number}`, s: dataStyle }, { v: slot.size, s: dataStyle }, { v: slot.eco, s: dataStyle }, { v: slot.line, s: dataStyle }, { v: slot.sealLeft, s: dataStyle }, { v: slot.sealRight, s: dataStyle }, { v: slot.status !== 'Vacía' ? (slot.status + '.') : '', s: dataStyle }, { v: slot.observations, s: dataStyle }]);
    });
    const ws = window.XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 15 }, { wch: 6 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 30 }];
    window.XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    window.XLSX.writeFile(wb, `Inventario Nexxus - ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}.xlsx`);
};

export const processSheetImport = (wb, sheetName, inventory, currentShift, setInventory, triggerSaveFeedback) => {
    try {
        const data = window.XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: "A", defval: "" });
        const newInventory = JSON.parse(JSON.stringify(inventory));
        let countDocks = 0; let countYard = 0;
        const resolveStatus = (raw, s1, s2, eco, allowed) => {
            let c = (raw || '').toString().replace(/\.$/, '').trim(); if (c) c = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
            if (allowed.includes(c)) return c; if (s1 || s2) return 'Cargada'; if (eco && allowed.includes('Cargada')) return 'Cargada'; return 'Vacía';
        };
        data.forEach(r => {
            const u = (r['A'] || '').toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (!u) return;
            const s1 = (r['E'] || '').toString(), s2 = (r['F'] || '').toString(), eco = (r['C'] || '').toString();
            const common = { size: (r['B'] || '').toString(), eco, line: (r['D'] || '').toString(), sealLeft: s1, sealRight: s2, observations: (r['H'] || '').toString() };
            if (u.includes('anden')) {
                const n = parseInt(u.replace(/[^0-9]/g, '')); if (n > 0 && n <= DOCK_COUNT) {
                    newInventory[currentShift].docks[n - 1] = { ...newInventory[currentShift].docks[n - 1], ...common, status: resolveStatus(r['G'], s1, s2, eco, DOCK_STATUSES) }; countDocks++;
                }
            } else if (u.includes('frenteada') || u.includes('patio')) {
                const n = parseInt(u.replace(/[^0-9]/g, '')); if (n > 0 && n <= YARD_COUNT) {
                    if (eco || s1 || s2 || common.size) {
                        newInventory[currentShift].yard[n - 1] = { ...newInventory[currentShift].yard[n - 1], ...common, status: resolveStatus(r['G'], s1, s2, eco, YARD_STATUSES) }; countYard++;
                    }
                }
            }
        });
        setInventory(newInventory); alert(`✅ Hoja "${sheetName}" importada.\n\n📦 Andenes: ${countDocks}\n🚚 Patio: ${countYard}`); triggerSaveFeedback();
    } catch (e) { console.error(e); alert("Error procesando la hoja."); }
};
