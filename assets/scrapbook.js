(() => {
  const board = document.querySelector('.scrapbook-board');
  if (!board) return;
  const pieces = [...board.querySelectorAll('.scrap')];
  const dialog = document.querySelector('.scrapbook-dialog');
  const status = document.querySelector('[data-scrapbook-status]');
  const storageKey = 'kalie-desk-v5';
  const player = document.querySelector('.tape-player');
  const $ = selector => player.querySelector(selector);
  const television = $('.television'), playback = $('.tape-playback'), standby = $('.tv-standby'), notice = $('.playback-notice');
  const playButton = $('.play-tape'), ejectButton = $('.eject-tape'), external = $('.tape-external');
  const currentTape = $('.current-tape'), currentArtist = $('.current-artist'), playerState = $('.player-state');
  let loadedTape = null, dragFrame = 0, tuningTimer;
  let saved = {}, columns = 0, width = 0, height = 0, topLayer = 12, active = null;
  try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch {}
  if (typeof saved !== 'object' || Array.isArray(saved)) saved = {};
  const positions = new Map();
  const clamp = (n, min, max) => Math.max(min, Math.min(Math.max(min, max), n));
  const title = piece => piece.querySelector('h3').textContent.replace(/\s+/g, ' ').trim();
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
    clearTimeout(tuningTimer);
    notice.hidden = true;
    pieces.forEach(p => p.classList.toggle('is-loaded', p === piece));
    player.classList.toggle('has-tape', !!piece);
    player.classList.toggle('is-tuning', !!piece);
    if (piece) tuningTimer = setTimeout(() => player.classList.remove('is-tuning'), 450);
    standbyScreen(piece ? 'TAPE READY' : 'NO TAPE');
    $('.slot-label').textContent = piece ? 'CASSETTE LOADED' : 'INSERT CASSETTE';
    playerState.textContent = piece ? 'Tape loaded' : '';
    playButton.disabled = ejectButton.disabled = !piece;
    external.hidden = currentTape.hidden = currentArtist.hidden = !piece;
    currentTape.textContent = piece ? title(piece) : '';
    currentArtist.textContent = piece ? piece.dataset.creator : '';
    if (piece) external.href = piece.querySelector('.scrap-source').href;
  }
  function loadTape(piece, reveal = false) {
    setTape(piece);
    status.textContent = `${title(piece)} is in the VHS player. Press Play to watch.`;
    if (reveal) {
      player.scrollIntoView({ behavior:'instant', block:'center' });
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
      notice.textContent = 'YouTube needs a web preview. Open this page through localhost, or use the YouTube link below.';
      notice.hidden = false;
      return;
    }
    clearTimeout(tuningTimer);
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
    saved[columns] = Object.fromEntries(pieces.map(piece => {
      const p = positions.get(piece), b = bounds(piece);
      return [piece.dataset.piece, { x:(p.x - b.x) / Math.max(1, b.maxX - b.x), y:(p.y - b.y) / Math.max(1, b.maxY - b.y), z:Number(piece.style.zIndex) || 1 }];
    }));
    try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch {}
  }
  function layout() {
    const nextWidth = board.clientWidth;
    if (!nextWidth) return;
    if (columns && positions.size) remember();
    width = nextWidth;
    // Responsive size buckets also keep saved desktop and phone positions separate.
    columns = width >= 800 ? 3 : width >= 540 ? 2 : 1;
    const anchors = [.03, .46, .94, .25, .73, .02, .43, .98, .17, .65, .04, .9];
    const offsets = [16, 64, 30, 8, 42, 24, 52, 4, 34, 14, 46, 22];
    const placed = [];
    const defaults = new Map();
    pieces.forEach((piece, i) => {
      piece.style.width = `${Math.min(250, width - 58) * Number(piece.dataset.width)}px`;
      const w = piece.offsetWidth, h = piece.offsetHeight;
      const x = 24 + anchors[i % anchors.length] * Math.max(0, width - w - 48);
      let y = 28 + offsets[i % offsets.length];
      // Let edges overlap slightly, while keeping the body of each piece exposed.
      for (const other of [...placed].sort((a, b) => a.y - b.y)) {
        const overlap = Math.min(x + w, other.x + other.w) - Math.max(x, other.x);
        if (overlap > 22 && y < other.y + other.h - 14 && y + h > other.y + 14) {
          y = other.y + other.h - 10 + offsets[i % offsets.length] / 3;
        }
      }
      placed.push({ x, y, w, h });
      defaults.set(piece, { x, y });
    });
    height = Math.max(...placed.map(p => p.y + p.h)) + 55;
    board.style.height = `${height}px`;
    pieces.forEach((piece, i) => {
      const stored = saved[columns]?.[piece.dataset.piece], b = bounds(piece), initial = defaults.get(piece);
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
    dialog.querySelector('h2').textContent = title(piece);
    dialog.querySelector('.detail-kind').textContent = piece.dataset.kind + ('excerpt' in piece.dataset ? ' · excerpt' : '');
    dialog.querySelector('.detail-creator').textContent = piece.dataset.creator;
    const art = piece.querySelector('.photo-window, .book-cover, blockquote, .vhs-cassette');
    const area = dialog.querySelector('.detail-art');
    area.replaceChildren(...(art ? [art.cloneNode(true)] : []));
    area.style.setProperty('--tape-color', piece.style.getPropertyValue('--tape-color'));
    if (piece.classList.contains('tape-piece')) {
      const load = document.createElement('button');
      load.type = 'button'; load.className = 'load-tape'; load.textContent = 'Insert into the VHS player ↗';
      load.addEventListener('click', () => { dialog.close(); loadTape(piece, true); });
      area.append(load);
    }
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
    opener.setAttribute('aria-label', `${piece.dataset.kind === 'Poem' ? 'Unfold' : 'Open'} ${title(piece)}`);
    opener.addEventListener('click', () => { if (!piece._suppressClick) open(piece); });
    const grip = document.createElement('button');
    grip.type = 'button'; grip.className = 'scrap-grip'; grip.setAttribute('aria-label', `Move ${title(piece)}`);
    grip.setAttribute('aria-describedby', 'scrapbook-keyboard-help');
    grip.innerHTML = '<svg viewBox="0 0 24 16" aria-hidden="true"><g fill="currentColor"><circle cx="5" cy="5" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="19" cy="5" r="1.5"/><circle cx="5" cy="11" r="1.5"/><circle cx="12" cy="11" r="1.5"/><circle cx="19" cy="11" r="1.5"/></g></svg>';
    piece.append(opener, grip);
    piece.addEventListener('dragstart', event => event.preventDefault());
    piece.addEventListener('pointerdown', event => {
      if (event.button !== 0 || active || event.target.closest('a, .load-tape')) return;
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
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
  async function initialize() {
    await document.fonts.ready;
    board.classList.add('is-interactive');
    layout();
    document.querySelector('.scrapbook-tools').hidden = false;
    let frame;
    new ResizeObserver(() => {
      if (Math.abs(board.clientWidth - width) < 1) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { finish(true); layout(); });
    }).observe(board);
  }
  initialize();
})();
