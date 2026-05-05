/* =====================================================
   HOME.JS — Lógica del home
   ARS-34: Crear estructura base (home + secciones)
   Historia: ARS-32 Layout general del sistema
   ===================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ----- RENDERIZAR VUELOS PREVIEW (máx 3) -----
  const previewContainer = document.getElementById('flightsPreview');

  if (previewContainer && typeof flightsData !== 'undefined') {
    const preview = flightsData
      .filter(f => f.status !== 'cancelled' && f.status !== 'completed')
      .slice(0, 3);

    if (preview.length === 0) {
      previewContainer.innerHTML = `<p style="color:var(--color-text-muted); text-align:center; padding:2rem;">No hay vuelos disponibles en este momento.</p>`;
      return;
    }

    preview.forEach((flight, index) => {
      const card = document.createElement('article');
      card.className = 'flight-preview-card';
      card.style.animationDelay = `${index * 100}ms`;

      const price = new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
      }).format(flight.price);

      const statusLabels = {
        scheduled: 'Programado', boarding: 'Abordando',
        delayed: 'Demorado', cancelled: 'Cancelado', completed: 'Completado'
      };

      card.innerHTML = `
        <div class="flight-origin">
          <p class="flight-city-label">Origen</p>
          <p class="flight-city-name">${flight.origin}</p>
          <p class="flight-city-time">${flight.departure}</p>
        </div>

        <div class="flight-preview-center">
          <div class="flight-preview-line">
            <i class="bi bi-airplane"></i>
          </div>
          <p class="flight-preview-number">Vuelo ${flight.flightNumber}</p>
          <p class="flight-preview-date">${flight.date}</p>
        </div>

        <div class="flight-destination">
          <p class="flight-city-label">Destino</p>
          <p class="flight-city-name">${flight.destination}</p>
          <p class="flight-city-time">${flight.arrival}</p>
        </div>

        <div class="flight-preview-price-col">
          <span class="flight-preview-from">Desde</span>
          <p class="flight-preview-price">${price}</p>
          <span class="flight-preview-currency">COP por persona</span>
          <div class="flight-preview-meta">
            <span class="status-badge status-${flight.status}">${statusLabels[flight.status]}</span>
            <span class="flight-seats-badge">${flight.seats} asientos</span>
          </div>
          <a href="views/client/listado_vuelos.html" class="btn btn-primary" style="width:100%; justify-content:center;">
            Reservar
          </a>
        </div>
      `;

      previewContainer.appendChild(card);
    });
  }

  // ----- BUSCADOR: redirigir a listado con filtros -----
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const origin      = document.getElementById('searchOrigin').value;
      const destination = document.getElementById('searchDestination').value;
      const date        = document.getElementById('searchDate').value;

      const params = new URLSearchParams();
      if (origin)      params.set('origin', origin);
      if (destination) params.set('destination', destination);
      if (date)        params.set('date', date);

      window.location.href = `views/client/listado_vuelos.html?${params.toString()}`;
    });
  }

});