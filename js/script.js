(function () {
  'use strict';

  window.addEventListener('error', function(event) {
    console.error('A&T Runtime Error:', event.error);
    showToast('Script Error: ' + (event.message || 'Check console for details'));
  });

  document.body.classList.add('js-ready');

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const DOT_R = 4;
  const RING_R = 18;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;
  let cursorHasMoved = false;

  document.addEventListener('mousemove', e => {
    if (!cursorHasMoved) {
      document.body.classList.add('cursor-active');
      rx = e.clientX;
      ry = e.clientY;
      cursorHasMoved = true;
    }
    mx = e.clientX;
    my = e.clientY;
  });

  (function tick() {
    if (dot) dot.style.transform = `translate(${mx - DOT_R}px, ${my - DOT_R}px)`;
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    if (ring) ring.style.transform = `translate(${rx - RING_R}px, ${ry - RING_R}px)`;
    requestAnimationFrame(tick);
  })();

  document.querySelectorAll('a, button, .svc-tile, .team-card, .metric-cell, .pillar, .contact-item, .wa-float').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
    el.addEventListener('focus', () => document.body.classList.add('cur-hover'));
    el.addEventListener('blur', () => document.body.classList.remove('cur-hover'));
  });

  const emailUser = 'info';
  const emailDomain = 'aandtgroup.co.za';
  const fullEmail = emailUser + '@' + emailDomain;
  document.querySelectorAll('[data-email]').forEach(el => {
    el.textContent = fullEmail;
    const anchor = el.closest('a');
    if (anchor) anchor.href = 'mailto:' + fullEmail;
  });

  const nav = document.getElementById('nav');
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navAs = Array.from(document.querySelectorAll('.nav-links a'));

  // Reveal Intersection Observer
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  document.querySelectorAll('.rv').forEach(el => observer.observe(el));

  // Magnetic Button Effect
  document.querySelectorAll('.btn-teal, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 140) cur = s.id; });
    navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${cur}`));
  }, { passive: true });

  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mob-menu');
  function closeMenu() {
    if (ham) {
      ham.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
    }
    if (mob) mob.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (ham) {
    ham.addEventListener('click', () => {
      const open = ham.classList.toggle('open');
      if (mob) mob.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }
  document.addEventListener('click', e => {
    if (ham && !ham.contains(e.target) && mob && !mob.contains(e.target)) closeMenu();
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (id === '#') {
        e.preventDefault();
        return;
      }
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      closeMenu();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  let tt;
  function showToast(m) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = m;
    toast.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => toast.classList.remove('show'), 4500);
  }

  const form = document.getElementById('contact-form');
  const formBody = document.getElementById('form-body');
  const formOk = document.getElementById('form-ok');
  let formStatus = document.getElementById('form-status');
  const subBtn = document.getElementById('sub-btn');
  const resetBtn = document.getElementById('reset-btn');

  if (form && !formStatus) {
    formStatus = document.createElement('div');
    formStatus.id = 'form-status';
    formStatus.className = 'form-status';
    formStatus.setAttribute('aria-live', 'polite');
    if (subBtn && subBtn.parentNode === form) {
      form.insertBefore(formStatus, subBtn);
    } else {
      form.appendChild(formStatus);
    }
  }

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function setErr(fId, eId, show) {
    const field = document.getElementById(fId);
    if (field) field.classList.toggle('err', show);
    const msg = document.getElementById(eId);
    if (msg) msg.style.display = show ? 'block' : 'none';
  }
  function setStatus(message, isError) {
    if (!formStatus) return;
    formStatus.textContent = message || '';
    formStatus.classList.toggle('is-error', !!isError);
    formStatus.classList.toggle('is-success', !!message && !isError);
  }

  if (form) {
    form.addEventListener('submit', function(e) {
      const canUseAjax =
        window.location.protocol !== 'file:' &&
        /^https?:$/.test(window.location.protocol) &&
        typeof window.fetch === 'function';
      if (!canUseAjax) return;

      e.preventDefault();

      const nameEl = document.getElementById('fn');
      const emailEl = document.getElementById('fe');
      const msgEl = document.getElementById('fm');
      if (!nameEl || !emailEl || !msgEl) {
        setStatus('Form inputs are missing. Please refresh and try again.', true);
        return;
      }

      const name = nameEl.value.trim();
      const email = emailEl.value.trim();
      const msg = msgEl.value.trim();

      let ok = true;
      setStatus('', false);
      setErr('fn', 'fn-err', !name); if (!name) ok = false;
      setErr('fe', 'fe-err', !validEmail(email)); if (!validEmail(email)) ok = false;
      setErr('fm', 'fm-err', !msg); if (!msg) ok = false;
      if (!ok) {
        setStatus('Please correct the highlighted fields.', true);
        return;
      }

      if (!subBtn) return;
      subBtn.disabled = true;
      const originalBtnHtml = subBtn.innerHTML;
      subBtn.innerHTML = '<svg width="15" height="15" style="animation:spin 1s linear infinite" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Sending...';
      setStatus('Sending your message...', false);

      const formData = new FormData(form);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      }).then(response => {
        clearTimeout(timeoutId);
        if (response.ok) {
          if (formBody) formBody.style.display = 'none';
          if (formOk) formOk.style.display = 'block';
          setStatus('', false);
          showToast('Message sent successfully.');
          form.reset();
          return;
        }

        response.json().then(data => {
          const errorMsg = (data && data.errors)
            ? data.errors.map(err => err.message).join(', ')
            : 'Submission failed';
          setStatus(errorMsg, true);
          showToast(errorMsg);
        }).catch(() => {
          const fallbackMsg = 'Error: ' + response.status;
          setStatus(fallbackMsg, true);
          showToast(fallbackMsg);
        });
      }).catch(error => {
        clearTimeout(timeoutId);
        console.error('A&T Form: Network error', error);
        setStatus('Connection issue detected. Submitting directly...', true);
        showToast(error.name === 'AbortError'
          ? 'Request timed out, retrying via direct submit...'
          : 'Network error, retrying via direct submit...');
        HTMLFormElement.prototype.submit.call(form);
      }).finally(() => {
        subBtn.disabled = false;
        subBtn.innerHTML = originalBtnHtml;
      });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', e => {
      e.preventDefault();
      if (formBody) formBody.style.display = 'block';
      if (formOk) formOk.style.display = 'none';
      setStatus('', false);
      if (form) form.reset();
    });
  }
})();
