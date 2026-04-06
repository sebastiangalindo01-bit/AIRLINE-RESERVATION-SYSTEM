const FORM_RESERVA_ID = "formCrearReserva";
const RESERVA_BORRADOR_KEY = "reservaBorrador";
const VUELO_KEYS = ["vueloSeleccionado", "vueloReserva"];

function obtenerVueloSeleccionado() {
	for (const key of VUELO_KEYS) {
		const valor = sessionStorage.getItem(key);
		if (!valor) {
			continue;
		}

		try {
			const vuelo = JSON.parse(valor);
			if (vuelo && typeof vuelo === "object") {
				return vuelo;
			}
		} catch (error) {
			console.warn("No se pudo leer el vuelo guardado en sessionStorage:", key, error);
		}
	}

	return null;
}

function soloLetrasYEspacios(valor) {
	return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,60}$/.test(valor);
}

function soloNumeros(valor, min, max) {
	return new RegExp(`^\\d{${min},${max}}$`).test(valor);
}

function esEmailValido(valor) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
}

function esFechaNacimientoValida(fechaISO) {
	if (!fechaISO) {
		return false;
	}

	const nacimiento = new Date(`${fechaISO}T00:00:00`);
	if (Number.isNaN(nacimiento.getTime())) {
		return false;
	}

	const hoy = new Date();
	const limite = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
	return nacimiento <= limite;
}

function normalizarTexto(valor) {
	return valor.trim().replace(/\s+/g, " ");
}

document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById(FORM_RESERVA_ID);
	if (!form) {
		return;
	}

	const btnVolver = document.getElementById("btnVolverReserva");
	const vueloSeleccionado = obtenerVueloSeleccionado();

	if (btnVolver) {
		btnVolver.addEventListener("click", () => {
			window.location.href = "buscar_vuelos.html";
		});
	}

	const campos = {
		tipoDocumento: document.getElementById("tipoDocumento"),
		numeroDocumento: document.getElementById("numeroDocumento"),
		nombres: document.getElementById("nombres"),
		apellidos: document.getElementById("apellidos"),
		correo: document.getElementById("correo"),
		telefono: document.getElementById("telefono"),
		telefonoAlterno: document.getElementById("telefonoAlterno"),
		fechaNacimiento: document.getElementById("fechaNacimiento"),
		direccion: document.getElementById("direccion"),
		pais: document.getElementById("pais"),
		departamento: document.getElementById("departamento"),
		ciudad: document.getElementById("ciudad")
	};

	const reglas = {
		tipoDocumento: (v) => (v ? "" : "Selecciona el tipo de documento."),
		numeroDocumento: (v) => {
			if (!v) {
				return "Ingresa el numero de documento.";
			}

			if (campos.tipoDocumento.value === "cedula" && !soloNumeros(v, 6, 10)) {
				return "La cedula debe tener entre 6 y 10 digitos.";
			}

			if (campos.tipoDocumento.value === "pasaporte" && !/^[A-Za-z0-9]{6,12}$/.test(v)) {
				return "El pasaporte debe tener entre 6 y 12 caracteres alfanumericos.";
			}

			return "";
		},
		nombres: (v) => {
			if (!v) {
				return "Ingresa los nombres.";
			}
			return soloLetrasYEspacios(v) ? "" : "Los nombres solo admiten letras y espacios.";
		},
		apellidos: (v) => {
			if (!v) {
				return "Ingresa los apellidos.";
			}
			return soloLetrasYEspacios(v) ? "" : "Los apellidos solo admiten letras y espacios.";
		},
		correo: (v) => {
			if (!v) {
				return "Ingresa el correo electronico.";
			}
			return esEmailValido(v) ? "" : "Ingresa un correo electronico valido.";
		},
		telefono: (v) => {
			if (!v) {
				return "Ingresa el telefono principal.";
			}
			return soloNumeros(v, 7, 15) ? "" : "El telefono debe tener entre 7 y 15 digitos.";
		},
		telefonoAlterno: (v) => {
			if (!v) {
				return "";
			}
			return soloNumeros(v, 7, 15) ? "" : "El telefono alterno debe tener entre 7 y 15 digitos.";
		},
		fechaNacimiento: (v) => {
			if (!v) {
				return "Selecciona la fecha de nacimiento.";
			}
			return esFechaNacimientoValida(v) ? "" : "Debes ser mayor de edad para continuar.";
		},
		direccion: (v) => {
			if (!v) {
				return "Ingresa la direccion de residencia.";
			}
			return v.length >= 5 ? "" : "La direccion debe tener al menos 5 caracteres.";
		},
		pais: (v) => (v ? "" : "Selecciona el pais."),
		departamento: (v) => (v ? "" : "Selecciona el departamento o estado."),
		ciudad: (v) => (v ? "" : "Selecciona la ciudad.")
	};

	function marcarEstadoCampo(campo, mensaje) {
		campo.setCustomValidity(mensaje);
		campo.classList.toggle("is-invalid", Boolean(mensaje));
		campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
	}

	function validarCampo(nombreCampo) {
		const campo = campos[nombreCampo];
		if (!campo || !reglas[nombreCampo]) {
			return true;
		}

		const valor = normalizarTexto(campo.value);
		campo.value = valor;
		const mensaje = reglas[nombreCampo](valor);
		marcarEstadoCampo(campo, mensaje);
		return !mensaje;
	}

	Object.keys(campos).forEach((nombreCampo) => {
		const campo = campos[nombreCampo];
		if (!campo) {
			return;
		}

		campo.addEventListener("blur", () => {
			validarCampo(nombreCampo);
		});

		campo.addEventListener("input", () => {
			if (campo.classList.contains("is-invalid")) {
				validarCampo(nombreCampo);
			}
		});
	});

	form.addEventListener("submit", (event) => {
		let primerInvalido = null;

		Object.keys(campos).forEach((nombreCampo) => {
			const esValido = validarCampo(nombreCampo);
			if (!esValido && !primerInvalido) {
				primerInvalido = campos[nombreCampo];
			}
		});

		if (primerInvalido) {
			event.preventDefault();
			primerInvalido.focus();
			form.reportValidity();
			return;
		}

		event.preventDefault();

		const pasajero = {
			tipoDocumento: campos.tipoDocumento.value,
			numeroDocumento: campos.numeroDocumento.value,
			nombres: campos.nombres.value,
			apellidos: campos.apellidos.value,
			correo: campos.correo.value,
			telefono: campos.telefono.value,
			telefonoAlterno: campos.telefonoAlterno.value,
			fechaNacimiento: campos.fechaNacimiento.value,
			direccion: campos.direccion.value,
			pais: campos.pais.value,
			departamento: campos.departamento.value,
			ciudad: campos.ciudad.value
		};

		const reservaBorrador = {
			fechaCreacion: new Date().toISOString(),
			vuelo: vueloSeleccionado,
			pasajero
		};

		sessionStorage.setItem(RESERVA_BORRADOR_KEY, JSON.stringify(reservaBorrador));
		window.location.href = "resumen_reserva.html";
	});
});
