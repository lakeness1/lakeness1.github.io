/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MODALES DE LA APLICACIÓN
 * Logística Lakeness - Inventario Nexxus
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Funciones para renderizar los diferentes modales:
 * - Modal de edición de espacio
 * - Modal de limpieza de datos
 * - Modal de configuración
 * - Selector de hojas de Excel
 */

// ═══════════════════════════════════════════════════════════════════════════
// MODAL DE EDICIÓN DE ESPACIO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Renderiza el modal para editar un espacio (andén o patio)
 */
function renderEditModal(props) {
    const {
        isClosingModal, closeModalAnimated, editingSlot, formData,
        handleInputChange, handleSave, handleClearSlot, inputClass, selectClass
    } = props;

    const isYard = editingSlot?.type === 'yard';
    const statuses = isYard ? YARD_STATUSES : DOCK_STATUSES;

    return React.createElement('div', {
        key: 'edit-modal',
        onClick: closeModalAnimated,
        className: `fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 ${isClosingModal ? 'animate-fade-out' : 'animate-fade-in'}`
    }, [
        // Overlay
        React.createElement('div', {
            key: 'overlay',
            className: "absolute inset-0 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md"
        }),

        // Contenedor del modal
        React.createElement('div', {
            key: 'content',
            onClick: e => e.stopPropagation(),
            className: `relative w-full sm:max-w-md bg-white dark:bg-stone-900 sm:rounded-[2.5rem] shadow-2xl overflow-hidden ${isClosingModal ? 'sm:animate-scale-out mobile-sheet-exit' : 'sm:animate-scale-in mobile-sheet-enter'} sm:max-h-[85vh] sm:h-auto h-[calc(100dvh-24px)] rounded-t-[2rem] sm:rounded-[2.5rem] flex flex-col`
        }, [
            // Handle de arrastre (móvil)
            React.createElement('div', {
                key: 'handle',
                className: "w-12 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full mx-auto mt-3 mb-1 sm:hidden"
            }),

            // Encabezado
            React.createElement('div', {
                key: 'header',
                className: "flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800"
            }, [
                React.createElement('div', { key: 'left' }, [
                    React.createElement('h2', {
                        key: 'title',
                        className: "text-xl font-black text-stone-800 dark:text-stone-100"
                    }, `${isYard ? 'Patio' : 'Andén'} ${formData.number}`),
                    React.createElement('p', {
                        key: 'sub',
                        className: "text-xs text-stone-400 dark:text-stone-500 font-medium"
                    }, "Editar información")
                ]),
                React.createElement('button', {
                    key: 'close',
                    onClick: closeModalAnimated,
                    className: "p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all active:scale-95"
                }, React.createElement(LucideIcon, { name: 'x', size: 20 }))
            ]),

            // Formulario (scrollable)
            React.createElement('div', {
                key: 'form',
                className: "flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar"
            }, [
                // Fila: Tamaño + Económico
                React.createElement('div', { key: 'row1', className: "grid grid-cols-2 gap-3" }, [
                    // Select Tamaño
                    React.createElement('div', { key: 'size', className: "relative" }, [
                        React.createElement('label', {
                            className: "block text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold mb-1.5 ml-1"
                        }, "Tamaño (FT)"),
                        React.createElement('select', {
                            name: "size",
                            value: formData.size,
                            onChange: handleInputChange,
                            className: selectClass
                        }, [
                            React.createElement('option', { key: '', value: '' }, 'Seleccionar'),
                            ...SIZES.map(s => React.createElement('option', { key: s, value: s }, s + "'"))
                        ]),
                        React.createElement('div', {
                            className: "absolute right-4 top-[calc(50%+4px)] pointer-events-none"
                        }, React.createElement(LucideIcon, { name: 'chevron-down', size: 16, className: "text-stone-400" }))
                    ]),

                    // Input Económico
                    React.createElement('div', { key: 'eco' }, [
                        React.createElement('label', {
                            className: "block text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold mb-1.5 ml-1"
                        }, "Económico"),
                        React.createElement('input', {
                            type: "text",
                            name: "eco",
                            placeholder: "Ej: 12345",
                            value: formData.eco,
                            onChange: handleInputChange,
                            className: inputClass
                        })
                    ])
                ]),

                // Input Línea
                React.createElement('div', { key: 'line' }, [
                    React.createElement('label', {
                        className: "block text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold mb-1.5 ml-1"
                    }, "Línea Transportista"),
                    React.createElement('input', {
                        type: "text",
                        name: "line",
                        placeholder: "Ej: ABC Logistics",
                        value: formData.line,
                        onChange: handleInputChange,
                        className: inputClass
                    })
                ]),

                // Fila: Sellos
                React.createElement('div', { key: 'seals', className: "grid grid-cols-2 gap-3" }, [
                    // Sello Izquierdo
                    React.createElement('div', { key: 'seal1' }, [
                        React.createElement('label', {
                            className: "block text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold mb-1.5 ml-1"
                        }, "Sello Izq. (#1)"),
                        React.createElement('input', {
                            type: "text",
                            name: "sealLeft",
                            placeholder: "No.",
                            value: formData.sealLeft,
                            onChange: handleInputChange,
                            className: inputClass
                        })
                    ]),

                    // Sello Derecho (Obligatorio)
                    React.createElement('div', { key: 'seal2' }, [
                        React.createElement('label', {
                            className: "block text-[10px] uppercase tracking-widest text-rose-500 font-bold mb-1.5 ml-1"
                        }, "Sello Der. (#2) *"),
                        React.createElement('input', {
                            type: "text",
                            name: "sealRight",
                            placeholder: "No.",
                            value: formData.sealRight,
                            onChange: handleInputChange,
                            className: inputClass
                        })
                    ])
                ]),

                // Select Status
                React.createElement('div', { key: 'status', className: "relative" }, [
                    React.createElement('label', {
                        className: "block text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold mb-1.5 ml-1"
                    }, "Estado"),
                    React.createElement('select', {
                        name: "status",
                        value: formData.status,
                        onChange: handleInputChange,
                        className: selectClass
                    }, statuses.map(st =>
                        React.createElement('option', { key: st, value: st }, st)
                    )),
                    React.createElement('div', {
                        className: "absolute right-4 top-[calc(50%+4px)] pointer-events-none"
                    }, React.createElement(LucideIcon, { name: 'chevron-down', size: 16, className: "text-stone-400" }))
                ]),

                // Textarea Observaciones
                React.createElement('div', { key: 'obs' }, [
                    React.createElement('label', {
                        className: "block text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold mb-1.5 ml-1"
                    }, "Observaciones"),
                    React.createElement('textarea', {
                        name: "observations",
                        rows: 3,
                        placeholder: "Notas adicionales...",
                        value: formData.observations,
                        onChange: handleInputChange,
                        className: inputClass + " resize-none"
                    })
                ])
            ]),

            // Footer con botones
            React.createElement('div', {
                key: 'footer',
                className: "p-6 pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3 bg-stone-50 dark:bg-stone-900"
            }, [
                // Botón Guardar
                React.createElement('button', {
                    key: 'save',
                    onClick: handleSave,
                    className: "w-full py-4 rounded-2xl bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg"
                }, [
                    React.createElement(LucideIcon, { name: 'save', size: 18 }),
                    "Guardar Cambios"
                ]),

                // Botón Liberar
                React.createElement('button', {
                    key: 'clear',
                    onClick: handleClearSlot,
                    className: "w-full py-3 rounded-2xl bg-rose-500/10 text-rose-600 text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                }, [
                    React.createElement(LucideIcon, { name: 'trash-2', size: 16 }),
                    "Liberar Espacio"
                ])
            ])
        ])
    ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL DE LIMPIEZA
// ═══════════════════════════════════════════════════════════════════════════

function renderCleanerModal(isClosing, closeAnimated, handleClean) {
    return React.createElement('div', {
        key: 'cleaner-modal',
        onClick: closeAnimated,
        className: `fixed inset-0 z-50 flex items-center justify-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`
    }, [
        React.createElement('div', {
            key: 'overlay',
            className: "absolute inset-0 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md"
        }),
        React.createElement('div', {
            key: 'content',
            onClick: e => e.stopPropagation(),
            className: `relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-[2rem] shadow-2xl p-6 ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`
        }, [
            React.createElement('div', { key: 'head', className: "text-center mb-6" }, [
                React.createElement('div', {
                    key: 'icon',
                    className: "w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-4"
                }, React.createElement(LucideIcon, { name: 'eraser', size: 28, className: "text-rose-500" })),
                React.createElement('h2', {
                    key: 'title',
                    className: "text-xl font-black text-stone-800 dark:text-stone-100"
                }, "Limpieza de Datos"),
                React.createElement('p', {
                    key: 'sub',
                    className: "text-xs text-stone-400 mt-1"
                }, "Selecciona qué deseas limpiar")
            ]),

            // Opciones de limpieza
            React.createElement('div', { key: 'opts', className: "space-y-2" }, [
                ...SHIFTS.map(s =>
                    React.createElement('button', {
                        key: `shift-${s}`,
                        onClick: () => handleClean('shift', s, 'all'),
                        className: "w-full py-3 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-sm font-bold flex items-center gap-3 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all active:scale-[0.98]"
                    }, [
                        React.createElement(LucideIcon, { name: 'layers', size: 18 }),
                        `Limpiar Turno ${s}`
                    ])
                ),
                React.createElement('button', {
                    key: 'all',
                    onClick: () => handleClean('all'),
                    className: "w-full py-3 px-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 text-sm font-bold flex items-center gap-3 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all active:scale-[0.98]"
                }, [
                    React.createElement(LucideIcon, { name: 'trash-2', size: 18 }),
                    "Limpiar TODO"
                ])
            ]),

            // Botón cancelar
            React.createElement('button', {
                key: 'cancel',
                onClick: closeAnimated,
                className: "w-full mt-4 py-3 text-stone-400 text-sm font-bold"
            }, "Cancelar")
        ])
    ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL DE CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

function renderSettingsModal(isClosing, closeAnimated) {
    return React.createElement('div', {
        key: 'settings-modal',
        onClick: closeAnimated,
        className: `fixed inset-0 z-50 flex items-center justify-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`
    }, [
        React.createElement('div', {
            key: 'overlay',
            className: "absolute inset-0 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md"
        }),
        React.createElement('div', {
            key: 'content',
            onClick: e => e.stopPropagation(),
            className: `relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-[2rem] shadow-2xl p-6 ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`
        }, [
            React.createElement('div', { key: 'head', className: "text-center mb-6" }, [
                React.createElement('div', {
                    key: 'icon',
                    className: "w-16 h-16 mx-auto rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4"
                }, React.createElement(LucideIcon, { name: 'settings', size: 28, className: "text-stone-600 dark:text-stone-300" })),
                React.createElement('h2', {
                    key: 'title',
                    className: "text-xl font-black text-stone-800 dark:text-stone-100"
                }, "Configuración"),
                React.createElement('p', {
                    key: 'sub',
                    className: "text-xs text-stone-400 mt-1"
                }, "Próximamente más opciones")
            ]),

            // Información de versión
            React.createElement('div', {
                key: 'info',
                className: "bg-stone-50 dark:bg-stone-800 rounded-xl p-4 text-center"
            }, [
                React.createElement('p', {
                    key: 'ver',
                    className: "text-xs text-stone-500 dark:text-stone-400"
                }, [
                    "Versión ",
                    React.createElement('span', { className: "font-bold" }, "2.2.0")
                ]),
                React.createElement('p', {
                    key: 'by',
                    className: "text-[10px] text-stone-400 dark:text-stone-500 mt-1"
                }, "Desarrollado para Logística Lakeness")
            ]),

            // Botón cerrar
            React.createElement('button', {
                key: 'close',
                onClick: closeAnimated,
                className: "w-full mt-4 py-3 rounded-2xl bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 text-sm font-bold active:scale-[0.98] transition-transform"
            }, "Cerrar")
        ])
    ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// SELECTOR DE HOJAS EXCEL
// ═══════════════════════════════════════════════════════════════════════════

function renderSheetSelector(sheetList, handleSelection, onClose) {
    return React.createElement('div', {
        key: 'sheet-selector',
        onClick: onClose,
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
    }, [
        React.createElement('div', {
            key: 'overlay',
            className: "absolute inset-0 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md"
        }),
        React.createElement('div', {
            key: 'content',
            onClick: e => e.stopPropagation(),
            className: "relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-[2rem] shadow-2xl p-6 animate-scale-in"
        }, [
            React.createElement('div', { key: 'head', className: "text-center mb-6" }, [
                React.createElement('div', {
                    key: 'icon',
                    className: "w-16 h-16 mx-auto rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4"
                }, React.createElement(LucideIcon, { name: 'file-spreadsheet', size: 28, className: "text-green-600" })),
                React.createElement('h2', {
                    key: 'title',
                    className: "text-xl font-black text-stone-800 dark:text-stone-100"
                }, "Seleccionar Hoja"),
                React.createElement('p', {
                    key: 'sub',
                    className: "text-xs text-stone-400 mt-1"
                }, "El archivo tiene múltiples hojas")
            ]),

            // Lista de hojas
            React.createElement('div', { key: 'list', className: "space-y-2 max-h-60 overflow-y-auto" },
                sheetList.map((sheet, idx) =>
                    React.createElement('button', {
                        key: idx,
                        onClick: () => handleSelection(sheet),
                        className: "w-full py-3 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-sm font-bold flex items-center gap-3 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-all active:scale-[0.98]"
                    }, [
                        React.createElement(LucideIcon, { name: 'file-text', size: 18 }),
                        sheet
                    ])
                )
            ),

            // Botón cancelar
            React.createElement('button', {
                key: 'cancel',
                onClick: onClose,
                className: "w-full mt-4 py-3 text-stone-400 text-sm font-bold"
            }, "Cancelar")
        ])
    ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR AL ÁMBITO GLOBAL
// ─────────────────────────────────────────────────────────────────────────────

window.renderEditModal = renderEditModal;
window.renderCleanerModal = renderCleanerModal;
window.renderSettingsModal = renderSettingsModal;
window.renderSheetSelector = renderSheetSelector;
