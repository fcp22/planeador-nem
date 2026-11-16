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
function gBoleta(f) { return f == null ? null : Math.max(5, Math.round(f + 1e-9)); }
function gAviso(msg) { alert(msg); }

// ── Almacenamiento ────────────────────────────────────────
function gClave() { const u = (typeof getUsuario === 'function') ? getUsuario() : null; return 'nem_gestion_' + ((u && (u.curp || u.nombre)) || 'anon'); }
function gCargar() {
  G.key = gClave();
  try { G.data = JSON.parse(localStorage.getItem(G.key) || 'null'); } catch (e) { G.data = null; }
  if (!G.data || !Array.isArray(G.data.grupos)) G.data = { v: 1, grupos: [] };
  gSembrarPerfil();
  G.gid = G.data.grupos[0] ? G.data.grupos[0].id : null;
  G.fecha = gHoy();
  G.borrador = null; G.sugerencias = [];
  G.trimCalif = G.trimExam = G.trimPlan = gTrimDeFecha(gHoy());
}
function gGuardar() {
  try { localStorage.setItem(G.key, JSON.stringify(G.data)); }
  catch (e) { gAviso('No se pudo guardar en este dispositivo (¿almacenamiento lleno o bloqueado?). Descarga un respaldo desde «Mis grupos».'); }
}
function gGrupo() { return (G.data && G.data.grupos.find(g => g.id === G.gid)) || null; }
function gCampoDe(grado, materia) {
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
  p.tipoEscuela = document.getElementById('gp-tipo').value.trim(); p.zona = document.getElementById('gp-zona').value.trim();
  gGuardar(); gPrefillEscuela(); gAviso('Listo: tus datos de escuela se usarán en tus planeaciones y documentos.');
}

// ── Punto de entrada ──────────────────────────────────────
function gInit() { gCargar(); if (G.tab) gRender(); }
function gOnTab(id) {
  if (typeof licOnTab === 'function' && licOnTab(id)) { G.tab = id; return; }
  const conocidas = ['inicio', 'grupos', 'lista', 'calif', 'examenes', 'trim', 'rezago', ...Object.keys(G_PRONTO)];
  if (!conocidas.includes(id)) return;
  if (!G.data) gCargar();
  G.tab = id;
  gRender();
}
function gRender() {
  if (G_PRONTO[G.tab]) return gRenderProntoTab(G.tab);
  const f = { inicio: gRenderInicio, grupos: gRenderGrupos, lista: gRenderLista, calif: gRenderCalif, examenes: gRenderExamenes, trim: gRenderTrim, rezago: gRenderRezago }[G.tab];
  if (f) f();
}

// ── Menús que todavía están en construcción (se van llenando uno por uno) ──
const G_PRONTO = {
  bitacora: ['📔', 'Bitácora de clase', 'Diario de cada sesión: qué se trabajó, qué pasó y a quién dar seguimiento, con evidencias fotográficas.'],
  escaner: ['📷', 'Escáner de exámenes', 'Fotografiar el examen resuelto y obtener la calificación de cada alumno automáticamente.'],
  calendario: ['📅', 'Calendario escolar', 'Días festivos, periodos de evaluación y tus propios eventos, con sugerencias para planear.'],
  horario: ['🕐', 'Horario semanal', 'Tu horario por grupo y materia, para que el pase de lista y la planeación se llenen solos.'],
};
function gRenderProntoTab(id) {
  const [ico, tit, desc] = G_PRONTO[id];
  gPanel().innerHTML = `<div class="card pronto-box"><div class="pi">${ico}</div><span class="pronto-tag">🚧 En construcción</span><h2>${tit}</h2><p>${desc}</p><p style="font-size:12px;margin-top:14px">Lo iremos armando paso a paso. Mientras tanto, usa lo que ya está listo desde «Inicio».</p><button class="g-btn" style="margin-top:14px" onclick="gIrA('inicio')">Volver a Inicio</button></div>`;
}

// ── Pantalla de inicio con accesos directos ──
const G_MENU = [
  ['lista', '✅', 'Pasar lista', 'Asistencia, retardos y faltas', true],
  ['nueva', '📝', 'Planeación', 'Programa analítico y plano didáctico', true],
  ['trim', '🧭', 'Proyecto del trimestre', 'Fases, fechas y tiempos', true],
  ['calif', '📊', 'Calificaciones', 'Criterios y calificación del trimestre', true],
  ['examenes', '🧮', 'Exámenes', 'Crear con IA y calificar', true],
  ['grupos', '👥', 'Mis grupos', 'Alumnos y listas', true],
  ['rezago', '🚦', 'Rezago', 'Semáforo de alumnos en riesgo', true],
  ['bitacora', '📔', 'Bitácora', 'Diario de cada clase', false],
  ['escaner', '📷', 'Escanear examen', 'Calificar con la cámara', false],
  ['calendario', '📅', 'Calendario', 'Festivos y evaluaciones', false],
  ['horario', '🕐', 'Horario', 'Tu semana por grupo', false],
  ['historial', '📋', 'Historial', 'Planeaciones generadas', true],
  ['licencia', '🔑', 'Mi licencia', 'IA, plan y código', true],
];
// Iconos de línea propios (24×24) y su color de acento, para las tarjetas y la barra inferior
const G_ICONOS = {
  lista: ['<rect x="3" y="3" width="18" height="18" rx="4.5"/><path d="M8 12.2l3 3 5-6"/>', '#16a34a', '#dcfce7'],
  nueva: ['<path d="M2.5 5.5c3-1.4 6-1.2 9.5 1.2 3.5-2.4 6.5-2.6 9.5-1.2V19c-3-1.4-6-1.2-9.5 1.2C8.500 17.800 5.500 17.600 2.500 19z"/><path d="M12 6.700V20"/>', '#4f46e5', '#e0e7ff'],
  trim: ['<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.500"/><circle cx="12" cy="12" r=".8"/>', '#7c3aed', '#ede9fe'],
  calif: ['<path d="M19 5L5 19"/><circle cx="7.200" cy="7.200" r="2.600"/><circle cx="16.800" cy="16.800" r="2.600"/>', '#ea580c', '#ffedd5'],
  examenes: ['<path d="M4 20h4L19.500 8.500l-4-4L4 16z"/><path d="M13.500 6.500l4 4"/>', '#9333ea', '#f3e8ff'],
  grupos: ['<circle cx="9" cy="8" r="3.200"/><path d="M3 20c0-3.500 2.700-6 6-6s6 2.500 6 6"/><circle cx="17" cy="9" r="2.500"/><path d="M17.500 14c2.500.3 4 2.200 4 5"/>', '#2563eb', '#dbeafe'],
  rezago: ['<path d="M4 20v-6M10 20V9M16 20V4"/><path d="M2.500 20.500h19"/>', '#e11d48', '#ffe4e6'],
  bitacora: ['<rect x="5" y="4" width="14" height="17" rx="2.800"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>', '#db2777', '#fce7f3'],
  escaner: ['<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.500"/>', '#0284c7', '#e0f2fe'],
  calendario: ['<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>', '#0d9488', '#ccfbf1'],
  horario: ['<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.500 2"/>', '#d97706', '#fef3c7'],
  historial: ['<path d="M6 3h8l4 4v14H6z"/><path d="M9 12h6M9 16h6"/>', '#475569', '#e2e8f0'],
  licencia: ['<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>', '#ca8a04', '#fef9c3'],
  libros: ['<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h11"/>', '#0f766e', '#ccfbf1'],
  mas: ['<circle cx="5" cy="12" r="1.300"/><circle cx="12" cy="12" r="1.300"/><circle cx="19" cy="12" r="1.300"/>', '#64748b', '#e2e8f0'],
  inicio: ['<path d="M3.500 11L12 3.500 20.500 11V20a1 1 0 01-1 1H15v-6H9v6H4.500a1 1 0 01-1-1z"/>', '#2563a8', '#dbeafe'],
};
function gIco(id) { const i = G_ICONOS[id] || G_ICONOS.mas; return `<svg viewBox="0 0 24 24" aria-hidden="true">${i[0]}</svg>`; }
function gTinte(id) { const i = G_ICONOS[id] || G_ICONOS.mas; return `--tc:${i[1]};--tb:${i[2]}`; }
const G_FLECHA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

