/* =====================================================
   NAVBAR.JS — Lógica del navbar principal
   ARS-33: Crear navbar principal
   Historia: ARS-32 Layout general del sistema
   ===================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ----- TOGGLE MENÚ MÓVIL -----
  const toggle = document.getElementById('navbarToggle');
  const menu   = document.getElementById('navbarMenu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
      toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
      }
    });
  }

  // ----- MARCAR ENLACE ACTIVO SEGÚN URL -----
  const currentPath = window.location.pathname.split('/').pop();
  const navLinks    = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href').split('/').pop();
    if (linkPath && currentPath && linkPath === currentPath) {
      navLinks.forEach(l => l.classList.remove('nav-link--active'));
      link.classList.add('nav-link--active');
    }
  });

  // ----- NAVBAR STICKY: sombra al hacer scroll -----
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.boxShadow = window.scrollY > 10
        ? 'var(--shadow-md)'
        : '0 1px 0 var(--color-border)';
    }, { passive: true });
  }

});