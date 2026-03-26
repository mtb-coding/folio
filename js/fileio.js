// ─── fileio.js ────────────────────────────────────────────────────────────────
// File I/O: save as HTML, export as Markdown, load file, print.
// ─────────────────────────────────────────────────────────────────────────────

const FileIO = (() => {

  function _docName() {
    return document.getElementById('docTitleInput').value.trim() || 'document';
  }

  function _dlBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const a    = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: filename,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ── Save as HTML ─────────────────────────────────────── */
  function saveHTML() {
    const name = _docName();
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${name}</title></head>
<body style="font-family:Georgia,serif;max-width:800px;margin:2em auto;line-height:1.7">
${Editor.el.innerHTML}
</body>
</html>`;
    _dlBlob(html, name + '.html', 'text/html');
    Toast.show('Saved as HTML');
  }

  /* ── Export as Markdown ───────────────────────────────── */
  function exportMarkdown() {
    const td = new TurndownService();
    const md = td.turndown(Editor.el.innerHTML);
    _dlBlob(md, _docName() + '.md', 'text/markdown');
    Toast.show('Exported as Markdown');
  }

  /* ── Export as plain text ─────────────────────────────── */
  function exportText() {
    _dlBlob(Editor.el.innerText, _docName() + '.txt', 'text/plain');
    Toast.show('Exported as plain text');
  }

  /* ── Load file (HTML / txt / md) ──────────────────────── */
  function loadClick() {
    document.getElementById('fileInput').click();
  }

  function onFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      Editor.el.innerHTML = e.target.result;
      Stats.update();
      Insert.rehighlight();
      event.target.value = '';
      Toast.show(`Loaded: ${file.name}`);
    };
    reader.readAsText(file);
  }

  /* ── Print ────────────────────────────────────────────── */
  function print() { window.print(); }

  return { saveHTML, exportMarkdown, exportText, loadClick, onFileLoad, print };
})();