// Barra inferior para el teléfono (Inicio · Lista · Planeación · Calificaciones · Más)
const G_NAV_INF = [['inicio', 'Inicio'], ['lista', 'Lista'], ['nueva', 'Planeación'], ['calif', 'Calificar']];
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
    `<div class="tile${listo ? '' : ' pronto'}" style="${gTinte(id)}" onclick="gIrA('${id}')">${listo ? '' : '<span class="badge">🚧 En construcción</span>'}<span class="ti">${gIco(id)}</span><div class="tt">${tit}</div><div class="td">${desc}</div>${listo ? `<span class="go">${G_FLECHA}</span>` : ''}</div>`).join('') +
    `<a class="tile ancho" style="${gTinte('libros')}" href="https://libros.conaliteg.gob.mx/" target="_blank" rel="noopener"><span class="ti">${gIco('libros')}</span><div class="tx"><div class="tt">Libros de texto SEP</div><div class="td">Consulta y descarga los libros gratuitos de cada grado (sitio oficial de la CONALITEG)</div></div><span class="go">${G_FLECHA}</span></a></div>`;
  const gs = G.data ? G.data.grupos : [];
  if (G.data && !gPerfil().escuela) h += `<div class="g-aviso" style="background:#fffbeb;border-color:#fde68a;color:#92400e">🏫 Falta el nombre de tu escuela. <a href="#" onclick="gIrA('grupos');return false">Captúralo en «Mis grupos»</a> para que aparezca en tus documentos.</div>`;
  h += `<div class="card"><div class="card-title">📌 Hoy en mis grupos</div>`;
  if (!gs.length) h += `<p style="color:var(--gris)">Aún no tienes grupos. <a href="#" onclick="gIrA('grupos');return false">Crea el primero</a> para pasar lista, calificar y crear exámenes.</p>`;
  else h += gs.map(g => {
    const dia = g.asist[gHoy()];
    return `<div class="hoy-fila"><b>${gEsc(g.nombre)} · ${gEsc(g.materia)}</b><span style="color:var(--gris)">${g.alumnos.length} alumnos</span><span style="margin-left:auto">${dia ? `<span style="color:var(--verde)">✓ Lista de hoy: ${gConteoDia(g, dia)}</span>` : `<button class="g-btn g-btn-s" onclick="gCambiarGrupo('${g.id}');gIrA('lista')">Pasar lista de hoy</button>`}</span></div>`;
  }).join('');
  h += '</div>';
  gPanel().innerHTML = h;
}
function gPanel() { return document.getElementById('g-' + G.tab); }
function gCambiarGrupo(id) { G.gid = id; G.borrador = null; G.sugerencias = []; gRender(); }

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
  const g = { id: gId(), nombre, grado, materia, alumnos: [], asist: {}, criterios: G_CRITERIOS_DEF.map(([n, p]) => ({ id: gId(), nombre: n, pct: p })), actividades: [], plan: {} };
  G.data.grupos.push(g); G.gid = g.id; gGuardar(); gRender();
}
function gBorrarGrupo(id) {
  const g = G.data.grupos.find(x => x.id === id); if (!g) return;
  if (!confirm(`¿Borrar el grupo «${g.nombre} · ${g.materia}» con sus ${g.alumnos.length} alumnos, listas, calificaciones y exámenes? No se puede deshacer.`)) return;
  G.data.grupos = G.data.grupos.filter(x => x.id !== id);
  G.gid = G.data.grupos[0] ? G.data.grupos[0].id : null; gGuardar(); gRender();
}
function gLimpiarNombre(l) { return l.replace(/^\s*\d+\s*[.)\-:]*\s*/, '').replace(/\s+/g, ' ').trim(); }
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
function gRespaldar() {
  const blob = new Blob([JSON.stringify(G.data)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'respaldo-planeador-nem-' + gHoy() + '.json'; a.click(); URL.revokeObjectURL(a.href);
}
function gRestaurar(input) {
  const f = input.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || !Array.isArray(d.grupos)) throw new Error('formato');
      if (!confirm(`El respaldo trae ${d.grupos.length} grupo(s). Esto reemplaza lo que hay ahora en este dispositivo. ¿Continuar?`)) return;
      G.data = d; G.gid = d.grupos[0] ? d.grupos[0].id : null; gGuardar(); gRender();
    } catch (e) { gAviso('El archivo no es un respaldo válido del Planeador.'); }
    input.value = '';
  };
  r.readAsText(f);
}

function gRenderGrupos() {
  const g = gGrupo();
  let h = `<div class="sec-title">Mis grupos y alumnos</div>
  <div class="sec-sub">Crea tus grupos una sola vez; la lista de alumnos se usa en el pase de lista, las calificaciones y los exámenes.</div>
  <div class="g-aviso">🔒 Los nombres de tus alumnos se guardan <strong>solo en este dispositivo</strong> (no se suben a internet). Descarga un respaldo de vez en cuando; si cambias de celular o computadora, ahí lo restauras.</div>
  <div class="card"><div class="card-title">🏫 Mi escuela</div>
    <div class="f3"><div class="campo"><label>Nombre de la escuela</label><input id="gp-esc" value="${gEsc(gPerfil().escuela)}" placeholder="Escuela Secundaria…"></div>
    <div class="campo"><label>CCT</label><input id="gp-cct" value="${gEsc(gPerfil().cct)}" maxlength="12"></div>
    <div class="campo"><label>Municipio / localidad</label><input id="gp-mun" value="${gEsc(gPerfil().municipio)}"></div></div>
    <div class="f2"><div class="campo"><label>Tipo de escuela (opcional)</label><input id="gp-tipo" value="${gEsc(gPerfil().tipoEscuela || '')}" placeholder="Ej. Escuela Secundaria General, Técnica, Federal, Estatal…"></div>
    <div class="campo"><label>Zona escolar (opcional)</label><input id="gp-zona" value="${gEsc(gPerfil().zona || '')}" placeholder="Ej. 08"></div></div>
    <button class="g-btn" onclick="gGuardarPerfil()">Guardar mis datos</button>
    <span style="font-size:12px;color:var(--gris);margin-left:6px">Aparecen en tus planeaciones, listas y exámenes.</span></div>
  <div class="card"><div class="card-title">➕ Nuevo grupo</div>
    <div class="f3">
      <div class="campo"><label>Grupo</label><input id="gg-nombre" placeholder="Ej. 3° A"></div>
      <div class="campo"><label>Grado</label><select id="gg-grado" onchange="gActualizarMaterias()"><option value="1">1° Secundaria</option><option value="2">2° Secundaria</option><option value="3">3° Secundaria</option></select></div>
      <div class="campo"><label>Materia que impartes</label><select id="gg-materia">${gMateriasOpts('1')}</select></div>
    </div>
    <button class="g-btn" onclick="gCrearGrupo()">Crear grupo</button>
    <div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">Si das la misma materia a varios grupos, crea uno por cada grupo.</div>
  </div>`;

  if (G.data.grupos.length) {
    h += `<div class="g-chips">${G.data.grupos.map(x => `<button class="g-chip${x.id === G.gid ? ' on' : ''}" onclick="gCambiarGrupo('${x.id}')">${gEsc(x.nombre)} · ${gEsc(x.materia)}</button>`).join('')}</div>`;
  }
  if (g) {
    h += `<div class="card"><div class="card-title">👥 ${gEsc(g.nombre)} · ${gEsc(g.materia)} — ${g.alumnos.length} alumnos
      <button class="g-btn g-btn-x" style="margin-left:auto" onclick="gBorrarGrupo('${g.id}')">Borrar grupo</button></div>
      <div class="campo"><label>Agregar alumnos (uno por renglón)</label>
      <textarea id="gg-lista" rows="5" placeholder="Pega aquí tu lista de asistencia:&#10;1. AGUILAR PECH JUAN&#10;2. BALAM CHAN MARÍA"></textarea>
      <div class="ayuda">Puedes copiar la lista desde Excel o Word. Se quitan solos los números del inicio y los nombres repetidos.</div></div>
      ${gUiArchivo('gg-lista')}
      <button class="g-btn" onclick="gAgregarAlumnos('gg-lista')">Agregar a la lista</button>
      ${g.alumnos.length ? `<button class="g-btn g-btn-s" onclick="gOrdenarAlumnos()">Ordenar A–Z</button>
      <div class="g-tabla-w"><table class="g-tabla" style="margin-top:14px"><thead><tr><th style="width:40px">#</th><th>Nombre (puedes corregirlo aquí)</th><th style="width:44px"></th></tr></thead><tbody>
      ${g.alumnos.map((a, i) => `<tr><td>${i + 1}</td><td><input class="g-in-nom" value="${gEsc(a.nombre)}" onchange="gRenombrarAlumno('${a.id}',this.value)"></td><td><button class="g-x" title="Quitar" onclick="gQuitarAlumno('${a.id}')">✕</button></td></tr>`).join('')}
      </tbody></table></div>` : ''}
    </div>`;
  }
  h += `<div class="card"><div class="card-title">💾 Respaldo</div>
    <button class="g-btn" onclick="gRespaldar()">⬇ Descargar respaldo</button>
    <label class="g-btn g-btn-s" style="display:inline-block;cursor:pointer">⬆ Restaurar respaldo<input type="file" accept=".json,application/json" style="display:none" onchange="gRestaurar(this)"></label></div>`;
  gPanel().innerHTML = h;
}

