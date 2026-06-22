(async () => {
  'use strict';

  async function loadTranslations() {
    const response = await fetch('data/translations.json');

    if (!response.ok) {
      throw new Error(`Gagal memuat terjemahan: ${response.status}`);
    }

    return response.json();
  }

  const translations = await loadTranslations();
  const root = document.documentElement;
  const navbar = document.getElementById('navbar');
  const menuButton = document.getElementById('menuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const languageSelect = document.getElementById('languageSelect');
  const backToTop = document.getElementById('backToTop');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const mobileLinks = [...document.querySelectorAll('.mobile-link')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const projectGalleries = [...document.querySelectorAll('.project-gallery')];
  const projectLightbox = document.getElementById('projectLightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxStage = document.getElementById('lightboxStage');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxMeta = document.getElementById('lightboxMeta');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxDots = document.getElementById('lightboxDots');
  let activeLightboxGallery = null;
  let activeLightboxIndex = 0;
  let lightboxReturnFocus = null;
  let currentLanguage = localStorage.getItem('portfolio-language') || 'id';

  function t(key) {
    return translations[currentLanguage]?.[key] || translations.id[key] || key;
  }

  function applyLanguage(language) {
    currentLanguage = translations[language] ? language : 'id';
    root.lang = currentLanguage;
    localStorage.setItem('portfolio-language', currentLanguage);
    languageSelect.value = currentLanguage;

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const value = t(element.dataset.i18n);
      if (value !== undefined) element.textContent = value;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const value = t(element.dataset.i18nHtml);
      if (value !== undefined) element.innerHTML = value;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
      element.setAttribute('aria-label', t(element.dataset.i18nAria));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      element.title = t(element.dataset.i18nTitle);
    });

    document.title = t('pageTitle');
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('pageDescription'));
    updateMenuAria(mobileMenu.classList.contains('open'));
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    refreshGalleryLanguage();
    if (projectLightbox.classList.contains('open')) updateLightbox();
  }

  languageSelect.addEventListener('change', event => applyLanguage(event.target.value));

  // Theme: saved preference > OS preference > dark default.
  const savedTheme = localStorage.getItem('portfolio-theme');
  const preferredTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  setTheme(preferredTheme);

  function setTheme(theme) {
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('portfolio-theme', theme);
    themeIcon.innerHTML = theme === 'dark'
      ? '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z"/>'
      : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>';
  }

  themeToggle.addEventListener('click', () => {
    themeIcon.classList.add('rotate');
    setTimeout(() => {
      setTheme(root.classList.contains('dark') ? 'light' : 'dark');
      themeIcon.classList.remove('rotate');
    }, 140);
  });

  function updateMenuAria(isOpen) {
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', t(isOpen ? 'closeMenu' : 'openMenu'));
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    updateMenuAria(false);
    document.body.style.overflow = '';
  }

  menuButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    updateMenuAria(isOpen);
  });

  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth >= 1024) closeMenu(); });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    document.querySelectorAll('.reveal').forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 5, 4) * 65}ms`;
      revealObserver.observe(element);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
  }

  function onScroll() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('nav-scrolled', scrollY > 18);
    backToTop.classList.toggle('show', scrollY > 650);
    let current = 'home';
    sections.forEach(section => {
      if (scrollY >= section.offsetTop - 170) current = section.id;
    });
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    toastMessage.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
  }


  function getGallerySlides(gallery) {
    return [...gallery.querySelectorAll('.project-slide')];
  }

  function refreshGalleryLanguage() {
    projectGalleries.forEach(gallery => {
      const slides = getGallerySlides(gallery);
      const projectTitle = gallery.dataset.projectTitle || '';
      gallery.setAttribute('role', 'region');
      gallery.setAttribute('aria-label', `${t('projectGallery')}: ${projectTitle}`);
      slides.forEach((slide, index) => {
        const title = slide.dataset.slideTitle || '';
        slide.setAttribute('aria-label', `${t('openImage')} ${index + 1} ${t('imageOf')} ${slides.length}: ${title}`);
      });
      gallery.querySelectorAll('.gallery-dot').forEach((dot, index) => {
        dot.setAttribute('aria-label', `${t('openImage')} ${index + 1} ${t('imageOf')} ${slides.length}`);
      });
    });
  }

  function updateGallery(gallery, nextIndex) {
    const slides = getGallerySlides(gallery);
    if (!slides.length) return;
    const index = (nextIndex + slides.length) % slides.length;
    gallery.dataset.currentIndex = String(index);
    gallery.querySelector('.project-track').style.transform = `translateX(-${index * 100}%)`;
    gallery.querySelector('.gallery-count').textContent = `${index + 1} / ${slides.length}`;
    slides.forEach((slide, slideIndex) => {
      slide.setAttribute('aria-hidden', String(slideIndex !== index));
      slide.tabIndex = slideIndex === index ? 0 : -1;
    });
    gallery.querySelectorAll('.gallery-dot').forEach((dot, dotIndex) => {
      const isActive = dotIndex === index;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
      dot.tabIndex = isActive ? 0 : -1;
    });
  }

  function initializeProjectGalleries() {
    projectGalleries.forEach(gallery => {
      const slides = getGallerySlides(gallery);
      const dots = gallery.querySelector('.gallery-dots');
      if (!slides.length || !dots) return;

      slides.forEach((slide, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'gallery-dot';
        dot.setAttribute('role', 'tab');
        dot.addEventListener('click', event => {
          event.stopPropagation();
          updateGallery(gallery, index);
        });
        dots.appendChild(dot);
        slide.addEventListener('click', () => openLightbox(gallery, index, slide));
      });

      gallery.querySelector('.gallery-prev').addEventListener('click', event => {
        event.stopPropagation();
        updateGallery(gallery, Number(gallery.dataset.currentIndex) - 1);
      });
      gallery.querySelector('.gallery-next').addEventListener('click', event => {
        event.stopPropagation();
        updateGallery(gallery, Number(gallery.dataset.currentIndex) + 1);
      });

      let touchStartX = 0;
      gallery.addEventListener('touchstart', event => {
        touchStartX = event.changedTouches[0].clientX;
      }, { passive: true });
      gallery.addEventListener('touchend', event => {
        const distance = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(distance) < 42) return;
        updateGallery(gallery, Number(gallery.dataset.currentIndex) + (distance < 0 ? 1 : -1));
      }, { passive: true });

      let autoPlayTimer;
      const stopAutoPlay = () => clearInterval(autoPlayTimer);
      const startAutoPlay = () => {
        stopAutoPlay();
        if (reduceMotion || slides.length < 2) return;
        autoPlayTimer = setInterval(() => {
          if (document.hidden || projectLightbox.classList.contains('open')) return;
          updateGallery(gallery, Number(gallery.dataset.currentIndex) + 1);
        }, 6500);
      };
      gallery.addEventListener('mouseenter', stopAutoPlay);
      gallery.addEventListener('mouseleave', startAutoPlay);
      gallery.addEventListener('focusin', stopAutoPlay);
      gallery.addEventListener('focusout', startAutoPlay);
      startAutoPlay();
      updateGallery(gallery, 0);
    });
    refreshGalleryLanguage();
  }

  function openLightbox(gallery, index, sourceElement) {
    activeLightboxGallery = gallery;
    activeLightboxIndex = index;
    lightboxReturnFocus = sourceElement || document.activeElement;
    updateLightbox();
    projectLightbox.classList.add('open');
    projectLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => lightboxClose.focus(), 30);
  }

  function updateLightbox() {
    if (!activeLightboxGallery) return;
    const slides = getGallerySlides(activeLightboxGallery);
    if (!slides.length) return;
    activeLightboxIndex = (activeLightboxIndex + slides.length) % slides.length;
    const slide = slides[activeLightboxIndex];
    const shot = slide.querySelector('.project-shot');
    lightboxStage.replaceChildren(shot.cloneNode(true));
    lightboxTitle.textContent = `${activeLightboxGallery.dataset.projectTitle} — ${slide.dataset.slideTitle}`;
    lightboxMeta.textContent = `${activeLightboxIndex + 1} ${t('imageOf')} ${slides.length}`;
    lightboxDots.replaceChildren();
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `gallery-dot${index === activeLightboxIndex ? ' active' : ''}`;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', String(index === activeLightboxIndex));
      dot.setAttribute('aria-label', `${t('openImage')} ${index + 1} ${t('imageOf')} ${slides.length}`);
      dot.addEventListener('click', () => {
        activeLightboxIndex = index;
        updateLightbox();
      });
      lightboxDots.appendChild(dot);
    });
  }

  function closeLightbox() {
    projectLightbox.classList.remove('open');
    projectLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxStage.replaceChildren();
    activeLightboxGallery = null;
    if (lightboxReturnFocus) lightboxReturnFocus.focus();
  }

  lightboxBackdrop.addEventListener('click', closeLightbox);
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => {
    activeLightboxIndex -= 1;
    updateLightbox();
  });
  lightboxNext.addEventListener('click', () => {
    activeLightboxIndex += 1;
    updateLightbox();
  });
  document.addEventListener('keydown', event => {
    if (!projectLightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') {
      activeLightboxIndex -= 1;
      updateLightbox();
    }
    if (event.key === 'ArrowRight') {
      activeLightboxIndex += 1;
      updateLightbox();
    }
  });

  document.querySelectorAll('.demo-button').forEach(button => {
    button.addEventListener('click', () => showToast(t('demoMissing')));
  });

  // Message-only contact form. mailto opens Gmail when configured, or the user's default email app.
  const form = document.getElementById('contactForm');
  const messageField = document.getElementById('message');
  const messageError = document.getElementById('messageError');
  const charCount = document.getElementById('charCount');
  const submitButton = document.getElementById('submitButton');
  const submitText = document.getElementById('submitText');
  const sendIcon = document.getElementById('sendIcon');
  const loadingIcon = document.getElementById('loadingIcon');
  const destinationEmail = 'fajarcahyadiputra3@gmail.com';

  function setMessageError(message = '') {
    messageField.classList.toggle('error', Boolean(message));
    messageError.textContent = message;
    messageError.classList.toggle('hidden', !message);
  }

  function validateMessage() {
    const message = messageField.value.trim();
    setMessageError();
    if (message.length < 15) {
      setMessageError(t('messageRequired'));
      return false;
    }
    if (message.length > 1000) {
      setMessageError(t('messageTooLong'));
      return false;
    }
    return true;
  }

  messageField.addEventListener('input', () => {
    if (messageField.classList.contains('error')) setMessageError();
    charCount.textContent = `${messageField.value.length} / 1000`;
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateMessage()) {
      showToast(t('formInvalid'));
      messageField.focus();
      return;
    }

    submitButton.disabled = true;
    submitText.textContent = t('sending');
    sendIcon.classList.add('hidden');
    loadingIcon.classList.remove('hidden');
    showToast(t('openingEmail'));

    const body = `${t('emailBodyIntro')}\n\n${messageField.value.trim()}\n\n${t('emailBodyClosing')}`;
    const mailtoUrl = `mailto:${destinationEmail}?subject=${encodeURIComponent(t('emailSubject'))}&body=${encodeURIComponent(body)}`;

    setTimeout(() => {
      window.location.href = mailtoUrl;
      submitButton.disabled = false;
      submitText.textContent = t('sendMessage');
      sendIcon.classList.remove('hidden');
      loadingIcon.classList.add('hidden');
    }, 450);
  });

  initializeProjectGalleries();
  applyLanguage(currentLanguage);
})();


