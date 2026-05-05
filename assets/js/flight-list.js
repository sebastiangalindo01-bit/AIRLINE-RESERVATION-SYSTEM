/* =====================================================
   FLIGHT-LIST.JS — Lógica de estados del vuelo
   ARS-13: Mostrar estados del vuelo (programado,
           cancelado, demorado, abordando, completado)
   Historia: ARS-2 Listados de vuelo
   ===================================================== */

'use strict';

// ----- CONFIGURACIÓN DE ESTADOS -----
const flightStatuses = {
  scheduled: {
    label:   'Programado',
    cssClass: 'status-scheduled',
    icon:    '🕐',
    description: 'El vuelo está programado y saldrá a tiempo.'
  },
  boarding: {
    label:   'Abordando',
    cssClass: 'status-boarding',
    icon:    '🚶',
    description: 'El abordaje está en curso. Diríjase a la puerta de embarque.'
  },
  delayed: {
    label:   'Demorado',
    cssClass: 'status-delayed',
    icon:    '⏳',
    description: 'El vuelo presenta retraso. Consulte el nuevo horario.'
  },
  cancelled: {
    label:   'Cancelado',
    cssClass: 'status-cancelled',
    icon:    '❌',
    description: 'El vuelo ha sido cancelado. Contacte a servicio al cliente.'
  },
  completed: {
    label:   'Completado',
    cssClass: 'status-completed',
    icon:    '✅',
    description: 'El vuelo ha aterrizado en su destino.'
  }
};

// ----- GENERAR BADGE DE ESTADO -----
function getStatusBadge(status) {
  const config = flightStatuses[status];
  if (!config) return `<span class="status-badge">${status}</span>`;
  return `<span class="status-badge ${config.cssClass}" title="${config.description}">
    ${config.label}
  </span>`;
}

// ----- MOSTRAR LEYENDA DE ESTADOS -----
function renderStatusLegend() {
  const legendContainer = document.getElementById('statusLegend');
  if (!legendContainer) return;

  legendContainer.innerHTML = Object.entries(flightStatuses).map(([key, config]) => `
    <div class="legend-item">
      <span class="status-badge ${config.cssClass}">${config.label}</span>
      <span class="legend-desc">${config.description}</span>
    </div>
  `).join('');
}

// ----- RESALTAR FILAS SEGÚN ESTADO -----
function applyStatusStyles() {
  const rows = document.querySelectorAll('#flightsTableBody tr[data-flight-id]');
  rows.forEach(row => {
    const badge = row.querySelector('.status-badge');
    if (!badge) return;

    // Resaltar filas canceladas con opacidad reducida
    if (badge.classList.contains('status-cancelled')) {
      row.style.opacity = '0.6';
    }

    // Resaltar filas en abordaje con borde izquierdo
    if (badge.classList.contains('status-boarding')) {
      row.style.borderLeft = '3px solid var(--color-boarding)';
    }

    // Resaltar filas demoradas
    if (badge.classList.contains('status-delayed')) {
      row.style.borderLeft = '3px solid var(--color-delayed)';
    }
  });
}

// ----- CONTADOR POR ESTADO -----
function renderStatusSummary(flights) {
  const summaryContainer = document.getElementById('statusSummary');
  if (!summaryContainer || !flights) return;

  const counts = Object.keys(flightStatuses).reduce((acc, key) => {
    acc[key] = flights.filter(f => f.status === key).length;
    return acc;
  }, {});

  summaryContainer.innerHTML = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `
      <div class="summary-chip" data-status="${key}" title="${flightStatuses[key].description}">
        <span class="status-badge ${flightStatuses[key].cssClass}">${flightStatuses[key].label}</span>
        <span class="summary-count">${count}</span>
      </div>
    `).join('');

  // Click en chip para filtrar por estado
  summaryContainer.querySelectorAll('.summary-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const status = chip.dataset.status;
      const select = document.getElementById('filterStatus');
      if (select) {
        select.value = status;
        document.getElementById('filtersForm').dispatchEvent(new Event('submit'));
      }
    });
  });
}

// ----- INICIALIZACIÓN -----
document.addEventListener('DOMContentLoaded', () => {
  // Esperar a que flight-data.js haya renderizado las filas
  setTimeout(() => {
    applyStatusStyles();
    renderStatusLegend();
    if (typeof flightsData !== 'undefined') {
      renderStatusSummary(flightsData);
    }
  }, 100);

  // Re-aplicar estilos de estado cuando se filtra
  const form = document.getElementById('filtersForm');
  if (form) {
    form.addEventListener('submit', () => {
      setTimeout(applyStatusStyles, 150);
    });
    form.addEventListener('reset', () => {
      setTimeout(() => {
        applyStatusStyles();
        if (typeof flightsData !== 'undefined') {
          renderStatusSummary(flightsData);
        }
      }, 150);
    });
  }
});