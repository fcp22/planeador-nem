// ============================================================
// LIBRETA DE TRABAJOS
// El maestro anota qué trabajos entregó cada alumno (✓). La app calcula sola la calificación del
// criterio (p. ej. «Tareas»): entregados ÷ trabajos revisados × 10, y la junta con lo demás en Calificaciones.
// Datos: g.libreta[trimestre] = { crit: id del criterio, n: casillas visibles, marks: { alumnoId: { índice: 1 } } }
// ============================================================

function gLibCritDefecto(g) {
  const man = g.criterios.filter(c => !c.auto), nz = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return (man.find(c => /tarea|trabajo|libreta|cuaderno/.test(nz(c.nombre))) || man[0] || {}).id || '';
}
// Configuración del trimestre (se crea al usarla por primera vez)
function gLibreta(g, t) {
  if (!g.libreta) g.libreta = {};
  let L = g.libreta[t];
  if (!L) L = g.libreta[t] = { crit: '', n: 10, marks: {} };
  if (!L.marks) L.marks = {};
  if (!(L.n >= 1)) L.n = 10;
  if (!g.criterios.some(c => c.id === L.crit && !c.auto)) L.crit = gLibCritDefecto(g);   // el criterio ya no existe: se elige otro
  return L;
}
// ¿Tiene la libreta de este trimestre algún trabajo anotado? (sin crearla)
function gLibUsada(g, t) { const L = g.libreta && g.libreta[t]; return !!(L && L.crit && gLibRevisados(g, L) > 0); }
// Trabajos «revisados»: los que tienen al menos una entrega de algún alumno del grupo
function gLibRevisados(g, L) {
  let n = 0;
  for (let j = 0; j < L.n; j++) if (g.alumnos.some(a => L.marks[a.id] && L.marks[a.id][j])) n++;
  return n;
}
function gLibEntregados(L, aid) { const m = L.marks[aid]; if (!m) return 0; let n = 0; for (let j = 0; j < L.n; j++) if (m[j]) n++; return n; }
// Calificación (0–10) que la libreta aporta a un criterio, o null si no aplica (la usa gCalcAlumno)
function gLibretaScore(g, aid, t, cid) {
  const L = g.libreta && g.libreta[t];
  if (!L || !L.crit || L.crit !== cid) return null;
  const rev = gLibRevisados(g, L);
  return rev ? gLibEntregados(L, aid) / rev * 10 : null;
}

