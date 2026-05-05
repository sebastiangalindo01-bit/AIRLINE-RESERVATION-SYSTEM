'use strict';

const reservasData = [
  {
    id: 1, codigoReserva: 'RES-001', cliente: 'Juan Pablo García López',
    vuelo: 'FL001', ruta: 'Bogotá → Cartagena', fecha: '2026-03-15', hora: '08:30',
    pasajeros: 2, precioTotal: 500000, estado: 'Confirmada',
    tiquetes: [
      { codigo: 'TIQ-001', pasajero: 'Juan Pablo García', asiento: '12A', clase: 'Económica', precio: 250000 },
      { codigo: 'TIQ-002', pasajero: 'Acompañante García', asiento: '12B', clase: 'Económica', precio: 250000 }
    ]
  },
  {
    id: 2, codigoReserva: 'RES-002', cliente: 'María Fernanda Ruiz Gómez',
    vuelo: 'FL003', ruta: 'Bogotá → Miami', fecha: '2026-03-16', hora: '22:45',
    pasajeros: 1, precioTotal: 1280000, estado: 'Pendiente',
    tiquetes: [
      { codigo: 'TIQ-003', pasajero: 'María Fernanda Ruiz', asiento: null, clase: 'Ejecutiva', precio: 1280000 }
    ]
  },
  {
    id: 3, codigoReserva: 'RES-003', cliente: 'Carlos Andrés Mendoza Pérez',
    vuelo: 'FL002', ruta: 'Medellín → San Andrés', fecha: '2026-04-10', hora: '14:00',
    pasajeros: 3, precioTotal: 1140000, estado: 'Pendiente',
    tiquetes: [
      { codigo: 'TIQ-004', pasajero: 'Carlos Mendoza',  asiento: null, clase: 'Económica', precio: 380000 },
      { codigo: 'TIQ-005', pasajero: 'Acompañante 1',   asiento: null, clase: 'Económica', precio: 380000 },
      { codigo: 'TIQ-006', pasajero: 'Acompañante 2',   asiento: null, clase: 'Económica', precio: 380000 }
    ]
  },
  {
    id: 4, codigoReserva: 'RES-004', cliente: 'Laura Sofía Torres Díaz',
    vuelo: 'FL004', ruta: 'Cali → Bogotá', fecha: '2026-03-18', hora: '09:00',
    pasajeros: 1, precioTotal: 180000, estado: 'Cancelada',
    tiquetes: [
      { codigo: 'TIQ-007', pasajero: 'Laura Torres', asiento: '5C', clase: 'Económica', precio: 180000 }
    ]
  }
];

let tiqueteSeleccionado = null;
let asientoSeleccionadoVisual = null;

function getAllOcupados(excludeCodigo) {
  const set = new Set();
  reservasData.forEach(r => r.tiquetes.forEach(t => {
    if (t.asiento && t.codigo !== excludeCodigo) set.add(t.asiento.toUpperCase());
  }));
  return set;
}

function formatCOP(v) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
}

function getEstadoBadge(estado) {
  const map = { Confirmada: 'status-boarding', Pendiente: 'status-delayed', Cancelada: 'status-cancelled', Completada: 'status-completed' };
  return `<span class="status-badge ${map[estado] || ''}">${estado}</span>`;
}

