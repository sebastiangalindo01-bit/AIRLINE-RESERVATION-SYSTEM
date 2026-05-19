-- Seed: crear SUPER_ADMIN en tabla clientes
-- Reemplaza <HASH> por el hash bcrypt que generaste localmente
-- Ejemplo de uso:
-- export DATABASE_URL="postgres://..."
-- psql "$DATABASE_URL" -f backend/database/seed_create_super_admin.sql

INSERT INTO clientes (
  tipo_documento,
  numero_identificacion,
  nombre,
  apellido,
  email,
  telefono,
  telefono_alterno,
  direccion_residencia,
  pais_id,
  departamento_id,
  ciudad_id,
  password_hash,
  rol
)
VALUES (
  'C.C.',
  '0000000000',
  'Admin',
  'Principal',
  'admin@example.com',
  '3000000000',
  NULL,
  'Ciudad Admin',
  NULL,
  NULL,
  NULL,
  '$2b$10$N.T5MrkRus/DpqsY1J2U.uIlVQs1AbbaY497SbL/6jFsCqWT8ys.u',
  'SUPER_ADMIN'
)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, rol = EXCLUDED.rol;

-- Verificación rápida
SELECT id, nombre, email, rol FROM clientes WHERE email = 'admin@example.com';
