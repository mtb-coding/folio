// ─── images.js ────────────────────────────────────────────────────────────────
// Image click-to-select, contextual toolbar (wrap mode, resize, alt text, delete).
// ─────────────────────────────────────────────────────────────────────────────

const Images = (() => {

  const WRAP_MODES = ['none','left','right','center'];

  /* ── Init (called from main.js) ───────────────────────── */
  function init() {
    Editor.el.addEventListener('click', e => {
      const img = e.target.closest('img');
      img ? _select(img) : _deselect();
    });

    // Size input live update
    document.getElementById('imgSizeInput').addEventListener('input', e => {
      resize(e.target.value);
    });
  }

  /* ── Select / deselect ────────────────────────────────── */
  function _select(img) {
    if (Editor.selectedImg) Editor.selectedImg.classList.remove('selected');
    Editor.selectedImg = img;
    img.classList.add('selected');

    const toolbar = document.getElementById('imgToolbar');
    toolbar.classList.add('open');

    // Sync wrap buttons
    const wrap = img.dataset.wrap || 'none';
    WRAP_MODES.forEach(m => {
      document.getElementById('iw-' + m)?.classList.toggle('active', m === wrap);
    });

    // Sync size input (use width if set, else 100)
    const w = parseFloat(img.style.width) || 100;
    document.getElementById('imgSizeInput').value = Math.round(w);
  }

  function _deselect() {
    if (Editor.selectedImg) {
      Editor.selectedImg.classList.remove('selected');
      Editor.selectedImg = null;
    }
    document.getElementById('imgToolbar').classList.remove('open');
  }

  /* ── Wrap mode ────────────────────────────────────────── */
  function setWrap(mode) {
    const img = Editor.selectedImg;
    if (!img) return;

    // Clear previous classes
    img.classList.remove('img-left','img-right','img-center','img-full');
    img.style.float   = '';
    img.style.display = '';
    img.style.margin  = '';
    img.dataset.wrap  = mode;

    if (mode === 'left')   img.classList.add('img-left');
    if (mode === 'right')  img.classList.add('img-right');
    if (mode === 'center') img.classList.add('img-center');

    // Update toolbar buttons
    WRAP_MODES.forEach(m =>
      document.getElementById('iw-' + m)?.classList.toggle('active', m === mode));
  }

  /* ── Resize ───────────────────────────────────────────── */
  function resize(pct) {
    const img = Editor.selectedImg;
    if (!img) return;
    const v = Math.max(10, Math.min(100, parseInt(pct) || 100));
    img.style.maxWidth = v + '%';
    img.style.width    = v + '%';
  }

  /* ── Alt text ─────────────────────────────────────────── */
  function setAlt() {
    const img = Editor.selectedImg;
    if (!img) return;
    Modals.prompt({
      title: 'Image Alt Text',
      fields: [{ id:'alt', label:'Description (for accessibility & SEO)', type:'text', value: img.alt || '', placeholder:'Describe the image…' }],
      confirmLabel: 'Save',
      onConfirm: ({ alt }) => { img.alt = alt; Toast.show('Alt text updated'); }
    });
  }

  /* ── Delete ───────────────────────────────────────────── */
  function deleteImg() {
    const img = Editor.selectedImg;
    if (!img) return;
    _deselect();
    img.remove();
    Toast.show('Image removed');
  }

  return { init, setWrap, resize, setAlt, deleteImg };
})();
