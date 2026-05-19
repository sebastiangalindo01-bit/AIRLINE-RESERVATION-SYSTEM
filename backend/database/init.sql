-- =====================================================
-- Script SQL para crear tabla de vuelos
-- Base de datos: airline_reservation_system
-- =====================================================

-- Crear tabla vuelos
CREATE TABLE IF NOT EXISTS vuelos (
  id SERIAL PRIMARY KEY,
  codigo_vuelo VARCHAR(10) NOT NULL UNIQUE,
  ciudad_origen VARCHAR(100) NOT NULL,
  ciudad_destino VARCHAR(100) NOT NULL,
  fecha_salida DATE NOT NULL,
  hora_salida TIME NOT NULL,
  fecha_llegada DATE NOT NULL,
  hora_llegada TIME NOT NULL,
  capacidad INTEGER NOT NULL,
  precio_base NUMERIC(10,2) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Programado',
  imagen TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_vuelos_origen ON vuelos(ciudad_origen);
CREATE INDEX IF NOT EXISTS idx_vuelos_destino ON vuelos(ciudad_destino);
CREATE INDEX IF NOT EXISTS idx_vuelos_fecha_salida ON vuelos(fecha_salida);
CREATE INDEX IF NOT EXISTS idx_vuelos_estado ON vuelos(estado);

-- =====================================================
-- Insertar datos de ejemplo
-- =====================================================

INSERT INTO vuelos (codigo_vuelo, ciudad_origen, ciudad_destino, fecha_salida, hora_salida, fecha_llegada, hora_llegada, capacidad, precio_base, estado, imagen)
VALUES 
  ('AA100', 'Bogotá', 'Cartagena', '2026-04-10', '08:00', '2026-04-10', '10:30', 150, 250000.00, 'Programado', 'https://via.placeholder.com/300x200?text=AV+Bogota-Cartagena'),
  ('AA101', 'Bogotá', 'Medellín', '2026-04-10', '14:30', '2026-04-10', '16:15', 180, 180000.00, 'Programado', 'https://via.placeholder.com/300x200?text=AV+Bogota-Medellin'),
  ('AA102', 'Bogotá', 'Santa Marta', '2026-04-11', '09:00', '2026-04-11', '11:00', 120, 220000.00, 'Programado', 'https://via.placeholder.com/300x200?text=AV+Bogota-Santa+Marta'),
  ('AA103', 'Medellín', 'San Andrés', '2026-04-10', '14:00', '2026-04-10', '16:30', 100, 380000.00, 'Cancelado', 'https://via.placeholder.com/300x200?text=AV+Medellin-San+Andres'),
  ('AA104', 'Medellín', 'Miami', '2026-04-10', '19:30', '2026-04-11', '23:10', 150, 1280000.00, 'Programado', 'https://via.placeholder.com/300x200?text=AV+Medellin-Miami'),
  ('AA105', 'Cali', 'Bogotá', '2026-04-10', '09:00', '2026-04-10', '10:00', 130, 180000.00, 'Abordando', 'https://via.placeholder.com/300x200?text=AV+Cali-Bogota'),
  ('AA106', 'Bogotá', 'Barranquilla', '2026-04-10', '11:15', '2026-04-10', '12:45', 110, 210000.00, 'Cancelado', 'https://via.placeholder.com/300x200?text=AV+Bogota-Barranquilla'),
  ('AA107', 'Bogotá', 'Bucaramanga', '2026-04-10', '07:00', '2026-04-10', '08:05', 125, 195000.00, 'Programado', 'https://via.placeholder.com/300x200?text=AV+Bogota-Bucaramanga')
ON CONFLICT (codigo_vuelo) DO NOTHING;

-- Verificar datos insertados
SELECT COUNT(*) as total_vuelos FROM vuelos;

-- =====================================================
-- Tablas para ubicaciones: paises, departamentos, ciudades
-- =====================================================

CREATE TABLE IF NOT EXISTS paises (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS departamentos (
  id SERIAL PRIMARY KEY,
  pais_id INTEGER NOT NULL REFERENCES paises(id) ON DELETE RESTRICT,
  nombre VARCHAR(150) NOT NULL,
  UNIQUE(pais_id, nombre)
);

CREATE TABLE IF NOT EXISTS ciudades (
  id SERIAL PRIMARY KEY,
  departamento_id INTEGER NOT NULL REFERENCES departamentos(id) ON DELETE RESTRICT,
  nombre VARCHAR(150) NOT NULL,
  UNIQUE(departamento_id, nombre)
);

-- =====================================================
-- Tabla clientes / usuarios (perfil y credenciales)
-- =====================================================

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  tipo_documento VARCHAR(50),
  numero_identificacion VARCHAR(100) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  apellido VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  telefono VARCHAR(50),
  telefono_alterno VARCHAR(50),
  direccion_residencia TEXT,
  pais_id INTEGER REFERENCES paises(id),
  departamento_id INTEGER REFERENCES departamentos(id),
  ciudad_id INTEGER REFERENCES ciudades(id),
  password_hash VARCHAR(200) NOT NULL,
  rol VARCHAR(30) NOT NULL DEFAULT 'CLIENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuarios administrativos (separados de clientes)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  nombre VARCHAR(150),
  apellido VARCHAR(150),
  email VARCHAR(200) UNIQUE,
  password_hash VARCHAR(200) NOT NULL,
  role VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Estados de reserva e historial
-- =====================================================

CREATE TABLE IF NOT EXISTS reservation_states (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Insertar estados por defecto
INSERT INTO reservation_states (nombre) VALUES
  ('Reservada'), ('Confirmada'), ('Cancelada'), ('Expirada')
ON CONFLICT (nombre) DO NOTHING;

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  vuelo_id INTEGER NOT NULL REFERENCES vuelos(id) ON DELETE RESTRICT,
  fecha_reserva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado_id INTEGER NOT NULL REFERENCES reservation_states(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservation_state_history (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  estado_id INTEGER NOT NULL REFERENCES reservation_states(id) ON DELETE RESTRICT,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  nota TEXT
);

-- =====================================================
-- Tiquetes
-- =====================================================

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  vuelo_id INTEGER NOT NULL REFERENCES vuelos(id) ON DELETE RESTRICT,
  numero_asiento VARCHAR(20),
  clase VARCHAR(50) NOT NULL,
  precio_final NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (vuelo_id, numero_asiento)
);

-- =====================================================
-- Paquetes turísticos y aplicabilidad
-- =====================================================

CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  precio NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado VARCHAR(30) NOT NULL DEFAULT 'Disponible',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla relacional para aplicar paquetes a destinos (pais/departamento/ciudad)
CREATE TABLE IF NOT EXISTS package_applicability (
  id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  pais_id INTEGER REFERENCES paises(id),
  departamento_id INTEGER REFERENCES departamentos(id),
  ciudad_id INTEGER REFERENCES ciudades(id),
  CHECK (pais_id IS NOT NULL OR departamento_id IS NOT NULL OR ciudad_id IS NOT NULL)
);

-- Asociar paquetes a reservas
CREATE TABLE IF NOT EXISTS reservation_packages (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  precio_aplicado NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Índices y comprobaciones útiles
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_reservations_cliente ON reservations(cliente_id);
CREATE INDEX IF NOT EXISTS idx_tickets_vuelo ON tickets(vuelo_id);
CREATE INDEX IF NOT EXISTS idx_packages_estado ON packages(estado);

-- =====================================================
-- Nota:
-- La lógica de negocio (transacciones para evitar overbooking,
-- control de asientos, cálculo de valor_total y creación de
-- entries en reservation_state_history) debe implementarse en
-- los servicios del backend usando transacciones en PG.
-- =====================================================
