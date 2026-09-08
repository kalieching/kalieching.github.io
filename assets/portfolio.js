const traceDialog = document.querySelector('#trace-dialog');
const traceLinks = document.querySelectorAll('[data-open-trace]');
if (traceDialog && typeof traceDialog.showModal === 'function') {
  traceLinks.forEach((traceLink) => traceLink.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    traceDialog.showModal();
  }));
  traceDialog.querySelector('[data-close-trace]').addEventListener('click', () => traceDialog.close());
  traceDialog.addEventListener('click', (event) => {
    const rect = traceDialog.getBoundingClientRect();
    if (event.target === traceDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) traceDialog.close();
  });
}

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

// Dim the stars themselves so the blue sky remains unchanged behind the text.
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
