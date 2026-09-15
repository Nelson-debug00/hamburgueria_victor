/* =========================================================
   LA HAMBURGUERÍA DE VÍCTOR — script.js
   Vanilla JS ES6+ · Sin dependencias
   ========================================================= */
'use strict';

/* ---------- Helpers ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- Configuración de negocio ---------- */
// ⚠️ Sustituye por las líneas reales de cada sede cuando estén disponibles.
const WA_NUMBERS = {
  Bicentenario: '584249023408',
  Tipuro:       '584249023408'
};
let currentOrderItem = null; // Producto seleccionado desde las tarjetas del menú

/* =========================================================
   1. NAVBAR: estado al scroll + menú móvil
   ========================================================= */
const navbar   = $('#navbar');
const navToggle = $('#navToggle');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const isOpen = navbar.classList.toggle('menu-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
});

// Cerrar menú móvil al hacer clic en un enlace o fuera de él
$$('.nav-menu a').forEach(link => link.addEventListener('click', () => {
  navbar.classList.remove('menu-open');
  navToggle.setAttribute('aria-expanded', 'false');
}));
document.addEventListener('click', (e) => {
  if (navbar.classList.contains('menu-open') && !navbar.contains(e.target)) {
    navbar.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

/* =========================================================
   2. NAV ACTIVO SEGÚN SECCIÓN VISIBLE (Scrollspy)
   ========================================================= */
const navLinks = $$('.nav-link');
const spySections = $$('main section[id], footer[id]');

const setActiveLink = (id) => navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));

// ¿Página llegando al final? El footer (#contacto) puede no alcanzar la banda
// del observer por falta de scroll restante → forzar su activación.
const isPageBottom = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
const lastSectionId = spySections.length ? spySections[spySections.length - 1].id : null;

const spyObserver = new IntersectionObserver((entries) => {
  if (isPageBottom() && lastSectionId) { setActiveLink(lastSectionId); return; }
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setActiveLink(entry.target.id);
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

spySections.forEach(sec => spyObserver.observe(sec));

window.addEventListener('scroll', () => {
  if (isPageBottom() && lastSectionId) setActiveLink(lastSectionId);
}, { passive: true });

/* =========================================================
   3. FILTROS INTERACTIVOS DEL MENÚ
   ========================================================= */
const filterBtns = $$('.filter-btn');
const cards = $$('#menuGrid .card');

filterBtns.forEach(btn => btn.setAttribute('aria-pressed', String(btn.classList.contains('active'))));

filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');

  const filter = btn.dataset.filter;
  cards.forEach(card => {
    const match = filter === 'all' || card.dataset.category === filter;
    card.classList.toggle('hidden', !match);
    if (match) {                       // Re-animación de entrada
      card.classList.remove('pop');
      void card.offsetWidth;           // Forza reflow para reiniciar animación
      card.classList.add('pop');
    }
  });
}));

/* =========================================================
   4. CAROUSEL DE EVENTOS (autoplay, flechas, dots y swipe)
   ========================================================= */
const track = $('#carouselTrack');
const dotsWrap = $('#carDots');
const carousel = $('#carousel');

