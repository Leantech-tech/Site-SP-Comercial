/**
 * SP Comercial - Interações da Landing Page
 */

(function () {
  'use strict';

  const header = document.getElementById('header');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.querySelector('.nav__menu');
  const navLinks = document.querySelectorAll('.nav__link');
  const hero = document.querySelector('.hero');
  const yearEl = document.getElementById('year');
  const revealElements = document.querySelectorAll('.reveal');

  // Atualiza ano no footer
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Header com sombra ao rolar
  function handleScroll() {
    if (window.scrollY > 20) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Menu mobile
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.contains('nav__menu--open');
      navMenu.classList.toggle('nav__menu--open');
      navToggle.setAttribute('aria-expanded', String(!isOpen));
    });
  }

  // Fechar menu ao clicar em um link
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('nav__menu--open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Marcar link ativo durante scroll
  function setActiveNav() {
    const scrollPos = window.scrollY + 120;

    navLinks.forEach(function (link) {
      const section = document.querySelector(link.getAttribute('href'));
      if (!section) return;

      const top = section.offsetTop;
      const height = section.offsetHeight;

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (l) { l.classList.remove('nav__link--active'); });
        link.classList.add('nav__link--active');
      }
    });
  }

  window.addEventListener('scroll', setActiveNav, { passive: true });

  // Efeito sutil de zoom na hero ao carregar
  if (hero) {
    window.addEventListener('load', function () {
      hero.classList.add('hero--loaded');
    });
  }

  // Animação reveal ao rolar
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });
})();
