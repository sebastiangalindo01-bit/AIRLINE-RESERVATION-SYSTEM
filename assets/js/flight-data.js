/* =====================================================
   FLIGHT-DATA.JS — Simulación de datos de vuelos
   ARS-12: Simulación de datos de vuelos
   Historia: ARS-2 Listados de vuelo
   ===================================================== */

'use strict';

// ----- DATOS SIMULADOS DE VUELOS -----
const flightsData = [
  {
    id: 1,
    flightNumber: "ARS-FL001",
    airline: "ARS Colombia",
    origin: "Bogotá",
    originCode: "BOG",
    destination: "Cartagena",
    destinationCode: "CTG",
    departure: "08:30",
    arrival: "10:15",
    duration: "1h 45m",
    date: "2026-04-10",
    seats: 45,
    price: 250000,
    status: "scheduled"
  },
  {
    id: 2,
    flightNumber: "ARS-FL002",
    airline: "ARS Colombia",
    origin: "Medellín",
    originCode: "MDE",
    destination: "San Andrés",
    destinationCode: "ADZ",
    departure: "14:00",
    arrival: "16:30",
    duration: "2h 30m",
    date: "2026-04-10",
    seats: 12,
    price: 380000,
    status: "delayed"
  },
  {
    id: 3,
    flightNumber: "ARS-FL003",
    airline: "ARS Colombia",
    origin: "Medellín",
    originCode: "MDE",
    destination: "Miami",
    destinationCode: "MIA",
    departure: "19:30",
    arrival: "23:10",
    duration: "3h 40m",
    date: "2026-04-10",
    seats: 30,
    price: 1280000,
    status: "scheduled"
  },
  {
    id: 4,
    flightNumber: "ARS-FL004",
    airline: "ARS Colombia",
    origin: "Cali",
    originCode: "CLO",
    destination: "Bogotá",
    destinationCode: "BOG",
    departure: "09:00",
    arrival: "10:00",
    duration: "1h 00m",
    date: "2026-04-10",
    seats: 58,
    price: 180000,
    status: "boarding"
  },
  {
    id: 5,
    flightNumber: "ARS-FL005",
    airline: "ARS Colombia",
    origin: "Bogotá",
    originCode: "BOG",
    destination: "Barranquilla",
    destinationCode: "BAQ",
    departure: "11:15",
    arrival: "12:45",
    duration: "1h 30m",
    date: "2026-04-10",
    seats: 0,
    price: 210000,
    status: "cancelled"
  },
  {
    id: 6,
    flightNumber: "ARS-FL006",
    airline: "ARS Colombia",
    origin: "Bogotá",
    originCode: "BOG",
    destination: "Bucaramanga",
    destinationCode: "BGA",
    departure: "07:00",
    arrival: "08:05",
    duration: "1h 05m",
    date: "2026-04-10",
    seats: 22,
    price: 195000,
    status: "completed"
  },
  {
    id: 7,
    flightNumber: "ARS-FL007",
    airline: "ARS Colombia",
    origin: "Cali",
    originCode: "CLO",
    destination: "Cartagena",
    destinationCode: "CTG",
    departure: "15:45",
    arrival: "17:30",
    duration: "1h 45m",
    date: "2026-04-11",
    seats: 34,
    price: 320000,
    status: "scheduled"
  },
  {
    id: 8,
    flightNumber: "ARS-FL008",
    airline: "ARS Colombia",
    origin: "Bogotá",
    originCode: "BOG",
    destination: "México DF",
    destinationCode: "MEX",
    departure: "22:00",
    arrival: "03:30",
    duration: "5h 30m",
    date: "2026-04-11",
    seats: 8,
    price: 1650000,
    status: "scheduled"
  }
];

// ----- ETIQUETAS DE ESTADO -----
const statusLabels = {
  scheduled: "Programado",
  boarding:  "Abordando",
  delayed:   "Demorado",
  cancelled: "Cancelado",
  completed: "Completado"
};

let visibleFlights = [...flightsData];

// ----- FORMATO DE MONEDA -----
function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

