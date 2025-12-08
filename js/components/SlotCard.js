/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPONENTE: SlotCard
 * Logística Lakeness - Inventario Nexxus
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Componente React que representa una tarjeta de espacio (andén o patio).
 * Muestra información visual del estado del espacio con estilos dinámicos.
 */

/**
 * Tarjeta visual para un espacio de inventario
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.data - Datos del espacio (eco, line, status, etc.)
 * @param {Function} props.onClick - Función a ejecutar al hacer clic
 * @param {number} props.index - Índice del espacio en el array
 * @param {string} props.type - Tipo: 'docks' (andén) o 'yard' (patio)
 * 
 * @returns {React.Element} Tarjeta con información del espacio
 */
function SlotCard({ data, onClick, index, type }) {
    // ─────────────────────────────────────────────────────────────────────
    // NORMALIZACIÓN DEL ESTADO
    // ─────────────────────────────────────────────────────────────────────

    const statusNorm = (data.status || '')
        .toLowerCase()
        .replace('.', '')
        .trim();

    const isOccupied = statusNorm !== 'vacía' && statusNorm !== '';

    // ─────────────────────────────────────────────────────────────────────
    // ESTILOS DINÁMICOS SEGÚN ESTADO
    // ─────────────────────────────────────────────────────────────────────

    // Estilos por defecto (vacío)
    let cardStyle = "bg-white dark:bg-stone-800 border-2 border-transparent dark:border-stone-700/50 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-500/30 text-stone-400 dark:text-stone-500 hover:shadow-lg dark:hover:shadow-black/40";
    let iconColor = "text-stone-300 dark:text-stone-600";
    let statusBadge = "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-600";

    // Estado: CARGADA (rojo/rosa)
    if (statusNorm === 'cargada') {
        cardStyle = "bg-white dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 hover:shadow-lg hover:shadow-rose-200/50";
        iconColor = "text-rose-400";
        statusBadge = "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border border-rose-100";
    }

    // Estado: FRENTEADA (ámbar/amarillo)
    if (statusNorm === 'frenteada') {
        cardStyle = "bg-white dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 hover:shadow-lg hover:shadow-amber-200/50";
        iconColor = "text-amber-400";
        statusBadge = "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border border-amber-100";
    }

    // Estado: ENRAMPADA (azul cielo)
    if (statusNorm === 'enrampada') {
        cardStyle = "bg-white dark:bg-sky-900/10 border-2 border-sky-100 dark:border-sky-900/30 text-sky-700 dark:text-sky-400 hover:shadow-lg hover:shadow-sky-200/50";
        iconColor = "text-sky-400";
        statusBadge = "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 border border-sky-100";
    }

    // Estado especial: Vacía pero con datos (verde)
    if (statusNorm === 'vacía' && (data.eco || data.line)) {
        cardStyle = "bg-white dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:shadow-lg hover:shadow-emerald-200/50";
        iconColor = "text-emerald-400";
        statusBadge = "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-300 border border-emerald-100";
    }

    // ─────────────────────────────────────────────────────────────────────
    // ANIMACIÓN ESCALONADA
    // ─────────────────────────────────────────────────────────────────────

    // Delay basado en posición para efecto cascada
    const delayStyle = { animationDelay: `${(index % 10) * 50}ms` };

    // ─────────────────────────────────────────────────────────────────────
    // TEXTO DEL ECONÓMICO
    // ─────────────────────────────────────────────────────────────────────

    let ecoText = 'Disponible';
    if (data.eco) {
        ecoText = `ECO ${data.eco}`;
    } else if (isOccupied) {
        ecoText = 'Sin económico';
    }

    // ─────────────────────────────────────────────────────────────────────
    // RENDERIZADO
    // ─────────────────────────────────────────────────────────────────────

    return React.createElement('div', {
        style: delayStyle,
        onClick: () => onClick(index, type),
        className: `relative p-4 rounded-[1.5rem] transition-all duration-500 ease-out cursor-pointer active:scale-95 flex flex-col justify-between h-36 sm:h-44 group animate-slide-up hover-float ${cardStyle}`
    }, [
        // ─── Encabezado: Número + Icono ───
        React.createElement('div', {
            key: 'header',
            className: "flex justify-between items-start"
        }, [
            // Número y etiqueta
            React.createElement('div', {
                key: 'info',
                className: "flex flex-col"
            }, [
                React.createElement('span', {
                    key: 'num',
                    className: "font-black text-2xl sm:text-3xl tracking-tighter opacity-90 transition-transform group-hover:scale-105 origin-left text-stone-700 dark:text-stone-200"
                }, type === 'docks' ? `${data.number}` : `P${data.number}`),

                React.createElement('span', {
                    key: 'label',
                    className: "text-[9px] sm:text-[10px] uppercase tracking-widest font-bold opacity-50 mt-0.5"
                }, type === 'docks' ? 'Andén' : 'Patio')
            ]),

            // Icono (camión si ocupado, caja si vacío)
            React.createElement('div', {
                key: 'icon',
                className: `p-2 rounded-xl bg-stone-50 dark:bg-stone-900/50 ${iconColor} transition-transform group-hover:scale-110 duration-300`
            }, React.createElement(LucideIcon, {
                name: isOccupied ? 'truck' : 'box',
                size: 18
            }))
        ]),

        // ─── Detalles: ECO, Línea, Estado ───
        React.createElement('div', {
            key: 'details',
            className: "space-y-1"
        }, [
            // Económico
            React.createElement('div', {
                key: 'eco',
                className: "text-sm sm:text-base font-bold truncate opacity-90 dark:opacity-100"
            }, ecoText),

            // Línea transportista (si existe)
            data.line && React.createElement('div', {
                key: 'line',
                className: "text-[10px] sm:text-xs font-bold uppercase truncate opacity-60 dark:opacity-70 flex items-center gap-1"
            }, [
                React.createElement('span', {
                    className: "w-1 h-1 rounded-full bg-current opacity-40"
                }),
                data.line
            ]),

            // Badge de estado
            React.createElement('div', {
                key: 'status',
                className: `text-[9px] sm:text-[10px] font-extrabold px-2.5 py-1 rounded-full w-fit tracking-wide transition-all duration-300 ${statusBadge} mt-1.5`
            }, (data.status || 'Sin Asignar').toUpperCase())
        ]),

        // ─── Indicador de sello (solo si cargada/frenteada) ───
        (statusNorm === 'cargada' || statusNorm === 'frenteada') &&
        React.createElement('div', {
            key: 'alert',
            className: "absolute top-3 right-3 transition-all duration-300 group-hover:scale-125"
        }, React.createElement(LucideIcon, {
            name: data.sealRight ? 'check-circle' : 'alert-triangle',
            size: 16,
            className: data.sealRight ? 'text-emerald-500' : 'text-rose-500'
        }))
    ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR AL ÁMBITO GLOBAL
// ─────────────────────────────────────────────────────────────────────────────

window.SlotCard = SlotCard;