// ── Pantalla ──────────────────────────────────────────────
function gTrimLib(v) { G.trimLib = +v; gRenderTrabajos(); }
function gLibCrit(v) { const g = gGrupo(), L = gLibreta(g, G.trimLib); L.crit = v; gGuardar(); gRenderTrabajos(); }
function gLibN(d) {
  const g = gGrupo(), L = gLibreta(g, G.trimLib), nuevo = Math.max(1, Math.min(40, L.n + d));
  if (nuevo === L.n) return;
  if (d < 0) {   // quitar la última casilla: avisar si tenía entregas anotadas
    const j = L.n - 1; if (g.alumnos.some(a => L.marks[a.id] && L.marks[a.id][j]) && !confirm(`El trabajo ${L.n} ya tiene entregas anotadas. ¿Quitarlo y borrar esas entregas?`)) return;
    g.alumnos.forEach(a => { if (L.marks[a.id]) delete L.marks[a.id][j]; });
  }
  L.n = nuevo; gGuardar(); gRenderTrabajos();
}
function gLibMarca(aid, j) {
  const g = gGrupo(), L = gLibreta(g, G.trimLib);
  if (!L.marks[aid]) L.marks[aid] = {};
  if (L.marks[aid][j]) delete L.marks[aid][j]; else L.marks[aid][j] = 1;
  gGuardar(); gLibRefrescar();
}
function gLibTodos(j) {
  const g = gGrupo(), L = gLibreta(g, G.trimLib), todos = g.alumnos.every(a => L.marks[a.id] && L.marks[a.id][j]);
  g.alumnos.forEach(a => { if (!L.marks[a.id]) L.marks[a.id] = {}; if (todos) delete L.marks[a.id][j]; else L.marks[a.id][j] = 1; });
  gGuardar(); gLibRefrescar();
}
function gLibRefrescar() {
  const g = gGrupo(), t = G.trimLib, e = document.getElementById('lb-cuerpo'); if (!e) return;
  const w = e.querySelector('.g-tabla-w'), sl = w ? w.scrollLeft : 0;
  e.innerHTML = gLibCuerpoHTML(g, t);
  const w2 = e.querySelector('.g-tabla-w'); if (w2) w2.scrollLeft = sl;
}
function gLibCuerpoHTML(g, t) {
  const L = gLibreta(g, t), rev = gLibRevisados(g, L), crit = g.criterios.find(c => c.id === L.crit), pct = crit ? gPct(g, crit.id, t) : 0;
  if (!g.alumnos.length) return '<div class="g-vacio">Agrega alumnos en «Mis grupos» para llevar su libreta.</div>';
  let h = `<div class="lb-resumen"><b>${rev}</b> trabajo${rev === 1 ? '' : 's'} revisado${rev === 1 ? '' : 's'} de ${L.n} casillas${rev ? ` · cada alumno se califica sobre <b>${rev}</b>` : ' · marca ✓ en los trabajos que cada alumno entregó'}</div>`;
  h += `<div class="g-tabla-w"><table class="g-tabla g-cap lb-t"><thead><tr><th>#</th><th class="g-sticky">Alumno</th>` +
    Array.from({ length: L.n }, (_, j) => { const c = g.alumnos.filter(a => L.marks[a.id] && L.marks[a.id][j]).length; return `<th class="lb-th"><div class="lb-nj">${j + 1}</div><button class="lb-todos" title="Marcar o quitar a todo el grupo" onclick="gLibTodos(${j})">✓ todos</button><small>${c}/${g.alumnos.length}</small></th>`; }).join('') +
    `<th class="lb-th">Entregó</th><th class="lb-th">Calif.</th></tr></thead><tbody>` +
    g.alumnos.map((a, i) => {
      const e = gLibEntregados(L, a.id), sc = rev ? e / rev * 10 : null;
      return `<tr><td>${i + 1}</td><td class="g-sticky">${gEsc(a.nombre)}</td>` +
        Array.from({ length: L.n }, (_, j) => { const on = !!(L.marks[a.id] && L.marks[a.id][j]); return `<td class="lb-td"><button class="lb-c${on ? ' on' : ''}" aria-label="Trabajo ${j + 1}" aria-pressed="${on}" onclick="gLibMarca('${a.id}',${j})">${on ? '✓' : ''}</button></td>`; }).join('') +
        `<td class="lb-td"><b>${e}</b>${rev ? ' / ' + rev : ''}</td><td class="lb-td ${sc != null && sc < 6 ? 'g-mal' : ''}"><b>${sc == null ? '—' : gFmt(sc, 1)}</b></td></tr>`;
    }).join('') + '</tbody></table></div>';
  return h;
}
function gRenderTrabajos() {
  const g = gGrupo();
  if (!g) return gSinGrupo('Libreta de trabajos', 'Anota los trabajos que entrega cada alumno');
  if (!G.trimLib) G.trimLib = gTrimDeFecha(gHoy());
  const t = G.trimLib, L = gLibreta(g, t), crit = g.criterios.find(c => c.id === L.crit), pct = crit ? gPct(g, crit.id, t) : 0;
  const man = g.criterios.filter(c => !c.auto);
  let h = `<div class="sec-title">Libreta de trabajos</div><div class="sec-sub">Anota con ✓ cada trabajo que entrega el alumno. La app calcula sola cuánto vale lo que entregó y lo suma a su calificación.</div>${gGruposPanelHTML(false)}
  <div style="font-size:15px;font-weight:700;color:var(--azul);margin:0 2px 10px">📓 Grupo: ${gEsc(g.nombre)} · ${gEsc(g.materia)}</div>
  <div class="g-trims">${[1, 2, 3].map(x => `<button class="ttab${t === x ? ' on' : ''}" onclick="gTrimLib(${x})">${G_TRIM_NOM[x]}</button>`).join('')}</div>
  <div class="card"><div class="card-title g-titulo-azul">⚙️ Cómo cuenta en la calificación — ${G_TRIM_NOM[t]}</div>`;
  if (!man.length) h += `<p style="color:var(--gris)">Primero agrega un criterio de evaluación (por ejemplo «Tareas») en <a href="#" onclick="gIrA('calif');return false" style="color:var(--azul-med);font-weight:600">Calificaciones</a>.</p></div>`;
  else {
    h += `<div class="f2"><div class="campo"><label>Los trabajos cuentan para el criterio</label><select onchange="gLibCrit(this.value)">${man.map(c => `<option value="${c.id}"${c.id === L.crit ? ' selected' : ''}>${gEsc(c.nombre)} (${gPct(g, c.id, t)} %)</option>`).join('')}</select></div>
      <div class="campo"><label>Casillas de trabajo (las que vas a usar este trimestre)</label><div style="display:flex;align-items:center;gap:10px"><button class="g-btn g-btn-s" style="margin:0" onclick="gLibN(-1)" aria-label="Una casilla menos">−</button><b style="font-size:20px;min-width:30px;text-align:center">${L.n}</b><button class="g-btn g-btn-s" style="margin:0" onclick="gLibN(1)" aria-label="Una casilla más">+</button></div></div></div>
      <div class="g-aviso" style="margin:10px 0 0;font-size:13px">💡 <b>Así se calcula:</b> si ya revisaste 10 trabajos y el alumno entregó 8, saca <b>8 de 10</b> en este criterio. Como «${gEsc(crit ? crit.nombre : '')}» vale <b>${pct} %</b>, le aporta <b>${gFmt(8 * pct / 100, 2)}</b> de los 10 puntos de su calificación. Los trabajos que todavía no revisas no cuentan; los revisados que no entregó cuentan como 0. Si además creas actividades en ese mismo criterio, se promedian con la libreta.</div></div>
    <div class="card"><div class="card-title g-titulo-azul">📓 Trabajos entregados — ${G_TRIM_NOM[t]}</div><div id="lb-cuerpo">${gLibCuerpoHTML(g, t)}</div>
      <div style="margin-top:12px"><button class="g-btn g-btn-s" onclick="gIrA('calif')">📊 Ver calificaciones</button></div></div>
    <div class="card"><div class="card-title g-titulo-azul">🖨️ Hoja para anotar a mano (carta, horizontal)</div>
      <p style="font-size:13px;color:var(--gris);margin:0 0 10px;line-height:1.5">El nombre de cada alumno y <b>${L.n} columnas</b> de trabajo para ir anotando en papel, con las columnas «Total» y «Calif.». Cambia el número de columnas arriba, en «Casillas de trabajo».</p>
      <div class="campo" style="max-width:340px"><label>Contenido</label><select id="lb-modo"><option value="blanco">En blanco, para anotar a mano</option><option value="registrada">Con lo que ya registré (✓)</option></select></div>
      <button class="g-btn" id="lb-pdf" onclick="gLibExportar('pdf')">⬇ Descargar PDF</button>
      <button class="g-btn g-btn-s" id="lb-xls" onclick="gLibExportar('xlsx')">⬇ Descargar Excel</button>
      <div id="lb-msg" style="display:none;font-size:12.5px;margin-top:8px"></div>
      <div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">Hoja tamaño carta horizontal. Si la lista es larga, continúa en la siguiente hoja con los encabezados repetidos. En el Excel puedes escribir ✓ en cada trabajo y el total y la calificación se calculan solos.</div></div>`;
  }
  gPanel().innerHTML = h;
}

