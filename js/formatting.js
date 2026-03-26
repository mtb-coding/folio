// ─── formatting.js ────────────────────────────────────────────────────────────
// All text-formatting commands: execCommand wrappers, font/size, alignment,
// headings, color pickers, and format-button state tracking.
// ─────────────────────────────────────────────────────────────────────────────

const Formatting = (() => {

  /* ── Base execCommand ─────────────────────────────────── */
  function execCmd(cmd, val = null) {
    Editor.el.focus();
    document.execCommand(cmd, false, val);
  }

  /* ── Format toggle (bold / italic / etc.) ─────────────── */
  function fmtToggle(cmd) {
    execCmd(cmd);
    updateActiveButtons();
  }

  /* ── Alignment ────────────────────────────────────────── */
  const ALIGN_CMDS = ['justifyLeft','justifyCenter','justifyRight','justifyFull'];
  function align(cmd) {
    execCmd(cmd);
    ALIGN_CMDS.forEach(c => {
      document.getElementById('btn-' + c)?.classList.remove('active');
    });
    document.getElementById('btn-' + cmd)?.classList.add('active');
  }

  /* ── Heading / block style ────────────────────────────── */
  function applyHeading(tag) {
    Editor.el.focus();
    document.execCommand('formatBlock', false, tag);
  }

  /* ── Font family ──────────────────────────────────────── */
  function applyFont(val) {
    if (!val) return;
    _wrapSelection(span => { span.style.fontFamily = val; });
  }

  /* ── Font size ────────────────────────────────────────── */
  function applySize(val) {
    if (!val) return;
    _wrapSelection(span => { span.style.fontSize = val; });
  }

  /* ── Line height / letter spacing (whole editor) ──────── */
  function applyLineHeight(val)     { Editor.el.style.lineHeight    = val; }
  function applyLetterSpacing(val)  { Editor.el.style.letterSpacing = val; }

  /* ── Color commands ───────────────────────────────────── */
  function applyForeColor(val) {
    execCmd('foreColor', val);
    _updateSwatch('fgSwatch', val);
  }
  function applyHiliteColor(val) {
    execCmd('hiliteColor', val);
    _updateSwatch('bgSwatch', val);
  }

  function _updateSwatch(id, val) {
    const sw = document.getElementById(id);
    if (!sw) return;
    sw.style.setProperty('--swatch-color', val);
    sw.querySelector('.swatch-preview').style.background = val;
  }

  /* ── Wrap selection in a <span> ───────────────────────── */
  function _wrapSelection(styleFn) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span  = document.createElement('span');
    styleFn(span);
    try {
      range.surroundContents(span);
    } catch {
      const frag = range.extractContents();
      span.appendChild(frag);
      range.insertNode(span);
    }
    sel.removeAllRanges();
    const r = document.createRange();
    r.selectNodeContents(span);
    sel.addRange(r);
  }

  /* ── Reflect active state on toolbar buttons ──────────── */
  const FMT_CMDS = ['bold','italic','underline','strikeThrough'];
  function updateActiveButtons() {
    FMT_CMDS.forEach(cmd => {
      document.getElementById('btn-' + cmd)?.classList
        .toggle('active', document.queryCommandState(cmd));
    });
  }

  /* ── Set the whole editor's display font ──────────────── */
  function setEditorFont(val) { Editor.el.style.fontFamily = val; }

  /* ── Page width ───────────────────────────────────────── */
  function setPageWidth(val) {
    document.documentElement.style.setProperty('--page-w', val);
  }

  /* ── Remove all formatting from selection ─────────────── */
  function clearFormat() { execCmd('removeFormat'); }

  return {
    execCmd,
    fmtToggle,
    align,
    applyHeading,
    applyFont,
    applySize,
    applyLineHeight,
    applyLetterSpacing,
    applyForeColor,
    applyHiliteColor,
    updateActiveButtons,
    setEditorFont,
    setPageWidth,
    clearFormat,
  };
})();
