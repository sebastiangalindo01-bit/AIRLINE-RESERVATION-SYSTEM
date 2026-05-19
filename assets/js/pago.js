const btnPagar = document.getElementById('btnPagar');
const btnVolverPago = document.getElementById('btnVolver');
const estadoEl = document.getElementById('estado');

function mostrarEstado(text, isError = false) {
  if (!estadoEl) return;
  estadoEl.hidden = false;
  estadoEl.textContent = text;
  estadoEl.style.color = isError ? 'crimson' : 'green';
}

function ocultarEstado() {
  if (!estadoEl) return;
  estadoEl.hidden = true;
  estadoEl.textContent = '';
}

function obtenerReservaBorrador() {
  const txt = sessionStorage.getItem('reservaBorrador');
  if (!txt) return null;
  try { return JSON.parse(txt); } catch (e) { return null; }
}

function construirPayloadReserva(reserva) {
  if (!reserva || !reserva.vuelo) return null;
  const vuelo = reserva.vuelo;
  const vueloId = vuelo.id || vuelo.vuelo_id || vuelo.vueloId || vuelo.id_api || null;
  const precio = vuelo.price || vuelo.precioBase || vuelo.precio || 0;

  const ticket = {
    numero_asiento: null,
    clase: vuelo.clase || 'Economy',
    precio_final: Number(precio)
  };

  const payload = {
    vuelo_id: Number(vueloId),
    tickets: [ticket],
    packages: []
  };

  return payload;
}

async function crearReservaYpagar() {
  ocultarEstado();
  const reserva = obtenerReservaBorrador();
  if (!reserva) { mostrarEstado('No hay reserva en curso.', true); return; }

  const payload = construirPayloadReserva(reserva);
  if (!payload || !payload.vuelo_id) { mostrarEstado('Datos de vuelo incompletos.', true); return; }

  try {
    mostrarEstado('Creando reserva...');
    const crear = await llamarAPI(API_CONFIG.ENDPOINTS.RESERVAS, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!crear || !crear.ok) {
      mostrarEstado('No fue posible crear la reserva.', true);
      console.error('crear reserva response', crear);
      return;
    }

    const reservaCreada = crear.data && crear.data.reserva ? crear.data.reserva : crear.data;
    const reservationId = reservaCreada.id || (crear.data && crear.data.reserva && crear.data.reserva.id);

    if (!reservationId) {
      mostrarEstado('ID de reserva no retornado por el servidor.', true);
      console.error('crear reserva payload', crear);
      return;
    }

    mostrarEstado('Reserva creada. Iniciando pago...');

    const amount = reserva.resumenPago ? reserva.resumenPago.total : payload.tickets.reduce((s,t)=>s+Number(t.precio_final||0),0);

    const pay = await llamarAPI(`${API_CONFIG.ENDPOINTS.PAYMENTS}/simulate`, {
      method: 'POST',
      body: JSON.stringify({ reservationId: Number(reservationId), amount: Number(amount) })
    });

    if (!pay || !pay.ok) {
      mostrarEstado('Pago fallido.', true);
      console.error('pago response', pay);
      return;
    }

    // Guardar confirmación en sessionStorage y redirigir al detalle
    sessionStorage.setItem('reservaConfirmada', JSON.stringify(pay.data || pay));
    mostrarEstado('Pago realizado con éxito. Redirigiendo...');
    setTimeout(() => { window.location.href = 'confirmacion.html'; }, 1000);
  } catch (err) {
    console.error(err);
    mostrarEstado('Error de red o del servidor. Revisa la consola.', true);
  }
}

if (btnPagar) btnPagar.addEventListener('click', crearReservaYpagar);
if (btnVolverPago) btnVolverPago.addEventListener('click', () => { window.location.href = 'resumen_reserva.html'; });

// Renderizar resumen en la página (si carga después de resumen_reserva.js)
const reservaActual = obtenerReservaBorrador();
if (reservaActual && reservaActual.resumenPago) {
  const subtotalEl = document.getElementById('subtotal');
  const impuestosEl = document.getElementById('impuestos');
  const totalEl = document.getElementById('total');
  if (subtotalEl) subtotalEl.textContent = reservaActual.resumenPago.subtotal;
  if (impuestosEl) impuestosEl.textContent = reservaActual.resumenPago.impuestos;
  if (totalEl) totalEl.textContent = reservaActual.resumenPago.total;
}
