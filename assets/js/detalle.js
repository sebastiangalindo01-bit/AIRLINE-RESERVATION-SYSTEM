const RESERVA_DETALLE_KEY = "reservaDetalle";
const RESERVA_CONFIRMADA_KEY = "reservaConfirmada";
const RESERVAS_CANCELADAS_KEY = "reservasCanceladas";

let reservaActual = null;

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

function guardarCodigoCancelado(codigo) {
    if (!codigo) {
        return;
    }

    const codigos = obtenerCodigosCancelados();
    if (codigos.includes(codigo)) {
        return;
    }

    codigos.push(codigo);
    sessionStorage.setItem(RESERVAS_CANCELADAS_KEY, JSON.stringify(codigos));
}

function aplicarEstadoCancelado(reserva) {
    if (!reserva || !reserva.codigo) {
        return reserva;
    }

    const canceladas = obtenerCodigosCancelados();
    if (canceladas.includes(reserva.codigo)) {
        return {
            ...reserva,
            estado: "cancelada"
        };
    }

    return reserva;
}

function formatearFechaDetalle(valor) {
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

function construirTiquetesFallback(total) {
    return [
        {
            asiento: "Asignado en check-in",
            clase: "Económica",
            precio: Number(total) || 0
        }
    ];
}

function normalizarTiquetes(tiquetes, total) {
    if (!Array.isArray(tiquetes) || tiquetes.length === 0) {
        return construirTiquetesFallback(total);
    }

    return tiquetes.map((tiquete) => ({
        asiento: tiquete?.asiento || "Asignado en check-in",
        clase: tiquete?.clase || "Económica",
        precio: Number(tiquete?.precio) || 0
    }));
}

function obtenerReservaDetalle() {
    const textoSeleccionada = sessionStorage.getItem(RESERVA_DETALLE_KEY);
    if (textoSeleccionada) {
        try {
            const seleccionada = JSON.parse(textoSeleccionada);
            if (seleccionada && typeof seleccionada === "object") {
                return seleccionada;
            }
        } catch (error) {
            console.warn("No fue posible leer la reserva seleccionada:", error);
        }
    }

    const textoConfirmada = sessionStorage.getItem(RESERVA_CONFIRMADA_KEY);
    if (textoConfirmada) {
        try {
            const confirmada = JSON.parse(textoConfirmada);
            if (confirmada && typeof confirmada === "object") {
                const vuelo = confirmada.vuelo || {};
                const pasajero = confirmada.pasajero || {};

                return aplicarEstadoCancelado({
                    codigo: vuelo.codigoVuelo || "ARS-RSV-CONF-001",
                    ruta: `${vuelo.ciudadOrigen || "Origen"} - ${vuelo.ciudadDestino || "Destino"}`,
                    estado: "confirmada",
                    fecha: confirmada.fechaConfirmacion || confirmada.fechaCreacion || new Date().toISOString(),
                    total: Number(confirmada.resumenPago?.total ?? confirmada.resumenPago?.subtotal ?? vuelo.precioBase ?? 0),
                    moneda: "COP",
                    titular: `${pasajero.nombres || ""} ${pasajero.apellidos || ""}`.trim() || "No disponible",
                    tiquetes: [
                        {
                            asiento: "Asignado en check-in",
                            clase: "Económica",
                            precio: Number(confirmada.resumenPago?.total ?? confirmada.resumenPago?.subtotal ?? vuelo.precioBase ?? 0)
                        }
                    ]
                });
            }
        } catch (error) {
            console.warn("No fue posible leer la reserva confirmada:", error);
        }
    }

    return aplicarEstadoCancelado({
        codigo: "ARS-RSV-DEMO-001",
        ruta: "Bogotá - Cartagena",
        estado: "pendiente",
        fecha: new Date().toISOString(),
        total: 298500,
        moneda: "COP",
        titular: "No disponible",
        tiquetes: [
            {
                asiento: "12A",
                clase: "Económica",
                precio: 298500
            }
        ]
    });
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

function reservaCancelable(estado) {
    return estado === "confirmada" || estado === "pendiente";
}

function renderizarTiquetes(reserva) {
    const lista = document.getElementById("detalleTiquetesLista");
    if (!lista) {
        return;
    }

    const tiquetes = normalizarTiquetes(reserva.tiquetes, reserva.total);
    lista.innerHTML = tiquetes
        .map((tiquete, indice) => {
            const numero = indice + 1;
            return `
                <article class="tiquete-card">
                    <span class="tiquete-label">Tiquete ${numero}</span>
                    <div class="tiquete-grid">
                        <div class="tiquete-item">
                            <span class="etiqueta">Asiento</span>
                            <span class="valor">${tiquete.asiento}</span>
                        </div>
                        <div class="tiquete-item">
                            <span class="etiqueta">Clase</span>
                            <span class="valor">${tiquete.clase}</span>
                        </div>
                        <div class="tiquete-item">
                            <span class="etiqueta">Precio</span>
                            <span class="valor">${formatearMoneda(tiquete.precio)}</span>
                        </div>
                    </div>
                </article>
            `;
        })
        .join("");
}

function renderizarDetalle() {
    const reserva = obtenerReservaDetalle();
    reservaActual = reserva;
    const contenido = document.getElementById("detalleReservaContent");
    const vacio = document.getElementById("detalleReservaEmpty");

    if (!reserva) {
        if (contenido) {
            contenido.hidden = true;
        }
        if (vacio) {
            vacio.hidden = false;
        }
        return;
    }

    const claseEstado = obtenerClaseEstado(reserva.estado);
    const observaciones = {
        confirmada: "La reserva se encuentra confirmada y lista para consulta.",
        pendiente: "La reserva sigue pendiente de confirmación o pago.",
        cancelada: "La reserva fue cancelada de forma simulada.",
        usada: "La reserva ya fue utilizada en un viaje anterior."
    };

    const valores = {
        detalleCodigo: reserva.codigo || "-",
        detalleRuta: reserva.ruta || "Ruta no disponible",
        detalleEstadoTexto: capitalizar(reserva.estado || "pendiente"),
        detalleCodigoCompleto: reserva.codigo || "-",
        detalleFecha: formatearFechaDetalle(reserva.fecha),
        detalleRutaCompleta: reserva.ruta || "-",
        detalleTotal: formatearMoneda(reserva.total),
        detalleMoneda: reserva.moneda || "COP",
        detalleTitular: reserva.titular || "No disponible",
        detalleObservacion: observaciones[reserva.estado] || "La reserva se muestra con la información disponible en este momento."
    };

    Object.entries(valores).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    });

    const badge = document.getElementById("detalleEstadoBadge");
    if (badge) {
        badge.className = `estado-reserva ${claseEstado}`;
        badge.textContent = capitalizar(reserva.estado || "pendiente");
    }

    const btnCancelar = document.getElementById("btnCancelarReservaSimulada");
    if (btnCancelar) {
        const cancelable = reservaCancelable(reserva.estado);
        btnCancelar.disabled = !cancelable;
        btnCancelar.textContent = cancelable ? "Cancelar reserva (simulada)" : "Reserva no cancelable";
    }

    renderizarTiquetes(reserva);

    if (contenido) {
        contenido.hidden = false;
    }
    if (vacio) {
        vacio.hidden = true;
    }
}

