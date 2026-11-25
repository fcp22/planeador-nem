// ============================================================
// GESTIÓN DEL GRUPO — Mis grupos · Pase de lista · Calificaciones ·
// Exámenes · Planeación trimestral con proyectos
// Depende de: users.js (getUsuario), curriculum.js (CAMPOS_POR_GRADO),
// metodologias.js (METODOLOGIAS, sugerirProyectos…), generators.js
// (llamarGeminiJSON, parsearJSON, descargarWord) y de index.html (showTab…).
//
// PRIVACIDAD: los datos de alumnos se guardan SOLO en este dispositivo
// (localStorage), separados por docente. No se suben a Firebase.
// ============================================================

const G = {
  data: null, key: null, gid: null, tab: null,
  fecha: null,
  periodoLista: 'actual',
  trimCalif: 1, trimExam: 1, trimPlan: 1,
  borrador: null,        // examen generado y aún no guardado
  sugerencias: [],       // proyectos sugeridos (pestaña Trimestres)
};

const G_TRIM_NOM = ['', 'Primer trimestre', 'Segundo trimestre', 'Tercer trimestre'];
const G_TRIM_MESES = ['', 'sep – nov', 'dic – mar', 'abr – jul'];
const G_CRITERIOS_DEF = [
  ['Actitudes y valores', 10],
  ['Actividades en clase', 20],
  ['Investigaciones y tareas', 15],
  ['Portafolio de evidencias', 10],
  ['Exámenes', 15],
  ['Producto del proyecto', 30],
];
const G_ESTADOS = { P: 'Presente', R: 'Retardo', F: 'Falta', J: 'Justificada' };

// ── Utilidades ────────────────────────────────────────────
function gEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function gId() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }
function gHoy() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function gTrimDeFecha(iso) { const m = +iso.slice(5, 7); if (m >= 9 && m <= 11) return 1; if (m === 12 || m <= 3) return 2; return 3; }
function gFechaBonita(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(y, m - 1, d).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function gSumarDias(iso, n) { const [y, m, d] = iso.split('-').map(Number); const f = new Date(y, m - 1, d + n); return f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0') + '-' + String(f.getDate()).padStart(2, '0'); }
function gNum(v) { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; }
function gFmt(n, d) { return n == null ? '—' : n.toFixed(d == null ? 1 : d); }
// ── Regla de calificaciones: UN solo lugar para cambiarla ──
// Verificar con las Normas de Control Escolar vigentes
//   trimestral: cómo se pasa la calificación del trimestre a la boleta (entero de 5 a 10): 'truncar' | 'redondeo'
//   final:      cómo se obtiene el promedio final anual (un decimal):                       'truncar' | 'redondeo'
const REGLA_CALIF = { trimestral: 'truncar', final: 'truncar' };
// Aplica la regla a un número con `dec` decimales. El 1e-9 evita que un 5.9999999 (error normal de decimales) se trunque a 5.
function gAplicarRegla(v, dec, modo) {
  const k = Math.pow(10, dec), x = v * k + 1e-9;
  return (modo === 'redondeo' ? Math.round(x) : Math.floor(x)) / k;
}
function gBoleta(f) { return f == null ? null : Math.min(10, Math.max(5, gAplicarRegla(f, 0, REGLA_CALIF.trimestral))); }
function gFinalAnual(prom) { return prom == null ? null : gAplicarRegla(prom, 1, REGLA_CALIF.final); }   // promedio de las 3 boletas, con un decimal
function gAprobado(fin) { return fin != null && fin >= 6; }                                               // aprobado solo con 6.0 o más
// Calificación del trimestre con decimales, mostrada con la MISMA regla que la boleta (así nunca se ve «6.0» junto a una boleta de 5)
function gFmtCal(n, dec) { return n == null ? '—' : gAplicarRegla(n, dec == null ? 1 : dec, REGLA_CALIF.trimestral).toFixed(dec == null ? 1 : dec); }
function gAviso(msg) { alert(msg); }

// ── Almacenamiento ────────────────────────────────────────
function gClave() { const u = (typeof getUsuario === 'function') ? getUsuario() : null; return 'nem_gestion_' + ((u && (u.curp || u.nombre)) || 'anon'); }
// Criterio «Asistencia»: siempre se calcula solo con el Pase de lista (nombre exacto «Asistencia»)
function gCritDef([n, p]) { const c = { id: gId(), nombre: n, pct: p }; if (/^\s*asistencia\s*$/i.test(n)) c.auto = 'asistencia'; return c; }
function gMigrarAsistAuto(data) {
  let cambio = false;
  ((data && data.grupos) || []).forEach(g => (g.criterios || []).forEach(c => { if (!c.auto && /^\s*asistencia\s*$/i.test(c.nombre || '')) { c.auto = 'asistencia'; cambio = true; } }));
  return cambio;
}
function gCargar() {
  G.key = gClave();
  try { G.data = JSON.parse(localStorage.getItem(G.key) || 'null'); } catch (e) { G.data = null; }
  if (!G.data || !Array.isArray(G.data.grupos)) G.data = { v: 1, grupos: [] };
  gSembrarPerfil();
  if (gMigrarAsistAuto(G.data)) gGuardar();
  G.gid = G.data.grupos[0] ? G.data.grupos[0].id : null; G.gidManual = false;
  G.fecha = gHoy();
  G.borrador = null; G.sugerencias = [];
  G.trimCalif = G.trimExam = G.trimPlan = gTrimDeFecha(gHoy());
  try { gHistLeer(); } catch (e) {}   // borra del historial de exámenes lo que ya cumplió 3 días
}
function gGuardar() {
  try { localStorage.setItem(G.key, JSON.stringify(G.data)); try { localStorage.setItem(G.key + '_mod', String(Date.now())); } catch (e2) {} }
  catch (e) { gAviso('No se pudo guardar en este dispositivo (¿almacenamiento lleno o bloqueado?). Descarga un respaldo desde «Mis grupos».'); }
}
function gGrupo() { return (G.data && G.data.grupos.find(g => g.id === G.gid)) || null; }
function gCampoDe(grado, materia) {
  if (materia === 'Educación Socioemocional') materia = 'Tutoría';   // nombre anterior (grupos guardados antes)
  const cm = CAMPOS_POR_GRADO[grado] || {};
  for (const c of Object.keys(cm)) if (cm[c].includes(materia)) return c;
  return '';
}
function gDocente() { const u = getUsuario(); return u ? u.nombre : ''; }
function gPerfil() { if (!G.data.perfil) G.data.perfil = { escuela: '', cct: '', municipio: '', tipoEscuela: '', zona: '' }; return G.data.perfil; }
function gEscuela() { if (G.data) { const e = gPerfil().escuela; if (e) return e; } const u = getUsuario(); return u ? (u.escuela || '') : ''; }
// Semilla del perfil con lo que el maestro capturó al registrarse (solo si aún está vacío)
function gSembrarPerfil() {
  const u = getUsuario(); const p = gPerfil(); if (!u) return;
  if (!p.escuela && u.escuela) p.escuela = u.escuela;
  if (!p.cct && u.cct) p.cct = u.cct;
  if (!p.municipio && u.municipio) p.municipio = u.municipio;
}
// Llena los formularios de planeación y el encabezado con la escuela del maestro
function gPrefillEscuela() {
  if (!G.data) return;
  const p = gPerfil(), set = (id, v) => { const e = document.getElementById(id); if (e && v) e.value = v; };
  set('a-esc', p.escuela); set('d-esc', p.escuela); set('a-cct', p.cct); set('d-cct', p.cct); set('a-mun', p.municipio); set('d-tipoesc', p.tipoEscuela); set('d-zona', p.zona);
  const sub = document.getElementById('h-sub'); if (sub) sub.textContent = 'Fase 6 · Secundaria' + (p.escuela ? ' · ' + p.escuela : '');
}
function gGuardarPerfil() {
  const p = gPerfil();
  p.escuela = document.getElementById('gp-esc').value.trim(); p.cct = document.getElementById('gp-cct').value.trim(); p.municipio = document.getElementById('gp-mun').value.trim();
  p.estado = (document.getElementById('gp-est') || {value:''}).value.trim(); p.tipoEscuela = document.getElementById('gp-tipo').value.trim(); p.zona = document.getElementById('gp-zona').value.trim();
  const vv = id => (document.getElementById(id) || { value: '' }).value.trim(); p.director = vv('gp-dir'); p.dirWa = vv('gp-dirwa'); p.dirCorreo = vv('gp-dircorreo');
  gGuardar(); gPrefillEscuela(); gAviso('Listo: tus datos de escuela se usarán en tus planeaciones y documentos.');
}

// ── Punto de entrada ──────────────────────────────────────
function gInit() { gCargar(); if (G.tab) gRender(); }
function gOnTab(id) {
  if (typeof licOnTab === 'function' && licOnTab(id)) { G.tab = id; return; }
  const conocidas = ['inicio', 'bienvenida', 'grupos', 'lista', 'calif', 'examenes', 'trim', 'rezago', 'recup', 'calendario', 'libros', 'planes', 'bitacora', 'horario', 'escaner', 'capexamen', 'trabajos', ...Object.keys(G_PRONTO)];
  if (!conocidas.includes(id)) return;
  if (!G.data) gCargar();
  G.tab = id;
  if (id === 'lista') gAutoGrupo();
  gRender();
}
function gRender() {
  if (licTabBloqueada(G.tab)) { gPanel().innerHTML = licHTMLBloqueo(G.tab); return; }
  if (G_PRONTO[G.tab]) return gRenderProntoTab(G.tab);
  const f = { inicio: gRenderInicio, bienvenida: gRenderBienvenida, planes: gRenderPlanes, grupos: gRenderGrupos, lista: gRenderLista, calif: gRenderCalif, examenes: gRenderExamenes, trim: gRenderTrim, rezago: gRenderRezago, recup: gRenderRecup, calendario: gRenderCalendario, libros: gRenderLibros, bitacora: gRenderBitacora, horario: () => gRenderArchivos('horario'), escaner: gRenderEscaner, capexamen: gRenderCapExamen, trabajos: gRenderTrabajos }[G.tab];
  if (f) f();
}

// ── Planes y precios (dentro de la app; los mismos datos que la página suscripcion.html) ──
const G_PLANES = { correo: 'planeador.nem.docente@gmail.com', precioMes: 149, limiteIA: 60, planes: [
  { nombre: 'Mensual', meses: 1, precio: 149 },
  { nombre: 'Trimestral', meses: 3, precio: 399 },
  { nombre: 'Semestral', meses: 6, precio: 769, destacado: true },
  { nombre: 'Anual', meses: 12, precio: 1489 },
] };
function gPlanMailto(p) {
  const u = (typeof getUsuario === 'function' && getUsuario()) || {};
  const asunto = 'Quiero una licencia del Planeador Docente NEM' + (p ? ' — plan ' + p.nombre : '');
  const cuerpo = 'Hola, quiero suscribirme al Planeador Docente NEM' + (p ? ' (plan ' + p.nombre + ')' : '') + '.\n\nMi nombre: ' + (u.nombre || '') + '\nMi escuela: \nCorreo con el que entro a la app: ' + (u.email || '');
  return 'mailto:' + G_PLANES.correo + '?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
}
function gRenderPlanes() {
  const P = G_PLANES, n = x => x.toLocaleString('es-MX');
  gPanel().innerHTML = `<div class="sec-title">Planes y precios</div><div class="sec-sub">Elige cuánto tiempo quieres tu licencia. ¿Solo quieres probar un mes? El plan Mensual es para ti: no hay cobro automático ni compromiso.</div>
  <div class="g-aviso" style="margin-bottom:14px;font-size:13.5px">🎉 <b>Precio de introducción.</b> Estos precios son de lanzamiento y pueden cambiar más adelante.</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px">${P.planes.map(p => `<div style="background:#fff;border:2px solid ${p.destacado ? 'var(--azul-med)' : 'var(--borde)'};border-radius:14px;padding:18px 14px;text-align:center;${p.destacado ? 'box-shadow:0 8px 24px rgba(37,99,168,.18)' : ''}">
    ${p.destacado ? '<div style="display:inline-block;background:#dbeafe;color:var(--azul-med);font-size:11.5px;font-weight:700;border-radius:20px;padding:2px 10px;margin-bottom:6px">Más elegido</div>' : ''}
    <div style="font-size:18px;font-weight:800;color:var(--azul)">${p.nombre}</div>
    <div style="font-size:12.5px;color:var(--gris)">${p.meses === 1 ? '1 mes' : p.meses + ' meses'} de acceso</div>
    <div style="font-size:30px;font-weight:800;margin:8px 0 2px">$${n(p.precio)} <small style="font-size:13px;color:var(--gris)">MXN</small></div>
    ${p.meses > 1 ? `<div style="font-size:12.5px;color:var(--gris)">$${n(Math.round(p.precio / p.meses))} por mes</div>${P.precioMes * p.meses > p.precio ? `<div style="color:var(--verde);font-weight:700;font-size:13.5px;margin-top:4px">${p.extra || 'Ahorras'} · $${n(P.precioMes * p.meses - p.precio)}</div>` : ''}` : '<div style="font-size:12.5px;color:var(--gris)">&nbsp;</div>'}
    <a class="g-btn" style="display:inline-block;margin-top:12px;text-decoration:none" href="${gPlanMailto(p)}">Quiero este plan</a></div>`).join('')}</div>
  <div class="card" style="margin-top:14px"><div class="card-title">ℹ️ Qué incluye</div>
    <p style="font-size:13.5px;line-height:1.55;margin:0 0 8px">Planeaciones y exámenes con IA, descarga en Word, calificaciones, lista de alumnos, rezago, recuperativos, libros y programas SEP y calendario escolar.</p>
    <p style="font-size:13.5px;line-height:1.55;margin:0"><b>El uso de IA no es ilimitado:</b> cada licencia incluye hasta ${P.limiteIA} documentos con IA al mes (planeaciones y exámenes); el tope se renueva cada mes. Lista, calificaciones, rezago, libros y calendario no gastan ese tope.</p></div>
  <div class="card"><div class="card-title">🧾 Cómo suscribirte</div>
    <ol style="margin:0 0 0 20px;font-size:13.5px;line-height:1.7"><li><b>Escríbenos por correo</b> con el botón de tu plan (a <b>${P.correo}</b>).</li><li><b>Te decimos cómo pagar</b> y, al recibir el pago, te enviamos tu código <code>NEM-XXXX-XXXX-XXXX</code>.</li><li><b>Canjéalo</b> en el menú «Mi licencia». Se activa de inmediato.</li></ol>
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="g-btn" onclick="gIrA('licencia')">🔑 Ya tengo mi código</button><a class="g-btn g-btn-s" style="text-decoration:none" href="${gPlanMailto(null)}">✉️ Escribir por correo</a></div></div>`;
}

// ── Pantalla de bienvenida: la información del programa, para leerla con calma y luego continuar ──
function gRenderBienvenida() {
  const F = [['📝', 'Planeación', 'Programa analítico y plano didáctico NEM, con contenidos y PDA de la Fase 6.'], ['🧭', 'Proyectos', 'Fases, fechas y tiempos de cada proyecto.'], ['✅', 'Pase de lista', 'Asistencia, retardos y faltas en segundos.'], ['📊', 'Calificaciones', 'Tus criterios, sus porcentajes y la boleta del trimestre.'], ['🧮', 'Exámenes', 'Crea exámenes con IA y captura las calificaciones.'], ['🚦', 'Rezago y recuperativos', 'Detecta a quien está en riesgo y arma la lista de recuperativos.'], ['📚', 'Libros y programas SEP', 'Libros de texto, plan de estudio y programa sintético por campo formativo.'], ['👥', 'Mis grupos', 'Tus alumnos, tus listas y tu respaldo.']];
  const BTN = `<button type="button" onclick="navInicio()" style="display:block;width:100%;max-width:460px;background:#fbbf24;color:#14274a;border:3px solid #fff;border-radius:16px;font-size:clamp(19px,3.4vw,24px);font-weight:800;padding:18px 26px;cursor:pointer;box-shadow:0 10px 28px rgba(0,0,0,.35);letter-spacing:.01em">Entrar al programa ➜</button>`;
  gPanel().innerHTML = `<div style="background:linear-gradient(160deg,#16314f,#245a96);color:#fff;border-radius:18px;padding:28px 22px;box-shadow:var(--sombra-lg)">
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:18px"><div style="width:46px;height:46px;border-radius:13px;background:linear-gradient(135deg,#3b82c4,#2563a8);display:flex;align-items:center;justify-content:center;font-size:24px">📚</div><div><b style="font-size:16px">Planeador Docente NEM</b><div style="font-size:12px;opacity:.75">Realizado por Planeador Docente NEM · Contacto: planeador.nem.docente@gmail.com</div></div></div>
    <div style="display:inline-block;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:4px 14px;font-size:12px;font-weight:600;margin-bottom:14px">Nueva Escuela Mexicana · Fase 6 · Secundaria</div>
    <h1 style="font-size:clamp(24px,4vw,36px);line-height:1.15;margin-bottom:12px">Planea, pasa lista y evalúa <span style="color:#7dd3fc">en un solo lugar.</span></h1>
    <p style="font-size:15.5px;line-height:1.6;opacity:.92;max-width:680px;margin-bottom:20px">Programa analítico, plano didáctico, proyectos con fechas y tiempos, pase de lista, calificaciones y exámenes. Hecho por un maestro de secundaria, para maestros de secundaria.</p>
    <div style="margin-bottom:22px">${BTN}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin-bottom:20px">${F.map(([i, t, d]) => `<div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:12px"><div style="font-size:24px">${i}</div><b style="font-size:14px">${t}</b><div style="font-size:12.5px;opacity:.8;margin-top:2px;line-height:1.35">${d}</div></div>`).join('')}</div>
    <div style="font-size:13px;opacity:.8;margin-bottom:18px">🔒 Los datos de tus alumnos se guardan solo en tu dispositivo. Haz tu respaldo desde «Mis grupos».</div>
    ${BTN}
    <button type="button" onclick="gIrA('planes')" style="margin-top:14px;background:transparent;border:2px solid rgba(255,255,255,.6);color:#fff;font-weight:600;font-size:14px;border-radius:12px;padding:11px 18px;cursor:pointer">💳 Ver planes y precios</button>
  </div>`;
}

// ── Calendario escolar: se suben los archivos que da la escuela (PDF o imagen) ──
function gIdb() {
  return new Promise((ok, mal) => {
    if (!window.indexedDB) return mal(new Error('Este navegador no permite guardar archivos.'));
    const r = indexedDB.open('nem_archivos', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('cal', { keyPath: 'id' });
    r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error);
  });
}
async function gCalLista(cat) {
  cat = cat || 'cal';
  const db = await gIdb();
  return new Promise((ok, mal) => { const q = db.transaction('cal').objectStore('cal').getAll(); q.onsuccess = () => ok((q.result || []).filter(x => x.cuenta === G.key && (x.cat || 'cal') === cat).sort((a, b) => a.t - b.t)); q.onerror = () => mal(q.error); });
}
async function gCalPoner(rec) { const db = await gIdb(); return new Promise((ok, mal) => { const q = db.transaction('cal', 'readwrite').objectStore('cal').put(rec); q.onsuccess = ok; q.onerror = () => mal(q.error); }); }
async function gCalQuitarArchivo(id, cat) { cat = cat || 'cal'; if (!confirm('¿Quitar este archivo?')) return; const db = await gIdb(); db.transaction('cal', 'readwrite').objectStore('cal').delete(id).onsuccess = () => gRenderArchivos(cat); }
async function gCalSubir(inp, cat) {
  cat = cat || 'cal';
  const fs = [...inp.files]; inp.value = ''; if (!fs.length) return;
  const msg = document.getElementById('gcal-msg'); let n = 0, mal = [];
  for (const f of fs) {
    const esPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name), esImg = /^image\/(png|jpe?g|webp|heic)/i.test(f.type) || /\.(png|jpe?g|webp|heic)$/i.test(f.name);
    if (!esPdf && !esImg) { mal.push(`«${f.name}»: solo se aceptan PDF, JPG o PNG`); continue; }
    if (f.size > 15 * 1024 * 1024) { mal.push(`«${f.name}»: pesa más de 15 MB`); continue; }
    try { await gCalPoner({ id: gId(), cuenta: G.key, cat, nombre: f.name, tipo: esPdf ? 'pdf' : 'img', mime: esPdf ? 'application/pdf' : (f.type || 'image/jpeg'), blob: f, t: Date.now(), leido: cat === 'horario' }); n++; }
    catch (e) { mal.push(`«${f.name}»: no se pudo guardar (${e.message || 'error'})`); }
  }
  await gRenderArchivos(cat);
  const m2 = document.getElementById('gcal-msg'); if (m2) m2.innerHTML = (n ? `<span style="color:var(--verde)">✓ Se guardó ${n} archivo(s).</span> ` : '') + mal.map(x => `<span class="g-mal">${gEsc(x)}</span>`).join('<br>');
  if (cat === 'horario' && n) {
    const arch = fs.find(f => (f.type === 'application/pdf' || /\.pdf$/i.test(f.name) || /^image\/(png|jpe?g|webp)/i.test(f.type) || /\.(png|jpe?g|webp)$/i.test(f.name)) && f.size <= 15 * 1024 * 1024);
    if (arch) await gHorarioLeerFoto(arch, true);
  }
}
// ── Horario semanal escrito por el maestro (tabla editable, como el horario impreso) ──
const G_HDIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi'];
function gHorario() {
  if (!G.data.horario) G.data.horario = { mods: [['07:00', '07:50'], ['07:50', '08:40'], ['08:40', '09:30'], ['09:30', '10:20'], ['10:20', '10:40', 'rec'], ['10:40', '11:30'], ['11:30', '12:20'], ['12:20', '13:10']], c: {} };
  return G.data.horario;
}
function gHorarioNum(i) { return gHorario().mods.slice(0, i + 1).filter(m => m[2] !== 'rec').length; }   // número de módulo (el descanso no cuenta)
// Color de cada grupo (como la barrita de color del horario impreso). La IA copia los de tu foto; si no hay, se asigna uno fijo por grupo.
const G_HCOL = { celeste: '#06b6d4', morado: '#9b59b6', verde: '#4caf50', naranja: '#f97316', rojo: '#ef4444', amarillo: '#eab308', rosa: '#ec4899', azul: '#3b82f6', gris: '#6b7280', cafe: '#92400e' };
function gHorarioClave(txt) {
  const p = String(txt || '').split(/\s*[·|\/]\s*/).filter(Boolean); if (!p.length) return '';
  return gNorm(p.find(x => /^\d+\s*[°º]?\s*[A-Za-z]?$/.test(x.trim())) || p[p.length - 1]);
}
// Da un color distinto (y fijo) a cada grupo que todavía no lo tiene, evitando repetir los que ya se usan
function gHorarioAsignarColores() {
  const H = gHorario(); if (!H.gc) H.gc = {};
  const nombres = Object.keys(G_HCOL), usados = new Set(Object.values(H.gc).filter(n => G_HCOL[n]));
  let cambio = false;
  [...new Set(Object.values(H.c).map(gHorarioClave).filter(Boolean))].sort().forEach(k => {
    if (H.gc[k] && G_HCOL[H.gc[k]]) return;
    const libre = nombres.find(n => !usados.has(n)) || nombres[usados.size % nombres.length];
    H.gc[k] = libre; usados.add(libre); cambio = true;
  });
  return cambio;
}
function gHorarioColor(txt) {
  const k = gHorarioClave(txt); if (!k) return '';
  const n = (gHorario().gc || {})[k]; return n && G_HCOL[n] ? G_HCOL[n] : '';
}
function gHorarioCelda(m, d, v, el) {
  gHorario().c[m + '-' + d] = v.trim(); gHorarioAsignarColores(); gGuardar();
  if (el) { const c = gHorarioColor(v); el.style.borderLeft = c ? '6px solid ' + c : '1.5px solid var(--borde)'; }
}
function gHorarioHora(m, i, v) { gHorario().mods[m][i] = v.trim(); gGuardar(); }
function gHorarioFila(accion) {
  const H = gHorario();
  if (accion === 'mas') H.mods.push(['', '']);
  else if (accion === 'rec') H.mods.push(['', '', 'rec']);
  else if (H.mods.length > 1) { if (!confirm('¿Quitar la última fila del horario?')) return; const m = H.mods.length - 1; H.mods.pop(); G_HDIAS.forEach((x, d) => delete H.c[m + '-' + d]); }
  gGuardar(); gRenderArchivos('horario');
}
function gHorarioLimpiar() { if (!confirm('¿Borrar todo lo escrito en la tabla del horario?')) return; gHorario().c = {}; gGuardar(); gRenderArchivos('horario'); }
function gHorarioHTML() {
  if (gHorarioAsignarColores()) gGuardar();
  const H = gHorario(), ci = 'padding:7px;border:1.5px solid var(--borde);border-radius:6px;width:100%;min-width:0;box-sizing:border-box';
  const opts = []; (G.data.grupos || []).forEach(g => opts.push(g.materia + ' · ' + g.nombre));
  const hora = (i, m) => `<input value="${gEsc(m[0])}" onchange="gHorarioHora(${i},0,this.value)" placeholder="07:00" style="${ci};width:56px;display:inline-block;text-align:center;padding:5px"> <span style="color:var(--gris)">–</span> <input value="${gEsc(m[1])}" onchange="gHorarioHora(${i},1,this.value)" placeholder="07:50" style="${ci};width:56px;display:inline-block;text-align:center;padding:5px">`;
  return `<div class="card"><div class="card-title">⌨️ Escribe tu horario</div>
    <p style="font-size:13px;color:var(--gris);margin:0 0 10px">Escribe en cada celda la materia y el grupo, separados por un punto medio (por ejemplo «Biología · 1° C»). Si ya creaste tus grupos, te los sugiere al escribir. Puedes cambiar las horas, agregar filas y poner el descanso. Cada grupo lleva su color. Se guarda solo. <b>¿Tienes tu horario en foto o PDF?</b> Súbelo abajo y la tabla se llena sola.</p>
    <datalist id="gh-dl">${opts.map(o => `<option value="${gEsc(o)}">`).join('')}</datalist>
    <div style="overflow-x:auto"><table style="border-collapse:separate;border-spacing:4px;min-width:760px;width:100%">
      <tr><td style="font-weight:700;font-size:12.5px;text-align:center;color:var(--azul)">No. / hora</td>${G_HDIAS.map(d => `<td style="font-weight:700;font-size:12.5px;text-align:center;color:var(--azul)">${d}</td>`).join('')}</tr>
      ${H.mods.map((m, i) => m[2] === 'rec'
        ? `<tr><td style="white-space:nowrap;width:150px"><b style="font-size:12px">REC</b> ${hora(i, m)}</td><td colspan="5" style="text-align:center;font-weight:700;font-size:12.5px;background:#f1f5f9;border-radius:6px;padding:8px;color:var(--gris-oscuro)">DESCANSO</td></tr>`
        : `<tr><td style="white-space:nowrap;width:150px"><b style="font-size:13px">${gHorarioNum(i)}</b> ${hora(i, m)}</td>
        ${G_HDIAS.map((d, j) => `<td><input list="gh-dl" value="${gEsc(H.c[i + '-' + j] || '')}" onchange="gHorarioCelda(${i},${j},this.value,this)" style="${ci};${gHorarioColor(H.c[i + '-' + j]) ? 'border-left:6px solid ' + gHorarioColor(H.c[i + '-' + j]) : ''}"></td>`).join('')}</tr>`).join('')}
    </table></div>
    <div style="margin-top:10px"><button class="g-btn g-btn-s" onclick="gHorarioFila('mas')">＋ Agregar clase</button> <button class="g-btn g-btn-s" onclick="gHorarioFila('rec')">＋ Agregar descanso</button> <button class="g-btn g-btn-s" onclick="gHorarioFila('menos')">－ Quitar última fila</button> <button class="g-btn g-btn-s" onclick="gHorarioLimpiar()">Borrar todo</button>
      <button class="g-btn" onclick="gHorarioImprimir()">🖨️ Imprimir / PDF</button> <button class="g-btn g-btn-s" onclick="gHorarioWord()">⬇ Word</button></div></div>`;
}
function gHorarioDoc() {
  if (gHorarioAsignarColores()) gGuardar();
  const H = gHorario(), C = '#233b6e', bd = 'border:1px solid #6b7280';
  const th = `${bd};background:${C};color:#fff;font-weight:bold;font-size:11pt;padding:7px;text-align:center`;
  const celda = v => { v = String(v || ''); if (!v) return '<span style="color:#bbb">–</span>'; const [a, ...r] = v.split(/\s*[·|\/]\s*/); return `<b style="font-size:13pt">${gEsc(a)}</b>${r.length ? '<br><span style="font-size:11pt">' + gEsc(r.join(' · ')) + '</span>' : ''}`; };
  const enc = typeof bitEnc === 'function' ? bitEnc() : `<p style="text-align:center"><b>${gEsc(gEscuela())}</b></p>`;
  return `${enc}<p style="text-align:center;margin:0 0 10px;font-size:18pt;font-weight:bold;color:${C}">${gEsc(gDocente()).toUpperCase()}</p>
  <table style="width:100%;border-collapse:collapse"><tr><td style="${th};width:80px">No.</td>${G_HDIAS.map(d => `<td style="${th}">${d}</td>`).join('')}</tr>
  ${H.mods.map((m, i) => m[2] === 'rec'
    ? `<tr><td style="${bd};text-align:center;padding:8px;height:36px"><b style="font-size:10pt">REC</b><br><span style="font-size:9pt">${gEsc(m[0])}-${gEsc(m[1])}</span></td><td colspan="5" style="${bd};text-align:center;font-weight:bold;font-size:10pt">DESCANSO</td></tr>`
    : `<tr><td style="${bd};text-align:center;padding:8px;height:52px"><b style="font-size:13pt">${gHorarioNum(i)}</b><br><span style="font-size:9pt">${gEsc(m[0])}${m[0] || m[1] ? '-' : ''}${gEsc(m[1])}</span></td>${G_HDIAS.map((d, j) => { const cc = gHorarioColor(H.c[i + '-' + j]); return `<td style="${bd};text-align:center;padding:6px${cc ? ';border-left:8px solid ' + cc : ''}">${celda(H.c[i + '-' + j])}</td>`; }).join('')}</tr>`).join('')}</table>`;
}
function gHorarioImprimir() { if (typeof bitVentana === 'function') bitVentana('Horario semanal', gHorarioDoc()); }
function gHorarioWord() { descargarWord(gHorarioDoc(), 'Horario_semanal.doc'); }

// ── Foto del horario → tabla (la IA solo transcribe; el maestro revisa) ──
function gHorarioMsg(html) { const m = document.getElementById('gcal-msg'); if (m) m.innerHTML = html; }
function gHorarioTieneDatos() { return Object.values(gHorario().c || {}).some(v => v); }
// Pasa lo leído a la tabla. Si la materia·grupo coincide con un grupo ya creado, usa el nombre exacto de ese grupo.
function gHorarioAplicar(res) {
  const H = gHorario(), mods = [], c = {}, gc = {};
  (res.modulos || []).forEach((m, i) => {
    mods.push(m.descanso ? [m.inicio || '', m.fin || '', 'rec'] : [m.inicio || '', m.fin || '']);
    if (m.descanso) return;
    (m.celdas || []).slice(0, 5).forEach((t, d) => {
      t = String(t || '').trim(); if (!t) return;
      const k = gHorarioClave(t), col = m.colores && m.colores[d];
      if (k && col && G_HCOL[col] && !gc[k]) gc[k] = col;   // el color del grupo, tal como se ve en la foto
      const g = gHorarioGrupo(t); c[i + '-' + d] = g ? g.materia + ' · ' + g.nombre : t;
    });
  });
  if (!mods.length) return false;
  H.mods = mods; H.c = c; H.gc = gc; gHorarioAsignarColores(); gGuardar(); return true;
}
// Aviso flotante arriba de la pantalla (se ve aunque el maestro esté viendo la tabla)
function gHorarioToast(html, ms, mal) {
  let t = document.getElementById('hor-toast');
  if (!html) { if (t) t.remove(); return; }
  if (!t) { t = document.createElement('div'); t.id = 'hor-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.style.cssText = 'position:fixed;top:84px;left:50%;transform:translateX(-50%);z-index:99998;max-width:min(560px,92vw);padding:12px 18px;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.28);font-size:14px;line-height:1.45;text-align:center;color:#fff;background:' + (mal ? '#b91c1c' : '#1e3a5f');
  t.innerHTML = html;
  clearTimeout(t._t); if (ms) t._t = setTimeout(() => { const x = document.getElementById('hor-toast'); if (x) x.remove(); }, ms);
}
async function gHorarioLeerFoto(file, auto) {
  if (typeof workerFetch !== 'function' || typeof escReducir !== 'function') return;
  // Aviso de privacidad: la foto o el PDF se envía a la IA (se pide confirmar una vez en este dispositivo)
  let avisado = false; try { avisado = localStorage.getItem('nem_priv_horario') === '1'; } catch (e) { /* sin almacenamiento */ }
  if (!avisado) {
    if (!confirm('🔒 Para leer tu horario, la foto o el PDF se envía a la IA.\n\nNo envíes documentos que tengan nombres de alumnos (listas, boletas, registros). Solo debe verse tu horario.\n\n¿Es solo tu horario?\nAceptar = enviar.\nCancelar = no enviar.')) { gHorarioMsg('<span style="color:var(--gris)">No envié nada. Si quieres, escribe tu horario a mano en la tabla.</span>'); return; }
    try { localStorage.setItem('nem_priv_horario', '1'); } catch (e) { /* sin almacenamiento */ }
  }
  // Si ya hay un horario escrito, se pregunta ANTES de leer (para no hacerlo esperar y luego decirle que se reemplaza)
  if (gHorarioTieneDatos() && !confirm('Ya tienes un horario escrito en la tabla.\n\nSi sigues, se va a REEMPLAZAR con lo que la IA lea de tu foto o PDF (tarda de 10 a 30 segundos).\n\n¿Continuar?')) { gHorarioMsg('<span style="color:var(--gris)">Dejé tu tabla como estaba. Cuando quieras, pulsa «✨ Pasar a la tabla».</span>'); return; }
  gHorarioMsg('<span style="color:var(--azul)">🔎 Leyendo tu horario con IA… (puede tardar unos segundos)</span>');
  const t0 = Date.now(), pintar = () => gHorarioToast(`⏳ Leyendo tu horario con IA… <b>${Math.round((Date.now() - t0) / 1000)} s</b><br><span style="font-size:12.5px;opacity:.85">Suele tardar de 10 a 30 segundos. No cierres esta pantalla.</span>`);
  pintar(); const reloj = setInterval(pintar, 1000);
  try {
    const esPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
    let imagen;
    if (esPdf) {
      const b64 = await new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1] || ''); r.onerror = () => mal(new Error('No se pudo abrir el PDF.')); r.readAsDataURL(file); });
      if (b64.length > 2400000) throw new Error('Este PDF pesa demasiado para leerlo. Súbelo como foto o captura de pantalla (JPG o PNG).');
      imagen = { mime: 'application/pdf', data: b64 };
    } else { const im = await escReducir(file); imagen = { mime: 'image/jpeg', data: im.data }; }
    let data, ultimo;
    for (let i = 0; i < 2; i++) { try { data = await workerFetch('/v1/horario-foto', { metodo: 'POST', body: { imagen } }); break; } catch (e) { ultimo = e; if (e.reintentar && i < 1) { await esperar(3000); continue; } throw e; } }
    const res = data && data.resultado; if (!res || !res.modulos || !res.modulos.length) throw new Error('No se pudo leer el horario de la foto.');
    gHorarioAplicar(res);
    const dudas = (res.dudas || []).length ? ` La IA no estuvo segura de: <b>${res.dudas.map(gEsc).join(', ')}</b>.` : '';
    await gRenderArchivos('horario');
    gHorarioMsg(`<span style="color:var(--verde)">✓ Listo: pasé tu horario a la tabla de arriba.</span> <b>Revísalo contra tu foto</b> y corrige lo que haga falta; todo se guarda solo.${dudas}`);
    gHorarioToast('✅ Listo: ya pasé tu horario a la tabla.<br><span style="font-size:12.5px;opacity:.9">Revísalo contra tu foto y corrige lo que haga falta.</span>', 7000);
  } catch (e) {
    const t = (typeof licMensajeIA === 'function' && e.codigo ? licMensajeIA(e) : e.message) || 'No se pudo leer la foto.';
    gHorarioMsg(`<span class="g-mal">${gEsc(t)}</span> <span style="color:var(--gris)">Puedes escribir tu horario a mano en la tabla.</span>`);
    gHorarioToast('⚠️ ' + gEsc(t) + '<br><span style="font-size:12.5px;opacity:.9">Puedes escribir tu horario a mano en la tabla.</span>', 12000, true);
  } finally { clearInterval(reloj); }
}
async function gHorarioDesdeArchivo(id) {
  const f = (await gCalLista('horario')).find(x => x.id === id); if (!f) return;
  await gHorarioLeerFoto(f.blob, false);
}

// Archivos que el maestro sube y consulta dentro de la app (PDF, JPG o PNG), guardados en este dispositivo
const G_ARCH = {
  cal: { tit: 'Calendario escolar', sub: 'Sube el calendario que te da tu escuela (PDF o foto) para tenerlo a la mano dentro de la app.', btn: '📎 Subir calendario', multi: 'Puedes subir varios, por ejemplo uno por trimestre o una hoja por mes.', vacio: 'Todavía no has subido tu calendario escolar.' },
  horario: { tit: 'Horario semanal', sub: 'Escribe tu horario en la tabla o sube una foto: la IA lo pasa a la tabla por ti. También puedes subir un PDF para tenerlo a la mano.', btn: '📎 O sube tu horario como archivo', antes: gHorarioHTML, multi: 'Si tu horario cambia, sube el nuevo y quita el anterior.', vacio: 'Todavía no has subido tu horario.' }
};
function gRenderCalendario() { return gRenderArchivos('cal'); }
async function gRenderArchivos(cat) {
  const C = G_ARCH[cat], p = gPanel(); if (!p) return;
  let lista = [], err = '';
  try { lista = await gCalLista(cat); } catch (e) { err = e.message; }
  (window.__calUrls || []).forEach(u => URL.revokeObjectURL(u)); window.__calUrls = [];
  const url = b => { const u = URL.createObjectURL(b); window.__calUrls.push(u); return u; };
  p.innerHTML = `<div class="sec-title">${C.tit}</div><div class="sec-sub">${C.sub}</div>
  ${C.antes ? C.antes() : ''}
  <div class="card"><div class="card-title">${C.btn}</div>
    ${cat === 'horario' ? '<div class="g-aviso" style="margin-bottom:10px;font-size:13px">🔒 <b>Privacidad:</b> para pasar tu horario a la tabla, la foto o el PDF se envía a la IA. <b>No fotografíes ni subas documentos que tengan nombres de alumnos</b> (listas, boletas, registros): sube solo tu horario.</div>' : ''}
    <p style="font-size:13px;color:var(--gris);margin:0 0 10px">Acepta <b>PDF</b>, <b>JPG</b> o <b>PNG</b> (hasta 15 MB cada uno). ${C.multi} Desde el celular también puedes tomarle una foto.</p>
    <label class="g-btn" style="display:inline-block;cursor:pointer">⬆ Subir archivo (PDF, JPG o PNG)<input type="file" accept="application/pdf,image/*,.pdf,.png,.jpg,.jpeg" multiple style="display:none" onchange="gCalSubir(this,'${cat}')"></label>
    <div id="gcal-msg" style="font-size:13px;margin-top:10px">${err ? `<span class="g-mal">${gEsc(err)}</span>` : ''}</div>
    <div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-top:8px">Los archivos se guardan <b>en este dispositivo</b> (igual que tus grupos). Si usas otra computadora o celular, súbelo ahí también.</div></div>
  ${lista.length ? lista.map(f => `<div class="card"><div class="card-title" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${f.tipo === 'pdf' ? '📄' : '🖼️'} <span style="flex:1;min-width:0;word-break:break-word">${gEsc(f.nombre)}</span>
      <a class="g-btn g-btn-s" href="${url(f.blob)}" target="_blank" rel="noopener" style="text-decoration:none">Abrir grande</a>
      <a class="g-btn g-btn-s" href="${url(f.blob)}" download="${gEsc(f.nombre)}" style="text-decoration:none">⬇ Descargar</a>
      ${cat === 'horario' ? `<button class="g-btn g-btn-p" onclick="gHorarioDesdeArchivo('${f.id}')">✨ Pasar a la tabla</button>` : ''}
      <button class="g-btn g-btn-x" onclick="gCalQuitarArchivo('${f.id}','${cat}')">Quitar</button></div>
      ${f.tipo === 'pdf' ? `<iframe src="${url(f.blob)}" style="width:100%;height:70vh;border:1px solid var(--borde);border-radius:10px" title="${gEsc(f.nombre)}"></iframe>` : `<img src="${url(f.blob)}" alt="${gEsc(f.nombre)}" style="max-width:100%;border:1px solid var(--borde);border-radius:10px">`}</div>`).join('') : `<div class="card g-vacio">${C.vacio}</div>`}`;
  // Horario ya subido pero todavía sin pasar a la tabla: se lee solo (una sola vez por archivo)
  if (cat === 'horario' && !gHorarioTieneDatos()) {
    const pend = lista.find(f => !f.leido);
    if (pend) { try { await gCalPoner(Object.assign({}, pend, { leido: true })); } catch (e) { return; } gHorarioLeerFoto(pend.blob, true); }
  }
}

// ── Libros de texto y programas de la SEP (enlaces oficiales) ──
const G_LIBROS_CICLO = 2026;   // Ciclo escolar 2026-2027 en el catálogo de la CONALITEG
const G_LIBROS = [[1, "S0LPM", "Un libro sin recetas para la maestra y el maestro. Fase 6. Secundaria"], [1, "S1ETA", "Colección Ximhai. Ética, naturaleza y sociedades. Primer grado"], [1, "S1HPA", "Historia del pueblo mexicano. Multigrado"], [1, "S1HUA", "Colección Ximhai. De lo humano y lo comunitario. Primer grado"], [1, "S1INA", "Uérakua anapu uantakua. Projects and Readings. First grade. Secondary"], [1, "S1LEA", "Colección Ximhai. Lenguajes. Primer grado"], [1, "S1MLA", "Colección Ximhai. Múltiples lenguajes. Primer grado"], [1, "S1NLA", "Colección Ximhai. Nuestro libro de proyectos. Primer grado de secundaria"], [1, "S1SAA", "Colección Ximhai. Saberes y pensamiento científico. Primer grado"], [2, "S0LPM", "Un libro sin recetas para la maestra y el maestro. Fase 6. Secundaria"], [2, "S2ETA", "Colección Sk'asolil. Ética, naturaleza y sociedades. Segundo grado"], [2, "S2HUA", "Colección Sk'asolil. De lo humano y lo comunitario. Segundo grado"], [2, "S2INA", "Uérakua anapu uantakua. Projects and Readings. Second grade. Secondary"], [2, "S2LEA", "Colección Sk'asolil. Lenguajes. Segundo grado"], [2, "S2MLA", "Colección Sk'asolil. Múltiples lenguajes. Segundo grado"], [2, "S2NLA", "Colección Sk'asolil. Nuestro libro de proyectos. Segundo grado"], [2, "S2SAA", "Colección Sk'asolil. Saberes y pensamiento científico. Segundo grado"], [3, "S0LPM", "Un libro sin recetas para la maestra y el maestro. Fase 6. Secundaria"], [3, "S3ETA", "Colección Nanahuatzin. Ética, naturaleza y sociedades. Tercer grado"], [3, "S3HUA", "Colección Nanahuatzin. De lo humano y lo comunitario. Tercer grado"], [3, "S3INA", "Uérakua anapu uantakua. Projects and Readings. Third grade. Secondary"], [3, "S3LEA", "Colección Nanahuatzin. Lenguajes. Tercer grado"], [3, "S3MLA", "Colección Nanahuatzin. Múltiples lenguajes. Tercer grado"], [3, "S3NLA", "Colección Nanahuatzin. Nuestro libro de proyectos. Tercer grado"], [3, "S3SAA", "Colección Nanahuatzin. Saberes y pensamiento científico. Tercer grado"]];
const G_LIBROS_URL = c => `https://libros.conaliteg.gob.mx/pdf-reader/reader.html?nivel=secundaria&ciclo=${G_LIBROS_CICLO}&clave=${c}`;
const G_LIBROS_PORTADA = c => `https://libros.conaliteg.gob.mx/${G_LIBROS_CICLO}/m/${c}/000.jpg`;
// Documentos propios de la app (carpeta docs/): se abren sin salir de la app
const G_DOCS = [
  ['📗', 'Plan de Estudio 2022', 'Plan de Estudio para la Educación Preescolar, Primaria y Secundaria (200 páginas).', 'docs/plan-de-estudio-2022.pdf', '3.2 MB'],
  ['📘', 'Programa sintético · Fase 6 (secundaria)', 'Contenidos y procesos de desarrollo de aprendizaje (PDA) de 1.º a 3.º (136 páginas).', 'docs/programa-sintetico-fase6.pdf', '3.0 MB'],
];
// Programa sintético Fase 6: páginas de cada campo formativo [clave, nombre, prefijo normalizado, icono, desde, hasta, materias, archivo]
const G_CAMPOS_PROG = [
  ['lenguajes', 'Lenguajes', 'lenguajes', '🗣️', 29, 53, 'Español · Lenguas indígenas · Inglés · Artes', 'docs/programa-f6-campo-lenguajes.pdf'],
  ['saberes', 'Saberes y pensamiento científico', 'saberes', '🔬', 55, 72, 'Matemáticas · Biología · Física · Química', 'docs/programa-f6-campo-saberes.pdf'],
  ['etica', 'Ética, naturaleza y sociedades', 'etica', '🌎', 75, 107, 'Geografía · Historia · Formación Cívica y Ética', 'docs/programa-f6-campo-etica.pdf'],
  ['humano', 'De lo humano y lo comunitario', 'de lo humano', '🤝', 109, 119, 'Tecnología · Tutoría (Educ. Socioemocional) · Educación Física', 'docs/programa-f6-campo-humano.pdf'],
];
const G_OTRAS_PROG = [
  ['Introducción y elementos curriculares', 11, 13, 'docs/programa-f6-intro-elementos.pdf'],
  ['Panorama de los contenidos de la Fase 6', 14, 27, 'docs/programa-f6-panorama-contenidos.pdf'],
  ['El Programa Analítico', 121, 124, 'docs/programa-f6-programa-analitico.pdf'],
  ['Reflexiones sobre la evaluación formativa', 125, 126, 'docs/programa-f6-evaluacion-formativa.pdf'],
  ['Materiales de apoyo para el diseño de actividades didácticas', 129, 134, 'docs/programa-f6-materiales-apoyo.pdf'],
];
const G_PROGRAMAS = [
  ['📘', 'Programa sintético · Fase 6 · edición 2025 (SEP)', 'Edición más reciente publicada por la SEP, por si necesitas compararla.', 'https://educacionbasica.sep.gob.mx/wp-content/uploads/2025/Plan_y_programas_de_estudio_2025/WEB%20FASE%206-2025.pdf', 'PDF · pesa unos 70 MB'],
  ['📗', 'Plan de Estudio 2025 (SEP)', 'Documento general del plan de estudio de educación básica.', 'https://educacionbasica.sep.gob.mx/wp-content/uploads/2025/Plan_y_programas_de_estudio_2025/Plan%20de%20Estudio%202025%20-WEB-.pdf', 'PDF'],
  ['🗂️', 'Todos los programas sintéticos', 'Página oficial con los programas de todas las fases.', 'https://educacionbasica.sep.gob.mx/programas-sinteticos/', 'Sitio de la SEP'],
  ['🧭', 'Marco curricular y planes', 'Marco curricular de la Nueva Escuela Mexicana.', 'https://www.sep.gob.mx/marcocurricular/', 'Sitio de la SEP'],
  ['📚', 'Catálogo completo de libros de texto', 'Todos los libros gratuitos de secundaria en la CONALITEG.', 'https://libros.conaliteg.gob.mx/secundaria.html', 'Sitio de la CONALITEG'],
];
// Abre libros y documentos en una ventana aparte: al cerrarla no se cierra el Planeador
function gAbrirVentana(url) {
  try {
    const w = window.open(url, '_blank', 'popup=yes,width=1150,height=850,left=60,top=40,resizable=yes,scrollbars=yes');
    if (!w) return true;            // el navegador la bloqueó: se abre como pestaña normal
    try { w.opener = null; } catch (e) {}
    return false;
  } catch (e) { return true; }
}
function gDocsHTML(nc) {
  const COMPLETO = 'docs/programa-sintetico-fase6.pdf';
  const btn = (href, txt, pri, dl) => `<a href="${href}" ${dl ? 'download' : 'target="_blank" rel="noopener" onclick="return gAbrirVentana(this.href)"'} class="g-btn ${pri ? 'g-btn-p' : 'g-btn-s'}" style="text-decoration:none;display:inline-block">${txt}</a>`;
  const pg = (a, b) => a === b ? `p. ${a}` : `pp. ${a}–${b}`;
  const campos = G_CAMPOS_PROG.slice().sort((x, y) => (nc && nc.startsWith(y[2]) ? 1 : 0) - (nc && nc.startsWith(x[2]) ? 1 : 0));
  return `<div class="card"><div class="card-title">📘 Plan de estudio y programa sintético · Fase 6</div>
    ${G_DOCS.map(([ic, t, d, u, n]) => `<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;border:1.5px solid var(--borde);border-radius:12px;padding:10px 12px;margin-bottom:8px;background:#fff"><span style="font-size:26px">${ic}</span><span style="flex:1;min-width:200px"><b style="font-size:14px">${t}</b><br><span style="font-size:12.5px;color:var(--gris)">${d}</span></span>${btn(u, 'Abrir', true)} ${btn(u, '⬇ Descargar · ' + n, false, true)}</div>`).join('')}
  </div>
  <div class="card"><div class="card-title">🧭 Programa sintético por campo formativo</div>
    <p style="font-size:12.5px;color:var(--gris);margin:0 0 10px">Cada botón te lleva <b>solo a las páginas de tu campo formativo</b>, sin buscar en todo el programa. También puedes abrir el programa completo en esa misma página.${nc ? ' ⭐ Primero va el campo de tu grupo.' : ''}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px">${campos.map(([k, nom, pre, ic, a, b, mats, f]) => { const propio = nc && nc.startsWith(pre); return `<div style="border:1.5px solid ${propio ? 'var(--azul-med)' : 'var(--borde)'};border-radius:12px;padding:12px;background:#fff">
      <div style="font-size:26px">${ic}</div><b style="font-size:14px">${propio ? '⭐ ' : ''}${nom}</b>
      <div style="font-size:12.5px;color:var(--gris);margin:4px 0 2px">${mats}</div>
      <div style="font-size:12px;color:var(--gris);margin-bottom:10px">${pg(a, b)} del programa · ${b - a + 1} páginas</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${btn(f, 'Abrir solo estas páginas', true)} ${btn(COMPLETO + '#page=' + a, 'Ver en el programa completo', false)} ${btn(f, '⬇', false, true)}</div></div>`; }).join('')}</div>
    <div style="font-size:13px;font-weight:700;margin:16px 0 8px">Otras secciones del programa</div>
    ${G_OTRAS_PROG.map(([t, a, b, f]) => `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;border-top:1px solid var(--borde);padding:8px 0"><span style="flex:1;min-width:200px;font-size:13.5px"><b>${t}</b> <small style="color:var(--gris)">· ${pg(a, b)}</small></span>${btn(f, 'Abrir', false)} ${btn(COMPLETO + '#page=' + a, 'En el programa completo', false)}</div>`).join('')}
  </div>`;
}
function gLibrosGrado(v) { G.libGrado = +v; gRenderLibros(); }
function gRenderLibros() {
  const g = gGrupo();
  const gr = G.libGrado || (g && +g.grado) || 1;
  const norm = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  let campo = ''; try { if (g) campo = gCampoDe(g.grado, g.materia) || ''; } catch (e) {}
  const nc = norm(campo);
  const propio = t => { if (!nc) return false; const n = norm(t); if (/multiples/.test(n)) return false;
    return nc.startsWith('lenguajes') ? /lenguajes\. /.test(n) : nc.startsWith('saberes') ? /saberes/.test(n) : nc.startsWith('etica') ? /etica,/.test(n) : nc.startsWith('de lo humano') ? /de lo humano/.test(n) : false; };
  const libros = G_LIBROS.filter(b => b[0] === gr).sort((a, b) => (propio(b[2]) ? 1 : 0) - (propio(a[2]) ? 1 : 0));
  gPanel().innerHTML = `<div class="sec-title">Libros y programas SEP</div><div class="sec-sub">Abre el plan de estudio, el programa sintético y los libros de texto gratuitos sin salir a buscarlos.</div>
  ${gDocsHTML(nc)}
  <div class="card"><div class="card-title">📚 Libros de texto gratuitos — ciclo 2026-2027</div>
    <div class="g-trims">${[1, 2, 3].map(x => `<button class="ttab${gr === x ? ' on' : ''}" onclick="gLibrosGrado(${x})">${x}.º grado</button>`).join('')}</div>
    ${campo && g ? `<p style="font-size:12.5px;color:var(--gris);margin:0 0 10px">⭐ Primero va el libro del campo de tu grupo (<b>${gEsc(campo)}</b>, ${gEsc(g.materia)}). Los demás son de los otros campos formativos.</p>` : ''}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px">${libros.map(b => `<a href="${G_LIBROS_URL(b[1])}" target="_blank" rel="noopener" onclick="return gAbrirVentana(this.href)" style="text-decoration:none;color:inherit;border:1.5px solid ${propio(b[2]) ? 'var(--azul-med)' : 'var(--borde)'};border-radius:12px;padding:8px;display:block;background:#fff">
      <img src="${G_LIBROS_PORTADA(b[1])}" alt="" loading="lazy" onerror="this.style.display='none'" style="width:100%;border-radius:8px;display:block;margin-bottom:6px;background:#f1f5f9;min-height:60px">
      <div style="font-size:12.5px;font-weight:600;line-height:1.3">${propio(b[2]) ? '⭐ ' : ''}${gEsc(b[2])}</div></a>`).join('')}</div>
    <div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-top:12px">Los libros salen del catálogo oficial de la CONALITEG. Si un libro no abre, entra a «Catálogo completo de libros de texto» más abajo.</div></div>
  <div class="card"><div class="card-title">📘 Programas y planes de estudio</div>
    ${G_PROGRAMAS.map(([ic, t, d, u, n]) => `<a href="${u}" target="_blank" rel="noopener" onclick="return gAbrirVentana(this.href)" style="display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit;border:1.5px solid var(--borde);border-radius:12px;padding:10px 12px;margin-bottom:8px;background:#fff"><span style="font-size:26px">${ic}</span><span style="flex:1"><b style="font-size:14px">${t}</b><br><span style="font-size:12.5px;color:var(--gris)">${d}</span></span><small style="color:var(--gris);white-space:nowrap">${n} ↗</small></a>`).join('')}
    <div class="ayuda" style="font-size:11.5px;color:var(--gris)">Son enlaces oficiales de la SEP y la CONALITEG; abren en otra pestaña.</div></div>`;
}

// ── Recuperativos: segunda oportunidad para quienes reprobaron un trimestre ──
const G_REC_MODOS = {
  mayor: 'Queda la calificación más alta (la del trimestre o la del recuperativo)',
  prom: 'Se promedia la del trimestre con la del recuperativo',
  seis: 'Si aprueba el recuperativo, su calificación queda en 6',
};
function gRecDef(g, t) {
  if (!g.recup) g.recup = {};
  if (!g.recup[t]) g.recup[t] = { nombre: 'Recuperativo del ' + G_TRIM_NOM[t].toLowerCase(), fecha: '', max: 10, modo: 'mayor', notas: {}, extra: [] };
  return g.recup[t];
}
function gRecTrim(v) { G.recTrim = +v; gRenderRecup(); }
function gRecCampo(k, v) { const g = gGrupo(), R = gRecDef(g, G.recTrim || 1); R[k] = v; gGuardar(); }
function gRecNota(aid, el) {
  const g = gGrupo(), t = G.recTrim || 1, R = gRecDef(g, t); const v = el.value.trim();
  if (v === '') delete R.notas[aid]; else { const n = Math.max(0, Math.min(R.max, gNum(v))); R.notas[aid] = n; }
  gGuardar();
  const c = document.getElementById('rc-' + aid); if (c) { const b = gBoleta(gCalcAlumno(g, aid, t).final); c.innerHTML = b == null ? '—' : `<b class="${b < 6 ? 'g-mal' : ''}">${b}</b>`; }
}
function gRecAgregar(aid) { if (!aid) return; const R = gRecDef(gGrupo(), G.recTrim || 1); if (!R.extra.includes(aid)) R.extra.push(aid); gGuardar(); gRenderRecup(); }
function gRecQuitar(aid) { const R = gRecDef(gGrupo(), G.recTrim || 1); R.extra = R.extra.filter(x => x !== aid); delete R.notas[aid]; gGuardar(); gRenderRecup(); }
function gRecFilas(g, t) {
  const R = gRecDef(g, t);
  return g.alumnos.map(a => {
    const orig = gCalcAlumno(g, a.id, t, true), b = gBoleta(orig.final);
    const rep = b != null && b < 6, extra = R.extra.includes(a.id);
    if (!rep && !extra) return null;
    const flojos = g.criterios.filter(c => orig.porCrit[c.id] != null && orig.porCrit[c.id] < 6).sort((x, y) => orig.porCrit[x.id] - orig.porCrit[y.id]);
    return { a, orig, b, rep, extra, flojos };
  }).filter(Boolean);
}
function gRenderRecup() {
  const g = gGrupo();
  if (!g) return gSinGrupo('Recuperativos', 'Una segunda oportunidad para los alumnos que reprobaron un trimestre');
  const t = G.recTrim || (G.recTrim = 1), R = gRecDef(g, t);
  let h = `<div class="sec-title">Recuperativos</div><div class="sec-sub">Para los alumnos que reprobaron un trimestre. Se aplica al cerrar un trimestre, antes de que termine el siguiente. La app te arma la lista de quienes reprobaron, con su calificación actual, y calcula cómo queda en la boleta con la nueva.</div>${gBarra()}
  <div class="g-trims">${[1, 2, 3].map(x => `<button class="ttab${t === x ? ' on' : ''}" onclick="gRecTrim(${x})">${G_TRIM_NOM[x]}</button>`).join('')}</div>`;
  if (!g.alumnos.length) return void (gPanel().innerHTML = h + gVacio('Este grupo aún no tiene alumnos.'));
  const filas = gRecFilas(g, t);
  h += `<div class="card"><div class="card-title">📝 Examen de recuperación — ${G_TRIM_NOM[t]}</div>
    <div class="f2"><div class="campo"><label>Nombre</label><input value="${gEsc(R.nombre)}" onchange="gRecCampo('nombre',this.value)"></div>
    <div class="campo"><label>Fecha de aplicación</label><input type="date" value="${gEsc(R.fecha)}" onchange="gRecCampo('fecha',this.value)"></div></div>
    <div class="ayuda">Aplica el examen a los alumnos de la lista de abajo. Después escribe la calificación nueva de cada uno (de 0 a 10). Si saca 6 o más, esa pasa a su boleta; si no aprueba, se queda con la que tenía.</div></div>`;
  h += `<div class="card"><div class="card-title">🔁 Alumnos para recuperar — ${G_TRIM_NOM[t]} <span style="font-size:12px;font-weight:600;color:var(--gris);margin-left:8px">${filas.length}</span></div>`;
  if (!filas.length) h += `<p style="color:var(--gris);margin:0 0 10px">${g.alumnos.some(a => gCalcAlumno(g, a.id, t, true).final != null) ? '🎉 Nadie reprobó este trimestre.' : 'Aún no hay calificaciones en este trimestre. Captúralas en «Calificaciones» y aquí aparecerán los que reprueben.'}</p>`;
  else h += `<div class="g-tabla-w"><table class="g-tabla"><thead><tr><th>#</th><th>Alumno</th><th>Calif. actual</th><th style="width:120px">Calif. nueva</th><th>Queda en boleta</th><th></th></tr></thead><tbody>` +
    filas.map((f, i) => { const bf = gBoleta(gCalcAlumno(g, f.a.id, t).final), n = R.notas[f.a.id];
      return `<tr><td>${i + 1}</td><td>${gEsc(f.a.nombre)}</td><td class="${f.b != null && f.b < 6 ? 'g-mal' : ''}"><b>${f.b == null ? '—' : f.b}</b></td>
      <td><input class="g-nota" type="number" step="0.1" min="0" max="10" value="${n == null ? '' : n}" oninput="gRecNota('${f.a.id}',this)"></td>
      <td id="rc-${f.a.id}">${n == null ? '—' : `<b class="${bf < 6 ? 'g-mal' : ''}">${bf}</b>`}</td>
      <td>${f.extra && !f.rep ? `<button class="g-x" title="Quitar de la lista" onclick="gRecQuitar('${f.a.id}')">✕</button>` : ''}</td></tr>`; }).join('') + '</tbody></table></div>';
  const otros = g.alumnos.filter(a => !filas.some(f => f.a.id === a.id));
  if (otros.length) h += `<div style="margin-top:12px"><select id="rc-add" style="padding:8px;border:1.5px solid var(--borde);border-radius:8px;max-width:100%"><option value="">+ Agregar otro alumno…</option>${otros.map(a => `<option value="${a.id}">${gEsc(a.nombre)}</option>`).join('')}</select> <button class="g-btn g-btn-s" onclick="gRecAgregar(document.getElementById('rc-add').value)">Agregar</button></div>`;
  if (filas.length) h += `<div style="margin-top:12px"><button class="g-btn" onclick="gRecWord()">⬇ Lista de recuperativo (Word)</button></div>`;
  h += `<div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-top:10px">Al escribir la calificación nueva, la «Boleta» de ese alumno en «Calificaciones» se actualiza y aparece marcada con (R). La lista incluye a los alumnos con menos de 6 en ese trimestre; puedes agregar a otro con el selector.</div></div>`;
  gPanel().innerHTML = h;
}
function gRecWord() {
  const g = gGrupo(), t = G.recTrim || 1, R = gRecDef(g, t), filas = gRecFilas(g, t);
  const th = x => `<td style="border:1px solid #000;padding:4px;background:#BDD7EE;font-weight:bold">${x}</td>`, td = x => `<td style="border:1px solid #000;padding:4px">${x}</td>`;
  const html = gEncabezadoDoc('RECUPERATIVO — ' + gEsc(R.nombre).toUpperCase(), g, `<b>${G_TRIM_NOM[t]}</b>${R.fecha ? ' &nbsp; <b>Fecha:</b> ' + gFechaBonita(R.fecha) : ''}`) +
    `<table style="width:100%;border-collapse:collapse"><tr>${['#', 'Alumno', 'Calif. actual', 'Calif. nueva'].map(th).join('')}</tr>` +
    filas.map((f, i) => { const n = R.notas[f.a.id];
      return `<tr>${[i + 1, gEsc(f.a.nombre), f.b == null ? '—' : f.b, n == null ? '' : n].map(td).join('')}</tr>`; }).join('') + '</table>';
  descargarWord(html, `Recuperativo_${(g.nombre + '_' + g.materia + '_T' + t).replace(/\W+/g, '_')}.doc`);
}

// ── Menús que todavía están en construcción (se van llenando uno por uno) ──
const G_PRONTO = {
};
function gRenderProntoTab(id) {
  const [ico, tit, desc] = G_PRONTO[id];
  gPanel().innerHTML = `<div class="card pronto-box"><div class="pi">${ico}</div><span class="pronto-tag">🚧 En construcción</span><h2>${tit}</h2><p>${desc}</p><p style="font-size:12px;margin-top:14px">Lo iremos armando paso a paso. Mientras tanto, usa lo que ya está listo desde «Inicio».</p><button class="g-btn" style="margin-top:14px" onclick="gIrA('inicio')">Volver a Inicio</button></div>`;
}

// ── Pantalla de inicio con accesos directos ──
const G_MENU = [
  ['grupos', '👥', 'Mis grupos', 'Alumnos y listas', true],
  ['lista', '✅', 'Pasar lista', 'Asistencia, retardos y faltas', true],
  ['nueva', '📝', 'Planeación', 'Programa analítico y plano didáctico', true],
  ['libros', '📚', 'Libros y programas SEP', 'Libros de texto y programas', true],
  ['calif', '📊', 'Calificaciones y criterios de evaluación', 'Criterios y calificación del trimestre', true],
  ['trabajos', '📓', 'Libreta de trabajos', 'Tareas entregadas por alumno', true],
  ['examenes', '🧮', 'Exámenes', 'Crear con IA y calificar', true],
  ['rezago', '🚦', 'Rezago', 'Semáforo de alumnos en riesgo', true],
  ['recup', '🔁', 'Recuperativos', 'Segunda oportunidad para reprobados', true],
  ['bitacora', '📔', 'Bitácora', 'Reportes de incidencias', true],
  // El escáner de exámenes (📷) está oculto por ahora: su código sigue en escaner.js. Para volver a mostrarlo, descomenta esta línea y su botón en index.html.
  // ['escaner', '📷', 'Escanear examen', 'Calificar con la cámara', true],
  ['capexamen', '✏️', 'Capturar examen', 'Aciertos por alumno y calificación del trimestre', true],
  ['calendario', '📅', 'Calendario escolar', 'Sube el de tu escuela', true],
  ['horario', '🕐', 'Horario', 'Escríbelo o súbelo (PDF/foto)', true],
  ['historial', '📋', 'Historial', 'Planeaciones generadas', true],
  ['planes', '💳', 'Planes y precios', 'Suscripción desde $149 al mes', true],
  ['licencia', '🔑', 'Mi licencia', 'IA, plan y código', true],
];
// Iconos de línea propios (24×24) y su color de acento, para las tarjetas y la barra inferior
const G_ICONOS = {
  lista: ['<rect x="3" y="3" width="18" height="18" rx="4.5"/><path d="M8 12.2l3 3 5-6"/>', '#16a34a', '#dcfce7'],
  nueva: ['<path d="M2.5 5.5c3-1.4 6-1.2 9.5 1.2 3.5-2.4 6.5-2.6 9.5-1.2V19c-3-1.4-6-1.2-9.5 1.2C8.500 17.800 5.500 17.600 2.500 19z"/><path d="M12 6.700V20"/>', '#4f46e5', '#e0e7ff'],
  libros: ['<path d="M4 4.500A2.500 2.500 0 0 1 6.500 2H20v15H6.500A2.500 2.500 0 0 0 4 19.500z"/><path d="M4 19.500A2.500 2.500 0 0 0 6.500 22H20v-5"/>', '#0e7490', '#cffafe'],
  trim: ['<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.500"/><circle cx="12" cy="12" r=".8"/>', '#7c3aed', '#ede9fe'],
  calif: ['<path d="M19 5L5 19"/><circle cx="7.200" cy="7.200" r="2.600"/><circle cx="16.800" cy="16.800" r="2.600"/>', '#ea580c', '#ffedd5'],
  examenes: ['<path d="M4 20h4L19.500 8.500l-4-4L4 16z"/><path d="M13.500 6.500l4 4"/>', '#9333ea', '#f3e8ff'],
  grupos: ['<circle cx="9" cy="8" r="3.200"/><path d="M3 20c0-3.500 2.700-6 6-6s6 2.500 6 6"/><circle cx="17" cy="9" r="2.500"/><path d="M17.500 14c2.500.3 4 2.200 4 5"/>', '#2563eb', '#dbeafe'],
  recup: ['<path d="M20 12a8 8 0 1 1-2.500-5.800"/><path d="M20 4v4.500h-4.500"/>', '#0891b2', '#cffafe'],
  rezago: ['<path d="M4 20v-6M10 20V9M16 20V4"/><path d="M2.500 20.500h19"/>', '#e11d48', '#ffe4e6'],
  bitacora: ['<rect x="5" y="4" width="14" height="17" rx="2.800"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>', '#db2777', '#fce7f3'],
  trabajos: ['<rect x="5" y="3" width="14" height="18" rx="2.500"/><path d="M9 8h6M9 12h6M9 16h3.500"/>', '#c2410c', '#ffedd5'],
  escaner: ['<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.500"/>', '#0284c7', '#e0f2fe'],
  capexamen: ['<rect x="5" y="4" width="14" height="17" rx="2.800"/><path d="M9 3h6v3H9z"/><path d="M9 13l2 2 4-4"/>', '#0284c7', '#e0f2fe'],
  calendario: ['<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>', '#0d9488', '#ccfbf1'],
  horario: ['<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.500 2"/>', '#d97706', '#fef3c7'],
  historial: ['<path d="M6 3h8l4 4v14H6z"/><path d="M9 12h6M9 16h6"/>', '#475569', '#e2e8f0'],
  licencia: ['<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>', '#ca8a04', '#fef9c3'],
  planes: ['<rect x="2.500" y="5" width="19" height="14" rx="3"/><path d="M2.500 10h19M6.500 15h4"/>', '#16a34a', '#dcfce7'],
  libros: ['<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h11"/>', '#0f766e', '#ccfbf1'],
  mas: ['<circle cx="5" cy="12" r="1.300"/><circle cx="12" cy="12" r="1.300"/><circle cx="19" cy="12" r="1.300"/>', '#64748b', '#e2e8f0'],
  inicio: ['<path d="M3.500 11L12 3.500 20.500 11V20a1 1 0 01-1 1H15v-6H9v6H4.500a1 1 0 01-1-1z"/>', '#2563a8', '#dbeafe'],
};
function gIco(id) { const i = G_ICONOS[id] || G_ICONOS.mas; return `<svg viewBox="0 0 24 24" aria-hidden="true">${i[0]}</svg>`; }
function gTinte(id) { const i = G_ICONOS[id] || G_ICONOS.mas; return `--tc:${i[1]};--tb:${i[2]}`; }
const G_FLECHA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

// Barra inferior para el teléfono (Inicio · Grupos · Lista · Planeación · Más)
const G_NAV_INF = [['inicio', 'Inicio'], ['grupos', 'Grupos'], ['lista', 'Lista'], ['nueva', 'Planeación']];
function gArmarNavInferior() {
  const n = document.getElementById('bottom-nav'); if (!n) return;
  n.innerHTML = G_NAV_INF.map(([id, t]) => `<button type="button" data-id="${id}" onclick="gIrA('${id}')">${gIco(id)}<span>${t}</span></button>`).join('') +
    `<button type="button" data-id="mas" onclick="document.body.classList.toggle('menu-open')">${gIco('mas')}<span>Más</span></button>`;
  if (typeof navPintar === 'function') navPintar();
}

function gRenderInicio() {
  const u = getUsuario(); const nombre = u ? u.nombre : '';
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  let h = `<div class="saludo">${saludo}, ${gEsc(nombre)} 👋</div><div class="saludo-sub">${gFechaBonita(gHoy())}</div>
  <div class="sec-title" style="font-size:16px">¿Qué quieres hacer hoy?</div><div style="height:10px"></div>
  <div class="tiles">` + G_MENU.map(([id, ico, tit, desc, listo]) =>
    `<div class="tile${listo ? '' : ' pronto'}" style="${gTinte(id)}" onclick="gIrA('${id}')">${listo ? (licTabBloqueada(id) ? '<span class="badge">🔒 Con licencia</span>' : '') : '<span class="badge">🚧 En construcción</span>'}<span class="ti">${gIco(id)}</span><div class="tt">${tit}</div><div class="td">${desc}</div>${listo ? `<span class="go">${G_FLECHA}</span>` : ''}</div>`).join('') +
    `<a class="tile ancho" style="${gTinte('libros')}" href="https://libros.conaliteg.gob.mx/" target="_blank" rel="noopener"><span class="ti">${gIco('libros')}</span><div class="tx"><div class="tt">Libros de texto SEP</div><div class="td">Consulta y descarga los libros gratuitos de cada grado (sitio oficial de la CONALITEG)</div></div><span class="go">${G_FLECHA}</span></a></div>`;
  const gs = G.data ? G.data.grupos : [];
  if (G.data && !gPerfil().escuela) h += `<div class="g-aviso" style="background:#fffbeb;border-color:#fde68a;color:#92400e">🏫 Falta el nombre de tu escuela. <a href="#" onclick="gIrA('grupos');return false">Captúralo en «Mis grupos»</a> para que aparezca en tus documentos.</div>`;
  h += gRespAvisoHTML();
  h += gHoyTocaHTML();
  h += `<div class="card"><div class="card-title">📌 Hoy en mis grupos</div>`;
  if (!gs.length) h += `<p style="color:var(--gris)">Aún no tienes grupos. <a href="#" onclick="gIrA('grupos');return false">Crea el primero</a> para pasar lista, calificar y crear exámenes, o <a href="#" onclick="gIrA('grupos');return false"><b>restaura tu respaldo</b></a> si ya los tenías en otro equipo.</p>`;
  else h += gs.map(g => {
    const dia = g.asist[gHoy()];
    return `<div class="hoy-fila"><b>${gEsc(g.nombre)} · ${gEsc(g.materia)}</b><span style="color:var(--gris)">${g.alumnos.length} alumnos</span><span style="margin-left:auto">${dia ? `<span style="color:var(--verde)">✓ Lista de hoy: ${gConteoDia(g, dia)}</span>` : `<button class="g-btn g-btn-s" onclick="gCambiarGrupo('${g.id}');gIrA('lista')">Pasar lista de hoy</button>`}</span></div>`;
  }).join('');
  h += '</div>';
  gPanel().innerHTML = h;
}
function gPanel() { return document.getElementById('g-' + G.tab); }
function gCambiarGrupo(id) { G.gid = id; G.gidManual = true; G.borrador = null; G.temaUlt = ''; G.temasSel = []; G.sugerencias = []; gRender(); }

// ── Horario → «Hoy te toca» y grupo sugerido al pasar lista ──
function gNorm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ''); }
function gMinutos(h) { const m = String(h || '').match(/^(\d{1,2}):(\d{2})/); return m ? (+m[1]) * 60 + (+m[2]) : null; }
// Grupo de la app que corresponde a una celda del horario («Materia · Grupo» o «Grupo · Materia»)
function gHorarioGrupo(txt) {
  if (!txt || !G.data) return null;
  const partes = String(txt).split(/\s*[·|\/]\s*/), gs = G.data.grupos;
  const buscar = (mat, gr) => {
    const m = gNorm(mat), r = gNorm(gr); if (!r) return null;
    let c = gs.filter(g => gNorm(g.nombre) === r); if (!c.length) return null;
    if (c.length > 1) { const k = c.filter(x => { const gm = gNorm(x.materia); return m && (gm.startsWith(m) || m.startsWith(gm) || gm.includes(m)); }); if (k.length) c = k; }
    return c[0];
  };
  return buscar(partes[0], partes.slice(1).join('')) || buscar(partes.slice(1).join(''), partes[0]);
}
// Clases de hoy según el horario (varios módulos seguidos de lo mismo se juntan en una sola fila)
function gClasesHoy() {
  const H = gHorario(), wd = (new Date().getDay() + 6) % 7; if (wd > 4) return null;
  const out = []; let n = 0;
  H.mods.forEach((m, i) => {
    if (m[2] === 'rec') return; n++;
    const t = H.c[i + '-' + wd]; if (!t) return;
    const u = out[out.length - 1];
    if (u && u.t === t && u.idx === i - 1) { u.fin = n; u.hFin = m[1]; u.idx = i; } else out.push({ t, ini: n, fin: n, hIni: m[0], hFin: m[1], idx: i });
  });
  out.forEach(c => { c.g = gHorarioGrupo(c.t); });
  return out;
}
// La clase en curso, o la siguiente de hoy
function gClaseAhora(cl) {
  const d = new Date(), ahora = d.getHours() * 60 + d.getMinutes();
  return (cl || []).find(c => { const a = gMinutos(c.hIni), b = gMinutos(c.hFin); return a != null && b != null && ahora >= a && ahora < b; }) ||
    (cl || []).find(c => { const a = gMinutos(c.hIni); return a != null && a > ahora; }) || null;
}
function gAutoGrupo() {
  if (!G.data || G.gidManual) return;
  const c = gClaseAhora(gClasesHoy()); if (c && c.g) G.gid = c.g.id;
}
function gHoyLista(id) { G.gid = id; G.fecha = gHoy(); G.gidManual = true; gIrA('lista'); }
function gHoyTocaHTML() {
  const hay = Object.values(gHorario().c).some(v => v);
  let h = `<div class="card"><div class="card-title">🕐 Hoy te toca <a href="#" onclick="gIrA('horario');return false" style="margin-left:auto;font-size:12px;font-weight:600">Ver / editar horario</a></div>`;
  if (!hay) return h + `<p style="color:var(--gris);margin:0">Escribe tu horario para ver aquí las clases de cada día y pasar lista con un toque. <button class="g-btn g-btn-s" onclick="gIrA('horario')">Capturar mi horario</button></p></div>`;
  const cl = gClasesHoy();
  if (!cl) return h + `<p style="color:var(--gris);margin:0">Hoy no hay clases. ¡Buen descanso!</p></div>`;
  if (!cl.length) return h + `<p style="color:var(--gris);margin:0">Hoy no tienes clases en tu horario.</p></div>`;
  const ahora = gClaseAhora(cl);
  const d = new Date(), min = d.getHours() * 60 + d.getMinutes();
  return h + cl.map(c => {
    const g = c.g, hecho = g && g.asist[gHoy()], enCurso = c === ahora && gMinutos(c.hIni) <= min;
    return `<div class="hoy-fila"${c === ahora ? ' style="background:#eff6ff;border-radius:8px;padding:6px 8px"' : ''}><b>${c.ini === c.fin ? c.ini : c.ini + '–' + c.fin}</b><span style="color:var(--gris)">${gEsc(c.hIni)}–${gEsc(c.hFin)}</span><span>${gEsc(c.t)}</span>${c === ahora ? `<span class="g-tag" style="margin:0">${enCurso ? 'En curso' : 'Sigue'}</span>` : ''}
      <span style="margin-left:auto">${!g ? `<a href="#" onclick="gIrA('grupos');return false" style="font-size:12px">Crea este grupo en «Mis grupos»</a>` : hecho ? `<span style="color:var(--verde)">✓ Lista de hoy: ${gConteoDia(g, hecho)}</span>` : `<button class="g-btn g-btn-s" onclick="gHoyLista('${g.id}')">Pasar lista</button>`}</span></div>`;
  }).join('') + '</div>';
}

// Barra superior con el selector de grupo (la usan todas las pestañas)
function gBarra() {
  const gs = G.data.grupos;
  return `<div class="g-barra"><label>Grupo</label>
    <select onchange="gCambiarGrupo(this.value)">${gs.map(g => `<option value="${g.id}"${g.id === G.gid ? ' selected' : ''}>${gEsc(g.nombre)} · ${gEsc(g.materia)} (${g.alumnos.length} alumnos)</option>`).join('')}</select>
    <button class="g-btn g-btn-s" onclick="gIrA('grupos')">+ Grupos</button></div>`;
}
function gVacio(txt) {
  return `<div class="card g-vacio"><div style="font-size:44px;margin-bottom:8px;">👥</div><div>${txt}</div>
    <button class="g-btn" style="margin-top:14px" onclick="gIrA('grupos')">Ir a «Mis grupos»</button></div>`;
}
function gIrA(id) {
  const tabs = document.querySelectorAll('.nav-tab');
  const btn = [...tabs].find(b => (b.getAttribute('onclick') || '').includes(`'${id}'`));
  if (btn) showTab(id, btn);
}
function gSinGrupo(titulo, sub) {
  const p = gPanel();
  p.innerHTML = `<div class="sec-title">${titulo}</div><div class="sec-sub">${sub}</div>` + gVacio('Primero crea tu grupo y captura la lista de alumnos.');
}

// ============================================================
// 1. MIS GRUPOS
// ============================================================
function gMateriasOpts(grado, sel) {
  const cm = CAMPOS_POR_GRADO[grado] || {};
  let h = '';
  Object.keys(cm).forEach(c => { h += `<optgroup label="${gEsc(c)}">` + cm[c].map(m => `<option${m === sel ? ' selected' : ''}>${gEsc(m)}</option>`).join('') + '</optgroup>'; });
  return h;
}
function gActualizarMaterias() {
  const gr = document.getElementById('gg-grado').value;
  document.getElementById('gg-materia').innerHTML = gMateriasOpts(gr);
}
function gCrearGrupo() {
  const nombre = document.getElementById('gg-nombre').value.trim();
  const grado = document.getElementById('gg-grado').value;
  const materia = document.getElementById('gg-materia').value;
  if (!nombre) { gAviso('Escribe el nombre del grupo, por ejemplo «3° A».'); return; }
  const ta = document.getElementById('gn-lista');
  const nombres = ta ? gNombresDeTexto(ta.value) : [];
  const g = { id: gId(), nombre, grado, materia, alumnos: nombres.map(n => ({ id: gId(), nombre: n })), asist: {}, criterios: G_CRITERIOS_DEF.map(gCritDef), actividades: [], plan: {} };
  G.data.grupos.push(g); G.gid = g.id; G.nuevoGrupo = false; G.editGrupo = null; gGuardar(); gRender(); window.scrollTo(0, 0);
}
function gBorrarGrupo(id) {
  const g = G.data.grupos.find(x => x.id === id); if (!g) return;
  if (!confirm(`¿Borrar el grupo «${g.nombre} · ${g.materia}» con sus ${g.alumnos.length} alumnos, listas, calificaciones y exámenes? No se puede deshacer.`)) return;
  G.data.grupos = G.data.grupos.filter(x => x.id !== id);
  G.gid = G.data.grupos[0] ? G.data.grupos[0].id : null; gGuardar(); gRender();
}
function gEditarGrupo(on) { G.editGrupo = on ? G.gid : null; gRender(); }
function gActualizarMateriasEd() {
  const gr = document.getElementById('gge-grado').value;
  document.getElementById('gge-materia').innerHTML = gMateriasOpts(gr);
}
function gGuardarEdicionGrupo() {
  const g = gGrupo(); if (!g) return;
  const nombre = document.getElementById('gge-nombre').value.trim();
  const grado = document.getElementById('gge-grado').value;
  const materia = document.getElementById('gge-materia').value;
  if (!nombre) { gAviso('Escribe el nombre del grupo, por ejemplo «3° A».'); return; }
  const cambioMat = g.materia !== materia || String(g.grado) !== String(grado);
  g.nombre = nombre; g.grado = grado; g.materia = materia;
  G.editGrupo = null; G.borrador = null; G.temaUlt = ''; G.temasSel = []; G.sugerencias = [];
  gGuardar(); gRender();
  if (cambioMat) setTimeout(() => gAviso('Listo. El grupo ahora es «' + nombre + ' · ' + materia + '» (' + grado + '°). Las listas, calificaciones y exámenes que ya tenías se conservan.'), 50);
}
function gLimpiarNombre(l) { return l.replace(/^\s*\d+\s*[.)\-:]*\s*/, '').replace(/\s*\/\s*/g, ' ').replace(/\s+/g, ' ').trim(); } // «BAEZA / PECH / JONATHAN» → «BAEZA PECH JONATHAN»
function gAgregarAlumnos(idTa) {
  const g = gGrupo(); if (!g) return;
  const ta = document.getElementById(idTa || 'gg-lista');
  const nombres = ta.value.split(/\r?\n/).map(gLimpiarNombre).filter(Boolean);
  if (!nombres.length) { gAviso('Pega o escribe al menos un nombre (uno por renglón).'); return; }
  const ya = new Set(g.alumnos.map(a => a.nombre.toLowerCase()));
  let n = 0;
  nombres.forEach(nm => { if (!ya.has(nm.toLowerCase())) { g.alumnos.push({ id: gId(), nombre: nm }); ya.add(nm.toLowerCase()); n++; } });
  gGuardar(); gRender();
  if (n < nombres.length) setTimeout(() => gAviso(`Se agregaron ${n} alumnos. ${nombres.length - n} ya estaban en la lista y se omitieron.`), 50);
}
function gRenombrarAlumno(aid, v) { const g = gGrupo(); const a = g.alumnos.find(x => x.id === aid); if (a && v.trim()) { a.nombre = v.trim(); gGuardar(); } }
function gQuitarAlumno(aid) {
  const g = gGrupo(); const a = g.alumnos.find(x => x.id === aid); if (!a) return;
  if (!confirm(`¿Quitar a ${a.nombre}? Se borrarán también sus asistencias y calificaciones.`)) return;
  g.alumnos = g.alumnos.filter(x => x.id !== aid);
  Object.values(g.asist).forEach(d => delete d[aid]);
  g.actividades.forEach(ac => delete ac.notas[aid]);
  gGuardar(); gRender();
}
function gOrdenarAlumnos() { const g = gGrupo(); g.alumnos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')); gGuardar(); gRender(); }
// ── Recordatorio de respaldo ──
// Los datos viven solo en este dispositivo; la app avisa cuándo fue el último respaldo y lo descarga en un clic.
const G_RESP_DIAS = 7;   // a partir de cuántos días sin respaldar (con cambios) se avisa
function gRespUltimo() { try { const v = +localStorage.getItem(G.key + '_resp'); return v > 0 ? v : null; } catch (e) { return null; } }
function gRespUltimoCambio() { try { const v = +localStorage.getItem(G.key + '_mod'); return v > 0 ? v : null; } catch (e) { return null; } }
function gRespTexto() {
  const t = gRespUltimo(); if (!t) return 'Todavía no has descargado ningún respaldo.';
  const d = Math.floor((Date.now() - t) / 86400000);
  return 'Último respaldo: ' + (d <= 0 ? 'hoy' : d === 1 ? 'ayer' : 'hace ' + d + ' días') + ' (' + new Date(t).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) + ').';
}
// ¿Toca avisar? Hay grupos y (nunca se ha respaldado, o hay cambios sin respaldar y ya pasaron G_RESP_DIAS días)
function gRespToca() {
  if (!G.data || !G.data.grupos.length) return false;
  const t = gRespUltimo(); if (!t) return true;
  const mod = gRespUltimoCambio() || 0;
  return mod > t && (Date.now() - t) >= G_RESP_DIAS * 86400000;
}
function gRespAvisoHTML() {
  if (!gRespToca()) return '';
  return `<div class="g-aviso g-resp-aviso" style="background:#fffbeb;border-color:#fde68a;color:#92400e;margin-bottom:14px">💾 <b>Haz tu respaldo.</b> <span class="g-resp-fecha">${gRespTexto()}</span> Tus grupos, alumnos y calificaciones están <b>solo en esta computadora</b>; si se borran los datos del navegador o cambias de equipo, sin respaldo se pierden.
    <div style="margin-top:8px"><button class="g-btn" style="margin:0" onclick="gRespaldar()">⬇ Descargar respaldo ahora</button> <span style="font-size:12px">Se guarda en tu carpeta de <b>Descargas</b>; muévelo a una carpeta tuya (por ejemplo «Respaldos Planeador») o mándalo a tu correo.</span></div></div>`;
}
// ── Respaldo TOTAL ──
// Incluye todo lo del maestro en este equipo: grupos (alumnos, asistencias, calificaciones, libreta, exámenes, recuperativos),
// datos de la escuela, horario semanal, bitácora, historial de planeaciones, temas guardados y los archivos subidos (calendario, etc.).
function gBlobB64(blob) { return new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1] || ''); r.onerror = () => mal(r.error); r.readAsDataURL(blob); }); }
function gB64Blob(b64, mime) { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: mime || 'application/octet-stream' }); }
async function gArchivosTodos() {   // todos los archivos subidos de esta cuenta (calendario, horario…)
  try { const db = await gIdb(); return await new Promise(ok => { const q = db.transaction('cal').objectStore('cal').getAll(); q.onsuccess = () => ok((q.result || []).filter(x => x.cuenta === G.key)); q.onerror = () => ok([]); }); }
  catch (e) { return []; }
}
async function gRespaldoPaquete() {
  const lee = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const arch = [];
  for (const r of await gArchivosTodos()) { try { arch.push({ id: r.id, cat: r.cat || 'cal', nombre: r.nombre, tipo: r.tipo, mime: r.mime, t: r.t, b64: await gBlobB64(r.blob) }); } catch (e) { /* un archivo dañado no impide el respaldo */ } }
  return { app: 'planeador-nem', v: 2, total: true, fecha: new Date().toISOString(), datos: G.data, historial: (typeof histKey === 'function' ? lee(histKey()) : null) || [], temas: lee(gTemasClave()) || [], archivos: arch };
}
async function gRespaldar() {
  const btns = [...document.querySelectorAll('[onclick="gRespaldar()"]')]; btns.forEach(b => { b.disabled = true; });
  try {
    const paq = await gRespaldoPaquete();
    const blob = new Blob([JSON.stringify(paq)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'respaldo-planeador-nem-' + gHoy() + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    try { localStorage.setItem(G.key + '_resp', String(Date.now())); } catch (e) {}
    document.querySelectorAll('.g-resp-aviso').forEach(e => { e.style.background = '#f0fdf4'; e.style.borderColor = '#bbf7d0'; e.style.color = '#166534'; e.innerHTML = '✅ <b>Respaldo total descargado.</b> Revisa tu carpeta de <b>Descargas</b> y guárdalo en un lugar seguro (una carpeta tuya, una USB o tu correo).'; });
    document.querySelectorAll('.g-resp-fecha').forEach(e => { if (!e.closest('.g-resp-aviso')) e.textContent = gRespTexto(); });
  } catch (e) { gAviso('No se pudo crear el respaldo: ' + (e.message || e)); }
  btns.forEach(b => { b.disabled = false; });
}
// Tarjeta bien visible para quien entra con una cuenta sin datos en este equipo (equipo nuevo, otro navegador…)
function gRestaurarTarjetaHTML() {
  return `<div class="g-aviso" style="background:#eff6ff;border-color:#bfdbfe;color:#1e3a8a;margin-bottom:14px">📥 <b>¿Ya tenías tus grupos en otro equipo o navegador?</b> Aquí puedes traerlos con tu archivo de respaldo (el que descargaste con «Descargar respaldo»).
    <div style="margin-top:8px"><label class="g-btn" style="display:inline-block;cursor:pointer;margin:0">⬆ Restaurar respaldo<input type="file" accept=".json,application/json" style="display:none" onchange="gRestaurar(this)"></label></div></div>`;
}
function gRestaurar(input) {
  const f = input.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = async () => {
    try {
      const d = JSON.parse(r.result);
      const total = !!(d && d.v === 2 && d.datos && Array.isArray(d.datos.grupos)), datos = total ? d.datos : d;   // también acepta respaldos anteriores (solo grupos)
      if (!datos || !Array.isArray(datos.grupos)) throw new Error('formato');
      const nh = total && Array.isArray(d.historial) ? d.historial.length : 0, na = total && Array.isArray(d.archivos) ? d.archivos.length : 0;
      const resumen = `${datos.grupos.length} grupo(s)` + (total ? `, ${nh} planeación(es) en el historial y ${na} archivo(s) subido(s)` : ' (respaldo anterior: solo grupos y calificaciones)');
      if (!confirm(`El respaldo trae ${resumen}. Esto reemplaza lo que hay ahora en este dispositivo. ¿Continuar?`)) { input.value = ''; return; }
      if (total) {
        try { if (typeof histKey === 'function') localStorage.setItem(histKey(), JSON.stringify(d.historial || [])); } catch (e) { /* sin espacio */ }
        try { if (typeof cargarHist === 'function' && typeof historial !== 'undefined') { historial = cargarHist(); if (typeof renderHist === 'function' && document.getElementById('hist-lista')) renderHist(); } } catch (e) { /* el historial en pantalla se actualiza al recargar */ }
        try { localStorage.setItem(gTemasClave(), JSON.stringify(d.temas || [])); } catch (e) { /* sin espacio */ }
        let malArch = 0;
        for (const x of (d.archivos || [])) { try { await gCalPoner({ id: x.id, cuenta: G.key, cat: x.cat || 'cal', nombre: x.nombre, tipo: x.tipo, mime: x.mime, blob: gB64Blob(x.b64, x.mime), t: x.t || Date.now() }); } catch (e) { malArch++; } }
        if (malArch) gAviso(`No se pudieron restaurar ${malArch} archivo(s) subido(s); lo demás sí se restauró.`);
      }
      G.data = datos; G.gid = datos.grupos[0] ? datos.grupos[0].id : null; gGuardar(); gRender();
      gAviso('Listo: tu respaldo se restauró.');
    } catch (e) { gAviso('El archivo no es un respaldo válido del Planeador.'); }
    input.value = '';
  };
  r.readAsText(f);
}

const G_ORD = { 1: 'Primer', 2: 'Segundo', 3: 'Tercer' };
function gNuevoGrupoForm(sel) {
  const gr = sel ? String(sel.grado) : '1';
  return `<div class="card gg-nuevo"><div class="card-title">➕ Añadir grupo
      ${G.data.grupos.length ? `<button class="g-btn g-btn-s" style="margin:0 0 0 auto" onclick="gMostrarNuevoGrupo(false)">✕ Cancelar</button>` : ''}</div>
    <div class="f3">
      <div class="campo"><label>Grupo</label><input id="gg-nombre" placeholder="Ej. 3° A"></div>
      <div class="campo"><label>Grado</label><select id="gg-grado" onchange="gActualizarMaterias()">${['1', '2', '3'].map(n => `<option value="${n}"${n === gr ? ' selected' : ''}>${n}° Secundaria</option>`).join('')}</select></div>
      <div class="campo"><label>Materia que impartes</label><select id="gg-materia">${gMateriasOpts(gr, sel ? sel.materia : '')}</select></div>
    </div>
    <div class="campo"><label>Alumnos (opcional: teclea, pega o sube tu lista)</label>
      <textarea id="gn-lista" rows="4" placeholder="1. AGUILAR PECH ANDREA&#10;2. BALAM CHAN DIEGO"></textarea></div>
    ${gUiArchivo('gn-lista')}
    <button class="g-btn" onclick="gCrearGrupo()">Crear grupo</button>
    <div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">Si das la misma materia a varios grupos, crea uno por cada grupo. Los nombres se revisan en el recuadro antes de crear el grupo.</div>
  </div>`;
}
function gMostrarNuevoGrupo(on) { G.nuevoGrupo = !!on; G.editGrupo = null; gRender(); window.scrollTo(0, 0); }
function gElegirGrupo(id) { G.nuevoGrupo = false; G.editGrupo = null; gCambiarGrupo(id); window.scrollTo(0, 0); }
function gGruposPanelHTML(conMas) {
  if (conMas === undefined) conMas = true;
  const gs = G.data.grupos, grados = [...new Set(gs.map(x => String(x.grado)))].sort();
  return `<div class="gg-panel">` + grados.map(gr => `<div class="gg-fila"><div class="gg-grado">${gEsc(gr)}°<small>grado</small></div><div class="gg-cols">${
    gs.filter(x => String(x.grado) === gr).map(x => `<button class="gg-tile${x.id === G.gid && !(conMas && G.nuevoGrupo) ? ' on' : ''}" onclick="gElegirGrupo('${x.id}')"><b>${gEsc(x.nombre)}</b><span>${gEsc(x.materia)}</span><em>${x.alumnos.length} alumno${x.alumnos.length === 1 ? '' : 's'}</em></button>`).join('')}</div></div>`).join('')
    + (conMas ? `<button class="gg-mas${G.nuevoGrupo ? ' on' : ''}" onclick="gMostrarNuevoGrupo(true)">➕ Añadir grupo</button>` : '') + `</div>`;
}
function gRenderGrupos() {
  const gs = G.data.grupos, p = gPerfil();
  if (gs.length && !gGrupo()) G.gid = gs[0].id;   // si no hay uno seleccionado (o ya no existe), se muestra el primero
  const g = gGrupo();
  if (g && G.editGrupo && G.editGrupo !== g.id) G.editGrupo = null;
  const form = !gs.length || G.nuevoGrupo;
  let h = `<div class="sec-title">Mis grupos y alumnos</div>
  <div class="sec-sub">Crea tus grupos una sola vez; la lista de alumnos se usa en el pase de lista, las calificaciones y los exámenes. 🔒 Los nombres se guardan <strong>solo en este dispositivo</strong>: descarga un respaldo de vez en cuando.</div>`;
  h += gRespAvisoHTML();
  if (!gs.length) h += gRestaurarTarjetaHTML();
  h += `<details class="card gg-det" ${p.escuela ? '' : 'open'}><summary class="card-title" style="cursor:pointer">🏫 ${p.escuela ? gEsc(p.escuela) + (p.cct ? ' · CCT ' + gEsc(p.cct) : '') + (p.municipio ? ' · ' + gEsc(p.municipio) : '') : 'Mi escuela: escribe aquí los datos de tu escuela'} <span style="margin-left:auto;font-size:12px;font-weight:600;color:var(--gris)">✏️ ver / editar</span></summary>
    <div class="f3"><div class="campo"><label>Nombre de la escuela</label><input id="gp-esc" value="${gEsc(gPerfil().escuela)}" placeholder="Escuela Secundaria…"></div>
    <div class="campo"><label>CCT</label><input id="gp-cct" value="${gEsc(gPerfil().cct)}" maxlength="12"></div>
    <div class="campo"><label>Municipio / localidad</label><input id="gp-mun" value="${gEsc(gPerfil().municipio)}"></div></div>
    <div class="f2"><div class="campo"><label>Estado (para el encabezado de tus reportes)</label><input id="gp-est" value="${gEsc(gPerfil().estado || '')}" placeholder="Ej. Yucatán"></div><div></div></div>
    <div class="f3"><div class="campo"><label>Director(a) (opcional)</label><input id="gp-dir" value="${gEsc(gPerfil().director || '')}" placeholder="Nombre de quien dirige"></div>
    <div class="campo"><label>WhatsApp de Dirección (opcional)</label><input id="gp-dirwa" type="tel" inputmode="tel" value="${gEsc(gPerfil().dirWa || '')}" placeholder="10 dígitos"></div>
    <div class="campo"><label>Correo de Dirección (opcional)</label><input id="gp-dircorreo" type="email" value="${gEsc(gPerfil().dirCorreo || '')}" placeholder="direccion@escuela.edu.mx"></div></div>
    <div class="f2"><div class="campo"><label>Tipo de escuela (opcional)</label><input id="gp-tipo" value="${gEsc(gPerfil().tipoEscuela || '')}" placeholder="Ej. Escuela Secundaria General, Técnica, Federal, Estatal…"></div>
    <div class="campo"><label>Zona escolar (opcional)</label><input id="gp-zona" value="${gEsc(gPerfil().zona || '')}" placeholder="Ej. 08"></div></div>
    <button class="g-btn" onclick="gGuardarPerfil()">Guardar mis datos</button>
    <span style="font-size:12px;color:var(--gris);margin-left:6px">Aparecen en tus planeaciones, listas y exámenes.</span></details>`;
  if (gs.length) h += gGruposPanelHTML();
  if (form) h += gNuevoGrupoForm(g);
  else if (g) {
    const gEd = G.editGrupo === g.id, campo = gCampoDe(g.grado, g.materia);
    h += `<div class="gg-banner">
      <div class="gg-b-info"><div class="gg-b-nom">${gEsc(g.nombre)}</div>
        <div class="gg-b-sub">${G_ORD[g.grado] || gEsc(g.grado) + '°'} grado de secundaria &nbsp;·&nbsp; <b>${gEsc(g.materia)}</b></div>
        <div class="gg-b-tags">${campo ? `<span>${gEsc(campo)}</span>` : ''}<span>👥 ${g.alumnos.length} alumno${g.alumnos.length === 1 ? '' : 's'}</span></div></div>
      <div class="gg-b-bot"><button onclick="gEditarGrupo(${gEd ? 'false' : 'true'})">${gEd ? '✕ Cerrar' : '✏️ Editar grupo'}</button><button class="rojo" onclick="gBorrarGrupo('${g.id}')">🗑 Borrar</button></div>
    </div>`;
    if (gEd) h += `<div class="card"><div class="card-title">✏️ Corregir los datos del grupo</div>
        <div class="f3">
          <div class="campo"><label>Grupo</label><input id="gge-nombre" value="${gEsc(g.nombre)}" placeholder="Ej. 3° A"></div>
          <div class="campo"><label>Grado</label><select id="gge-grado" onchange="gActualizarMateriasEd()">${['1', '2', '3'].map(n => `<option value="${n}"${String(g.grado) === n ? ' selected' : ''}>${n}° Secundaria</option>`).join('')}</select></div>
          <div class="campo"><label>Materia que impartes</label><select id="gge-materia">${gMateriasOpts(String(g.grado), g.materia)}</select></div>
        </div>
        <button class="g-btn" onclick="gGuardarEdicionGrupo()">Guardar cambios</button>
        <button class="g-btn g-btn-s" onclick="gEditarGrupo(false)">Cancelar</button>
        <div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:6px">Tus alumnos, listas, calificaciones y exámenes se conservan. Si cambias la materia, lo nuevo que generes (exámenes, planeaciones) ya saldrá con la materia correcta.</div></div>`;
    h += `<div class="card"><div class="card-title">👥 Alumnos de ${gEsc(g.nombre)} · ${gEsc(g.materia)}
        ${g.alumnos.length ? `<button class="g-btn g-btn-s" style="margin:0 0 0 auto" onclick="gOrdenarAlumnos()">Ordenar A–Z</button>` : ''}</div>
      ${g.alumnos.length ? `<div class="g-tabla-w"><table class="g-tabla"><thead><tr><th style="width:40px">#</th><th>Nombre (puedes corregirlo aquí)</th><th style="width:44px"></th></tr></thead><tbody>
      ${g.alumnos.map((a, i) => `<tr><td>${i + 1}</td><td><input class="g-in-nom" value="${gEsc(a.nombre)}" onchange="gRenombrarAlumno('${a.id}',this.value)"></td><td><button class="g-x" title="Quitar" onclick="gQuitarAlumno('${a.id}')">✕</button></td></tr>`).join('')}
      </tbody></table></div>` : '<p style="color:var(--gris);font-size:13.5px;margin:0 0 10px">Este grupo todavía no tiene alumnos. Pega tu lista abajo o súbela desde Excel.</p>'}
      <details class="gg-det" style="margin-top:14px" ${g.alumnos.length ? '' : 'open'}><summary>➕ Agregar alumnos</summary>
        <div class="campo" style="margin-top:10px"><label>Uno por renglón</label>
        <textarea id="gg-lista" rows="5" placeholder="Pega aquí tu lista de asistencia:&#10;1. AGUILAR PECH JUAN&#10;2. BALAM CHAN MARÍA"></textarea>
        <div class="ayuda">Puedes copiar la lista desde Excel o Word. Se quitan solos los números del inicio y los nombres repetidos.</div></div>
        ${gUiArchivo('gg-lista')}
        <button class="g-btn" onclick="gAgregarAlumnos('gg-lista')">Agregar a la lista</button></details>
    </div>`;
    h += gTarjetaDescarga(g);
  }
  h += `<details class="card gg-det"${gs.length ? '' : ' open'}><summary class="card-title" style="cursor:pointer">💾 Respaldo de mis grupos</summary>
    <p class="g-resp-fecha" style="margin:0 0 10px;font-weight:600;color:var(--azul)">${gRespTexto()}</p>
    <button class="g-btn" onclick="gRespaldar()">⬇ Descargar respaldo</button>
    <label class="g-btn g-btn-s" style="display:inline-block;cursor:pointer">⬆ Restaurar respaldo<input type="file" accept=".json,application/json" style="display:none" onchange="gRestaurar(this)"></label>
    <div class="ayuda" style="font-size:12px;color:var(--gris);margin-top:10px;line-height:1.5">💡 <b>Qué se respalda (todo):</b> tus grupos con su lista de alumnos, el pase de lista, los criterios, actividades, libreta de trabajos, exámenes, calificaciones y recuperativos; los datos de tu escuela, tu horario, la bitácora, el historial de planeaciones, los temas guardados y los archivos que subiste (calendario escolar, etc.). Los respaldos hechos antes de esta versión solo traían grupos y calificaciones, y también se pueden restaurar.<br><br>🛡️ <b>Cuida tu información:</b> tus datos se guardan solo en este equipo, por eso conviene respaldar seguido (por ejemplo cada semana y siempre antes de borrar datos del navegador, formatear o cambiar de computadora). El archivo se descarga en <b>Descargas</b>: guárdalo en una carpeta tuya, en una USB o mándalo a tu correo.<br>📱 <b>Celular u otra computadora:</b> la información no se sincroniza sola. Para verla en otro equipo, descarga el respaldo aquí, pásalo a ese equipo (AirDrop, correo o WhatsApp) y usa «Restaurar respaldo» allá. Restaurar reemplaza lo que ya haya en ese equipo.</div></details>`;
  gPanel().innerHTML = h;
}

// ============================================================
// 2. PASE DE LISTA
// ============================================================
// Se marca alumno por alumno: al empezar nadie tiene marca. Tocar otra vez la misma letra quita la marca.
function gMarcar(aid, code) {
  const g = gGrupo(); const f = G.fecha;
  if (!g.asist[f]) g.asist[f] = {};
  if (g.asist[f][aid] === code) delete g.asist[f][aid]; else g.asist[f][aid] = code;
  if (!Object.keys(g.asist[f]).length) delete g.asist[f];
  gGuardar(); gRenderListaSinSalto();
}
function gRenderListaSinSalto() {
  const el = document.scrollingElement || document.documentElement, y = el.scrollTop;
  const sc = gPanel().closest('.main, main, .content, #contenido') || null, y2 = sc ? sc.scrollTop : 0;
  gRenderLista(); el.scrollTop = y; if (sc) sc.scrollTop = y2;
}
function gMarcados(g) { const d = g.asist[G.fecha]; return d ? g.alumnos.filter(a => d[a.id]).length : 0; }
function gTodosPresentes(g) { const d = g.asist[G.fecha]; return !!(d && g.alumnos.length && g.alumnos.every(a => d[a.id] === 'P')); }
function gTodos(code) {
  const g = gGrupo();
  if (code === 'P' && gTodosPresentes(g)) { delete g.asist[G.fecha]; gGuardar(); gRenderLista(); return; }   // segundo toque: quita la lista del día
  const d = g.asist[G.fecha] || (g.asist[G.fecha] = {});
  g.alumnos.forEach(a => { if (!d[a.id]) d[a.id] = code; });   // solo a los que faltan por marcar
  gGuardar(); gRenderListaSinSalto();
}
function gBorrarDia() {
  const g = gGrupo(); if (!g.asist[G.fecha]) return;
  if (!confirm('¿Borrar la lista de este día?')) return;
  delete g.asist[G.fecha]; gGuardar(); gRenderLista();
}
function gFecha(v) { if (v) { G.fecha = v; gRenderLista(); } }
function gDia(n) { G.fecha = gSumarDias(G.fecha, n); gRenderLista(); }
function gPeriodo(v) { G.periodoLista = v; gRenderLista(); }

function gResumenAsistencia(g, periodo) {
  const tr = periodo === 'actual' ? gTrimDeFecha(G.fecha) : (periodo === 'todo' ? 0 : +periodo);
  const dias = Object.keys(g.asist).filter(f => !tr || gTrimDeFecha(f) === tr).sort();
  const filas = g.alumnos.map(a => {
    const c = { P: 0, R: 0, F: 0, J: 0 };
    dias.forEach(f => { const v = g.asist[f][a.id]; if (v) c[v]++; });
    const tot = c.P + c.R + c.F + c.J;
    return { a, c, tot, pct: tot ? Math.round((c.P + c.R) * 100 / tot) : null };
  });
  return { tr, dias, filas };
}
function gAsistGrupo(g, periodo) {
  const rs = gResumenAsistencia(g, periodo);
  let pr = 0, tot = 0;
  rs.filas.forEach(f => { pr += f.c.P + f.c.R; tot += f.tot; });
  return { dias: rs.dias.length, pct: tot ? Math.round(pr * 100 / tot) : null };
}
// Porcentaje de asistencia e inasistencia de TODOS los grupos del docente, ordenados por grado
function gAsistTodosHTML(per) {
  const gs = G.data.grupos.slice().sort((a, b) => String(a.grado).localeCompare(String(b.grado)) || a.nombre.localeCompare(b.nombre, 'es'));
  if (gs.length < 2) return '';
  const filas = gs.map(x => {
    const r = gAsistGrupo(x, per), mal = r.pct != null && r.pct < 80;
    return `<tr${x.id === G.gid ? ' style="background:#eef6ff"' : ''}><td><b>${gEsc(x.nombre)}</b></td><td>${G_ORD[x.grado] || x.grado + '°'} grado</td><td>${gEsc(x.materia)}</td><td>${x.alumnos.length}</td><td>${r.dias}</td><td class="${mal ? 'g-mal' : ''}"><b>${r.pct == null ? '—' : r.pct + '%'}</b></td><td class="${mal ? 'g-mal' : ''}"><b>${r.pct == null ? '—' : (100 - r.pct) + '%'}</b></td><td><button class="g-btn g-btn-s" style="margin:0;padding:4px 10px" onclick="gElegirGrupo('${x.id}')">Ver</button></td></tr>`;
  }).join('');
  return `<div class="card"><div class="card-title">📊 Asistencia de todos mis grupos</div>
    <div class="g-tabla-w"><table class="g-tabla"><thead><tr><th>Grupo</th><th>Grado</th><th>Materia</th><th>Alumnos</th><th>Días con lista</th><th>% asist.</th><th>% inasist.</th><th></th></tr></thead><tbody>${filas}</tbody></table></div>
    <div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">Mismo periodo que el resumen de arriba. % de asistencia = (asistencias + retardos) ÷ registros del grupo. En rojo: menos de 80 %.</div></div>`;
}
function gRenderLista() {
  const g = gGrupo();
  if (!g) return gRenderListaInicio();
  const dia = g.asist[G.fecha];
  let h = `<div class="sec-title">Pase de lista</div><div class="sec-sub">Toca la letra de cada alumno: <b>✓</b> presente, <b>R</b> retardo, <b>F</b> falta, <b>J</b> justificada. Se guarda solo. Si te equivocas, toca otra vez la misma letra para quitarla.</div>${gGruposPanelHTML(false)}<div style="font-size:15px;font-weight:700;color:var(--azul);margin:0 2px 10px">📋 Grupo: ${gEsc(g.nombre)} · ${gEsc(g.materia)} (${G_ORD[g.grado] || g.grado + '°'} grado)</div>${gTarjetaAlumnos(g)}
  <div class="card"><div class="g-fecha">
    <button class="g-btn g-btn-s" onclick="gDia(-1)">‹</button>
    ${(() => { const nd = gFechaBonita(G.fecha).split(',')[0], fin = /^(Sábado|Domingo)$/.test(nd); return `<span title="${fin ? 'Fin de semana' : 'Día de la semana'}" style="display:inline-flex;align-items:center;padding:9px 14px;border-radius:10px;font-weight:800;font-size:15px;background:${fin ? '#fef3c7' : 'var(--azul)'};color:${fin ? '#92400e' : '#fff'}">${nd}</span>`; })()}
    <input type="date" value="${G.fecha}" onchange="gFecha(this.value)">
    <button class="g-btn g-btn-s" onclick="gDia(1)">›</button>
    <button class="g-btn g-btn-s" onclick="gFecha(gHoy())">Hoy</button></div>
    <div style="font-size:13px;color:var(--gris);margin:8px 0 12px;">${gFechaBonita(G.fecha)} ${dia ? (gMarcados(g) >= g.alumnos.length ? '· <span style="color:var(--verde)">lista completa</span>' : `· <span style="color:#b45309">${gMarcados(g)} de ${g.alumnos.length} marcados — faltan ${g.alumnos.length - gMarcados(g)}</span>`) : '· <span>sin registrar</span>'}</div>`;
  if (!g.alumnos.length) h += `<p style="color:var(--gris)">Este grupo aún no tiene alumnos. Agrégalos en el recuadro de arriba: teclea los nombres o sube tu lista de Excel o Word.</p>`;
  else {
    h += `<div style="margin-bottom:12px">${gTodosPresentes(g) ? `<button class="g-btn g-btn-s" style="border-color:var(--verde);color:var(--verde)" title="Toca otra vez para quitar la lista de este día" onclick="gTodos('P')">✓ Todos presentes — toca para quitar</button>` : (gMarcados(g) >= g.alumnos.length ? '' : `<button class="g-btn" onclick="gTodos('P')">${gMarcados(g) ? `✓ Los demás presentes (${g.alumnos.length - gMarcados(g)})` : '✓ Todos presentes'}</button>`)} ${dia ? '<button class="g-btn g-btn-x" onclick="gBorrarDia()">Borrar día</button>' : ''}</div>
    <div class="g-lista">` + g.alumnos.map((a, i) => {
      const v = dia ? dia[a.id] : null;
      return `<div class="g-fila"><span class="g-n">${i + 1}</span><span class="g-nom">${gEsc(a.nombre)}</span><span class="g-st">` +
        ['P', 'R', 'F', 'J'].map(c => `<button class="g-st-${c}${v === c ? ' on' : ''}" title="${G_ESTADOS[c]}" onclick="gMarcar('${a.id}','${c}')">${c === 'P' ? '✓' : c}</button>`).join('') + '</span></div>';
    }).join('') + `</div>
    ${gFilaTotales(g, dia)}`;
  }
  h += '</div>';

  h += gTarjetaDescarga(g);
  // Resumen por alumno
  const per = G.periodoLista;
  const rs = gResumenAsistencia(g, per);
  h += `<div class="card"><div class="card-title">📈 Resumen de asistencia por alumno — ${gEsc(g.nombre)} · ${gEsc(g.materia)}</div>
    <div class="campo" style="max-width:300px"><label>Periodo</label><select onchange="gPeriodo(this.value)">
    <option value="actual"${per === 'actual' ? ' selected' : ''}>Trimestre de la fecha elegida (${G_TRIM_NOM[gTrimDeFecha(G.fecha)]})</option>
    <option value="1"${per === '1' ? ' selected' : ''}>Primer trimestre</option><option value="2"${per === '2' ? ' selected' : ''}>Segundo trimestre</option><option value="3"${per === '3' ? ' selected' : ''}>Tercer trimestre</option>
    <option value="todo"${per === 'todo' ? ' selected' : ''}>Todo el ciclo</option></select></div>`;
  if (!rs.dias.length) h += `<p style="color:var(--gris)">Todavía no hay días registrados en este periodo.</p>`;
  else {
    h += `<div class="g-tabla-w"><table class="g-tabla"><thead><tr><th>#</th><th>Alumno</th><th>Asist.</th><th>Ret.</th><th>Faltas</th><th>Just.</th><th>% asist.</th><th>% inasist.</th></tr></thead><tbody>` +
      rs.filas.map((f, i) => `<tr><td>${i + 1}</td><td>${gEsc(f.a.nombre)}</td><td>${f.c.P}</td><td>${f.c.R}</td><td>${f.c.F}</td><td>${f.c.J}</td><td class="${f.pct != null && f.pct < 80 ? 'g-mal' : ''}"><b>${f.pct == null ? '—' : f.pct + '%'}</b></td><td class="${f.pct != null && f.pct < 80 ? 'g-mal' : ''}"><b>${f.pct == null ? '—' : (100 - f.pct) + '%'}</b></td></tr>`).join('') +
      `</tbody></table></div>
    <div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">${rs.dias.length} día(s) con lista. % de asistencia = (asistencias + retardos) ÷ días registrados. % de inasistencia = lo que resta para 100 % (faltas y justificadas). En rojo: menos de 80 % de asistencia.</div>
    <button class="g-btn" style="margin-top:12px" onclick="gDescargarAsistencia()">⬇ Descargar resumen en Word</button>`;
  }
  h += '</div>';
  h += gAsistTodosHTML(per);
  gPanel().innerHTML = h;
}
// Totales del día alineados bajo cada columna de botones (✓ R F J)
function gFilaTotales(g, dia) {
  const c = { P: 0, R: 0, F: 0, J: 0 }; if (dia) g.alumnos.forEach(a => { if (dia[a.id]) c[dia[a.id]]++; });
  const sin = g.alumnos.length - (c.P + c.R + c.F + c.J);
  const col = { P: '#16a34a', R: '#d97706', F: '#dc2626', J: '#2563a8' };
  return `<div class="g-lista" style="margin-top:8px"><div class="g-fila g-total"><span class="g-n"></span>
    <span class="g-nom"><b>Total del día</b><br><small style="color:var(--gris)">✓ Presentes · R Retardos · F Faltas · J Justificadas${sin > 0 && dia ? ` · <b style="color:#b45309">${sin} sin marcar</b>` : ''}</small></span>
    <span class="g-st">${['P', 'R', 'F', 'J'].map(k => `<div title="${G_ESTADOS[k]}"><b style="color:${col[k]}">${c[k]}</b><small>${k === 'P' ? '✓' : k}</small></div>`).join('')}</span></div></div>`;
}
function gConteoDia(g, dia) {
  const c = { P: 0, R: 0, F: 0, J: 0 }; g.alumnos.forEach(a => { if (dia[a.id]) c[dia[a.id]]++; });
  const sin = g.alumnos.length - (c.P + c.R + c.F + c.J);
  return `${c.P} ✓ · ${c.R} R · ${c.F} F · ${c.J} J${sin > 0 ? ` · ${sin} sin marcar` : ''}`;
}
function gEncabezadoDoc(titulo, g, extra) {
  return `<p style="text-align:center;margin:0"><b>${gEsc(gEscuela() || 'Escuela Secundaria')}</b></p>
  <p style="text-align:center;margin:0"><b>${titulo}</b></p>
  <p><b>Docente:</b> ${gEsc(gDocente())} &nbsp; <b>Grupo:</b> ${gEsc(g.nombre)} &nbsp; <b>Materia:</b> ${gEsc(g.materia)}${extra ? ' &nbsp; ' + extra : ''}</p>`;
}
function gDescargarAsistencia() {
  const g = gGrupo(); const rs = gResumenAsistencia(g, G.periodoLista);
  const per = G.periodoLista === 'todo' ? 'Todo el ciclo' : G_TRIM_NOM[rs.tr];
  const th = t => `<td style="border:1px solid #000;padding:4px;background:#BDD7EE;font-weight:bold">${t}</td>`;
  const td = t => `<td style="border:1px solid #000;padding:4px">${t}</td>`;
  const html = gEncabezadoDoc('RESUMEN DE ASISTENCIA', g, `<b>Periodo:</b> ${per} (${rs.dias.length} días con lista)`) +
    `<table style="width:100%;border-collapse:collapse"><tr>${['#', 'Alumno', 'Asistencias', 'Retardos', 'Faltas', 'Justificadas', '% asistencia', '% inasistencia'].map(th).join('')}</tr>` +
    rs.filas.map((f, i) => `<tr>${[i + 1, gEsc(f.a.nombre), f.c.P, f.c.R, f.c.F, f.c.J, f.pct == null ? '—' : f.pct + '%', f.pct == null ? '—' : (100 - f.pct) + '%'].map(td).join('')}</tr>`).join('') + '</table>';
  descargarWord(html, `Asistencia_${g.nombre.replace(/\W+/g, '_')}_${per.replace(/\W+/g, '_')}.doc`);
}

// ============================================================
// 3. CALIFICACIONES
// ============================================================
function gActsTrim(g, t) { return g.actividades.filter(a => a.trim === t); }
// Calificación por criterio y final de un alumno en un trimestre (escala 0-10).
// Los pesos (%) son por trimestre: g.pesos[t][criterioId]. Si un trimestre no tiene el suyo, usa el del criterio (compatibilidad con grupos anteriores).
function gTrimActual() { return typeof G.trimCalif === 'number' ? G.trimCalif : gTrimDeFecha(gHoy()); }
function gPct(g, cid, t) {
  const p = g.pesos && g.pesos[t];
  if (p && p[cid] != null) return +p[cid] || 0;
  const c = g.criterios.find(x => x.id === cid); return c ? (+c.pct || 0) : 0;
}
function gPesosTrim(g, t) {
  if (!g.pesos) g.pesos = {};
  if (!g.pesos[t]) g.pesos[t] = {};
  g.criterios.forEach(c => { if (g.pesos[t][c.id] == null) g.pesos[t][c.id] = +c.pct || 0; });
  return g.pesos[t];
}
// Criterio «Asistencia» automático: sale del Pase de lista (presente, retardo y falta justificada cuentan como asistencia).
function gAsistNota(g, aid, t) {
  let tot = 0, ok = 0;
  Object.keys(g.asist || {}).forEach(f => { if (gTrimDeFecha(f) !== t) return; const v = (g.asist[f] || {})[aid]; if (!v) return; tot++; if (v !== 'F') ok++; });
  return tot ? ok / tot * 10 : null;
}
function gAutoAsistencia(cid) { const g = gGrupo(), c = g.criterios.find(x => x.id === cid); if (c) { c.auto = 'asistencia'; gGuardar(); gRenderCalif(); } }
function gPrimerManual(g) { return g.criterios.find(c => !c.auto) || g.criterios[0]; }
// ── NE («no entregó») y casillas pendientes ──
// · Casilla vacía = «sin calificar»: NUNCA se convierte en 0 sola (ni en datos viejos).
// · a.ne[idAlumno] = true marca NE en una actividad (la nota a.notas no se toca). Si hay nota, la nota manda.
// · g.neModo: 'pendiente' (por defecto: no promedia hasta que el docente decida) | 'cero' (NE cuenta como 0). Los grupos anteriores no lo tienen = 'pendiente'.
// · Mientras haya casillas sin calificar o NE pendientes, la calificación es provisional («pendiente») y no se descarga el concentrado ni la boleta.
function gNeModo(g) { return g && g.neModo === 'cero' ? 'cero' : 'pendiente'; }
function gEsNE(a, aid) { return !!(a.ne && a.ne[aid]) && a.notas[aid] == null; }
function gCalcAlumno(g, aid, t, sinRec) {
  const porCrit = {}, pend = []; let suma = 0, pcts = 0;
  const neCero = gNeModo(g) === 'cero';
  g.criterios.forEach(c => {
    const pc = gPct(g, c.id, t);
    if (c.auto === 'asistencia') { const v = gAsistNota(g, aid, t); if (v != null) { porCrit[c.id] = v; suma += v * pc; pcts += pc; } else { porCrit[c.id] = null; if (pc > 0) pend.push({ tipo: 'asist', crit: c.id }); } return; }
    const vals = [], acts = gActsTrim(g, t).filter(a => a.criterioId === c.id);
    acts.forEach(a => {
      const n = a.notas[aid];
      if (n != null && a.max > 0) vals.push(n / a.max * 10);
      else if (a.max > 0) {   // casilla sin nota: NE o vacía
        if (gEsNE(a, aid)) { if (neCero) vals.push(0); else if (pc > 0) pend.push({ tipo: 'ne', crit: c.id, act: a.id }); }
        else if (pc > 0) pend.push({ tipo: 'vacia', crit: c.id, act: a.id });
      }
    });
    let hayLib = false;
    if (typeof gLibretaScore === 'function') { const ls = gLibretaScore(g, aid, t, c.id); if (ls != null) { vals.push(ls); hayLib = true; } }   // Libreta de trabajos
    if (vals.length) { const s = vals.reduce((x, y) => x + y, 0) / vals.length; porCrit[c.id] = s; suma += s * pc; pcts += pc; }
    else { porCrit[c.id] = null; if (pc > 0 && !acts.length && !hayLib) pend.push({ tipo: 'criterio', crit: c.id }); }   // criterio con peso y sin ninguna calificación
  });
  let final = pcts > 0 ? suma / pcts : null, rec = null;
  const R = !sinRec && g.recup && g.recup[t];
  if (R && final != null && R.notas && R.notas[aid] != null && R.max > 0) {   // recuperativo: se aplica según lo que decidió el maestro
    const n = Math.min(10, R.notas[aid] / R.max * 10), orig = final;
    final = R.modo === 'prom' ? (orig + n) / 2 : R.modo === 'seis' ? (n >= 6 ? Math.max(orig, 6) : orig) : Math.max(orig, n);
    rec = { orig, n };
  }
  return { porCrit, final, pcts, rec, pend };   // pend = casillas que faltan (vacías, NE pendientes, criterios sin notas)
}
// Promedio anual: SOLO con los tres trimestres completos (con calificación y sin casillas pendientes). Si falta alguno: completo = false («Incompleto»).
function gCalcAnual(g, aid) {
  const rs = [1, 2, 3].map(t => gCalcAlumno(g, aid, t)), bs = rs.map(r => gBoleta(r.final));
  const faltan = [1, 2, 3].filter((t, i) => bs[i] == null || rs[i].pend.length);
  if (faltan.length) return { completo: false, faltan, prom: null, fin: null, n: bs.filter(b => b != null).length };
  const prom = bs.reduce((x, y) => x + y, 0) / 3;
  return { completo: true, faltan: [], prom, fin: gFinalAnual(prom), n: 3 };   // prom = promedio exacto; fin = promedio final con un decimal (el que se muestra y se exporta)
}
// ── Casillas pendientes del grupo (para avisos y para bloquear descargas) ──
// Un trimestre «iniciado» es el que ya tiene alguna nota, NE o pase de lista; los que aún no empiezan no cuentan como pendientes.
function gTrimIniciado(g, t) {
  if (gActsTrim(g, t).some(a => Object.keys(a.notas || {}).length || Object.keys(a.ne || {}).length)) return true;
  if (Object.keys(g.asist || {}).some(f => gTrimDeFecha(f) === t && Object.keys(g.asist[f] || {}).length)) return true;
  const L = g.libreta && g.libreta[t];
  return !!(L && typeof gLibretaScore === 'function' && L.crit && g.alumnos.some(al => gLibretaScore(g, al.id, t, L.crit) != null));
}
function gPendItemTxt(g, t, it, multi) {
  const c = g.criterios.find(x => x.id === it.crit), cn = c ? c.nombre : 'Criterio', a = it.act && g.actividades.find(x => x.id === it.act);
  const base = it.tipo === 'asist' ? 'Asistencia (sin pase de lista)' : it.tipo === 'criterio' ? cn + ' (sin calificaciones)' : (a ? a.nombre : 'Actividad') + (it.tipo === 'ne' ? ' (NE pendiente)' : ' (sin calificar)');
  return (multi ? 'T' + t + ': ' : '') + base;
}
function gPendientes(g, trims) {
  const ts = trims.filter(t => gTrimIniciado(g, t)), multi = trims.length > 1, lista = []; let total = 0;
  g.alumnos.forEach(al => {
    const det = []; ts.forEach(t => gCalcAlumno(g, al.id, t).pend.forEach(it => det.push(gPendItemTxt(g, t, it, multi))));
    if (det.length) { lista.push({ nombre: al.nombre, n: det.length, det }); total += det.length; }
  });
  return { total, nAl: lista.length, lista, trims: ts };
}
function gPlural(n, s, p) { return n + ' ' + (n === 1 ? s : p); }
function gPendResumen(p) { return 'faltan ' + gPlural(p.total, 'casilla', 'casillas') + ' de ' + gPlural(p.nAl, 'alumno', 'alumnos'); }
function gPendBanner(g, trims) {
  const p = gPendientes(g, trims); if (!p.total) return '';
  const filas = p.lista.slice(0, 15).map(x => `<li><b>${gEsc(x.nombre)}</b> (${x.n}): ${x.det.slice(0, 4).map(gEsc).join(', ')}${x.det.length > 4 ? ' y ' + (x.det.length - 4) + ' más' : ''}</li>`).join('');
  return `<div style="background:#fffbeb;border:1.5px solid #fcd34d;border-radius:10px;padding:10px 14px;margin:0 0 12px;font-size:12.5px;color:#78350f;line-height:1.5">⏳ <b>Calificación pendiente:</b> ${gPendResumen(p)}. Mientras falten, la calificación es provisional y <b>no se puede descargar</b> el concentrado ni la boleta. Escribe la nota o toca <b>NE</b> si no entregó.<details style="margin-top:6px"><summary style="cursor:pointer;font-weight:600">Ver quién y qué falta</summary><ul style="margin:6px 0 0 18px;padding:0">${filas}</ul>${p.lista.length > 15 ? `<div style="margin-top:4px">…y ${p.lista.length - 15} alumnos más</div>` : ''}</details></div>`;
}
// Si hay pendientes devuelve { p, corto, largo } para avisar y NO descargar; si no, null
function gBloqueo(g, trims) {
  const p = gPendientes(g, trims); if (!p.total) return null;
  const quien = p.lista.slice(0, 5).map(x => x.nombre + ' (' + x.n + ')').join(', ') + (p.lista.length > 5 ? ' y ' + (p.lista.length - 5) + ' más' : '');
  const corto = 'No se puede descargar todavía: ' + gPendResumen(p) + '. ' + quien + '. Escribe la nota o NE.';
  return { p, corto, largo: corto + '\n\n' + p.lista.slice(0, 12).map(x => '• ' + x.nombre + ': ' + x.det.slice(0, 4).join(', ') + (x.det.length > 4 ? ' y ' + (x.det.length - 4) + ' más' : '')).join('\n') + (p.lista.length > 12 ? '\n…y ' + (p.lista.length - 12) + ' alumnos más' : '') };
}
function gConcTrims() { const s = document.getElementById('gc-solo'); return s && s.value !== 'todos' ? [+s.value] : [1, 2, 3]; }
// Repinta los avisos de pendientes que están en pantalla (captura del trimestre y concentrado), conservando si el detalle estaba abierto
function gPintarPend() {
  const g = gGrupo(); if (!g) return;
  [['g-pend', () => G.trimCalif === 'anual' ? [] : [G.trimCalif]], ['gc-pend', gConcTrims]].forEach(([id, f]) => {
    const e = document.getElementById(id); if (!e) return;
    const ab = e.querySelector('details'), abierto = !!(ab && ab.open), ts = f();
    e.innerHTML = ts.length ? gPendBanner(g, ts) : '';
    if (abierto) { const d = e.querySelector('details'); if (d) d.open = true; }
  });
}
// Estilos de NE y «pendiente» (van aquí para no tocar index.html)
(function () {
  if (document.getElementById('g-ne-css')) return;
  const s = document.createElement('style'); s.id = 'g-ne-css';
  s.textContent = '.g-nebtn{display:block;margin:2px auto 0;font-size:9px;line-height:1;padding:2px 6px;border:1px solid #cbd5e1;border-radius:5px;background:#fff;color:#64748b;cursor:pointer}'
    + '.g-nebtn.on{background:#fef3c7;border-color:#f59e0b;color:#92400e;font-weight:700}'
    + '.g-nota.g-ne-in{background:#fffbeb;border-color:#f59e0b;color:#92400e;font-weight:700;text-transform:uppercase}'
    + '.g-pend-tag{display:inline-block;font-size:10px;font-weight:700;color:#92400e;background:#fef3c7;border:1px solid #fcd34d;border-radius:999px;padding:0 6px;margin:2px 0 0 4px;white-space:nowrap}'
    + '.g-cap2 .g-fin .g-pend-tag{display:block;margin:3px auto 0;font-size:9px}'
    + '.g-cap2 td.g-pendf{background:#fffbeb!important}'
    + '.g-reac.g-reac-rev{background:#fffbeb;border-color:#f59e0b;box-shadow:0 0 0 2px #fde68a}'
    + '.g-rev-tag{font-size:11px;font-weight:700;color:#92400e}'
    + '.g-revbox{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 12px;margin:4px 0 12px}'
    + '.g-btn:disabled{opacity:.45;cursor:not-allowed}'
    + '.g-clave-tag{display:inline-block;font-size:10.5px;font-weight:700;border-radius:999px;padding:1px 8px;margin-left:4px;white-space:nowrap}'
    + '.g-clave-ok{color:#166534;background:#dcfce7;border:1px solid #86efac}.g-clave-no{color:#92400e;background:#fef3c7;border:1px solid #fcd34d}';
  document.head.appendChild(s);
})();
function gSumaPct(g, t) { t = t || gTrimActual(); return g.criterios.reduce((s, c) => s + gPct(g, c.id, t), 0); }
function gTrimCalif(v) { G.trimCalif = v === 'anual' ? 'anual' : +v; gRenderCalif(); }

function gCriterioNombre(v, cid) { const c = gGrupo().criterios.find(x => x.id === cid); if (c && v.trim()) { if (!c.rol) c.rol = gEsCritExamen(c) ? 'examen' : (gEsCritProyecto(c) ? 'proyecto' : 'otro'); c.nombre = v.trim(); gGuardar(); gRenderCalifSinSalto(); } }
function gCriterioPct(cid, v) { const g = gGrupo(); const c = g.criterios.find(x => x.id === cid); if (c) { gPesosTrim(g, gTrimActual())[cid] = Math.max(0, Math.min(100, gNum(v) || 0)); gGuardar(); gActualizarSumaPct(); gActualizarResumen(); } }
function gActualizarSumaPct() {
  const g = gGrupo(); const s = gSumaPct(g, gTrimActual()); const f = s === 100 ? `<span style="color:var(--verde)">✓ Suma 100 %</span>` : `<span class="g-mal">Suma ${s} % — debe sumar 100 %${s < 100 ? ` (te faltan ${100 - s} %)` : ` (te pasas ${s - 100} %)`}</span>`;
  ['g-suma', 'g-suma2', 'g-suma3'].forEach(id => { const e = document.getElementById(id); if (e) e.innerHTML = f; });
}
function gAgregarCriterio(nombre) { const g = gGrupo(); const c = { id: gId(), nombre: nombre || 'Nuevo criterio', pct: 0 }; if (nombre === 'Asistencia') c.auto = 'asistencia'; g.criterios.push(c); gGuardar(); gRenderCalif(); const ins = document.querySelectorAll('.g-crit-f input:first-child'); const ult = ins[ins.length - 1]; if (ult) { ult.focus(); ult.select(); } }
// Reparte `objetivo` puntos entre los criterios `ids` (proporcional a lo que ya tienen, múltiplos de 5 cuando se puede).
function gRepartir(P, ids, objetivo) {
  if (!ids.length || objetivo < 0) return;
  const u = objetivo % 5 === 0 ? 5 : 1, T = objetivo / u, S = ids.reduce((x, id) => x + (P[id] || 0), 0);
  const raw = ids.map(id => S > 0 ? (P[id] || 0) / S * T : T / ids.length);
  const base = raw.map(Math.floor); let resto = T - base.reduce((x, y) => x + y, 0);
  raw.map((r, i) => [r - base[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (resto > 0) { base[i]++; resto--; } });
  ids.forEach((id, i) => { P[id] = base[i] * u; });
}
function gQuitarCriterio(cid) {
  const g = gGrupo(); const n = g.actividades.filter(a => a.criterioId === cid).length;
  if (g.criterios.length <= 1) { gAviso('Debe quedar al menos un criterio.'); return; }
  if (!confirm(n ? `Este criterio tiene ${n} actividad(es). Se pasarán al primer criterio de la lista. ¿Continuar?` : '¿Quitar este criterio?')) return;
  const nombreQ = (g.criterios.find(c => c.id === cid) || {}).nombre;
  const liberado = {}; [1, 2, 3].forEach(t => { liberado[t] = gSumaPct(g, t) === 100 ? gPct(g, cid, t) : null; });
  g.criterios = g.criterios.filter(c => c.id !== cid);
  Object.values(g.pesos || {}).forEach(p => { delete p[cid]; });
  let repartido = false;
  [1, 2, 3].forEach(t => {
    if (!liberado[t]) return;
    const P = gPesosTrim(g, t), fijos = gIdsEvaluacion(g);
    let ids = g.criterios.filter(c => !fijos.includes(c.id)).map(c => c.id);
    if (!ids.length) ids = g.criterios.map(c => c.id);
    gRepartir(P, ids, ids.reduce((x, id) => x + (P[id] || 0), 0) + liberado[t]); repartido = true;
  });
  G.critMsg = repartido ? `Quitaste «${gEsc(nombreQ)}». Sus puntos se repartieron entre los demás criterios para que siga sumando 100 %; ajústalos si quieres.` : '';
  g.actividades.forEach(a => { if (a.criterioId === cid) a.criterioId = gPrimerManual(g).id; });
  gGuardar(); gRenderCalif();
}
function gRestablecerCriterios() {
  if (!confirm('¿Volver a los criterios sugeridos (alineados al Plano Didáctico: proceso 70 % + producto 30 %)? Las actividades pasarán al primer criterio.')) return;
  const g = gGrupo(); g.criterios = G_CRITERIOS_DEF.map(gCritDef); g.pesos = {};
  g.actividades.forEach(a => { a.criterioId = g.criterios[a.tipo === 'examen' ? 4 : 1].id; });
  gGuardar(); gRenderCalif();
}
// ── Valor del examen / proyecto en la calificación del trimestre (5 % a 100 %, de cinco en cinco) ──
function gEsCritExamen(c) { if (c.rol) return c.rol === 'examen'; return /exam/i.test(String(c.nombre).normalize('NFD').replace(/[̀-ͯ]/g, '')); }   // acepta «Examen», «Exámenes», «EXAMENES»…
function gEsCritProyecto(c) { if (c.rol) return c.rol === 'proyecto'; return /proyecto/i.test(String(c.nombre)); }
function gCritExamen(g) {
  let c = g.criterios.find(gEsCritExamen);
  if (!c) { c = { id: gId(), nombre: 'Exámenes', pct: 0 }; g.criterios.push(c); }
  return c;
}
// El examen y el proyecto se ajustan solo desde esta pantalla; los demás criterios se acomodan para que todo sume 100 %.
function gIdsEvaluacion(g) { const ce = g.criterios.find(gEsCritExamen), cp = g.criterios.find(c => gEsCritProyecto(c) && !gEsCritExamen(c)); return [ce && ce.id, cp && cp.id].filter(Boolean); }
function gMaxPeso(g, t, cid) {
  const P = gPesosTrim(g, t);
  return Math.max(0, 100 - gIdsEvaluacion(g).filter(id => id !== cid).reduce((s, id) => s + (P[id] || 0), 0));
}
function gAjustarPesos(g, t, cid, nuevo) {
  const P = gPesosTrim(g, t);
  const fijos = new Set(gIdsEvaluacion(g)); fijos.add(cid);
  const antes = {}; g.criterios.forEach(c => { antes[c.id] = P[c.id] || 0; });
  const sumaFijos = [...fijos].filter(id => id !== cid).reduce((s, id) => s + (P[id] || 0), 0);
  nuevo = Math.max(0, Math.min(100 - sumaFijos, Math.round((+nuevo || 0) / 5) * 5));
  P[cid] = nuevo;
  const libres = g.criterios.filter(c => !fijos.has(c.id));
  const objetivo = 100 - nuevo - sumaFijos;
  if (libres.length && objetivo >= 0) {
    const u = objetivo % 5 === 0 ? 5 : 1, T = objetivo / u, S = libres.reduce((x, c) => x + (P[c.id] || 0), 0);
    const raw = libres.map(c => S > 0 ? (P[c.id] || 0) / S * T : T / libres.length);
    const base = raw.map(Math.floor); let resto = T - base.reduce((x, y) => x + y, 0);
    raw.map((r, i) => [r - base[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (resto > 0) { base[i]++; resto--; } });
    libres.forEach((c, i) => { P[c.id] = base[i] * u; });
  }
  const cambios = g.criterios.filter(c => c.id !== cid && (P[c.id] || 0) !== antes[c.id]).map(c => ({ nombre: c.nombre, de: antes[c.id], a: P[c.id] || 0 }));
  return { nuevo, cambios };
}
function gMsgCambios(r) { return r.cambios.length ? `Los demás criterios se acomodaron para que todo siga sumando 100 %: ${r.cambios.map(c => `${gEsc(c.nombre)} ${c.de}→${c.a} %`).join(' · ')}. Puedes cambiarlos en «Calificaciones».` : ''; }
function gBarraPesos(g, t) {
  const ce = g.criterios.find(gEsCritExamen), cp = g.criterios.find(c => gEsCritProyecto(c) && !gEsCritExamen(c));
  const e = ce ? gPct(g, ce.id, t) : 0, p = cp ? gPct(g, cp.id, t) : 0, tot = gSumaPct(g, t), resto = Math.max(0, tot - e - p), ancho = Math.max(tot, 100);
  const seg = (v, col) => v > 0 ? `<div style="width:${v / ancho * 100}%;background:${col}"></div>` : '';
  const li = (col, txt) => `<span style="display:inline-flex;align-items:center;gap:5px;margin-right:14px"><i style="width:10px;height:10px;border-radius:3px;background:${col};display:inline-block"></i>${txt}</span>`;
  return `<div style="display:flex;height:16px;border-radius:8px;overflow:hidden;background:#e5e7eb;margin:12px 0 6px">${seg(e, '#2563eb')}${seg(p, '#7c3aed')}${seg(resto, '#94a3b8')}</div>
    <div style="font-size:12.5px;color:var(--gris)">${li('#2563eb', `Examen <b>${e} %</b>`)}${li('#7c3aed', `Proyecto <b>${p} %</b>`)}${li('#94a3b8', `Lo demás (asistencia, tareas, participación…) <b>${resto} %</b>`)}</div>
    ${tot === 100 ? '' : `<div style="color:#b45309;font-size:12.5px;margin-top:6px">⚠ Tus criterios suman ${tot} % y deben sumar 100 %. Ajústalos en «Calificaciones».</div>`}`;
}
function gPesoCardHTML(g, t) {
  const modo = G.evalModo === 'proyecto' ? 'proyecto' : 'examen';
  const c = modo === 'proyecto' ? g.criterios.find(x => gEsCritProyecto(x) && !gEsCritExamen(x)) : g.criterios.find(gEsCritExamen);
  const val = c ? gPct(g, c.id, t) : 0, max = c ? gMaxPeso(g, t, c.id) : 100;
  const ops = []; for (let v = 0; v <= max; v += 5) ops.push(v); if (!ops.includes(val)) ops.push(val); ops.sort((a, b) => a - b);
  const nom = modo === 'proyecto' ? 'proyecto' : 'examen';
  return `<div class="g-trims" style="margin-bottom:10px"><button class="ttab${modo === 'examen' ? ' on' : ''}" onclick="gEvalModo('examen')">📝 Examen</button><button class="ttab${modo === 'proyecto' ? ' on' : ''}" onclick="gEvalModo('proyecto')">🧩 Proyecto</button></div>
    <div class="ayuda" style="margin:-2px 0 12px;font-size:12.5px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;color:#166534">✅ <b>Puedes usar los dos en el mismo trimestre.</b> Cada uno tiene su propio porcentaje (los dos aparecen en la barra de abajo) y juntos se suman en la calificación. Elige una pestaña para ver y capturar lo de ese apartado; si solo aplicas uno, deja el otro en 0 %.</div>
    <div class="campo" style="max-width:380px;margin-bottom:0"><label>¿Cuánto vale el ${nom} en la calificación de este trimestre?</label>
      <select id="g-peso-sel" onchange="gPesoEval(this.value)">${ops.map(v => `<option value="${v}"${v === val ? ' selected' : ''}>${v === 0 ? '0 % — no cuenta este trimestre' : v + ' %'}</option>`).join('')}</select></div>
    <div class="ayuda" style="margin-top:6px">Ejemplo: si vale <b>${val} %</b>, un alumno que saca <b>8</b> suma <b>${Math.round(8 * val) / 100}</b> de los 10 puntos de su calificación. ${modo === 'examen' ? 'Si das varios exámenes en el trimestre, <b>entre todos</b> valen ese porcentaje (se promedian).' : 'Las fases y el producto final se promedian y juntos valen ese porcentaje.'}</div>
    ${gBarraPesos(g, t)}
    ${G.pesoMsg ? `<div class="g-aviso" style="margin-top:8px;font-size:12.5px">ℹ️ ${G.pesoMsg}</div>` : ''}
    <div class="ayuda" style="margin-top:8px">Todo lo demás (asistencia, tareas, participación…) lo defines en «Calificaciones»; ahí se junta todo y sale la calificación final del trimestre.</div>`;
}
function gPesoEval(v) {
  const g = gGrupo(), t = G.trimExam;
  const c = G.evalModo === 'proyecto' ? gCritProyecto(g) : gCritExamen(g);
  G.pesoMsg = gMsgCambios(gAjustarPesos(g, t, c.id, v));
  gGuardar(); const e = document.getElementById('g-peso-card'); if (e) e.innerHTML = gPesoCardHTML(g, t);
}
function gEvalModo(m) { const ta = document.getElementById('ge-tema'); if (ta) G.temaUlt = ta.value; G.evalModo = m; G.pesoMsg = ''; gRenderExamenes(); }
function gSinExamen() {
  const g = gGrupo(), t = G.trimExam, c = gCritExamen(g);
  G.pesoMsg = gMsgCambios(gAjustarPesos(g, t, c.id, 0));
  gGuardar(); gRenderExamenes();
}
function gCriteriosOpts(g, sel, t) { t = t || gTrimActual(); return g.criterios.filter(c => !c.auto).map(c => `<option value="${c.id}"${c.id === sel ? ' selected' : ''}>${gEsc(c.nombre)} (${gPct(g, c.id, t)}%)</option>`).join(''); }

function gAgregarActividad() {
  const g = gGrupo(); const t = G.trimCalif;
  const nombre = document.getElementById('ga-nom').value.trim();
  const max = gNum(document.getElementById('ga-max').value) || 10;
  if (!nombre) { gAviso('Ponle nombre a la actividad.'); return; }
  g.actividades.push({ id: gId(), trim: t, criterioId: document.getElementById('ga-crit').value, nombre, max, tipo: 'actividad', fecha: gHoy(), notas: {} });
  gGuardar(); gRenderCalif();
}
function gQuitarActividad(id) {
  const g = gGrupo(); const a = g.actividades.find(x => x.id === id); if (!a) return;
  if (!confirm(`¿Borrar «${a.nombre}» y sus calificaciones?`)) return;
  g.actividades = g.actividades.filter(x => x.id !== id); gGuardar(); gRender();
}
function gCriterioDeAct(id, cid) { const a = gGrupo().actividades.find(x => x.id === id); if (a) { a.criterioId = cid; gGuardar(); gRenderCalifSinSalto(); } }
function gNota(actId, aid, el) {
  const g = gGrupo(); const a = g.actividades.find(x => x.id === actId); if (!a) return;
  const raw = el.value.trim();
  if (raw === '') { delete a.notas[aid]; if (a.ne) delete a.ne[aid]; el.classList.remove('g-inval'); }   // vacía = «sin calificar» (no se vuelve 0)
  else if (/^ne$/i.test(raw)) { delete a.notas[aid]; (a.ne = a.ne || {})[aid] = true; el.classList.remove('g-inval'); }   // NE = no entregó
  else {
    const n = gNum(raw);
    if (n == null || n < 0 || n > a.max) { el.classList.add('g-inval'); return; }
    el.classList.remove('g-inval'); a.notas[aid] = n; if (a.ne) delete a.ne[aid];
  }
  { const ne = gEsNE(a, aid); el.classList.toggle('g-ne-in', ne); const b = el.nextElementSibling; if (b && b.classList.contains('g-nebtn')) b.classList.toggle('on', ne); }
  gGuardar(); gActualizarResumen();
  const ce = document.getElementById('gx-' + actId + '-' + aid); if (ce) ce.textContent = a.notas[aid] == null ? '—' : gFmt(a.notas[aid] / a.max * 10);
}
function gActualizarResumen() {
  const e = document.getElementById('g-resumen'); if (e) e.innerHTML = gResumenHTML();
  gActualizarCap(); gPintarPend();
}
// Botón «NE» de una casilla: alterna entre NE (no entregó) y vacía
function gNotaNE(actId, aid, btn) {
  const g = gGrupo(), a = g.actividades.find(x => x.id === actId), inp = btn.previousElementSibling; if (!a || !inp) return;
  inp.value = gEsNE(a, aid) ? '' : 'NE'; gNota(actId, aid, inp);
}
function gNotaNEDirecta(cid, aid, btn) {
  const inp = btn.previousElementSibling; if (!inp) return;
  inp.value = inp.value.trim().toUpperCase() === 'NE' ? '' : 'NE'; gNotaDirecta(cid, aid, inp);
}
// Qué hace un NE en este grupo: queda pendiente de recuperación (por defecto) o cuenta como 0
function gNeModoCambio(v) { const g = gGrupo(); if (!g) return; g.neModo = v === 'cero' ? 'cero' : 'pendiente'; gGuardar(); gRenderCalifSinSalto(); }

// ── Hoja de captura por criterio: cada criterio es un grupo de columnas con su % arriba; al final, la calificación final ──
function gCapColumnas(g, t) {
  const acts = gActsTrim(g, t);
  const L = g.libreta && g.libreta[t];
  const libCrit = (typeof gLibUsada === 'function' && gLibUsada(g, t)) ? L.crit : null;
  return g.criterios.map(c => {
    const cols = [];
    if (c.auto === 'asistencia') cols.push({ tipo: 'auto' });
    else {
      if (c.id === libCrit) cols.push({ tipo: 'lib' });
      acts.filter(a => a.criterioId === c.id).forEach(a => cols.push({ tipo: 'act', a }));
      if (!cols.length) cols.push({ tipo: 'directa' });
    }
    const prom = cols.length > 1;
    return { c, cols, prom, span: cols.length + (prom ? 1 : 0) };
  });
}
function gCapFinalHTML(r) { const b = gBoleta(r.final); return `<b>${b == null ? '—' : b}</b>${r.final == null ? '' : `<small>${gFmtCal(r.final, 1)}</small>`}${r.pend.length ? '<span class="g-pend-tag" title="Faltan notas: la calificación es provisional">pendiente</span>' : ''}`; }
function gCapHTML(g, t) {
  const grupos = gCapColumnas(g, t);
  let h1 = `<tr><th rowspan="2" class="g-c-n">#</th><th rowspan="2" class="g-sticky">Alumno</th>`, h2 = '<tr>';
  grupos.forEach(gr => {
    const c = gr.c;
    h1 += `<th colspan="${gr.span}" class="g-gh"><div class="g-gh-n" id="gh-${c.id}" contenteditable="true" spellcheck="false" title="Escribe encima para cambiar el nombre de este criterio" onblur="gCapNombre(this,'${c.id}')" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}">${gEsc(c.nombre)}</div><div class="g-gh-p" title="Su porcentaje se cambia arriba, en «Criterios de evaluación»">${gPct(g, c.id, t)}%</div></th>`;
    gr.cols.forEach(col => {
      if (col.tipo === 'lib') h2 += `<th class="g-sub"><div class="g-ah">📓 Libreta</div><small>entregados ÷ dejados</small></th>`;
      else if (col.tipo === 'auto') h2 += `<th class="g-sub"><div class="g-ah">🤖 Pase de lista</div></th>`;
      else if (col.tipo === 'directa') h2 += `<th class="g-sub"><div class="g-ah">Calif.</div><small>de 10</small></th>`;
      else { const a = col.a; h2 += `<th class="g-sub"><div class="g-ah" title="${gEsc(a.nombre)}">${a.tipo === 'examen' ? '📝 ' : ''}${gEsc(a.nombre)}</div><small>de ${a.max}</small>${a.tipo === 'directa' ? '' : `<select title="Criterio de esta actividad" onchange="gCriterioDeAct('${a.id}',this.value)">${gCriteriosOpts(g, a.criterioId, t)}</select><button class="g-x" title="Borrar esta actividad" onclick="gQuitarActividad('${a.id}')">✕</button>`}</th>`; }
    });
    if (gr.prom) h2 += `<th class="g-sub g-prom-h"><div class="g-ah">Prom.</div><small>del criterio</small></th>`;
  });
  h1 += `<th rowspan="2" class="g-fin g-fin-h">Calificación<br>final</th></tr>`; h2 += '</tr>';
  const filas = g.alumnos.map((al, i) => {
    const r = gCalcAlumno(g, al.id, t); let tds = '';
    grupos.forEach(gr => {
      gr.cols.forEach(col => {
        if (col.tipo === 'lib') { const sc = gLibretaScore(g, al.id, t, gr.c.id); tds += `<td class="g-ro" title="Viene de tu Libreta de trabajos">${sc == null ? '—' : gFmt(sc)}</td>`; }
        else if (col.tipo === 'auto') { const sc = gAsistNota(g, al.id, t); tds += `<td class="g-ro" title="Viene de tu Pase de lista">${sc == null ? '—' : gFmt(sc)}</td>`; }
        else if (col.tipo === 'act') { const a = col.a, ne = gEsNE(a, al.id); tds += `<td><input class="g-nota${ne ? ' g-ne-in' : ''}" type="text" inputmode="decimal" autocomplete="off" title="Escribe la nota (de 0 a ${a.max}) o NE si no entregó. Vacía = sin calificar" value="${ne ? 'NE' : (a.notas[al.id] == null ? '' : a.notas[al.id])}" oninput="gNota('${a.id}','${al.id}',this)"><button type="button" class="g-nebtn${ne ? ' on' : ''}" title="No entregó (NE)" onclick="gNotaNE('${a.id}','${al.id}',this)">NE</button></td>`; }
        else tds += `<td><input class="g-nota" type="text" inputmode="decimal" autocomplete="off" title="Escribe la nota (de 0 a 10) o NE si no entregó. Vacía = sin calificar" value="" oninput="gNotaDirecta('${gr.c.id}','${al.id}',this)"><button type="button" class="g-nebtn" title="No entregó (NE)" onclick="gNotaNEDirecta('${gr.c.id}','${al.id}',this)">NE</button></td>`;
      });
      if (gr.prom) tds += `<td class="g-ro g-prom" id="gp-${gr.c.id}-${al.id}">${gFmt(r.porCrit[gr.c.id])}</td>`;
    });
    const b = gBoleta(r.final);
    return `<tr><td class="g-c-n">${i + 1}</td><td class="g-sticky">${gEsc(al.nombre)}</td>${tds}<td class="g-fin${b != null && b < 6 && !r.pend.length ? ' g-mal' : ''}${r.pend.length ? ' g-pendf' : ''}" id="gf-${al.id}">${gCapFinalHTML(r)}</td></tr>`;
  }).join('');
  const msg = G.capMsg ? `<div class="g-aviso" style="margin-bottom:10px;font-size:12.5px;background:#ecfdf5;border-color:#6ee7b7">✓ ${G.capMsg}</div>` : ''; G.capMsg = '';
  return `<div class="card" id="g-cap2-card"><div class="card-title">✏️ Captura de calificaciones — ${G_TRIM_NOM[t]} <span id="g-suma3" style="margin-left:auto;font-size:12px;font-weight:700"></span></div>
    <p style="font-size:12.5px;color:var(--gris);margin:0 0 10px;line-height:1.5">Cada bloque es un criterio, con su <b>porcentaje arriba</b>. Escribe las notas y la <b>calificación final</b> se calcula sola. Puedes cambiar el nombre de un criterio escribiendo encima de su título.</p>${msg}
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 6px;font-size:12.5px"><label for="g-nemodo" style="font-weight:600">Si un alumno no entrega (NE), la actividad:</label><select id="g-nemodo" onchange="gNeModoCambio(this.value)" style="padding:5px 8px;border-radius:8px;border:1.5px solid var(--borde);font-size:12.5px"><option value="pendiente"${gNeModo(g) === 'pendiente' ? ' selected' : ''}>queda pendiente de recuperación (no promedia hasta que decidas)</option><option value="cero"${gNeModo(g) === 'cero' ? ' selected' : ''}>cuenta como 0</option></select></div>
    <p class="ayuda" style="font-size:11.5px;color:var(--gris);margin:0 0 10px;line-height:1.5">En cada casilla escribe la nota o toca <b>NE</b> (no entregó). Una casilla <b>vacía</b> significa «sin calificar»: nunca se convierte en 0 sola.</p>
    <div id="g-pend">${gPendBanner(g, [t])}</div>
    <div class="g-tabla-w"><table class="g-tabla g-cap2" id="g-cap2"><thead>${h1}${h2}</thead><tbody>${filas}</tbody></table></div>
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <button class="g-btn g-btn-s" onclick="gAgregarColumna()">＋ Otro criterio (columna que tú nombras)</button>
      <button class="g-btn" id="gcap-pdf" onclick="gCapPDF()">⬇ PDF de la hoja completa</button>
      <button class="g-btn" id="gcap-dir" onclick="gConcentradoExportar('pdf',${t})">⬇ PDF para Dirección (solo ${G_TRIM_NOM[t].toLowerCase()})</button>
    </div><div id="gcap-msg" style="display:none;font-size:12.5px;margin-top:8px"></div>
    <div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">El «PDF para Dirección» lleva solo la calificación de este trimestre y deja en blanco los otros dos y el promedio final.</div></div>`;
}
function gActualizarCap() {
  if (!document.getElementById('g-cap2')) return;
  const g = gGrupo(), t = G.trimCalif; if (!g || t === 'anual') return;
  g.alumnos.forEach(al => {
    const r = gCalcAlumno(g, al.id, t);
    g.criterios.forEach(c => { const e = document.getElementById('gp-' + c.id + '-' + al.id); if (e) e.textContent = gFmt(r.porCrit[c.id]); });
    const f = document.getElementById('gf-' + al.id);
    if (f) { f.innerHTML = gCapFinalHTML(r); const b = gBoleta(r.final); f.classList.toggle('g-mal', b != null && b < 6 && !r.pend.length); f.classList.toggle('g-pendf', r.pend.length > 0); }
  });
}
// Captura directa para un criterio que todavía no tiene actividades (crea la actividad al escribir la primera nota)
function gNotaDirecta(cid, aid, el) {
  const g = gGrupo(), t = G.trimCalif;
  let a = gActsTrim(g, t).find(x => x.tipo === 'directa' && x.criterioId === cid);
  if (!a) {
    if (el.value.trim() === '') return;
    const c = g.criterios.find(x => x.id === cid);
    a = { id: gId(), trim: t, criterioId: cid, nombre: c ? c.nombre : 'Calificación', max: 10, tipo: 'directa', fecha: gHoy(), notas: {} };
    g.actividades.push(a);
  }
  gNota(a.id, aid, el);
}
function gCapNombre(el, cid) {
  const c = gGrupo().criterios.find(x => x.id === cid); if (!c) return;
  const v = el.textContent.replace(/\s+/g, ' ').trim();
  if (!v) { el.textContent = c.nombre; return; }
  if (v !== c.nombre) gCriterioNombre(v, cid);
}
function gAgregarColumna() {
  const g = gGrupo(); const c = { id: gId(), nombre: 'Otro', pct: 0 }; g.criterios.push(c);
  G.capMsg = 'Agregaste la columna «Otro»: escríbele su nombre en el título de la columna y ponle su porcentaje arriba, en «Criterios de evaluación». Todo debe sumar 100 %.';
  gGuardar(); gRenderCalifSinSalto();
  const e = document.getElementById('gh-' + c.id); if (e) { e.focus(); const r = document.createRange(); r.selectNodeContents(e); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
}
function gCapMsg(t, ok) { const e = document.getElementById('gcap-msg'); if (!e) return; e.textContent = t; e.style.color = ok ? 'var(--verde)' : 'var(--rojo)'; e.style.display = t ? 'block' : 'none'; }
async function gCapPDF() {
  const g = gGrupo(), t = G.trimCalif; if (!g || t === 'anual' || !g.alumnos.length) return;
  const blq = gBloqueo(g, [t]); if (blq) { gCapMsg(blq.corto, false); gPintarPend(); return; }   // con casillas pendientes no se descarga
  const btn = document.getElementById('gcap-pdf'); if (btn) btn.disabled = true; gCapMsg('Preparando tu PDF…', true);
  try {
    await gCargarLib('jspdf', 'autotable');
    const p = gPerfil(), { jsPDF } = window.jspdf, doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'landscape' });
    const W = doc.internal.pageSize.getWidth(), Hh = doc.internal.pageSize.getHeight(), M = 30, lim = s => String(s == null ? '' : s).replace(/[—–]/g, '-').replace(/…/g, '...').replace(/[📝📓🤖]/gu, '').trim();
    const grupos = gCapColumnas(g, t);
    const head1 = [{ content: '#', rowSpan: 2 }, { content: 'Alumno', rowSpan: 2 }], head2 = [];
    grupos.forEach(gr => {
      head1.push({ content: lim(gr.c.nombre) + '\n' + gPct(g, gr.c.id, t) + '%', colSpan: gr.span });
      gr.cols.forEach(col => head2.push(col.tipo === 'lib' ? 'Libreta' : col.tipo === 'auto' ? 'Pase de lista' : col.tipo === 'directa' ? 'Calif.' : lim(col.a.nombre).slice(0, 40) + (col.a.max !== 10 ? ' (de ' + col.a.max + ')' : '')));
      if (gr.prom) head2.push('Prom.');
    });
    head1.push({ content: 'Calificación\nfinal', rowSpan: 2 });
    const calc = g.alumnos.map(a => ({ a, r: gCalcAlumno(g, a.id, t) }));
    const body = calc.map(({ a, r }, i) => {
      const fila = [i + 1, lim(a.nombre)];
      grupos.forEach(gr => {
        gr.cols.forEach(col => {
          if (col.tipo === 'lib') { const sc = gLibretaScore(g, a.id, t, gr.c.id); fila.push(sc == null ? '' : gFmt(sc)); }
          else if (col.tipo === 'auto') { const sc = gAsistNota(g, a.id, t); fila.push(sc == null ? '' : gFmt(sc)); }
          else if (col.tipo === 'act') fila.push(col.a.notas[a.id] == null ? '' : String(col.a.notas[a.id]));
          else fila.push('');
        });
        if (gr.prom) fila.push(r.porCrit[gr.c.id] == null ? '' : gFmt(r.porCrit[gr.c.id]));
      });
      const b = gBoleta(r.final); fila.push(b == null ? '' : String(b)); return fila;
    });
    const nCols = 3 + grupos.reduce((x, gr) => x + gr.span, 0) - 0, fs = nCols > 20 ? 6.5 : nCols > 14 ? 7.5 : 9, ult = nCols - 1;
    const fin = calc.map(x => x.r.final).filter(x => x != null), prom = fin.length ? fin.reduce((x, y) => x + y, 0) / fin.length : null;
    let y = 36;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text(lim(gEscuela() || 'Escuela Secundaria'), W / 2, y, { align: 'center' }); y += 16;
    doc.setFontSize(11.5); doc.text(lim('REGISTRO DE CALIFICACIONES - ' + G_TRIM_NOM[t].toUpperCase() + ' - CICLO ESCOLAR ' + G_CICLO_DOC), W / 2, y, { align: 'center' }); y += 16;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
    doc.text(lim(`Docente: ${gDocente()}     Grupo: ${g.nombre}     Materia: ${g.materia}     Grado: ${g.grado}°` + (p.cct ? `     CCT: ${p.cct}` : '') + (prom != null ? `     Promedio del grupo: ${gFmt(prom, 2)}` : '')), M, y);
    const colSt = { 0: { cellWidth: 20, halign: 'center' }, 1: { cellWidth: 118, halign: 'left' } }; colSt[ult] = { cellWidth: 54, halign: 'center', fontStyle: 'bold' };
    doc.autoTable({
      startY: y + 8, margin: { left: M, right: M, bottom: 44, top: 30 }, head: [head1, head2], body,
      styles: { font: 'helvetica', fontSize: fs, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.4, textColor: 0, minCellHeight: 15, valign: 'middle', halign: 'center', overflow: 'linebreak' },
      headStyles: { fillColor: [189, 215, 238], textColor: 0, fontStyle: 'bold', halign: 'center', valign: 'middle' },
      columnStyles: colSt,
      didParseCell: d => { if (d.section === 'body' && d.column.index === ult && d.cell.raw !== '' && Number(d.cell.raw) < 6) { d.cell.styles.textColor = [200, 30, 30]; } }
    });
    y = doc.lastAutoTable.finalY + 40;
    if (y > Hh - 60) { doc.addPage(); y = 90; }
    doc.setDrawColor(0); doc.line(M + 20, y, M + 230, y); doc.line(W - M - 230, y, W - M - 20, y); y += 12;
    doc.setFontSize(10); doc.text(lim(gDocente()), M + 125, y, { align: 'center' }); doc.text(lim(p.director || 'Director(a)'), W - M - 125, y, { align: 'center' }); y += 12;
    doc.text('Docente', M + 125, y, { align: 'center' }); doc.text('Director(a)', W - M - 125, y, { align: 'center' });
    const n = doc.internal.getNumberOfPages();
    for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(100); doc.text('Hoja ' + i + ' de ' + n, W - M, Hh - 18, { align: 'right' }); }
    const limp = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '');
    gDescargarBlob(doc.output('blob'), ['Calificaciones_T' + t, limp(g.nombre), limp(g.materia)].filter(Boolean).join('_') + '.pdf');
    gCapMsg('Listo, tu PDF se descargó.', true);
  } catch (e) { gCapMsg(e.message || 'No se pudo crear el PDF.', false); }
  if (btn) btn.disabled = false;
}
// Nota del recuperativo (sobre 10) de un alumno en un trimestre, o '' si no tiene
function gRecNotaTxt(g, t, aid) {
  const R = g.recup && g.recup[t];
  if (!R || !R.notas || R.notas[aid] == null || !(R.max > 0)) return '';
  return String(Math.round(Math.min(10, R.notas[aid] / R.max * 10) * 10) / 10);
}
function gResumenHTML() {
  const g = gGrupo(); const t = G.trimCalif;
  if (t === 'anual') {
    let h = gPendBanner(g, [1, 2, 3]) + `<table class="g-tabla"><thead><tr><th>#</th><th>Alumno</th><th>Trim. 1</th><th>Trim. 2</th><th>Trim. 3</th><th>Promedio final</th><th>Recuperativos</th></tr></thead><tbody>`;
    h += g.alumnos.map((a, i) => {
      const b = [1, 2, 3].map(x => gBoleta(gCalcAlumno(g, a.id, x).final)); const an = gCalcAnual(g, a.id);
      const fin = an.completo ? an.fin : null;   // solo con los tres trimestres completos
      return `<tr><td>${i + 1}</td><td>${gEsc(a.nombre)}</td>${b.map(x => `<td class="${x != null && x < 6 ? 'g-mal' : ''}">${x == null ? '—' : x}</td>`).join('')}<td class="${fin != null && !gAprobado(fin) ? 'g-mal' : ''}">${fin == null ? `<span class="g-pend-tag" title="El promedio anual necesita los tres trimestres completos">Incompleto</span> <small style="color:var(--gris)">falta ${an.faltan.map(x => 'T' + x).join(', ')}</small>` : `<b>${gFmt(fin, 1)}</b>`}${fin == null ? '' : gAprobado(fin) ? ' <span style="color:var(--verde);font-size:11px">Aprobado</span>' : ' <span style="font-size:11px">No aprobado</span>'}</td><td style="font-size:12.5px">${[1, 2, 3].map(x => { const n = gRecNotaTxt(g, x, a.id); return n ? `T${x}: <b>${n}</b>` : ''; }).filter(Boolean).join(' &nbsp; ') || '<span style="color:var(--gris)">—</span>'}</td></tr>`;
    }).join('');
    return h + `</tbody></table><div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-top:8px;line-height:1.5">Cada trimestre ya incluye su recuperativo, según lo que definiste. Los recuperativos se capturan en la pestaña <a href="#" onclick="gIrA('recup');return false" style="color:var(--azul-med);font-weight:600">Recuperativos</a>; aquí solo se muestran.</div>`;
  }
  const calc = g.alumnos.map(a => ({ a, r: gCalcAlumno(g, a.id, t) }));
  const fin = calc.map(x => x.r.final).filter(x => x != null);
  const prom = fin.length ? fin.reduce((x, y) => x + y, 0) / fin.length : null;
  const rep = calc.filter(x => x.r.final != null && !x.r.pend.length && gBoleta(x.r.final) < 6).length, nPend = calc.filter(x => x.r.pend.length).length;   // con pendientes aún no se les da por reprobados
  const hayRec = g.alumnos.some(a => gRecNotaTxt(g, t, a.id));
  let h = `<div class="g-stats"><div><b>${gFmt(prom, 2)}</b><span>Promedio del grupo</span></div><div><b>${fin.length}/${g.alumnos.length}</b><span>Alumnos con calificación</span></div><div><b class="${rep ? 'g-mal' : ''}">${rep}</b><span>Reprobados (&lt; 6)</span></div>${nPend ? `<div><b style="color:#92400e">${nPend}</b><span>Con notas pendientes</span></div>` : ''}</div>`;
  h += `<div class="g-tabla-w"><table class="g-tabla"><thead><tr><th>#</th><th>Alumno</th>${g.criterios.map(c => `<th>${gEsc(c.nombre)}<br><small>${gPct(g, c.id, t)}%</small></th>`).join('')}<th>Calif.</th><th>Boleta</th>${hayRec ? '<th>Recup.</th>' : ''}</tr></thead><tbody>`;
  h += calc.map(({ a, r }, i) => {
    const b = gBoleta(r.final);
    return `<tr><td>${i + 1}</td><td>${gEsc(a.nombre)}</td>${g.criterios.map(c => `<td>${gFmt(r.porCrit[c.id])}</td>`).join('')}<td>${gFmtCal(r.final, 2)}</td><td class="${b != null && b < 6 && !r.pend.length ? 'g-mal' : ''}"><b>${b == null ? '—' : b}</b>${r.pend.length ? ' <span class="g-pend-tag">pendiente</span>' : ''}${r.rec ? ' <small title="Con recuperativo" style="color:var(--azul-med)">(R)</small>' : ''}</td>${hayRec ? `<td>${gRecNotaTxt(g, t, a.id) || '—'}</td>` : ''}</tr>`;
  }).join('') + '</tbody></table></div>';
  if (fin.length && calc.some(x => x.r.pcts < 100 && x.r.final != null)) h += `<div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">Mientras haya casillas pendientes, la calificación es provisional: se calcula solo con lo registrado hasta ahora.</div>`;
  return h;
}

function gRenderCalifSinSalto() { const y = window.scrollY; gRenderCalif(); window.scrollTo(0, y); }
function gRenderCalif() {
  const g = gGrupo();
  if (!g) return gSinGrupo('Calificaciones', 'Criterios con ponderación, actividades y calificación del trimestre');
  const t = G.trimCalif;
  let h = `<div class="sec-title">Calificaciones y criterios de evaluación</div><div class="sec-sub">Define tus criterios, captura las notas y el sistema calcula la calificación del trimestre.</div>${gBarra()}
  <div class="g-trims">${[1, 2, 3].map(x => `<button class="ttab${t === x ? ' on' : ''}" onclick="gTrimCalif(${x})">${G_TRIM_NOM[x]}</button>`).join('')}<button class="ttab${t === 'anual' ? ' on' : ''}" onclick="gTrimCalif('anual')">Resumen anual</button></div>`;

  if (t !== 'anual') {
    const faltan = ['Asistencia', 'Tareas', 'Participación'].filter(n => !g.criterios.some(c => String(c.nombre).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().slice(0, 6))));
    h += `<div class="card"><div class="card-title g-titulo-azul">⚖️ Criterios de evaluación — ${G_TRIM_NOM[t]} <span id="g-suma" style="margin-left:auto;font-size:12px;font-weight:700"></span></div>
      <div class="g-aviso" style="margin-bottom:10px;font-size:13px">💡 <b>Estos criterios son solo sugeridos.</b> Puedes <b>cambiarles el nombre</b> (escribe encima), <b>quitar con 🗑</b> el que no uses y <b>agregar</b> los que necesites con «+ Criterio». Cuando quitas uno, sus puntos se reparten entre los demás.</div>
      ${(() => { const m = G.critMsg; G.critMsg = ''; return m ? `<div class="g-aviso" style="margin-bottom:10px;font-size:12.5px;background:#ecfdf5;border-color:#6ee7b7">✓ ${m}</div>` : ''; })()}
      <p style="font-size:12.5px;color:var(--gris);margin:0 0 10px">Escribe cuántos puntos de <b>100</b> vale cada cosa en este trimestre (asistencia, tareas, participación, examen, proyecto…). <b>Todo debe sumar 100 %.</b> El examen y el proyecto también se pueden ajustar desde «Exámenes». Cada trimestre tiene sus propios porcentajes. <b>«Asistencia»</b> se calcula sola con tu Pase de lista (las faltas justificadas no restan).</p>
      <div class="g-crit">${g.criterios.map(c => `<div class="g-crit-f"><input value="${gEsc(c.nombre)}" title="Escribe encima para cambiar el nombre" placeholder="Nombre del criterio" onchange="gCriterioNombre(this.value,'${c.id}')"><input type="number" min="0" max="100" step="5" value="${gPct(g, c.id, t)}" oninput="gCriterioPct('${c.id}',this.value)"><span>%</span>${c.auto ? `<small style="color:var(--verde);font-weight:600;white-space:nowrap" title="Se calcula con tu Pase de lista">🤖 del Pase de lista</small>` : (/asist/i.test(c.nombre) ? `<button class="g-btn g-btn-s" style="white-space:nowrap" onclick="gAutoAsistencia('${c.id}')">Calcular con el Pase de lista</button>` : '')}<button class="g-x" title="Quitar este criterio" style="font-size:16px" onclick="gQuitarCriterio('${c.id}')">🗑</button></div>`).join('')}</div>
      <div style="margin-top:8px"><span id="g-suma2" style="font-size:13px;font-weight:600"></span></div>
      <div style="margin-top:10px"><button class="g-btn g-btn-s" onclick="gAgregarCriterio()">+ Criterio</button> ${faltan.map(n => `<button class="g-btn g-btn-s" onclick="gAgregarCriterio('${n}')">+ ${n}</button>`).join(' ')} <button class="g-btn g-btn-s" onclick="gRestablecerCriterios()">Restablecer sugeridos</button></div></div>
    <div class="card"><div class="card-title">➕ Nueva actividad (${G_TRIM_NOM[t]})</div>
      <div class="f3"><div class="campo"><label>Nombre</label><input id="ga-nom" placeholder="Ej. Ensayo sobre la lectura"></div>
      <div class="campo"><label>Criterio</label><select id="ga-crit">${gCriteriosOpts(g, (g.criterios.filter(c => !c.auto)[1] || gPrimerManual(g)).id, t)}</select></div>
      <div class="campo"><label>Puntaje máximo</label><input id="ga-max" type="number" min="1" value="10"></div></div>
      <button class="g-btn" onclick="gAgregarActividad()">Agregar actividad</button>
      <span style="font-size:12px;color:var(--gris);margin-left:8px">Los exámenes se crean en la pestaña «Exámenes» y aparecen aquí también.</span></div>`;
    if (typeof gLibUsada === 'function' && gLibUsada(g, t)) { const cL = g.criterios.find(c => c.id === g.libreta[t].crit); if (cL) h += `<div class="g-aviso" style="margin-bottom:14px">📓 El criterio <b>${gEsc(cL.nombre)}</b> se calcula con tu <a href="#" onclick="gIrA('trabajos');return false" style="color:var(--azul-med);font-weight:600">Libreta de trabajos</a> (entregados ÷ trabajos dejados). Aquí no tienes que capturar nada para ese criterio.</div>`; }
    if (g.alumnos.length) h += gCapHTML(g, t);
    else h += `<div class="card g-vacio">Agrega alumnos en «Mis grupos» para capturar calificaciones.</div>`;
  }
  h += `<div class="card"><div class="card-title">🎓 ${t === 'anual' ? 'Resumen anual' : 'Calificación del ' + G_TRIM_NOM[t].toLowerCase()}</div><div id="g-resumen">${gResumenHTML()}</div>
    ${g.alumnos.length ? `<button class="g-btn" style="margin-top:12px" onclick="gDescargarCalif()">⬇ Descargar en Word</button>` : ''}</div>`;
  h += gConcentradoCard(g);
  gPanel().innerHTML = h;
  gActualizarSumaPct();
}
function gDescargarCalif() {
  const g = gGrupo(); const t = G.trimCalif;
  const blq = gBloqueo(g, t === 'anual' ? [1, 2, 3] : [t]); if (blq) { gAviso(blq.largo); gPintarPend(); return; }   // con casillas pendientes no se descarga
  const th = x => `<td style="border:1px solid #000;padding:4px;background:#BDD7EE;font-weight:bold;text-align:center">${x}</td>`;
  const td = x => `<td style="border:1px solid #000;padding:4px">${x}</td>`;
  let html, nom;
  if (t === 'anual') {
    html = gEncabezadoDoc('RESUMEN ANUAL DE CALIFICACIONES', g) + `<table style="width:100%;border-collapse:collapse"><tr>${['#', 'Alumno', 'Trim. 1', 'Trim. 2', 'Trim. 3', 'Promedio final', 'Recuperativos'].map(th).join('')}</tr>` +
      g.alumnos.map((a, i) => { const b = [1, 2, 3].map(x => gBoleta(gCalcAlumno(g, a.id, x).final)); const an = gCalcAnual(g, a.id); return `<tr>${[i + 1, gEsc(a.nombre), ...b.map(x => x == null ? '—' : x), an.completo ? gFmt(an.fin, 1) : 'Incompleto', [1, 2, 3].map(x => { const n = gRecNotaTxt(g, x, a.id); return n ? `T${x}: ${n}` : ''; }).filter(Boolean).join('  ')].map(td).join('')}</tr>`; }).join('') + '</table>';
    nom = 'Calificaciones_anual';
  } else {
    html = gEncabezadoDoc('REGISTRO DE CALIFICACIONES — ' + G_TRIM_NOM[t].toUpperCase(), g) +
      `<table style="width:100%;border-collapse:collapse"><tr>${['#', 'Alumno', ...g.criterios.map(c => `${gEsc(c.nombre)} (${gPct(g, c.id, t)}%)`), 'Calif.', 'Boleta'].map(th).join('')}</tr>` +
      g.alumnos.map((a, i) => { const r = gCalcAlumno(g, a.id, t); return `<tr>${[i + 1, gEsc(a.nombre), ...g.criterios.map(c => gFmt(r.porCrit[c.id])), gFmtCal(r.final, 2), r.final == null ? '—' : gBoleta(r.final)].map(td).join('')}</tr>`; }).join('') + '</table>';
    nom = 'Calificaciones_T' + t;
  }
  descargarWord(html, `${nom}_${g.nombre.replace(/\W+/g, '_')}.doc`);
}


// ── Concentrado de calificaciones para Dirección: Alumno · 1.º · 2.º · 3.º · Promedio final · Recuperativos ──
// (lo que entrega el maestro a Dirección; los trimestres sin captura quedan en blanco para llenarse a mano o en el archivo)
const G_CICLO_DOC = '2026-2027';
function gConcentradoCard(g) {
  if (!g.alumnos.length) return '';
  return `<div class="card"><div class="card-title">📋 Concentrado para Dirección</div>
    <p style="font-size:13px;color:var(--gris);margin:0 0 10px;line-height:1.5">Un solo cuadro con el <b>nombre de cada alumno</b>, su calificación del <b>1.º, 2.º y 3.er trimestre</b>, el <b>promedio final</b> y sus <b>recuperativos</b>. Los trimestres que todavía no capturas quedan <b>en blanco</b>, listos para llenarse. Descárgalo en el formato que necesites; en Word y Excel puedes <b>editarlo</b>.</p>
    <div class="campo" style="max-width:340px;margin-bottom:10px"><label>¿Qué trimestres lleva?</label><select id="gc-solo" onchange="gPintarPend()"><option value="todos">Todos los que ya tengan calificación</option><option value="1">Solo el 1.er trimestre (los demás y el promedio final en blanco)</option><option value="2">Solo el 2.º trimestre (los demás y el promedio final en blanco)</option><option value="3">Solo el 3.er trimestre (los demás y el promedio final en blanco)</option></select></div>
    <div id="gc-pend">${gPendBanner(g, [1, 2, 3])}</div>
    <button class="g-btn" id="gc-doc" onclick="gConcentradoExportar('doc')">⬇ Word</button>
    <button class="g-btn" id="gc-xls" onclick="gConcentradoExportar('xlsx')">⬇ Excel</button>
    <button class="g-btn" id="gc-pdf" onclick="gConcentradoExportar('pdf')">⬇ PDF</button>
    <div id="gc-msg" style="display:none;font-size:12.5px;margin-top:8px"></div>
    <div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">La calificación de cada trimestre es la de boleta (ya incluye el recuperativo si lo aplicaste). En el Excel, el promedio final se recalcula solo si cambias una calificación. El promedio final solo aparece con los tres trimestres completos (si falta alguno dice «Incompleto»). No se descarga mientras haya casillas pendientes.</div></div>`;
}
function gConcentradoDatos(g, solo) {   // solo = 1, 2 o 3: únicamente ese trimestre; los demás y el promedio final quedan en blanco
  const num = v => (Math.round(v * 10) / 10).toString();
  const filas = g.alumnos.map((a, i) => {
    const tr = [1, 2, 3].map(t => solo && t !== solo ? null : gBoleta(gCalcAlumno(g, a.id, t).final));
    const an = solo ? null : gCalcAnual(g, a.id), fin = an && an.completo ? an.fin : null, incompleto = !!(an && !an.completo);   // promedio final con un decimal (REGLA_CALIF) solo con los tres trimestres completos
    const rec = [1, 2, 3].map(t => { if (solo && t !== solo) return ''; const R = g.recup && g.recup[t]; return R && R.notas && R.notas[a.id] != null && R.max > 0 ? `T${t}: ${num(Math.min(10, R.notas[a.id] / R.max * 10))}` : ''; }).filter(Boolean).join('   ');
    return { n: i + 1, nombre: a.nombre, tr, fin, incompleto, rec };
  });
  return { filas, solo, titulo: 'CONCENTRADO DE CALIFICACIONES — CICLO ESCOLAR ' + G_CICLO_DOC, cols: ['No.', 'Alumno', '1.er trimestre', '2.º trimestre', '3.er trimestre', 'Promedio final', 'Recuperativos'] };
}
function gConcentradoNombre(g, ext, solo) {
  const lim = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '');
  return ['Concentrado_calificaciones', solo ? 'T' + solo : '', lim(g.nombre), lim(g.materia)].filter(Boolean).join('_') + '.' + ext;
}
function gConcentradoMsg(t, ok) { const e = document.getElementById('gc-msg'); if (!e) return; e.textContent = t; e.style.color = ok ? 'var(--verde)' : 'var(--rojo)'; e.style.display = t ? 'block' : 'none'; }
async function gConcentradoExportar(formato, solo) {
  const g = gGrupo(); if (!g || !g.alumnos.length) return;
  const desdeHoja = solo !== undefined;
  if (solo === undefined) { const sel = document.getElementById('gc-solo'); solo = sel && sel.value !== 'todos' ? +sel.value : null; }
  solo = solo || null;
  const blq = gBloqueo(g, solo ? [solo] : [1, 2, 3]);   // con casillas pendientes no se descarga
  if (blq) { (desdeHoja ? gCapMsg : gConcentradoMsg)(blq.corto, false); gPintarPend(); return; }
  const btns =['gc-doc', 'gc-xls', 'gc-pdf', 'gcap-dir'].map(id => document.getElementById(id));
  const msg = desdeHoja ? gCapMsg : gConcentradoMsg;
  btns.forEach(b => b && (b.disabled = true)); msg('Preparando tu archivo…', true);
  try {
    if (formato === 'doc') gConcentradoWord(g, solo); else if (formato === 'xlsx') await gConcentradoExcel(g, solo); else await gConcentradoPDF(g, solo);
    msg('Listo, tu archivo se descargó.', true);
  } catch (e) { msg(e.message || 'No se pudo crear el archivo.', false); }
  btns.forEach(b => b && (b.disabled = false));
}
function gConcentradoWord(g, solo) {
  const D = gConcentradoDatos(g, solo), p = gPerfil();
  const th = (x, w) => `<td style="border:1px solid #000;padding:5px;background:#BDD7EE;font-weight:bold;text-align:center${w ? ';width:' + w : ''}">${x}</td>`;
  const td = (x, c) => `<td style="border:1px solid #000;padding:5px;height:20px${c ? ';text-align:center' : ''}">${x}</td>`;
  const html = gEncabezadoDoc(D.titulo, g, `<b>Grado:</b> ${gEsc(g.grado)}°` + (p.cct ? ` &nbsp; <b>CCT:</b> ${gEsc(p.cct)}` : '')) +
    `<table style="width:100%;border-collapse:collapse"><tr>${th(D.cols[0], '5%')}${th(D.cols[1], '37%')}${th(D.cols[2], '12%')}${th(D.cols[3], '12%')}${th(D.cols[4], '12%')}${th(D.cols[5], '10%')}${th(D.cols[6], '12%')}</tr>` +
    D.filas.map(f => `<tr>${td(f.n, 1)}${td(gEsc(f.nombre))}${f.tr.map(x => td(x == null ? '' : x, 1)).join('')}${td(f.fin == null ? (f.incompleto ? 'Incompleto' : '') : '<b>' + gFmt(f.fin, 1) + '</b>', 1)}${td(gEsc(f.rec), 1)}</tr>`).join('') + '</table>' +
    `<p>&nbsp;</p><table style="width:100%;border-collapse:collapse"><tr><td style="width:45%;text-align:center;border-top:1px solid #000;padding-top:4px">${gEsc(gDocente())}<br>Docente</td><td style="width:10%"></td><td style="width:45%;text-align:center;border-top:1px solid #000;padding-top:4px">${gEsc(p.director || '')}<br>Director(a)</td></tr></table>`;
  descargarWord(html, gConcentradoNombre(g, 'doc', solo));
}
async function gConcentradoExcel(g, solo) {
  await gCargarLib('exceljs');
  const D = gConcentradoDatos(g, solo), p = gPerfil();
  const wb = new ExcelJS.Workbook(); wb.creator = 'Planeador Docente NEM';
  const ws = wb.addWorksheet('Concentrado', { pageSetup: { paperSize: 1, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } } });
  [5, 44, 13, 13, 13, 13, 24].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  const centro = { horizontal: 'center', vertical: 'middle', wrapText: true };
  const fila = (r, texto, tam, neg) => { ws.mergeCells(r, 1, r, 7); const c = ws.getCell(r, 1); c.value = texto; c.font = { bold: !!neg, size: tam }; c.alignment = { horizontal: 'center', vertical: 'middle' }; ws.getRow(r).height = tam + 9; };
  fila(1, gEscuela() || 'Escuela Secundaria', 13, true); fila(2, D.titulo, 11, true);
  fila(3, `Docente: ${gDocente()}     Grupo: ${g.nombre}     Materia: ${g.materia}     Grado: ${g.grado}°` + (p.cct ? `     CCT: ${p.cct}` : ''), 9.5, false);
  const rH = 5, hr = ws.getRow(rH); hr.height = 30;
  const borde = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  D.cols.forEach((t, i) => { const c = hr.getCell(i + 1); c.value = t; c.font = { bold: true, size: 10, color: { argb: 'FF1A3A5C' } }; c.alignment = centro; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } }; c.border = borde; });
  D.filas.forEach((f, i) => {
    const r = rH + 1 + i, row = ws.getRow(r); row.height = 21;
    row.getCell(1).value = f.n; row.getCell(2).value = f.nombre;
    f.tr.forEach((v, k) => { row.getCell(3 + k).value = v == null ? null : v; });
    // Promedio final con un decimal; misma regla que REGLA_CALIF.final (truncar = INT(prom×10)/10, redondeo = ROUND(prom,1))
    const prom = `AVERAGE(C${r}:E${r})`, calc = REGLA_CALIF.final === 'redondeo' ? `ROUND(${prom},1)` : `INT(${prom}*10+0.000000001)/10`;
    row.getCell(6).value = { formula: solo ? `IF(COUNT(C${r}:E${r})<3,"",MAX(5,${calc}))` : `IF(COUNT(C${r}:E${r})<3,"Incompleto",MAX(5,${calc}))`, result: f.fin == null ? (f.incompleto ? 'Incompleto' : '') : f.fin };
    row.getCell(7).value = f.rec || null;
    for (let k = 1; k <= 7; k++) { const c = row.getCell(k); c.border = borde; c.font = { size: 10.5, bold: k === 6 }; c.alignment = k === 2 ? { vertical: 'middle', wrapText: true } : centro; }
    for (let k = 3; k <= 5; k++) row.getCell(k).numFmt = '0';
    row.getCell(6).numFmt = '0.0';
  });
  // reprobados (menos de 6) en rojo, también si el maestro edita la calificación
  const ref = `C${rH + 1}:F${rH + D.filas.length}`;
  ws.addConditionalFormatting({ ref, rules: [{ type: 'cellIs', operator: 'lessThan', formulae: ['6'], style: { font: { bold: true, color: { argb: 'FFDC2626' } } } }] });
  const rf = rH + D.filas.length + 4, fr = ws.getRow(rf);
  [[2, gDocente() + '\nDocente'], [5, (p.director || '') + '\nDirector(a)']].forEach(([col, txt]) => { const c = fr.getCell(col); c.value = txt; c.alignment = { horizontal: 'center', vertical: 'top', wrapText: true }; c.border = { top: { style: 'thin' } }; c.font = { size: 10 }; });
  ws.mergeCells(rf, 5, rf, 7); fr.height = 34;
  ws.pageSetup.printTitlesRow = rH + ':' + rH;
  ws.views = [{ state: 'frozen', xSplit: 2, ySplit: rH }];
  const buf = await wb.xlsx.writeBuffer();
  gDescargarBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), gConcentradoNombre(g, 'xlsx', solo));
}
async function gConcentradoPDF(g, solo) {
  await gCargarLib('jspdf', 'autotable');
  const D = gConcentradoDatos(g, solo), p = gPerfil();
  const { jsPDF } = window.jspdf, doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth(), Hh = doc.internal.pageSize.getHeight(), M = 40, lim = s => String(s == null ? '' : s).replace(/[—–]/g, '-').replace(/…/g, '...');
  let y = 46;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text(lim(gEscuela() || 'Escuela Secundaria'), W / 2, y, { align: 'center' }); y += 18;
  doc.setFontSize(11.5); doc.text(lim(D.titulo), W / 2, y, { align: 'center' }); y += 20;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(lim(`Docente: ${gDocente()}     Grupo: ${g.nombre}     Materia: ${g.materia}     Grado: ${g.grado}°` + (p.cct ? `     CCT: ${p.cct}` : '')), M, y); y += 8;
  doc.autoTable({
    startY: y + 6, margin: { left: M, right: M, bottom: 50 },
    head: [D.cols],
    body: D.filas.map(f => [f.n, lim(f.nombre), ...f.tr.map(x => x == null ? '' : x), f.fin == null ? (f.incompleto ? 'Incompleto' : '') : gFmt(f.fin, 1), lim(f.rec)]),
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 4, lineColor: [0, 0, 0], lineWidth: 0.5, textColor: 0, minCellHeight: 18, valign: 'middle' },
    headStyles: { fillColor: [189, 215, 238], textColor: 0, fontStyle: 'bold', halign: 'center' },
    columnStyles: { 0: { cellWidth: 26, halign: 'center' }, 1: { cellWidth: 'auto', halign: 'left' }, 2: { cellWidth: 52, halign: 'center' }, 3: { cellWidth: 52, halign: 'center' }, 4: { cellWidth: 52, halign: 'center' }, 5: { cellWidth: 52, halign: 'center', fontStyle: 'bold' }, 6: { cellWidth: 82, halign: 'center', fontSize: 8 } },
    didParseCell: d => { if (d.section === 'body' && d.column.index >= 2 && d.column.index <= 5 && d.cell.raw !== '' && Number(d.cell.raw) < 6) { d.cell.styles.textColor = [200, 30, 30]; d.cell.styles.fontStyle = 'bold'; } }
  });
  y = doc.lastAutoTable.finalY + 44;
  if (y > Hh - 80) { doc.addPage(); y = 90; }
  doc.setDrawColor(0); doc.line(M + 10, y, M + 210, y); doc.line(W - M - 210, y, W - M - 10, y); y += 12;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(lim(gDocente()), M + 110, y, { align: 'center' }); doc.text(lim(p.director || 'Director(a)'), W - M - 110, y, { align: 'center' }); y += 12;
  doc.text('Docente', M + 110, y, { align: 'center' }); doc.text('Director(a)', W - M - 110, y, { align: 'center' });
  const n = doc.internal.getNumberOfPages();
  for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(100); doc.text('Hoja ' + i + ' de ' + n, W - M, Hh - 20, { align: 'right' }); }
  gDescargarBlob(doc.output('blob'), gConcentradoNombre(g, 'pdf', solo));
}

// ============================================================
// 4. EXÁMENES
// ============================================================
const G_TIPOS_EXAM = {
  opcion_multiple: 'Opción múltiple', verdadero_falso: 'Verdadero / falso',
  respuesta_corta: 'Respuesta corta', desarrollo: 'Problema o pregunta abierta',
};
function gTrimExam(v) { G.trimExam = +v; G.pesoMsg = ''; G.borrador = null; G.temaUlt = ''; G.temasSel = []; gRenderExamenes(); }

// ── Contenidos y PDA elegidos para el examen ──
// El cuadro de temas trae «Título — Aprendizaje esperado: …» de lo que el docente marcó; para el prompt el PDA va aparte y ordenado.
function gTemaSinPDA(tema) { return String(tema || '').split('\n').map(l => l.replace(/\s+—\s+Aprendizaje esperado:.*$/, '')).join('\n'); }
// PDA de los temas que el docente marcó y que siguen escritos en el cuadro de temas
function gPdasElegidos(tema) {
  const por = new Map((G.temasLista || []).map(c => [c.k, c])), nt = gNorm(tema);
  return (G.temasSel || []).map(k => por.get(k)).filter(c => c && c.pda && nt.includes(gNorm(c.titulo))).map(c => ({ titulo: c.titulo, pda: String(c.pda).replace(/\s+/g, ' ').trim() }));
}
// Al IA NUNCA se le mandan datos de alumnos ni del grupo: el prompt solo usa materia, campo, grado, trimestre, temas, PDA, dificultad, número y tipos.
function gPromptExamen(g, o) {
  const conPda = !!(o.pdas && o.pdas.length);
  const tema = conPda ? gTemaSinPDA(o.tema) : o.tema;
  const pdaBloque = conPda ? `- PDA (aprendizajes esperados) de esos contenidos; cada reactivo debe evaluar uno de ellos:\n${o.pdas.map((p, i) => `  PDA ${i + 1} · ${p.titulo}: ${String(p.pda).slice(0, 600)}`).join('\n')}\n` : '';
  const reglaPda = conPda ? '\n- Cada reactivo trae el campo "pda": copia TEXTUAL, de la lista de PDA de arriba, el PDA que evalúa ese reactivo (no inventes otro).' : '';
  const ejPda = conPda ? ',"pda":"..."' : '';
  return `Eres docente experto de secundaria en México (Nueva Escuela Mexicana, Plan de Estudios 2022, Fase 6). Elabora un examen.
Responde SOLO con JSON válido, sin markdown ni texto extra.

DATOS:
- Materia: ${g.materia} | Campo formativo: ${gCampoDe(g.grado, g.materia)} | Grado: ${g.grado}° de secundaria
- ${G_TRIM_NOM[o.trim]}
- Temas o contenidos que se evalúan: ${tema}
${pdaBloque}- Dificultad: ${o.dif}
- Número de reactivos: ${o.n}
- Tipos de reactivo permitidos: ${o.tipos.map(t => G_TIPOS_EXAM[t]).join(', ')} (reparte los reactivos entre ellos)

REGLAS:
- Los reactivos deben evaluar comprensión y aplicación, no solo memoria; usa situaciones cercanas a estudiantes de México cuando sea natural.
- Lenguaje claro para adolescentes. Una sola respuesta correcta en cada reactivo.
- En opción múltiple da exactamente 4 opciones (sin la letra) y en "respuesta" pon la letra correcta: A, B, C o D. Distribuye las letras correctas.
- En verdadero_falso, "respuesta" es "Verdadero" o "Falso".
- En respuesta_corta y desarrollo, "respuesta" es la respuesta esperada o los puntos clave que debe incluir.
- "valor" es el puntaje del reactivo (1 para opción múltiple, verdadero/falso y respuesta corta; 2 para desarrollo).${reglaPda}

Formato:
{"titulo":"Examen de ... ","reactivos":[{"tipo":"opcion_multiple","pregunta":"...","opciones":["...","...","...","..."],"respuesta":"B","valor":1${ejPda}}]}`;
}
// ── Clave del examen: validación y normalización de lo que devuelve la IA ──
// Opción múltiple = exactamente 4 opciones y respuesta A, B, C o D; verdadero/falso = «Verdadero» o «Falso».
// Lo que no se pueda asegurar queda con respuesta vacía y marcado «revisar clave» (revisar:true) para que el docente lo corrija.
function gResolverLetra(resp, ops) {
  const t = String(resp == null ? '' : resp).trim(), nt = gNorm(t);
  if (!nt) return '';
  const iguales = ops.map((o, k) => (gNorm(o) === nt ? k : -1)).filter(k => k >= 0);   // la IA devolvió el TEXTO de la opción
  if (iguales.length === 1) return 'ABCD'[iguales[0]];
  if (iguales.length > 1) return '';
  const m = /^(?:opci[oó]n\s+)?\(?([A-Da-d])\)?\s*$/.exec(t) || /^\(?([A-Da-d])[).:]\s*(\S.*)$/.exec(t);   // «B», «(b)», «B) texto», «B. texto»
  if (!m) return '';
  const k = 'ABCD'.indexOf(m[1].toUpperCase());
  if (k < 0 || k >= ops.length || !gNorm(ops[k])) return '';
  if (m[2]) { const a = gNorm(m[2]), b = gNorm(ops[k]); if (!(a.includes(b) || b.includes(a))) return ''; }   // «B. algo» que no es la opción B → dudoso
  return 'ABCD'[k];
}
function gResolverVF(resp) {
  const t = String(resp == null ? '' : resp).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  if (/^(verdadero|cierto|true)\b/.test(t) || t === 'v') return 'Verdadero';
  if (/^(falso|false)\b/.test(t) || t === 'f') return 'Falso';
  return '';
}
// Devuelve el motivo si la clave del reactivo necesita revisión; '' si está en orden
function gRevReactivo(r) {
  if (r.motivo) return r.motivo;
  if (r.tipo === 'opcion_multiple') {
    const ops = Array.isArray(r.opciones) ? r.opciones : [];
    if (ops.length !== 4 || ops.some(o => !String(o).trim())) return 'debe tener exactamente 4 opciones con texto';
    if (new Set(ops.map(gNorm)).size < 4) return 'hay opciones repetidas';
    if ('ABCD'.indexOf(String(r.respuesta)) < 0 || String(r.respuesta).length !== 1) return 'la respuesta debe ser A, B, C o D';
    return '';
  }
  if (r.tipo === 'verdadero_falso') return (r.respuesta === 'Verdadero' || r.respuesta === 'Falso') ? '' : 'la respuesta debe ser Verdadero o Falso';
  return String(r.respuesta || '').trim() ? '' : 'falta la respuesta esperada';
}
function gNormPda(v, pdas) {
  if (!pdas || !pdas.length) return '';
  v = String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
  const nv = gNorm(v);
  if (nv) {
    const ig = pdas.find(p => gNorm(p.pda) === nv); if (ig) return ig.pda;
    if (nv.length >= 25) { const cont = pdas.filter(p => { const np = gNorm(p.pda); return np.includes(nv) || nv.includes(np); }); if (cont.length === 1) return cont[0].pda; }
    const num = /^pda\s*(\d+)/i.exec(v); if (num && pdas[+num[1] - 1]) return pdas[+num[1] - 1].pda;
  }
  return pdas.length === 1 ? pdas[0].pda : v;
}
function gNormalizarExamen(j, n, pdas) {
  const permit = Object.keys(G_TIPOS_EXAM);
  const rs = (Array.isArray(j.reactivos) ? j.reactivos : []).map(r => {
    const tipo = permit.includes(r.tipo) ? r.tipo : 'respuesta_corta';
    const o = { tipo, pregunta: String(r.pregunta || '').trim(), respuesta: String(r.respuesta == null ? '' : r.respuesta).trim(), valor: gNum(r.valor) || (tipo === 'desarrollo' ? 2 : 1) };
    if (pdas && pdas.length) o.pda = gNormPda(r.pda, pdas);
    if (tipo === 'opcion_multiple') {
      let ops = (Array.isArray(r.opciones) ? r.opciones : []).map(x => String(x == null ? '' : x).replace(/^\s*[A-Da-d][).]\s*/, '').trim()).filter(Boolean);
      if (ops.length > 4) { o.motivo = 'la IA dio más de 4 opciones y se dejaron las primeras 4'; ops = ops.slice(0, 4); }
      while (ops.length < 4) ops.push('');
      o.opciones = ops;
      o.respuesta = gResolverLetra(o.respuesta, ops);   // letra A-D, o '' si no se pudo asegurar cuál es
    } else if (tipo === 'verdadero_falso') o.respuesta = gResolverVF(o.respuesta);
    o.revisar = !!gRevReactivo(o);
    return o;
  }).filter(r => r.pregunta);
  return { titulo: String(j.titulo || 'Examen').trim(), reactivos: rs.slice(0, n) };
}
// ── Historial de exámenes generados: quedan 3 días en este dispositivo para abrirlos o bajarlos otra vez ──
// (si recargas la página o se te cierra, un examen sin guardar no se pierde). Pasados 3 días se borran solos; también puedes borrarlos antes.
const G_HIST_DIAS = 3;
function gHistClave() { const u = (typeof getUsuario === 'function') ? getUsuario() : null; return 'nem_hist_exam_' + ((u && u.uid) || 'anon'); }
function gHistEscribir(a) { try { localStorage.setItem(gHistClave(), JSON.stringify(a)); } catch (e) {} }
function gHistLeer() {
  let a = []; try { a = JSON.parse(localStorage.getItem(gHistClave()) || '[]'); } catch (e) {}
  if (!Array.isArray(a)) a = [];
  const lim = Date.now() - G_HIST_DIAS * 864e5, v = a.filter(x => x && x.ts > lim && Array.isArray(x.reactivos));
  if (v.length !== a.length) gHistEscribir(v);
  return v;
}
function gHistGuardarBorrador(b) {
  if (!b || b.editId || b.noHist) return;   // la clave de un examen ya guardado no entra: ese examen ya vive en su grupo
  const g = gGrupo(); if (!g) return;
  try {
    if (!b.histId) b.histId = gId();
    const a = gHistLeer(), i = a.findIndex(x => x.id === b.histId);
    const it = { id: b.histId, ts: i >= 0 ? a[i].ts : Date.now(), gid: g.id, grupo: g.nombre, materia: g.materia, trim: b.trim, titulo: b.titulo || 'Examen', tema: b.tema || '', criterioId: b.criterioId, conPda: !!b.conPda, revisado: b.revisado === true, reactivos: JSON.parse(JSON.stringify(b.reactivos)) };
    if (i >= 0) a[i] = it; else a.unshift(it);
    gHistEscribir(a.slice(0, 30));
  } catch (e) {}
}
function gHistVence(ts) {
  const r = ts + G_HIST_DIAS * 864e5 - Date.now(), d = Math.floor(r / 864e5), h = Math.floor((r % 864e5) / 36e5);
  return d >= 1 ? 'en ' + gPlural(d, 'día', 'días') : (h >= 1 ? 'en ' + gPlural(h, 'hora', 'horas') : 'en menos de una hora');
}
function gHistHTML() {
  const a = gHistLeer(); if (!a.length) return '';
  const fila = x => `<div style="border:1.5px solid var(--borde);border-radius:12px;padding:10px 12px;margin-bottom:8px">
      <div style="font-weight:700">${gEsc(x.titulo)}</div>
      <div style="font-size:12px;color:var(--gris);margin:2px 0 8px">${gEsc(x.grupo)} · ${G_TRIM_NOM[x.trim] || ''} · ${x.reactivos.length} reactivos · ${x.revisado ? '✓ clave revisada' : 'clave sin revisar'} · creado ${gEsc(new Date(x.ts).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }))} · <b>se borra ${gHistVence(x.ts)}</b></div>
      <button class="g-btn g-btn-s" style="margin:0 6px 6px 0" onclick="gHistAbrir('${x.id}')">✏️ Abrir y revisar</button>
      <button class="g-btn g-btn-s" style="margin:0 6px 6px 0" onclick="gHistDescargar('${x.id}',false)">⬇ Examen (Word)</button>
      <button class="g-btn g-btn-s" style="margin:0 6px 6px 0" onclick="gHistDescargar('${x.id}',true)">⬇ Clave (Word)</button>
      <button class="g-btn g-btn-s" style="margin:0 0 6px 0;color:#b91c1c" onclick="gHistBorrar('${x.id}')">🗑 Borrar</button></div>`;
  return `<details class="card g-det" id="g-hist" open><summary class="card-title" style="cursor:pointer">🕘 Mis exámenes generados (${a.length})</summary>
    <div class="g-aviso" style="margin:8px 0 12px;font-size:12.5px">Aquí quedan tus exámenes generados con IA durante <b>${G_HIST_DIAS} días</b>, para que los abras o los descargues las veces que necesites. <b>Pasado ese tiempo se borran solos</b> de este dispositivo; también puedes borrarlos antes. Los exámenes que guardes «para calificar» no se borran.</div>
    ${a.map(fila).join('')}
    <button class="g-btn g-btn-s" style="color:#b91c1c" onclick="gHistBorrarTodo()">🗑 Borrar todo el historial</button></details>`;
}
function gHistAbrir(id) {
  const x = gHistLeer().find(y => y.id === id); if (!x) { gRenderExamenes(); return; }
  if (G.data.grupos.some(g => g.id === x.gid)) { G.gid = x.gid; G.gidManual = true; }
  const g = gGrupo(); if (!g) return;
  G.trimExam = x.trim; G.temaUlt = x.tema || '';
  G.borrador = { titulo: x.titulo, reactivos: JSON.parse(JSON.stringify(x.reactivos)), tema: x.tema, trim: x.trim, criterioId: gCritExamen(g).id, conPda: x.conPda, revisado: x.revisado === true, histId: x.id };
  gRenderExamenes();
  const b = document.getElementById('g-borrador'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function gHistDescargar(id, clave) {
  const x = gHistLeer().find(y => y.id === id); if (!x) { gRenderExamenes(); return; }
  const g = G.data.grupos.find(y => y.id === x.gid) || { nombre: x.grupo, materia: x.materia, alumnos: [] };
  descargarWord(gExamenHTML(g, { titulo: x.titulo, reactivos: x.reactivos }, clave), `${clave ? 'Clave' : 'Examen'}_${String(x.materia || '').replace(/\W+/g, '_')}_${String(x.grupo || '').replace(/\W+/g, '_')}.doc`);
}
function gHistBorrar(id) {
  if (!confirm('¿Borrar este examen del historial? No se puede deshacer.')) return;
  if (G.borrador && G.borrador.histId === id) G.borrador.noHist = true;   // si lo tienes abierto, no vuelve a aparecer solo
  gHistEscribir(gHistLeer().filter(y => y.id !== id)); gRenderExamenes();
}
function gHistBorrarTodo() {
  if (!confirm('¿Borrar TODOS los exámenes del historial? No se puede deshacer. (Los que guardaste para calificar no se tocan.)')) return;
  if (G.borrador) G.borrador.noHist = true;
  gHistEscribir([]); gRenderExamenes();
}
async function gGenerarExamen() {
  const g = gGrupo(); const err = document.getElementById('ge-err');
  err.style.display = 'none';
  const tema = document.getElementById('ge-tema').value.trim();
  const n = Math.max(3, Math.min(licEsPrueba() ? 5 : 30, parseInt(document.getElementById('ge-n').value, 10) || (licEsPrueba() ? 5 : 10)));
  const tipos = Object.keys(G_TIPOS_EXAM).filter(t => document.getElementById('ge-t-' + t).checked);
  if (tema.length < 5) { err.textContent = 'Escribe los temas o contenidos que quieres evaluar.'; err.style.display = 'block'; return; }
  if (!tipos.length) { err.textContent = 'Elige al menos un tipo de reactivo.'; err.style.display = 'block'; return; }
  const btn = document.getElementById('ge-btn'); btn.disabled = true; btn.textContent = 'Generando examen…';
  try {
    const pdas = gPdasElegidos(tema);   // PDA de los temas que marcó el docente (puede ir vacío)
    const texto = await llamarGeminiJSON(gPromptExamen(g, { trim: G.trimExam, tema, pdas, n, tipos, dif: document.getElementById('ge-dif').value }), 'examen');
    const ex = gNormalizarExamen(parsearJSON(texto), n, pdas);
    if (!ex.reactivos.length) throw new Error('La IA no devolvió reactivos válidos.');
    G.temaUlt = tema;
    G.borrador = Object.assign(ex, { tema, trim: G.trimExam, criterioId: gCritExamen(g).id, conPda: pdas.length > 0, revisado: false });
    gHistGuardarBorrador(G.borrador);
    gRenderExamenes();
    const b = document.getElementById('g-borrador'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    err.textContent = 'No se pudo generar el examen: ' + (e.message || e) + ' Intenta de nuevo en unos segundos.'; err.style.display = 'block';
    btn.disabled = false; btn.textContent = '✨ Generar examen con IA';
  }
}
// ── Temas para el examen: salen de la planeación del maestro (o del programa) ──
// Al generar un Plano o un Analítico se guardan los contenidos elegidos (solo en este dispositivo);
// en «Exámenes» el maestro los marca y la IA arma el examen con ellos.
function gTemasClave() { const u = (typeof getUsuario === 'function') ? getUsuario() : null; return 'nem_temas_' + ((u && u.uid) || 'anon'); }
function gTemasLeer() { try { return JSON.parse(localStorage.getItem(gTemasClave()) || '[]'); } catch (e) { return []; } }
function gTemasGuardar(tipo, d) {
  try {
    const items = [];
    const mk = (trim, cnts, proy) => {
      if (!Array.isArray(cnts) || !cnts.length) return;
      items.push({ grado: String(d.grado), disciplina: d.disciplina, trim: +trim, proyecto: proy || '', fuente: tipo, contenidos: cnts.map(c => ({ num: c.num, titulo: c.titulo, pda: obtenerPDA(c, d.grado) })) });
    };
    if (tipo === 'analitico') [1, 2, 3].forEach(t => mk(t, (d['t' + t] || {}).contenidos, (d['t' + t] || {}).nombreProyecto));
    else mk(d.trimestre, d.contenidos, d.nombreProyecto);
    if (!items.length) return;
    const resto = gTemasLeer().filter(x => !items.some(n => n.grado === x.grado && n.disciplina === x.disciplina && n.trim === x.trim && n.proyecto === x.proyecto));
    localStorage.setItem(gTemasClave(), JSON.stringify(items.concat(resto).slice(0, 40)));
  } catch (e) { /* sin almacenamiento */ }
}
function gTemasCandidatos(g, t) {
  const grado = String(g.grado), vistos = new Set(), propios = [], programa = [];
  gTemasLeer().filter(x => x.grado === grado && x.disciplina === g.materia && x.trim === t).forEach(x => x.contenidos.forEach(c => {
    const k = c.num + '|' + c.titulo; if (vistos.has(k)) return; vistos.add(k); propios.push({ k, titulo: c.titulo, pda: c.pda || '', proy: x.proyecto });
  }));
  try { obtenerContenidos(gCampoDe(g.grado, g.materia), g.materia, grado).forEach(c => { const k = c.num + '|' + c.titulo; if (!vistos.has(k)) programa.push({ k, titulo: c.titulo, pda: obtenerPDA(c, grado) || '', proy: '' }); }); } catch (e) { /* sin programa para esta materia */ }
  return { propios, programa };
}
function gTemasPanel(g, t) {
  const { propios, programa } = gTemasCandidatos(g, t); G.temasLista = propios.concat(programa);
  if (!G.temasLista.length) return '';
  const sel = new Set(G.temasSel || []);
  const fila = c => `<label class="g-tema" style="display:flex;gap:8px;align-items:flex-start;text-align:left;text-transform:none;letter-spacing:0;font-weight:400;font-size:13px;margin:0;cursor:pointer"><input type="checkbox" style="margin-top:3px;width:auto;flex:none;padding:0" ${sel.has(c.k) ? 'checked' : ''} onchange="gTemasMarcar()" data-k="${gEsc(c.k)}"> <span><b>${gEsc(c.titulo)}</b>${c.proy ? ` <small style="color:var(--gris)">· ${gEsc(c.proy)}</small>` : ''}${c.pda ? `<small title="${gEsc(c.pda)}" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--gris);font-size:12px;line-height:1.4;margin-top:2px">📌 PDA (${g.grado}.°): ${gEsc(c.pda)}</small>` : ''}</span></label>`;
  return `<div class="campo"><label>${propios.length ? '📚 Temas de tu planeación de este trimestre' : '📚 Contenidos del programa'} (toca los que quieres evaluar; cada uno muestra su PDA del grado)</label>
    <div style="max-height:220px;overflow:auto;border:1px solid var(--gris-claro);border-radius:10px;padding:8px 10px;display:grid;gap:6px">${(propios.length ? propios : programa).map(fila).join('')}</div>
    ${propios.length && programa.length ? `<details style="margin-top:8px"><summary style="cursor:pointer;font-size:12.5px;color:var(--gris)">Ver otros contenidos del programa</summary><div style="max-height:200px;overflow:auto;border:1px solid var(--gris-claro);border-radius:10px;padding:8px 10px;display:grid;gap:6px;margin-top:6px">${programa.map(fila).join('')}</div></details>` : ''}
    <div class="ayuda">Al marcarlos se escriben abajo con su aprendizaje esperado; ahí mismo los puedes cambiar o agregar los tuyos.</div></div>`;
}
function gTemasMarcar() {
  const marcados = [...document.querySelectorAll('.g-tema input:checked')].map(i => i.dataset.k);
  G.temasSel = [...new Set(marcados)];
  const por = new Map((G.temasLista || []).map(c => [c.k, c]));
  const txt = G.temasSel.map(k => por.get(k)).filter(Boolean).map(c => `${c.titulo}${c.pda ? ' — Aprendizaje esperado: ' + String(c.pda).replace(/\s+/g, ' ').slice(0, 900) : ''}`).join('\n');
  const ta = document.getElementById('ge-tema'); if (ta) ta.value = txt;
}
// Edición del examen generado (pregunta, opciones y respuesta) antes de guardarlo o bajarlo
// Cambiar la respuesta o las opciones invalida la revisión: el docente vuelve a marcar «Revisé las respuestas correctas»
function gEditReac(i, campo, v) {
  const r = G.borrador && G.borrador.reactivos[i]; if (!r) return;
  r[campo] = v;
  if (campo === 'respuesta') { delete r.motivo; G.borrador.revisado = false; }
  gBorrActualizar();
}
function gEditOpc(i, k, v) { const r = G.borrador && G.borrador.reactivos[i]; if (r && r.opciones) { r.opciones[k] = v; delete r.motivo; G.borrador.revisado = false; gBorrActualizar(); } }
function gQuitarReactivo(i) { G.borrador.reactivos.splice(i, 1); if (!G.borrador.reactivos.length) G.borrador = null; gRenderExamenes(); }
function gTituloBorrador(v) { if (G.borrador) { G.borrador.titulo = v; gHistGuardarBorrador(G.borrador); } }
function gBorrPendientes(b) { return b.reactivos.filter(r => gRevReactivo(r)).length; }
function gBorrListo(b) { return !!b && b.revisado === true && gBorrPendientes(b) === 0; }
// Actualiza resaltados, casilla y botón sin volver a dibujar (así no se pierde el cursor al escribir)
function gBorrActualizar() {
  const b = G.borrador; if (!b) return;
  let n = 0;
  b.reactivos.forEach((r, i) => {
    const m = gRevReactivo(r); r.revisar = !!m; if (m) n++;
    const box = document.getElementById('g-reac-' + i); if (box) box.classList.toggle('g-reac-rev', !!m);
    const tag = document.getElementById('g-rv-' + i); if (tag) tag.textContent = m ? '⚠ Revisar clave: ' + m : '';
  });
  if (n) b.revisado = false;
  const chk = document.getElementById('g-rev-chk'); if (chk) { chk.disabled = n > 0; chk.checked = b.revisado === true; }
  const msg = document.getElementById('g-rev-msg');
  if (msg) msg.innerHTML = n ? `<b>${n}</b> reactivo(s) con <b>«revisar clave»</b> (en amarillo). Corrígelos para poder marcar la revisión.` : (b.revisado ? '✓ Clave revisada: ya puedes guardarlo para calificar y usarlo en el escáner.' : 'Lee cada pregunta con su respuesta y marca la casilla. Sin esto no se puede guardar ni usar en el escáner.');
  const bt = document.getElementById('g-btn-guardar'); if (bt) bt.disabled = !gBorrListo(b);
  gHistGuardarBorrador(b);
}
function gMarcarRevisado(v) { const b = G.borrador; if (!b) return; b.revisado = !!v && gBorrPendientes(b) === 0; gBorrActualizar(); }
// Pone la clave de un examen ya guardado en el editor para revisarla (no cambia los puntos ni las calificaciones capturadas)
function gRevisarGuardado(id) {
  const g = gGrupo(), ex = g.actividades.find(x => x.id === id); if (!ex || !ex.reactivos) return;
  const reactivos = JSON.parse(JSON.stringify(ex.reactivos)); reactivos.forEach(r => { r.revisar = !!gRevReactivo(r); });
  G.trimExam = ex.trim;
  G.borrador = { titulo: ex.nombre, reactivos, tema: ex.tema || '', trim: ex.trim, criterioId: ex.criterioId, editId: ex.id, conPda: reactivos.some(r => r.pda), revisado: false };
  gRenderExamenes();
  const b = document.getElementById('g-borrador'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function gMaxExamen(ex) { return ex.reactivos.reduce((s, r) => s + (r.valor || 1), 0); }

function gExamenHTML(g, ex, conClave) {
  const letras = 'ABCD';
  const items = ex.reactivos.map((r, i) => {
    let h = `<p style="margin:10px 0 3px"><b>${i + 1}.</b> ${gEsc(r.pregunta)} <span style="font-size:8pt">(${r.valor} pt${r.valor > 1 ? 's' : ''})</span></p>`;
    if (r.tipo === 'opcion_multiple') h += r.opciones.map((o, k) => `<p style="margin:0 0 0 24px">${letras[k]}) ${gEsc(o)}</p>`).join('');
    else if (r.tipo === 'verdadero_falso') h += `<p style="margin:0 0 0 24px">( ) Verdadero &nbsp;&nbsp; ( ) Falso</p>`;
    else if (r.tipo === 'respuesta_corta') h += `<p style="margin:6px 0 0 24px">R: ______________________________________________</p>`;
    else h += '<p style="margin:6px 0 0 24px">______________________________________________________</p>'.repeat(3);
    if (conClave) {
      const k = 'ABCD'.indexOf(r.respuesta), txt = r.tipo === 'opcion_multiple' && k >= 0 && r.opciones[k] ? `${r.respuesta}) ${r.opciones[k]}` : r.respuesta;
      h += `<p style="margin:2px 0 0 24px;color:#166534"><b>Respuesta:</b> ${gEsc(txt)}</p>`;
      if (r.pda) h += `<p style="margin:0 0 0 24px;font-size:9pt;color:#334155"><b>PDA:</b> ${gEsc(r.pda)}</p>`;   // el PDA va en la clave del docente, no en la hoja del alumno
    }
    return h;
  }).join('');
  const cab = conClave ? `<p style="text-align:center"><b>${gEsc(ex.titulo || ex.nombre)} — CLAVE DE RESPUESTAS</b></p>` :
    `<p style="text-align:center;margin:0"><b>${gEsc(gEscuela() || 'Escuela Secundaria')}</b></p><p style="text-align:center;margin:0"><b>${gEsc(ex.titulo || ex.nombre)}</b></p>
     <p><b>Alumno:</b> ______________________________________ &nbsp; <b>Grupo:</b> ${gEsc(g.nombre)} &nbsp; <b>Fecha:</b> ____________ &nbsp; <b>Calificación:</b> ______ / ${gMaxExamen(ex)}</p>
     <p style="font-size:9pt"><b>Indicaciones:</b> Lee con atención cada reactivo y responde en el espacio indicado. Docente: ${gEsc(gDocente())}.</p>`;
  return cab + items;
}
function gDescargarExamen(ex, clave) {
  const g = gGrupo();
  descargarWord(gExamenHTML(g, ex, clave), `${clave ? 'Clave' : 'Examen'}_${g.materia.replace(/\W+/g, '_')}_${g.nombre.replace(/\W+/g, '_')}.doc`);
}
function gGuardarExamen() {
  const g = gGrupo(); const b = G.borrador; if (!b) return;
  gBorrActualizar();
  if (!gBorrListo(b)) { gAviso(gBorrPendientes(b) ? 'Hay reactivos con «revisar clave». Corrígelos y marca «Revisé las respuestas correctas».' : 'Marca «Revisé las respuestas correctas» para poder guardar el examen.'); return; }
  const reactivos = b.reactivos.map(r => { const c = Object.assign({}, r); delete c.revisar; delete c.motivo; return c; });
  if (b.editId) {   // clave de un examen ya guardado: se conservan puntos y calificaciones capturadas
    const ex = g.actividades.find(x => x.id === b.editId);
    if (ex) { ex.reactivos = reactivos; ex.revisado = true; ex.revisadoEl = gHoy(); G.exAbierto = ex.id; G.borrador = null; gGuardar(); gRenderExamenes(); gIrAExamen(); gAviso('Clave revisada. Este examen ya se puede usar en el escáner.'); return; }
  }
  const nuevo = { id: gId(), trim: b.trim, criterioId: b.criterioId, nombre: b.titulo, max: gMaxExamen(b), tipo: 'examen', fecha: gHoy(), tema: b.tema, reactivos, revisado: true, revisadoEl: gHoy(), notas: {} };
  g.actividades.push(nuevo); G.exAbierto = nuevo.id;
  G.borrador = null; gGuardar(); gRenderExamenes(); gIrAExamen();
}
function gRegistrarExamenPapel() {
  const g = gGrupo();
  const nombre = document.getElementById('gp-nom').value.trim();
  const max = gNum(document.getElementById('gp-max').value) || 10;
  if (!nombre) { gAviso('Ponle nombre al examen.'); return; }
  const nuevo = { id: gId(), trim: G.trimExam, criterioId: gCritExamen(g).id, nombre, max, tipo: 'examen', fecha: gHoy(), reactivos: null, notas: {} };
  g.actividades.push(nuevo); G.exAbierto = nuevo.id;
  gGuardar(); gRenderExamenes(); gIrAExamen();
}
function gAciertos(exId, aid, el) {
  const g = gGrupo(); const ex = g.actividades.find(x => x.id === exId); if (!ex) return;
  const raw = el.value.trim();
  if (raw === '') { delete ex.notas[aid]; if (ex.ne) delete ex.ne[aid]; el.classList.remove('g-inval'); }   // vacía = «sin calificar»
  else if (/^ne$/i.test(raw)) { delete ex.notas[aid]; (ex.ne = ex.ne || {})[aid] = true; el.classList.remove('g-inval'); }   // NE = no entregó
  else { const n = gNum(raw); if (n == null || n < 0 || n > ex.max) { el.classList.add('g-inval'); return; } el.classList.remove('g-inval'); ex.notas[aid] = n; if (ex.ne) delete ex.ne[aid]; }
  el.classList.toggle('g-ne-in', gEsNE(ex, aid));
  gGuardar();
  const ce = document.getElementById('gc-' + exId + '-' + aid); if (ce) { const v = ex.notas[aid] == null ? null : ex.notas[aid] / ex.max * 10; ce.textContent = gEsNE(ex, aid) ? 'NE' : gFmt(v); ce.className = v != null && v < 6 ? 'g-mal' : ''; }
  const st = document.getElementById('gs-' + exId); if (st) st.innerHTML = gStatsExamen(g, ex);
}
function gStatsExamen(g, ex) {
  const v = g.alumnos.map(a => ex.notas[a.id]).filter(x => x != null).map(x => x / ex.max * 10);
  if (!v.length) return 'Sin calificaciones capturadas.';
  const prom = v.reduce((a, b) => a + b, 0) / v.length;
  return `<b>${v.length}</b> examen(es) calificado(s) · promedio <b>${gFmt(prom, 2)}</b> · aprobados <b>${v.filter(x => x >= 6).length}</b> · reprobados <b class="${v.some(x => x < 6) ? 'g-mal' : ''}">${v.filter(x => x < 6).length}</b> · máxima ${gFmt(Math.max(...v))} · mínima ${gFmt(Math.min(...v))}`;
}
function gQuitarExamen(id) { gQuitarActividad(id); }
function gDescargarResultadosExamen(id) {
  const g = gGrupo(); const ex = g.actividades.find(x => x.id === id);
  const th = x => `<td style="border:1px solid #000;padding:4px;background:#BDD7EE;font-weight:bold">${x}</td>`;
  const td = x => `<td style="border:1px solid #000;padding:4px">${x}</td>`;
  const html = gEncabezadoDoc('RESULTADOS — ' + gEsc(ex.nombre), g, `<b>${G_TRIM_NOM[ex.trim]}</b>`) +
    `<table style="width:100%;border-collapse:collapse"><tr>${['#', 'Alumno', `Aciertos (de ${ex.max})`, 'Calificación'].map(th).join('')}</tr>` +
    g.alumnos.map((a, i) => `<tr>${[i + 1, gEsc(a.nombre), ex.notas[a.id] == null ? '—' : ex.notas[a.id], ex.notas[a.id] == null ? '—' : gFmt(ex.notas[a.id] / ex.max * 10)].map(td).join('')}</tr>`).join('') + '</table>' +
    `<p>${gStatsExamen(g, ex)}</p>`;
  descargarWord(html, `Resultados_${ex.nombre.replace(/\W+/g, '_')}.doc`);
}
function gVerExamen(id) { const ex = gGrupo().actividades.find(x => x.id === id); if (ex && ex.reactivos) gDescargarExamen(ex, false); }
function gVerClave(id) { const ex = gGrupo().actividades.find(x => x.id === id); if (ex && ex.reactivos) gDescargarExamen(ex, true); }

function gProyectoEvalHTML(g, t) {
  const pl = gPlanTrim(g, t), cp = g.criterios.find(c => gEsCritProyecto(c) && !gEsCritExamen(c)), ce = g.criterios.find(gEsCritExamen);
  let h = `<div class="card"><div class="card-title">🧩 Proyecto de este trimestre</div>
    <p style="font-size:13px;margin:0 0 10px">Si en lugar de examen evalúas con un <b>proyecto</b>, cada fase y el producto final se califican de 0 a 10 en <b>«Calificaciones»</b> (ahí está la lista de tus alumnos). Se promedian y juntos valen el porcentaje de arriba.</p>`;
  if (ce && gPct(g, ce.id, t) > 0) h += `<div class="g-aviso" style="margin-bottom:10px;font-size:12.5px">¿Este trimestre no vas a aplicar examen? <button class="g-btn g-btn-s" onclick="gSinExamen()">Poner el examen en 0 %</button></div>`;
  if (!pl.proyectos.length) {
    const metRec = METODOLOGIA_POR_CAMPO[gCampoDe(g.grado, g.materia)] || 'abpc';
    h += `<p style="color:var(--gris);margin:0 0 10px">Aún no tienes un proyecto en este trimestre. Ponle nombre y la app crea las actividades de evaluación (una por fase y el producto final).</p>
      <div class="campo"><label>Nombre del proyecto</label><input id="gx-nom" placeholder="Ej. Feria de ciencias de la comunidad"></div>
      <div class="f2"><div class="campo"><label>Producto final (opcional)</label><input id="gx-prod" placeholder="Ej. Maqueta y exposición"></div>
      <div class="campo"><label>Metodología</label><select id="gx-met">${Object.values(METODOLOGIAS).map(m => `<option value="${m.id}"${m.id === metRec ? ' selected' : ''}>${gEsc(m.siglas)} · ${gEsc(m.nombre)}</option>`).join('')}</select></div></div>
      <button class="g-btn" onclick="gProyectoRapido()">🧩 Crear proyecto y sus actividades</button>`;
  }
  pl.proyectos.forEach(p => {
    const n = g.actividades.filter(a => a.proyectoId === p.id).length;
    h += `<div class="g-proy" style="margin-bottom:10px"><b>${gEsc(p.nombre)}</b>${p.producto ? `<div style="font-size:12.5px;color:var(--gris);margin-top:2px">Producto: ${gEsc(p.producto)}</div>` : ''}
      <div style="margin-top:8px">${n ? `<span style="font-size:12.5px;color:var(--gris)">${n} actividades de evaluación creadas.</span> ` : ''}<button class="g-btn g-btn-s" onclick="gCrearEvalProyectoEx('${p.id}')">${n ? 'Ver y calificar en «Calificaciones»' : '+ Crear actividades de evaluación (una por fase + producto final)'}</button></div></div>`;
  });
  return h + '</div>';
}
function gProyectoRapido() {
  const g = gGrupo(); const nombre = (document.getElementById('gx-nom').value || '').trim();
  if (!nombre) { gAviso('Escribe el nombre del proyecto.'); return; }
  const id = gId();
  gPlanTrim(g, G.trimExam).proyectos.push(gProyDef({ id, nombre, producto: (document.getElementById('gx-prod').value || '').trim(), tipo: '', met: document.getElementById('gx-met').value, esc: 'aula', prob: '', estado: 'Por planear' }));
  gGuardar(); gCrearEvalProyectoEx(id);
}
// ── Planeación → actividades de evaluación ────────────────
// Al guardar un Plano Didáctico se extraen sus evidencias y su producto para poder convertirlos en actividades calificables.
function gPartirEvidencias(txt) {
  return String(txt || '').split(/\n|;|•|(?<=[.!?])\s+/).map(x => x.replace(/^[\s\-–—·\d.)]+/, '').replace(/[.\s]+$/, '').trim()).filter(x => x.length > 2).slice(0, 8);
}
function gEvalDePlano(d) {
  const items = [];
  const rt = (typeof rutaActual !== 'undefined') ? rutaActual : null;
  if (rt && rt.usar && Array.isArray(rt.fases)) {
    rt.fases.forEach(f => f.mom.forEach(m => { if (m.evi) items.push({ fase: String(f.n).split('·').pop().trim(), txt: String(m.evi).trim() }); }));
  } else if (d.iaEvid) {
    [['f1', 'Fase 1'], ['f2', 'Fase 2'], ['f3', 'Fase 3']].forEach(([k, f]) => gPartirEvidencias(d.iaEvid[k]).forEach(t => items.push({ fase: f, txt: t })));
  }
  return { proyecto: d.nombreProyecto || '', producto: d.productoIntegrador || '', trimestre: +d.trimestre || 0, grupo: d.grupo || '', items };
}
function gPlanAActividades(id) {
  const h = (typeof historial !== 'undefined' ? historial : []).find(x => x.id === id); if (!h) return;
  if (!G.data || !G.data.grupos.length) { gAviso('Primero crea tu grupo en «Mis grupos» para poder calificar. Después vuelve aquí.'); return; }
  const ev = h.eval || { proyecto: '', producto: '', trimestre: 0, items: [] };
  const gr = G.data.grupos;
  const ideal = gr.find(g => String(g.grado) === String(h.grado) && g.materia === h.disciplina && (!ev.grupo || String(g.nombre).includes(ev.grupo))) || gr.find(g => String(g.grado) === String(h.grado) && g.materia === h.disciplina) || gr[0];
  const t0 = ev.trimestre || gTrimDeFecha(gHoy());
  G.planAct = { h, ev };
  const fila = (txt, fase, i) => `<div class="gpa-f" style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><input type="checkbox" checked style="width:auto;flex:none;padding:0;margin:0"><input class="gpa-t" style="flex:1;padding:7px 9px;border:1.5px solid var(--borde);border-radius:8px" value="${gEsc(txt)}">${fase ? `<small style="color:var(--gris);white-space:nowrap">${gEsc(fase)}</small>` : ''}</div>`;
  const ov = document.createElement('div'); ov.id = 'gpa-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:900;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px';
  ov.innerHTML = `<div style="background:#fff;border-radius:14px;max-width:680px;width:100%;padding:20px">
    <div style="font-size:17px;font-weight:700;color:var(--azul,#2563a8)">📊 Crear actividades para calificar</div>
    <p style="font-size:13px;color:var(--gris);margin:6px 0 12px">De la planeación «${gEsc(h.nombre)}». Quita la palomita a lo que no vayas a calificar, corrige los nombres o agrega más. Después capturas la nota de cada alumno en «Calificaciones».</p>
    <div class="f3">
      <div class="campo"><label>Grupo</label><select id="gpa-g" onchange="gPlanActCrit()">${gr.map(g => `<option value="${g.id}"${g.id === ideal.id ? ' selected' : ''}>${gEsc(g.nombre)} · ${gEsc(g.materia)} ${g.grado}°</option>`).join('')}</select></div>
      <div class="campo"><label>Trimestre</label><select id="gpa-t">${[1, 2, 3].map(x => `<option value="${x}"${x === t0 ? ' selected' : ''}>${G_TRIM_NOM[x]}</option>`).join('')}</select></div>
      <div class="campo"><label>Cuentan en el criterio</label><select id="gpa-c"></select></div>
    </div>
    <div style="font-weight:600;font-size:13px;margin:6px 0">Evidencias del proceso</div>
    <div id="gpa-lista">${ev.items.length ? ev.items.map((it, i) => fila(it.txt, it.fase, i)).join('') : '<div style="font-size:12.5px;color:var(--gris);margin-bottom:6px">Esta planeación no trae evidencias guardadas. Agrega las que quieras calificar.</div>'}</div>
    <button class="g-btn g-btn-s" onclick="gPlanActMas()">+ Agregar otra</button>
    <div style="font-weight:600;font-size:13px;margin:14px 0 6px">Producto final <small style="font-weight:400;color:var(--gris)">(cuenta en «Producto del proyecto»)</small></div>
    <div class="gpa-f" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="gpa-pchk" ${ev.producto ? 'checked' : ''} style="width:auto;flex:none;padding:0;margin:0"><input id="gpa-prod" style="flex:1;padding:7px 9px;border:1.5px solid var(--borde);border-radius:8px" value="${gEsc(ev.producto)}" placeholder="Ej. Antología de cuentos"></div>
    <div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end"><button class="g-btn g-btn-s" onclick="gPlanActCerrar()">Cancelar</button><button class="g-btn" onclick="gPlanActCrear()">Crear actividades</button></div></div>`;
  document.body.appendChild(ov);
  gPlanActCrit();
}
function gPlanActCerrar() { const o = document.getElementById('gpa-ov'); if (o) o.remove(); }
function gPlanActMas() { const l = document.getElementById('gpa-lista'); if (!l.querySelector('.gpa-t')) l.innerHTML = ''; const d = document.createElement('div'); d.className = 'gpa-f'; d.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:6px'; d.innerHTML = '<input type="checkbox" checked style="width:auto;flex:none;padding:0;margin:0"><input class="gpa-t" style="flex:1;padding:7px 9px;border:1.5px solid var(--borde);border-radius:8px" placeholder="Nombre de la actividad">'; l.appendChild(d); d.querySelector('.gpa-t').focus(); }
function gPlanActCrit() {
  const g = G.data.grupos.find(x => x.id === document.getElementById('gpa-g').value); if (!g) return;
  const cr = g.criterios.filter(c => !c.auto && !gEsCritExamen(c) && !(gEsCritProyecto(c)));
  const pref = cr.find(c => /actividad/i.test(c.nombre)) || cr[0];
  document.getElementById('gpa-c').innerHTML = cr.map(c => `<option value="${c.id}"${pref && c.id === pref.id ? ' selected' : ''}>${gEsc(c.nombre)}</option>`).join('') || '<option value="">(se creará «Actividades en clase»)</option>';
}
function gPlanActCrear() {
  const g = G.data.grupos.find(x => x.id === document.getElementById('gpa-g').value); if (!g) return;
  const t = +document.getElementById('gpa-t').value; const pid = G.planAct.h.id;
  let cid = document.getElementById('gpa-c').value;
  if (!cid || !g.criterios.some(c => c.id === cid)) { const c = { id: gId(), nombre: 'Actividades en clase', pct: 0 }; g.criterios.push(c); cid = c.id; }
  const nuevas = [...document.querySelectorAll('#gpa-lista .gpa-f')].filter(f => f.querySelector('input[type=checkbox]').checked).map(f => ({ nombre: f.querySelector('.gpa-t').value.trim(), crit: cid })).filter(x => x.nombre);
  if (document.getElementById('gpa-pchk').checked && document.getElementById('gpa-prod').value.trim()) nuevas.push({ nombre: 'Producto final: ' + document.getElementById('gpa-prod').value.trim(), crit: gCritProyecto(g).id, final: true });
  if (!nuevas.length) { gAviso('Marca al menos una actividad.'); return; }
  let n = 0;
  nuevas.forEach(x => {
    const nombre = x.nombre.length > 90 ? x.nombre.slice(0, 88) + '…' : x.nombre;
    if (g.actividades.some(a => a.planId === pid && a.trim === t && a.nombre === nombre)) return;
    g.actividades.push({ id: gId(), trim: t, criterioId: x.crit, nombre, max: 10, tipo: 'actividad', fecha: gHoy(), notas: {}, planId: pid }); n++;
  });
  gGuardar(); gPlanActCerrar();
  G.gid = g.id; G.trimCalif = t; gIrA('calif');
  gAviso(n ? `Listo: se crearon ${n} actividad(es) en «Calificaciones» (${G_TRIM_NOM[t]}). Captura ahí la nota de cada alumno.` : 'Esas actividades ya estaban creadas en ese grupo y trimestre.');
}
function gCrearEvalProyectoEx(id) { G.trimPlan = G.trimExam; gCrearEvalProyecto(id); }
function gExamenesListaHTML(g, t) {
  const exs = gActsTrim(g, t).filter(a => a.tipo === 'examen');
  let h = `<div class="card" id="g-lista-ex"><div class="card-title">🧮 Capturar calificaciones de exámenes — ${G_TRIM_NOM[t]}</div>`;
  if (!exs.length) h += `<p style="color:var(--gris);margin:0 0 10px">Aquí aparecerá la <b>lista de tus alumnos</b> para escribir lo que sacó cada uno. Primero hay que dar de alta el examen: si ya lo aplicaste en papel, regístralo; si todavía no, genéralo con IA más abajo.</p><button class="g-btn" onclick="gAbrirPapel()">📄 Registrar un examen que ya apliqué</button>`;
  exs.forEach(ex => {
    h += `<details class="g-ex" id="ex-${ex.id}" ${exs.length === 1 || G.exAbierto === ex.id ? 'open' : ''}><summary><b>${gEsc(ex.nombre)}</b> <span style="color:var(--gris);font-size:12px">· ${ex.max} pts · ${gEsc((g.criterios.find(c => c.id === ex.criterioId) || {}).nombre || '')}</span>${ex.reactivos ? (ex.revisado === true ? '<span class="g-clave-tag g-clave-ok">✓ Clave revisada</span>' : '<span class="g-clave-tag g-clave-no">⚠ Clave sin revisar</span>') : ''}</summary>
      <div id="gs-${ex.id}" class="g-statline">${gStatsExamen(g, ex)}</div>
      <div style="margin:8px 0">${ex.reactivos ? `<button class="g-btn g-btn-s" onclick="gVerExamen('${ex.id}')">⬇ Examen</button> <button class="g-btn g-btn-s" onclick="gVerClave('${ex.id}')">⬇ Clave</button> <button class="g-btn g-btn-s" onclick="gRevisarGuardado('${ex.id}')">✏️ ${ex.revisado === true ? 'Ver / corregir clave' : 'Revisar clave'}</button> ` : ''}
      ${ex.reactivos && ex.revisado !== true ? '<div class="g-aviso" style="font-size:12.5px;margin-bottom:6px">Este examen tiene la clave <b>sin revisar</b>: revisa las respuestas con «Revisar clave» antes de aplicarlo, porque la IA puede equivocarse.</div>' : ''}
      <button class="g-btn g-btn-s" onclick="gDescargarResultadosExamen('${ex.id}')">⬇ Resultados</button> <button class="g-btn g-btn-x" onclick="gQuitarExamen('${ex.id}')">Borrar</button></div>
      ${g.alumnos.length ? `<div class="g-tabla-w"><table class="g-tabla"><thead><tr><th>#</th><th>Alumno</th><th style="width:110px">Aciertos / pts (de ${ex.max})</th><th style="width:80px">Calif.</th></tr></thead><tbody>` +
        g.alumnos.map((a, i) => { const n = ex.notas[a.id]; const v = n == null ? null : n / ex.max * 10, ne = gEsNE(ex, a.id); return `<tr><td>${i + 1}</td><td>${gEsc(a.nombre)}</td><td><input class="g-nota${ne ? ' g-ne-in' : ''}" type="text" inputmode="decimal" autocomplete="off" title="Escribe los aciertos o NE si no entregó. Vacía = sin calificar" value="${ne ? 'NE' : (n == null ? '' : n)}" oninput="gAciertos('${ex.id}','${a.id}',this)"></td><td id="gc-${ex.id}-${a.id}" class="${v != null && v < 6 ? 'g-mal' : ''}">${ne ? 'NE' : gFmt(v)}</td></tr>`; }).join('') + '</tbody></table></div>' : '<p style="color:var(--gris)">Agrega alumnos en «Mis grupos».</p>'}
    </details>`;
  });
  return h + '</div>';
}
function gIrAExamen() { const e = G.exAbierto && document.getElementById('ex-' + G.exAbierto); if (e) { e.open = true; e.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }
function gAbrirPapel() { const d = document.getElementById('g-papel'); if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'center' }); const n = document.getElementById('gp-nom'); if (n) n.focus(); } }
function gRenderExamenes() {
  const g = gGrupo();
  if (!g) return gSinGrupo('Exámenes', 'Genera exámenes con IA y califica a tu grupo');
  const t = G.trimExam;
  let h = `<div class="sec-title">Exámenes</div><div class="sec-sub">Crea un examen con su clave de respuestas, captura los aciertos de cada alumno y la calificación se calcula sola.</div>${gBarra()}
  <div class="g-trims">${[1, 2, 3].map(x => `<button class="ttab${t === x ? ' on' : ''}" onclick="gTrimExam(${x})">${G_TRIM_NOM[x]}</button>`).join('')}</div>
  <div class="card"><div class="card-title">⚖️ Valor en la calificación — ${G_TRIM_NOM[t]}</div><div id="g-peso-card">${gPesoCardHTML(g, t)}</div></div>
  ${G.evalModo === 'proyecto' ? '' : gExamenesListaHTML(g, t)}
  ${G.evalModo === 'proyecto' ? gProyectoEvalHTML(g, t) : `<div class="card"><div class="card-title">✨ Generar examen con IA — ${gEsc(g.materia)} ${g.grado}°</div>
    ${gTemasPanel(g, t)}
    <div class="campo"><label>Temas o contenidos a evaluar</label><textarea id="ge-tema" rows="4" placeholder="Ej. Ecuaciones de primer grado con una incógnita; problemas de proporcionalidad directa">${gEsc(G.temaUlt || '')}</textarea><div class="ayuda">Mientras más específico, mejor el examen. Puedes escribir tus propios temas o corregir los que marcaste.</div><div class="ayuda" style="color:#92400e">🔒 Esto se envía a la IA: <b>no escribas nombres de alumnos</b> ni datos de conducta, salud o familia.</div></div>
    <div class="f3">
      <div class="campo"><label>Número de reactivos</label>${licEsPrueba() ? '<input id="ge-n" type="number" min="3" max="5" value="5"><div class="ayuda">En la prueba gratis: hasta 5 reactivos.</div>' : '<input id="ge-n" type="number" min="3" max="30" value="10">'}</div>
      <div class="campo"><label>Dificultad</label><select id="ge-dif"><option>Básica</option><option selected>Media</option><option>Alta</option></select></div>
    </div>
    <div class="campo"><label>Tipos de reactivo</label><div class="g-checks">${Object.entries(G_TIPOS_EXAM).map(([k, v]) => `<label><input type="checkbox" id="ge-t-${k}" ${k !== 'desarrollo' ? 'checked' : ''}> ${v}</label>`).join('')}</div></div>
    <div class="l-err" id="ge-err" style="margin:0 0 12px"></div>
    <button class="g-btn" id="ge-btn" onclick="gGenerarExamen()">✨ Generar examen con IA</button>
    <div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">⚠ Revisa el examen y la clave antes de aplicarlo: la IA puede equivocarse.</div></div>`}`;

  if (G.evalModo !== 'proyecto' && G.borrador && G.borrador.trim === t) {
    const b = G.borrador, edit = !!b.editId, np = gBorrPendientes(b);
    b.reactivos.forEach(r => { r.revisar = !!gRevReactivo(r); });
    h += `<div class="card" id="g-borrador"><div class="card-title">${edit ? '✏️ Revisa la clave de tu examen' : '👀 Revisa tu examen'} (${gMaxExamen(b)} puntos)</div>
      <div class="ayuda" style="margin:-4px 0 10px">Este examen suma <b>${gMaxExamen(b)} puntos</b> (lo que vale cada pregunta aparece entre paréntesis). Al capturar los aciertos de cada alumno, la app lo convierte sola a una calificación de 0 a 10.</div>
      <div class="campo"><label>Título</label><input value="${gEsc(b.titulo)}" oninput="gTituloBorrador(this.value)"></div>` +
      `<div class="ayuda" style="margin:-4px 0 10px">Puedes corregir cualquier pregunta, opción o respuesta directamente aquí${edit ? '' : ', o quitar la que no te guste con ✕'}. Los reactivos en <b style="background:#fef3c7;padding:0 4px;border-radius:4px">amarillo</b> traen la clave dudosa: elige tú la respuesta correcta.</div>` +
      b.reactivos.map((r, i) => {
        const m = gRevReactivo(r);
        const resp = r.tipo === 'opcion_multiple' ? `<select style="flex:1" onchange="gEditReac(${i},'respuesta',this.value)"><option value="">— elige la respuesta —</option>${'ABCD'.split('').map(l => `<option value="${l}" ${r.respuesta === l ? 'selected' : ''}>${l}</option>`).join('')}</select>`
          : r.tipo === 'verdadero_falso' ? `<select style="flex:1" onchange="gEditReac(${i},'respuesta',this.value)"><option value="">— elige la respuesta —</option>${['Verdadero', 'Falso'].map(l => `<option ${r.respuesta === l ? 'selected' : ''}>${l}</option>`).join('')}</select>`
          : `<input style="flex:1" value="${gEsc(r.respuesta)}" oninput="gEditReac(${i},'respuesta',this.value)">`;
        return `<div class="g-reac${m ? ' g-reac-rev' : ''}" id="g-reac-${i}">${edit ? '' : `<button class="g-x" title="Quitar reactivo" onclick="gQuitarReactivo(${i})">✕</button>`}<b>${i + 1}.</b> <small>(${G_TIPOS_EXAM[r.tipo]}, ${r.valor} pt)</small> <span class="g-rev-tag" id="g-rv-${i}">${m ? '⚠ Revisar clave: ' + gEsc(m) : ''}</span>
        <textarea rows="2" style="width:100%;margin:4px 0" oninput="gEditReac(${i},'pregunta',this.value)">${gEsc(r.pregunta)}</textarea>` +
        (r.tipo === 'opcion_multiple' ? r.opciones.map((o, k) => `<div style="display:flex;gap:6px;align-items:center;margin:3px 0"><b style="width:18px">${'ABCD'[k]}</b><input style="flex:1" value="${gEsc(o)}" oninput="gEditOpc(${i},${k},this.value)"></div>`).join('') : '') +
        `<div class="g-resp" style="display:flex;gap:6px;align-items:center">Respuesta: ${resp}</div>` +
        (b.conPda || r.pda ? `<div class="g-pda" style="margin-top:6px;font-size:12px;color:var(--gris)">📌 <b>PDA que evalúa:</b> <textarea rows="2" style="width:100%;margin-top:2px;font-size:12px" placeholder="PDA (aprendizaje esperado)" oninput="gEditReac(${i},'pda',this.value)">${gEsc(r.pda || '')}</textarea></div>` : '') + `</div>`;
      }).join('') +
      `<div class="g-revbox"><label style="display:flex;gap:8px;align-items:flex-start;text-transform:none;letter-spacing:0;font-weight:700;font-size:13.5px;margin:0;cursor:pointer"><input type="checkbox" id="g-rev-chk" style="margin-top:3px;width:auto;flex:none;padding:0" ${b.revisado && !np ? 'checked' : ''} ${np ? 'disabled' : ''} onchange="gMarcarRevisado(this.checked)"> <span>Revisé las respuestas correctas</span></label>
        <div id="g-rev-msg" class="ayuda" style="margin:4px 0 0 26px"></div></div>
       <button class="g-btn" id="g-btn-guardar" onclick="gGuardarExamen()" ${gBorrListo(b) ? '' : 'disabled'}>${edit ? '💾 Guardar clave revisada' : '💾 Guardar para calificar'}</button>
       <button class="g-btn g-btn-s" onclick="gDescargarExamen(G.borrador,false)">⬇ Examen (Word)</button>
       <button class="g-btn g-btn-s" onclick="gDescargarExamen(G.borrador,true)">⬇ Clave (Word)</button>
       ${edit ? '<button class="g-btn g-btn-s" onclick="G.borrador=null;gRenderExamenes()">Cancelar</button>' : '<button class="g-btn g-btn-s" onclick="gGenerarExamen()">↻ Generar otro</button>'}</div>`;
  }

  if (G.evalModo !== 'proyecto') {
  h += gHistHTML();
  h += `<details class="card g-det" id="g-papel"><summary>📄 Ya apliqué un examen en papel (registrarlo sin IA)</summary>
    <div class="f2" style="margin-top:12px"><div class="campo"><label>Nombre</label><input id="gp-nom" placeholder="Ej. Examen del trimestre"></div>
    <div class="campo"><label>Total de puntos / reactivos</label><input id="gp-max" type="number" min="1" value="10"></div>
    </div>
    <button class="g-btn" onclick="gRegistrarExamenPapel()">Registrar examen</button></details>`;

  }
  gPanel().innerHTML = h;
  if (G.borrador) gBorrActualizar();
}

// ============================================================
// CAPTURAR EXAMEN POR ALUMNO (menú «Capturar examen»)
// El maestro califica a mano y escribe los aciertos de cada alumno; al lado ve la calificación
// del trimestre que suma ese examen con lo demás (tareas, actividades, comportamiento, asistencia…).
// Usa los mismos datos que «Exámenes» y «Calificaciones»: no hay nada duplicado.
// ============================================================
function gTrimCapEx(v) { G.trimExam = +v; G.capExId = null; gRenderCapExamen(); }
function gCapExElegir(id) { G.capExId = id; gRenderCapExamen(); }
function gCapExRegistrar() {
  const g = gGrupo(); if (!g) return;
  const nombre = (document.getElementById('cx-nom').value || '').trim();
  const max = gNum(document.getElementById('cx-max').value) || 10;
  if (!nombre) { gAviso('Ponle nombre al examen.'); return; }
  if (max <= 0) { gAviso('El total de puntos debe ser mayor que cero.'); return; }
  const nuevo = { id: gId(), trim: G.trimExam, criterioId: gCritExamen(g).id, nombre, max, tipo: 'examen', fecha: gHoy(), reactivos: null, notas: {} };
  g.actividades.push(nuevo); G.capExId = nuevo.id; gGuardar(); gRenderCapExamen();
}
// Desglose: criterios que cuentan en el trimestre (con peso > 0) y su celda «calificación + lo que aporta»
function gCapExCrits(g, t) { return g.criterios.slice(); }   // todos los criterios de evaluación del grupo (los mismos de «Calificaciones»)
(function () {   // estilos compactos para que quepan todos los criterios sin desplazar la tabla
  if (document.getElementById('g-cx-css')) return;
  const st = document.createElement('style'); st.id = 'g-cx-css';
  st.textContent = '.g-cx{width:100%;font-size:12px}.g-cx th,.g-cx td{padding:5px 3px}.g-cx th{font-size:10.5px;line-height:1.2}'
    + '.g-cx td.cx-n{font-size:11px;line-height:1.2;min-width:104px;max-width:160px}.g-cx input.g-nota{width:50px;padding:4px 2px;font-size:13px;text-align:center}'
    + '.g-cx td.g-ro{text-align:center;line-height:1.2}.g-cx td.g-ro b{font-size:13px}.g-cx th.g-cx-k{text-align:center;min-width:0}';
  document.head.appendChild(st);
})();
// De qué se forma la calificación de un criterio (libreta, actividades, examen…): solo se muestra cuando hay más de una fuente
function gCapExPartes(g, t, aid, c) {
  const p = [];
  if (c.auto === 'asistencia') return p;
  const ls = typeof gLibretaScore === 'function' ? gLibretaScore(g, aid, t, c.id) : null;
  if (ls != null) p.push('📓 libreta ' + gFmt(ls));
  gActsTrim(g, t).filter(a => a.criterioId === c.id && a.max > 0).forEach(a => {
    const n = a.notas[aid];
    if (n != null) p.push((a.tipo === 'examen' ? '📝 ' : '• ') + gFmt(n / a.max * 10));
    else if (gEsNE(a, aid)) p.push((a.tipo === 'examen' ? '📝 ' : '• ') + 'NE');
  });
  return p;
}
function gCapExCelda(g, t, aid, r, c, pc) {
  const v = r.porCrit[c.id]; if (v == null) return '<span style="color:var(--gris)" title="Todavía no hay calificación en este criterio">—</span>';
  const pt = gCapExPartes(g, t, aid, c);
  return `<b>${gFmt(v)}</b><small style="display:block;font-size:10.5px;font-weight:400;color:var(--gris)" title="Calificación del criterio × su porcentaje">aporta ${gFmt(v * pc / 100, 2)}</small>` +
    (pt.length > 1 ? `<small class="cx-partes" style="display:block;font-size:10px;font-weight:400;color:#0369a1;line-height:1.3" title="La calificación del criterio es el promedio de estas partes">promedio de ${pt.join(' · ')}</small>` : '');
}
function gCapExAciertos(exId, aid, el) {
  gAciertos(exId, aid, el);
  const g = gGrupo(), t = G.trimExam; const ex = g && g.actividades.find(x => x.id === exId); if (!ex) return;
  const ce = document.getElementById('cx-c-' + aid);
  if (ce) { const v = ex.notas[aid] == null ? null : ex.notas[aid] / ex.max * 10; ce.textContent = gEsNE(ex, aid) ? 'NE' : gFmt(v); ce.className = v != null && v < 6 ? 'g-mal' : ''; }
  const b = el.nextElementSibling; if (b && b.classList.contains('g-nebtn')) b.classList.toggle('on', gEsNE(ex, aid));
  const st = document.getElementById('cx-s'); if (st) st.innerHTML = gStatsExamen(g, ex);
  g.alumnos.forEach(al => {   // la calificación del trimestre se recalcula sola
    const f = document.getElementById('cx-f-' + al.id); if (!f) return;
    const r = gCalcAlumno(g, al.id, t), bo = gBoleta(r.final);
    f.innerHTML = gCapFinalHTML(r); f.classList.toggle('g-mal', bo != null && bo < 6 && !r.pend.length); f.classList.toggle('g-pendf', r.pend.length > 0);
    gCapExCrits(g, t).forEach(c => { const k = document.getElementById('cx-k-' + c.id + '-' + al.id); if (k) k.innerHTML = gCapExCelda(g, t, al.id, r, c, gPct(g, c.id, t)); });
  });
}
function gCapExNE(exId, aid, btn) {
  const g = gGrupo(), ex = g && g.actividades.find(x => x.id === exId), inp = btn.previousElementSibling; if (!ex || !inp) return;
  inp.value = gEsNE(ex, aid) ? '' : 'NE'; gCapExAciertos(exId, aid, inp);
}
// Enter pasa a la casilla del alumno siguiente (captura rápida con el teclado)
function gCapExEnter(ev, el) {
  if (ev.key !== 'Enter') return; ev.preventDefault();
  const all = [...document.querySelectorAll('#g-capexamen .g-nota')], i = all.indexOf(el);
  const sig = all[i + 1]; if (sig) { sig.focus(); sig.select(); } else el.blur();
}
function gRenderCapExamen() {
  const g = gGrupo();
  if (!g) return gSinGrupo('Capturar examen', 'Escribe los aciertos de cada alumno y mira su calificación del trimestre');
  const t = G.trimExam;
  const exs = gActsTrim(g, t).filter(a => a.tipo === 'examen');
  if (!exs.find(e => e.id === G.capExId)) G.capExId = exs.length ? exs[exs.length - 1].id : null;
  const ex = exs.find(e => e.id === G.capExId);
  let h = `<div class="sec-title">Capturar examen por alumno</div><div class="sec-sub">Califica el examen a mano y escribe los aciertos de cada alumno. A la derecha ves su <b>calificación del trimestre</b>, que suma el examen con todo lo demás.</div>${gBarra()}
  <div class="g-trims">${[1, 2, 3].map(x => `<button class="ttab${t === x ? ' on' : ''}" onclick="gTrimCapEx(${x})">${G_TRIM_NOM[x]}</button>`).join('')}</div>`;
  if (!g.alumnos.length) return gPanel().innerHTML = h + gVacio('Este grupo todavía no tiene alumnos. Captura o sube la lista primero.');
  if (!ex) {
    h += `<div class="card"><div class="card-title">📝 Registra el examen que aplicaste — ${G_TRIM_NOM[t]}</div>
      <p style="color:var(--gris);margin:0 0 10px;font-size:13px">Escribe cómo se llama y de cuántos puntos (o reactivos) es. Después te aparece la lista de tus alumnos para capturar los aciertos.</p>
      <div class="f2"><div class="campo"><label>Nombre del examen</label><input id="cx-nom" placeholder="Ej. Examen del trimestre"></div>
      <div class="campo"><label>Total de puntos / reactivos</label><input id="cx-max" type="number" min="1" value="10"></div></div>
      <button class="g-btn" onclick="gCapExRegistrar()">Registrar examen</button></div>`;
  } else {
    const c = g.criterios.find(x => x.id === ex.criterioId), pc = c ? gPct(g, c.id, t) : null;
    h += `<div class="card"><div class="card-title">📝 ${gEsc(ex.nombre)} <span style="font-weight:400;color:var(--gris);font-size:12px">· ${ex.max} pts</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        ${exs.length > 1 ? `<label style="font-weight:600;font-size:12.5px">Examen</label><select onchange="gCapExElegir(this.value)" style="padding:5px 8px;border-radius:8px;border:1.5px solid var(--borde);font-size:12.5px">${exs.map(e => `<option value="${e.id}"${e.id === ex.id ? ' selected' : ''}>${gEsc(e.nombre)} (${e.max} pts)</option>`).join('')}</select>` : ''}
        <button class="g-btn g-btn-s" onclick="gCapExNuevo()">＋ Registrar otro examen</button>
      </div>
      <p style="font-size:12.5px;color:var(--gris);margin:0 0 8px;line-height:1.5">Este examen cuenta en el criterio <b>${gEsc(c ? c.nombre : 'Exámenes')}</b>${pc == null ? '' : `, que vale <b>${gFmt(pc, 0)}%</b> de la calificación del trimestre`}. Escribe los <b>aciertos</b> de cada alumno (o <b>NE</b> si no presentó); una casilla vacía significa «sin calificar». Con <b>Enter</b> pasas al siguiente.</p>
      <div id="cx-s" class="g-statline">${gStatsExamen(g, ex)}</div>
      <div class="g-tabla-w"><table class="g-tabla g-cx"><thead><tr><th style="width:22px">#</th><th>Alumno</th><th style="width:58px">Aciertos (de ${ex.max})</th><th style="width:52px">Calif. examen</th>${gCapExCrits(g, t).map(c => `<th class="g-cx-k" style="${c.id === ex.criterioId ? 'background:#e0f2fe' : ''}" title="${gEsc(c.nombre)}: vale ${gFmt(gPct(g, c.id, t), 0)} % de la calificación del trimestre">${c.id === ex.criterioId ? '✏️ ' : ''}${gEsc(c.nombre)}<br><small>${gFmt(gPct(g, c.id, t), 0)} %</small></th>`).join('')}<th style="width:84px">= Calif. del trimestre</th></tr></thead><tbody>` +
      g.alumnos.map((a, i) => {
        const n = ex.notas[a.id], ne = gEsNE(ex, a.id), v = n == null ? null : n / ex.max * 10, r = gCalcAlumno(g, a.id, t), bo = gBoleta(r.final);
        return `<tr><td>${i + 1}</td><td class="cx-n">${gEsc(a.nombre)}</td><td><input class="g-nota${ne ? ' g-ne-in' : ''}" type="text" inputmode="decimal" autocomplete="off" title="Escribe los aciertos o NE si no presentó. Vacía = sin calificar" value="${ne ? 'NE' : (n == null ? '' : n)}" oninput="gCapExAciertos('${ex.id}','${a.id}',this)" onkeydown="gCapExEnter(event,this)"><button type="button" class="g-nebtn${ne ? ' on' : ''}" title="No presentó (NE)" onclick="gCapExNE('${ex.id}','${a.id}',this)">NE</button></td>
          <td id="cx-c-${a.id}" class="${v != null && v < 6 ? 'g-mal' : ''}">${ne ? 'NE' : gFmt(v)}</td>
          ${gCapExCrits(g, t).map(c => `<td class="g-ro" id="cx-k-${c.id}-${a.id}"${c.id === ex.criterioId ? ' style="background:#f0f9ff"' : ''}>${gCapExCelda(g, t, a.id, r, c, gPct(g, c.id, t))}</td>`).join('')}
          <td class="g-fin${bo != null && bo < 6 && !r.pend.length ? ' g-mal' : ''}${r.pend.length ? ' g-pendf' : ''}" id="cx-f-${a.id}">${gCapFinalHTML(r)}</td></tr>`;
      }).join('') + `</tbody></table></div>
      <div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-top:10px;line-height:1.5">Cada columna es un criterio con su porcentaje. Su calificación se multiplica por ese porcentaje («aporta») y <b>la suma de todo es la calificación del trimestre</b>. Si a un criterio le falta calificación aparece «—» y el alumno queda <b>«pendiente»</b> (calificación provisional).</div>
      <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="g-btn" onclick="gIrA('calif')">📊 Capturar los demás criterios (tareas, comportamiento…)</button>
        <button class="g-btn g-btn-s" onclick="gIrA('trabajos')">📓 Libreta de trabajos</button>
        <button class="g-btn g-btn-s" onclick="gIrA('lista')">✅ Pase de lista</button>
        <button class="g-btn g-btn-s" onclick="gDescargarResultadosExamen('${ex.id}')">⬇ Resultados del examen</button>
      </div></div>`;
  }
  gPanel().innerHTML = h;
}
// «Registrar otro examen»: muestra solo el formulario de registro
function gCapExNuevo() {
  const g = gGrupo(), t = G.trimExam; if (!g) return;
  const p = gPanel();
  p.innerHTML = `<div class="sec-title">Capturar examen por alumno</div><div class="sec-sub">Registra el nuevo examen.</div>${gBarra()}
    <div class="card"><div class="card-title">📝 Registra el examen que aplicaste — ${G_TRIM_NOM[t]}</div>
      <div class="f2"><div class="campo"><label>Nombre del examen</label><input id="cx-nom" placeholder="Ej. Examen del trimestre"></div>
      <div class="campo"><label>Total de puntos / reactivos</label><input id="cx-max" type="number" min="1" value="10"></div></div>
      <button class="g-btn" onclick="gCapExRegistrar()">Registrar examen</button> <button class="g-btn g-btn-s" onclick="gRenderCapExamen()">Cancelar</button></div>`;
  const n = document.getElementById('cx-nom'); if (n) n.focus();
}

// ============================================================
// 5. PLANEACIÓN TRIMESTRAL CON PROYECTOS (según la metodología)
// ============================================================
function gPlanTrim(g, t) { if (!g.plan) g.plan = {}; if (!g.plan[t]) g.plan[t] = { sesiones: 25, proyectos: [] }; return g.plan[t]; }
function gTrimPlan(v) { G.trimPlan = +v; G.pesoMsg = ''; G.sugerencias = []; gRenderTrim(); }
function gPlanSesiones(v) { const g = gGrupo(); gPlanTrim(g, G.trimPlan).sesiones = parseInt(v, 10) || 25; gGuardar(); }
function gSugerirProyectos() {
  const g = gGrupo(); const campo = gCampoDe(g.grado, g.materia);
  const prob = document.getElementById('gt-prob').value.trim();
  const err = document.getElementById('gt-err'); err.style.display = 'none';
  if (prob.length < 20) { err.textContent = 'Describe la problemática de tu contexto (qué pasa, a quién afecta, cómo se nota en tu grupo). Al menos una o dos oraciones.'; err.style.display = 'block'; return; }
  const met = document.getElementById('gt-met').value;
  const esc = document.getElementById('gt-esc').value;
  G.sugerencias = sugerirProyectos(met, prob, esc).map(s => Object.assign(s, { met, esc, prob }));
  gRenderTrim();
  const e = document.getElementById('gt-sug'); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function gAgregarProyecto(i) {
  const g = gGrupo(); const s = G.sugerencias[i]; if (!s) return;
  const p = gPlanTrim(g, G.trimPlan);
  p.proyectos.push(gProyDef({ id: gId(), nombre: s.nombre, producto: s.producto, tipo: s.tipo, met: s.met, esc: s.esc, prob: s.prob, estado: 'Por planear' }));
  gGuardar(); gRenderTrim();
}
function gProyectoManual() {
  const g = gGrupo(); const nombre = document.getElementById('gt-nom').value.trim();
  if (!nombre) { gAviso('Escribe el nombre del proyecto.'); return; }
  gPlanTrim(g, G.trimPlan).proyectos.push(gProyDef({ id: gId(), nombre, producto: document.getElementById('gt-prod').value.trim(), tipo: '', met: document.getElementById('gt-met').value, esc: document.getElementById('gt-esc').value, prob: document.getElementById('gt-prob').value.trim(), estado: 'Por planear' }));
  gGuardar(); gRenderTrim();
}
function gEstadoProyecto(id, v) { const p = gPlanTrim(gGrupo(), G.trimPlan).proyectos.find(x => x.id === id); if (p) { p.estado = v; gGuardar(); } }
function gQuitarProyecto(id) {
  const p = gPlanTrim(gGrupo(), G.trimPlan); const x = p.proyectos.find(y => y.id === id);
  if (!x || !confirm(`¿Quitar el proyecto «${x.nombre}» de este trimestre?`)) return;
  p.proyectos = p.proyectos.filter(y => y.id !== id); gGuardar(); gRenderTrim();
}

// ── Tiempos y fechas del proyecto ─────────────────────────
const G_DIAS = [[1, 'L'], [2, 'M'], [3, 'X'], [4, 'J'], [5, 'V']];
function gProyDef(p) {
  if (!p.clases) p.clases = 10;
  if (!p.min) p.min = 50;
  if (!p.inicio) p.inicio = gHoy();
  if (!p.dias || !p.dias.length) p.dias = [1, 3, 5];
  if (p.sinClase == null) p.sinClase = '';
  return p;
}
function gProyBuscar(id) { return gPlanTrim(gGrupo(), G.trimPlan).proyectos.find(x => x.id === id); }
// Acepta AAAA-MM-DD o DD/MM/AAAA, separadas por coma, espacio o punto y coma
function gParseFechas(txt) {
  const out = [];
  String(txt || '').split(/[\s,;]+/).filter(Boolean).forEach(x => {
    let m = x.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return out.push(m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0'));
    m = x.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) out.push(m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0'));
  });
  return out;
}
function gFechasClase(p) {
  const sin = new Set(gParseFechas(p.sinClase));
  const out = []; let f = p.inicio || gHoy(); let guard = 0;
  while (out.length < Math.ceil(p.clases) && guard++ < 900) {
    const [y, m, d] = f.split('-').map(Number);
    if (p.dias.includes(new Date(y, m - 1, d).getDay()) && !sin.has(f)) out.push(f);
    f = gSumarDias(f, 1);
  }
  return out;
}
function gCorta(iso) { if (!iso) return '—'; const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).replace('.', ''); }
// Reparte las clases entre fases y momentos (misma lógica que la ruta del Plano Didáctico)
function gCalendarioProyecto(p) {
  const met = METODOLOGIAS[p.met]; const fechas = gFechasClase(p);
  const dist = distribuirTiempos(met.fases, p.clases, p.min, p.dias.length);
  let i = 0;
  const fases = met.fases.map(f => {
    const moms = f.mom.map(m => { const t = dist.tiempos[i++]; return { n: m.n, t, ini: fechas[t.sesIni - 1], fin: fechas[t.sesFin - 1] }; });
    const a = moms[0].t, b = moms[moms.length - 1].t;
    return { n: f.n, lema: f.lema, color: f.color, moms, sesIni: a.sesIni, sesFin: b.sesFin, ini: moms[0].ini, fin: moms[moms.length - 1].fin, min: moms.reduce((s, m) => s + m.t.min, 0) };
  });
  return { fases, fechas, insuficiente: dist.insuficiente || p.clases < dist.minSesiones, minSesiones: dist.minSesiones };
}
function gRangoSes(a, b) { return a === b ? `${a}` : `${a}–${b}`; }
function gTablaCalendario(p) {
  const cal = gCalendarioProyecto(p);
  let h = '';
  if (cal.insuficiente) h += `<div class="g-aviso" style="background:#fffbeb;border-color:#fde68a;color:#92400e">⚠ Con ${p.clases} clases no alcanza para todos los momentos de la metodología. Te recomiendo al menos <b>${cal.minSesiones}</b> clases.</div>`;
  h += `<div class="g-tabla-w"><table class="g-tabla"><thead><tr><th>Fase / momento</th><th>Clases</th><th>Fechas</th><th>Tiempo</th></tr></thead><tbody>`;
  cal.fases.forEach(f => {
    h += `<tr style="background:${f.color}18"><td style="color:${f.color};font-weight:700">${gEsc(f.n)}</td><td><b>${gRangoSes(f.sesIni, f.sesFin)}</b></td><td><b>${gCorta(f.ini)}${f.fin !== f.ini ? ' – ' + gCorta(f.fin) : ''}</b></td><td>${f.min} min</td></tr>`;
    f.moms.forEach(m => { h += `<tr><td style="padding-left:22px;font-size:12.5px">${gEsc(m.n)}</td><td>${gRangoSes(m.t.sesIni, m.t.sesFin)}${m.t.ses === '½' || /½/.test(m.t.ses) ? '' : ''}</td><td style="font-size:12.5px">${gCorta(m.ini)}${m.fin !== m.ini ? ' – ' + gCorta(m.fin) : ''}</td><td style="font-size:12.5px">${m.t.ses} ses. · ${m.t.min} min</td></tr>`; });
  });
  return h + '</tbody></table></div>';
}
function gProyCampo(id, campo, v) {
  const p = gProyBuscar(id); if (!p) return;
  if (campo === 'clases') p.clases = Math.max(2, Math.min(60, parseInt(v, 10) || 10));
  else if (campo === 'min') p.min = parseInt(v, 10) || 50;
  else p[campo] = v;
  gGuardar(); gRenderTrim();
}
function gProyDia(id, dia, on) {
  const p = gProyBuscar(id); if (!p) return;
  p.dias = p.dias.filter(d => d !== dia); if (on) p.dias.push(dia);
  if (!p.dias.length) p.dias = [dia];
  p.dias.sort(); gGuardar(); gRenderTrim();
}
function gDescargarCronograma(id) {
  const g = gGrupo(); const p = gProyBuscar(id); const cal = gCalendarioProyecto(p);
  const th = x => `<td style="border:1px solid #000;padding:4px;background:#BDD7EE;font-weight:bold">${x}</td>`;
  const td = x => `<td style="border:1px solid #000;padding:4px">${x}</td>`;
  let rows = '';
  cal.fases.forEach(f => {
    rows += `<tr>${[`<b>${gEsc(f.n)}</b>`, `<b>${gRangoSes(f.sesIni, f.sesFin)}</b>`, `<b>${gCorta(f.ini)} – ${gCorta(f.fin)}</b>`, `<b>${f.min} min</b>`].map(td).join('')}</tr>`;
    f.moms.forEach(m => { rows += `<tr>${['&nbsp;&nbsp;' + gEsc(m.n), gRangoSes(m.t.sesIni, m.t.sesFin), `${gCorta(m.ini)} – ${gCorta(m.fin)}`, `${m.t.ses} ses. · ${m.t.min} min`].map(td).join('')}</tr>`; });
  });
  const html = gEncabezadoDoc('CRONOGRAMA DEL PROYECTO — ' + G_TRIM_NOM[G.trimPlan].toUpperCase(), g, `<b>Metodología:</b> ${gEsc(METODOLOGIAS[p.met].nombre)}`) +
    `<p><b>Proyecto:</b> ${gEsc(p.nombre)}</p>${p.producto ? `<p><b>Producto:</b> ${gEsc(p.producto)}</p>` : ''}<p><b>Duración:</b> ${p.clases} clases de ${p.min} min · del ${gCorta(cal.fechas[0])} al ${gCorta(cal.fechas[cal.fechas.length - 1])}</p>` +
    `<table style="width:100%;border-collapse:collapse"><tr>${['Fase / momento', 'Clases', 'Fechas', 'Tiempo'].map(th).join('')}</tr>${rows}</table>`;
  descargarWord(html, `Cronograma_${p.nombre.replace(/\W+/g, '_').slice(0, 40)}.doc`);
}

// ── El proyecto como «abono» a la calificación del trimestre ──
function gCritProyecto(g) {
  let c = g.criterios.find(x => gEsCritProyecto(x) && !gEsCritExamen(x));
  if (!c) { c = { id: gId(), nombre: 'Producto del proyecto', pct: 0 }; g.criterios.push(c); }
  return c;
}
function gPesoProyecto(v) {
  const g = gGrupo(); const c = gCritProyecto(g);
  G.pesoMsg = gMsgCambios(gAjustarPesos(g, G.trimPlan, c.id, v)); gGuardar(); gRenderTrim();
}
function gCrearEvalProyecto(id) {
  const g = gGrupo(); const p = gProyBuscar(id); const met = METODOLOGIAS[p.met]; const c = gCritProyecto(g);
  const corto = p.nombre.length > 38 ? p.nombre.slice(0, 36) + '…' : p.nombre;
  const items = met.fases.map((f, i) => [`${corto} · ${f.n.split('·')[0].trim()}`, 'f' + i]).concat([[`${corto} · Producto final`, 'final']]);
  let n = 0;
  items.forEach(([nombre, clave]) => {
    if (g.actividades.some(a => a.proyectoId === id && a.clave === clave)) return;
    g.actividades.push({ id: gId(), trim: G.trimPlan, criterioId: c.id, nombre, max: 10, tipo: 'actividad', fecha: gHoy(), notas: {}, proyectoId: id, clave }); n++;
  });
  gGuardar();
  alert(n ? `Listo: se crearon ${n} actividades de evaluación del proyecto en «Calificaciones» (${G_TRIM_NOM[G.trimPlan]}). Ahí capturas la nota de cada fase y del producto final.` : 'Las actividades de evaluación de este proyecto ya estaban creadas.');
  G.trimCalif = G.trimPlan; gIrA('calif');
}

function gSel(id, v) { const e = document.getElementById(id); if (e) e.value = v; }

// Llena el Plano Didáctico con los datos del grupo y del proyecto, y lo abre.
function gAbrirPlano(pid) {
  const g = gGrupo(); const t = G.trimPlan;
  const pl = gPlanTrim(g, t); const p = pl.proyectos.find(x => x.id === pid); if (!p) return;
  const campo = gCampoDe(g.grado, g.materia);
  setTipo('d'); setModalidadD('proyecto');
  gSel('d-gra', g.grado); updCampos('d');
  gSel('d-cam', campo); updDisc('d');
  gSel('d-dis', g.materia); loadCntsD();
  gSel('d-tri', String(t)); gSel('d-grp', g.nombre);
  // número de sesiones: la opción más cercana
  gProyDef(p);
  const selSes = document.getElementById('d-ses');
  if (![...selSes.options].some(o => +o.value === p.clases)) {
    const o = document.createElement('option'); o.value = p.clases; o.textContent = `~${p.clases} sesiones`; selSes.insertBefore(o, selSes.querySelector('option[value="otro"]'));
  }
  gSel('d-ses', String(p.clases));
  if (typeof fpDesdeProyecto === 'function') fpDesdeProyecto(p);
  const selDur = document.getElementById('d-dur');
  if (![...selDur.options].some(o => +o.value === p.min)) { const o = document.createElement('option'); o.value = p.min; o.textContent = `${p.min} minutos`; selDur.appendChild(o); }
  gSel('d-dur', String(p.min));
  gSel('d-proy', p.nombre); gSel('d-prod', p.producto || ''); gSel('d-prob', p.prob || '');
  gSel('d-mod', RUTA_MOD_SELECT[p.met] || 'Aprendizaje en proyectos comunitarios');
  if (typeof rutaCampoCambio === 'function') rutaCampoCambio();
  gSel('r-met', p.met); gSel('r-esc', p.esc || 'aula'); gSel('r-prob', p.prob || '');
  if (typeof rutaActualizarAyudaMet === 'function') rutaActualizarAyudaMet();
  if (typeof rutaActualizarReferencia === 'function') rutaActualizarReferencia();
  gIrA('nueva'); window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => alert('Listo: ya llené el Plano Didáctico con tu grupo y proyecto. Elige los contenidos, ajusta lo que necesites y toca «Armar mi proyecto».'), 150);
}
function gAbrirAnalitico() {
  const g = gGrupo(); const campo = gCampoDe(g.grado, g.materia);
  setTipo('a'); gSel('a-gra', g.grado); updCampos('a'); gSel('a-cam', campo); updDisc('a'); gSel('a-dis', g.materia);
  if (typeof loadCntsA === 'function') loadCntsA();
  gIrA('nueva'); window.scrollTo({ top: 0, behavior: 'smooth' });
}

function gRenderTrim() {
  const g = gGrupo();
  if (!g) return gSinGrupo('Planeación trimestral', 'Proyectos de cada trimestre según la metodología sociocrítica');
  const t = G.trimPlan; const pl = gPlanTrim(g, t); const campo = gCampoDe(g.grado, g.materia);
  const metRec = METODOLOGIA_POR_CAMPO[campo] || 'abpc';
  let h = `<div class="sec-title">Planeación trimestral</div><div class="sec-sub">Organiza los proyectos de cada trimestre con la metodología que corresponde a tu campo formativo y ábrelos ya llenos en el Plano Didáctico.</div>${gBarra()}
  <div class="g-trims">${[1, 2, 3].map(x => `<button class="ttab${t === x ? ' on' : ''}" onclick="gTrimPlan(${x})">${G_TRIM_NOM[x]} <small>(${G_TRIM_MESES[x]})</small></button>`).join('')}</div>
  <div class="g-aviso">📌 <strong>${gEsc(g.materia)} ${g.grado}°</strong> pertenece al campo <strong>${gEsc(campo || '—')}</strong>, donde se sugiere <strong>${gEsc(METODOLOGIAS[metRec].nombre)}</strong>. Es una sugerencia: tú eliges la metodología que pida la problemática de tu grupo (aula, escuela o comunidad).
    <div style="margin-top:8px"><button class="g-btn g-btn-s" onclick="gAbrirAnalitico()">Abrir Programa Analítico de este grupo</button></div></div>
  <div class="card"><div class="card-title">🧭 Proyectos de este trimestre</div>
    <div class="campo" style="max-width:260px"><label>Sesiones disponibles en el trimestre</label><select onchange="gPlanSesiones(this.value)">${[9, 15, 20, 25, 36, 50, 64].map(n => `<option value="${n}"${n === pl.sesiones ? ' selected' : ''}>~${n} sesiones</option>`).join('')}</select></div>`;
  if (!pl.proyectos.length) h += `<p style="color:var(--gris)">Aún no hay proyectos en este trimestre. Agrega uno abajo a partir de tu problemática.</p>`;
  pl.proyectos.forEach(p => {
    gProyDef(p);
    const met = METODOLOGIAS[p.met];
    const crit = g.criterios.find(x => gEsCritProyecto(x) && !gEsCritExamen(x));
    const nAct = g.actividades.filter(a => a.proyectoId === p.id).length;
    const fechas = gFechasClase(p);
    h += `<div class="g-proy"><div class="g-proy-h"><b>${gEsc(p.nombre)}</b>
      <select onchange="gEstadoProyecto('${p.id}',this.value)">${['Por planear', 'Planeado', 'En curso', 'Terminado'].map(e => `<option${e === p.estado ? ' selected' : ''}>${e}</option>`).join('')}</select></div>
      <div class="g-proy-m"><span class="g-tag">${gEsc(met ? met.siglas : '')}</span>${p.tipo ? `<span class="g-tag g-tag2">${gEsc(p.tipo)}</span>` : ''}</div>
      ${p.producto ? `<div style="font-size:13px;margin:6px 0"><b>Producto:</b> ${gEsc(p.producto)}</div>` : ''}
      ${p.prob ? `<div style="font-size:12px;color:var(--gris);margin-bottom:6px"><b>Problemática:</b> ${gEsc(p.prob)}</div>` : ''}
      <details class="g-det" style="padding:10px 0" open><summary>⏱ Tiempos y fechas <span style="font-weight:500;color:var(--gris);font-size:12px">· ${p.clases} clases · ${gCorta(fechas[0])} – ${gCorta(fechas[fechas.length - 1])}</span></summary>
        <div class="f3" style="margin-top:12px">
          <div class="campo"><label>Clases para el proyecto</label><input type="number" min="2" max="60" value="${p.clases}" onchange="gProyCampo('${p.id}','clases',this.value)"></div>
          <div class="campo"><label>Minutos por clase</label><select onchange="gProyCampo('${p.id}','min',this.value)">${[45, 50, 60, 90, 100].map(m => `<option${m === p.min ? ' selected' : ''}>${m}</option>`).join('')}</select></div>
          <div class="campo"><label>Inicia el</label><input type="date" value="${p.inicio}" onchange="gProyCampo('${p.id}','inicio',this.value)"></div>
        </div>
        <div class="campo"><label>Días en que tengo clase con este grupo</label><div class="g-checks">${G_DIAS.map(([n, l]) => `<label><input type="checkbox" ${p.dias.includes(n) ? 'checked' : ''} onchange="gProyDia('${p.id}',${n},this.checked)"> ${['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][n]}</label>`).join('')}</div></div>
        <div class="campo"><label>Días sin clase (opcional)</label><input value="${gEsc(p.sinClase)}" placeholder="Ej. 16/11/2026, 25/12/2026" onchange="gProyCampo('${p.id}','sinClase',this.value)"><div class="ayuda">Festivos, suspensiones o consejo técnico. Esas fechas se saltan.</div></div>
        ${gTablaCalendario(p)}
        <button class="g-btn g-btn-s" onclick="gDescargarCronograma('${p.id}')">⬇ Cronograma en Word</button>
      </details>
      <details class="g-det" style="padding:10px 0"><summary>🎓 Cómo abona a la calificación del trimestre</summary>
        <p style="font-size:12.5px;color:var(--gris);margin:10px 0">El proyecto <b>no es la única calificación</b>: aporta un porcentaje y el resto sale de tus otros criterios (actividades, exámenes, tareas…).</p>
        <div class="campo" style="max-width:260px"><label>Peso del proyecto en el trimestre</label><select onchange="gPesoProyecto(this.value)">${(() => { const v = crit ? gPct(g, crit.id, t) : 0, mx = crit ? gMaxPeso(g, t, crit.id) : 100, o = []; for (let i = 0; i <= mx; i += 5) o.push(i); if (!o.includes(v)) o.push(v); return o.sort((a, b) => a - b).map(i => `<option value="${i}"${i === v ? ' selected' : ''}>${i} %</option>`).join(''); })()}</select></div>
        ${G.pesoMsg ? `<div class="g-aviso" style="font-size:12px;margin-bottom:8px">ℹ️ ${G.pesoMsg}</div>` : ''}
        ${gSumaPct(g, t) !== 100 ? `<div class="g-mal" style="font-size:12px;margin-bottom:8px">Tus criterios suman ${gSumaPct(g, t)} %. Ajusta los demás en «Calificaciones» para que sumen 100 %.</div>` : ''}
        <button class="g-btn g-btn-s" onclick="gCrearEvalProyecto('${p.id}')">${nAct ? `Ver actividades (${nAct})` : '+ Crear actividades de evaluación (una por fase + producto final)'}</button>
      </details>
      ${met ? `<div class="g-fases">${met.fases.map(f => `<span style="border-color:${f.color};color:${f.color}">${gEsc(f.n)}</span>`).join('')}</div>` : ''}
      <div style="margin-top:10px"><button class="g-btn" onclick="gAbrirPlano('${p.id}')">📝 Diseñar Plano Didáctico</button> <button class="g-btn g-btn-x" onclick="gQuitarProyecto('${p.id}')">Quitar</button></div></div>`;
  });
  h += `</div>
  <div class="card"><div class="card-title">💡 Agregar proyecto a partir de mi problemática</div>
    <div class="f2"><div class="campo"><label>Metodología</label><select id="gt-met">${Object.values(METODOLOGIAS).map(m => `<option value="${m.id}"${m.id === metRec ? ' selected' : ''}>${gEsc(m.siglas)} · ${gEsc(m.nombre)}</option>`).join('')}</select></div>
    <div class="campo"><label>Alcance del proyecto</label><select id="gt-esc"><option value="aula">Aula · proyecto áulico</option><option value="escuela">Escuela · proyecto escolar</option><option value="comunidad">Comunidad · proyecto comunitario</option></select></div></div>
    <div class="campo"><label>Problemática de mi contexto</label><textarea id="gt-prob" rows="3" placeholder="Ej. En mi grupo, 12 de 35 estudiantes no comprenden lo que leen y evitan participar. En la comunidad casi no hay espacios de lectura."></textarea><div class="ayuda" style="color:#92400e">🔒 Esto se envía a la IA: <b>no escribas nombres de alumnos</b> ni datos de conducta, salud o familia.</div></div>
    <div class="l-err" id="gt-err" style="margin:0 0 12px"></div>
    <button class="g-btn" onclick="gSugerirProyectos()">💡 Sugerir proyectos</button>`;
  if (G.sugerencias.length) {
    h += `<div id="gt-sug" style="margin-top:16px"><div style="font-size:13px;font-weight:600;color:var(--azul);margin-bottom:8px">Proyectos sugeridos — elige los que quieras:</div>` +
      G.sugerencias.map((s, i) => `<div class="proy-card"><div class="proy-nom">${gEsc(s.nombre)}</div><div class="proy-pag">${gEsc(s.tipo)} · ${gEsc(s.tema)}</div><div class="proy-desc"><b>Producto:</b> ${gEsc(s.producto)}</div><button class="g-btn g-btn-s" style="margin-top:8px" onclick="gAgregarProyecto(${i})">+ Agregar a ${G_TRIM_NOM[t].toLowerCase()}</button></div>`).join('') + '</div>';
  }
  h += `<details class="g-det" style="margin-top:14px"><summary>✍️ Prefiero escribir mi propio proyecto</summary>
    <div class="f2" style="margin-top:10px"><div class="campo"><label>Nombre del proyecto</label><input id="gt-nom"></div><div class="campo"><label>Producto final</label><input id="gt-prod"></div></div>
    <button class="g-btn g-btn-s" onclick="gProyectoManual()">Agregar proyecto</button></details></div>`;
  gPanel().innerHTML = h;
}

// ============================================================
// 2b. PASE DE LISTA — alumnos desde teclado, Excel, Word o CSV;
//     y lista imprimible en PDF o Excel (carta horizontal)
// ============================================================

// ── Carga de librerías (solo cuando se necesitan) ──
const G_CDN = {
  xlsx: ['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', () => window.XLSX],
  mammoth: ['https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js', () => window.mammoth],
  jspdf: ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', () => window.jspdf],
  autotable: ['https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js', () => window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API && window.jspdf.jsPDF.API.autoTable],
  pdfjs: ['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', () => window.pdfjsLib],
  exceljs: ['https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js', () => window.ExcelJS],
};
async function gCargarLib(...claves) {
  for (const k of claves) {
    const [url, listo] = G_CDN[k];
    if (listo()) continue;
    await new Promise((ok, mal) => {
      const sc = document.createElement('script'); sc.src = url;
      sc.onload = ok; sc.onerror = () => mal(new Error('No se pudo cargar una herramienta necesaria. Revisa tu internet e inténtalo de nuevo.'));
      document.head.appendChild(sc);
    });
    if (!listo()) throw new Error('No se pudo preparar una herramienta necesaria. Recarga la página e inténtalo de nuevo.');
  }
}
function gDescargarBlob(blob, nombre) {
  if (licBloqueaDescarga()) return;
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function gNombreArchivo(g, ext, extra) {
  const lim = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '');
  return ['Lista', lim(g.nombre), lim(g.materia), extra ? lim(extra) : ''].filter(Boolean).join('_') + '.' + ext;
}

// ── Detección de nombres en filas de una hoja o tabla ──
const G_NO_NOMBRE = /^(escuela|secundaria|telesecundaria|t[eé]cnica|docente|maestr[oa]|profesor[a]?|prof|director[a]?|turno|grupo|grado|materia|asignatura|fecha|total|totales|firma|observaciones|ciclo|cct|clave|lista|nombre|alumno[s]?|alumna[s]?|n[uú]m|no|n\.l|mes|semana|zona|supervis\w*|municipio|localidad|asistencia|hombres|mujeres|matutino|vespertino|promedio|curp|matr[ií]cula|sexo|edad)(\b|$)/i;
function gTextoCelda(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }
function gPareceNombre(t) {
  t = gLimpiarNombre(gTextoCelda(t));
  if (t.length < 5 || t.length > 80) return false;
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’.\- ]+$/.test(t)) return false;
  if (t.split(' ').filter(Boolean).length < 2) return false;
  return !G_NO_NOMBRE.test(t);
}
function gExtraerNombres(filas) {
  const out = [];
  const normal = x => gTextoCelda(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  // 1) Columnas separadas: apellido paterno / materno / nombre(s)
  for (let r = 0; r < Math.min(filas.length, 25) && !out.length; r++) {
    const c = (filas[r] || []).map(normal);
    const iPat = c.findIndex(x => /paterno|primer apellido|apellido 1/.test(x));
    const iMat = c.findIndex(x => /materno|segundo apellido|apellido 2/.test(x));
    const iApe = c.findIndex(x => /^apellidos?$/.test(x));
    const iNom = c.findIndex(x => /^nombres?(\(s\))?$/.test(x));
    const apes = [iPat, iMat].filter(i => i >= 0); if (iPat < 0 && iApe >= 0) apes.push(iApe);
    if (iNom >= 0 && apes.length) {
      for (let k = r + 1; k < filas.length; k++) {
        const f = filas[k] || [];
        const t = [...apes, iNom].map(i => gTextoCelda(f[i])).filter(Boolean).join(' ');
        if (gPareceNombre(t)) out.push(t);
      }
    }
  }
  // 2) Una sola columna: la que tenga más cosas con forma de nombre
  if (!out.length) {
    const cols = {};
    filas.forEach(f => (f || []).forEach((v, i) => { if (gPareceNombre(v)) cols[i] = (cols[i] || 0) + 1; }));
    const mejor = Object.keys(cols).sort((a, b) => cols[b] - cols[a])[0];
    if (mejor != null) filas.forEach(f => { const v = (f || [])[mejor]; if (gPareceNombre(v)) out.push(gLimpiarNombre(gTextoCelda(v))); });
  }
  const vistos = new Set();
  return out.map(n => gLimpiarNombre(n)).filter(n => { const k = n.toLowerCase(); if (vistos.has(k)) return false; vistos.add(k); return true; }).slice(0, 200);
}

// ── PDF con texto (no escaneado): se reconstruyen los renglones y columnas por posición ──
async function gFilasDePDF(f) {
  await gCargarLib('pdfjs');
  const W = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  try { const t = await (await fetch(W)).text(); pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([t], { type: 'text/javascript' })); }
  catch (e) { pdfjsLib.GlobalWorkerOptions.workerSrc = W; }
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
  const filas = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const tc = await (await pdf.getPage(n)).getTextContent();
    const items = tc.items.filter(i => i.str && i.str.trim()).map(i => ({ s: i.str, x: i.transform[4], y: i.transform[5], w: i.width || 0 }));
    items.sort((a, b) => b.y - a.y || a.x - b.x);
    const lineas = [];
    items.forEach(it => { const l = lineas.find(l => Math.abs(l.y - it.y) <= 3); if (l) l.it.push(it); else lineas.push({ y: it.y, it: [it] }); });
    lineas.sort((a, b) => b.y - a.y).forEach(l => {
      l.it.sort((a, b) => a.x - b.x);
      const celdas = []; let ult = null;
      l.it.forEach(it => {
        if (ult && it.x - (ult.x + ult.w) < 6) celdas[celdas.length - 1] += (it.x - (ult.x + ult.w) > 0.5 ? ' ' : '') + it.s;
        else celdas.push(it.s);
        ult = it;
      });
      filas.push(celdas.map(gTextoCelda));
    });
  }
  if (!filas.length) throw new Error('Ese PDF no trae texto (parece una foto o un escaneo), así que no puedo leerlo. Pide la lista en Excel o Word, o teclea o pega los nombres.');
  return [filas];
}
// ── Lectura de archivos: Excel, CSV, Word (.docx), PDF o texto ──
async function gFilasDeArchivo(f) {
  const ext = f.name.split('.').pop().toLowerCase();
  if (ext === 'doc') throw new Error('Los archivos «.doc» (Word antiguo) no se pueden leer. Ábrelo en Word y guárdalo como «.docx», o copia los nombres y pégalos en el recuadro.');
  if (ext === 'txt') return [(await f.text()).split(/\r?\n/).map(l => [l])];
  if (ext === 'csv') {
    await gCargarLib('xlsx');
    const wb = XLSX.read(await f.text(), { type: 'string' });
    const hs = wb.SheetNames.map(n => XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: '' })); hs.nombres = wb.SheetNames; return hs;
  }
  if (['xlsx', 'xls', 'xlsm', 'ods'].includes(ext)) {
    await gCargarLib('xlsx');
    const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' });
    const hs = wb.SheetNames.map(n => XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: '' })); hs.nombres = wb.SheetNames; return hs;
  }
  if (ext === 'pdf') return gFilasDePDF(f);
  if (ext === 'docx') {
    await gCargarLib('mammoth');
    const r = await mammoth.convertToHtml({ arrayBuffer: await f.arrayBuffer() });
    const doc = new DOMParser().parseFromString('<div>' + r.value + '</div>', 'text/html');
    const filas = [];
    doc.body.firstChild.childNodes.forEach(n => {
      if (n.nodeName === 'TABLE') n.querySelectorAll('tr').forEach(tr => filas.push([...tr.children].map(td => gTextoCelda(td.textContent))));
      else if (n.textContent && n.textContent.trim()) n.textContent.split(/\n/).forEach(l => filas.push([l]));
    });
    return [filas];
  }
  throw new Error('Ese tipo de archivo no se puede leer. Usa Excel (.xlsx, .xls), Word (.docx), PDF, CSV o texto (.txt).');
}
// Excel con varias hojas (una por grupo: «3 A», «3° B»…): botones para elegir qué hoja cargar
const G_HOJAS_ARCH = {};
function gNombreGrupoDeHoja(n) {
  const t = gTextoCelda(n), m = t.match(/^(\d)\s*[°º.]?\s*([A-Za-zÑñ])$/);
  return m ? m[1] + '° ' + m[2].toUpperCase() : t;
}
function gCargarHojaAlumnos(idTa, i) {
  const hojas = G_HOJAS_ARCH[idTa] || [], h = hojas[i], ta = document.getElementById(idTa); if (!h || !ta) return;
  ta.value = h.nombres.join('\n');
  // si es el formulario de crear grupo, se rellenan nombre y grado (en «Agregar alumnos» a un grupo ya hecho no se toca nada)
  const pref = idTa === 'gn-lista' ? 'gg' : (idTa === 'gl-lista' && document.getElementById('gq-nombre') ? 'gq' : '');
  if (pref) {
    const gn = gNombreGrupoDeHoja(h.hoja), inp = document.getElementById(pref + '-nombre'), gr = document.getElementById(pref + '-grado'), mat = document.getElementById(pref + '-materia');
    if (inp) inp.value = gn;
    if (gr && /^[123]/.test(gn) && gr.value !== gn[0]) { const m0 = mat && mat.value; gr.value = gn[0]; gr.dispatchEvent(new Event('change')); if (mat && m0 && [...mat.options].some(o => o.value === m0)) mat.value = m0; }
  }
  const caja = document.getElementById(idTa + '-hojas'); if (!caja) return;
  caja.textContent = ''; caja.style.display = 'block';
  const tit = document.createElement('div'); tit.style.cssText = 'font-size:12px;color:var(--gris);margin-bottom:4px'; tit.textContent = 'Hojas con alumnos en este archivo:'; caja.appendChild(tit);
  hojas.forEach((x, k) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'g-btn g-btn-s'; b.style.margin = '0 6px 6px 0'; b.dataset.hoja = k;
    b.textContent = (k === i ? '✓ ' : '') + x.hoja + ' · ' + x.nombres.length;
    b.onclick = () => gCargarHojaAlumnos(idTa, k); caja.appendChild(b);
  });
  if (pref && hojas.length > 1) {
    const t = document.createElement('div'); t.style.cssText = 'margin-top:8px';
    const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'g-btn'; bt.textContent = '✅ Crear los ' + hojas.length + ' grupos de una vez';
    bt.onclick = () => gCrearGruposDeHojas(idTa); t.appendChild(bt);
    const ay = document.createElement('div'); ay.style.cssText = 'font-size:11.5px;color:var(--gris);margin-top:4px'; ay.textContent = 'Crea un grupo por cada hoja, con la materia y el grado que ves arriba (el grado se toma del nombre de la hoja). Los que ya existen no se repiten.'; t.appendChild(ay);
    caja.appendChild(t);
  }
}
// Crea de una vez un grupo por cada hoja del Excel
function gCrearGruposDeHojas(idTa) {
  const hojas = G_HOJAS_ARCH[idTa] || [];
  const pref = idTa === 'gn-lista' ? 'gg' : (idTa === 'gl-lista' && document.getElementById('gq-nombre') ? 'gq' : '');
  const gr = document.getElementById(pref + '-grado'), mat = document.getElementById(pref + '-materia');
  if (!pref || !hojas.length || !gr || !mat) return;
  const materia = mat.value, ya = new Set(G.data.grupos.map(g => (g.nombre + '|' + g.materia).toLowerCase()));
  const nuevos = [], omitidos = [];
  hojas.forEach(h => {
    const nombre = gNombreGrupoDeHoja(h.hoja), grado = /^[123]/.test(nombre) ? nombre[0] : gr.value, k = (nombre + '|' + materia).toLowerCase();
    if (ya.has(k)) { omitidos.push(nombre); return; }
    ya.add(k); nuevos.push({ id: gId(), nombre, grado, materia, alumnos: h.nombres.map(n => ({ id: gId(), nombre: n })), asist: {}, criterios: G_CRITERIOS_DEF.map(gCritDef), actividades: [], plan: {} });
  });
  if (!nuevos.length) { gAviso('Esos grupos ya existen (' + omitidos.join(', ') + '). No se creó ninguno.'); return; }
  if (!confirm('Se van a crear ' + nuevos.length + ' grupos de ' + materia + ': ' + nuevos.map(g => g.nombre + ' (' + g.alumnos.length + ' alumnos)').join(', ') + '.' + (omitidos.length ? '\n\nYa existen y no se tocan: ' + omitidos.join(', ') + '.' : '') + '\n\n¿Continuar?')) return;
  nuevos.forEach(g => G.data.grupos.push(g));
  G.gid = nuevos[0].id; G.nuevoGrupo = false; G.editGrupo = null; gGuardar(); gRender(); window.scrollTo(0, 0);
}
async function gLeerArchivoAlumnos(input, idTa) {
  if (licEsPrueba()) { input.value = ''; licAvisoPrueba('Subir tu lista de alumnos desde un archivo'); return; }
  const f = input.files && input.files[0]; if (!f) return;
  const msg = document.getElementById(idTa + '-msg'), ta = document.getElementById(idTa);
  const decir = (t, ok) => { if (msg) { msg.textContent = t; msg.style.color = ok ? 'var(--verde)' : 'var(--rojo)'; msg.style.display = 'block'; } };
  decir('Leyendo «' + f.name + '»…', true);
  try {
    const hojas = await gFilasDeArchivo(f);
    const conAlumnos = hojas.map((filas, i) => ({ hoja: (hojas.nombres && hojas.nombres[i]) || ('Hoja ' + (i + 1)), nombres: gExtraerNombres(filas) })).filter(h => h.nombres.length);
    const nombres = conAlumnos.length ? conAlumnos[0].nombres : [];
    const caja = document.getElementById(idTa + '-hojas'); if (caja) { caja.style.display = 'none'; caja.textContent = ''; }
    if (conAlumnos.length > 1) {
      G_HOJAS_ARCH[idTa] = conAlumnos; gCargarHojaAlumnos(idTa, 0);
      decir('Listo: «' + f.name + '» tiene ' + conAlumnos.length + ' hojas con alumnos. Cargué la primera. Para cargar otra, tócala abajo (reemplaza lo que haya en el recuadro). Revisa los nombres y toca el botón de crear.', true);
      input.value = ''; return;
    }
    if (!nombres.length) { decir('No encontré nombres de alumnos en «' + f.name + '». Revisa que los nombres estén en una columna (o uno por renglón), o cópialos y pégalos en el recuadro.', false); }
    else {
      const previo = ta.value.trim();
      ta.value = (previo ? previo + '\n' : '') + nombres.join('\n');
      decir('Listo: encontré ' + nombres.length + ' nombres en «' + f.name + '». Revísalos (puedes corregir o borrar renglones) y toca el botón de abajo para crear la lista.', true);
    }
  } catch (e) { decir(e.message || 'No se pudo leer el archivo.', false); }
  input.value = '';
}
function gUiArchivo(idTa) {
  if (licEsPrueba()) return `<div class="g-aviso" style="margin:6px 0 10px;font-size:12.5px">🔒 Subir tu lista desde Excel, Word, PDF o CSV está disponible con tu licencia. Mientras tanto puedes teclear o pegar los nombres.</div>`;
  return `<div style="margin:6px 0 10px"><label class="g-btn g-btn-s" style="cursor:pointer;margin:0">📂 Subir Excel, Word, PDF o CSV
      <input type="file" accept=".xlsx,.xls,.xlsm,.ods,.csv,.docx,.pdf,.txt" style="display:none" onchange="gLeerArchivoAlumnos(this,'${idTa}')"></label>
    <span style="font-size:11.5px;color:var(--gris);margin-left:6px">Los nombres aparecen en el recuadro para que los revises antes de crear la lista.</span>
    <div id="${idTa}-msg" style="display:none;font-size:12.5px;margin-top:8px;line-height:1.4"></div>
    <div id="${idTa}-hojas" style="display:none;margin-top:8px"></div></div>`;
}
function gNombresDeTexto(texto) {
  const ya = new Set(); const out = [];
  String(texto || '').split(/\r?\n/).map(gLimpiarNombre).filter(Boolean).forEach(n => { const k = n.toLowerCase(); if (!ya.has(k)) { ya.add(k); out.push(n); } });
  return out;
}

// ── Pase de lista sin grupos todavía: crear grupo + lista en un solo paso ──
function gActualizarMateriasRapido() {
  const gr = document.getElementById('gq-grado').value;
  document.getElementById('gq-materia').innerHTML = gMateriasOpts(gr);
}
function gRenderListaInicio() {
  gPanel().innerHTML = `<div class="sec-title">Pase de lista</div><div class="sec-sub">Crea tu grupo y tu lista de alumnos; después pasas lista en segundos.</div>
  <div class="card"><div class="card-title">🚀 Empieza aquí: tu primer grupo</div>
    <div class="f3">
      <div class="campo"><label>Grupo</label><input id="gq-nombre" placeholder="Ej. 2° B"></div>
      <div class="campo"><label>Grado</label><select id="gq-grado" onchange="gActualizarMateriasRapido()"><option value="1">1° Secundaria</option><option value="2">2° Secundaria</option><option value="3">3° Secundaria</option></select></div>
      <div class="campo"><label>Materia que impartes</label><select id="gq-materia">${gMateriasOpts('1')}</select></div>
    </div>
    <div class="campo"><label>Alumnos (teclea o pega un nombre por renglón)</label>
      <textarea id="gl-lista" rows="6" placeholder="1. AGUILAR PECH ANDREA&#10;2. BALAM CHAN DIEGO"></textarea>
      <div class="ayuda">Se quitan solos los números del inicio y los nombres repetidos.</div></div>
    ${gUiArchivo('gl-lista')}
    <button class="g-btn" onclick="gCrearGrupoRapido()">Crear grupo y lista</button>
  </div>`;
}
function gCrearGrupoRapido() {
  const nombre = document.getElementById('gq-nombre').value.trim();
  const grado = document.getElementById('gq-grado').value, materia = document.getElementById('gq-materia').value;
  if (!nombre) { gAviso('Escribe el nombre del grupo, por ejemplo «2° B».'); return; }
  const nombres = gNombresDeTexto(document.getElementById('gl-lista').value);
  if (!nombres.length) { gAviso('Teclea, pega o sube al menos un nombre de alumno.'); return; }
  const g = { id: gId(), nombre, grado, materia, alumnos: nombres.map(n => ({ id: gId(), nombre: n })), asist: {}, criterios: G_CRITERIOS_DEF.map(gCritDef), actividades: [], plan: {} };
  G.data.grupos.push(g); G.gid = g.id; gGuardar(); gRender();
}
// ── Tarjeta para agregar alumnos desde el Pase de lista ──
function gTarjetaAlumnos(g) {
  const n = g.alumnos.length;
  return `<details class="card g-det"${n ? '' : ' open'}><summary class="card-title" style="cursor:pointer">👥 Alumnos de ${gEsc(g.nombre)} (${n}) <span style="font-weight:400;font-size:12px;color:var(--gris);margin-left:8px">${n ? 'Toca para agregar más' : 'Agrega a tus alumnos'}</span></summary>
    <div class="campo" style="margin-top:10px"><label>Teclea o pega nombres (uno por renglón)</label>
      <textarea id="gl-lista" rows="5" placeholder="1. AGUILAR PECH ANDREA&#10;2. BALAM CHAN DIEGO"></textarea></div>
    ${gUiArchivo('gl-lista')}
    <button class="g-btn" onclick="gAgregarAlumnos('gl-lista')">Agregar a la lista</button>
    ${n > 1 ? '<button class="g-btn g-btn-s" onclick="gOrdenarAlumnos()">Ordenar A–Z</button>' : ''}
    <div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">Para corregir o quitar un nombre, ve a «Mis grupos».</div></details>`;
}

// ── Descarga de la lista: PDF o Excel, carta horizontal ──
const G_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const G_DIA_LETRA = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
function gMesTieneAsistencia(g, mes) { return Object.keys(g.asist || {}).some(f => f.startsWith(mes) && Object.keys(g.asist[f] || {}).length); }
function gMesLista() {   // al cambiar de mes se elige solo lo más útil: con marcas si ese mes ya tiene lista
  const g = gGrupo(), mes = document.getElementById('ge-mes').value; G.modoLista = undefined;
  document.getElementById('ge-modo').value = gMesTieneAsistencia(g, mes) ? 'registrada' : 'blanco';
}
function gTarjetaDescarga(g) {
  if (!g.alumnos.length) return '';
  const hoy = G.fecha || gHoy(); const y0 = +hoy.slice(0, 4), m0 = +hoy.slice(5, 7);
  const ini = m0 >= 8 ? y0 : y0 - 1;                       // el ciclo empieza en agosto
  const meses = []; for (let i = 0; i < 12; i++) { const m = ((7 + i) % 12) + 1, y = ini + (7 + i >= 12 ? 1 : 0); meses.push([y + '-' + String(m).padStart(2, '0'), G_MESES[m - 1] + ' ' + y]); }
  const act = hoy.slice(0, 7);
  const modoIni = G.modoLista || (gMesTieneAsistencia(g, act) ? 'registrada' : 'blanco');   // si ya pasaste lista ese mes, sale con tus marcas
  return `<div class="card"><div class="card-title">🖨️ Descargar la lista (carta, horizontal)</div>
    <div class="f3">
      <div class="campo"><label>Mes</label><select id="ge-mes" onchange="gMesLista()">${meses.map(([v, t]) => `<option value="${v}"${v === act ? ' selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('')}</select></div>
      <div class="campo"><label>Contenido</label><select id="ge-modo" onchange="G.modoLista=this.value"><option value="registrada"${modoIni === 'registrada' ? ' selected' : ''}>Con la asistencia ya registrada (tus faltas, retardos y justificadas)</option><option value="blanco"${modoIni === 'blanco' ? ' selected' : ''}>En blanco, para pasar lista a mano</option></select></div>
    </div>
    <div class="campo"><label>Días de la semana que das clase</label>
      <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:13px">${[[1, 'Lunes'], [2, 'Martes'], [3, 'Miércoles'], [4, 'Jueves'], [5, 'Viernes']].map(([n, t]) => `<label style="display:flex;gap:6px;align-items:center;margin:0;text-transform:none;letter-spacing:0;font-weight:400;font-size:13px;color:var(--gris-oscuro)"><input type="checkbox" id="ge-d${n}" checked style="width:auto;flex:none;padding:0;margin:0"> ${t}</label>`).join('')}</div></div>
    <button class="g-btn" id="ge-pdf" onclick="gExportarLista('pdf')">⬇ Descargar PDF</button>
    <button class="g-btn g-btn-s" id="ge-xls" onclick="gExportarLista('xlsx')">⬇ Descargar Excel</button>
    <div id="ge-msg" style="display:none;font-size:12.5px;margin-top:8px"></div>
    <div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">Hoja tamaño carta horizontal. Ningún nombre se corta al final de la hoja: si la lista es larga, continúa en la siguiente hoja con los encabezados repetidos. En Excel, los totales se calculan solos conforme llenas las casillas.</div></div>`;
}
function gDatosHoja() {
  const g = gGrupo();
  const mes = document.getElementById('ge-mes').value, modo = document.getElementById('ge-modo').value;
  const sel = [1, 2, 3, 4, 5].filter(n => document.getElementById('ge-d' + n).checked);
  const [y, m] = mes.split('-').map(Number);
  const dias = []; const nd = new Date(y, m, 0).getDate();
  for (let d = 1; d <= nd; d++) { const dow = new Date(y, m - 1, d).getDay(); if (sel.includes(dow)) dias.push({ d, dow, iso: mes + '-' + String(d).padStart(2, '0') }); }
  const filas = g.alumnos.map((a, i) => {
    const marcas = dias.map(x => modo === 'registrada' ? (((g.asist[x.iso] || {})[a.id]) || '') : '');
    const c = { P: 0, R: 0, F: 0, J: 0 }; marcas.forEach(v => { if (c[v] != null) c[v]++; });
    return { n: i + 1, nombre: a.nombre, marcas, c };
  });
  const mesTxt = G_MESES[m - 1].charAt(0).toUpperCase() + G_MESES[m - 1].slice(1) + ' ' + y;
  return { g, mes, mesTxt, modo, dias, filas };
}
function gMsgExp(t, ok) { const e = document.getElementById('ge-msg'); if (!e) return; e.textContent = t; e.style.color = ok ? 'var(--verde)' : 'var(--rojo)'; e.style.display = t ? 'block' : 'none'; }
async function gExportarLista(formato) {
  const btns = ['ge-pdf', 'ge-xls'].map(id => document.getElementById(id));
  let H;
  try { H = gDatosHoja(); } catch (e) { return; }
  if (!H.dias.length) { gMsgExp('Marca al menos un día de la semana.', false); return; }
  btns.forEach(b => b && (b.disabled = true)); gMsgExp('Preparando tu archivo…', true);
  try {
    if (formato === 'pdf') await gListaPDF(H); else await gListaExcel(H);
    gMsgExp('Listo, tu archivo se descargó.', true);
  } catch (e) { gMsgExp(e.message || 'No se pudo crear el archivo.', false); }
  btns.forEach(b => b && (b.disabled = false));
}
function gTitulosHoja(H) {
  const p = gPerfil();
  return {
    escuela: gEscuela() || 'Escuela Secundaria',
    titulo: 'LISTA DE ASISTENCIA — ' + H.mesTxt.toUpperCase(),
    info: `Docente: ${gDocente()}     Grupo: ${H.g.nombre}     Materia: ${H.g.materia}     Grado: ${H.g.grado}°` + (p.cct ? `     CCT: ${p.cct}` : ''),
    leyenda: '✓ = Asistió    R = Retardo    F = Falta    J = Falta justificada',
  };
}
// Marcas de la lista impresa: fondo blanco y solo el símbolo (✓, R, F, J) a color y en negritas, con los colores de la app.
const G_MARCA = {
  P: { rgb: [21, 128, 61], hex: 'FF15803D', nom: 'Asistió' },
  R: { rgb: [217, 119, 6], hex: 'FFD97706', nom: 'Retardo' },
  F: { rgb: [220, 38, 38], hex: 'FFDC2626', nom: 'Falta' },
  J: { rgb: [37, 99, 168], hex: 'FF2563A8', nom: 'Falta justificada' },
};
function gMarcaPDF(doc, k, x, y, w, h) {   // ✓ dibujada o letra en negritas, centrada en la casilla
  const m = G_MARCA[k]; if (!m) return;
  doc.setDrawColor(...m.rgb); doc.setTextColor(...m.rgb);
  if (k === 'P') { doc.setLineWidth(0.9); const a = Math.min(w, h); doc.line(x + w / 2 - a * 0.26, y + h / 2 + a * 0.02, x + w / 2 - a * 0.07, y + h / 2 + a * 0.22); doc.line(x + w / 2 - a * 0.07, y + h / 2 + a * 0.22, x + w / 2 + a * 0.3, y + h / 2 - a * 0.22); }
  else { doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(k, x + w / 2, y + h / 2 + 1.5, { align: 'center' }); }
  doc.setLineWidth(0.2);
}
async function gListaPDF(H) {
  await gCargarLib('jspdf', 'autotable');
  const { jsPDF } = window.jspdf; const T = gTitulosHoja(H);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
  const W = doc.internal.pageSize.getWidth(), Hh = doc.internal.pageSize.getHeight();
  const mL = 10, mR = 10, top = 33, bottom = 14;
  const wNum = 8, wNom = 74, wTot = 11, nTot = 4;
  const wDia = Math.min(9, (W - mL - mR - wNum - wNom - wTot * nTot) / H.dias.length);
  const head = [['No.', 'Nombre del alumno', ...H.dias.map(x => x.d + '\n' + G_DIA_LETRA[x.dow]), 'Asist.', 'Ret.', 'Faltas', 'Just.']];
  const body = H.filas.map(f => [f.n, f.nombre, ...f.marcas, ...(H.modo === 'registrada' ? [f.c.P, f.c.R, f.c.F, f.c.J] : ['', '', '', ''])]);
  const cs = { 0: { cellWidth: wNum, halign: 'center' }, 1: { cellWidth: wNom, halign: 'left', overflow: 'linebreak' } };
  H.dias.forEach((_, i) => { cs[2 + i] = { cellWidth: wDia, halign: 'center' }; });
  for (let i = 0; i < nTot; i++) cs[2 + H.dias.length + i] = { cellWidth: wTot, halign: 'center' };
  const encabezado = () => {
    doc.setTextColor(20); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(T.escuela, W / 2, 11, { align: 'center' });
    doc.setFontSize(10.5); doc.text(T.titulo, W / 2, 17, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.text(T.info, W / 2, 23, { align: 'center' });
  };
  doc.autoTable({
    head, body, startY: top, margin: { left: mL, right: mR, top, bottom },
    theme: 'grid', rowPageBreak: 'avoid', showHead: 'everyPage',
    styles: { font: 'helvetica', fontSize: 8, cellPadding: { top: 1.5, bottom: 1.5, left: 1.4, right: 1.4 }, lineColor: [110, 110, 110], lineWidth: 0.2, minCellHeight: 6.4, valign: 'middle', textColor: 20 },
    headStyles: { fillColor: [219, 234, 254], textColor: [26, 58, 92], halign: 'center', fontStyle: 'bold', fontSize: 7.5, minCellHeight: 9 },
    columnStyles: cs,
    didDrawPage: encabezado,
    didParseCell: d => {
      if (d.section !== 'body' || d.column.index < 2 || d.column.index >= 2 + H.dias.length) return;
      if (G_MARCA[d.cell.raw]) d.cell.text = [''];   // el símbolo se dibuja aparte, a color
    },
    didDrawCell: d => {
      if (d.section !== 'body' || d.column.index < 2 || d.column.index >= 2 + H.dias.length) return;
      const v = d.cell.raw; if (G_MARCA[v]) gMarcaPDF(doc, v, d.cell.x, d.cell.y, d.cell.width, d.cell.height);
    },
  });
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(90);
    let x = mL;   // leyenda con las marcas de color
    ['P', 'R', 'F', 'J'].forEach(k => {
      gMarcaPDF(doc, k, x, Hh - 10.2, 6, 5); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(60);
      const t = G_MARCA[k].nom; doc.text(t, x + 7.5, Hh - 6.6); x += 7.5 + doc.getTextWidth(t) + 7;
    });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(90); doc.text('Hoja ' + i + ' de ' + n, W - mR, Hh - 7, { align: 'right' });
  }
  gDescargarBlob(doc.output('blob'), gNombreArchivo(H.g, 'pdf', H.mesTxt + (H.modo === 'blanco' ? ' en blanco' : ' con asistencia')));
}
async function gListaExcel(H) {
  await gCargarLib('exceljs');
  const T = gTitulosHoja(H);
  const wb = new ExcelJS.Workbook(); wb.creator = 'Planeador Docente NEM';
  const nD = H.dias.length, nCol = 2 + nD + 4;
  const ws = wb.addWorksheet('Lista', { pageSetup: { paperSize: 1, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.6, header: 0.2, footer: 0.25 } } });
  ws.getColumn(1).width = 5; ws.getColumn(2).width = 40;
  for (let i = 0; i < nD; i++) ws.getColumn(3 + i).width = 4.6;
  for (let i = 0; i < 4; i++) ws.getColumn(3 + nD + i).width = 7;
  const centro = { horizontal: 'center', vertical: 'middle', wrapText: true };
  const fila = (r, texto, tam, neg) => { ws.mergeCells(r, 1, r, nCol); const c = ws.getCell(r, 1); c.value = texto; c.font = { bold: !!neg, size: tam }; c.alignment = { horizontal: 'center', vertical: 'middle' }; ws.getRow(r).height = tam + 8; };
  fila(1, T.escuela, 13, true); fila(2, T.titulo, 11, true); fila(3, T.info, 9.5, false);
  const rH = 5; const hr = ws.getRow(rH); hr.height = 30;
  const titulos = ['No.', 'Nombre del alumno', ...H.dias.map(x => x.d + '\n' + G_DIA_LETRA[x.dow]), 'Asist.', 'Ret.', 'Faltas', 'Just.'];
  titulos.forEach((t, i) => { const c = hr.getCell(i + 1); c.value = t; c.font = { bold: true, size: 9, color: { argb: 'FF1A3A5C' } }; c.alignment = centro; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }; });
  const borde = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  const L = i => { let s = '', n = i; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  H.filas.forEach((f, i) => {
    const r = rH + 1 + i; const row = ws.getRow(r); row.height = 20;
    row.getCell(1).value = f.n; row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).value = f.nombre; row.getCell(2).alignment = { vertical: 'middle', wrapText: true };
    f.marcas.forEach((v, k) => { const c = row.getCell(3 + k); c.value = v ? (v === 'P' ? '✓' : v) : null; c.alignment = centro; c.dataValidation = { type: 'list', allowBlank: true, showErrorMessage: false, formulae: ['"✓,R,F,J"'] }; });
    const a = L(3), b = L(2 + nD);
    ['P', 'R', 'F', 'J'].forEach((cod, k) => {
      const c = row.getCell(3 + nD + k), rng = `${a}${r}:${b}${r}`;
      c.value = { formula: cod === 'P' ? `COUNTIF(${rng},"✓")+COUNTIF(${rng},"P")` : `COUNTIF(${rng},"${cod}")`, result: f.c[cod] }; c.alignment = centro;
    });
    for (let k = 1; k <= nCol; k++) { const c = row.getCell(k); c.border = borde; c.font = { size: 10 }; }
    f.marcas.forEach((v, k) => { const m = G_MARCA[v]; if (!m) return; const c = row.getCell(3 + k); c.font = { bold: true, size: 13, color: { argb: m.hex } }; });
  });
  for (let k = 1; k <= nCol; k++) hr.getCell(k).border = borde;
  // Colores automáticos: si la maestra escribe ✓, R, F o J a mano, la casilla se pinta sola
  const ref = `${L(3)}${rH + 1}:${L(2 + nD)}${rH + H.filas.length}`;
  const reglaCF = (txt, k) => ({ type: 'cellIs', operator: 'equal', formulae: [`"${txt}"`], style: { font: { bold: true, color: { argb: G_MARCA[k].hex } } } });
  ws.addConditionalFormatting({ ref, rules: [reglaCF('✓', 'P'), reglaCF('P', 'P'), reglaCF('R', 'R'), reglaCF('F', 'F'), reglaCF('J', 'J')] });
  // Leyenda con los mismos colores
  const rl = rH + H.filas.length + 2; const lr = ws.getRow(rl); lr.height = 20;
  ['P', 'R', 'F', 'J'].forEach((k, i) => { const c = lr.getCell(3 + i * 5); c.value = k === 'P' ? '✓' : k; c.alignment = centro; c.font = { bold: true, size: 13, color: { argb: G_MARCA[k].hex } }; c.border = borde; const t = lr.getCell(4 + i * 5); t.value = G_MARCA[k].nom; t.font = { size: 9 }; });
  ws.pageSetup.printTitlesRow = rH + ':' + rH;
  ws.views = [{ state: 'frozen', xSplit: 2, ySplit: rH }];
  ws.headerFooter.oddFooter = '&L&8' + T.leyenda + '&R&8Hoja &P de &N';
  const buf = await wb.xlsx.writeBuffer();
  gDescargarBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), gNombreArchivo(H.g, 'xlsx', H.mesTxt + (H.modo === 'blanco' ? ' en blanco' : ' con asistencia')));
}
