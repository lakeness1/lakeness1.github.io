import React, { useState, useEffect, useRef } from 'https://esm.sh/react@18.2.0';
import {
    ClipboardList, Save, X, Upload,
    CheckCircle, WifiOff, Sparkles, FileSpreadsheet,
    Moon, Sun, Settings, Wrench, FileText, ArrowRight,
    Eraser, Trash2, ChevronDown
} from 'https://esm.sh/lucide-react@0.263.1';

import { DOCK_COUNT, SHIFTS, STORAGE_KEY, THEME_KEY, SIZES, DOCK_STATUSES, YARD_STATUSES, emptySlotData } from './core/constants.js';
import { exportToExcel, processSheetImport, generateInitialData } from './core/utils.js';
import SlotCard from './components/SlotCard.js';

function App() {
    const [inventory, setInventory] = useState(() => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const savedData = localStorage.getItem(STORAGE_KEY);
                if (savedData) return JSON.parse(savedData);
            }
        } catch (error) { console.error(error); }
        return generateInitialData();
    });

    const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

    // Estados UI
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isClosingSettings, setIsClosingSettings] = useState(false);
    const [cleanerOpen, setCleanerOpen] = useState(false);
    const [isClosingCleaner, setIsClosingCleaner] = useState(false);
    const [currentShift, setCurrentShift] = useState(1);
    const [activeTab, setActiveTab] = useState('docks');
    const [modalOpen, setModalOpen] = useState(false);
    const [isClosingModal, setIsClosingModal] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [formData, setFormData] = useState(emptySlotData);
    const [sheetSelectorOpen, setSheetSelectorOpen] = useState(false);
    const [sheetList, setSheetList] = useState([]);
    const [tempWorkbook, setTempWorkbook] = useState(null);
    const fileInputRef = useRef(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [isClosingToast, setIsClosingToast] = useState(false);
    const [saveMessage, setSaveMessage] = useState("Guardado");

    useEffect(() => { try { if (window.localStorage) localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory)); } catch (e) { } }, [inventory]);

    useEffect(() => {
        const handleState = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleState); window.addEventListener('offline', handleState);
        return () => { window.removeEventListener('online', handleState); window.removeEventListener('offline', handleState); }
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem(THEME_KEY, 'light');
            setIsDarkMode(false);
        } else {
            html.classList.add('dark');
            localStorage.setItem(THEME_KEY, 'dark');
            setIsDarkMode(true);
        }
    };

    const closeModalAnimated = () => { setIsClosingModal(true); setTimeout(() => { setModalOpen(false); setIsClosingModal(false); }, 280); };
    const closeSettingsAnimated = () => { setIsClosingSettings(true); setTimeout(() => { setSettingsOpen(false); setIsClosingSettings(false); }, 280); };
    const closeCleanerAnimated = () => { setIsClosingCleaner(true); setTimeout(() => { setCleanerOpen(false); setIsClosingCleaner(false); }, 280); };

    const triggerSaveFeedback = (msg = "Guardado") => {
        setSaveMessage(msg);
        setShowSaveToast(true);
        setIsClosingToast(false);
        setTimeout(() => { setIsClosingToast(true); setTimeout(() => { setShowSaveToast(false); setIsClosingToast(false); }, 300); }, 2000);
    };

    const handleClean = (scope, shift = null, type = null) => {
        const newInventory = JSON.parse(JSON.stringify(inventory));
        const freshData = generateInitialData();

        if (scope === 'all') {
            setInventory(freshData);
        } else if (scope === 'shift') {
            if (type === 'all' || type === 'docks') newInventory[shift].docks = freshData[shift].docks;
            if (type === 'all' || type === 'yard') newInventory[shift].yard = freshData[shift].yard;
            setInventory(newInventory);
        }
        closeCleanerAnimated();
        triggerSaveFeedback("Limpieza Completada");
    };

    const handleResetAll = () => { setCleanerOpen(true); };

    const handleSlotClick = (index, type) => {
        const data = inventory[currentShift][type][index];
        setEditingSlot({ index, type });
        setFormData({ ...data });
        setModalOpen(true);
    };
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const validateForm = () => {
        const statusNorm = (formData.status || '').toLowerCase();
        if ((statusNorm === 'frenteada' || statusNorm === 'cargada') && !formData.sealRight) { alert("⚠️ ¡Atención Lake!\n\nEl Sello Derecho (#2) es obligatorio."); return false; } return true;
    };
    const handleSave = () => {
        if (!validateForm()) return;
        const updatedData = { ...formData, updatedAt: new Date().toISOString() };
        const newInventory = JSON.parse(JSON.stringify(inventory));
        newInventory[currentShift][editingSlot.type][editingSlot.index] = updatedData;
        setInventory(newInventory); closeModalAnimated(); triggerSaveFeedback();
    };

    const handleClearSlot = () => {
        const newInventory = JSON.parse(JSON.stringify(inventory));
        const originalId = newInventory[currentShift][editingSlot.type][editingSlot.index].id;
        newInventory[currentShift][editingSlot.type][editingSlot.index] = { ...emptySlotData, id: originalId, number: formData.number, type: editingSlot.type };
        setInventory(newInventory);
        closeModalAnimated();
        triggerSaveFeedback("Espacio Liberado");
    };

    const handleImportClick = () => fileInputRef.current.click();
    const handleFileChange = (e) => {
        const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const wb = window.XLSX.read(evt.target.result, { type: 'binary' });
                if (wb.SheetNames.length > 1) { setTempWorkbook(wb); setSheetList(wb.SheetNames); setSheetSelectorOpen(true); }
                else { processSheetImport(wb, wb.SheetNames[0], inventory, currentShift, setInventory, triggerSaveFeedback); }
            } catch (e) { console.error(e); alert("❌ Error archivo"); }
        }; reader.readAsBinaryString(file); e.target.value = '';
    };

    const handleSheetSelection = (sheetName) => { if (tempWorkbook) { processSheetImport(tempWorkbook, sheetName, inventory, currentShift, setInventory, triggerSaveFeedback); setSheetSelectorOpen(false); setTempWorkbook(null); } };

    const currentDocks = inventory[currentShift].docks;
    const currentYard = inventory[currentShift].yard;

    const inputClass = "w-full px-5 py-4 bg-stone-100/50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-700 dark:text-stone-200 font-bold ring-4 ring-transparent focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600";
    const selectClass = "w-full px-5 py-4 bg-stone-100/50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-700 dark:text-stone-200 font-bold ring-4 ring-transparent focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none appearance-none cursor-pointer transition-all pr-12";

    return React.createElement('div', { className: "min-h-screen pb-32 animate-fade-in" }, [

        showSaveToast && React.createElement('div', { className: `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 px-6 py-3 rounded-full shadow-xl flex items-center gap-2 ${isClosingToast ? 'animate-slide-out' : 'animate-bounce-in'}` }, [React.createElement(CheckCircle, { size: 20, className: "text-emerald-400 dark:text-emerald-600" }), React.createElement('span', { className: "font-bold text-sm" }, saveMessage)]),

        React.createElement('header', { className: "sticky top-0 sm:top-4 z-40 px-2 sm:px-4 mb-6 sm:mb-8 pt-2 sm:pt-0" },
            React.createElement('div', { className: "max-w-6xl mx-auto bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl shadow-lg rounded-3xl sm:rounded-[2.5rem] border border-white/50 dark:border-stone-700/50 px-4 py-3 sm:px-6 sm:py-4 animate-slide-in-right delay-0 transition-colors duration-500" }, [
                React.createElement('div', { className: "flex flex-col gap-4" }, [
                    React.createElement('div', { className: "flex items-center justify-between" }, [
                        React.createElement('div', { className: "flex items-center gap-3" }, [
                            React.createElement('div', { onClick: handleResetAll, className: "bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/50 hover-float transition-all" }, React.createElement(ClipboardList, { size: 20 })),
                            React.createElement('div', null, [
                                React.createElement('h1', { className: "text-lg font-bold text-stone-800 dark:text-stone-100 tracking-tight flex items-center gap-2 leading-tight" }, ["Logística Lakeness", !isOnline && React.createElement('span', { className: "flex items-center gap-1 text-[9px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full animate-pulse" }, [React.createElement(WifiOff, { size: 8 }), "Off"])]),
                                React.createElement('p', { className: "text-[10px] font-medium text-stone-400 dark:text-stone-500" }, isOnline ? 'Modo Nexxus' : 'Modo Local')
                            ])
                        ]),
                        React.createElement('div', { className: "flex gap-1.5 items-center" }, [
                            React.createElement('button', { onClick: () => setCleanerOpen(true), className: "p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all active:scale-95 hover-float", title: "Limpiar Datos" }, React.createElement(Eraser, { size: 18 })),
                            React.createElement('button', { onClick: toggleTheme, className: "p-2.5 rounded-xl bg-amber-100 dark:bg-indigo-900/30 text-amber-600 dark:text-indigo-300 transition-all active:scale-95 hover-float" }, isDarkMode ? React.createElement(Moon, { size: 18 }) : React.createElement(Sun, { size: 18 })),
                            React.createElement('button', { onClick: handleImportClick, className: "p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 transition-all active:scale-95 hover-float" }, [React.createElement(Upload, { size: 18 }), React.createElement('input', { type: "file", accept: ".xlsx,.csv", ref: fileInputRef, onChange: handleFileChange, className: "hidden" })]),
                            React.createElement('button', { onClick: () => exportToExcel(inventory, currentShift), className: "p-2.5 rounded-xl bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-green-900/40 transition-all active:scale-95 hover-float" }, React.createElement(FileSpreadsheet, { size: 18 })),
                            React.createElement('button', { onClick: () => setSettingsOpen(true), className: "p-2.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 transition-all active:scale-95 hover-float" }, React.createElement(Settings, { size: 18 }))
                        ])
                    ]),
                    React.createElement('div', { className: "flex items-center gap-2 overflow-x-auto no-scrollbar pb-1" },
                        SHIFTS.map((shift, idx) => React.createElement('button', { key: shift, onClick: () => setCurrentShift(shift), style: { animationDelay: `${idx * 100}ms` }, className: `px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 animate-slide-in-right ${currentShift === shift ? 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 shadow-md scale-105' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'}` }, `Turno ${shift}`))
                    ),
                ]),
                React.createElement('div', { className: "grid grid-cols-2 gap-2 mt-4 bg-stone-100 dark:bg-stone-800/50 p-1 rounded-2xl animate-scale-in delay-200" }, [
                    React.createElement('button', { onClick: () => setActiveTab('docks'), className: `py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'docks' ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-white shadow-sm scale-100' : 'text-stone-400 hover:text-stone-600 scale-95'}` }, "Andenes (18)"),
                    React.createElement('button', { onClick: () => setActiveTab('yard'), className: `py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'yard' ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-white shadow-sm scale-100' : 'text-stone-400 hover:text-stone-600 scale-95'}` }, "Patio de Maniobras (20)")
                ])
            ])
        ),

        React.createElement('main', { className: "max-w-6xl mx-auto px-4 pb-24" },
            activeTab === 'docks' ? React.createElement('div', { key: 'docks-view', className: "space-y-8 animate-fade-in" }, [
                React.createElement('section', { className: "animate-slide-up" }, [
                    React.createElement('div', { className: "flex items-center gap-3 mb-4 px-2" }, [React.createElement('span', { className: "flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 font-bold text-xs shadow-sm" }, "G"), React.createElement('h2', { className: "text-lg font-bold text-stone-700 dark:text-stone-200 tracking-tight" }, "Zona Galleta")]),
                    React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" }, currentDocks.slice(0, 10).map((slot, idx) => React.createElement(SlotCard, { key: slot.id, index: idx, type: "docks", data: slot, onClick: handleSlotClick })))
                ]),
                React.createElement('section', { className: "animate-slide-up delay-100" }, [
                    React.createElement('div', { className: "flex items-center gap-3 mb-4 px-2" }, [React.createElement('span', { className: "flex items-center justify-center w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-bold text-xs shadow-sm" }, "S"), React.createElement('h2', { className: "text-lg font-bold text-stone-700 dark:text-stone-200 tracking-tight" }, "Zona Salado")]),
                    React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" }, currentDocks.slice(10, 18).map((slot, idx) => React.createElement(SlotCard, { key: slot.id, index: idx + 10, type: "docks", data: slot, onClick: handleSlotClick })))
                ])
            ]) : React.createElement('div', { key: 'yard-view', className: "animate-fade-in" }, [
                React.createElement('div', { className: "flex items-center gap-3 mb-4 px-2" }, [React.createElement('span', { className: "flex items-center justify-center w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-bold text-xs shadow-sm" }, "P"), React.createElement('h2', { className: "text-lg font-bold text-stone-700 dark:text-stone-200 tracking-tight" }, "Patio de Maniobras")]),
                React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" }, currentYard.map((slot, idx) => React.createElement(SlotCard, { key: slot.id, index: idx, type: "yard", data: slot, onClick: handleSlotClick })))
            ])
        ),

        sheetSelectorOpen && React.createElement('div', { className: "fixed inset-0 z-50 flex items-center justify-center p-4" }, [
            React.createElement('div', { className: "absolute inset-0 bg-stone-900/50 backdrop-blur-md transition-opacity animate-fade-in", onClick: () => setSheetSelectorOpen(false) }),
            React.createElement('div', { className: "relative bg-white dark:bg-stone-900 rounded-[2rem] shadow-2xl p-6 w-full max-w-sm overflow-hidden animate-scale-in border border-white dark:border-stone-700" }, [
                React.createElement('h3', { className: "text-xl font-bold text-stone-800 dark:text-stone-100 text-center mb-4" }, "Selecciona una Hoja"),
                React.createElement('div', { className: "space-y-2 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar" },
                    sheetList.map(sheet =>
                        React.createElement('button', {
                            key: sheet,
                            onClick: () => handleSheetSelection(sheet),
                            className: "w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-left flex items-center justify-between group transition-all active:scale-95"
                        }, [
                            React.createElement('div', { className: "flex items-center gap-3" }, [
                                React.createElement(FileText, { size: 18, className: "text-indigo-500" }),
                                React.createElement('span', { className: "font-bold text-sm text-stone-700 dark:text-stone-200 truncate max-w-[180px]" }, sheet)
                            ]),
                            React.createElement(ArrowRight, { size: 16, className: "text-stone-300 group-hover:text-indigo-500 transition-colors" })
                        ])
                    )
                ),
                React.createElement('button', { onClick: () => setSheetSelectorOpen(false), className: "mt-6 w-full py-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-medium text-sm transition-colors" }, "Cancelar")
            ])
        ]),

        cleanerOpen && React.createElement('div', { className: "fixed inset-0 z-50 flex items-center justify-center p-4" }, [
            React.createElement('div', { className: `absolute inset-0 bg-stone-900/50 backdrop-blur-md transition-opacity ${isClosingCleaner ? 'animate-fade-out' : 'animate-fade-in'}`, onClick: closeCleanerAnimated }),
            React.createElement('div', { className: `relative bg-white dark:bg-stone-900 rounded-[2rem] shadow-2xl p-6 w-full max-w-sm overflow-hidden border border-white dark:border-stone-700 ${isClosingCleaner ? 'animate-scale-out' : 'animate-scale-in'}` }, [
                React.createElement('div', { className: "text-center mb-6" }, [
                    React.createElement('div', { className: "inline-flex p-3 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 mb-3" }, React.createElement(Eraser, { size: 28 })),
                    React.createElement('h3', { className: "text-xl font-bold text-stone-800 dark:text-stone-100" }, "Limpieza"),
                    React.createElement('p', { className: "text-xs text-stone-400 mt-1" }, "¿Qué deseas borrar hoy?")
                ]),

                React.createElement('button', { onClick: () => handleClean('all'), className: "w-full p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-3 transition-all group active:scale-95" }, [
                    React.createElement('div', { className: "p-1.5 bg-white dark:bg-stone-800 rounded-lg shadow-sm" }, React.createElement(Trash2, { size: 18 })),
                    React.createElement('div', { className: "text-left" }, [
                        React.createElement('span', { className: "block font-bold text-sm" }, "Borrar Todo"),
                        React.createElement('span', { className: "text-[10px] opacity-70" }, "Reiniciar inventario completo.")
                    ])
                ]),

                React.createElement('div', { className: "border-t border-stone-100 dark:border-stone-800 my-4" }),
                React.createElement('p', { className: "text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 text-center" }, "Por Turno"),

                React.createElement('div', { className: "space-y-2" }, SHIFTS.map(shift =>
                    React.createElement('div', { key: shift, className: "p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50" }, [
                        React.createElement('div', { className: "flex justify-between items-center" }, [
                            React.createElement('span', { className: "font-bold text-xs text-stone-700 dark:text-stone-200" }, `Turno ${shift}`),
                            React.createElement('div', { className: "flex gap-1.5" }, [
                                React.createElement('button', { onClick: () => handleClean('shift', shift, 'docks'), className: "px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-700 shadow-sm text-[10px] font-bold text-stone-500 hover:text-red-500 transition-all active:scale-95" }, "Andenes"),
                                React.createElement('button', { onClick: () => handleClean('shift', shift, 'yard'), className: "px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-700 shadow-sm text-[10px] font-bold text-stone-500 hover:text-red-500 transition-all active:scale-95" }, "Patio"),
                                React.createElement('button', { onClick: () => handleClean('shift', shift, 'all'), className: "px-2.5 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-[10px] font-bold text-red-600 hover:bg-red-200 transition-all active:scale-95" }, "Todo")
                            ])
                        ])
                    ])
                )),

                React.createElement('button', { onClick: closeCleanerAnimated, className: "mt-4 w-full py-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-medium text-sm transition-colors" }, "Cancelar")
            ])
        ]),

        // MODAL EDICIÓN RECONSTRUIDO (RESPONSIVE BOTTOM SHEET)
        modalOpen && React.createElement('div', { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" }, [
            React.createElement('div', { className: `absolute inset-0 bg-stone-900/30 dark:bg-black/60 backdrop-blur-md transition-opacity ${isClosingModal ? 'animate-fade-out' : 'animate-fade-in'}`, onClick: closeModalAnimated }),
            // Modal estilo "Sheet" en móvil
            React.createElement('div', { className: `relative bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border-t border-white dark:border-stone-700 max-h-[85vh] flex flex-col ${isClosingModal ? 'mobile-sheet-exit' : 'mobile-sheet-enter'}` }, [
                // Header
                React.createElement('div', { className: "px-6 pt-6 pb-4 flex justify-between items-start shrink-0" }, [
                    React.createElement('div', null, [
                        React.createElement('h3', { className: "text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight" }, [editingSlot.type === 'docks' ? 'Andén' : 'Patio', ' ', React.createElement('span', { className: "text-indigo-600 dark:text-indigo-400" }, formData.number)]),
                        React.createElement('p', { className: "text-xs font-medium text-stone-400 mt-1 flex items-center gap-1" }, [React.createElement(Sparkles, { size: 12 }), editingSlot.type === 'docks' ? (formData.number <= 10 ? 'Zona Galleta' : 'Zona Salado') : 'Patio General'])
                    ]),
                    React.createElement('button', { onClick: closeModalAnimated, className: "p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition-colors" }, React.createElement(X, { size: 22 }))
                ]),
                // Scrollable Body
                React.createElement('div', { className: "px-5 py-2 space-y-4 overflow-y-auto overscroll-contain flex-1" }, [
                    React.createElement('div', { className: "grid grid-cols-2 gap-3" }, [
                        React.createElement('div', { className: "space-y-1 group" }, [React.createElement('label', { className: "text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1" }, "Económico"), React.createElement('input', { type: "text", name: "eco", value: formData.eco, onChange: handleInputChange, placeholder: "---", className: inputClass })]),
                        React.createElement('div', { className: "space-y-1 group" }, [React.createElement('label', { className: "text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1" }, "Línea"), React.createElement('input', { type: "text", name: "line", value: formData.line, onChange: handleInputChange, placeholder: "---", className: inputClass })])
                    ]),
                    React.createElement('div', { className: "grid grid-cols-2 gap-3" }, [
                        React.createElement('div', { className: "space-y-1" }, [
                            React.createElement('label', { className: "text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1" }, "FT"),
                            React.createElement('div', { className: "relative group" }, [
                                React.createElement('select', { name: "size", value: formData.size, onChange: handleInputChange, className: selectClass }, [React.createElement('option', { value: "" }, "---"), SIZES.map(s => React.createElement('option', { key: s, value: s }, s))]),
                                React.createElement('div', { className: "absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" }, React.createElement(ChevronDown, { size: 16 }))
                            ])
                        ]),
                        React.createElement('div', { className: "space-y-1" }, [
                            React.createElement('label', { className: "text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1" }, "Status"),
                            React.createElement('div', { className: "relative group" }, [
                                React.createElement('select', { name: "status", value: formData.status, onChange: handleInputChange, className: selectClass }, [React.createElement('option', { value: "" }, "Seleccionar"), (editingSlot.type === 'docks' ? DOCK_STATUSES : YARD_STATUSES).map(s => React.createElement('option', { key: s, value: s }, s))]),
                                React.createElement('div', { className: "absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-50" }, React.createElement(ChevronDown, { size: 16 }))
                            ])
                        ])
                    ]),
                    (formData.status === 'Frenteada' || formData.status === 'Cargada') && React.createElement('div', { className: "bg-[#FFF7ED] dark:bg-amber-900/10 p-4 rounded-[1.5rem] border border-orange-100 dark:border-amber-900/30 animate-slide-up" }, [
                        React.createElement('div', { className: "flex items-center gap-2 mb-3 text-orange-800 dark:text-amber-400 font-bold text-xs" }, [React.createElement(ClipboardList, { size: 16 }), " Sellos de Seguridad"]),
                        React.createElement('div', { className: "grid grid-cols-2 gap-3" }, [
                            React.createElement('div', { className: "space-y-1" }, [React.createElement('label', { className: "text-[9px] text-orange-600/70 dark:text-amber-400/70 font-bold uppercase ml-1" }, "Sello #1"), React.createElement('input', { type: "text", name: "sealLeft", value: formData.sealLeft, onChange: handleInputChange, className: "w-full p-2.5 bg-white dark:bg-stone-800 border border-orange-200 dark:border-amber-700/50 rounded-xl text-sm dark:text-stone-200 focus:outline-none focus:border-orange-400 ring-2 ring-transparent focus:ring-orange-100 dark:focus:ring-amber-900/20 transition-all" })]),
                            React.createElement('div', { className: "space-y-1" }, [React.createElement('label', { className: "text-[9px] text-orange-600/70 dark:text-amber-400/70 font-bold uppercase ml-1" }, "Sello #2 *"), React.createElement('input', { type: "text", name: "sealRight", value: formData.sealRight, onChange: handleInputChange, className: "w-full p-2.5 bg-white dark:bg-stone-800 border-2 border-orange-300 dark:border-amber-600/50 rounded-xl text-sm dark:text-stone-200 focus:outline-none focus:border-orange-500 ring-2 ring-transparent focus:ring-orange-100 dark:focus:ring-amber-900/20 font-medium transition-all", placeholder: "Requerido" })])
                        ])
                    ]),
                    React.createElement('div', { className: "space-y-1 group" }, [
                        React.createElement('label', { className: "text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1" }, "Observaciones"),
                        React.createElement('textarea', { name: "observations", value: formData.observations, onChange: handleInputChange, rows: 2, className: "w-full px-4 py-3 bg-stone-100/50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-700 dark:text-stone-200 font-medium ring-4 ring-transparent focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none resize-none placeholder:text-stone-300 transition-all text-sm", placeholder: "Notas adicionales..." })
                    ])
                ]),
                // Footer (Buttons) - Siempre visible al fondo
                React.createElement('div', { className: "px-6 pb-8 pt-2 flex gap-3 shrink-0 bg-white/95 dark:bg-stone-900/95" }, [
                    React.createElement('button', { onClick: handleClearSlot, className: "flex-1 py-3.5 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-bold hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-300 transition-all duration-300 active:scale-95 text-sm" }, "Limpiar"),
                    React.createElement('button', { onClick: handleSave, className: "flex-[2] py-3.5 px-4 rounded-2xl bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 font-bold shadow-xl shadow-stone-300 dark:shadow-stone-900/50 hover:bg-stone-700 dark:hover:bg-white hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 text-sm" }, [React.createElement(Save, { size: 18 }), " Guardar"])
                ])
            ])
        ]),

        // MODAL SETTINGS
        settingsOpen && React.createElement('div', { className: "fixed inset-0 z-50 flex items-center justify-center p-4" }, [
            React.createElement('div', { className: `absolute inset-0 bg-stone-900/30 dark:bg-black/60 backdrop-blur-md transition-opacity ${isClosingSettings ? 'animate-fade-out' : 'animate-fade-in'}`, onClick: closeSettingsAnimated }),
            React.createElement('div', { className: `relative bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-10 w-full max-w-sm overflow-hidden border border-white dark:border-stone-700 text-center ${isClosingSettings ? 'animate-scale-out' : 'animate-scale-in'}` }, [
                React.createElement('div', { className: "flex flex-col items-center gap-4" }, [
                    React.createElement('div', { className: "p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-500 dark:text-indigo-400 animate-spin-slow" }, React.createElement(Wrench, { size: 40 })),
                    React.createElement('h3', { className: "text-2xl font-bold text-stone-800 dark:text-stone-100" }, "En desarrollo :P"),
                    React.createElement('p', { className: "text-stone-400 dark:text-stone-500 font-medium" }, "Pronto podrás configurar más opciones de tu inventario aquí.")
                ]),
                React.createElement('button', { onClick: closeSettingsAnimated, className: "mt-8 w-full py-4 px-6 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all duration-300 active:scale-95" }, "Entendido")
            ])
        ])
    ]);
}

export default App;
