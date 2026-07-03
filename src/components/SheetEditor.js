import React, { useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

const ROWS = 20
const COLS = 10 // A..J

function colLetter(i) {
  return String.fromCharCode(65 + i)
}

function buildSheetHTML() {
  let headerCells = '<th class="corner"></th>'
  for (let c = 0; c < COLS; c++) {
    headerCells += `<th>${colLetter(c)}</th>`
  }

  let bodyRows = ''
  for (let r = 1; r <= ROWS; r++) {
    let rowCells = `<td class="rowhead">${r}</td>`
    for (let c = 0; c < COLS; c++) {
      const id = `${colLetter(c)}${r}`
      rowCells += `<td><div class="cell" id="${id}" contenteditable="true" data-id="${id}"></div></td>`
    }
    bodyRows += `<tr>${rowCells}</tr>`
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, Roboto, Arial, sans-serif;
    background: #e6f0e6;
    overflow-x: auto;
  }
  #toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: #2d7a0c;
    color: #fff;
    font-size: 12px;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  #toolbar input {
    flex: 1;
    padding: 6px 8px;
    border-radius: 6px;
    border: none;
    font-size: 12px;
  }
  #cellRef {
    font-weight: 700;
    min-width: 34px;
    text-align: center;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    border: 1px solid #cce9ae;
    font-size: 12px;
    padding: 0;
    text-align: center;
  }
  th {
    background: #d8f5b0;
    color: #245f09;
    font-weight: 700;
    padding: 6px 4px;
    position: sticky;
    top: 34px;
  }
  th.corner {
    background: #b7e07a;
    position: sticky;
    left: 0;
    top: 34px;
    z-index: 3;
  }
  td.rowhead {
    background: #d8f5b0;
    color: #245f09;
    font-weight: 700;
    width: 30px;
    position: sticky;
    left: 0;
    z-index: 2;
  }
  .cell {
    min-width: 72px;
    height: 26px;
    line-height: 26px;
    padding: 0 4px;
    background: #fff;
    outline: none;
    white-space: nowrap;
    overflow: hidden;
  }
  .cell:focus {
    background: #fffbcc;
    outline: 2px solid #5abf2a;
  }
</style>
</head>
<body>
  <div id="toolbar">
    <span id="cellRef">A1</span>
    <input id="formulaBar" type="text" placeholder="Escriba un valor o fórmula, ej: =SUMA(A1:A3)" />
  </div>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>

<script>
  var cells = {};
  var activeId = null;
  var formulaBar = document.getElementById('formulaBar');
  var cellRefLabel = document.getElementById('cellRef');

  function colToIndex(letter) {
    return letter.toUpperCase().charCodeAt(0) - 65;
  }

  function parseRef(ref) {
    var m = ref.match(/^([A-Za-z]+)(\d+)$/);
    if (!m) return null;
    return { col: colToIndex(m[1]), row: parseInt(m[2], 10) };
  }

  function getRawValue(id) {
    return cells[id] !== undefined ? cells[id] : '';
  }

  function evalRange(a, b) {
    var ra = parseRef(a), rb = parseRef(b);
    if (!ra || !rb) return 0;
    var sum = 0;
    var minCol = Math.min(ra.col, rb.col), maxCol = Math.max(ra.col, rb.col);
    var minRow = Math.min(ra.row, rb.row), maxRow = Math.max(ra.row, rb.row);
    for (var c = minCol; c <= maxCol; c++) {
      for (var r = minRow; r <= maxRow; r++) {
        var id = String.fromCharCode(65 + c) + r;
        var v = parseFloat(computeValue(id));
        if (!isNaN(v)) sum += v;
      }
    }
    return sum;
  }

  function computeValue(id) {
    var raw = getRawValue(id);
    if (typeof raw !== 'string' || raw.charAt(0) !== '=') {
      return raw;
    }
    var expr = raw.substring(1).toUpperCase();

    var sumMatch = expr.match(/^SUMA\(([A-Z]+\d+):([A-Z]+\d+)\)$/) || expr.match(/^SUM\(([A-Z]+\d+):([A-Z]+\d+)\)$/);
    if (sumMatch) {
      return evalRange(sumMatch[1], sumMatch[2]);
    }

    var promMatch = expr.match(/^PROMEDIO\(([A-Z]+\d+):([A-Z]+\d+)\)$/);
    if (promMatch) {
      var ra = parseRef(promMatch[1]), rb = parseRef(promMatch[2]);
      var count = (Math.abs(ra.col - rb.col) + 1) * (Math.abs(ra.row - rb.row) + 1);
      return count > 0 ? (evalRange(promMatch[1], promMatch[2]) / count).toFixed(2) : 0;
    }

    // Reemplazar referencias de celda sueltas por su valor numerico y evaluar aritmetica simple
    var replaced = expr.replace(/[A-Z]+\d+/g, function (ref) {
      var v = parseFloat(computeValue(ref));
      return isNaN(v) ? 0 : v;
    });
    try {
      // Solo permitir numeros, espacios y operadores basicos
      if (/^[0-9+\-*/.() ]+$/.test(replaced)) {
        return eval(replaced);
      }
    } catch (e) {}
    return '#ERROR';
  }

  function renderCell(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (document.activeElement === el) return;
    var val = computeValue(id);
    el.textContent = val;
  }

  function renderAll() {
    Object.keys(cells).forEach(renderCell);
  }

  document.querySelectorAll('.cell').forEach(function (el) {
    el.addEventListener('focus', function () {
      activeId = el.dataset.id;
      cellRefLabel.textContent = activeId;
      formulaBar.value = getRawValue(activeId);
      el.textContent = getRawValue(activeId);
    });
    el.addEventListener('blur', function () {
      var raw = el.textContent.trim();
      cells[el.dataset.id] = raw;
      renderCell(el.dataset.id);
      renderAll();
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        el.blur();
      }
    });
  });

  formulaBar.addEventListener('input', function () {
    if (!activeId) return;
    var el = document.getElementById(activeId);
    el.textContent = formulaBar.value;
    cells[activeId] = formulaBar.value;
  });

  formulaBar.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && activeId) {
      renderCell(activeId);
      renderAll();
    }
  });
</script>
</body>
</html>
`
}

export default function SheetEditor({ userId, sheetId }) {
  const webviewRef = useRef(null)
  const html = buildSheetHTML()

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f0e6',
  },
  webview: {
    flex: 1,
    backgroundColor: '#e6f0e6',
  },
})
