// ============================================================
// SECUENCIAS DIDÁCTICAS — varias por trimestre, con INICIO · DESARROLLO · CIERRE y tiempos
//
// Una secuencia es una unidad con TRES FASES (no tres momentos por sesión):
//   Inicio     → despertar el interés y recuperar saberes previos
//   Desarrollo → el núcleo: el alumnado explora, investiga y trabaja
//   Cierre     → socializar, retroalimentar y evaluar «¿qué aprendimos?»
// Cada fase ocupa una o varias sesiones y el tiempo lo calcula la app (no la IA), para que siempre cuadre.
//
// Depende de: ruta-ui.js (rEl, rVal, sugMarcar, sugPoner, aActividades, aEsSecuencia),
//             metodologias.js (minuscula1), generators.js (llamarGeminiJSON, parsearJSON, obtenerPDA),
//             index.html (cD, cA, setTipo, setModalidadD, updCampos, updDisc, loadCntsD, updProysD).
// ============================================================

const SEC_MAX = 4;
const secEl = id => document.getElementById(id);
const secEsc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const secTxt = s => secEsc(s).replace(/\n+/g, '<br>');
// Los pasos numerados «1) … 2) …» que escribe la IA se muestran uno por renglón
const secPasos = s => secEsc(s).replace(/\s+(?=\d{1,2}\)\s)/g, '<br>').replace(/\n+/g, '<br>');
const secInt = (v, min, max, def) => { const n = parseInt(v, 10); return isNaN(n) ? def : Math.max(min, Math.min(max, n)); };

// ── Reparto de tiempos ───────────────────────────────────────
// Con 3 sesiones o más, cada fase ocupa sesiones completas (≈20 % inicio, ≈60 % desarrollo, ≈20 % cierre).
// Con 1 o 2 sesiones, se reparte por minutos dentro de la sesión.
// Devuelve { inicio:[{sesion,min}], desarrollo:[…], cierre:[…] }
function secHorario(total, dur) {
  total = secInt(total, 1, 60, 1); dur = secInt(dur, 20, 240, 50);
  const h = { inicio: [], desarrollo: [], cierre: [] };
  if (total >= 3) {
    let ni = Math.max(1, Math.round(total * 0.2)), nc = Math.max(1, Math.round(total * 0.2));
    while (ni + nc >= total) { if (nc > 1) nc--; else ni--; }
    for (let s = 1; s <= total; s++) (s <= ni ? h.inicio : s > total - nc ? h.cierre : h.desarrollo).push({ sesion: s, min: dur });
    return h;
  }
  const M = total * dur, r5 = x => Math.max(5, Math.round(x / 5) * 5);
  const mi = r5(M * 0.2), mc = r5(M * 0.2), md = M - mi - mc;
  let sesion = 1, libre = dur;
  const poner = (fase, mins) => { while (mins > 0) { const x = Math.min(mins, libre); h[fase].push({ sesion, min: x }); mins -= x; libre -= x; if (!libre) { sesion++; libre = dur; } } };
  poner('inicio', mi); poner('desarrollo', md); poner('cierre', mc);
  return h;
}
const secMinFase = arr => arr.reduce((a, b) => a + b.min, 0);
function secSesionesFase(arr) { return new Set(arr.map(b => b.sesion)).size; }
function secTiempoTxt(min) { const h = Math.floor(min / 60), m = min % 60; return min + ' min' + (h ? ` (${h} h${m ? ' ' + m + ' min' : ''})` : ''); }
function secResumenHorario(h) {
  const f = (n, a) => `${n} ${secSesionesFase(a)} ses. (${secMinFase(a)} min)`;
  return `${f('Inicio:', h.inicio)} · ${f('Desarrollo:', h.desarrollo)} · ${f('Cierre:', h.cierre)}`;
}