function renderReservas(lista) {
  const container  = document.getElementById('reservasLista');
  const countBadge = document.getElementById('reservasCount');
  const activas    = lista.filter(r => r.estado !== 'Cancelada').length;
  countBadge.textContent = `${activas} Reserva${activas !== 1 ? 's' : ''} Activa${activas !== 1 ? 's' : ''}`;

  if (lista.length === 0) {
    container.innerHTML = `<div class="empty-reservas"><i class="bi bi-journal-x"></i><p>No se encontraron reservas.</p></div>`;
    return;
  }

  container.innerHTML = lista.map((r, i) => `
    <article class="reserva-card" style="animation-delay:${i * 60}ms" data-id="${r.id}">
      <div class="reserva-card-header estado-${r.estado}">
        <div>
          <p class="reserva-label">Código de Reserva</p>
          <p class="reserva-codigo">${r.codigoReserva}</p>
        </div>
        ${getEstadoBadge(r.estado)}
      </div>
      <div class="reserva-card-body">
        <div class="reserva-info">
          <p class="reserva-info-title"><i class="bi bi-airplane"></i> Información del Vuelo</p>
          <div class="reserva-info-row"><span class="reserva-info-label">Vuelo:</span><span class="reserva-info-value">${r.vuelo}</span></div>
          <div class="reserva-info-row"><span class="reserva-info-label">Ruta:</span><span class="reserva-info-value">${r.ruta}</span></div>
          <div class="reserva-info-row"><span class="reserva-info-label">Fecha:</span><span class="reserva-info-value">${r.fecha}</span></div>
          <div class="reserva-info-row"><span class="reserva-info-label">Hora:</span><span class="reserva-info-value">${r.hora}</span></div>
          <div class="reserva-info-row"><span class="reserva-info-label">Cliente:</span><span class="reserva-info-value">${r.cliente}</span></div>
          <div class="reserva-info-row"><span class="reserva-info-label">Pasajeros:</span><span class="reserva-info-value">${r.pasajeros}</span></div>
        </div>
        <div class="reserva-tiquetes">
          <p class="reserva-info-title"><i class="bi bi-ticket-perforated"></i> Tiquetes</p>
          ${r.tiquetes.map(t => `
            <div class="tiquete-item">
              <div>
                <span class="tiquete-code">${t.codigo}</span>
                <span class="tiquete-asiento"> | ${t.asiento || 'Sin asignar'} | ${t.clase}</span>
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem;">
                <span style="font-weight:700;color:var(--color-primary);font-size:var(--text-sm);">${formatCOP(t.precio)}</span>
                ${r.estado !== 'Cancelada' ? `
                  <button class="btn btn-outline btn-asiento" onclick="abrirModalAsiento(${r.id},'${t.codigo}')">
                    <i class="bi bi-${t.asiento ? 'pencil' : 'plus-circle'}"></i> ${t.asiento ? 'Cambiar' : 'Asignar'}
                  </button>` : ''}
              </div>
            </div>`).join('')}
        </div>
      </div>
      <div class="reserva-card-footer">
        <div>
          <p class="reserva-total-label">Total Pagado</p>
          <p class="reserva-total">${formatCOP(r.precioTotal)} COP</p>
        </div>
        <div class="reserva-actions">
          ${r.estado === 'Pendiente' ? `
            <button class="btn btn-primary" onclick="cambiarEstado(${r.id},'Confirmada')"><i class="bi bi-check-circle"></i> Confirmar</button>
            <button class="btn btn-secondary" style="color:var(--color-cancelled);border-color:var(--color-cancelled);" onclick="cambiarEstado(${r.id},'Cancelada')"><i class="bi bi-x-circle"></i> Cancelar</button>` : ''}
          ${r.estado === 'Confirmada' ? `
            <button class="btn btn-secondary" style="color:var(--color-cancelled);border-color:var(--color-cancelled);" onclick="cambiarEstado(${r.id},'Cancelada')"><i class="bi bi-x-circle"></i> Cancelar Reserva</button>` : ''}
          ${r.estado === 'Cancelada' ? `<span style="color:var(--color-text-muted);font-size:var(--text-sm);">Reserva cancelada</span>` : ''}
        </div>
      </div>
    </article>`).join('');
}

// ----- MAPA DE ASIENTOS -----
function renderSeatMap(ocupados, currentAsiento) {
  const map = document.getElementById('seatMap');
  map.innerHTML = '';
  const filas = 20;
  const cols  = ['A','B','C','D','E','F'];

  for (let f = 1; f <= filas; f++) {
    const row = document.createElement('div');
    row.className = 'seat-row';

    const num = document.createElement('span');
    num.className = 'seat-num';
    num.textContent = f;
    row.appendChild(num);

    cols.forEach((col, i) => {
      if (i === 3) {
        const gap = document.createElement('div');
        gap.className = 'seat-aisle-gap';
        row.appendChild(gap);
      }
      const code = f + col;
      const isOcupado   = ocupados.has(code);
      const isSeleccionado = asientoSeleccionadoVisual === code;

      const btn = document.createElement('button');
      btn.className = `seat-btn ${isSeleccionado ? 'seleccionado' : isOcupado ? 'ocupado' : 'disponible'}`;
      btn.textContent = col;
      btn.title = code;
      btn.disabled = isOcupado;

      if (!isOcupado) {
        btn.addEventListener('click', () => {
          asientoSeleccionadoVisual = asientoSeleccionadoVisual === code ? null : code;
          document.getElementById('inputAsiento').value = asientoSeleccionadoVisual || '';
          const info = document.getElementById('seatSelectedInfo');
          info.textContent = asientoSeleccionadoVisual ? `Asiento seleccionado: ${asientoSeleccionadoVisual}` : 'Haz clic en un asiento disponible';
          info.classList.toggle('active', !!asientoSeleccionadoVisual);
          renderSeatMap(ocupados, asientoSeleccionadoVisual);
        });
      }
      row.appendChild(btn);
    });
    map.appendChild(row);
  }

  // Scroll al asiento actual
  if (currentAsiento) {
    const fila = parseInt(currentAsiento);
    const scrollTop = Math.max(0, (fila - 3)) * 36;
    map.scrollTop = scrollTop;
  }
}

