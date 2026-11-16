// ============================================================
// RUTA METODOLÓGICA — INTERFAZ (Plano Didáctico)
// Depende de: metodologias.js, generators.js (llamarGeminiJSON, parsearJSON),
// y de las funciones/variables globales de index.html (cD, getEjesSeleccionados…)
// ============================================================

let rutaActual = null;     // ruta en edición
let rutaSugerencias = [];  // proyectos sugeridos
let rutaSelProy = -1;      // índice de la sugerencia elegida
let rutaDebounce = null;

const RUTA_MOD_SELECT = {
  abpc: 'Aprendizaje en proyectos comunitarios',
  steam: 'Aprendizaje basado en indagación (enfoque STEAM)',
  abp: 'Aprendizaje Basado en Problemas (ABP)',
  as: 'Aprendizaje servicio',
};
const RUTA_ESC_TXT = { aula: 'Aula · proyecto áulico', escuela: 'Escuela · proyecto escolar', comunidad: 'Comunidad · proyecto comunitario' };

function rEl(id) { return document.getElementById(id); }
function rVal(id) { const e = rEl(id); return e ? e.value : ''; }

// ── Lectura del formulario ────────────────────────────────
function rutaLeerCfg() {
  return {
    met: rVal('r-met') || 'abpc',
    esc: rVal('r-esc') || 'aula',
    prob: rVal('r-prob').trim(),
    dis: rVal('d-dis'),
    prod: rVal('d-prod'),
    totalSes: parseInt(rVal('d-ses'), 10) || 25,
    minSes: parseInt(rVal('d-dur'), 10) || 50,
    sesPorSem: parseInt(rVal('r-sps'), 10) || 3,
    bap: rVal('r-bap').trim(),
    espacios: rVal('r-espacios').trim(),
    recursosPlantel: rVal('r-rec').trim(),
  };
}

function rutaSincronizarCampos() {
  if (!rutaActual) return;
  const c = rutaLeerCfg();
  rutaActual.bap = c.bap; rutaActual.espacios = c.espacios;
  rutaActual.recursosPlantel = c.recursosPlantel; rutaActual.esc = c.esc;
}

// Datos del Plano Didáctico tomados del formulario (misma forma que genDidactico)
function rutaDatosPlano() {
  return {
    docente: rVal('d-doc'), grado: rVal('d-gra'), campo: rVal('d-cam'), disciplina: rVal('d-dis'),
    escuela: rVal('d-esc'), cct: rVal('d-cct'), cicloEscolar: rVal('d-cic'), grupo: rVal('d-grp'),
    tipoEscuela: rVal('d-tipoesc'), zona: rVal('d-zona'), codiseno: rVal('d-codis'), productoSecundario: rVal('d-prod-sec'),
    trimestre: rVal('d-tri'), numSesiones: rVal('d-ses'), duracionSesion: rVal('d-dur'),
    nombreProyecto: rVal('d-proy') || 'Proyecto del trimestre',
    modalidad: rVal('d-mod'),
    ejes: getEjesSeleccionados('d-ejes-grid') || rVal('d-ejes'),
    perfil: getPerfilSeleccionado('d-perfil-grid'),
    problematizacion: rVal('d-prob'),
    proposito: rVal('d-prop'),
    productoIntegrador: rVal('d-prod'),
    disciplinasAdicionales: rVal('d-inter'),
    contenidos: (typeof cD !== 'undefined' ? cD : []),
  };
}