// ── Formulario ──────────────────────────────────────────────
function secFormHTML() {
  return `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-bottom:14px;font-size:13px;color:#1e40af;">
      <strong>Secuencias didácticas:</strong> cada una tiene tres fases —<b>Inicio, Desarrollo y Cierre</b>— con sus sesiones y tiempos. Elige tus contenidos arriba y la app propone el nombre, el propósito, el producto y el reparto de tiempos; tú solo ajustas lo que quieras y agregas el contexto de tu grupo.
    </div>
    <div class="f2">
      <div class="campo"><label>¿Cuántas secuencias didácticas vas a planear?</label>
        <select id="s-num" onchange="secRender()">${Array.from({ length: SEC_MAX }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}</select>
        <div class="ayuda">Los contenidos que elegiste se reparten entre ellas; puedes cambiarlo. Cada secuencia que se genera usa <b>1 documento</b> de tu cuota de IA.</div></div>
      <div class="campo"><label>Materiales con los que cuentas (opcional)</label>
        <input type="text" id="s-rec" placeholder="Ej. pizarrón, proyector, libros de texto, celulares de los alumnos…">
        <div class="ayuda">La IA propondrá actividades que se puedan hacer con ellos.</div></div>
    </div>
    <div id="s-cards"></div>
    <div class="campo"><label>Contexto de tu grupo y comunidad (opcional)</label>
      <textarea id="d-situacion" rows="3" placeholder="Ej: Los alumnos tienen dificultades con la comprensión lectora; muchos hablan maya en casa…"></textarea>
      <div class="ayuda">Si ya escribiste la problemática en el contexto (Programa Analítico), la IA también la toma en cuenta.</div></div>
    <input type="hidden" id="d-prod-sec">`;
}

function secDuracion() { return secInt((secEl('d-dur') || {}).value, 20, 240, 50); }
function secTotalSesiones() { return secInt((secEl('d-ses') || {}).value, 1, 200, 12); }

// Lee las tarjetas tal como están en pantalla
function secLeer() {
  const n = secInt((secEl('s-num') || {}).value, 1, SEC_MAX, 1), out = [];
  for (let i = 1; i <= n; i++) {
    if (!secEl(`s-${i}-n`)) continue;
    const ids = [...document.querySelectorAll(`#s-ct-${i} input:checked`)].map(x => x.value);
    out.push({
      i, on: !secEl(`s-${i}-on`) || secEl(`s-${i}-on`).checked, nombre: secEl(`s-${i}-n`).value.trim(), proposito: secEl(`s-${i}-p`).value.trim(), producto: secEl(`s-${i}-r`).value.trim(),
      sesiones: secInt(secEl(`s-${i}-s`).value, 1, 60, 1), man: secEl(`s-${i}-s`).dataset.man === '1',
      ids, contenidos: (typeof cD !== 'undefined' ? cD : []).filter(c => ids.includes(String(c.id))),
      sug: ['n', 'p', 'r'].map(k => secEl(`s-${i}-${k}`).dataset.sug === '1'),
    });
  }
  return out;
}

