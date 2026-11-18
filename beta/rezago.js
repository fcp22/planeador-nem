// ============================================================
// SEGUIMIENTO DE REZAGO — semáforo por alumno, con reportes
// para Dirección y para madres, padres o tutores (Word).
// Usa los datos de Pase de lista y Calificaciones (gestion.js).
// Todo se calcula en el dispositivo: no necesita internet ni IA.
// ============================================================

const REZ = { trim: null, sel: null, incRiesgo: false };
const REZ_UMBRALES_DEF = { rezago: 6, riesgo: 7, asistRezago: 70, asistRiesgo: 80, pendRiesgo: 2 };
const REZ_NIVELES = {
  rezago: { nom: 'En rezago', fondo: '#fee2e2', borde: '#fca5a5', color: '#b91c1c', orden: 0 },
  riesgo: { nom: 'En riesgo', fondo: '#fef3c7', borde: '#fcd34d', color: '#b45309', orden: 1 },
  ok: { nom: 'Sin riesgo', fondo: '#dcfce7', borde: '#86efac', color: '#15803d', orden: 2 },
  sin: { nom: 'Sin datos', fondo: '#f1f5f9', borde: '#cbd5e1', color: '#64748b', orden: 3 },
};

function rezUmbrales(g) { return Object.assign({}, REZ_UMBRALES_DEF, g.umbrales || {}); }
function rezPeor(a, b) { return REZ_NIVELES[a].orden <= REZ_NIVELES[b].orden ? a : b; }
function rezIniciales(n) { const p = String(n).trim().split(/\s+/); return ((p[0] || '')[0] || '') + ((p[1] || '')[0] || ''); }

// Calcula el estado de cada alumno en un trimestre
function rezAnalizar(g, t) {
  const um = rezUmbrales(g);
  const rs = gResumenAsistencia(g, String(t));
  const acts = gActsTrim(g, t).filter(a => g.alumnos.some(al => a.notas[al.id] != null));   // solo las ya calificadas
  const filas = g.alumnos.map((al, i) => {
    const calc = gCalcAlumno(g, al.id, t), prom = calc.final;
    const asi = rs.filas[i], pct = asi.pct;
    const pend = acts.filter(a => a.notas[al.id] == null).map(a => a.nombre);
    let nivel = 'ok'; const causas = [];
    if (prom == null && pct == null) nivel = 'sin';
    if (prom != null) {
      if (prom < um.rezago) { nivel = rezPeor(nivel, 'rezago'); causas.push(`Su promedio (${gFmt(prom)}) es menor a ${um.rezago}.`); }
      else if (prom < um.riesgo) { nivel = rezPeor(nivel, 'riesgo'); causas.push(`Su promedio (${gFmt(prom)}) es menor a ${um.riesgo}.`); }
    }
    if (pct != null) {
      if (pct < um.asistRezago) { nivel = rezPeor(nivel, 'rezago'); causas.push(`Su asistencia (${pct} %) es menor a ${um.asistRezago} %.`); }
      else if (pct < um.asistRiesgo) { nivel = rezPeor(nivel, 'riesgo'); causas.push(`Su asistencia (${pct} %) es menor a ${um.asistRiesgo} %.`); }
    }
    if (pend.length) {
      if (pend.length >= um.pendRiesgo) nivel = rezPeor(nivel, 'riesgo');
      causas.push(`Tiene ${pend.length} actividad(es) sin calificación.`);
    }
    return { al, prom, calc, pct, c: asi.c, dias: rs.dias.length, pend, nivel, causas };
  });
  filas.sort((x, y) => REZ_NIVELES[x.nivel].orden - REZ_NIVELES[y.nivel].orden || (x.prom == null) - (y.prom == null) || (x.prom || 0) - (y.prom || 0) || x.al.nombre.localeCompare(y.al.nombre, 'es'));
  return { filas, um, dias: rs.dias.length };
}

