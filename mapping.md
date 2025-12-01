# Mapping Técnico: Logística Lakeness - Inventario Nexxus

Este documento detalla la estructura, funcionamiento y lógica detrás de la aplicación web contenida en `index.html`. La aplicación es una SPA (Single Page Application) construida en un solo archivo para máxima portabilidad y facilidad de despliegue.

## 1. Arquitectura General

**¿Qué es?**
Es una aplicación web React montada directamente en el navegador sin necesidad de un proceso de compilación (build step) tradicional.

**¿Cómo funciona?**
Utiliza módulos ES (`type="module"`) para importar React, ReactDOM y otras librerías directamente desde `esm.sh` (un CDN para módulos NPM). Tailwind CSS se carga vía CDN y se configura en tiempo de ejecución.

**¿Por qué así?**
Para permitir que la aplicación funcione simplemente abriendo el archivo `index.html` en cualquier navegador moderno, sin necesidad de instalar Node.js, ejecutar servidores de desarrollo o compilar código. Ideal para entornos donde la simplicidad de distribución es clave.

---

## 2. Estructura de Datos (`inventory`)

**¿Qué es?**
El "corazón" de la aplicación. Es un objeto JSON que almacena todo el estado del inventario.

**Estructura:**
```json
{
  "1": { // Turno 1
    "docks": [ ... ], // Array de 18 objetos (Andenes)
    "yard": [ ... ]   // Array de 20 objetos (Patio)
  },
  "2": { ... }, // Turno 2
  "3": { ... }  // Turno 3
}
```

**Objeto Slot (Cada espacio):**
Cada elemento dentro de `docks` o `yard` tiene esta forma:
- `id`: Identificador único (ej. "D1-1").
- `number`: Número visual (1-18 o 1-20).
- `status`: Estado actual ("Vacía", "Enrampada", "Frenteada", "Cargada").
- `size`: Tamaño (FT).
- `eco`: Número económico.
- `line`: Línea de transporte.
- `sealLeft` / `sealRight`: Sellos de seguridad.
- `observations`: Notas libres.

---

## 3. Componentes Principales

### 3.1. `SlotCard` (Componente Visual)
**¿Qué hace?**
Renderiza la tarjeta individual para cada andén o espacio de patio.

**¿Cómo funciona?**
Recibe `data` (información del slot) y determina su apariencia (colores, bordes, iconos) basándose en el `status`.
- **Lógica de Color:** Usa condicionales `if (statusNorm === 'cargada')` para aplicar clases de Tailwind específicas (ej. rojo para cargada, azul para enrampada).
- **Animación:** Aplica un `animationDelay` basado en el índice para crear un efecto de cascada al cargar.

### 3.2. `App` (Componente Principal)
**¿Qué hace?**
Contenedor principal que maneja toda la lógica de negocio y el estado global.

**Estados Clave:**
- `inventory`: El objeto de datos completo.
- `currentShift`: Turno actual seleccionado (1, 2 o 3).
- `activeTab`: Vista actual ('docks' o 'yard').
- `isDarkMode`: Controla el tema visual.
- `modalOpen` / `editingSlot`: Controlan qué tarjeta se está editando.

---

## 4. Funcionalidades Clave (El "Mapping" de Funciones)

### 4.1. Persistencia de Datos
- **Nombre:** `useEffect` con `localStorage`.
- **¿Cómo lo hace?** Cada vez que cambia el estado `inventory`, se guarda automáticamente en `localStorage` del navegador bajo la llave `lake_logistica_inventory_v22_responsive_fix`. Al iniciar, intenta leer esta llave.
- **¿Por qué?** Para que el usuario no pierda sus datos si cierra la pestaña o recarga la página.

### 4.2. Sistema de Temas (Dark Mode)
- **Nombre:** `toggleTheme` y Script de Inicialización.
- **¿Cómo lo hace?** Alterna la clase `dark` en el elemento `<html>`. Tailwind usa esta clase para aplicar estilos condicionales (`dark:bg-stone-900`).
- **¿Por qué?** Mejora la usabilidad en entornos con poca luz (como almacenes nocturnos) y respeta la preferencia del sistema operativo.

### 4.3. Importación/Exportación Excel
- **Nombre:** `exportToExcel` y `processSheetImport`.
- **¿Cómo lo hace?** Usa la librería `XLSX` (SheetJS).
    - **Exportar:** Construye un libro de trabajo virtual (`book_new`), crea una hoja con estilos (`aoa_to_sheet` con objetos de estilo) y descarga el archivo.
    - **Importar:** Lee el archivo binario, convierte la hoja a JSON (`sheet_to_json`) y luego "mapea" las filas a la estructura de datos interna buscando palabras clave como "Anden" o "Patio".
- **¿Por qué?** Permite respaldar datos y generar reportes físicos o compartibles, crucial para la operación logística.

### 4.4. Modals y Edición
- **Nombre:** `handleSave`, `handleClean`, `handleSlotClick`.
- **¿Cómo lo hace?**
    - Al hacer clic en una tarjeta, copia sus datos a un estado temporal `formData`.
    - El modal lee `formData`.
    - Al guardar, valida (ej. sellos obligatorios) y actualiza el estado `inventory` inmutablemente.
- **¿Por qué?** Separa la visualización de la edición para mantener la interfaz limpia y evitar ediciones accidentales.

---

## 5. Estilos y Animaciones

**Tecnología:** Tailwind CSS + CSS Nativo (`<style>`).

**Animaciones Personalizadas:**
- `fadeIn`, `slideUp`, `scaleIn`: Definidas en el bloque `<style>` del `<head>`.
- **Uso:** Se aplican a las tarjetas y modales para dar una sensación de fluidez y "calidad premium".
- **Mobile Sheet:** Animaciones específicas (`slideUpMobile`) para que el modal parezca una "hoja" que sube desde abajo en móviles, imitando apps nativas.

## 6. Referencia Rápida de Archivos/Recursos

| Recurso | Propósito | Origen |
| :--- | :--- | :--- |
| `tailwind.config` | Configura colores corporativos (`lake-light`, `lake-dark`) y fuentes. | Script en `<head>` |
| `lucide-react` | Provee los iconos (Camión, Caja, Sol, Luna, etc.). | Importado de `esm.sh` |
| `xlsx-js-style` | Maneja la lectura/escritura de Excel con soporte de estilos. | CDN en `<head>` |
