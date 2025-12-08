/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPONENTE PRINCIPAL: App
 * Logística Lakeness - Inventario Nexxus
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Componente raíz de la aplicación React.
 * Gestiona el estado global y renderiza la interfaz completa.
 * 
 * FUNCIONALIDADES:
 * - Gestión de inventario por turnos
 * - Persistencia en localStorage
 * - Cambio de tema claro/oscuro
 * - Importación/exportación Excel
 * - Modales de edición y configuración
 */

function App() {
    // ═══════════════════════════════════════════════════════════════════════
    // ESTADOS PRINCIPALES
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Estado del inventario completo
     * Estructura: { 1: {docks, yard}, 2: {docks, yard}, 3: {docks, yard} }
     */
    const [inventory, setInventory] = React.useState(() => {
        try {
            // Intentar cargar desde localStorage
            if (typeof window !== 'undefined' && window.localStorage) {
                const savedData = localStorage.getItem(STORAGE_KEY);
                if (savedData) return JSON.parse(savedData);
            }
        } catch (error) {
            console.error('Error cargando inventario:', error);
        }
        // Si no hay datos guardados, generar estructura inicial
        return generateInitialData();
    });

    /** Estado del tema (claro/oscuro) */
    const [isDarkMode, setIsDarkMode] = React.useState(() =>
        document.documentElement.classList.contains('dark')
    );

    // ═══════════════════════════════════════════════════════════════════════
    // ESTADOS DE UI
    // ═══════════════════════════════════════════════════════════════════════

    // --- Modales ---
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [isClosingSettings, setIsClosingSettings] = React.useState(false);
    const [cleanerOpen, setCleanerOpen] = React.useState(false);
    const [isClosingCleaner, setIsClosingCleaner] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [isClosingModal, setIsClosingModal] = React.useState(false);
    const [sheetSelectorOpen, setSheetSelectorOpen] = React.useState(false);

    // --- Navegación ---
    const [currentShift, setCurrentShift] = React.useState(1);
    const [activeTab, setActiveTab] = React.useState('docks');

    // --- Edición ---
    const [editingSlot, setEditingSlot] = React.useState(null);
    const [formData, setFormData] = React.useState(emptySlotData);

    // --- Importación Excel ---
    const [sheetList, setSheetList] = React.useState([]);
    const [tempWorkbook, setTempWorkbook] = React.useState(null);
    const fileInputRef = React.useRef(null);

    // --- Feedback visual ---
    const [isOnline, setIsOnline] = React.useState(navigator.onLine);
    const [showSaveToast, setShowSaveToast] = React.useState(false);
    const [isClosingToast, setIsClosingToast] = React.useState(false);
    const [saveMessage, setSaveMessage] = React.useState("Guardado");

    // ═══════════════════════════════════════════════════════════════════════
    // EFECTOS (SIDE EFFECTS)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Efecto: Guardar inventario en localStorage cuando cambia
     */
    React.useEffect(() => {
        try {
            if (window.localStorage) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
            }
        } catch (e) {
            console.error('Error guardando inventario:', e);
        }
    }, [inventory]);

    /**
     * Efecto: Detectar cambios en la conexión a internet
     */
    React.useEffect(() => {
        const handleState = () => setIsOnline(navigator.onLine);

        window.addEventListener('online', handleState);
        window.addEventListener('offline', handleState);

        return () => {
            window.removeEventListener('online', handleState);
            window.removeEventListener('offline', handleState);
        };
    }, []);

    // ═══════════════════════════════════════════════════════════════════════
    // FUNCIONES UTILITARIAS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Alterna entre tema claro y oscuro
     */
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

    /**
     * Cierra modales con animación de salida
     */
    const closeModalAnimated = () => {
        setIsClosingModal(true);
        setTimeout(() => {
            setModalOpen(false);
            setIsClosingModal(false);
        }, 280);
    };

    const closeSettingsAnimated = () => {
        setIsClosingSettings(true);
        setTimeout(() => {
            setSettingsOpen(false);
            setIsClosingSettings(false);
        }, 280);
    };

    const closeCleanerAnimated = () => {
        setIsClosingCleaner(true);
        setTimeout(() => {
            setCleanerOpen(false);
            setIsClosingCleaner(false);
        }, 280);
    };

    /**
     * Muestra notificación de guardado con animación
     */
    const triggerSaveFeedback = (msg = "Guardado") => {
        setSaveMessage(msg);
        setShowSaveToast(true);
        setIsClosingToast(false);

        setTimeout(() => {
            setIsClosingToast(true);
            setTimeout(() => {
                setShowSaveToast(false);
                setIsClosingToast(false);
            }, 300);
        }, 2000);
    };

    // ═══════════════════════════════════════════════════════════════════════
    // HANDLERS DE LIMPIEZA
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Limpia datos del inventario
     * @param {string} scope - 'all' para todo, 'shift' para turno específico
     * @param {number|null} shift - Número de turno (si scope='shift')
     * @param {string|null} type - 'docks', 'yard' o 'all'
     */
    const handleClean = (scope, shift = null, type = null) => {
        const newInventory = JSON.parse(JSON.stringify(inventory));
        const freshData = generateInitialData();

        if (scope === 'all') {
            setInventory(freshData);
        } else if (scope === 'shift') {
            if (type === 'all' || type === 'docks') {
                newInventory[shift].docks = freshData[shift].docks;
            }
            if (type === 'all' || type === 'yard') {
                newInventory[shift].yard = freshData[shift].yard;
            }
            setInventory(newInventory);
        }

        closeCleanerAnimated();
        triggerSaveFeedback("Limpieza Completada");
    };

    // ═══════════════════════════════════════════════════════════════════════
    // HANDLERS DE EDICIÓN
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Abre el modal de edición para un espacio específico
     */
    const handleSlotClick = (index, type) => {
        const data = inventory[currentShift][type][index];
        setEditingSlot({ index, type });
        setFormData({ ...data });
        setModalOpen(true);
    };

    /**
     * Actualiza el formData cuando cambian los inputs
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Valida el formulario antes de guardar
     */
    const validateForm = () => {
        const statusNorm = (formData.status || '').toLowerCase();

        // El sello derecho (#2) es obligatorio si está frenteada o cargada
        if ((statusNorm === 'frenteada' || statusNorm === 'cargada') && !formData.sealRight) {
            alert("⚠️ ¡Atención Lake!\n\nEl Sello Derecho (#2) es obligatorio.");
            return false;
        }
        return true;
    };

    /**
     * Guarda los cambios del formulario
     */
    const handleSave = () => {
        if (!validateForm()) return;

        const updatedData = {
            ...formData,
            updatedAt: new Date().toISOString()
        };

        const newInventory = JSON.parse(JSON.stringify(inventory));
        newInventory[currentShift][editingSlot.type][editingSlot.index] = updatedData;
        setInventory(newInventory);

        closeModalAnimated();
        triggerSaveFeedback();
    };

    /**
     * Limpia un espacio específico (lo deja vacío)
     */
    const handleClearSlot = () => {
        const newInventory = JSON.parse(JSON.stringify(inventory));
        const originalId = newInventory[currentShift][editingSlot.type][editingSlot.index].id;

        newInventory[currentShift][editingSlot.type][editingSlot.index] = {
            ...emptySlotData,
            id: originalId,
            number: formData.number,
            type: editingSlot.type
        };

        setInventory(newInventory);
        closeModalAnimated();
        triggerSaveFeedback("Espacio Liberado");
    };

    // ═══════════════════════════════════════════════════════════════════════
    // HANDLERS DE IMPORTACIÓN
    // ═══════════════════════════════════════════════════════════════════════

    const handleImportClick = () => fileInputRef.current.click();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const wb = window.XLSX.read(evt.target.result, { type: 'binary' });

                if (wb.SheetNames.length > 1) {
                    // Múltiples hojas: mostrar selector
                    setTempWorkbook(wb);
                    setSheetList(wb.SheetNames);
                    setSheetSelectorOpen(true);
                } else {
                    // Una sola hoja: importar directamente
                    processSheetImport(wb, wb.SheetNames[0], inventory, currentShift, setInventory, triggerSaveFeedback);
                }
            } catch (e) {
                console.error('Error leyendo archivo:', e);
                alert("❌ Error al leer el archivo");
            }
        };

        reader.readAsBinaryString(file);
        e.target.value = '';  // Reset para permitir reimportar mismo archivo
    };

    const handleSheetSelection = (sheetName) => {
        if (tempWorkbook) {
            processSheetImport(tempWorkbook, sheetName, inventory, currentShift, setInventory, triggerSaveFeedback);
            setSheetSelectorOpen(false);
            setTempWorkbook(null);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // DATOS DERIVADOS
    // ═══════════════════════════════════════════════════════════════════════

    const currentDocks = inventory[currentShift].docks;
    const currentYard = inventory[currentShift].yard;

    // Clases CSS reutilizables para inputs
    const inputClass = "w-full px-5 py-4 bg-stone-100/50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-700 dark:text-stone-200 font-bold ring-4 ring-transparent focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600";

    const selectClass = "w-full px-5 py-4 bg-stone-100/50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-700 dark:text-stone-200 font-bold ring-4 ring-transparent focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none appearance-none cursor-pointer transition-all pr-12";

    // ═══════════════════════════════════════════════════════════════════════
    // RENDERIZADO - Ver archivo app-render.js para el JSX
    // ═══════════════════════════════════════════════════════════════════════

    return renderApp({
        // Estados
        inventory, isDarkMode, currentShift, activeTab,
        modalOpen, isClosingModal, settingsOpen, isClosingSettings,
        cleanerOpen, isClosingCleaner, sheetSelectorOpen, sheetList,
        editingSlot, formData, isOnline, showSaveToast, isClosingToast, saveMessage,
        currentDocks, currentYard,

        // Handlers
        setCurrentShift, setActiveTab, setCleanerOpen, setSettingsOpen,
        toggleTheme, handleImportClick, handleSlotClick, handleInputChange,
        handleSave, handleClearSlot, handleClean, handleSheetSelection,
        closeModalAnimated, closeSettingsAnimated, closeCleanerAnimated,

        // Refs y utilidades
        fileInputRef, handleFileChange, exportToExcel, inventory, currentShift,
        inputClass, selectClass
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR AL ÁMBITO GLOBAL
// ─────────────────────────────────────────────────────────────────────────────

window.App = App;
