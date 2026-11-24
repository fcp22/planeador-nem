// ============================================================
// ESCÁNER DE EXÁMENES
// El maestro fotografía el examen resuelto de cada alumno. El servidor (IA) solo LEE lo que el
// alumno marcó/escribió; la calificación se calcula aquí, con la clave que nunca sale del dispositivo.
// El maestro revisa y corrige antes de guardar. Las fotos no se guardan: solo la calificación.
// ============================================================

G.esc = { exId: null, hojas: [], cola: [], restantes: null, activo: 0, modo: '', man: { tipo: 'opcion_multiple', clave: '', n: '', nombre: '', guardadoId: '' }, manEx: null, noGuardar: false };

// Solo se escanea con exámenes cuya clave el docente ya revisó («Revisé las respuestas correctas»)
function escConReactivos(g) { return g.actividades.filter(a => a.tipo === 'examen' && Array.isArray(a.reactivos) && a.reactivos.length); }
function escExamenes(g) { return escConReactivos(g).filter(a => a.revisado === true); }
function escExamen() { const g = gGrupo(); return g ? escExamenes(g).find(a => a.id === G.esc.exId) || null : null; }
// examen al que pertenece una hoja (del grupo, o la clave escrita a mano)
function escExDe(h) { if (h.exObj) return h.exObj; const g = gGrupo(); return g ? escExamenes(g).find(e => e.id === h.exId) || null : null; }
// ¿los resultados NO se guardan en un grupo? (sin grupo, o el maestro eligió «No guardar»)
function escSin() { return !gGrupo() || (G.esc.modo === 'manual' && G.esc.noGuardar); }
function escHojasVis() { const man = G.esc.modo === 'manual'; return G.esc.hojas.filter(h => man === !!h.exObj); }