// Sugerencias de apoyo según las causas (para que el docente decida)
function rezEstrategias(f) {
  const out = [];
  const um = f.um;
  const bajoProm = f.prom != null && f.prom < um.riesgo;
  const bajaAsis = f.pct != null && f.pct < um.asistRiesgo;
  if (bajoProm) out.push('Dar retroalimentación individual y breve sobre los criterios en los que tiene menor calificación.', 'Asignar un compañero de apoyo (trabajo entre pares) para la siguiente actividad.', 'Ofrecer una oportunidad de recuperación con ejercicios guiados del tema donde tuvo dificultad.');
  if (bajaAsis) out.push('Conversar con el alumno para conocer el motivo de sus faltas.', 'Citar a la madre, padre o tutor y acordar compromisos por escrito.', 'Entregarle un resumen de lo trabajado en las clases a las que faltó.');
  if (f.pend.length) out.push('Acordar una fecha límite para entregar lo pendiente, o permitir un formato alternativo más corto.');
  if (!out.length && f.nivel === 'ok') out.push('Mantener su ritmo de trabajo e invitarle a apoyar a otros compañeros.');
  if (f.nivel === 'sin') out.push('Registra el pase de lista y las calificaciones para activar el seguimiento de este alumno.');
  return out;
}

// ── Pantalla ──────────────────────────────────────────────
function rezTrim(v) { REZ.trim = +v; REZ.sel = null; gRenderRezago(); }
function rezSel(id) { REZ.sel = REZ.sel === id ? null : id; gRenderRezago(); }
function rezUmbral(k, v) {
  const g = gGrupo(); const n = gNum(v); if (n == null) return;
  g.umbrales = Object.assign({}, g.umbrales || {}); g.umbrales[k] = Math.max(0, n); gGuardar(); gRenderRezago();
}
function rezRestablecer() { const g = gGrupo(); delete g.umbrales; gGuardar(); gRenderRezago(); }

function gRenderRezago() {
  const g = gGrupo();
  if (!g) return gSinGrupo('Seguimiento de rezago', 'Detecta a tiempo a los alumnos que necesitan apoyo');
  if (!REZ.trim) REZ.trim = gTrimDeFecha(G.fecha || gHoy());
  const t = REZ.trim, A = rezAnalizar(g, t), um = A.um;
  const cuenta = n => A.filas.filter(f => f.nivel === n).length;
  const chip = n => { const v = REZ_NIVELES[n]; return `<span class="rez-chip" style="background:${v.fondo};border-color:${v.borde};color:${v.color}"><b>${cuenta(n)}</b> ${v.nom.toLowerCase()}</span>`; };
  let h = `<div class="sec-title">Seguimiento de rezago</div><div class="sec-sub">El semáforo se calcula solo con tu pase de lista y tus calificaciones.</div>${gBarra()}
  <div class="g-trims">${[1, 2, 3].map(x => `<button class="ttab${t === x ? ' on' : ''}" onclick="rezTrim(${x})">${G_TRIM_NOM[x]}</button>`).join('')}</div>`;
  if (!g.alumnos.length) return void (gPanel().innerHTML = h + gVacio('Este grupo aún no tiene alumnos.'));
  h += `<div class="rez-chips">${chip('rezago')}${chip('riesgo')}${chip('ok')}${cuenta('sin') ? chip('sin') : ''}</div>`;
  h += `<div class="card"><div class="card-title">📄 Reportes</div>
    <button class="g-btn" onclick="rezReporteDireccion()">⬇ Reporte para Dirección (Word)</button>
    <div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-top:6px">Informe formal con las cifras del grupo y los alumnos que requieren atención. El reporte de cada alumno para su familia está dentro de su ficha.</div>
    <details class="g-det" style="padding:10px 0 0"><summary style="font-size:13px">⚙️ Ajustar cómo se calcula el semáforo</summary>
      <div class="rez-um">
        <label>En rezago si el promedio es menor a <input type="number" step="0.1" min="0" max="10" value="${um.rezago}" onchange="rezUmbral('rezago',this.value)"></label>
        <label>En riesgo si el promedio es menor a <input type="number" step="0.1" min="0" max="10" value="${um.riesgo}" onchange="rezUmbral('riesgo',this.value)"></label>
        <label>En rezago si la asistencia es menor a <input type="number" step="1" min="0" max="100" value="${um.asistRezago}" onchange="rezUmbral('asistRezago',this.value)"> %</label>
        <label>En riesgo si la asistencia es menor a <input type="number" step="1" min="0" max="100" value="${um.asistRiesgo}" onchange="rezUmbral('asistRiesgo',this.value)"> %</label>
        <label>En riesgo si le faltan <input type="number" step="1" min="1" max="20" value="${um.pendRiesgo}" onchange="rezUmbral('pendRiesgo',this.value)"> actividades o más</label>
        <button class="g-btn g-btn-s" onclick="rezRestablecer()">Restablecer</button>
      </div></details></div>`;
  h += rezEnvioCard(A);
  h += `<div class="card"><div class="card-title">👥 Alumnos · ${G_TRIM_NOM[t]}</div>`;
  if (!A.dias && A.filas.every(f => f.prom == null)) h += `<p style="color:var(--gris)">Todavía no hay pase de lista ni calificaciones en este trimestre. Cuando los captures, aquí aparece el semáforo de cada alumno.</p>`;
  h += `<div class="rez-lista">` + A.filas.map(f => {
    const v = REZ_NIVELES[f.nivel], abierto = REZ.sel === f.al.id;
    let fila = `<button class="rez-fila" style="background:${v.fondo};border-color:${v.borde}" onclick="rezSel('${f.al.id}')" aria-expanded="${abierto}">
      <span class="rez-ini" style="color:${v.color}">${gEsc(rezIniciales(f.al.nombre))}</span>
      <span class="rez-dat"><b>${gEsc(f.al.nombre)}</b><small>Promedio: ${f.prom == null ? '—' : gFmt(f.prom)} · Asistencia: ${f.pct == null ? '—' : f.pct + ' %'}</small></span>
      <span class="rez-est" style="color:${v.color}">${v.nom}</span><span class="rez-fl">${abierto ? '⌃' : '›'}</span></button>`;
    if (abierto) fila += rezFicha(g, f, t);
    return fila;
  }).join('') + `</div></div>`;
  gPanel().innerHTML = h;
}

