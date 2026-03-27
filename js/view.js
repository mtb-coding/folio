// - view.js -
// View & UI state: dark mode, focus mode, fullscreen, markdown preview,
// ribbon tab switching, page-width, editor-font.
// -

const View = (() => {

  /* - Dark mode - */
  function toggleDark() {
    Editor.isDark = !Editor.isDark;
    document.body.classList.toggle('dark', Editor.isDark);
    document.getElementById('darkBtn').textContent = Editor.isDark ? '- Light' : '- Dark';
    localStorage.setItem('folio_dark', Editor.isDark ? '1' : '');
  }

  function restoreDark() {
    if (localStorage.getItem('folio_dark')) {
      Editor.isDark = true;
      document.body.classList.add('dark');
      document.getElementById('darkBtn').textContent = '- Light';
    }
  }

  /* - Focus mode - */
  function toggleFocus() {
    document.body.classList.toggle('focus-mode');
    const on = document.body.classList.contains('focus-mode');
    Toast.show(on ? 'Focus mode - hover the status bar for stats' : 'Focus mode off');
  }

  /* - Fullscreen - */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  /* - Markdown preview - */
  function toggleMarkdownPreview() {
    if (!Editor.isPreviewMode) {
      Editor.savedContent      = Editor.el.innerHTML;
      Editor.el.innerHTML      = marked.parse(Editor.el.innerText);
      Editor.el.contentEditable = 'false';
      Editor.isPreviewMode     = true;
      document.getElementById('modeLabel').textContent = 'Preview';
      Toast.show('Markdown preview active - click View - MD Preview to exit');
    } else {
      Editor.el.innerHTML       = Editor.savedContent;
      Editor.el.contentEditable = 'true';
      Editor.isPreviewMode      = false;
      document.getElementById('modeLabel').textContent = 'Edit';
      Insert.rehighlight();
    }
  }

  /* - Clear all (with modal confirm) - */
  function clearAll() {
    Modals.confirm({
      title: 'Clear Document',
      message: 'This will permanently erase all content. Are you sure?',
      confirmLabel: 'Clear all',
      danger: true,
      onConfirm() {
        Editor.el.innerHTML = '';
        Stats.update();
        Toast.show('Document cleared');
      }
    });
  }

  /* - Ribbon tab switching - */
  const TABS = ['home','insert','format','view'];

  function switchTab(name) {
    document.querySelectorAll('.rtab').forEach((t, i) => {
      t.classList.toggle('active', TABS[i] === name);
    });
    document.querySelectorAll('.ribbon-panel').forEach(p => p.classList.remove('active'));
    var _tp = document.getElementById('tab-' + name); if (_tp) _tp.classList.add('active');
  }

  /* - Page width & editor font - */
  function setPageWidth(val) {
    document.documentElement.style.setProperty('--page-w', val);
  }

  function setEditorFont(val) {
    Editor.el.style.fontFamily = val;
  }

  /* - Spellcheck toggle - */
  function toggleSpellcheck() {
    const on = Editor.el.getAttribute('spellcheck') === 'true';
    Editor.el.setAttribute('spellcheck', String(!on));
    Toast.show(!on ? 'Spellcheck on' : 'Spellcheck off');
  }

  return {
    toggleDark, restoreDark,
    toggleFocus, toggleFullscreen,
    toggleMarkdownPreview, clearAll,
    switchTab, setPageWidth, setEditorFont,
    toggleSpellcheck,
  };
})();
