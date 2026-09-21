/* =========================================================
   LA HAMBURGUERÍA DE VÍCTOR — script.js
   Vanilla JS ES6+ · Sin dependencias
   ========================================================= */
'use strict';

/* ---------- Helpers ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- Configuración de negocio ---------- */
const WA_NUMBERS = {
  Bicentenario: '584249023408',
  Tipuro:       '584128391771'
};
let currentOrderItem = null; // Producto seleccionado desde las tarjetas del menú

/* =========================================================
   1. NAVBAR: estado al scroll + menú móvil + hide-on-scroll (solo móvil en menu.html)
   ========================================================= */
const navbar   = $('#navbar');
const navToggle = $('#navToggle');

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  navbar.classList.toggle('scrolled', currentScrollY > 10);

  const isMobile = window.innerWidth < 900;

  if (isMobile && currentScrollY > 10 && !navbar.classList.contains('menu-open')) {
    navbar.classList.add('nav-hidden');
    document.body.classList.add('nav-hidden-active');
  } else {
    navbar.classList.remove('nav-hidden');
    document.body.classList.remove('nav-hidden-active');
  }
  lastScrollY = currentScrollY;
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
   3. FILTROS INTERACTIVOS DEL MENÚ (Lógica estilo Williams Bistro)
   ========================================================= */
const filterBtns = $$('.filter-btn');
const cards = $$('#menuGrid .card');

function countDishes() {
  const counts = { all: 0 };
  filterBtns.forEach(btn => {
    const f = btn.dataset.filter;
    if (f && f !== 'all') counts[f] = 0;
  });

  cards.forEach(card => {
    const cat = card.dataset.category;
    if (cat) {
      counts.all++;
      if (counts.hasOwnProperty(cat)) {
        counts[cat]++;
      }
    }
  });
  return counts;
}

function updateCounters() {
  const counts = countDishes();
  filterBtns.forEach(btn => {
    const filter = btn.dataset.filter;
    const countSpan = btn.querySelector('.filter-count');
    if (countSpan && counts.hasOwnProperty(filter)) {
      countSpan.textContent = counts[filter];
    }
  });
}

function applyFilter(category) {
  filterBtns.forEach(btn => {
    const isActive = btn.dataset.filter === category;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  cards.forEach(card => {
    const match = category === 'all' || card.dataset.category === category;
    card.classList.toggle('hidden', !match);
    if (match) {
      card.classList.remove('pop');
      void card.offsetWidth;
      card.classList.add('pop');
    }
  });

  updateCounters();

  setTimeout(() => {
    const menuSection = $('#menu');
    if (menuSection && category !== 'all') {
      const offset = 130;
      const top = menuSection.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    }
  }, 100);
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    applyFilter(btn.dataset.filter);
  });
});

updateCounters();

const hash = window.location.hash.replace('#', '');
if (hash) {
  const matchingBtn = filterBtns.find(b => b.dataset.filter === hash);
  if (matchingBtn) {
    applyFilter(hash);
  }
}

/* =========================================================
   4. CARRUSEL DE TESTIMONIOS / EVENTOS (flechas, puntos y autoplay)
   ========================================================= */
const tCarousel = $('#tCarousel');

if (tCarousel) {
  const tCards = $$('.t-card-slide', tCarousel);
  const tDots = $$('.dot', tCarousel);
  const totalCards = tCards.length;
  let tIndex = 0;
  let autoplayTimer = null;

  function goToTestimonial(i) {
    tIndex = (i + totalCards) % totalCards;
    tCards.forEach((c, idx) => c.classList.toggle('active', idx === tIndex));
    tDots.forEach((d, idx) => d.classList.toggle('active', idx === tIndex));
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => goToTestimonial(tIndex + 1), 4500);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  const tPrevBtn = $('#tPrev');
  const tNextBtn = $('#tNext');
  const tPrevMobileBtn = $('#tPrevMobile');
  const tNextMobileBtn = $('#tNextMobile');

  const handlePrev = () => {
    goToTestimonial(tIndex - 1);
    startAutoplay();
  };

  const handleNext = () => {
    goToTestimonial(tIndex + 1);
    startAutoplay();
  };

  if (tPrevBtn) tPrevBtn.addEventListener('click', handlePrev);
  if (tNextBtn) tNextBtn.addEventListener('click', handleNext);
  if (tPrevMobileBtn) tPrevMobileBtn.addEventListener('click', handlePrev);
  if (tNextMobileBtn) tNextMobileBtn.addEventListener('click', handleNext);

  tDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIdx = parseInt(dot.dataset.slide, 10);
      goToTestimonial(slideIdx);
      startAutoplay();
    });
  });

  tCarousel.addEventListener('mouseenter', stopAutoplay);
  tCarousel.addEventListener('mouseleave', startAutoplay);

  // Soporte para gestos táctiles (swipe) en móviles
  let touchStartX = 0;
  let touchEndX = 0;

  tCarousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  tCarousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 40;
    if (touchEndX < touchStartX - swipeThreshold) {
      goToTestimonial(tIndex + 1);
    } else if (touchEndX > touchStartX + swipeThreshold) {
      goToTestimonial(tIndex - 1);
    }
    startAutoplay();
  }, { passive: true });

  goToTestimonial(0);
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

  // Botón "Hacer Pedido Delivery" del Hero → abre el selector de sede
  const heroDelivery = $('#heroDelivery');
  if (heroDelivery) heroDelivery.addEventListener('click', (e) => {
    e.stopPropagation();
    openWaPanel();
  });

  // CTA: "Pedir por WhatsApp" del navbar → abre el selector de sede
  const navCta = $('.nav-cta[href*="wa.me"]');
  if (navCta) navCta.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openWaPanel();
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

/* =========================================================
    11. LIGHTBOX: IMAGEN EN GRANDE
    ========================================================= */
const lightbox = $('#lightbox');
const lightboxImg = $('#lightboxImg');
const lightboxClose = $('#lightboxClose');

if (lightbox && lightboxImg && lightboxClose) {
  $$('.grid-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
      }
    });
  });
  $$('.t-card-slide').forEach(slide => {
    slide.style.cursor = 'pointer';
    slide.addEventListener('click', () => {
      const img = slide.querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
      }
    });
  });

  lightboxClose.addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.classList.remove('open');
  });
}