function rezFicha(g, f, t) {
  f.um = rezUmbrales(g);
  const crit = g.criterios.map(c => `<tr><td>${gEsc(c.nombre)} <span style="color:var(--gris)">(${gPct(g, c.id, t)} %)</span></td><td style="text-align:right"><b>${f.calc.porCrit[c.id] == null ? '—' : gFmt(f.calc.porCrit[c.id])}</b></td></tr>`).join('');
  const est = rezEstrategias(f);
  return `<div class="rez-ficha">
    ${f.causas.length ? `<div class="rez-bloque"><b>Por qué aparece así</b><ul>${f.causas.map(c => `<li>${gEsc(c)}</li>`).join('')}</ul></div>` : ''}
    <div class="rez-bloque"><b>Asistencia</b> <span style="color:var(--gris)">(${f.dias} día(s) con lista)</span><br>${f.c.P} asistencias · ${f.c.R} retardos · ${f.c.F} faltas · ${f.c.J} justificadas</div>
    <div class="rez-bloque"><b>Calificación por criterio</b><table class="g-tabla" style="margin-top:6px"><tbody>${crit}</tbody></table></div>
    ${f.pend.length ? `<div class="rez-bloque"><b>Actividades sin calificación</b><ul>${f.pend.map(p => `<li>${gEsc(p)}</li>`).join('')}</ul></div>` : ''}
    <div class="rez-bloque"><b>Sugerencias de apoyo</b> <span style="color:var(--gris);font-size:11.5px">(son ideas: tú decides cuáles aplicar)</span><ul>${est.map(e => `<li>${gEsc(e)}</li>`).join('')}</ul></div>
    <button class="g-btn" onclick="rezReportePadres('${f.al.id}')">⬇ Reporte para la familia (Word)</button></div>`;
}

// ── Reportes en Word ──────────────────────────────────────
function rezSlug(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, ''); }
const rezTh = t => `<td style="border:1px solid #000;padding:4px;background:#BDD7EE;font-weight:bold">${t}</td>`;
const rezTd = (t, x) => `<td style="border:1px solid #000;padding:4px;${x || ''}">${t}</td>`;
const rezColorNivel = n => ({ rezago: 'background:#F8CBAD', riesgo: 'background:#FFE699', ok: 'background:#C6E0B4', sin: '' }[n] || '');

