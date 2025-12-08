/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONSTANTES DE LA APLICACIÓN
 * Logística Lakeness - Inventario Nexxus
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este archivo contiene todas las constantes y configuraciones globales
 * utilizadas a lo largo de la aplicación.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE ANDENES Y PATIO
// ─────────────────────────────────────────────────────────────────────────────

/** Número total de andenes disponibles */
const DOCK_COUNT = 18;

/** Número total de espacios en el patio de maniobras */
const YARD_COUNT = 20;

/** Turnos de trabajo disponibles (1=Mañana, 2=Tarde, 3=Noche) */
const SHIFTS = [1, 2, 3];

// ─────────────────────────────────────────────────────────────────────────────
// CLAVES DE ALMACENAMIENTO LOCAL
// ─────────────────────────────────────────────────────────────────────────────

/** Clave para guardar el inventario en localStorage */
const STORAGE_KEY = 'lake_logistica_inventory_v22_responsive_fix';

/** Clave para guardar la preferencia de tema (claro/oscuro) */
const THEME_KEY = 'lake_theme_preference';

// ─────────────────────────────────────────────────────────────────────────────
// OPCIONES DE FORMULARIOS
// ─────────────────────────────────────────────────────────────────────────────

/** Tamaños de remolque disponibles (en pies) */
const SIZES = ['53', '48', '40', '3.5'];

/** Estados posibles para un andén */
const DOCK_STATUSES = ['Vacía', 'Enrampada', 'Frenteada', 'Cargada'];

/** Estados posibles para un espacio de patio */
const YARD_STATUSES = ['Vacía', 'Cargada'];

// ─────────────────────────────────────────────────────────────────────────────
// MODELO DE DATOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Plantilla de datos vacía para un espacio (andén o patio)
 * Se usa como valor por defecto al crear nuevos espacios o limpiar existentes
 */
const emptySlotData = {
    id: '',              // Identificador único (ej: "D1-5" = Turno 1, Andén 5)
    number: 0,           // Número del espacio
    type: 'docks',       // Tipo: 'docks' (andén) o 'yard' (patio)
    size: '',            // Tamaño del remolque
    eco: '',             // Número económico del camión
    line: '',            // Línea transportista
    status: 'Vacía',     // Estado actual
    sealLeft: '',        // Sello de seguridad izquierdo (#1)
    sealRight: '',       // Sello de seguridad derecho (#2) - Obligatorio si está cargada
    observations: '',    // Notas adicionales
    updatedAt: null      // Fecha/hora de última actualización
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR AL ÁMBITO GLOBAL
// ─────────────────────────────────────────────────────────────────────────────
// Nota: Usamos window.* para que las constantes estén disponibles globalmente
// ya que no usamos módulos ES (para compatibilidad con GitHub Pages)

window.DOCK_COUNT = DOCK_COUNT;
window.YARD_COUNT = YARD_COUNT;
window.SHIFTS = SHIFTS;
window.STORAGE_KEY = STORAGE_KEY;
window.THEME_KEY = THEME_KEY;
window.SIZES = SIZES;
window.DOCK_STATUSES = DOCK_STATUSES;
window.YARD_STATUSES = YARD_STATUSES;
window.emptySlotData = emptySlotData;