// Dibuja (o redibuja) las tarjetas conservando lo que el docente ya escribió
function secRender() {
  const cont = secEl('s-cards'); if (!cont) return;
  const n = secInt(secEl('s-num').value, 1, SEC_MAX, 1);
  const previo = secLeer(), lista = typeof cD !== 'undefined' ? cD : [];
  // Contenidos por tarjeta: se quitan los que ya no están elegidos; los nuevos se reparten
  const ids = previo.slice(0, n).map(c => c.ids.filter(id => lista.some(x => String(x.id) === id)));
  while (ids.length < n) ids.push([]);
  const reparto = () => { ids.forEach(a => a.length = 0); lista.forEach((c, k) => ids[Math.min(n - 1, Math.floor(k * n / lista.length))].push(String(c.id))); };   // parejo y en orden
  if (previo.length !== n || !ids.flat().length) reparto();                     // primera vez, o cambió el número de secuencias
  else lista.filter(c => !ids.flat().includes(String(c.id))).forEach(c => { let m = 0; ids.forEach((a, k) => { if (a.length < ids[m].length) m = k; }); ids[m].push(String(c.id)); });   // contenido nuevo: a la secuencia con menos
  const total = secTotalSesiones(), base = Math.max(1, Math.floor(total / n));
  cont.innerHTML = Array.from({ length: n }, (_, k) => {
    const i = k + 1;
    return `<div class="s-card" style="border:1.5px solid var(--borde);border-radius:12px;padding:12px 14px;margin:0 0 14px;background:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px;"><b style="font-size:14px;">Secuencia ${i}</b><label style="font-size:12px;cursor:pointer;"><input type="checkbox" id="s-${i}-on" checked> Incluir al generar</label></div><div id="s-${i}-h" style="font-size:12px;color:var(--gris);margin:-2px 0 8px;"></div>
      <div class="campo"><label>Contenidos que trabaja esta secuencia</label><div id="s-ct-${i}" style="display:flex;flex-direction:column;gap:4px;font-size:13px;">${lista.length ? lista.map(c => `<label style="display:flex;gap:8px;align-items:flex-start;cursor:pointer;text-transform:none;letter-spacing:0;font-weight:400;font-size:13px;margin:0;text-align:left;"><input type="checkbox" value="${secEsc(c.id)}" style="width:auto;flex:none;margin-top:3px;" ${ids[k].includes(String(c.id)) ? 'checked' : ''} onchange="secCambioCont(${i})"><span style="text-align:left;">${secEsc(c.titulo)}</span></label>`).join('') : '<span style="color:var(--gris);">Primero elige los contenidos en «Contenidos y PDAs».</span>'}</div></div>
      <div class="f2">
        <div class="campo"><label>Nombre de la secuencia</label><input type="text" id="s-${i}-n" placeholder="Se sugiere uno; puedes escribir el tuyo"></div>
        <div class="campo"><label>Sesiones de esta secuencia</label><input type="number" id="s-${i}-s" min="1" max="60" value="${base}" oninput="this.dataset.man='1';secPintar()"></div>
      </div>
      <div class="campo"><label>Propósito</label><textarea id="s-${i}-p" rows="2" placeholder="Se sugiere uno; puedes escribir el tuyo…"></textarea></div>
      <div class="campo"><label>Producto o evidencia</label><input type="text" id="s-${i}-r" placeholder="Se sugiere uno; puedes escribir el tuyo"></div>
      <div style="margin:2px 0 4px;"><button class="btn-sec" type="button" style="padding:6px 12px;font-size:12px;" onclick="secSugerir(${i},true)">💡 Sugerir otro nombre y producto</button></div>
    </div>`;
  }).join('');
  // Restaurar lo escrito y volver a sugerir lo vacío
  previo.slice(0, n).forEach(c => {
    const i = c.i, poner = (k, v, s) => { const e = secEl(`s-${i}-${k}`); if (e && v) { e.value = v; if (k !== 's') sugMarcar(e.id, s); } };
    { const o = secEl(`s-${i}-on`); if (o) o.checked = c.on; }
    poner('n', c.nombre, c.sug[0]); poner('p', c.proposito, c.sug[1]); poner('r', c.producto, c.sug[2]);
    if (c.man) { const e = secEl(`s-${i}-s`); e.value = c.sesiones; e.dataset.man = '1'; }
  });
  for (let i = 1; i <= n; i++) secSugerir(i, false);
  secPintar();
}

// Muestra el reparto de tiempos de cada tarjeta
function secPintar() {
  const dur = secDuracion();
  secLeer().forEach(c => { const e = secEl(`s-${c.i}-h`); if (e) e.textContent = `${c.sesiones} ses. × ${dur} min = ${secTiempoTxt(c.sesiones * dur)} · ${secResumenHorario(secHorario(c.sesiones, dur))}`; });
}
function secCambioCont(i) { secSugerir(i, false); }

