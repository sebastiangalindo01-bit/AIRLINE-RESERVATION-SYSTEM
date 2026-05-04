-- =====================================================
-- SCRIPT SQL — Base de datos reservas y tiquetes
-- ARS-38: Base de datos reservas y tiquetes
-- Base de datos: PostgreSQL (Supabase)
-- =====================================================

-- =====================================================
-- 1. TABLA: clientes
-- =====================================================
CREATE TABLE IF NOT EXISTS clientes (
    id                    SERIAL PRIMARY KEY,
    tipo_documento        VARCHAR(50)  NOT NULL,
    numero_identificacion VARCHAR(20)  NOT NULL UNIQUE,
    nombres               VARCHAR(100) NOT NULL,
    apellidos             VARCHAR(100) NOT NULL,
    correo_electronico    VARCHAR(150) NOT NULL UNIQUE,
    telefono              VARCHAR(20)  NOT NULL,
    telefono_alterno      VARCHAR(20),
    direccion_residencia  VARCHAR(200),
    pais                  VARCHAR(100),
    estado_provincia      VARCHAR(100),
    ciudad                VARCHAR(100),
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. TABLA: vuelos
-- =====================================================
CREATE TABLE IF NOT EXISTS vuelos (
    id               SERIAL PRIMARY KEY,
    codigo_vuelo     VARCHAR(20)      NOT NULL UNIQUE,
    ciudad_origen    VARCHAR(100)     NOT NULL,
    ciudad_destino   VARCHAR(100)     NOT NULL,
    fecha_salida     DATE             NOT NULL,
    hora_salida      TIME             NOT NULL,
    fecha_llegada    DATE             NOT NULL,
    hora_llegada     TIME             NOT NULL,
    capacidad        INTEGER          NOT NULL CHECK (capacidad > 0),
    precio_base      NUMERIC(12, 2)   NOT NULL CHECK (precio_base > 0),
    estado           VARCHAR(30)      NOT NULL DEFAULT 'Programado'
                         CHECK (estado IN ('Programado', 'Abordando', 'Demorado', 'Cancelado', 'Completado')),
    imagen           TEXT,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. TABLA: reservas
-- Relación: cliente → reservas (1 cliente, muchas reservas)
-- Relación: vuelo  → reservas (1 vuelo,  muchas reservas)
-- =====================================================
CREATE TABLE IF NOT EXISTS reservas (
    id                SERIAL PRIMARY KEY,
    codigo_reserva    VARCHAR(20)    NOT NULL UNIQUE,
    cliente_id        INTEGER        NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    vuelo_id          INTEGER        NOT NULL REFERENCES vuelos(id)   ON DELETE CASCADE,
    fecha_reserva     TIMESTAMP      NOT NULL DEFAULT NOW(),
    numero_pasajeros  INTEGER        NOT NULL DEFAULT 1 CHECK (numero_pasajeros > 0),
    precio_total      NUMERIC(12, 2) NOT NULL CHECK (precio_total > 0),
    estado            VARCHAR(30)    NOT NULL DEFAULT 'Pendiente'
                          CHECK (estado IN ('Pendiente', 'Confirmada', 'Cancelada', 'Completada')),
    observaciones     TEXT,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. TABLA: tiquetes
-- Relación: reserva → tiquetes (1 reserva, muchos tiquetes)
-- =====================================================
CREATE TABLE IF NOT EXISTS tiquetes (
    id                    SERIAL PRIMARY KEY,
    codigo_tiquete        VARCHAR(20)    NOT NULL UNIQUE,
    reserva_id            INTEGER        NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    nombre_pasajero       VARCHAR(200)   NOT NULL,
    tipo_documento        VARCHAR(50)    NOT NULL,
    numero_documento      VARCHAR(20)    NOT NULL,
    asiento               VARCHAR(10),
    clase                 VARCHAR(20)    NOT NULL DEFAULT 'Economica'
                              CHECK (clase IN ('Economica', 'Ejecutiva', 'Primera')),
    precio                NUMERIC(12, 2) NOT NULL CHECK (precio > 0),
    estado                VARCHAR(30)    NOT NULL DEFAULT 'Activo'
                              CHECK (estado IN ('Activo', 'Usado', 'Cancelado')),
    fecha_emision         TIMESTAMP      NOT NULL DEFAULT NOW(),
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. ÍNDICES para mejorar rendimiento
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_reservas_cliente  ON reservas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_reservas_vuelo    ON reservas(vuelo_id);
CREATE INDEX IF NOT EXISTS idx_tiquetes_reserva  ON tiquetes(reserva_id);
CREATE INDEX IF NOT EXISTS idx_reservas_codigo   ON reservas(codigo_reserva);
CREATE INDEX IF NOT EXISTS idx_tiquetes_codigo   ON tiquetes(codigo_tiquete);

-- =====================================================
-- 6. DATOS DE PRUEBA — clientes
-- =====================================================
INSERT INTO clientes (tipo_documento, numero_identificacion, nombres, apellidos, correo_electronico, telefono, telefono_alterno, direccion_residencia, pais, estado_provincia, ciudad)
VALUES
  ('Cédula de Ciudadanía', '1002456789', 'Juan Pablo',   'García López',   'juan.garcia@gmail.com',    '3114567890', NULL,         'Calle 45 #12-34',       'Colombia', 'Antioquia',    'Medellín'),
  ('Pasaporte',            'A1234567',   'María Fernanda','Ruiz Gómez',     'maria.ruiz@gmail.com',     '3009876543', '3151234567', 'Carrera 10 #20-30',     'Colombia', 'Cundinamarca', 'Bogotá'),
  ('Cédula de Ciudadanía', '1023456780', 'Carlos Andrés', 'Mendoza Pérez',  'carlos.mendoza@gmail.com', '3206547891', NULL,         'Avenida Principal 123', 'España',   'Madrid',       'Madrid'),
  ('Cédula de Ciudadanía', '1019876543', 'Laura Sofía',   'Torres Díaz',    'laura.torres@gmail.com',   '3027788990', '3011122233', 'Rua Augusta 456',       'Brasil',   'Sao Paulo',    'São Paulo')
ON CONFLICT (numero_identificacion) DO NOTHING;

-- =====================================================
-- 7. DATOS DE PRUEBA — vuelos
-- =====================================================
INSERT INTO vuelos (codigo_vuelo, ciudad_origen, ciudad_destino, fecha_salida, hora_salida, fecha_llegada, hora_llegada, capacidad, precio_base, estado)
VALUES
  ('AA100', 'Bogotá', 'Cartagena',   '2026-04-10', '08:00', '2026-04-10', '10:30', 150, 250000, 'Programado'),
  ('AA101', 'Bogotá', 'Medellín',    '2026-04-10', '14:30', '2026-04-10', '16:15', 180, 180000, 'Programado'),
  ('AA102', 'Bogotá', 'Santa Marta', '2026-04-11', '09:00', '2026-04-11', '11:00', 120, 220000, 'Programado')
ON CONFLICT (codigo_vuelo) DO NOTHING;

-- =====================================================
-- 8. DATOS DE PRUEBA — reservas
-- =====================================================
INSERT INTO reservas (codigo_reserva, cliente_id, vuelo_id, numero_pasajeros, precio_total, estado)
VALUES
  ('RES-001', 1, 1, 2, 500000, 'Confirmada'),
  ('RES-002', 2, 2, 1, 180000, 'Pendiente'),
  ('RES-003', 3, 3, 3, 660000, 'Confirmada')
ON CONFLICT (codigo_reserva) DO NOTHING;

-- =====================================================
-- 9. DATOS DE PRUEBA — tiquetes
-- =====================================================
INSERT INTO tiquetes (codigo_tiquete, reserva_id, nombre_pasajero, tipo_documento, numero_documento, asiento, clase, precio, estado)
VALUES
  ('TIQ-001', 1, 'Juan Pablo García López',    'Cédula de Ciudadanía', '1002456789', '12A', 'Economica', 250000, 'Activo'),
  ('TIQ-002', 1, 'Acompañante García',         'Cédula de Ciudadanía', '1002456700', '12B', 'Economica', 250000, 'Activo'),
  ('TIQ-003', 2, 'María Fernanda Ruiz Gómez',  'Pasaporte',            'A1234567',   '5C',  'Ejecutiva', 180000, 'Activo'),
  ('TIQ-004', 3, 'Carlos Andrés Mendoza Pérez','Cédula de Ciudadanía', '1023456780', '8D',  'Economica', 220000, 'Activo')
ON CONFLICT (codigo_tiquete) DO NOTHING;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================