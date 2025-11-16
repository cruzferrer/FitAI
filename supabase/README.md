# Supabase Migrations & Database Setup

## Tabla: `user_progress`

### Descripción

La tabla `user_progress` persiste el progreso de cada usuario en su rutina de entrenamiento periodizada. Trackea:

- **week_index**: Índice actual de la semana (0-indexado)
- **day_index**: Índice actual del día dentro de la semana (0-indexado)
- **last_completed**: Fecha ISO (YYYY-MM-DD) del último entrenamiento completado

### Schema

```sql
CREATE TABLE user_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  week_index INT NOT NULL DEFAULT 0,
  day_index INT NOT NULL DEFAULT 0,
  last_completed DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Cómo crear la tabla

#### Opción 1: Usar Supabase Dashboard (UI)

1. Ve a [console.supabase.com](https://console.supabase.co)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el panel izquierdo
4. Crea una nueva query
5. Copia el contenido de `supabase/migrations/001_create_user_progress_table.sql`
6. Ejecuta (botón verde "RUN")

#### Opción 2: CLI de Supabase (si tienes instalado)

```bash
supabase migration new create_user_progress_table
# Copia el contenido de 001_create_user_progress_table.sql al archivo generado
supabase db push
```

#### Opción 3: Script directo (sin Supabase CLI)

```bash
# Requiere tener psql instalado y conexión a la BD
psql -h <HOST> -U postgres -d postgres -f supabase/migrations/001_create_user_progress_table.sql
```

### Políticas de Seguridad (RLS)

La tabla tiene Row Level Security (RLS) habilitada:

- ✅ Los usuarios pueden **ver** su propio progreso
- ✅ Los usuarios pueden **actualizar** su propio progreso
- ✅ Los usuarios pueden **insertar** su propio progreso
- ❌ Los usuarios NO pueden ver progreso de otros

### Triggers Automáticos

- **updated_at**: Se actualiza automáticamente cada vez que se modifica un registro

### Integración con la App

#### En el backend (Hook: `useWorkoutLogger.ts`)

Al finalizar un entrenamiento y "Guardar y Salir":

1. Se guarda el historial en `historial_sesiones`
2. Se llama `advanceProgress()` que:
   - Calcula el siguiente día/semana
   - Intenta hacer `upsert` en `user_progress` (tabla nueva)
   - Si OK en Supabase, actualiza `@FitAI_WorkoutProgress` localmente
   - Si falla en Supabase, **aborta y retorna null** (transaccional)

#### En el frontend (Hook: `useHomeScreenData.ts`)

- Lee `@FitAI_WorkoutProgress` de AsyncStorage
- Lo expone para que `app/(tabs)/index.tsx` use weekIndex/dayIndex

### Notas

- **Sincronización**: Cambios en Supabase (por ejemplo, desde otro dispositivo) se reflejan cuando el usuario abre la app (useFocusEffect en hooks).
- **Fallback local**: Si Supabase falla, la app sigue funcionando (se usa AsyncStorage local).
- **Carga initial**: En onboarding (`useOnboarding.ts`), se crea un registro inicial en `user_progress` con índices 0/0.

### Troubleshooting

**P: La tabla no aparece en el dashboard**
R: Ejecuta la migración SQL manualmente desde SQL Editor de Supabase.

**P: Los cambios de progreso no se guardan en Supabase**
R: Verifica:

1.  RLS está habilitado y usuario está autenticado
2.  El user_id en la tabla coincide con auth.users
3.  Revisa los logs en Supabase > Logs

**P: ¿Qué pasa si un usuario edita el progreso directamente en Supabase?**
R: La app respetará ese cambio cuando recargue. Es importante proteger con RLS (ya está hecho).