function gRenderEscaner() {
  if (!G.data) gCargar();
  const g = gGrupo(), exs = g ? escExamenes(g) : [];
  if (g && !exs.find(x => x.id === G.esc.exId)) { G.esc.exId = exs.length ? exs[exs.length - 1].id : null; G.esc.hojas = G.esc.hojas.filter(h => h.exObj); }
  if (G.esc.manEx && G.esc.manEx.gid !== (g ? g.id : '')) { G.esc.hojas = G.esc.hojas.filter(h => !h.exObj); G.esc.manEx = null; G.esc.man.guardadoId = ''; }   // cambió de grupo: la clave escrita ya no aplica
  if (!G.esc.modo) G.esc.modo = exs.length ? 'examen' : 'manual';
  if (!g) G.esc.modo = 'manual';
  const man = G.esc.modo === 'manual', ex = man ? G.esc.manEx : escExamen(), vis = escHojasVis();
  let h = (g ? gBarra() : '') + `<div class="sec-title">Escanear examen</div><div class="sec-sub">Fotografía el examen resuelto de cada alumno y la app lee las respuestas, las compara con tu clave y calcula la calificación. Tú revisas antes de guardar.</div>`;
  if (g) h += `<div class="g-chips" style="margin-bottom:12px"><button class="g-chip${man ? '' : ' on'}" onclick="escModo('examen')">📚 Examen de la app</button><button class="g-chip${man ? ' on' : ''}" onclick="escModo('manual')">✍️ Clave manual</button></div>`;
  if (!man && !ex) {
    h += `<div class="card g-vacio"><div style="font-size:44px;margin-bottom:8px">🧮</div><div>${g && escConReactivos(g).length ? `Tienes ${escConReactivos(g).length} examen(es) creado(s) con IA, pero su <b>clave aún no está revisada</b>. Entra a «Exámenes», revisa las respuestas y marca <b>«Revisé las respuestas correctas»</b>; después podrás escanearlos.` : 'No tienes exámenes creados con IA en este grupo. Puedes crear uno en «Exámenes», o escanear un examen que ya tengas escribiendo tú la clave.'}</div><button class="g-btn" style="margin-top:14px" onclick="escModo('manual')">✍️ Escribir la clave a mano</button> <button class="g-btn g-btn-s" style="margin-top:14px" onclick="gIrA('examenes')">Ir a «Exámenes»</button></div>`;
    return void (gPanel().innerHTML = h);
  }
  // 1. Foto de la hoja (cámara o galería): se acumulan y se leen al pulsar «Escanear y calificar»
  const caja = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:104px;border:2px dashed;border-radius:14px;cursor:pointer;font-size:14px;text-align:center';
  h += `<div class="card"><div class="card-title">1. Foto de la hoja de respuestas</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <label style="${caja};border-color:#2563a8;background:#eff6ff;color:#1e3a8a"><span style="font-size:30px">📷</span><b>Cámara</b><input id="esc-cam" type="file" accept="image/*" capture="environment" style="display:none" onchange="escSubir(this)"></label>
      <label style="${caja};border-color:#94a3b8;background:#f8fafc;color:#334155"><span style="font-size:30px">🖼️</span><b>Galería</b><input id="esc-gal" type="file" accept="image/*" multiple style="display:none" onchange="escSubir(this)"></label></div>
    ${G.esc.cola.length ? `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">${G.esc.cola.map((c, i) => `<div style="position:relative"><img src="${c.url}" alt="Hoja ${i + 1}" style="width:74px;height:98px;object-fit:cover;border-radius:8px;border:1px solid var(--borde);display:block"><button onclick="escQuitarCola('${c.id}')" title="Quitar" style="position:absolute;top:-7px;right:-7px;width:24px;height:24px;border-radius:50%;border:0;background:#dc2626;color:#fff;font-weight:700;cursor:pointer">✕</button><div style="text-align:center;font-size:11px;color:var(--gris)">Hoja ${i + 1}</div></div>`).join('')}</div><div style="font-size:12.5px;margin-top:8px;color:#16a34a;font-weight:600">${G.esc.cola.length} foto(s) lista(s). Puedes agregar más.</div>` : ''}
    <div style="font-size:12px;color:var(--gris);margin-top:10px">Una hoja por foto, completa y derecha, con buena luz y sin sombras. Debe verse el <b>nombre del alumno</b>. Las fotos no se guardan: solo la calificación que tú confirmes.</div></div>`;
  // 2. Clave / examen
  if (man) h += escManualHTML(g);
  else {
    const objetivos = ex.reactivos.filter(r => r.tipo !== 'desarrollo').length;
    h += `<div class="card"><div class="card-title">2. Elige el examen</div>
    <select onchange="escElegir(this.value)" style="width:100%;padding:10px;border:1.5px solid var(--borde);border-radius:8px">${exs.map(e => `<option value="${e.id}"${e.id === ex.id ? ' selected' : ''}>${gEsc(e.nombre)} (${e.reactivos.length} reactivos · ${e.max} pts)</option>`).join('')}</select>
    ${objetivos < ex.reactivos.length ? `<div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-top:6px">Los reactivos de <b>desarrollo</b> no se leen con la cámara: tú les pones los puntos al revisar.</div>` : ''}</div>`;
  }
  h += `<div style="text-align:center;margin:4px 0 16px"><div style="font-size:12.5px;color:var(--gris);margin-bottom:8px">${G.esc.restantes != null ? `Te quedan <b>${G.esc.restantes}</b> escaneos este mes.` : 'Cada foto que escaneas cuenta como un escaneo.'}</div>
    <button class="g-btn" style="width:100%;max-width:520px;padding:15px;font-size:16px" onclick="escEscanear()">⚡ Escanear y calificar${G.esc.cola.length ? ' (' + G.esc.cola.length + ')' : ''}</button></div>`;
  if (vis.length) {
    const sin = escSin(), pend = vis.filter(x => x.estado === 'listo' && !x.guardada && x.aid).length;
    h += `<div class="card"><div class="card-title">3. Revisa${sin ? '' : ' y guarda'} <span style="margin-left:auto;font-size:12px;font-weight:400;color:var(--gris)">${vis.length} foto(s)</span></div>
      <div class="g-aviso" style="font-size:12.5px;margin-bottom:12px">⚠️ La lectura puede equivocarse, sobre todo con letra difícil. Revisa lo marcado en ámbar y corrige con ✓ / ✗. Si sales de esta pantalla antes de ${sin ? 'copiar los resultados' : 'guardar'}, se pierden las lecturas.</div>
      <div style="margin-bottom:10px">${sin ? `<button class="g-btn" onclick="escCopiar()">📋 Copiar resultados (nombre y calificación)</button>` : `<button class="g-btn" onclick="escGuardarTodas()"${pend ? '' : ' disabled'}>💾 Guardar todas las revisadas (${pend})</button> <button class="g-btn g-btn-s" onclick="escLimpiar()">Quitar las ya guardadas</button>`}</div>
      <div id="esc-hojas">${vis.map(escHojaHTML).join('')}</div></div>`;
  }
  gPanel().innerHTML = h;
  if (man) escManEstado();
}
function escModo(m) { G.esc.modo = m; gRenderEscaner(); }
function escElegir(id) { G.esc.exId = id; G.esc.hojas = G.esc.hojas.filter(h => h.exObj); gRenderEscaner(); }
function escLimpiar() { G.esc.hojas = G.esc.hojas.filter(h => !h.guardada); gRenderEscaner(); }

// ── Clave escrita a mano (para exámenes que no se hicieron en la app) ──
function escManualHTML(g) {
  const m = G.esc.man, chip = (v, t) => `<button class="g-chip${m.tipo === v ? ' on' : ''}" onclick="escManTipo('${v}')">${t}</button>`;
  return `<div class="card"><div class="card-title">2. Escribe la clave de respuestas</div>
    ${escGuardables(g).length ? `<div class="campo"><label>Examen guardado (opcional)</label><select id="esc-guardado" onchange="escManGuardado(this.value)"><option value="">Seleccionar examen para cargar la clave…</option>${escGuardables(g).map(a => `<option value="${a.id}"${m.guardadoId === a.id ? ' selected' : ''}>${gEsc(a.nombre)}</option>`).join('')}</select><div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-top:4px">Si eliges uno, la clave se llena sola y las calificaciones se guardan en ese mismo examen.</div></div>` : ''}
    <div class="campo"><label>Tipo de preguntas</label><div class="g-chips">${chip('opcion_multiple', 'A – D')}${chip('verdadero_falso', 'V / F')}${chip('mixto', 'Mixto')}</div></div>
    <div class="f2"><div class="campo"><label>Número de preguntas</label><input id="esc-n" type="number" min="1" max="100" value="${gEsc(String(m.n))}" oninput="escManInput(event)"></div>
    <div class="campo"><label>Nombre del examen</label><input id="esc-nom" value="${gEsc(m.nombre)}" placeholder="Ej. Examen del trimestre" oninput="escManInput(event)"></div></div>
    <div class="campo"><label>Clave de respuestas</label><input id="esc-clave" value="${gEsc(m.clave)}" placeholder="ABCDABCDCA" autocomplete="off" autocapitalize="characters" spellcheck="false" oninput="escManInput(event)" style="letter-spacing:3px;font-weight:600">
      <div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-top:4px">Las letras correctas en orden (los espacios no importan). En V/F usa V y F. En Mixto: A–D son opción múltiple y V/F verdadero-falso.</div></div>
    ${g ? `<div class="campo"><label>Guardar las calificaciones en</label><select id="esc-guardar" onchange="escManInput(event)"><option value="g"${G.esc.noGuardar ? '' : ' selected'}>${gEsc(g.nombre)} · ${gEsc(g.materia)} (aparece en «Exámenes»)</option><option value="no"${G.esc.noGuardar ? ' selected' : ''}>No guardar: solo ver y copiar los resultados</option></select></div>` : `<div class="ayuda" style="font-size:12px;color:var(--gris);margin-bottom:8px">Sin grupo: verás las calificaciones y podrás copiarlas. Para guardarlas, crea tu grupo en «Mis grupos».</div>`}
    <div id="esc-man-est" style="font-size:13px;margin:6px 0 10px"></div>
    </div>`;
}
// Exámenes del grupo cuya clave se puede cargar como letras (solo opción múltiple / V-F, o los registrados antes con clave manual)
function escGuardables(g) {
  return g ? g.actividades.filter(a => a.tipo === 'examen' && (a.claveManual || (a.revisado === true && Array.isArray(a.reactivos) && a.reactivos.length && a.reactivos.every(r => r.tipo === 'opcion_multiple' || r.tipo === 'verdadero_falso')))) : [];
}
function escClaveDe(a) {
  let L = '';
  if (a.claveManual) L = escManLetras(a.claveManual);
  else L = a.reactivos.map(r => r.tipo === 'verdadero_falso' ? (gNorm(r.respuesta).charAt(0) === 'v' ? 'V' : 'F') : String(r.respuesta || '').toUpperCase().charAt(0)).join('');
  if (!L || /[^A-EVF]/.test(L)) return null;
  return { letras: L, tipo: /^[VF]+$/.test(L) ? 'verdadero_falso' : /^[A-E]+$/.test(L) ? 'opcion_multiple' : 'mixto' };
}
function escManGuardado(id) {
  escManLeer(); const m = G.esc.man, g = gGrupo(); m.guardadoId = id || '';
  if (id) {
    const a = g && g.actividades.find(x => x.id === id), k = a && escClaveDe(a);
    if (!k) { m.guardadoId = ''; gAviso('No se pudo cargar la clave de ese examen.'); } else { m.clave = k.letras; m.tipo = k.tipo; m.n = String(k.letras.length); m.nombre = a.nombre; G.esc.noGuardar = false; }
  }
  gRenderEscaner();
}
function escManLetras(t) { return String(t || '').toUpperCase().replace(/[^A-Z]/g, ''); }
function escManError(tipo, L) {
  const ok = { opcion_multiple: /^[A-E]+$/, verdadero_falso: /^[VF]+$/, mixto: /^[A-EVF]+$/ }[tipo] || /^[A-Z]+$/;
  if (L && !ok.test(L)) return tipo === 'verdadero_falso' ? 'En V/F la clave solo puede tener V y F.' : tipo === 'opcion_multiple' ? 'En opción múltiple la clave solo puede tener letras A, B, C, D (o E).' : 'En Mixto usa A–D para opción múltiple y V o F para verdadero/falso.';
  return '';
}
function escManTipo(t) { escManLeer(); G.esc.man.tipo = t; gRenderEscaner(); }
function escManLeer() {
  const m = G.esc.man, q = id => document.getElementById(id);
  if (q('esc-clave')) { m.clave = q('esc-clave').value; m.n = q('esc-n').value; m.nombre = q('esc-nom').value; }
  const sel = q('esc-guardar'); if (sel) G.esc.noGuardar = sel.value === 'no';
}
function escManInput(ev) {
  const q = id => document.getElementById(id), L = escManLetras(q('esc-clave') && q('esc-clave').value);
  if (ev && ev.target && ev.target.id === 'esc-clave' && L.length) q('esc-n').value = L.length;   // el número se ajusta solo a lo que escribes
  escManLeer(); escManEstado();
}
function escManEstado() {
  const el = document.getElementById('esc-man-est'); if (!el) return;
  const m = G.esc.man, L = escManLetras(m.clave), n = parseInt(m.n, 10) || 0, err = escManError(m.tipo, L);
  el.innerHTML = !L.length ? '<span style="color:var(--gris)">Escribe la clave, por ejemplo ABCDABCDCA.</span>'
    : err ? `<span style="color:#dc2626">⚠️ ${err}</span>`
    : n && n !== L.length ? `<span style="color:#b45309">⚠️ Escribiste ${L.length} letras y pusiste ${n} preguntas: deben coincidir.</span>`
    : `<span style="color:#16a34a">✓ Clave lista: ${L.length} preguntas.</span>`;
}
function escManUsar() {
  escManLeer(); const m = G.esc.man, L = escManLetras(m.clave), n = parseInt(m.n, 10) || 0, g = gGrupo();
  const err = !L.length ? 'Escribe la clave de respuestas.' : escManError(m.tipo, L) || (n !== L.length ? `Escribiste ${L.length} letras y pusiste ${n} preguntas: deben coincidir.` : L.length > 100 ? 'Máximo 100 preguntas.' : '');
  if (err) { gAviso(err); return false; }
  if (G.esc.hojas.some(h => h.exObj) && !confirm('Al cambiar la clave se quitan las fotos ya leídas con la clave anterior. ¿Continuar?')) return false;
  G.esc.hojas = G.esc.hojas.filter(h => !h.exObj);
  const lig = g && m.guardadoId ? g.actividades.find(x => x.id === m.guardadoId) : null, vals = lig && Array.isArray(lig.reactivos) && lig.reactivos.length === L.length ? lig.reactivos.map(r => r.valor || 1) : null;   // si es un examen de la app, se respetan los puntos de cada reactivo
  const reactivos = [...L].map((c, i) => ({ tipo: /[VF]/.test(c) && m.tipo !== 'opcion_multiple' ? 'verdadero_falso' : 'opcion_multiple', respuesta: c, valor: vals ? vals[i] : 1 }));
  G.esc.manEx = { id: 'manual', nombre: (m.nombre || '').trim() || 'Examen escaneado', reactivos, max: reactivos.reduce((t, r) => t + r.valor, 0), notas: {}, gid: g ? g.id : '', actId: (g && m.guardadoId && g.actividades.some(x => x.id === m.guardadoId)) ? m.guardadoId : null, clave: L, tipoSel: m.tipo };
  gRenderEscaner(); return true;
}

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
function escSubir(inp) {
  const fs = [...inp.files]; inp.value = ''; if (!fs.length) return;
  fs.forEach(f => G.esc.cola.push({ id: gId(), file: f, url: URL.createObjectURL(f) }));
  gRenderEscaner();
}
function escQuitarCola(id) { const c = G.esc.cola.find(x => x.id === id); if (c) URL.revokeObjectURL(c.url); G.esc.cola = G.esc.cola.filter(x => x.id !== id); gRenderEscaner(); }
// Botón «Escanear y calificar»: activa la clave escrita (si hace falta) y lee todas las fotos de la cola
async function escEscanear() {
  const man = G.esc.modo === 'manual';
  if (!G.esc.cola.length) { gAviso('Primero toma o elige la foto de la hoja de respuestas (Cámara o Galería).'); return; }
  let ex;
  if (man) {
    escManLeer(); const m = G.esc.man, L = escManLetras(m.clave), cur = G.esc.manEx;
    const igual = cur && cur.clave === L && cur.reactivos.length === (parseInt(m.n, 10) || 0) && cur.tipoSel === m.tipo && (cur.actId || '') === (m.guardadoId || '') && cur.nombre === ((m.nombre || '').trim() || 'Examen escaneado');
    if (!igual && !escManUsar()) return;
    ex = G.esc.manEx;
  } else ex = escExamen();
  if (!ex) return;
  const fs = G.esc.cola.map(c => c.file); G.esc.cola.forEach(c => URL.revokeObjectURL(c.url)); G.esc.cola = [];
  const nuevas = fs.map(f => ({ id: gId(), file: f, estado: 'leyendo', msg: '', thumb: '', nombreLeido: '', aid: '', resp: {}, ok: {}, rev: {}, pts: {}, guardada: false, exId: ex.id, exObj: man ? ex : null }));
  G.esc.hojas.push(...nuevas); gRenderEscaner();
  const cola = nuevas.slice();   // dos a la vez para ir rápido sin saturar el servidor
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
    const g = gGrupo(); const m = g && !escSin() ? escBuscarAlumno(h.nombreLeido, g.alumnos) : null; h.aid = m ? m.id : '';
    escCalcular(h, ex);
    h.estado = 'listo';
  } catch (e) { h.estado = 'error'; h.msg = (typeof licMensajeIA === 'function' && e.codigo ? licMensajeIA(e) : e.message) || 'No se pudo leer esta foto.'; }
  const el = document.getElementById('esc-h-' + h.id); if (el) el.outerHTML = escHojaHTML(h); else gRenderEscaner();
  escActualizarGuardar();
}
function escActualizarGuardar() { if (G.tab !== 'escaner') return; const btn = document.querySelector('button[onclick="escGuardarTodas()"]'); if (!btn) return; const pend = G.esc.hojas.filter(x => x.estado === 'listo' && !x.guardada && x.aid && !escPorRevisar(x)).length; btn.disabled = !pend; btn.textContent = `💾 Guardar todas las revisadas (${pend})`; }

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
// Resultado de un reactivo: 'correcto', 'incorrecto' o 'revisar' (el docente decide con un toque)
// Respuesta corta: solo cuenta como correcta la coincidencia EXACTA (sin acentos, mayúsculas ni signos); cualquier otra cosa escrita queda «por revisar».
// Así «no es fotosíntesis» ya no cuenta como acierto solo por contener la palabra clave.
function escEvaluar(r, lec) {
  const L = String(lec || '').trim(); if (!L) return 'incorrecto';
  if (r.tipo === 'opcion_multiple') return L.toUpperCase().charAt(0) === String(r.respuesta).toUpperCase().charAt(0) ? 'correcto' : 'incorrecto';
  if (r.tipo === 'verdadero_falso') { const k = gNorm(r.respuesta).charAt(0), l = gNorm(L).charAt(0); return !!k && k === l ? 'correcto' : 'incorrecto'; }
  if (r.tipo === 'respuesta_corta') { const k = gNorm(r.respuesta), l = gNorm(L); if (!k || !l) return 'revisar'; return k === l ? 'correcto' : 'revisar'; }
  return 'incorrecto';
}
function escCorrecto(r, lec) { return escEvaluar(r, lec) === 'correcto'; }
function escPorRevisar(h) { return Object.keys(h.rev || {}).filter(k => h.rev[k]).length; }
function escCalcular(h, ex) {
  h.rev = {};
  ex.reactivos.forEach((r, i) => {
    if (r.tipo === 'desarrollo') { if (h.pts[i + 1] == null) h.pts[i + 1] = 0; return; }
    const v = escEvaluar(r, (h.resp[i + 1] || {}).r);
    h.ok[i + 1] = v === 'correcto'; if (v === 'revisar') h.rev[i + 1] = true;
  });
}
// El docente decide una respuesta «por revisar» con un toque
function escDecidir(id, n, bueno) { const h = escHoja(id); h.ok[n] = !!bueno; delete h.rev[n]; escRef(id); }
function escTotal(h, ex) { return ex.reactivos.reduce((s, r, i) => s + (r.tipo === 'desarrollo' ? Math.min(r.valor || 1, Math.max(0, +h.pts[i + 1] || 0)) : (h.ok[i + 1] ? (r.valor || 1) : 0)), 0); }

function escHojaHTML(h) {
  const ex = escExDe(h), g = gGrupo(), sin = escSin();
  let c = `<div id="esc-h-${h.id}" style="border:1.5px solid ${h.guardada ? '#86efac' : 'var(--borde)'};border-radius:12px;padding:12px;margin-bottom:12px;display:flex;gap:12px;flex-wrap:wrap;background:${h.guardada ? '#f0fdf4' : 'var(--blanco)'}">`;
  c += `<div style="flex:0 0 130px">${h.thumb ? `<img src="${h.thumb}" alt="Foto del examen" style="width:130px;border-radius:8px;border:1px solid var(--borde);cursor:zoom-in" onclick="escVerFoto('${h.id}')">` : '<div style="width:130px;height:170px;background:#f1f5f9;border-radius:8px"></div>'}</div><div style="flex:1;min-width:230px">`;
  if (h.estado === 'leyendo') return c + `<b>⏳ Leyendo la foto…</b><div style="font-size:12px;color:var(--gris)">Tarda unos segundos.</div></div></div>`;
  if (h.estado === 'error') return c + `<b style="color:#dc2626">No se pudo leer</b><div style="font-size:13px;margin:4px 0">${gEsc(h.msg)}</div><button class="g-btn g-btn-s" onclick="escQuitar('${h.id}')">Quitar</button></div></div>`;
  if (sin) c += `<div style="margin-bottom:6px"><label style="font-size:11.5px;color:var(--gris);text-transform:uppercase;font-weight:600">Alumno (leído de la foto)</label>
    <input value="${gEsc(h.nombreLeido)}" placeholder="Escribe el nombre" onchange="escNombre('${h.id}',this.value)" style="width:100%;padding:8px;border:1.5px solid var(--borde);border-radius:8px"></div>`;
  else {
    const opts = `<option value="">— elige al alumno —</option>` + g.alumnos.map(a => `<option value="${a.id}"${a.id === h.aid ? ' selected' : ''}>${gEsc(a.nombre)}</option>`).join('');
    c += `<div style="margin-bottom:6px"><label style="font-size:11.5px;color:var(--gris);text-transform:uppercase;font-weight:600">Alumno${h.nombreLeido ? ' (leído: ' + gEsc(h.nombreLeido) + ')' : ''}</label>
    <select onchange="escAlumno('${h.id}',this.value)" style="width:100%;padding:8px;border:1.5px solid ${h.aid ? 'var(--borde)' : '#f59e0b'};border-radius:8px">${opts}</select></div>`;
  }
  c += `<table style="width:100%;border-collapse:collapse;font-size:12.5px"><tr style="color:var(--gris);text-align:left"><th>#</th><th>Leído</th><th>Clave</th><th style="text-align:center">Punt.</th></tr>`;
  ex.reactivos.forEach((r, i) => {
    const n = i + 1, x = h.resp[n] || { r: '', duda: false }, duda = x.duda && r.tipo !== 'desarrollo', porRev = !!(h.rev && h.rev[n]);
    c += `<tr style="${duda || porRev ? 'background:#fffbeb' : ''};border-top:1px solid var(--borde)"><td style="padding:4px 4px"><b>${n}</b></td>`;
    if (r.tipo === 'desarrollo') c += `<td colspan="2" style="color:var(--gris)">Desarrollo — pon los puntos →</td><td style="text-align:center"><input type="number" min="0" max="${r.valor || 1}" step="0.5" value="${h.pts[n] == null ? 0 : h.pts[n]}" style="width:54px;padding:3px" onchange="escPts('${h.id}',${n},this.value)"> /${r.valor || 1}</td></tr>`;
    else c += `<td><input value="${gEsc(x.r)}" style="width:${r.tipo === 'respuesta_corta' ? '100%' : '46px'};padding:3px;border:1px solid var(--borde);border-radius:6px;text-align:${r.tipo === 'respuesta_corta' ? 'left' : 'center'}" onchange="escLeido('${h.id}',${n},this.value)">${duda ? ' <span title="Revisa esta respuesta">⚠️</span>' : ''}</td>
      <td style="color:var(--gris)">${gEsc(String(r.respuesta).slice(0, 24))}</td><td style="text-align:center">${h.rev && h.rev[n] ? `<div style="font-size:10.5px;font-weight:700;color:#92400e;margin-bottom:2px">POR REVISAR</div><button class="g-btn" style="margin:0 2px 0 0;padding:3px 9px;background:#16a34a" title="Cuenta como correcta" onclick="escDecidir('${h.id}',${n},true)">✓ ${r.valor || 1}</button><button class="g-btn g-btn-s" style="margin:0;padding:3px 9px;color:#dc2626" title="Cuenta como incorrecta" onclick="escDecidir('${h.id}',${n},false)">✗ 0</button>` : `<button class="g-btn ${h.ok[n] ? '' : 'g-btn-s'}" style="margin:0;padding:3px 10px;${h.ok[n] ? 'background:#16a34a' : 'color:#dc2626'}" onclick="escToggle('${h.id}',${n})">${h.ok[n] ? '✓ ' + (r.valor || 1) : '✗ 0'}</button>`}</td></tr>`;
  });
  c += `</table>`;
  const tot = escTotal(h, ex), cal = tot / ex.max * 10, dest = sin ? null : escDestino(h, false), ant = h.aid && dest ? dest.notas[h.aid] : null;
  c += `<div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b>Total: ${tot} / ${ex.max}</b> <span style="color:${cal < 6 ? '#dc2626' : '#16a34a'};font-weight:700">Calif. ${gFmt(cal)}${escPorRevisar(h) ? ' (provisional)' : ''}</span>
    ${sin ? '' : h.guardada ? '<span style="color:#16a34a;font-weight:600">✓ Guardada</span>' : `<button class="g-btn" onclick="escGuardar('${h.id}')"${h.aid && !escPorRevisar(h) ? '' : ' disabled'}>💾 Guardar</button>`}${escPorRevisar(h) ? `<span style="color:#92400e;font-weight:600;font-size:12.5px">Decide las ${escPorRevisar(h)} respuesta(s) por revisar para guardar</span>` : ''}<button class="g-btn g-btn-s" onclick="escQuitar('${h.id}')">Quitar</button></div>
    ${ant != null && !h.guardada ? `<div style="font-size:11.5px;color:#b45309;margin-top:4px">Este alumno ya tiene ${ant} pts capturados en este examen; al guardar se reemplazan.</div>` : ''}`;
  return c + '</div></div>';
}
function escHoja(id) { return G.esc.hojas.find(h => h.id === id); }
function escRef(id) { const h = escHoja(id), el = document.getElementById('esc-h-' + id); if (h && el) el.outerHTML = escHojaHTML(h); escActualizarGuardar(); }
function escAlumno(id, aid) { const h = escHoja(id); h.aid = aid; escRef(id); }
function escNombre(id, v) { const h = escHoja(id); if (h) h.nombreLeido = v.trim(); }
function escLeido(id, n, v) { const h = escHoja(id), ex = escExDe(h); h.resp[n] = { r: v.trim(), duda: false }; h.rev = h.rev || {}; const e = escEvaluar(ex.reactivos[n - 1], v); h.ok[n] = e === 'correcto'; if (e === 'revisar') h.rev[n] = true; else delete h.rev[n]; escRef(id); }
function escToggle(id, n) { const h = escHoja(id); h.ok[n] = !h.ok[n]; if (h.rev) delete h.rev[n]; escRef(id); }
function escPts(id, n, v) { const h = escHoja(id); h.pts[n] = gNum(v) || 0; escRef(id); }
function escQuitar(id) { G.esc.hojas = G.esc.hojas.filter(h => h.id !== id); gRenderEscaner(); }
function escVerFoto(id) { const h = escHoja(id); if (!h || !h.thumb) return; const w = window.open('', '_blank'); if (w) { w.document.write(`<title>Foto del examen</title><body style="margin:0;background:#111"><img src="${h.thumb}" style="max-width:100%;display:block;margin:auto">`); w.document.close(); } }

