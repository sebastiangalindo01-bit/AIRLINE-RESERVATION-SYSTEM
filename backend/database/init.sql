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
  ('AA103', 'Medellín', 'San Andrés', '2026-04-10', '14:00', '2026-04-10', '16:30', 100, 380000.00, 'Retrasado', 'https://via.placeholder.com/300x200?text=AV+Medellin-San+Andres'),
  ('AA104', 'Medellín', 'Miami', '2026-04-10', '19:30', '2026-04-11', '23:10', 150, 1280000.00, 'Programado', 'https://via.placeholder.com/300x200?text=AV+Medellin-Miami'),
  ('AA105', 'Cali', 'Bogotá', '2026-04-10', '09:00', '2026-04-10', '10:00', 130, 180000.00, 'Abordando', 'https://via.placeholder.com/300x200?text=AV+Cali-Bogota'),
  ('AA106', 'Bogotá', 'Barranquilla', '2026-04-10', '11:15', '2026-04-10', '12:45', 110, 210000.00, 'Cancelado', 'https://via.placeholder.com/300x200?text=AV+Bogota-Barranquilla'),
  ('AA107', 'Bogotá', 'Bucaramanga', '2026-04-10', '07:00', '2026-04-10', '08:05', 125, 195000.00, 'Programado', 'https://via.placeholder.com/300x200?text=AV+Bogota-Bucaramanga')
ON CONFLICT (codigo_vuelo) DO NOTHING;

-- Verificar datos insertados
SELECT COUNT(*) as total_vuelos FROM vuelos;
