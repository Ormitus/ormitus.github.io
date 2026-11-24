/* ALMA / עלמא — v7 behaviour. No dependencies; every page works as plain HTML without it. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* Mobile call bar: appears once the opening has scrolled away. */
  const opening = document.querySelector(".opening");
  const bar = document.querySelector(".m-bar");
  const onScroll = function () {
    if (bar) bar.classList.toggle("show", opening ? window.scrollY > opening.offsetHeight * 0.6 : true);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu: a real disclosure. Escape closes it and returns focus. */
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.getElementById("nav");
  if (menuBtn && nav) {
    const setMenu = function (open) {
      nav.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.querySelector(".lbl").textContent = open ? "סגירה" : "תפריט";
    };
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia("(min-width: 861px)").addEventListener("change", function () { setMenu(false); });
  }

  /* Films: the photograph stays until the visitor asks. Then the player opens over
     that same photograph, with sound, and a close button returns to the photograph. */
  /* Silent loops: a production's own film plays, muted, inside its frame while that frame
     is on screen. The photograph stays until Vimeo reports real playback, so a slow or
     blocked player never shows a black box. Skipped with reduced motion or Save-Data.
     Every loop has a pause control (WCAG 2.2.2). */
  const VIMEO = "https://player.vimeo.com";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  const loops = new Map();
  const makeLoop = function (stage) {
    const id = stage.getAttribute("data-loop");
    const wrap = document.createElement("div");
    wrap.className = "loop";
    wrap.style.setProperty("--ar", stage.getAttribute("data-ar") || "1.7778");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "loop-btn";
    btn.hidden = true;
    btn.textContent = "עצירת התנועה";
    let frame = null;
    let visible = false;
    let userPaused = false;
    let held = false;
    const send = function (method) { if (frame) frame.contentWindow.postMessage(JSON.stringify({ method: method }), VIMEO); };
    const sync = function () {
      if (!frame) return;
      const run = visible && !userPaused && !held && !document.hidden;
      send(run ? "play" : "pause");
    };
    const load = function () {
      frame = document.createElement("iframe");
      frame.src = VIMEO + "/video/" + id + "?background=1&autoplay=1&loop=1&muted=1&dnt=1";
      frame.title = stage.getAttribute("data-title") || "קטע מהסרט, ללא קול";
      frame.setAttribute("tabindex", "-1");
      frame.setAttribute("aria-hidden", "true");
      frame.allow = "autoplay";
      wrap.appendChild(frame);
      window.addEventListener("message", function (ev) {
        if (ev.origin !== VIMEO || ev.source !== frame.contentWindow) return;
        let data = ev.data;
        try { if (typeof data === "string") data = JSON.parse(data); } catch (x) { return; }
        if (!data || !data.event) return;
        if (data.event === "ready") { ["play", "timeupdate", "playProgress"].forEach(function (n) { frame.contentWindow.postMessage(JSON.stringify({ method: "addEventListener", value: n }), VIMEO); }); sync(); }
        if ((data.event === "play" || data.event === "timeupdate" || data.event === "playProgress") && !wrap.classList.contains("on") && !userPaused && !held) {
          wrap.classList.add("on");
          btn.hidden = false;
        }
      });
    };
    btn.addEventListener("click", function () {
      userPaused = !userPaused;
      btn.textContent = userPaused ? "הפעלת התנועה" : "עצירת התנועה";
      wrap.classList.toggle("on", !userPaused);
      sync();
    });
    stage.append(wrap, btn);
    const io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !frame) load();
      sync();
    }, { rootMargin: "200px 0px" });
    io.observe(stage);
    document.addEventListener("visibilitychange", sync);
    loops.set(stage, { hold: function (on) { held = on; if (on) wrap.classList.remove("on"); else if (!userPaused && frame) wrap.classList.add("on"); sync(); } });
  };
  if (!reduce && !saveData && "IntersectionObserver" in window) {
    document.querySelectorAll(".stage[data-loop]").forEach(makeLoop);
  }

  let openPlayer = null;
  const closePlayer = function () {
    if (!openPlayer) return;
    const { box, trigger } = openPlayer;
    box.remove();
    const loop = loops.get(box.parentElement || openPlayer.stage);
    if (loop) loop.hold(false);
    openPlayer = null;
    trigger.setAttribute("aria-expanded", "false");
    trigger.focus();
  };
  document.querySelectorAll("button[data-vimeo]").forEach(function (btn) {
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function () {
      closePlayer();
      const stage = document.querySelector(btn.getAttribute("data-stage"));
      if (!stage) { window.open("https://vimeo.com/" + btn.getAttribute("data-vimeo"), "_blank"); return; }
      const box = document.createElement("div");
      box.className = "player";
      const close = document.createElement("button");
      close.type = "button";
      close.className = "close";
      close.textContent = "סגירת הסרט";
      close.addEventListener("click", closePlayer);
      const f = document.createElement("iframe");
      f.src = "https://player.vimeo.com/video/" + btn.getAttribute("data-vimeo") + "?autoplay=1&title=0&byline=0&portrait=0&dnt=1";
      f.allow = "autoplay; fullscreen; picture-in-picture";
      f.allowFullscreen = true;
      f.title = btn.getAttribute("data-title") || "סרט";
      box.append(close, f);
      stage.appendChild(box);
      btn.setAttribute("aria-expanded", "true");
      openPlayer = { box: box, trigger: btn, stage: stage };
      if (loops.get(stage)) loops.get(stage).hold(true);
      if (stage.getBoundingClientRect().top < 0 || stage.getBoundingClientRect().bottom > window.innerHeight) {
        stage.scrollIntoView({ block: "nearest" });
      }
      close.focus();
    });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePlayer(); });

  /* What we produce: choosing a kind of event lights its quarter of the ring and
     shows its example in the centre. The ring of ALMA's words turns only with the
     scroll (no autonomous motion), and not at all with reduced motion. */
  const orbit = document.querySelector(".orbit");
  if (orbit) {
    const nodes = orbit.querySelectorAll(".orbit-node");
    const arcs = orbit.querySelectorAll(".arc");
    const panels = orbit.querySelectorAll(".orbit-panel");
    const select = function (i) {
      nodes.forEach(function (n) { n.setAttribute("aria-pressed", String(n.dataset.i === i)); });
      arcs.forEach(function (a) { a.classList.toggle("on", a.dataset.i === i); });
      panels.forEach(function (p) { p.classList.toggle("on", p.dataset.i === i); });
    };
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    nodes.forEach(function (n) {
      n.addEventListener("click", function () { select(n.dataset.i); });
      n.addEventListener("pointerenter", function () { if (fine.matches) select(n.dataset.i); });
    });
    select("0");
    const words = orbit.querySelector(".ring-words");
    if (words && !reduce) {
      let queued = false;
      const spin = function () {
        queued = false;
        const r = orbit.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        words.style.transform = "rotate(" + ((window.innerHeight - r.top) * -0.09).toFixed(2) + "deg)";
      };
      window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(spin); } }, { passive: true });
      spin();
    }
  }

  /* Review mode for ALMA: ?review=1 or the footer switch. Shows what is missing
     and which lines still need their sign-off. Visitors never see it by default. */
  const params = new URLSearchParams(location.search);
  let reviewOn = params.get("review") === "1";
  try { if (localStorage.getItem("alma.review") === "1") reviewOn = true; } catch (e) {}
  const setReview = function (on) {
    document.body.classList.toggle("review", on);
    if (!on) document.body.classList.remove("show-verify");
    try { localStorage.setItem("alma.review", on ? "1" : "0"); } catch (e) {}
  };
  setReview(reviewOn);
  document.querySelectorAll("[data-review-toggle]").forEach(function (b) {
    b.addEventListener("click", function () { setReview(!document.body.classList.contains("review")); });
  });
  const vBtn = document.getElementById("verify-toggle");
  if (vBtn) vBtn.addEventListener("click", function () {
    const on = document.body.classList.toggle("show-verify");
    vBtn.setAttribute("aria-pressed", String(on));
  });

  /* Contact form. NOT connected to a server: on a valid submit it opens WhatsApp
     with the brief written out; the visitor still presses send there. It never
     claims a message was sent. */
  const form = document.getElementById("brief");
  if (form) {
    const status = document.getElementById("form-status");
    const err = function (input, msg) {
      const box = document.getElementById(input.id + "-err");
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (box) box.textContent = msg || "";
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = form.elements.name;
      const phone = form.elements.phone;
      let first = null;
      if (!name.value.trim()) { err(name, "איך קוראים לכם?"); first = first || name; } else err(name);
      if (phone.value.replace(/\D/g, "").length < 9) { err(phone, "מספר טלפון לא שלם"); first = first || phone; } else err(phone);
      if (first) { status.textContent = "צריך לתקן שדה אחד או יותר."; first.focus(); return; }
      const type = (form.querySelector('input[name="type"]:checked') || {}).value;
      const lines = [
        "שלום עלמא, אשמח לדבר על אירוע.",
        "שם: " + name.value.trim(),
        "טלפון: " + phone.value.trim(),
        type ? "סוג: " + type : "",
        form.elements.when.value.trim() ? "מתי: " + form.elements.when.value.trim() : "",
        form.elements.note.value.trim() ? "\n" + form.elements.note.value.trim() : ""
      ].filter(Boolean).join("\n");
      const url = "https://wa.me/972525392032?text=" + encodeURIComponent(lines);
      /* "noopener" in the features string makes window.open return null even on success */
      const w = window.open(url, "_blank");
      if (w) { try { w.opener = null; } catch (x) {} }
      status.textContent = w
        ? "וואטסאפ נפתח עם הפרטים. ההודעה תישלח רק אחרי שתלחצו שליחה שם."
        : "הדפדפן חסם חלון חדש. ";
      if (!w) {
        const a = document.createElement("a");
        a.href = url; a.target = "_blank"; a.rel = "noopener"; a.textContent = "לפתיחת וואטסאפ";
        status.appendChild(a);
      }
    });
  }
})();
