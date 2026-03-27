// - findreplace.js -
// Find & Replace - proper DOM text-node search with highlight cycling.
//
// How it works:
//   1. On each search, walk all text nodes in the editor via TreeWalker.
//   2. Split matching text nodes, wrap matches in <mark class="fr-match">.
//   3. Keep an index; Find Next / Find Prev scroll to and select each mark.
//   4. "Replace" swaps the currently active match; "Replace All" does all at once.
//   5. Clearing the query (or closing the panel) removes all marks.
// -

const FindReplace = (() => {

  let _matches   = [];   // array of <mark> elements
  let _cursor    = -1;   // currently active match index
  let _lastQuery = '';   // query that produced current highlights

  // - Panel open / close -
  function open() {
    Modals.open('findPanel');
    setTimeout(() => document.getElementById('findInput').focus(), 80);
  }

  function close() {
    _clearHighlights();
    Modals.close('findPanel');
    _setResult('');
  }

  // - Core: scan editor and wrap matches in <mark> -
  function _highlight(query) {
    if (query === _lastQuery && _matches.length > 0) return;

    _clearHighlights();
    _lastQuery = query;
    if (!query) return;

    const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    const walker = document.createTreeWalker(
      Editor.el,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          if (p.tagName === 'SCRIPT' || p.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
          if (p.classList && p.classList.contains('fr-match')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    let n;
    while ((n = walker.nextNode())) textNodes.push(n);

    // Process in reverse so earlier DOM positions stay valid
    for (let i = textNodes.length - 1; i >= 0; i--) {
      const node = textNodes[i];
      const text = node.textContent;
      const parts = [];
      let last = 0;
      let m;
      re.lastIndex = 0;

      while ((m = re.exec(text)) !== null) {
        if (m.index > last) parts.push(document.createTextNode(text.slice(last, m.index)));
        const mark = document.createElement('mark');
        mark.className = 'fr-match';
        mark.textContent = m[0];
        parts.push(mark);
        last = m.index + m[0].length;
      }

      if (parts.length === 0) continue;
      if (last < text.length) parts.push(document.createTextNode(text.slice(last)));

      const frag = document.createDocumentFragment();
      parts.forEach(p => frag.appendChild(p));
      node.parentNode.replaceChild(frag, node);
    }

    _matches = Array.from(Editor.el.querySelectorAll('mark.fr-match'));
    _cursor  = -1;
  }

  // - Remove all highlight marks -
  function _clearHighlights() {
    Editor.el.querySelectorAll('mark.fr-match').forEach(mark => {
      mark.replaceWith(document.createTextNode(mark.textContent));
    });
    Editor.el.normalize();
    _matches   = [];
    _cursor    = -1;
    _lastQuery = '';
  }

  // - Scroll to and select a specific match -
  function _activate(index) {
    if (_matches.length === 0) return;

    _matches.forEach(m => m.classList.remove('fr-match-active'));
    _cursor = ((index % _matches.length) + _matches.length) % _matches.length;

    const mark = _matches[_cursor];
    mark.classList.add('fr-match-active');
    mark.scrollIntoView({ block: 'center', behavior: 'smooth' });

    const sel   = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(mark);
    sel.removeAllRanges();
    sel.addRange(range);

    _setResult(`${_cursor + 1} of ${_matches.length}`);
  }

  // - Public: Find Next -
  function findNext() {
    const q = document.getElementById('findInput').value;
    if (!q) { _clearHighlights(); _setResult(''); return; }
    _highlight(q);
    if (_matches.length === 0) { _setResult('No matches found'); return; }
    _activate(_cursor + 1);
  }

  // - Public: Find Previous -
  function findPrev() {
    const q = document.getElementById('findInput').value;
    if (!q) { _clearHighlights(); _setResult(''); return; }
    _highlight(q);
    if (_matches.length === 0) { _setResult('No matches found'); return; }
    _activate(_cursor - 1);
  }

  // - Public: Replace current match -
  function replace() {
    if (_matches.length === 0 || _cursor < 0) { findNext(); return; }

    const rep  = document.getElementById('replaceInput').value;
    const mark = _matches[_cursor];

    mark.replaceWith(document.createTextNode(rep));
    _matches.splice(_cursor, 1);

    if (_matches.length === 0) {
      _lastQuery = '';
      _setResult('All replaced');
      return;
    }

    const next = _cursor >= _matches.length ? 0 : _cursor;
    _cursor = next - 1;
    _activate(next);
  }

  // - Public: Replace All -
  function replaceAll() {
    const q   = document.getElementById('findInput').value;
    const rep = document.getElementById('replaceInput').value;
    if (!q) return;

    _highlight(q);

    if (_matches.length === 0) { _setResult('No matches found'); return; }

    const count = _matches.length;
    _matches.forEach(mark => mark.replaceWith(document.createTextNode(rep)));
    Editor.el.normalize();
    _matches   = [];
    _cursor    = -1;
    _lastQuery = '';

    const msg = `Replaced ${count} occurrence${count !== 1 ? 's' : ''}`;
    _setResult(msg);
    Toast.show(msg);
  }

  // - Clear highlights when query field changes -
  function onQueryInput() {
    _clearHighlights();
    _setResult('');
  }

  function _setResult(msg) {
    const el = document.getElementById('findResultLabel');
    if (el) el.textContent = msg;
  }

  return { open, close, findNext, findPrev, replace, replaceAll, onQueryInput };
})();
