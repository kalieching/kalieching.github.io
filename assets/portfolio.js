// Keep every project available without JavaScript; default to selected work when enhanced.
const workToggle = document.querySelector('[data-work-toggle]');
const workTitle = document.querySelector('#work-title');
const otherWork = [...document.querySelectorAll('[data-other-work]')];
if (workToggle && workTitle) {
  const showWork = (showAll) => {
    otherWork.forEach((project) => { project.hidden = !showAll; });
    workTitle.textContent = showAll ? 'All work' : 'Selected work';
    workToggle.textContent = showAll ? 'Show selected work' : 'Show all work';
    workToggle.setAttribute('aria-expanded', String(showAll));
  };
  const linksToOtherWork = () => otherWork.some((project) => location.hash === `#${project.id}`);
  showWork(linksToOtherWork());
  workToggle.hidden = false;
  workToggle.addEventListener('click', () => showWork(workToggle.getAttribute('aria-expanded') !== 'true'));
  window.addEventListener('hashchange', () => {
    if (linksToOtherWork()) showWork(true);
  });
}

// Load animated project previews only when a visitor chooses to play them.
document.querySelectorAll('[data-preview-toggle]').forEach((button) => {
  const preview = document.getElementById(button.getAttribute('aria-controls'));
  if (!preview || !preview.dataset.previewSrc) return;
  const poster = preview.getAttribute('src');
  button.hidden = false;
  button.addEventListener('click', () => {
    const playing = button.dataset.playing === 'true';
    preview.src = playing ? poster : preview.dataset.previewSrc;
    button.dataset.playing = String(!playing);
    button.setAttribute('aria-label', `${playing ? 'Play' : 'Stop'} ${button.dataset.previewName} preview`);
  });
});

// Fade the scroll cue as the introduction leaves the viewport.
const scrollCue = document.querySelector('.scroll-cue');
const aboutSection = document.querySelector('#about');
if (scrollCue && aboutSection) {
  let pending = false;
  const updateCue = () => {
    const progress = Math.max(0, -aboutSection.getBoundingClientRect().top);
    const opacity = Math.max(0, 1 - progress / 120);
    scrollCue.style.opacity = opacity;
    scrollCue.style.visibility = opacity === 0 ? 'hidden' : 'visible';
    pending = false;
  };
  window.addEventListener('scroll', () => {
    if (!pending) {
      pending = true;
      requestAnimationFrame(updateCue);
    }
  }, { passive: true });
  window.addEventListener('pageshow', updateCue);
  updateCue();
}

// Soften nearby stars while preserving the sky behind the text.
const introContent = document.querySelector('.intro-content');
const stars = [...document.querySelectorAll('.star-field span')];
if (introContent && stars.length) {
  let shadePending = false;
  const shadeStars = () => {
    const bounds = introContent.getBoundingClientRect();
    const positions = stars.map(star => star.getBoundingClientRect());
    stars.forEach((star, index) => {
      const point = positions[index];
      const x = point.left + point.width / 2;
      const y = point.top + point.height / 2;
      const dx = Math.max(bounds.left - 12 - x, 0, x - bounds.right - 12);
      const dy = Math.max(bounds.top - 12 - y, 0, y - bounds.bottom - 12);
      const distance = Math.hypot(dx, dy);
      const t = Math.min(1, distance / 64);
      const fade = t * t * (3 - 2 * t);
      star.style.setProperty('--star-visibility', .30 + .70 * fade);
    });
    shadePending = false;
  };
  const scheduleShade = () => {
    if (!shadePending) {
      shadePending = true;
      requestAnimationFrame(shadeStars);
    }
  };
  window.addEventListener('scroll', scheduleShade, { passive: true });
  window.addEventListener('resize', scheduleShade);
  window.addEventListener('pageshow', scheduleShade);
  new ResizeObserver(scheduleShade).observe(introContent);
  document.fonts.ready.then(scheduleShade);
  scheduleShade();
}