// ── Selección automática de metodología según el campo ──
function rutaCampoCambio() {
  const campo = rVal('d-cam');
  const id = METODOLOGIA_POR_CAMPO[campo];
  const sel = rEl('r-met');
  if (id && sel) {
    if (!rutaActual) sel.value = id;
    else if (!rutaActual.editada && sel.value !== id) { sel.value = id; rutaMarcarDesactualizada(); } // cambió de campo sin haber editado la ruta
  }
  rutaActualizarAyudaMet();
}
function rutaActualizarAyudaMet() {
  const id = rVal('r-met');
  const met = METODOLOGIAS[id]; if (!met) return;
  const campo = rVal('d-cam');
  const recomendada = METODOLOGIA_POR_CAMPO[campo];
  let t = `<strong>${escM(met.siglas)}</strong> · ${escM(met.resumen)} <em>(${met.fases.reduce((a, f) => a + f.mom.length, 0)} momentos en ${met.fases.length} ${id === 'as' ? 'etapas' : 'fases'})</em>`;
  // La asociación campo ↔ metodología es solo una SUGERENCIA (autonomía profesional docente):
  // nunca se presenta como error ni como obligación.
  if (campo && recomendada && recomendada !== id) t += `<br><span style="color:#475569;">ℹ Para «${escM(campo)}» se sugiere ${escM(METODOLOGIAS[recomendada].siglas)}, pero tú decides: puedes usar ${escM(met.siglas)} si la problemática de tu grupo lo pide.</span>`;
  else if (campo && recomendada === id) t += `<br><span style="color:#16a34a;">✓ Es la metodología que se sugiere para este campo formativo (puedes cambiarla si tu problemática lo pide).</span>`;
  t += `<br><span style="color:#64748b;">Las fases son una guía, no una receta: parte de tu diagnóstico y del programa analítico, y edita la ruta con lo que tu grupo necesita.</span>`;
  const a = rEl('r-met-ayuda'); if (a) a.innerHTML = t;
}
function rutaCambioMet() { rutaActualizarAyudaMet(); rutaMarcarDesactualizada(); }

function rutaActualizarReferencia() {
  const e = rEl('r-ref'); if (!e) return;
  const c = rutaLeerCfg();
  e.innerHTML = `⏱ Se usarán <strong>${c.totalSes} sesiones</strong> de <strong>${c.minSes} min</strong> (los datos de «Número de sesiones» y «Duración por sesión» de arriba) · ${c.sesPorSem} por semana ≈ <strong>${Math.ceil(c.totalSes / c.sesPorSem)} semanas</strong>.`;
}
function rutaTiemposCambio() {
  rutaActualizarReferencia();
  if (!rutaActual) return;
  const c = rutaLeerCfg();
  recalcularTiempos(rutaActual, c.totalSes, c.minSes, c.sesPorSem);
  renderRuta();
}
function rutaMarcarDesactualizada() {
  const b = rEl('ruta-desact');
  if (b && rutaActual) b.style.display = 'block';
}

// ── Diseñar la ruta ───────────────────────────────────────
function rutaError(msg) { const e = rEl('ruta-err'); if (!e) return; e.textContent = msg; e.style.display = msg ? 'block' : 'none'; }

