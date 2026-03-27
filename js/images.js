// images.js
// Image click-to-select, contextual toolbar (wrap mode, resize, alt text, delete).

const Images = (() => {

  const WRAP_MODES = ['none','left','right','center'];

  function init() {
    Editor.el.addEventListener('click', e => {
      const img = e.target.closest('img');
      img ? _select(img) : _deselect();
    });

    document.getElementById('imgSizeInput').addEventListener('input', e => {
      resize(e.target.value);
    });
  }

  function _select(img) {
    if (Editor.selectedImg) Editor.selectedImg.classList.remove('selected');
    Editor.selectedImg = img;
    img.classList.add('selected');

    document.getElementById('imgToolbar').classList.add('open');

    const wrap = img.dataset.wrap || 'none';
    WRAP_MODES.forEach(function(m) {
      var btn = document.getElementById('iw-' + m);
      if (btn) btn.classList.toggle('active', m === wrap);
    });

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

  function setWrap(mode) {
    const img = Editor.selectedImg;
    if (!img) return;

    img.classList.remove('img-left','img-right','img-center','img-full');
    img.style.float   = '';
    img.style.display = '';
    img.style.margin  = '';
    img.dataset.wrap  = mode;

    if (mode === 'left')   img.classList.add('img-left');
    if (mode === 'right')  img.classList.add('img-right');
    if (mode === 'center') img.classList.add('img-center');

    WRAP_MODES.forEach(function(m) {
      var btn = document.getElementById('iw-' + m);
      if (btn) btn.classList.toggle('active', m === mode);
    });
  }

  function resize(pct) {
    const img = Editor.selectedImg;
    if (!img) return;
    const v = Math.max(10, Math.min(100, parseInt(pct) || 100));
    img.style.maxWidth = v + '%';
    img.style.width    = v + '%';
  }

  function setAlt() {
    const img = Editor.selectedImg;
    if (!img) return;
    Modals.prompt({
      title: 'Image Alt Text',
      fields: [{ id:'alt', label:'Description (for accessibility & SEO)', type:'text', value: img.alt || '', placeholder:'Describe the image...' }],
      confirmLabel: 'Save',
      onConfirm: function(r) { img.alt = r.alt; Toast.show('Alt text updated'); }
    });
  }

  function deleteImg() {
    const img = Editor.selectedImg;
    if (!img) return;
    _deselect();
    img.remove();
    Toast.show('Image removed');
  }

  return { init, setWrap, resize, setAlt, deleteImg };
})();