// Dónde se guardan las notas: el examen del grupo o, con clave manual, un examen nuevo (como «examen en papel») que se crea al guardar la primera
function escDestino(h, crear) {
  const g = gGrupo(); if (!g) return null;
  if (!h.exObj) return escExamenes(g).find(e => e.id === h.exId) || null;
  const mx = h.exObj; let a = mx.actId && g.actividades.find(x => x.id === mx.actId);
  if (!a && crear) { a = { id: gId(), trim: G.trimExam, criterioId: gCritExamen(g).id, nombre: mx.nombre, max: mx.max, tipo: 'examen', fecha: gHoy(), reactivos: null, claveManual: mx.clave, notas: {} }; g.actividades.push(a); mx.actId = a.id; }
  return a || null;
}
function escGuardar(id, sinRender) {
  const h = escHoja(id), ex = h && escExDe(h); if (!h || !ex || !h.aid || h.guardada || escSin() || escPorRevisar(h)) return false;
  const d = escDestino(h, true); if (!d) return false;
  d.notas[h.aid] = escTotal(h, ex); h.guardada = true; gGuardar(); if (!sinRender) escRef(id); return true;
}
function escGuardarTodas() {
  let n = 0; escHojasVis().filter(h => h.estado === 'listo' && !h.guardada && h.aid && !escPorRevisar(h)).forEach(h => { if (escGuardar(h.id, true)) n++; });
  gRenderEscaner(); if (n) gAviso(`Listo: se guardaron las calificaciones de ${n} alumno(s). Las ves en «Exámenes» y «Calificaciones».`);
}
function escCopiar() {
  const filas = escHojasVis().filter(h => h.estado === 'listo').map(h => { const ex = escExDe(h), tot = escTotal(h, ex); return `${h.nombreLeido || '(sin nombre)'}\t${tot}\t${escPorRevisar(h) ? 'por revisar' : gFmt(tot / ex.max * 10)}`; });
  if (!filas.length) { gAviso('Todavía no hay hojas leídas.'); return; }
  const txt = 'Alumno\tAciertos\tCalificación\n' + filas.join('\n');
  const ok = () => gAviso('Copiado: pégalo en Excel, Word o WhatsApp.');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, () => gAviso('No se pudo copiar. Toma captura de la pantalla.')); else gAviso('Tu navegador no permite copiar. Toma captura de la pantalla.');
}