// Sugerencias: no gastan IA. No pisan lo que el docente ya escribió.
const SEC_NOMBRES = [t => 'Secuencia didáctica: ' + t, t => 'Aprendemos sobre ' + minuscula1(t), t => 'Explorando: ' + t, t => t + ': ¿qué sabemos y qué aprendimos?'];
const SEC_PRODUCTOS = [t => 'Texto, esquema o presentación que muestre lo aprendido sobre ' + minuscula1(t), t => 'Cartel o infografía sobre ' + minuscula1(t), t => 'Exposición oral con apoyo visual sobre ' + minuscula1(t), t => 'Cuadro comparativo y reflexión escrita sobre ' + minuscula1(t), t => 'Portafolio de evidencias sobre ' + minuscula1(t)];
const secIdx = {};
function secSugerir(i, otro) {
  const c = secLeer().find(x => x.i === i); if (!c || !c.contenidos.length) { if (otro) alert('Primero marca los contenidos de esta secuencia.'); return; }
  if (otro) secIdx[i] = (secIdx[i] || 0) + 1;
  const k = secIdx[i] || 0, cont = c.contenidos[k % c.contenidos.length];
  const tit = String(cont.titulo || '').trim().replace(/[.\s]+$/, '');
  const nombre = (SEC_NOMBRES[(k + i - 1) % SEC_NOMBRES.length](tit) + (c.contenidos.length > 1 && k % c.contenidos.length === 0 && !otro ? '' : '')).slice(0, 120);
  const producto = SEC_PRODUCTOS[(k + i - 1) % SEC_PRODUCTOS.length](tit);
  const proposito = 'Que las y los estudiantes desarrollen el aprendizaje ' + (c.contenidos.length > 1 ? 'de los contenidos trabajados (' + c.contenidos.map(x => '«' + String(x.titulo).trim().replace(/[.\s]+$/, '') + '»').join(', ') + ')' : 'del contenido «' + tit + '»') + ' mediante actividades de inicio, desarrollo y cierre, y muestren lo aprendido en: ' + minuscula1(producto) + '.';
  if (otro) {
    const e = secEl(`s-${i}-n`);
    if (e.value.trim() && e.dataset.sug !== '1' && !confirm('Ya escribiste un nombre. ¿Quieres reemplazarlo por esta sugerencia?')) return;
    [[`s-${i}-n`, nombre], [`s-${i}-r`, producto]].forEach(([id, v]) => { secEl(id).value = v; sugMarcar(id, true); });
    sugPoner(`s-${i}-p`, proposito);
  } else { sugPoner(`s-${i}-n`, nombre); sugPoner(`s-${i}-r`, producto); sugPoner(`s-${i}-p`, proposito); }
  const first = secLeer()[0]; if (first && secEl('d-prod-sec')) secEl('d-prod-sec').value = first.producto;
}

// ── Generación con IA (una llamada por secuencia) ───────────
function secPrompt(d, c, h, nSec) {
  const trimNom = d.trimestre === '1' ? 'Primer' : d.trimestre === '2' ? 'Segundo' : 'Tercer';
  const conts = c.contenidos.map(x => `- Contenido: ${x.titulo}\n  PDA: ${obtenerPDA(x, d.grado)}`).join('\n');
  const prob = (typeof rVal === 'function' ? rVal('ctx-7') : '').trim();
  const fase = (nom, arr) => `${nom} — ${arr.length} bloque(s), en este orden: ${arr.map((b, k) => `[${k + 1}] sesión ${b.sesion}, ${b.min} min`).join('; ')}`;
  const pideEjes = !d.ejes, pidePerfil = !d.perfil;
  const nb = a => a.length;
  return `Eres experto en didáctica de la Nueva Escuela Mexicana (Plan de Estudio 2022, secundaria, Fase 6). Diseña UNA secuencia didáctica completa.
Responde SOLO con JSON válido, sin markdown ni texto extra. Español claro y práctico, redactado PARA EL DOCENTE.
No inventes datos, cifras ni nombres de personas reales. Propón actividades que se puedan hacer en una escuela pública con recursos sencillos${d.recursos ? ' y, en lo posible, con los materiales con que cuenta el docente' : ''}.

DATOS:
- Disciplina: ${d.disciplina} | Campo formativo: ${d.campo} | Grado: ${d.grado}° | ${trimNom} trimestre
- Secuencia ${c.i} de ${nSec}: "${c.nombre || 'Secuencia didáctica'}"
- Propósito: ${c.proposito || 'desarrollar los aprendizajes de los contenidos'}
- Producto o evidencia: ${c.producto || 'por definir'}
- Duración: ${c.sesiones} sesión(es) de ${secDuracion()} min
${prob ? `- Problemática de la comunidad/escuela: ${prob}\n` : ''}${d.situacion ? `- Contexto del grupo: ${d.situacion}\n` : ''}${d.recursos ? `- Materiales con los que cuenta el docente: ${d.recursos}\n` : ''}
CONTENIDOS Y PDA:
${conts}

ORGANIZACIÓN DEL TIEMPO (respétala exactamente; cada bloque es una fila de la tabla):
${fase('INICIO', h.inicio)}
${fase('DESARROLLO', h.desarrollo)}
${fase('CIERRE', h.cierre)}

CÓMO REDACTAR CADA BLOQUE: separa en pasos numerados con sus minutos, que sumen EXACTAMENTE los minutos del bloque (ejemplo: "1) (10 min) Plantea la pregunta… 2) (25 min) …"). Indica qué hace el docente y, aparte, qué hace el alumnado.
- INICIO: despertar el interés, recuperar saberes previos y presentar el propósito y el producto.
- DESARROLLO: núcleo de la secuencia; el alumnado explora, investiga, analiza o produce y el docente guía.
- CIERRE: socializar los resultados, retroalimentar y evaluar «¿qué aprendimos?».

JSON requerido (cada fase con EXACTAMENTE ${nb(h.inicio)}, ${nb(h.desarrollo)} y ${nb(h.cierre)} bloques, respectivamente):
{
  "situacion": "situación de aprendizaje que da origen a la secuencia, 2-3 oraciones",
  "finalidades": "2-3 finalidades del campo formativo para esta secuencia",
  "especificidad": "especificidad del campo formativo para esta secuencia, 1 párrafo",${pideEjes ? '\n  "ejes": "ejes articuladores pertinentes, separados por comas, solo de: Inclusión, Pensamiento crítico, Interculturalidad crítica, Igualdad de género, Vida saludable, Apropiación de las culturas a través de la lectura y la escritura, Artes y experiencias estéticas",' : ''}${pidePerfil ? '\n  "perfil": "rasgos del perfil de egreso que se desarrollan, con su número (ej. 1. Reconocen que son ciudadanas…)",' : ''}
  "organizacion": "forma de trabajo general (individual, equipos, grupal) y cómo se organiza el grupo",
  "espacios": "espacios donde se trabaja",
  "materiales": "materiales y recursos de toda la secuencia",
  "fases": {
    "inicio": { "proposito": "para qué sirve esta fase", "bloques": [ { "docente": "…", "alumnado": "…", "forma": "Individual | En equipos | Grupal", "recursos": "…" } ] },
    "desarrollo": { "proposito": "…", "bloques": [ … ] },
    "cierre": { "proposito": "…", "bloques": [ … ] }
  },
  "evaluacion": [ { "criterio": "criterio redactado desde el PDA", "evidencia": "qué se observa o recoge", "instrumento": "rúbrica, lista de cotejo, etc.", "ponderacion": "30%" } ],
  "adecuaciones": "ajustes razonables para estudiantes con barreras para el aprendizaje"
}
La ponderación de los criterios suma 100 %.`;
}