function rezReporteDireccion() {
  const g = gGrupo(), t = REZ.trim, A = rezAnalizar(g, t);
  const proms = A.filas.map(f => f.prom).filter(x => x != null), pcts = A.filas.map(f => f.pct).filter(x => x != null);
  const med = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  const cuenta = n => A.filas.filter(f => f.nivel === n).length;
  const atencion = A.filas.filter(f => f.nivel === 'rezago' || f.nivel === 'riesgo');
  const html = gEncabezadoDoc('REPORTE DE SEGUIMIENTO PARA DIRECCIÓN', g, `<b>Periodo:</b> ${G_TRIM_NOM[t]}`) +
    `<p><b>Fecha:</b> ${gFechaBonita(gHoy())}</p>
    <p><b>Alumnos en el grupo:</b> ${g.alumnos.length} &nbsp; <b>Promedio del grupo:</b> ${med(proms) == null ? '—' : gFmt(med(proms))} &nbsp; <b>Asistencia promedio:</b> ${med(pcts) == null ? '—' : Math.round(med(pcts)) + ' %'} &nbsp; <b>Días con lista:</b> ${A.dias}</p>
    <p><b>Situación del grupo:</b> ${cuenta('ok')} sin riesgo · ${cuenta('riesgo')} en riesgo · ${cuenta('rezago')} en rezago${cuenta('sin') ? ' · ' + cuenta('sin') + ' sin datos' : ''}.</p>
    <table style="width:100%;border-collapse:collapse"><tr>${['#', 'Alumno', 'Promedio', '% asistencia', 'Faltas', 'Actividades sin calificar', 'Situación'].map(rezTh).join('')}</tr>` +
    A.filas.slice().sort((x, y) => x.al.nombre.localeCompare(y.al.nombre, 'es')).map((f, i) => `<tr>${[i + 1, gEsc(f.al.nombre), f.prom == null ? '—' : gFmt(f.prom), f.pct == null ? '—' : f.pct + ' %', f.c.F, f.pend.length].map(x => rezTd(x)).join('')}${rezTd(REZ_NIVELES[f.nivel].nom, rezColorNivel(f.nivel))}</tr>`).join('') + '</table>' +
    `<p><b>Alumnos que requieren atención</b></p>` +
    (atencion.length ? '<ul>' + atencion.map(f => `<li><b>${gEsc(f.al.nombre)}</b> (${REZ_NIVELES[f.nivel].nom.toLowerCase()}): ${gEsc(f.causas.join(' '))}</li>`).join('') + '</ul>' : '<p>Ningún alumno en riesgo o rezago en este periodo.</p>') +
    `<p><b>Acciones realizadas o previstas:</b></p><p>______________________________________________________________________________</p><p>______________________________________________________________________________</p><p>______________________________________________________________________________</p>
    <p style="margin-top:30px;text-align:center">______________________________<br>${gEsc(gDocente())}<br>Docente</p>`;
  descargarWord(html, `Reporte_Direccion_${rezSlug(g.nombre)}_${rezSlug(G_TRIM_NOM[t])}.doc`);
}

function rezReportePadres(aid) {
  const g = gGrupo(), t = REZ.trim, A = rezAnalizar(g, t), f = A.filas.find(x => x.al.id === aid); if (!f) return;
  f.um = A.um; const est = rezEstrategias(f);
  const crit = g.criterios.map(c => `<tr>${rezTd(gEsc(c.nombre) + ' (' + gPct(g, c.id, t) + ' %)')}${rezTd(f.calc.porCrit[c.id] == null ? '—' : gFmt(f.calc.porCrit[c.id]), 'text-align:center')}</tr>`).join('');
  const html = gEncabezadoDoc('INFORME PARA MADRE, PADRE O TUTOR', g, `<b>Periodo:</b> ${G_TRIM_NOM[t]}`) +
    `<p><b>Alumno(a):</b> ${gEsc(f.al.nombre)} &nbsp; <b>Fecha:</b> ${gFechaBonita(gHoy())}</p>
    <p>Estimada familia: le compartimos cómo va su hijo(a) en la materia de ${gEsc(g.materia)} para que juntos podamos apoyarle.</p>
    <p><b>Situación actual:</b> ${REZ_NIVELES[f.nivel].nom}. <b>Promedio del periodo:</b> ${f.prom == null ? 'aún sin calificaciones' : gFmt(f.prom)}.</p>
    <p><b>Asistencia:</b> ${f.pct == null ? 'sin lista registrada' : f.pct + ' %'} (${f.c.P} asistencias, ${f.c.R} retardos, ${f.c.F} faltas, ${f.c.J} justificadas en ${f.dias} día(s) con lista).</p>
    <table style="width:60%;border-collapse:collapse"><tr>${rezTh('Criterio')}${rezTh('Calificación')}</tr>${crit}</table>` +
    (f.pend.length ? `<p><b>Actividades pendientes:</b></p><ul>${f.pend.map(p => `<li>${gEsc(p)}</li>`).join('')}</ul>` : '') +
    `<p><b>Cómo podemos apoyarle:</b></p><ul>${est.map(e => `<li>${gEsc(e)}</li>`).join('')}</ul>
    <p><b>Compromisos acordados con la familia:</b></p><p>______________________________________________________________________________</p><p>______________________________________________________________________________</p>
    <p style="margin-top:30px">______________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ______________________________<br>${gEsc(gDocente())} (Docente) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Madre, padre o tutor</p>`;
  descargarWord(html, `Informe_familia_${rezSlug(f.al.nombre)}_${rezSlug(G_TRIM_NOM[t])}.doc`);
}


