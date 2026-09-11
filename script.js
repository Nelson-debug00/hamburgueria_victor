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
const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

$$('main section[id], footer[id]').forEach(sec => spyObserver.observe(sec));

/* =========================================================
   3. FILTROS INTERACTIVOS DEL MENÚ
   ========================================================= */
const filterBtns = $$('.filter-btn');
const cards = $$('#menuGrid .card');

filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

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
const slides = $$('.slide', track);
const dotsWrap = $('#carDots');
const carousel = $('#carousel');
let carIndex = 0;
let carTimer = null;

// Construcción dinámica de dots
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.setAttribute('aria-label', `Ir al evento ${i + 1}`);
  dot.addEventListener('click', () => goToSlide(i, true));
  dotsWrap.appendChild(dot);
});
const dots = $$('button', dotsWrap);

function goToSlide(i, manual = false) {
  carIndex = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${carIndex * 100}%)`;
  dots.forEach((d, idx) => d.classList.toggle('active', idx === carIndex));
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

function openWaPanel(item = null) {
  currentOrderItem = item;
  waItemText.textContent = item
    ? `Pedirás: ${item}. Elige tu sede para enviar el pedido:`
    : 'Elige tu sede y te atendemos al instante por WhatsApp.';
  waPanel.classList.add('open');
  waFab.setAttribute('aria-expanded', 'true');
}
function closeWaPanel() {
  waPanel.classList.remove('open');
  waFab.setAttribute('aria-expanded', 'false');
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
$$('[data-wa-item]').forEach(btn => btn.addEventListener('click', () => openWaPanel(btn.dataset.waItem)));

// Botones directos de cada sede en la Section 3
$$('[data-wa-sede]').forEach(btn => btn.addEventListener('click', () => {
  currentOrderItem = null;
  sendToWhatsApp(btn.dataset.waSede);
}));

// CTA secundario del Hero
$('#heroDelivery').addEventListener('click', () => openWaPanel());

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