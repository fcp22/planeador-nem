// ============================================================
// ESCÁNER DE EXÁMENES
// El maestro fotografía el examen resuelto de cada alumno. El servidor (IA) solo LEE lo que el
// alumno marcó/escribió; la calificación se calcula aquí, con la clave que nunca sale del dispositivo.
// El maestro revisa y corrige antes de guardar. Las fotos no se guardan: solo la calificación.
// ============================================================

G.esc = { exId: null, hojas: [], restantes: null, activo: 0 };

function escExamenes(g) { return g.actividades.filter(a => a.tipo === 'examen' && Array.isArray(a.reactivos) && a.reactivos.length); }
function escExamen() { const g = gGrupo(); return g ? escExamenes(g).find(a => a.id === G.esc.exId) || null : null; }

function gRenderEscaner() {
  if (!G.data) gCargar();
  const g = gGrupo();
  if (!g) return gSinGrupo('Escanear examen', 'Califica fotografiando el examen resuelto de cada alumno');
  const exs = escExamenes(g);
  if (!exs.find(x => x.id === G.esc.exId)) { G.esc.exId = exs.length ? exs[exs.length - 1].id : null; G.esc.hojas = []; }
  const ex = escExamen();
  let h = gBarra() + `<div class="sec-title">Escanear examen</div><div class="sec-sub">Fotografía el examen resuelto de cada alumno y la app lee las respuestas, las compara con tu clave y calcula la calificación. Tú revisas antes de guardar.</div>`;
  if (!ex) {
    return void (gPanel().innerHTML = h + `<div class="card g-vacio"><div style="font-size:44px;margin-bottom:8px">🧮</div><div>Para escanear necesitas un examen con su clave de respuestas. Créalo con IA en «Exámenes» (el escáner lee los exámenes que genera la app).</div><button class="g-btn" style="margin-top:14px" onclick="gIrA('examenes')">Ir a «Exámenes»</button></div>`);
  }
  const objetivos = ex.reactivos.filter(r => r.tipo !== 'desarrollo').length;
  h += `<div class="card"><div class="card-title">1. Elige el examen</div>
    <select onchange="escElegir(this.value)" style="width:100%;padding:10px;border:1.5px solid var(--borde);border-radius:8px">${exs.map(e => `<option value="${e.id}"${e.id === ex.id ? ' selected' : ''}>${gEsc(e.nombre)} (${e.reactivos.length} reactivos · ${e.max} pts)</option>`).join('')}</select>
    ${objetivos < ex.reactivos.length ? `<div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-top:6px">Los reactivos de <b>desarrollo</b> no se leen con la cámara: tú les pones los puntos al revisar.</div>` : ''}</div>
  <div class="card"><div class="card-title">2. Toma las fotos</div>
    <ul style="margin:0 0 10px 18px;padding:0;font-size:13px;color:var(--gris);line-height:1.5"><li>Una hoja por foto, completa y derecha, con buena luz y sin sombras.</li><li>Asegúrate de que se vea el <b>nombre del alumno</b>.</li><li>Puedes elegir varias fotos a la vez de la galería.</li></ul>
    <label class="g-btn" style="cursor:pointer">📷 Tomar foto<input type="file" accept="image/*" capture="environment" style="display:none" onchange="escSubir(this)"></label>
    <label class="g-btn g-btn-s" style="cursor:pointer">🖼️ Elegir fotos (varias)<input type="file" accept="image/*" multiple style="display:none" onchange="escSubir(this)"></label>
    <div style="font-size:12px;color:var(--gris);margin-top:8px">${G.esc.restantes != null ? `Fotos disponibles este mes: <b>${G.esc.restantes}</b>. ` : ''}Las fotos no se guardan: solo la calificación que tú confirmes.</div></div>`;
  if (G.esc.hojas.length) {
    const pend = G.esc.hojas.filter(x => x.estado === 'listo' && !x.guardada && x.aid).length;
    h += `<div class="card"><div class="card-title">3. Revisa y guarda <span style="margin-left:auto;font-size:12px;font-weight:400;color:var(--gris)">${G.esc.hojas.length} foto(s)</span></div>
      <div class="g-aviso" style="font-size:12.5px;margin-bottom:12px">⚠️ La lectura puede equivocarse, sobre todo con letra difícil. Revisa lo marcado en ámbar y corrige con ✓ / ✗. Si sales de esta pantalla antes de guardar, se pierden las lecturas.</div>
      <div style="margin-bottom:10px"><button class="g-btn" onclick="escGuardarTodas()"${pend ? '' : ' disabled'}>💾 Guardar todas las revisadas (${pend})</button> <button class="g-btn g-btn-s" onclick="escLimpiar()">Quitar las ya guardadas</button></div>
      <div id="esc-hojas">${G.esc.hojas.map(escHojaHTML).join('')}</div></div>`;
  }
  gPanel().innerHTML = h;
}
function escElegir(id) { G.esc.exId = id; G.esc.hojas = []; gRenderEscaner(); }
function escLimpiar() { G.esc.hojas = G.esc.hojas.filter(h => !h.guardada); gRenderEscaner(); }

// ── Fotos: se reducen a 1600 px (JPEG) antes de enviarlas ──
function escReducir(file) {
  return new Promise((ok, mal) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const M = 1600, k = Math.min(1, M / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      const t = document.createElement('canvas'), kt = Math.min(1, 700 / Math.max(img.width, img.height)); t.width = Math.round(img.width * kt); t.height = Math.round(img.height * kt);
      t.getContext('2d').drawImage(img, 0, 0, t.width, t.height);
      URL.revokeObjectURL(url);
      ok({ data: c.toDataURL('image/jpeg', 0.82).split(',')[1], thumb: t.toDataURL('image/jpeg', 0.7) });
    };
    img.onerror = () => { URL.revokeObjectURL(url); mal(new Error('No se pudo abrir la imagen. Usa una foto JPG o PNG.')); };
    img.src = url;
  });
}
async function escSubir(inp) {
  const fs = [...inp.files]; inp.value = ''; if (!fs.length) return;
  const ex = escExamen(); if (!ex) return;
  const nuevas = fs.map(f => ({ id: gId(), file: f, estado: 'leyendo', msg: '', thumb: '', nombreLeido: '', aid: '', resp: {}, ok: {}, pts: {}, guardada: false, exId: ex.id }));
  G.esc.hojas.push(...nuevas); gRenderEscaner();
  // dos a la vez para ir rápido sin saturar el servidor
  const cola = nuevas.slice();
  const worker = async () => { while (cola.length) { const h = cola.shift(); await escLeer(h, ex); } };
  await Promise.all([worker(), worker()]);
}
async function escLeer(h, ex) {
  try {
    const im = await escReducir(h.file); h.thumb = im.thumb; delete h.file;
    const body = { imagen: { mime: 'image/jpeg', data: im.data }, reactivos: ex.reactivos.map((r, i) => ({ n: i + 1, tipo: r.tipo })) };
    let data, ultimo;
    for (let i = 0; i < 2; i++) { try { data = await workerFetch('/v1/escanear', { metodo: 'POST', body }); break; } catch (e) { ultimo = e; if (e.reintentar && i < 1) { await esperar(3000); continue; } throw e; } }
    if (data.escaneos) G.esc.restantes = data.escaneos.restantes;
    const rs = (data.resultado && data.resultado.respuestas) || [];
    ex.reactivos.forEach((r, i) => { const x = rs.find(y => y.n === i + 1); h.resp[i + 1] = { r: x && x.r != null ? String(x.r) : '', duda: !x || x.duda === true || (x.r == null && r.tipo !== 'desarrollo') }; });
    h.nombreLeido = data.resultado ? data.resultado.nombre : '';
    const g = gGrupo(); const m = escBuscarAlumno(h.nombreLeido, g.alumnos); h.aid = m ? m.id : '';
    escCalcular(h, ex);
    h.estado = 'listo';
  } catch (e) { h.estado = 'error'; h.msg = (typeof licMensajeIA === 'function' && e.codigo ? licMensajeIA(e) : e.message) || 'No se pudo leer esta foto.'; }
  const el = document.getElementById('esc-h-' + h.id); if (el) el.outerHTML = escHojaHTML(h); else gRenderEscaner();
  escActualizarGuardar();
}
function escActualizarGuardar() { if (G.tab !== 'escaner') return; const btn = document.querySelector('button[onclick="escGuardarTodas()"]'); if (!btn) return; const pend = G.esc.hojas.filter(x => x.estado === 'listo' && !x.guardada && x.aid).length; btn.disabled = !pend; btn.textContent = `💾 Guardar todas las revisadas (${pend})`; }

// ── Nombre leído → alumno de la lista ──
function escBuscarAlumno(nombre, alumnos) {
  const tk = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter(t => t.length > 1);
  const a = tk(nombre); if (!a.length) return null;
  const pts = alumnos.map(al => { const b = tk(al.nombre); const com = a.filter(t => b.includes(t)).length; return { al, s: com / Math.min(a.length, b.length || 1) }; }).sort((x, y) => y.s - x.s);
  if (!pts.length || pts[0].s < 0.6) return null;
  if (pts[1] && pts[1].s === pts[0].s) return null;   // ambiguo: que lo elija el maestro
  return pts[0].al;
}

// ── Calificación (la clave está en el examen guardado en este dispositivo) ──
function escCorrecto(r, lec) {
  const L = String(lec || '').trim(); if (!L) return false;
  if (r.tipo === 'opcion_multiple') return L.toUpperCase().charAt(0) === String(r.respuesta).toUpperCase().charAt(0);
  if (r.tipo === 'verdadero_falso') { const k = gNorm(r.respuesta).charAt(0), l = gNorm(L).charAt(0); return !!k && k === l; }
  if (r.tipo === 'respuesta_corta') { const k = gNorm(r.respuesta), l = gNorm(L); return !!k && (k === l || (k.length >= 3 && l.includes(k))); }
  return false;
}
function escCalcular(h, ex) { ex.reactivos.forEach((r, i) => { if (r.tipo !== 'desarrollo') h.ok[i + 1] = escCorrecto(r, (h.resp[i + 1] || {}).r); else if (h.pts[i + 1] == null) h.pts[i + 1] = 0; }); }
function escTotal(h, ex) { return ex.reactivos.reduce((s, r, i) => s + (r.tipo === 'desarrollo' ? Math.min(r.valor || 1, Math.max(0, +h.pts[i + 1] || 0)) : (h.ok[i + 1] ? (r.valor || 1) : 0)), 0); }

function escHojaHTML(h) {
  const ex = G.esc.exId && escExamenes(gGrupo() || { actividades: [] }).find(e => e.id === h.exId); const g = gGrupo();
  let c = `<div id="esc-h-${h.id}" style="border:1.5px solid ${h.guardada ? '#86efac' : 'var(--borde)'};border-radius:12px;padding:12px;margin-bottom:12px;display:flex;gap:12px;flex-wrap:wrap;background:${h.guardada ? '#f0fdf4' : 'var(--blanco)'}">`;
  c += `<div style="flex:0 0 130px">${h.thumb ? `<img src="${h.thumb}" alt="Foto del examen" style="width:130px;border-radius:8px;border:1px solid var(--borde);cursor:zoom-in" onclick="escVerFoto('${h.id}')">` : '<div style="width:130px;height:170px;background:#f1f5f9;border-radius:8px"></div>'}</div><div style="flex:1;min-width:230px">`;
  if (h.estado === 'leyendo') return c + `<b>⏳ Leyendo la foto…</b><div style="font-size:12px;color:var(--gris)">Tarda unos segundos.</div></div></div>`;
  if (h.estado === 'error') return c + `<b style="color:#dc2626">No se pudo leer</b><div style="font-size:13px;margin:4px 0">${gEsc(h.msg)}</div><button class="g-btn g-btn-s" onclick="escQuitar('${h.id}')">Quitar</button></div></div>`;
  const opts = `<option value="">— elige al alumno —</option>` + g.alumnos.map(a => `<option value="${a.id}"${a.id === h.aid ? ' selected' : ''}>${gEsc(a.nombre)}</option>`).join('');
  c += `<div style="margin-bottom:6px"><label style="font-size:11.5px;color:var(--gris);text-transform:uppercase;font-weight:600">Alumno${h.nombreLeido ? ' (leído: ' + gEsc(h.nombreLeido) + ')' : ''}</label>
    <select onchange="escAlumno('${h.id}',this.value)" style="width:100%;padding:8px;border:1.5px solid ${h.aid ? 'var(--borde)' : '#f59e0b'};border-radius:8px">${opts}</select></div>`;
  c += `<table style="width:100%;border-collapse:collapse;font-size:12.5px"><tr style="color:var(--gris);text-align:left"><th>#</th><th>Leído</th><th>Clave</th><th style="text-align:center">Punt.</th></tr>`;
  ex.reactivos.forEach((r, i) => {
    const n = i + 1, x = h.resp[n] || { r: '', duda: false }, duda = x.duda && r.tipo !== 'desarrollo';
    c += `<tr style="${duda ? 'background:#fffbeb' : ''};border-top:1px solid var(--borde)"><td style="padding:4px 4px"><b>${n}</b></td>`;
    if (r.tipo === 'desarrollo') c += `<td colspan="2" style="color:var(--gris)">Desarrollo — pon los puntos →</td><td style="text-align:center"><input type="number" min="0" max="${r.valor || 1}" step="0.5" value="${h.pts[n] == null ? 0 : h.pts[n]}" style="width:54px;padding:3px" onchange="escPts('${h.id}',${n},this.value)"> /${r.valor || 1}</td></tr>`;
    else c += `<td><input value="${gEsc(x.r)}" style="width:${r.tipo === 'respuesta_corta' ? '100%' : '46px'};padding:3px;border:1px solid var(--borde);border-radius:6px;text-align:${r.tipo === 'respuesta_corta' ? 'left' : 'center'}" onchange="escLeido('${h.id}',${n},this.value)">${duda ? ' <span title="Revisa esta respuesta">⚠️</span>' : ''}</td>
      <td style="color:var(--gris)">${gEsc(String(r.respuesta).slice(0, 24))}</td><td style="text-align:center"><button class="g-btn ${h.ok[n] ? '' : 'g-btn-s'}" style="margin:0;padding:3px 10px;${h.ok[n] ? 'background:#16a34a' : 'color:#dc2626'}" onclick="escToggle('${h.id}',${n})">${h.ok[n] ? '✓ ' + (r.valor || 1) : '✗ 0'}</button></td></tr>`;
  });
  c += `</table>`;
  const tot = escTotal(h, ex), cal = tot / ex.max * 10, ant = h.aid ? ex.notas[h.aid] : null;
  c += `<div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b>Total: ${tot} / ${ex.max}</b> <span style="color:${cal < 6 ? '#dc2626' : '#16a34a'};font-weight:700">Calif. ${gFmt(cal)}</span>
    ${h.guardada ? '<span style="color:#16a34a;font-weight:600">✓ Guardada</span>' : `<button class="g-btn" onclick="escGuardar('${h.id}')"${h.aid ? '' : ' disabled'}>💾 Guardar</button>`}<button class="g-btn g-btn-s" onclick="escQuitar('${h.id}')">Quitar</button></div>
    ${ant != null && !h.guardada ? `<div style="font-size:11.5px;color:#b45309;margin-top:4px">Este alumno ya tiene ${ant} pts capturados en este examen; al guardar se reemplazan.</div>` : ''}`;
  return c + '</div></div>';
}
function escHoja(id) { return G.esc.hojas.find(h => h.id === id); }
function escRef(id) { const h = escHoja(id), el = document.getElementById('esc-h-' + id); if (h && el) el.outerHTML = escHojaHTML(h); escActualizarGuardar(); }
function escAlumno(id, aid) { const h = escHoja(id); h.aid = aid; escRef(id); }
function escLeido(id, n, v) { const h = escHoja(id), ex = escExamenes(gGrupo()).find(e => e.id === h.exId); h.resp[n] = { r: v.trim(), duda: false }; h.ok[n] = escCorrecto(ex.reactivos[n - 1], v); escRef(id); }
function escToggle(id, n) { const h = escHoja(id); h.ok[n] = !h.ok[n]; escRef(id); }
function escPts(id, n, v) { const h = escHoja(id); h.pts[n] = gNum(v) || 0; escRef(id); }
function escQuitar(id) { G.esc.hojas = G.esc.hojas.filter(h => h.id !== id); gRenderEscaner(); }
function escVerFoto(id) { const h = escHoja(id); if (!h || !h.thumb) return; const w = window.open('', '_blank'); if (w) { w.document.write(`<title>Foto del examen</title><body style="margin:0;background:#111"><img src="${h.thumb}" style="max-width:100%;display:block;margin:auto">`); w.document.close(); } }

function escGuardar(id, sinRender) {
  const h = escHoja(id), g = gGrupo(), ex = g && escExamenes(g).find(e => e.id === h.exId); if (!h || !ex || !h.aid || h.guardada) return false;
  ex.notas[h.aid] = escTotal(h, ex); h.guardada = true; gGuardar(); if (!sinRender) escRef(id); return true;
}
function escGuardarTodas() {
  let n = 0; G.esc.hojas.filter(h => h.estado === 'listo' && !h.guardada && h.aid).forEach(h => { if (escGuardar(h.id, true)) n++; });
  gRenderEscaner(); if (n) gAviso(`Listo: se guardaron las calificaciones de ${n} alumno(s). Las ves en «Exámenes» y «Calificaciones».`);
}
