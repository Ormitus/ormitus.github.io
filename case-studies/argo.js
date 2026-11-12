document.querySelectorAll('.argo-version-toggle button').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.argo-iteration');
    card.querySelectorAll('[data-version]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    card.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== button.dataset.version; });
  });
});

// Open the documentation before following a deep link into its contents.
function revealTarget(hash) {
  const target = hash && document.getElementById(hash.slice(1));
  if (!target) return;
  let parent = target.parentElement;
  while (parent) {
    if (parent.tagName === 'DETAILS') parent.open = true;
    parent = parent.parentElement;
  }
}
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => revealTarget(link.hash)));
window.addEventListener('hashchange', () => revealTarget(location.hash));
revealTarget(location.hash);