function secBloqueHTML(d, c, h, ia, nSec) {
  const C = '#BDD7EE';
  const th = (t, w, bg) => `<td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${bg || C};${w ? 'width:' + w + ';' : ''}vertical-align:top;">${t}</td>`;
  const td = (t, w, extra) => `<td style="border:1px solid #000;padding:5px 8px;vertical-align:top;${w ? 'width:' + w + ';' : ''}${extra || ''}">${t || '&nbsp;'}</td>`;
  const tr = (...x) => `<tr>${x.join('')}</tr>`;
  const tabla = f => `<table style="width:100%;border-collapse:collapse;margin-bottom:10px;">${f}</table>`;
  const dur = secDuracion(), totMin = c.sesiones * dur;
  const periodo = d.trimestre === '1' ? 'Septiembre - Noviembre' : d.trimestre === '2' ? 'Diciembre - Marzo' : 'Abril - Junio';
  const trim = d.trimestre === '1' ? 'Primer' : d.trimestre === '2' ? 'Segundo' : 'Tercer';
  const bloquesFase = (clave, arr, color, titulo) => {
    const f = (ia.fases && ia.fases[clave]) || {}, bl = Array.isArray(f.bloques) ? f.bloques : [];
    const filas = arr.map((b, k) => { const x = bl[k] || {}; return tr(td(String(b.sesion), '7%', 'text-align:center;'), td(b.min + ' min', '8%', 'text-align:center;'), td(secPasos(x.docente), '31%'), td(secPasos(x.alumnado), '31%'), td(secTxt(x.forma), '10%'), td(secTxt(x.recursos), '13%')); }).join('');
    return `<p style="font-weight:bold;font-size:11.5pt;margin:12px 0 3px;">${titulo} · ${secSesionesFase(arr)} sesión${secSesionesFase(arr) > 1 ? 'es' : ''} · ${secTiempoTxt(secMinFase(arr))}</p>
${f.proposito ? `<p style="margin:0 0 4px;"><em>${secTxt(f.proposito)}</em></p>` : ''}
${tabla(tr(th('Sesión', '7%', color), th('Tiempo', '8%', color), th('Actividades del docente', '31%', color), th('Actividades del alumnado', '31%', color), th('Forma de trabajo', '10%', color), th('Recursos', '13%', color)) + filas)}`;
  };
  const ev = Array.isArray(ia.evaluacion) ? ia.evaluacion : [];
  const contenidosPda = c.contenidos.map(x => `<strong>${secEsc(x.titulo)}</strong><br>PDA: ${secEsc(obtenerPDA(x, d.grado))}`).join('<br><br>');
  const ejes = d.ejes || ia.ejes || '', perfil = d.perfil || ia.perfil || '';
  return `
<h2 style="text-align:center;font-weight:bold;margin:0;">PLANO DIDÁCTICO — SECUENCIA DIDÁCTICA</h2>
${d.tipoEscuela ? `<p style="text-align:center;margin:0;">${secEsc(d.tipoEscuela)}</p>` : ''}
<p style="text-align:center;margin:0;">${d.zona ? 'Supervisión de la Zona Escolar ' + secEsc(d.zona) + ' &nbsp; ' : ''}Curso escolar: ${secEsc(d.cicloEscolar || '2026-2027')}</p>
<h3 style="text-align:center;margin:8px 0;">${nSec > 1 ? `Secuencia ${c.i} de ${nSec}: ` : ''}${secEsc(c.nombre || 'Secuencia didáctica')}</h3>
${tabla(
    tr(th('Escuela:', '15%'), td(secEsc(d.escuela), '35%'), th('C.C.T.:', '15%'), td(secEsc(d.cct), '35%')) +
    tr(th('Docente:'), td(secEsc(d.docente)), th('Grado y grupo:'), td(secEsc(d.grado + '° ' + (d.grupo || '')))) +
    tr(th('Campo formativo:'), td(secEsc(d.campo)), th('Disciplina:'), td(secEsc(d.disciplina))) +
    tr(th('Periodo:'), td(`${trim} trimestre (${periodo})`), th('Modalidad:'), td('Secuencia didáctica')) +
    tr(th('Duración total:'), td(`${c.sesiones} sesión${c.sesiones > 1 ? 'es' : ''} de ${dur} min = ${secTiempoTxt(totMin)}`), th('Distribución:'), td(secResumenHorario(h))) +
    tr(th('Forma de trabajo:'), td(secTxt(ia.organizacion)), th('Espacios:'), td(secTxt(ia.espacios)))
  )}
${tabla(
    tr(th('Situación de aprendizaje', '22%'), td(secTxt(ia.situacion || d.situacion))) +
    tr(th('Propósito'), td(secTxt(c.proposito))) +
    tr(th('Contenidos y PDA'), td(contenidosPda)) +
    tr(th('Producto o evidencia'), td(secTxt(c.producto))) +
    tr(th('Ejes articuladores'), td(secTxt(ejes))) +
    tr(th('Perfil de egreso'), td(secTxt(perfil).replace(/(<br>)+/g, '<br><br>'))) +
    tr(th('Finalidades del campo formativo'), td(secTxt(ia.finalidades))) +
    tr(th('Especificidad del campo formativo'), td(secTxt(ia.especificidad))) +
    (d.disciplinasAdicionales ? tr(th('Interdisciplinariedad'), td(secTxt(d.disciplinasAdicionales))) : '') +
    tr(th('Materiales y recursos'), td(secTxt(ia.materiales || d.recursos)))
  )}
${bloquesFase('inicio', h.inicio, '#FFF3CD', 'INICIO')}
${bloquesFase('desarrollo', h.desarrollo, '#D4EDDA', 'DESARROLLO')}
${bloquesFase('cierre', h.cierre, '#D1ECF1', 'CIERRE')}
<p style="font-weight:bold;font-size:11.5pt;margin:12px 0 3px;">EVALUACIÓN FORMATIVA</p>
${tabla(tr(th('Criterio', '32%'), th('Evidencia', '30%'), th('Instrumento', '26%'), th('Ponderación', '12%')) + (ev.length ? ev.map(e => tr(td(secTxt(e.criterio)), td(secTxt(e.evidencia)), td(secTxt(e.instrumento)), td(secTxt(e.ponderacion), '', 'text-align:center;'))).join('') : tr(td(''), td(''), td(''), td(''))))}
${tabla(tr(th('Adecuaciones / ajustes razonables', '22%'), td(secTxt(ia.adecuaciones))))}`;
}

