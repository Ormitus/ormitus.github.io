/* ═══════════════════════════════════════════════════════
   ORMITUS STUDIO — SHARED INTERACTIONS
   Include after GSAP on every project page + index.html
═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── Inject back-arrow span into .nav-back ─── */
  document.querySelectorAll('.nav-back').forEach(function (el) {
    el.innerHTML = el.innerHTML.replace(/←/, '<span class="back-arrow">←</span>');
  });

  /* ─── Page transition curtain ─── */
  var curtain = document.getElementById('sp-curtain');
  var HAS_GSAP = typeof gsap !== 'undefined';

  /* curtainEnter: cover screen → navigate */
  function curtainEnter(href) {
    if (!curtain || !HAS_GSAP) { window.location.href = href; return; }
    sessionStorage.setItem('sp-nav', '1');
    curtain.style.pointerEvents = 'all';
    curtain.style.transformOrigin = 'bottom';
    gsap.fromTo(curtain,
      { scaleY: 0 },
      { scaleY: 1, duration: .52, ease: 'power3.inOut',
        onComplete: function () { window.location.href = href; } }
    );
  }

  /* curtainExit: instantly full → retract upward (page arrival) */
  function curtainExit() {
    if (!curtain) return;
    if (HAS_GSAP) {
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

  /* Only reveal-animate if we arrived via a transition link */
  if (sessionStorage.getItem('sp-nav')) {
    sessionStorage.removeItem('sp-nav');
    curtainExit();
  }

  /* Intercept all <a href> clicks */
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

  /* index.html project rows (data-href, not anchors) */
  window.spNavigate = curtainEnter;


})();
