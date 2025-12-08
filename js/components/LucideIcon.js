/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPONENTE: LucideIcon
 * Logística Lakeness - Inventario Nexxus
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Componente React para renderizar iconos de la librería Lucide.
 * Adapta Lucide vanilla (UMD) para uso con React sin módulos ES.
 */

/**
 * Componente que renderiza un icono SVG de Lucide
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.name - Nombre del icono en kebab-case (ej: 'check-circle')
 * @param {number} [props.size=18] - Tamaño del icono en píxeles
 * @param {string} [props.className=''] - Clases CSS adicionales para el SVG
 * 
 * @example
 * // Renderizar un icono de check
 * <LucideIcon name="check-circle" size={20} className="text-green-500" />
 * 
 * @returns {React.Element} Elemento span conteniendo el icono SVG
 */
function LucideIcon({ name, size = 18, className = '' }) {
    // Referencia al elemento DOM donde se insertará el SVG
    const ref = React.useRef(null);

    // Efecto para crear y insertar el icono cuando cambian las props
    React.useEffect(() => {
        if (!ref.current) return;

        // Limpiar contenido previo
        ref.current.innerHTML = '';

        // Convertir nombre de kebab-case a PascalCase
        // Ej: 'check-circle' → 'CheckCircle'
        const iconName = name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');

        // Verificar que el icono existe en la librería Lucide
        if (lucide[iconName]) {
            // Crear elemento SVG usando la API de Lucide
            const svgElement = lucide.createElement(lucide[iconName]);

            // Configurar atributos del SVG
            svgElement.setAttribute('width', size);
            svgElement.setAttribute('height', size);
            svgElement.style.display = 'block';  // Evitar espacio extra

            // Agregar clases CSS si se proporcionaron
            if (className) {
                svgElement.setAttribute('class', className);
            }

            // Insertar en el DOM
            ref.current.appendChild(svgElement);
        }
    }, [name, size, className]);

    // Contenedor del icono con dimensiones fijas
    return React.createElement('span', {
        ref,
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size,
            height: size,
            flexShrink: 0  // Evitar que se comprima
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR AL ÁMBITO GLOBAL
// ─────────────────────────────────────────────────────────────────────────────

window.LucideIcon = LucideIcon;
