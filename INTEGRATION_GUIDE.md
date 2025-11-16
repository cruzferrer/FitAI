# Guía de Integración: Avance Automático de Días en Entrenamiento

> **Fecha**: 15 de noviembre de 2025  
> **Estado**: ✅ Implementado (Pasos A–D completados)  
> **Rama**: test

## Resumen de Cambios

Se han implementado cambios para que el progreso del usuario en la rutina **avance automáticamente** al siguiente día cuando finaliza un entrenamiento. El avance se persiste tanto **localmente** (AsyncStorage) como **opcionalmente en backend** (Supabase).

### Cambios Realizados

#### 1. **Paso A: proximosDias cruzando semanas** ✅

**Archivo**: `app/(tabs)/index.tsx`

- **Qué**: Ahora la pantalla Home muestra los próximos 6 días, cruzando múltiples semanas si es necesario.
- **Por qué**: Mejor UX — el usuario ve su progresión de forma lineal, no reseteada por semana.
- **Cómo**: Función `getProximosDias()` que itera sobre semanas y acumula días hasta llenar 6 slots.

#### 2. **Paso B: Tabla `user_progress` en Supabase** ✅

**Archivos**:

- `supabase/migrations/001_create_user_progress_table.sql` (schema SQL)
- `supabase/README.md` (guía de setup)

- **Qué**: Tabla que persiste week_index, day_index, last_completed por usuario.
- **Por qué**: Sincronización entre dispositivos y análisis de histórico.
- **Seguridad**: Row Level Security (RLS) habilitado — cada usuario solo ve su datos.
- **Setup**: Ejecutar el SQL desde Supabase Dashboard > SQL Editor.

#### 3. **Paso D: Transaccionalidad en guardado** ✅

**Archivo**: `hooks/workout/useWorkoutLogger.ts`

- **Qué**: El flujo ahora es **local-first → backend → local-persist**:
  1. `saveWorkoutLog()` intenta guardar historial en Supabase (crítico).
  2. Si OK, `advanceProgress()` intenta hacer upsert en `user_progress` (transaccional).
  3. Solo si OK en backend, actualiza AsyncStorage localmente.
- **Por qué**: Evita inconsistencias — si Supabase falla, no avanzamos (no hay estado sucio).
- **Fallback**: Si no hay usuario autenticado o Supabase no está disponible, aborta con log (no crash).

#### 4. **Paso C: Test suite** ✅

**Archivo**: `scripts/test-progress-advancement.ts`

- **Qué**: Script que simula 5 escenarios de avance (día normal, fin de semana, fin de rutina, etc.).
- **Cómo ejecutar**:
  ```bash
  npx ts-node scripts/test-progress-advancement.ts
  ```
- **Verificación**: Confirma que transiciones de día/semana son correctas.

### Flujo de Ejecución

```
[Usuario completa entrenamiento y pulsa "Guardar y Salir"]
    ↓
[app/workout/index.tsx → handleFinish()]
    ↓
[saveWorkoutLog() → inserta en historial_sesiones]
    ├─→ ❌ Si falla: Muestra error, NO avanza. FIN.
    └─→ ✅ Si OK:
        ↓
    [advanceProgress() → calcula next day/week]
        ├─→ [upsert en user_progress (Supabase)]
        │   ├─→ ❌ Si falla: console.error(), retorna null. NO avanza.
        │   └─→ ✅ Si OK: continúa →
        │
        ├─→ [AsyncStorage.setItem(@FitAI_WorkoutProgress)]
        │   └─→ ✅ Progreso local guardado
        │
        └─→ Return newProgress

[router.back() → Vuelve al Home]
    ↓
[Home screen recarga useFocusEffect()]
    ↓
[Carga @FitAI_WorkoutProgress actualizado]
    ↓
[Muestra nuevo día actual y próximos 6 días]
```

## Archivos Modificados