function disenarRuta() {
  const c = rutaLeerCfg();
  rutaError('');
  if (c.prob.length < 20) { rutaError('Escribe la problemática de tu contexto (al menos una o dos oraciones): ¿qué pasa?, ¿a quién afecta?, ¿cómo se nota en tu grupo?'); rEl('r-prob').focus(); return; }
  if (rutaActual && rutaActual.editada && !confirm('Ya editaste la ruta. Si vuelves a armar el proyecto se perderán tus cambios. ¿Continuar?')) return;
  rutaActual = construirRuta(c);
  rutaSugerencias = sugerirProyectos(c.met, c.prob, c.esc);
  rutaSelProy = -1;
  rutaActual.ejesSug = (rutaSugerencias.find(s => s.ejes && s.ejes.length) || { ejes: [] }).ejes;
  // Si aún no hay nombre ni producto, propone el primero marcado como «sugerido» (el docente puede cambiarlo)
  if (rutaSugerencias[0]) {
    sugPoner('d-proy', rutaSugerencias[0].nombre);
    if (sugPoner('d-prod', rutaSugerencias[0].producto)) rutaActual.proyecto = { nombre: rVal('d-proy'), producto: rVal('d-prod'), tipo: rutaSugerencias[0].tipo };
  }
  renderRuta();
  const out = rEl('ruta-out');
  if (out) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Elegir proyecto sugerido ──────────────────────────────
function rutaElegirProyecto(i) {
  const s = rutaSugerencias[i]; if (!s || !rutaActual) return;
  rutaSelProy = i;
  rEl('d-proy').value = s.nombre;
  rEl('d-prod').value = s.producto;
  sugMarcar('d-proy', false); sugMarcar('d-prod', false);   // lo eligió el docente
  rutaActual.proyecto = { nombre: s.nombre, producto: s.producto, tipo: s.tipo };
  if (s.ejes && s.ejes.length) rutaActual.ejesSug = s.ejes;
  renderRuta();
}

// ── Usar la ruta en el Plano Didáctico ────────────────────
function rutaAplicarEjes(lista) {
  const grid = rEl('d-ejes-grid'); if (!grid || !lista) return;
  if (grid.querySelectorAll('input:checked').length) return; // respeta lo que ya marcó el docente
  grid.querySelectorAll('input[type=checkbox]').forEach(inp => { if (lista.includes(inp.value) && !inp.checked) inp.click(); });
}

function rutaUsar() {
  if (!rutaActual) return;
  rutaSincronizarCampos();
  const met = METODOLOGIAS[rutaActual.met];
  if (typeof setModalidadD === 'function') setModalidadD('proyecto');
  const sel = rEl('d-mod'); if (sel) sel.value = RUTA_MOD_SELECT[rutaActual.met];
  const prob = rEl('d-prob');
  if (prob && (!prob.value.trim() || prob.value === rutaActual.probAuto)) { prob.value = rutaActual.prob; rutaActual.probAuto = rutaActual.prob; }
  const proy = (rutaActual.proyecto && rutaActual.proyecto.nombre) || rVal('d-proy');
  const prodT = (rutaActual.proyecto && rutaActual.proyecto.producto) || rVal('d-prod') || 'un producto integrador';
  const dg = rVal('d-gra') || '';
  const prop = `Que las y los estudiantes de ${dg ? dg + '° grado' : 'secundaria'} desarrollen, mediante ${met.nombre.toLowerCase()}, los aprendizajes de ${rVal('d-dis') || 'la disciplina'} vinculados con los contenidos y PDA seleccionados, para atender «${probCorta(rutaActual.prob)}» y elaborar «${prodT}» que contribuya a mejorar su ${{ aula: 'aula', escuela: 'escuela', comunidad: 'comunidad' }[rutaActual.esc]}.`;
  const pp = rEl('d-prop');
  if (pp && (!pp.value.trim() || pp.value === rutaActual.propAuto)) { pp.value = prop; rutaActual.propAuto = prop; }
  rutaAplicarEjes(rutaActual.ejesSug);
  rutaActual.usar = true;
  renderRuta();
  const ok = rEl('ruta-usada'); if (ok) ok.style.display = 'block';
  const btn = rEl('bgd'); if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ── IA: personalizar y complementar ───────────────────────
function rutaPromptComplementos(d, conMomentos) {
  const met = METODOLOGIAS[rutaActual.met];
  const contenidos = (d.contenidos || []).map(c => `- ${c.titulo} | PDA: ${obtenerPDA(c, d.grado)}`).join('\n');
  const moms = []; rutaActual.fases.forEach(f => f.mom.forEach(m => moms.push(m.n)));
  return `Eres experto en la Nueva Escuela Mexicana (Fase 6, secundaria, México). Responde SOLO con JSON válido, sin markdown.

DATOS:
- Campo formativo: ${d.campo}; Disciplina: ${d.disciplina}; Grado: ${d.grado}°
- Metodología: ${met.nombre}
- Escenario: ${RUTA_ESC_TXT[rutaActual.esc]}
- Problemática del contexto: ${rutaActual.prob}
- Proyecto: ${d.nombreProyecto}; Producto: ${d.productoIntegrador || 'por definir'}
- Contenidos y PDA:
${contenidos || '- (sin contenidos seleccionados)'}

Devuelve este JSON:
{
  "finalidades": "2 finalidades del campo formativo ${d.campo} a las que contribuye este proyecto y, al final, 1 oración que ARGUMENTE con claridad de qué manera la intervención didáctica contribuirá a lograrlas; todo en una sola cadena",
  "propositoDisciplina": "propósito específico de la disciplina ${d.disciplina}: 1 o 2 oraciones tomadas de los contenidos, los PDA, las finalidades y la especificidad del campo, redactadas como lo que lograrán los estudiantes",
  "especificidad": "especificidad del campo formativo para ${d.disciplina}, 2 oraciones",
  "interdisciplinariedad": "1 o 2 oraciones sobre cómo se vincula con otras disciplinas del campo"${conMomentos ? `,
  "momentos": { "1": {"doc": "...", "alu": "..."} }` : ''}
}
${conMomentos ? `En "momentos" incluye una entrada por cada número de esta lista. "doc" = una oración concreta (máx. 30 palabras) de lo que hace el docente en ese momento adaptada a la problemática y al producto; "alu" = una oración concreta de lo que hacen los estudiantes. No inventes datos ni cifras.
Momentos:
${moms.map((n, i) => `${i + 1}. ${n}`).join('\n')}` : ''}`;
}

async function rutaPedirComplementos(d, conMomentos) {
  const resp = await llamarGeminiJSON(rutaPromptComplementos(d, conMomentos));
  const ia = parsearJSON(resp);
  const str = v => (typeof v === 'string' ? v.trim() : '');
  return {
    comp: { finalidades: str(ia.finalidades), especificidad: str(ia.especificidad), interdisciplinariedad: str(ia.interdisciplinariedad), propositoDisciplina: str(ia.propositoDisciplina) },
    momentos: (ia.momentos && typeof ia.momentos === 'object') ? ia.momentos : {},
  };
}

async function rutaPersonalizarIA() {
  if (!rutaActual) return;
  if (rutaActual.editada && !confirm('La IA reescribirá la primera actividad de cada momento. Si ya editaste esas actividades se perderán. ¿Continuar?')) return;
  rutaSincronizarCampos();
  const btn = rEl('btn-ruta-ia'), st = rEl('ruta-ia-st');
  btn.disabled = true; st.textContent = 'Mejorando las actividades con IA… (20–60 segundos)'; st.style.color = 'var(--gris)';
  try {
    const d = rutaDatosPlano();
    const r = await rutaPedirComplementos(d, true);
    const moms = []; rutaActual.fases.forEach(f => f.mom.forEach(m => moms.push(m)));
    let n = 0;
    moms.forEach((m, i) => {
      const x = r.momentos[String(i + 1)];
      if (x && typeof x.doc === 'string' && x.doc.trim()) { m.doc[0] = x.doc.trim(); n++; }
      if (x && typeof x.alu === 'string' && x.alu.trim()) { m.alu[0] = x.alu.trim(); }
    });
    rutaActual.comp = Object.assign({}, rutaActual.comp, r.comp);
    renderRuta();
    const s2 = rEl('ruta-ia-st'); if (s2) { s2.textContent = `✓ Actividades mejoradas (${n} momentos). Revisa y ajusta lo que necesites.`; s2.style.color = 'var(--verde)'; }
  } catch (e) {
    console.error(e);
    btn.disabled = false; st.textContent = 'No se pudo mejorar con IA: ' + e.message + '. Tu ruta sigue intacta.'; st.style.color = 'var(--rojo)';
  }
}

// Genera el Plano completo en formato oficial a partir de la ruta (lo llama genDidactico)
async function rutaGenerarPlano(d) {
  rutaSincronizarCampos();
  rutaActual.proyecto = Object.assign({}, rutaActual.proyecto, { nombre: d.nombreProyecto, producto: d.productoIntegrador });
  if (!rutaActual.comp || !rutaActual.comp.finalidades) {
    try {
      const r = await rutaPedirComplementos(d, false);
      rutaActual.comp = Object.assign({}, rutaActual.comp, r.comp);
    } catch (e) { console.warn('No se pudieron generar finalidades con IA:', e); }
  }
  return construirHTMLPlanoRuta(d, rutaActual, rutaActual.comp || {});
}

// ── Autoverificación ──────────────────────────────────────
function rutaCtxVerif() {
  const ejes = (getEjesSeleccionados('d-ejes-grid') || '').split(/,\s*/).filter(Boolean);
  const perfil = (getPerfilSeleccionado('d-perfil-grid') || '').split(/\n\n+/).filter(Boolean);
  const dprob = rVal('d-prob').trim();
  return {
    ruta: rutaActual, prob: dprob || rVal('r-prob'), ejes, perfil,
    nContenidos: (typeof cD !== 'undefined' ? cD.length : 0),
    proy: rVal('d-proy'), prod: rVal('d-prod'), prop: rVal('d-prop'), inter: rVal('d-inter'),
    bap: rVal('r-bap'), espacios: rVal('r-espacios'), recursosPlantel: rVal('r-rec'),
    comp: rutaActual ? rutaActual.comp : null,
  };
}

function rutaIcono(e) { return e === 'ok' ? '<span class="v-ic v-ok">✓</span>' : e === 'parcial' ? '<span class="v-ic v-par">◐</span>' : '<span class="v-ic v-no">✗</span>'; }
function rutaItemsHTML(items) {
  return items.map(x => `<li>${rutaIcono(x.e)}<span>${escM(x.txt)}${x.donde ? `<em class="v-donde"> — se atiende en: ${escM(x.donde)}</em>` : ''}${x.ayuda && x.e !== 'ok' ? `<em class="v-ayuda"> ${escM(x.ayuda)}</em>` : ''}</span></li>`).join('');
}
function rutaGrupoHTML(titulo, grupo, abierto) {
  const rs = resumenVerif(grupo);
  const cuerpo = Array.isArray(grupo)
    ? `<ul class="v-lista">${rutaItemsHTML(grupo)}</ul>`
    : Object.entries(grupo).map(([k, arr]) => `<div class="v-sub">${escM(k)}</div><ul class="v-lista">${rutaItemsHTML(arr)}</ul>`).join('');
  return `<details class="v-det" ${abierto ? 'open' : ''}><summary><strong>${escM(titulo)}</strong><span class="v-cnt">${rs.ok} de ${rs.total} cumplidos${rs.par ? ` · ${rs.par} por mejorar` : ''}${rs.falta ? ` · ${rs.falta} faltan` : ''}</span></summary>${cuerpo}</details>`;
}
function renderVerif() {
  const cont = rEl('ruta-verif'); if (!cont || !rutaActual) return;
  const v = verificarIndicadores(rutaCtxVerif());
  cont.innerHTML =
    rutaGrupoHTML('Lista 1 · Tu Plano Didáctico: ¿trae todo lo que se revisa? (Factores 1 al 5)', v.pd, true) +
    rutaGrupoHTML('Lista 2 · Programa Analítico: ¿tu proyecto responde a lo que se analiza? (Planos 2 y 3)', v.pa, false) +
    rutaGrupoHTML('Lista 3 · Observación en clase: ¿tu planeación apoya lo que verá el observador? (Dimensiones 1 al 4)', v.obs, false);
}
function rutaProgramarVerif() {
  if (!rutaActual) return;
  clearTimeout(rutaDebounce);
  rutaDebounce = setTimeout(renderVerif, 250);
}

// ── Render principal ──────────────────────────────────────
function taRows(txt) { return Math.max(2, String(txt).split('\n').reduce((a, l) => a + Math.max(1, Math.ceil(l.length / 36)), 0)); }

function renderRuta() {
  const out = rEl('ruta-out'); if (!out || !rutaActual) return;
  const r = rutaActual, met = METODOLOGIAS[r.met];
  const allMoms = []; r.fases.forEach(f => f.mom.forEach(m => allMoms.push(m)));
  const totUnits = allMoms.reduce((a, m) => a + m.t.units, 0);
  const etiqueta = r.met === 'as' ? 'Etapa' : 'Fase';

  const chips = `<div class="r-chips">
    <span class="r-chip">🧭 ${escM(met.nombre)}</span>
    <span class="r-chip">📍 ${escM(RUTA_ESC_TXT[r.esc])}</span>
    <span class="r-chip">⏱ ${r.totalSes} sesiones · ${r.minSes} min · ${r.semanas} semanas</span>
  </div>`;

  const aviso = r.insuficiente ? `<div class="alerta alerta-err" style="display:block;">Con ${r.totalSes} sesiones algunos momentos quedan por debajo de media sesión. Para ${escM(met.siglas)} se recomiendan al menos ${r.minSesiones} sesiones: aumenta «Número de sesiones» arriba.</div>` : '';

  const sug = rutaSugerencias.map((s, i) => `
    <div class="r-sug ${i === rutaSelProy ? 'sel' : ''}" onclick="rutaElegirProyecto(${i})">
      <div class="r-sug-t">${escM(s.nombre)}</div>
      <div class="r-sug-m"><span class="r-tag">${escM(s.tipo)}</span> ${escM(s.tema)}</div>
      <div class="r-sug-p">Producto: ${escM(s.producto)}</div>
      <div class="r-sug-b">${i === rutaSelProy ? '✓ Elegido' : 'Elegir este proyecto'}</div>
    </div>`).join('');

  const barra = r.fases.map(f => {
    const u = f.mom.reduce((a, m) => a + m.t.units, 0);
    return `<div class="r-seg" style="flex:${u};background:${f.color};" title="${escM(f.n)}"><span>${escM(f.n.split(' · ')[0])}</span><small>${fmtSesiones(u)} ses.</small></div>`;
  }).join('');

  let fasesHTML = '';
  let fi = 0;
  r.fases.forEach(f => {
    const u = f.mom.reduce((a, m) => a + m.t.units, 0);
    let mi = 0;
    const moms = f.mom.map(m => {
      const idx = `data-f="${fi}" data-m="${mi}"`; mi++;
      const ta = (k, label, arr) => `<div><label class="r-lbl">${label}</label><textarea class="r-ta" ${idx} data-k="${k}" rows="${taRows(arr.join('\n'))}">${escM(arr.join('\n'))}</textarea></div>`;
      return `<div class="r-mom">
        <div class="r-mom-h"><strong>${escM(m.n)}</strong>
          <span class="r-tiempo">⏱ ${escM(tiempoTexto(m.t))}</span>
          ${m.retro ? '<span class="r-retro">💬 Retroalimentación</span>' : ''}</div>
        <div class="r-acc"><span class="r-lbl">Acciones (formato oficial)</span><ul>${m.acc.map(a => `<li>${escM(a)}</li>`).join('')}</ul></div>
        <div class="r-2c">${ta('doc', '👩‍🏫 Qué hace el docente', m.doc)}${ta('alu', '🧑‍🎓 Qué hacen los estudiantes', m.alu)}</div>
        <div class="r-2c">${ta('rec', '🧰 Recursos', m.rec)}
          <div class="r-meta"><div><b>Evidencia:</b> ${escM(m.evi)}</div><div><b>Organización:</b> ${escM(m.org)}</div><div><b>Evaluación:</b> ${escM(m.eva.tec)} · ${escM(m.eva.inst)} · ${escM(m.eva.mod)}</div></div></div>
      </div>`;
    }).join('');
    fasesHTML += `<div class="r-fase" style="border-left-color:${f.color};">
      <div class="r-fase-h" style="color:${f.color};"><strong>${escM(f.n)}</strong><span class="r-fase-t">${fmtSesiones(u)} ses.</span></div>
      <div class="r-fase-l">${escM(f.lema)}</div>${moms}</div>`;
    fi++;
  });

  const rutina = `<details class="v-det"><summary><strong>Rutina de cada sesión</strong><span class="v-cnt">lo que revisa el observador en clase</span></summary>
    <div class="r-rut">${RUTINA_SESION.map(b => `<div><b>${escM(b.t)}</b><ul>${b.items.map(x => `<li>${escM(x)}</li>`).join('')}</ul></div>`).join('')}</div></details>`;

  const sumProc = r.evalProceso.reduce((a, [, p]) => a + (Number(p) || 0), 0);
  const evalHTML = `<details class="v-det"><summary><strong>Evaluación formativa</strong><span class="v-cnt">proceso ${sumProc} % · producto ${100 - sumProc} %</span></summary>
    <p class="r-nota">Formato oficial: proceso 70 % y producto 30 %. Ajusta los porcentajes de las actividades evaluativas del proceso.</p>
    <div class="r-ev">${r.evalProceso.map(([n, p], i) => `<label>${escM(n)}<input type="number" min="0" max="100" value="${p}" data-ev="${i}"> %</label>`).join('')}</div>
    <p class="r-nota" id="r-ev-aviso" style="color:${sumProc === 70 ? 'var(--verde)' : '#b45309'};">${sumProc === 70 ? '✓ El proceso suma 70 %.' : '⚠ El proceso suma ' + sumProc + ' % (el formato oficial usa 70 %); el producto queda en ' + (100 - sumProc) + ' %.'}</p></details>`;

  const nota = met.nota ? `<div class="r-nota-box">🔧 ${escM(met.nota)}</div>` : '';

  out.innerHTML = `
    <div class="alerta alerta-err" id="ruta-desact" style="display:none;background:#fffbeb;border-color:#fde68a;color:#92400e;">Cambiaste la metodología o la problemática. Pulsa «Armar mi proyecto» para actualizar las actividades (tus ediciones actuales se perderían).</div>
    ${chips}${aviso}
    <h4 class="r-h">1 · Proyectos que podrías hacer con tu problemática</h4>
    <p class="r-nota">Son sugerencias para empezar: elige una y adáptala. También puedes escribir tu propio nombre de proyecto más abajo, en «Nombre del proyecto».</p>
    <div class="r-sugs">${sug}</div>
    <h4 class="r-h">2 · Fases y actividades de tu proyecto (${r.totalSes} sesiones)</h4>
    <div class="r-barra">${barra}</div>
    <p class="r-nota">${escM(met.resumen)} Puedes editar las actividades y los recursos; los tiempos se recalculan solos si cambias las sesiones.</p>
    ${nota}${fasesHTML}
    <h4 class="r-h">3 · Rutina de cada sesión y evaluación</h4>
    ${rutina}${evalHTML}
    <h4 class="r-h">4 · Revisa si tu proyecto cumple lo que piden los supervisores</h4>
    <p class="r-nota">Son 3 listas de revisión con los criterios oficiales. Ábrelas para ver qué te falta. ✓ cumplido · ◐ por mejorar · ✗ falta. Se actualizan solas mientras llenas el formulario. Es solo una guía de apoyo: no sustituye la revisión del supervisor.</p>
    <div id="ruta-verif"></div>
    <div class="r-acciones">
      <button class="btn-gen" onclick="rutaUsar()">✅ Pasar este proyecto al Plano Didáctico</button>
      <button class="btn-sec" id="btn-ruta-ia" onclick="rutaPersonalizarIA()">✨ Mejorar las actividades con IA</button>
    </div>
    <p class="r-nota"><b>Pasar este proyecto al Plano Didáctico:</b> copia al formulario de arriba el nombre, la problemática, el producto, el propósito y los ejes (no gasta IA). <b>Mejorar las actividades con IA:</b> la IA reescribe las actividades para que hablen de tu grupo y tu problemática (gasta 1 uso de tu cuota; tarda 20–60 segundos).</p>
    <p class="r-nota" id="ruta-ia-st"></p>
    <div class="alerta" id="ruta-usada" style="display:${r.usar ? 'block' : 'none'};background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;">✓ Ruta lista. Se cargaron el nombre, la problemática, el producto, el propósito y los ejes. Completa contenidos y perfil de egreso y pulsa <strong>Generar Plano Didáctico</strong> (el documento final, abajo): saldrá en el formato oficial con estas fases y tiempos.</div>`;
  renderVerif();
}

// ── Eventos ───────────────────────────────────────────────
function rutaInit() {
  const out = rEl('ruta-out');
  if (!out || out.dataset.ready) return;
  out.dataset.ready = '1';
  out.addEventListener('input', e => {
    const t = e.target;
    if (t.classList && t.classList.contains('r-ta') && rutaActual) {
      const m = rutaActual.fases[+t.dataset.f].mom[+t.dataset.m];
      m[t.dataset.k] = t.value.split('\n').map(x => x.trim()).filter(Boolean);
      rutaActual.editada = true;
      t.rows = taRows(t.value);
    } else if (t.dataset && t.dataset.ev !== undefined && rutaActual) {
      rutaActual.evalProceso[+t.dataset.ev][1] = Math.max(0, Math.min(100, parseInt(t.value, 10) || 0));
      const s = rutaActual.evalProceso.reduce((a, [, p]) => a + p, 0);
      const av = rEl('r-ev-aviso');
      if (av) { av.style.color = s === 70 ? 'var(--verde)' : '#b45309'; av.textContent = s === 70 ? '✓ El proceso suma 70 %.' : `⚠ El proceso suma ${s} % (el formato oficial usa 70 %); el producto queda en ${100 - s} %.`; }
    }
  });
  ['r-prob', 'r-esc'].forEach(id => { const e = rEl(id); if (e) e.addEventListener('input', rutaMarcarDesactualizada); });
  ['r-bap', 'r-rec', 'r-espacios'].forEach(id => { const e = rEl(id); if (e) e.addEventListener('input', () => { rutaSincronizarCampos(); rutaProgramarVerif(); }); });
  ['r-sps', 'd-ses', 'd-dur'].forEach(id => { const e = rEl(id); if (e) e.addEventListener('change', rutaTiemposCambio); });
  const cam = rEl('d-cam'); if (cam) cam.addEventListener('change', rutaCampoCambio);
  // Actualiza la verificación cuando cambia cualquier dato del Plano (campos, ejes, perfil, contenidos)
  const sec = rEl('sec-d');
  if (sec) ['input', 'change', 'click'].forEach(ev => sec.addEventListener(ev, rutaProgramarVerif));
  rutaActualizarReferencia();
  rutaActualizarAyudaMet();
}
document.addEventListener('DOMContentLoaded', rutaInit);


// ============================================================
// SUGERENCIAS «(sugerido)» de nombre de proyecto y producto
// El docente siempre puede cambiarlos: al escribir, la marca desaparece.
// ============================================================
const SUG_IDS = ['d-proy', 'd-prod', 'a-pn1', 'a-pn2', 'a-pn3', 'a-pr1', 'a-pr2', 'a-pr3'];

function sugMarcar(id, sugerido) {
  const e = rEl(id); if (!e) return;
  e.dataset.sug = sugerido ? '1' : '';
  let t = rEl(id + '-sugtag');
  if (!t) {
    const campo = e.closest('.campo'), lab = campo && campo.querySelector('label');
    if (!lab) return;
    t = document.createElement('span'); t.id = id + '-sugtag'; t.className = 'sug-tag'; t.textContent = ' (sugerido)';
    lab.appendChild(t);
  }
  t.style.display = sugerido ? 'inline' : 'none';
}
// Pone un valor sugerido solo si el campo está vacío o todavía tiene una sugerencia anterior
function sugPoner(id, valor) {
  const e = rEl(id); if (!e || !valor) return false;
  if (e.value.trim() && e.dataset.sug !== '1') return false;
  e.value = valor; sugMarcar(id, true); return true;
}
document.addEventListener('input', ev => { if (ev.target && SUG_IDS.includes(ev.target.id)) sugMarcar(ev.target.id, false); });

// Modalidad (texto del menú) → metodología y escenario
function modalidadAMetodologia(txt) {
  const t = String(txt || '').toLowerCase();
  if (/steam|indagaci/.test(t)) return { met: 'steam', esc: 'aula' };
  if (/problemas|abp/.test(t)) return { met: 'abp', esc: 'aula' };
  if (/servicio/.test(t)) return { met: 'as', esc: 'comunidad' };
  if (/escolar/.test(t)) return { met: 'abpc', esc: 'escuela' };
  if (/aula|secuencia/.test(t)) return { met: 'abpc', esc: 'aula' };
  return { met: 'abpc', esc: 'comunidad' };
}

// Programa Analítico: sugiere nombre y producto de cada trimestre según la problemática y la modalidad
const aSugIdx = { 1: 0, 2: 1, 3: 2 };
let aSugTimer = null;
function aSugerirProyecto(t, otro) {
  const prob = rVal('ctx-7').trim();
  if (prob.length < 5) { if (otro) alert('Primero escribe la problemática detectada (apartado 7 del contexto), para sugerirte un proyecto que se relacione con ella.'); return; }
  if (otro) aSugIdx[t] = (aSugIdx[t] || 0) + 1;
  const m = modalidadAMetodologia(rVal('a-pm' + t));
  const lista = sugerirProyectos(m.met, prob, m.esc);
  if (!lista.length) return;
  const s = lista[(aSugIdx[t] || 0) % lista.length];
  const idN = 'a-pn' + t, idP = 'a-pr' + t;
  if (otro) {   // el botón es una petición explícita: reemplaza lo sugerido; si el docente ya escribió algo propio, pregunta
    const e = rEl(idN), propio = e && e.value.trim() && e.dataset.sug !== '1';
    if (propio && !confirm('Ya escribiste un nombre de proyecto. ¿Quieres reemplazarlo por esta sugerencia?')) return;
    [[idN, s.nombre], [idP, s.producto]].forEach(([id, v]) => { const x = rEl(id); if (x) { x.value = v; sugMarcar(id, true); } });
  } else { sugPoner(idN, s.nombre); sugPoner(idP, s.producto); }
}
function aSugerirTodos() { [1, 2, 3].forEach(t => aSugerirProyecto(t)); }
document.addEventListener('DOMContentLoaded', () => {
  const p = rEl('ctx-7');
  if (p) p.addEventListener('input', () => { clearTimeout(aSugTimer); aSugTimer = setTimeout(aSugerirTodos, 900); });
});
