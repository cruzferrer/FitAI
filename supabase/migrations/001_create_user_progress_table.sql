-- Tabla user_progress: trackea el progreso de cada usuario en su rutina
-- Creada el 2025-11-15 para persistir índices de semana/día y fecha de último entrenamiento completado

CREATE TABLE IF NOT EXISTS user_progress (
  -- Identificación
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Índices de progreso en la rutina periodizada
  week_index INT NOT NULL DEFAULT 0,
  day_index INT NOT NULL DEFAULT 0,

  -- Fecha del último entrenamiento completado (YYYY-MM-DD)
  last_completed DATE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para queries rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- RLS: Los usuarios solo pueden ver/actualizar su propio progreso
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_user_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_progress_updated_at_trigger
AFTER UPDATE ON user_progress
FOR EACH ROW
EXECUTE FUNCTION update_user_progress_updated_at();

-- Comentarios de documentación
COMMENT ON TABLE user_progress IS 'Persiste el progreso de cada usuario en la rutina (semana/día actual, última sesión completada)';
COMMENT ON COLUMN user_progress.week_index IS 'Índice de la semana actual en rutina_periodizada (0-indexado)';
COMMENT ON COLUMN user_progress.day_index IS 'Índice del día actual en dias array de la semana (0-indexado)';
COMMENT ON COLUMN user_progress.last_completed IS 'Fecha ISO (YYYY-MM-DD) del último entrenamiento completado';
