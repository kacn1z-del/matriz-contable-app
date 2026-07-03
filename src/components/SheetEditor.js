import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

// Motor de hoja de cálculo tipo Excel / Matriz Contable web:
// múltiples hojas (renombrar/duplicar/eliminar con doble toque),
// barra de fórmulas, deshacer (25 pasos), navegación con flechas,
// formato (negrita/moneda), plantillas contables (Diario, Mayor,
// Balance, Conciliación), gráficos (barras/línea/torta),
// barra de estado con suma/promedio/conteo de rango rápido,
// exportar CSV y autoguardado.
const SHEET_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { height: 100%; margin: 0; font-family: -apple-system, Roboto, Arial, sans-serif; background: #e6f0e6; overflow: hidden; }
  #app { display: flex; flex-direction: column; height: 100%; }

  #toolbar {
    display: flex; align-items: center; gap: 6px; flex-wrap: nowrap;
    padding: 8px 8px; background: #2d7a0c; overflow-x: auto; flex-shrink: 0;
  }
  #toolbar button {
    background: #245f09; color: #fff; border: none; border-radius: 6px;
    padding: 7px 10px; font-size: 12px; font-weight: 700; white-space: nowrap; flex-shrink: 0;
  }
  #toolbar button:disabled { opacity: .4; }
  #toolbar select {
    background: #245f09; color: #fff; border: none; border-radius: 6px;
    padding: 7px 6px; font-size: 12px; font-weight: 700; flex-shrink: 0;
  }

  #formulaBarRow {
    display: flex; align-items: center; gap: 8px; padding: 6px 10px;
    background: #fff; border-bottom: 1.5px solid #cce9ae; flex-shrink: 0;
  }
  #cellRef { font-size: 12px; font-weight: 800; color: #2d7a0c; min-width: 34px; }
  #formulaInput { flex: 1; padding: 6px 8px; border: 1px solid #cce9ae; border-radius: 6px; font-size: 13px; }
  #saveStatus { font-size: 10px; color: #6b8f48; min-width: 60px; text-align: right; white-space: nowrap; }

  #gridWrap { flex: 1; overflow: auto; -webkit-overflow-scrolling: touch; position: relative; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid #d7ead0; font-size: 12px; padding: 0; text-align: center; }
  th { background: #d8f5b0; color: #245f09; font-weight: 700; padding: 6px 4px; position: sticky; top: 0; z-index: 3; min-width: 78px; }
  th.corner { position: sticky; left: 0; top: 0; z-index: 4; background: #b7e07a; min-width: 34px; }
  td.rowhead { background: #d8f5b0; color: #245f09; font-weight: 700; width: 34px; position: sticky; left: 0; z-index: 2; }
  .cell { min-width: 78px; height: 26px; line-height: 26px; padding: 0 5px; outline: none; white-space: nowrap; overflow: hidden; background: #fff; }
  .cell.selected { background: #fffbcc; outline: 2px solid #5abf2a; outline-offset: -2px; }
  .cell.bold { font-weight: 800; color: #1e5208; }

  #statusBar {
    display: flex; gap: 14px; align-items: center; padding: 5px 10px;
    background: #d8f5b0; font-size: 11px; color: #245f09; font-weight: 700; flex-shrink: 0;
  }
  #statusBar input { width: 90px; padding: 3px 6px; border: 1px solid #b7e07a; border-radius: 5px; font-size: 11px; }

  #tabsRow { display: flex; align-items: center; background: #cce9ae; padding: 4px 6px; gap: 4px; overflow-x: auto; flex-shrink: 0; -webkit-overflow-scrolling: touch; }
  .tab { padding: 6px 12px; border-radius: 6px 6px 0 0; font-size: 12px; font-weight: 700; color: #3d6020; background: #b7e07a; white-space: nowrap; position: relative; }
  .tab.active { background: #fff; color: #2d7a0c; }
  #addTabBtn { padding: 6px 10px; border-radius: 6px; font-size: 14px; font-weight: 800; background: #245f09; color: #fff; flex-shrink: 0; }

  #chartOverlay, #tabMenuOverlay {
    position: fixed; inset: 0; background: rgba(10,30,5,.55); z-index: 9000;
    display: none; align-items: center; justify-content: center; padding: 12px;
  }
  #chartOverlay.show, #tabMenuOverlay.show { display: flex; }
  #chartModal, #tabMenuModal { background: #fff; border-radius: 14px; width: 100%; max-width: 340px; max-height: 90vh; overflow-y: auto; padding: 14px; }
  #chartModal h3, #tabMenuModal h3 { margin: 0 0 10px; font-size: 15px; color: #245f09; }
  #chartModal select, #chartModal input, #tabMenuModal input { width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #cce9ae; border-radius: 6px; font-size: 13px; }
  .row { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
  .row button, #tabMenuModal .action-btn { padding: 8px 14px; border-radius: 7px; border: none; font-size: 13px; font-weight: 700; }
  .cancel { background: #eee; color: #555; }
  .ok { background: #2d7a0c; color: #fff; }
  .danger { background: #dc2626; color: #fff; }
  #tabMenuModal .action-btn { width: 100%; margin-bottom: 6px; text-align: left; background: #f2f9ea; color: #245f09; }
  .chart-float { position: absolute; background: #fff; border: 2px solid #cce9ae; border-radius: 10px; padding: 8px; z-index: 40; }
  .chart-float .chead { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 11px; font-weight: 700; color: #245f09; }
  .chart-float .chead button { background: none; border: none; font-size: 13px; cursor: pointer; }
</style>
</head>
<body>
<div id="app">
  <div id="toolbar">
    <select id="templateSelect">
      <option value="">📁 Plantilla...</option>
      <option value="diario">📘 Libro Diario</option>
      <option value="mayor">📗 Libro Mayor</option>
      <option value="balance">📊 Balance Comprobación</option>
      <option value="conciliacion">🏦 Conciliación Bancaria</option>
      <option value="blank">🗋 Hoja en blanco</option>
    </select>
    <button id="btnUndo" disabled>↶ Deshacer</button>
    <button id="btnBold">N</button>
    <button id="btnCurrency">₡</button>
    <button id="btnChart">📊 Gráfico</button>
    <button id="btnCSV">⬇ CSV</button>
    <button id="btnAddRow">+Fila</button>
    <button id="btnAddCol">+Col</button>
    <button id="btnClear">Borrar</button>
  </div>

  <div id="formulaBarRow">
    <span id="cellRef">A1</span>
    <input id="formulaInput" type="text" placeholder="Valor o fórmula: =SUMA(A1:A5)" />
    <span id="saveStatus">Listo</span>
  </div>

  <div id="gridWrap">
    <table id="sheetTable"></table>
  </div>

  <div id="statusBar">
    <span>Rango rápido:</span>
    <input id="quickRange" type="text" placeholder="ej: A1:A5" />
    <span id="quickSum">Suma: 0</span>
    <span id="quickAvg">Prom: 0</span>
    <span id="quickCount">Cont: 0</span>
  </div>

  <div id="tabsRow"></div>
</div>

<div id="chartOverlay">
  <div id="chartModal">
    <h3>📊 Insertar gráfico</h3>
    <select id="chartType">
      <option value="bar">Barras</option>
      <option value="line">Línea</option>
      <option value="pie">Torta</option>
    </select>
    <input id="chartRange" type="text" placeholder="Rango de datos, ej: B2:B6" />
    <input id="chartLabels" type="text" placeholder="Rango de etiquetas, ej: A2:A6" />
    <input id="chartTitle" type="text" placeholder="Título del gráfico" value="Gráfico" />
    <div class="row">
      <button class="cancel" id="chartCancel">Cancelar</button>
      <button class="ok" id="chartInsert">Insertar</button>
    </div>
  </div>
</div>

<div id="tabMenuOverlay">
  <div id="tabMenuModal">
    <h3 id="tabMenuTitle">Hoja</h3>
    <input id="renameInput" type="text" placeholder="Nuevo nombre" />
    <button class="action-btn" id="btnRenameConfirm">✏️ Renombrar</button>
    <button class="action-btn" id="btnDuplicate">📄 Duplicar hoja</button>
    <button class="action-btn" id="btnDeleteSheet" style="color:#dc2626;">🗑 Eliminar hoja</button>
    <div class="row"><button class="cancel" id="tabMenuCancel">Cerrar</button></div>
  </div>
</div>

<script>
// ══════════════════════════════════════════════
// ESTADO
// ══════════════════════════════════════════════
var ROWS = 60, COLS = 18;
var sheets = ['Hoja1', 'Hoja2', 'Hoja3'];
var activeSheet = 'Hoja1';
var sheetData = { Hoja1: {}, Hoja2: {}, Hoja3: {} };
var sheetFormats = { Hoja1: {}, Hoja2: {}, Hoja3: {} };
var undoStack = [];
var tabMenuTarget = null;

function colLetter(i) { return String.fromCharCode(65 + i); }
function colIndex(s) { var n = 0; s = (s || '').toUpperCase(); for (var i = 0; i < s.length; i++) n = n * 26 + s.charCodeAt(i) - 64; return n - 1; }
function cellId(r, c) { return colLetter(c) + (r + 1); }

function snapshot() {
  undoStack.push(JSON.stringify({ sheets: sheets, sheetData: sheetData, sheetFormats: sheetFormats, activeSheet: activeSheet }));
  if (undoStack.length > 25) undoStack.shift();
  document.getElementById('btnUndo').disabled = false;
}
function undo() {
  if (!undoStack.length) return;
  var prev = JSON.parse(undoStack.pop());
  sheets = prev.sheets; sheetData = prev.sheetData; sheetFormats = prev.sheetFormats; activeSheet = prev.activeSheet;
  buildTable(); autoSave();
  if (!undoStack.length) document.getElementById('btnUndo').disabled = true;
}

// ══════════════════════════════════════════════
// MOTOR DE FÓRMULAS
// ══════════════════════════════════════════════
function getRaw(id) { return (sheetData[activeSheet] && sheetData[activeSheet][id] !== undefined) ? sheetData[activeSheet][id] : ''; }
function toNum(v) { if (v === '' || v === null || v === undefined) return 0; var n = parseFloat(String(v).replace(/[₡,\\s]/g, '')); return isNaN(n) ? 0 : n; }
function fmtNum(n) { if (n === null || n === undefined || isNaN(n)) return '#VALOR!'; return Number(n).toLocaleString('es-CR', { maximumFractionDigits: 10 }); }
function splitArgs(s) {
  var args = [], depth = 0, cur = '', inStr = false, sc = '';
  for (var i = 0; i < s.length; i++) {
    var ch = s[i];
    if (!inStr && (ch === '"' || ch === "'")) { inStr = true; sc = ch; cur += ch; continue; }
    if (inStr && ch === sc) { inStr = false; cur += ch; continue; }
    if (!inStr && ch === '(') depth++;
    if (!inStr && ch === ')') depth--;
    if (!inStr && (ch === ';' || ch === ',') && depth === 0) { args.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) args.push(cur.trim());
  return args;
}
function isRange(a) { return /^[A-Za-z]+\\d+:[A-Za-z]+\\d+$/.test((a || '').trim()); }
function getCells(from, to) {
  var fc = colIndex((from.match(/[A-Za-z]+/) || ['A'])[0]);
  var fr = parseInt((from.match(/\\d+/) || [1])[0]) - 1;
  var tc = colIndex((to.match(/[A-Za-z]+/) || ['A'])[0]);
  var tr = parseInt((to.match(/\\d+/) || [1])[0]) - 1;
  var out = [];
  for (var r = Math.min(fr, tr); r <= Math.max(fr, tr); r++)
    for (var c = Math.min(fc, tc); c <= Math.max(fc, tc); c++) out.push(cellId(r, c));
  return out;
}
function rangeNums(a) { var p = a.trim().split(':'); return getCells(p[0], p[1]).map(function (c) { return toNum(computeValue(c)); }); }
function rangeVals(a) { var p = a.trim().split(':'); return getCells(p[0], p[1]).map(function (c) { return computeValue(c); }); }
function resolveArg(a) {
  a = (a || '').trim();
  if ((a.startsWith('"') && a.endsWith('"')) || (a.startsWith("'") && a.endsWith("'"))) return a.slice(1, -1);
  if (/^[A-Za-z]+\\d+$/.test(a)) return computeValue(a.toUpperCase());
  if (a.startsWith('=')) return computeExpr(a.substring(1));
  if (!isNaN(a) && a !== '') return parseFloat(a);
  return a;
}
function resolveNum(a) { return toNum(resolveArg(a)); }
function matchCrit(val, crit) {
  crit = String(crit).trim();
  var ops = ['>=', '<=', '<>', '!=', '>', '<'];
  for (var i = 0; i < ops.length; i++) {
    if (crit.indexOf(ops[i]) === 0) {
      var num = parseFloat(crit.substring(ops[i].length));
      var vn = parseFloat(String(val).replace(/[₡,\\s]/g, ''));
      switch (ops[i]) {
        case '>=': return vn >= num; case '<=': return vn <= num;
        case '<>': case '!=': return String(val).toLowerCase() !== crit.substring(2).toLowerCase();
        case '>': return vn > num; case '<': return vn < num;
      }
    }
  }
  if (crit.indexOf('*') >= 0 || crit.indexOf('?') >= 0) {
    var re = new RegExp('^' + crit.replace(/\\*/g, '.*').replace(/\\?/g, '.') + '$', 'i');
    return re.test(String(val));
  }
  return String(val).toLowerCase() === crit.toLowerCase();
}
function evalCond(c) {
  c = (c || '').trim();
  var ops = ['>=', '<=', '<>', '!=', '>', '<', '='];
  for (var i = 0; i < ops.length; i++) {
    var idx = c.indexOf(ops[i]);
    if (idx > 0) {
      var lv = resolveArg(c.substring(0, idx));
      var rv = resolveArg(c.substring(idx + ops[i].length));
      var ln = parseFloat(lv), rn = parseFloat(rv);
      var lc = !isNaN(ln) ? ln : String(lv).toLowerCase();
      var rc = !isNaN(rn) ? rn : String(rv).toLowerCase();
      switch (ops[i]) {
        case '>=': return lc >= rc; case '<=': return lc <= rc;
        case '<>': case '!=': return lc != rc;
        case '>': return lc > rc; case '<': return lc < rc; case '=': return lc == rc;
      }
    }
  }
  var v = resolveArg(c);
  return v !== '' && v !== 0 && v !== '0' && String(v).toUpperCase() !== 'FALSO';
}

function computeExpr(expr) {
  var exprUp = expr.toUpperCase().trim();
  try {
    function matchFn(names) {
      var re = new RegExp('^(' + names + ')\\\\((.*)\\\\)$', 'i');
      var m = exprUp.match(re);
      if (!m) return null;
      var open = expr.indexOf('(');
      var depth = 0, end = open;
      for (var i = open + 1; i < expr.length; i++) {
        if (expr[i] === '(') depth++;
        if (expr[i] === ')') { if (depth === 0) { end = i; break; } depth--; }
      }
      return expr.substring(open + 1, end);
    }
    var inner, args;

    if ((inner = matchFn('SUMA|SUM')) !== null) {
      args = splitArgs(inner); var s = 0;
      args.forEach(function (a) { if (isRange(a)) rangeNums(a).forEach(function (n) { s += n; }); else s += resolveNum(a); });
      return fmtNum(s);
    }
    if ((inner = matchFn('PROMEDIO|AVERAGE')) !== null) {
      args = splitArgs(inner); var t = 0, c = 0;
      args.forEach(function (a) { if (isRange(a)) rangeNums(a).forEach(function (n) { t += n; c++; }); else { t += resolveNum(a); c++; } });
      return c ? fmtNum(t / c) : '#DIV/0!';
    }
    if ((inner = matchFn('PROMEDIO\\\\.SI|AVERAGEIF')) !== null) {
      args = splitArgs(inner);
      var critRng2 = isRange(args[0]) ? rangeVals(args[0]) : [];
      var crit2 = String(resolveArg(args[1] || ''));
      var avgRng = args[2] ? (isRange(args[2]) ? rangeNums(args[2]) : []) : critRng2.map(toNum);
      var t2 = 0, cnt5 = 0;
      critRng2.forEach(function (v, i) { if (matchCrit(v, crit2)) { t2 += avgRng[i] || 0; cnt5++; } });
      return cnt5 ? fmtNum(t2 / cnt5) : '#DIV/0!';
    }
    if ((inner = matchFn('MAX|MAXIMO')) !== null) {
      args = splitArgs(inner); var nums = [];
      args.forEach(function (a) { if (isRange(a)) rangeNums(a).forEach(function (n) { nums.push(n); }); else nums.push(resolveNum(a)); });
      return nums.length ? fmtNum(Math.max.apply(null, nums)) : '0';
    }
    if ((inner = matchFn('MIN|MINIMO')) !== null) {
      args = splitArgs(inner); var nums2 = [];
      args.forEach(function (a) { if (isRange(a)) rangeNums(a).forEach(function (n) { nums2.push(n); }); else nums2.push(resolveNum(a)); });
      return nums2.length ? fmtNum(Math.min.apply(null, nums2)) : '0';
    }
    if ((inner = matchFn('CONTAR|COUNT')) !== null) {
      args = splitArgs(inner); var cnt = 0;
      args.forEach(function (a) { if (isRange(a)) rangeNums(a).forEach(function (n) { if (!isNaN(n)) cnt++; }); });
      return String(cnt);
    }
    if ((inner = matchFn('CONTARA|COUNTA')) !== null) {
      args = splitArgs(inner); var cnt2 = 0;
      args.forEach(function (a) { if (isRange(a)) rangeVals(a).forEach(function (v) { if (v !== '') cnt2++; }); });
      return String(cnt2);
    }
    if ((inner = matchFn('CONTAR\\\\.SI|COUNTIF')) !== null) {
      args = splitArgs(inner); var cnt3 = 0;
      if (isRange(args[0])) rangeVals(args[0]).forEach(function (v) { if (matchCrit(v, resolveArg(args[1]))) cnt3++; });
      return String(cnt3);
    }
    if ((inner = matchFn('SUMAR\\\\.SI|SUMIF')) !== null) {
      args = splitArgs(inner);
      var critRng = isRange(args[0]) ? rangeVals(args[0]) : [];
      var crit = String(resolveArg(args[1] || ''));
      var sumRng = args[2] ? (isRange(args[2]) ? rangeNums(args[2]) : []) : critRng.map(toNum);
      var s2 = 0;
      critRng.forEach(function (v, i) { if (matchCrit(v, crit)) s2 += sumRng[i] || 0; });
      return fmtNum(s2);
    }
    if ((inner = matchFn('SI|IF')) !== null) {
      args = splitArgs(inner);
      return evalCond(args[0]) ? String(resolveArg(args[1] || '')) : String(resolveArg(args[2] || ''));
    }
    if ((inner = matchFn('Y|AND')) !== null) { args = splitArgs(inner); return args.every(function (a) { return evalCond(a); }) ? 'VERDADERO' : 'FALSO'; }
    if ((inner = matchFn('O|OR')) !== null) { args = splitArgs(inner); return args.some(function (a) { return evalCond(a); }) ? 'VERDADERO' : 'FALSO'; }
    if ((inner = matchFn('CONCATENAR|CONCATENATE|CONCAT')) !== null) {
      return splitArgs(inner).map(function (a) { return isRange(a) ? rangeVals(a).join('') : String(resolveArg(a)); }).join('');
    }
    if ((inner = matchFn('REDONDEAR|ROUND')) !== null) {
      args = splitArgs(inner); return fmtNum(parseFloat(resolveNum(args[0]).toFixed(parseInt(resolveNum(args[1] || '0')))));
    }
    if ((inner = matchFn('MAYUSC|UPPER')) !== null) { return String(resolveArg(splitArgs(inner)[0])).toUpperCase(); }
    if ((inner = matchFn('MINUSC|LOWER')) !== null) { return String(resolveArg(splitArgs(inner)[0])).toLowerCase(); }
    if ((inner = matchFn('NOMPROPIO|PROPER')) !== null) {
      return String(resolveArg(splitArgs(inner)[0])).replace(/\\w\\S*/g, function (w) { return w.charAt(0).toUpperCase() + w.substr(1).toLowerCase(); });
    }
    if ((inner = matchFn('ESPACIOS|TRIM')) !== null) { return String(resolveArg(splitArgs(inner)[0])).replace(/\\s+/g, ' ').trim(); }
    if ((inner = matchFn('ESBLANCO|ISBLANK')) !== null) { var vb = resolveArg(splitArgs(inner)[0]); return (vb === '' || vb === null) ? 'VERDADERO' : 'FALSO'; }
    if ((inner = matchFn('ESNUMERO|ISNUMBER')) !== null) { var vn2 = resolveArg(splitArgs(inner)[0]); return !isNaN(parseFloat(vn2)) && vn2 !== '' ? 'VERDADERO' : 'FALSO'; }
    if ((inner = matchFn('ABS')) !== null) { return fmtNum(Math.abs(resolveNum(splitArgs(inner)[0]))); }
    if ((inner = matchFn('POTENCIA|POWER')) !== null) { args = splitArgs(inner); return fmtNum(Math.pow(resolveNum(args[0]), resolveNum(args[1]))); }
    if ((inner = matchFn('RAIZ|SQRT')) !== null) { return fmtNum(Math.sqrt(resolveNum(splitArgs(inner)[0]))); }
    if (exprUp === 'HOY()' || exprUp === 'TODAY()') return new Date().toLocaleDateString('es-CR');
    if (exprUp === 'AHORA()' || exprUp === 'NOW()') return new Date().toLocaleString('es-CR');
    if ((inner = matchFn('DIA|DAY')) !== null) { var dd = new Date(String(resolveArg(splitArgs(inner)[0]))); return isNaN(dd.getTime()) ? '#VALOR!' : String(dd.getDate()); }
    if ((inner = matchFn('MES|MONTH')) !== null) { var dm = new Date(String(resolveArg(splitArgs(inner)[0]))); return isNaN(dm.getTime()) ? '#VALOR!' : String(dm.getMonth() + 1); }
    if ((inner = matchFn('AÑO|YEAR')) !== null) { var dy = new Date(String(resolveArg(splitArgs(inner)[0]))); return isNaN(dy.getTime()) ? '#VALOR!' : String(dy.getFullYear()); }
    if ((inner = matchFn('TEXTO|TEXT')) !== null) {
      args = splitArgs(inner); var nT = resolveNum(args[0]); var fmt4 = String(resolveArg(args[1] || ''));
      if (fmt4.indexOf('#,##0') >= 0) return nT.toLocaleString('es-CR', { minimumFractionDigits: fmt4.indexOf('.00') >= 0 ? 2 : 0 });
      return String(nT);
    }
    if ((inner = matchFn('BUSCARV|VLOOKUP')) !== null) {
      args = splitArgs(inner);
      var sv = String(resolveArg(args[0])).toLowerCase();
      var rng = args[1], colN = parseInt(resolveNum(args[2])) - 1;
      if (isRange(rng)) {
        var p = rng.trim().split(':');
        var fc = colIndex(p[0].match(/[A-Za-z]+/)[0]);
        var fr = parseInt(p[0].match(/\\d+/)[0]) - 1;
        var tr = parseInt(p[1].match(/\\d+/)[0]) - 1;
        for (var ri = fr; ri <= tr; ri++) {
          if (String(computeValue(cellId(ri, fc))).toLowerCase() === sv) return String(computeValue(cellId(ri, fc + colN)));
        }
      }
      return '#N/A';
    }
    if ((inner = matchFn('BUSCARX|XLOOKUP')) !== null) {
      args = splitArgs(inner);
      var sv2 = String(resolveArg(args[0])).toLowerCase();
      var lookVals = isRange(args[1]) ? rangeVals(args[1]) : [];
      var retVals = isRange(args[2]) ? rangeVals(args[2]) : [];
      for (var i = 0; i < lookVals.length; i++) if (String(lookVals[i]).toLowerCase() === sv2) return String(retVals[i]);
      return args[3] ? String(resolveArg(args[3])) : '#N/A';
    }
    if ((inner = matchFn('COINCIDIR|MATCH')) !== null) {
      args = splitArgs(inner);
      var sv3 = String(resolveArg(args[0])).toLowerCase();
      if (isRange(args[1])) {
        var mv = rangeVals(args[1]);
        for (var i2 = 0; i2 < mv.length; i2++) if (String(mv[i2]).toLowerCase() === sv3) return String(i2 + 1);
      }
      return '#N/A';
    }
    if ((inner = matchFn('INDICE|INDEX')) !== null) {
      args = splitArgs(inner);
      var r10 = parseInt(resolveNum(args[1])) - 1, c10 = parseInt(resolveNum(args[2] || '1')) - 1;
      if (isRange(args[0])) {
        var p3 = args[0].trim().split(':');
        var fc2 = colIndex(p3[0].match(/[A-Za-z]+/)[0]);
        var fr2 = parseInt(p3[0].match(/\\d+/)[0]) - 1;
        return String(computeValue(cellId(fr2 + r10, fc2 + c10)));
      }
      return '#REF!';
    }
    if ((inner = matchFn('IVA')) !== null) {
      args = splitArgs(inner);
      var base = isRange(args[0]) ? rangeNums(args[0]).reduce(function (a, b) { return a + b; }, 0) : resolveNum(args[0]);
      var rate = args[1] ? resolveNum(args[1]) : 0.13;
      return fmtNum(base * rate);
    }
    if ((inner = matchFn('PAGO|PMT')) !== null) {
      args = splitArgs(inner);
      var r3 = resolveNum(args[0]), n = resolveNum(args[1]), pv = resolveNum(args[2]);
      if (r3 === 0) return fmtNum(-pv / n);
      return fmtNum(r3 * pv / (1 - Math.pow(1 + r3, -n)));
    }
    if ((inner = matchFn('VA|PV')) !== null) {
      args = splitArgs(inner);
      var r4 = resolveNum(args[0]), n2 = resolveNum(args[1]), pmt = resolveNum(args[2]);
      if (r4 === 0) return fmtNum(-pmt * n2);
      return fmtNum(-pmt * (1 - Math.pow(1 + r4, -n2)) / r4);
    }
    if ((inner = matchFn('VF|FV')) !== null) {
      args = splitArgs(inner);
      var r5 = resolveNum(args[0]), n3 = resolveNum(args[1]), pmt2 = resolveNum(args[2]);
      var pv2 = args[3] ? resolveNum(args[3]) : 0;
      return fmtNum(-pv2 * Math.pow(1 + r5, n3) - pmt2 * (Math.pow(1 + r5, n3) - 1) / r5);
    }
    if ((inner = matchFn('SIFECHA|DATEDIF')) !== null) {
      args = splitArgs(inner);
      var d1 = new Date(String(resolveArg(args[0]))), d2 = new Date(String(resolveArg(args[1])));
      var unit = String(resolveArg(args[2])).toUpperCase();
      var diff = d2 - d1;
      if (unit === 'Y') return String(Math.floor(diff / (365.25 * 86400000)));
      if (unit === 'M') return String(Math.floor(diff / (30.44 * 86400000)));
      return String(Math.floor(diff / 86400000));
    }

    if (isRange(expr)) {
      var p2 = expr.split(':'); var total = 0;
      getCells(p2[0], p2[1]).forEach(function (c) { total += toNum(computeValue(c)); });
      return fmtNum(total);
    }
    if (/^[A-Za-z]+\\d+$/.test(expr)) return String(computeValue(expr.toUpperCase()));

    var safe = expr.replace(/([A-Za-z]+\\d+)/g, function (m) { return toNum(computeValue(m.toUpperCase())) || 0; });
    if (/^[0-9+\\-*/.() ]+$/.test(safe)) {
      var result = Function('"use strict";return (' + safe + ')')();
      return isNaN(result) ? '#ERR' : fmtNum(result);
    }
    return '#ERROR';
  } catch (e) { return '#ERR'; }
}

function computeValue(id) {
  var raw = getRaw(id);
  if (typeof raw === 'string' && raw.charAt(0) === '=') return computeExpr(raw.substring(1));
  return raw;
}

// ══════════════════════════════════════════════
// RENDER
// ══════════════════════════════════════════════
function buildTable() {
  var table = document.getElementById('sheetTable');
  var html = '<thead><tr><th class="corner"></th>';
  for (var c = 0; c < COLS; c++) html += '<th>' + colLetter(c) + '</th>';
  html += '</tr></thead><tbody>';
  for (var r = 0; r < ROWS; r++) {
    html += '<tr><td class="rowhead">' + (r + 1) + '</td>';
    for (var c2 = 0; c2 < COLS; c2++) {
      var id = cellId(r, c2);
      html += '<td><div class="cell" id="cell_' + id + '" data-id="' + id + '" contenteditable="true"></div></td>';
    }
    html += '</tr>';
  }
  html += '</tbody>';
  table.innerHTML = html;
  attachCellEvents();
  renderAllCells();
  renderTabs();
}

function renderAllCells() {
  var data = sheetData[activeSheet] || {};
  var formats = sheetFormats[activeSheet] || {};
  Object.keys(data).forEach(function (id) {
    var el = document.getElementById('cell_' + id);
    if (!el || document.activeElement === el) return;
    var val = computeValue(id);
    var fmt = formats[id] || {};
    if (fmt.currency && val !== '' && !isNaN(parseFloat(String(val).replace(/[₡,]/g, '')))) {
      el.textContent = '₡' + parseFloat(String(val).replace(/[₡,\\s]/g, '')).toLocaleString('es-CR', { minimumFractionDigits: 2 });
    } else {
      el.textContent = val;
    }
    el.classList.toggle('bold', !!fmt.bold);
  });
}

function renderTabs() {
  var tabsRow = document.getElementById('tabsRow');
  var html = '';
  sheets.forEach(function (s) { html += '<div class="tab' + (s === activeSheet ? ' active' : '') + '" data-sheet="' + s + '">' + s + '</div>'; });
  html += '<div id="addTabBtn">+</div>';
  tabsRow.innerHTML = html;
  var lastTap = {};
  tabsRow.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      var name = this.dataset.sheet;
      var now = Date.now();
      if (lastTap[name] && now - lastTap[name] < 400) {
        openTabMenu(name);
      } else {
        activeSheet = name; buildTable();
      }
      lastTap[name] = now;
    });
  });
  document.getElementById('addTabBtn').addEventListener('click', function () {
    snapshot();
    var n = sheets.length + 1; var name = 'Hoja' + n;
    while (sheets.indexOf(name) >= 0) { n++; name = 'Hoja' + n; }
    sheets.push(name); sheetData[name] = {}; sheetFormats[name] = {};
    activeSheet = name; buildTable(); autoSave();
  });
}

function openTabMenu(name) {
  tabMenuTarget = name;
  document.getElementById('tabMenuTitle').textContent = 'Hoja: ' + name + ' (toca 2 veces para renombrar/duplicar/eliminar)';
  document.getElementById('renameInput').value = name;
  document.getElementById('tabMenuOverlay').classList.add('show');
}
document.getElementById('tabMenuCancel').addEventListener('click', function () { document.getElementById('tabMenuOverlay').classList.remove('show'); });
document.getElementById('btnRenameConfirm').addEventListener('click', function () {
  var newName = document.getElementById('renameInput').value.trim();
  if (!newName || sheets.indexOf(newName) >= 0) { alert('Nombre inválido o ya existe.'); return; }
  snapshot();
  var idx = sheets.indexOf(tabMenuTarget);
  sheets[idx] = newName;
  sheetData[newName] = sheetData[tabMenuTarget]; delete sheetData[tabMenuTarget];
  sheetFormats[newName] = sheetFormats[tabMenuTarget]; delete sheetFormats[tabMenuTarget];
  if (activeSheet === tabMenuTarget) activeSheet = newName;
  document.getElementById('tabMenuOverlay').classList.remove('show');
  buildTable(); autoSave();
});
document.getElementById('btnDuplicate').addEventListener('click', function () {
  snapshot();
  var n = 1; var newName = tabMenuTarget + ' copia';
  while (sheets.indexOf(newName) >= 0) { n++; newName = tabMenuTarget + ' copia ' + n; }
  sheets.push(newName);
  sheetData[newName] = JSON.parse(JSON.stringify(sheetData[tabMenuTarget] || {}));
  sheetFormats[newName] = JSON.parse(JSON.stringify(sheetFormats[tabMenuTarget] || {}));
  activeSheet = newName;
  document.getElementById('tabMenuOverlay').classList.remove('show');
  buildTable(); autoSave();
});
document.getElementById('btnDeleteSheet').addEventListener('click', function () {
  if (sheets.length <= 1) { alert('Debe quedar al menos una hoja.'); return; }
  if (!confirm('¿Eliminar la hoja "' + tabMenuTarget + '"? Esta acción no se puede deshacer con el botón Deshacer una vez guardada.')) return;
  snapshot();
  var idx = sheets.indexOf(tabMenuTarget);
  sheets.splice(idx, 1);
  delete sheetData[tabMenuTarget];
  delete sheetFormats[tabMenuTarget];
  if (activeSheet === tabMenuTarget) activeSheet = sheets[0];
  document.getElementById('tabMenuOverlay').classList.remove('show');
  buildTable(); autoSave();
});

// ══════════════════════════════════════════════
// EVENTOS DE CELDA + NAVEGACIÓN
// ══════════════════════════════════════════════
function attachCellEvents() {
  document.querySelectorAll('.cell').forEach(function (el) {
    el.addEventListener('focus', function () {
      document.querySelectorAll('.cell.selected').forEach(function (e) { e.classList.remove('selected'); });
      el.classList.add('selected');
      var id = el.dataset.id;
      document.getElementById('cellRef').textContent = id;
      document.getElementById('formulaInput').value = getRaw(id);
      el.textContent = getRaw(id);
    });
    el.addEventListener('blur', function () { commitCell(el); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); snapshot(); el.blur(); moveSelection(e.key === 'Tab' ? 1 : 0, e.key === 'Enter' ? 1 : 0); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); el.blur(); moveSelection(0, 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); el.blur(); moveSelection(0, -1); }
      else if (e.key === 'ArrowLeft' && el.textContent === '') { e.preventDefault(); el.blur(); moveSelection(-1, 0); }
      else if (e.key === 'ArrowRight' && el.textContent === '') { e.preventDefault(); el.blur(); moveSelection(1, 0); }
    });
  });
}
function commitCell(el) {
  var id = el.dataset.id;
  var val = el.textContent.trim();
  if (!sheetData[activeSheet]) sheetData[activeSheet] = {};
  if (val === '') delete sheetData[activeSheet][id]; else sheetData[activeSheet][id] = val;
  renderAllCells(); el.classList.remove('selected'); autoSave();
}
function moveSelection(dc, dr) {
  var id = document.getElementById('cellRef').textContent;
  var m = id.match(/([A-Za-z]+)(\\d+)/);
  var c = colIndex(m[1]) + dc, r = parseInt(m[2]) - 1 + dr;
  c = Math.max(0, Math.min(COLS - 1, c)); r = Math.max(0, Math.min(ROWS - 1, r));
  var next = document.getElementById('cell_' + cellId(r, c));
  if (next) next.focus();
}

document.getElementById('formulaInput').addEventListener('input', function () {
  var id = document.getElementById('cellRef').textContent;
  var el = document.getElementById('cell_' + id);
  if (el) el.textContent = this.value;
});
document.getElementById('formulaInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    snapshot();
    var id = document.getElementById('cellRef').textContent;
    var el = document.getElementById('cell_' + id);
    if (el) { el.textContent = this.value; commitCell(el); }
  }
});

document.getElementById('btnUndo').addEventListener('click', undo);

document.getElementById('btnBold').addEventListener('click', function () {
  snapshot();
  var id = document.getElementById('cellRef').textContent;
  if (!sheetFormats[activeSheet]) sheetFormats[activeSheet] = {};
  if (!sheetFormats[activeSheet][id]) sheetFormats[activeSheet][id] = {};
  sheetFormats[activeSheet][id].bold = !sheetFormats[activeSheet][id].bold;
  renderAllCells(); autoSave();
});
document.getElementById('btnCurrency').addEventListener('click', function () {
  snapshot();
  var id = document.getElementById('cellRef').textContent;
  if (!sheetFormats[activeSheet]) sheetFormats[activeSheet] = {};
  if (!sheetFormats[activeSheet][id]) sheetFormats[activeSheet][id] = {};
  sheetFormats[activeSheet][id].currency = !sheetFormats[activeSheet][id].currency;
  renderAllCells(); autoSave();
});
document.getElementById('btnClear').addEventListener('click', function () {
  snapshot();
  var id = document.getElementById('cellRef').textContent;
  delete sheetData[activeSheet][id];
  if (sheetFormats[activeSheet]) delete sheetFormats[activeSheet][id];
  document.getElementById('formulaInput').value = '';
  renderAllCells(); autoSave();
});
document.getElementById('btnAddRow').addEventListener('click', function () { snapshot(); ROWS += 10; buildTable(); });
document.getElementById('btnAddCol').addEventListener('click', function () { snapshot(); COLS = Math.min(26, COLS + 4); buildTable(); });

document.getElementById('templateSelect').addEventListener('change', function () {
  var v = this.value; if (!v) return; snapshot(); loadTemplate(v); this.value = '';
});

function loadTemplate(tipo) {
  var hoy = new Date().toLocaleDateString('es-CR');
  var n = sheets.length + 1;
  var baseName = tipo === 'diario' ? 'Diario' : tipo === 'mayor' ? 'Mayor' : tipo === 'balance' ? 'Balance' : tipo === 'conciliacion' ? 'Conciliacion' : 'Hoja';
  var name = baseName;
  while (sheets.indexOf(name) >= 0) name = baseName + n++;
  sheets.push(name); sheetData[name] = {}; sheetFormats[name] = {};
  activeSheet = name;
  var d = sheetData[name], f = sheetFormats[name];
  function set(r, c, v, bold) { d[cellId(r, c)] = v; if (bold) f[cellId(r, c)] = { bold: true }; }

  if (tipo === 'diario') {
    set(0, 0, '📘 LIBRO DIARIO', true);
    ['Fecha', 'N° Asiento', 'Código', 'Cuenta', 'Debe (₡)', 'Haber (₡)'].forEach(function (h, i) { set(1, i, h, true); });
    [[hoy, '001', '1.1.01', 'Caja y Bancos', '56500', ''],
     [hoy, '001', '4.1.01', 'Ventas', '', '50000'],
     [hoy, '001', '2.1.05', 'IVA por Pagar', '', '6500']]
      .forEach(function (row, i) { row.forEach(function (v, j) { set(2 + i, j, v); }); });
    set(5, 3, 'TOTALES', true);
    d[cellId(5, 4)] = '=SUMA(E3:E5)'; d[cellId(5, 5)] = '=SUMA(F3:F5)';
  } else if (tipo === 'mayor') {
    set(0, 0, '📗 LIBRO MAYOR — Caja y Bancos (1.1.01)', true);
    ['Fecha', 'Descripción', 'Ref.', 'Debe (₡)', 'Haber (₡)', 'Saldo (₡)'].forEach(function (h, i) { set(1, i, h, true); });
    [[hoy, 'Saldo inicial', '', '', '', '0'],
     [hoy, 'Venta F-001', 'F-001', '56500', '', '56500'],
     [hoy, 'Pago proveedor', 'C-001', '', '15000', '41500']]
      .forEach(function (row, i) { row.forEach(function (v, j) { set(2 + i, j, v); }); });
    set(5, 2, 'TOTALES', true);
    d[cellId(5, 3)] = '=SUMA(D3:D5)'; d[cellId(5, 4)] = '=SUMA(E3:E5)';
  } else if (tipo === 'balance') {
    set(0, 0, '📊 BALANCE DE COMPROBACIÓN', true);
    ['Código', 'Cuenta', 'Debe (₡)', 'Haber (₡)'].forEach(function (h, i) { set(1, i, h, true); });
    [['1.1.01', 'Caja y Bancos', '79700', '15000'],
     ['2.1.01', 'Proveedores', '', '20000'],
     ['4.1.01', 'Ventas', '', '70000']]
      .forEach(function (row, i) { row.forEach(function (v, j) { set(2 + i, j, v); }); });
    set(5, 1, 'TOTALES', true);
    d[cellId(5, 2)] = '=SUMA(C3:C5)'; d[cellId(5, 3)] = '=SUMA(D3:D5)';
  } else if (tipo === 'conciliacion') {
    set(0, 0, '🏦 CONCILIACIÓN BANCARIA', true);
    set(1, 0, 'SEGÚN BANCO', true);
    ['Concepto', 'Monto (₡)'].forEach(function (h, i) { set(2, i, h, true); });
    [['Saldo estado de cuenta', '95000'], ['(+) Depósitos en tránsito', '20000'], ['(-) Cheques pendientes', '-5000']]
      .forEach(function (row, i) { row.forEach(function (v, j) { set(3 + i, j, v); }); });
    set(6, 0, 'Saldo ajustado banco', true);
    d[cellId(6, 1)] = '=SUMA(B4:B6)';
  }
  buildTable(); autoSave();
}

// ══════════════════════════════════════════════
// BARRA DE ESTADO (rango rápido)
// ══════════════════════════════════════════════
document.getElementById('quickRange').addEventListener('input', function () {
  var v = this.value.trim();
  if (!isRange(v)) { document.getElementById('quickSum').textContent = 'Suma: -'; document.getElementById('quickAvg').textContent = 'Prom: -'; document.getElementById('quickCount').textContent = 'Cont: -'; return; }
  var nums = rangeNums(v);
  var sum = nums.reduce(function (a, b) { return a + b; }, 0);
  document.getElementById('quickSum').textContent = 'Suma: ' + fmtNum(sum);
  document.getElementById('quickAvg').textContent = 'Prom: ' + (nums.length ? fmtNum(sum / nums.length) : '0');
  document.getElementById('quickCount').textContent = 'Cont: ' + nums.filter(function (n) { return n !== 0; }).length;
});

// ══════════════════════════════════════════════
// GRÁFICOS
// ══════════════════════════════════════════════
document.getElementById('btnChart').addEventListener('click', function () { document.getElementById('chartOverlay').classList.add('show'); });
document.getElementById('chartCancel').addEventListener('click', function () { document.getElementById('chartOverlay').classList.remove('show'); });
document.getElementById('chartInsert').addEventListener('click', function () {
  var type = document.getElementById('chartType').value;
  var range = document.getElementById('chartRange').value;
  var labelsRange = document.getElementById('chartLabels').value;
  var title = document.getElementById('chartTitle').value || 'Gráfico';
  if (!isRange(range)) { alert('Rango de datos inválido, ej: B2:B6'); return; }
  var values = rangeNums(range);
  var labels = isRange(labelsRange) ? rangeVals(labelsRange) : values.map(function (_, i) { return 'Serie ' + (i + 1); });
  document.getElementById('chartOverlay').classList.remove('show');
  insertChart(type, title, labels, values);
});

var chartCount = 0;
function insertChart(type, title, labels, values) {
  chartCount++;
  var id = 'chart_' + chartCount;
  var wrap = document.createElement('div');
  wrap.className = 'chart-float';
  wrap.style.left = (40 + chartCount * 10) + 'px';
  wrap.style.top = (60 + chartCount * 10) + 'px';
  wrap.innerHTML = '<div class="chead"><span>📊 ' + title + '</span><button onclick="this.closest(\\'.chart-float\\').remove()">✕</button></div>' +
    '<canvas id="' + id + '" width="260" height="160"></canvas>';
  document.getElementById('gridWrap').appendChild(wrap);

  var isDrag = false, dx = 0, dy = 0;
  wrap.querySelector('.chead').addEventListener('mousedown', function (e) { isDrag = true; dx = e.clientX - wrap.offsetLeft; dy = e.clientY - wrap.offsetTop; });
  document.addEventListener('mousemove', function (e) { if (isDrag) { wrap.style.left = (e.clientX - dx) + 'px'; wrap.style.top = (e.clientY - dy) + 'px'; } });
  document.addEventListener('mouseup', function () { isDrag = false; });

  setTimeout(function () { drawChart(id, type, title, labels, values); }, 30);
}

function drawChart(canvasId, type, title, labels, values) {
  var cvs = document.getElementById(canvasId);
  if (!cvs) return;
  var ctx = cvs.getContext('2d');
  var W = 260, H = 160, padL = 34, padR = 8, padT = 8, padB = 26;
  var cW = W - padL - padR, cH = H - padT - padB;
  var max = Math.max.apply(null, values) || 1;
  var colors = ['#5abf2a', '#3a9e10', '#1d4ed8', '#dc2626', '#d97706', '#7c3aed', '#0891b2'];
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);

  if (type === 'bar') {
    var bw = Math.min(28, cW / (values.length + 1));
    values.forEach(function (v, i) {
      var h = (v / max) * cH; var x = padL + i * (bw + 6);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(x, padT + cH - h, bw, h);
      ctx.fillStyle = '#3d6020'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(String(labels[i] || '').substring(0, 5), x + bw / 2, padT + cH + 11);
    });
  } else if (type === 'line') {
    var pw = cW / (values.length - 1 || 1);
    ctx.beginPath(); ctx.strokeStyle = colors[0]; ctx.lineWidth = 2;
    values.forEach(function (v, i) {
      var x2 = padL + i * pw, y2 = padT + cH - (v / max) * cH;
      i === 0 ? ctx.moveTo(x2, y2) : ctx.lineTo(x2, y2);
    });
    ctx.stroke();
    values.forEach(function (v, i) {
      var x3 = padL + i * pw, y3 = padT + cH - (v / max) * cH;
      ctx.beginPath(); ctx.arc(x3, y3, 3, 0, Math.PI * 2); ctx.fillStyle = colors[0]; ctx.fill();
    });
  } else if (type === 'pie') {
    var total = values.reduce(function (a, b) { return a + b; }, 0) || 1;
    var start = -Math.PI / 2, cx = W / 2, cy = H / 2, r = Math.min(cW, cH) / 2;
    values.forEach(function (v, i) {
      var slice = (v / total) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, start, start + slice); ctx.closePath();
      ctx.fillStyle = colors[i % colors.length]; ctx.fill();
      start += slice;
    });
  }
  ctx.fillStyle = '#1e5208'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(title, W / 2, 10);
}

// ══════════════════════════════════════════════
// EXPORTAR CSV
// ══════════════════════════════════════════════
document.getElementById('btnCSV').addEventListener('click', function () {
  var data = sheetData[activeSheet] || {};
  var maxRow = 0, maxCol = 0;
  Object.keys(data).forEach(function (key) {
    var m = key.match(/([A-Z]+)(\\d+)/); if (!m) return;
    var r = parseInt(m[2]) - 1; var c = colIndex(m[1]);
    if (r > maxRow) maxRow = r; if (c > maxCol) maxCol = c;
  });
  if (!Object.keys(data).length) { alert('No hay datos para exportar.'); return; }
  var csv = '';
  for (var r = 0; r <= maxRow; r++) {
    var parts = [];
    for (var c = 0; c <= maxCol; c++) {
      var val = computeValue(cellId(r, c)) || '';
      parts.push('"' + String(val).replace(/"/g, '""') + '"');
    }
    csv += parts.join(',') + '\\n';
  }
  var blob = new Blob(['\\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'MatrizContableCR_' + activeSheet + '.csv';
  a.click();
  document.getElementById('saveStatus').textContent = 'CSV exportado';
});

// ══════════════════════════════════════════════
// PERSISTENCIA
// ══════════════════════════════════════════════
function autoSave() {
  try {
    localStorage.setItem('mcr_sheets_v3', JSON.stringify(sheets));
    localStorage.setItem('mcr_data_v3', JSON.stringify(sheetData));
    localStorage.setItem('mcr_formats_v3', JSON.stringify(sheetFormats));
    localStorage.setItem('mcr_active_v3', activeSheet);
    document.getElementById('saveStatus').textContent = '💾 ' + new Date().toLocaleTimeString('es-CR');
  } catch (e) {}
}
function restore() {
  try {
    var s = localStorage.getItem('mcr_sheets_v3');
    var d = localStorage.getItem('mcr_data_v3');
    var f = localStorage.getItem('mcr_formats_v3');
    var a = localStorage.getItem('mcr_active_v3');
    if (s) sheets = JSON.parse(s);
    if (d) sheetData = JSON.parse(d);
    if (f) sheetFormats = JSON.parse(f);
    if (a && sheets.indexOf(a) >= 0) activeSheet = a;
  } catch (e) {}
}

restore();
buildTable();
window.addEventListener('beforeunload', autoSave);
setInterval(autoSave, 20000);
</script>
</body>
</html>`

export default function SheetEditor({ userId, sheetId }) {
  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: SHEET_HTML }}
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
