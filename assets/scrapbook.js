(() => {
  const board = document.querySelector('.scrapbook-board');
  if (!board) return;
  const pieces = [...board.querySelectorAll('.scrap')];
  const dialog = document.querySelector('.scrapbook-dialog');
  const status = document.querySelector('[data-scrapbook-status]');
  const storageKey = 'kalie-desk-v6';
  const player = document.querySelector('.tape-player');
  const $ = selector => player.querySelector(selector);
  const television = $('.television'), playback = $('.tape-playback'), standby = $('.tv-standby'), notice = $('.playback-notice');
  const playButton = $('.play-tape'), ejectButton = $('.eject-tape');
  const currentTape = $('.current-tape'), currentArtist = $('.current-artist'), playerState = $('.player-state');
  let loadedTape = null, dragFrame = 0;
  let saved = {}, sizeBucket = 0, width = 0, height = 0, topLayer = 0, active = null;
  try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch {}
  if (typeof saved !== 'object' || Array.isArray(saved)) saved = {};
  const positions = new Map();
  const clamp = (n, min, max) => Math.max(min, Math.min(Math.max(min, max), n));
  const title = piece => piece.querySelector('h3').textContent.replace(/\s+/g, ' ').trim();
  // A small seeded generator (FNV-1a hash into mulberry32) keeps the default layout the same on every visit.
  function seeded(text) {
    let a = 2166136261;
    for (const ch of text) a = Math.imul(a ^ ch.charCodeAt(0), 16777619);
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function standbyScreen(message) {
    standby.hidden = false;
    $('.screen-status').textContent = message;
  }
  function stopPlayback() {
    playback.replaceChildren(); playback.hidden = true;
    playButton.textContent = '▶ Play';
  }
  // Load a tape into the player, or eject the current one when piece is null.
  function setTape(piece) {
    loadedTape = piece;
    stopPlayback();
    notice.hidden = true;
    pieces.forEach(p => p.classList.toggle('is-loaded', p === piece));
    player.classList.toggle('has-tape', !!piece);
    // The screen flickers for as long as a tape waits on TAPE READY.
    player.classList.toggle('is-tuning', !!piece);
    standbyScreen(piece ? 'TAPE READY' : 'NO TAPE');
    $('.slot-label').textContent = piece ? 'CASSETTE LOADED' : 'INSERT CASSETTE';
    playerState.textContent = piece ? 'Tape loaded' : '';
    playButton.disabled = ejectButton.disabled = !piece;
    currentTape.hidden = currentArtist.hidden = !piece;
    currentTape.textContent = piece ? title(piece) : '';
    currentArtist.textContent = piece ? piece.dataset.creator : '';
  }
  function loadTape(piece, reveal = false) {
    setTape(piece);
    status.textContent = `${title(piece)} is in the VHS player. Press Play to watch.`;
    if (reveal) {
      // Bring the TV into view only when it is off screen (it sits above the desk on narrow layouts).
      const r = player.getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight) player.scrollIntoView({ behavior:'instant', block:'center' });
      playButton.focus({ preventScroll:true });
    }
  }
  playButton.addEventListener('click', () => {
    if (!loadedTape) return;
    if (!playback.hidden) {
      stopPlayback();
      playerState.textContent = 'Tape stopped';
      standbyScreen('STOP');
      return;
    }
    if (location.protocol === 'file:') {
      notice.textContent = 'YouTube needs a web preview. Open this page through localhost to play it.';
      notice.hidden = false;
      return;
    }
    player.classList.remove('is-tuning');
    const url = new URL(loadedTape.querySelector('.scrap-source').href);
    const videoId = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
    if (!/^[\w-]{11}$/.test(videoId || '')) return;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1`;
    iframe.title = `Watch ${title(loadedTape)}`;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    playback.replaceChildren(iframe); playback.hidden = false; standby.hidden = true;
    playButton.textContent = '■ Stop';
    playerState.textContent = 'Use the controls on the TV screen';
  });
  ejectButton.addEventListener('click', () => {
    const previous = loadedTape;
    setTape(null);
    previous?.querySelector('.scrap-open').focus();
    status.textContent = 'Tape returned to the desk.';
  });
  function bounds(piece) {
    const angle = Math.abs(Number(piece.dataset.tilt)) * Math.PI / 180;
    const x = Math.max(14, (Math.sin(angle) * piece.offsetHeight + (Math.cos(angle) - 1) * piece.offsetWidth) / 2 + 5);
    return { x, y:28, maxX:width - piece.offsetWidth - x, maxY:height - piece.offsetHeight - 28 };
  }
  // Tapes move freely while dragged so they can reach the TV; everything else stays on the desk.
  function move(piece, x, y, free = false) {
    const b = bounds(piece);
    const point = free ? { x, y } : { x:clamp(x, b.x, b.maxX), y:clamp(y, b.y, b.maxY) };
    positions.set(piece, point);
    piece.style.setProperty('--left', `${point.x}px`);
    piece.style.setProperty('--top', `${point.y}px`);
  }
  function remember() {
    saved[sizeBucket] = Object.fromEntries(pieces.map(piece => {
      const p = positions.get(piece), b = bounds(piece);
      return [piece.dataset.piece, { x:(p.x - b.x) / Math.max(1, b.maxX - b.x), y:(p.y - b.y) / Math.max(1, b.maxY - b.y), z:Number(piece.style.zIndex) || 1 }];
    }));
    try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch {}
  }
  function layout() {
    const nextWidth = board.clientWidth;
    if (!nextWidth) return;
    if (sizeBucket && positions.size) remember();
    width = nextWidth;
    // Responsive size buckets also keep saved desktop and phone positions separate.
    sizeBucket = width >= 800 ? 3 : width >= 540 ? 2 : 1;
    pieces.forEach(piece => { piece.style.width = `${Math.min(250, width - 58) * Number(piece.dataset.width)}px`; });
    // scrollHeight includes overhanging details such as a bookmark.
    const sizes = pieces.map(piece => ({ w:piece.offsetWidth, h:piece.offsetHeight, overhang:Math.max(0, piece.scrollHeight - piece.offsetHeight) }));
    // Overlap density rises with the collection, so the desk's height grows with the square
    // root of the piece count instead of linearly: more pieces mean more clutter, not a much longer page.
    const coverage = (sizeBucket === 1 ? .8 : 1) * Math.sqrt(Math.max(1, pieces.length / 13));
    const area = sizes.reduce((sum, s) => sum + s.w * s.h, 0);
    height = Math.max(area / (width * coverage), ...sizes.map(s => s.h + s.overhang)) + 56;
    // Scatter pieces: each tries seeded spots and keeps the one covering the least of the pieces
    // beneath it, never leaving one of them less than 40% visible. If a piece finds no such spot,
    // the desk grows 8% and the scatter reruns, so the desk is only as tall as the collection needs.
    const grid = 5, minVisible = Math.ceil(.4 * grid * grid);
    function scatter() {
      const placed = [], spots = new Map();
      for (const [i, piece] of pieces.entries()) {
        const { w, h, overhang } = sizes[i], b = bounds(piece), random = seeded(piece.dataset.piece);
        const hits = (q, x, y) => q.points.map(([px, py], n) => !q.covered[n] && px >= x && px <= x + w && py >= y && py <= y + h);
        let best = null, bestScore = Infinity;
        for (let k = 0; k < 200; k++) {
          const x = b.x + random() * Math.max(0, b.maxX - b.x), y = b.y + random() * Math.max(0, b.maxY - overhang - b.y);
          let score = 0;
          for (const q of placed) {
            const newly = hits(q, x, y).filter(Boolean).length;
            if (q.visible - newly < minVisible) { score = Infinity; break; }
            score += newly;
          }
          if (score < bestScore) { best = { x, y }; bestScore = score; }
        }
        if (!best) return null;
        for (const q of placed) hits(q, best.x, best.y).forEach((hit, n) => { if (hit) { q.covered[n] = 1; q.visible--; } });
        const points = [];
        for (let gx = 0; gx < grid; gx++) for (let gy = 0; gy < grid; gy++) points.push([best.x + w * (gx + .5) / grid, best.y + h * (gy + .5) / grid]);
        placed.push({ points, covered:new Uint8Array(points.length), visible:points.length });
        spots.set(piece, best);
      }
      return spots;
    }
    let defaults;
    for (let attempt = 0; attempt < 30 && !(defaults = scatter()); attempt++) height *= 1.08;
    board.style.height = `${height}px`;
    pieces.forEach((piece, i) => {
      const stored = saved[sizeBucket]?.[piece.dataset.piece], b = bounds(piece), initial = defaults.get(piece);
      if (stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)) {
        move(piece, b.x + clamp(stored.x, 0, 1) * (b.maxX - b.x), b.y + clamp(stored.y, 0, 1) * (b.maxY - b.y));
        piece.style.zIndex = Number.isFinite(stored.z) ? clamp(stored.z, 1, 10000) : i + 1;
      } else { move(piece, initial.x, initial.y); piece.style.zIndex = i + 1; }
    });
    topLayer = Math.max(...pieces.map(p => Number(p.style.zIndex)));
  }
  function lift(piece) { piece.style.zIndex = ++topLayer; }
  function open(piece) {
    lift(piece);
    dialog.classList.toggle('unfolded-poem', piece.dataset.kind === 'Poem');
    dialog.classList.toggle('book-page', piece.classList.contains('book-paper'));
    dialog.classList.toggle('has-note', 'note' in piece.dataset);
    dialog.querySelector('h2').textContent = title(piece);
    dialog.querySelector('.detail-kind').textContent = piece.dataset.kind + ('excerpt' in piece.dataset ? ' · excerpt' : '') + (piece.dataset.note ? ` · ${piece.dataset.note}` : '');
    dialog.querySelector('.detail-creator').textContent = piece.dataset.creator;
    // A piece's text (poem or quote) takes the place of its image in the detail view.
    const art = piece.querySelector('blockquote') || piece.querySelector('.photo-window, .book-cover');
    const area = dialog.querySelector('.detail-art');
    area.replaceChildren(...(art ? [art.cloneNode(true)] : []));
    area.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
    const original = piece.querySelector('.scrap-source'), source = dialog.querySelector('.detail-source');
    source.hidden = !original;
    source.href = original?.href ?? ''; source.textContent = original?.textContent ?? '';
    const credit = dialog.querySelector('.detail-credit');
    credit.replaceChildren();
    if (piece.dataset.credit) {
      const link = document.createElement('a');
      link.href = piece.dataset.creditUrl; link.textContent = piece.dataset.credit;
      credit.append(link);
    }
    dialog.showModal();
  }
  pieces.forEach(piece => {
    const opener = document.createElement('button');
    opener.type = 'button'; opener.className = 'scrap-open';
    // Tapes have no detail view and load only when dropped on the TV. Keyboard activation
    // (a click with detail 0) still inserts one, since keyboard users cannot drag.
    const tape = piece.classList.contains('tape-piece');
    opener.setAttribute('aria-label', tape ? `Insert ${title(piece)} into the VHS player` : `${piece.dataset.kind === 'Poem' ? 'Unfold' : 'Open'} ${title(piece)}`);
    opener.addEventListener('click', event => {
      if (piece._suppressClick) return;
      if (!tape) open(piece);
      else if (event.detail === 0) loadTape(piece, true);
    });
    const grip = document.createElement('button');
    grip.type = 'button'; grip.className = 'scrap-grip'; grip.setAttribute('aria-label', `Move ${title(piece)}`);
    grip.setAttribute('aria-describedby', 'scrapbook-keyboard-help');
    grip.innerHTML = '<svg viewBox="0 0 24 16" aria-hidden="true"><g fill="currentColor"><circle cx="5" cy="5" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="19" cy="5" r="1.5"/><circle cx="5" cy="11" r="1.5"/><circle cx="12" cy="11" r="1.5"/><circle cx="19" cy="11" r="1.5"/></g></svg>';
    piece.append(opener, grip);
    piece.addEventListener('dragstart', event => event.preventDefault());
    piece.addEventListener('pointerdown', event => {
      if (event.button !== 0 || active || event.target.closest('a')) return;
      if (event.pointerType !== 'mouse' && !event.target.closest('.scrap-grip')) return;
      lift(piece);
      active = { piece, id:event.pointerId, startX:event.clientX, startY:event.clientY, x:event.clientX, y:event.clientY, scrollY:window.scrollY, origin:{ ...positions.get(piece) }, tape:piece.classList.contains('tape-piece'), dragging:false };
    });
    grip.addEventListener('keydown', event => {
      const directions = { ArrowLeft:[-1, 0], ArrowRight:[1, 0], ArrowUp:[0, -1], ArrowDown:[0, 1] };
      if (!directions[event.key]) return;
      event.preventDefault(); lift(piece);
      const [dx, dy] = directions[event.key], step = event.shiftKey ? 40 : 12, p = positions.get(piece);
      move(piece, p.x + dx * step, p.y + dy * step); remember();
      status.textContent = `${title(piece)} moved.`;
    });
  });
  window.addEventListener('pointermove', event => {
    if (!active || active.id !== event.pointerId) return;
    active.x = event.clientX; active.y = event.clientY;
    const dx = event.clientX - active.startX, dy = event.clientY - active.startY + window.scrollY - active.scrollY;
    if (!active.dragging && Math.hypot(dx, dy) < 5) return;
    if (!active.dragging) {
      active.dragging = true; active.piece.classList.add('is-dragging');
      active.piece.setPointerCapture(event.pointerId);
      active.piece._suppressClick = true;
      dragFrame = requestAnimationFrame(scrollDrag);
    }
    event.preventDefault();
    move(active.piece, active.origin.x + dx, active.origin.y + dy, active.tape);
    updateDrop();
  }, { passive:false });
  function overPlayer() {
    if (!active?.tape) return false;
    const rect = television.getBoundingClientRect();
    return active.x >= rect.left && active.x <= rect.right && active.y >= rect.top && active.y <= rect.bottom;
  }
  function updateDrop() {
    if (!active) return;
    television.classList.toggle('is-drop-target', overPlayer());
  }
  function scrollDrag() {
    if (!active?.dragging) return;
    const speed = active.y < 80 ? -12 : active.y > innerHeight - 70 ? 12 : 0;
    if (speed) {
      window.scrollBy(0, speed);
      move(active.piece, active.origin.x + active.x - active.startX, active.origin.y + active.y - active.startY + window.scrollY - active.scrollY, active.tape);
      updateDrop();
    }
    dragFrame = requestAnimationFrame(scrollDrag);
  }
  function finish(cancel = false) {
    if (!active) return;
    const { piece, origin, dragging, id } = active;
    const dropped = !cancel && dragging && overPlayer();
    active = null;
    cancelAnimationFrame(dragFrame);
    television.classList.remove('is-drop-target');
    const end = cancel || dropped ? origin : positions.get(piece);
    move(piece, end.x, end.y);
    piece.classList.remove('is-dragging');
    if (piece.hasPointerCapture(id)) piece.releasePointerCapture(id);
    if (dragging) {
      if (!cancel) remember();
      status.textContent = `${title(piece)} ${cancel ? 'returned to its previous position' : 'moved'}.`;
      setTimeout(() => { piece._suppressClick = false; }, 100);
    }
    if (dropped) loadTape(piece);
  }
  window.addEventListener('pointerup', event => { if (active?.id === event.pointerId) finish(); });
  window.addEventListener('pointercancel', event => { if (active?.id === event.pointerId) finish(true); });
  window.addEventListener('keydown', event => { if (event.key === 'Escape' && active) finish(true); });
  window.addEventListener('blur', () => finish(true));
  document.querySelector('[data-reset-scrapbook]').addEventListener('click', () => {
    finish(true); saved = {}; positions.clear();
    try { localStorage.removeItem(storageKey); } catch {}
    layout(); status.textContent = 'The original arrangement is restored.';
  });
  dialog.querySelector('.detail-close').addEventListener('click', () => dialog.close());
  // The dialog has no padding, so a click on the dialog element itself is a backdrop click.
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  async function initialize() {
    await document.fonts.ready;
    board.classList.add('is-interactive');
    layout();
    document.querySelector('[data-reset-scrapbook]').hidden = false;
    let frame;
    new ResizeObserver(() => {
      if (Math.abs(board.clientWidth - width) < 1) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { finish(true); layout(); });
    }).observe(board);
  }
  initialize();
})();