function abrirModalAsiento(reservaId, codigoTiquete) {
  const reserva = reservasData.find(r => r.id === reservaId);
  const tiquete = reserva?.tiquetes.find(t => t.codigo === codigoTiquete);
  if (!tiquete) return;

  tiqueteSeleccionado    = { reservaId, codigoTiquete };
  asientoSeleccionadoVisual = tiquete.asiento || null;

  document.getElementById('modalAsientoTitle').textContent = `Asignar Asiento — ${codigoTiquete}`;
  document.getElementById('modalAsientoInfo').textContent  = `Pasajero: ${tiquete.pasajero} | Clase: ${tiquete.clase}`;
  document.getElementById('inputAsiento').value            = tiquete.asiento || '';
  document.getElementById('asientoError').style.display   = 'none';

  const info = document.getElementById('seatSelectedInfo');
  info.textContent = tiquete.asiento ? `Asiento actual: ${tiquete.asiento}` : 'Haz clic en un asiento disponible';
  info.classList.toggle('active', !!tiquete.asiento);

  const ocupados = getAllOcupados(codigoTiquete);
  renderSeatMap(ocupados, tiquete.asiento);

  document.getElementById('modalAsiento').showModal();
}

// Sincronizar input manual con mapa
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('inputAsiento').addEventListener('input', (e) => {
    const val = e.target.value.trim().toUpperCase();
    asientoSeleccionadoVisual = val || null;
    if (tiqueteSeleccionado) {
      const { codigoTiquete } = tiqueteSeleccionado;
      renderSeatMap(getAllOcupados(codigoTiquete), val);
    }
    const info = document.getElementById('seatSelectedInfo');
    info.textContent = val ? `Asiento seleccionado: ${val}` : 'Haz clic en un asiento disponible';
    info.classList.toggle('active', !!val);
  });

  document.getElementById('btnConfirmarAsiento').addEventListener('click', () => {
    const input   = document.getElementById('inputAsiento');
    const errorEl = document.getElementById('asientoError');
    const asiento = (asientoSeleccionadoVisual || input.value.trim()).toUpperCase();
    if (!asiento) { input.focus(); return; }

    const { reservaId, codigoTiquete } = tiqueteSeleccionado;
    const ocupados = getAllOcupados(codigoTiquete);

    if (ocupados.has(asiento)) {
      errorEl.style.display = 'block';
      return;
    }

    const reserva = reservasData.find(r => r.id === reservaId);
    const tiquete = reserva?.tiquetes.find(t => t.codigo === codigoTiquete);
    if (tiquete) tiquete.asiento = asiento;

    errorEl.style.display = 'none';
    document.getElementById('modalAsiento').close();
    filtrarYRenderizar();
  });

  document.getElementById('btnFiltrar').addEventListener('click', filtrarYRenderizar);
  document.getElementById('btnLimpiar').addEventListener('click', () => {
    document.getElementById('filterCodigo').value  = '';
    document.getElementById('filterCliente').value = '';
    document.getElementById('filterEstado').value  = '';
    renderReservas(reservasData);
  });

  ['closeModalAsiento','btnCancelarAsiento'].forEach(id =>
    document.getElementById(id).addEventListener('click', () => document.getElementById('modalAsiento').close()));
  ['closeModalAccion','btnCancelarAccion'].forEach(id =>
    document.getElementById(id).addEventListener('click', () => document.getElementById('modalAccion').close()));

  ['modalAsiento','modalAccion'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target === document.getElementById(id)) document.getElementById(id).close();
    });
  });

  renderReservas(reservasData);
});

function cambiarEstado(reservaId, nuevoEstado) {
  const modal   = document.getElementById('modalAccion');
  const msg     = document.getElementById('modalAccionMsg');
  const btnConf = document.getElementById('btnConfirmarAccion');
  const textos  = { Confirmada: '¿Deseas confirmar esta reserva?', Cancelada: '¿Deseas cancelar esta reserva? Esta acción no se puede deshacer.' };
  msg.textContent = textos[nuevoEstado] || '¿Deseas continuar?';
  btnConf.style.background = nuevoEstado === 'Cancelada' ? 'var(--color-cancelled)' : '';
  btnConf.textContent = nuevoEstado === 'Cancelada' ? 'Sí, cancelar' : 'Sí, confirmar';
  modal.showModal();
  btnConf.onclick = () => {
    const reserva = reservasData.find(r => r.id === reservaId);
    if (reserva) reserva.estado = nuevoEstado;
    filtrarYRenderizar();
    modal.close();
  };
}

function filtrarYRenderizar() {
  const codigo  = document.getElementById('filterCodigo').value.trim().toLowerCase();
  const cliente = document.getElementById('filterCliente').value.trim().toLowerCase();
  const estado  = document.getElementById('filterEstado').value;
  const result  = reservasData.filter(r =>
    (!codigo  || r.codigoReserva.toLowerCase().includes(codigo)) &&
    (!cliente || r.cliente.toLowerCase().includes(cliente)) &&
    (!estado  || r.estado === estado)
  );
  renderReservas(result);
}