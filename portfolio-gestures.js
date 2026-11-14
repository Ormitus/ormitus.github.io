/* Portfolio adaptations of the supplied DesignBookmark motion studies and Kokonut UI's Marker Text. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function onceInView(element, play) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      if (document.documentElement.hasAttribute('data-loading')) return;
      observer.disconnect();
      loader.disconnect();
      if (!reduced.matches) play();
    });
    const loader = new MutationObserver(() => {
      if (!document.documentElement.hasAttribute('data-loading')) {
        observer.unobserve(element);
        observer.observe(element);
      }
    });
    loader.observe(document.documentElement, { attributes: true, attributeFilter: ['data-loading'] });
    observer.observe(element);
  }

  function weightWave(title) {
    const original = title.textContent;
    const layer = document.createElement('span');
    layer.setAttribute('aria-hidden', 'true');
    layer.className = 'weight-wave-letters';
    const letters = [];
    for (const word of original.split(/(\s+)/u)) {
      if (!word.trim()) { layer.append(word); continue; }
      const run = document.createElement('span');
      run.className = 'weight-wave-word';
      for (const char of Array.from(word)) {
        const glyph = document.createElement('span');
        glyph.className = 'weight-wave-glyph';
        glyph.textContent = char;
        glyph.dataset.glyph = char;
        
        run.append(glyph);
        letters.push(glyph);
      }
      layer.append(run);
    }
    const accessible = document.createElement('span');
    accessible.className = 'gesture-original';
    accessible.textContent = original;
    title.replaceChildren(accessible, layer);
    title.dataset.letterWave = '';
    let frame = 0, centres = [], pointer = 0;
    function paint() {
      frame = 0;
      if (reduced.matches) return;
      const radius = Math.max(35, Math.min(90, title.offsetWidth * .29));
      letters.forEach((el, i) => {
        const distance = (pointer - centres[i]) / radius;
        el.style.setProperty('--wave', Math.exp(-distance * distance * 2).toFixed(3));
      });
    }
    title.addEventListener('pointerenter', e => {
      if (e.pointerType === 'touch' || reduced.matches) return;
      centres = letters.map(el => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2;
      });
      pointer = e.clientX;
      paint();
    });
    title.addEventListener('pointermove', e => {
      if (!centres.length || reduced.matches) return;
      pointer = e.clientX;
      if (!frame) frame = requestAnimationFrame(paint);
    });
    title.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      centres = [];
      letters.forEach(el => el.style.removeProperty('--wave'));
    });
    // One visible pass introduces the gesture on devices without a hover state.
    onceInView(title, () => letters.forEach((el, i) => {
      el.animate([{offset:0,webkitTextStrokeWidth:'0px'}, {offset:.47,webkitTextStrokeWidth:'.065em'}, {offset:1,webkitTextStrokeWidth:'0px'}],
        {duration:540, delay:i * Math.min(36, 360 / letters.length), easing:'ease-in-out'});
    }));
  }

  function scramble(label, trigger) {
    const text = label.textContent;
    if (!text.trim() || label.children.length) return;
    const source = document.createElement('span');
    source.textContent = text;
    const overlay = document.createElement('span');
    overlay.setAttribute('aria-hidden', 'true');
    label.classList.add('decode-label');
    label.replaceChildren(source, overlay);
    const glyphs = 'ABCDEFGHJKMNPQRSTUVWXZ0123456789';
    let timer = 0;
    function finish() {
      clearInterval(timer);
      timer = 0;
      label.classList.remove('decoding');
      overlay.textContent = '';
    }
    function play() {
      if (reduced.matches || timer) return;
      const start = performance.now();
      label.classList.add('decoding');
      const tick = () => {
        const progress = (performance.now() - start) / 560;
        if (progress >= 1 || reduced.matches) { finish(); return; }
        overlay.textContent = Array.from(text, (c, i) =>
          i < progress * text.length || !/[a-z\d]/i.test(c) ? c : glyphs[Math.floor(Math.random() * glyphs.length)]
        ).join('');
      };
      timer = setInterval(tick, 52);
      tick();
    }
    onceInView(label, play);
    trigger.addEventListener('pointerenter', play);
  }

  function readAlong(paragraph) {
    // Only plain introductory copy is selected. Links and inline emphasis keep their own behavior.
    if (paragraph.children.length) return;
    paragraph.classList.add('read-along');
    const words = [];
    const fragment = document.createDocumentFragment();
    for (const text of paragraph.textContent.split(/(\s+)/u)) {
      if (!text.trim()) { fragment.append(text); continue; }
      const span = document.createElement('span');
      span.textContent = text;
      fragment.append(span);
      words.push(span);
    }
    const pill = document.createElement('i');
    pill.setAttribute('aria-hidden', 'true');
    paragraph.replaceChildren(fragment, pill);
    let timer, previous, visible = false;
    function stop() { clearTimeout(timer); pill.style.opacity = 0; previous = undefined; }
    function show(i) {
      clearTimeout(timer);
      if (reduced.matches || !visible || !words[i]) { stop(); return; }
      const word = words[i];
      // After a wrap, start the marker on the new line instead of crossing the paragraph.
      if (previous !== word.offsetTop) {
        pill.style.transition = 'none';
        pill.style.transform = 'translate(' + (word.offsetLeft - 2) + 'px,' + word.offsetTop + 'px) scaleX(.55)';
        pill.getBoundingClientRect();
      }
      previous = word.offsetTop;
      pill.style.transition = '';
      pill.style.width = word.offsetWidth + 4 + 'px';
      pill.style.height = word.offsetHeight + 'px';
      pill.style.opacity = 1;
      pill.style.transform = 'translate(' + (word.offsetLeft - 2) + 'px,' + word.offsetTop + 'px)';
      timer = setTimeout(() => show(i + 1), 145 + Math.min(12, word.textContent.length) * 25);
    }
    let played = false;
    function startReading() {
      if (visible && !played && !document.documentElement.hasAttribute('data-loading')) {
        played = true;
        show(0);
      }
    }
    onceInView(paragraph, startReading);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) stop();
      else startReading();
    }, {threshold:.4}).observe(paragraph);
    paragraph.addEventListener('click', e => {
      const i = words.indexOf(e.target);
      if (i >= 0) show(i);
    });
    reduced.addEventListener('change', stop);
  }

  function markHeadline(heading) {
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    let last;
    while (walker.nextNode()) if (walker.currentNode.textContent.trim()) last = walker.currentNode;
    if (!last) return;
    const match = /\S+\s*$/u.exec(last.textContent);
    if (!match) return;
    const finalWord = last.splitText(match.index);
    const mark = document.createElement('span');
    mark.className = 'drawn-marker';
    finalWord.replaceWith(mark);
    mark.append(finalWord);
    onceInView(mark, () => mark.classList.add('ink-on'));
  }

  function meltText(element, old, next) {
    if (!element || !old || old === next) return;
    if (!element.classList.contains('goo-counter')) {
      element.style.setProperty('--goo-ink', getComputedStyle(element).color);
      element.classList.add('goo-counter');
    }
    element.dataset.old = old;
    element.dataset.next = next;
    element.classList.remove('goo-changing');
    element.getBoundingClientRect();
    element.classList.add('goo-changing');
    element.onanimationend = e => {
      if (e.animationName === 'goo-arrive') element.classList.remove('goo-changing');
    };
  }

  // Both viewers call this from their existing browse function, so clicks and arrow keys
  // share one index. A five-item window is usable even with 75 posters on a phone.
  const viewers = new WeakMap();
  function updateViewer(dialog, index, total, go, counter) {
    if (total < 2) return;
    let state = viewers.get(dialog);
    if (!state) {
      const rail = document.createElement('div');
      rail.className = 'page-dot-rail';
      rail.setAttribute('role','group');
      rail.setAttribute('aria-label','Gallery pages');
      const indicator = document.createElement('i');
      indicator.setAttribute('aria-hidden','true');
      const dots = [];
      for (let i = 0; i < Math.min(5,total); i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.addEventListener('click', () => go(Number(dot.dataset.page)));
        dots.push(dot);
        rail.append(dot);
      }
      rail.append(indicator);
      counter.classList.add('goo-counter');
      counter.style.setProperty('--goo-ink', getComputedStyle(counter).color);
      counter.before(rail);
      state = {rail,dots,counter,previous:null};
      viewers.set(dialog,state);
    }
    const start = clamp(index - 2, 0, total - state.dots.length);
    state.dots.forEach((dot, i) => {
      const page = start+i;
      dot.dataset.page = page;
      dot.setAttribute('aria-label','Go to image '+(page+1)+' of '+total);
      dot.setAttribute('aria-current',page === index ? 'true' : 'false');
    });
    const from = state.previous;
    const slot = index - start;
    state.rail.style.setProperty('--slot',slot);
    const indicator = state.rail.lastElementChild;
    if (from !== null && from !== index && !reduced.matches && dialog.open) {
      indicator.getAnimations().forEach(a => a.cancel());
      const dir = Math.sign(index-from);
      indicator.animate([{scale:'1 1'},{scale:'2.1 .86',translate:(-dir*3)+'px 0'},{scale:'1 1'}],{duration:360,easing:'ease-out'});
      meltText(counter, (from + 1) + ' / ' + total, (index + 1) + ' / ' + total);
      const caption = dialog.querySelector('.art-viewer-caption, #poster-title');
      meltText(caption, state.caption, caption?.textContent);
    }
    state.caption = dialog.querySelector('.art-viewer-caption, #poster-title')?.textContent;
    state.previous = index;
  }

  function fitProjectHeadings() {
    const headings = [...document.querySelectorAll('main [data-fit-title], main h2')]
      .filter(heading => heading.textContent.trim() && !heading.closest('dialog'));
    if (!headings.length) return;
    const range = document.createRange();
    function fit() {
      for (const heading of headings) {
        heading.style.removeProperty('font-size');
        heading.style.removeProperty('white-space');
        const width = heading.clientWidth;
        if (!width) continue;
        const style = getComputedStyle(heading);
        const available = width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const baseSize = parseFloat(style.fontSize);
        heading.style.whiteSpace = 'nowrap';
        range.selectNodeContents(heading);
        const required = range.getBoundingClientRect().width;
        if (required > available && available > 0) {
          let size = baseSize;
          for (let pass = 0; pass < 4; pass++) {
            const measured = range.getBoundingClientRect().width;
            if (measured <= available) break;
            size *= (available - 2) / measured;
            heading.style.fontSize = size + 'px';
          }
        }
      }
    }
    let frame;
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    }
    headings.forEach(heading => heading.classList.add('fitted-heading'));
    fit();
    // Responsive project grids can settle after fonts, images and chapter scripts load.
    const widths = new WeakMap();
    const observer = new ResizeObserver(entries => {
      let changed = false;
      for (const {target, contentRect} of entries) {
        if (widths.get(target) !== contentRect.width) changed = true;
        widths.set(target, contentRect.width);
      }
      if (changed) schedule();
    });
    headings.forEach(heading => observer.observe(heading));
    window.addEventListener('resize', schedule);
    document.fonts.ready.then(schedule);
  }

  function init() {
    // Threshold the alpha of the overlapping blurred layers to produce the liquid join.
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    defs.setAttribute('aria-hidden', 'true');
    defs.setAttribute('width','0');
    defs.setAttribute('height','0');
    defs.style.position = 'absolute';
    defs.innerHTML = '<defs><filter id="portfolio-goo" x="-15%" y="-50%" width="130%" height="200%"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -5"/></filter></defs>';
    document.body.append(defs);
    document.querySelectorAll('.hero-work-list strong').forEach(weightWave);
    document.querySelectorAll('.hero-work-list small').forEach(label => scramble(label, label.closest('a,button').querySelector('strong')));
    document.querySelectorAll('.nav-project,.info-name .eyebrow').forEach(label => scramble(label,label));
    const intro = [...document.querySelectorAll('.info-lead,.intro-story p,.hta-intro p:not(.project-scope):not(.visual-note),.chapter .copy p,.project-dossier .overview-copy p')].find(p => !p.children.length && p.textContent.trim().split(/\s+/).length >= 6);
    if (intro) readAlong(intro);
    document.querySelectorAll('.info-statement h1,.chapter-intro h2,.section-intro h2,.collection-heading h2,.intro-story h2,.argo-section-heading h2').forEach(markHeadline);
    fitProjectHeadings();
  }
  window.PortfolioGestures = {init,updateViewer};
})();