// ── Enviar a Dirección: los alumnos en rezago (y, si se quiere, en riesgo) ──
function rezEnvioFilas() {
  const g = gGrupo(), A = rezAnalizar(g, REZ.trim);
  return A.filas.filter(f => f.nivel === 'rezago' || (REZ.incRiesgo && f.nivel === 'riesgo'));
}
function rezEnvioCard(A) {
  const p = gPerfil(), filas = rezEnvioFilas(), t = REZ.trim;
  const tel = rezTelDireccion(), hayContacto = tel || p.dirCorreo;
  let h = `<div class="card"><div class="card-title">📤 Enviar a Dirección</div>
    <div class="ayuda" style="font-size:12px;color:var(--gris);margin-bottom:8px">Los alumnos que necesitan apoyo en ${G_TRIM_NOM[t]}, con su promedio, asistencia y el motivo. Revisa la lista antes de enviarla.</div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13px;margin:0 0 10px"><input type="checkbox"${REZ.incRiesgo ? ' checked' : ''} onchange="REZ.incRiesgo=this.checked;gRenderRezago()"> Incluir también a los alumnos <b>en riesgo</b></label>`;
  if (!filas.length) return h + `<p style="color:#16a34a;font-weight:600;margin:0">✓ No hay alumnos ${REZ.incRiesgo ? 'en rezago ni en riesgo' : 'en rezago'} en este periodo.</p></div>`;
  h += `<div class="rez-envio" style="border:1px solid var(--borde);border-radius:10px;padding:8px 12px;margin-bottom:10px;font-size:13px;max-height:190px;overflow:auto">` +
    filas.map(f => `<div style="display:flex;justify-content:space-between;gap:8px;padding:3px 0;border-bottom:1px solid #f1f5f9"><span>${gEsc(f.al.nombre)}</span><span style="color:${REZ_NIVELES[f.nivel].color};white-space:nowrap"><b>${f.prom == null ? '—' : gFmt(f.prom)}</b> · ${f.pct == null ? '—' : f.pct + ' %'}</span></div>`).join('') + `</div>
    <div style="margin-bottom:6px"><b>${filas.length}</b> alumno(s) en la lista${p.director ? ' · para ' + gEsc(p.director) : ''}.</div>
    <button class="g-btn" onclick="rezEnviar()">📤 Enviar…</button>
    <button class="g-btn g-btn-s" onclick="rezEnvioWA()">💬 WhatsApp</button>
    <button class="g-btn g-btn-s" onclick="rezEnvioCorreo()">✉️ Correo</button>
    <button class="g-btn g-btn-s" onclick="rezEnvioPDF()">🖨️ PDF</button>
    <button class="g-btn g-btn-s" onclick="rezEnvioWord()">⬇ Word</button>
    <button class="g-btn g-btn-s" onclick="rezEnvioCopiar()">📋 Copiar</button>
    <div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-top:8px">El mensaje lleva la lista en texto. Si quieres entregar el documento formal, descárgalo en PDF o Word y adjúntalo en WhatsApp o en el correo.${hayContacto ? '' : ' Guarda el WhatsApp o el correo de Dirección en «Mis grupos → Mi escuela» para que se llene solo.'}</div></div>`;
  return h;
}
function rezTelDireccion() { const d = String(gPerfil().dirWa || '').replace(/\D/g, ''); return d.length === 10 ? '52' + d : d.length >= 11 ? d : ''; }
function rezEnvioTexto(corto) {
  const g = gGrupo(), t = REZ.trim, filas = rezEnvioFilas(), p = gPerfil();
  const lin = filas.map((f, i) => `${i + 1}. ${f.al.nombre} (${f.nivel === 'rezago' ? 'rezago' : 'riesgo'}) — promedio ${f.prom == null ? 's/d' : gFmt(f.prom)}, asistencia ${f.pct == null ? 's/d' : f.pct + ' %'}${f.pend.length ? ', ' + f.pend.length + ' act. pendiente(s)' : ''}`);
  let txt = `${p.director ? 'Estimado(a) ' + p.director + ':\n\n' : ''}Seguimiento de alumnos que requieren apoyo\n${gEscuela() || ''}\nGrupo ${g.nombre} · ${g.materia} · ${G_TRIM_NOM[t]}\nDocente: ${gDocente()}\n\n${REZ.incRiesgo ? 'En rezago y en riesgo' : 'En rezago'} (${filas.length}):\n${lin.join('\n')}\n\nLe comparto la información para su conocimiento y seguimiento. Quedo atento(a) a sus indicaciones.`;
  if (corto && txt.length > corto) txt = txt.slice(0, corto - 90).replace(/\n[^\n]*$/, '') + '\n(…) La lista completa va en el documento adjunto.';
  return txt;
}
function rezEnvioHTML() {
  const g = gGrupo(), t = REZ.trim, filas = rezEnvioFilas(), p = gPerfil();
  return gEncabezadoDoc('ALUMNOS QUE REQUIEREN APOYO — REPORTE PARA DIRECCIÓN', g, `<b>Periodo:</b> ${G_TRIM_NOM[t]}`) +
    `<p><b>Fecha:</b> ${gFechaBonita(gHoy())}${p.director ? ' &nbsp; <b>Dirigido a:</b> ' + gEsc(p.director) : ''}</p>
    <p><b>Alumnos incluidos:</b> ${filas.length} (${REZ.incRiesgo ? 'en rezago y en riesgo' : 'en rezago'}) de ${g.alumnos.length} en el grupo.</p>
    <table style="width:100%;border-collapse:collapse"><tr>${['#', 'Alumno', 'Promedio', '% asistencia', 'Faltas', 'Act. sin calificar', 'Situación', 'Motivo'].map(rezTh).join('')}</tr>` +
    filas.map((f, i) => `<tr>${[i + 1, gEsc(f.al.nombre), f.prom == null ? '—' : gFmt(f.prom), f.pct == null ? '—' : f.pct + ' %', f.c.F, f.pend.length].map(x => rezTd(x)).join('')}${rezTd(REZ_NIVELES[f.nivel].nom, rezColorNivel(f.nivel))}${rezTd(gEsc(f.causas.join(' ')), 'font-size:9pt')}</tr>`).join('') + '</table>' +
    `<p><b>Acciones realizadas o previstas:</b></p><p>______________________________________________________________________________</p><p>______________________________________________________________________________</p><p>______________________________________________________________________________</p>
    <table style="width:100%;margin-top:34px"><tr><td style="text-align:center;width:50%">______________________________<br>${gEsc(gDocente())}<br>Docente</td><td style="text-align:center">______________________________<br>${gEsc(p.director || 'Director(a)')}<br>Recibido por Dirección &nbsp; Fecha: ___________</td></tr></table>`;
}
async function rezEnviar() {
  const txt = rezEnvioTexto();
  if (navigator.share) { try { await navigator.share({ title: 'Alumnos que requieren apoyo', text: txt }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  rezEnvioCopiar();
}
function rezEnvioWA() { const tel = rezTelDireccion(); window.open('https://wa.me/' + tel + '?text=' + encodeURIComponent(rezEnvioTexto(3500)), '_blank'); }
function rezEnvioCorreo() { location.href = 'mailto:' + encodeURIComponent(gPerfil().dirCorreo || '').replace('%40', '@') + '?subject=' + encodeURIComponent('Alumnos que requieren apoyo — ' + gGrupo().nombre + ' · ' + G_TRIM_NOM[REZ.trim]) + '&body=' + encodeURIComponent(rezEnvioTexto(1800)); }
function rezEnvioCopiar() {
  const txt = rezEnvioTexto(), ok = () => gAviso('Copiado. Pégalo en WhatsApp o en un correo.');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, () => gAviso('No se pudo copiar el texto.')); else gAviso('Tu navegador no permite copiar.');
}
function rezEnvioPDF() { if (typeof bitVentana === 'function') bitVentana('Alumnos que requieren apoyo', rezEnvioHTML()); }
function rezEnvioWord() { const g = gGrupo(); descargarWord(rezEnvioHTML(), `Alumnos_apoyo_Direccion_${rezSlug(g.nombre)}_${rezSlug(G_TRIM_NOM[REZ.trim])}.doc`); }
