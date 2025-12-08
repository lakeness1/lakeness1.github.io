/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PUNTO DE ENTRADA DE LA APLICACIÓN
 * Logística Lakeness - Inventario Nexxus
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este archivo inicializa la aplicación React cuando el DOM está listo.
 * También configura el tema claro/oscuro basado en las preferencias guardadas.
 */

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN DEL TEMA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configura el tema inicial basado en:
 * 1. Preferencia guardada en localStorage
 * 2. Preferencia del sistema operativo
 * 3. Por defecto: tema claro
 */
(function initTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
        }
    } catch (e) {
        // Si falla localStorage, continuar con tema claro por defecto
        console.warn('No se pudo cargar preferencia de tema:', e);
    }
})();

// ═══════════════════════════════════════════════════════════════════════════
// RENDERIZADO DE LA APLICACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Espera a que el DOM esté completamente cargado antes de renderizar.
 * Usa React 18 createRoot API para renderizado concurrente.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Forzar scroll al inicio para evitar posiciones aleatorias al recargar
    window.scrollTo(0, 0);

    // Obtener el elemento contenedor
    const rootElement = document.getElementById('root');

    if (!rootElement) {
        console.error('Error: No se encontró el elemento #root');
        return;
    }

    // Crear raíz de React (React 18+)
    const root = ReactDOM.createRoot(rootElement);

    // Renderizar la aplicación
    root.render(React.createElement(App));

    console.log('🚀 Logística Lakeness - Inventario Nexxus v2.2.0');
    console.log('📦 Aplicación iniciada correctamente');
});
