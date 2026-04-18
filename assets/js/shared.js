/* ═══════════════════════════════════════════════════════
   ORMITUS STUDIO — SHARED INTERACTIONS + ANIMATIONS
   Include after GSAP on every project page + index.html
═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOVER   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ─── Inject back-arrow span into .nav-back ─── */
  document.querySelectorAll('.nav-back').forEach(function (el) {
    el.innerHTML = el.innerHTML.replace(/←/, '<span class="back-arrow">←</span>');
  });

  /* ─── Page transition curtain ─── */
  var curtain = document.getElementById('sp-curtain');
  var HAS_GSAP = typeof gsap !== 'undefined';

  function curtainEnter(href) {
    if (!curtain || !HAS_GSAP || REDUCED) { window.location.href = href; return; }
    sessionStorage.setItem('sp-nav', '1');
    curtain.style.pointerEvents = 'all';
    curtain.style.transformOrigin = 'bottom';
    gsap.fromTo(curtain,
      { scaleY: 0 },
      { scaleY: 1, duration: .52, ease: 'power3.inOut',
        onComplete: function () { window.location.href = href; } }
    );
  }

  function curtainExit() {
    if (!curtain) return;
    if (HAS_GSAP && !REDUCED) {
      curtain.style.transformOrigin = 'top';
      gsap.set(curtain, { scaleY: 1 });
      gsap.to(curtain, {
        scaleY: 0, duration: .72, ease: 'power3.inOut', delay: .04,
        onComplete: function () { curtain.style.pointerEvents = 'none'; }
      });
    } else {
      curtain.style.transform = 'scaleY(0)';
      curtain.style.pointerEvents = 'none';
    }
  }

  if (sessionStorage.getItem('sp-nav')) {
    sessionStorage.removeItem('sp-nav');
    curtainExit();
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href) return;
    if (href.charAt(0) === '#') return;
    if (/^(mailto:|tel:|http)/.test(href)) return;
    if (link.getAttribute('target') === '_blank') return;
    e.preventDefault();
    curtainEnter(href);
  });

  window.spNavigate = curtainEnter;

  /* ═══════════════════════════════════
     INTERSECTION OBSERVER SYSTEM
  ═══════════════════════════════════ */

  /* Skip-class containers for image reveals (3D mockups, icons, above-fold) */
  var SKIP_SELECTORS = [
    '.mockup-scene', '.single-mockup-scene', '.mockup-wrap', '.single-mockup-wrap',
    '.book-inner', '.book-page', '.vinyl', '.vinyl-record',
    '.poster-item', '.poster-grid',
    '.hero-inner', '.dog-annotation', '.annotation-svg',
    '#float-img', '#loader', '#hapoel-toggle-wrap',
    '.glyph-cell', '.glyph-grid',
    '.hapoel-knob', 'nav'
  ];

  /* ── Image clip-path reveal ── */
  var imgObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('sp-visible');
        imgObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

  /* Auto-inject sp-img-reveal on qualifying images */
  if (!REDUCED) {
    document.querySelectorAll('img[src]').forEach(function (img) {
      /* Skip images inside 3D scenes, icons, or already-animated containers */
      for (var i = 0; i < SKIP_SELECTORS.length; i++) {
        if (img.closest(SKIP_SELECTORS[i])) return;
      }
      /* Skip above-fold images (currently visible in viewport) */
      var rect = img.getBoundingClientRect();
      if (rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0) return;
      img.classList.add('sp-img-reveal');
      imgObs.observe(img);
    });
  }

  /* ── Element entrance reveals (.sp-enter) ── */
  var enterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('sp-visible');
        enterObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.sp-enter').forEach(function (el) {
    if (REDUCED) { el.classList.add('sp-visible'); return; }
    enterObs.observe(el);
  });

  /* ── Overview strip stagger (.sp-stagger) ── */
  var staggerObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('sp-visible');
        staggerObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.sp-stagger').forEach(function (el) {
    if (REDUCED) { el.classList.add('sp-visible'); return; }
    staggerObs.observe(el);
  });

  /* ── Next Project footer ── */
  var nextWrap = document.querySelector('.sp-next-wrap');
  if (nextWrap) {
    if (REDUCED) {
      nextWrap.classList.add('sp-visible');
    } else {
      var nextObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          nextWrap.classList.add('sp-visible');
          nextObs.disconnect();
        }
      }, { threshold: 0.2 });
      nextObs.observe(nextWrap);
    }
  }

  /* ── Pause looping animations off-screen ── */
  /* (marquee strip on index.html) */
  var marquee = document.querySelector('.marquee-track');
  if (marquee) {
    var marqObs = new IntersectionObserver(function (entries) {
      marquee.style.animationPlayState =
        entries[0].isIntersecting ? 'running' : 'paused';
    });
    marqObs.observe(marquee);
  }

})();
