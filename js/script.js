/* ========================================================
   مدرسة النجاح - بشار | Main JavaScript
   Handles: preloader, navbar, mobile menu, smooth scroll,
   scroll-reveal animations, animated counters, visitor
   counter (localStorage), registration form validation
   and success feedback, back-to-top button.
   ======================================================== */

(function () {
  'use strict';

  /* ======================================================
     1. PRELOADER
     Fades the loader out once the window has finished
     loading, then triggers the initial reveal animations.
     ====================================================== */
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');

  function hidePreloader() {
    if (!preloader) return;
    // Animate the bar to full width before fading out
    if (preloaderBar) preloaderBar.style.width = '100%';
    window.setTimeout(() => {
      preloader.classList.add('hidden-preloader');
      window.setTimeout(() => {
        preloader.style.display = 'none';
      }, 700);
    }, 400);
  }

  window.addEventListener('load', hidePreloader);
  // Fallback in case 'load' already fired or is delayed
  window.setTimeout(hidePreloader, 4000);

  /* ======================================================
     2. NAVBAR — solid background + shadow when scrolled
     ====================================================== */
  const navbar = document.getElementById('navbar');

  function updateNavbar() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('navbar-solid');
    } else {
      navbar.classList.remove('navbar-solid');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* ======================================================
     3. MOBILE MENU (hamburger toggle)
     ====================================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');

  function toggleMobileMenu(forceClose) {
    const isHidden = mobileMenu.classList.contains('hidden');
    const shouldOpen = forceClose ? false : isHidden;

    mobileMenu.classList.toggle('hidden', !shouldOpen);
    if (iconOpen) iconOpen.classList.toggle('hidden', shouldOpen);
    if (iconClose) iconClose.classList.toggle('hidden', !shouldOpen);
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => toggleMobileMenu());
  }

  // Close the mobile menu when any link inside it is clicked
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => toggleMobileMenu(true));
    });
  }

  /* ======================================================
     4. SCROLL-REVEAL ANIMATIONS
     Uses IntersectionObserver to add .is-visible when an
     element with the .reveal class enters the viewport.
     A safety net reveals anything left hidden (observer
     unavailable or throttled background tab) after 2.5s.
     ====================================================== */
  function revealElement(el) {
    el.classList.add('is-visible');
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            revealObserver.unobserve(entry.target); // reveal only once
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    function observeReveals() {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
        revealObserver.observe(el);
      });
    }

    // Observe reveal elements immediately on DOM ready too
    observeReveals();

    // Safety net: never leave content invisible if the observer
    // is delayed or fails to fire for elements already on screen
    window.setTimeout(() => {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          revealElement(el);
        }
      });
    }, 2500);
  } else {
    // No observer support: reveal everything right away
    document.querySelectorAll('.reveal').forEach(revealElement);
  }

  /* ======================================================
     5. ANIMATED COUNTERS
     Counts up from 0 to data-target when the #stats
     section becomes visible. Persists once animated.
     ====================================================== */
  const counters = document.querySelectorAll('.counter');
  const statsSection = document.getElementById('stats');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 2000; // ms
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease-out cubic for a smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value.toLocaleString('en-US');
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString('en-US');
      }
    }

    requestAnimationFrame(tick);
  }

  let countersAnimated = false;

  function initCounters() {
    if (countersAnimated || counters.length === 0) return;
    countersAnimated = true;
    counters.forEach(animateCounter);
  }

  if (statsSection && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          initCounters();
          statsObserver.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    statsObserver.observe(statsSection);
  } else {
    // Fallback: animate immediately if observer is unavailable
    initCounters();
  }

  /* ======================================================
     6. VISITOR COUNTER (persisted via localStorage)
     Increments once per browser/device and displays the
     total alongside a simulated base of previous visits.
     ====================================================== */
  const STORAGE_KEY = 'annajah_visitor_counted';
  const BASE_VISITS = 12794; // simulated historical visitor count
  let visitorTotal = BASE_VISITS;

  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, '1');
      visitorTotal += 1;
    }
  } catch (e) {
    // localStorage unavailable (private mode) — keep base count
    visitorTotal += 1;
  }

  const visitorCounterEl = document.querySelector('.counter[data-target="12847"]');
  if (visitorCounterEl) {
    visitorCounterEl.setAttribute('data-target', String(visitorTotal));
  }

  /* ======================================================
     7. SPECIALTY PRESELECTION
     Clicking "سجل في هذا التخصص" on a card scrolls to the
     registration form and pre-selects the matching option.
     ====================================================== */
  const specialtySelect = document.getElementById('specialty');

  document.querySelectorAll('.specialty-btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const specialty = this.getAttribute('data-specialty');
      if (specialty && specialtySelect) {
        // Defer pre-selection until the form is in the viewport
        window.setTimeout(() => {
          specialtySelect.value = specialty;
          // Briefly highlight the select for a nice UX touch
          specialtySelect.classList.add('ring-4', 'ring-gold-200');
          window.setTimeout(() => {
            specialtySelect.classList.remove('ring-4', 'ring-gold-200');
          }, 1600);
        }, 600);
      }
    });
  });

  /* ======================================================
     8. REGISTRATION FORM — validation & success feedback
     ====================================================== */
  const form = document.getElementById('registration-form');
  const successMessage = document.getElementById('success-message');
  const successDetail = document.getElementById('success-detail');
  const newRegistrationBtn = document.getElementById('new-registration');

  const fields = {
    lastname: { input: document.getElementById('lastname'), error: null, validate: validateName },
    firstname: { input: document.getElementById('firstname'), error: null, validate: validateName },
    phone: { input: document.getElementById('phone'), error: null, validate: validatePhone },
    specialty: { input: specialtySelect, error: null, validate: validateSpecialty },
    idcard: { input: document.getElementById('idcard'), error: null, validate: validateFile }
  };

  // Map each input to its inline error <p> sibling container
  Object.keys(fields).forEach((key) => {
    const input = fields[key].input;
    fields[key].error = input.closest('div').nextElementSibling;
  });

  /** Returns an Arabic error message, or empty string when valid. */
  function validateName(input) {
    return input.value.trim().length >= 2 ? '' : 'يرجى إدخال الاسم بشكل صحيح (حرفان على الأقل).';
  }

  function validatePhone(input) {
    // Accepts Algerian mobile numbers: 05/06/07 followed by 8 digits
    const value = input.value.replace(/[\s.-]/g, '');
    const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
    return phoneRegex.test(value) ? '' : 'يرجى إدخال رقم هاتف صحيح (يبدأ بـ 05 أو 06 أو 07 ويحتوي على 10 أرقام).';
  }

  function validateSpecialty(input) {
    return input.value ? '' : 'يرجى اختيار التخصص المطلوب.';
  }

  /** National ID upload: JPEG or PDF, max 5 MB. */
  function validateFile(input) {
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (!input.files || input.files.length === 0) {
      return 'يرجى رفع صورة بطاقة التعريف الوطنية (JPEG أو PDF).';
    }
    const file = input.files[0];
    const name = (file.name || '').toLowerCase();
    const validExt = /\.(jpe?g|pdf)$/.test(name);
    const validMime = !file.type || file.type === 'image/jpeg' || file.type === 'application/pdf';
    if (!validExt || !validMime) {
      return 'الصيغة غير مقبولة. يُقبل فقط JPEG و PDF.';
    }
    if (file.size > MAX_SIZE) {
      return 'حجم الملف كبير جداً (الحد الأقصى 5MB).';
    }
    return '';
  }

  /** Generates a sequential registration number, e.g. ANJ-2026-0001. */
  function nextRegNumber() {
    const KEY = 'annajah_reg_seq';
    const year = new Date().getFullYear();
    let seq = 1;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        seq = saved.year === year ? saved.seq + 1 : 1;
      }
      localStorage.setItem(KEY, JSON.stringify({ year: year, seq: seq }));
    } catch (e) {
      // localStorage unavailable — fall back to a random number
      seq = Math.floor(1000 + Math.random() * 9000);
      return 'ANJ-' + year + '-' + seq;
    }
    return 'ANJ-' + year + '-' + String(seq).padStart(4, '0');
  }

  /** Formats a File size for the dropzone label. */
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /** Shows or hides the inline error for a single field. */
  function setFieldState(key, isValid) {
    const field = fields[key];
    const input = field.input;
    const errorEl = field.error;

    // The file input is visually hidden: highlight its dropzone instead
    if (key === 'idcard') {
      const drop = document.getElementById('idcard-drop');
      if (drop) {
        drop.classList.toggle('drop-invalid', !isValid);
        if (isValid && input.files && input.files.length > 0) {
          drop.classList.add('drop-valid');
        } else {
          drop.classList.remove('drop-valid');
        }
      }
      input.setAttribute('aria-invalid', String(!isValid));
      if (errorEl) errorEl.classList.toggle('hidden', isValid);
      return;
    }

    if (isValid) {
      input.classList.remove('input-invalid');
      input.setAttribute('aria-invalid', 'false');
      if (errorEl) errorEl.classList.add('hidden');
    } else {
      input.classList.add('input-invalid');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.classList.remove('hidden');
    }
  }

  /** Validates a single field and returns boolean validity. */
  function validateField(key) {
    const field = fields[key];
    const message = field.validate(field.input);
    if (message) {
      // Show the specific message on the field's error element
      if (field.error) {
        field.error.textContent = message;
        field.error.classList.remove('hidden');
      }
      setFieldState(key, false);
      return false;
    }
    setFieldState(key, true);
    return true;
  }

  /** Validates all fields; focuses the first invalid one. */
  function validateAll() {
    let firstInvalid = null;
    Object.keys(fields).forEach((key) => {
      const isValid = validateField(key);
      if (!isValid && !firstInvalid) firstInvalid = fields[key].input;
    });
    if (firstInvalid) {
      // Never focus() a file input (it would open the picker): focus only text fields
      if (firstInvalid.type !== 'file') firstInvalid.focus();
      return false;
    }
    return true;
  }

  // Real-time feedback: re-validate a field as the user types
  Object.keys(fields).forEach((key) => {
    const input = fields[key].input;
    if (input.type === 'file') return; // the file input has its own change handler below
    const eventName = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventName, () => {
      if (input.classList.contains('input-invalid')) {
        validateField(key);
      }
    });
  });

  /** File picker feedback: show name/size and validate immediately. */
  const idcardInput = fields.idcard.input;
  const idcardLabel = document.getElementById('idcard-label');
  const idcardDefaultLabel = idcardLabel ? idcardLabel.textContent : '';

  if (idcardInput) {
    idcardInput.addEventListener('change', () => {
      if (idcardInput.files && idcardInput.files.length > 0) {
        const file = idcardInput.files[0];
        if (idcardLabel) {
          idcardLabel.textContent = file.name + ' (' + formatFileSize(file.size) + ')';
        }
      } else if (idcardLabel) {
        idcardLabel.textContent = idcardDefaultLabel;
      }
      validateField('idcard');
    });
  }

  /** Shows the success panel with the registration receipt and hides the form. */
  function showSuccess(data) {
    if (successDetail) {
      successDetail.textContent =
        'شكراً لك ' + data.firstname + ' ' + data.lastname +
        ' على ثقتك بمدرسة النجاح - بشار. رقم تسجيلك هو ' + data.regnum +
        '. سيتم الاتصال بك قريباً لتأكيد تسجيلك.';
    }
    setText('r-regnum', data.regnum);
    setText('r-lastname', data.lastname);
    setText('r-firstname', data.firstname);
    setText('r-phone', data.phone);
    setText('r-specialty', data.specialty);
    setText('r-date', new Date().toLocaleString('ar-DZ'));
    form.classList.add('hidden');
    if (successMessage) successMessage.classList.remove('hidden');
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /** Helper: fills a receipt row by element id. */
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  /** Resets the form and returns to it. */
  function resetForm() {
    form.reset();
    Object.keys(fields).forEach((key) => setFieldState(key, true));
    if (idcardLabel) idcardLabel.textContent = idcardDefaultLabel;
    if (successMessage) successMessage.classList.add('hidden');
    form.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (validateAll()) {
        showSuccess({
          lastname: fields.lastname.input.value.trim(),
          firstname: fields.firstname.input.value.trim(),
          phone: fields.phone.input.value.trim(),
          specialty: fields.specialty.input.value,
          regnum: nextRegNumber()
        });
      }
    });
  }

  if (newRegistrationBtn) {
    newRegistrationBtn.addEventListener('click', resetForm);
  }

  /* Print / save the receipt as PDF (browser print dialog → "Save as PDF") */
  const printBtn = document.getElementById('print-receipt');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  /* ======================================================
     9. BACK TO TOP BUTTON
     ====================================================== */
  const backToTop = document.getElementById('back-to-top');

  function updateBackToTop() {
    if (!backToTop) return;
    const show = window.scrollY > 500;
    backToTop.style.visibility = show ? 'visible' : 'hidden';
    backToTop.style.opacity = show ? '1' : '0';
  }

  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ======================================================
     10. FOOTER — dynamic copyright year
     ====================================================== */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
