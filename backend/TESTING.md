# Punto 3: Probar Consulta desde el Backend

## Prerequisitos

- PostgreSQL 12+ instalado y ejecutándose
- Node.js 16+ instalado
- npm instalado

## Pasos para Probar

### 1. Configurar la Base de Datos

#### Crear la base de datos:
```bash
# Usando psql
psql -U postgres
CREATE DATABASE airline_reservation_system;
\q
```

#### Ejecutar script SQL:
```bash
# Desde el directorio backend/
psql -U postgres -d airline_reservation_system -f database/init.sql
```

**Resultado esperado:**
```
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
 count
-------
     8
(1 row)
```

### 2. Configurar Variables de Entorno

Crear archivo `.env` en `backend/`:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```
PGHOST=localhost
PGPORT=5432
PGDATABASE=airline_reservation_system
PGUSER=postgres
PGPASSWORD=tu_contraseña
PGSSL=false
```

### 3. Instalar Dependencias

```bash
cd backend
npm install
```

### 4. Prueba 1: Verificar Conexión a BD

```bash
npm run db:test
```

**Resultado esperado:**
```
Conexión a PostgreSQL establecida correctamente.
Hora del servidor: 2026-05-04T15:30:45.123Z
```

### 5. Prueba 2: Ejecutar Script de Prueba de Consultas

```bash
node src/scripts/test-vuelos-query.js
```

**Resultado esperado:**
```
============================================================
PRUEBA DE CONSULTAS DE VUELOS - BACKEND
============================================================

📋 Prueba 1: Obtener todos los vuelos
------------------------------------------------------------
✓ Se encontraron 8 vuelos
  Primero: AA100 (Bogotá → Cartagena)
  Último: AA107 (Bogotá → Bucaramanga)

📋 Prueba 2: Obtener vuelo por ID
------------------------------------------------------------
✓ Vuelo encontrado: AA100
  Ruta: Bogotá → Cartagena
  Fecha: 2026-04-10 08:00:00
  Precio: $250000.00

📋 Prueba 3: Filtrar vuelos por origen (Bogotá)
------------------------------------------------------------
✓ Se encontraron 6 vuelos desde Bogotá
  - AA100: Bogotá → Cartagena
  - AA101: Bogotá → Medellín
  - AA102: Bogotá → Santa Marta

📋 Prueba 4: Filtrar vuelos por destino (Medellín)
------------------------------------------------------------
✓ Se encontraron 1 vuelos hacia Medellín
  - AA101: Bogotá → Medellín

📋 Prueba 5: Filtrar vuelos por fecha (2026-04-10)
------------------------------------------------------------
✓ Se encontraron 7 vuelos en 2026-04-10
  - AA100: Salida 08:00:00
  - AA101: Salida 14:30:00
  - AA103: Salida 14:00:00

📋 Prueba 6: Filtro combinado (origen=Bogotá, destino=Cartagena)
------------------------------------------------------------
✓ Se encontraron 1 vuelos
  - AA100: 2026-04-10 08:00:00 - Precio: $250000.00

============================================================
✓ Todas las pruebas completadas exitosamente
============================================================
```

### 6. Prueba 3: Iniciar el Servidor

```bash
npm start
```

**Resultado esperado:**
```
Verificando conexión a la base de datos...
✓ Conexión a PostgreSQL establecida
✓ Servidor iniciado en puerto 3000
  → http://localhost:3000
  → GET http://localhost:3000/api/vuelos
  → GET http://localhost:3000/health
```

### 7. Prueba 4: Probar Endpoints HTTP

En otra terminal, hacer peticiones HTTP:

```bash
# Obtener todos los vuelos
curl http://localhost:3000/api/vuelos

# Obtener vuelo por ID
curl http://localhost:3000/api/vuelos/1

# Filtrar vuelos
curl "http://localhost:3000/api/vuelos?origen=Bogot%C3%A1&destino=Medell%C3%ADn"

# Filtrar por fecha
curl "http://localhost:3000/api/vuelos?fecha=2026-04-10"

# Health check
curl http://localhost:3000/health
```

## Respuesta Esperada

### GET /api/vuelos
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo_vuelo": "AA100",
      "ciudad_origen": "Bogotá",
      "ciudad_destino": "Cartagena",
      "fecha_salida": "2026-04-10",
      "hora_salida": "08:00:00",
      "fecha_llegada": "2026-04-10",
      "hora_llegada": "10:30:00",
      "capacidad": 150,
      "precio_base": "250000.00",
      "estado": "Programado",
      "imagen": "https://via.placeholder.com/300x200?text=AV+Bogota-Cartagena"
    }
  ],
  "count": 8
}
```

### GET /api/vuelos/1
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo_vuelo": "AA100",
    "ciudad_origen": "Bogotá",
    "ciudad_destino": "Cartagena",
    "fecha_salida": "2026-04-10",
    "hora_salida": "08:00:00",
    "fecha_llegada": "2026-04-10",
    "hora_llegada": "10:30:00",
    "capacidad": 150,
    "precio_base": "250000.00",
    "estado": "Programado",
    "imagen": "https://via.placeholder.com/300x200?text=AV+Bogota-Cartagena"
  }
}
```

## Solución de Problemas

### Error: "No se reconoce como nombre de un cmdlet"
- Usar bash en lugar de PowerShell si estás en Windows
- O usar: `node src/scripts/test-vuelos-query.js`

### Error: "ECONNREFUSED - PostgreSQL no disponible"
1. Verificar que PostgreSQL está corriendo: `psql -U postgres`
2. Revisar credenciales en `.env`
3. Confirmar que la base de datos existe: `psql -U postgres -l | grep airline`

### Error: "Error al consultar vuelos"
1. Verificar que el script SQL fue ejecutado: `psql -U postgres -d airline_reservation_system -c "SELECT * FROM vuelos;"`
2. Confirmar que la tabla existe y tiene datos

## Archivos Creados

- `database/init.sql` - Script SQL para crear tabla e insertar datos
- `src/scripts/test-vuelos-query.js` - Script de prueba de consultas
- Este archivo: `TESTING.md`
