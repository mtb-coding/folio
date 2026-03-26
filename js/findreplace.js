// ─── findreplace.js ───────────────────────────────────────────────────────────
// Find & Replace panel (non-blocking floating panel, not a modal overlay).
// ─────────────────────────────────────────────────────────────────────────────

const FindReplace = (() => {

  function open() {
    Modals.open('findPanel');
    document.getElementById('findInput').focus();
  }

  function close() {
    Modals.close('findPanel');
  }

  function findNext() {
    const q = document.getElementById('findInput').value;
    if (!q) return;
    const found = window.find(q);
    _setResult(found ? '' : 'No more matches');
  }

  function replace() {
    const rep = document.getElementById('replaceInput').value;
    Formatting.execCmd('insertText', rep);
  }

  function replaceAll() {
    const find = document.getElementById('findInput').value;
    const rep  = document.getElementById('replaceInput').value;
    if (!find) return;

    let count = 0;
    function walk(node) {
      if (node.nodeType === 3) {
        if (node.textContent.includes(find)) {
          node.textContent = node.textContent.split(find).join(rep);
          count++;
        }
      } else {
        node.childNodes.forEach(walk);
      }
    }
    walk(Editor.el);
    _setResult(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}`);
    Toast.show(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}`);
  }

  function _setResult(msg) {
    const el = document.getElementById('findResultLabel');
    if (el) el.textContent = msg;
  }

  return { open, close, findNext, replace, replaceAll };
})();