if (track && dotsWrap && carousel) {
  const slides = $$('.slide', track);
  let carIndex = 0;
  let carTimer = null;

  // Construcción dinámica de dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ir al evento ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i, true));
    dotsWrap.appendChild(dot);
  });
  const dots = $$('button', dotsWrap);

  function goToSlide(i, manual = false) {
    carIndex = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${carIndex * 100}%)`;
    slides.forEach((s, idx) => {
      const onScreen = idx === carIndex;
      s.toggleAttribute('aria-hidden', !onScreen);
      s.inert = !onScreen;
    });
    dots.forEach((d, idx) => {
      const active = idx === carIndex;
      d.classList.toggle('active', active);
      if (active) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    if (manual) restartAutoplay();
  }
  function nextSlide(manual = false) { goToSlide(carIndex + 1, manual); }
  function prevSlide(manual = false) { goToSlide(carIndex - 1, manual); }

  function startAutoplay() { carTimer = setInterval(() => nextSlide(false), 5000); }
  function restartAutoplay() { clearInterval(carTimer); startAutoplay(); }

  $('#carNext').addEventListener('click', () => nextSlide(true));
  $('#carPrev').addEventListener('click', () => prevSlide(true));
  carousel.addEventListener('mouseenter', () => clearInterval(carTimer));
  carousel.addEventListener('mouseleave', startAutoplay);

  // Swipe táctil móvil
  let touchX = null;
  carousel.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    if (touchX === null) return;
    const delta = e.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 45) delta < 0 ? nextSlide(true) : prevSlide(true);
    touchX = null;
  }, { passive: true });

  goToSlide(0);
  startAutoplay();
}

/* =========================================================
   5. SCROLL REVEAL (IntersectionObserver)
   ========================================================= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
$$('.reveal').forEach(el => revealObserver.observe(el));

/* =========================================================
   6. WIDGET FLOTANTE DE WHATSAPP + SELECTOR DE SEDE
   ========================================================= */
const waFab   = $('#waFab');
const waPanel = $('#waPanel');
const waClose = $('#waClose');
const waItemText = $('#waItem');
const WA_WIDGET = $('#waWidget');

if (waFab && waPanel && waClose) {
  function openWaPanel(item = null) {
    currentOrderItem = item;
    waItemText.textContent = item
      ? `Pedirás: ${item}. Selecciona tu sede más cercana:`
      : 'Selecciona tu sede más cercana y te atendemos al instante por WhatsApp.';
    waPanel.classList.add('open');
    waFab.setAttribute('aria-expanded', 'true');
    const firstOption = $('.wa-option', waPanel);
    if (firstOption) firstOption.focus({ preventScroll: true });
  }
  function closeWaPanel() {
    if (!waPanel.classList.contains('open')) return;
    waPanel.classList.remove('open');
    waFab.setAttribute('aria-expanded', 'false');
    if (waPanel.contains(document.activeElement)) waFab.focus({ preventScroll: true });
  }
  function sendToWhatsApp(sede) {
    const number = WA_NUMBERS[sede] || WA_NUMBERS.Bicentenario;
    const msg = currentOrderItem
      ? `¡Hola La Hamburguería de Víctor! 👋 Quiero pedir: ${currentOrderItem} (Sede ${sede}).`
      : `¡Hola La Hamburguería de Víctor! 👋 Quiero hacer un pedido en la Sede ${sede}.`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    closeWaPanel();
    currentOrderItem = null;
  }

  waFab.addEventListener('click', (e) => {
    e.stopPropagation();
    waPanel.classList.contains('open') ? closeWaPanel() : openWaPanel();
  });
  waClose.addEventListener('click', closeWaPanel);
  $$('.wa-option').forEach(opt => opt.addEventListener('click', () => sendToWhatsApp(opt.dataset.sede)));

  // Botones "Pedir" de las tarjetas del menú → abren el panel con el item precargado
  $$('[data-wa-item]').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Evita que el clic fuera del panel lo cierre de inmediato
    openWaPanel(btn.dataset.waItem);
  }));

  // Botones directos de cada sede en la Section 3
  $$('[data-wa-sede]').forEach(btn => btn.addEventListener('click', () => {
    currentOrderItem = null;
    sendToWhatsApp(btn.dataset.waSede);
  }));

  // CTA secundario del Hero → directo a WhatsApp
  const heroDelivery = $('#heroDelivery');
  if (heroDelivery) heroDelivery.addEventListener('click', () => {
    const msg = '¡Hola La Hamburguería de Víctor! 👋 Quiero hacer un pedido delivery. 🛵';
    window.open(`https://wa.me/${WA_NUMBERS.Bicentenario}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  // Cerrar panel con clic fuera o tecla Escape
  document.addEventListener('click', (e) => {
    if (waPanel.classList.contains('open') && !WA_WIDGET.contains(e.target)) closeWaPanel();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeWaPanel();
      navbar.classList.remove('menu-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* =========================================================
   7. AÑO DINÁMICO EN FOOTER
   ========================================================= */
$('#year').textContent = new Date().getFullYear();

/* =========================================================
   8. VIDEO HERO: REPETIR CADA 20 SEGUNDOS
   ========================================================= */
const heroVideo = document.getElementById('heroVideo');
if (heroVideo) {
  heroVideo.addEventListener('ended', () => {
    setTimeout(() => {
      heroVideo.currentTime = 0;
      heroVideo.play();
    }, 20000);
  });
}

/* =========================================================
   9. INDICADOR EN VIVO: ABIERTO / CERRADO (12 PM – 11 PM)
   ========================================================= */
const OPEN_HOUR = 12;  // 12:00 PM
const CLOSE_HOUR = 23; // 11:00 PM (a las 23:00 cierra)

function isRestaurantOpen() {
  const h = new Date().getHours();
  return h >= OPEN_HOUR && h < CLOSE_HOUR;
}

function updateStatusIndicators() {
  const open = isRestaurantOpen();
  $$('.status-indicator').forEach(el => {
    el.classList.toggle('open', open);
    el.classList.toggle('closed', !open);
    const text = $('.status-text', el);
    if (text) text.textContent = open ? 'Abierto' : 'Cerrado';
    el.setAttribute('aria-label', open ? 'Abierto ahora, de 12:00 PM a 11:00 PM' : 'Cerrado ahora, abre de 12:00 PM a 11:00 PM');
  });
}

updateStatusIndicators();
setInterval(updateStatusIndicators, 60 * 1000);

/* =========================================================
   10. BOTÓN FLOTANTE: VOLVER ARRIBA
   ========================================================= */
const toTop = $('#toTop');
if (toTop) {
  const toggleToTop = () => toTop.classList.toggle('show', window.scrollY > 400);
  window.addEventListener('scroll', toggleToTop, { passive: true });
  toggleToTop();

  toTop.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}