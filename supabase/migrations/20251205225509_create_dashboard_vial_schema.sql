/*
  # Dashboard Vial - Esquema inicial

  ## Descripción
  Sistema de gestión para educación y sensibilización vial con autenticación por roles.

  ## 1. Nuevas Tablas
  
  ### `user_roles`
  Almacena los roles de usuarios del sistema (admin, recepcion)
  - `id` (uuid, primary key)
  - `user_id` (uuid, referencia a auth.users)
  - `role` (text, solo permite 'admin' o 'recepcion')
  - `created_at` (timestamptz)

  ### `cities`
  Gestión de ciudades/sedes activas
  - `id` (uuid, primary key)
  - `name` (text, nombre de la ciudad)
  - `code` (text, código único de ciudad)
  - `is_active` (boolean, indica si está activa)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `reservations`
  Registro de reservas para educación vial
  - `id` (uuid, primary key)
  - `full_name` (text, nombre completo del ciudadano)
  - `id_number` (text, número de identificación)
  - `citation_number` (text, número de citación)
  - `appointment_date` (date, fecha de la cita)
  - `appointment_time` (time, hora de la cita)
  - `city_id` (uuid, referencia a cities)
  - `status` (text, estado: pending, completed, cancelled)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Seguridad (RLS)
  - Todas las tablas tienen RLS habilitado
  - Solo usuarios autenticados con roles válidos pueden acceder
  - Políticas separadas para SELECT, INSERT, UPDATE, DELETE
*/

-- Tabla de roles de usuario
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'recepcion')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);




-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Habilitar RLS en todas las tablas
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;


-- Políticas RLS para user_roles
CREATE POLICY "Usuarios autenticados pueden ver su propio rol"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins pueden ver todos los roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden insertar roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden actualizar roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden eliminar roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para cities
-- CREATE POLICY "Usuarios autenticados pueden ver ciudades"
--   ON cities FOR SELECT
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role IN ('admin', 'recepcion')
--     )
--   );

-- CREATE POLICY "Admins pueden insertar ciudades"
--   ON cities FOR INSERT
--   TO authenticated
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role = 'admin'
--     )
--   );

-- CREATE POLICY "Admins pueden actualizar ciudades"
--   ON cities FOR UPDATE
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role = 'admin'
--     )
--   )
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role = 'admin'
--     )
--   );

-- CREATE POLICY "Admins pueden eliminar ciudades"
--   ON cities FOR DELETE
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role = 'admin'
--     )
--   );

-- Políticas RLS para reservations
CREATE POLICY "Usuarios autenticados pueden ver reservas"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'recepcion')
    )
  );

-- CREATE POLICY "Usuarios autenticados pueden insertar reservas"
--   ON reservations FOR INSERT
--   TO authenticated
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role IN ('admin', 'recepcion')
--     )
--   );

CREATE POLICY "Usuarios autenticados pueden actualizar reservas"
  ON reservations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'recepcion')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'recepcion')
    )
  );

CREATE POLICY "Admins pueden eliminar reservas"
  ON reservations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_cities_updated_at ON cities;
CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
