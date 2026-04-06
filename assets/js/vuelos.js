// ========== BUSCAR VUELOS - LÓGICA PRINCIPAL ==========

class BuscadorVuelos {
    constructor() {
        this.vuelos = [];
        this.vuelosFiltrados = [];
        this.inicializar();
    }

    // Inicialización
    inicializar() {
        this.cargarVuelos();
        this.configurarEventos();
        this.mostrarVuelos(this.vuelos);
    }

    // Cargar vuelos desde el JSON
    cargarVuelos() {
        fetch('../../data/vuelos.json')
            .then(response => response.json())
            .then(datos => {
                this.vuelos = datos;
                this.mostrarVuelos(this.vuelos);
            })
            .catch(error => {
                console.error('Error al cargar vuelos:', error);
                this.mostrarError('No se pudieron cargar los vuelos');
            });
    }

    // Configurar eventos
    configurarEventos() {
        document.getElementById('btnBuscar').addEventListener('click', () => this.filtrarVuelos());
        
        // Permitir búsqueda al presionar Enter en campos
        document.getElementById('fechaSalida').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.filtrarVuelos();
        });
    }

    // Filtrar vuelos según criterios
    filtrarVuelos() {
        const origen = document.getElementById('origen').value.toLowerCase();
        const destino = document.getElementById('destino').value.toLowerCase();
        const fecha = document.getElementById('fechaSalida').value;

        this.vuelosFiltrados = this.vuelos.filter(vuelo => {
            const coincideOrigen = !origen || vuelo.ciudadOrigen.toLowerCase().includes(origen);
            const coincideDestino = !destino || vuelo.ciudadDestino.toLowerCase().includes(destino);
            const coincideFecha = !fecha || vuelo.fechaSalida === fecha;

            return coincideOrigen && coincideDestino && coincideFecha;
        });

        this.mostrarVuelos(this.vuelosFiltrados);
    }

    // Mostrar lista de vuelos
    mostrarVuelos(vuelos) {
        const contenedor = document.getElementById('listaVuelos');
        const contador = document.getElementById('contadorVuelos');

        contador.textContent = `${vuelos.length} vuelo${vuelos.length !== 1 ? 's' : ''} encontrado${vuelos.length !== 1 ? 's' : ''}`;

        if (vuelos.length === 0) {
            contenedor.innerHTML = `
                <div class="mensaje-vacio">
                    <p>No se encontraron vuelos con los criterios seleccionados</p>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = vuelos.map(vuelo => this.crearTarjetaVuelo(vuelo)).join('');

        // Agregar eventos a los botones de selección
        document.querySelectorAll('.btn-seleccionar-vuelo').forEach((btn, index) => {
            btn.addEventListener('click', () => this.seleccionarVuelo(vuelos[index]));
        });
    }

    // Crear tarjeta de vuelo
    crearTarjetaVuelo(vuelo) {
        const estado = this.obtenerEstadoBadge(vuelo.estado);
        const imagen = vuelo.imagen || '../../assets/images/default-flight.jpg';
        
        return `
            <div class="tarjeta-vuelo">
                <div class="contenido-vuelo">
                    <div class="ruta-vuelo">
                        <div class="ciudad-salida">
                            <span class="ciudad-nombre">${vuelo.ciudadOrigen}</span>
                            <span class="hora">${this.formatearHora(vuelo.horaSalida)}</span>
                            <span class="fecha">${this.formatearFecha(vuelo.fechaSalida)}</span>
                        </div>

                        <div class="duracion-vuelo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 12h18M15 6l6 6-6 6"/>
                            </svg>
                            <span class="duracion">2h 30m</span>
                        </div>

                        <div class="ciudad-llegada">
                            <span class="ciudad-nombre">${vuelo.ciudadDestino}</span>
                            <span class="hora">${this.formatearHora(vuelo.horaLlegada)}</span>
                            <span class="fecha">${this.formatearFecha(vuelo.fechaLlegada)}</span>
                        </div>
                    </div>

                    <div class="detalles-vuelo">
                        <div class="detalle">
                            <span class="etiqueta">Código</span>
                            <span class="valor">${vuelo.codigoVuelo}</span>
                        </div>
                        <div class="detalle">
                            <span class="etiqueta">Capacidad</span>
                            <span class="valor">${vuelo.capacidad} pasajeros</span>
                        </div>
                        <div class="detalle">
                            <span class="etiqueta">Estado</span>
                            <span class="badge ${estado}">${vuelo.estado}</span>
                        </div>
                    </div>

                    <div class="precio-vuelo">
                        <span class="etiqueta">Desde</span>
                        <span class="precio">${this.formatearMoneda(vuelo.precioBase)}</span>
                        <span class="por-pasajero">por pasajero</span>
                    </div>
                </div>

                <div class="acciones-vuelo">
                    <button class="btn btn-primary btn-seleccionar-vuelo">
                        Seleccionar
                    </button>
                </div>
            </div>
        `;
    }

    // Seleccionar vuelo
    seleccionarVuelo(vuelo) {
        // Guardar vuelo seleccionado en sessionStorage
        sessionStorage.setItem('vueloSeleccionado', JSON.stringify(vuelo));
        
        // Redirigir a crear reserva
        window.location.href = 'crear_reserva.html';
    }

    // Obtener clase CSS para badge de estado
    obtenerEstadoBadge(estado) {
        const estados = {
            'Programado': 'badge-info',
            'Abordando': 'badge-warning',
            'En vuelo': 'badge-success',
            'Finalizado': 'badge-success',
            'Cancelado': 'badge-danger'
        };
        return estados[estado] || 'badge-primary';
    }

    // Mostrar error
    mostrarError(mensaje) {
        const contenedor = document.getElementById('listaVuelos');
        contenedor.innerHTML = `
            <div class="alerta alerta-error">
                <p>${mensaje}</p>
            </div>
        `;
    }

    // Utilidades de formato
    formatearHora(hora) {
        return hora;
    }

    formatearFecha(fecha) {
        const date = new Date(fecha + 'T00:00:00');
        return date.toLocaleDateString('es-CO', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric'
        });
    }

    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    }
}

// Inicializar al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    new BuscadorVuelos();
});