function mostrarFeedbackCancelacion(mensaje, esError = false) {
    const feedback = document.getElementById("detalleReservaFeedback");
    if (!feedback) {
        return;
    }

    feedback.hidden = false;
    feedback.textContent = mensaje;
    feedback.className = `detalle-reserva-feedback ${esError ? "error" : "success"}`;
}

function sincronizarReservaCancelada() {
    if (!reservaActual || !reservaActual.codigo) {
        return;
    }

    const reservaCancelada = {
        ...reservaActual,
        estado: "cancelada"
    };

    sessionStorage.setItem(RESERVA_DETALLE_KEY, JSON.stringify(reservaCancelada));

    const textoConfirmada = sessionStorage.getItem(RESERVA_CONFIRMADA_KEY);
    if (!textoConfirmada) {
        return;
    }

    try {
        const confirmada = JSON.parse(textoConfirmada);
        const codigoConfirmada = confirmada?.vuelo?.codigoVuelo || "ARS-RSV-CONF-001";
        if (codigoConfirmada === reservaActual.codigo) {
            confirmada.estado = "cancelada";
            sessionStorage.setItem(RESERVA_CONFIRMADA_KEY, JSON.stringify(confirmada));
        }
    } catch (error) {
        console.warn("No fue posible sincronizar la reserva confirmada cancelada:", error);
    }
}

function configurarCancelacionSimulada() {
    const btnCancelar = document.getElementById("btnCancelarReservaSimulada");
    if (!btnCancelar) {
        return;
    }

    btnCancelar.addEventListener("click", () => {
        if (!reservaActual || !reservaActual.codigo) {
            mostrarFeedbackCancelacion("No fue posible identificar la reserva a cancelar.", true);
            return;
        }

        if (!reservaCancelable(reservaActual.estado)) {
            mostrarFeedbackCancelacion("Esta reserva no se puede cancelar desde este estado.", true);
            return;
        }

        const confirmado = window.confirm("¿Deseas cancelar esta reserva? Esta acción es simulada.");
        if (!confirmado) {
            return;
        }

        guardarCodigoCancelado(reservaActual.codigo);
        sincronizarReservaCancelada();
        mostrarFeedbackCancelacion("Reserva cancelada de forma simulada.");
        renderizarDetalle();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderizarDetalle();
    configurarCancelacionSimulada();
});