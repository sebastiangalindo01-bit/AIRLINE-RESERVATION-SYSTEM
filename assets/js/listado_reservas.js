const RESERVA_CONFIRMADA_KEY = "reservaConfirmada";
const RESERVA_DETALLE_KEY = "reservaDetalle";
const RESERVAS_CANCELADAS_KEY = "reservasCanceladas";

const RESERVAS_DE_EJEMPLO = [
    {
        id: "ARS-RSV-2401",
        codigo: "ARS-RSV-2401",
        ruta: "Bogotá - Cartagena",
        estado: "confirmada",
        fecha: "2026-04-08T10:15:00",
        total: 298500,
        moneda: "COP",
        tiquetes: [
            {
                asiento: "12A",
                clase: "Económica",
                precio: 298500
            }
        ]
    },
    {
        id: "ARS-RSV-2402",
        codigo: "ARS-RSV-2402",
        ruta: "Medellín - San Andrés",
        estado: "pendiente",
        fecha: "2026-04-11T16:40:00",
        total: 452300,
        moneda: "COP",
        tiquetes: [
            {
                asiento: "07C",
                clase: "Económica",
                precio: 226150
            },
            {
                asiento: "07D",
                clase: "Económica",
                precio: 226150
            }
        ]
    },
    {
        id: "ARS-RSV-2403",
        codigo: "ARS-RSV-2403",
        ruta: "Cali - Miami",
        estado: "cancelada",
        fecha: "2026-03-29T08:25:00",
        total: 1348000,
        moneda: "COP",
        tiquetes: [
            {
                asiento: "03F",
                clase: "Ejecutiva",
                precio: 1348000
            }
        ]
    }
];

function formatearFechaReserva(valor) {
    if (!valor) {
        return "No disponible";
    }

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
        return "No disponible";
    }

    return fecha.toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatearMoneda(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Number(valor) || 0);
}

function obtenerCodigosCancelados() {
    const valor = sessionStorage.getItem(RESERVAS_CANCELADAS_KEY);
    if (!valor) {
        return [];
    }

    try {
        const codigos = JSON.parse(valor);
        return Array.isArray(codigos) ? codigos : [];
    } catch (error) {
        console.warn("No fue posible leer reservas canceladas:", error);
        return [];
    }
}

function aplicarCancelaciones(reservas) {
    const canceladas = obtenerCodigosCancelados();
    if (canceladas.length === 0) {
        return reservas;
    }

    return reservas.map((reserva) => {
        if (canceladas.includes(reserva.codigo)) {
            return {
                ...reserva,
                estado: "cancelada"
            };
        }
        return reserva;
    });
}

function obtenerReservaConfirmada() {
    const textoReserva = sessionStorage.getItem(RESERVA_CONFIRMADA_KEY);
    if (!textoReserva) {
        return null;
    }

    try {
        const reserva = JSON.parse(textoReserva);
        if (!reserva || typeof reserva !== "object") {
            return null;
        }

        const vuelo = reserva.vuelo || {};
        const pasajero = reserva.pasajero || {};
        const subtotal = Number(reserva.resumenPago?.subtotal ?? vuelo.precioBase ?? 0);
        const total = Number(reserva.resumenPago?.total ?? reserva.resumenPago?.subtotal ?? subtotal);

        return {
            id: "ARS-RSV-CONF-001",
            codigo: vuelo.codigoVuelo || "ARS-RSV-CONF-001",
            ruta: `${vuelo.ciudadOrigen || "Origen"} - ${vuelo.ciudadDestino || "Destino"}`,
            estado: "confirmada",
            fecha: reserva.fechaConfirmacion || reserva.fechaCreacion || new Date().toISOString(),
            total,
            moneda: "COP",
            pasajero: `${pasajero.nombres || ""} ${pasajero.apellidos || ""}`.trim() || "No disponible",
            tiquetes: [
                {
                    asiento: "Asignado en check-in",
                    clase: "Económica",
                    precio: total
                }
            ]
        };
    } catch (error) {
        console.warn("No fue posible leer la reserva confirmada:", error);
        return null;
    }
}

function obtenerReservas() {
    const reservaConfirmada = obtenerReservaConfirmada();
    const reservas = [...RESERVAS_DE_EJEMPLO];

    if (reservaConfirmada) {
        reservas.unshift(reservaConfirmada);
    }

    return aplicarCancelaciones(reservas);
}

function obtenerClaseEstado(estado) {
    switch (estado) {
        case "confirmada":
            return "estado-confirmada";
        case "pendiente":
            return "estado-pendiente";
        case "cancelada":
            return "estado-cancelada";
        case "usada":
            return "estado-usada";
        default:
            return "estado-pendiente";
    }
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function renderizarResumenes(reservas) {
    const total = reservas.length;
    const confirmadas = reservas.filter((reserva) => reserva.estado === "confirmada").length;
    const pendientes = reservas.filter((reserva) => reserva.estado === "pendiente").length;
    const canceladas = reservas.filter((reserva) => reserva.estado === "cancelada").length;

    const resumenes = {
        totalReservas: total,
        reservasConfirmadas: confirmadas,
        reservasPendientes: pendientes,
        reservasCanceladas: canceladas,
        resumenCarga: `${total} registro${total === 1 ? "" : "s"}`
    };

    Object.entries(resumenes).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    });
}

function crearFilaReserva(reserva) {
    const claseEstado = obtenerClaseEstado(reserva.estado);

    return `
        <tr>
            <td>
                <span class="reserva-codigo">${reserva.codigo}</span>
            </td>
            <td>
                <span class="reserva-ruta">${reserva.ruta}</span>
            </td>
            <td>
                <span class="estado-reserva ${claseEstado}">${capitalizar(reserva.estado)}</span>
            </td>
            <td class="fecha-reserva">${formatearFechaReserva(reserva.fecha)}</td>
            <td class="total-reserva">${formatearMoneda(reserva.total)}</td>
            <td>
                <button type="button" class="btn btn-outline-primary btn-sm btn-ver-detalle" data-reserva-codigo="${reserva.codigo}">
                    Ver detalle
                </button>
            </td>
        </tr>
    `;
}

function renderizarReservas() {
    const reservas = obtenerReservas();
    const contenedor = document.getElementById("reservasTableBody");

    if (!contenedor) {
        return;
    }

    renderizarResumenes(reservas);

    if (reservas.length === 0) {
        contenedor.innerHTML = `
            <tr class="empty-row">
                <td colspan="6" class="empty-message">
                    <span class="empty-icon" aria-hidden="true">📋</span>
                    <span>No hay reservas para mostrar.</span>
                </td>
            </tr>
        `;
        return;
    }

    contenedor.innerHTML = reservas.map(crearFilaReserva).join("");

    document.querySelectorAll(".btn-ver-detalle").forEach((boton) => {
        boton.addEventListener("click", () => {
            const codigo = boton.getAttribute("data-reserva-codigo");
            const reservaSeleccionada = reservas.find((reserva) => reserva.codigo === codigo);

            if (!reservaSeleccionada) {
                return;
            }

            sessionStorage.setItem(RESERVA_DETALLE_KEY, JSON.stringify(reservaSeleccionada));
            window.location.href = "detalle_reserva.html";
        });
    });
}

document.addEventListener("DOMContentLoaded", renderizarReservas);