// Sustituye a la generación anterior (sesiones sueltas): una llamada por secuencia, con respaldo si una falla
async function generarSecuenciaDidactica(d) {
  const todas = secLeer(); if (!todas.length) throw new Error('Elige cuántas secuencias vas a planear.');
  const cards = todas.filter(c => c.on); if (!cards.length) throw new Error('Marca al menos una secuencia en «Incluir al generar».');
  const sinCont = cards.find(c => !c.contenidos.length);
  if (sinCont) throw new Error(`La secuencia ${sinCont.i} no tiene contenidos: marca al menos uno.`);
  d.situacion = (secEl('d-situacion') || {}).value || ''; d.recursos = ((secEl('s-rec') || {}).value || '').trim();
  if (typeof licEsPrueba === 'function' && licEsPrueba() && cards.length > 1) throw new Error('En la prueba gratis puedes generar 1 secuencia. Deja una sola secuencia (o activa tu licencia para generar hasta 4 por trimestre).');
  const msg = secEl('gen-d-msg'), dur = secDuracion(), partes = [], fallos = [], hechas = [];
  for (const c of cards) {
    if (msg) msg.innerHTML = `Generando secuencia ${c.i} de ${todas.length}…<br><small>Inicio, desarrollo y cierre con sus tiempos (30–60 segundos cada una)</small>`;
    const h = secHorario(c.sesiones, dur);
    try {
      const ia = parsearJSON(await llamarGeminiJSON(secPrompt(d, c, h, cards.length), 'secuencia'));
      partes.push(secBloqueHTML(d, c, h, ia, todas.length)); hechas.push(c.i);
    } catch (e) { fallos.push(`Secuencia ${c.i}: ${e.message}`); }
  }
  if (!partes.length) throw new Error(fallos[0] || 'No se pudo generar la secuencia.');
  if (fallos.length) {
    hechas.forEach(i => { const o = secEl(`s-${i}-on`); if (o) o.checked = false; });   // las que ya salieron bien no se repiten
    alert('Se generaron ' + partes.length + ' de ' + cards.length + ' secuencias.\n\n' + fallos.join('\n') + '\n\nLas que ya salieron bien quedaron desmarcadas en «Incluir al generar». Pulsa Generar otra vez para completar solo las que faltan.');
  }
  return partes.join('<p style="margin:0;page-break-before:always;"><br clear="all" style="page-break-before:always;mso-break-type:page-break"></p>');
}

