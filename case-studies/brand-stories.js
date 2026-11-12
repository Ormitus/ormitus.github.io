const root = document.documentElement;
const chapters = [...document.querySelectorAll('.chapter-nav a')];
let scheduled = false;
function updateReading() {
  const max = root.scrollHeight - innerHeight;
  root.style.setProperty('--read-progress', String(max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0));
  let current = chapters[0];
  for (const link of chapters) {
    const section = document.querySelector(link.getAttribute('href'));
    if (section && section.getBoundingClientRect().top <= 180) current = link;
  }
  for (const link of chapters) link.setAttribute('aria-current', String(link === current));
  scheduled = false;
}
function queueReading() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); }
}
addEventListener('scroll', queueReading, { passive: true });
addEventListener('resize', queueReading);
addEventListener('load', queueReading);
updateReading();

const familyButtons = [...document.querySelectorAll('[data-family]')];
const familyPanels = [...document.querySelectorAll('[data-family-panel]')];
for (const button of familyButtons) {
  button.addEventListener('click', () => {
    for (const other of familyButtons) other.setAttribute('aria-pressed', String(other === button));
    for (const panel of familyPanels) panel.hidden = panel.dataset.familyPanel !== button.dataset.family;
  });
}
