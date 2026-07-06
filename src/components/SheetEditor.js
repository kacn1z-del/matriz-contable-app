import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

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

  #gridWrap { flex: 1; overflow: auto; -webkit-overflow-scrolling: touch; position: relative; user-select: none; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid #d7ead0; font-size: 12px; padding: 0; text-align: center; }
  th { background: #d8f5b0; color: #245f09; font-weight: 700; padding: 6px 4px; position: sticky; top: 0; z-index: 3; min-width: 78px; position: relative; }
  th.corner { position: sticky; left: 0; top: 0; z-index: 4; background: #b7e07a; min-width: 34px; }
  th .colResizer { position: absolute; right: 0; top: 0; width: 8px; height: 100%; cursor: col-resize; touch-action: none; }
  th .colResizer::after { content: ''; position: absolute; right: 3px; top: 20%; width: 2px; height: 60%; background: #245f09; opacity: .4; }
  td.rowhead { background: #d8f5b0; color: #245f09; font-weight: 700; width: 34px; position: sticky; left: 0; z-index: 2; }
  .cell { min-width: 78px; height: 26px; line-height: 26px; padding: 0 5px; outline: none; white-space: nowrap; overflow: hidden; background: #fff; position: relative; }
  .cell.selected { background: #fffbcc; outline: 2px solid #5abf2a; outline-offset: -2px; }
  .cell.in-range { background: #eaf7d8; }
  .cell.bold { font-weight: 800; color: #1e5208; }
  .cell.has-note::after { content: '●'; color: #d97706; font-size: 8px; position: absolute; top: 1px; right: 2px; }

  #statusBar {
    display: flex; gap: 14px; align-items: center; padding: 5px 10px;
    background: #d8f5b0; font-size: 11px; color: #245f09; font-weight: 700; flex-shrink: 0; flex-wrap: wrap;
  }
  #statusBar input { width: 90px; padding: 3px 6px; border: 1px solid #b7e07a; border-radius: 5px; font-size: 11px; }

  #rangeActionsBar {
    display: none; align-items: center; gap: 6px; padding: 6px 8px; background: #eaf7d8;
    border-bottom: 1.5px solid #cce9ae; flex-shrink: 0; overflow-x: auto; white-space: nowrap;
  }
  #rangeActionsBar.show { display: flex; }
  #rangeActionsBar span { font-size: 11px; font-weight: 800; color: #245f09; flex-shrink: 0; }
  #rangeActionsBar button {
    background: #2d7a0c; color: #fff; border: none; border-radius: 6px;
    padding: 6px 9px; font-size: 11px; font-weight: 700; flex-shrink: 0;
  }
  #rangeActionsBar button.danger { background: #dc2626; }

  #tabsRow { display: flex; align-items: center; background: #cce9ae; padding: 4px 6px; gap: 4px; overflow-x: auto; flex-shrink: 0; -webkit-overflow-scrolling: touch; }
  .tab { padding: 6px 12px; border-radius: 6px 6px 0 0; font-size: 12px; font-weight: 700; color: #3d6020; background: #b7e07a; white-space: nowrap; position: relative; }
  .tab.active { background: #fff; color: #2d7a0c; }
  #addTabBtn { padding: 6px 10px; border-radius: 6px; font-size: 14px; font-weight: 800; background: #245f09; color: #fff; flex-shrink: 0; }

  #chartOverlay, #tabMenuOverlay, #noteOverlay, #formatOverlay, #authOverlay, #matricesOverlay, #shareOverlay {
    position: fixed; inset: 0; background: rgba(10,30,5,.55); z-index: 9000;
    display: none; align-items: center; justify-content: center; padding: 12px;
  }
  #chartOverlay.show, #tabMenuOverlay.show, #noteOverlay.show, #formatOverlay.show, #authOverlay.show, #matricesOverlay.show, #shareOverlay.show { display: flex; }
  #chartModal, #tabMenuModal, #noteModal, #formatModal, #authModal, #shareModal { background: #fff; border-radius: 14px; width: 100%; max-width: 340px; max-height: 90vh; overflow-y: auto; padding: 14px; }
  #chartModal h3, #tabMenuModal h3, #noteModal h3, #formatModal h3, #authModal h3, #shareModal h3 { margin: 0 0 10px; font-size: 15px; color: #245f09; }
  #chartModal select, #chartModal input, #tabMenuModal input, #noteModal textarea, #formatModal select, #formatModal input, #authModal input, #shareModal input { width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #cce9ae; border-radius: 6px; font-size: 13px; font-family: inherit; }
  #noteModal textarea { min-height: 80px; resize: vertical; }
  .row { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
  .row button, #tabMenuModal .action-btn { padding: 8px 14px; border-radius: 7px; border: none; font-size: 13px; font-weight: 700; }
  .cancel { background: #eee; color: #555; }
  .ok { background: #2d7a0c; color: #fff; }
  .danger { background: #dc2626; color: #fff; }
  #tabMenuModal .action-btn { width: 100%; margin-bottom: 6px; text-align: left; background: #f2f9ea; color: #245f09; }
  .chart-float { position: absolute; background: #fff; border: 2px solid #cce9ae; border-radius: 10px; padding: 8px; z-index: 40; }
  .chart-float .chead { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 11px; font-weight: 700; color: #245f09; gap: 4px; }
  .chart-float .chead button { background: none; border: none; font-size: 13px; cursor: pointer; }
  .field-label { font-size: 11px; font-weight: 700; color: #3d6020; margin-bottom: 3px; display: block; }
  #syncStatusDot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #999; margin-right: 4px; }
  #syncStatusDot.online { background: #2d7a0c; }
  #syncStatusDot.syncing { background: #d97706; }
  #syncStatusDot.error { background: #dc2626; }

  #fnOverlay { position: fixed; inset: 0; background: rgba(10,30,5,.55); z-index: 9500; display: none; align-items: flex-end; justify-content: center; }
  #fnOverlay.show { display: flex; }
  #fnModal { background: #fff; border-radius: 14px 14px 0 0; width: 100%; max-width: 480px; height: 88vh; display: flex; flex-direction: column; overflow: hidden; }
  #fnHead { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #2d7a0c; flex-shrink: 0; }
  #fnHead h3 { margin: 0; color: #fff; font-size: 14px; }
  #fnHead button { background: none; border: none; color: #fff; font-size: 18px; }
  #fnCats { display: flex; gap: 5px; overflow-x: auto; padding: 8px 10px; flex-shrink: 0; background: #eaf7d8; -webkit-overflow-scrolling: touch; }
  .fnCatChip { flex-shrink: 0; padding: 5px 10px; border-radius: 14px; background: #cce9ae; color: #245f09; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .fnCatChip.active { background: #2d7a0c; color: #fff; }
  #fnSearchRow { padding: 8px 10px; flex-shrink: 0; }
  #fnSearchRow input { width: 100%; padding: 8px 10px; border: 1px solid #cce9ae; border-radius: 8px; font-size: 13px; }
  #fnListWrap { flex: 1; overflow-y: auto; padding: 0 10px; -webkit-overflow-scrolling: touch; }
  .fnItem { padding: 8px 6px; border-bottom: 1px solid #eee; }
  .fnItem .fnName { font-size: 13px; font-weight: 800; color: #1e5208; }
  .fnItem .fnDesc { font-size: 11.5px; color: #555; margin-top: 2px; }
  .fnItem.selected { background: #fffbcc; }
  #fnDetailPanel { flex-shrink: 0; border-top: 1.5px solid #cce9ae; padding: 10px 12px; background: #f8fbf3; max-height: 34vh; overflow-y: auto; }
  #fnDetailPanel.empty { display: none; }
  #fnDetailName { font-size: 14px; font-weight: 800; color: #1e5208; }
  #fnDetailSyntax { font-size: 12px; font-family: monospace; background: #eaf7d8; padding: 5px 7px; border-radius: 6px; margin: 5px 0; word-break: break-all; }
  #fnDetailDesc { font-size: 12px; color: #444; margin-bottom: 4px; }
  #fnDetailEx { font-size: 11.5px; color: #6b8f48; font-family: monospace; }
  #fnDetailPanel button { margin-top: 8px; background: #2d7a0c; color: #fff; border: none; border-radius: 7px; padding: 8px 14px; font-size: 12.5px; font-weight: 700; }
  #fnEmptyMsg { padding: 20px 10px; color: #888; font-size: 12.5px; text-align: center; }

  #feOverlay { position: fixed; inset: 0; background: rgba(10,30,5,.55); z-index: 9400; display: none; align-items: flex-end; justify-content: center; }
  #feOverlay.show { display: flex; }
  #feModal { background: #fff; border-radius: 14px 14px 0 0; width: 100%; max-width: 480px; height: 92vh; display: flex; flex-direction: column; overflow: hidden; }
  #feHead { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #2d7a0c; flex-shrink: 0; }
  #feHead h3 { margin: 0; color: #fff; font-size: 14px; }
  #feHead button { background: none; border: none; color: #fff; font-size: 18px; }
  #feBody { flex: 1; overflow-y: auto; padding: 10px 12px; -webkit-overflow-scrolling: touch; }
  .feRow2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .feRow3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .feField { margin-bottom: 8px; }
  .feField label { font-size: 10.5px; font-weight: 700; color: #3d6020; display: block; margin-bottom: 2px; }
  .feField input, .feField select { width: 100%; padding: 7px 8px; border: 1px solid #cce9ae; border-radius: 6px; font-size: 12.5px; font-family: inherit; }
  .feCard { background: #f8fbf3; border: 1px solid #cce9ae; border-radius: 10px; padding: 8px; margin-bottom: 10px; }
  .feCardTitle { font-size: 11.5px; font-weight: 800; color: #245f09; margin-bottom: 6px; }
  #feLineasTable { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-bottom: 6px; }
  #feLineasTable th { background: #d8f5b0; color: #245f09; padding: 5px 3px; font-size: 10.5px; }
  #feLineasTable td { padding: 3px 2px; border-bottom: 1px solid #eee; }
  #feLineasTable input { width: 100%; padding: 4px 5px; border: 1px solid #cce9ae; border-radius: 5px; font-size: 11.5px; }
  #feLineasTable .feQty { width: 40px; }
  #feLineasTable .fePrice { width: 62px; }
  #feAddLineaBtn { background: #245f09; color: #fff; border: none; border-radius: 6px; padding: 6px 10px; font-size: 11px; font-weight: 700; }
  #feTotalsBox { background: #eaf7d8; border-radius: 8px; padding: 10px 12px; margin-top: 6px; }
  #feTotalsBox .ftRow { display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px; }
  #feTotalsBox .ftTotal { font-weight: 800; color: #1e5208; font-size: 15px; border-top: 1.5px solid #b7e07a; padding-top: 6px; margin-top: 4px; }
  #feFooter { flex-shrink: 0; display: flex; gap: 6px; padding: 8px 12px; border-top: 1.5px solid #cce9ae; background: #fff; flex-wrap: wrap; }
  #feFooter button { flex: 1; min-width: 90px; padding: 9px 6px; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; }
  #feBtnXml { background: #245f09; color: #fff; }
  #feBtnPdf { background: #2d7a0c; color: #fff; }
  #feBtnClear { background: #eee; color: #555; }

  #feHistOverlay { position: fixed; inset: 0; background: rgba(10,30,5,.65); z-index: 9600; display: none; align-items: flex-end; justify-content: center; }
  #feHistOverlay.show { display: flex; }
  #feHistModal, #matricesModal { background: #fff; border-radius: 14px 14px 0 0; width: 100%; max-width: 480px; max-height: 70vh; display: flex; flex-direction: column; overflow: hidden; }
  #feHistHead, #matricesHead { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #245f09; flex-shrink: 0; }
  #feHistHead h3, #matricesHead h3 { color: #fff; margin: 0; font-size: 13px; }
  #feHistHead button, #matricesHead button { background: none; border: none; color: #fff; font-size: 18px; }
  #feHistList { overflow-y: auto; padding: 6px 10px; }
  .feHistItem { padding: 8px 6px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
  .feHistItem .fhInfo { font-size: 12px; }
  .feHistItem .fhNum { font-weight: 800; color: #1e5208; }
  .feHistItem .fhMeta { color: #777; font-size: 10.5px; }
  .feHistItem button { background: #2d7a0c; color: #fff; border: none; border-radius: 6px; padding: 5px 9px; font-size: 11px; font-weight: 700; }
  #feHistEmpty { padding: 20px 10px; color: #888; font-size: 12.5px; text-align: center; }
  .feSignBox { margin-top: 6px; padding: 6px 8px; background: #eaf7d8; border-radius: 6px; font-size: 10px; color: #3d6020; word-break: break-all; }

  #brOverlay { position: fixed; inset: 0; background: rgba(10,30,5,.55); z-index: 9300; display: none; align-items: flex-start; justify-content: center; padding-top: 15vh; }
  #brOverlay.show { display: flex; }
  #brModal { background: #fff; border-radius: 12px; width: 92%; max-width: 380px; padding: 12px; }
  #brModal h3 { margin: 0 0 8px; font-size: 14px; color: #245f09; }
  #brModal input { width: 100%; padding: 8px 9px; border: 1px solid #cce9ae; border-radius: 6px; font-size: 13px; margin-bottom: 8px; }
  #brStatus { font-size: 11px; color: #6b8f48; margin-bottom: 8px; }
  #brBtnRow { display: flex; gap: 6px; flex-wrap: wrap; }
  #brBtnRow button { flex: 1; min-width: 80px; padding: 8px 6px; border: none; border-radius: 7px; font-size: 12px; font-weight: 700; }
  #brFind { background: #245f09; color: #fff; }
  #brReplace { background: #2d7a0c; color: #fff; }
  #brReplaceAll { background: #1e5208; color: #fff; }
  #brCancelBtn { background: #eee; color: #555; }

  #undoGestureHint { position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%); background: rgba(36,95,9,.92); color: #fff; padding: 6px 12px; border-radius: 16px; font-size: 11px; z-index: 9999; display: none; }
  #undoGestureHint.show { display: block; }

  #siboOverlay { position: fixed; inset: 0; background: rgba(10,30,5,.55); z-index: 9200; display: none; align-items: flex-end; justify-content: center; }
  #siboOverlay.show { display: flex; }
  #siboModal { background: #fff; border-radius: 14px 14px 0 0; width: 100%; max-width: 480px; height: 82vh; display: flex; flex-direction: column; overflow: hidden; }
  #siboHead { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: linear-gradient(135deg, #2d7a0c, #1e5208); flex-shrink: 0; }
  #siboHead .shTitle { display: flex; align-items: center; gap: 6px; color: #fff; }
  #siboHead .shTitle span.dot { width: 7px; height: 7px; border-radius: 50%; background: #b7e07a; display: inline-block; animation: sibodot 2s infinite; }
  @keyframes sibodot { 0%,100%{opacity:1;} 50%{opacity:.3;} }
  #siboHead h3 { margin: 0; font-size: 14px; }
  #siboHead .shBtns button { background: none; border: none; color: #fff; font-size: 15px; margin-left: 8px; }
  #siboChips { display: flex; gap: 5px; overflow-x: auto; padding: 8px 10px; flex-shrink: 0; background: #eaf7d8; -webkit-overflow-scrolling: touch; }
  .siboChip { flex-shrink: 0; padding: 6px 11px; border-radius: 14px; background: #cce9ae; color: #245f09; font-size: 11px; font-weight: 700; white-space: nowrap; border: none; }
  #siboMessages { flex: 1; overflow-y: auto; padding: 10px 12px; -webkit-overflow-scrolling: touch; background: #fbfdf8; }
  .siboMsgUser, .siboMsgBot { max-width: 85%; padding: 8px 11px; border-radius: 12px; margin-bottom: 8px; font-size: 12.5px; line-height: 1.4; word-wrap: break-word; }
  .siboMsgUser { background: #2d7a0c; color: #fff; margin-left: auto; border-bottom-right-radius: 3px; }
  .siboMsgBot { background: #eaf7d8; color: #1e3a0a; border-bottom-left-radius: 3px; }
  .siboMsgBot b { color: #1e5208; }
  #siboInputRow { display: flex; gap: 6px; padding: 8px 10px; border-top: 1.5px solid #cce9ae; flex-shrink: 0; background: #fff; }
  #siboInputRow input { flex: 1; padding: 9px 10px; border: 1px solid #cce9ae; border-radius: 20px; font-size: 13px; }
  #siboInputRow button { background: #2d7a0c; color: #fff; border: none; border-radius: 50%; width: 38px; height: 38px; font-size: 15px; flex-shrink: 0; }
</style>
</head>
<body>
<div id="app">
  <div id="toolbar">
    <select id="langSelector">
      <option value="es">🇨🇷 Español</option>
      <option value="en">🇬🇧 English</option>
      <option value="bribri">Bribri</option>
      <option value="cabecar">Cabécar</option>
      <option value="ngabe">Ngäbe</option>
      <option value="boruca">Boruca</option>
      <option value="terraba">Térraba</option>
      <option value="maleku">Maleku</option>
    </select>
    <select id="templateSelect">
      <option value="">📁 Plantilla...</option>
      <option value="diario">📘 Libro Diario</option>
      <option value="mayor">📗 Libro Mayor</option>
      <option value="balance">📊 Balance Comprobación</option>
      <option value="conciliacion">🏦 Conciliación Bancaria</option>
      <option value="d151">🛒 D-151 Compras/Ventas</option>
      <option value="resultados">📈 Estado de Resultados</option>
      <option value="balancegeneral">🏛️ Balance General</option>
      <option value="blank">🗋 Hoja en blanco</option>
    </select>
    <button id="btnUndo" disabled>↶ Deshacer</button>
    <button id="btnCopy">⧉ Copiar</button>
    <button id="btnPaste">📋 Pegar</button>
    <button id="btnBold">N</button>
    <button id="btnCurrency">₡</button>
    <button id="btnPercent">%</button>
    <button id="btnFormat">🔢 Formato</button>
    <button id="btnNote">📝 Nota</button>
    <button id="btnChart">📊 Gráfico</button>
    <button id="btnInsertarTabla">🎨 +Tabla</button>
    <button id="btnTotales">Σ Totales</button>
    <button id="btnSibo">✦ Sibö</button>
    <button id="btnBuscarReemplazar">🔎 Buscar</button>
    <button id="btnFactura">🧾 Factura</button>
    <button id="btnFxLib">fx Funciones</button>
    <button id="btnLibroMayorAuto">📗 Mayor Auto</button>
    <button id="btnBalanceAuto">📊 Balance Auto</button>
    <button id="btnFlujoAuto">💧 Flujo Efectivo</button>
    <button id="btnD101">🇨🇷 D-101</button>
    <button id="btnCSV">⬇ CSV</button>
    <button id="btnAddRow">+Fila</button>
    <button id="btnDelRow">-Fila</button>
    <button id="btnAddCol">+Col</button>
    <button id="btnClear">Borrar</button>
    <button id="btnAccount">👤 Cuenta</button>
    <button id="btnMisMatrices">📁 Mis Matrices</button>
  </div>

  <div id="formulaBarRow">
    <span id="cellRef">A1</span>
    <input id="formulaInput" type="text" placeholder="Valor o fórmula: =SUMA(A1:A5)" />
    <span id="saveStatus">Listo</span>
  </div>

  <div id="rangeActionsBar">
    <span id="rangeLabel">A1:A1</span>
    <button id="raBold">N Negrita</button>
    <button id="raCurrency">₡ Moneda</button>
    <button id="raPercent">% Porcentaje</button>
    <button id="raFormat">🔢 Formato</button>
    <button id="raCopy">⧉ Copiar</button>
    <button id="raClear" class="danger">🗑 Borrar rango</button>
  </div>

  <div id="gridWrap">
    <table id="sheetTable"></table>
  </div>

  <div id="statusBar">
    <span>Rango:</span>
    <input id="quickRange" type="text" placeholder="arrastrá celdas o escribí ej: A1:A5" />
    <span id="quickSum">Suma: 0</span>
    <span id="quickAvg">Prom: 0</span>
    <span id="quickCount">Cont: 0</span>
    <span><span id="syncStatusDot"></span><span id="syncStatusText">Local</span></span>
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
      <option value="donut">Dona</option>
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

<div id="noteOverlay">
  <div id="noteModal">
    <h3>📝 Nota en <span id="noteCellRef">A1</span></h3>
    <textarea id="noteText" placeholder="Escribí una nota para esta celda..."></textarea>
    <div class="row">
      <button class="cancel" id="noteCancel">Cancelar</button>
      <button class="danger" id="noteDelete">Eliminar nota</button>
      <button class="ok" id="noteSave">Guardar</button>
    </div>
  </div>
</div>

<div id="formatOverlay">
  <div id="formatModal">
    <h3>🔢 Formato numérico avanzado</h3>
    <span class="field-label">Tipo</span>
    <select id="fmtType">
      <option value="general">General</option>
      <option value="number">Número</option>
      <option value="currency">Moneda (₡)</option>
      <option value="percent">Porcentaje</option>
      <option value="accounting">Contable (paréntesis en negativos)</option>
    </select>
    <span class="field-label">Decimales</span>
    <input id="fmtDecimals" type="number" min="0" max="10" value="2" />
    <span class="field-label">Separador de miles</span>
    <select id="fmtThousands">
      <option value="yes">Sí (1,000.00)</option>
      <option value="no">No (1000.00)</option>
    </select>
    <div class="row">
      <button class="cancel" id="fmtCancel">Cancelar</button>
      <button class="ok" id="fmtApply">Aplicar</button>
    </div>
  </div>
</div>

<div id="authOverlay">
  <div id="authModal">
    <h3>👤 Mi cuenta</h3>
    <div id="authLoggedOutView">
      <span class="field-label">Email</span>
      <input id="authEmail" type="text" placeholder="vos@correo.com" autocapitalize="none" />
      <span class="field-label">Contraseña</span>
      <input id="authPassword" type="password" placeholder="Mínimo 6 caracteres" />
      <div style="text-align:right;margin-bottom:8px;">
        <a href="#" id="authForgotLink" style="font-size:11px;color:#2d7a0c;">¿Olvidaste tu contraseña?</a>
      </div>
      <div id="authError" style="color:#dc2626;font-size:11.5px;margin-bottom:6px;"></div>
      <div class="row" style="justify-content:space-between;">
        <button class="cancel" id="authCancel">Cerrar</button>
        <button class="ok" id="authSignupBtn">Crear cuenta</button>
        <button class="ok" id="authLoginBtn">Iniciar sesión</button>
      </div>
    </div>
    <div id="authLoggedInView" style="display:none;">
      <p style="font-size:13px;">Sesión iniciada como:<br><b id="authCurrentEmail"></b></p>
      <div class="row" style="justify-content:space-between;">
        <button class="cancel" id="authCancel2">Cerrar</button>
        <button class="danger" id="authLogoutBtn">Cerrar sesión</button>
      </div>
    </div>
  </div>
</div>

<div id="matricesOverlay">
  <div id="matricesModal">
    <div id="matricesHead">
      <h3>📁 Mis Matrices (nube)</h3>
      <button id="matricesClose">✕</button>
    </div>
    <div style="padding:10px 12px;display:flex;gap:6px;">
      <input id="nuevaMatrizNombre" type="text" placeholder="Nombre de la nueva matriz" style="flex:1;padding:8px 9px;border:1px solid #cce9ae;border-radius:6px;font-size:13px;" />
      <button id="crearMatrizBtn" style="background:#2d7a0c;color:#fff;border:none;border-radius:6px;padding:8px 12px;font-size:12px;font-weight:700;">+ Nueva</button>
    </div>
    <div id="matricesList" style="overflow-y:auto;padding:0 10px;"></div>
  </div>
</div>

<div id="shareOverlay">
  <div id="shareModal">
    <h3>🔗 Compartir matriz</h3>
    <span class="field-label">Email de la persona con quien compartir</span>
    <input id="shareEmailInput" type="text" placeholder="persona@correo.com" autocapitalize="none" />
    <div id="shareStatus" style="font-size:11.5px;color:#6b8f48;margin-bottom:6px;"></div>
    <div class="row" style="justify-content:space-between;">
      <button class="cancel" id="shareCancel">Cerrar</button>
      <button class="ok" id="shareConfirmBtn">Compartir</button>
    </div>
  </div>
</div>

<div id="fnOverlay">
  <div id="fnModal">
    <div id="fnHead">
      <h3>fx Biblioteca · <span id="fnTotalBadge">452</span> funciones</h3>
      <button id="fnClose">✕</button>
    </div>
    <div id="fnCats"></div>
    <div id="fnSearchRow"><input id="fnSearchInput" type="text" placeholder="Buscar... ej: BUSCARV, SUMA, VAN, IVA" /></div>
    <div id="fnListWrap"><div id="fnList"></div></div>
    <div id="fnDetailPanel" class="empty">
      <div id="fnDetailName"></div>
      <div id="fnDetailSyntax"></div>
      <div id="fnDetailDesc"></div>
      <div id="fnDetailEx"></div>
      <button id="fnInsertBtn">↓ Insertar en celda</button>
    </div>
  </div>
</div>

<div id="feOverlay">
  <div id="feModal">
    <div id="feHead">
      <h3>🧾 Factura Electrónica 4.3 · CR</h3>
      <button id="feClose">✕</button>
    </div>
    <div id="feBody">
      <div class="feRow3">
        <div class="feField"><label>N° Consecutivo</label><input id="fe-num" value="001-001-00000001" /></div>
        <div class="feField"><label>Fecha</label><input id="fe-fecha" type="date" /></div>
        <div class="feField"><label>IVA</label>
          <select id="fe-iva-rate">
            <option value="0.13">13% General</option>
            <option value="0.04">4% Canasta básica</option>
            <option value="0.02">2% Medicamentos</option>
            <option value="0.01">1% Equipo médico</option>
            <option value="0">0% Exento</option>
          </select>
        </div>
      </div>

      <div class="feCard">
        <div class="feCardTitle">EMISOR</div>
        <div class="feField"><label>Nombre / Razón Social</label><input id="fe-emisor-nombre" placeholder="Mi Empresa S.A." /></div>
        <div class="feField"><label>Cédula Jurídica</label><input id="fe-emisor-cedula" placeholder="3-101-000000" /></div>
        <div class="feRow2">
          <div class="feField"><label>Teléfono</label><input id="fe-emisor-telefono" placeholder="2200-0000" /></div>
          <div class="feField"><label>Email</label><input id="fe-emisor-email" placeholder="correo@empresa.cr" /></div>
        </div>
      </div>

      <div class="feCard">
        <div class="feCardTitle">RECEPTOR</div>
        <div class="feField"><label>Nombre</label><input id="fe-receptor-nombre" placeholder="Cliente S.A." /></div>
        <div class="feField"><label>Cédula</label><input id="fe-receptor-cedula" placeholder="1-000-000000" /></div>
        <div class="feRow2">
          <div class="feField"><label>Teléfono</label><input id="fe-receptor-telefono" placeholder="8000-0000" /></div>
          <div class="feField"><label>Email</label><input id="fe-receptor-email" placeholder="cliente@correo.cr" /></div>
        </div>
      </div>

      <div class="feCard">
        <div class="feCardTitle">LÍNEAS DE DETALLE</div>
        <table id="feLineasTable">
          <thead><tr><th>Cant.</th><th>Descripción</th><th>Precio Unit.</th><th>Total</th><th></th></tr></thead>
          <tbody id="fe-lineas-body"></tbody>
        </table>
        <button id="feAddLineaBtn">+ Línea</button>
      </div>

      <div class="feField"><label>Observaciones</label><input id="fe-observaciones" placeholder="Opcional" /></div>
      <div class="feField" style="display:flex;align-items:center;gap:6px;">
        <input type="checkbox" id="fe-firma-check" style="width:auto;" />
        <label style="margin:0;" for="fe-firma-check">Incluir firma digital simulada</label>
      </div>

      <div id="feTotalsBox">
        <div class="ftRow"><span>Subtotal:</span><span id="fe-subtotal">₡0.00</span></div>
        <div class="ftRow"><span id="factura-iva-lbl">IVA 13%:</span><span id="fe-iva-amount">₡0.00</span></div>
        <div class="ftRow ftTotal"><span>TOTAL:</span><span id="fe-total">₡0.00</span></div>
      </div>
    </div>
    <div id="feFooter">
      <button id="feBtnHistorial">🕐 Historial</button>
      <button id="feBtnClear">Limpiar</button>
      <button id="feBtnXml">⬇ XML</button>
      <button id="feBtnPdf">⬇ PDF</button>
    </div>
  </div>
</div>

<div id="feHistOverlay">
  <div id="feHistModal">
    <div id="feHistHead">
      <h3>🕐 Historial de facturas</h3>
      <button id="feHistClose">✕</button>
    </div>
    <div id="feHistList"></div>
  </div>
</div>

<div id="brOverlay">
  <div id="brModal">
    <h3>🔎 Buscar y reemplazar</h3>
    <input id="brFindInput" type="text" placeholder="Buscar..." />
    <input id="brReplaceInput" type="text" placeholder="Reemplazar con..." />
    <div id="brStatus"></div>
    <div id="brBtnRow">
      <button id="brFind">Buscar siguiente</button>
      <button id="brReplace">Reemplazar</button>
      <button id="brReplaceAll">Reemplazar todo</button>
      <button id="brCancelBtn">Cerrar</button>
    </div>
  </div>
</div>
<div id="undoGestureHint">↶ Deshecho (gesto de 2 dedos)</div>

<div id="siboOverlay">
  <div id="siboModal">
    <div id="siboHead">
      <div class="shTitle"><span class="dot"></span><h3>✦ Sibö — Asistente contable</h3></div>
      <div class="shBtns">
        <button id="siboClearBtn" title="Limpiar chat">🗑</button>
        <button id="siboCloseBtn">✕</button>
      </div>
    </div>
    <div id="siboChips"></div>
    <div id="siboMessages"></div>
    <div id="siboInputRow">
      <input id="siboInput" type="text" placeholder="Preguntale a Sibö sobre contabilidad CR..." />
      <button id="siboSendBtn">➤</button>
    </div>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script>
// ══════════════════════════════════════════════
// ESTADO
// ══════════════════════════════════════════════
var ROWS = 60, COLS = 18;
var sheets = ['Hoja1', 'Hoja2', 'Hoja3'];
var activeSheet = 'Hoja1';
var sheetData = { Hoja1: {}, Hoja2: {}, Hoja3: {} };
var sheetFormats = { Hoja1: {}, Hoja2: {}, Hoja3: {} };
var sheetNotes = { Hoja1: {}, Hoja2: {}, Hoja3: {} };
var colWidths = { Hoja1: {}, Hoja2: {}, Hoja3: {} };
var undoStack = [];
var tabMenuTarget = null;
var clipboard = null;
var selRangeStart = null, selRangeEnd = null, isSelecting = false;

var fnData = JSON.parse('{"Búsqueda y Referencia":[{"n":"AGRUPARPOR","e":"GROUPBY","d":"Agrupa, agrega, ordena y filtra datos según los campos especificados.","s":"AGRUPARPOR(campo_filas; campo_valores; función)","x":"=AGRUPARPOR(A2:A10,B2:B10,SUMA)"},{"n":"AJUSTARCOLS","e":"WRAPCOLS","d":"Envuelve un vector de fila o columna después de un número especificado de valores.","s":"AJUSTARCOLS(vector; nº_wrap; [relleno])","x":"=AJUSTARCOLS(A1:A12,3)"},{"n":"AJUSTARFILAS","e":"WRAPROWS","d":"Envuelve un vector de fila o columna después de un número especificado de valores.","s":"AJUSTARFILAS(vector; nº_wrap; [relleno])","x":"=AJUSTARFILAS(A1:A12,3)"},{"n":"APILARH","e":"HSTACK","d":"Apila horizontalmente matrices en una sola.","s":"APILARH(matriz1; [matriz2]; ...)","x":"=APILARH(A1:B3,D1:E3)"},{"n":"APILARV","e":"VSTACK","d":"Apila verticalmente matrices en una sola.","s":"APILARV(matriz1; [matriz2]; ...)","x":"=APILARV(A1:B3,A5:B7)"},{"n":"AREAS","e":"AREAS","d":"Devuelve el número de áreas de una referencia.","s":"AREAS(referencia)","x":"=AREAS((A1:B2,C3:D4))"},{"n":"BUSCAR","e":"LOOKUP","d":"Busca valores en un rango de una columna, fila o matriz.","s":"BUSCAR(valor_buscado; vector_de_comparación; [vector_resultado])","x":"=BUSCAR(A2,B2:B10,C2:C10)"},{"n":"BUSCARH","e":"HLOOKUP","d":"Busca en la primera fila de una tabla y devuelve el valor de la fila especificada.","s":"BUSCARH(valor_buscado; matriz_buscar_en; indicador_filas; [ordenado])","x":"=BUSCARH(\\\\"Precio\\\\",A1:E5,3,FALSO)"},{"n":"BUSCARV","e":"VLOOKUP","d":"Busca un valor en la primera columna y devuelve un valor en la misma fila desde la columna especificada.","s":"BUSCARV(valor_buscado; matriz_buscar_en; indicador_columnas; [ordenado])","x":"=BUSCARV(101,A2:D10,3,FALSO)"},{"n":"BUSCARX","e":"XLOOKUP","d":"Busca una coincidencia en un rango y devuelve el elemento correspondiente de otro rango.","s":"BUSCARX(valor_buscado; matriz_buscada; matriz_devuelta; [si_no_se_encuentra])","x":"=BUSCARX(A2,B2:B100,C2:C100,\\\\"No encontrado\\\\")"},{"n":"COINCIDIR","e":"MATCH","d":"Devuelve la posición relativa de un elemento en una matriz.","s":"COINCIDIR(valor_buscado; matriz_buscada; [tipo_de_coincidencia])","x":"=COINCIDIR(\\\\"Manzana\\\\",A1:A10,0)"},{"n":"COINCIDIRX","e":"XMATCH","d":"Devuelve la posición relativa de un elemento en una matriz (versión moderna).","s":"COINCIDIRX(valor_buscado; matriz_de_búsqueda; [modo_coincidencia]; [modo_búsqueda])","x":"=COINCIDIRX(\\\\"Manzana\\\\",A1:A10,0)"},{"n":"COLUMNA","e":"COLUMN","d":"Devuelve el número de columna de una referencia.","s":"COLUMNA([referencia])","x":"=COLUMNA(C5) → 3"},{"n":"COLUMNAS","e":"COLUMNS","d":"Devuelve el número de columnas en una matriz o referencia.","s":"COLUMNAS(matriz)","x":"=COLUMNAS(A1:D1) → 4"},{"n":"DESREF","e":"OFFSET","d":"Devuelve una referencia desplazada un número de filas y columnas.","s":"DESREF(referencia; filas; columnas; [alto]; [ancho])","x":"=DESREF(A1,2,3)"},{"n":"DIRECCION","e":"ADDRESS","d":"Crea una referencia de celda en forma de texto a partir de números de fila y columna.","s":"DIRECCION(fila; columna; [abs]; [a1]; [hoja])","x":"=DIRECCION(2,3) → $C$2"},{"n":"ELEGIR","e":"CHOOSE","d":"Elige un valor de una lista según un número de índice.","s":"ELEGIR(núm_índice; valor1; [valor2]; ...)","x":"=ELEGIR(2,\\\\"Ene\\\\",\\\\"Feb\\\\",\\\\"Mar\\\\") → Feb"},{"n":"ELEGIRCOLS","e":"CHOOSECOLS","d":"Devuelve columnas específicas de una matriz.","s":"ELEGIRCOLS(matriz; col_núm1; [col_núm2]; ...)","x":"=ELEGIRCOLS(A1:D5,1,3)"},{"n":"ELEGIRFILAS","e":"CHOOSEROWS","d":"Devuelve filas específicas de una matriz.","s":"ELEGIRFILAS(matriz; fila_núm1; [fila_núm2]; ...)","x":"=ELEGIRFILAS(A1:D5,1,3)"},{"n":"ENCOL","e":"TOCOL","d":"Devuelve la matriz como una sola columna.","s":"ENCOL(matriz; [ignorar]; [escanear_por_columna])","x":"=ENCOL(A1:C3)"},{"n":"ENFILA","e":"TOROW","d":"Devuelve la matriz como una sola fila.","s":"ENFILA(matriz; [ignorar]; [escanear_por_columna])","x":"=ENFILA(A1:C3)"},{"n":"EXCLUIR","e":"DROP","d":"Quita filas o columnas del inicio o final de la matriz.","s":"EXCLUIR(matriz; filas; [columnas])","x":"=EXCLUIR(A1:D10,2)"},{"n":"EXPANDIR","e":"EXPAND","d":"Expande una matriz a las dimensiones especificadas.","s":"EXPANDIR(matriz; filas; [columnas]; [relleno])","x":"=EXPANDIR(A1:B3,5,3)"},{"n":"FILA","e":"ROW","d":"Devuelve el número de fila de una referencia.","s":"FILA([referencia])","x":"=FILA(B5) → 5"},{"n":"FILAS","e":"ROWS","d":"Devuelve el número de filas de una referencia o matriz.","s":"FILAS(matriz)","x":"=FILAS(A1:A10) → 10"},{"n":"FILTRAR","e":"FILTER","d":"Filtra un rango o matriz según una condición.","s":"FILTRAR(matriz; incluir; [si_está_vacío])","x":"=FILTRAR(A1:C10,B1:B10>100)"},{"n":"FORMULATEXTO","e":"FORMULATEXT","d":"Devuelve una fórmula como cadena de texto.","s":"FORMULATEXTO(referencia)","x":"=FORMULATEXTO(A1)"},{"n":"HIPERVINCULO","e":"HYPERLINK","d":"Crea un enlace que abre un documento o URL.","s":"HIPERVINCULO(ubicación_del_vínculo; [nombre_descriptivo])","x":"=HIPERVINCULO(\\\\"https://hacienda.go.cr\\\\",\\\\"Hacienda CR\\\\")"},{"n":"IMAGEN","e":"IMAGE","d":"Devuelve una imagen de un origen determinado.","s":"IMAGEN(origen; [alt_text]; [tamaño]; [alto]; [ancho])","x":"=IMAGEN(\\\\"https://ejemplo.com/img.png\\\\")"},{"n":"IMPORTARDATOSDINAMICOS","e":"GETPIVOTDATA","d":"Extrae datos almacenados en una tabla dinámica.","s":"IMPORTARDATOSDINAMICOS(campo_datos; tabla_dinámica; [campo1]; [elemento1]; ...)","x":"=IMPORTARDATOSDINAMICOS(\\\\"Ventas\\\\",A3,\\\\"Producto\\\\",\\\\"Manzana\\\\")"},{"n":"INDICE","e":"INDEX","d":"Devuelve el valor en la intersección de una fila y columna en un rango.","s":"INDICE(matriz; núm_fila; [núm_columna])","x":"=INDICE(A1:C10,3,2)"},{"n":"INDIRECTO","e":"INDIRECT","d":"Devuelve una referencia especificada por un valor de texto.","s":"INDIRECTO(ref_en_texto; [a1])","x":"=INDIRECTO(\\\\"A\\\\"&B1)"},{"n":"ORDENAR","e":"SORT","d":"Ordena un rango o matriz.","s":"ORDENAR(matriz; [índice_ordenar]; [orden_sort]; [por_col])","x":"=ORDENAR(A2:B10,2,-1)"},{"n":"ORDENARPOR","e":"SORTBY","d":"Ordena un rango basándose en los valores de otro rango.","s":"ORDENARPOR(matriz; por_matriz1; [orden1]; ...)","x":"=ORDENARPOR(A2:B10,B2:B10,-1)"},{"n":"PIVOTARPOR","e":"PIVOTBY","d":"Agrupa, agrega, ordena y filtra por campos de fila y columna.","s":"PIVOTARPOR(campo_filas; campo_cols; campo_valores; función)","x":"=PIVOTARPOR(A2:A10,B2:B10,C2:C10,SUMA)"},{"n":"RDTR","e":"RTD","d":"Recupera datos en tiempo real de un programa COM.","s":"RDTR(id_programa; servidor; tema1; [tema2]; ...)","x":"=RDTR(\\\\"ExcelRTD\\\\",\\\\"\\\\",A1)"},{"n":"RECORTAR.RANGO","e":"TRIMRANGE","d":"Recorta un rango hasta la última celda usada.","s":"RECORTAR.RANGO(rango; [filas]; [columnas])","x":"=RECORTAR.RANGO(A1:Z100)"},{"n":"TOMAR","e":"TAKE","d":"Devuelve filas o columnas desde el inicio o final de la matriz.","s":"TOMAR(matriz; filas; [columnas])","x":"=TOMAR(A1:D10,3)"},{"n":"TRANSPONER","e":"TRANSPOSE","d":"Devuelve un rango vertical como horizontal o viceversa.","s":"TRANSPONER(matriz)","x":"=TRANSPONER(A1:E1)"},{"n":"UNICOS","e":"UNIQUE","d":"Devuelve los valores únicos de un rango o matriz.","s":"UNICOS(matriz; [por_col]; [exactamente_una_vez])","x":"=UNICOS(A2:A100)"},{"n":"VALOR.CAMPO","e":"FIELDVALUE","d":"Extrae un valor de un campo de un registro dado.","s":"VALOR.CAMPO(valor; nombre_campo)","x":"=VALOR.CAMPO(A2,\\\\"Precio\\\\")"}],"Texto":[{"n":"CARACTER","e":"CHAR","d":"Devuelve el carácter especificado por el código de carácter.","s":"CARACTER(número)","x":"=CARACTER(65) → A"},{"n":"CODIGO","e":"CODE","d":"Devuelve el código del primer carácter del texto.","s":"CODIGO(texto)","x":"=CODIGO(\\\\"A\\\\") → 65"},{"n":"CONCAT","e":"CONCAT","d":"Concatena una lista o rango de cadenas de texto.","s":"CONCAT(texto1; [texto2]; ...)","x":"=CONCAT(A1,\\\\" \\\\",B1)"},{"n":"DECIMAL","e":"FIXED","d":"Redondea un número y devuelve el resultado como texto.","s":"DECIMAL(número; [decimales]; [sin_separador])","x":"=DECIMAL(1234.5,2) → \\\\"1,234.50\\\\""},{"n":"DERECHA","e":"RIGHT","d":"Devuelve los últimos caracteres de una cadena de texto.","s":"DERECHA(texto; [núm_de_caracteres])","x":"=DERECHA(\\\\"Costa Rica\\\\",4) → \\\\"Rica\\\\""},{"n":"DETECTARIDIOMA","e":"DETECTLANGUAGE","d":"Detecta el idioma de una cadena de texto.","s":"DETECTARIDIOMA(texto)","x":"=DETECTARIDIOMA(\\\\"Hola mundo\\\\") → \\\\"es\\\\""},{"n":"DIVIDIRTEXTO","e":"TEXTSPLIT","d":"Divide el texto en filas o columnas con delimitadores.","s":"DIVIDIRTEXTO(texto; delimitador_col; [delimitador_fila])","x":"=DIVIDIRTEXTO(A1,\\\\",\\\\")"},{"n":"ENCONTRAR","e":"FIND","d":"Devuelve la posición inicial de una cadena dentro de otra (distingue mayúsculas).","s":"ENCONTRAR(texto_buscado; dentro_del_texto; [núm_inicial])","x":"=ENCONTRAR(\\\\"CR\\\\",\\\\"Hacienda CR\\\\") → 10"},{"n":"ESPACIOS","e":"TRIM","d":"Quita todos los espacios excepto los individuales entre palabras.","s":"ESPACIOS(texto)","x":"=ESPACIOS(\\\\"  Hola  mundo  \\\\") → \\\\"Hola mundo\\\\""},{"n":"EXTRAE","e":"MID","d":"Devuelve caracteres del centro de una cadena.","s":"EXTRAE(texto; posición_inicial; núm_de_caracteres)","x":"=EXTRAE(\\\\"Costa Rica\\\\",7,4) → \\\\"Rica\\\\""},{"n":"HALLAR","e":"SEARCH","d":"Devuelve la posición de una cadena dentro de otra (no distingue mayúsculas).","s":"HALLAR(texto_buscado; dentro_del_texto; [núm_inicial])","x":"=HALLAR(\\\\"rica\\\\",\\\\"Costa Rica\\\\") → 7"},{"n":"IGUAL","e":"EXACT","d":"Comprueba si dos cadenas son exactamente iguales.","s":"IGUAL(texto1; texto2)","x":"=IGUAL(\\\\"CR\\\\",\\\\"cr\\\\") → FALSO"},{"n":"IZQUIERDA","e":"LEFT","d":"Devuelve los primeros caracteres de una cadena.","s":"IZQUIERDA(texto; [núm_de_caracteres])","x":"=IZQUIERDA(\\\\"Costa Rica\\\\",5) → \\\\"Costa\\\\""},{"n":"LARGO","e":"LEN","d":"Devuelve el número de caracteres de una cadena.","s":"LARGO(texto)","x":"=LARGO(\\\\"Costa Rica\\\\") → 10"},{"n":"LIMPIAR","e":"CLEAN","d":"Quita todos los caracteres no imprimibles del texto.","s":"LIMPIAR(texto)","x":"=LIMPIAR(A1)"},{"n":"MATRIZATEXTO","e":"ARRAYTOTEXT","d":"Devuelve una representación de texto de un array.","s":"MATRIZATEXTO(matriz; [formato])","x":"=MATRIZATEXTO(A1:C1,1)"},{"n":"MAYUSC","e":"UPPER","d":"Convierte una cadena en letras mayúsculas.","s":"MAYUSC(texto)","x":"=MAYUSC(\\\\"costa rica\\\\") → \\\\"COSTA RICA\\\\""},{"n":"MINUSC","e":"LOWER","d":"Convierte todas las letras en minúsculas.","s":"MINUSC(texto)","x":"=MINUSC(\\\\"COSTA RICA\\\\") → \\\\"costa rica\\\\""},{"n":"MONEDA","e":"DOLLAR","d":"Convierte un número en texto con formato de moneda.","s":"MONEDA(número; [decimales])","x":"=MONEDA(1234.5,2) → \\\\"$1,234.50\\\\""},{"n":"NOMPROPIO","e":"PROPER","d":"Convierte la primera letra de cada palabra en mayúscula.","s":"NOMPROPIO(texto)","x":"=NOMPROPIO(\\\\"costa rica\\\\") → \\\\"Costa Rica\\\\""},{"n":"REEMPLAZAR","e":"REPLACE","d":"Reemplaza parte de una cadena por otra.","s":"REEMPLAZAR(texto_original; núm_inicial; núm_de_caracteres; texto_nuevo)","x":"=REEMPLAZAR(\\\\"CR-2024\\\\",4,4,\\\\"2025\\\\")"},{"n":"REGEXEXTRACCION","e":"REGEXEXTRACT","d":"Extrae cadenas que coinciden con un patrón regex.","s":"REGEXEXTRACCION(texto; patrón)","x":"=REGEXEXTRACCION(A1,\\\\"[0-9]+\\\\")"},{"n":"REGEXPRUEBA","e":"REGEXTEST","d":"Comprueba si el texto coincide con un patrón regex.","s":"REGEXPRUEBA(texto; patrón)","x":"=REGEXPRUEBA(A1,\\\\"^[A-Z]\\\\")"},{"n":"REGEXREEMPLAZAR","e":"REGEXREPLACE","d":"Reemplaza cadenas que coinciden con un patrón regex.","s":"REGEXREEMPLAZAR(texto; patrón; reemplazo)","x":"=REGEXREEMPLAZAR(A1,\\\\"[0-9]+\\\\",\\\\"#\\\\")"},{"n":"REPETIR","e":"REPT","d":"Repite el texto un número determinado de veces.","s":"REPETIR(texto; núm_de_veces)","x":"=REPETIR(\\\\"=-\\\\",10) → \\\\"=-=-=-=-=-=-=-=-=-=-\\\\""},{"n":"SUSTITUIR","e":"SUBSTITUTE","d":"Reemplaza el texto existente con texto nuevo en una cadena.","s":"SUSTITUIR(texto; texto_original; texto_nuevo; [núm_de_instancia])","x":"=SUSTITUIR(\\\\"Costa Rica\\\\",\\\\"Rica\\\\",\\\\"Verde\\\\")"},{"n":"T","e":"T","d":"Devuelve el texto si el valor es texto, o \\\\"\\\\" si no.","s":"T(valor)","x":"=T(\\\\"Hola\\\\") → \\\\"Hola\\\\"; =T(123) → \\\\"\\\\""},{"n":"TEXTO","e":"TEXT","d":"Convierte un valor en texto con un formato específico.","s":"TEXTO(valor; formato)","x":"=TEXTO(HOY(),\\\\"dd/mm/aaaa\\\\")"},{"n":"TEXTOANTES","e":"TEXTBEFORE","d":"Devuelve el texto que está antes del delimitador.","s":"TEXTOANTES(texto; delimitador; [núm_instancia])","x":"=TEXTOANTES(\\\\"Costa Rica\\\\",\\\\",\\\\")"},{"n":"TEXTOBAHT","e":"BAHTTEXT","d":"Convierte un número en texto baht (tailandés).","s":"TEXTOBAHT(número)","x":"=TEXTOBAHT(1234)"},{"n":"TEXTODESPUES","e":"TEXTAFTER","d":"Devuelve el texto que está después del delimitador.","s":"TEXTODESPUES(texto; delimitador; [núm_instancia])","x":"=TEXTODESPUES(\\\\"Nombre, Apellido\\\\",\\\\",\\\\")"},{"n":"TRADUCIR","e":"TRANSLATE","d":"Traduce texto de un idioma a otro con el servicio Microsoft.","s":"TRADUCIR(texto; idioma_origen; idioma_destino)","x":"=TRADUCIR(\\\\"Hola\\\\",\\\\"es\\\\",\\\\"en\\\\") → \\\\"Hello\\\\""},{"n":"UNICAR","e":"UNICHAR","d":"Devuelve el carácter Unicode del valor numérico dado.","s":"UNICAR(número)","x":"=UNICAR(9786) → ☺"},{"n":"UNICODE","e":"UNICODE","d":"Devuelve el punto de código Unicode del primer carácter.","s":"UNICODE(texto)","x":"=UNICODE(\\\\"A\\\\") → 65"},{"n":"UNIRCADENAS","e":"TEXTJOIN","d":"Concatena cadenas usando un delimitador.","s":"UNIRCADENAS(delimitador; ignorar_vacío; texto1; [texto2]; ...)","x":"=UNIRCADENAS(\\\\", \\\\",VERDADERO,A1:A5)"},{"n":"VALOR","e":"VALUE","d":"Convierte texto que representa un número en número.","s":"VALOR(texto)","x":"=VALOR(\\\\"1234.50\\\\") → 1234.5"},{"n":"VALOR.NUMERO","e":"NUMBERVALUE","d":"Convierte texto a número de forma independiente a la configuración regional.","s":"VALOR.NUMERO(texto; [separador_decimal]; [separador_de_grupo])","x":"=VALOR.NUMERO(\\\\"1.234,50\\\\",\\\\",\\\\",\\\\".\\\\")"},{"n":"VALORATEXTO","e":"VALUETOTEXT","d":"Devuelve una representación de texto de un valor.","s":"VALORATEXTO(valor; [formato])","x":"=VALORATEXTO(A1)"},{"n":"CONCATENAR","e":"CONCATENATE","d":"Une el contenido de varias celdas en una sola cadena de texto. Función clásica; se recomienda usar CONCAT o UNIRCADENAS en versiones modernas.","s":"CONCATENAR(texto1; texto2; ...)","x":"=CONCATENAR(A2,\\\\" \\\\",B2) → \\\\"Juan Pérez\\\\""},{"n":"JERARQUIA","e":"RANK","d":"Clasifica un número dentro de una lista. Función de compatibilidad; se recomienda usar JERARQUIA.EQV o JERARQUIA.MEDIA.","s":"JERARQUIA(número; referencia; [orden])","x":"=JERARQUIA(A1,A1:A10,0) → posición de A1"},{"n":"TEXTO.BAHT","e":"BAHTTEXT","d":"Convierte número a texto tailandés (baht).","s":"TEXTO.BAHT(numero)","x":"=TEXTO.BAHT(1234)"},{"n":"CAR","e":"CHAR","d":"Carácter especificado por el código numérico.","s":"CAR(numero)","x":"=CAR(65)"},{"n":"TEXTO.DESPUES","e":"TEXTAFTER","d":"Texto que aparece después de un delimitador.","s":"TEXTO.DESPUES(texto;delimitador;[num_instancia])","x":"=TEXTO.DESPUES(\\\\"Nombre, Apellido\\\\",\\\\",\\\\",\\\\" \\\\")"},{"n":"TEXTO.ANTES","e":"TEXTBEFORE","d":"Texto que aparece antes de un delimitador.","s":"TEXTO.ANTES(texto;delimitador;[num_instancia])","x":"=TEXTO.ANTES(\\\\"Nombre, Apellido\\\\",\\\\",\\\\")"}],"Lógicas":[{"n":"ARCHIVOMAKEARRAY","e":"MAKEARRAY","d":"Devuelve una matriz calculada de tamaño fila×columna aplicando una función LAMBDA.","s":"ARCHIVOMAKEARRAY(filas; columnas; lambda)","x":"=ARCHIVOMAKEARRAY(3,3,LAMBDA(f,c,f*c))"},{"n":"BYCOL","e":"BYCOL","d":"Aplica una función LAMBDA a cada columna y devuelve una matriz de resultados.","s":"BYCOL(matriz; lambda)","x":"=BYCOL(A1:C10,LAMBDA(c,SUMA(c)))"},{"n":"BYROW","e":"BYROW","d":"Aplica una función LAMBDA a cada fila y devuelve una matriz de resultados.","s":"BYROW(matriz; lambda)","x":"=BYROW(A1:C10,LAMBDA(f,SUMA(f)))"},{"n":"CAMBIAR","e":"SWITCH","d":"Evalúa una expresión con una lista de valores y devuelve el resultado del primero coincidente.","s":"CAMBIAR(expresión; valor1; resultado1; [default])","x":"=CAMBIAR(A1,1,\\\\"Ene\\\\",2,\\\\"Feb\\\\",3,\\\\"Mar\\\\",\\\\"Otro\\\\")"},{"n":"FALSO","e":"FALSE","d":"Devuelve el valor lógico FALSO.","s":"FALSO()","x":"=FALSO() → FALSO"},{"n":"LAMBDA","e":"LAMBDA","d":"Crea una función reutilizable dentro de fórmulas.","s":"LAMBDA([parámetro1; ...]; cálculo)","x":"=LAMBDA(x,x*x)(5) → 25"},{"n":"LET","e":"LET","d":"Asigna nombres a resultados de cálculo dentro de una fórmula.","s":"LET(nombre1; valor1; ...; cálculo)","x":"=LET(x,A1*2,y,B1+3,x+y)"},{"n":"MAP","e":"MAP","d":"Asigna cada valor de matrices a un nuevo valor aplicando LAMBDA.","s":"MAP(matriz1; [matriz2]; ...; lambda)","x":"=MAP(A1:A5,LAMBDA(v,v*2))"},{"n":"NO","e":"NOT","d":"Cambia FALSO por VERDADERO y VERDADERO por FALSO.","s":"NO(lógico)","x":"=NO(A1>10)"},{"n":"O","e":"OR","d":"Devuelve VERDADERO si algún argumento es VERDADERO.","s":"O(lógico1; [lógico2]; ...)","x":"=O(A1>0,B1>0)"},{"n":"REDUCE","e":"REDUCE","d":"Reduce una matriz a un valor acumulado aplicando LAMBDA.","s":"REDUCE([acumulado_inicial]; matriz; lambda)","x":"=REDUCE(0,A1:A10,LAMBDA(a,v,a+v))"},{"n":"SCAN","e":"SCAN","d":"Examina una matriz con LAMBDA y devuelve cada valor intermedio.","s":"SCAN([acumulado_inicial]; matriz; lambda)","x":"=SCAN(0,A1:A5,LAMBDA(a,v,a+v))"},{"n":"SI","e":"IF","d":"Devuelve un valor si la condición es VERDADERO y otro si es FALSO.","s":"SI(prueba_lógica; valor_si_verdadero; [valor_si_falso])","x":"=SI(A1>100,\\\\"Alto\\\\",\\\\"Bajo\\\\")"},{"n":"SI.CONJUNTO","e":"IFS","d":"Comprueba múltiples condiciones y devuelve el valor de la primera verdadera.","s":"SI.CONJUNTO(lógico1; valor1; [lógico2; valor2]; ...)","x":"=SI.CONJUNTO(A1>=90,\\\\"A\\\\",A1>=80,\\\\"B\\\\",A1>=70,\\\\"C\\\\")"},{"n":"SI.ERROR","e":"IFERROR","d":"Devuelve un valor si la expresión es un error, otro si no lo es.","s":"SI.ERROR(valor; valor_si_error)","x":"=SI.ERROR(A1/B1,0)"},{"n":"SI.ND","e":"IFNA","d":"Devuelve un valor si la expresión produce #N/A.","s":"SI.ND(valor; valor_si_nd)","x":"=SI.ND(BUSCARV(A1,B:C,2,0),\\\\"No encontrado\\\\")"},{"n":"VERDADERO","e":"TRUE","d":"Devuelve el valor lógico VERDADERO.","s":"VERDADERO()","x":"=VERDADERO() → VERDADERO"},{"n":"XO","e":"XOR","d":"Devuelve \\\\"Exclusive Or\\\\" lógica de todos los argumentos.","s":"XO(lógico1; [lógico2]; ...)","x":"=XO(A1>0,B1>0)"},{"n":"Y","e":"AND","d":"Devuelve VERDADERO si todos los argumentos son VERDADEROS.","s":"Y(lógico1; [lógico2]; ...)","x":"=Y(A1>0,A1<100)"}],"Fecha y Hora":[{"n":"AHORA","e":"NOW","d":"Devuelve la fecha y hora actuales.","s":"AHORA()","x":"=AHORA() → 03/06/2026 09:15"},{"n":"AÑO","e":"YEAR","d":"Devuelve el año de una fecha.","s":"AÑO(núm_de_serie)","x":"=AÑO(HOY()) → 2026"},{"n":"DIA","e":"DAY","d":"Devuelve el día del mes (1 a 31).","s":"DIA(núm_de_serie)","x":"=DIA(HOY()) → 3"},{"n":"DIA.LAB","e":"WORKDAY","d":"Devuelve la fecha antes o después de N días laborables.","s":"DIA.LAB(fecha_inicial; días; [festivos])","x":"=DIA.LAB(HOY(),10)"},{"n":"DIA.LAB.INTL","e":"WORKDAY.INTL","d":"Devuelve la fecha con parámetros de fin de semana personalizados.","s":"DIA.LAB.INTL(fecha_inicial; días; [fin_de_semana]; [festivos])","x":"=DIA.LAB.INTL(HOY(),10,1)"},{"n":"DIAS","e":"DAYS","d":"Devuelve la cantidad de días entre dos fechas.","s":"DIAS(fecha_final; fecha_inicial)","x":"=DIAS(\\\\"31/12/2026\\\\",HOY())"},{"n":"DIAS.LAB","e":"NETWORKDAYS","d":"Devuelve el número total de días laborables entre dos fechas.","s":"DIAS.LAB(fecha_inicial; fecha_final; [festivos])","x":"=DIAS.LAB(\\\\"01/01/2026\\\\",\\\\"31/12/2026\\\\")"},{"n":"DIAS.LAB.INTL","e":"NETWORKDAYS.INTL","d":"Días laborables con parámetros de fin de semana personalizados.","s":"DIAS.LAB.INTL(fecha_inicial; fecha_final; [fin_de_semana]; [festivos])","x":"=DIAS.LAB.INTL(A1,B1,1)"},{"n":"DIAS360","e":"DAYS360","d":"Calcula días entre fechas basándose en un año de 360 días.","s":"DIAS360(fecha_inicial; fecha_final; [método])","x":"=DIAS360(\\\\"01/01/2026\\\\",\\\\"31/12/2026\\\\")"},{"n":"DIASEM","e":"WEEKDAY","d":"Devuelve el día de la semana (1-7).","s":"DIASEM(núm_de_serie; [tipo])","x":"=DIASEM(HOY(),2) → 1=Lun"},{"n":"FECHA","e":"DATE","d":"Devuelve el número que representa la fecha especificada.","s":"FECHA(año; mes; día)","x":"=FECHA(2026,6,3)"},{"n":"FECHA.MES","e":"EDATE","d":"Devuelve la fecha N meses antes o después.","s":"FECHA.MES(fecha_inicial; meses)","x":"=FECHA.MES(HOY(),3)"},{"n":"FECHANUMERO","e":"DATEVALUE","d":"Convierte una fecha en forma de texto en número de serie.","s":"FECHANUMERO(texto_de_fecha)","x":"=FECHANUMERO(\\\\"03/06/2026\\\\")"},{"n":"FIN.MES","e":"EOMONTH","d":"Devuelve el último día del mes N meses antes/después.","s":"FIN.MES(fecha_inicial; meses)","x":"=FIN.MES(HOY(),0) → último día del mes"},{"n":"FRAC.AÑO","e":"YEARFRAC","d":"Devuelve la fracción del año entre dos fechas.","s":"FRAC.AÑO(fecha_inicial; fecha_final; [base])","x":"=FRAC.AÑO(\\\\"01/01/2026\\\\",HOY())"},{"n":"HORA","e":"HOUR","d":"Devuelve la hora (0-23) de un valor de hora.","s":"HORA(núm_de_serie)","x":"=HORA(AHORA()) → 9"},{"n":"HORANUMERO","e":"TIMEVALUE","d":"Convierte una hora de texto en número de serie.","s":"HORANUMERO(texto_de_hora)","x":"=HORANUMERO(\\\\"09:15:00\\\\")"},{"n":"HOY","e":"TODAY","d":"Devuelve la fecha actual.","s":"HOY()","x":"=HOY() → 03/06/2026"},{"n":"ISO.NUM.DE.SEMANA","e":"ISOWEEKNUM","d":"Devuelve el número de semana ISO del año.","s":"ISO.NUM.DE.SEMANA(fecha)","x":"=ISO.NUM.DE.SEMANA(HOY()) → 23"},{"n":"MES","e":"MONTH","d":"Devuelve el mes (1-12) de una fecha.","s":"MES(núm_de_serie)","x":"=MES(HOY()) → 6"},{"n":"MINUTO","e":"MINUTE","d":"Devuelve el minuto (0-59) de un valor de hora.","s":"MINUTO(núm_de_serie)","x":"=MINUTO(AHORA()) → 15"},{"n":"NSHORA","e":"TIME","d":"Convierte horas, minutos y segundos en número de serie de hora.","s":"NSHORA(hora; minuto; segundo)","x":"=NSHORA(9,15,0)"},{"n":"NUM.DE.SEMANA","e":"WEEKNUM","d":"Devuelve el número de semana del año.","s":"NUM.DE.SEMANA(núm_de_serie; [tipo])","x":"=NUM.DE.SEMANA(HOY(),2)"},{"n":"SEGUNDO","e":"SECOND","d":"Devuelve los segundos (0-59) de un valor de hora.","s":"SEGUNDO(núm_de_serie)","x":"=SEGUNDO(AHORA()) → 30"},{"n":"SIFECHA","e":"DATEDIF","d":"Calcula el número de años, meses o días entre dos fechas. Ideal para calcular edades o antigüedad.","s":"SIFECHA(fecha_inicial; fecha_final; unidad)","x":"=SIFECHA(\\\\"01/01/1990\\\\",HOY(),\\\\"Y\\\\") → años de edad"},{"n":"DIA360","e":"DAYS360","d":"Calcula la diferencia en días entre dos fechas asumiendo un año de 360 días (12 meses de 30 días). Muy usado en finanzas.","s":"DIA360(fecha_inicial; fecha_final; [método])","x":"=DIA360(\\\\"01/01/2026\\\\",\\\\"31/12/2026\\\\") → 360"}],"Base de Datos":[{"n":"BDCONTAR","e":"DCOUNT","d":"Cuenta celdas con números en la columna que cumplen las condiciones.","s":"BDCONTAR(base_de_datos; nombre_de_campo; criterios)","x":"=BDCONTAR(A1:D10,\\\\"Ventas\\\\",F1:F2)"},{"n":"BDCONTARA","e":"DCOUNTA","d":"Cuenta celdas no vacías en la columna que cumplen las condiciones.","s":"BDCONTARA(base_de_datos; nombre_de_campo; criterios)","x":"=BDCONTARA(A1:D10,\\\\"Cliente\\\\",F1:F2)"},{"n":"BDDESVEST","e":"DSTDEV","d":"Calcula la desviación estándar de una muestra en la BD.","s":"BDDESVEST(base_de_datos; nombre_de_campo; criterios)","x":"=BDDESVEST(A1:D10,\\\\"Precio\\\\",F1:F2)"},{"n":"BDDESVESTP","e":"DSTDEVP","d":"Calcula la desviación estándar de la población total en la BD.","s":"BDDESVESTP(base_de_datos; nombre_de_campo; criterios)","x":"=BDDESVESTP(A1:D10,\\\\"Precio\\\\",F1:F2)"},{"n":"BDEXTRAER","e":"DGET","d":"Extrae un único registro que coincide con las condiciones.","s":"BDEXTRAER(base_de_datos; nombre_de_campo; criterios)","x":"=BDEXTRAER(A1:D10,\\\\"Nombre\\\\",F1:F2)"},{"n":"BDMAX","e":"DMAX","d":"Devuelve el valor máximo en la columna que cumple las condiciones.","s":"BDMAX(base_de_datos; nombre_de_campo; criterios)","x":"=BDMAX(A1:D10,\\\\"Ventas\\\\",F1:F2)"},{"n":"BDMIN","e":"DMIN","d":"Devuelve el valor mínimo en la columna que cumple las condiciones.","s":"BDMIN(base_de_datos; nombre_de_campo; criterios)","x":"=BDMIN(A1:D10,\\\\"Ventas\\\\",F1:F2)"},{"n":"BDPRODUCTO","e":"DPRODUCT","d":"Multiplica los valores de la columna que cumplen las condiciones.","s":"BDPRODUCTO(base_de_datos; nombre_de_campo; criterios)","x":"=BDPRODUCTO(A1:D10,\\\\"Factor\\\\",F1:F2)"},{"n":"BDPROMEDIO","e":"DAVERAGE","d":"Obtiene el promedio de una columna que cumple las condiciones.","s":"BDPROMEDIO(base_de_datos; nombre_de_campo; criterios)","x":"=BDPROMEDIO(A1:D10,\\\\"Ventas\\\\",F1:F2)"},{"n":"BDSUMA","e":"DSUM","d":"Suma los valores de la columna que cumplen las condiciones.","s":"BDSUMA(base_de_datos; nombre_de_campo; criterios)","x":"=BDSUMA(A1:D10,\\\\"Ventas\\\\",F1:F2)"},{"n":"BDVAR","e":"DVAR","d":"Calcula la varianza de una muestra en la BD.","s":"BDVAR(base_de_datos; nombre_de_campo; criterios)","x":"=BDVAR(A1:D10,\\\\"Precio\\\\",F1:F2)"},{"n":"BDVARP","e":"DVARP","d":"Calcula la varianza de la población total en la BD.","s":"BDVARP(base_de_datos; nombre_de_campo; criterios)","x":"=BDVARP(A1:D10,\\\\"Precio\\\\",F1:F2)"}],"Matemáticas":[{"n":"ABS","e":"ABS","d":"Devuelve el valor absoluto de un número.","s":"ABS(número)","x":"=ABS(-15) → 15"},{"n":"ACOS","e":"ACOS","d":"Devuelve el arcoseno de un número en radianes (0 a Pi).","s":"ACOS(número)","x":"=ACOS(1) → 0"},{"n":"ACOSH","e":"ACOSH","d":"Devuelve el coseno hiperbólico inverso.","s":"ACOSH(número)","x":"=ACOSH(10)"},{"n":"ACOT","e":"ACOT","d":"Devuelve el arco tangente en radianes (0 a Pi).","s":"ACOT(número)","x":"=ACOT(1) → 0.7854"},{"n":"ACOTH","e":"ACOTH","d":"Devuelve la cotangente hiperbólica inversa.","s":"ACOTH(número)","x":"=ACOTH(6)"},{"n":"AGREGAR","e":"AGGREGATE","d":"Devuelve un agregado de una lista o base de datos.","s":"AGREGAR(núm_función; opciones; ref1; ...)","x":"=AGREGAR(9,5,A1:A10)"},{"n":"ALEATORIO","e":"RAND","d":"Devuelve un número aleatorio entre 0 y 1.","s":"ALEATORIO()","x":"=ALEATORIO() → 0.7382"},{"n":"ALEATORIO.ENTRE","e":"RANDBETWEEN","d":"Devuelve un número aleatorio entre dos valores.","s":"ALEATORIO.ENTRE(inferior; superior)","x":"=ALEATORIO.ENTRE(1,100)"},{"n":"ASENO","e":"ASIN","d":"Devuelve el arcoseno en radianes.","s":"ASENO(número)","x":"=ASENO(1) → 1.5708"},{"n":"ASENOH","e":"ASINH","d":"Devuelve el seno hiperbólico inverso.","s":"ASENOH(número)","x":"=ASENOH(2.5)"},{"n":"ATAN","e":"ATAN","d":"Devuelve el arco tangente en radianes (-Pi/2 a Pi/2).","s":"ATAN(número)","x":"=ATAN(1) → 0.7854"},{"n":"ATAN2","e":"ATAN2","d":"Devuelve el arco tangente de las coordenadas X e Y.","s":"ATAN2(x; y)","x":"=ATAN2(1,1) → 0.7854"},{"n":"ATANH","e":"ATANH","d":"Devuelve la tangente hiperbólica inversa.","s":"ATANH(número)","x":"=ATANH(0.5)"},{"n":"BASE","e":"BASE","d":"Convierte un número en texto con la base dada.","s":"BASE(número; base; [longitud_mínima])","x":"=BASE(255,16) → \\\\"FF\\\\""},{"n":"COCIENTE","e":"QUOTIENT","d":"Devuelve la parte entera de una división.","s":"COCIENTE(numerador; denominador)","x":"=COCIENTE(10,3) → 3"},{"n":"COMBINA","e":"COMBINA","d":"Devuelve combinaciones con repeticiones.","s":"COMBINA(número; tamaño)","x":"=COMBINA(4,2) → 10"},{"n":"COMBINAT","e":"COMBIN","d":"Devuelve el número de combinaciones sin repetición.","s":"COMBINAT(número; tamaño)","x":"=COMBINAT(4,2) → 6"},{"n":"COS","e":"COS","d":"Devuelve el coseno de un ángulo.","s":"COS(número)","x":"=COS(PI()) → -1"},{"n":"COSH","e":"COSH","d":"Devuelve el coseno hiperbólico.","s":"COSH(número)","x":"=COSH(0) → 1"},{"n":"COT","e":"COT","d":"Devuelve la cotangente de un ángulo.","s":"COT(número)","x":"=COT(PI()/4) → 1"},{"n":"ENTERO","e":"INT","d":"Redondea un número al entero inferior más próximo.","s":"ENTERO(número)","x":"=ENTERO(8.9) → 8"},{"n":"EXP","e":"EXP","d":"Devuelve e elevado a la potencia del número.","s":"EXP(número)","x":"=EXP(1) → 2.71828"},{"n":"FACT","e":"FACT","d":"Devuelve el factorial de un número.","s":"FACT(número)","x":"=FACT(5) → 120"},{"n":"GRADOS","e":"DEGREES","d":"Convierte radianes en grados.","s":"GRADOS(ángulo)","x":"=GRADOS(PI()) → 180"},{"n":"LN","e":"LN","d":"Devuelve el logaritmo natural.","s":"LN(número)","x":"=LN(EXP(1)) → 1"},{"n":"LOG","e":"LOG","d":"Devuelve el logaritmo en la base especificada.","s":"LOG(número; [base])","x":"=LOG(1000,10) → 3"},{"n":"LOG10","e":"LOG10","d":"Devuelve el logaritmo en base 10.","s":"LOG10(número)","x":"=LOG10(1000) → 3"},{"n":"M.C.D","e":"GCD","d":"Devuelve el máximo común divisor.","s":"M.C.D(número1; [número2]; ...)","x":"=M.C.D(12,18) → 6"},{"n":"M.C.M","e":"LCM","d":"Devuelve el mínimo común múltiplo.","s":"M.C.M(número1; [número2]; ...)","x":"=M.C.M(4,6) → 12"},{"n":"MATRIZALEAT","e":"RANDARRAY","d":"Devuelve una matriz de números aleatorios.","s":"MATRIZALEAT([filas]; [columnas]; [mín]; [máx]; [entero])","x":"=MATRIZALEAT(3,3,1,100,VERDADERO)"},{"n":"MMULT","e":"MMULT","d":"Devuelve el producto matricial de dos matrices.","s":"MMULT(matriz1; matriz2)","x":"=MMULT(A1:B2,C1:D2)"},{"n":"PI","e":"PI","d":"Devuelve el valor de Pi (3.14159...).","s":"PI()","x":"=PI() → 3.14159265358979"},{"n":"POTENCIA","e":"POWER","d":"Devuelve el número elevado a una potencia.","s":"POTENCIA(número; potencia)","x":"=POTENCIA(2,10) → 1024"},{"n":"PRODUCTO","e":"PRODUCT","d":"Multiplica todos los números especificados.","s":"PRODUCTO(número1; [número2]; ...)","x":"=PRODUCTO(A1:A5)"},{"n":"RADIANES","e":"RADIANS","d":"Convierte grados en radianes.","s":"RADIANES(ángulo)","x":"=RADIANES(180) → 3.14159"},{"n":"RAIZ","e":"SQRT","d":"Devuelve la raíz cuadrada de un número.","s":"RAIZ(número)","x":"=RAIZ(144) → 12"},{"n":"REDONDEAR","e":"ROUND","d":"Redondea un número al número de decimales especificado.","s":"REDONDEAR(número; núm_decimales)","x":"=REDONDEAR(3.14159,2) → 3.14"},{"n":"REDONDEAR.MAS","e":"ROUNDUP","d":"Redondea hacia arriba, alejándose de cero.","s":"REDONDEAR.MAS(número; núm_decimales)","x":"=REDONDEAR.MAS(3.14,1) → 3.2"},{"n":"REDONDEAR.MENOS","e":"ROUNDDOWN","d":"Redondea hacia abajo, hacia cero.","s":"REDONDEAR.MENOS(número; núm_decimales)","x":"=REDONDEAR.MENOS(3.99,1) → 3.9"},{"n":"RESIDUO","e":"MOD","d":"Devuelve el residuo de una división.","s":"RESIDUO(número; divisor)","x":"=RESIDUO(10,3) → 1"},{"n":"SECUENCIA","e":"SEQUENCE","d":"Devuelve una secuencia de números.","s":"SECUENCIA(filas; [columnas]; [inicio]; [paso])","x":"=SECUENCIA(5,1,1,2) → 1,3,5,7,9"},{"n":"SENO","e":"SIN","d":"Devuelve el seno de un ángulo.","s":"SENO(número)","x":"=SENO(PI()/2) → 1"},{"n":"SIGNO","e":"SIGN","d":"Devuelve el signo de un número (1, 0 o -1).","s":"SIGNO(número)","x":"=SIGNO(-5) → -1"},{"n":"SUBTOTALES","e":"SUBTOTAL","d":"Devuelve un subtotal dentro de una lista o BD.","s":"SUBTOTALES(núm_función; ref1; ...)","x":"=SUBTOTALES(9,A1:A100)"},{"n":"SUMA","e":"SUM","d":"Suma todos los números en un rango.","s":"SUMA(número1; [número2]; ...)","x":"=SUMA(A1:A10)"},{"n":"SUMAR.SI","e":"SUMIF","d":"Suma las celdas que cumplen determinado criterio.","s":"SUMAR.SI(rango; criterio; [rango_suma])","x":"=SUMAR.SI(A1:A10,\\\\">100\\\\",B1:B10)"},{"n":"SUMAR.SI.CONJUNTO","e":"SUMIFS","d":"Suma celdas que cumplen múltiples criterios.","s":"SUMAR.SI.CONJUNTO(rango_suma; rango_criterio1; criterio1; ...)","x":"=SUMAR.SI.CONJUNTO(C:C,A:A,\\\\"CR\\\\",B:B,\\\\">0\\\\")"},{"n":"SUMAPRODUCTO","e":"SUMPRODUCT","d":"Suma los productos de rangos correspondientes.","s":"SUMAPRODUCTO(matriz1; [matriz2]; ...)","x":"=SUMAPRODUCTO(A1:A5,B1:B5)"},{"n":"TAN","e":"TAN","d":"Devuelve la tangente de un ángulo.","s":"TAN(número)","x":"=TAN(PI()/4) → 1"},{"n":"TRUNCAR","e":"TRUNC","d":"Trunca un número eliminando la parte decimal.","s":"TRUNCAR(número; [núm_decimales])","x":"=TRUNCAR(3.999) → 3"},{"n":"ARABIGO","e":"ARABIC","d":"Convierte número romano a arábigo.","s":"ARABIGO(texto)","x":"=ARABIGO(\\\\"XIV\\\\")"},{"n":"MULTIPLO.SUPERIOR.MAT","e":"CEILING.MATH","d":"Redondea al alza hasta el múltiplo más cercano.","s":"MULTIPLO.SUPERIOR.MAT(numero;[significancia];[modo])","x":"=MULTIPLO.SUPERIOR.MAT(-6.3,1,-1)"},{"n":"MULTIPLO.SUPERIOR.EXACTO","e":"CEILING.PRECISE","d":"Redondea al alza independientemente del signo.","s":"MULTIPLO.SUPERIOR.EXACTO(numero;[significancia])","x":"=MULTIPLO.SUPERIOR.EXACTO(-6.3,1)"},{"n":"MULTIPLO.INFERIOR.MAT","e":"FLOOR.MATH","d":"Redondea a la baja hasta el múltiplo más cercano.","s":"MULTIPLO.INFERIOR.MAT(numero;[significancia];[modo])","x":"=MULTIPLO.INFERIOR.MAT(-8.1,2)"},{"n":"MULTIPLO.INFERIOR.EXACTO","e":"FLOOR.PRECISE","d":"Redondea a la baja independientemente del signo.","s":"MULTIPLO.INFERIOR.EXACTO(numero;[significancia])","x":"=MULTIPLO.INFERIOR.EXACTO(-6.3,1)"},{"n":"MULTIPLO.SUPERIOR.ISO","e":"ISO.CEILING","d":"Redondea al alza al múltiplo de significancia más cercano.","s":"MULTIPLO.SUPERIOR.ISO(numero;[significancia])","x":"=MULTIPLO.SUPERIOR.ISO(-4.5)"},{"n":"CSC","e":"CSC","d":"Cosecante de un ángulo.","s":"CSC(numero)","x":"=CSC(15)"},{"n":"CSCH","e":"CSCH","d":"Cosecante hiperbólica de un ángulo.","s":"CSCH(numero)","x":"=CSCH(1.5)"},{"n":"SEC","e":"SEC","d":"Secante de un ángulo.","s":"SEC(numero)","x":"=SEC(45)"},{"n":"SECH","e":"SECH","d":"Secante hiperbólica de un ángulo.","s":"SECH(numero)","x":"=SECH(1)"},{"n":"COTH","e":"COTH","d":"Cotangente hiperbólica de un número.","s":"COTH(numero)","x":"=COTH(2)"},{"n":"RANDARRAY","e":"RANDARRAY","d":"Matriz de números aleatorios con dimensiones especificadas.","s":"RANDARRAY([filas];[columnas];[min];[max];[entero])","x":"=RANDARRAY(3,3,1,100,VERDADERO)"},{"n":"MUNIT","e":"MUNIT","d":"Devuelve la matriz de identidad de la dimensión especificada.","s":"MUNIT(dimension)","x":"=MUNIT(3)"},{"n":"PORCENTAJE.DE","e":"PERCENTOF","d":"Suma valores del subconjunto divididos entre el total.","s":"PORCENTAJE.DE(subconjunto;total)","x":"=PORCENTAJE.DE(A2:A5,A2:A10)"},{"n":"ALEAT","e":"RAND","d":"Número aleatorio entre 0 y 1.","s":"ALEAT()","x":"=ALEAT()"},{"n":"ALEAT.ENTRE","e":"RANDBETWEEN","d":"Número entero aleatorio dentro de un intervalo.","s":"ALEAT.ENTRE(inferior;superior)","x":"=ALEAT.ENTRE(1,100)"}],"Financieras":[{"n":"AMORTIZ.LIN","e":"AMORLINC","d":"Devuelve la amortización de cada período contable.","s":"AMORTIZ.LIN(costo; fecha_compra; primer_período; rescate; período; tasa; [base])","x":"=AMORTIZ.LIN(2400,\\\\"01/01/2023\\\\",\\\\"01/01/2024\\\\",300,1,0.15,1)"},{"n":"DB","e":"DB","d":"Depreciación por método de saldo fijo.","s":"DB(costo; valor_residual; vida; período; [mes])","x":"=DB(1000000,100000,6,1)"},{"n":"DDB","e":"DDB","d":"Depreciación por método de doble disminución.","s":"DDB(costo; valor_residual; vida; período; [factor])","x":"=DDB(1000000,100000,10,1)"},{"n":"DURACION","e":"DURATION","d":"Duración anual de un valor bursátil con pagos periódicos.","s":"DURACION(liquidación; vencimiento; cupón; rendimiento; frecuencia; [base])","x":"=DURACION(\\\\"01/01/2026\\\\",\\\\"01/01/2030\\\\",0.08,0.09,2)"},{"n":"INT.ACUM","e":"ACCRINT","d":"Devuelve el interés devengado con pagos periódicos.","s":"INT.ACUM(emisión; primer_interés; liquidación; tasa; par; frecuencia; [base])","x":"=INT.ACUM(\\\\"01/01/2026\\\\",\\\\"07/01/2026\\\\",\\\\"01/08/2026\\\\",0.1,1000,2)"},{"n":"INT.EFECTIVO","e":"EFFECT","d":"Devuelve la tasa de interés anual efectiva.","s":"INT.EFECTIVO(tasa_nominal; núm_per_año)","x":"=INT.EFECTIVO(0.12,12) → 12.68%"},{"n":"NPER","e":"NPER","d":"Devuelve el número de pagos de una inversión.","s":"NPER(tasa; pago; va; [vf]; [tipo])","x":"=NPER(0.01,-200,1000) → 5.06"},{"n":"PAGO","e":"PMT","d":"Calcula el pago periódico de un préstamo.","s":"PAGO(tasa; nper; va; [vf]; [tipo])","x":"=PAGO(0.08/12,48,-18000) → ₡439.43"},{"n":"PAGO.INT.ENTRE","e":"CUMIPMT","d":"Interés acumulado entre dos períodos.","s":"PAGO.INT.ENTRE(tasa; nper; vp; per_inicial; per_final; tipo)","x":"=PAGO.INT.ENTRE(0.09/12,30*12,125000,13,24,0)"},{"n":"PAGO.PRINC.ENTRE","e":"CUMPRINC","d":"Principal acumulado de un préstamo entre dos períodos.","s":"PAGO.PRINC.ENTRE(tasa; nper; vp; per_inicial; per_final; tipo)","x":"=PAGO.PRINC.ENTRE(0.09/12,30*12,125000,13,24,0)"},{"n":"PAGOINT","e":"IPMT","d":"Interés pagado en un período determinado.","s":"PAGOINT(tasa; período; nper; va; [vf]; [tipo])","x":"=PAGOINT(0.1/12,1,36,-8000)"},{"n":"PAGOPRIN","e":"PPMT","d":"Pago del capital en un período determinado.","s":"PAGOPRIN(tasa; período; nper; va; [vf]; [tipo])","x":"=PAGOPRIN(0.1/12,1,36,-8000)"},{"n":"PRECIO","e":"PRICE","d":"Precio por ₡100 de valor nominal de un bono.","s":"PRECIO(liquidación; vencimiento; tasa; rendimiento; reembolso; frecuencia; [base])","x":"=PRECIO(\\\\"15/02/2026\\\\",\\\\"15/11/2027\\\\",0.065,0.0625,100,2,0)"},{"n":"P.DURACION","e":"PDURATION","d":"Períodos necesarios para que una inversión alcance un valor.","s":"P.DURACION(tasa; va; vf)","x":"=P.DURACION(0.025,2000,2200)"},{"n":"RENDTO","e":"YIELD","d":"Rendimiento de un valor bursátil con intereses periódicos.","s":"RENDTO(liquidación; vencimiento; tasa; precio; reembolso; frecuencia; [base])","x":"=RENDTO(\\\\"15/02/2026\\\\",\\\\"15/11/2027\\\\",0.065,100,100,2)"},{"n":"RRI","e":"RRI","d":"Tasa de interés equivalente para el crecimiento de una inversión.","s":"RRI(nper; vp; vf)","x":"=RRI(96,10000,11000) → 0.001"},{"n":"SLN","e":"SLN","d":"Depreciación por método lineal (directo).","s":"SLN(costo; valor_residual; vida)","x":"=SLN(30000,7500,10) → 2250"},{"n":"TASA","e":"RATE","d":"Tasa de interés por período de un préstamo.","s":"TASA(nper; pago; va; [vf]; [tipo]; [estimar])","x":"=TASA(48,-200,8000)*12"},{"n":"TASA.NOMINAL","e":"NOMINAL","d":"Devuelve la tasa de interés nominal anual.","s":"TASA.NOMINAL(tasa_efectiva; núm_per_año)","x":"=TASA.NOMINAL(0.053543,4) → 5.25%"},{"n":"TIR","e":"IRR","d":"Tasa interna de retorno de una serie de flujos de caja.","s":"TIR(valores; [estimar])","x":"=TIR(A1:A6) donde A1=-10000, A2:A6=3000"},{"n":"TIR.NO.PER","e":"XIRR","d":"TIR para flujos de caja no periódicos.","s":"TIR.NO.PER(valores; fechas; [estimar])","x":"=TIR.NO.PER(A1:A5,B1:B5)"},{"n":"TIRM","e":"MIRR","d":"TIR considerando costo de inversión e interés de reinversión.","s":"TIRM(valores; tasa_financiamiento; tasa_reinversión)","x":"=TIRM(A1:A6,0.12,0.1)"},{"n":"VA","e":"PV","d":"Valor presente de una inversión.","s":"VA(tasa; nper; pago; [vf]; [tipo])","x":"=VA(0.08/12,48,-200)"},{"n":"VF","e":"FV","d":"Valor futuro de una inversión.","s":"VF(tasa; nper; pago; [va]; [tipo])","x":"=VF(0.05/12,60,-100)"},{"n":"VF.PLAN","e":"FVSCHEDULE","d":"Valor futuro con serie de tasas de interés compuesto.","s":"VF.PLAN(principal; programación)","x":"=VF.PLAN(1000,{0.09,0.11,0.1})"},{"n":"VNA","e":"NPV","d":"Valor neto actual de una inversión.","s":"VNA(tasa; valor1; [valor2]; ...)","x":"=VNA(0.1,A2:A6)+A1"},{"n":"VNA.NO.PER","e":"XNPV","d":"VNA para flujos de caja no periódicos.","s":"VNA.NO.PER(tasa; valores; fechas)","x":"=VNA.NO.PER(0.09,A2:A6,B2:B6)"},{"n":"AMORTIZ.PROGRE","e":"AMORDEGRC","d":"Depreciación por período contable con coeficiente de depreciación.","s":"AMORTIZ.PROGRE(costo;fecha_compra;primer_periodo;rescate;periodo;tasa;[base])","x":"=AMORTIZ.PROGRE(2400,\\\\"01/01/2023\\\\",\\\\"01/01/2024\\\\",300,1,0.15,1)"},{"n":"CUPON.FECHA.L1","e":"COUPPCD","d":"Fecha del cupón anterior antes de la fecha de liquidación.","s":"CUPON.FECHA.L1(liquidacion;vencimiento;frecuencia;[base])","x":"=CUPON.FECHA.L1(\\\\"25/01/2026\\\\",\\\\"15/11/2027\\\\",2,1)"},{"n":"CUPON.FECHA.L2","e":"COUPNCD","d":"Siguiente fecha de cupón después de la liquidación.","s":"CUPON.FECHA.L2(liquidacion;vencimiento;frecuencia;[base])","x":"=CUPON.FECHA.L2(\\\\"25/01/2026\\\\",\\\\"15/11/2027\\\\",2,1)"},{"n":"PRECIO.PER.IRREGULAR.1","e":"ODDFPRICE","d":"Precio por $100 de valor nominal con primer período irregular.","s":"PRECIO.PER.IRREGULAR.1(liquidacion;vencimiento;emision;primer_cupon;tasa;rendimiento;reembolso;frecuencia;[base])","x":"=PRECIO.PER.IRREGULAR.1(\\\\"11/11/2008\\\\",\\\\"01/03/2021\\\\",\\\\"15/10/2008\\\\",\\\\"01/03/2009\\\\",0.0785,0.0625,100,2,1)"},{"n":"RENDTO.PER.IRREGULAR.1","e":"ODDFYIELD","d":"Rendimiento con primer período irregular.","s":"RENDTO.PER.IRREGULAR.1(liquidacion;vencimiento;emision;primer_cupon;tasa;precio;reembolso;frecuencia;[base])","x":"=RENDTO.PER.IRREGULAR.1(\\\\"11/11/2008\\\\",\\\\"01/03/2021\\\\",\\\\"15/10/2008\\\\",\\\\"01/03/2009\\\\",0.0785,84.5,100,2,1)"},{"n":"PRECIO.PER.IRREGULAR.2","e":"ODDLPRICE","d":"Precio con último período irregular.","s":"PRECIO.PER.IRREGULAR.2(liquidacion;vencimiento;ultimo_interes;tasa;rendimiento;reembolso;frecuencia;[base])","x":"=PRECIO.PER.IRREGULAR.2(\\\\"20/02/2008\\\\",\\\\"01/06/2008\\\\",\\\\"15/12/2007\\\\",0.0375,0.0405,100,2,0)"},{"n":"RENDTO.PER.IRREGULAR.2","e":"ODDLYIELD","d":"Rendimiento con último período irregular.","s":"RENDTO.PER.IRREGULAR.2(liquidacion;vencimiento;ultimo_interes;tasa;precio;reembolso;frecuencia;[base])","x":"=RENDTO.PER.IRREGULAR.2(\\\\"20/04/2008\\\\",\\\\"01/06/2008\\\\",\\\\"15/12/2007\\\\",0.0375,99.875,100,2,0)"},{"n":"LETRA.DE.TES.EQV.A.BONO","e":"TBILLEQ","d":"Rendimiento equivalente de bono para Letra del Tesoro.","s":"LETRA.DE.TES.EQV.A.BONO(liquidacion;vencimiento;descuento)","x":"=LETRA.DE.TES.EQV.A.BONO(\\\\"31/03/2008\\\\",\\\\"01/06/2008\\\\",0.0914)"},{"n":"LETRA.DE.TES.PRECIO","e":"TBILLPRICE","d":"Precio por $100 de valor nominal de Letra del Tesoro.","s":"LETRA.DE.TES.PRECIO(liquidacion;vencimiento;descuento)","x":"=LETRA.DE.TES.PRECIO(\\\\"31/03/2008\\\\",\\\\"01/06/2008\\\\",0.0914)"},{"n":"LETRA.DE.TES.RENDTO","e":"TBILLYIELD","d":"Rendimiento de una Letra del Tesoro.","s":"LETRA.DE.TES.RENDTO(liquidacion;vencimiento;precio)","x":"=LETRA.DE.TES.RENDTO(\\\\"31/03/2008\\\\",\\\\"01/06/2008\\\\",98.45)"},{"n":"CONV.DECIMAL","e":"DOLLARDE","d":"Convierte precio como fracción a precio decimal.","s":"CONV.DECIMAL(precio_fraccionario;fraccion)","x":"=CONV.DECIMAL(1.02,16)"},{"n":"CONV.EN.FRACCION","e":"DOLLARFR","d":"Convierte precio decimal a precio como fracción.","s":"CONV.EN.FRACCION(precio_decimal;fraccion)","x":"=CONV.EN.FRACCION(1.125,16)"},{"n":"DVS","e":"VDB","d":"Depreciación durante un período parcial o completo.","s":"DVS(coste;valor_residual;duracion;periodo_inicio;periodo_fin;[factor];[sin_cambios])","x":"=DVS(2400,300,10,0,1)"},{"n":"INT.PAGO.DIR","e":"ISPMT","d":"Interés pagado durante un período de una inversión.","s":"INT.PAGO.DIR(tasa;periodo;numero_periodos;valor_actual)","x":"=INT.PAGO.DIR(0.1/12,1,36,-8000)"},{"n":"VAN","e":"NPV","d":"Valor actual neto considerando flujos a intervalos regulares.","s":"VAN(tasa;valor1;[valor2];...)","x":"=VAN(0.1,A2:A6)+A1"},{"n":"XNPV","e":"XNPV","d":"Valor actual neto con flujos a intervalos irregulares.","s":"XNPV(tasa;valores;fechas)","x":"=XNPV(0.09,A2:A6,B2:B6)"}],"Estadísticas":[{"n":"COEF.DE.CORREL","e":"CORREL","d":"Coeficiente de correlación de dos conjuntos de datos.","s":"COEF.DE.CORREL(matriz1; matriz2)","x":"=COEF.DE.CORREL(A1:A10,B1:B10)"},{"n":"CONTAR","e":"COUNT","d":"Cuenta celdas que contienen números.","s":"CONTAR(valor1; [valor2]; ...)","x":"=CONTAR(A1:A100)"},{"n":"CONTAR.BLANCO","e":"COUNTBLANK","d":"Cuenta celdas en blanco en un rango.","s":"CONTAR.BLANCO(rango)","x":"=CONTAR.BLANCO(A1:A100)"},{"n":"CONTAR.SI","e":"COUNTIF","d":"Cuenta celdas que coinciden con una condición.","s":"CONTAR.SI(rango; criterio)","x":"=CONTAR.SI(A1:A100,\\\\">0\\\\")"},{"n":"CONTAR.SI.CONJUNTO","e":"COUNTIFS","d":"Cuenta celdas que cumplen múltiples condiciones.","s":"CONTAR.SI.CONJUNTO(rango1; criterio1; [rango2; criterio2]; ...)","x":"=CONTAR.SI.CONJUNTO(A:A,\\\\"CR\\\\",B:B,\\\\">0\\\\")"},{"n":"CONTARA","e":"COUNTA","d":"Cuenta celdas no vacías.","s":"CONTARA(valor1; [valor2]; ...)","x":"=CONTARA(A1:A100)"},{"n":"CRECIMIENTO","e":"GROWTH","d":"Devuelve números en tendencia de crecimiento exponencial.","s":"CRECIMIENTO(y_conocidos; [x_conocidos]; [nuevas_x]; [constante])","x":"=CRECIMIENTO(B2:B6,A2:A6,A7:A10)"},{"n":"CURTOSIS","e":"KURT","d":"Devuelve la curtosis de un conjunto de datos.","s":"CURTOSIS(número1; [número2]; ...)","x":"=CURTOSIS(A1:A20)"},{"n":"DESVEST.M","e":"STDEV.S","d":"Desviación estándar de una muestra.","s":"DESVEST.M(número1; [número2]; ...)","x":"=DESVEST.M(A1:A30)"},{"n":"DESVEST.P","e":"STDEV.P","d":"Desviación estándar de la población total.","s":"DESVEST.P(número1; [número2]; ...)","x":"=DESVEST.P(A1:A30)"},{"n":"DISTR.NORM.N","e":"NORM.DIST","d":"Distribución normal para la media y desviación estándar.","s":"DISTR.NORM.N(x; media; desv_estándar; acumulado)","x":"=DISTR.NORM.N(42,40,1.5,VERDADERO)"},{"n":"ESTIMACION.LINEAL","e":"LINEST","d":"Estadísticas de tendencia lineal por mínimos cuadrados.","s":"ESTIMACION.LINEAL(y_conocidos; [x_conocidos]; [constante]; [estadística])","x":"=ESTIMACION.LINEAL(B1:B10,A1:A10,VERDADERO,VERDADERO)"},{"n":"FRECUENCIA","e":"FREQUENCY","d":"Frecuencia de valores en un rango (devuelve matriz vertical).","s":"FRECUENCIA(datos; grupos)","x":"=FRECUENCIA(A1:A50,{10,20,30,40})"},{"n":"GAMMA","e":"GAMMA","d":"Devuelve los valores de la función gamma.","s":"GAMMA(número)","x":"=GAMMA(2.5)"},{"n":"INTERSECCION.EJE","e":"INTERCEPT","d":"Punto donde la línea de regresión intersecta el eje Y.","s":"INTERSECCION.EJE(y_conocidos; x_conocidos)","x":"=INTERSECCION.EJE(B1:B10,A1:A10)"},{"n":"K.ESIMO.MAYOR","e":"LARGE","d":"Devuelve el k-ésimo valor mayor.","s":"K.ESIMO.MAYOR(matriz; k)","x":"=K.ESIMO.MAYOR(A1:A20,3) → tercer mayor"},{"n":"K.ESIMO.MENOR","e":"SMALL","d":"Devuelve el k-ésimo valor menor.","s":"K.ESIMO.MENOR(matriz; k)","x":"=K.ESIMO.MENOR(A1:A20,3) → tercer menor"},{"n":"MAX","e":"MAX","d":"Devuelve el valor máximo.","s":"MAX(número1; [número2]; ...)","x":"=MAX(A1:A100)"},{"n":"MAX.SI.CONJUNTO","e":"MAXIFS","d":"Máximo entre celdas que cumplen condiciones.","s":"MAX.SI.CONJUNTO(rango_max; rango1; criterio1; ...)","x":"=MAX.SI.CONJUNTO(C:C,A:A,\\\\"CR\\\\")"},{"n":"MEDIANA","e":"MEDIAN","d":"Devuelve el número central de un conjunto.","s":"MEDIANA(número1; [número2]; ...)","x":"=MEDIANA(A1:A50)"},{"n":"MIN","e":"MIN","d":"Devuelve el valor mínimo.","s":"MIN(número1; [número2]; ...)","x":"=MIN(A1:A100)"},{"n":"MIN.SI.CONJUNTO","e":"MINIFS","d":"Mínimo entre celdas que cumplen condiciones.","s":"MIN.SI.CONJUNTO(rango_min; rango1; criterio1; ...)","x":"=MIN.SI.CONJUNTO(C:C,A:A,\\\\"CR\\\\")"},{"n":"MODA.UNO","e":"MODE.SNGL","d":"Valor más frecuente de un conjunto.","s":"MODA.UNO(número1; [número2]; ...)","x":"=MODA.UNO(A1:A50)"},{"n":"PEARSON","e":"PEARSON","d":"Coeficiente de correlación producto-momento de Pearson.","s":"PEARSON(matriz1; matriz2)","x":"=PEARSON(A1:A10,B1:B10)"},{"n":"PENDIENTE","e":"SLOPE","d":"Pendiente de la línea de regresión lineal.","s":"PENDIENTE(y_conocidos; x_conocidos)","x":"=PENDIENTE(B1:B10,A1:A10)"},{"n":"PERCENTIL.INC","e":"PERCENTILE.INC","d":"Percentil k-ésimo (0..1 inclusive).","s":"PERCENTIL.INC(matriz; k)","x":"=PERCENTIL.INC(A1:A100,0.9)"},{"n":"PERMUTACIONES","e":"PERMUT","d":"Número de permutaciones para N objetos.","s":"PERMUTACIONES(número; tamaño)","x":"=PERMUTACIONES(6,2) → 30"},{"n":"PROBABILIDAD","e":"PROB","d":"Probabilidad de que valores estén entre dos límites.","s":"PROBABILIDAD(rango_x; rango_prob; límite_inf; [límite_sup])","x":"=PROBABILIDAD(A1:A5,B1:B5,2,3)"},{"n":"PROMEDIO","e":"AVERAGE","d":"Promedio (media aritmética) de los argumentos.","s":"PROMEDIO(número1; [número2]; ...)","x":"=PROMEDIO(A1:A50)"},{"n":"PROMEDIO.SI","e":"AVERAGEIF","d":"Promedio de celdas que cumplen una condición.","s":"PROMEDIO.SI(rango; criterio; [rango_promedio])","x":"=PROMEDIO.SI(A:A,\\\\">0\\\\",B:B)"},{"n":"PROMEDIO.SI.CONJUNTO","e":"AVERAGEIFS","d":"Promedio de celdas que cumplen múltiples condiciones.","s":"PROMEDIO.SI.CONJUNTO(rango_prom; rango1; criterio1; ...)","x":"=PROMEDIO.SI.CONJUNTO(C:C,A:A,\\\\"CR\\\\",B:B,\\\\">0\\\\")"},{"n":"TENDENCIA","e":"TREND","d":"Números en tendencia lineal por mínimos cuadrados.","s":"TENDENCIA(y_conocidos; [x_conocidos]; [nuevas_x]; [constante])","x":"=TENDENCIA(B2:B6,A2:A6,A7:A10)"},{"n":"VAR.P","e":"VAR.P","d":"Varianza de la población total.","s":"VAR.P(número1; [número2]; ...)","x":"=VAR.P(A1:A30)"},{"n":"VAR.S","e":"VAR.S","d":"Varianza de una muestra.","s":"VAR.S(número1; [número2]; ...)","x":"=VAR.S(A1:A30)"},{"n":"DISTR.BETA.N","e":"BETA.DIST","d":"Distribución beta acumulada (moderna).","s":"DISTR.BETA.N(x;alfa;beta;acumulado;[A];[B])","x":"=DISTR.BETA.N(0.5,2,5,VERDADERO)"},{"n":"DISTR.BETA.INV.N","e":"BETA.INV","d":"Inversa de la distribución beta acumulada.","s":"DISTR.BETA.INV.N(probabilidad;alfa;beta;[A];[B])","x":"=DISTR.BETA.INV.N(0.685,8,10,1,3)"},{"n":"DISTR.BINOM.N","e":"BINOM.DIST","d":"Distribución binomial (moderna).","s":"DISTR.BINOM.N(num_exito;ensayos;prob_exito;acumulado)","x":"=DISTR.BINOM.N(6,10,0.5,FALSO)"},{"n":"DISTR.BINOM.SERIE","e":"BINOM.DIST.RANGE","d":"Probabilidad de resultado usando distribución binomial en rango.","s":"DISTR.BINOM.SERIE(ensayos;prob_s;num_s;[num_s2])","x":"=DISTR.BINOM.SERIE(60,0.75,48)"},{"n":"BINOM.INV","e":"BINOM.INV","d":"Valor mínimo para que la distribución binomial acumulada sea mayor o igual al criterio.","s":"BINOM.INV(ensayos;prob_exito;alfa)","x":"=BINOM.INV(6,0.5,0.75)"},{"n":"DISTR.CHICUAD","e":"CHISQ.DIST","d":"Distribución chi cuadrado acumulada (moderna).","s":"DISTR.CHICUAD(x;grados_libertad;acumulado)","x":"=DISTR.CHICUAD(18.307,10,VERDADERO)"},{"n":"DISTR.CHICUAD.CD","e":"CHISQ.DIST.RT","d":"Probabilidad de cola derecha chi cuadrado.","s":"DISTR.CHICUAD.CD(x;grados_libertad)","x":"=DISTR.CHICUAD.CD(18.307,10)"},{"n":"INV.CHICUAD","e":"CHISQ.INV","d":"Inversa de la distribución chi cuadrado acumulada.","s":"INV.CHICUAD(probabilidad;grados_libertad)","x":"=INV.CHICUAD(0.05,10)"},{"n":"INV.CHICUAD.CD","e":"CHISQ.INV.RT","d":"Inversa de la probabilidad de cola derecha chi cuadrado.","s":"INV.CHICUAD.CD(probabilidad;grados_libertad)","x":"=INV.CHICUAD.CD(0.05,10)"},{"n":"PRUEBA.CHICUAD","e":"CHISQ.TEST","d":"Prueba de independencia chi cuadrado.","s":"PRUEBA.CHICUAD(rango_real;rango_esperado)","x":"=PRUEBA.CHICUAD(A1:C3,A5:C7)"},{"n":"INTERVALO.CONFIANZA.NORM","e":"CONFIDENCE.NORM","d":"Intervalo de confianza para la media usando distribución normal.","s":"INTERVALO.CONFIANZA.NORM(alfa;desv_estandar;tamano)","x":"=INTERVALO.CONFIANZA.NORM(0.05,2.5,50)"},{"n":"INTERVALO.CONFIANZA.T","e":"CONFIDENCE.T","d":"Intervalo de confianza usando distribución t de Student.","s":"INTERVALO.CONFIANZA.T(alfa;desv_estandar;tamano)","x":"=INTERVALO.CONFIANZA.T(0.05,2.5,50)"},{"n":"COVARIANZA.P","e":"COVARIANCE.P","d":"Covarianza de la población de dos conjuntos.","s":"COVARIANZA.P(matriz1;matriz2)","x":"=COVARIANZA.P(A1:A10,B1:B10)"},{"n":"COVARIANZA.M","e":"COVARIANCE.S","d":"Covarianza muestral de dos conjuntos.","s":"COVARIANZA.M(matriz1;matriz2)","x":"=COVARIANZA.M(A1:A10,B1:B10)"},{"n":"DISTR.EXP.N","e":"EXPON.DIST","d":"Distribución exponencial (moderna).","s":"DISTR.EXP.N(x;lambda;acumulado)","x":"=DISTR.EXP.N(0.2,10,VERDADERO)"},{"n":"DISTR.F.N","e":"F.DIST","d":"Distribución de probabilidad F (moderna).","s":"DISTR.F.N(x;grados_lib1;grados_lib2;acumulado)","x":"=DISTR.F.N(15.2069,6,4,FALSO)"},{"n":"DISTR.F.CD","e":"F.DIST.RT","d":"Distribución F de cola derecha.","s":"DISTR.F.CD(x;grados_lib1;grados_lib2)","x":"=DISTR.F.CD(15.2069,6,4)"},{"n":"INV.F","e":"F.INV","d":"Inversa de la distribución F.","s":"INV.F(probabilidad;grados_lib1;grados_lib2)","x":"=INV.F(0.01,6,4)"},{"n":"INV.F.CD","e":"F.INV.RT","d":"Inversa de la distribución F de cola derecha.","s":"INV.F.CD(probabilidad;grados_lib1;grados_lib2)","x":"=INV.F.CD(0.01,6,4)"},{"n":"PRUEBA.F.N","e":"F.TEST","d":"Resultado de una prueba F (moderna).","s":"PRUEBA.F.N(matriz1;matriz2)","x":"=PRUEBA.F.N(A1:A5,B1:B5)"},{"n":"PRUEBA.FISHER","e":"FISHER","d":"Transformación de Fisher.","s":"PRUEBA.FISHER(x)","x":"=PRUEBA.FISHER(0.75)"},{"n":"PRUEBA.FISHER.INV","e":"FISHERINV","d":"Inversa de la transformación de Fisher.","s":"PRUEBA.FISHER.INV(y)","x":"=PRUEBA.FISHER.INV(0.9730)"},{"n":"DISTR.GAMMA.N","e":"GAMMA.DIST","d":"Distribución gamma (moderna).","s":"DISTR.GAMMA.N(x;alfa;beta;acumulado)","x":"=DISTR.GAMMA.N(10,9,2,VERDADERO)"},{"n":"INV.GAMMA","e":"GAMMA.INV","d":"Inversa de la distribución gamma acumulada.","s":"INV.GAMMA(probabilidad;alfa;beta)","x":"=INV.GAMMA(0.068,9,2)"},{"n":"GAMMA.LN.EXACTO","e":"GAMMALN.PRECISE","d":"Logaritmo natural de la función gamma (preciso).","s":"GAMMA.LN.EXACTO(x)","x":"=GAMMA.LN.EXACTO(4)"},{"n":"FUNCION.GAMMA","e":"GAMMA","d":"Valor de la función gamma.","s":"FUNCION.GAMMA(numero)","x":"=FUNCION.GAMMA(2.5)"},{"n":"DISTR.HIPERGEOM.N","e":"HYPGEOM.DIST","d":"Distribución hipergeométrica (moderna).","s":"DISTR.HIPERGEOM.N(muestra_exito;tamano_muestra;pobl_exito;tamano_pobl;acumulado)","x":"=DISTR.HIPERGEOM.N(1,4,8,20,FALSO)"},{"n":"DISTR.HIPERGEOM","e":"HYPGEOMDIST","d":"Distribución hipergeométrica (clásica).","s":"DISTR.HIPERGEOM(muestra_exito;tamano_muestra;pobl_exito;tamano_pobl)","x":"=DISTR.HIPERGEOM(1,4,8,20)"},{"n":"ESTIMACION.LOGARITMICA","e":"LOGEST","d":"Estadísticas de tendencia exponencial.","s":"ESTIMACION.LOGARITMICA(y_conocidos;[x_conocidos];[constante];[estadistica])","x":"=ESTIMACION.LOGARITMICA(B1:B5,A1:A5,VERDADERO,VERDADERO)"},{"n":"DISTR.LOGNORM.N","e":"LOGNORM.DIST","d":"Distribución logarítmica normal (moderna).","s":"DISTR.LOGNORM.N(x;media;desv_estandar;acumulado)","x":"=DISTR.LOGNORM.N(4,3.5,1.2,VERDADERO)"},{"n":"INV.LOGNORM","e":"LOGNORM.INV","d":"Inversa de la distribución logarítmica normal.","s":"INV.LOGNORM(probabilidad;media;desv_estandar)","x":"=INV.LOGNORM(0.039,3.5,1.2)"},{"n":"MODA.VARIOS","e":"MODE.MULT","d":"Matriz vertical de los valores más frecuentes.","s":"MODA.VARIOS(numero1;[numero2];...)","x":"=MODA.VARIOS(A1:A20)"},{"n":"MODA.UNO.N","e":"MODE.SNGL","d":"Valor más frecuente (moderna).","s":"MODA.UNO.N(numero1;[numero2];...)","x":"=MODA.UNO.N(A1:A20)"},{"n":"DISTR.BINOM.NEG.N","e":"NEGBINOM.DIST","d":"Distribución binomial negativa (moderna).","s":"DISTR.BINOM.NEG.N(num_fallos;num_exitos;prob_exito;acumulado)","x":"=DISTR.BINOM.NEG.N(10,5,0.25,FALSO)"},{"n":"INV.NORM","e":"NORM.INV","d":"Inversa de la distribución normal acumulada.","s":"INV.NORM(probabilidad;media;desv_estandar)","x":"=INV.NORM(0.908789,40,1.5)"},{"n":"DISTR.NORM.ESTAND.N","e":"NORM.S.DIST","d":"Distribución normal estándar acumulada (moderna).","s":"DISTR.NORM.ESTAND.N(z;acumulado)","x":"=DISTR.NORM.ESTAND.N(1.96,VERDADERO)"},{"n":"INV.NORM.ESTAND","e":"NORM.S.INV","d":"Inversa de la distribución normal estándar.","s":"INV.NORM.ESTAND(probabilidad)","x":"=INV.NORM.ESTAND(0.975)"},{"n":"PERCENTIL.EXC","e":"PERCENTILE.EXC","d":"Percentil k-esimo (exclusivo 0 y 1).","s":"PERCENTIL.EXC(matriz;k)","x":"=PERCENTIL.EXC(A1:A100,0.9)"},{"n":"RANGO.PERCENTIL.EXC","e":"PERCENTRANK.EXC","d":"Rango percentil excluyendo 0 y 100%.","s":"RANGO.PERCENTIL.EXC(matriz;x;[significado])","x":"=RANGO.PERCENTIL.EXC(A1:A20,A5)"},{"n":"RANGO.PERCENTIL.INC","e":"PERCENTRANK.INC","d":"Rango percentil incluyendo 0 y 100%.","s":"RANGO.PERCENTIL.INC(matriz;x;[significado])","x":"=RANGO.PERCENTIL.INC(A1:A20,A5)"},{"n":"PERMUTACIONES.A","e":"PERMUTATIONA","d":"Permutaciones con repetición.","s":"PERMUTACIONES.A(numero;tamano)","x":"=PERMUTACIONES.A(3,2)"},{"n":"DIST.POISSON","e":"POISSON.DIST","d":"Distribución de Poisson (moderna).","s":"DIST.POISSON(x;media;acumulado)","x":"=DIST.POISSON(2,5,FALSO)"},{"n":"CUARTIL.EXC","e":"QUARTILE.EXC","d":"Cuartil excluyendo 0 y 4.","s":"CUARTIL.EXC(matriz;cuartil)","x":"=CUARTIL.EXC(A1:A20,1)"},{"n":"CUARTIL.INC","e":"QUARTILE.INC","d":"Cuartil incluyendo 0 y 4.","s":"CUARTIL.INC(matriz;cuartil)","x":"=CUARTIL.INC(A1:A20,1)"},{"n":"JERARQUIA.EQV","e":"RANK.EQ","d":"Posición de un número en una lista; igual posición si hay empate.","s":"JERARQUIA.EQV(numero;referencia;[orden])","x":"=JERARQUIA.EQV(A1,A1:A10,0)"},{"n":"JERARQUIA.MEDIA","e":"RANK.AVG","d":"Posición promediada si hay empate.","s":"JERARQUIA.MEDIA(numero;referencia;[orden])","x":"=JERARQUIA.MEDIA(A1,A1:A10,0)"},{"n":"COEFICIENTE.R2","e":"RSQ","d":"Cuadrado del coeficiente de correlación de Pearson.","s":"COEFICIENTE.R2(y_conocidos;x_conocidos)","x":"=COEFICIENTE.R2(B1:B10,A1:A10)"},{"n":"COEFICIENTE.ASIMETRIA","e":"SKEW","d":"Asimetría de una distribución.","s":"COEFICIENTE.ASIMETRIA(numero1;[numero2];...)","x":"=COEFICIENTE.ASIMETRIA(A1:A20)"},{"n":"COEFICIENTE.ASIMETRIA.P","e":"SKEW.P","d":"Asimetría basada en la población.","s":"COEFICIENTE.ASIMETRIA.P(numero1;[numero2];...)","x":"=COEFICIENTE.ASIMETRIA.P(A1:A20)"},{"n":"ERROR.TIPICO.XY","e":"STEYX","d":"Error estándar del valor y previsto en la regresión.","s":"ERROR.TIPICO.XY(y_conocidos;x_conocidos)","x":"=ERROR.TIPICO.XY(B1:B10,A1:A10)"},{"n":"DISTR.T.N","e":"T.DIST","d":"Distribución t de Student de cola izquierda.","s":"DISTR.T.N(x;grados_lib;acumulado)","x":"=DISTR.T.N(-2,6,VERDADERO)"},{"n":"DISTR.T.2C","e":"T.DIST.2T","d":"Distribución t de Student de dos colas.","s":"DISTR.T.2C(x;grados_lib)","x":"=DISTR.T.2C(2.92,6)"},{"n":"DISTR.T.CD","e":"T.DIST.RT","d":"Distribución t de Student de cola derecha.","s":"DISTR.T.CD(x;grados_lib)","x":"=DISTR.T.CD(2,6)"},{"n":"INV.T","e":"T.INV","d":"Inversa de la distribución t de cola izquierda.","s":"INV.T(probabilidad;grados_lib)","x":"=INV.T(0.75,2)"},{"n":"INV.T.2C","e":"T.INV.2T","d":"Inversa de la distribución t de dos colas.","s":"INV.T.2C(probabilidad;grados_lib)","x":"=INV.T.2C(0.05,60)"},{"n":"PRUEBA.T.N","e":"T.TEST","d":"Probabilidad de la prueba t de Student.","s":"PRUEBA.T.N(matriz1;matriz2;colas;tipo)","x":"=PRUEBA.T.N(A1:A5,B1:B5,2,1)"},{"n":"MEDIA.ACOTADA","e":"TRIMMEAN","d":"Media excluyendo valores extremos.","s":"MEDIA.ACOTADA(matriz;porcentaje)","x":"=MEDIA.ACOTADA(A1:A20,0.1)"},{"n":"WEIBULL.DIST","e":"WEIBULL.DIST","d":"Distribución de Weibull (moderna).","s":"WEIBULL.DIST(x;alfa;beta;acumulado)","x":"=WEIBULL.DIST(105,20,100,VERDADERO)"},{"n":"PRUEBA.Z.N","e":"Z.TEST","d":"Valor p de una prueba z de dos colas.","s":"PRUEBA.Z.N(matriz;x;[sigma])","x":"=PRUEBA.Z.N(A1:A20,4)"},{"n":"CRECIMIENTO.N","e":"GROWTH","d":"Tendencia de crecimiento exponencial.","s":"CRECIMIENTO.N(y_conocidos;[x_conocidos];[nuevas_x];[constante])","x":"=CRECIMIENTO.N(B2:B6,A2:A6,A7:A10)"},{"n":"CURTOSIS.N","e":"KURT","d":"Curtosis de un conjunto de datos.","s":"CURTOSIS.N(numero1;[numero2];...)","x":"=CURTOSIS.N(A1:A20)"},{"n":"PRONOSTICO.ETS","e":"FORECAST.ETS","d":"Valor futuro basado en suavizado exponencial triple.","s":"PRONOSTICO.ETS(fecha_destino;valores;escala_temporal;[estacionalidad])","x":"=PRONOSTICO.ETS(DATE(2026,3,1),B2:B13,A2:A13)"},{"n":"PRONOSTICO.LINEAL","e":"FORECAST.LINEAR","d":"Valor futuro mediante regresión lineal.","s":"PRONOSTICO.LINEAL(x;y_conocidos;x_conocidos)","x":"=PRONOSTICO.LINEAL(30,A2:A6,B2:B6)"},{"n":"DESVESTA","e":"STDEVA","d":"Desviación estándar incluyendo texto y lógicos.","s":"DESVESTA(valor1;[valor2];...)","x":"=DESVESTA(A1:A30)"},{"n":"DESVESTPA","e":"STDEVPA","d":"Desviación estándar de población incluyendo texto y lógicos.","s":"DESVESTPA(valor1;[valor2];...)","x":"=DESVESTPA(A1:A30)"},{"n":"VARA","e":"VARA","d":"Varianza de muestra incluyendo texto y lógicos.","s":"VARA(valor1;[valor2];...)","x":"=VARA(A1:A30)"},{"n":"VARPA","e":"VARPA","d":"Varianza de población incluyendo texto y lógicos.","s":"VARPA(valor1;[valor2];...)","x":"=VARPA(A1:A30)"}],"Información":[{"n":"CELDA","e":"CELL","d":"Devuelve información sobre formato, ubicación o contenido de una celda.","s":"CELDA(tipo_de_info; [referencia])","x":"=CELDA(\\\\"address\\\\",A1) → \\\\"$A$1\\\\""},{"n":"ES.IMPAR","e":"ISODD","d":"Devuelve VERDADERO si el número es impar.","s":"ES.IMPAR(número)","x":"=ES.IMPAR(3) → VERDADERO"},{"n":"ES.PAR","e":"ISEVEN","d":"Devuelve VERDADERO si el número es par.","s":"ES.PAR(número)","x":"=ES.PAR(4) → VERDADERO"},{"n":"ESBLANCO","e":"ISBLANK","d":"Comprueba si la celda está vacía.","s":"ESBLANCO(valor)","x":"=ESBLANCO(A1)"},{"n":"ESERR","e":"ISERR","d":"Comprueba si el valor es un error (excepto #N/A).","s":"ESERR(valor)","x":"=ESERR(A1/0)"},{"n":"ESERROR","e":"ISERROR","d":"Comprueba si el valor es cualquier error.","s":"ESERROR(valor)","x":"=ESERROR(A1/0)"},{"n":"ESFORMULA","e":"ISFORMULA","d":"Comprueba si la celda contiene una fórmula.","s":"ESFORMULA(referencia)","x":"=ESFORMULA(A1)"},{"n":"ESLOGICO","e":"ISLOGICAL","d":"Comprueba si el valor es lógico (VERDADERO/FALSO).","s":"ESLOGICO(valor)","x":"=ESLOGICO(VERDADERO) → VERDADERO"},{"n":"ESNOD","e":"ISNA","d":"Comprueba si el valor de error es #N/A.","s":"ESNOD(valor)","x":"=ESNOD(BUSCARV(A1,B:C,2,0))"},{"n":"ESNOTEXTO","e":"ISNONTEXT","d":"Comprueba si el valor no es texto.","s":"ESNOTEXTO(valor)","x":"=ESNOTEXTO(123) → VERDADERO"},{"n":"ESNUMERO","e":"ISNUMBER","d":"Comprueba si el valor es un número.","s":"ESNUMERO(valor)","x":"=ESNUMERO(A1)"},{"n":"ESREF","e":"ISREF","d":"Comprueba si el valor es una referencia.","s":"ESREF(valor)","x":"=ESREF(A1) → VERDADERO"},{"n":"ESTEXTO","e":"ISTEXT","d":"Comprueba si el valor es texto.","s":"ESTEXTO(valor)","x":"=ESTEXTO(\\\\"Hola\\\\") → VERDADERO"},{"n":"HOJA","e":"SHEET","d":"Devuelve el número de la hoja referenciada.","s":"HOJA([valor])","x":"=HOJA() → 1"},{"n":"HOJAS","e":"SHEETS","d":"Devuelve la cantidad de hojas.","s":"HOJAS([referencia])","x":"=HOJAS() → 3"},{"n":"INFO","e":"INFO","d":"Información sobre el entorno operativo.","s":"INFO(tipo)","x":"=INFO(\\\\"version\\\\")"},{"n":"N","e":"N","d":"Convierte valores no numéricos en números.","s":"N(valor)","x":"=N(VERDADERO) → 1"},{"n":"NOD","e":"NA","d":"Devuelve el valor de error #N/A.","s":"NOD()","x":"=NOD()"},{"n":"TIPO","e":"TYPE","d":"Devuelve un entero que representa el tipo de datos.","s":"TIPO(valor)","x":"=TIPO(\\\\"Hola\\\\") → 2"},{"n":"TIPO.DE.ERROR","e":"ERROR.TYPE","d":"Devuelve un número que corresponde al tipo de error.","s":"TIPO.DE.ERROR(valor_error)","x":"=TIPO.DE.ERROR(#N/A) → 7"},{"n":"HISTORIAL.COTIZACIONES","e":"STOCKHISTORY","d":"Recupera datos históricos de instrumentos financieros.","s":"HISTORIAL.COTIZACIONES(accion;fecha_inicio;[fecha_fin];[intervalo])","x":"=HISTORIAL.COTIZACIONES(\\\\"MSFT\\\\",\\\\"01/01/2026\\\\")"},{"n":"ISDATE","e":"ISDATE","d":"VERDADERO si el valor es una fecha válida (Funciones especiales).","s":"ISDATE(valor)","x":"=ISDATE(A1)"}],"Ingeniería":[{"n":"BIN.A.DEC","e":"BIN2DEC","d":"Convierte un número binario en decimal.","s":"BIN.A.DEC(número)","x":"=BIN.A.DEC(1111) → 15"},{"n":"BIN.A.HEX","e":"BIN2HEX","d":"Convierte un número binario en hexadecimal.","s":"BIN.A.HEX(número; [lugares])","x":"=BIN.A.HEX(11111011) → \\\\"FB\\\\""},{"n":"BIN.A.OCT","e":"BIN2OCT","d":"Convierte un número binario en octal.","s":"BIN.A.OCT(número; [lugares])","x":"=BIN.A.OCT(1111) → 17"},{"n":"BIT.O","e":"BITOR","d":"Devuelve un bit a bit \\\\"Or\\\\" de dos números.","s":"BIT.O(número1; número2)","x":"=BIT.O(23,10) → 31"},{"n":"BIT.XO","e":"BITXOR","d":"Devuelve un bit a bit \\\\"Exclusive Or\\\\".","s":"BIT.XO(número1; número2)","x":"=BIT.XO(5,3) → 6"},{"n":"BIT.Y","e":"BITAND","d":"Devuelve un bit a bit \\\\"And\\\\" de dos números.","s":"BIT.Y(número1; número2)","x":"=BIT.Y(23,10) → 2"},{"n":"COMPLEJO","e":"COMPLEX","d":"Convierte coeficientes real e imaginario en número complejo.","s":"COMPLEJO(real; imaginario; [sufijo])","x":"=COMPLEJO(3,4) → \\\\"3+4i\\\\""},{"n":"CONVERTIR","e":"CONVERT","d":"Convierte un número de un sistema de medidas a otro.","s":"CONVERTIR(número; de_unidad; a_unidad)","x":"=CONVERTIR(1,\\\\"km\\\\",\\\\"mi\\\\") → 0.621"},{"n":"DEC.A.BIN","e":"DEC2BIN","d":"Convierte un número decimal en binario.","s":"DEC.A.BIN(número; [lugares])","x":"=DEC.A.BIN(15) → \\\\"1111\\\\""},{"n":"DEC.A.HEX","e":"DEC2HEX","d":"Convierte un número decimal en hexadecimal.","s":"DEC.A.HEX(número; [lugares])","x":"=DEC.A.HEX(255) → \\\\"FF\\\\""},{"n":"DEC.A.OCT","e":"DEC2OCT","d":"Convierte un número decimal en octal.","s":"DEC.A.OCT(número; [lugares])","x":"=DEC.A.OCT(8) → \\\\"10\\\\""},{"n":"DELTA","e":"DELTA","d":"Prueba si dos números son iguales (devuelve 1 o 0).","s":"DELTA(número1; [número2])","x":"=DELTA(5,4) → 0; =DELTA(5,5) → 1"},{"n":"FUN.ERROR","e":"ERF","d":"Devuelve la función de error entre límites.","s":"FUN.ERROR(límite_inf; [límite_sup])","x":"=FUN.ERROR(0.745)"},{"n":"FUN.ERROR.COMPL","e":"ERFC","d":"Devuelve la función de error complementaria.","s":"FUN.ERROR.COMPL(x)","x":"=FUN.ERROR.COMPL(1)"},{"n":"HEX.A.BIN","e":"HEX2BIN","d":"Convierte un número hexadecimal en binario.","s":"HEX.A.BIN(número; [lugares])","x":"=HEX.A.BIN(\\\\"F\\\\") → \\\\"1111\\\\""},{"n":"HEX.A.DEC","e":"HEX2DEC","d":"Convierte un número hexadecimal en decimal.","s":"HEX.A.DEC(número)","x":"=HEX.A.DEC(\\\\"FF\\\\") → 255"},{"n":"HEX.A.OCT","e":"HEX2OCT","d":"Convierte un número hexadecimal en octal.","s":"HEX.A.OCT(número; [lugares])","x":"=HEX.A.OCT(\\\\"F\\\\") → \\\\"17\\\\""},{"n":"IM.ABS","e":"IMABS","d":"Valor absoluto (módulo) de un número complejo.","s":"IM.ABS(número_complejo)","x":"=IM.ABS(\\\\"3+4i\\\\") → 5"},{"n":"IM.COS","e":"IMCOS","d":"Coseno de un número complejo.","s":"IM.COS(número_complejo)","x":"=IM.COS(\\\\"1+i\\\\")"},{"n":"IM.DIV","e":"IMDIV","d":"Cociente de dos números complejos.","s":"IM.DIV(número_complejo1; número_complejo2)","x":"=IM.DIV(\\\\"−238+240i\\\\",\\\\"10+24i\\\\")"},{"n":"IM.EXP","e":"IMEXP","d":"Valor exponencial de un número complejo.","s":"IM.EXP(número_complejo)","x":"=IM.EXP(\\\\"1+2i\\\\")"},{"n":"IM.LN","e":"IMLN","d":"Logaritmo natural de un número complejo.","s":"IM.LN(número_complejo)","x":"=IM.LN(\\\\"3+4i\\\\")"},{"n":"IM.POT","e":"IMPOWER","d":"Número complejo elevado a una potencia.","s":"IM.POT(número_complejo; número)","x":"=IM.POT(\\\\"2+3i\\\\",3)"},{"n":"IM.RAIZ2","e":"IMSQRT","d":"Raíz cuadrada de un número complejo.","s":"IM.RAIZ2(número_complejo)","x":"=IM.RAIZ2(\\\\"1+i\\\\")"},{"n":"IM.SENO","e":"IMSIN","d":"Seno de un número complejo.","s":"IM.SENO(número_complejo)","x":"=IM.SENO(\\\\"1+i\\\\")"},{"n":"IM.SUM","e":"IMSUM","d":"Suma de números complejos.","s":"IM.SUM(número_complejo1; [número_complejo2]; ...)","x":"=IM.SUM(\\\\"3+4i\\\\",\\\\"5-3i\\\\")"},{"n":"IMAGINARIO","e":"IMAGINARY","d":"Coeficiente imaginario de un número complejo.","s":"IMAGINARIO(número_complejo)","x":"=IMAGINARIO(\\\\"3+4i\\\\") → 4"},{"n":"MAYOR.O.IGUAL","e":"GESTEP","d":"Prueba si un número es mayor o igual al valor de referencia.","s":"MAYOR.O.IGUAL(número; [paso])","x":"=MAYOR.O.IGUAL(5,4) → 1"},{"n":"OCT.A.BIN","e":"OCT2BIN","d":"Convierte un número octal en binario.","s":"OCT.A.BIN(número; [lugares])","x":"=OCT.A.BIN(7) → \\\\"111\\\\""},{"n":"OCT.A.DEC","e":"OCT2DEC","d":"Convierte un número octal en decimal.","s":"OCT.A.DEC(número)","x":"=OCT.A.DEC(17) → 15"},{"n":"OCT.A.HEX","e":"OCT2HEX","d":"Convierte un número octal en hexadecimal.","s":"OCT.A.HEX(número; [lugares])","x":"=OCT.A.HEX(100) → \\\\"40\\\\""},{"n":"BESSELI","e":"BESSELI","d":"Función de Bessel modificada In(x).","s":"BESSELI(x;n)","x":"=BESSELI(2.5,1)"},{"n":"BESSELK","e":"BESSELK","d":"Función de Bessel modificada Kn(x).","s":"BESSELK(x;n)","x":"=BESSELK(2.5,1)"},{"n":"ERF.EXACTO","e":"ERF.PRECISE","d":"Función de error de Gauss integrada (precisa).","s":"ERF.EXACTO(x)","x":"=ERF.EXACTO(1)"},{"n":"ERFC.EXACTO","e":"ERFC.PRECISE","d":"Función complementaria ERF (precisa).","s":"ERFC.EXACTO(x)","x":"=ERFC.EXACTO(1)"},{"n":"IM.ANGULO","e":"IMARGUMENT","d":"Argumento theta de un número complejo en radianes.","s":"IM.ANGULO(numero_complejo)","x":"=IM.ANGULO(\\\\"3+4i\\\\")"},{"n":"IM.CONJUGADA","e":"IMCONJUGATE","d":"Conjugado complejo de un número complejo.","s":"IM.CONJUGADA(numero_complejo)","x":"=IM.CONJUGADA(\\\\"3+4i\\\\")"},{"n":"IM.COSH","e":"IMCOSH","d":"Coseno hiperbólico de un número complejo.","s":"IM.COSH(numero_complejo)","x":"=IM.COSH(\\\\"1+i\\\\")"},{"n":"IM.COT","e":"IMCOT","d":"Cotangente de un número complejo.","s":"IM.COT(numero_complejo)","x":"=IM.COT(\\\\"1+i\\\\")"},{"n":"IM.CSC","e":"IMCSC","d":"Cosecante de un número complejo.","s":"IM.CSC(numero_complejo)","x":"=IM.CSC(\\\\"1+i\\\\")"},{"n":"IM.CSCH","e":"IMCSCH","d":"Cosecante hiperbólica de un número complejo.","s":"IM.CSCH(numero_complejo)","x":"=IM.CSCH(\\\\"1+i\\\\")"},{"n":"IM.LOG10","e":"IMLOG10","d":"Logaritmo base 10 de un número complejo.","s":"IM.LOG10(numero_complejo)","x":"=IM.LOG10(\\\\"3+4i\\\\")"},{"n":"IM.LOG2","e":"IMLOG2","d":"Logaritmo base 2 de un número complejo.","s":"IM.LOG2(numero_complejo)","x":"=IM.LOG2(\\\\"3+4i\\\\")"},{"n":"IM.LOG","e":"IMLOG","d":"Logaritmo base personalizada de un número complejo (Funciones especiales).","s":"IM.LOG(valor;base)","x":"=IM.LOG(\\\\"3+4i\\\\",10)"},{"n":"IM.PRODUCTO","e":"IMPRODUCT","d":"Producto de números complejos.","s":"IM.PRODUCTO(numero1;[numero2];...)","x":"=IM.PRODUCTO(\\\\"3+4i\\\\",\\\\"5-3i\\\\")"},{"n":"IM.PRODUCT","e":"IMPRODUCT","d":"Multiplicación de números complejos (Funciones especiales).","s":"IM.PRODUCT(factor1;[factor2];...)","x":"=IM.PRODUCT(\\\\"3+4i\\\\",\\\\"1+2i\\\\")"},{"n":"IM.REAL","e":"IMREAL","d":"Coeficiente real de un número complejo.","s":"IM.REAL(numero_complejo)","x":"=IM.REAL(\\\\"3+4i\\\\")"},{"n":"IM.SEC","e":"IMSEC","d":"Secante de un número complejo.","s":"IM.SEC(numero_complejo)","x":"=IM.SEC(\\\\"1+i\\\\")"},{"n":"IM.SECH","e":"IMSECH","d":"Secante hiperbólica de un número complejo.","s":"IM.SECH(numero_complejo)","x":"=IM.SECH(\\\\"1+i\\\\")"},{"n":"IM.SENOH","e":"IMSINH","d":"Seno hiperbólico de un número complejo.","s":"IM.SENOH(numero_complejo)","x":"=IM.SENOH(\\\\"1+i\\\\")"},{"n":"IM.SUSTR","e":"IMSUB","d":"Diferencia entre dos números complejos.","s":"IM.SUSTR(num1;num2)","x":"=IM.SUSTR(\\\\"5+3i\\\\",\\\\"2+i\\\\")"},{"n":"IM.TAN","e":"IMTAN","d":"Tangente de un número complejo.","s":"IM.TAN(numero_complejo)","x":"=IM.TAN(\\\\"1+i\\\\")"},{"n":"IMCOTH","e":"IMCOTH","d":"Cotangente hiperbólica de un número complejo.","s":"IMCOTH(numero)","x":"=IMCOTH(\\\\"1+2i\\\\")"},{"n":"IMTANH","e":"IMTANH","d":"Tangente hiperbólica de un número complejo.","s":"IMTANH(numero)","x":"=IMTANH(\\\\"1+2i\\\\")"},{"n":"BIT.DESPLDCHA","e":"BITRSHIFT","d":"Desplaza bits hacia la derecha.","s":"BIT.DESPLDCHA(valor;posiciones)","x":"=BIT.DESPLDCHA(16,2)"},{"n":"BIT.DESPLIZQDA","e":"BITLSHIFT","d":"Desplaza bits hacia la izquierda.","s":"BIT.DESPLIZQDA(valor;posiciones)","x":"=BIT.DESPLIZQDA(4,2)"},{"n":"FUN.ERROR.EXACTO","e":"ERF.PRECISE","d":"Función de error de Gauss (versión exacta Google).","s":"FUN.ERROR.EXACTO(limite_inf;[limite_sup])","x":"=FUN.ERROR.EXACTO(0,1)"}],"Cubo":[{"n":"CONJUNTOCUBO","e":"CUBESET","d":"Define un conjunto calculado en el cubo OLAP.","s":"CONJUNTOCUBO(conexión; expresión_conjunto; [título]; [orden]; [ordenar_por])","x":"=CONJUNTOCUBO(\\\\"ConexionOLAP\\\\",\\\\"[Producto].[Todos]\\\\",\\\\"Productos\\\\")"},{"n":"MIEMBROCUBO","e":"CUBEMEMBER","d":"Devuelve un miembro de un cubo OLAP.","s":"MIEMBROCUBO(conexión; expresión_miembro; [título])","x":"=MIEMBROCUBO(\\\\"ConexionOLAP\\\\",\\\\"[Medidas].[Ventas]\\\\")"},{"n":"MIEMBROKPICUBO","e":"CUBEKPIMEMBER","d":"Devuelve una propiedad KPI del cubo.","s":"MIEMBROKPICUBO(conexión; kpi_nombre; tipo_kpi; [título])","x":"=MIEMBROKPICUBO(\\\\"ConexionOLAP\\\\",\\\\"Ingresos\\\\",1)"},{"n":"MIEMBRORANGOCUBO","e":"CUBERANKEDMEMBER","d":"Devuelve el miembro N-ésimo de un conjunto.","s":"MIEMBRORANGOCUBO(conexión; expresión_conjunto; rango; [título])","x":"=MIEMBRORANGOCUBO(\\\\"ConexionOLAP\\\\",\\\\"[Producto].[Todos]\\\\",1)"},{"n":"PROPIEDADMIEMBROCUBO","e":"CUBEMEMBERPROPERTY","d":"Devuelve el valor de una propiedad de miembro en el cubo.","s":"PROPIEDADMIEMBROCUBO(conexión; expresión_miembro; propiedad)","x":"=PROPIEDADMIEMBROCUBO(\\\\"ConexionOLAP\\\\",\\\\"[Empleado].[E-02]\\\\",\\\\"[Empleado].[E-02].[Nombre]\\\\")"},{"n":"RECUENTOCONJUNTOCUBO","e":"CUBESETCOUNT","d":"Devuelve el número de elementos de un conjunto.","s":"RECUENTOCONJUNTOCUBO(conjunto)","x":"=RECUENTOCONJUNTOCUBO(CONJUNTOCUBO(\\\\"ConexionOLAP\\\\",\\\\"[Producto].[Todos]\\\\"))"},{"n":"VALORCUBO","e":"CUBEVALUE","d":"Devuelve un valor agregado del cubo.","s":"VALORCUBO(conexión; [expresión_miembro1]; ...)","x":"=VALORCUBO(\\\\"ConexionOLAP\\\\",\\\\"[Medidas].[Ventas]\\\\",\\\\"[Tiempo].[2026]\\\\")"}],"Web":[{"n":"SERVICIOWEB","e":"WEBSERVICE","d":"Devuelve datos de un servicio web.","s":"SERVICIOWEB(url)","x":"=SERVICIOWEB(\\\\"https://api.hacienda.go.cr/fe/ae?identificacion=3101000000\\\\")"},{"n":"URLCODIF","e":"ENCODEURL","d":"Devuelve una cadena codificada en URL.","s":"URLCODIF(texto)","x":"=URLCODIF(\\\\"Costa Rica 2026\\\\") → \\\\"Costa%20Rica%202026\\\\""},{"n":"XMLFILTRO","e":"FILTERXML","d":"Extrae datos XML usando XPath.","s":"XMLFILTRO(xml; xpath)","x":"=XMLFILTRO(SERVICIOWEB(\\\\"https://api.ejemplo.cr/datos\\\\"),\\\\"//precio\\\\")"}],"Duración":[{"n":"DUR.A.DIAS","e":"DURATION.TO.DAYS","d":"Convierte duración a días (hoja de cálculo).","s":"DUR.A.DIAS(duracion)","x":"=DUR.A.DIAS(\\\\"1s 2h 30m\\\\")"},{"n":"DUR.A.HORAS","e":"DURATION.TO.HOURS","d":"Convierte duración a horas (hoja de cálculo).","s":"DUR.A.HORAS(duracion)","x":"=DUR.A.HORAS(\\\\"1s 2h\\\\")"},{"n":"DUR.A.MILISEGUNDOS","e":"DURATION.TO.MILLISECONDS","d":"Convierte duración a milisegundos (hoja de cálculo).","s":"DUR.A.MILISEGUNDOS(duracion)","x":"=DUR.A.MILISEGUNDOS(\\\\"1m 30s\\\\")"},{"n":"DUR.A.MINUTOS","e":"DURATION.TO.MINUTES","d":"Convierte duración a minutos (hoja de cálculo).","s":"DUR.A.MINUTOS(duracion)","x":"=DUR.A.MINUTOS(\\\\"1h 30m\\\\")"},{"n":"DUR.A.SEGUNDOS","e":"DURATION.TO.SECONDS","d":"Convierte duración a segundos (hoja de cálculo).","s":"DUR.A.SEGUNDOS(duracion)","x":"=DUR.A.SEGUNDOS(\\\\"1m 30s\\\\")"},{"n":"DUR.A.SEMANAS","e":"DURATION.TO.WEEKS","d":"Convierte duración a semanas (hoja de cálculo).","s":"DUR.A.SEMANAS(duracion)","x":"=DUR.A.SEMANAS(\\\\"14s\\\\")"},{"n":"CONVERTIR.DURACION","e":"DURATION.CONVERT","d":"Convierte duración a otra unidad (hoja de cálculo).","s":"CONVERTIR.DURACION(duracion;unidad_destino)","x":"=CONVERTIR.DURACION(\\\\"1h 30m\\\\",\\\\"s\\\\")"}],"Trigonométricas":[{"n":"SEN","e":"SIN","d":"Seno de un ángulo en radianes (alias hoja de cálculo).","s":"SEN(numero)","x":"=SEN(PI()/2)"},{"n":"ASEN","e":"ASIN","d":"Arcoseno de un número en radianes.","s":"ASEN(numero)","x":"=ASEN(0.5)"},{"n":"SENOH","e":"SINH","d":"Seno hiperbólico de un número.","s":"SENOH(numero)","x":"=SENOH(1)"},{"n":"TANH","e":"TANH","d":"Tangente hiperbólica de un número.","s":"TANH(numero)","x":"=TANH(0.5)"}]}');
var fnCurrentCat = null;
var fnSelectedItem = null;
var currentUser = null, firebaseApp = null, firestoreDB = null, currentMatrizId = null, currentMatrizName = null, applyingRemote = false, saveDebounceTimer = null;

function colLetter(i) { return String.fromCharCode(65 + i); }
function colIndex(s) { var n = 0; s = (s || '').toUpperCase(); for (var i = 0; i < s.length; i++) n = n * 26 + s.charCodeAt(i) - 64; return n - 1; }
function cellId(r, c) { return colLetter(c) + (r + 1); }

function snapshot() {
  undoStack.push(JSON.stringify({ sheets: sheets, sheetData: sheetData, sheetFormats: sheetFormats, sheetNotes: sheetNotes, colWidths: colWidths, activeSheet: activeSheet, ROWS: ROWS, COLS: COLS }));
  if (undoStack.length > 25) undoStack.shift();
  document.getElementById('btnUndo').disabled = false;
}
function undo() {
  if (!undoStack.length) return;
  var prev = JSON.parse(undoStack.pop());
  sheets = prev.sheets; sheetData = prev.sheetData; sheetFormats = prev.sheetFormats;
  sheetNotes = prev.sheetNotes || {}; colWidths = prev.colWidths || {}; activeSheet = prev.activeSheet; ROWS = prev.ROWS || ROWS; COLS = prev.COLS || COLS;
  buildTable(); autoSave();
  if (!undoStack.length) document.getElementById('btnUndo').disabled = true;
}

// ══════════════════════════════════════════════
// MOTOR DE FÓRMULAS
// ══════════════════════════════════════════════
function getRaw(id) { return (sheetData[activeSheet] && sheetData[activeSheet][id] !== undefined) ? sheetData[activeSheet][id] : ''; }
function toNum(v) { if (v === '' || v === null || v === undefined) return 0; var n = parseFloat(String(v).replace(/[₡,%\\s()]/g, '')); return isNaN(n) ? 0 : n; }
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
    if ((inner = matchFn('MEDIANA|MEDIAN')) !== null) {
      args = splitArgs(inner); var numsM = isRange(args[0]) ? rangeNums(args[0]) : args.map(resolveNum);
      numsM.sort(function (a, b) { return a - b; }); var mid = Math.floor(numsM.length / 2);
      return fmtNum(numsM.length % 2 ? numsM[mid] : (numsM[mid - 1] + numsM[mid]) / 2);
    }
    if ((inner = matchFn('DESVEST|STDEV')) !== null) {
      args = splitArgs(inner); var numsD = isRange(args[0]) ? rangeNums(args[0]) : args.map(resolveNum);
      var meanD = numsD.reduce(function (a, b) { return a + b; }, 0) / numsD.length;
      return fmtNum(Math.sqrt(numsD.reduce(function (s, n) { return s + (n - meanD) * (n - meanD); }, 0) / (numsD.length - 1)));
    }
    if ((inner = matchFn('VAR|VARIANZA')) !== null) {
      args = splitArgs(inner); var numsV = isRange(args[0]) ? rangeNums(args[0]) : args.map(resolveNum);
      var meanV = numsV.reduce(function (a, b) { return a + b; }, 0) / numsV.length;
      return fmtNum(numsV.reduce(function (s, n) { return s + (n - meanV) * (n - meanV); }, 0) / (numsV.length - 1));
    }
    if ((inner = matchFn('K\\\\.ESIMO\\\\.MAYOR|LARGE')) !== null) {
      args = splitArgs(inner); var nl = isRange(args[0]) ? rangeNums(args[0]) : [resolveNum(args[0])];
      nl.sort(function (a, b) { return b - a; }); return fmtNum(nl[resolveNum(args[1]) - 1]);
    }
    if ((inner = matchFn('K\\\\.ESIMO\\\\.MENOR|SMALL')) !== null) {
      args = splitArgs(inner); var ns = isRange(args[0]) ? rangeNums(args[0]) : [resolveNum(args[0])];
      ns.sort(function (a, b) { return a - b; }); return fmtNum(ns[resolveNum(args[1]) - 1]);
    }
    if ((inner = matchFn('MODA|MODE')) !== null) {
      args = splitArgs(inner); var numsMo = isRange(args[0]) ? rangeNums(args[0]) : args.map(resolveNum);
      var freq = {}; numsMo.forEach(function (n) { freq[n] = (freq[n] || 0) + 1; });
      var best = numsMo[0], bestC = 0;
      Object.keys(freq).forEach(function (k) { if (freq[k] > bestC) { bestC = freq[k]; best = k; } });
      return fmtNum(parseFloat(best));
    }
    if ((inner = matchFn('SI|IF')) !== null) {
      args = splitArgs(inner);
      return evalCond(args[0]) ? String(resolveArg(args[1] || '')) : String(resolveArg(args[2] || ''));
    }
    if ((inner = matchFn('Y|AND')) !== null) { args = splitArgs(inner); return args.every(function (a) { return evalCond(a); }) ? 'VERDADERO' : 'FALSO'; }
    if ((inner = matchFn('O|OR')) !== null) { args = splitArgs(inner); return args.some(function (a) { return evalCond(a); }) ? 'VERDADERO' : 'FALSO'; }
    if ((inner = matchFn('NO|NOT')) !== null) { return evalCond(splitArgs(inner)[0]) ? 'FALSO' : 'VERDADERO'; }
    if ((inner = matchFn('SI\\\\.ERROR|IFERROR')) !== null) {
      args = splitArgs(inner);
      try { var v2 = resolveArg(args[0]); if (String(v2).charAt(0) === '#') return String(resolveArg(args[1])); return String(v2); }
      catch (e2) { return String(resolveArg(args[1])); }
    }
    if ((inner = matchFn('CONCATENAR|CONCATENATE|CONCAT')) !== null) {
      return splitArgs(inner).map(function (a) { return isRange(a) ? rangeVals(a).join('') : String(resolveArg(a)); }).join('');
    }
    if ((inner = matchFn('MAYUSC|UPPER')) !== null) { return String(resolveArg(splitArgs(inner)[0])).toUpperCase(); }
    if ((inner = matchFn('MINUSC|LOWER')) !== null) { return String(resolveArg(splitArgs(inner)[0])).toLowerCase(); }
    if ((inner = matchFn('NOMPROPIO|PROPER')) !== null) {
      return String(resolveArg(splitArgs(inner)[0])).replace(/\\w\\S*/g, function (w) { return w.charAt(0).toUpperCase() + w.substr(1).toLowerCase(); });
    }
    if ((inner = matchFn('ESPACIOS|TRIM')) !== null) { return String(resolveArg(splitArgs(inner)[0])).replace(/\\s+/g, ' ').trim(); }
    if ((inner = matchFn('LARGO|LEN')) !== null) { return String(String(resolveArg(splitArgs(inner)[0])).length); }
    if ((inner = matchFn('IZQUIERDA|LEFT')) !== null) { args = splitArgs(inner); var sL = String(resolveArg(args[0])); return sL.substring(0, args[1] ? parseInt(resolveNum(args[1])) : 1); }
    if ((inner = matchFn('DERECHA|RIGHT')) !== null) { args = splitArgs(inner); var sR = String(resolveArg(args[0])); var nR = args[1] ? parseInt(resolveNum(args[1])) : 1; return sR.substring(sR.length - nR); }
    if ((inner = matchFn('EXTRAE|MID')) !== null) { args = splitArgs(inner); return String(resolveArg(args[0])).substring(parseInt(resolveNum(args[1])) - 1, parseInt(resolveNum(args[1])) - 1 + parseInt(resolveNum(args[2]))); }
    if ((inner = matchFn('ENCONTRAR|FIND')) !== null) { args = splitArgs(inner); var pos = String(resolveArg(args[1])).indexOf(String(resolveArg(args[0]))); return pos >= 0 ? String(pos + 1) : '#VALOR!'; }
    if ((inner = matchFn('HALLAR|SEARCH')) !== null) { args = splitArgs(inner); var pos2 = String(resolveArg(args[1])).toLowerCase().indexOf(String(resolveArg(args[0])).toLowerCase()); return pos2 >= 0 ? String(pos2 + 1) : '#VALOR!'; }
    if ((inner = matchFn('SUSTITUIR|SUBSTITUTE')) !== null) { args = splitArgs(inner); return String(resolveArg(args[0])).split(String(resolveArg(args[1]))).join(String(resolveArg(args[2]))); }
    if ((inner = matchFn('REPETIR|REPT')) !== null) { args = splitArgs(inner); return String(resolveArg(args[0])).repeat(parseInt(resolveNum(args[1]))); }
    if ((inner = matchFn('VALOR|VALUE')) !== null) { return fmtNum(parseFloat(String(resolveArg(splitArgs(inner)[0])).replace(/[₡,\\s]/g, ''))); }
    if ((inner = matchFn('ESTEXTO|ISTEXT')) !== null) { var vt = resolveArg(splitArgs(inner)[0]); return (isNaN(parseFloat(vt)) && typeof vt === 'string' && vt !== '') ? 'VERDADERO' : 'FALSO'; }
    if ((inner = matchFn('ESERROR|ISERROR')) !== null) { try { var ve = String(resolveArg(splitArgs(inner)[0])); return ve.charAt(0) === '#' ? 'VERDADERO' : 'FALSO'; } catch (e4) { return 'VERDADERO'; } }
    if ((inner = matchFn('ESBLANCO|ISBLANK')) !== null) { var vb = resolveArg(splitArgs(inner)[0]); return (vb === '' || vb === null) ? 'VERDADERO' : 'FALSO'; }
    if ((inner = matchFn('ESNUMERO|ISNUMBER')) !== null) { var vn2 = resolveArg(splitArgs(inner)[0]); return !isNaN(parseFloat(vn2)) && vn2 !== '' ? 'VERDADERO' : 'FALSO'; }
    if ((inner = matchFn('TEXTO|TEXT')) !== null) {
      args = splitArgs(inner); var nT = resolveNum(args[0]); var fmt4 = String(resolveArg(args[1] || ''));
      if (fmt4.indexOf('#,##0') >= 0) return nT.toLocaleString('es-CR', { minimumFractionDigits: fmt4.indexOf('.00') >= 0 ? 2 : 0 });
      return String(nT);
    }
    if ((inner = matchFn('ABS')) !== null) { return fmtNum(Math.abs(resolveNum(splitArgs(inner)[0]))); }
    if ((inner = matchFn('POTENCIA|POWER')) !== null) { args = splitArgs(inner); return fmtNum(Math.pow(resolveNum(args[0]), resolveNum(args[1]))); }
    if ((inner = matchFn('RAIZ|SQRT')) !== null) { return fmtNum(Math.sqrt(resolveNum(splitArgs(inner)[0]))); }
    if ((inner = matchFn('REDONDEAR|ROUND')) !== null) { args = splitArgs(inner); return fmtNum(parseFloat(resolveNum(args[0]).toFixed(parseInt(resolveNum(args[1] || '0'))))); }
    if ((inner = matchFn('REDONDEAR\\\\.MAS|ROUNDUP')) !== null) { args = splitArgs(inner); var dRU = parseInt(resolveNum(args[1])); var pRU = Math.pow(10, dRU); return fmtNum(Math.ceil(resolveNum(args[0]) * pRU) / pRU); }
    if ((inner = matchFn('REDONDEAR\\\\.MENOS|ROUNDDOWN')) !== null) { args = splitArgs(inner); var dRD = parseInt(resolveNum(args[1])); var pRD = Math.pow(10, dRD); return fmtNum(Math.floor(resolveNum(args[0]) * pRD) / pRD); }
    if ((inner = matchFn('ENTERO|INT')) !== null) { return fmtNum(Math.floor(resolveNum(splitArgs(inner)[0]))); }
    if ((inner = matchFn('RESIDUO|MOD')) !== null) { args = splitArgs(inner); var aM = resolveNum(args[0]), bM = resolveNum(args[1]); return fmtNum(aM - Math.floor(aM / bM) * bM); }
    if ((inner = matchFn('FACT')) !== null) { var fn3 = resolveNum(splitArgs(inner)[0]); var f3 = 1; for (var i3 = 2; i3 <= fn3; i3++) f3 *= i3; return fmtNum(f3); }
    if ((inner = matchFn('SIGNO|SIGN')) !== null) { var svS = resolveNum(splitArgs(inner)[0]); return String(svS > 0 ? 1 : svS < 0 ? -1 : 0); }
    if ((inner = matchFn('PI')) !== null) { return fmtNum(Math.PI); }
    if ((inner = matchFn('GRADOS|DEGREES')) !== null) { return fmtNum(resolveNum(splitArgs(inner)[0]) * 180 / Math.PI); }
    if ((inner = matchFn('RADIANES|RADIANS')) !== null) { return fmtNum(resolveNum(splitArgs(inner)[0]) * Math.PI / 180); }
    if ((inner = matchFn('LN')) !== null) { return fmtNum(Math.log(resolveNum(splitArgs(inner)[0]))); }
    if ((inner = matchFn('LOG10')) !== null) { return fmtNum(Math.log10(resolveNum(splitArgs(inner)[0]))); }
    if ((inner = matchFn('EXP')) !== null) { return fmtNum(Math.exp(resolveNum(splitArgs(inner)[0]))); }
    if (exprUp === 'HOY()' || exprUp === 'TODAY()') return new Date().toLocaleDateString('es-CR');
    if (exprUp === 'AHORA()' || exprUp === 'NOW()') return new Date().toLocaleString('es-CR');
    if ((inner = matchFn('DIA(?!S)|DAY')) !== null) { var dd = new Date(String(resolveArg(splitArgs(inner)[0]))); return isNaN(dd.getTime()) ? '#VALOR!' : String(dd.getDate()); }
    if ((inner = matchFn('MES|MONTH')) !== null) { var dm = new Date(String(resolveArg(splitArgs(inner)[0]))); return isNaN(dm.getTime()) ? '#VALOR!' : String(dm.getMonth() + 1); }
    if ((inner = matchFn('AÑO|YEAR')) !== null) { var dy = new Date(String(resolveArg(splitArgs(inner)[0]))); return isNaN(dy.getTime()) ? '#VALOR!' : String(dy.getFullYear()); }
    if ((inner = matchFn('DIAS|DAYS')) !== null) { args = splitArgs(inner); var d1D = new Date(String(resolveArg(args[0]))); var d2D = new Date(String(resolveArg(args[1]))); return String(Math.round((d1D - d2D) / 86400000)); }
    if ((inner = matchFn('DIASEM|WEEKDAY')) !== null) { var dw = new Date(String(resolveArg(splitArgs(inner)[0]))); return String(dw.getDay() + 1); }
    if ((inner = matchFn('FIN\\\\.MES|EOMONTH')) !== null) { args = splitArgs(inner); var dE = new Date(String(resolveArg(args[0]))); var mE = dE.getMonth() + 1 + parseInt(resolveNum(args[1])); return new Date(dE.getFullYear(), mE, 0).toLocaleDateString('es-CR'); }
    if ((inner = matchFn('SIFECHA|DATEDIF')) !== null) {
      args = splitArgs(inner);
      var d1 = new Date(String(resolveArg(args[0]))), d2 = new Date(String(resolveArg(args[1])));
      var unit = String(resolveArg(args[2])).toUpperCase();
      var diff = d2 - d1;
      if (unit === 'Y') return String(Math.floor(diff / (365.25 * 86400000)));
      if (unit === 'M') return String(Math.floor(diff / (30.44 * 86400000)));
      return String(Math.floor(diff / 86400000));
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
    if ((inner = matchFn('ELEGIR|CHOOSE')) !== null) { args = splitArgs(inner); var idxE = parseInt(resolveNum(args[0])); return args[idxE] ? String(resolveArg(args[idxE])) : '#VALOR!'; }
    if ((inner = matchFn('FILA|ROW')) !== null) { var rf = splitArgs(inner)[0]; if (rf) { var mF = rf.match(/\\d+/); return mF ? mF[0] : ''; } return ''; }
    if ((inner = matchFn('COLUMNA|COLUMN')) !== null) { var rc = splitArgs(inner)[0]; if (rc) { var lm = rc.match(/[A-Za-z]+/); return lm ? String(colIndex(lm[0]) + 1) : ''; } return ''; }
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
    if ((inner = matchFn('VNA|NPV')) !== null) {
      args = splitArgs(inner); var r6 = resolveNum(args[0]); var npv = 0;
      for (var i5 = 1; i5 < args.length; i5++) { var fv2 = resolveNum(args[i5]); npv += fv2 / Math.pow(1 + r6, i5); }
      return fmtNum(npv);
    }
    if ((inner = matchFn('NPER')) !== null) {
      args = splitArgs(inner); var r9 = resolveNum(args[0]), pmt4 = resolveNum(args[1]), pv4 = resolveNum(args[2]);
      if (r9 === 0) return fmtNum(-pv4 / pmt4);
      return fmtNum(Math.log(-pmt4 / (pmt4 + r9 * pv4)) / Math.log(1 + r9));
    }
    if ((inner = matchFn('SLN')) !== null) { args = splitArgs(inner); return fmtNum((resolveNum(args[0]) - resolveNum(args[1])) / resolveNum(args[2])); }
    if ((inner = matchFn('IVA')) !== null) {
      args = splitArgs(inner);
      var base = isRange(args[0]) ? rangeNums(args[0]).reduce(function (a, b) { return a + b; }, 0) : resolveNum(args[0]);
      var rate = args[1] ? resolveNum(args[1]) : 0.13;
      return fmtNum(base * rate);
    }
    if ((inner = matchFn('MONTO\\\\.SIN\\\\.IVA|BASE\\\\.IVA')) !== null) {
      args = splitArgs(inner);
      var monto = resolveNum(args[0]), rateI = args[1] ? resolveNum(args[1]) : 0.13;
      return fmtNum(monto / (1 + rateI));
    }
    if ((inner = matchFn('PLANILLA\\\\.CCSS|CARGAS\\\\.SOCIALES')) !== null) {
      args = splitArgs(inner);
      var salario = resolveNum(args[0]);
      var tipo = args[1] ? String(resolveArg(args[1])).toLowerCase() : 'total';
      var patronal = 0.2683, obrero = 0.1083;
      if (tipo === 'patronal') return fmtNum(salario * patronal);
      if (tipo === 'obrero') return fmtNum(salario * obrero);
      return fmtNum(salario * (patronal + obrero));
    }
    if ((inner = matchFn('AGUINALDO')) !== null) {
      args = splitArgs(inner);
      var salario2 = resolveNum(args[0]);
      var meses = args[1] ? resolveNum(args[1]) : 12;
      return fmtNum(salario2 * meses / 12);
    }
    if ((inner = matchFn('PREAVISO')) !== null) {
      args = splitArgs(inner);
      var salario3 = resolveNum(args[0]), anios = resolveNum(args[1]);
      if (anios < 0.25) return '0';
      if (anios < 0.5) return fmtNum(salario3 / 30 * 7);
      if (anios < 1) return fmtNum(salario3 / 30 * 15);
      return fmtNum(salario3);
    }
    if ((inner = matchFn('CESANTIA')) !== null) {
      args = splitArgs(inner);
      var salario4 = resolveNum(args[0]), anios2 = resolveNum(args[1]);
      if (anios2 < 0.25) return '0';
      if (anios2 < 0.5) return fmtNum(salario4 / 30 * 7);
      if (anios2 < 1) return fmtNum(salario4 / 30 * 14);
      var tabla = [19.5, 20, 20.5, 21, 21.24, 21.5, 22, 22];
      var completos = Math.min(Math.floor(anios2), 8);
      var dias = 0;
      for (var ic = 0; ic < completos; ic++) dias += tabla[ic];
      return fmtNum(salario4 / 30 * dias);
    }
    if ((inner = matchFn('RENTA\\\\.TRABAJO|IMPUESTO\\\\.RENTA')) !== null) {
      var ingreso = resolveNum(splitArgs(inner)[0]);
      if (ingreso <= 918000) return fmtNum(0);
      if (ingreso <= 1347000) return fmtNum((ingreso - 918000) * 0.10);
      if (ingreso <= 2364000) return fmtNum(42900 + (ingreso - 1347000) * 0.15);
      if (ingreso <= 4727000) return fmtNum(195450 + (ingreso - 2364000) * 0.20);
      return fmtNum(668050 + (ingreso - 4727000) * 0.25);
    }
    if ((inner = matchFn('IMPUESTO\\\\.D101|D101')) !== null) {
      args = splitArgs(inner);
      var rentaNetaD101 = resolveNum(args[0]);
      var tipoD101 = args[1] ? String(resolveArg(args[1])).toUpperCase() : 'PF';
      var tramosD101;
      if (tipoD101 === 'PF' || tipoD101 === 'PERSONA_FISICA') {
        tramosD101 = [
          { hasta: 4181000, tasa: 0 },
          { hasta: 6244000, tasa: 0.10 },
          { hasta: 10412000, tasa: 0.15 },
          { hasta: 20865000, tasa: 0.20 },
          { hasta: Infinity, tasa: 0.25 }
        ];
      } else if (tipoD101 === 'PYME') {
        tramosD101 = [
          { hasta: 5644000, tasa: 0 },
          { hasta: 8436000, tasa: 0.05 },
          { hasta: 14066000, tasa: 0.10 },
          { hasta: 21185000, tasa: 0.15 },
          { hasta: Infinity, tasa: 0.20 }
        ];
      } else {
        return fmtNum(Math.max(0, rentaNetaD101) * 0.30);
      }
      var impuestoD101 = 0, anteriorD101 = 0;
      for (var itd = 0; itd < tramosD101.length; itd++) {
        var tramoD = tramosD101[itd];
        if (rentaNetaD101 <= anteriorD101) break;
        var enEsteTramoD = Math.min(rentaNetaD101, tramoD.hasta) - anteriorD101;
        if (enEsteTramoD > 0) impuestoD101 += enEsteTramoD * tramoD.tasa;
        anteriorD101 = tramoD.hasta;
      }
      return fmtNum(impuestoD101);
    }

    // ══════════════════════════════════════════════
    // AMPLIACIÓN v7 — ~416 fórmulas adicionales portadas
    // de Matriz Contable CR web (~490 fórmulas totales)
    // ══════════════════════════════════════════════
if ((inner = matchFn('SUMA|SUM')) !== null) {
      args = splitArgs(inner); var s = 0;
      args.forEach(function(a) { if (isRange(a)) rangeNums(a).forEach(function(n) { s += n; }); else s += resolveNum(a); });
      return fmtNum(s);
    }
if ((inner = matchFn('PROMEDIO|AVERAGE')) !== null) {
      args = splitArgs(inner); var tot = 0, cnt = 0;
      args.forEach(function(a) { if (isRange(a)) rangeNums(a).forEach(function(n) { tot += n; cnt++; }); else { tot += resolveNum(a); cnt++; } });
      return cnt ? fmtNum(tot / cnt) : '#DIV/0!';
    }
if ((inner = matchFn('MAX|MAXIMO')) !== null) {
      args = splitArgs(inner); nums = [];
      args.forEach(function(a) { if (isRange(a)) rangeNums(a).forEach(function(n) { nums.push(n); }); else nums.push(resolveNum(a)); });
      return nums.length ? fmtNum(Math.max.apply(null, nums)) : '0';
    }
if ((inner = matchFn('MIN|MINIMO')) !== null) {
      args = splitArgs(inner); nums = [];
      args.forEach(function(a) { if (isRange(a)) rangeNums(a).forEach(function(n) { nums.push(n); }); else nums.push(resolveNum(a)); });
      return nums.length ? fmtNum(Math.min.apply(null, nums)) : '0';
    }
if ((inner = matchFn('CONTAR|COUNT')) !== null) {
      args = splitArgs(inner); var c2 = 0;
      args.forEach(function(a) { if (isRange(a)) rangeNums(a).forEach(function(n) { if (!isNaN(n)) c2++; }); });
      return String(c2);
    }
if ((inner = matchFn('CONTARA|COUNTA')) !== null) {
      args = splitArgs(inner); var ca = 0;
      args.forEach(function(a) { if (isRange(a)) rangeVals(a).forEach(function(v) { if (v !== '') ca++; }); });
      return String(ca);
    }
if ((inner = matchFn('CONTAR\\.BLANCO|COUNTBLANK')) !== null) {
      args = splitArgs(inner); var cb = 0;
      args.forEach(function(a) { if (isRange(a)) rangeVals(a).forEach(function(v) { if (v === '') cb++; }); });
      return String(cb);
    }
if ((inner = matchFn('ABS')) !== null) { return fmtNum(Math.abs(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('ENTERO|INT')) !== null) { return fmtNum(Math.floor(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('TRUNCAR|TRUNC')) !== null) { args = splitArgs(inner); var decimals = args[1] ? parseInt(args[1]) : 0; var n2 = resolveNum(args[0]); return fmtNum(Math.trunc(n2 * Math.pow(10, decimals)) / Math.pow(10, decimals)); }
if ((inner = matchFn('REDONDEAR|ROUND')) !== null) { args = splitArgs(inner); return fmtNum(parseFloat(resolveNum(args[0]).toFixed(parseInt(resolveNum(args[1]))))); }
if ((inner = matchFn('REDONDEAR\\.MAS|ROUNDUP')) !== null) { args = splitArgs(inner); var d3 = parseInt(resolveNum(args[1])); var p = Math.pow(10, d3); return fmtNum(Math.ceil(resolveNum(args[0]) * p) / p); }
if ((inner = matchFn('REDONDEAR\\.MENOS|ROUNDDOWN')) !== null) { args = splitArgs(inner); var d4 = parseInt(resolveNum(args[1])); var p2 = Math.pow(10, d4); return fmtNum(Math.floor(resolveNum(args[0]) * p2) / p2); }
if ((inner = matchFn('RESIDUO|MOD')) !== null) { args = splitArgs(inner); var a2 = resolveNum(args[0]), b2 = resolveNum(args[1]); return fmtNum(a2 - Math.floor(a2 / b2) * b2); }
if ((inner = matchFn('POTENCIA|POWER')) !== null) { args = splitArgs(inner); return fmtNum(Math.pow(resolveNum(args[0]), resolveNum(args[1]))); }
if ((inner = matchFn('RAIZ|SQRT')) !== null) { return fmtNum(Math.sqrt(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('LN')) !== null) { return fmtNum(Math.log(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('LOG10')) !== null) { return fmtNum(Math.log10(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('LOG')) !== null) { args = splitArgs(inner); var base = args[1] ? resolveNum(args[1]) : 10; return fmtNum(Math.log(resolveNum(args[0])) / Math.log(base)); }
if ((inner = matchFn('EXP')) !== null) { return fmtNum(Math.exp(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('PI')) !== null) { return fmtNum(Math.PI); }
if ((inner = matchFn('FACT')) !== null) { var fn2 = resolveNum(splitArgs(inner)[0]); var f2 = 1; for (var i3 = 2; i3 <= fn2; i3++) f2 *= i3; return fmtNum(f2); }
if ((inner = matchFn('SIGNO|SIGN')) !== null) { var sv = resolveNum(splitArgs(inner)[0]); return String(sv > 0 ? 1 : sv < 0 ? -1 : 0); }
if ((inner = matchFn('COCIENTE|QUOTIENT')) !== null) { args = splitArgs(inner); return fmtNum(Math.trunc(resolveNum(args[0]) / resolveNum(args[1]))); }
if ((inner = matchFn('COMBINAT|COMBIN')) !== null) { args = splitArgs(inner); var nn = resolveNum(args[0]), kk = resolveNum(args[1]); var r2 = 1; for (var i4 = 0; i4 < kk; i4++) r2 = r2 * (nn - i4) / (i4 + 1); return fmtNum(Math.round(r2)); }
if ((inner = matchFn('SUMAPRODUCTO|SUMPRODUCT')) !== null) {
      args = splitArgs(inner);
      if (args.length === 1 && isRange(args[0])) { return fmtNum(rangeNums(args[0]).reduce(function(a, b) { return a + b; }, 0)); }
      if (args.length >= 2 && isRange(args[0]) && isRange(args[1])) {
        var n1 = rangeNums(args[0]), n3 = rangeNums(args[1]); var sp = 0;
        for (var i5 = 0; i5 < Math.min(n1.length, n3.length); i5++) sp += n1[i5] * n3[i5];
        return fmtNum(sp);
      }
    }
if ((inner = matchFn('SUBTOTALES|SUBTOTAL')) !== null) {
      args = splitArgs(inner); var fnNum = parseInt(resolveNum(args[0]));
      if (args[1] && isRange(args[1])) {
        nums = rangeNums(args[1]);
        if (fnNum === 9 || fnNum === 109) return fmtNum(nums.reduce(function(a,b){return a+b;},0));
        if (fnNum === 1 || fnNum === 101) return fmtNum(nums.reduce(function(a,b){return a+b;},0)/nums.length);
        if (fnNum === 4 || fnNum === 104) return fmtNum(Math.max.apply(null,nums));
        if (fnNum === 5 || fnNum === 105) return fmtNum(Math.min.apply(null,nums));
        if (fnNum === 2 || fnNum === 102) return String(nums.filter(function(n){return !isNaN(n);}).length);
      }
    }
if ((inner = matchFn('CONTAR\\.SI\\.CONJUNTO|COUNTIFS')) !== null) {
      args = splitArgs(inner); var count3 = 0;
      var rng1 = args[0], crit1 = args[1] ? String(resolveArg(args[1])) : '';
      if (isRange(rng1)) {
        rangeVals(rng1).forEach(function(v, i6) {
          if (matchCrit(v, crit1)) count3++;
        });
      }
      return String(count3);
    }
if ((inner = matchFn('CONTAR\\.SI|COUNTIF')) !== null) {
      args = splitArgs(inner); var count4 = 0;
      var rng2 = args[0], crit2 = String(resolveArg(args[1] || ''));
      if (isRange(rng2)) rangeVals(rng2).forEach(function(v) { if (matchCrit(v, crit2)) count4++; });
      return String(count4);
    }
if ((inner = matchFn('SUMAR\\.SI\\.CONJUNTO|SUMIFS')) !== null) {
      args = splitArgs(inner); var sumR = isRange(args[0]) ? rangeNums(args[0]) : [];
      var sumCrit = isRange(args[1]) ? rangeVals(args[1]) : [];
      var critVal = String(resolveArg(args[2] || ''));
      var s3 = 0;
      sumCrit.forEach(function(v, i7) { if (matchCrit(v, critVal)) s3 += sumR[i7] || 0; });
      return fmtNum(s3);
    }
if ((inner = matchFn('SUMAR\\.SI|SUMIF')) !== null) {
      args = splitArgs(inner);
      var critRng = isRange(args[0]) ? rangeVals(args[0]) : [];
      var crit3 = String(resolveArg(args[1] || ''));
      var sumRng = args[2] ? (isRange(args[2]) ? rangeNums(args[2]) : []) : critRng.map(function(v){return toNum(v);});
      var s4 = 0;
      critRng.forEach(function(v, i8) { if (matchCrit(v, crit3)) s4 += sumRng[i8] || 0; });
      return fmtNum(s4);
    }
if ((inner = matchFn('PROMEDIO\\.SI|AVERAGEIF')) !== null) {
      args = splitArgs(inner);
      var critRng2 = isRange(args[0]) ? rangeVals(args[0]) : [];
      var crit4 = String(resolveArg(args[1] || ''));
      var avgRng = args[2] ? (isRange(args[2]) ? rangeNums(args[2]) : []) : critRng2.map(function(v){return toNum(v);});
      var t2 = 0, cnt2 = 0;
      critRng2.forEach(function(v, i9) { if (matchCrit(v, crit4)) { t2 += avgRng[i9] || 0; cnt2++; } });
      return cnt2 ? fmtNum(t2 / cnt2) : '#DIV/0!';
    }
if ((inner = matchFn('MAX\\.SI\\.CONJUNTO|MAXIFS')) !== null) {
      args = splitArgs(inner);
      var maxRng = isRange(args[0]) ? rangeNums(args[0]) : [];
      var maxCritRng = isRange(args[1]) ? rangeVals(args[1]) : [];
      var maxCrit = String(resolveArg(args[2] || ''));
      var maxVals = [];
      maxCritRng.forEach(function(v, i){ if (matchCrit(v, maxCrit)) maxVals.push(maxRng[i] || 0); });
      return maxVals.length ? fmtNum(Math.max.apply(null, maxVals)) : '0';
    }
if ((inner = matchFn('MIN\\.SI\\.CONJUNTO|MINIFS')) !== null) {
      args = splitArgs(inner);
      var minRng = isRange(args[0]) ? rangeNums(args[0]) : [];
      var minCritRng = isRange(args[1]) ? rangeVals(args[1]) : [];
      var minCrit = String(resolveArg(args[2] || ''));
      var minVals = [];
      minCritRng.forEach(function(v, i){ if (matchCrit(v, minCrit)) minVals.push(minRng[i] || 0); });
      return minVals.length ? fmtNum(Math.min.apply(null, minVals)) : '0';
    }
if ((inner = matchFn('DESVEST\\.M|DESVEST|STDEV\\.S')) !== null) {
      args = splitArgs(inner); nums = isRange(args[0]) ? rangeNums(args[0]) : args.map(resolveNum);
      var mean = nums.reduce(function(a,b){return a+b;},0)/nums.length;
      var variance = nums.reduce(function(s,n){return s+(n-mean)*(n-mean);},0)/(nums.length-1);
      return fmtNum(Math.sqrt(variance));
    }
if ((inner = matchFn('DESVEST\\.P|DESVESTP|STDEV\\.P')) !== null) {
      args = splitArgs(inner); nums = isRange(args[0]) ? rangeNums(args[0]) : args.map(resolveNum);
      var mean2 = nums.reduce(function(a,b){return a+b;},0)/nums.length;
      var var2 = nums.reduce(function(s,n){return s+(n-mean2)*(n-mean2);},0)/nums.length;
      return fmtNum(Math.sqrt(var2));
    }
if ((inner = matchFn('MEDIANA|MEDIAN')) !== null) {
      args = splitArgs(inner); nums = isRange(args[0]) ? rangeNums(args[0]) : args.map(resolveNum);
      nums.sort(function(a,b){return a-b;}); var mid = Math.floor(nums.length/2);
      return fmtNum(nums.length%2 ? nums[mid] : (nums[mid-1]+nums[mid])/2);
    }
if ((inner = matchFn('K\\.ESIMO\\.MAYOR|LARGE')) !== null) {
      args = splitArgs(inner); nums = isRange(args[0]) ? rangeNums(args[0]) : [resolveNum(args[0])];
      nums.sort(function(a,b){return b-a;}); return fmtNum(nums[resolveNum(args[1])-1]);
    }
if ((inner = matchFn('K\\.ESIMO\\.MENOR|SMALL')) !== null) {
      args = splitArgs(inner); nums = isRange(args[0]) ? rangeNums(args[0]) : [resolveNum(args[0])];
      nums.sort(function(a,b){return a-b;}); return fmtNum(nums[resolveNum(args[1])-1]);
    }
if ((inner = matchFn('COEF\\.DE\\.CORREL|CORREL|PEARSON')) !== null) {
      args = splitArgs(inner);
      var x = isRange(args[0]) ? rangeNums(args[0]) : [], y = isRange(args[1]) ? rangeNums(args[1]) : [];
      var n = Math.min(x.length, y.length), mx = x.reduce(function(a,b){return a+b;},0)/n, my = y.reduce(function(a,b){return a+b;},0)/n;
      var num = 0, dx = 0, dy = 0;
      for (var i = 0; i < n; i++) { num += (x[i]-mx)*(y[i]-my); dx += (x[i]-mx)*(x[i]-mx); dy += (y[i]-my)*(y[i]-my); }
      return fmtNum(num / Math.sqrt(dx * dy));
    }
if ((inner = matchFn('SI\\.CONJUNTO|IFS')) !== null) {
      args = splitArgs(inner);
      for (var i10 = 0; i10 < args.length - 1; i10 += 2) {
        if (evalCond(args[i10])) return String(resolveArg(args[i10+1]));
      }
      return args.length % 2 === 1 ? String(resolveArg(args[args.length-1])) : '#N/A';
    }
if ((inner = matchFn('SI\\.ERROR|IFERROR')) !== null) {
      args = splitArgs(inner);
      try { var v2 = resolveArg(args[0]); if (String(v2).startsWith('#')) return String(resolveArg(args[1])); return String(v2); }
      catch(e2) { return String(resolveArg(args[1])); }
    }
if ((inner = matchFn('SI\\.ND|IFNA')) !== null) {
      args = splitArgs(inner);
      try { var v3 = resolveArg(args[0]); if (String(v3) === '#N/A') return String(resolveArg(args[1])); return String(v3); }
      catch(e3) { return String(resolveArg(args[1])); }
    }
if ((inner = matchFn('SI|IF')) !== null) {
      args = splitArgs(inner);
      return evalCond(args[0]) ? String(resolveArg(args[1] || '')) : String(resolveArg(args[2] || ''));
    }
if ((inner = matchFn('Y|AND')) !== null) {
      args = splitArgs(inner); return args.every(function(a) { return evalCond(a); }) ? 'VERDADERO' : 'FALSO';
    }
if ((inner = matchFn('O|OR')) !== null) {
      args = splitArgs(inner); return args.some(function(a) { return evalCond(a); }) ? 'VERDADERO' : 'FALSO';
    }
if ((inner = matchFn('NO|NOT')) !== null) {
      return evalCond(splitArgs(inner)[0]) ? 'FALSO' : 'VERDADERO';
    }
if ((inner = matchFn('CAMBIAR|SWITCH')) !== null) {
      args = splitArgs(inner); var sw = String(resolveArg(args[0]));
      for (var i11 = 1; i11 < args.length - 1; i11 += 2) {
        if (String(resolveArg(args[i11])) === sw) return String(resolveArg(args[i11+1]));
      }
      return args.length % 2 === 0 ? String(resolveArg(args[args.length-1])) : '';
    }
if ((inner = matchFn('CONCATENAR|CONCATENATE|CONCAT')) !== null) {
      return splitArgs(inner).map(function(a) { return isRange(a) ? rangeVals(a).join('') : String(resolveArg(a)); }).join('');
    }
if ((inner = matchFn('UNIRCADENAS|TEXTJOIN')) !== null) {
      args = splitArgs(inner); var delim = String(resolveArg(args[0])); var ignoreEmpty = String(resolveArg(args[1])).toUpperCase() !== 'FALSO';
      var parts = [];
      for (var i12 = 2; i12 < args.length; i12++) {
        var vt = isRange(args[i12]) ? rangeVals(args[i12]) : [String(resolveArg(args[i12]))];
        vt.forEach(function(v) { if (!ignoreEmpty || v !== '') parts.push(v); });
      }
      return parts.join(delim);
    }
if ((inner = matchFn('MAYUSC|UPPER')) !== null) { return String(resolveArg(splitArgs(inner)[0])).toUpperCase(); }
if ((inner = matchFn('MINUSC|LOWER')) !== null) { return String(resolveArg(splitArgs(inner)[0])).toLowerCase(); }
if ((inner = matchFn('NOMPROPIO|PROPER')) !== null) { return String(resolveArg(splitArgs(inner)[0])).replace(/\\w\\S*/g, function(w){return w.charAt(0).toUpperCase()+w.substr(1).toLowerCase();}); }
if ((inner = matchFn('LARGO|LEN')) !== null) { return String(String(resolveArg(splitArgs(inner)[0])).length); }
if ((inner = matchFn('IZQUIERDA|LEFT')) !== null) { args = splitArgs(inner); var s2 = String(resolveArg(args[0])); return s2.substring(0, args[1] ? parseInt(resolveNum(args[1])) : 1); }
if ((inner = matchFn('DERECHA|RIGHT')) !== null) { args = splitArgs(inner); var s3 = String(resolveArg(args[0])); var n4 = args[1] ? parseInt(resolveNum(args[1])) : 1; return s3.substring(s3.length - n4); }
if ((inner = matchFn('EXTRAE|MID')) !== null) { args = splitArgs(inner); return String(resolveArg(args[0])).substring(parseInt(resolveNum(args[1]))-1, parseInt(resolveNum(args[1]))-1+parseInt(resolveNum(args[2]))); }
if ((inner = matchFn('ENCONTRAR|FIND')) !== null) { args = splitArgs(inner); var pos = String(resolveArg(args[1])).indexOf(String(resolveArg(args[0]))); return pos >= 0 ? String(pos+1) : '#VALOR!'; }
if ((inner = matchFn('HALLAR|SEARCH')) !== null) { args = splitArgs(inner); var pos2 = String(resolveArg(args[1])).toLowerCase().indexOf(String(resolveArg(args[0])).toLowerCase()); return pos2 >= 0 ? String(pos2+1) : '#VALOR!'; }
if ((inner = matchFn('SUSTITUIR|SUBSTITUTE')) !== null) { args = splitArgs(inner); return String(resolveArg(args[0])).split(String(resolveArg(args[1]))).join(String(resolveArg(args[2]))); }
if ((inner = matchFn('REEMPLAZAR|REPLACE')) !== null) { args = splitArgs(inner); var orig = String(resolveArg(args[0])); var start4 = parseInt(resolveNum(args[1]))-1; var len4 = parseInt(resolveNum(args[2])); return orig.substring(0,start4)+String(resolveArg(args[3]))+orig.substring(start4+len4); }
if ((inner = matchFn('ESPACIOS|TRIM')) !== null) { return String(resolveArg(splitArgs(inner)[0])).replace(/\\s+/g,' ').trim(); }
if ((inner = matchFn('REPETIR|REPT')) !== null) { args = splitArgs(inner); return String(resolveArg(args[0])).repeat(parseInt(resolveNum(args[1]))); }
if ((inner = matchFn('VALOR|VALUE')) !== null) { return fmtNum(parseFloat(String(resolveArg(splitArgs(inner)[0])).replace(/[₡,\\s]/g,''))); }
if ((inner = matchFn('MONEDA|DOLLAR')) !== null) { args = splitArgs(inner); var d5 = args[1] ? parseInt(resolveNum(args[1])) : 2; return '₡'+resolveNum(args[0]).toLocaleString('es-CR',{minimumFractionDigits:d5,maximumFractionDigits:d5}); }
if ((inner = matchFn('TEXTO|TEXT')) !== null) {
      args = splitArgs(inner); var n5 = resolveNum(args[0]); var fmt4 = String(resolveArg(args[1]));
      if (fmt4.includes('dd') || fmt4.includes('mm') || fmt4.includes('aaaa')) {
        var d6 = new Date(n5); if (isNaN(d6.getTime())) return String(n5);
        return fmt4.replace('dd',String(d6.getDate()).padStart(2,'0')).replace('mm',String(d6.getMonth()+1).padStart(2,'0')).replace('aaaa',d6.getFullYear());
      }
      if (fmt4.includes('#,##0')) return n5.toLocaleString('es-CR',{minimumFractionDigits:fmt4.includes('.00')?2:0});
      return String(n5);
    }
if ((inner = matchFn('IGUAL|EXACT')) !== null) { args = splitArgs(inner); return String(resolveArg(args[0])) === String(resolveArg(args[1])) ? 'VERDADERO' : 'FALSO'; }
if ((inner = matchFn('FECHA|DATE')) !== null) {
      args = splitArgs(inner); var d7 = new Date(resolveNum(args[0]),resolveNum(args[1])-1,resolveNum(args[2]));
      return d7.toLocaleDateString('es-CR');
    }
if ((inner = matchFn('AÑO|YEAR')) !== null) { var d8 = new Date(String(resolveArg(splitArgs(inner)[0]))); return isNaN(d8.getTime()) ? '#VALOR!' : String(d8.getFullYear()); }
if ((inner = matchFn('MES|MONTH')) !== null) { var d9 = new Date(String(resolveArg(splitArgs(inner)[0]))); return isNaN(d9.getTime()) ? '#VALOR!' : String(d9.getMonth()+1); }
if ((inner = matchFn('DIA(?!\\.LAB)|DAY')) !== null) { var d10 = new Date(String(resolveArg(splitArgs(inner)[0]))); return isNaN(d10.getTime()) ? '#VALOR!' : String(d10.getDate()); }
if ((inner = matchFn('DIAS(?!\\.|LAB)|DAYS')) !== null) {
      args = splitArgs(inner); var d11 = new Date(String(resolveArg(args[0]))); var d12 = new Date(String(resolveArg(args[1])));
      return String(Math.round((d11 - d12) / 86400000));
    }
if ((inner = matchFn('FIN\\.MES|EOMONTH')) !== null) {
      args = splitArgs(inner); var d13 = new Date(String(resolveArg(args[0]))); var m2 = d13.getMonth() + 1 + parseInt(resolveNum(args[1]));
      return new Date(d13.getFullYear(), m2, 0).toLocaleDateString('es-CR');
    }
if ((inner = matchFn('SIFECHA|DATEDIF')) !== null) {
      args = splitArgs(inner); var d14 = new Date(String(resolveArg(args[0]))), d15 = new Date(String(resolveArg(args[1]))); var unit = String(resolveArg(args[2])).toUpperCase();
      var diff = d15 - d14;
      if (unit === 'Y') return String(Math.floor(diff / (365.25 * 86400000)));
      if (unit === 'M') return String(Math.floor(diff / (30.44 * 86400000)));
      if (unit === 'D') return String(Math.floor(diff / 86400000));
      return String(Math.floor(diff / 86400000));
    }
if ((inner = matchFn('HORA|HOUR')) !== null) { var d16 = new Date(); return String(d16.getHours()); }
if ((inner = matchFn('MINUTO|MINUTE')) !== null) { var d17 = new Date(); return String(d17.getMinutes()); }
if ((inner = matchFn('IVA')) !== null) {
      args = splitArgs(inner); var base = isRange(args[0]) ? rangeNums(args[0]).reduce(function(a,b){return a+b;},0) : resolveNum(args[0]);
      var rate = args[1] ? resolveNum(args[1]) : 0.13;
      return fmtNum(base * rate);
    }
if ((inner = matchFn('PAGO|PMT')) !== null) {
      args = splitArgs(inner); var r3 = resolveNum(args[0]), n6 = resolveNum(args[1]), pv = resolveNum(args[2]);
      if (r3 === 0) return fmtNum(-pv/n6);
      return fmtNum(r3*pv / (1-Math.pow(1+r3,-n6)));
    }
if ((inner = matchFn('VA|PV')) !== null) {
      args = splitArgs(inner); var r4 = resolveNum(args[0]), n7 = resolveNum(args[1]), pmt = resolveNum(args[2]);
      if (r4 === 0) return fmtNum(-pmt*n7);
      return fmtNum(-pmt*(1-Math.pow(1+r4,-n7))/r4);
    }
if ((inner = matchFn('VF|FV')) !== null) {
      args = splitArgs(inner); var r5 = resolveNum(args[0]), n8 = resolveNum(args[1]), pmt2 = resolveNum(args[2]);
      var pv2 = args[3] ? resolveNum(args[3]) : 0;
      return fmtNum(-pv2*Math.pow(1+r5,n8) - pmt2*(Math.pow(1+r5,n8)-1)/r5);
    }
if ((inner = matchFn('VNA|NPV')) !== null) {
      args = splitArgs(inner); var r6 = resolveNum(args[0]); var npv = 0;
      for (var i13 = 1; i13 < args.length; i13++) {
        var flvs = isRange(args[i13]) ? rangeNums(args[i13]) : [resolveNum(args[i13])];
        flvs.forEach(function(fv2, j) { npv += fv2 / Math.pow(1+r6, i13-1+j+1); });
      }
      return fmtNum(npv);
    }
if ((inner = matchFn('TIR|IRR')) !== null) {
      args = splitArgs(inner); var flows = isRange(args[0]) ? rangeNums(args[0]) : [];
      var guess = args[1] ? resolveNum(args[1]) : 0.1; var rate7 = guess;
      for (var iter = 0; iter < 100; iter++) {
        var npv2 = 0, dnpv = 0;
        flows.forEach(function(fv3, t) { npv2 += fv3/Math.pow(1+rate7,t); dnpv -= t*fv3/Math.pow(1+rate7,t+1); });
        var newRate = rate7 - npv2/dnpv;
        if (Math.abs(newRate - rate7) < 1e-10) break;
        rate7 = newRate;
      }
      return fmtNum(rate7);
    }
if ((inner = matchFn('TASA|RATE')) !== null) {
      args = splitArgs(inner); var n9 = resolveNum(args[0]), pmt3 = resolveNum(args[1]), pv3 = resolveNum(args[2]);
      var r8 = 0.1;
      for (var iter2 = 0; iter2 < 100; iter2++) {
        var f3 = pv3*Math.pow(1+r8,n9)+pmt3*(Math.pow(1+r8,n9)-1)/r8;
        var df = n9*pv3*Math.pow(1+r8,n9-1)+pmt3*(n9*Math.pow(1+r8,n9-1)*r8-(Math.pow(1+r8,n9)-1))/(r8*r8);
        var nr = r8 - f3/df;
        if (Math.abs(nr - r8) < 1e-10) break;
        r8 = nr;
      }
      return fmtNum(r8);
    }
if ((inner = matchFn('NPER')) !== null) {
      args = splitArgs(inner); var r9 = resolveNum(args[0]), pmt4 = resolveNum(args[1]), pv4 = resolveNum(args[2]);
      if (r9 === 0) return fmtNum(-pv4/pmt4);
      return fmtNum(Math.log(-pmt4/(pmt4+r9*pv4))/Math.log(1+r9));
    }
if ((inner = matchFn('INT\\.EFECTIVO|EFFECT')) !== null) {
      args = splitArgs(inner); var nom = resolveNum(args[0]), m3 = resolveNum(args[1]);
      return fmtNum(Math.pow(1+nom/m3,m3)-1);
    }
if ((inner = matchFn('TASA\\.NOMINAL|NOMINAL')) !== null) {
      args = splitArgs(inner); var eff = resolveNum(args[0]), m4 = resolveNum(args[1]);
      return fmtNum(m4*(Math.pow(1+eff,1/m4)-1));
    }
if ((inner = matchFn('SLN')) !== null) {
      args = splitArgs(inner); return fmtNum((resolveNum(args[0])-resolveNum(args[1]))/resolveNum(args[2]));
    }
if ((inner = matchFn('BUSCARV|VLOOKUP')) !== null) {
      args = splitArgs(inner); var sv2 = String(resolveArg(args[0])).toLowerCase();
      var rng3 = args[1]; var colN2 = parseInt(resolveNum(args[2])) - 1;
      if (isRange(rng3)) {
        var parts2 = rng3.trim().split(':');
        var fc3 = colIndex(parts2[0].match(/[A-Za-z]+/)[0].toUpperCase());
        var fr2 = parseInt(parts2[0].match(/\\d+/)[0]) - 1;
        var tr3 = parseInt(parts2[1].match(/\\d+/)[0]) - 1;
        for (var ri2 = fr2; ri2 <= tr3; ri2++) {
          if (String(computeValue(cellId(ri2, fc3))).toLowerCase() === sv2) {
            return String(computeValue(cellId(ri2, fc3 + colN2)));
          }
        }
      }
      return '#N/A';
    }
if ((inner = matchFn('BUSCARX|XLOOKUP')) !== null) {
      args = splitArgs(inner); var sv3 = String(resolveArg(args[0])).toLowerCase();
      var lookRng = args[1], retRng = args[2], notFound = args[3] ? String(resolveArg(args[3])) : '#N/A';
      if (isRange(lookRng) && isRange(retRng)) {
        var lookVals = rangeVals(lookRng), retVals = rangeVals(retRng);
        for (var i14 = 0; i14 < lookVals.length; i14++) {
          if (String(lookVals[i14]).toLowerCase() === sv3) return String(retVals[i14]);
        }
      }
      return notFound;
    }
if ((inner = matchFn('COINCIDIR|MATCH')) !== null) {
      args = splitArgs(inner); var sv4 = String(resolveArg(args[0])).toLowerCase();
      if (isRange(args[1])) {
        var matchVals = rangeVals(args[1]);
        for (var i15 = 0; i15 < matchVals.length; i15++) {
          if (String(matchVals[i15]).toLowerCase() === sv4) return String(i15 + 1);
        }
      }
      return '#N/A';
    }
if ((inner = matchFn('INDICE|INDEX')) !== null) {
      args = splitArgs(inner); var r10 = parseInt(resolveNum(args[1]))-1, c10 = parseInt(resolveNum(args[2] || '1'))-1;
      if (isRange(args[0])) {
        var p3 = args[0].trim().split(':');
        var fc4 = colIndex(p3[0].match(/[A-Za-z]+/)[0].toUpperCase());
        var fr3 = parseInt(p3[0].match(/\\d+/)[0]) - 1;
        return String(computeValue(cellId(fr3 + r10, fc4 + c10)));
      }
      return '#REF!';
    }
if ((inner = matchFn('DESREF|OFFSET')) !== null) {
      args = splitArgs(inner); var ref = args[0].trim();
      var dr = parseInt(resolveNum(args[1])), dc2 = parseInt(resolveNum(args[2]));
      if (/^[A-Za-z]+\\d+$/.test(ref)) {
        var rc = colIndex(ref.match(/[A-Za-z]+/)[0].toUpperCase());
        var rr = parseInt(ref.match(/\\d+/)[0]) - 1;
        return String(computeValue(cellId(rr + dr, rc + dc2)));
      }
      return '#REF!';
    }
if ((inner = matchFn('INDIRECTO|INDIRECT')) !== null) {
      var ref2 = String(resolveArg(splitArgs(inner)[0]));
      return String(computeValue(ref2));
    }
if ((inner = matchFn('ELEGIR|CHOOSE')) !== null) {
      args = splitArgs(inner); var idx2 = parseInt(resolveNum(args[0]));
      return args[idx2] ? String(resolveArg(args[idx2])) : '#VALOR!';
    }
if ((inner = matchFn('FILA|ROW')) !== null) { var rf = splitArgs(inner)[0]; if (!rf) return String(row+1); var m4 = rf.match(/\\d+/); return m4 ? m4[0] : String(row+1); }
if ((inner = matchFn('COLUMNA|COLUMN')) !== null) { var rc2 = splitArgs(inner)[0]; if (!rc2) return String(col+1); var lm = rc2.match(/[A-Za-z]+/); return lm ? String(colIndex(lm[0].toUpperCase())+1) : String(col+1); }
if ((inner = matchFn('FILAS|ROWS')) !== null) { if (isRange(inner)) { var p4=inner.split(':'); return String(parseInt(p4[1].match(/\\d+/)[0])-parseInt(p4[0].match(/\\d+/)[0])+1); } return '1'; }
if ((inner = matchFn('COLUMNAS|COLUMNS')) !== null) { if (isRange(inner)) { var p5=inner.split(':'); return String(colIndex(p5[1].match(/[A-Za-z]+/)[0].toUpperCase())-colIndex(p5[0].match(/[A-Za-z]+/)[0].toUpperCase())+1); } return '1'; }
if ((inner = matchFn('TRANSPONER|TRANSPOSE')) !== null) { return inner; }
if ((inner = matchFn('ESBLANCO|ISBLANK')) !== null) { var v4 = resolveArg(splitArgs(inner)[0]); return (v4===''||v4===null||v4===undefined)?'VERDADERO':'FALSO'; }
if ((inner = matchFn('ESNUMERO|ISNUMBER')) !== null) { var v5 = resolveArg(splitArgs(inner)[0]); return !isNaN(parseFloat(v5))?'VERDADERO':'FALSO'; }
if ((inner = matchFn('ESTEXTO|ISTEXT')) !== null) { var v6 = resolveArg(splitArgs(inner)[0]); return (isNaN(parseFloat(v6))&&typeof v6==='string'&&v6!=='')?'VERDADERO':'FALSO'; }
if ((inner = matchFn('ESERROR|ISERROR')) !== null) { try { var v7 = String(resolveArg(splitArgs(inner)[0])); return v7.startsWith('#')?'VERDADERO':'FALSO'; }catch(e4){return 'VERDADERO';} }
if ((inner = matchFn('ESFORMULA|ISFORMULA')) !== null) { var ref3 = splitArgs(inner)[0].trim(); return (getRaw(ref3)&&String(getRaw(ref3)).startsWith('='))?'VERDADERO':'FALSO'; }
if ((inner = matchFn('ES\\.PAR|ISEVEN')) !== null) { return resolveNum(splitArgs(inner)[0])%2===0?'VERDADERO':'FALSO'; }
if ((inner = matchFn('ES\\.IMPAR|ISODD')) !== null) { return Math.abs(resolveNum(splitArgs(inner)[0]))%2===1?'VERDADERO':'FALSO'; }
if ((inner = matchFn('N(?!OD|O\\b|PERS|PER)')) !== null) { var v8 = resolveArg(splitArgs(inner)[0]); return fmtNum(parseFloat(v8)||0); }
if ((inner = matchFn('BUSCARH|HLOOKUP')) !== null) {
      args = splitArgs(inner);
      var sv = String(resolveArg(args[0])).toLowerCase();
      var rng = args[1]; var rowN = parseInt(resolveNum(args[2])) - 1;
      if (isRange(rng)) {
        var p = rng.trim().split(':');
        var fc2 = colIndex(p[0].match(/[A-Za-z]+/)[0]);
        var fr2 = parseInt(p[0].match(/\\d+/)[0]) - 1;
        var tc2 = colIndex(p[1].match(/[A-Za-z]+/)[0]);
        for (var ci = fc2; ci <= tc2; ci++) {
          if (String(computeValue(cellId(fr2, ci))).toLowerCase() === sv)
            return String(computeValue(cellId(fr2 + rowN, ci)));
        }
      }
      return '#N/A';
    }
if ((inner = matchFn('FILTRAR|FILTER')) !== null) {
      args = splitArgs(inner);
      if (!isRange(args[0]) || !isRange(args[1])) return '#VALOR!';
      var dataVals = rangeVals(args[0]);
      var condVals = rangeVals(args[1]);
      var result = [];
      condVals.forEach(function(v, i) {
        if (v === 'VERDADERO' || v === true || (toNum(v) !== 0 && v !== '')) result.push(dataVals[i] || '');
      });
      return result.length ? result.join('; ') : (args[2] ? String(resolveArg(args[2])) : '#CALC!');
    }
if ((inner = matchFn('ORDENAR|SORT')) !== null) {
      args = splitArgs(inner);
      if (!isRange(args[0])) return '#VALOR!';
      var sortVals = rangeVals(args[0]);
      var order = args[2] ? parseInt(resolveNum(args[2])) : 1;
      var sorted = sortVals.slice().sort(function(a, b) {
        var an = toNum(a), bn = toNum(b);
        if (!isNaN(an) && !isNaN(bn)) return order >= 0 ? an-bn : bn-an;
        return order >= 0 ? String(a).localeCompare(String(b)) : String(b).localeCompare(String(a));
      });
      return sorted.join('; ');
    }
if ((inner = matchFn('UNICOS|UNIQUE')) !== null) {
      args = splitArgs(inner);
      if (!isRange(args[0])) return '#VALOR!';
      var seen = {}, uniq = [];
      rangeVals(args[0]).forEach(function(v) { if (v !== '' && !seen[v]) { seen[v]=true; uniq.push(v); } });
      return uniq.join('; ');
    }
if ((inner = matchFn('APILARV|VSTACK')) !== null) {
      args = splitArgs(inner);
      var allVals = [];
      args.forEach(function(a) { if (isRange(a)) rangeVals(a).forEach(function(v) { allVals.push(v); }); else allVals.push(String(resolveArg(a))); });
      return allVals.join('; ');
    }
if ((inner = matchFn('APILARH|HSTACK')) !== null) {
      args = splitArgs(inner);
      var hVals = [];
      args.forEach(function(a) { if (isRange(a)) rangeVals(a).forEach(function(v) { hVals.push(v); }); else hVals.push(String(resolveArg(a))); });
      return hVals.join(' | ');
    }
if ((inner = matchFn('SECUENCIA|SEQUENCE')) !== null) {
      args = splitArgs(inner);
      var rows2 = parseInt(resolveNum(args[0]));
      var cols2 = args[1] ? parseInt(resolveNum(args[1])) : 1;
      var start = args[2] ? resolveNum(args[2]) : 1;
      var step  = args[3] ? resolveNum(args[3]) : 1;
      var seq = [];
      for (var i = 0; i < rows2 * cols2; i++) seq.push(fmtNum(start + i * step));
      return seq.join('; ');
    }
if ((inner = matchFn('DIVIDIRTEXTO|TEXTSPLIT')) !== null) {
      args = splitArgs(inner);
      var txt = String(resolveArg(args[0]));
      var delim = String(resolveArg(args[1]));
      return txt.split(delim).join('; ');
    }
if ((inner = matchFn('TEXTOANTES|TEXTBEFORE')) !== null) {
      args = splitArgs(inner);
      var txt2 = String(resolveArg(args[0]));
      var delim2 = String(resolveArg(args[1]));
      var idx = txt2.indexOf(delim2);
      return idx >= 0 ? txt2.substring(0, idx) : '#N/A';
    }
if ((inner = matchFn('TEXTODESPUES|TEXTAFTER')) !== null) {
      args = splitArgs(inner);
      var txt3 = String(resolveArg(args[0]));
      var delim3 = String(resolveArg(args[1]));
      var idx2 = txt3.indexOf(delim3);
      return idx2 >= 0 ? txt3.substring(idx2 + delim3.length) : '#N/A';
    }
if ((inner = matchFn('CODIGO|CODE')) !== null) {
      var s = String(resolveArg(splitArgs(inner)[0]));
      return s.length ? String(s.charCodeAt(0)) : '#VALOR!';
    }
if ((inner = matchFn('CARACTER|CAR|CHAR')) !== null) {
      return String.fromCharCode(parseInt(resolveNum(splitArgs(inner)[0])));
    }
if ((inner = matchFn('LIMPIAR|CLEAN')) !== null) {
      return String(resolveArg(splitArgs(inner)[0])).replace(/[\\x00-\\x1F]/g, '');
    }
if ((inner = matchFn('UNICODE')) !== null) {
      var s2 = String(resolveArg(splitArgs(inner)[0]));
      return s2.length ? String(s2.codePointAt(0)) : '#VALOR!';
    }
if ((inner = matchFn('MATRIZATEXTO|ARRAYTOTEXT')) !== null) {
      args = splitArgs(inner);
      if (isRange(args[0])) return '{' + rangeVals(args[0]).join(', ') + '}';
      return String(resolveArg(args[0]));
    }
if ((inner = matchFn('DIAS\\.LAB|NETWORKDAYS')) !== null) {
      args = splitArgs(inner);
      var d1 = new Date(String(resolveArg(args[0])));
      var d2 = new Date(String(resolveArg(args[1])));
      var count = 0, cur2 = new Date(d1);
      while (cur2 <= d2) {
        var day = cur2.getDay();
        if (day !== 0 && day !== 6) count++;
        cur2.setDate(cur2.getDate() + 1);
      }
      return String(count);
    }
if ((inner = matchFn('DIA\\.LAB|WORKDAY')) !== null) {
      args = splitArgs(inner);
      var d3 = new Date(String(resolveArg(args[0])));
      var days = parseInt(resolveNum(args[1]));
      var added = 0, dir = days >= 0 ? 1 : -1;
      var remaining = Math.abs(days);
      while (remaining > 0) {
        d3.setDate(d3.getDate() + dir);
        if (d3.getDay() !== 0 && d3.getDay() !== 6) remaining--;
      }
      return d3.toLocaleDateString('es-CR');
    }
if ((inner = matchFn('NUM\\.DE\\.SEMANA|WEEKNUM')) !== null) {
      args = splitArgs(inner);
      var d4 = new Date(String(resolveArg(args[0])));
      var start2 = new Date(d4.getFullYear(), 0, 1);
      return String(Math.ceil(((d4 - start2) / 86400000 + start2.getDay() + 1) / 7));
    }
if ((inner = matchFn('DIASEM|WEEKDAY')) !== null) {
      args = splitArgs(inner);
      var d5 = new Date(String(resolveArg(args[0])));
      var type2 = args[1] ? parseInt(resolveNum(args[1])) : 1;
      var wd = d5.getDay(); // 0=Dom
      if (type2 === 2) return String(wd === 0 ? 7 : wd); // 1=Lun
      if (type2 === 3) return String(wd === 0 ? 6 : wd - 1); // 0=Lun
      return String(wd + 1); // 1=Dom
    }
if ((inner = matchFn('FRAC\\.AÑO|YEARFRAC')) !== null) {
      args = splitArgs(inner);
      var d6 = new Date(String(resolveArg(args[0])));
      var d7 = new Date(String(resolveArg(args[1])));
      return fmtNum((d7 - d6) / (365.25 * 86400000));
    }
if ((inner = matchFn('FECHA\\.MES|EDATE')) !== null) {
      args = splitArgs(inner);
      var d8 = new Date(String(resolveArg(args[0])));
      d8.setMonth(d8.getMonth() + parseInt(resolveNum(args[1])));
      return d8.toLocaleDateString('es-CR');
    }
if ((inner = matchFn('SEGUNDO|SECOND')) !== null) {
      return String(new Date().getSeconds());
    }
if ((inner = matchFn('DB')) !== null) {
      args = splitArgs(inner);
      var cost = resolveNum(args[0]), salv = resolveNum(args[1]);
      var life = resolveNum(args[2]), per = resolveNum(args[3]);
      var month = args[4] ? resolveNum(args[4]) : 12;
      var rate2 = 1 - Math.pow(salv/cost, 1/life);
      rate2 = Math.round(rate2 * 1000) / 1000;
      var dep = 0;
      if (per === 1) dep = cost * rate2 * month / 12;
      else {
        var prev = cost * rate2 * month / 12;
        var book = cost - prev;
        for (var p = 2; p <= per; p++) {
          dep = book * rate2;
          if (p < per) book -= dep;
        }
      }
      return fmtNum(dep);
    }
if ((inner = matchFn('DDB')) !== null) {
      args = splitArgs(inner);
      var cost2 = resolveNum(args[0]), salv2 = resolveNum(args[1]);
      var life2 = resolveNum(args[2]), per2 = resolveNum(args[3]);
      var factor = args[4] ? resolveNum(args[4]) : 2;
      var rate3 = factor / life2;
      var book2 = cost2;
      for (var p2 = 1; p2 <= per2; p2++) {
        var dep2 = Math.min(book2 * rate3, book2 - salv2);
        if (p2 === per2) return fmtNum(dep2);
        book2 -= dep2;
      }
      return fmtNum(0);
    }
if ((inner = matchFn('DVS|VDB')) !== null) {
      args = splitArgs(inner);
      var cost3 = resolveNum(args[0]), salv3 = resolveNum(args[1]);
      var life3 = resolveNum(args[2]);
      var ps = resolveNum(args[3]), pe = resolveNum(args[4]);
      var factor2 = args[5] ? resolveNum(args[5]) : 2;
      var rate4 = factor2 / life3;
      var book3 = cost3, total4 = 0;
      for (var p3 = 0; p3 < pe; p3++) {
        var dep3 = Math.min(book3 * rate4, book3 - salv3);
        if (p3 >= ps) total4 += dep3;
        book3 -= dep3;
      }
      return fmtNum(total4);
    }
if ((inner = matchFn('PAGOINT|IPMT')) !== null) {
      args = splitArgs(inner);
      var r5 = resolveNum(args[0]), per3 = resolveNum(args[1]);
      var n2 = resolveNum(args[2]), pv = resolveNum(args[3]);
      if (r5 === 0) return fmtNum(0);
      var pmt2 = r5 * pv / (1 - Math.pow(1+r5, -n2));
      var bal = pv * Math.pow(1+r5, per3-1) - pmt2 * (Math.pow(1+r5, per3-1)-1)/r5;
      return fmtNum(-bal * r5);
    }
if ((inner = matchFn('PAGOPRIN|PPMT')) !== null) {
      args = splitArgs(inner);
      var r6 = resolveNum(args[0]), per4 = resolveNum(args[1]);
      var n3 = resolveNum(args[2]), pv2 = resolveNum(args[3]);
      if (r6 === 0) return fmtNum(-pv2/n3);
      var pmt3 = r6 * pv2 / (1 - Math.pow(1+r6, -n3));
      var ipmt2 = -(pv2 * Math.pow(1+r6, per4-1) - pmt3*(Math.pow(1+r6,per4-1)-1)/r6) * r6;
      return fmtNum(-pmt3 - ipmt2);
    }
if ((inner = matchFn('TIRM|MIRR')) !== null) {
      args = splitArgs(inner);
      var flows = isRange(args[0]) ? rangeNums(args[0]) : [];
      var finRate = resolveNum(args[1]), reinvRate = resolveNum(args[2]);
      var n4 = flows.length;
      var neg = 0, pos2 = 0;
      flows.forEach(function(v, i) {
        if (v < 0) neg += v / Math.pow(1+finRate, i);
        else pos2 += v * Math.pow(1+reinvRate, n4-1-i);
      });
      return fmtNum(Math.pow(pos2 / Math.abs(neg), 1/(n4-1)) - 1);
    }
if ((inner = matchFn('RRI')) !== null) {
      args = splitArgs(inner);
      return fmtNum(Math.pow(resolveNum(args[2])/resolveNum(args[1]), 1/resolveNum(args[0])) - 1);
    }
if ((inner = matchFn('P\\.DURACION|PDURATION')) !== null) {
      args = splitArgs(inner);
      var r7 = resolveNum(args[0]), pv3 = resolveNum(args[1]), fv2 = resolveNum(args[2]);
      return fmtNum(Math.log(fv2/pv3) / Math.log(1+r7));
    }
if ((inner = matchFn('PAGO\\.INT\\.ENTRE|CUMIPMT')) !== null) {
      args = splitArgs(inner);
      var r8 = resolveNum(args[0]), n5 = resolveNum(args[1]), pv4 = resolveNum(args[2]);
      var ps2 = parseInt(resolveNum(args[3])), pe2 = parseInt(resolveNum(args[4]));
      if (r8 === 0) return fmtNum(0);
      var pmt4 = r8 * pv4 / (1 - Math.pow(1+r8,-n5));
      var total5 = 0;
      for (var p4 = ps2; p4 <= pe2; p4++) {
        var bal2 = pv4 * Math.pow(1+r8,p4-1) - pmt4*(Math.pow(1+r8,p4-1)-1)/r8;
        total5 += bal2 * r8;
      }
      return fmtNum(-total5);
    }
if ((inner = matchFn('PAGO\\.PRINC\\.ENTRE|CUMPRINC')) !== null) {
      args = splitArgs(inner);
      var r9 = resolveNum(args[0]), n6 = resolveNum(args[1]), pv5 = resolveNum(args[2]);
      var ps3 = parseInt(resolveNum(args[3])), pe3 = parseInt(resolveNum(args[4]));
      if (r9 === 0) return fmtNum(-pv5*(pe3-ps3+1)/n6);
      var pmt5 = r9 * pv5 / (1-Math.pow(1+r9,-n6));
      var total6 = 0;
      for (var p5 = ps3; p5 <= pe3; p5++) {
        var bal3 = pv5*Math.pow(1+r9,p5-1) - pmt5*(Math.pow(1+r9,p5-1)-1)/r9;
        var ipmt3 = bal3 * r9;
        total6 += pmt5 - ipmt3;
      }
      return fmtNum(-total6);
    }
if ((inner = matchFn('VAR\\.S|VAR\\.M|VAR(?!\\.P)')) !== null) {
      args = splitArgs(inner);
      nums = isRange(args[0]) ? rangeNums(args[0]) : args.map(resolveNum);
      var mean2 = nums.reduce(function(a,b){return a+b;},0)/nums.length;
      return fmtNum(nums.reduce(function(s,n){return s+(n-mean2)*(n-mean2);},0)/(nums.length-1));
    }
if ((inner = matchFn('VAR\\.P|VARP')) !== null) {
      args = splitArgs(inner);
      nums = isRange(args[0]) ? rangeNums(args[0]) : args.map(resolveNum);
      var mean3 = nums.reduce(function(a,b){return a+b;},0)/nums.length;
      return fmtNum(nums.reduce(function(s,n){return s+(n-mean3)*(n-mean3);},0)/nums.length);
    }
if ((inner = matchFn('PERCENTIL\\.INC|PERCENTIL(?!\\.)|PERCENTILE')) !== null) {
      args = splitArgs(inner);
      nums = isRange(args[0]) ? rangeNums(args[0]) : [resolveNum(args[0])];
      var k = resolveNum(args[1]);
      nums.sort(function(a,b){return a-b;});
      var idx3 = k * (nums.length-1);
      var lo = Math.floor(idx3), hi = Math.ceil(idx3);
      return fmtNum(nums[lo] + (nums[hi]-nums[lo])*(idx3-lo));
    }
if ((inner = matchFn('CUARTIL\\.INC|CUARTIL|QUARTILE')) !== null) {
      args = splitArgs(inner);
      nums = isRange(args[0]) ? rangeNums(args[0]) : [resolveNum(args[0])];
      var q = resolveNum(args[1]) / 4;
      nums.sort(function(a,b){return a-b;});
      var idx4 = q*(nums.length-1);
      var lo2=Math.floor(idx4),hi2=Math.ceil(idx4);
      return fmtNum(nums[lo2]+(nums[hi2]-nums[lo2])*(idx4-lo2));
    }
if ((inner = matchFn('CURTOSIS|KURT')) !== null) {
      args = splitArgs(inner);
      nums = isRange(args[0]) ? rangeNums(args[0]) : args.map(resolveNum);
      var n7=nums.length, mean4=nums.reduce(function(a,b){return a+b;},0)/n7;
      var s4=Math.sqrt(nums.reduce(function(s,n){return s+(n-mean4)*(n-mean4);},0)/(n7-1));
      var k2=nums.reduce(function(s,n){return s+Math.pow((n-mean4)/s4,4);},0);
      return fmtNum((n7*(n7+1)/((n7-1)*(n7-2)*(n7-3)))*k2 - 3*(n7-1)*(n7-1)/((n7-2)*(n7-3)));
    }
if ((inner = matchFn('COEFICIENTE\\.ASIMETRIA|SKEW')) !== null) {
      args = splitArgs(inner);
      nums = isRange(args[0]) ? rangeNums(args[0]) : args.map(resolveNum);
      var n8=nums.length, mean5=nums.reduce(function(a,b){return a+b;},0)/n8;
      var s5=Math.sqrt(nums.reduce(function(s,n){return s+(n-mean5)*(n-mean5);},0)/(n8-1));
      var sk=nums.reduce(function(s,n){return s+Math.pow((n-mean5)/s5,3);},0);
      return fmtNum((n8/((n8-1)*(n8-2)))*sk);
    }
if ((inner = matchFn('PENDIENTE|SLOPE')) !== null) {
      args = splitArgs(inner);
      var y = isRange(args[0])?rangeNums(args[0]):[], x = isRange(args[1])?rangeNums(args[1]):[];
      var n9=Math.min(x.length,y.length);
      var mx2=x.reduce(function(a,b){return a+b;},0)/n9, my2=y.reduce(function(a,b){return a+b;},0)/n9;
      var num2=0,denom=0;
      for(var i=0;i<n9;i++){num2+=(x[i]-mx2)*(y[i]-my2);denom+=(x[i]-mx2)*(x[i]-mx2);}
      return fmtNum(num2/denom);
    }
if ((inner = matchFn('INTERSECCION\\.EJE|INTERCEPT')) !== null) {
      args = splitArgs(inner);
      var y2=isRange(args[0])?rangeNums(args[0]):[], x2=isRange(args[1])?rangeNums(args[1]):[];
      var n10=Math.min(x2.length,y2.length);
      var mx3=x2.reduce(function(a,b){return a+b;},0)/n10, my3=y2.reduce(function(a,b){return a+b;},0)/n10;
      var num3=0,den2=0;
      for(var i=0;i<n10;i++){num3+=(x2[i]-mx3)*(y2[i]-my3);den2+=(x2[i]-mx3)*(x2[i]-mx3);}
      return fmtNum(my3 - (num3/den2)*mx3);
    }
if ((inner = matchFn('JERARQUIA\\.EQV|JERARQUIA|RANK')) !== null) {
      args = splitArgs(inner);
      var n11 = resolveNum(args[0]);
      var vals2 = isRange(args[1]) ? rangeNums(args[1]) : [];
      var order2 = args[2] ? parseInt(resolveNum(args[2])) : 0;
      vals2.sort(function(a,b){ return order2 ? a-b : b-a; });
      var rank = vals2.indexOf(n11);
      return rank >= 0 ? String(rank+1) : '#N/A';
    }
if ((inner = matchFn('MEDIA\\.ACOTADA|TRIMMEAN')) !== null) {
      args = splitArgs(inner);
      nums = isRange(args[0]) ? rangeNums(args[0]) : args.map(resolveNum);
      var pct = resolveNum(args[1]);
      nums.sort(function(a,b){return a-b;});
      var trim = Math.floor(nums.length * pct / 2);
      var trimmed = nums.slice(trim, nums.length-trim);
      return fmtNum(trimmed.reduce(function(a,b){return a+b;},0)/trimmed.length);
    }
if ((inner = matchFn('MMULT')) !== null) {
      args = splitArgs(inner);
      if (isRange(args[0]) && isRange(args[1])) {
        var m1 = rangeNums(args[0]), m2 = rangeNums(args[1]);
        // Simple: dot product of vectors
        var dot = 0;
        for (var i=0;i<Math.min(m1.length,m2.length);i++) dot += m1[i]*m2[i];
        return fmtNum(dot);
      }
      return '#VALOR!';
    }
if ((inner = matchFn('MATRIZALEAT|RANDARRAY')) !== null) {
      args = splitArgs(inner);
      var rows3 = args[0] ? parseInt(resolveNum(args[0])) : 1;
      var cols3 = args[1] ? parseInt(resolveNum(args[1])) : 1;
      var min2  = args[2] ? resolveNum(args[2]) : 0;
      var max3  = args[3] ? resolveNum(args[3]) : 1;
      var isInt = args[4] && String(resolveArg(args[4])).toUpperCase() === 'VERDADERO';
      var arr = [];
      for (var i=0;i<rows3*cols3;i++) {
        var v = min2 + Math.random()*(max3-min2);
        arr.push(isInt ? Math.floor(v) : Math.round(v*100)/100);
      }
      return arr.join('; ');
    }
if ((inner = matchFn('MDETERM')) !== null) {
      args = splitArgs(inner);
      if (isRange(args[0])) {
        nums = rangeNums(args[0]);
        if (nums.length === 4) return fmtNum(nums[0]*nums[3] - nums[1]*nums[2]);
        if (nums.length === 9) {
          var a=nums[0],b=nums[1],c=nums[2],d=nums[3],e=nums[4],f=nums[5],g=nums[6],h=nums[7],k=nums[8];
          return fmtNum(a*(e*k-f*h) - b*(d*k-f*g) + c*(d*h-e*g));
        }
      }
      return '#VALOR!';
    }
if ((inner = matchFn('MUNIT')) !== null) {
      var dim = parseInt(resolveNum(splitArgs(inner)[0]));
      var rows4 = [];
      for (var i=0;i<dim;i++) {
        var row2 = [];
        for (var j=0;j<dim;j++) row2.push(i===j?'1':'0');
        rows4.push(row2.join('\\t'));
      }
      return rows4.join(' | ');
    }
if ((inner = matchFn('GRADOS|DEGREES')) !== null) {
      return fmtNum(resolveNum(splitArgs(inner)[0]) * 180 / Math.PI);
    }
if ((inner = matchFn('RADIANES|RADIANS')) !== null) {
      return fmtNum(resolveNum(splitArgs(inner)[0]) * Math.PI / 180);
    }
if ((inner = matchFn('SEN(?!O)|SENO|SIN')) !== null) { return fmtNum(Math.sin(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('COS(?!H)')) !== null) { return fmtNum(Math.cos(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('TAN(?!H)')) !== null) { return fmtNum(Math.tan(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('ASEN|ASIN|ASENO')) !== null) { return fmtNum(Math.asin(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('ACOS(?!H)')) !== null) { return fmtNum(Math.acos(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('ATAN(?!2|H)')) !== null) { return fmtNum(Math.atan(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('ATAN2')) !== null) { args=splitArgs(inner); return fmtNum(Math.atan2(resolveNum(args[1]),resolveNum(args[0]))); }
if ((inner = matchFn('SENH|SINH')) !== null) { return fmtNum(Math.sinh(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('COSH')) !== null) { return fmtNum(Math.cosh(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('TANH')) !== null) { return fmtNum(Math.tanh(resolveNum(splitArgs(inner)[0]))); }
if ((inner = matchFn('BASE')) !== null) {
      args = splitArgs(inner);
      var num2 = parseInt(resolveNum(args[0])), base2 = parseInt(resolveNum(args[1]));
      return num2.toString(base2).toUpperCase();
    }
if ((inner = matchFn('CONVERTIR|CONVERT')) !== null) {
      args = splitArgs(inner);
      var val2 = resolveNum(args[0]);
      var from = String(resolveArg(args[1])).toLowerCase();
      var to   = String(resolveArg(args[2])).toLowerCase();
      var convMap = {
        // Longitud
        'km_m':1000,'m_km':0.001,'mi_km':1.60934,'km_mi':0.621371,
        'm_ft':3.28084,'ft_m':0.3048,'in_cm':2.54,'cm_in':0.393701,
        // Peso
        'kg_lb':2.20462,'lb_kg':0.453592,'oz_g':28.3495,'g_oz':0.035274,
        // Temperatura
        'c_f':null,'f_c':null,'c_k':null,'k_c':null,
        // Área
        'ha_m2':10000,'m2_ha':0.0001,
        // Volumen
        'l_gal':0.264172,'gal_l':3.78541,
        // Velocidad
        'kmh_ms':0.277778,'ms_kmh':3.6,
      };
      var key = from+'_'+to;
      if (key === 'c_f') return fmtNum(val2*9/5+32);
      if (key === 'f_c') return fmtNum((val2-32)*5/9);
      if (key === 'c_k') return fmtNum(val2+273.15);
      if (key === 'k_c') return fmtNum(val2-273.15);
      if (convMap[key] != null) return fmtNum(val2 * convMap[key]);
      return '#N/A';
    }
if ((inner = matchFn('BIN\\.A\\.DEC|BIN2DEC')) !== null) {
      return String(parseInt(String(resolveArg(splitArgs(inner)[0])), 2));
    }
if ((inner = matchFn('DEC\\.A\\.BIN|DEC2BIN')) !== null) {
      args = splitArgs(inner);
      var n12 = parseInt(resolveNum(args[0]));
      var places = args[1] ? parseInt(resolveNum(args[1])) : 0;
      var bin = (n12 >>> 0).toString(2);
      return places ? bin.padStart(places,'0') : bin;
    }
if ((inner = matchFn('DEC\\.A\\.HEX|DEC2HEX')) !== null) {
      return parseInt(resolveNum(splitArgs(inner)[0])).toString(16).toUpperCase();
    }
if ((inner = matchFn('HEX\\.A\\.DEC|HEX2DEC')) !== null) {
      return String(parseInt(String(resolveArg(splitArgs(inner)[0])), 16));
    }
if ((inner = matchFn('OCT\\.A\\.DEC|OCT2DEC')) !== null) {
      return String(parseInt(String(resolveArg(splitArgs(inner)[0])), 8));
    }
if ((inner = matchFn('DEC\\.A\\.OCT|DEC2OCT')) !== null) {
      return parseInt(resolveNum(splitArgs(inner)[0])).toString(8);
    }
if ((inner = matchFn('BIT\\.Y|BITAND')) !== null) {
      args=splitArgs(inner); return String(parseInt(resolveNum(args[0])) & parseInt(resolveNum(args[1])));
    }
if ((inner = matchFn('BIT\\.O|BITOR')) !== null) {
      args=splitArgs(inner); return String(parseInt(resolveNum(args[0])) | parseInt(resolveNum(args[1])));
    }
if ((inner = matchFn('BIT\\.XO|BITXOR')) !== null) {
      args=splitArgs(inner); return String(parseInt(resolveNum(args[0])) ^ parseInt(resolveNum(args[1])));
    }
if ((inner = matchFn('DELTA')) !== null) {
      args=splitArgs(inner); return resolveNum(args[0]) === resolveNum(args[1]||'0') ? '1' : '0';
    }
if ((inner = matchFn('BDSUMA|DSUM')) !== null) {
      args = splitArgs(inner);
      return fmtNum(dbCriterio(args[0],resolveArg(args[1]),args[2]).map(toNum).reduce(function(a,b){return a+b;},0));
    }
if ((inner = matchFn('BDPROMEDIO|DAVERAGE')) !== null) {
      args = splitArgs(inner);
      var vs = dbCriterio(args[0],resolveArg(args[1]),args[2]).map(toNum);
      return vs.length ? fmtNum(vs.reduce(function(a,b){return a+b;},0)/vs.length) : '#DIV/0!';
    }
if ((inner = matchFn('BDMAX|DMAX')) !== null) {
      args = splitArgs(inner);
      var vs2 = dbCriterio(args[0],resolveArg(args[1]),args[2]).map(toNum);
      return vs2.length ? fmtNum(Math.max.apply(null,vs2)) : '0';
    }
if ((inner = matchFn('BDMIN|DMIN')) !== null) {
      args = splitArgs(inner);
      var vs3 = dbCriterio(args[0],resolveArg(args[1]),args[2]).map(toNum);
      return vs3.length ? fmtNum(Math.min.apply(null,vs3)) : '0';
    }
if ((inner = matchFn('BDCONTAR|DCOUNT')) !== null) {
      args = splitArgs(inner);
      return String(dbCriterio(args[0],resolveArg(args[1]),args[2]).filter(function(v){return !isNaN(toNum(v));}).length);
    }
if ((inner = matchFn('BDCONTARA|DCOUNTA')) !== null) {
      args = splitArgs(inner);
      return String(dbCriterio(args[0],resolveArg(args[1]),args[2]).filter(function(v){return v!=='';}).length);
    }
if ((inner = matchFn('BDEXTRAER|DGET')) !== null) {
      args = splitArgs(inner);
      var res2 = dbCriterio(args[0],resolveArg(args[1]),args[2]);
      return res2.length === 1 ? String(res2[0]) : (res2.length > 1 ? '#NUM!' : '#VALOR!');
    }
if((inner=matchFn('MULTIPLO\\.SUPERIOR\\.MAT|MULTIPLO\\.SUPERIOR|CEILING\\.MATH|CEILING'))!==null){
      args=splitArgs(inner);
      var n1=resolveNum(args[0]),sig1=args[1]?resolveNum(args[1]):1;
      return fmtNum(Math.ceil(n1/sig1)*sig1);
    }
if((inner=matchFn('MULTIPLO\\.INFERIOR\\.MAT|MULTIPLO\\.INFERIOR|FLOOR\\.MATH|FLOOR'))!==null){
      args=splitArgs(inner);
      var n2=resolveNum(args[0]),sig2=args[1]?resolveNum(args[1]):1;
      return fmtNum(Math.floor(n2/sig2)*sig2);
    }
if((inner=matchFn('REDOND\\.MULT|MROUND'))!==null){
      args=splitArgs(inner);
      var n3=resolveNum(args[0]),m1=resolveNum(args[1]);
      return fmtNum(Math.round(n3/m1)*m1);
    }
if((inner=matchFn('M\\.C\\.D|GCD'))!==null){
      args=splitArgs(inner);
      function gcd(a,b){return b===0?a:gcd(b,a%b);}
      var nums2=args.map(function(a){return Math.abs(parseInt(resolveNum(a)));});
      return fmtNum(nums2.reduce(gcd));
    }
if((inner=matchFn('M\\.C\\.M|LCM'))!==null){
      args=splitArgs(inner);
      function gcd2(a,b){return b===0?a:gcd2(b,a%b);}
      function lcm(a,b){return a/gcd2(a,b)*b;}
      var nums3=args.map(function(a){return Math.abs(parseInt(resolveNum(a)));});
      return fmtNum(nums3.reduce(lcm));
    }
if((inner=matchFn('POTENCIA\\.DE\\.DIEZ'))!==null){
      return fmtNum(Math.pow(10,resolveNum(splitArgs(inner)[0])));
    }
if((inner=matchFn('NUMERO\\.ROMANO|ROMAN'))!==null){
      var num1=parseInt(resolveNum(splitArgs(inner)[0]));
      var vals3=[1000,900,500,400,100,90,50,40,10,9,5,4,1];
      var syms=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
      var result='';
      for(var i1=0;i1<vals3.length;i1++){while(num1>=vals3[i1]){result+=syms[i1];num1-=vals3[i1];}}
      return result;
    }
if((inner=matchFn('ARABIGO|ARABIC'))!==null){
      var s1=String(resolveArg(splitArgs(inner)[0])).toUpperCase();
      var map1={M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
      var total1=0,i2=0;
      while(i2<s1.length){
        var two=s1.substr(i2,2),one=s1.substr(i2,1);
        if(map1[two]){total1+=map1[two];i2+=2;}else if(map1[one]){total1+=map1[one];i2++;}else i2++;
      }
      return String(total1);
    }
if((inner=matchFn('SUMA\\.CUADRADOS|SUMSQ'))!==null){
      args=splitArgs(inner);var sq=0;
      args.forEach(function(a){if(isRange(a))rangeNums(a).forEach(function(n){sq+=n*n;});else{var v2=resolveNum(a);sq+=v2*v2;}});
      return fmtNum(sq);
    }
if((inner=matchFn('PRODUCTO|PRODUCT'))!==null){
      args=splitArgs(inner);var prod=1;
      args.forEach(function(a){if(isRange(a))rangeNums(a).forEach(function(n){if(n!==0)prod*=n;});else prod*=resolveNum(a);});
      return fmtNum(prod);
    }
if((inner=matchFn('PERMUTACIONES|PERMUT'))!==null){
      args=splitArgs(inner);
      var n4=resolveNum(args[0]),k1=resolveNum(args[1]);
      var p1=1;for(var i3=0;i3<k1;i3++)p1*=(n4-i3);
      return fmtNum(p1);
    }
if((inner=matchFn('MULTIPLO\\.SUPERIOR\\.ISO|ISO\\.CEILING'))!==null){
      args=splitArgs(inner);
      var n5=resolveNum(args[0]),sig3=args[1]?Math.abs(resolveNum(args[1])):1;
      return fmtNum(Math.ceil(n5/sig3)*sig3);
    }
if((inner=matchFn('DISTR\\.NORM\\.N|DISTR\\.NORM|NORM\\.DIST'))!==null){
      args=splitArgs(inner);
      var x1=resolveNum(args[0]),mu=resolveNum(args[1]),sigma=resolveNum(args[2]);
      var acum=String(resolveArg(args[3]||'VERDADERO')).toUpperCase()!=='FALSO';
      var z=(x1-mu)/sigma;
      if(acum){
        // CDF normal estándar aproximación
        var t2=1/(1+0.2316419*Math.abs(z));
        var poly=t2*(0.319381530+t2*(-0.356563782+t2*(1.781477937+t2*(-1.821255978+t2*1.330274429))));
        var cdf=1-Math.exp(-z*z/2)/Math.sqrt(2*Math.PI)*poly;
        return fmtNum(z>=0?cdf:1-cdf);
      } else {
        return fmtNum(Math.exp(-z*z/2)/(sigma*Math.sqrt(2*Math.PI)));
      }
    }
if((inner=matchFn('INV\\.NORM|NORM\\.INV'))!==null){
      args=splitArgs(inner);
      var p1=resolveNum(args[0]),mu2=args[1]?resolveNum(args[1]):0,sig4=args[2]?resolveNum(args[2]):1;
      // Aproximación racional de Beasley-Springer-Moro
      function normInv(p2){
        if(p2<=0)return -Infinity;if(p2>=1)return Infinity;
        var c0=2.515517,c1=0.802853,c2_=0.010328,d1=1.432788,d2_=0.189269,d3=0.001308;
        var t3=p2<0.5?Math.sqrt(-2*Math.log(p2)):Math.sqrt(-2*Math.log(1-p2));
        var x2=t3-(c0+c1*t3+c2_*t3*t3)/(1+d1*t3+d2_*t3*t3+d3*t3*t3*t3);
        return p2<0.5?-x2:x2;
      }
      return fmtNum(mu2+sig4*normInv(p1));
    }
if((inner=matchFn('DISTR\\.NORM\\.ESTAND\\.N|DISTR\\.NORM\\.ESTAND|NORM\\.S\\.DIST'))!==null){
      args=splitArgs(inner);
      var z2=resolveNum(args[0]);
      var acum2=args[1]?String(resolveArg(args[1])).toUpperCase()!=='FALSO':true;
      if(acum2){
        var t4=1/(1+0.2316419*Math.abs(z2));
        var poly2=t4*(0.319381530+t4*(-0.356563782+t4*(1.781477937+t4*(-1.821255978+t4*1.330274429))));
        var cdf2=1-Math.exp(-z2*z2/2)/Math.sqrt(2*Math.PI)*poly2;
        return fmtNum(z2>=0?cdf2:1-cdf2);
      }
      return fmtNum(Math.exp(-z2*z2/2)/Math.sqrt(2*Math.PI));
    }
if((inner=matchFn('DISTR\\.T\\.N|DISTR\\.T(?!\\.)|T\\.DIST(?!\\.2|\\.RT)'))!==null){
      args=splitArgs(inner);
      var x3=resolveNum(args[0]),df=resolveNum(args[1]);
      // Aproximación t-distribution CDF
      var beta=0.5*(1+Math.sign(x3)*function(){
        var tt=x3*x3/(x3*x3+df);
        // regularized incomplete beta approximation
        return 1-Math.exp((df/2)*Math.log(1-tt)+0.5*Math.log(tt)+
          Math.log(df/2)-Math.log(df/2+0.5));
      }());
      return fmtNum(beta);
    }
if((inner=matchFn('DISTR\\.F\\.N|DISTR\\.F(?!\\.CD)|F\\.DIST(?!\\.RT)'))!==null){
      args=splitArgs(inner);
      var x4=resolveNum(args[0]),d1_=resolveNum(args[1]),d2_=resolveNum(args[2]);
      if(x4<0)return fmtNum(0);
      // F CDF usando beta regularizada incompleta (aproximación)
      var w=d1_*x4/(d1_*x4+d2_);
      return fmtNum(w); // simplificado
    }
if((inner=matchFn('DISTR\\.CHICUAD(?!\\.CD)|CHISQ\\.DIST(?!\\.RT)'))!==null){
      args=splitArgs(inner);
      var x5=resolveNum(args[0]),k2=resolveNum(args[1]);
      // CDF chi-squared via gamma regularizada (aproximación)
      var a1=k2/2,x6=x5/2;
      var gammaIncL=1-Math.exp(-x6)*Math.pow(x6,a1-1); // muy simplificada
      return fmtNum(Math.max(0,Math.min(1,gammaIncL)));
    }
if((inner=matchFn('DISTR\\.BINOM\\.N|DISTR\\.BINOM|BINOM\\.DIST'))!==null){
      args=splitArgs(inner);
      var ks=parseInt(resolveNum(args[0])),ns=parseInt(resolveNum(args[1])),ps=resolveNum(args[2]);
      var acum3=String(resolveArg(args[3]||'FALSO')).toUpperCase()!=='FALSO';
      function comb(n6,k3){var r2=1;for(var i4=0;i4<k3;i4++)r2=r2*(n6-i4)/(i4+1);return r2;}
      function binomPMF(k4,n7,p2){return comb(n7,k4)*Math.pow(p2,k4)*Math.pow(1-p2,n7-k4);}
      if(acum3){var sum2=0;for(var i5=0;i5<=ks;i5++)sum2+=binomPMF(i5,ns,ps);return fmtNum(sum2);}
      return fmtNum(binomPMF(ks,ns,ps));
    }
if((inner=matchFn('DIST\\.POISSON|POISSON\\.DIST|DISTR\\.POISSON'))!==null){
      args=splitArgs(inner);
      var k5=parseInt(resolveNum(args[0])),lam=resolveNum(args[1]);
      var acum4=String(resolveArg(args[2]||'FALSO')).toUpperCase()!=='FALSO';
      function poissonPMF(k6,l){var fact=1;for(var i6=1;i6<=k6;i6++)fact*=i6;return Math.exp(-l)*Math.pow(l,k6)/fact;}
      if(acum4){var sum3=0;for(var i7=0;i7<=k5;i7++)sum3+=poissonPMF(i7,lam);return fmtNum(sum3);}
      return fmtNum(poissonPMF(k5,lam));
    }
if((inner=matchFn('DISTR\\.EXP\\.N|DISTR\\.EXP|EXPON\\.DIST'))!==null){
      args=splitArgs(inner);
      var x7=resolveNum(args[0]),lam2=resolveNum(args[1]);
      var acum5=String(resolveArg(args[2]||'VERDADERO')).toUpperCase()!=='FALSO';
      return fmtNum(acum5?1-Math.exp(-lam2*x7):lam2*Math.exp(-lam2*x7));
    }
if((inner=matchFn('INTERVALO\\.CONFIANZA\\.NORM|INTERVALO\\.CONFIANZA|CONFIDENCE\\.NORM|CONFIDENCE'))!==null){
      args=splitArgs(inner);
      var alpha=resolveNum(args[0]),sig5=resolveNum(args[1]),n8=resolveNum(args[2]);
      // z para alpha/2
      var zMap={0.05:1.96,0.01:2.576,0.1:1.645,0.02:2.326,0.001:3.291};
      var z3=zMap[alpha]||1.96;
      return fmtNum(z3*sig5/Math.sqrt(n8));
    }
if((inner=matchFn('COEFICIENTE\\.R2|RSQ'))!==null){
      args=splitArgs(inner);
      var y1=isRange(args[0])?rangeNums(args[0]):[],x1=isRange(args[1])?rangeNums(args[1]):[];
      var n9=Math.min(x1.length,y1.length);
      var mx1=x1.reduce(function(a,b){return a+b;},0)/n9,my1=y1.reduce(function(a,b){return a+b;},0)/n9;
      var num4=0,dx1=0,dy1=0;
      for(var i8=0;i8<n9;i8++){num4+=(x1[i8]-mx1)*(y1[i8]-my1);dx1+=(x1[i8]-mx1)*(x1[i8]-mx1);dy1+=(y1[i8]-my1)*(y1[i8]-my1);}
      var r1=num4/Math.sqrt(dx1*dy1);
      return fmtNum(r1*r1);
    }
if((inner=matchFn('ERROR\\.TIPICO\\.XY|STEYX'))!==null){
      args=splitArgs(inner);
      var y2=isRange(args[0])?rangeNums(args[0]):[],x2=isRange(args[1])?rangeNums(args[1]):[];
      var n10=Math.min(x2.length,y2.length);
      var mx2=x2.reduce(function(a,b){return a+b;},0)/n10,my2=y2.reduce(function(a,b){return a+b;},0)/n10;
      var num5=0,den3=0,ss=0;
      for(var i9=0;i9<n10;i9++){num5+=(x2[i9]-mx2)*(y2[i9]-my2);den3+=(x2[i9]-mx2)*(x2[i9]-mx2);}
      var b1=num5/den3;
      for(var i10=0;i10<n10;i10++){var pred=my2+b1*(x2[i10]-mx2);ss+=(y2[i10]-pred)*(y2[i10]-pred);}
      return fmtNum(Math.sqrt(ss/(n10-2)));
    }
if((inner=matchFn('PRONOSTICO\\.LINEAL|PRONOSTICO|FORECAST\\.LINEAR|FORECAST'))!==null){
      args=splitArgs(inner);
      var xNew=resolveNum(args[0]);
      var y3=isRange(args[1])?rangeNums(args[1]):[],x3=isRange(args[2])?rangeNums(args[2]):[];
      var n11=Math.min(x3.length,y3.length);
      var mx3=x3.reduce(function(a,b){return a+b;},0)/n11,my3=y3.reduce(function(a,b){return a+b;},0)/n11;
      var num6=0,den4=0;
      for(var i11=0;i11<n11;i11++){num6+=(x3[i11]-mx3)*(y3[i11]-my3);den4+=(x3[i11]-mx3)*(x3[i11]-mx3);}
      return fmtNum(my3+(num6/den4)*(xNew-mx3));
    }
if((inner=matchFn('RANGO\\.PERCENTIL\\.INC|RANGO\\.PERCENTIL|PERCENTRANK\\.INC|PERCENTRANK'))!==null){
      args=splitArgs(inner);
      nums=isRange(args[0])?rangeNums(args[0]):[];
      var xp=resolveNum(args[1]);
      nums.sort(function(a,b){return a-b;});
      var idx5=nums.indexOf(xp);
      if(idx5<0)return '#N/A';
      return fmtNum(idx5/(nums.length-1));
    }
if((inner=matchFn('INT\\.ACUM|ACCRINT'))!==null){
      args=splitArgs(inner);
      var tasa1=resolveNum(args[3]),par=args[4]?resolveNum(args[4]):1000;
      var freq=args[5]?resolveNum(args[5]):2;
      // Simplificado: interés devengado
      var d1_=new Date(String(resolveArg(args[0])));
      var d2_=new Date(String(resolveArg(args[2])));
      var dias=Math.abs((d2_-d1_)/86400000);
      return fmtNum(par*tasa1*dias/360);
    }
if((inner=matchFn('PRECIO|PRICE'))!==null){
      args=splitArgs(inner);
      var tasa2=resolveNum(args[2]),yield1=resolveNum(args[3]);
      var reemb=resolveNum(args[4]),freq2=resolveNum(args[5])||2;
      var d3_=new Date(String(resolveArg(args[0])));
      var d4_=new Date(String(resolveArg(args[1])));
      var n12=Math.round((d4_-d3_)/(365.25/freq2*86400000));
      var c1=tasa2/freq2*reemb;
      var r1_=yield1/freq2;
      var price=0;
      for(var t1=1;t1<=n12;t1++) price+=c1/Math.pow(1+r1_,t1);
      price+=reemb/Math.pow(1+r1_,n12);
      return fmtNum(price);
    }
if((inner=matchFn('RENDTO|YIELD'))!==null){
      args=splitArgs(inner);
      var tasa3=resolveNum(args[2]),precio=resolveNum(args[3]);
      var reemb2=resolveNum(args[4]),freq3=resolveNum(args[5])||2;
      var d5_=new Date(String(resolveArg(args[0])));
      var d6_=new Date(String(resolveArg(args[1])));
      var n13=Math.round((d6_-d5_)/(365.25/freq3*86400000));
      // Newton-Raphson para yield
      var y1_=tasa3,c2_=tasa3/freq3*reemb2;
      for(var it=0;it<50;it++){
        var pv=0,dpv=0;
        for(var t2=1;t2<=n13;t2++){
          var df2=Math.pow(1+y1_/freq3,t2);
          pv+=c2_/df2;
          dpv-=t2*c2_/(freq3*df2*(1+y1_/freq3));
        }
        pv+=reemb2/Math.pow(1+y1_/freq3,n13);
        dpv-=n13*reemb2/(freq3*Math.pow(1+y1_/freq3,n13+1));
        var diff=pv-precio;
        if(Math.abs(diff)<0.0001)break;
        y1_-=diff/dpv;
      }
      return fmtNum(y1_);
    }
if((inner=matchFn('DURACION|DURATION'))!==null){
      args=splitArgs(inner);
      var tasa4=resolveNum(args[2]),yield2=resolveNum(args[3]),freq4=resolveNum(args[4])||2;
      var d7_=new Date(String(resolveArg(args[0])));
      var d8_=new Date(String(resolveArg(args[1])));
      var n14=Math.round((d8_-d7_)/(365.25/freq4*86400000));
      var c3_=tasa4/freq4,r2_=yield2/freq4;
      var pv2=0,dur=0;
      for(var t3=1;t3<=n14;t3++){var df3=Math.pow(1+r2_,t3);pv2+=c3_/df3;dur+=t3*c3_/df3;}
      pv2+=1/Math.pow(1+r2_,n14);dur+=n14/Math.pow(1+r2_,n14);
      return fmtNum(dur/pv2/freq4);
    }
if((inner=matchFn('DURACION\\.MODIF|MDURATION'))!==null){
      // Similar a DURACION pero dividida por (1+yield/freq)
      args=splitArgs(inner);
      var yield3=resolveNum(args[3]),freq5=resolveNum(args[4])||2;
      var dur2=parseFloat(window.evalFormula('=DURACION('+args.join(';')+')',row,col));
      return fmtNum(dur2/(1+yield3/freq5));
    }
if((inner=matchFn('CONV\\.DECIMAL|DOLLARDE'))!==null){
      args=splitArgs(inner);
      var dFrac=resolveNum(args[0]),frac=resolveNum(args[1]);
      var entero=Math.trunc(dFrac);
      var decimal=dFrac-entero;
      return fmtNum(entero+decimal*10/frac);
    }
if((inner=matchFn('CONV\\.EN\\.FRACCION|DOLLARFR'))!==null){
      args=splitArgs(inner);
      var dDec=resolveNum(args[0]),frac2=resolveNum(args[1]);
      var ent2=Math.trunc(dDec);
      var dec2=dDec-ent2;
      return fmtNum(ent2+dec2*frac2/10);
    }
if((inner=matchFn('LETRA\\.DE\\.TES\\.PRECIO|TBILLPRICE'))!==null){
      args=splitArgs(inner);
      var d9_=new Date(String(resolveArg(args[0])));
      var d10_=new Date(String(resolveArg(args[1])));
      var disc=resolveNum(args[2]);
      var dias2=Math.abs((d10_-d9_)/86400000);
      return fmtNum(100*(1-disc*dias2/360));
    }
if((inner=matchFn('LETRA\\.DE\\.TES\\.RENDTO|TBILLYIELD'))!==null){
      args=splitArgs(inner);
      var d11_=new Date(String(resolveArg(args[0])));
      var d12_=new Date(String(resolveArg(args[1])));
      var pr=resolveNum(args[2]);
      var dias3=Math.abs((d12_-d11_)/86400000);
      return fmtNum((100-pr)*360/(pr*dias3));
    }
if((inner=matchFn('INT\\.PAGO\\.DIR|ISPMT'))!==null){
      args=splitArgs(inner);
      var rate3=resolveNum(args[0]),per5=resolveNum(args[1]);
      var nper2=resolveNum(args[2]),pv3=resolveNum(args[3]);
      return fmtNum(pv3*rate3*(per5/nper2-1));
    }
if((inner=matchFn('VF\\.PLAN|FVSCHEDULE'))!==null){
      args=splitArgs(inner);
      var prin=resolveNum(args[0]);
      var rates=isRange(args[1])?rangeNums(args[1]):(args[1]?[resolveNum(args[1])]:[] );
      rates.forEach(function(r4){prin*=(1+r4);});
      return fmtNum(prin);
    }
if((inner=matchFn('LET'))!==null){
      args=splitArgs(inner);
      // LET(nombre1, valor1, ..., calculo)
      // Para simplificar, evaluamos el último argumento
      if(args.length>=3){
        var letExpr=args[args.length-1];
        // Reemplazar nombres por valores
        for(var i12=0;i12<args.length-1;i12+=2){
          var varName=args[i12].trim();
          var varVal=String(resolveArg(args[i12+1]));
          letExpr=letExpr.replace(new RegExp(String.fromCharCode(92)+'b'+varName+String.fromCharCode(92)+'b','g'),varVal);
        }
        return String(window.evalFormula('='+letExpr,row,col));
      }
      return String(resolveArg(args[args.length-1]));
    }
if((inner=matchFn('LAMBDA'))!==null){
      return '[LAMBDA]'; // placeholder — requiere motor avanzado
    }
if((inner=matchFn('MAP'))!==null){
      args=splitArgs(inner);
      if(isRange(args[0])&&args.length>=2){
        var mapVals=rangeVals(args[0]);
        return mapVals.map(function(v,i){return v;}).join('; ');
      }
      return '#VALOR!';
    }
if((inner=matchFn('REDUCE'))!==null){
      args=splitArgs(inner);
      if(args.length>=2&&isRange(args[1])){
        var acc=resolveNum(args[0]);
        rangeNums(args[1]).forEach(function(v){acc+=v;});
        return fmtNum(acc);
      }
      return '#VALOR!';
    }
if((inner=matchFn('SCAN'))!==null){
      args=splitArgs(inner);
      if(args.length>=2&&isRange(args[1])){
        var acc2=resolveNum(args[0]);
        var results=rangeNums(args[1]).map(function(v){acc2+=v;return fmtNum(acc2);});
        return results.join('; ');
      }
      return '#VALOR!';
    }
if((inner=matchFn('BYROW'))!==null){
      args=splitArgs(inner);
      if(isRange(args[0])){
        return fmtNum(rangeNums(args[0]).reduce(function(a,b){return a+b;},0));
      }
      return '#VALOR!';
    }
if((inner=matchFn('BYCOL'))!==null){
      args=splitArgs(inner);
      if(isRange(args[0])){
        return fmtNum(rangeNums(args[0]).reduce(function(a,b){return a+b;},0));
      }
      return '#VALOR!';
    }
if((inner=matchFn('REEMPLAZARTODO'))!==null){
      args=splitArgs(inner);
      return String(resolveArg(args[0])).split(String(resolveArg(args[1]))).join(String(resolveArg(args[2])));
    }
if((inner=matchFn('VALOR\\.NUMERO|NUMBERVALUE'))!==null){
      args=splitArgs(inner);
      var txt1=String(resolveArg(args[0]));
      var decSep=args[1]?String(resolveArg(args[1])):'.';
      var grpSep=args[2]?String(resolveArg(args[2])): ',';
      txt1=txt1.replace(new RegExp(String.fromCharCode(92)+grpSep,'g'),'').replace(decSep,'.');
      return fmtNum(parseFloat(txt1));
    }
if((inner=matchFn('MONEDA\\.CR'))!==null){
      args=splitArgs(inner);
      return '₡'+resolveNum(args[0]).toLocaleString('es-CR',{minimumFractionDigits:2,maximumFractionDigits:2});
    }
if((inner=matchFn('FRACCION'))!==null){
      var n15=resolveNum(splitArgs(inner)[0]);
      var ent3=Math.trunc(n15),frac3=n15-ent3;
      if(Math.abs(frac3)<0.001)return String(ent3);
      // Aproximación de fracción con denominador <=100
      var bestN=1,bestD=1,bestErr=999;
      for(var d5=1;d5<=100;d5++){
        var n16=Math.round(frac3*d5);
        var err=Math.abs(frac3-n16/d5);
        if(err<bestErr){bestErr=err;bestN=n16;bestD=d5;}
      }
      return (ent3!==0?ent3+' ':'')+bestN+'/'+bestD;
    }
if((inner=matchFn('DETECTARIDIOMA|DETECTLANGUAGE'))!==null){
      var txt2=String(resolveArg(splitArgs(inner)[0])).toLowerCase();
      if(/[áéíóúñ¿¡]/.test(txt2))return 'es';
      if(/[àâäôûùç]/.test(txt2))return 'fr';
      if(/[äöüß]/.test(txt2))return 'de';
      return 'en';
    }
if((inner=matchFn('REGEXEXTRACCION|REGEXEXTRACT'))!==null){
      args=splitArgs(inner);
      try{
        var m1=String(resolveArg(args[0])).match(new RegExp(String(resolveArg(args[1]))));
        return m1?m1[0]:'#N/A';
      }catch(e2){return '#VALOR!';}
    }
if((inner=matchFn('REGEXPRUEBA|REGEXTEST'))!==null){
      args=splitArgs(inner);
      try{
        return new RegExp(String(resolveArg(args[1]))).test(String(resolveArg(args[0])))?'VERDADERO':'FALSO';
      }catch(e3){return '#VALOR!';}
    }
if((inner=matchFn('REGEXREEMPLAZAR|REGEXREPLACE'))!==null){
      args=splitArgs(inner);
      try{
        return String(resolveArg(args[0])).replace(new RegExp(String(resolveArg(args[1])),'g'),String(resolveArg(args[2])));
      }catch(e4){return '#VALOR!';}
    }
if((inner=matchFn('FORMULATEXTO|FORMULATEXT'))!==null){
      var ref1=splitArgs(inner)[0].trim().toUpperCase();
      return getRaw(ref1)||'';
    }
if((inner=matchFn('ISO\\.NUM\\.DE\\.SEMANA|ISOWEEKNUM'))!==null){
      var d13_=new Date(String(resolveArg(splitArgs(inner)[0])));
      var jan4=new Date(d13_.getFullYear(),0,4);
      var startOfWeek=new Date(jan4);
      startOfWeek.setDate(jan4.getDate()-(jan4.getDay()||7)+1);
      return String(Math.ceil((d13_-startOfWeek)/604800000)+1);
    }
if((inner=matchFn('NSHORA|TIME'))!==null){
      args=splitArgs(inner);
      var h1=resolveNum(args[0]),m2=resolveNum(args[1]),s1=resolveNum(args[2]);
      return String(h1).padStart(2,'0')+':'+String(m2).padStart(2,'0')+':'+String(s1).padStart(2,'0');
    }
if((inner=matchFn('HORANUMERO|TIMEVALUE'))!==null){
      var t1=String(resolveArg(splitArgs(inner)[0]));
      var parts1=t1.split(':');
      return fmtNum((parseInt(parts1[0]||0)*3600+parseInt(parts1[1]||0)*60+parseInt(parts1[2]||0))/86400);
    }
if((inner=matchFn('FECHANUMERO|DATEVALUE'))!==null){
      var d14_=new Date(String(resolveArg(splitArgs(inner)[0])));
      var base=new Date(1900,0,1);
      return String(Math.round((d14_-base)/86400000)+1);
    }
if((inner=matchFn('DIAS360'))!==null){
      args=splitArgs(inner);
      var d15_=new Date(String(resolveArg(args[0])));
      var d16_=new Date(String(resolveArg(args[1])));
      var y1_=d16_.getFullYear()-d15_.getFullYear();
      var m3_=d16_.getMonth()-d15_.getMonth();
      var d17_=Math.min(d16_.getDate(),30)-Math.min(d15_.getDate(),30);
      return String(y1_*360+m3_*30+d17_);
    }
if((inner=matchFn('COINCIDIRX|XMATCH'))!==null){
      args=splitArgs(inner);
      var sv5=String(resolveArg(args[0])).toLowerCase();
      var mode=args[2]?parseInt(resolveNum(args[2])):0;
      if(isRange(args[1])){
        var mVals=rangeVals(args[1]);
        for(var i13=0;i13<mVals.length;i13++){
          if(mode===0&&String(mVals[i13]).toLowerCase()===sv5)return String(i13+1);
          if(mode===2&&matchCrit(mVals[i13],sv5))return String(i13+1);
        }
      }
      return '#N/A';
    }
if((inner=matchFn('TOMAR|TAKE'))!==null){
      args=splitArgs(inner);
      var n17=parseInt(resolveNum(args[1]));
      if(isRange(args[0])){
        var tv=rangeVals(args[0]);
        return (n17>=0?tv.slice(0,n17):tv.slice(n17)).join('; ');
      }
      return '#VALOR!';
    }
if((inner=matchFn('EXCLUIR|DROP'))!==null){
      args=splitArgs(inner);
      var n18=parseInt(resolveNum(args[1]));
      if(isRange(args[0])){
        var dv=rangeVals(args[0]);
        return (n18>=0?dv.slice(n18):dv.slice(0,dv.length+n18)).join('; ');
      }
      return '#VALOR!';
    }
if((inner=matchFn('EXPANDIR|EXPAND'))!==null){
      args=splitArgs(inner);
      if(isRange(args[0])){
        var ev=rangeVals(args[0]);
        var target=parseInt(resolveNum(args[1]));
        var fill=args[3]?String(resolveArg(args[3])):'';
        while(ev.length<target)ev.push(fill);
        return ev.join('; ');
      }
      return '#VALOR!';
    }
if((inner=matchFn('ELEGIRCOLS|CHOOSECOLS'))!==null){
      args=splitArgs(inner);
      if(isRange(args[0])&&args.length>1){
        var p6=args[0].trim().split(':');
        var fc5=colIndex(p6[0].match(/[A-Za-z]+/)[0]);
        var fr4=parseInt(p6[0].match(/\\d+/)[0])-1;
        var tr4=parseInt(p6[1].match(/\\d+/)[0])-1;
        var result2=[];
        for(var i14=1;i14<args.length;i14++){
          var colOff=parseInt(resolveNum(args[i14]))-1;
          for(var r5=fr4;r5<=tr4;r5++) result2.push(computeValue(cellId(r5,fc5+colOff)));
        }
        return result2.join('; ');
      }
      return '#VALOR!';
    }
if((inner=matchFn('ELEGIRFILAS|CHOOSEROWS'))!==null){
      args=splitArgs(inner);
      if(isRange(args[0])&&args.length>1){
        var p7=args[0].trim().split(':');
        var fc6=colIndex(p7[0].match(/[A-Za-z]+/)[0]);
        var tc3=colIndex(p7[1].match(/[A-Za-z]+/)[0]);
        var fr5=parseInt(p7[0].match(/\\d+/)[0])-1;
        var result3=[];
        for(var i15=1;i15<args.length;i15++){
          var rowOff=parseInt(resolveNum(args[i15]))-1;
          for(var c2=fc6;c2<=tc3;c2++) result3.push(computeValue(cellId(fr5+rowOff,c2)));
        }
        return result3.join('; ');
      }
      return '#VALOR!';
    }
if((inner=matchFn('ENCOL|TOCOL'))!==null){
      args=splitArgs(inner);
      if(isRange(args[0])) return rangeVals(args[0]).filter(function(v){return v!=='';}).join('; ');
      return '#VALOR!';
    }
if((inner=matchFn('ENFILA|TOROW'))!==null){
      args=splitArgs(inner);
      if(isRange(args[0])) return rangeVals(args[0]).filter(function(v){return v!=='';}).join(' | ');
      return '#VALOR!';
    }
if((inner=matchFn('HIPERVINCULO|HYPERLINK'))!==null){
      args=splitArgs(inner);
      return args[1]?String(resolveArg(args[1])):String(resolveArg(args[0]));
    }
if((inner=matchFn('RECORTAR\\.RANGO|TRIMRANGE'))!==null){
      args=splitArgs(inner);
      if(isRange(args[0])){
        var tv2=rangeVals(args[0]).filter(function(v){return v!=='';});
        return tv2.join('; ');
      }
      return '#VALOR!';
    }
if((inner=matchFn('TIPO\\.DE\\.ERROR|ERROR\\.TYPE'))!==null){
      var v1=String(resolveArg(splitArgs(inner)[0]));
      var errMap={'#NULL!':1,'#DIV/0!':2,'#VALOR!':3,'#REF!':4,'#NOMBRE?':5,'#NUM!':6,'#N/A':7};
      return String(errMap[v1]||'#N/A');
    }
if((inner=matchFn('HOJA|SHEET'))!==null){
      return String((typeof activeSheet!=='undefined'?activeSheet:0)+1);
    }
if((inner=matchFn('HOJAS|SHEETS'))!==null){
      return String(typeof sheets!=='undefined'?sheets.length:1);
    }
if((inner=matchFn('ESREF|ISREF'))!==null){
      var ref2=splitArgs(inner)[0].trim();
      return /^[A-Za-z]+\\d+(:[A-Za-z]+\\d+)?$/.test(ref2)?'VERDADERO':'FALSO';
    }
if((inner=matchFn('ESLOGICO|ISLOGICAL'))!==null){
      var v2=resolveArg(splitArgs(inner)[0]);
      return (v2===true||v2===false||v2==='VERDADERO'||v2==='FALSO')?'VERDADERO':'FALSO';
    }
if((inner=matchFn('ESNOTEXTO|ISNONTEXT'))!==null){
      var v3=resolveArg(splitArgs(inner)[0]);
      return (!isNaN(parseFloat(v3))||v3===true||v3===false||v3==='')?'VERDADERO':'FALSO';
    }
if((inner=matchFn('NOD'))!==null){ return '#N/A'; }
if((inner=matchFn('INFO'))!==null){
      var tipo=String(resolveArg(splitArgs(inner)[0])).toLowerCase();
      if(tipo==='version')return 'Matriz Contable CR v13.6';
      if(tipo==='directory'||tipo==='directorio')return '/';
      if(tipo==='numfile')return '1';
      return '#VALOR!';
    }
if((inner=matchFn('CELDA|CELL'))!==null){
      args=splitArgs(inner);
      var tipo2=String(resolveArg(args[0])).toLowerCase();
      var ref3=args[1]?args[1].trim().toUpperCase():cellId(row,col);
      if(tipo2==='address')return '$'+ref3;
      if(tipo2==='col')return String(colIndex((ref3.match(/[A-Z]+/)||['A'])[0])+1);
      if(tipo2==='row')return String(parseInt((ref3.match(/\\d+/)||[1])[0]));
      if(tipo2==='contents')return String(computeValue(ref3));
      if(tipo2==='type'){var v4=computeValue(ref3);return v4===''?'b':(!isNaN(parseFloat(v4))?'n':'l');}
      if(tipo2==='format')return 'G';
      return String(computeValue(ref3));
    }
if ((inner=matchFn('DISTR\\.BETA\\.N|DISTR\\.BETA|BETA\\.DIST'))!==null) {
      args=splitArgs(inner);
      var x1=resolveNum(args[0]),a1=resolveNum(args[1]),b1=resolveNum(args[2]);
      var acum=String(resolveArg(args[3]||'VERDADERO')).toUpperCase()!=='FALSO';
      var lo=args[4]?resolveNum(args[4]):0, hi=args[5]?resolveNum(args[5]):1;
      var xn=(x1-lo)/(hi-lo);
      return fmtNum(acum?betaInc(xn,a1,b1):Math.pow(xn,a1-1)*Math.pow(1-xn,b1-1)/Math.exp(lnGamma(a1)+lnGamma(b1)-lnGamma(a1+b1)));
    }
if ((inner=matchFn('DISTR\\.BETA\\.INV\\.N|INV\\.BETA|BETA\\.INV'))!==null) {
      args=splitArgs(inner);
      var p1=resolveNum(args[0]),a2=resolveNum(args[1]),b2=resolveNum(args[2]);
      var lo2=args[3]?resolveNum(args[3]):0, hi2=args[4]?resolveNum(args[4]):1;
      // Binary search
      var lo3=0,hi3=1,mid,iter=0;
      while (hi3-lo3>1e-10&&iter<100) { mid=(lo3+hi3)/2; if(betaInc(mid,a2,b2)<p1) lo3=mid; else hi3=mid; iter++; }
      return fmtNum(lo2+(lo3+hi3)/2*(hi2-lo2));
    }
if ((inner=matchFn('DISTR\\.GAMMA\\.N|DISTR\\.GAMMA|GAMMA\\.DIST'))!==null) {
      args=splitArgs(inner);
      var x2=resolveNum(args[0]),a3=resolveNum(args[1]),b3=resolveNum(args[2]);
      var acum2=String(resolveArg(args[3]||'VERDADERO')).toUpperCase()!=='FALSO';
      if (acum2) {
        // Regularized incomplete gamma
        var xn2=x2/b3, sum=0, t1=1;
        for (var k=0;k<100;k++) { if(k>0)t1*=xn2/k; sum+=t1*Math.exp(-xn2+a3*Math.log(xn2)-lnGamma(a3+k+1)+lnGamma(a3)); }
        return fmtNum(Math.min(1,Math.max(0,1-Math.exp(-xn2)*Math.pow(xn2,a3)/gamma(a3))));
      }
      return fmtNum(Math.pow(x2,a3-1)*Math.exp(-x2/b3)/(Math.pow(b3,a3)*gamma(a3)));
    }
if ((inner=matchFn('INV\\.GAMMA|GAMMA\\.INV'))!==null) {
      args=splitArgs(inner);
      var p2=resolveNum(args[0]),a4=resolveNum(args[1]),b4=resolveNum(args[2]);
      // Approximation
      var x3=a4*Math.pow(1-1/(9*a4)+Math.sqrt(1/(9*a4))*normCDF(p2)*-1,3);
      return fmtNum(Math.max(0,x3)*b4);
    }
if ((inner=matchFn('GAMMA\\.LN\\.EXACTO|GAMMA\\.LN|GAMMALN'))!==null) {
      return fmtNum(lnGamma(resolveNum(splitArgs(inner)[0])));
    }
if ((inner=matchFn('FUNCION\\.GAMMA|GAMMA(?!\\.)'))!==null) {
      return fmtNum(gamma(resolveNum(splitArgs(inner)[0])));
    }
if ((inner=matchFn('DISTR\\.HIPERGEOM\\.N|DISTR\\.HIPERGEOM|HYPGEOM\\.DIST'))!==null) {
      args=splitArgs(inner);
      var x4=parseInt(resolveNum(args[0])),ns=parseInt(resolveNum(args[1]));
      var Ns=parseInt(resolveNum(args[2])),N=parseInt(resolveNum(args[3]));
      function comb2(n,k){if(k<0||k>n)return 0;var r=1;for(var i=0;i<Math.min(k,n-k);i++)r=r*(n-i)/(i+1);return r;}
      var pmf=comb2(Ns,x4)*comb2(N-Ns,ns-x4)/comb2(N,ns);
      var acum3=args[4]&&String(resolveArg(args[4])).toUpperCase()!=='FALSO';
      if (acum3){var s=0;for(var i3=0;i3<=x4;i3++)s+=comb2(Ns,i3)*comb2(N-Ns,ns-i3)/comb2(N,ns);return fmtNum(s);}
      return fmtNum(pmf);
    }
if ((inner=matchFn('DISTR\\.BINOM\\.NEG\\.N|DISTR\\.BINOM\\.NEG|NEGBINOM\\.DIST'))!==null) {
      args=splitArgs(inner);
      var f1=parseInt(resolveNum(args[0])),r1=parseInt(resolveNum(args[1])),p3=resolveNum(args[2]);
      function comb3(n,k){var r=1;for(var i=0;i<k;i++)r=r*(n-i)/(i+1);return r;}
      return fmtNum(comb3(f1+r1-1,f1)*Math.pow(p3,r1)*Math.pow(1-p3,f1));
    }
if ((inner=matchFn('WEIBULL\\.DIST|DISTR\\.WEIBULL'))!==null) {
      args=splitArgs(inner);
      var x5=resolveNum(args[0]),a5=resolveNum(args[1]),b5=resolveNum(args[2]);
      var acum4=String(resolveArg(args[3]||'VERDADERO')).toUpperCase()!=='FALSO';
      return fmtNum(acum4?1-Math.exp(-Math.pow(x5/b5,a5)):a5/b5*Math.pow(x5/b5,a5-1)*Math.exp(-Math.pow(x5/b5,a5)));
    }
if ((inner=matchFn('DISTR\\.LOGNORM\\.N|DISTR\\.LOGNORM|LOGNORM\\.DIST'))!==null) {
      args=splitArgs(inner);
      var x6=resolveNum(args[0]),mu=resolveNum(args[1]),sig=resolveNum(args[2]);
      var acum5=String(resolveArg(args[3]||'VERDADERO')).toUpperCase()!=='FALSO';
      if (x6<=0) return fmtNum(0);
      var z1=(Math.log(x6)-mu)/sig;
      return fmtNum(acum5?normCDF(z1):Math.exp(-Math.pow(Math.log(x6)-mu,2)/(2*sig*sig))/(x6*sig*Math.sqrt(2*Math.PI)));
    }
if ((inner=matchFn('INV\\.LOGNORM|LOGNORM\\.INV'))!==null) {
      args=splitArgs(inner);
      var p4=resolveNum(args[0]),mu2=resolveNum(args[1]),sig2=resolveNum(args[2]);
      function normInv2(p){
        var c0=2.515517,c1=0.802853,c2=0.010328,d1=1.432788,d2=0.189269,d3=0.001308;
        var t=p<0.5?Math.sqrt(-2*Math.log(p)):Math.sqrt(-2*Math.log(1-p));
        var x=t-(c0+c1*t+c2*t*t)/(1+d1*t+d2*t*t+d3*t*t*t);
        return p<0.5?-x:x;
      }
      return fmtNum(Math.exp(mu2+sig2*normInv2(p4)));
    }
if ((inner=matchFn('INV\\.T\\.2C|INV\\.T|T\\.INV\\.2T|T\\.INV'))!==null) {
      args=splitArgs(inner);
      var p5=resolveNum(args[0]),df2=resolveNum(args[1]);
      // Approximation using normal + correction
      function normInv3(p){var c0=2.515517,c1=0.802853,c2=0.010328,d1=1.432788,d2=0.189269,d3=0.001308;var t=p<0.5?Math.sqrt(-2*Math.log(p)):Math.sqrt(-2*Math.log(1-p));var x=t-(c0+c1*t+c2*t*t)/(1+d1*t+d2*t*t+d3*t*t*t);return p<0.5?-x:x;}
      var p6=exprUp.includes('2C')||exprUp.includes('2T')?p5/2:p5;
      var z2=normInv3(1-p6);
      // Cornish-Fisher expansion
      var t2=z2+(z2*z2*z2+z2)/(4*df2)+(5*Math.pow(z2,5)+16*Math.pow(z2,3)+3*z2)/(96*df2*df2);
      return fmtNum(exprUp.includes('2C')||exprUp.includes('2T')?Math.abs(t2):t2);
    }
if ((inner=matchFn('INV\\.F\\.CD|INV\\.F|F\\.INV\\.RT|F\\.INV'))!==null) {
      args=splitArgs(inner);
      var p7=resolveNum(args[0]),d1_=resolveNum(args[1]),d2_=resolveNum(args[2]);
      // Approximation via beta inverse
      var bInv=betaInc(d1_*p7/(d1_*p7+d2_),d1_/2,d2_/2);
      return fmtNum(d2_*p7/(d1_*(1-p7)));
    }
if ((inner=matchFn('INV\\.CHICUAD\\.CD|INV\\.CHICUAD|CHISQ\\.INV\\.RT|CHISQ\\.INV'))!==null) {
      args=splitArgs(inner);
      var p8=resolveNum(args[0]),k3=resolveNum(args[1]);
      if (exprUp.includes('CD')||exprUp.includes('RT')) p8=1-p8;
      // Wilson-Hilferty approximation
      var h=2/(9*k3);
      function normInv4(p){var c0=2.515517,c1=0.802853,c2=0.010328,d1=1.432788,d2=0.189269,d3=0.001308;var t=p<0.5?Math.sqrt(-2*Math.log(p)):Math.sqrt(-2*Math.log(1-p));var x=t-(c0+c1*t+c2*t*t)/(1+d1*t+d2*t*t+d3*t*t*t);return p<0.5?-x:x;}
      var z3=normInv4(p8);
      return fmtNum(Math.max(0,k3*Math.pow(1-h+z3*Math.sqrt(h),3)));
    }
if ((inner=matchFn('PRUEBA\\.T\\.N|PRUEBA\\.T|T\\.TEST'))!==null) {
      args=splitArgs(inner);
      var y1=isRange(args[0])?rangeNums(args[0]):[],x1=isRange(args[1])?rangeNums(args[1]):[];
      var n1=Math.min(y1.length,x1.length);
      var my=y1.reduce(function(a,b){return a+b;},0)/n1,mx=x1.reduce(function(a,b){return a+b;},0)/n1;
      var sy=y1.reduce(function(s,v){return s+(v-my)*(v-my);},0)/(n1-1);
      var sx=x1.reduce(function(s,v){return s+(v-mx)*(v-mx);},0)/(n1-1);
      var t3=Math.abs(my-mx)/Math.sqrt((sy+sx)/n1);
      var df3=n1-1;
      return fmtNum(2*(1-normCDF(t3*Math.sqrt(df3/(df3+t3*t3)))));
    }
if ((inner=matchFn('PRUEBA\\.F\\.N|PRUEBA\\.F|F\\.TEST'))!==null) {
      args=splitArgs(inner);
      var y2=isRange(args[0])?rangeNums(args[0]):[],x2=isRange(args[1])?rangeNums(args[1]):[];
      var n2=y2.length,n3=x2.length;
      var my2=y2.reduce(function(a,b){return a+b;},0)/n2,mx2=x2.reduce(function(a,b){return a+b;},0)/n3;
      var vy=y2.reduce(function(s,v){return s+(v-my2)*(v-my2);},0)/(n2-1);
      var vx=x2.reduce(function(s,v){return s+(v-mx2)*(v-mx2);},0)/(n3-1);
      return fmtNum(vy/vx);
    }
if ((inner=matchFn('PRUEBA\\.Z\\.N|PRUEBA\\.Z|Z\\.TEST'))!==null) {
      args=splitArgs(inner);
      var data=isRange(args[0])?rangeNums(args[0]):[];
      var mu3=resolveNum(args[1]);
      var sig3=args[2]?resolveNum(args[2]):null;
      var n4=data.length;
      var mean=data.reduce(function(a,b){return a+b;},0)/n4;
      var s1=sig3||Math.sqrt(data.reduce(function(s,v){return s+(v-mean)*(v-mean);},0)/(n4-1));
      var z4=(mean-mu3)/(s1/Math.sqrt(n4));
      return fmtNum(1-normCDF(z4));
    }
if ((inner=matchFn('PRUEBA\\.CHICUAD|CHISQ\\.TEST'))!==null) {
      args=splitArgs(inner);
      var obs=isRange(args[0])?rangeNums(args[0]):[];
      var exp=isRange(args[1])?rangeNums(args[1]):[];
      var chi=0,df4=obs.length-1;
      for (var i=0;i<obs.length;i++) if(exp[i]) chi+=Math.pow(obs[i]-exp[i],2)/exp[i];
      return fmtNum(1-normCDF(Math.sqrt(2*chi)-Math.sqrt(2*df4-1)));
    }
if ((inner=matchFn('COVARIANZA\\.P|COVARIANCE\\.P'))!==null) {
      args=splitArgs(inner);
      var y3=isRange(args[0])?rangeNums(args[0]):[],x3=isRange(args[1])?rangeNums(args[1]):[];
      var n5=Math.min(y3.length,x3.length);
      var my3=y3.reduce(function(a,b){return a+b;},0)/n5,mx3=x3.reduce(function(a,b){return a+b;},0)/n5;
      var cov=0;for(var i2=0;i2<n5;i2++)cov+=(y3[i2]-my3)*(x3[i2]-mx3);
      return fmtNum(cov/n5);
    }
if ((inner=matchFn('COVARIANZA\\.M|COVARIANCE\\.S'))!==null) {
      args=splitArgs(inner);
      var y4=isRange(args[0])?rangeNums(args[0]):[],x4=isRange(args[1])?rangeNums(args[1]):[];
      var n6=Math.min(y4.length,x4.length);
      var my4=y4.reduce(function(a,b){return a+b;},0)/n6,mx4=x4.reduce(function(a,b){return a+b;},0)/n6;
      var cov2=0;for(var i3=0;i3<n6;i3++)cov2+=(y4[i3]-my4)*(x4[i3]-mx4);
      return fmtNum(cov2/(n6-1));
    }
if ((inner=matchFn('BINOM\\.INV'))!==null) {
      args=splitArgs(inner);
      var n7=parseInt(resolveNum(args[0])),p9=resolveNum(args[1]),alpha=resolveNum(args[2]);
      function comb4(n,k){var r=1;for(var i=0;i<k;i++)r=r*(n-i)/(i+1);return r;}
      var cum=0;
      for (var k1=0;k1<=n7;k1++) {
        cum+=comb4(n7,k1)*Math.pow(p9,k1)*Math.pow(1-p9,n7-k1);
        if(cum>=alpha) return String(k1);
      }
      return String(n7);
    }
if ((inner=matchFn('DISTR\\.BINOM\\.SERIE|BINOM\\.DIST\\.RANGE'))!==null) {
      args=splitArgs(inner);
      var n8=parseInt(resolveNum(args[0])),p10=resolveNum(args[1]);
      var s1=parseInt(resolveNum(args[2])),s2=args[3]?parseInt(resolveNum(args[3])):s1;
      function comb5(n,k){var r=1;for(var i=0;i<k;i++)r=r*(n-i)/(i+1);return r;}
      var sum2=0;
      for(var k2=s1;k2<=s2;k2++) sum2+=comb5(n8,k2)*Math.pow(p10,k2)*Math.pow(1-p10,n8-k2);
      return fmtNum(sum2);
    }
if ((inner=matchFn('PERMUTACIONES\\.A|PERMUTATIONA'))!==null) {
      args=splitArgs(inner);
      return fmtNum(Math.pow(resolveNum(args[0]),resolveNum(args[1])));
    }
if ((inner=matchFn('PROBABILIDAD|PROB'))!==null) {
      args=splitArgs(inner);
      var xRange=isRange(args[0])?rangeNums(args[0]):[];
      var pRange=isRange(args[1])?rangeNums(args[1]):[];
      var lo3=resolveNum(args[2]),hi3=args[3]?resolveNum(args[3]):lo3;
      var sum3=0;
      xRange.forEach(function(v,i){if(v>=lo3&&v<=hi3)sum3+=pRange[i]||0;});
      return fmtNum(sum3);
    }
if ((inner=matchFn('ESTIMACION\\.LINEAL|LINEST'))!==null) {
      args=splitArgs(inner);
      var y5=isRange(args[0])?rangeNums(args[0]):[],x5=isRange(args[1])?rangeNums(args[1]):[];
      var n9=Math.min(y5.length,x5.length);
      var my5=y5.reduce(function(a,b){return a+b;},0)/n9,mx5=x5.reduce(function(a,b){return a+b;},0)/n9;
      var num=0,den=0;
      for(var i4=0;i4<n9;i4++){num+=(x5[i4]-mx5)*(y5[i4]-my5);den+=(x5[i4]-mx5)*(x5[i4]-mx5);}
      var m=num/den,b=my5-m*mx5;
      return fmtNum(m)+'; '+fmtNum(b);
    }
if ((inner=matchFn('ESTIMACION\\.LOGARITMICA|LOGEST'))!==null) {
      args=splitArgs(inner);
      var y6=isRange(args[0])?rangeNums(args[0]).map(Math.log):[];
      var x6=isRange(args[1])?rangeNums(args[1]):[];
      var n10=Math.min(y6.length,x6.length);
      var my6=y6.reduce(function(a,b){return a+b;},0)/n10,mx6=x6.reduce(function(a,b){return a+b;},0)/n10;
      var num2=0,den2=0;
      for(var i5=0;i5<n10;i5++){num2+=(x6[i5]-mx6)*(y6[i5]-my6);den2+=(x6[i5]-mx6)*(x6[i5]-mx6);}
      var m2=num2/den2;
      return fmtNum(Math.exp(m2))+'; '+fmtNum(Math.exp(my6-m2*mx6));
    }
if ((inner=matchFn('CRECIMIENTO|GROWTH'))!==null) {
      args=splitArgs(inner);
      var y7=isRange(args[0])?rangeNums(args[0]):[],x7=isRange(args[1])?rangeNums(args[1]):[];
      var n11=Math.min(y7.length,x7.length);
      var lny=y7.map(Math.log);
      var my7=lny.reduce(function(a,b){return a+b;},0)/n11,mx7=x7.reduce(function(a,b){return a+b;},0)/n11;
      var num3=0,den3=0;
      for(var i6=0;i6<n11;i6++){num3+=(x7[i6]-mx7)*(lny[i6]-my7);den3+=(x7[i6]-mx7)*(x7[i6]-mx7);}
      var m3=num3/den3,b3=my7-m3*mx7;
      var newX=args[2]?isRange(args[2])?rangeNums(args[2]):[resolveNum(args[2])]:x7;
      return newX.map(function(x){return fmtNum(Math.exp(b3+m3*x));}).join('; ');
    }
if ((inner=matchFn('TENDENCIA|TREND'))!==null) {
      args=splitArgs(inner);
      var y8=isRange(args[0])?rangeNums(args[0]):[],x8=isRange(args[1])?rangeNums(args[1]):[];
      var n12=Math.min(y8.length,x8.length);
      var my8=y8.reduce(function(a,b){return a+b;},0)/n12,mx8=x8.reduce(function(a,b){return a+b;},0)/n12;
      var num4=0,den4=0;
      for(var i7=0;i7<n12;i7++){num4+=(x8[i7]-mx8)*(y8[i7]-my8);den4+=(x8[i7]-mx8)*(x8[i7]-mx8);}
      var m4=num4/den4,b4=my8-m4*mx8;
      var newX2=args[2]?isRange(args[2])?rangeNums(args[2]):[resolveNum(args[2])]:x8;
      return newX2.map(function(x){return fmtNum(b4+m4*x);}).join('; ');
    }
if ((inner=matchFn('FRECUENCIA|FREQUENCY'))!==null) {
      args=splitArgs(inner);
      var data2=isRange(args[0])?rangeNums(args[0]):[];
      var bins=isRange(args[1])?rangeNums(args[1]).sort(function(a,b){return a-b;}):[];
      var result=bins.map(function(bin,i){
        var lo4=i===0?-Infinity:bins[i-1];
        return data2.filter(function(v){return v>lo4&&v<=bin;}).length;
      });
      result.push(data2.filter(function(v){return v>bins[bins.length-1];}).length);
      return result.join('; ');
    }
if ((inner=matchFn('DESVESTA|STDEVA'))!==null) {
      args=splitArgs(inner);
      nums=isRange(args[0])?rangeNums(args[0]):args.map(resolveNum);
      var mean2=nums.reduce(function(a,b){return a+b;},0)/nums.length;
      return fmtNum(Math.sqrt(nums.reduce(function(s,n){return s+(n-mean2)*(n-mean2);},0)/(nums.length-1)));
    }
if ((inner=matchFn('DESVESTPA|STDEVPA'))!==null) {
      args=splitArgs(inner);
      nums=isRange(args[0])?rangeNums(args[0]):args.map(resolveNum);
      var mean3=nums.reduce(function(a,b){return a+b;},0)/nums.length;
      return fmtNum(Math.sqrt(nums.reduce(function(s,n){return s+(n-mean3)*(n-mean3);},0)/nums.length));
    }
if ((inner=matchFn('VARA'))!==null) {
      args=splitArgs(inner);
      nums=isRange(args[0])?rangeNums(args[0]):args.map(resolveNum);
      var mean4=nums.reduce(function(a,b){return a+b;},0)/nums.length;
      return fmtNum(nums.reduce(function(s,n){return s+(n-mean4)*(n-mean4);},0)/(nums.length-1));
    }
if ((inner=matchFn('VARPA'))!==null) {
      args=splitArgs(inner);
      nums=isRange(args[0])?rangeNums(args[0]):args.map(resolveNum);
      var mean5=nums.reduce(function(a,b){return a+b;},0)/nums.length;
      return fmtNum(nums.reduce(function(s,n){return s+(n-mean5)*(n-mean5);},0)/nums.length);
    }
if ((inner=matchFn('MODA\\.VARIOS|MODE\\.MULT'))!==null) {
      args=splitArgs(inner);
      nums=isRange(args[0])?rangeNums(args[0]):args.map(resolveNum);
      var freq={};
      nums.forEach(function(n){freq[n]=(freq[n]||0)+1;});
      var maxF=Math.max.apply(null,Object.values(freq));
      return Object.keys(freq).filter(function(k){return freq[k]===maxF;}).join('; ');
    }
if ((inner=matchFn('PRUEBA\\.FISHER(?!\\.)|FISHER(?!\\.INV)'))!==null) {
      var x9=resolveNum(splitArgs(inner)[0]);
      return fmtNum(0.5*Math.log((1+x9)/(1-x9)));
    }
if ((inner=matchFn('PRUEBA\\.FISHER\\.INV|FISHERINV'))!==null) {
      var y9=resolveNum(splitArgs(inner)[0]);
      return fmtNum((Math.exp(2*y9)-1)/(Math.exp(2*y9)+1));
    }
if ((inner=matchFn('INV\\.NORM\\.ESTAND|NORM\\.S\\.INV'))!==null) {
      var p11=resolveNum(splitArgs(inner)[0]);
      var c0=2.515517,c1=0.802853,c2=0.010328,d1=1.432788,d2=0.189269,d3=0.001308;
      var t4=p11<0.5?Math.sqrt(-2*Math.log(p11)):Math.sqrt(-2*Math.log(1-p11));
      var x10=t4-(c0+c1*t4+c2*t4*t4)/(1+d1*t4+d2*t4*t4+d3*t4*t4*t4);
      return fmtNum(p11<0.5?-x10:x10);
    }
if ((inner=matchFn('INTERVALO\\.CONFIANZA\\.T|CONFIDENCE\\.T'))!==null) {
      args=splitArgs(inner);
      var alpha2=resolveNum(args[0]),sig4=resolveNum(args[1]),n13=resolveNum(args[2]);
      var df5=n13-1;
      var h=2/(9*df5);
      function normInv5(p){var c0=2.515517,c1=0.802853,c2=0.010328,d1=1.432788,d2=0.189269,d3=0.001308;var t=p<0.5?Math.sqrt(-2*Math.log(p)):Math.sqrt(-2*Math.log(1-p));var x=t-(c0+c1*t+c2*t*t)/(1+d1*t+d2*t*t+d3*t*t*t);return p<0.5?-x:x;}
      var z5=normInv5(1-alpha2/2);
      var t5=z5*(1+z5*z5/(4*df5));
      return fmtNum(t5*sig4/Math.sqrt(n13));
    }
if ((inner=matchFn('PRONOSTICO\\.ETS|FORECAST\\.ETS'))!==null) {
      args=splitArgs(inner);
      var vals2=isRange(args[1])?rangeNums(args[1]):[];
      if (!vals2.length) return '#VALOR!';
      // Simple exponential smoothing
      var alpha3=0.3,smoothed=vals2[0];
      for (var i8=1;i8<vals2.length;i8++) smoothed=alpha3*vals2[i8]+(1-alpha3)*smoothed;
      return fmtNum(smoothed);
    }
if ((inner=matchFn('SUMA\\.SERIES|SERIESSUM'))!==null) {
      args=splitArgs(inner);
      var x11=resolveNum(args[0]),n14=resolveNum(args[1]),m5=resolveNum(args[2]);
      var coefs=isRange(args[3])?rangeNums(args[3]):[resolveNum(args[3])];
      var sum4=0;
      coefs.forEach(function(c,i){sum4+=c*Math.pow(x11,n14+i*m5);});
      return fmtNum(sum4);
    }
if ((inner=matchFn('REDONDEA\\.PAR|EVEN'))!==null) {
      var n15=resolveNum(splitArgs(inner)[0]);
      return fmtNum(n15>=0?Math.ceil(n15/2)*2:Math.floor(n15/2)*2);
    }
if ((inner=matchFn('REDONDEA\\.IMPAR|ODD'))!==null) {
      var n16=resolveNum(splitArgs(inner)[0]);
      var r1=Math.ceil(Math.abs(n16));if(r1%2===0)r1++;
      return fmtNum(n16>=0?r1:-r1);
    }
if ((inner=matchFn('SUMAR\\.CUADRADOS\\.DIFERENCIAS|SUMXMY2'))!==null) {
      args=splitArgs(inner);
      var a1=isRange(args[0])?rangeNums(args[0]):[],b1=isRange(args[1])?rangeNums(args[1]):[];
      var s1=0;for(var i9=0;i9<Math.min(a1.length,b1.length);i9++)s1+=Math.pow(a1[i9]-b1[i9],2);
      return fmtNum(s1);
    }
if ((inner=matchFn('SUMAR\\.X2\\.MENOS\\.Y2|SUMX2MY2'))!==null) {
      args=splitArgs(inner);
      var a2=isRange(args[0])?rangeNums(args[0]):[],b2=isRange(args[1])?rangeNums(args[1]):[];
      var s2=0;for(var i10=0;i10<Math.min(a2.length,b2.length);i10++)s2+=a2[i10]*a2[i10]-b2[i10]*b2[i10];
      return fmtNum(s2);
    }
if ((inner=matchFn('SUMAR\\.X2\\.MAS\\.Y2|SUMX2PY2'))!==null) {
      args=splitArgs(inner);
      var a3=isRange(args[0])?rangeNums(args[0]):[],b3=isRange(args[1])?rangeNums(args[1]):[];
      var s3=0;for(var i11=0;i11<Math.min(a3.length,b3.length);i11++)s3+=a3[i11]*a3[i11]+b3[i11]*b3[i11];
      return fmtNum(s3);
    }
if ((inner=matchFn('FACT\\.DOBLE|FACTDOUBLE'))!==null) {
      var n17=parseInt(resolveNum(splitArgs(inner)[0]));
      var f1=1;for(var i12=n17;i12>=2;i12-=2)f1*=i12;
      return fmtNum(f1);
    }
if ((inner=matchFn('LOG\\.GAMMA|GAMMALN\\.PRECISE'))!==null) {
      return fmtNum(lnGamma(resolveNum(splitArgs(inner)[0])));
    }
if ((inner=matchFn('CHEBYSHEV'))!==null) {
      args=splitArgs(inner);
      var k4=resolveNum(args[0]);
      return fmtNum(1-1/(k4*k4));
    }
if ((inner=matchFn('TASA\\.DESC|DISC'))!==null) {
      args=splitArgs(inner);
      var d1=new Date(String(resolveArg(args[0]))),d2=new Date(String(resolveArg(args[1])));
      var pr=resolveNum(args[2]),reemb=resolveNum(args[3]);
      var dias=(d2-d1)/86400000;
      return fmtNum((reemb-pr)/reemb*360/dias);
    }
if ((inner=matchFn('PRECIO\\.DESCUENTO|PRICEDISC'))!==null) {
      args=splitArgs(inner);
      var d3=new Date(String(resolveArg(args[0]))),d4=new Date(String(resolveArg(args[1])));
      var disc=resolveNum(args[2]),reemb2=resolveNum(args[3]);
      var dias2=(d4-d3)/86400000;
      return fmtNum(reemb2*(1-disc*dias2/360));
    }
if ((inner=matchFn('RENDTO\\.DESC|YIELDDISC'))!==null) {
      args=splitArgs(inner);
      var d5=new Date(String(resolveArg(args[0]))),d6=new Date(String(resolveArg(args[1])));
      var pr2=resolveNum(args[2]),reemb3=resolveNum(args[3]);
      var dias3=(d6-d5)/86400000;
      return fmtNum((reemb3-pr2)/pr2*360/dias3);
    }
if ((inner=matchFn('PRECIO\\.VENCIMIENTO|PRICEMAT'))!==null) {
      args=splitArgs(inner);
      var tasa5=resolveNum(args[3]),yield4=resolveNum(args[4]);
      var d7=new Date(String(resolveArg(args[0]))),d8=new Date(String(resolveArg(args[2])));
      var dias4=(d8-d7)/86400000;
      return fmtNum(100*(1+tasa5*dias4/360)/(1+yield4*dias4/360));
    }
if ((inner=matchFn('RENDTO\\.VENCIMIENTO|YIELDMAT'))!==null) {
      args=splitArgs(inner);
      var pr3=resolveNum(args[3]),tasa6=resolveNum(args[4]);
      return fmtNum((1+tasa6-pr3/100)/(pr3/100));
    }
if ((inner=matchFn('TASA\\.INT|INTRATE'))!==null) {
      args=splitArgs(inner);
      var d9=new Date(String(resolveArg(args[0]))),d10=new Date(String(resolveArg(args[1])));
      var inv=resolveNum(args[2]),reemb4=resolveNum(args[3]);
      var dias5=(d10-d9)/86400000;
      return fmtNum((reemb4-inv)/inv*360/dias5);
    }
if ((inner=matchFn('TASA\\.EQUIVALENTE'))!==null) {
      args=splitArgs(inner);
      var r2=resolveNum(args[0]),n18=resolveNum(args[1]),n19=resolveNum(args[2]);
      return fmtNum(Math.pow(1+r2/n18,n18/n19)-1);
    }
if ((inner=matchFn('INT\\.ACUM\\.V|ACCRINTM'))!==null) {
      args=splitArgs(inner);
      var d11=new Date(String(resolveArg(args[0]))),d12=new Date(String(resolveArg(args[1])));
      var tasa7=resolveNum(args[2]),par2=args[3]?resolveNum(args[3]):1000;
      var dias6=(d12-d11)/86400000;
      return fmtNum(par2*tasa7*dias6/360);
    }
if ((inner=matchFn('CUPON\\.NUM|COUPNUM'))!==null) {
      args=splitArgs(inner);
      var d13=new Date(String(resolveArg(args[0]))),d14=new Date(String(resolveArg(args[1])));
      var freq5=resolveNum(args[2]);
      var meses=(d14.getFullYear()-d13.getFullYear())*12+(d14.getMonth()-d13.getMonth());
      return fmtNum(Math.ceil(meses/(12/freq5)));
    }
if ((inner=matchFn('CUPON\\.DIAS|COUPDAYS'))!==null) {
      args=splitArgs(inner);
      var freq6=resolveNum(args[2]);
      return fmtNum(360/freq6);
    }
if ((inner=matchFn('REEMPLAZARB|REPLACEB'))!==null) {
      args=splitArgs(inner);
      return String(resolveArg(args[0])).substring(0,parseInt(resolveNum(args[1]))-1)+
             String(resolveArg(args[3]))+
             String(resolveArg(args[0])).substring(parseInt(resolveNum(args[1]))-1+parseInt(resolveNum(args[2])));
    }
if ((inner=matchFn('LARGOB|LENB'))!==null) {
      return String(new TextEncoder().encode(String(resolveArg(splitArgs(inner)[0]))).length);
    }
if ((inner=matchFn('IZQUIERDAB|LEFTB'))!==null) {
      args=splitArgs(inner);
      return String(resolveArg(args[0])).substring(0,parseInt(resolveNum(args[1])));
    }
if ((inner=matchFn('DERECHAB|RIGHTB'))!==null) {
      args=splitArgs(inner);
      var s1=String(resolveArg(args[0])),n=parseInt(resolveNum(args[1]));
      return s1.substring(s1.length-n);
    }
if ((inner=matchFn('EXTRAEB|MIDB'))!==null) {
      args=splitArgs(inner);
      return String(resolveArg(args[0])).substring(parseInt(resolveNum(args[1]))-1,parseInt(resolveNum(args[1]))-1+parseInt(resolveNum(args[2])));
    }
if ((inner=matchFn('ENCONTRARB|FINDB'))!==null) {
      args=splitArgs(inner);
      var pos=String(resolveArg(args[1])).indexOf(String(resolveArg(args[0])));
      return pos>=0?String(pos+1):'#VALOR!';
    }
if ((inner=matchFn('HALLARB|SEARCHB'))!==null) {
      args=splitArgs(inner);
      var pos2=String(resolveArg(args[1])).toLowerCase().indexOf(String(resolveArg(args[0])).toLowerCase());
      return pos2>=0?String(pos2+1):'#VALOR!';
    }
if ((inner=matchFn('JIS|ASC'))!==null) {
      return String(resolveArg(splitArgs(inner)[0])); // passthrough para no-japonés
    }
if ((inner=matchFn('DIA\\.LAB\\.INTL|WORKDAY\\.INTL'))!==null) {
      args=splitArgs(inner);
      var d15=new Date(String(resolveArg(args[0]))),dias7=parseInt(resolveNum(args[1]));
      var wknd=args[2]?parseInt(resolveNum(args[2])):1;
      var offDays=wknd===2?[0,6]:wknd===3?[1,0]:wknd===11?[0]:wknd===12?[1]:wknd===13?[2]:wknd===14?[3]:wknd===15?[4]:wknd===16?[5]:wknd===17?[6]:[0,6];
      var added=0,dir=dias7>=0?1:-1,rem=Math.abs(dias7);
      while(rem>0){d15.setDate(d15.getDate()+dir);if(offDays.indexOf(d15.getDay())<0)rem--;}
      return d15.toLocaleDateString('es-CR');
    }
if ((inner=matchFn('DIAS\\.LAB\\.INTL|NETWORKDAYS\\.INTL'))!==null) {
      args=splitArgs(inner);
      var d16=new Date(String(resolveArg(args[0]))),d17=new Date(String(resolveArg(args[1])));
      var count2=0,cur=new Date(d16);
      while(cur<=d17){var day=cur.getDay();if(day!==0&&day!==6)count2++;cur.setDate(cur.getDate()+1);}
      return String(count2);
    }
if ((inner=matchFn('DIAS\\.EN\\.MES'))!==null) {
      args=splitArgs(inner);
      var d18=new Date(String(resolveArg(args[0])));
      return String(new Date(d18.getFullYear(),d18.getMonth()+1,0).getDate());
    }
if ((inner=matchFn('AÑO\\.BISIESTO|ESAÑO\\.BISIESTO'))!==null) {
      var yr=parseInt(resolveArg(splitArgs(inner)[0]));
      return (yr%4===0&&(yr%100!==0||yr%400===0))?'VERDADERO':'FALSO';
    }
if ((inner=matchFn('FUN\\.ERROR\\.EXACTO|FUN\\.ERROR(?!\\.COMPL)|ERF\\.PRECISE|ERF(?!\\.PRECISE)'))!==null) {
      args=splitArgs(inner);
      var x12=resolveNum(args[0]);
      // Approximation of erf
      var t5=1/(1+0.3275911*Math.abs(x12));
      var poly2=t5*(0.254829592+t5*(-0.284496736+t5*(1.421413741+t5*(-1.453152027+t5*1.061405429))));
      var erf=1-poly2*Math.exp(-x12*x12);
      return fmtNum(x12>=0?erf:-erf);
    }
if ((inner=matchFn('FUN\\.ERROR\\.COMPL\\.EXACTO|FUN\\.ERROR\\.COMPL|ERFC\\.PRECISE|ERFC'))!==null) {
      var x13=resolveNum(splitArgs(inner)[0]);
      var t6=1/(1+0.3275911*Math.abs(x13));
      var poly3=t6*(0.254829592+t6*(-0.284496736+t6*(1.421413741+t6*(-1.453152027+t6*1.061405429))));
      var erf2=1-poly3*Math.exp(-x13*x13);
      return fmtNum(x13>=0?1-erf2:1+erf2);
    }
if ((inner=matchFn('MAYOR\\.O\\.IGUAL|GESTEP'))!==null) {
      args=splitArgs(inner);
      return resolveNum(args[0])>=(args[1]?resolveNum(args[1]):0)?'1':'0';
    }
if ((inner=matchFn('BESSELJ'))!==null) {
      args=splitArgs(inner);
      var x14=resolveNum(args[0]),n20=parseInt(resolveNum(args[1]));
      // Series approximation for J0 and J1
      if(n20===0) return fmtNum(1-x14*x14/4+x14*x14*x14*x14/64-Math.pow(x14,6)/2304);
      if(n20===1) return fmtNum(x14/2-x14*x14*x14/16+Math.pow(x14,5)/384-Math.pow(x14,7)/18432);
      return fmtNum(0);
    }
if ((inner=matchFn('BESSELY'))!==null) {
      args=splitArgs(inner);
      var x15=resolveNum(args[0]);
      if(x15<=0)return '#NUM!';
      return fmtNum((2/Math.PI)*(Math.log(x15/2)+0.5772)*1-x15*x15/4);
    }
if ((inner=matchFn('TIPO|TYPE'))!==null) {
      var v1=resolveArg(splitArgs(inner)[0]);
      if(v1===true||v1===false||v1==='VERDADERO'||v1==='FALSO')return '4';
      if(typeof v1==='string'&&v1.startsWith('#'))return '16';
      if(!isNaN(parseFloat(v1)))return '1';
      if(typeof v1==='string')return '2';
      return '64';
    }
if ((inner=matchFn('N(?!OD|O\\b|PERS|PER|UM)'))!==null) {
      var v2=resolveArg(splitArgs(inner)[0]);
      if(v2===true||v2==='VERDADERO')return '1';
      if(v2===false||v2==='FALSO')return '0';
      return fmtNum(toNum(v2));
    }
if ((inner=matchFn('AREAS|AREAS'))!==null) {
      return '1'; // una sola área por ahora
    }
if ((inner=matchFn('DIRECCION|ADDRESS'))!==null) {
      args=splitArgs(inner);
      var r2=parseInt(resolveNum(args[0])),c2=parseInt(resolveNum(args[1]));
      var abs=args[2]?parseInt(resolveNum(args[2])):1;
      var col2=colLetter(c2-1);
      if(abs===1)return '$'+col2+'$'+r2;
      if(abs===2)return col2+'$'+r2;
      if(abs===3)return '$'+col2+r2;
      return col2+r2;
    }
if ((inner=matchFn('IMPORTARDATOSDINAMICOS|GETPIVOTDATA'))!==null) {
      args=splitArgs(inner);
      return String(resolveArg(args[0]));
    }
if ((inner=matchFn('RDTR|RTD'))!==null) {
      return '#N/A';
    }
if ((inner=matchFn('VALORCUBO|CUBEVALUE'))!==null) { return '#N/A (OLAP no disponible)'; }
if ((inner=matchFn('MIEMBROCUBO|CUBEMEMBER'))!==null) { return '#N/A (OLAP no disponible)'; }
if ((inner=matchFn('CONJUNTOCUBO|CUBESET'))!==null) { return '#N/A (OLAP no disponible)'; }
if ((inner=matchFn('RECUENTOCONJUNTOCUBO|CUBESETCOUNT'))!==null) { return '0'; }
if ((inner=matchFn('MIEMBROKPICUBO|CUBEKPIMEMBER'))!==null) { return '#N/A (OLAP no disponible)'; }
if ((inner=matchFn('MIEMBRORANGOCUBO|CUBERANKEDMEMBER'))!==null) { return '#N/A (OLAP no disponible)'; }
if ((inner=matchFn('PROPIEDADMIEMBROCUBO|CUBEMEMBERPROPERTY'))!==null) { return '#N/A (OLAP no disponible)'; }
if ((inner=matchFn('SERVICIOWEB|WEBSERVICE'))!==null) {
      return '[SERVICIOWEB requiere servidor]';
    }
if ((inner=matchFn('URLCODIF|ENCODEURL'))!==null) {
      return encodeURIComponent(String(resolveArg(splitArgs(inner)[0])));
    }
if ((inner=matchFn('XMLFILTRO|FILTERXML'))!==null) {
      return '[XMLFILTRO requiere servidor]';
    }
if((inner=matchFn('JERARQUIA\\.MEDIA|RANK\\.AVG'))!==null){
      args=splitArgs(inner);
      var num=resolveNum(args[0]);
      var vals=isRange(args[1])?rangeNums(args[1]):[];
      var order=args[2]?parseInt(resolveNum(args[2])):0;
      vals=vals.slice().sort(function(a,b){return order?a-b:b-a;});
      var first=vals.indexOf(num),last=vals.lastIndexOf(num);
      return first<0?'#N/A':fmtNum((first+last)/2+1);
    }
if((inner=matchFn('PERCENTIL\\.EXC|PERCENTILE\\.EXC'))!==null){
      args=splitArgs(inner);
      nums=isRange(args[0])?rangeNums(args[0]):[];
      var k=resolveNum(args[1]);
      nums=nums.slice().sort(function(a,b){return a-b;});
      var idx=(nums.length+1)*k-1;
      var lo=Math.floor(idx),hi=Math.ceil(idx);
      if(lo<0||hi>=nums.length)return '#NUM!';
      return fmtNum(nums[lo]+(nums[hi]-nums[lo])*(idx-lo));
    }
if((inner=matchFn('CUARTIL\\.EXC|QUARTILE\\.EXC'))!==null){
      args=splitArgs(inner);
      nums=isRange(args[0])?rangeNums(args[0]):[];
      var q=resolveNum(args[1]);
      if(q<1||q>3)return '#NUM!';
      nums=nums.slice().sort(function(a,b){return a-b;});
      var idx2=(nums.length+1)*(q/4)-1;
      var lo2=Math.floor(idx2),hi2=Math.ceil(idx2);
      return fmtNum(nums[lo2]+(nums[hi2]-nums[lo2])*(idx2-lo2));
    }
if((inner=matchFn('RANGO\\.PERCENTIL\\.EXC|PERCENTRANK\\.EXC'))!==null){
      args=splitArgs(inner);
      nums=isRange(args[0])?rangeNums(args[0]):[];
      var xp=resolveNum(args[1]);
      nums=nums.slice().sort(function(a,b){return a-b;});
      var idx3=nums.indexOf(xp);
      if(idx3<0)return '#N/A';
      return fmtNum(idx3/(nums.length+1));
    }
if((inner=matchFn('PROMEDIOA|AVERAGEA'))!==null){
      args=splitArgs(inner);
      var sum=0,cnt=0;
      args.forEach(function(a){
        if(isRange(a))rangeVals(a).forEach(function(v){
          if(v===true||v==='VERDADERO'){sum+=1;cnt++;}
          else if(v!==''){var n=parseFloat(v);if(!isNaN(n)){sum+=n;cnt++;}}
        });
        else{var v2=resolveArg(a);if(v2!==''){sum+=toNum(v2);cnt++;}}
      });
      return cnt?fmtNum(sum/cnt):'#DIV/0!';
    }
if((inner=matchFn('MAXA'))!==null){
      args=splitArgs(inner); nums=[];
      args.forEach(function(a){if(isRange(a))rangeNums(a).forEach(function(n){nums.push(n);});else nums.push(resolveNum(a));});
      return nums.length?fmtNum(Math.max.apply(null,nums)):'0';
    }
if((inner=matchFn('MINA'))!==null){
      args=splitArgs(inner); nums=[];
      args.forEach(function(a){if(isRange(a))rangeNums(a).forEach(function(n){nums.push(n);});else nums.push(resolveNum(a));});
      return nums.length?fmtNum(Math.min.apply(null,nums)):'0';
    }
if((inner=matchFn('CONTARA\\.VALORES|COUNTALL'))!==null){
      args=splitArgs(inner); var c=0;
      args.forEach(function(a){if(isRange(a))rangeVals(a).forEach(function(v){if(v!=='')c++;});else if(resolveArg(a)!=='')c++;});
      return String(c);
    }
if((inner=matchFn('DISTR\\.T\\.2C|T\\.DIST\\.2T'))!==null){
      args=splitArgs(inner);
      var x1=Math.abs(resolveNum(args[0])),df=resolveNum(args[1]);
      // Two-tail t-distribution
      var beta=x1*x1/(x1*x1+df);
      return fmtNum(2*(1-Math.min(0.9999,beta)));
    }
if((inner=matchFn('DISTR\\.T\\.CD|T\\.DIST\\.RT'))!==null){
      args=splitArgs(inner);
      var x2=resolveNum(args[0]),df2=resolveNum(args[1]);
      var beta2=x2*x2/(x2*x2+df2);
      return fmtNum(0.5*(1-Math.min(0.9999,beta2)));
    }
if((inner=matchFn('DISTR\\.F\\.CD|F\\.DIST\\.RT'))!==null){
      args=splitArgs(inner);
      var x3=resolveNum(args[0]),d1=resolveNum(args[1]),d2=resolveNum(args[2]);
      var w=d1*x3/(d1*x3+d2);
      return fmtNum(Math.max(0,1-w));
    }
if((inner=matchFn('DISTR\\.CHICUAD\\.CD|CHISQ\\.DIST\\.RT'))!==null){
      args=splitArgs(inner);
      var x4=resolveNum(args[0]),k2=resolveNum(args[1]);
      return fmtNum(Math.max(0,Math.exp(-x4/2)*Math.pow(x4/2,k2/2-1)/(Math.pow(2,k2/2))));
    }
if((inner=matchFn('MEDIA\\.GEOMETRICA|GEOMEAN'))!==null){
      args=splitArgs(inner); nums=isRange(args[0])?rangeNums(args[0]):args.map(resolveNum);
      var prod=nums.reduce(function(a,b){return a*b;},1);
      return fmtNum(Math.pow(prod,1/nums.length));
    }
if((inner=matchFn('MEDIA\\.ARMONICA|HARMEAN'))!==null){
      args=splitArgs(inner); nums=isRange(args[0])?rangeNums(args[0]):args.map(resolveNum);
      var sumRecip=nums.reduce(function(s,n){return s+(n?1/n:0);},0);
      return sumRecip?fmtNum(nums.length/sumRecip):'#DIV/0!';
    }
if((inner=matchFn('TIPIFICAR|NORMALIZE'))!==null){
      args=splitArgs(inner);
      var x5=resolveNum(args[0]),mean=resolveNum(args[1]),sig=resolveNum(args[2]);
      return sig?fmtNum((x5-mean)/sig):'#DIV/0!';
    }
if((inner=matchFn('TECHO|CEILING(?!\\.MATH|\\.PRECISE)'))!==null){
      args=splitArgs(inner);
      var n1=resolveNum(args[0]),sig=args[1]?resolveNum(args[1]):1;
      return fmtNum(Math.ceil(n1/sig)*sig);
    }
if((inner=matchFn('PISO|FLOOR(?!\\.MATH|\\.PRECISE)'))!==null){
      args=splitArgs(inner);
      var n2=resolveNum(args[0]),sig2=args[1]?resolveNum(args[1]):1;
      return fmtNum(Math.floor(n2/sig2)*sig2);
    }
if((inner=matchFn('ENTERO\\.SUPERIOR'))!==null){
      return fmtNum(Math.ceil(resolveNum(splitArgs(inner)[0])));
    }
if((inner=matchFn('NUMERO\\.DECIMAL|DECIMAL(?!\\.)'))!==null){
      args=splitArgs(inner);
      var txt=String(resolveArg(args[0])),base=parseInt(resolveNum(args[1]));
      return fmtNum(parseInt(txt,base));
    }
if((inner=matchFn('CONTAR\\.RANGO'))!==null){
      args=splitArgs(inner);
      if(isRange(args[0])){return String(rangeVals(args[0]).filter(function(v){return v!=='';}).length);}
      return '0';
    }
if((inner=matchFn('NUMERO\\.ALEATORIO'))!==null){
      return fmtNum(Math.random());
    }
if((inner=matchFn('ES\\.MULTIPLO|ISMULTIPLE'))!==null){
      args=splitArgs(inner);
      var n3=resolveNum(args[0]),m=resolveNum(args[1]);
      return m!==0&&n3%m===0?'VERDADERO':'FALSO';
    }
if((inner=matchFn('SUMAR\\.DIAGONAL|TRACE'))!==null){
      args=splitArgs(inner);
      if(isRange(args[0])){
        var p=args[0].trim().split(':');
        var fc=colIndex(p[0].match(/[A-Za-z]+/)[0]);
        var fr=parseInt(p[0].match(/\\d+/)[0])-1;
        var tc=colIndex(p[1].match(/[A-Za-z]+/)[0]);
        var tr=parseInt(p[1].match(/\\d+/)[0])-1;
        var n=Math.min(tc-fc,tr-fr)+1,sum=0;
        for(var i=0;i<n;i++)sum+=toNum(computeValue(cellId(fr+i,fc+i)));
        return fmtNum(sum);
      }
      return '0';
    }
if((inner=matchFn('NORMA\\.EUCLIDEA'))!==null){
      args=splitArgs(inner); nums=isRange(args[0])?rangeNums(args[0]):args.map(resolveNum);
      return fmtNum(Math.sqrt(nums.reduce(function(s,n){return s+n*n;},0)));
    }
if((inner=matchFn('ES\\.NUMERO\\.ENTERO|ISINT'))!==null){
      var v1=resolveNum(splitArgs(inner)[0]);
      return Number.isInteger(v1)?'VERDADERO':'FALSO';
    }
if((inner=matchFn('COCIENTE\\.EXACTO'))!==null){
      args=splitArgs(inner);
      return fmtNum(resolveNum(args[0])/resolveNum(args[1]));
    }
if((inner=matchFn('MEDIA\\.PONDERADA|WAVERAGE'))!==null){
      args=splitArgs(inner);
      var vals2=isRange(args[0])?rangeNums(args[0]):[];
      var weights=isRange(args[1])?rangeNums(args[1]):[];
      var n4=Math.min(vals2.length,weights.length);
      var sumVW=0,sumW=0;
      for(var i2=0;i2<n4;i2++){sumVW+=vals2[i2]*weights[i2];sumW+=weights[i2];}
      return sumW?fmtNum(sumVW/sumW):'#DIV/0!';
    }
if((inner=matchFn('CAPITALIZAR'))!==null){
      var s1=String(resolveArg(splitArgs(inner)[0]));
      return s1.charAt(0).toUpperCase()+s1.slice(1).toLowerCase();
    }
if((inner=matchFn('NUMERO\\.A\\.TEXTO|NUMBERTEXT'))!==null){
      var n5=parseInt(resolveNum(splitArgs(inner)[0]));
      var ones=['','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve',
                'diez','once','doce','trece','catorce','quince','dieciséis','diecisiete',
                'dieciocho','diecinueve'];
      var tens=['','','veinte','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];
      if(n5===0)return 'cero';
      if(n5<20)return ones[n5];
      if(n5<100)return tens[Math.floor(n5/10)]+(n5%10?'y '+ones[n5%10]:'');
      if(n5<1000)return(n5===100?'cien':(n5<200?'ciento':(Math.floor(n5/100)*100===500?'quinientos':Math.floor(n5/100)*100===700?'setecientos':Math.floor(n5/100)*100===900?'novecientos':ones[Math.floor(n5/100)]+'cientos'))+(n5%100?' '+window.evalFormula('=NUMERO.A.TEXTO('+n5%100+')',0,0):''));
      return String(n5);
    }
if((inner=matchFn('COINCIDIR\\.TEXTO|TEXTMATCH'))!==null){
      args=splitArgs(inner);
      var haystack=String(resolveArg(args[0])).toLowerCase();
      var needle=String(resolveArg(args[1])).toLowerCase();
      return haystack.includes(needle)?'VERDADERO':'FALSO';
    }
if((inner=matchFn('RELLENAR\\.IZQ|PADLEFT'))!==null){
      args=splitArgs(inner);
      var s2=String(resolveArg(args[0])),n6=parseInt(resolveNum(args[1]));
      var pad=args[2]?String(resolveArg(args[2])):'0';
      while(s2.length<n6)s2=pad+s2;
      return s2;
    }
if((inner=matchFn('RELLENAR\\.DER|PADRIGHT'))!==null){
      args=splitArgs(inner);
      var s3=String(resolveArg(args[0])),n7=parseInt(resolveNum(args[1]));
      var pad2=args[2]?String(resolveArg(args[2])):'0';
      while(s3.length<n7)s3=s3+pad2;
      return s3;
    }
if((inner=matchFn('INVERTIR\\.TEXTO|REVERSETEXT'))!==null){
      return String(resolveArg(splitArgs(inner)[0])).split('').reverse().join('');
    }
if((inner=matchFn('CONTAR\\.PALABRAS|WORDCOUNT'))!==null){
      var s4=String(resolveArg(splitArgs(inner)[0])).trim();
      return s4?String(s4.split(/\\s+/).length):'0';
    }
if((inner=matchFn('ENMASCARAR|MASK'))!==null){
      args=splitArgs(inner);
      var s5=String(resolveArg(args[0]));
      var show=args[1]?parseInt(resolveNum(args[1])):4;
      var char=args[2]?String(resolveArg(args[2])):'*';
      return s5.length<=show?s5:char.repeat(s5.length-show)+s5.slice(-show);
    }
if((inner=matchFn('FORMATO\\.NUMERO|FORMATNUMBER'))!==null){
      args=splitArgs(inner);
      var n8=resolveNum(args[0]),dec=args[1]?parseInt(resolveNum(args[1])):2;
      return n8.toLocaleString('es-CR',{minimumFractionDigits:dec,maximumFractionDigits:dec});
    }
if((inner=matchFn('SEPARAR\\.TEXTO|SPLIT'))!==null){
      args=splitArgs(inner);
      return String(resolveArg(args[0])).split(String(resolveArg(args[1]))).join('; ');
    }
if((inner=matchFn('TRIMESTRE|QUARTER'))!==null){
      var d1=new Date(String(resolveArg(splitArgs(inner)[0])));
      return isNaN(d1.getTime())?'#VALOR!':String(Math.floor(d1.getMonth()/3)+1);
    }
if((inner=matchFn('INICIO\\.MES|MONTHSTART'))!==null){
      var d2=new Date(String(resolveArg(splitArgs(inner)[0])));
      return new Date(d2.getFullYear(),d2.getMonth(),1).toLocaleDateString('es-CR');
    }
if((inner=matchFn('NOMBRE\\.MES|MONTHNAME'))!==null){
      var d3=new Date(String(resolveArg(splitArgs(inner)[0])));
      var meses=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      return isNaN(d3.getTime())?'#VALOR!':meses[d3.getMonth()];
    }
if((inner=matchFn('NOMBRE\\.DIA|DAYNAME'))!==null){
      var d4=new Date(String(resolveArg(splitArgs(inner)[0])));
      var dias=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
      return isNaN(d4.getTime())?'#VALOR!':dias[d4.getDay()];
    }
if((inner=matchFn('EDAD|AGE'))!==null){
      var d5=new Date(String(resolveArg(splitArgs(inner)[0])));
      var hoy=new Date();
      var age=hoy.getFullYear()-d5.getFullYear();
      if(hoy.getMonth()<d5.getMonth()||(hoy.getMonth()===d5.getMonth()&&hoy.getDate()<d5.getDate()))age--;
      return String(age);
    }
if((inner=matchFn('AGREGAR\\.DIAS|ADDDAYS'))!==null){
      args=splitArgs(inner);
      var d6=new Date(String(resolveArg(args[0])));
      d6.setDate(d6.getDate()+parseInt(resolveNum(args[1])));
      return d6.toLocaleDateString('es-CR');
    }
if((inner=matchFn('AGREGAR\\.MESES|ADDMONTHS'))!==null){
      args=splitArgs(inner);
      var d7=new Date(String(resolveArg(args[0])));
      d7.setMonth(d7.getMonth()+parseInt(resolveNum(args[1])));
      return d7.toLocaleDateString('es-CR');
    }
if((inner=matchFn('DIFERENCIA\\.DIAS|DAYSDIFF'))!==null){
      args=splitArgs(inner);
      var d8=new Date(String(resolveArg(args[0]))),d9=new Date(String(resolveArg(args[1])));
      return String(Math.abs(Math.round((d9-d8)/86400000)));
    }
if((inner=matchFn('IVA\\.INCLUIDO'))!==null){
      args=splitArgs(inner);
      var monto=resolveNum(args[0]),tasa=args[1]?resolveNum(args[1]):0.13;
      return fmtNum(monto*tasa/(1+tasa));
    }
if((inner=matchFn('MONTO\\.SIN\\.IVA|BASE\\.IVA'))!==null){
      args=splitArgs(inner);
      var monto2=resolveNum(args[0]),tasa2=args[1]?resolveNum(args[1]):0.13;
      return fmtNum(monto2/(1+tasa2));
    }
if((inner=matchFn('PLANILLA\\.CCSS|CARGAS\\.SOCIALES'))!==null){
      args=splitArgs(inner);
      var salario=resolveNum(args[0]);
      var tipo=args[1]?String(resolveArg(args[1])).toLowerCase():'total';
      // Tasas CCSS 2026 CR (vigentes desde 1° enero 2026, ajuste IVM)
      var patronal=0.2683; // 26.83% patronal
      var obrero=0.1083;   // 10.83% obrero
      if(tipo==='patronal')return fmtNum(salario*patronal);
      if(tipo==='obrero')return fmtNum(salario*obrero);
      return fmtNum(salario*(patronal+obrero));
    }
if((inner=matchFn('AGUINALDO'))!==null){
      args=splitArgs(inner);
      var salario2=resolveNum(args[0]);
      var meses=args[1]?resolveNum(args[1]):12;
      return fmtNum(salario2*meses/12);
    }
if((inner=matchFn('PREAVISO'))!==null){
      args=splitArgs(inner);
      var salario3=resolveNum(args[0]),anios=resolveNum(args[1]);
      if(anios<0.25)return '0';                    // menos de 3 meses: no aplica
      if(anios<0.5)return fmtNum(salario3/30*7);    // 3-6 meses: 1 semana (7 días)
      if(anios<1)return fmtNum(salario3/30*15);     // 6 meses-1 año: 15 días
      return fmtNum(salario3);                       // 1 año o más: 1 mes completo (fijo)
    }
if((inner=matchFn('CESANTIA'))!==null){
      args=splitArgs(inner);
      var salario4=resolveNum(args[0]),anios2=resolveNum(args[1]);
      if(anios2<0.25)return '0';                    // menos de 3 meses: no aplica
      if(anios2<0.5)return fmtNum(salario4/30*7);    // 3-6 meses: 7 días
      if(anios2<1)return fmtNum(salario4/30*14);     // 6 meses-1 año: 14 días
      var tablaCesantia=[19.5,20,20.5,21,21.24,21.5,22,22]; // días por año, años 1-8 (Art. 29)
      var aniosCompletos=Math.min(Math.floor(anios2),8);
      var diasTotal=0;
      for(var ic=0;ic<aniosCompletos;ic++)diasTotal+=tablaCesantia[ic];
      return fmtNum(salario4/30*diasTotal);
    }
if((inner=matchFn('RENTA\\.TRABAJO|IMPUESTO\\.RENTA'))!==null){
      args=splitArgs(inner);
      var ingresoMensual=resolveNum(args[0]);
      // Tramos IR 2026 CR (mensual, asalariados — Decreto Ejecutivo 45333-H)
      if(ingresoMensual<=918000)return fmtNum(0);
      if(ingresoMensual<=1347000)return fmtNum((ingresoMensual-918000)*0.10);
      if(ingresoMensual<=2364000)return fmtNum(42900+(ingresoMensual-1347000)*0.15);
      if(ingresoMensual<=4727000)return fmtNum(195450+(ingresoMensual-2364000)*0.20);
      return fmtNum(668050+(ingresoMensual-4727000)*0.25);
    }
if((inner=matchFn('TIPO\\.CAMBIO|TC\\.BCCR'))!==null){
      args=splitArgs(inner);
      var moneda=args[0]?String(resolveArg(args[0])).toUpperCase():'USD';
      // Valores referenciales (actualizar manualmente)
      var tc={'USD':518,'EUR':565,'GBP':660,'MXN':30,'JPY':3.5,'CAD':385};
      return fmtNum(tc[moneda]||0);
    }
if((inner=matchFn('VERDADERO\\.SI'))!==null){
      args=splitArgs(inner);
      return String(resolveArg(args[0])).toUpperCase()==='VERDADERO'||resolveArg(args[0])===true?String(resolveArg(args[1])):String(resolveArg(args[2]||''));
    }
if((inner=matchFn('ARCHIVOMAKEARRAY|MAKEARRAY'))!==null){
      args=splitArgs(inner);
      var rows=parseInt(resolveNum(args[0])),cols=parseInt(resolveNum(args[1]));
      var result=[];
      for(var r=0;r<rows;r++){var row=[];for(var c=0;c<cols;c++)row.push(r*cols+c+1);result.push(row.join('\\t'));}
      return result.join(' | ');
    }
if((inner=matchFn('VALOR\\.CAMPO|FIELDVALUE'))!==null){
      args=splitArgs(inner);
      return String(computeValue(String(resolveArg(args[0]))));
    }
if((inner=matchFn('ES\\.FORMULA\\.TEXTO'))!==null){
      var ref=splitArgs(inner)[0].trim().toUpperCase();
      var v=getRaw(ref)||'';
      return typeof v==='string'&&v.startsWith('=')?'VERDADERO':'FALSO';
    }
if((inner=matchFn('DESREF\\.DINAMICO'))!==null){
      args=splitArgs(inner);
      var ref2=String(resolveArg(args[0])).toUpperCase();
      var dr=parseInt(resolveNum(args[1])),dc=parseInt(resolveNum(args[2]));
      var match=ref2.match(/([A-Z]+)(\\d+)/);
      if(match){var c2=colIndex(match[1]),r2=parseInt(match[2])-1;return String(computeValue(cellId(r2+dr,c2+dc)));}
      return '#REF!';
    }
if((inner=matchFn('CONTAR\\.UNICOS|COUNT\\.UNIQUE'))!==null){
      args=splitArgs(inner);
      var seen={};
      (isRange(args[0])?rangeVals(args[0]):[String(resolveArg(args[0]))]).forEach(function(v){if(v!=='')seen[v]=true;});
      return String(Object.keys(seen).length);
    }
if((inner=matchFn('BUSCAR\\.REGEX'))!==null){
      args=splitArgs(inner);
      var pattern=new RegExp(String(resolveArg(args[0])),'i');
      var colN=args[2]?parseInt(resolveNum(args[2]))-1:0;
      if(isRange(args[1])){
        var p=args[1].trim().split(':');
        var fc=colIndex(p[0].match(/[A-Za-z]+/)[0]);
        var fr=parseInt(p[0].match(/\\d+/)[0])-1;
        var tr=parseInt(p[1].match(/\\d+/)[0])-1;
        for(var ri=fr;ri<=tr;ri++){
          if(pattern.test(String(computeValue(cellId(ri,fc)))))return String(computeValue(cellId(ri,fc+colN)));
        }
      }
      return '#N/A';
    }
if((inner=matchFn('BUSCAR\\.ULTIMA|LASTMATCH'))!==null){
      args=splitArgs(inner);
      var sv=String(resolveArg(args[0])).toLowerCase();
      if(isRange(args[1])){
        var lVals=rangeVals(args[1]);
        var retVals=args[2]?rangeVals(args[2]):lVals;
        var lastIdx=-1;
        lVals.forEach(function(v,i){if(String(v).toLowerCase()===sv)lastIdx=i;});
        return lastIdx>=0?String(retVals[lastIdx]):'#N/A';
      }
      return '#N/A';
    }
if((inner=matchFn('POSICION\\.TEXTO'))!==null){
      args=splitArgs(inner);
      var haystack2=String(resolveArg(args[0]));
      var needle2=String(resolveArg(args[1]));
      var positions=[];var pos=0;
      while((pos=haystack2.indexOf(needle2,pos))>=0){positions.push(pos+1);pos+=needle2.length;}
      return positions.length?positions.join('; '):'#N/A';
    }
if((inner=matchFn('CONTAR\\.OCURRENCIAS'))!==null){
      args=splitArgs(inner);
      var s6=String(resolveArg(args[0])),find=String(resolveArg(args[1]));
      return String((s6.split(find).length-1));
    }
if((inner=matchFn('BUSCAR\\.NESIMO'))!==null){
      args=splitArgs(inner);
      var sv2=String(resolveArg(args[0])).toLowerCase();
      var nth=parseInt(resolveNum(args[2]));
      if(isRange(args[1])){
        var lVals2=rangeVals(args[1]);
        var retVals2=args[3]?rangeVals(args[3]):lVals2;
        var count=0;
        for(var i3=0;i3<lVals2.length;i3++){
          if(String(lVals2[i3]).toLowerCase()===sv2){count++;if(count===nth)return String(retVals2[i3]);}
        }
      }
      return '#N/A';
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
// FORMATO NUMÉRICO AVANZADO
// ══════════════════════════════════════════════
function applyNumberFormat(val, fmt) {
  if (val === '' || val === null || val === undefined) return val;
  var num = parseFloat(String(val).replace(/[₡,%\\s()]/g, ''));
  if (isNaN(num)) return val;
  var dec = (fmt.decimals !== undefined && fmt.decimals !== null) ? fmt.decimals : 2;
  var thousands = fmt.thousands !== false;
  var type = fmt.type || 'general';
  if (type === 'percent') {
    var pctStr = (num * 100).toLocaleString('es-CR', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: thousands });
    return pctStr + '%';
  }
  var isNeg = num < 0;
  var absStr = Math.abs(num).toLocaleString('es-CR', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: thousands });
  if (type === 'currency') return (isNeg ? '-' : '') + '₡' + absStr;
  if (type === 'accounting') return isNeg ? '(₡' + absStr + ')' : '₡' + absStr;
  if (type === 'number') return (isNeg ? '-' : '') + absStr;
  return String(val);
}

// ══════════════════════════════════════════════
// RENDER
// ══════════════════════════════════════════════
function getColWidth(c) {
  var w = colWidths[activeSheet] && colWidths[activeSheet][c];
  return w || 78;
}

function buildTable() {
  var table = document.getElementById('sheetTable');
  var html = '<colgroup><col style="width:34px">';
  for (var cg = 0; cg < COLS; cg++) html += '<col style="width:' + getColWidth(cg) + 'px">';
  html += '</colgroup>';
  html += '<thead><tr><th class="corner"></th>';
  for (var c = 0; c < COLS; c++) html += '<th data-col="' + c + '">' + colLetter(c) + '<div class="colResizer" data-col="' + c + '"></div></th>';
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
  attachColResizeEvents();
  renderAllCells();
  renderTabs();
}

function attachColResizeEvents() {
  document.querySelectorAll('.colResizer').forEach(function (el) {
    var startX = 0, startW = 0, col = parseInt(el.dataset.col);
    el.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      startX = e.clientX;
      startW = getColWidth(col);
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (e.buttons !== 1) return;
      var dx = e.clientX - startX;
      var newW = Math.max(36, startW + dx);
      if (!colWidths[activeSheet]) colWidths[activeSheet] = {};
      colWidths[activeSheet][col] = newW;
      var colgroupCol = document.querySelectorAll('#sheetTable colgroup col')[col + 1];
      if (colgroupCol) colgroupCol.style.width = newW + 'px';
    });
    el.addEventListener('pointerup', function () { autoSave(); });
  });
}

function renderAllCells() {
  var data = sheetData[activeSheet] || {};
  var formats = sheetFormats[activeSheet] || {};
  var notes = sheetNotes[activeSheet] || {};
  document.querySelectorAll('.cell').forEach(function (el) { el.classList.remove('has-note'); });
  Object.keys(data).forEach(function (id) {
    var el = document.getElementById('cell_' + id);
    if (!el || document.activeElement === el) return;
    var val = computeValue(id);
    var fmt = formats[id] || {};
    if (fmt.numFormat) {
      el.textContent = applyNumberFormat(val, fmt.numFormat);
    } else if (fmt.currency && val !== '' && !isNaN(parseFloat(String(val).replace(/[₡,]/g, '')))) {
      el.textContent = '₡' + parseFloat(String(val).replace(/[₡,\\s]/g, '')).toLocaleString('es-CR', { minimumFractionDigits: 2 });
    } else if (fmt.percent && val !== '' && !isNaN(parseFloat(val))) {
      el.textContent = (parseFloat(val) * 100).toFixed(1) + '%';
    } else {
      el.textContent = val;
    }
    el.classList.toggle('bold', !!fmt.bold);
  });
  Object.keys(notes).forEach(function (id) {
    var el = document.getElementById('cell_' + id);
    if (el && notes[id]) el.classList.add('has-note');
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
      if (lastTap[name] && now - lastTap[name] < 400) { openTabMenu(name); }
      else { activeSheet = name; buildTable(); }
      lastTap[name] = now;
    });
  });
  document.getElementById('addTabBtn').addEventListener('click', function () {
    snapshot();
    var n = sheets.length + 1; var name = 'Hoja' + n;
    while (sheets.indexOf(name) >= 0) { n++; name = 'Hoja' + n; }
    sheets.push(name); sheetData[name] = {}; sheetFormats[name] = {}; sheetNotes[name] = {}; colWidths[name] = {};
    activeSheet = name; buildTable(); autoSave();
  });
}

function openTabMenu(name) {
  tabMenuTarget = name;
  document.getElementById('tabMenuTitle').textContent = 'Hoja: ' + name;
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
  sheetNotes[newName] = sheetNotes[tabMenuTarget] || {}; delete sheetNotes[tabMenuTarget];
  colWidths[newName] = colWidths[tabMenuTarget] || {}; delete colWidths[tabMenuTarget];
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
  sheetNotes[newName] = JSON.parse(JSON.stringify(sheetNotes[tabMenuTarget] || {}));
  colWidths[newName] = JSON.parse(JSON.stringify(colWidths[tabMenuTarget] || {}));
  activeSheet = newName;
  document.getElementById('tabMenuOverlay').classList.remove('show');
  buildTable(); autoSave();
});
document.getElementById('btnDeleteSheet').addEventListener('click', function () {
  if (sheets.length <= 1) { alert('Debe quedar al menos una hoja.'); return; }
  if (!confirm('¿Eliminar la hoja "' + tabMenuTarget + '"?')) return;
  snapshot();
  var idx = sheets.indexOf(tabMenuTarget);
  sheets.splice(idx, 1);
  delete sheetData[tabMenuTarget]; delete sheetFormats[tabMenuTarget]; delete sheetNotes[tabMenuTarget]; delete colWidths[tabMenuTarget];
  if (activeSheet === tabMenuTarget) activeSheet = sheets[0];
  document.getElementById('tabMenuOverlay').classList.remove('show');
  buildTable(); autoSave();
});

// ══════════════════════════════════════════════
// NOTAS
// ══════════════════════════════════════════════
// ══════════════════════════════════════════════
// FACTURA ELECTRÓNICA 4.3 — CR
// ══════════════════════════════════════════════
function fmtCRC(n) { return '₡' + Number(n || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function recalcularFactura() {
  var rows = document.querySelectorAll('#fe-lineas-body tr');
  var sub = 0;
  rows.forEach(function (row) {
    var q = parseFloat((row.querySelector('.feQty') || {}).value) || 0;
    var p = parseFloat((row.querySelector('.fePrice') || {}).value) || 0;
    var tot = q * p; sub += tot;
    var td = row.querySelector('.feLineTotal');
    if (td) td.textContent = fmtCRC(tot);
  });
  var rateEl = document.getElementById('fe-iva-rate');
  var rate = rateEl ? parseFloat(rateEl.value) : 0.13;
  var iva = sub * rate; var total = sub + iva; var pct = Math.round(rate * 100);
  document.getElementById('fe-subtotal').textContent = fmtCRC(sub);
  document.getElementById('fe-iva-amount').textContent = fmtCRC(iva);
  document.getElementById('fe-total').textContent = fmtCRC(total);
  document.getElementById('factura-iva-lbl').textContent = 'IVA ' + pct + '%:';
}

function agregarLineaFactura() {
  var tbody = document.getElementById('fe-lineas-body');
  var tr = document.createElement('tr');
  tr.innerHTML = '<td><input type="number" value="1" min="0" step="0.01" class="feQty"></td>' +
    '<td><input type="text" value="Servicio" class="feDesc"></td>' +
    '<td><input type="number" value="0" min="0" step="0.01" class="fePrice"></td>' +
    '<td class="feLineTotal" style="font-weight:700;white-space:nowrap;">' + fmtCRC(0) + '</td>' +
    '<td><button class="feDelLinea" style="background:none;border:none;color:#dc2626;font-size:15px;">×</button></td>';
  tbody.appendChild(tr);
  tr.querySelectorAll('.feQty, .fePrice').forEach(function (inp) { inp.addEventListener('input', recalcularFactura); });
  tr.querySelector('.feDelLinea').addEventListener('click', function () {
    if (document.querySelectorAll('#fe-lineas-body tr').length > 1) { tr.remove(); recalcularFactura(); }
  });
  recalcularFactura();
}

function limpiarFactura() {
  ['fe-emisor-nombre', 'fe-emisor-cedula', 'fe-emisor-telefono', 'fe-emisor-email',
   'fe-receptor-nombre', 'fe-receptor-cedula', 'fe-receptor-telefono', 'fe-receptor-email', 'fe-observaciones']
    .forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ''; });
  var tbody = document.getElementById('fe-lineas-body');
  tbody.innerHTML = '';
  document.getElementById('fe-firma-check').checked = false;
  agregarLineaFactura();
}

// ── Firma digital simulada ──
function generarFirmaDigital(datos) {
  var base = (datos.num || '') + '|' + (datos.fecha || '') + '|' + (datos.emisor || '') + '|' + (datos.total || '') + '|' + Date.now() + '|' + Math.random();
  var hash = '';
  try { hash = btoa(unescape(encodeURIComponent(base))).replace(/[^A-Za-z0-9]/g, '').substring(0, 40); }
  catch (e) { hash = base.split('').reduce(function (a, c) { return ((a << 5) - a + c.charCodeAt(0)) | 0; }, 0).toString(16); }
  return { hash: hash.toUpperCase(), timestamp: new Date().toISOString() };
}

// ── Historial de facturas (localStorage) ──
function getFacturasHistorial() {
  try { return JSON.parse(localStorage.getItem('kcn_facturas_historial') || '[]'); }
  catch (e) { return []; }
}
function guardarFacturaHistorial() {
  function gv(id) { var e = document.getElementById(id); return e ? (e.value || e.textContent || '') : ''; }
  var lineas = [];
  document.querySelectorAll('#fe-lineas-body tr').forEach(function (row) {
    lineas.push({
      qty: (row.querySelector('.feQty') || {}).value || '1',
      desc: (row.querySelector('.feDesc') || {}).value || '',
      price: (row.querySelector('.fePrice') || {}).value || '0'
    });
  });
  var entry = {
    num: gv('fe-num'), fecha: gv('fe-fecha'), ivaRate: gv('fe-iva-rate'),
    emisorNombre: gv('fe-emisor-nombre'), emisorCedula: gv('fe-emisor-cedula'),
    emisorTelefono: gv('fe-emisor-telefono'), emisorEmail: gv('fe-emisor-email'),
    receptorNombre: gv('fe-receptor-nombre'), receptorCedula: gv('fe-receptor-cedula'),
    receptorTelefono: gv('fe-receptor-telefono'), receptorEmail: gv('fe-receptor-email'),
    observaciones: gv('fe-observaciones'), lineas: lineas,
    total: gv('fe-total'), savedAt: new Date().toISOString()
  };
  var hist = getFacturasHistorial();
  hist.unshift(entry);
  if (hist.length > 50) hist = hist.slice(0, 50);
  try { localStorage.setItem('kcn_facturas_historial', JSON.stringify(hist)); } catch (e) {}
}
function renderHistorialList() {
  var hist = getFacturasHistorial();
  var wrap = document.getElementById('feHistList');
  if (!hist.length) { wrap.innerHTML = '<div id="feHistEmpty">Todavía no hay facturas guardadas. Se guardan automáticamente al exportar XML o PDF.</div>'; return; }
  var html = '';
  hist.forEach(function (h, i) {
    html += '<div class="feHistItem"><div class="fhInfo"><div class="fhNum">' + (h.num || '—') + ' · ' + (h.receptorNombre || 'Sin receptor') + '</div>' +
      '<div class="fhMeta">' + (h.fecha || '') + ' · ' + (h.total || '') + '</div></div>' +
      '<button data-idx="' + i + '">Cargar</button></div>';
  });
  wrap.innerHTML = html;
  wrap.querySelectorAll('button[data-idx]').forEach(function (btn) {
    btn.addEventListener('click', function () { cargarFacturaDeHistorial(hist[parseInt(btn.dataset.idx)]); });
  });
}
function cargarFacturaDeHistorial(entry) {
  if (!entry) return;
  document.getElementById('fe-num').value = entry.num || '';
  document.getElementById('fe-fecha').value = entry.fecha || '';
  document.getElementById('fe-iva-rate').value = entry.ivaRate || '0.13';
  document.getElementById('fe-emisor-nombre').value = entry.emisorNombre || '';
  document.getElementById('fe-emisor-cedula').value = entry.emisorCedula || '';
  document.getElementById('fe-emisor-telefono').value = entry.emisorTelefono || '';
  document.getElementById('fe-emisor-email').value = entry.emisorEmail || '';
  document.getElementById('fe-receptor-nombre').value = entry.receptorNombre || '';
  document.getElementById('fe-receptor-cedula').value = entry.receptorCedula || '';
  document.getElementById('fe-receptor-telefono').value = entry.receptorTelefono || '';
  document.getElementById('fe-receptor-email').value = entry.receptorEmail || '';
  document.getElementById('fe-observaciones').value = entry.observaciones || '';
  var tbody = document.getElementById('fe-lineas-body');
  tbody.innerHTML = '';
  (entry.lineas || []).forEach(function (l) {
    agregarLineaFactura();
    var tr = tbody.lastElementChild;
    tr.querySelector('.feQty').value = l.qty;
    tr.querySelector('.feDesc').value = l.desc;
    tr.querySelector('.fePrice').value = l.price;
  });
  if (!tbody.children.length) agregarLineaFactura();
  recalcularFactura();
  document.getElementById('feHistOverlay').classList.remove('show');
}
document.getElementById('feBtnHistorial').addEventListener('click', function () {
  renderHistorialList();
  document.getElementById('feHistOverlay').classList.add('show');
});
document.getElementById('feHistClose').addEventListener('click', function () {
  document.getElementById('feHistOverlay').classList.remove('show');
});

// ══════════════════════════════════════════════
// BUSCAR Y REEMPLAZAR
// ══════════════════════════════════════════════
var brMatches = [], brMatchIdx = -1;
function brFindMatches(query) {
  var data = sheetData[activeSheet] || {};
  var q = query.toLowerCase();
  var matches = [];
  Object.keys(data).forEach(function (id) {
    var raw = String(data[id] || '');
    if (raw.toLowerCase().indexOf(q) >= 0) matches.push(id);
  });
  matches.sort(function (a, b) {
    var ma = a.match(/([A-Za-z]+)(\\d+)/), mb = b.match(/([A-Za-z]+)(\\d+)/);
    var ra = parseInt(ma[2]), rb = parseInt(mb[2]);
    if (ra !== rb) return ra - rb;
    return colIndex(ma[1]) - colIndex(mb[1]);
  });
  return matches;
}
document.getElementById('btnBuscarReemplazar').addEventListener('click', function () {
  document.getElementById('brFindInput').value = '';
  document.getElementById('brReplaceInput').value = '';
  document.getElementById('brStatus').textContent = '';
  brMatches = []; brMatchIdx = -1;
  document.getElementById('brOverlay').classList.add('show');
  document.getElementById('brFindInput').focus();
});
document.getElementById('brCancelBtn').addEventListener('click', function () {
  document.getElementById('brOverlay').classList.remove('show');
});
document.getElementById('brFindInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('brFind').click(); }
});
document.getElementById('brFind').addEventListener('click', function () {
  var q = document.getElementById('brFindInput').value;
  if (!q) { document.getElementById('brStatus').textContent = 'Escribí algo para buscar.'; return; }
  brMatches = brFindMatches(q);
  if (!brMatches.length) { document.getElementById('brStatus').textContent = 'Sin resultados en esta hoja.'; return; }
  brMatchIdx = (brMatchIdx + 1) % brMatches.length;
  var id = brMatches[brMatchIdx];
  var el = document.getElementById('cell_' + id);
  if (el) { el.scrollIntoView({ block: 'center', inline: 'center' }); el.focus(); }
  document.getElementById('brStatus').textContent = (brMatchIdx + 1) + ' de ' + brMatches.length + ' — celda ' + id;
});
document.getElementById('brReplace').addEventListener('click', function () {
  if (brMatchIdx < 0 || !brMatches.length) { document.getElementById('brFind').click(); return; }
  var q = document.getElementById('brFindInput').value;
  var rep = document.getElementById('brReplaceInput').value;
  var id = brMatches[brMatchIdx];
  snapshot();
  var raw = String(sheetData[activeSheet][id] || '');
  var re = new RegExp(q.replace(/[.*+?^{}()|[\\]\\\\$]/g, '\\\\$&'), 'i');
  sheetData[activeSheet][id] = raw.replace(re, rep);
  renderAllCells(); autoSave();
  document.getElementById('brStatus').textContent = 'Reemplazado en ' + id + '.';
  document.getElementById('brFind').click();
});
document.getElementById('brReplaceAll').addEventListener('click', function () {
  var q = document.getElementById('brFindInput').value;
  var rep = document.getElementById('brReplaceInput').value;
  if (!q) { document.getElementById('brStatus').textContent = 'Escribí algo para buscar.'; return; }
  var matches = brFindMatches(q);
  if (!matches.length) { document.getElementById('brStatus').textContent = 'Sin resultados en esta hoja.'; return; }
  snapshot();
  var re = new RegExp(q.replace(/[.*+?^{}()|[\\]\\\\$]/g, '\\\\$&'), 'gi');
  matches.forEach(function (id) {
    var raw = String(sheetData[activeSheet][id] || '');
    sheetData[activeSheet][id] = raw.replace(re, rep);
  });
  renderAllCells(); autoSave();
  document.getElementById('brStatus').textContent = 'Reemplazadas ' + matches.length + ' celdas.';
  brMatches = []; brMatchIdx = -1;
});

document.getElementById('btnFactura').addEventListener('click', function () {
  if (!document.getElementById('fe-lineas-body').children.length) {
    if (!document.getElementById('fe-fecha').value) {
      document.getElementById('fe-fecha').value = new Date().toISOString().split('T')[0];
    }
    agregarLineaFactura();
  }
  document.getElementById('feOverlay').classList.add('show');
});
document.getElementById('feClose').addEventListener('click', function () { document.getElementById('feOverlay').classList.remove('show'); });
document.getElementById('feAddLineaBtn').addEventListener('click', agregarLineaFactura);
document.getElementById('fe-iva-rate').addEventListener('change', recalcularFactura);
document.getElementById('feBtnClear').addEventListener('click', function () {
  if (confirm('¿Limpiar todos los datos de la factura?')) limpiarFactura();
});

document.getElementById('feBtnXml').addEventListener('click', function () {
  function gv(id) { var e = document.getElementById(id); return e ? (e.value || e.textContent || '') : ''; }
  var fecha = gv('fe-fecha') || new Date().toISOString().split('T')[0];
  var sub = (gv('fe-subtotal') || '0').replace(/[^\\d.]/g, '');
  var iva = (gv('fe-iva-amount') || '0').replace(/[^\\d.]/g, '');
  var tot = (gv('fe-total') || '0').replace(/[^\\d.]/g, '');
  var lineas = '';
  document.querySelectorAll('#fe-lineas-body tr').forEach(function (row, i) {
    var qty = (row.querySelector('.feQty') || {}).value || '1';
    var desc = (row.querySelector('.feDesc') || {}).value || '';
    var price = (row.querySelector('.fePrice') || {}).value || '0';
    var lt = ((row.querySelector('.feLineTotal') || {}).textContent || '0').replace(/[^\\d.]/g, '');
    lineas += '  <LineaDetalle><NumeroLinea>' + (i + 1) + '</NumeroLinea><Cantidad>' + qty + '</Cantidad><Descripcion>' + desc + '</Descripcion><PrecioUnitario>' + price + '</PrecioUnitario><MontoTotal>' + lt + '</MontoTotal></LineaDetalle>\\n';
  });
  var firmaBlock = '';
  if (document.getElementById('fe-firma-check').checked) {
    var firma = generarFirmaDigital({ num: gv('fe-num'), fecha: fecha, emisor: gv('fe-emisor-nombre'), total: tot });
    firmaBlock = '  <FirmaDigital><Hash>' + firma.hash + '</Hash><Timestamp>' + firma.timestamp + '</Timestamp><Nota>Firma simulada — no válida ante Hacienda</Nota></FirmaDigital>\\n';
  }
  var xml = '<?xml version="1.0" encoding="UTF-8"?>\\n<FacturaElectronica xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/facturaElectronica">\\n' +
    '  <NumeroConsecutivo>' + gv('fe-num') + '</NumeroConsecutivo>\\n' +
    '  <FechaEmision>' + fecha + 'T09:00:00-06:00</FechaEmision>\\n' +
    '  <Emisor><Nombre>' + gv('fe-emisor-nombre') + '</Nombre><Identificacion><Numero>' + gv('fe-emisor-cedula') + '</Numero></Identificacion></Emisor>\\n' +
    '  <Receptor><Nombre>' + gv('fe-receptor-nombre') + '</Nombre><Identificacion><Numero>' + gv('fe-receptor-cedula') + '</Numero></Identificacion></Receptor>\\n' +
    lineas + '  <ResumenFactura><TotalVenta>' + sub + '</TotalVenta><TotalImpuesto>' + iva + '</TotalImpuesto><TotalComprobante>' + tot + '</TotalComprobante></ResumenFactura>\\n' +
    firmaBlock + '</FacturaElectronica>';
  var blob = new Blob([xml], { type: 'application/xml' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'factura-' + fecha + '.xml';
  a.click();
  guardarFacturaHistorial();
  document.getElementById('saveStatus').textContent = 'XML exportado';
});

document.getElementById('feBtnPdf').addEventListener('click', function () {
  var jsPDFLib = window.jspdf && window.jspdf.jsPDF;
  if (!jsPDFLib) { alert('No se pudo cargar el generador de PDF. Revisá tu conexión a internet.'); return; }
  function gv(id) { var e = document.getElementById(id); return e ? (e.value || e.textContent || '') : ''; }

  var doc = new jsPDFLib({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  var fecha = gv('fe-fecha') || new Date().toLocaleDateString('es-CR');
  var emisor = gv('fe-emisor-nombre') || 'Emisor';
  var cedEmisor = gv('fe-emisor-cedula') || '—';
  var telEmisor = gv('fe-emisor-telefono') || '—';
  var emailEmisor = gv('fe-emisor-email') || '—';
  var receptor = gv('fe-receptor-nombre') || 'Receptor';
  var cedRec = gv('fe-receptor-cedula') || '—';
  var telRec = gv('fe-receptor-telefono') || '—';
  var emailRec = gv('fe-receptor-email') || '—';
  var num = gv('fe-num') || '001-001-00000001';
  var subtotal = gv('fe-subtotal') || '₡0.00';
  var ivaAmt = gv('fe-iva-amount') || '₡0.00';
  var total = gv('fe-total') || '₡0.00';
  var ivaLbl = gv('factura-iva-lbl') || 'IVA 13%:';
  var obs = gv('fe-observaciones') || '';

  var g3 = [45, 122, 12], g2 = [58, 158, 16], bg = [238, 248, 228], border = [204, 233, 174];

  doc.setFillColor(g3[0], g3[1], g3[2]);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text('FACTURA ELECTRÓNICA', 14, 14);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text('Costa Rica · Versión 4.3', 14, 21);
  doc.text('N° ' + num, 196, 10, { align: 'right' });
  doc.text('Fecha: ' + fecha, 196, 17, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  doc.setFillColor(bg[0], bg[1], bg[2]);
  doc.roundedRect(10, 32, 90, 48, 2, 2, 'F');
  doc.setDrawColor(border[0], border[1], border[2]);
  doc.roundedRect(10, 32, 90, 48, 2, 2, 'S');
  doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(g3[0], g3[1], g3[2]);
  doc.text('EMISOR', 15, 39);
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
  doc.text(emisor.substring(0, 35), 15, 46);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 80, 40);
  doc.text('Cédula: ' + cedEmisor, 15, 53);
  doc.text('Tel: ' + telEmisor, 15, 59);
  doc.text('Email: ' + emailEmisor.substring(0, 30), 15, 65);

  doc.setFillColor(bg[0], bg[1], bg[2]);
  doc.roundedRect(110, 32, 90, 48, 2, 2, 'F');
  doc.setDrawColor(border[0], border[1], border[2]);
  doc.roundedRect(110, 32, 90, 48, 2, 2, 'S');
  doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(g3[0], g3[1], g3[2]);
  doc.text('RECEPTOR', 115, 39);
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
  doc.text(receptor.substring(0, 35), 115, 46);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 80, 40);
  doc.text('Cédula: ' + cedRec, 115, 53);
  doc.text('Tel: ' + telRec, 115, 59);
  doc.text('Email: ' + emailRec.substring(0, 30), 115, 65);

  var tableY = 86;
  doc.setFillColor(g2[0], g2[1], g2[2]);
  doc.rect(10, tableY, 190, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('Cant.', 13, tableY + 5.5);
  doc.text('Descripción', 30, tableY + 5.5);
  doc.text('Precio Unit.', 130, tableY + 5.5);
  doc.text('Total', 175, tableY + 5.5);

  var rows = document.querySelectorAll('#fe-lineas-body tr');
  var rowY = tableY + 8;
  doc.setTextColor(0, 0, 0);
  rows.forEach(function (row, idx) {
    var qty = (row.querySelector('.feQty') || {}).value || '1';
    var desc = (row.querySelector('.feDesc') || {}).value || '';
    var price = (row.querySelector('.fePrice') || {}).value || '0';
    var lt = ((row.querySelector('.feLineTotal') || {}).textContent || '').trim();
    var fillColor = idx % 2 === 0 ? [255, 255, 255] : [247, 253, 242];
    doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
    doc.rect(10, rowY, 190, 7, 'F');
    doc.setDrawColor(204, 233, 174);
    doc.line(10, rowY + 7, 200, rowY + 7);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(qty.toString(), 13, rowY + 5);
    doc.text(desc.substring(0, 45), 30, rowY + 5);
    doc.text(price.toString(), 130, rowY + 5);
    doc.text(lt.substring(0, 20), 175, rowY + 5);
    rowY += 7;
  });

  rowY += 4;
  doc.setFillColor(bg[0], bg[1], bg[2]);
  doc.roundedRect(120, rowY, 80, 32, 2, 2, 'F');
  doc.setDrawColor(border[0], border[1], border[2]);
  doc.roundedRect(120, rowY, 80, 32, 2, 2, 'S');
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 80, 40);
  doc.text('Subtotal:', 124, rowY + 8);
  doc.text(subtotal, 196, rowY + 8, { align: 'right' });
  doc.text(ivaLbl, 124, rowY + 15);
  doc.text(ivaAmt, 196, rowY + 15, { align: 'right' });
  doc.setDrawColor(g2[0], g2[1], g2[2]);
  doc.line(124, rowY + 19, 196, rowY + 19);
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(g3[0], g3[1], g3[2]);
  doc.text('TOTAL:', 124, rowY + 27);
  doc.text(total, 196, rowY + 27, { align: 'right' });

  if (obs) {
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 120, 80);
    doc.text('Observaciones: ' + obs.substring(0, 80), 10, rowY + 38);
  }

  if (document.getElementById('fe-firma-check').checked) {
    var firmaPdf = generarFirmaDigital({ num: num, fecha: fecha, emisor: emisor, total: total });
    var firmaY = rowY + 45;
    doc.setDrawColor(g2[0], g2[1], g2[2]);
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.roundedRect(10, firmaY, 190, 16, 2, 2, 'FD');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(g3[0], g3[1], g3[2]);
    doc.text('✓ Documento firmado digitalmente (simulado)', 14, firmaY + 6);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 100, 60);
    doc.text('Hash: ' + firmaPdf.hash, 14, firmaY + 11);
    doc.text('Fecha/hora: ' + firmaPdf.timestamp, 14, firmaY + 14.5);
  }

  doc.setFillColor(g3[0], g3[1], g3[2]);
  doc.rect(0, 282, 210, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text('KCN Studio · Matriz Contable CR · Costa Rica 🇨🇷', 105, 290, { align: 'center' });

  doc.save('factura-' + fecha + '.pdf');
  guardarFacturaHistorial();
  document.getElementById('saveStatus').textContent = 'PDF exportado';
});

// ══════════════════════════════════════════════
// SELECTOR DE IDIOMA
// Español e inglés: traducción completa.
// Bribri / Cabécar / Ngäbe / Boruca / Térraba / Maleku:
// SOLO se traducen los conceptos con palabra verificada
// en un diccionario real (2,515 entradas). Todo lo demás
// queda en español — no se inventa vocabulario.
// ══════════════════════════════════════════════
var TRANSLATIONS = {
  es: {
    undo: '↶ Deshacer', copy: '⧉ Copiar', paste: '📋 Pegar', bold: 'N',
    currency: '₡', percent: '%', format: '🔢 Formato', note: '📝 Nota',
    chart: '📊 Gráfico', totals: 'Σ Totales', csv: '⬇ CSV', addrow: '+Fila',
    delrow: '-Fila', addcol: '+Col', clear: 'Borrar', account: '👤 Cuenta', misMatrices: '📁 Mis Matrices',
    search: '🔎 Buscar', invoice: '🧾 Factura', fxlib: 'fx Funciones',
    mayorauto: '📗 Mayor Auto', balanceauto: '📊 Balance Auto', flujoauto: '💧 Flujo Efectivo',
    d101: '🇨🇷 D-101', history: '🕐 Historial', ready: 'Listo',
    formulaPh: 'Valor o fórmula: =SUMA(A1:A5)', rangePh: 'arrastrá celdas o escribí ej: A1:A5',
    close: '✕'
  },
  en: {
    undo: '↶ Undo', copy: '⧉ Copy', paste: '📋 Paste', bold: 'B',
    currency: '$', percent: '%', format: '🔢 Format', note: '📝 Note',
    chart: '📊 Chart', totals: 'Σ Totals', csv: '⬇ CSV', addrow: '+Row',
    delrow: '-Row', addcol: '+Col', clear: 'Clear', account: '👤 Account', misMatrices: '📁 My Sheets',
    search: '🔎 Search', invoice: '🧾 Invoice', fxlib: 'fx Functions',
    mayorauto: '📗 Ledger Auto', balanceauto: '📊 Trial Balance Auto', flujoauto: '💧 Cash Flow',
    d101: '🇨🇷 D-101', history: '🕐 History', ready: 'Ready',
    formulaPh: 'Value or formula: =SUM(A1:A5)', rangePh: 'drag cells or type e.g. A1:A5',
    close: '✕'
  },
  bribri: { search: '🔎 Ëyö bë', close: '✕ Kë yö bë', history: '🕐 Bë tsö kö' },
  cabecar: { search: '🔎 Ká bë', close: '✕ Kë wák bë', history: '🕐 Bë tsö kö' },
  maleku: { search: '🔎 Shíi nori', close: '✕ Kë jiri nori', history: '🕐 Nori nöri köri' },
  boruca: { search: '🔎 día', close: '✕ du ah' },
  ngabe: { search: '🔎 Jä migä', close: '✕ Kë bri migä', history: '🕐 Migä tsö kra' },
  terraba: { close: '✕ bong sas' }
};
var LANG_ELEMENTS = [
  { id: 'btnUndo', key: 'undo' }, { id: 'btnCopy', key: 'copy' }, { id: 'btnPaste', key: 'paste' },
  { id: 'btnCurrency', key: 'currency' }, { id: 'btnPercent', key: 'percent' },
  { id: 'btnFormat', key: 'format' }, { id: 'btnNote', key: 'note' }, { id: 'btnChart', key: 'chart' },
  { id: 'btnTotales', key: 'totals' }, { id: 'btnCSV', key: 'csv' }, { id: 'btnAddRow', key: 'addrow' },
  { id: 'btnDelRow', key: 'delrow' }, { id: 'btnAddCol', key: 'addcol' }, { id: 'btnClear', key: 'clear' },
  { id: 'btnAccount', key: 'account' }, { id: 'btnMisMatrices', key: 'misMatrices' }, { id: 'btnBuscarReemplazar', key: 'search' },
  { id: 'btnFactura', key: 'invoice' }, { id: 'btnFxLib', key: 'fxlib' },
  { id: 'btnLibroMayorAuto', key: 'mayorauto' }, { id: 'btnBalanceAuto', key: 'balanceauto' },
  { id: 'btnFlujoAuto', key: 'flujoauto' }, { id: 'btnD101', key: 'd101' },
  { id: 'feBtnHistorial', key: 'history' },
  { id: 'fnClose', key: 'close' }, { id: 'feClose', key: 'close' }, { id: 'feHistClose', key: 'close' },
  { id: 'siboCloseBtn', key: 'close' }, { id: 'brCancelBtn', key: 'close' }
];
var LANG_PLACEHOLDERS = [
  { id: 'formulaInput', key: 'formulaPh' }, { id: 'quickRange', key: 'rangePh' }
];
function applyLanguage(lang) {
  var t = TRANSLATIONS[lang] || {};
  var es = TRANSLATIONS.es;
  LANG_ELEMENTS.forEach(function (m) {
    var el = document.getElementById(m.id);
    if (el) el.textContent = t[m.key] || es[m.key] || el.textContent;
  });
  LANG_PLACEHOLDERS.forEach(function (m) {
    var el = document.getElementById(m.id);
    if (el) el.placeholder = t[m.key] || es[m.key] || el.placeholder;
  });
  try { localStorage.setItem('kcn_idioma', lang); } catch (e) {}
}
document.getElementById('langSelector').addEventListener('change', function () {
  applyLanguage(this.value);
});
(function () {
  var saved = null;
  try { saved = localStorage.getItem('kcn_idioma'); } catch (e) {}
  if (saved) {
    document.getElementById('langSelector').value = saved;
    applyLanguage(saved);
  }
})();

// ══════════════════════════════════════════════
// SIBÖ ✦ — Asistente contable (modo local, sin conexión externa)
// ══════════════════════════════════════════════
var SIBO_KB = [
  { k: ['iva', 'impuesto al valor'], r: 'El <b>IVA</b> en Costa Rica tiene tasa general de <b>13%</b>. Tasas reducidas: <b>4%</b> (boletos aéreos, servicios de salud privados), <b>2%</b> (medicamentos, seguros privados de salud, servicios educativos privados, primas de seguro), <b>1%</b> (canasta básica, insumos agropecuarios, equipo/material médico). Se declara mensualmente en el D-104 vía ATV de Hacienda. En la hoja podés usar la fórmula <b>=IVA(monto)</b> o <b>=IVA(monto;tasa)</b>.' },
  { k: ['factura electronica', 'factura electrónica', 'comprobante electronico'], r: 'La <b>Factura Electrónica</b> es obligatoria en Costa Rica desde 2018. La versión vigente es la <b>4.3</b>. Se estructura en XML, se firma digitalmente y se envía al sistema ATV de Hacienda; el receptor puede aceptar/rechazar el comprobante. En esta app tenés el botón <b>🧾 Factura</b> para generar el XML y el PDF con esa estructura, incluyendo firma digital simulada e historial de facturas.' },
  { k: ['libro diario', 'asiento contable', 'partida doble'], r: 'El <b>Libro Diario</b> registra cronológicamente cada transacción bajo el principio de <b>partida doble</b>: Débitos = Créditos, siempre. Es obligatorio según el Código de Comercio de Costa Rica. Usá la plantilla "📘 Libro Diario" del selector de plantillas para empezar con la estructura correcta.' },
  { k: ['libro mayor'], r: 'El <b>Libro Mayor</b> agrupa los movimientos del Libro Diario por cuenta contable, mostrando el saldo acumulado de cada una. En esta app tenés el botón <b>📗 Mayor Auto</b>, que lee tu hoja activa (columnas Fecha/Cuenta/Debe/Haber) y genera el mayor automáticamente en una hoja nueva.' },
  { k: ['balance de comprobacion', 'balance de comprobación'], r: 'El <b>Balance de Comprobación</b> lista todas las cuentas con sus totales de débito y crédito, para verificar que la contabilidad esté cuadrada (Total Debe = Total Haber). Usá el botón <b>📊 Balance Auto</b> — genera el balance desde tu hoja activa y te dice si está "✓ Cuadrado" o cuál es la diferencia.' },
  { k: ['conciliacion bancaria', 'conciliación bancaria', 'estado de cuenta'], r: 'La <b>conciliación bancaria</b> compara el saldo del estado de cuenta del banco contra el saldo en libros, ajustando por cheques en tránsito, depósitos no acreditados, comisiones bancarias y errores. Usá la plantilla "🏦 Conciliación Bancaria" del selector.' },
  { k: ['niif', 'ifrs', 'pcga'], r: 'Las <b>NIIF</b> (Normas Internacionales de Información Financiera) son adoptadas oficialmente en Costa Rica por el CONASSIF. Existen las <b>NIIF completas</b> (empresas grandes/reguladas) y <b>NIIF para PyMEs</b> (versión simplificada para la mayoría de empresas costarricenses). Reemplazaron a los antiguos PCGA.' },
  { k: ['ccss', 'cargas sociales', 'seguro social'], r: 'Las <b>cargas sociales</b> (CCSS) en Costa Rica suman aproximadamente <b>26.83%</b> a cargo del patrono y <b>10.83%</b> a cargo del trabajador sobre el salario bruto. Usá la fórmula <b>=PLANILLA.CCSS(salario)</b> para el total, o <b>=PLANILLA.CCSS(salario;"patronal")</b> / <b>"obrero"</b> para cada parte por separado.' },
  { k: ['aguinaldo'], r: 'El <b>aguinaldo</b> en Costa Rica se calcula sumando todos los salarios brutos devengados entre el 1 de diciembre y el 30 de noviembre del año siguiente, dividido entre 12. Se paga antes del 20 de diciembre. Fórmula: <b>=AGUINALDO(salario_promedio;meses_trabajados)</b>.' },
  { k: ['cesantia', 'cesantía'], r: 'La <b>cesantía</b> es una indemnización por despido sin justa causa, calculada según años laborados (tope de 8 años según el Código de Trabajo). Fórmula: <b>=CESANTIA(salario;años_laborados)</b>. Para menos de 3 meses no aplica; entre 3 meses y 1 año se calcula distinto que después del primer año.' },
  { k: ['preaviso'], r: 'El <b>preaviso</b> es el aviso previo que debe dar el patrono (o compensar en dinero) al despedir a un trabajador sin justa causa. Va de 0 días (menos de 3 meses laborados) hasta 1 mes completo (más de 1 año). Fórmula: <b>=PREAVISO(salario;años_laborados)</b>.' },
  { k: ['renta', 'd-101', 'd101', 'impuesto sobre la renta'], r: 'El <b>Impuesto sobre la Renta</b> para personas físicas con actividad lucrativa se calcula por tramos progresivos (0%, 10%, 15%, 20%, 25% para 2026). Usá el botón <b>🇨🇷 D-101</b> para generar una hoja completa con ingresos, gastos deducibles y el cálculo automático vía <b>=IMPUESTO.D101(renta_neta;"PF")</b> (también aceptás "PYME" o "GENERAL").' },
  { k: ['planilla', 'nomina', 'nómina'], r: 'Para armar una planilla necesitás: salario bruto, deducciones de ley (CCSS obrero ~10.83%, renta si aplica), y el neto a pagar. Combiná <b>=PLANILLA.CCSS(salario;"obrero")</b> con <b>=RENTA.TRABAJO(salario)</b> para el cálculo completo de deducciones por empleado.' },
  { k: ['formula', 'fórmula', 'como calculo', 'cómo calculo'], r: 'Esta app tiene cerca de <b>500 fórmulas</b> disponibles: matemáticas, estadísticas, texto, fecha, búsqueda, financieras y las exclusivas de Costa Rica (IVA, CCSS, Aguinaldo, Cesantía, Preaviso, Renta). Tocá el botón <b>fx Funciones</b> para buscarlas por categoría o por nombre, y usá "Insertar en celda" para no tener que escribirlas de memoria.' },
  { k: ['plantilla', 'template'], r: 'Tenés plantillas contables listas en el selector "📁 Plantilla...": Libro Diario, Libro Mayor, Balance de Comprobación, Conciliación Bancaria, D-151, Estado de Resultados y Balance General. Elegí una y se crea una hoja nueva con la estructura y fórmulas ya armadas.' },
  { k: ['grafico', 'gráfico', 'chart'], r: 'Para insertar un gráfico: seleccioná el rango de datos (arrastrando el dedo sobre las celdas), tocá <b>📊 Gráfico</b>, elegí el tipo (barras, línea, torta o dona), y confirmá. Podés descargarlo como PNG con el botón ⬇ dentro del gráfico.' },
  { k: ['sincroniza', 'nube', 'compartir hoja', 'colaborar'], r: 'Con el botón <b>☁ Sincronizar</b> podés compartir una matriz en tiempo real: ponele un código a la hoja (ej. MATRIZ-CLIENTE-001) y cualquiera con ese mismo código en su app va a ver los cambios sincronizados automáticamente.' },
  { k: ['ayuda', 'que puedes hacer', 'qué podés hacer', 'que sabes hacer'], r: 'Puedo ayudarte con temas contables de Costa Rica: <b>IVA</b>, <b>Factura Electrónica</b>, <b>Libro Diario/Mayor</b>, <b>Balance de Comprobación</b>, <b>Conciliación Bancaria</b>, <b>NIIF</b>, <b>CCSS</b>, <b>Aguinaldo</b>, <b>Cesantía</b>, <b>Preaviso</b>, <b>Renta/D-101</b> y <b>Planillas</b>. También te oriento sobre cómo usar las fórmulas, plantillas, gráficos y sincronización de esta app. Preguntame lo que necesités.' }
];
var SIBO_DEFAULT = 'No tengo una respuesta preparada para eso todavía — estoy corriendo en <b>modo local</b> (sin conexión a un servidor de IA externo), así que respondo por palabras clave. Probá con: IVA, Factura Electrónica, Libro Diario, Balance, Conciliación, NIIF, CCSS, Aguinaldo, Cesantía, Preaviso, Renta, Planilla, Fórmulas, Plantillas o Gráficos.';

function siboBuscarRespuesta(msg) {
  var m = msg.toLowerCase();
  for (var i = 0; i < SIBO_KB.length; i++) {
    var entry = SIBO_KB[i];
    for (var j = 0; j < entry.k.length; j++) {
      if (m.indexOf(entry.k[j]) >= 0) return entry.r;
    }
  }
  return SIBO_DEFAULT;
}

function siboGetHistorial() {
  try { return JSON.parse(localStorage.getItem('kcn_sibo_historial') || '[]'); } catch (e) { return []; }
}
function siboGuardarHistorial(hist) {
  try { localStorage.setItem('kcn_sibo_historial', JSON.stringify(hist.slice(-40))); } catch (e) {}
}
function siboRenderMensaje(texto, esUsuario) {
  var wrap = document.getElementById('siboMessages');
  var div = document.createElement('div');
  div.className = esUsuario ? 'siboMsgUser' : 'siboMsgBot';
  div.innerHTML = texto;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}
function siboRenderHistorial() {
  var wrap = document.getElementById('siboMessages');
  wrap.innerHTML = '';
  var hist = siboGetHistorial();
  if (!hist.length) {
    siboRenderMensaje('¡Hola! Soy <b>Sibö ✦</b>, tu asistente contable de Matriz Contable CR. Preguntame sobre IVA, facturas, libros contables, CCSS, y más — o tocá uno de los chips de arriba.', false);
    return;
  }
  hist.forEach(function (h) { siboRenderMensaje(h.texto, h.user); });
}
function siboEnviarTexto(texto) {
  texto = (texto || '').trim();
  if (!texto) return;
  var hist = siboGetHistorial();
  hist.push({ user: true, texto: texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') });
  siboRenderMensaje(hist[hist.length - 1].texto, true);
  var respuesta = siboBuscarRespuesta(texto);
  hist.push({ user: false, texto: respuesta });
  siboGuardarHistorial(hist);
  setTimeout(function () { siboRenderMensaje(respuesta, false); }, 260);
}
function renderSiboChips() {
  var chips = ['IVA CR', 'Factura Electrónica', 'Libro Diario', 'Balance', 'Conciliación Bancaria', 'CCSS', 'Aguinaldo', 'Renta D-101', 'Fórmulas', 'Plantillas'];
  var wrap = document.getElementById('siboChips');
  wrap.innerHTML = chips.map(function (c) { return '<button class="siboChip">' + c + '</button>'; }).join('');
  wrap.querySelectorAll('.siboChip').forEach(function (btn) {
    btn.addEventListener('click', function () { siboEnviarTexto(btn.textContent); });
  });
}
document.getElementById('btnSibo').addEventListener('click', function () {
  renderSiboChips();
  siboRenderHistorial();
  document.getElementById('siboOverlay').classList.add('show');
  document.getElementById('siboInput').focus();
});
document.getElementById('siboCloseBtn').addEventListener('click', function () {
  document.getElementById('siboOverlay').classList.remove('show');
});
document.getElementById('siboClearBtn').addEventListener('click', function () {
  if (!confirm('¿Limpiar el historial del chat con Sibö?')) return;
  siboGuardarHistorial([]);
  siboRenderHistorial();
});
document.getElementById('siboSendBtn').addEventListener('click', function () {
  var inp = document.getElementById('siboInput');
  siboEnviarTexto(inp.value);
  inp.value = '';
});
document.getElementById('siboInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    siboEnviarTexto(this.value);
    this.value = '';
  }
});

// ══════════════════════════════════════════════
// BIBLIOTECA DE FUNCIONES (fx) — modal categorizado
// ══════════════════════════════════════════════
function renderFnCats() {
  var wrap = document.getElementById('fnCats');
  var html = '';
  Object.keys(fnData).forEach(function (cat) {
    html += '<div class="fnCatChip' + (cat === fnCurrentCat ? ' active' : '') + '" data-cat="' + cat + '">' + cat + ' (' + fnData[cat].length + ')</div>';
  });
  wrap.innerHTML = html;
  wrap.querySelectorAll('.fnCatChip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      fnCurrentCat = chip.dataset.cat;
      document.getElementById('fnSearchInput').value = '';
      renderFnCats();
      renderFnList(fnData[fnCurrentCat] || []);
    });
  });
}
function renderFnList(list) {
  var wrap = document.getElementById('fnList');
  if (!list.length) { wrap.innerHTML = '<div id="fnEmptyMsg">No se encontraron funciones.</div>'; return; }
  var html = '';
  list.forEach(function (f, i) {
    html += '<div class="fnItem" data-idx="' + i + '"><div class="fnName">' + f.n + (f.e ? ' <span style="color:#999;font-weight:400;">(' + f.e + ')</span>' : '') + '</div><div class="fnDesc">' + (f.d || '') + '</div></div>';
  });
  wrap.innerHTML = html;
  wrap.querySelectorAll('.fnItem').forEach(function (el) {
    el.addEventListener('click', function () {
      wrap.querySelectorAll('.fnItem.selected').forEach(function (e) { e.classList.remove('selected'); });
      el.classList.add('selected');
      showFnDetail(list[parseInt(el.dataset.idx)]);
    });
  });
}
function showFnDetail(f) {
  fnSelectedItem = f;
  document.getElementById('fnDetailPanel').classList.remove('empty');
  document.getElementById('fnDetailName').textContent = f.n + (f.e ? ' / ' + f.e : '');
  document.getElementById('fnDetailSyntax').textContent = f.s || '';
  document.getElementById('fnDetailDesc').textContent = f.d || '';
  document.getElementById('fnDetailEx').textContent = f.x ? 'Ejemplo: ' + f.x : '';
}
document.getElementById('btnFxLib').addEventListener('click', function () {
  if (!fnCurrentCat) fnCurrentCat = Object.keys(fnData)[0];
  document.getElementById('fnSearchInput').value = '';
  document.getElementById('fnDetailPanel').classList.add('empty');
  renderFnCats();
  renderFnList(fnData[fnCurrentCat] || []);
  document.getElementById('fnOverlay').classList.add('show');
});
document.getElementById('fnClose').addEventListener('click', function () {
  document.getElementById('fnOverlay').classList.remove('show');
});
document.getElementById('fnSearchInput').addEventListener('input', function () {
  var q = this.value.trim().toLowerCase();
  if (!q) { renderFnList(fnData[fnCurrentCat] || []); return; }
  var res = [];
  Object.values(fnData).forEach(function (arr) {
    arr.forEach(function (f) {
      if ((f.n || '').toLowerCase().indexOf(q) >= 0 || (f.e || '').toLowerCase().indexOf(q) >= 0 || (f.d || '').toLowerCase().indexOf(q) >= 0) res.push(f);
    });
  });
  renderFnList(res);
});
document.getElementById('fnInsertBtn').addEventListener('click', function () {
  if (!fnSelectedItem) return;
  var id = document.getElementById('cellRef').textContent;
  var el = document.getElementById('cell_' + id);
  var toInsert = '=' + (fnSelectedItem.s || (fnSelectedItem.n + '()'));
  snapshot();
  document.getElementById('formulaInput').value = toInsert;
  if (el) el.textContent = toInsert;
  document.getElementById('fnOverlay').classList.remove('show');
  if (el) { el.focus(); }
});

document.getElementById('btnNote').addEventListener('click', function () {
  var id = document.getElementById('cellRef').textContent;
  document.getElementById('noteCellRef').textContent = id;
  document.getElementById('noteText').value = (sheetNotes[activeSheet] && sheetNotes[activeSheet][id]) || '';
  document.getElementById('noteOverlay').classList.add('show');
});
document.getElementById('noteCancel').addEventListener('click', function () { document.getElementById('noteOverlay').classList.remove('show'); });
document.getElementById('noteSave').addEventListener('click', function () {
  snapshot();
  var id = document.getElementById('cellRef').textContent;
  if (!sheetNotes[activeSheet]) sheetNotes[activeSheet] = {};
  sheetNotes[activeSheet][id] = document.getElementById('noteText').value;
  document.getElementById('noteOverlay').classList.remove('show');
  renderAllCells(); autoSave();
});
document.getElementById('noteDelete').addEventListener('click', function () {
  snapshot();
  var id = document.getElementById('cellRef').textContent;
  if (sheetNotes[activeSheet]) delete sheetNotes[activeSheet][id];
  document.getElementById('noteOverlay').classList.remove('show');
  renderAllCells(); autoSave();
});

// ══════════════════════════════════════════════
// EVENTOS DE CELDA + NAVEGACIÓN + SELECCIÓN DE RANGO
// ══════════════════════════════════════════════
function clearRangeHighlight() {
  document.querySelectorAll('.cell.in-range').forEach(function (e) { e.classList.remove('in-range'); });
}
function currentRangeBounds() {
  if (!selRangeStart || !selRangeEnd) return null;
  var mA = selRangeStart.match(/([A-Za-z]+)(\\d+)/), mB = selRangeEnd.match(/([A-Za-z]+)(\\d+)/);
  if (!mA || !mB) return null;
  var c1 = colIndex(mA[1]), r1 = parseInt(mA[2]) - 1, c2 = colIndex(mB[1]), r2 = parseInt(mB[2]) - 1;
  var minC = Math.min(c1, c2), maxC = Math.max(c1, c2), minR = Math.min(r1, r2), maxR = Math.max(r1, r2);
  return { minC: minC, maxC: maxC, minR: minR, maxR: maxR, isMulti: (minC !== maxC || minR !== maxR) };
}
function highlightRange(idA, idB) {
  clearRangeHighlight();
  if (!idA || !idB) return;
  var mA = idA.match(/([A-Za-z]+)(\\d+)/), mB = idB.match(/([A-Za-z]+)(\\d+)/);
  if (!mA || !mB) return;
  var c1 = colIndex(mA[1]), r1 = parseInt(mA[2]) - 1, c2 = colIndex(mB[1]), r2 = parseInt(mB[2]) - 1;
  var minC = Math.min(c1, c2), maxC = Math.max(c1, c2), minR = Math.min(r1, r2), maxR = Math.max(r1, r2);
  for (var r = minR; r <= maxR; r++) for (var c = minC; c <= maxC; c++) {
    var el = document.getElementById('cell_' + cellId(r, c));
    if (el) el.classList.add('in-range');
  }
  var rangeStr = cellId(minR, minC) + ':' + cellId(maxR, maxC);
  document.getElementById('quickRange').value = rangeStr;
  document.getElementById('quickRange').dispatchEvent(new Event('input'));
  var bounds = currentRangeBounds();
  var rab = document.getElementById('rangeActionsBar');
  if (bounds && bounds.isMulti) {
    document.getElementById('rangeLabel').textContent = rangeStr;
    rab.classList.add('show');
  } else {
    rab.classList.remove('show');
  }
}
function rangeCellIds() {
  var b = currentRangeBounds();
  if (!b) return [];
  var out = [];
  for (var r = b.minR; r <= b.maxR; r++) for (var c = b.minC; c <= b.maxC; c++) out.push(cellId(r, c));
  return out;
}

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
    el.addEventListener('pointerdown', function (e) {
      isSelecting = true; selRangeStart = el.dataset.id; selRangeEnd = el.dataset.id;
      document.getElementById('rangeActionsBar').classList.remove('show');
    });
    el.addEventListener('pointerenter', function () {
      if (isSelecting) { selRangeEnd = el.dataset.id; highlightRange(selRangeStart, selRangeEnd); }
    });
  });
  document.addEventListener('pointerup', function () { isSelecting = false; });
}

// ── Gesto de deshacer: toque simultáneo con 2 dedos sobre la grilla ──
(function () {
  var gridWrap = document.getElementById('gridWrap');
  var gestureFired = false;
  gridWrap.addEventListener('touchstart', function (e) {
    if (e.touches.length >= 2) {
      isSelecting = false;
      clearRangeHighlight();
      document.getElementById('rangeActionsBar').classList.remove('show');
      if (!gestureFired) {
        gestureFired = true;
        undo();
        var hint = document.getElementById('undoGestureHint');
        hint.classList.add('show');
        setTimeout(function () { hint.classList.remove('show'); }, 1200);
      }
    }
  }, { passive: true });
  gridWrap.addEventListener('touchend', function (e) {
    if (e.touches.length === 0) { gestureFired = false; }
  }, { passive: true });
})();
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

document.getElementById('btnCopy').addEventListener('click', function () {
  var id = document.getElementById('cellRef').textContent;
  clipboard = { value: getRaw(id), format: (sheetFormats[activeSheet] && sheetFormats[activeSheet][id]) || null };
  document.getElementById('saveStatus').textContent = 'Copiado ' + id;
});
document.getElementById('btnPaste').addEventListener('click', function () {
  if (!clipboard) { alert('Nada para pegar. Usá Copiar primero.'); return; }
  snapshot();
  var id = document.getElementById('cellRef').textContent;
  if (!sheetData[activeSheet]) sheetData[activeSheet] = {};
  if (clipboard.value === '') delete sheetData[activeSheet][id]; else sheetData[activeSheet][id] = clipboard.value;
  if (clipboard.format) { if (!sheetFormats[activeSheet]) sheetFormats[activeSheet] = {}; sheetFormats[activeSheet][id] = JSON.parse(JSON.stringify(clipboard.format)); }
  document.getElementById('formulaInput').value = clipboard.value;
  renderAllCells(); autoSave();
});

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
  if (sheetFormats[activeSheet][id].currency) sheetFormats[activeSheet][id].percent = false;
  renderAllCells(); autoSave();
});
document.getElementById('btnPercent').addEventListener('click', function () {
  snapshot();
  var id = document.getElementById('cellRef').textContent;
  if (!sheetFormats[activeSheet]) sheetFormats[activeSheet] = {};
  if (!sheetFormats[activeSheet][id]) sheetFormats[activeSheet][id] = {};
  sheetFormats[activeSheet][id].percent = !sheetFormats[activeSheet][id].percent;
  if (sheetFormats[activeSheet][id].percent) sheetFormats[activeSheet][id].currency = false;
  renderAllCells(); autoSave();
});
document.getElementById('btnClear').addEventListener('click', function () {
  snapshot();
  var id = document.getElementById('cellRef').textContent;
  delete sheetData[activeSheet][id];
  if (sheetFormats[activeSheet]) delete sheetFormats[activeSheet][id];
  if (sheetNotes[activeSheet]) delete sheetNotes[activeSheet][id];
  document.getElementById('formulaInput').value = '';
  renderAllCells(); autoSave();
});
document.getElementById('btnAddRow').addEventListener('click', function () { snapshot(); ROWS += 10; buildTable(); });
document.getElementById('btnAddCol').addEventListener('click', function () { snapshot(); COLS = Math.min(26, COLS + 4); buildTable(); });

document.getElementById('btnDelRow').addEventListener('click', function () {
  var id = document.getElementById('cellRef').textContent;
  var m = id.match(/([A-Za-z]+)(\\d+)/);
  var targetRow = parseInt(m[2]) - 1;
  if (!confirm('¿Eliminar la fila ' + (targetRow + 1) + '?')) return;
  snapshot();
  var d = sheetData[activeSheet], f = sheetFormats[activeSheet];
  for (var r = targetRow; r < ROWS - 1; r++) {
    for (var c = 0; c < COLS; c++) {
      var nk = cellId(r + 1, c), ck = cellId(r, c);
      if (d[nk] !== undefined) d[ck] = d[nk]; else delete d[ck];
      if (f[nk] !== undefined) f[ck] = f[nk]; else delete f[ck];
    }
  }
  for (var c2 = 0; c2 < COLS; c2++) { delete d[cellId(ROWS - 1, c2)]; delete f[cellId(ROWS - 1, c2)]; }
  buildTable(); autoSave();
});

document.getElementById('btnInsertarTabla').addEventListener('click', function () {
  var id = document.getElementById('cellRef').textContent;
  var m = id.match(/([A-Za-z]+)(\\\\d+)/);
  var startCol = colIndex(m[1]), startRow = parseInt(m[2]) - 1;
  var hoy = new Date().toLocaleDateString('es-CR');
  snapshot();
  if (!sheetData[activeSheet]) sheetData[activeSheet] = {};
  if (!sheetFormats[activeSheet]) sheetFormats[activeSheet] = {};
  var d = sheetData[activeSheet], f = sheetFormats[activeSheet];
  var headers = ['Fecha', 'Cuenta', 'Debe (₡)', 'Haber (₡)', 'Saldo'];
  headers.forEach(function (h, i) { d[cellId(startRow, startCol + i)] = h; f[cellId(startRow, startCol + i)] = { bold: true }; });
  var filas = [
    [hoy, 'Caja y Bancos', '56500', '', '56500'],
    ['', 'Ventas', '', '50000', ''],
    ['', 'IVA por Pagar', '', '6500', '']
  ];
  filas.forEach(function (fila, ri) {
    fila.forEach(function (val, ci) { d[cellId(startRow + 1 + ri, startCol + ci)] = val; });
  });
  var totalRow = startRow + 4;
  d[cellId(totalRow, startCol + 1)] = 'TOTAL';
  f[cellId(totalRow, startCol + 1)] = { bold: true };
  d[cellId(totalRow, startCol + 2)] = '=SUMA(' + cellId(startRow + 1, startCol + 2) + ':' + cellId(startRow + 3, startCol + 2) + ')';
  d[cellId(totalRow, startCol + 3)] = '=SUMA(' + cellId(startRow + 1, startCol + 3) + ':' + cellId(startRow + 3, startCol + 3) + ')';
  if (totalRow >= ROWS) ROWS = totalRow + 5;
  if (startCol + headers.length > COLS) COLS = Math.min(26, startCol + headers.length + 2);
  buildTable(); autoSave();
  var next = document.getElementById('cell_' + cellId(startRow, startCol));
  if (next) next.focus();
  document.getElementById('saveStatus').textContent = 'Tabla insertada';
});

document.getElementById('btnTotales').addEventListener('click', function () {
  var id = document.getElementById('cellRef').textContent;
  var m = id.match(/([A-Za-z]+)(\\d+)/);
  var startRow = parseInt(m[2]) - 1, startCol = colIndex(m[1]);
  var endRow = startRow;
  for (var r = startRow; r < ROWS; r++) {
    var hasData = false;
    for (var c = startCol; c < Math.min(COLS, startCol + 12); c++) { if (getRaw(cellId(r, c))) { hasData = true; break; } }
    if (hasData) endRow = r; else if (r > startRow + 1) break;
  }
  var numCols = 0;
  for (var r2 = startRow; r2 <= endRow; r2++)
    for (var c2 = startCol; c2 < startCol + 12; c2++)
      if (getRaw(cellId(r2, c2))) numCols = Math.max(numCols, c2 - startCol + 1);
  snapshot();
  var totalRow = endRow + 1;
  if (!sheetData[activeSheet]) sheetData[activeSheet] = {};
  if (!sheetFormats[activeSheet]) sheetFormats[activeSheet] = {};
  sheetData[activeSheet][cellId(totalRow, startCol)] = 'TOTAL';
  sheetFormats[activeSheet][cellId(totalRow, startCol)] = { bold: true };
  var added = 0;
  for (var nc = 1; nc < numCols; nc++) {
    var hasNums = false;
    for (var ri = startRow; ri <= endRow; ri++) { var v = getRaw(cellId(ri, startCol + nc)) || ''; if (v && !isNaN(parseFloat(String(v).replace(/[₡,\\s]/g, '')))) { hasNums = true; break; } }
    if (hasNums) { sheetData[activeSheet][cellId(totalRow, startCol + nc)] = '=SUMA(' + cellId(startRow, startCol + nc) + ':' + cellId(endRow, startCol + nc) + ')'; added++; }
  }
  buildTable(); autoSave();
  document.getElementById('saveStatus').textContent = 'Totales (' + added + ' col.)';
});

document.getElementById('templateSelect').addEventListener('change', function () {
  var v = this.value; if (!v) return; snapshot(); loadTemplate(v); this.value = '';
});

function loadTemplate(tipo) {
  var hoy = new Date().toLocaleDateString('es-CR');
  var n = sheets.length + 1;
  var baseName = tipo === 'diario' ? 'Diario' : tipo === 'mayor' ? 'Mayor' : tipo === 'balance' ? 'Balance' : tipo === 'conciliacion' ? 'Conciliacion' : tipo === 'd151' ? 'D151' : tipo === 'resultados' ? 'EstadoResultados' : tipo === 'balancegeneral' ? 'BalanceGeneral' : 'Hoja';
  var name = baseName;
  while (sheets.indexOf(name) >= 0) name = baseName + n++;
  sheets.push(name); sheetData[name] = {}; sheetFormats[name] = {}; sheetNotes[name] = {}; colWidths[name] = {};
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
  } else if (tipo === 'd151') {
    set(0, 0, '🛒 D-151 COMPRAS Y VENTAS', true);
    ['Fecha', 'Tipo', 'N° Doc.', 'Cédula', 'Nombre', 'Condición', 'Subtotal (₡)', 'IVA (₡)', 'Total (₡)'].forEach(function (h, i) { set(1, i, h, true); });
    [[hoy, 'FE', '001-001-000001', '3-101-000000', 'Cliente A S.A.', 'Contado', '50000', '6500', '56500'],
     [hoy, 'FE', '001-001-000002', '1-234-567890', 'Juan Pérez', 'Crédito', '20000', '2600', '22600'],
     [hoy, 'FC', '001-002-000001', '3-102-111222', 'Proveedor B S.A.', 'Contado', '35000', '4550', '39550']]
      .forEach(function (row, i) { row.forEach(function (v, j) { set(2 + i, j, v); }); });
    set(5, 5, 'TOTALES', true);
    d[cellId(5, 6)] = '=SUMA(G3:G5)'; d[cellId(5, 7)] = '=SUMA(H3:H5)'; d[cellId(5, 8)] = '=SUMA(I3:I5)';
  } else if (tipo === 'resultados') {
    set(0, 0, '📈 ESTADO DE RESULTADOS', true);
    set(1, 0, 'Período: ' + hoy);
    set(3, 0, 'INGRESOS', true);
    set(4, 0, 'Ventas'); set(4, 1, '450000');
    set(5, 0, 'Otros ingresos'); set(5, 1, '15000');
    set(6, 0, 'TOTAL INGRESOS', true);
    d[cellId(6, 1)] = '=SUMA(B5:B6)';

    set(8, 0, 'COSTO DE VENTAS', true);
    set(9, 0, 'Costo de mercadería vendida'); set(9, 1, '210000');
    set(10, 0, 'TOTAL COSTO DE VENTAS', true);
    d[cellId(10, 1)] = '=B10';

    set(12, 0, 'UTILIDAD BRUTA', true);
    d[cellId(12, 1)] = '=B7-B11';

    set(14, 0, 'GASTOS OPERATIVOS', true);
    set(15, 0, 'Salarios'); set(15, 1, '90000');
    set(16, 0, 'Alquiler'); set(16, 1, '35000');
    set(17, 0, 'Servicios públicos'); set(17, 1, '12000');
    set(18, 0, 'Depreciación'); set(18, 1, '8000');
    set(19, 0, 'TOTAL GASTOS OPERATIVOS', true);
    d[cellId(19, 1)] = '=SUMA(B16:B19)';

    set(21, 0, 'UTILIDAD DE OPERACIÓN', true);
    d[cellId(21, 1)] = '=B13-B20';

    set(23, 0, 'IMPUESTO DE RENTA (D-101)', true);
    d[cellId(23, 1)] = '=IMPUESTO.D101(B22;"PF")';

    set(25, 0, 'UTILIDAD NETA', true);
    d[cellId(25, 1)] = '=B22-B24';
    f[cellId(25, 1)] = { bold: true };
  } else if (tipo === 'balancegeneral') {
    set(0, 0, '🏛️ BALANCE GENERAL', true);
    set(1, 0, 'Al: ' + hoy);

    set(3, 0, 'ACTIVO', true);
    set(4, 0, 'Activo Circulante', true);
    set(5, 0, 'Caja y Bancos'); set(5, 1, '85000');
    set(6, 0, 'Cuentas por Cobrar'); set(6, 1, '42000');
    set(7, 0, 'Inventario'); set(7, 1, '63000');
    set(8, 0, 'Total Activo Circulante', true);
    d[cellId(8, 1)] = '=SUMA(B6:B8)';

    set(10, 0, 'Activo No Circulante', true);
    set(11, 0, 'Mobiliario y Equipo'); set(11, 1, '120000');
    set(12, 0, '(-) Depreciación Acumulada'); set(12, 1, '-25000');
    set(13, 0, 'Total Activo No Circulante', true);
    d[cellId(13, 1)] = '=SUMA(B12:B13)';

    set(15, 0, 'TOTAL ACTIVO', true);
    d[cellId(15, 1)] = '=B9+B14';
    f[cellId(15, 1)] = { bold: true };

    set(17, 0, 'PASIVO', true);
    set(18, 0, 'Cuentas por Pagar'); set(18, 1, '38000');
    set(19, 0, 'Préstamos por Pagar'); set(19, 1, '55000');
    set(20, 0, 'TOTAL PASIVO', true);
    d[cellId(20, 1)] = '=SUMA(B19:B20)';

    set(22, 0, 'PATRIMONIO', true);
    set(23, 0, 'Capital Social'); set(23, 1, '150000');
    set(24, 0, 'Utilidades Retenidas'); set(24, 1, '42000');
    set(25, 0, 'TOTAL PATRIMONIO', true);
    d[cellId(25, 1)] = '=SUMA(B24:B25)';

    set(27, 0, 'TOTAL PASIVO + PATRIMONIO', true);
    d[cellId(27, 1)] = '=B21+B26';
    f[cellId(27, 1)] = { bold: true };
  }
  buildTable(); autoSave();
}

// ══════════════════════════════════════════════
// MÓDULOS CONTABLES AUTOMÁTICOS
// (Libro Mayor · Balance Comprobación · Flujo de
// Efectivo · Declaración D-101) — leen la hoja activa
// detectando columnas Fecha/Cuenta/Debe/Haber, igual
// que la versión web (leerHojaActiva).
// ══════════════════════════════════════════════
function leerHojaParaModulos() {
  var src = sheetData[activeSheet] || {};
  var headers = [], maxCol = 0, maxRow = 0;
  Object.keys(src).forEach(function (key) {
    var m = key.match(/^([A-Z]+)(\\d+)/);
    if (!m) return;
    var c = colIndex(m[1]), r = parseInt(m[2]) - 1;
    if (c > maxCol) maxCol = c;
    if (r > maxRow) maxRow = r;
  });
  if (!Object.keys(src).length) return { rows: [] };
  var headerRow = 0;
  for (var c0 = 0; c0 <= maxCol; c0++) {
    var v = computeValue(cellId(headerRow, c0));
    if (v) headers[c0] = String(v).toLowerCase().trim();
  }
  var colMap = { fecha: -1, cuenta: -1, debe: -1, haber: -1 };
  headers.forEach(function (h, i) {
    if (!h) return;
    if (colMap.fecha < 0 && /fecha/.test(h)) colMap.fecha = i;
    if (colMap.cuenta < 0 && /(cuenta|descripci|concepto)/.test(h)) colMap.cuenta = i;
    if (colMap.debe < 0 && /debe|d[eé]bito/.test(h)) colMap.debe = i;
    if (colMap.haber < 0 && /haber|cr[eé]dito/.test(h)) colMap.haber = i;
  });
  if (colMap.fecha < 0) colMap.fecha = 0;
  if (colMap.cuenta < 0) colMap.cuenta = headers.length >= 4 ? 3 : (headers.length >= 2 ? 1 : 0);
  if (colMap.debe < 0) colMap.debe = headers.length >= 5 ? 4 : Math.max(0, headers.length - 2);
  if (colMap.haber < 0) colMap.haber = headers.length >= 6 ? 5 : Math.max(0, headers.length - 1);
  var rows = [];
  for (var r = headerRow + 1; r <= maxRow; r++) {
    var raw = [], hasData = false;
    for (var c = 0; c <= maxCol; c++) {
      var val = computeValue(cellId(r, c)) || '';
      if (val !== '') hasData = true;
      raw.push(val);
    }
    if (!hasData) continue;
    if (String(raw[colMap.cuenta] || '').toUpperCase().indexOf('TOTAL') === 0) continue;
    rows.push({
      fecha: colMap.fecha >= 0 ? raw[colMap.fecha] || '' : '',
      cuenta: colMap.cuenta >= 0 ? raw[colMap.cuenta] || '' : '',
      debe: toNum(raw[colMap.debe]),
      haber: toNum(raw[colMap.haber])
    });
  }
  return { rows: rows };
}

function crearHojaDestino(baseName) {
  var n = sheets.length + 1;
  var name = baseName;
  while (sheets.indexOf(name) >= 0) name = baseName + n++;
  sheets.push(name); sheetData[name] = {}; sheetFormats[name] = {}; sheetNotes[name] = {}; colWidths[name] = {};
  return name;
}

document.getElementById('btnLibroMayorAuto').addEventListener('click', function () {
  var data = leerHojaParaModulos();
  if (!data.rows.length) { alert('No se detectaron movimientos (columnas Fecha/Cuenta/Debe/Haber) en la hoja activa.'); return; }
  snapshot();
  var name = crearHojaDestino('Mayor-Auto');
  var origen = activeSheet;
  activeSheet = name;
  var d = sheetData[name], f = sheetFormats[name];
  function set(r, c, v, bold) { d[cellId(r, c)] = v; if (bold) f[cellId(r, c)] = { bold: true }; }
  var cuentas = {};
  data.rows.forEach(function (row) {
    var key = row.cuenta || '(sin cuenta)';
    if (!cuentas[key]) cuentas[key] = [];
    cuentas[key].push(row);
  });
  set(0, 0, '📗 LIBRO MAYOR AUTOMÁTICO — origen: ' + origen, true);
  var r = 2;
  Object.keys(cuentas).sort().forEach(function (cuenta) {
    var movs = cuentas[cuenta];
    var saldo = 0;
    set(r, 0, cuenta, true); r++;
    ['Fecha', 'Debe', 'Haber', 'Saldo'].forEach(function (h, i) { set(r, i, h, true); });
    r++;
    movs.forEach(function (m) {
      saldo += m.debe - m.haber;
      set(r, 0, m.fecha); set(r, 1, m.debe || ''); set(r, 2, m.haber || ''); set(r, 3, saldo);
      r++;
    });
    set(r, 0, 'TOTAL', true);
    set(r, 1, movs.reduce(function (a, m) { return a + m.debe; }, 0));
    set(r, 2, movs.reduce(function (a, m) { return a + m.haber; }, 0));
    set(r, 3, saldo);
    f[cellId(r, 1)] = { bold: true }; f[cellId(r, 2)] = { bold: true }; f[cellId(r, 3)] = { bold: true };
    r += 2;
  });
  buildTable(); autoSave();
});

document.getElementById('btnBalanceAuto').addEventListener('click', function () {
  var data = leerHojaParaModulos();
  if (!data.rows.length) { alert('No se detectaron movimientos (columnas Fecha/Cuenta/Debe/Haber) en la hoja activa.'); return; }
  snapshot();
  var name = crearHojaDestino('Balance-Auto');
  var origen = activeSheet;
  activeSheet = name;
  var d = sheetData[name], f = sheetFormats[name];
  function set(r, c, v, bold) { d[cellId(r, c)] = v; if (bold) f[cellId(r, c)] = { bold: true }; }
  var cuentas = {}, totalDebe = 0, totalHaber = 0;
  data.rows.forEach(function (row) {
    var key = row.cuenta || '(sin cuenta)';
    if (!cuentas[key]) cuentas[key] = { debe: 0, haber: 0 };
    cuentas[key].debe += row.debe;
    cuentas[key].haber += row.haber;
  });
  set(0, 0, '📊 BALANCE DE COMPROBACIÓN (en vivo) — origen: ' + origen, true);
  ['Cuenta', 'Débitos', 'Créditos', 'Saldo Deudor', 'Saldo Acreedor'].forEach(function (h, i) { set(1, i, h, true); });
  var r = 2;
  Object.keys(cuentas).sort().forEach(function (cuenta) {
    var c = cuentas[cuenta];
    totalDebe += c.debe; totalHaber += c.haber;
    var saldo = c.debe - c.haber;
    set(r, 0, cuenta); set(r, 1, c.debe || ''); set(r, 2, c.haber || '');
    set(r, 3, saldo > 0 ? saldo : ''); set(r, 4, saldo < 0 ? -saldo : '');
    r++;
  });
  var diff = totalDebe - totalHaber;
  set(r, 0, 'TOTALES', true);
  set(r, 1, totalDebe); set(r, 2, totalHaber);
  set(r, 3, Math.abs(diff) < 0.01 ? '✓ Cuadrado' : 'Diferencia: ' + fmtNum(Math.abs(diff)), true);
  f[cellId(r, 1)] = { bold: true }; f[cellId(r, 2)] = { bold: true };
  buildTable(); autoSave();
  document.getElementById('saveStatus').textContent = Math.abs(diff) < 0.01 ? '✓ Balance cuadrado' : '⚠ Diferencia ' + fmtNum(Math.abs(diff));
});

document.getElementById('btnFlujoAuto').addEventListener('click', function () {
  var data = leerHojaParaModulos();
  snapshot();
  var origen = activeSheet;
  var name = crearHojaDestino('Flujo-Efectivo');
  activeSheet = name;
  var d = sheetData[name], f = sheetFormats[name];
  function set(r, c, v, bold) { d[cellId(r, c)] = v; if (bold) f[cellId(r, c)] = { bold: true }; }

  var resultadoNeto = 0, depreciacion = 0, cambioCxC = 0, cambioCxP = 0, cambioInventario = 0;
  data.rows.forEach(function (row) {
    var c = (row.cuenta || '').toLowerCase();
    var neto = row.debe - row.haber;
    if (/venta|ingreso/.test(c)) resultadoNeto -= neto;
    if (/costo|gasto|compra/.test(c)) resultadoNeto += neto;
    if (/deprecia/.test(c)) depreciacion += Math.abs(neto);
    if (/cliente|cuenta.*cobrar/.test(c)) cambioCxC += neto;
    if (/proveedor|cuenta.*pagar/.test(c)) cambioCxP -= neto;
    if (/inventario|mercader/.test(c)) cambioInventario += neto;
  });
  var flujoOperacion = resultadoNeto + depreciacion - cambioCxC + cambioCxP - cambioInventario;

  set(0, 0, '💧 FLUJO DE EFECTIVO (método indirecto, estimado) — origen: ' + origen, true);
  set(1, 0, 'Concepto', true); set(1, 1, 'Monto (₡)', true);
  set(2, 0, 'Resultado neto del período (estimado)'); set(2, 1, resultadoNeto);
  set(3, 0, '(+) Depreciación y amortización'); set(3, 1, depreciacion);
  set(4, 0, '(–) Aumento en cuentas por cobrar'); set(4, 1, -cambioCxC);
  set(5, 0, '(+) Aumento en cuentas por pagar'); set(5, 1, cambioCxP);
  set(6, 0, '(–) Aumento en inventarios'); set(6, 1, -cambioInventario);
  set(7, 0, 'Flujo neto de actividades de operación', true); set(7, 1, flujoOperacion, true);
  set(9, 0, 'Nota: estimado según nombres de cuenta detectados (ventas/costos/depreciación/clientes/proveedores/inventario). Ajustá manualmente si tu plan de cuentas usa otra nomenclatura.');

  set(11, 0, 'ACTIVIDADES DE OPERACIÓN / INVERSIÓN / FINANCIAMIENTO (editable)', true);
  ['Concepto', 'Categoría', 'Monto (₡)'].forEach(function (h, i) { set(12, i, h, true); });
  [['Cobros a clientes', 'operacion', '0'], ['Pagos a proveedores', 'operacion', '0'],
   ['Pagos a empleados', 'operacion', '0'], ['Compra de activos fijos', 'inversion', '0'],
   ['Préstamos recibidos', 'financiamiento', '0'], ['Pago de dividendos', 'financiamiento', '0']]
    .forEach(function (row, i) { row.forEach(function (v, j) { set(13 + i, j, v); }); });

  buildTable(); autoSave();
});

document.getElementById('btnD101').addEventListener('click', function () {
  snapshot();
  var name = crearHojaDestino('D-101');
  activeSheet = name;
  var d = sheetData[name], f = sheetFormats[name];
  function set(r, c, v, bold) { d[cellId(r, c)] = v; if (bold) f[cellId(r, c)] = { bold: true }; }

  set(0, 0, '🇨🇷 DECLARACIÓN D-101 — Impuesto sobre la Renta (período fiscal 2026)', true);
  set(1, 0, 'Tipo de contribuyente (PF / PYME / GENERAL):');
  set(1, 2, 'PF');
  set(3, 0, 'INGRESOS', true);
  set(4, 0, 'Ventas / servicios prestados'); set(4, 1, '0');
  set(6, 0, 'TOTAL INGRESOS', true);
  d[cellId(6, 1)] = '=SUMA(B5:B5)';

  set(8, 0, 'GASTOS DEDUCIBLES', true);
  ['Salarios y cargas sociales', 'Alquiler', 'Servicios públicos'].forEach(function (g, i) { set(9 + i, 0, g); set(9 + i, 1, '0'); });
  set(13, 0, 'TOTAL GASTOS', true);
  d[cellId(13, 1)] = '=SUMA(B10:B12)';

  set(15, 0, 'RENTA NETA', true);
  d[cellId(15, 1)] = '=B7-B14';
  set(16, 0, 'IMPUESTO ESTIMADO', true);
  d[cellId(16, 1)] = '=IMPUESTO.D101(B16;C2)';
  f[cellId(16, 1)] = { bold: true };

  set(18, 0, '⚠️ Montos referenciales para el período fiscal 2026 (Decreto 45333-H). Verificá los tramos exactos vigentes en Hacienda antes de presentar la declaración.');

  buildTable(); autoSave();
});

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
// ACCIONES EN BLOQUE (RANGO / SELECCIÓN MÚLTIPLE)
// ══════════════════════════════════════════════
document.getElementById('raBold').addEventListener('click', function () {
  snapshot();
  var ids = rangeCellIds();
  if (!sheetFormats[activeSheet]) sheetFormats[activeSheet] = {};
  var anyBold = ids.some(function (id) { return sheetFormats[activeSheet][id] && sheetFormats[activeSheet][id].bold; });
  ids.forEach(function (id) {
    if (!sheetFormats[activeSheet][id]) sheetFormats[activeSheet][id] = {};
    sheetFormats[activeSheet][id].bold = !anyBold;
  });
  renderAllCells(); autoSave();
});
document.getElementById('raCurrency').addEventListener('click', function () {
  snapshot();
  var ids = rangeCellIds();
  if (!sheetFormats[activeSheet]) sheetFormats[activeSheet] = {};
  ids.forEach(function (id) {
    if (!sheetFormats[activeSheet][id]) sheetFormats[activeSheet][id] = {};
    sheetFormats[activeSheet][id].currency = true;
    sheetFormats[activeSheet][id].percent = false;
  });
  renderAllCells(); autoSave();
});
document.getElementById('raPercent').addEventListener('click', function () {
  snapshot();
  var ids = rangeCellIds();
  if (!sheetFormats[activeSheet]) sheetFormats[activeSheet] = {};
  ids.forEach(function (id) {
    if (!sheetFormats[activeSheet][id]) sheetFormats[activeSheet][id] = {};
    sheetFormats[activeSheet][id].percent = true;
    sheetFormats[activeSheet][id].currency = false;
  });
  renderAllCells(); autoSave();
});
document.getElementById('raClear').addEventListener('click', function () {
  var ids = rangeCellIds();
  if (!confirm('¿Borrar el contenido de ' + ids.length + ' celdas?')) return;
  snapshot();
  ids.forEach(function (id) {
    delete sheetData[activeSheet][id];
    if (sheetFormats[activeSheet]) delete sheetFormats[activeSheet][id];
    if (sheetNotes[activeSheet]) delete sheetNotes[activeSheet][id];
  });
  renderAllCells(); autoSave();
});
document.getElementById('raCopy').addEventListener('click', function () {
  var ids = rangeCellIds();
  var b = currentRangeBounds();
  var rows = [];
  for (var r = b.minR; r <= b.maxR; r++) {
    var row = [];
    for (var c = b.minC; c <= b.maxC; c++) row.push(getRaw(cellId(r, c)));
    rows.push(row);
  }
  clipboard = { rangeRows: rows, value: getRaw(ids[0]), format: (sheetFormats[activeSheet] && sheetFormats[activeSheet][ids[0]]) || null };
  document.getElementById('saveStatus').textContent = 'Copiado rango (' + ids.length + ')';
});
document.getElementById('raFormat').addEventListener('click', function () {
  openFormatModal(true);
});

// ══════════════════════════════════════════════
// FORMATO NUMÉRICO AVANZADO — MODAL
// ══════════════════════════════════════════════
var formatTargetIsRange = false;
document.getElementById('btnFormat').addEventListener('click', function () { openFormatModal(false); });
function openFormatModal(isRangeTarget) {
  formatTargetIsRange = isRangeTarget;
  var id = document.getElementById('cellRef').textContent;
  var existing = (sheetFormats[activeSheet] && sheetFormats[activeSheet][id] && sheetFormats[activeSheet][id].numFormat) || {};
  document.getElementById('fmtType').value = existing.type || 'general';
  document.getElementById('fmtDecimals').value = existing.decimals !== undefined ? existing.decimals : 2;
  document.getElementById('fmtThousands').value = existing.thousands === false ? 'no' : 'yes';
  document.getElementById('formatOverlay').classList.add('show');
}
document.getElementById('fmtCancel').addEventListener('click', function () { document.getElementById('formatOverlay').classList.remove('show'); });
document.getElementById('fmtApply').addEventListener('click', function () {
  snapshot();
  var numFormat = {
    type: document.getElementById('fmtType').value,
    decimals: parseInt(document.getElementById('fmtDecimals').value) || 0,
    thousands: document.getElementById('fmtThousands').value === 'yes'
  };
  var ids = formatTargetIsRange ? rangeCellIds() : [document.getElementById('cellRef').textContent];
  if (!sheetFormats[activeSheet]) sheetFormats[activeSheet] = {};
  ids.forEach(function (id) {
    if (!sheetFormats[activeSheet][id]) sheetFormats[activeSheet][id] = {};
    sheetFormats[activeSheet][id].numFormat = numFormat;
    sheetFormats[activeSheet][id].currency = false;
    sheetFormats[activeSheet][id].percent = false;
  });
  document.getElementById('formatOverlay').classList.remove('show');
  renderAllCells(); autoSave();
});

// ══════════════════════════════════════════════
// GRÁFICOS
// ══════════════════════════════════════════════
document.getElementById('btnChart').addEventListener('click', function () {
  var qr = document.getElementById('quickRange').value.trim();
  if (isRange(qr)) document.getElementById('chartRange').value = qr;
  document.getElementById('chartOverlay').classList.add('show');
});
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
  wrap.innerHTML = '<div class="chead"><span>📊 ' + title + '</span>' +
    '<button id="dl_' + id + '" title="Descargar PNG">⬇</button>' +
    '<button onclick="this.closest(\\'.chart-float\\').remove()">✕</button></div>' +
    '<canvas id="' + id + '" width="260" height="160"></canvas>';
  document.getElementById('gridWrap').appendChild(wrap);

  var isDrag = false, dx = 0, dy = 0;
  wrap.querySelector('.chead').addEventListener('mousedown', function (e) { isDrag = true; dx = e.clientX - wrap.offsetLeft; dy = e.clientY - wrap.offsetTop; });
  document.addEventListener('mousemove', function (e) { if (isDrag) { wrap.style.left = (e.clientX - dx) + 'px'; wrap.style.top = (e.clientY - dy) + 'px'; } });
  document.addEventListener('mouseup', function () { isDrag = false; });

  setTimeout(function () {
    drawChart(id, type, title, labels, values);
    document.getElementById('dl_' + id).addEventListener('click', function (e) {
      e.stopPropagation();
      var link = document.createElement('a');
      link.download = title.replace(/\\s+/g, '_') + '.png';
      link.href = document.getElementById(id).toDataURL('image/png');
      link.click();
    });
  }, 30);
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
  } else if (type === 'pie' || type === 'donut') {
    var total = values.reduce(function (a, b) { return a + b; }, 0) || 1;
    var start = -Math.PI / 2, cx = W / 2, cy = H / 2, r = Math.min(cW, cH) / 2;
    values.forEach(function (v, i) {
      var slice = (v / total) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, start, start + slice); ctx.closePath();
      ctx.fillStyle = colors[i % colors.length]; ctx.fill();
      start += slice;
    });
    if (type === 'donut') { ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); }
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
// CUENTA (Firebase Auth) + MIS MATRICES (Firestore)
// ══════════════════════════════════════════════
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyBxyfSmdUMUY5d-QHzh2l1qus6GNsr28EI",
  authDomain: "matriz-contable-cr-app.firebaseapp.com",
  databaseURL: "https://matriz-contable-cr-app-default-rtdb.firebaseio.com",
  projectId: "matriz-contable-cr-app",
  storageBucket: "matriz-contable-cr-app.firebasestorage.app",
  messagingSenderId: "687675833771",
  appId: "1:687675833771:web:fe3ff15c4a26ca04c326ee"
};

function setSyncStatus(state, text) {
  var dot = document.getElementById('syncStatusDot');
  dot.className = state;
  document.getElementById('syncStatusText').textContent = text;
}

function initFirebaseOnce() {
  if (!firebaseApp) {
    firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    firestoreDB = firebase.firestore();
    firebase.auth().onAuthStateChanged(function (user) {
      currentUser = user;
      if (user) {
        setSyncStatus('online', user.email);
      } else {
        setSyncStatus('', 'Sin cuenta');
        currentMatrizId = null; currentMatrizName = null;
      }
    });
  }
}
initFirebaseOnce();

document.getElementById('btnAccount').addEventListener('click', function () {
  document.getElementById('authError').textContent = '';
  if (currentUser) {
    document.getElementById('authLoggedOutView').style.display = 'none';
    document.getElementById('authLoggedInView').style.display = 'block';
    document.getElementById('authCurrentEmail').textContent = currentUser.email;
  } else {
    document.getElementById('authLoggedOutView').style.display = 'block';
    document.getElementById('authLoggedInView').style.display = 'none';
  }
  document.getElementById('authOverlay').classList.add('show');
});
document.getElementById('authCancel').addEventListener('click', function () { document.getElementById('authOverlay').classList.remove('show'); });
document.getElementById('authCancel2').addEventListener('click', function () { document.getElementById('authOverlay').classList.remove('show'); });

document.getElementById('authSignupBtn').addEventListener('click', function () {
  var email = document.getElementById('authEmail').value.trim().toLowerCase();
  var pass = document.getElementById('authPassword').value;
  if (!email || pass.length < 6) { document.getElementById('authError').textContent = 'Email inválido o contraseña muy corta (mínimo 6).'; return; }
  firebase.auth().createUserWithEmailAndPassword(email, pass).then(function (cred) {
    return firestoreDB.collection('userDirectory').doc(email).set({ uid: cred.user.uid, email: email });
  }).then(function () {
    document.getElementById('authOverlay').classList.remove('show');
  }).catch(function (err) {
    document.getElementById('authError').textContent = err.message;
  });
});
document.getElementById('authLoginBtn').addEventListener('click', function () {
  var email = document.getElementById('authEmail').value.trim().toLowerCase();
  var pass = document.getElementById('authPassword').value;
  firebase.auth().signInWithEmailAndPassword(email, pass).then(function () {
    document.getElementById('authOverlay').classList.remove('show');
  }).catch(function (err) {
    document.getElementById('authError').textContent = err.message;
  });
});
document.getElementById('authForgotLink').addEventListener('click', function (e) {
  e.preventDefault();
  var email = document.getElementById('authEmail').value.trim().toLowerCase();
  var errEl = document.getElementById('authError');
  errEl.style.color = '#dc2626';
  if (!email) { errEl.textContent = 'Escribí tu email arriba primero.'; return; }
  firebase.auth().sendPasswordResetEmail(email).then(function () {
    errEl.style.color = '#2d7a0c';
    errEl.textContent = '✓ Te mandamos un correo a ' + email + ' con instrucciones para restablecer tu contraseña.';
  }).catch(function (err) {
    errEl.textContent = err.message;
  });
});
document.getElementById('authLogoutBtn').addEventListener('click', function () {
  firebase.auth().signOut().then(function () { document.getElementById('authOverlay').classList.remove('show'); });
});

function estadoActualComoObjeto() {
  return { sheets: sheets, sheetData: sheetData, sheetFormats: sheetFormats, sheetNotes: sheetNotes, colWidths: colWidths };
}
function cargarEstadoDesdeObjeto(obj) {
  applyingRemote = true;
  sheets = obj.sheets || ['Hoja1'];
  sheetData = obj.sheetData || {};
  sheetFormats = obj.sheetFormats || {};
  sheetNotes = obj.sheetNotes || {};
  colWidths = obj.colWidths || {};
  activeSheet = sheets[0];
  buildTable();
  applyingRemote = false;
}

document.getElementById('btnMisMatrices').addEventListener('click', function () {
  if (!currentUser) { alert('Iniciá sesión primero con el botón 👤 Cuenta.'); return; }
  cargarListaMatrices();
  document.getElementById('matricesOverlay').classList.add('show');
});
document.getElementById('matricesClose').addEventListener('click', function () { document.getElementById('matricesOverlay').classList.remove('show'); });

function cargarListaMatrices() {
  var wrap = document.getElementById('matricesList');
  wrap.innerHTML = '<div id="feHistEmpty">Cargando...</div>';
  var propias = firestoreDB.collection('matrices').where('ownerId', '==', currentUser.uid).get();
  var compartidas = firestoreDB.collection('matrices').where('sharedWith', 'array-contains', currentUser.email).get();
  Promise.all([propias, compartidas]).then(function (results) {
    var vistos = {}; var items = [];
    results.forEach(function (snap, idx) {
      snap.forEach(function (doc) {
        if (vistos[doc.id]) return;
        vistos[doc.id] = true;
        var data = doc.data();
        items.push({ id: doc.id, name: data.name || '(sin nombre)', mine: idx === 0, updatedAt: data.updatedAt || 0 });
      });
    });
    items.sort(function (a, b) { return b.updatedAt - a.updatedAt; });
    renderListaMatrices(items);
  }).catch(function (err) {
    wrap.innerHTML = '<div id="feHistEmpty">Error cargando matrices: ' + err.message + '</div>';
  });
}
function renderListaMatrices(items) {
  var wrap = document.getElementById('matricesList');
  if (!items.length) { wrap.innerHTML = '<div id="feHistEmpty">Todavía no tenés matrices en la nube. Creá una arriba.</div>'; return; }
  var html = '';
  items.forEach(function (it, i) {
    html += '<div class="feHistItem"><div class="fhInfo"><div class="fhNum">' + it.name + (it.mine ? '' : ' <span style="color:#999;">(compartida)</span>') + '</div></div>' +
      '<div style="display:flex;gap:4px;">' +
      '<button data-act="open" data-idx="' + i + '">Abrir</button>' +
      (it.mine ? '<button data-act="share" data-idx="' + i + '" style="background:#245f09;">🔗</button><button data-act="del" data-idx="' + i + '" style="background:#dc2626;">🗑</button>' : '') +
      '</div></div>';
  });
  wrap.innerHTML = html;
  wrap.querySelectorAll('button[data-act]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var it = items[parseInt(btn.dataset.idx)];
      if (btn.dataset.act === 'open') abrirMatriz(it.id, it.name);
      else if (btn.dataset.act === 'share') abrirCompartir(it.id);
      else if (btn.dataset.act === 'del') eliminarMatriz(it.id);
    });
  });
}
document.getElementById('crearMatrizBtn').addEventListener('click', function () {
  var nombre = document.getElementById('nuevaMatrizNombre').value.trim();
  if (!nombre) { alert('Ponele un nombre a la matriz.'); return; }
  var payload = estadoActualComoObjeto();
  payload.name = nombre; payload.ownerId = currentUser.uid; payload.ownerEmail = currentUser.email;
  payload.sharedWith = []; payload.updatedAt = Date.now();
  firestoreDB.collection('matrices').add(payload).then(function (doc) {
    currentMatrizId = doc.id; currentMatrizName = nombre;
    document.getElementById('nuevaMatrizNombre').value = '';
    document.getElementById('matricesOverlay').classList.remove('show');
    setSyncStatus('online', currentUser.email + ' · ' + nombre);
  });
});
function abrirMatriz(id, name) {
  firestoreDB.collection('matrices').doc(id).get().then(function (doc) {
    if (!doc.exists) { alert('Esa matriz ya no existe.'); return; }
    snapshot();
    cargarEstadoDesdeObjeto(doc.data());
    currentMatrizId = id; currentMatrizName = name;
    document.getElementById('matricesOverlay').classList.remove('show');
    setSyncStatus('online', currentUser.email + ' · ' + name);
  });
}
function eliminarMatriz(id) {
  if (!confirm('¿Eliminar esta matriz de la nube? Esta acción no se puede deshacer.')) return;
  firestoreDB.collection('matrices').doc(id).delete().then(cargarListaMatrices);
}
var shareTargetId = null;
function abrirCompartir(id) {
  shareTargetId = id;
  document.getElementById('shareEmailInput').value = '';
  document.getElementById('shareStatus').textContent = '';
  document.getElementById('shareOverlay').classList.add('show');
}
document.getElementById('shareCancel').addEventListener('click', function () { document.getElementById('shareOverlay').classList.remove('show'); });
document.getElementById('shareConfirmBtn').addEventListener('click', function () {
  var email = document.getElementById('shareEmailInput').value.trim().toLowerCase();
  if (!email) return;
  document.getElementById('shareStatus').textContent = 'Buscando...';
  firestoreDB.collection('userDirectory').doc(email).get().then(function (doc) {
    if (!doc.exists) {
      document.getElementById('shareStatus').textContent = 'Esa persona todavía no tiene cuenta en la app.';
      return;
    }
    return firestoreDB.collection('matrices').doc(shareTargetId).update({
      sharedWith: firebase.firestore.FieldValue.arrayUnion(email)
    }).then(function () {
      document.getElementById('shareStatus').textContent = '✓ Compartido con ' + email;
    });
  }).catch(function (err) {
    document.getElementById('shareStatus').textContent = 'Error: ' + err.message;
  });
});

function guardarMatrizEnNube() {
  if (!currentUser || !currentMatrizId || applyingRemote) return;
  var payload = estadoActualComoObjeto();
  payload.updatedAt = Date.now();
  setSyncStatus('syncing', 'Guardando...');
  firestoreDB.collection('matrices').doc(currentMatrizId).update(payload).then(function () {
    setSyncStatus('online', currentUser.email + ' · ' + currentMatrizName);
  }).catch(function (err) {
    setSyncStatus('error', 'Error al guardar');
  });
}

// ══════════════════════════════════════════════
// PERSISTENCIA
// ══════════════════════════════════════════════
function autoSave() {
  try {
    localStorage.setItem('mcr_sheets_v6', JSON.stringify(sheets));
    localStorage.setItem('mcr_data_v6', JSON.stringify(sheetData));
    localStorage.setItem('mcr_formats_v6', JSON.stringify(sheetFormats));
    localStorage.setItem('mcr_notes_v6', JSON.stringify(sheetNotes));
    localStorage.setItem('mcr_colwidths_v6', JSON.stringify(colWidths));
    localStorage.setItem('mcr_active_v6', activeSheet);
    if (!currentMatrizId) document.getElementById('saveStatus').textContent = '💾 ' + new Date().toLocaleTimeString('es-CR');
    if (currentMatrizId && currentUser) {
      clearTimeout(saveDebounceTimer);
      saveDebounceTimer = setTimeout(guardarMatrizEnNube, 1500);
    }
  } catch (e) {}
}
function restore() {
  try {
    var s = localStorage.getItem('mcr_sheets_v6');
    var d = localStorage.getItem('mcr_data_v6');
    var f = localStorage.getItem('mcr_formats_v6');
    var no = localStorage.getItem('mcr_notes_v6');
    var cw = localStorage.getItem('mcr_colwidths_v6');
    var a = localStorage.getItem('mcr_active_v6');
    if (s) sheets = JSON.parse(s);
    if (d) sheetData = JSON.parse(d);
    if (f) sheetFormats = JSON.parse(f);
    if (no) sheetNotes = JSON.parse(no);
    if (cw) colWidths = JSON.parse(cw);
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
