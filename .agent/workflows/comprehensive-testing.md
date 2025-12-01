---
description: Comprehensive testing workflow for Lakeness Web App
---

# Comprehensive Testing Workflow

Este workflow debe ejecutarse **cada vez que se integre, elimine o modifique funcionalidad** en la aplicación Lakeness.

## Cuándo Ejecutar

- ✅ Después de agregar nuevas funcionalidades
- ✅ Después de eliminar código o funcionalidades
- ✅ Después de refactorizar código
- ✅ Después de optimizaciones de performance
- ✅ Antes de publicar cambios a producción
- ✅ Después de actualizar dependencias

## Pruebas a Realizar

### 1. Prueba de Carga Inicial
```
- Abrir index.html en navegador
- Verificar que la página carga sin errores
- Verificar que todos los estilos se aplican correctamente
- Verificar que las tarjetas de inventario son visibles
- Capturar screenshot de carga inicial
- Revisar consola para errores críticos
```

### 2. Prueba de Tema (Dark/Light Mode)
```
- Click en botón de tema (Sun/Moon icon)
- Verificar cambio a dark mode
- Click nuevamente para volver a light mode
- Verificar que el tema persiste en localStorage
- Capturar screenshots de ambos modos
```

### 3. Prueba de Navegación de Turnos
```
- Click en "Turno 2"
- Verificar que los datos cambian
- Click en "Turno 3"
- Verificar que los datos cambian
- Regresar a "Turno 1"
- Verificar que los datos son independientes por turno
```

### 4. Prueba de Pestañas (Andenes/Patio)
```
- Click en "Patio de Maniobras (20)"
- Verificar que aparecen 20 tarjetas
- Click en "Andenes (18)"
- Verificar que aparecen 18 tarjetas
- Verificar transiciones animadas
```

### 5. Prueba de Modal de Edición
```
- Click en cualquier tarjeta (ej. Andén 1)
- Verificar que el modal abre correctamente
- Ingresar datos de prueba:
  * Económico: "TEST123"
  * Línea: "PRUEBA"
  * Seleccionar un status
- Click en "Guardar"
- Verificar que el modal cierra
- Verificar que los datos se guardaron en la tarjeta
- Verificar que el toast de confirmación aparece
```

### 6. Prueba de Validación de Sellos
```
- Click en una tarjeta
- Seleccionar status "Cargada" o "Frenteada"
- Dejar "Sello #2" vacío
- Intentar guardar
- Verificar que aparece alert de validación
- Llenar "Sello #2" con un valor (ej. "SEAL123")
- Guardar nuevamente
- Verificar que guarda exitosamente
```

### 7. Prueba de Limpieza de Slot
```
- Click en una tarjeta que tenga datos
- Click en botón "Limpiar"
- Verificar que el modal cierra
- Verificar que el slot se limpió completamente
- Verificar que aparece toast "Espacio Liberado"
```

### 8. Prueba de Consola
```
- Abrir DevTools > Console
- Revisar todos los logs
- Verificar que NO hay errores críticos
- Documentar warnings (si son esperados, indicarlo)
```

## Pruebas Adicionales (Opcionales pero Recomendadas)

### 9. Prueba de Import/Export Excel
```
- Click en botón de exportar (FileSpreadsheet icon)
- Verificar que se descarga archivo Excel
- Abrir archivo y verificar formato
- Click en botón de importar (Upload icon)
- Seleccionar archivo Excel válido
- Verificar que los datos se importan correctamente
```

### 10. Prueba de Limpieza Masiva
```
- Click en botón de limpieza (Eraser icon)
- Probar "Borrar Todo"
- Verificar confirmación
- Probar limpieza por turno individual
- Probar limpieza por sección (Andenes/Patio)
```

### 11. Prueba de Persistencia
```
- Agregar datos a varios slots
- Recargar la página (F5)
- Verificar que los datos persisten
- Verificar que el tema persiste
- Verificar que el turno activo persiste
```

### 12. Prueba de Responsive (Desktop)
```
- Redimensionar ventana a diferentes tamaños
- Verificar que el layout se adapta
- Verificar que no hay overflow horizontal
- Verificar que los elementos son accesibles
```

## Formato de Reporte

Después de completar las pruebas, crear un reporte con:

1. **Resumen Ejecutivo**
   - Estado general (PASADO/FALLIDO)
   - Número de pruebas ejecutadas
   - Número de pruebas pasadas
   - Errores críticos encontrados

2. **Resultados Detallados**
   - Para cada prueba: ✅ Pasada o ❌ Fallida
   - Screenshots de evidencia
   - Descripción de errores (si los hay)

3. **Análisis de Consola**
   - Errores críticos
   - Warnings (clasificar como críticos o no-críticos)
   - Recomendaciones

4. **Conclusión**
   - ¿La aplicación está lista para publicación?
   - Nivel de confianza (0-100%)
   - Próximos pasos recomendados

## Herramientas

- **Browser Automation** - Para ejecutar pruebas automáticamente
- **Screenshots** - Para evidencia visual
- **Console Logs** - Para detectar errores
- **Test Report** - Documento markdown con resultados

## Criterios de Aceptación

Para que las pruebas se consideren **PASADAS**, se debe cumplir:

- ✅ 0 errores críticos en consola
- ✅ Todas las funcionalidades principales funcionan
- ✅ Validaciones funcionan correctamente
- ✅ Persistencia de datos funciona
- ✅ Tema y navegación funcionan
- ✅ Estilo "Cozy y Aesthetic" preservado

## Notas Importantes

- **Warnings esperados con file://**
  - `postMessage` warnings son normales en desarrollo local
  - Tailwind JIT warnings son informativos
  
- **No ignorar errores críticos**
  - Cualquier error de JavaScript debe ser investigado
  - Errores de red pueden indicar problemas de CDN
  
- **Documentar todo**
  - Capturar screenshots de cada prueba
  - Guardar logs de consola
  - Crear reporte detallado

## Automatización Futura

Considerar implementar:
- Tests unitarios con Jest
- Tests E2E con Playwright/Cypress
- CI/CD pipeline con GitHub Actions
- Lighthouse CI para métricas de performance
