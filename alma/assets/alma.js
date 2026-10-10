/* ALMA / עלמא — behaviour. No dependencies. Everything degrades to plain HTML. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header hairline once the page moves */
  var head = document.querySelector(".site-head");
  var bar = document.querySelector(".m-bar");
  var hero = document.querySelector(".hero, .p-hero");
  function onScroll() {
    var y = window.scrollY;
    if (head) head.classList.toggle("scrolled", y > 8);
    if (bar && hero) bar.classList.toggle("show", y > hero.offsetHeight * 0.6);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu: a real disclosure, closes on Escape and on link choice */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  if (menuBtn && nav) {
    function setMenu(open) {
      nav.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.querySelector(".lbl").textContent = open ? "סגירה" : "תפריט";
    }
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia("(min-width: 901px)").addEventListener("change", function () { setMenu(false); });
  }

  /* Rise-on-enter. Once only; never blocks content (no JS → visible) */
  var risers = document.querySelectorAll(".rise");
  if (reduce || !("IntersectionObserver" in window)) {
    risers.forEach(function (el) { el.classList.add("in"); });
  } else {
    /* Arches start fully clipped and horizons at scaleX(0); the observer reports
       those as never intersecting, so watch their parent instead. */
    var watched = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        (watched.get(en.target) || []).forEach(function (el) { el.classList.add("in"); });
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    risers.forEach(function (el) {
      var t = el.matches(".arch, .horizon") ? el.parentElement : el;
      if (!watched.has(t)) { watched.set(t, []); io.observe(t); }
      watched.get(t).push(el);
    });
  }

  /* Vimeo facade: poster until the visitor asks. Then the real player, with sound
     because they chose it. A plain link to Vimeo is always present as fallback. */
  document.querySelectorAll("button.vid[data-vimeo]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-vimeo");
      var f = document.createElement("iframe");
      f.src = "https://player.vimeo.com/video/" + id + "?autoplay=1&title=0&byline=0&portrait=0&dnt=1";
      f.allow = "autoplay; fullscreen; picture-in-picture";
      f.allowFullscreen = true;
      f.title = btn.getAttribute("data-title") || "וידאו";
      var shell = document.createElement("div");
      shell.className = btn.className.replace("vid", "vid is-playing");
      shell.appendChild(f);
      btn.replaceWith(shell);
      f.focus();
    });
  });

  /* Review layer: show which content is verified vs. needs ALMA's confirmation */
  var vBtn = document.getElementById("verify-toggle");
  if (vBtn) {
    vBtn.addEventListener("click", function () {
      var on = document.body.classList.toggle("show-verify");
      vBtn.setAttribute("aria-pressed", String(on));
    });
  }

  /* Contact form.
     NOT connected to a server. On a valid submit it opens WhatsApp with the brief
     pre-written; the visitor still presses send there. We never show "sent". */
  var form = document.getElementById("brief");
  if (form) {
    var status = document.getElementById("form-status");
    var WA = "972525392032";
    function err(input, msg) {
      var box = document.getElementById(input.id + "-err");
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (box) box.textContent = msg || "";
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name, phone = form.elements.phone;
      var ok = true, first = null;
      if (!name.value.trim()) { err(name, "איך קוראים לכם?"); ok = false; first = first || name; } else err(name);
      var digits = phone.value.replace(/[^\d+]/g, "");
      if (digits.replace(/\D/g, "").length < 9) { err(phone, "מספר טלפון לא שלם"); ok = false; first = first || phone; } else err(phone);
      if (!ok) { status.textContent = "יש שדה אחד או יותר שצריך לתקן."; first.focus(); return; }

      var type = (form.querySelector('input[name="type"]:checked') || {}).value || "—";
      var lines = [
        "שלום עלמא, אשמח לדבר על אירוע.",
        "שם: " + name.value.trim(),
        "טלפון: " + phone.value.trim(),
        form.elements.company.value.trim() ? "חברה: " + form.elements.company.value.trim() : "",
        "סוג: " + type,
        form.elements.when.value.trim() ? "מתי: " + form.elements.when.value.trim() : "",
        form.elements.guests.value ? "משתתפים: " + form.elements.guests.value : "",
        form.elements.note.value.trim() ? "\n" + form.elements.note.value.trim() : ""
      ].filter(Boolean).join("\n");
      var url = "https://wa.me/" + WA + "?text=" + encodeURIComponent(lines);
      /* "noopener" in the features string makes window.open return null even on
         success, so detach the opener by hand instead */
      var w = window.open(url, "_blank");
      if (w) { try { w.opener = null; } catch (x) {} }
      status.textContent = w
        ? "פתחנו וואטסאפ עם הפרטים. ההודעה תישלח רק אחרי שתלחצו שליחה שם."
        : "הדפדפן חסם חלון חדש. אפשר לפתוח את וואטסאפ מהקישור כאן למטה, או להתקשר.";
      if (!w) {
        var a = document.createElement("a");
        a.href = url; a.target = "_blank"; a.rel = "noopener"; a.textContent = " פתיחת וואטסאפ";
        status.appendChild(a);
      }
    });
  }
})();
