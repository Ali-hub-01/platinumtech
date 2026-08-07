/* ============================================================
   PLATINUM TECHNOLOGY - interactions
   Vanilla JS, no dependencies. Performance & reduced-motion aware.
   ============================================================ */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 700px)').matches;

  /* ---------- Year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Header scrolled state + flow rail + FAB ---------- */
  var header = document.getElementById('siteHeader');
  var rail = document.querySelector('.flow-rail__fill');
  var fab = document.getElementById('fab');
  var ticking = false;

  function onScroll() {
    var sc = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', sc > 40);
    if (rail) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (sc / h) * 100 : 0;
      rail.style.width = p + '%';
    }
    if (fab) fab.classList.toggle('show', sc > window.innerHeight * 0.9);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('primaryNav');
  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Count-up numbers ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduced) { el.textContent = target + suffix; return; }
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Hero embers ---------- */
  var embers = document.getElementById('embers');
  if (embers && !reduced) {
    var count = isMobile ? 14 : 26;
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'ember';
      var size = 2 + Math.random() * 4;
      s.style.left = Math.random() * 100 + '%';
      s.style.width = s.style.height = size + 'px';
      s.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
      s.style.animationDuration = (5 + Math.random() * 7) + 's';
      s.style.animationDelay = (-Math.random() * 10) + 's';
      embers.appendChild(s);
    }
  }

  /* ---------- Parallax (desktop only, rAF) ---------- */
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !reduced && !isMobile && 'IntersectionObserver' in window) {
    var active = [];
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var img = en.target.querySelector('img');
        if (!img) return;
        if (en.isIntersecting) { if (active.indexOf(en.target) < 0) active.push(en.target); }
        else { active = active.filter(function (a) { return a !== en.target; }); }
      });
    }, { threshold: 0 });
    parallaxEls.forEach(function (el) {
      var img = el.querySelector('img');
      if (img) { img.style.willChange = 'transform'; img.style.transform = 'scale(1.12)'; }
      pio.observe(el);
    });
    var pTick = false;
    window.addEventListener('scroll', function () {
      if (pTick) return;
      pTick = true;
      requestAnimationFrame(function () {
        var vh = window.innerHeight;
        active.forEach(function (el) {
          var r = el.getBoundingClientRect();
          var prog = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
          var img = el.querySelector('img');
          if (img) img.style.transform = 'scale(1.12) translateY(' + (prog * -22) + 'px)';
        });
        pTick = false;
      });
    }, { passive: true });
  }

  /* ---------- Fuel selector (БМК) ---------- */
  var fuelWrap = document.getElementById('fuel');
  if (fuelWrap) {
    var chips = fuelWrap.querySelectorAll('.chip');
    var readText = fuelWrap.querySelector('.fuel__text');
    var flame = fuelWrap.querySelector('.fuel__flame');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var wasActive = chip.classList.contains('active');
        chips.forEach(function (c) { c.classList.remove('active'); });
        if (wasActive) {
          if (readText) readText.textContent = 'Выберите вид топлива';
          return;
        }
        chip.classList.add('active');
        if (readText) readText.textContent = 'Топливо: ' + chip.getAttribute('data-fuel');
        if (flame && !reduced) {
          flame.style.transform = 'scaleY(1.5)';
          setTimeout(function () { flame.style.transform = ''; }, 260);
        }
      });
    });
  }

  /* ---------- Power slider (ДГУ) ---------- */
  var range = document.getElementById('powerRange');
  var powerNum = document.getElementById('powerNum');
  if (range && powerNum) {
    function updatePower() {
      var v = parseInt(range.value, 10);
      powerNum.textContent = v;
      var pct = ((v - range.min) / (range.max - range.min)) * 100;
      range.style.setProperty('--pct', pct + '%');
    }
    range.addEventListener('input', updatePower);
    updatePower();
  }

  /* ---------- Lead form (mailto compose, no backend) ---------- */
  var form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.name && form.name.value || '').trim();
      var phone = (form.phone && form.phone.value || '').trim();
      var topic = form.topic ? form.topic.value : '';
      var msg = (form.message && form.message.value || '').trim();

      if (!name || !phone) {
        var firstEmpty = !name ? form.name : form.phone;
        if (firstEmpty) firstEmpty.focus();
        return;
      }

      var subject = 'Заявка на ТКП - ' + topic;
      var body = 'Имя: ' + name + '\n' +
                 'Телефон: ' + phone + '\n' +
                 'Направление: ' + topic + '\n' +
                 (msg ? 'Задача: ' + msg + '\n' : '') +
                 '\n(Отправлено с сайта Platinum Technology)';
      var href = 'mailto:sales@platinumtech.kz?subject=' +
                 encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

      var ok = document.getElementById('leadOk');
      if (ok) ok.hidden = false;
      window.location.href = href;
    });
  }
})();
