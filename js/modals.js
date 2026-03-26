// ─── modals.js ────────────────────────────────────────────────────────────────
// Modal / dialog system.  Every browser prompt() or confirm() is replaced with
// a proper in-editor modal.  API:
//
//   Modals.prompt({ title, fields:[{id,label,type,value,placeholder}], onConfirm })
//   Modals.confirm({ title, message, confirmLabel, danger, onConfirm })
//   Modals.open(id)   /  Modals.close(id)   — for persistent panels
// ─────────────────────────────────────────────────────────────────────────────

const Modals = (() => {

  /* ── Helpers ──────────────────────────────────────────── */

  function makeOverlay(id) {
    const ov = document.createElement('div');
    ov.className = 'modal-overlay';
    ov.id = 'overlay-' + id;
    // Click outside modal to close
    ov.addEventListener('mousedown', e => {
      if (e.target === ov) _close(ov);
    });
    document.body.appendChild(ov);
    return ov;
  }

  function _open(ov) {
    // small rAF so CSS transition fires
    requestAnimationFrame(() => ov.classList.add('open'));
    // Focus first input if any
    setTimeout(() => {
      const inp = ov.querySelector('input, select, textarea');
      if (inp) inp.focus();
    }, 120);
  }

  function _close(ov) {
    ov.classList.remove('open');
  }

  function closeAll() {
    document.querySelectorAll('.modal-overlay.open').forEach(_close);
  }

  /* ── Generic prompt modal ─────────────────────────────── */
  // options: { title, fields:[{id,label,type,value,placeholder,options}], confirmLabel, onConfirm }
  function prompt(options) {
    const id = 'prompt-' + Date.now();
    const ov = makeOverlay(id);

    const fieldsHtml = options.fields.map(f => {
      if (f.type === 'select') {
        const opts = f.options.map(o =>
          `<option value="${o.value}" ${o.value === f.value ? 'selected' : ''}>${o.label}</option>`
        ).join('');
        return `
          <div class="modal-field">
            <label for="${f.id}">${f.label}</label>
            <select class="modal-input modal-select" id="${f.id}">${opts}</select>
          </div>`;
      }
      if (f.type === 'checkbox') {
        return `
          <div class="modal-field">
            <label class="modal-check">
              <input type="checkbox" id="${f.id}" ${f.value ? 'checked' : ''}>
              ${f.label}
            </label>
          </div>`;
      }
      return `
        <div class="modal-field">
          <label for="${f.id}">${f.label}</label>
          <input class="modal-input" id="${f.id}"
            type="${f.type || 'text'}"
            value="${f.value || ''}"
            placeholder="${f.placeholder || ''}">
        </div>`;
    }).join('');

    ov.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${options.title}">
        <div class="modal-header">
          <span class="modal-title">${options.title}</span>
          <button class="modal-close" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          ${fieldsHtml}
          <div class="modal-actions">
            <button class="btn" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="confirm">${options.confirmLabel || 'OK'}</button>
          </div>
        </div>
      </div>`;

    ov.querySelector('[data-action="cancel"]').onclick = () => _close(ov);
    ov.querySelector('.modal-close').onclick          = () => _close(ov);

    ov.querySelector('[data-action="confirm"]').onclick = () => {
      const result = {};
      options.fields.forEach(f => {
        const el = ov.querySelector('#' + f.id);
        result[f.id] = f.type === 'checkbox' ? el.checked : el.value;
      });
      _close(ov);
      if (options.onConfirm) options.onConfirm(result);
    };

    // Enter key submits
    ov.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        ov.querySelector('[data-action="confirm"]').click();
      }
      if (e.key === 'Escape') _close(ov);
    });

    document.body.appendChild(ov);
    _open(ov);
  }

  /* ── Generic confirm modal ────────────────────────────── */
  // options: { title, message, confirmLabel, danger, onConfirm }
  function confirm(options) {
    const id = 'confirm-' + Date.now();
    const ov = makeOverlay(id);

    ov.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <span class="modal-title">${options.title}</span>
          <button class="modal-close" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size:13.5px;line-height:1.5;color:var(--text);margin-bottom:0">${options.message}</p>
          <div class="modal-actions">
            <button class="btn" data-action="cancel">Cancel</button>
            <button class="btn ${options.danger ? 'btn-danger' : 'btn-primary'}" data-action="confirm">
              ${options.confirmLabel || 'Confirm'}
            </button>
          </div>
        </div>
      </div>`;

    ov.querySelector('[data-action="cancel"]').onclick = () => _close(ov);
    ov.querySelector('.modal-close').onclick            = () => _close(ov);
    ov.querySelector('[data-action="confirm"]').onclick = () => {
      _close(ov);
      if (options.onConfirm) options.onConfirm();
    };
    ov.addEventListener('keydown', e => {
      if (e.key === 'Enter') ov.querySelector('[data-action="confirm"]').click();
      if (e.key === 'Escape') _close(ov);
    });

    document.body.appendChild(ov);
    _open(ov);
  }

  /* ── Persistent panel toggle (Find, etc.) ─────────────── */
  function open(id)  { document.getElementById(id)?.classList.add('open'); }
  function close(id) { document.getElementById(id)?.classList.remove('open'); }
  function toggle(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('open');
  }

  return { prompt, confirm, open, close, toggle, closeAll };
})();