// ── Desde el Programa Analítico ─────────────────────────────
// «Planear este trimestre» abre el Plano Didáctico con todo lo del Analítico ya cargado.
function secSesionesDeTexto(txt) {
  const t = String(txt || '').toLowerCase();
  let m = t.match(/(\d+)\s*sesi/); if (m) return +m[1];
  m = t.match(/(\d+)\s*semana/); if (m) return +m[1] * 3;   // ~3 sesiones por semana; el docente lo ajusta
  return 0;
}
function secDesdeAnalitico(t, tipo) {
  const acts = aActividades(t).filter(a => (tipo === 'secuencia') === aEsSecuencia(a.modalidad));
  if (!acts.length) { alert(tipo === 'secuencia' ? 'En este trimestre no marcaste ninguna secuencia didáctica. Elige «Secuencia didáctica» en la modalidad o usa «➕ Agregar otro proyecto o secuencia».' : 'En este trimestre no hay un proyecto: todas las actividades son secuencias didácticas.'); return; }
  const v = id => ((secEl(id) || {}).value || '').trim();
  const g = v('a-gra'), cam = v('a-cam'), dis = v('a-dis');
  if (!g || !cam || !dis) { alert('Primero elige grado, campo formativo y disciplina en el Programa Analítico.'); return; }
  setTipo('d');
  [['d-doc', 'a-doc'], ['d-esc', 'a-esc'], ['d-cct', 'a-cct'], ['d-cic', 'a-cic']].forEach(([a, b]) => { const e = secEl(a); if (e && !e.value.trim() && v(b)) e.value = v(b); });
  if (v('d-gra') !== g || v('d-cam') !== cam || v('d-dis') !== dis) {
    secEl('d-gra').value = g; updCampos('d'); secEl('d-cam').value = cam; updDisc('d'); secEl('d-dis').value = dis;
  }
  loadCntsD();
  secEl('d-tri').value = String(t);
  // Contenidos del trimestre (los mismos que elegiste en el Analítico)
  const cnts = obtenerContenidos(cam, dis, g), ids = (cA['t' + t] || []).map(c => c.id);
  [...secEl('d-cnt-lista').children].forEach((div, k) => { if (cnts[k] && ids.includes(cnts[k].id)) div.click(); });
  // Ejes articuladores y perfil de egreso
  [['a-ejes-grid', 'd-ejes-grid'], ['a-perfil-grid', 'd-perfil-grid']].forEach(([ga, gd]) => {
    const marcados = [...document.querySelectorAll(`#${ga} input:checked`)].map(x => x.value);
    document.querySelectorAll(`#${gd} label`).forEach(lab => { const ch = lab.querySelector('input'); if (ch && marcados.includes(ch.value) && !ch.checked) lab.click(); });
  });
  if (tipo === 'secuencia') {
    setModalidadD('secuencia');
    secEl('s-num').value = String(Math.min(SEC_MAX, acts.length)); secRender();
    const cards = secLeer(), n = cards.length;
    // Los contenidos se reparten en orden entre las secuencias
    document.querySelectorAll('#s-cards input[type=checkbox]').forEach(x => { x.checked = false; });
    const lista = typeof cD !== 'undefined' ? cD : [];
    lista.forEach((c, k) => { const i = Math.min(n, Math.floor(k * n / lista.length) + 1), x = document.querySelector(`#s-ct-${i} input[value="${String(c.id).replace(/"/g, '')}"]`); if (x) x.checked = true; });
    acts.slice(0, SEC_MAX).forEach((a, k) => {
      const i = k + 1, ponerV = (s, val) => { const e = secEl(`s-${i}-${s}`); if (e && val) { e.value = val; if (s !== 's') sugMarcar(e.id, false); } };
      ponerV('n', a.nombre); ponerV('p', a.proposito); ponerV('r', a.productos);
      const ses = secSesionesDeTexto(a.duracion); if (ses) { const e = secEl(`s-${i}-s`); e.value = ses; e.dataset.man = '1'; }
    });
    for (let i = 1; i <= n; i++) secSugerir(i, false);   // completa lo que el docente no escribió
    secPintar();
  } else {
    setModalidadD('proyecto');
    const a = acts[0], ponerP = (id, val) => { const e = secEl(id); if (e && val) { e.value = val; if (typeof sugMarcar === 'function') sugMarcar(id, false); } };
    ponerP('d-proy', a.nombre); ponerP('d-prod', a.productos); ponerP('d-prop', a.proposito);
    const mod = secEl('d-mod'); if (mod && a.modalidad) mod.value = a.modalidad;
  }
  const sec = secEl('sec-d'); if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Arranque ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const f = secEl('s-form'); if (f) { f.innerHTML = secFormHTML(); secRender(); }
  const dur = secEl('d-dur'); if (dur) dur.addEventListener('change', secPintar);
  const ses = secEl('d-ses'); if (ses) ses.addEventListener('change', () => { document.querySelectorAll('#s-cards input[id$="-s"]').forEach(e => { if (e.dataset.man !== '1') e.value = ''; }); secRender(); });
});
// Al teclear en las tarjetas, el campo deja de ser «sugerido»
document.addEventListener('input', ev => { if (ev.target && /^s-\d+-[npr]$/.test(ev.target.id)) sugMarcar(ev.target.id, false); });
// Cuando cambian los contenidos elegidos en el Plano Didáctico, se repiten en las tarjetas
// (se envuelve al terminar de cargar, porque updProysD se define en el script de la página)
window.addEventListener('load', () => {
  if (typeof updProysD !== 'function' || window.__secWrap) return; window.__secWrap = true;
  const orig = window.updProysD;
  window.updProysD = function () { const r = orig.apply(this, arguments); try { secRender(); } catch (e) { /* aún no hay formulario */ } return r; };
});
