/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FUNCIÓN DE RENDERIZADO: renderApp
 * Logística Lakeness - Inventario Nexxus
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este archivo contiene la función de renderizado principal de la aplicación.
 * Separa la lógica de renderizado del componente App para mejor organización.
 * 
 * SECCIONES:
 * 1. Toast de guardado
 * 2. Header con navegación
 * 3. Contenido principal (grids de tarjetas)
 * 4. Modales (edición, limpieza, configuración, selector de hojas)
 */

/**
 * Renderiza la interfaz completa de la aplicación
 * @param {Object} props - Todas las props necesarias para renderizar
 * @returns {React.Element} El elemento React completo de la aplicación
 */
function renderApp(props) {
    const {
        // Estados
        isDarkMode, currentShift, activeTab,
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
        fileInputRef, handleFileChange, exportToExcel, inventory, currentShift: shift,
        inputClass, selectClass
    } = props;

    // ═══════════════════════════════════════════════════════════════════════
    // RENDERIZADO PRINCIPAL
    // ═══════════════════════════════════════════════════════════════════════

    return React.createElement('div', {
        className: "min-h-screen pb-32 animate-fade-in"
    }, [

        // ─────────────────────────────────────────────────────────────────
        // TOAST DE GUARDADO
        // ─────────────────────────────────────────────────────────────────
        showSaveToast && React.createElement('div', {
            key: 'toast',
            className: `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 px-6 py-3 rounded-full shadow-xl flex items-center gap-2 ${isClosingToast ? 'animate-scale-out' : 'animate-bounce-in'}`
        }, [
            React.createElement(LucideIcon, { name: 'check-circle', size: 20, className: "text-emerald-400" }),
            React.createElement('span', { className: "font-bold text-sm" }, saveMessage)
        ]),

        // ─────────────────────────────────────────────────────────────────
        // HEADER
        // ─────────────────────────────────────────────────────────────────
        React.createElement('header', {
            key: 'header',
            className: "sticky top-0 sm:top-4 z-40 px-2 sm:px-4 mb-6 sm:mb-8 pt-2 sm:pt-0"
        },
            React.createElement('div', {
                className: "max-w-6xl mx-auto bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl shadow-lg rounded-3xl sm:rounded-[2.5rem] border border-white/50 dark:border-stone-700/50 px-4 py-3 sm:px-6 sm:py-4 animate-slide-in-right delay-0 transition-colors duration-500"
            }, [
                // Fila superior: Logo + Botones
                React.createElement('div', { key: 'top', className: "flex flex-col gap-4" }, [
                    React.createElement('div', { key: 'title-row', className: "flex items-center justify-between" }, [
                        // Logo y título
                        React.createElement('div', { key: 'left', className: "flex items-center gap-3" }, [
                            // Icono decorativo (sin función)
                            React.createElement('div', {
                                key: 'icon',
                                className: "bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/50"
                            }, React.createElement(LucideIcon, { name: 'clipboard-list', size: 20 })),

                            React.createElement('div', { key: 'text' }, [
                                React.createElement('h1', {
                                    key: 'h1',
                                    className: "text-lg font-bold text-stone-800 dark:text-stone-100 tracking-tight flex items-center gap-2 leading-tight"
                                }, [
                                    "Logística Lakeness",
                                    !isOnline && React.createElement('span', {
                                        key: 'off',
                                        className: "flex items-center gap-1 text-[9px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full animate-pulse"
                                    }, [
                                        React.createElement(LucideIcon, { name: 'wifi-off', size: 8 }),
                                        "Off"
                                    ])
                                ]),
                                React.createElement('p', {
                                    key: 'p',
                                    className: "text-[10px] font-medium text-stone-400 dark:text-stone-500"
                                }, isOnline ? 'Modo Nexxus' : 'Modo Local')
                            ])
                        ]),

                        // Botones de acción (más compactos en móvil)
                        React.createElement('div', { key: 'btns', className: "flex gap-1 sm:gap-1.5 items-center" }, [
                            // Botón limpiar
                            React.createElement('button', {
                                key: 'clean',
                                onClick: () => setCleanerOpen(true),
                                className: "p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all active:scale-95 hover-float"
                            }, React.createElement(LucideIcon, { name: 'eraser', size: 16 })),

                            // Botón tema
                            React.createElement('button', {
                                key: 'theme',
                                onClick: toggleTheme,
                                className: "p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-100 dark:bg-indigo-900/30 text-amber-600 dark:text-indigo-300 transition-all active:scale-95 hover-float"
                            }, React.createElement(LucideIcon, { name: isDarkMode ? 'moon' : 'sun', size: 16 })),

                            // Botón importar
                            React.createElement('button', {
                                key: 'import',
                                onClick: handleImportClick,
                                className: "p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 transition-all active:scale-95 hover-float"
                            }, [
                                React.createElement(LucideIcon, { name: 'upload', size: 16 }),
                                React.createElement('input', {
                                    type: "file",
                                    accept: ".xlsx,.csv",
                                    ref: fileInputRef,
                                    onChange: handleFileChange,
                                    className: "hidden"
                                })
                            ]),

                            // Botón exportar
                            React.createElement('button', {
                                key: 'export',
                                onClick: () => exportToExcel(inventory, shift),
                                className: "p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-green-900/40 transition-all active:scale-95 hover-float"
                            }, React.createElement(LucideIcon, { name: 'file-spreadsheet', size: 16 })),

                            // Botón configuración
                            React.createElement('button', {
                                key: 'settings',
                                onClick: () => setSettingsOpen(true),
                                className: "p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 transition-all active:scale-95 hover-float"
                            }, React.createElement(LucideIcon, { name: 'settings', size: 16 }))
                        ])
                    ]),

                    // Selector de turnos
                    React.createElement('div', {
                        key: 'shifts',
                        className: "flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
                    }, SHIFTS.map((s, idx) =>
                        React.createElement('button', {
                            key: s,
                            onClick: () => setCurrentShift(s),
                            style: { animationDelay: `${idx * 100}ms` },
                            className: `px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 animate-slide-in-right ${currentShift === s ? 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 shadow-md scale-105' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'}`
                        }, `Turno ${s}`)
                    ))
                ]),

                // Tabs: Andenes / Patio
                React.createElement('div', {
                    key: 'tabs',
                    className: "grid grid-cols-2 gap-2 mt-4 bg-stone-100 dark:bg-stone-800/50 p-1 rounded-2xl animate-scale-in delay-200"
                }, [
                    React.createElement('button', {
                        key: 'docks',
                        onClick: () => setActiveTab('docks'),
                        className: `py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'docks' ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-white shadow-sm scale-100' : 'text-stone-400 hover:text-stone-600 scale-95'}`
                    }, "Andenes (18)"),
                    React.createElement('button', {
                        key: 'yard',
                        onClick: () => setActiveTab('yard'),
                        className: `py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'yard' ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-white shadow-sm scale-100' : 'text-stone-400 hover:text-stone-600 scale-95'}`
                    }, "Patio de Maniobras (20)")
                ])
            ])
        ),

        // ─────────────────────────────────────────────────────────────────
        // CONTENIDO PRINCIPAL
        // ─────────────────────────────────────────────────────────────────
        React.createElement('main', {
            key: 'main',
            className: "max-w-6xl mx-auto px-4 pb-24"
        },
            activeTab === 'docks'
                ? renderDocksView(currentDocks, handleSlotClick)
                : renderYardView(currentYard, handleSlotClick)
        ),

        // ─────────────────────────────────────────────────────────────────
        // MODALES
        // ─────────────────────────────────────────────────────────────────
        sheetSelectorOpen && renderSheetSelector(sheetList, handleSheetSelection, () => props.setSheetSelectorOpen && props.setSheetSelectorOpen(false)),
        cleanerOpen && renderCleanerModal(isClosingCleaner, closeCleanerAnimated, handleClean),
        modalOpen && renderEditModal(props),
        settingsOpen && renderSettingsModal(isClosingSettings, closeSettingsAnimated)
    ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES DE RENDERIZADO AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Renderiza la vista de andenes (dividida en Galleta y Salado)
 */
function renderDocksView(currentDocks, handleSlotClick) {
    return React.createElement('div', {
        key: 'docks-view',
        className: "space-y-8 animate-fade-in"
    }, [
        // Zona Galleta (Andenes 1-10)
        React.createElement('section', { key: 'galleta', className: "animate-slide-up" }, [
            React.createElement('div', { key: 'head', className: "flex items-center gap-3 mb-4 px-2" }, [
                React.createElement('span', {
                    className: "flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 font-bold text-xs shadow-sm"
                }, "G"),
                React.createElement('h2', {
                    className: "text-lg font-bold text-stone-700 dark:text-stone-200 tracking-tight"
                }, "Zona Galleta")
            ]),
            React.createElement('div', {
                key: 'grid',
                className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
            }, currentDocks.slice(0, 10).map((slot, idx) =>
                React.createElement(SlotCard, { key: slot.id, index: idx, type: "docks", data: slot, onClick: handleSlotClick })
            ))
        ]),

        // Zona Salado (Andenes 11-18)
        React.createElement('section', { key: 'salado', className: "animate-slide-up delay-100" }, [
            React.createElement('div', { key: 'head', className: "flex items-center gap-3 mb-4 px-2" }, [
                React.createElement('span', {
                    className: "flex items-center justify-center w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-bold text-xs shadow-sm"
                }, "S"),
                React.createElement('h2', {
                    className: "text-lg font-bold text-stone-700 dark:text-stone-200 tracking-tight"
                }, "Zona Salado")
            ]),
            React.createElement('div', {
                key: 'grid',
                className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
            }, currentDocks.slice(10, 18).map((slot, idx) =>
                React.createElement(SlotCard, { key: slot.id, index: idx + 10, type: "docks", data: slot, onClick: handleSlotClick })
            ))
        ])
    ]);
}

/**
 * Renderiza la vista del patio de maniobras
 */
function renderYardView(currentYard, handleSlotClick) {
    return React.createElement('div', { key: 'yard-view', className: "animate-fade-in" }, [
        React.createElement('div', { key: 'head', className: "flex items-center gap-3 mb-4 px-2" }, [
            React.createElement('span', {
                className: "flex items-center justify-center w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-bold text-xs shadow-sm"
            }, "P"),
            React.createElement('h2', {
                className: "text-lg font-bold text-stone-700 dark:text-stone-200 tracking-tight"
            }, "Patio de Maniobras")
        ]),
        React.createElement('div', {
            key: 'grid',
            className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        }, currentYard.map((slot, idx) =>
            React.createElement(SlotCard, { key: slot.id, index: idx, type: "yard", data: slot, onClick: handleSlotClick })
        ))
    ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR AL ÁMBITO GLOBAL
// ─────────────────────────────────────────────────────────────────────────────

window.renderApp = renderApp;
