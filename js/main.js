// - main.js -
// Entry point. Initialises all modules in dependency order.
// -

document.addEventListener('DOMContentLoaded', () => {

  // 1. Bootstrap shared state
  Editor.init();

  // 2. Restore dark-mode preference before first paint
  View.restoreDark();

  // 3. Wire editor format-state tracker
  ['keyup','mouseup','selectionchange'].forEach(ev =>
    Editor.el.addEventListener(ev, Formatting.updateActiveButtons));

  // 4. MutationObserver: auto-highlight new code blocks
  const mo = new MutationObserver(mutations => {
    mutations.forEach(m => m.addedNodes.forEach(node => {
      if (node.nodeType === 1) {
        if (node.querySelectorAll) node.querySelectorAll('.code-block code[class*="language-"]').forEach(function(el) { Prism.highlightElement(el); });
      }
    }));
  });
  mo.observe(Editor.el, { childList: true, subtree: true });

  // 5. Image toolbar
  Images.init();

  // 6. Keyboard shortcuts
  Shortcuts.init();

  // 7. Auto-save listener
  Stats.setupAutoSave();

  // 8. Initial stats pass
  Stats.update();

  // 9. Try to restore previous session
  Stats.tryRestore();
});
