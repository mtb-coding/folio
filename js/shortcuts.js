// - shortcuts.js -
// Global and editor-specific keyboard shortcuts.
// -

const Shortcuts = (() => {

  function init() {
    // Global shortcuts
    document.addEventListener('keydown', e => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === 'f') { e.preventDefault(); FindReplace.open(); }
      if (mod && e.key === 's') { e.preventDefault(); FileIO.saveHTML(); }
      if (mod && e.key === 'p') { e.preventDefault(); FileIO.print(); }

      if (e.key === 'Escape') {
        FindReplace.close();
        Modals.closeAll();
        if (Editor.selectedImg) {
          Editor.selectedImg.classList.remove('selected');
          Editor.selectedImg = null;
          document.getElementById('imgToolbar').classList.remove('open');
        }
      }
    });

    // Editor-scoped shortcuts
    Editor.el.addEventListener('keydown', e => {
      // Tab - indent / outdent
      if (e.key === 'Tab') {
        e.preventDefault();
        Formatting.execCmd(e.shiftKey ? 'outdent' : 'indent');
      }

      // Enter inside a code block - literal newline
      if (e.key === 'Enter') {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const node   = sel.getRangeAt(0).commonAncestorContainer;
          const parent = node.nodeType === 3 ? node.parentNode : node;
          if (parent.closest && parent.closest('.code-block code')) {
            e.preventDefault();
            Formatting.execCmd('insertText', '\n');
          }
        }
      }
    });
  }

  return { init };
})();