// ============================================================
// 2. PASE DE LISTA
// ============================================================
function gMarcar(aid, code) {
  const g = gGrupo(); const f = G.fecha;
  if (!g.asist[f]) { g.asist[f] = {}; g.alumnos.forEach(a => { g.asist[f][a.id] = 'P'; }); }
  g.asist[f][aid] = code; gGuardar(); gRenderLista();
}
function gTodos(code) {
  const g = gGrupo(); g.asist[G.fecha] = {}; g.alumnos.forEach(a => { g.asist[G.fecha][a.id] = code; }); gGuardar(); gRenderLista();
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
function gRenderLista() {
  const g = gGrupo();
  if (!g) return gRenderListaInicio();
  const dia = g.asist[G.fecha];
  let h = `<div class="sec-title">Pase de lista</div><div class="sec-sub">Toca la letra de cada alumno. Se guarda solo.</div>${gBarra()}${gTarjetaAlumnos(g)}
  <div class="card"><div class="g-fecha">
    <button class="g-btn g-btn-s" onclick="gDia(-1)">‹</button>
    <input type="date" value="${G.fecha}" onchange="gFecha(this.value)">
    <button class="g-btn g-btn-s" onclick="gDia(1)">›</button>
    <button class="g-btn g-btn-s" onclick="gFecha(gHoy())">Hoy</button></div>
    <div style="font-size:13px;color:var(--gris);margin:8px 0 12px;">${gFechaBonita(G.fecha)} ${dia ? '· <span style="color:var(--verde)">lista guardada</span>' : '· <span>sin registrar</span>'}</div>`;
  if (!g.alumnos.length) h += `<p style="color:var(--gris)">Este grupo aún no tiene alumnos. Agrégalos en el recuadro de arriba: teclea los nombres o sube tu lista de Excel o Word.</p>`;
  else {
    h += `<div style="margin-bottom:12px"><button class="g-btn" onclick="gTodos('P')">✓ Todos presentes</button> ${dia ? '<button class="g-btn g-btn-x" onclick="gBorrarDia()">Borrar día</button>' : ''}</div>
    <div class="g-lista">` + g.alumnos.map((a, i) => {
      const v = dia ? dia[a.id] : null;
      return `<div class="g-fila"><span class="g-n">${i + 1}</span><span class="g-nom">${gEsc(a.nombre)}</span><span class="g-st">` +
        ['P', 'R', 'F', 'J'].map(c => `<button class="g-st-${c}${v === c ? ' on' : ''}" title="${G_ESTADOS[c]}" onclick="gMarcar('${a.id}','${c}')">${c === 'P' ? '✓' : c}</button>`).join('') + '</span></div>';
    }).join('') + `</div>
    <div class="g-leyenda"><span><b>✓</b> Presente</span><span><b>R</b> Retardo</span><span><b>F</b> Falta</span><span><b>J</b> Falta justificada</span>
    ${dia ? `<span style="margin-left:auto">${gConteoDia(g, dia)}</span>` : ''}</div>`;
  }
  h += '</div>';

  h += gTarjetaDescarga(g);
  // Resumen por alumno
  const per = G.periodoLista;
  const rs = gResumenAsistencia(g, per);
  h += `<div class="card"><div class="card-title">📈 Resumen de asistencia por alumno</div>
    <div class="campo" style="max-width:300px"><label>Periodo</label><select onchange="gPeriodo(this.value)">
    <option value="actual"${per === 'actual' ? ' selected' : ''}>Trimestre de la fecha elegida (${G_TRIM_NOM[gTrimDeFecha(G.fecha)]})</option>
    <option value="1"${per === '1' ? ' selected' : ''}>Primer trimestre</option><option value="2"${per === '2' ? ' selected' : ''}>Segundo trimestre</option><option value="3"${per === '3' ? ' selected' : ''}>Tercer trimestre</option>
    <option value="todo"${per === 'todo' ? ' selected' : ''}>Todo el ciclo</option></select></div>`;
  if (!rs.dias.length) h += `<p style="color:var(--gris)">Todavía no hay días registrados en este periodo.</p>`;
  else {
    h += `<div class="g-tabla-w"><table class="g-tabla"><thead><tr><th>#</th><th>Alumno</th><th>Asist.</th><th>Ret.</th><th>Faltas</th><th>Just.</th><th>% asist.</th></tr></thead><tbody>` +
      rs.filas.map((f, i) => `<tr><td>${i + 1}</td><td>${gEsc(f.a.nombre)}</td><td>${f.c.P}</td><td>${f.c.R}</td><td>${f.c.F}</td><td>${f.c.J}</td><td class="${f.pct != null && f.pct < 80 ? 'g-mal' : ''}"><b>${f.pct == null ? '—' : f.pct + '%'}</b></td></tr>`).join('') +
      `</tbody></table></div>
    <div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">${rs.dias.length} día(s) con lista. % de asistencia = (asistencias + retardos) ÷ días registrados. En rojo: menos de 80 %.</div>
    <button class="g-btn" style="margin-top:12px" onclick="gDescargarAsistencia()">⬇ Descargar resumen en Word</button>`;
  }
  h += '</div>';
  gPanel().innerHTML = h;
}
function gConteoDia(g, dia) {
  const c = { P: 0, R: 0, F: 0, J: 0 }; g.alumnos.forEach(a => { if (dia[a.id]) c[dia[a.id]]++; });
  return `${c.P} ✓ · ${c.R} R · ${c.F} F · ${c.J} J`;
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
    `<table style="width:100%;border-collapse:collapse"><tr>${['#', 'Alumno', 'Asistencias', 'Retardos', 'Faltas', 'Justificadas', '% asistencia'].map(th).join('')}</tr>` +
    rs.filas.map((f, i) => `<tr>${[i + 1, gEsc(f.a.nombre), f.c.P, f.c.R, f.c.F, f.c.J, f.pct == null ? '—' : f.pct + '%'].map(td).join('')}</tr>`).join('') + '</table>';
  descargarWord(html, `Asistencia_${g.nombre.replace(/\W+/g, '_')}_${per.replace(/\W+/g, '_')}.doc`);
}

// ============================================================
// 3. CALIFICACIONES
// ============================================================
function gActsTrim(g, t) { return g.actividades.filter(a => a.trim === t); }
// Calificación por criterio y final de un alumno en un trimestre (escala 0-10).
function gCalcAlumno(g, aid, t) {
  const porCrit = {}; let suma = 0, pcts = 0;
  g.criterios.forEach(c => {
    const vals = [];
    gActsTrim(g, t).filter(a => a.criterioId === c.id).forEach(a => {
      const n = a.notas[aid]; if (n != null && a.max > 0) vals.push(n / a.max * 10);
    });
    if (vals.length) { const s = vals.reduce((x, y) => x + y, 0) / vals.length; porCrit[c.id] = s; suma += s * c.pct; pcts += c.pct; }
    else porCrit[c.id] = null;
  });
  return { porCrit, final: pcts > 0 ? suma / pcts : null, pcts };
}
function gCalcAnual(g, aid) {
  const bs = [1, 2, 3].map(t => gBoleta(gCalcAlumno(g, aid, t).final)).filter(b => b != null);
  return bs.length ? { prom: bs.reduce((x, y) => x + y, 0) / bs.length, n: bs.length } : null;
}
function gSumaPct(g) { return g.criterios.reduce((s, c) => s + (+c.pct || 0), 0); }
function gTrimCalif(v) { G.trimCalif = v === 'anual' ? 'anual' : +v; gRenderCalif(); }

function gCriterioNombre(v, cid) { const c = gGrupo().criterios.find(x => x.id === cid); if (c && v.trim()) { c.nombre = v.trim(); gGuardar(); } }
function gCriterioPct(cid, v) { const c = gGrupo().criterios.find(x => x.id === cid); if (c) { c.pct = Math.max(0, gNum(v) || 0); gGuardar(); gActualizarSumaPct(); gActualizarResumen(); } }
function gActualizarSumaPct() {
  const g = gGrupo(); const s = gSumaPct(g); const e = document.getElementById('g-suma');
  if (e) { e.innerHTML = s === 100 ? `<span style="color:var(--verde)">✓ Suma 100 %</span>` : `<span class="g-mal">Suma ${s} % — debe sumar 100 %</span>`; }
}
function gAgregarCriterio() { const g = gGrupo(); g.criterios.push({ id: gId(), nombre: 'Nuevo criterio', pct: 0 }); gGuardar(); gRenderCalif(); }
function gQuitarCriterio(cid) {
  const g = gGrupo(); const n = g.actividades.filter(a => a.criterioId === cid).length;
  if (g.criterios.length <= 1) { gAviso('Debe quedar al menos un criterio.'); return; }
  if (!confirm(n ? `Este criterio tiene ${n} actividad(es). Se pasarán al primer criterio de la lista. ¿Continuar?` : '¿Quitar este criterio?')) return;
  g.criterios = g.criterios.filter(c => c.id !== cid);
  g.actividades.forEach(a => { if (a.criterioId === cid) a.criterioId = g.criterios[0].id; });
  gGuardar(); gRenderCalif();
}
function gRestablecerCriterios() {
  if (!confirm('¿Volver a los criterios sugeridos (alineados al Plano Didáctico: proceso 70 % + producto 30 %)? Las actividades pasarán al primer criterio.')) return;
  const g = gGrupo(); g.criterios = G_CRITERIOS_DEF.map(([n, p]) => ({ id: gId(), nombre: n, pct: p }));
  g.actividades.forEach(a => { a.criterioId = g.criterios[a.tipo === 'examen' ? 4 : 1].id; });
  gGuardar(); gRenderCalif();
}
function gCriteriosOpts(g, sel) { return g.criterios.map(c => `<option value="${c.id}"${c.id === sel ? ' selected' : ''}>${gEsc(c.nombre)} (${c.pct}%)</option>`).join(''); }

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
function gCriterioDeAct(id, cid) { const a = gGrupo().actividades.find(x => x.id === id); if (a) { a.criterioId = cid; gGuardar(); gActualizarResumen(); } }
function gNota(actId, aid, el) {
  const g = gGrupo(); const a = g.actividades.find(x => x.id === actId); if (!a) return;
  const raw = el.value.trim();
  if (raw === '') { delete a.notas[aid]; el.classList.remove('g-inval'); }
  else {
    const n = gNum(raw);
    if (n == null || n < 0 || n > a.max) { el.classList.add('g-inval'); return; }
    el.classList.remove('g-inval'); a.notas[aid] = n;
  }
  gGuardar(); gActualizarResumen();
  const ce = document.getElementById('gx-' + actId + '-' + aid); if (ce) ce.textContent = a.notas[aid] == null ? '—' : gFmt(a.notas[aid] / a.max * 10);
}
function gActualizarResumen() {
  const e = document.getElementById('g-resumen'); if (e) e.innerHTML = gResumenHTML();
}
function gResumenHTML() {
  const g = gGrupo(); const t = G.trimCalif;
  if (t === 'anual') {
    let h = `<table class="g-tabla"><thead><tr><th>#</th><th>Alumno</th><th>Trim. 1</th><th>Trim. 2</th><th>Trim. 3</th><th>Promedio final</th></tr></thead><tbody>`;
    h += g.alumnos.map((a, i) => {
      const b = [1, 2, 3].map(x => gBoleta(gCalcAlumno(g, a.id, x).final)); const an = gCalcAnual(g, a.id);
      const fin = an ? Math.max(5, Math.round(an.prom + 1e-9)) : null;
      return `<tr><td>${i + 1}</td><td>${gEsc(a.nombre)}</td>${b.map(x => `<td class="${x != null && x < 6 ? 'g-mal' : ''}">${x == null ? '—' : x}</td>`).join('')}<td class="${fin != null && fin < 6 ? 'g-mal' : ''}"><b>${fin == null ? '—' : fin}</b>${an ? ` <span style="color:var(--gris);font-size:11px">(${gFmt(an.prom, 2)})</span>` : ''}</td></tr>`;
    }).join('');
    return h + '</tbody></table>';
  }
  const calc = g.alumnos.map(a => ({ a, r: gCalcAlumno(g, a.id, t) }));
  const fin = calc.map(x => x.r.final).filter(x => x != null);
  const prom = fin.length ? fin.reduce((x, y) => x + y, 0) / fin.length : null;
  const rep = calc.filter(x => x.r.final != null && gBoleta(x.r.final) < 6).length;
  let h = `<div class="g-stats"><div><b>${gFmt(prom, 2)}</b><span>Promedio del grupo</span></div><div><b>${fin.length}/${g.alumnos.length}</b><span>Alumnos con calificación</span></div><div><b class="${rep ? 'g-mal' : ''}">${rep}</b><span>Reprobados (&lt; 6)</span></div></div>`;
  h += `<div class="g-tabla-w"><table class="g-tabla"><thead><tr><th>#</th><th>Alumno</th>${g.criterios.map(c => `<th>${gEsc(c.nombre)}<br><small>${c.pct}%</small></th>`).join('')}<th>Calif.</th><th>Boleta</th></tr></thead><tbody>`;
  h += calc.map(({ a, r }, i) => {
    const b = gBoleta(r.final);
    return `<tr><td>${i + 1}</td><td>${gEsc(a.nombre)}</td>${g.criterios.map(c => `<td>${gFmt(r.porCrit[c.id])}</td>`).join('')}<td>${gFmt(r.final, 2)}</td><td class="${b != null && b < 6 ? 'g-mal' : ''}"><b>${b == null ? '—' : b}</b></td></tr>`;
  }).join('') + '</tbody></table></div>';
  if (fin.length && calc.some(x => x.r.pcts < 100 && x.r.final != null)) h += `<div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">Los criterios sin calificaciones todavía no cuentan: la calificación se calcula con lo registrado hasta ahora.</div>`;
  return h;
}

function gRenderCalif() {
  const g = gGrupo();
  if (!g) return gSinGrupo('Calificaciones', 'Criterios con ponderación, actividades y calificación del trimestre');
  const t = G.trimCalif;
  let h = `<div class="sec-title">Calificaciones</div><div class="sec-sub">Define tus criterios, captura las notas y el sistema calcula la calificación del trimestre.</div>${gBarra()}
  <div class="g-trims">${[1, 2, 3].map(x => `<button class="ttab${t === x ? ' on' : ''}" onclick="gTrimCalif(${x})">${G_TRIM_NOM[x]}</button>`).join('')}<button class="ttab${t === 'anual' ? ' on' : ''}" onclick="gTrimCalif('anual')">Resumen anual</button></div>`;

  if (t !== 'anual') {
    h += `<details class="card g-det"><summary>⚖️ Criterios de evaluación y ponderación <span id="g-suma" style="margin-left:10px;font-size:12px"></span></summary>
      <p style="font-size:12px;color:var(--gris);margin:10px 0">Los sugeridos siguen el Plano Didáctico (proceso 70 % + producto 30 %). Cámbialos como los hayas acordado con tus alumnos.</p>
      <div class="g-crit">${g.criterios.map(c => `<div class="g-crit-f"><input value="${gEsc(c.nombre)}" onchange="gCriterioNombre(this.value,'${c.id}')"><input type="number" min="0" max="100" value="${c.pct}" oninput="gCriterioPct('${c.id}',this.value)"><span>%</span><button class="g-x" onclick="gQuitarCriterio('${c.id}')">✕</button></div>`).join('')}</div>
      <button class="g-btn g-btn-s" onclick="gAgregarCriterio()">+ Criterio</button> <button class="g-btn g-btn-s" onclick="gRestablecerCriterios()">Restablecer sugeridos</button></details>
    <div class="card"><div class="card-title">➕ Nueva actividad (${G_TRIM_NOM[t]})</div>
      <div class="f3"><div class="campo"><label>Nombre</label><input id="ga-nom" placeholder="Ej. Ensayo sobre la lectura"></div>
      <div class="campo"><label>Criterio</label><select id="ga-crit">${gCriteriosOpts(g, g.criterios[1] ? g.criterios[1].id : '')}</select></div>
      <div class="campo"><label>Puntaje máximo</label><input id="ga-max" type="number" min="1" value="10"></div></div>
      <button class="g-btn" onclick="gAgregarActividad()">Agregar actividad</button>
      <span style="font-size:12px;color:var(--gris);margin-left:8px">Los exámenes se crean en la pestaña «Exámenes» y aparecen aquí también.</span></div>`;
    const acts = gActsTrim(g, t);
    if (acts.length && g.alumnos.length) {
      h += `<div class="card"><div class="card-title">✏️ Captura de calificaciones</div><div class="g-tabla-w"><table class="g-tabla g-cap"><thead><tr><th>#</th><th class="g-sticky">Alumno</th>` +
        acts.map(a => `<th><div class="g-ah">${a.tipo === 'examen' ? '📝 ' : ''}${gEsc(a.nombre)}</div><small>de ${a.max}</small><select onchange="gCriterioDeAct('${a.id}',this.value)">${gCriteriosOpts(g, a.criterioId)}</select><button class="g-x" title="Borrar" onclick="gQuitarActividad('${a.id}')">✕</button></th>`).join('') + '</tr></thead><tbody>' +
        g.alumnos.map((al, i) => `<tr><td>${i + 1}</td><td class="g-sticky">${gEsc(al.nombre)}</td>` + acts.map(a => `<td><input class="g-nota" type="number" step="0.1" min="0" max="${a.max}" value="${a.notas[al.id] == null ? '' : a.notas[al.id]}" oninput="gNota('${a.id}','${al.id}',this)"></td>`).join('') + '</tr>').join('') + '</tbody></table></div></div>';
    } else if (!g.alumnos.length) h += `<div class="card g-vacio">Agrega alumnos en «Mis grupos» para capturar calificaciones.</div>`;
    else h += `<div class="card g-vacio">Aún no hay actividades en este trimestre. Agrega la primera arriba.</div>`;
  }
  h += `<div class="card"><div class="card-title">🎓 ${t === 'anual' ? 'Resumen anual' : 'Calificación del ' + G_TRIM_NOM[t].toLowerCase()}</div><div id="g-resumen">${gResumenHTML()}</div>
    ${g.alumnos.length ? `<button class="g-btn" style="margin-top:12px" onclick="gDescargarCalif()">⬇ Descargar en Word</button>` : ''}</div>`;
  gPanel().innerHTML = h;
  gActualizarSumaPct();
}
function gDescargarCalif() {
  const g = gGrupo(); const t = G.trimCalif;
  const th = x => `<td style="border:1px solid #000;padding:4px;background:#BDD7EE;font-weight:bold;text-align:center">${x}</td>`;
  const td = x => `<td style="border:1px solid #000;padding:4px">${x}</td>`;
  let html, nom;
  if (t === 'anual') {
    html = gEncabezadoDoc('RESUMEN ANUAL DE CALIFICACIONES', g) + `<table style="width:100%;border-collapse:collapse"><tr>${['#', 'Alumno', 'Trim. 1', 'Trim. 2', 'Trim. 3', 'Promedio final'].map(th).join('')}</tr>` +
      g.alumnos.map((a, i) => { const b = [1, 2, 3].map(x => gBoleta(gCalcAlumno(g, a.id, x).final)); const an = gCalcAnual(g, a.id); return `<tr>${[i + 1, gEsc(a.nombre), ...b.map(x => x == null ? '—' : x), an ? Math.max(5, Math.round(an.prom + 1e-9)) : '—'].map(td).join('')}</tr>`; }).join('') + '</table>';
    nom = 'Calificaciones_anual';
  } else {
    html = gEncabezadoDoc('REGISTRO DE CALIFICACIONES — ' + G_TRIM_NOM[t].toUpperCase(), g) +
      `<table style="width:100%;border-collapse:collapse"><tr>${['#', 'Alumno', ...g.criterios.map(c => `${gEsc(c.nombre)} (${c.pct}%)`), 'Calif.', 'Boleta'].map(th).join('')}</tr>` +
      g.alumnos.map((a, i) => { const r = gCalcAlumno(g, a.id, t); return `<tr>${[i + 1, gEsc(a.nombre), ...g.criterios.map(c => gFmt(r.porCrit[c.id])), gFmt(r.final, 2), r.final == null ? '—' : gBoleta(r.final)].map(td).join('')}</tr>`; }).join('') + '</table>';
    nom = 'Calificaciones_T' + t;
  }
  descargarWord(html, `${nom}_${g.nombre.replace(/\W+/g, '_')}.doc`);
}

// ============================================================
// 4. EXÁMENES
// ============================================================
const G_TIPOS_EXAM = {
  opcion_multiple: 'Opción múltiple', verdadero_falso: 'Verdadero / falso',
  respuesta_corta: 'Respuesta corta', desarrollo: 'Problema o pregunta abierta',
};
function gTrimExam(v) { G.trimExam = +v; G.borrador = null; gRenderExamenes(); }

function gPromptExamen(g, o) {
  return `Eres docente experto de secundaria en México (Nueva Escuela Mexicana, Plan de Estudios 2022, Fase 6). Elabora un examen.
Responde SOLO con JSON válido, sin markdown ni texto extra.

DATOS:
- Materia: ${g.materia} | Campo formativo: ${gCampoDe(g.grado, g.materia)} | Grado: ${g.grado}° de secundaria
- ${G_TRIM_NOM[o.trim]}
- Temas o contenidos que se evalúan: ${o.tema}
- Dificultad: ${o.dif}
- Número de reactivos: ${o.n}
- Tipos de reactivo permitidos: ${o.tipos.map(t => G_TIPOS_EXAM[t]).join(', ')} (reparte los reactivos entre ellos)

REGLAS:
- Los reactivos deben evaluar comprensión y aplicación, no solo memoria; usa situaciones cercanas a estudiantes de México cuando sea natural.
- Lenguaje claro para adolescentes. Una sola respuesta correcta en cada reactivo.
- En opción múltiple da exactamente 4 opciones (sin la letra) y en "respuesta" pon la letra correcta: A, B, C o D. Distribuye las letras correctas.
- En verdadero_falso, "respuesta" es "Verdadero" o "Falso".
- En respuesta_corta y desarrollo, "respuesta" es la respuesta esperada o los puntos clave que debe incluir.
- "valor" es el puntaje del reactivo (1 para opción múltiple, verdadero/falso y respuesta corta; 2 para desarrollo).

Formato:
{"titulo":"Examen de ... ","reactivos":[{"tipo":"opcion_multiple","pregunta":"...","opciones":["...","...","...","..."],"respuesta":"B","valor":1}]}`;
}
function gNormalizarExamen(j, n) {
  const permit = Object.keys(G_TIPOS_EXAM);
  const rs = (Array.isArray(j.reactivos) ? j.reactivos : []).map(r => {
    const tipo = permit.includes(r.tipo) ? r.tipo : 'respuesta_corta';
    const o = { tipo, pregunta: String(r.pregunta || '').trim(), respuesta: String(r.respuesta == null ? '' : r.respuesta).trim(), valor: gNum(r.valor) || (tipo === 'desarrollo' ? 2 : 1) };
    if (tipo === 'opcion_multiple') { o.opciones = (Array.isArray(r.opciones) ? r.opciones : []).slice(0, 4).map(x => String(x).replace(/^[A-Da-d][).]\s*/, '')); o.respuesta = o.respuesta.charAt(0).toUpperCase(); }
    return o;
  }).filter(r => r.pregunta && (r.tipo !== 'opcion_multiple' || r.opciones.length >= 2));
  return { titulo: String(j.titulo || 'Examen').trim(), reactivos: rs.slice(0, n) };
}
async function gGenerarExamen() {
  const g = gGrupo(); const err = document.getElementById('ge-err');
  err.style.display = 'none';
  const tema = document.getElementById('ge-tema').value.trim();
  const n = Math.max(3, Math.min(30, parseInt(document.getElementById('ge-n').value, 10) || 10));
  const tipos = Object.keys(G_TIPOS_EXAM).filter(t => document.getElementById('ge-t-' + t).checked);
  if (tema.length < 5) { err.textContent = 'Escribe los temas o contenidos que quieres evaluar.'; err.style.display = 'block'; return; }
  if (!tipos.length) { err.textContent = 'Elige al menos un tipo de reactivo.'; err.style.display = 'block'; return; }
  const btn = document.getElementById('ge-btn'); btn.disabled = true; btn.textContent = 'Generando examen…';
  try {
    const texto = await llamarGeminiJSON(gPromptExamen(g, { trim: G.trimExam, tema, n, tipos, dif: document.getElementById('ge-dif').value }));
    const ex = gNormalizarExamen(parsearJSON(texto), n);
    if (!ex.reactivos.length) throw new Error('La IA no devolvió reactivos válidos.');
    G.borrador = Object.assign(ex, { tema, trim: G.trimExam, criterioId: document.getElementById('ge-crit').value });
    gRenderExamenes();
    const b = document.getElementById('g-borrador'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    err.textContent = 'No se pudo generar el examen: ' + (e.message || e) + ' Intenta de nuevo en unos segundos.'; err.style.display = 'block';
    btn.disabled = false; btn.textContent = '✨ Generar examen con IA';
  }
}
function gQuitarReactivo(i) { G.borrador.reactivos.splice(i, 1); if (!G.borrador.reactivos.length) G.borrador = null; gRenderExamenes(); }
function gTituloBorrador(v) { if (G.borrador) G.borrador.titulo = v; }
function gMaxExamen(ex) { return ex.reactivos.reduce((s, r) => s + (r.valor || 1), 0); }

function gExamenHTML(g, ex, conClave) {
  const letras = 'ABCD';
  const items = ex.reactivos.map((r, i) => {
    let h = `<p style="margin:10px 0 3px"><b>${i + 1}.</b> ${gEsc(r.pregunta)} <span style="font-size:8pt">(${r.valor} pt${r.valor > 1 ? 's' : ''})</span></p>`;
    if (r.tipo === 'opcion_multiple') h += r.opciones.map((o, k) => `<p style="margin:0 0 0 24px">${letras[k]}) ${gEsc(o)}</p>`).join('');
    else if (r.tipo === 'verdadero_falso') h += `<p style="margin:0 0 0 24px">( ) Verdadero &nbsp;&nbsp; ( ) Falso</p>`;
    else if (r.tipo === 'respuesta_corta') h += `<p style="margin:6px 0 0 24px">R: ______________________________________________</p>`;
    else h += '<p style="margin:6px 0 0 24px">______________________________________________________</p>'.repeat(3);
    if (conClave) h += `<p style="margin:2px 0 0 24px;color:#166534"><b>Respuesta:</b> ${gEsc(r.respuesta)}</p>`;
    return h;
  }).join('');
  const cab = conClave ? `<p style="text-align:center"><b>${gEsc(ex.titulo)} — CLAVE DE RESPUESTAS</b></p>` :
    `<p style="text-align:center;margin:0"><b>${gEsc(gEscuela() || 'Escuela Secundaria')}</b></p><p style="text-align:center;margin:0"><b>${gEsc(ex.titulo)}</b></p>
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
  g.actividades.push({ id: gId(), trim: b.trim, criterioId: b.criterioId, nombre: b.titulo, max: gMaxExamen(b), tipo: 'examen', fecha: gHoy(), tema: b.tema, reactivos: b.reactivos, notas: {} });
  G.borrador = null; gGuardar(); gRenderExamenes();
}
function gRegistrarExamenPapel() {
  const g = gGrupo();
  const nombre = document.getElementById('gp-nom').value.trim();
  const max = gNum(document.getElementById('gp-max').value) || 10;
  if (!nombre) { gAviso('Ponle nombre al examen.'); return; }
  g.actividades.push({ id: gId(), trim: G.trimExam, criterioId: document.getElementById('gp-crit').value, nombre, max, tipo: 'examen', fecha: gHoy(), reactivos: null, notas: {} });
  gGuardar(); gRenderExamenes();
}
function gAciertos(exId, aid, el) {
  const g = gGrupo(); const ex = g.actividades.find(x => x.id === exId); if (!ex) return;
  const raw = el.value.trim();
  if (raw === '') { delete ex.notas[aid]; el.classList.remove('g-inval'); }
  else { const n = gNum(raw); if (n == null || n < 0 || n > ex.max) { el.classList.add('g-inval'); return; } el.classList.remove('g-inval'); ex.notas[aid] = n; }
  gGuardar();
  const ce = document.getElementById('gc-' + exId + '-' + aid); if (ce) { const v = ex.notas[aid] == null ? null : ex.notas[aid] / ex.max * 10; ce.textContent = gFmt(v); ce.className = v != null && v < 6 ? 'g-mal' : ''; }
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

function gRenderExamenes() {
  const g = gGrupo();
  if (!g) return gSinGrupo('Exámenes', 'Genera exámenes con IA y califica a tu grupo');
  const t = G.trimExam;
  const critEx = (g.criterios.find(c => /examen/i.test(c.nombre)) || g.criterios[0]).id;
  let h = `<div class="sec-title">Exámenes</div><div class="sec-sub">Crea un examen con su clave de respuestas, captura los aciertos de cada alumno y la calificación se calcula sola.</div>${gBarra()}
  <div class="g-trims">${[1, 2, 3].map(x => `<button class="ttab${t === x ? ' on' : ''}" onclick="gTrimExam(${x})">${G_TRIM_NOM[x]}</button>`).join('')}</div>
  <div class="card"><div class="card-title">✨ Generar examen con IA — ${gEsc(g.materia)} ${g.grado}°</div>
    <div class="campo"><label>Temas o contenidos a evaluar</label><textarea id="ge-tema" rows="3" placeholder="Ej. Ecuaciones de primer grado con una incógnita; problemas de proporcionalidad directa"></textarea><div class="ayuda">Mientras más específico, mejor el examen. Puedes copiar los contenidos o PDA de tu planeación.</div></div>
    <div class="f3">
      <div class="campo"><label>Número de reactivos</label><input id="ge-n" type="number" min="3" max="30" value="10"></div>
      <div class="campo"><label>Dificultad</label><select id="ge-dif"><option>Básica</option><option selected>Media</option><option>Alta</option></select></div>
      <div class="campo"><label>Criterio donde cuenta</label><select id="ge-crit">${gCriteriosOpts(g, critEx)}</select></div>
    </div>
    <div class="campo"><label>Tipos de reactivo</label><div class="g-checks">${Object.entries(G_TIPOS_EXAM).map(([k, v]) => `<label><input type="checkbox" id="ge-t-${k}" ${k !== 'desarrollo' ? 'checked' : ''}> ${v}</label>`).join('')}</div></div>
    <div class="l-err" id="ge-err" style="margin:0 0 12px"></div>
    <button class="g-btn" id="ge-btn" onclick="gGenerarExamen()">✨ Generar examen con IA</button>
    <div class="ayuda" style="font-size:11px;color:var(--gris);margin-top:8px">⚠ Revisa el examen y la clave antes de aplicarlo: la IA puede equivocarse.</div></div>`;

  if (G.borrador && G.borrador.trim === t) {
    const b = G.borrador;
    h += `<div class="card" id="g-borrador"><div class="card-title">👀 Revisa tu examen (${gMaxExamen(b)} puntos)</div>
      <div class="campo"><label>Título</label><input value="${gEsc(b.titulo)}" oninput="gTituloBorrador(this.value)"></div>` +
      b.reactivos.map((r, i) => `<div class="g-reac"><button class="g-x" title="Quitar reactivo" onclick="gQuitarReactivo(${i})">✕</button><b>${i + 1}.</b> ${gEsc(r.pregunta)} <small>(${G_TIPOS_EXAM[r.tipo]}, ${r.valor} pt)</small>` +
        (r.tipo === 'opcion_multiple' ? '<ol type="A">' + r.opciones.map(o => `<li>${gEsc(o)}</li>`).join('') + '</ol>' : '') +
        `<div class="g-resp">Respuesta: ${gEsc(r.respuesta)}</div></div>`).join('') +
      `<button class="g-btn" onclick="gGuardarExamen()">💾 Guardar para calificar</button>
       <button class="g-btn g-btn-s" onclick="gDescargarExamen(G.borrador,false)">⬇ Examen (Word)</button>
       <button class="g-btn g-btn-s" onclick="gDescargarExamen(G.borrador,true)">⬇ Clave (Word)</button>
       <button class="g-btn g-btn-s" onclick="gGenerarExamen()">↻ Generar otro</button></div>`;
  }

  h += `<details class="card g-det"><summary>📄 Ya apliqué un examen en papel (registrarlo sin IA)</summary>
    <div class="f3" style="margin-top:12px"><div class="campo"><label>Nombre</label><input id="gp-nom" placeholder="Ej. Examen del trimestre"></div>
    <div class="campo"><label>Total de puntos / reactivos</label><input id="gp-max" type="number" min="1" value="10"></div>
    <div class="campo"><label>Criterio</label><select id="gp-crit">${gCriteriosOpts(g, critEx)}</select></div></div>
    <button class="g-btn" onclick="gRegistrarExamenPapel()">Registrar examen</button></details>`;

  const exs = gActsTrim(g, t).filter(a => a.tipo === 'examen');
  h += `<div class="card"><div class="card-title">🧮 Exámenes de este trimestre y calificación</div>`;
  if (!exs.length) h += `<p style="color:var(--gris)">Aún no hay exámenes guardados en este trimestre.</p>`;
  exs.forEach(ex => {
    h += `<details class="g-ex" ${exs.length === 1 ? 'open' : ''}><summary><b>${gEsc(ex.nombre)}</b> <span style="color:var(--gris);font-size:12px">· ${ex.max} pts · ${gEsc((g.criterios.find(c => c.id === ex.criterioId) || {}).nombre || '')}</span></summary>
      <div id="gs-${ex.id}" class="g-statline">${gStatsExamen(g, ex)}</div>
      <div style="margin:8px 0">${ex.reactivos ? `<button class="g-btn g-btn-s" onclick="gVerExamen('${ex.id}')">⬇ Examen</button> <button class="g-btn g-btn-s" onclick="gVerClave('${ex.id}')">⬇ Clave</button> ` : ''}
      <button class="g-btn g-btn-s" onclick="gDescargarResultadosExamen('${ex.id}')">⬇ Resultados</button> <button class="g-btn g-btn-x" onclick="gQuitarExamen('${ex.id}')">Borrar</button></div>
      ${g.alumnos.length ? `<div class="g-tabla-w"><table class="g-tabla"><thead><tr><th>#</th><th>Alumno</th><th style="width:110px">Aciertos / pts (de ${ex.max})</th><th style="width:80px">Calif.</th></tr></thead><tbody>` +
        g.alumnos.map((a, i) => { const n = ex.notas[a.id]; const v = n == null ? null : n / ex.max * 10; return `<tr><td>${i + 1}</td><td>${gEsc(a.nombre)}</td><td><input class="g-nota" type="number" step="0.5" min="0" max="${ex.max}" value="${n == null ? '' : n}" oninput="gAciertos('${ex.id}','${a.id}',this)"></td><td id="gc-${ex.id}-${a.id}" class="${v != null && v < 6 ? 'g-mal' : ''}">${gFmt(v)}</td></tr>`; }).join('') + '</tbody></table></div>' : '<p style="color:var(--gris)">Agrega alumnos en «Mis grupos».</p>'}
    </details>`;
  });
  h += '</div>';
  gPanel().innerHTML = h;
}

// ============================================================
// 5. PLANEACIÓN TRIMESTRAL CON PROYECTOS (según la metodología)
// ============================================================
function gPlanTrim(g, t) { if (!g.plan) g.plan = {}; if (!g.plan[t]) g.plan[t] = { sesiones: 25, proyectos: [] }; return g.plan[t]; }
function gTrimPlan(v) { G.trimPlan = +v; G.sugerencias = []; gRenderTrim(); }
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
  let c = g.criterios.find(x => /proyecto/i.test(x.nombre));
  if (!c) { c = { id: gId(), nombre: 'Producto del proyecto', pct: 0 }; g.criterios.push(c); }
  return c;
}
function gPesoProyecto(v) {
  const g = gGrupo(); const c = gCritProyecto(g);
  c.pct = Math.max(0, Math.min(100, gNum(v) || 0)); gGuardar(); gRenderTrim();
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
    const crit = g.criterios.find(x => /proyecto/i.test(x.nombre));
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
        <div class="campo" style="max-width:260px"><label>Peso del proyecto en el trimestre (%)</label><input type="number" min="0" max="100" value="${crit ? crit.pct : 0}" onchange="gPesoProyecto(this.value)"></div>
        ${gSumaPct(g) !== 100 ? `<div class="g-mal" style="font-size:12px;margin-bottom:8px">Tus criterios suman ${gSumaPct(g)} %. Ajusta los demás en «Calificaciones» para que sumen 100 %.</div>` : ''}
        <button class="g-btn g-btn-s" onclick="gCrearEvalProyecto('${p.id}')">${nAct ? `Ver actividades (${nAct})` : '+ Crear actividades de evaluación (una por fase + producto final)'}</button>
      </details>
      ${met ? `<div class="g-fases">${met.fases.map(f => `<span style="border-color:${f.color};color:${f.color}">${gEsc(f.n)}</span>`).join('')}</div>` : ''}
      <div style="margin-top:10px"><button class="g-btn" onclick="gAbrirPlano('${p.id}')">📝 Diseñar Plano Didáctico</button> <button class="g-btn g-btn-x" onclick="gQuitarProyecto('${p.id}')">Quitar</button></div></div>`;
  });
  h += `</div>
  <div class="card"><div class="card-title">💡 Agregar proyecto a partir de mi problemática</div>
    <div class="f2"><div class="campo"><label>Metodología</label><select id="gt-met">${Object.values(METODOLOGIAS).map(m => `<option value="${m.id}"${m.id === metRec ? ' selected' : ''}>${gEsc(m.siglas)} · ${gEsc(m.nombre)}</option>`).join('')}</select></div>
    <div class="campo"><label>Alcance del proyecto</label><select id="gt-esc"><option value="aula">Aula · proyecto áulico</option><option value="escuela">Escuela · proyecto escolar</option><option value="comunidad">Comunidad · proyecto comunitario</option></select></div></div>
    <div class="campo"><label>Problemática de mi contexto</label><textarea id="gt-prob" rows="3" placeholder="Ej. En mi grupo, 12 de 35 estudiantes no comprenden lo que leen y evitan participar. En la comunidad casi no hay espacios de lectura."></textarea></div>
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

// ── Lectura de archivos: Excel, CSV, Word (.docx) o texto ──
async function gFilasDeArchivo(f) {
  const ext = f.name.split('.').pop().toLowerCase();
  if (ext === 'doc') throw new Error('Los archivos «.doc» (Word antiguo) no se pueden leer. Ábrelo en Word y guárdalo como «.docx», o copia los nombres y pégalos en el recuadro.');
  if (ext === 'txt') return [(await f.text()).split(/\r?\n/).map(l => [l])];
  if (ext === 'csv') {
    await gCargarLib('xlsx');
    const wb = XLSX.read(await f.text(), { type: 'string' });
    return wb.SheetNames.map(n => XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: '' }));
  }
  if (['xlsx', 'xls', 'xlsm', 'ods'].includes(ext)) {
    await gCargarLib('xlsx');
    const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' });
    return wb.SheetNames.map(n => XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: '' }));
  }
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
  throw new Error('Ese tipo de archivo no se puede leer. Usa Excel (.xlsx, .xls), Word (.docx), CSV o texto (.txt).');
}
async function gLeerArchivoAlumnos(input, idTa) {
  const f = input.files && input.files[0]; if (!f) return;
  const msg = document.getElementById(idTa + '-msg'), ta = document.getElementById(idTa);
  const decir = (t, ok) => { if (msg) { msg.textContent = t; msg.style.color = ok ? 'var(--verde)' : 'var(--rojo)'; msg.style.display = 'block'; } };
  decir('Leyendo «' + f.name + '»…', true);
  try {
    const hojas = await gFilasDeArchivo(f);
    let nombres = [];
    for (const filas of hojas) { nombres = gExtraerNombres(filas); if (nombres.length) break; }
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
  return `<div style="margin:6px 0 10px"><label class="g-btn g-btn-s" style="cursor:pointer;margin:0">📂 Subir Excel, Word o CSV
      <input type="file" accept=".xlsx,.xls,.xlsm,.ods,.csv,.docx,.txt" style="display:none" onchange="gLeerArchivoAlumnos(this,'${idTa}')"></label>
    <span style="font-size:11.5px;color:var(--gris);margin-left:6px">Los nombres aparecen en el recuadro para que los revises antes de crear la lista.</span>
    <div id="${idTa}-msg" style="display:none;font-size:12.5px;margin-top:8px;line-height:1.4"></div></div>`;
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
  const g = { id: gId(), nombre, grado, materia, alumnos: nombres.map(n => ({ id: gId(), nombre: n })), asist: {}, criterios: G_CRITERIOS_DEF.map(([n, p]) => ({ id: gId(), nombre: n, pct: p })), actividades: [], plan: {} };
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
function gTarjetaDescarga(g) {
  if (!g.alumnos.length) return '';
  const hoy = G.fecha || gHoy(); const y0 = +hoy.slice(0, 4), m0 = +hoy.slice(5, 7);
  const ini = m0 >= 8 ? y0 : y0 - 1;                       // el ciclo empieza en agosto
  const meses = []; for (let i = 0; i < 12; i++) { const m = ((7 + i) % 12) + 1, y = ini + (7 + i >= 12 ? 1 : 0); meses.push([y + '-' + String(m).padStart(2, '0'), G_MESES[m - 1] + ' ' + y]); }
  const act = hoy.slice(0, 7);
  return `<div class="card"><div class="card-title">🖨️ Descargar la lista (carta, horizontal)</div>
    <div class="f3">
      <div class="campo"><label>Mes</label><select id="ge-mes">${meses.map(([v, t]) => `<option value="${v}"${v === act ? ' selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('')}</select></div>
      <div class="campo"><label>Contenido</label><select id="ge-modo"><option value="blanco">En blanco, para pasar lista a mano</option><option value="registrada">Con la asistencia ya registrada</option></select></div>
    </div>
    <div class="campo"><label>Días de la semana que das clase</label>
      <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:13px">${[[1, 'Lunes'], [2, 'Martes'], [3, 'Miércoles'], [4, 'Jueves'], [5, 'Viernes']].map(([n, t]) => `<label style="display:flex;gap:5px;align-items:center"><input type="checkbox" id="ge-d${n}" checked> ${t}</label>`).join('')}</div></div>
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
    leyenda: 'P = Presente    R = Retardo    F = Falta    J = Falta justificada',
  };
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
  });
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(90);
    doc.text(T.leyenda, mL, Hh - 7); doc.text('Hoja ' + i + ' de ' + n, W - mR, Hh - 7, { align: 'right' });
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
    f.marcas.forEach((v, k) => { const c = row.getCell(3 + k); c.value = v || null; c.alignment = centro; });
    const a = L(3), b = L(2 + nD);
    ['P', 'R', 'F', 'J'].forEach((cod, k) => { const c = row.getCell(3 + nD + k); c.value = { formula: `COUNTIF(${a}${r}:${b}${r},"${cod}")`, result: f.c[cod] }; c.alignment = centro; });
    for (let k = 1; k <= nCol; k++) { const c = row.getCell(k); c.border = borde; c.font = { size: 10 }; }
  });
  for (let k = 1; k <= nCol; k++) hr.getCell(k).border = borde;
  ws.pageSetup.printTitlesRow = rH + ':' + rH;
  ws.views = [{ state: 'frozen', xSplit: 2, ySplit: rH }];
  ws.headerFooter.oddFooter = '&L&8' + T.leyenda + '&R&8Hoja &P de &N';
  const buf = await wb.xlsx.writeBuffer();
  gDescargarBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), gNombreArchivo(H.g, 'xlsx', H.mesTxt + (H.modo === 'blanco' ? ' en blanco' : ' con asistencia')));
}
