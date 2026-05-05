# Punto 4: Retornar Datos en Formato Consumible

## Archivos Modificados/Creados

### Backend

1. **backend/src/utils/formatoAdapter.js** ✨ (NUEVO)
   - Convierte datos de BD (snake_case) a formato frontend (camelCase)
   - `convertirVueloAlFormato()` - Convierte un vuelo
   - `convertirVuelosAlFormato()` - Convierte un array de vuelos

2. **backend/src/routes/vuelos.js** (ACTUALIZADO)
   - Usa el adaptador para devolver datos en formato camelCase
   - Endpoints devuelven:
     - `GET /api/vuelos` - Lista de vuelos
     - `GET /api/vuelos?origen=X&destino=Y&fecha=Z` - Vuelos filtrados
     - `GET /api/vuelos/:id` - Vuelo específico

### Frontend

3. **assets/js/api-config.js** ✨ (NUEVO)
   - Configuración centralizada de la API
   - `API_CONFIG.BASE_URL` - URL del servidor (default: http://localhost:3000)
   - `llamarAPI()` - Función genérica para peticiones HTTP
   - `obtenerVuelos(filtros)` - Obtiene vuelos con filtros opcionales
   - `obtenerVueloPorId(id)` - Obtiene vuelo por ID

4. **assets/js/vuelos.js** (ACTUALIZADO)
   - `cargarVuelos()` ahora consume desde la API
   - `filtrarVuelos()` realiza búsquedas en el servidor
   - `mostrarCargando()` nuevo método para mostrar estado de carga
   - Mejor manejo de errores

5. **views/client/buscar_vuelos.html** (ACTUALIZADO)
   - Agregó `<script src="../../assets/js/api-config.js"></script>`
   - Antes de vuelos.js para que esté disponible

## Formato de Datos

### Entrada (BD - snake_case)
```json
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
  "imagen": "https://..."
}
```

### Salida (Frontend - camelCase)
```json
{
  "id": 1,
  "codigoVuelo": "AA100",
  "ciudadOrigen": "Bogotá",
  "ciudadDestino": "Cartagena",
  "fechaSalida": "2026-04-10",
  "horaSalida": "08:00:00",
  "fechaLlegada": "2026-04-10",
  "horaLlegada": "10:30:00",
  "capacidad": 150,
  "precioBase": "250000.00",
  "estado": "Programado",
  "imagen": "https://..."
}
```

## Configuración

### Para Desarrollo Local

**Backend (.env)**
```bash
PGHOST=localhost
PGPORT=5432
PGDATABASE=airline_reservation_system
PGUSER=postgres
PGPASSWORD=tu_contraseña
PGSSL=false
PORT=3000
```

**Frontend (assets/js/api-config.js)**
```javascript
BASE_URL: 'http://localhost:3000'
```

### Para Producción

Cambiar `API_CONFIG.BASE_URL` en `assets/js/api-config.js` a la URL del servidor en producción:
```javascript
BASE_URL: 'https://tu-dominio.com/api'
```

## Flujo de Datos

```
┌─────────────────────────────────────────────────────┐
│           FRONTEND (Cliente Web)                    │
│  ┌─────────────────────────────────────────────┐   │
│  │  buscar_vuelos.html                         │   │
│  │  ├─ api-config.js (configuración)           │   │
│  │  └─ vuelos.js (lógica de búsqueda)          │   │
│  └─────────────────────────────────────────────┘   │
│                     ↓ HTTP                          │
│                  Fetch API                          │
│                     ↓                               │
└─────────────────────────────────────────────────────┘
              GET http://localhost:3000/api/vuelos
                GET .../api/vuelos?origen=X...
                     ↓
┌─────────────────────────────────────────────────────┐
│           BACKEND (Servidor Node.js)                │
│  ┌─────────────────────────────────────────────┐   │
│  │  server.js (Express)                        │   │
│  │  ├─ routes/vuelos.js                        │   │
│  │  │  ├─ GET / (lista o filtro)               │   │
│  │  │  └─ GET /:id (vuelo específico)          │   │
│  │  ├─ services/vuelosService.js               │   │
│  │  │  ├─ obtenerTodosVuelos()                 │   │
│  │  │  ├─ obtenerVueloPorId()                  │   │
│  │  │  └─ filtrarVuelos()                      │   │
│  │  ├─ utils/formatoAdapter.js                 │   │
│  │  │  └─ Convierte snake_case → camelCase     │   │
│  │  └─ config/database.js (PostgreSQL)         │   │
│  └─────────────────────────────────────────────┘   │
│                     ↓                               │
│              PostgreSQL BD                         │
│              Tabla: vuelos                         │
│                     ↑                               │
└─────────────────────────────────────────────────────┘
                     ↓ JSON
            {success, data, count}
                     ↓
            Frontend renderiza
              resultados
```

## Pruebas

### 1. Verificar servidor ejecutándose
```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{"status":"ok","timestamp":"2026-05-04T15:30:00.000Z"}
```

### 2. Obtener todos los vuelos
```bash
curl http://localhost:3000/api/vuelos
```

### 3. Filtrar vuelos
```bash
curl "http://localhost:3000/api/vuelos?origen=Bogot%C3%A1"
curl "http://localhost:3000/api/vuelos?destino=Medell%C3%ADn"
curl "http://localhost:3000/api/vuelos?fecha=2026-04-10"
```

### 4. Obtener vuelo específico
```bash
curl http://localhost:3000/api/vuelos/1
```

## Problemas Comunes

### Error: "Failed to fetch - CORS Error"
**Solución:** El servidor backend tiene CORS habilitado. Asegurate que:
1. El servidor está ejecutándose: `npm start` en `backend/`
2. La URL en `api-config.js` es correcta
3. El frontend está en un navegador (no file://)

### Error: "Cannot find module"
**Solución:** Instalar dependencias:
```bash
cd backend
npm install
```

### Error: "Conexión rechazada (ECONNREFUSED)"
**Solución:** El servidor no está ejecutándose:
```bash
cd backend
npm start
```

## Próximos Pasos Sugeridos

1. Agregar validación de entrada en el backend
2. Implementar paginación en endpoints
3. Agregar caching de resultados
4. Crear endpoints adicionales (crear, actualizar, eliminar vuelos)
5. Implementar autenticación

## Archivos del Proyecto

```
AIRLINE-RESERVATION-SYSTEM/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── routes/
│   │   │   └── vuelos.js (ACTUALIZADO)
│   │   ├── services/
│   │   │   └── vuelosService.js
│   │   ├── utils/
│   │   │   └── formatoAdapter.js (NUEVO)
│   │   └── scripts/
│   │       ├── test-db-connection.js
│   │       └── test-vuelos-query.js
│   ├── database/
│   │   └── init.sql
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── TESTING.md
│
├── assets/js/
│   ├── api-config.js (NUEVO)
│   └── vuelos.js (ACTUALIZADO)
│
├── views/client/
│   └── buscar_vuelos.html (ACTUALIZADO)
│
└── data/
    └── vuelos.json (ya no se usa en buscar_vuelos.html)
```