// ── Hoja imprimible (carta horizontal): nombre + columnas de trabajo ──
function gLibMsg(t, ok) { const e = document.getElementById('lb-msg'); if (!e) return; e.textContent = t; e.style.color = ok ? 'var(--verde)' : 'var(--rojo)'; e.style.display = t ? 'block' : 'none'; }
function gLibDatosHoja() {
  const g = gGrupo(), t = G.trimLib, L = gLibreta(g, t), modo = (document.getElementById('lb-modo') || {}).value || 'blanco', p = gPerfil();
  const rev = gLibRevisados(g, L);
  const filas = g.alumnos.map((a, i) => ({ n: i + 1, nombre: a.nombre, marcas: Array.from({ length: L.n }, (_, j) => modo === 'registrada' && L.marks[a.id] && L.marks[a.id][j] ? 1 : 0), ent: gLibEntregados(L, a.id) }));
  return {
    g, t, L, modo, rev, filas, p,
    escuela: gEscuela() || 'Escuela Secundaria',
    titulo: 'LIBRETA DE TRABAJOS — ' + G_TRIM_NOM[t].toUpperCase(),
    info: `Docente: ${gDocente()}     Grupo: ${g.nombre}     Materia: ${g.materia}     Grado: ${g.grado}°` + (p.cct ? `     CCT: ${p.cct}` : ''),
  };
}
function gLibArchivo(H, ext) {
  const lim = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '');
  return ['Libreta_trabajos', lim(H.g.nombre), lim(H.g.materia), 'T' + H.t, H.modo === 'blanco' ? 'en_blanco' : 'con_registro'].filter(Boolean).join('_') + '.' + ext;
}
async function gLibExportar(formato) {
  const g = gGrupo(); if (!g || !g.alumnos.length) return gLibMsg('Este grupo no tiene alumnos todavía.', false);
  const btns = ['lb-pdf', 'lb-xls'].map(id => document.getElementById(id));
  btns.forEach(b => b && (b.disabled = true)); gLibMsg('Preparando tu archivo…', true);
  try {
    const H = gLibDatosHoja();
    if (formato === 'pdf') await gLibPDF(H); else await gLibExcel(H);
    gLibMsg('Listo, tu archivo se descargó.', true);
  } catch (e) { gLibMsg(e.message || 'No se pudo crear el archivo.', false); }
  btns.forEach(b => b && (b.disabled = false));
}
async function gLibPDF(H) {
  await gCargarLib('jspdf', 'autotable');
  const { jsPDF } = window.jspdf, doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
  const W = doc.internal.pageSize.getWidth(), Hh = doc.internal.pageSize.getHeight(), mL = 10, mR = 10, n = H.L.n;
  const lim = x => String(x == null ? '' : x).replace(/[—–]/g, '-').replace(/…/g, '...');
  const wNum = 8, wNom = 66, wTot = 13, wT = Math.max(5, Math.min(11, (W - mL - mR - wNum - wNom - wTot * 2) / n));
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text(lim(H.escuela), W / 2, 13, { align: 'center' });
  doc.setFontSize(11); doc.text(lim(H.titulo), W / 2, 19.5, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(lim(H.info), W / 2, 25, { align: 'center' });
  const cs = { 0: { cellWidth: wNum, halign: 'center' }, 1: { cellWidth: wNom, halign: 'left', overflow: 'linebreak' } };
  for (let j = 0; j < n; j++) cs[2 + j] = { cellWidth: wT, halign: 'center' };
  cs[2 + n] = { cellWidth: wTot, halign: 'center' }; cs[3 + n] = { cellWidth: wTot, halign: 'center' };
  doc.autoTable({
    startY: 29, margin: { left: mL, right: mR, bottom: 14 },
    head: [['No.', 'Nombre del alumno', ...Array.from({ length: n }, (_, j) => String(j + 1)), 'Total', 'Calif.']],
    body: H.filas.map(f => [f.n, lim(f.nombre), ...f.marcas.map(m => (m ? '✓' : '')), H.modo === 'registrada' ? f.ent : '', H.modo === 'registrada' && H.rev ? (Math.round(f.ent / H.rev * 100) / 10).toFixed(1) : '']),
    columnStyles: cs,
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 1.4, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: 0, minCellHeight: 7, valign: 'middle' },
    headStyles: { fillColor: [189, 215, 238], textColor: [26, 58, 92], fontStyle: 'bold', halign: 'center', fontSize: 8.5 },
    didParseCell: d => { if (d.section === 'body' && d.cell.raw === '✓') { d.cell.text = ['']; } },
    didDrawCell: d => {   // ✓ dibujada con líneas (la fuente estándar no la trae)
      if (d.section === 'body' && d.cell.raw === '✓') {
        const { x, y, width: w, height: h } = d.cell; doc.setDrawColor(21, 128, 61); doc.setLineWidth(0.7);
        doc.line(x + w * 0.3, y + h * 0.55, x + w * 0.45, y + h * 0.75); doc.line(x + w * 0.45, y + h * 0.75, x + w * 0.72, y + h * 0.28);
        doc.setDrawColor(0); doc.setLineWidth(0.2);
      }
    },
  });
  const pn = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pn; i++) { doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(90); doc.text('Anota ✓ en cada trabajo entregado'.replace('✓', 'una marca'), mL, Hh - 7); doc.text('Hoja ' + i + ' de ' + pn, W - mR, Hh - 7, { align: 'right' }); doc.setTextColor(0); }
  gDescargarBlob(doc.output('blob'), gLibArchivo(H, 'pdf'));
}
async function gLibExcel(H) {
  await gCargarLib('exceljs');
  const n = H.L.n, nCol = 2 + n + 2, wb = new ExcelJS.Workbook(); wb.creator = 'Planeador Docente NEM';
  const ws = wb.addWorksheet('Libreta', { pageSetup: { paperSize: 1, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } } });
  ws.getColumn(1).width = 5; ws.getColumn(2).width = 40;
  for (let j = 0; j < n; j++) ws.getColumn(3 + j).width = 5.2;
  ws.getColumn(3 + n).width = 8; ws.getColumn(4 + n).width = 8;
  const centro = { horizontal: 'center', vertical: 'middle', wrapText: true }, borde = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  const L = i => { let s = '', k = i; while (k > 0) { const m = (k - 1) % 26; s = String.fromCharCode(65 + m) + s; k = Math.floor((k - 1) / 26); } return s; };
  const fila = (r, texto, tam, neg) => { ws.mergeCells(r, 1, r, nCol); const c = ws.getCell(r, 1); c.value = texto; c.font = { bold: !!neg, size: tam }; c.alignment = { horizontal: 'center', vertical: 'middle' }; ws.getRow(r).height = tam + 9; };
  fila(1, H.escuela, 13, true); fila(2, H.titulo, 11, true); fila(3, H.info, 9.5, false);
  const rH = 5, hr = ws.getRow(rH); hr.height = 24;
  ['No.', 'Nombre del alumno', ...Array.from({ length: n }, (_, j) => j + 1), 'Total', 'Calif.'].forEach((t, i) => { const c = hr.getCell(i + 1); c.value = t; c.font = { bold: true, size: 9.5, color: { argb: 'FF1A3A5C' } }; c.alignment = centro; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } }; c.border = borde; });
  const r1 = rH + 1, rN = rH + H.filas.length, rC = rN + 1, rR = rN + 2;   // fila de conteos por trabajo y celda «revisados»
  const a = L(3), b = L(2 + n);
  H.filas.forEach((f, i) => {
    const r = r1 + i, row = ws.getRow(r); row.height = 20;
    row.getCell(1).value = f.n; row.getCell(2).value = f.nombre;
    f.marcas.forEach((m, j) => { row.getCell(3 + j).value = m ? '✓' : null; });
    row.getCell(3 + n).value = { formula: `COUNTA(${a}${r}:${b}${r})`, result: H.modo === 'registrada' ? f.ent : 0 };
    row.getCell(4 + n).value = { formula: `IF($C$${rR}=0,"",ROUND(${L(3 + n)}${r}/$C$${rR}*10,1))`, result: H.modo === 'registrada' && H.rev ? Math.round(f.ent / H.rev * 100) / 10 : '' };
    for (let k = 1; k <= nCol; k++) { const c = row.getCell(k); c.border = borde; c.font = { size: 10 }; c.alignment = k === 2 ? { vertical: 'middle', wrapText: true } : centro; }
    for (let j = 0; j < n; j++) { const c = row.getCell(3 + j); if (f.marcas[j]) c.font = { bold: true, size: 13, color: { argb: 'FF15803D' } }; }
  });
  // conteos por trabajo y «trabajos revisados» (los que tienen al menos una entrega)
  const rc = ws.getRow(rC); rc.getCell(2).value = 'Entregas por trabajo'; rc.getCell(2).font = { italic: true, size: 9, color: { argb: 'FF64748B' } }; rc.getCell(2).alignment = { horizontal: 'right' };
  for (let j = 0; j < n; j++) { const c = rc.getCell(3 + j); c.value = { formula: `COUNTA(${L(3 + j)}${r1}:${L(3 + j)}${rN})`, result: 0 }; c.font = { size: 9, color: { argb: 'FF64748B' } }; c.alignment = centro; }
  const rr = ws.getRow(rR); rr.getCell(2).value = 'Trabajos revisados (con al menos una entrega)'; rr.getCell(2).font = { italic: true, size: 9, color: { argb: 'FF64748B' } }; rr.getCell(2).alignment = { horizontal: 'right' };
  rr.getCell(3).value = { formula: `COUNTIF(${a}${rC}:${b}${rC},">0")`, result: H.modo === 'registrada' ? H.rev : 0 }; rr.getCell(3).font = { bold: true, size: 10 }; rr.getCell(3).alignment = centro;
  ws.addConditionalFormatting({ ref: `${a}${r1}:${b}${rN}`, rules: [{ type: 'cellIs', operator: 'equal', formulae: ['"✓"'], style: { font: { bold: true, color: { argb: 'FF15803D' } } } }] });
  ws.pageSetup.printTitlesRow = rH + ':' + rH;
  ws.views = [{ state: 'frozen', xSplit: 2, ySplit: rH }];
  const buf = await wb.xlsx.writeBuffer();
  gDescargarBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), gLibArchivo(H, 'xlsx'));
}