| Archivo                                                  | Cambio        | Descripción                                         |
| -------------------------------------------------------- | ------------- | --------------------------------------------------- |
| `app/(tabs)/index.tsx`                                   | ✏️ Modificado | Usa progreso guardado + función `getProximosDias()` |
| `app/workout/index.tsx`                                  | ✏️ Modificado | Llama `advanceProgress()` tras guardar              |
| `hooks/workout/useWorkoutLogger.ts`                      | ✏️ Modificado | `advanceProgress()` transaccional (Supabase first)  |
| `hooks/tabs/useHomeScreenData.ts`                        | ✏️ Modificado | Expone `progress` desde AsyncStorage                |
| `supabase/migrations/001_create_user_progress_table.sql` | ✨ Nuevo      | Schema de tabla user_progress + RLS                 |
| `supabase/README.md`                                     | ✨ Nuevo      | Guía setup tabla + troubleshooting                  |
| `scripts/test-progress-advancement.ts`                   | ✨ Nuevo      | Test suite para validar lógica                      |

## Configuración Requerida

### 1. Base de Datos: Ejecutar Migración

```sql
-- En Supabase Dashboard > SQL Editor
-- Copiar y ejecutar: supabase/migrations/001_create_user_progress_table.sql
```

### 2. (Opcional) Crear tabla en onboarding

Modifica `hooks/auth/useOnboarding.ts` para crear registro inicial:

```typescript
// Después de generar rutina y guardar en AsyncStorage
const { error } = await supabase.from("user_progress").insert({
  user_id: userId,
  week_index: 0,
  day_index: 0,
  last_completed: null,
});
```

## Testing Manual

### Caso 1: Avance de día normal

1. Inicia sesión
2. Genera rutina (onboarding)
3. Entra a un entrenamiento
4. Completa y pulsa "Guardar y Salir"
5. ✅ El Home debe mostrar el SIGUIENTE día

### Caso 2: Avance de semana

1. Completa todos los días de la semana 1
2. ✅ El Home debe mostrar Semana 2, Día 1

### Caso 3: Sincronización multi-dispositivo

1. Completa entrenamiento en dispositivo A
2. Abre app en dispositivo B
3. ✅ El progreso debe estar actualizado (si está conectado a internet)

### Caso 4: Sin conexión

1. Desactiva internet
2. Completa entrenamiento y guarda
3. ✅ La app guarda localmente (AsyncStorage)
4. Reactiva internet
5. ✅ En siguiente apertura, sincroniza con Supabase

## Notas Importantes

### Seguridad

- ✅ RLS protege datos de otros usuarios
- ✅ Transaccionalidad evita estado inconsistente
- ✅ Validación de rutina antes de avanzar

### Performance

- ⚡ AsyncStorage es muy rápido (no bloqueante)
- ⚡ Supabase upsert es idempotente (seguro repetir)
- ⚡ `useFocusEffect` solo recarga datos cuando pantalla entra en foco

### Escalabilidad

- 📊 Tabla `user_progress` es simple y eficiente
- 📊 RLS + índice en user_id optimiza queries
- 📊 Compatible con Analytics futuro (tablas de historial ya existen)

## Troubleshooting

| Problema                       | Solución                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------ |
| El Home siempre muestra Día 1  | ✅ Verifica que `@FitAI_WorkoutProgress` está en AsyncStorage (usa DevTools)   |
| Progreso no avanza en backend  | ✅ Verifica que tabla `user_progress` existe (SQL migración ejecutada)         |
| "Error de DB" al guardar       | ✅ Verifica conexión a Supabase y permisos de usuario                          |
| Próximos días no cruzan semana | ✅ Verifica que la rutina tiene múltiples semanas (no es bug si solo 1 semana) |

## Referencias

- 📖 [Supabase Docs](https://supabase.com/docs)
- 📖 [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- 📖 [Expo Router](https://docs.expo.dev/routing/introduction/)

---

**¿Necesitas ayuda?**  
Revisa los logs en:

- Terminal: `console.log()` statements en hooks
- Supabase: Logs > Postgres logs
- AsyncStorage: Inspecciona con DevTools (Expo Go)
