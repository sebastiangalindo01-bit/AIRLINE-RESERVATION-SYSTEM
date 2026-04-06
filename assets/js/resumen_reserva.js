const RESERVA_BORRADOR_KEY = "reservaBorrador";
const RESERVA_CONFIRMADA_KEY = "reservaConfirmada";
const IVA = 0.19;

function formatearFecha(fechaISO, hora) {
	if (!fechaISO) {
		return "No disponible";
	}

	const fecha = new Date(`${fechaISO}T00:00:00`);
	if (Number.isNaN(fecha.getTime())) {
		return "No disponible";
	}

	const fechaTexto = fecha.toLocaleDateString("es-CO", {
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric"
	});

	return hora ? `${fechaTexto} ${hora}` : fechaTexto;
}

function formatearMoneda(valor) {
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(valor || 0);
}

function mostrarEstado(mensaje) {
	const estado = document.getElementById("estadoResumen");
	const contenido = document.getElementById("resumenContenido");
	if (!estado || !contenido) {
		return;
	}

	estado.hidden = false;
	contenido.hidden = true;
	estado.innerHTML = `<p>${mensaje}</p>`;
}

function renderizarResumen(reserva) {
	const vuelo = reserva.vuelo || {};
	const pasajero = reserva.pasajero || {};

	const subtotal = Number(vuelo.precioBase) || 0;
	const impuestos = Math.round(subtotal * IVA);
	const total = subtotal + impuestos;

	const ruta = `${vuelo.ciudadOrigen || "Origen"} - ${vuelo.ciudadDestino || "Destino"}`;
	const pasajeroNombre = `${pasajero.nombres || ""} ${pasajero.apellidos || ""}`.trim() || "No disponible";
	const ubicacion = [pasajero.ciudad, pasajero.departamento, pasajero.pais].filter(Boolean).join(", ") || "No disponible";

	const valores = {
		resumenRuta: ruta,
		resumenCodigo: vuelo.codigoVuelo || "No disponible",
		resumenFechaSalida: formatearFecha(vuelo.fechaSalida, vuelo.horaSalida),
		resumenFechaLlegada: formatearFecha(vuelo.fechaLlegada, vuelo.horaLlegada),
		resumenPasajero: pasajeroNombre,
		resumenDocumento: `${pasajero.tipoDocumento || ""} ${pasajero.numeroDocumento || ""}`.trim() || "No disponible",
		resumenCorreo: pasajero.correo || "No disponible",
		resumenTelefono: pasajero.telefono || "No disponible",
		resumenUbicacion: ubicacion,
		resumenSubtotal: formatearMoneda(subtotal),
		resumenImpuestos: formatearMoneda(impuestos),
		resumenTotal: formatearMoneda(total)
	};

	Object.entries(valores).forEach(([id, valor]) => {
		const el = document.getElementById(id);
		if (el) {
			el.textContent = valor;
		}
	});

	reserva.resumenPago = {
		subtotal,
		impuestos,
		total
	};

	sessionStorage.setItem(RESERVA_BORRADOR_KEY, JSON.stringify(reserva));

	const estado = document.getElementById("estadoResumen");
	const contenido = document.getElementById("resumenContenido");
	if (estado && contenido) {
		estado.hidden = true;
		contenido.hidden = false;
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const btnVolver = document.getElementById("btnVolverCrearReserva");
	const btnContinuar = document.getElementById("btnContinuarPago");

	if (btnVolver) {
		btnVolver.addEventListener("click", () => {
			window.location.href = "crear_reserva.html";
		});
	}

	const textoReserva = sessionStorage.getItem(RESERVA_BORRADOR_KEY);
	if (!textoReserva) {
		mostrarEstado("No hay una reserva en curso. Vuelve al formulario para iniciar una nueva reserva.");
		return;
	}

	let reserva = null;
	try {
		reserva = JSON.parse(textoReserva);
	} catch (error) {
		console.error("Error al leer la reserva en sessionStorage:", error);
		mostrarEstado("No fue posible leer los datos de la reserva. Regresa al formulario e intentalo de nuevo.");
		return;
	}

	if (!reserva || typeof reserva !== "object" || !reserva.pasajero) {
		mostrarEstado("La reserva esta incompleta. Regresa al formulario para continuar.");
		return;
	}

	renderizarResumen(reserva);

	if (btnContinuar) {
		btnContinuar.addEventListener("click", () => {
			sessionStorage.setItem(RESERVA_CONFIRMADA_KEY, JSON.stringify(reserva));
			window.location.href = "pago.html";
		});
	}
});
