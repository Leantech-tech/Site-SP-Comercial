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

  // Filtro Interativo da Galeria
  const filterBtns = document.querySelectorAll('.gallery__filter-btn');
  const allGalleryItems = document.querySelectorAll('.gallery__item');

  if (filterBtns.length && allGalleryItems.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const filter = btn.getAttribute('data-filter');

        filterBtns.forEach(function (b) { b.classList.remove('gallery__filter-btn--active'); });
        btn.classList.add('gallery__filter-btn--active');

        allGalleryItems.forEach(function (item) {
          const category = item.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            item.style.display = '';
            setTimeout(function () {
              item.style.opacity = '1';
              item.style.transform = '';
            }, 10);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            setTimeout(function () {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  // Lightbox da galeria
  const lightbox = document.getElementById('lightbox');
  const galleryItems = document.querySelectorAll('.gallery__item');

  if (lightbox && galleryItems.length) {
    const lightboxImage = lightbox.querySelector('.lightbox__image');
    const lightboxLabel = lightbox.querySelector('.lightbox__caption-label');
    const lightboxTitle = lightbox.querySelector('.lightbox__caption-title');
    const lightboxCounter = lightbox.querySelector('.lightbox__counter');
    const btnPrev = lightbox.querySelector('.lightbox__btn--prev');
    const btnNext = lightbox.querySelector('.lightbox__btn--next');
    const btnClose = lightbox.querySelector('.lightbox__btn--close');
    const items = Array.prototype.slice.call(galleryItems);
    const total = items.length;

    let currentIndex = 0;
    let lastFocusedElement = null;
    let touchStartX = 0;

    function renderSlide(index) {
      const item = items[index];
      const img = item.querySelector('img');

      lightboxImage.src = img.currentSrc || img.src;
      lightboxImage.alt = img.alt;
      lightboxLabel.textContent = item.getAttribute('data-caption-label') || '';
      lightboxTitle.textContent = item.getAttribute('data-caption-title') || '';
      lightboxCounter.textContent = (index + 1) + ' / ' + total;
      currentIndex = index;
    }

    function openLightbox(index) {
      lastFocusedElement = document.activeElement;
      renderSlide(index);
      lightbox.classList.add('lightbox--open');
      document.body.style.overflow = 'hidden';
      btnClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('lightbox--open');
      document.body.style.overflow = '';
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }

    function showNext() {
      renderSlide((currentIndex + 1) % total);
    }

    function showPrev() {
      renderSlide((currentIndex - 1 + total) % total);
    }

    items.forEach(function (item, index) {
      item.addEventListener('click', function () {
        openLightbox(index);
      });

      item.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    btnNext.addEventListener('click', showNext);
    btnPrev.addEventListener('click', showPrev);

    lightbox.querySelectorAll('[data-lightbox-close]').forEach(function (el) {
      el.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', function (event) {
      if (!lightbox.classList.contains('lightbox--open')) return;

      switch (event.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          showNext();
          break;
        case 'ArrowLeft':
          showPrev();
          break;
        case 'Tab': {
          // Mantém o foco dentro do lightbox
          const focusable = [btnClose, btnPrev, btnNext];
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
          break;
        }
      }
    });

    // Navegação por gesto (swipe) em telas touch
    lightbox.addEventListener('touchstart', function (event) {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (event) {
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) < 50) return;

      if (deltaX < 0) {
        showNext();
      } else {
        showPrev();
      }
    }, { passive: true });
  }
})();