function normalizeText(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ----- RENDERIZAR FILAS EN LA TABLA -----
function renderFlights(flights) {
  const tbody = document.getElementById('flightsTableBody');
  const emptyRow = document.getElementById('emptyRow');
  const resultsCount = document.getElementById('resultsCount');

  // Limpiar filas anteriores (excepto la fila vacía)
  const existingRows = tbody.querySelectorAll('tr:not(#emptyRow)');
  existingRows.forEach(row => row.remove());

  // Actualizar contador
  resultsCount.innerHTML = `Mostrando <strong>${flights.length}</strong> vuelo${flights.length !== 1 ? 's' : ''}`;

  if (flights.length === 0) {
    emptyRow.style.display = '';
    return;
  }

  emptyRow.style.display = 'none';

  flights.forEach((flight, index) => {
    const seatsClass = flight.seats > 0 && flight.seats <= 15 ? 'seats-low' : '';
    const seatsText  = flight.seats === 0 ? 'Agotado' : `${flight.seats} disponibles`;

    const tr = document.createElement('tr');
    tr.style.animationDelay = `${index * 50}ms`;
    tr.dataset.flightId = flight.id;

    tr.innerHTML = `
      <td><span class="flight-number">${flight.flightNumber}</span></td>
      <td>${flight.airline}</td>
      <td><strong>${flight.origin}</strong><br><small>${flight.originCode}</small></td>
      <td><strong>${flight.destination}</strong><br><small>${flight.destinationCode}</small></td>
      <td>${flight.departure}</td>
      <td>${flight.arrival}</td>
      <td>${flight.duration}</td>
      <td class="${seatsClass}">${seatsText}</td>
      <td>
        <span class="flight-price">${formatCurrency(flight.price)}</span>
        <span class="flight-price-label">por persona</span>
      </td>
      <td>
        <span class="status-badge status-${flight.status}">
          ${statusLabels[flight.status] || flight.status}
        </span>
      </td>
      <td>
        <button
          class="btn btn-primary"
          onclick="openFlightModal(${flight.id})"
          ${flight.status === 'cancelled' || flight.seats === 0 ? 'disabled' : ''}
        >
          Reservar
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ----- ABRIR MODAL CON DETALLE DEL VUELO -----
function openFlightModal(flightId) {
  const flight = flightsData.find(f => f.id === flightId);
  if (!flight) return;

  const modal   = document.getElementById('flightModal');
  const body    = document.getElementById('modalBody');
  const title   = document.getElementById('modalTitle');

  title.textContent = `Vuelo ${flight.flightNumber}`;

  body.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <p style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:.06em;">Origen</p>
          <p style="font-size:1.25rem; font-weight:700;">${flight.origin} <small style="font-weight:400; color:var(--color-text-muted);">(${flight.originCode})</small></p>
          <p style="font-size:1.5rem; font-weight:700; color:var(--color-primary);">${flight.departure}</p>
        </div>
        <div style="font-size:2rem;">✈</div>
        <div style="text-align:right;">
          <p style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:.06em;">Destino</p>
          <p style="font-size:1.25rem; font-weight:700;">${flight.destination} <small style="font-weight:400; color:var(--color-text-muted);">(${flight.destinationCode})</small></p>
          <p style="font-size:1.5rem; font-weight:700; color:var(--color-primary);">${flight.arrival}</p>
        </div>
      </div>
      <hr style="border:none; border-top:1px solid var(--color-border-light);">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
        <div><p style="font-size:0.75rem; color:var(--color-text-muted);">Aerolínea</p><p style="font-weight:600;">${flight.airline}</p></div>
        <div><p style="font-size:0.75rem; color:var(--color-text-muted);">Duración</p><p style="font-weight:600;">${flight.duration}</p></div>
        <div><p style="font-size:0.75rem; color:var(--color-text-muted);">Fecha</p><p style="font-weight:600;">${flight.date}</p></div>
        <div><p style="font-size:0.75rem; color:var(--color-text-muted);">Asientos</p><p style="font-weight:600;">${flight.seats === 0 ? 'Agotado' : flight.seats + ' disponibles'}</p></div>
        <div><p style="font-size:0.75rem; color:var(--color-text-muted);">Estado</p><span class="status-badge status-${flight.status}">${statusLabels[flight.status]}</span></div>
        <div><p style="font-size:0.75rem; color:var(--color-text-muted);">Precio por persona</p><p style="font-weight:700; font-size:1.25rem; color:var(--color-primary);">${formatCurrency(flight.price)}</p></div>
      </div>
    </div>
  `;

  modal.showModal();
}

// ----- FILTRAR VUELOS -----
function getFilteredFlights() {
  const origin      = normalizeText(document.getElementById('filterOrigin').value);
  const destination = normalizeText(document.getElementById('filterDestination').value);
  const date        = document.getElementById('filterDate').value;

  return flightsData.filter(flight => {
    const flightOrigin = normalizeText(flight.origin);
    const flightDestination = normalizeText(flight.destination);

    const matchOrigin      = !origin      || flightOrigin.includes(origin);
    const matchDestination = !destination || flightDestination.includes(destination);
    const matchDate        = !date        || flight.date === date;
    return matchOrigin && matchDestination && matchDate;
  });
}

function filterFlights() {
  visibleFlights = getFilteredFlights();
  renderFlights(visibleFlights);
}

// ----- INICIALIZACIÓN -----
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar todos los vuelos al cargar
  renderFlights(visibleFlights);

  // Filtros
  const form = document.getElementById('filtersForm');
  const filterOrigin = document.getElementById('filterOrigin');
  const filterDestination = document.getElementById('filterDestination');
  const filterDate = document.getElementById('filterDate');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    filterFlights();
  });

  // Integración directa con la tabla: actualizar mientras el usuario filtra.
  filterOrigin.addEventListener('input', filterFlights);
  filterDestination.addEventListener('input', filterFlights);
  filterDate.addEventListener('change', filterFlights);

  form.addEventListener('reset', () => {
    setTimeout(() => {
      visibleFlights = [...flightsData];
      renderFlights(visibleFlights);
    }, 0);
  });

  // Modal: cerrar
  const modal        = document.getElementById('flightModal');
  const btnClose     = document.getElementById('modalClose');
  const btnCloseModal= document.getElementById('btnCloseModal');

  btnClose.addEventListener('click',      () => modal.close());
  btnCloseModal.addEventListener('click', () => modal.close());

  // Cerrar al hacer clic fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
});