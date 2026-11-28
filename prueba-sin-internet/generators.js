// ============================================================
// GENERADORES DE PROMPTS — PLANEADOR NEM
// Estrategia: IA devuelve JSON con contenido, JS arma las tablas
// Esto mantiene el prompt corto (< 5000 tokens)
// ============================================================

// ── IA ────────────────────────────────────────────────────
// Todas las llamadas pasan por el servidor de IA con licencia (licencia.js → llamarIA).
// La llave del proveedor vive en el servidor, nunca en esta página.
async function llamarGeminiJSON(prompt, tipo) { return llamarIA(prompt, { json: true, tipo }); }
async function llamarGemini(prompt, tipo) { return llamarIA(prompt, { json: false, tipo }); }

// ============================================================
// HELPER — CONVIERTE TEXTO IA EN JSON SEGURO
// ============================================================
function parsearJSON(texto) {
  let limpio = texto.replace(/```json/g,'').replace(/```/g,'').trim();
  // Extraer solo el bloque JSON si hay texto extra
  const inicio = limpio.indexOf('{');
  const fin = limpio.lastIndexOf('}');
  if (inicio !== -1 && fin !== -1) {
    limpio = limpio.substring(inicio, fin + 1);
  }
  return JSON.parse(limpio);
}

// ============================================================
// CONSTRUCTOR HTML — PROGRAMA ANALÍTICO
// Recibe datos del docente + JSON generado por IA
// Arma las tablas sin depender de la IA para el HTML
// ============================================================
// Proyectos y secuencias didácticas de un trimestre. El Programa Analítico es un panorama general del año:
// cada trimestre puede combinar varios (p. ej. un proyecto y dos secuencias). Compatible con documentos guardados
// antes de que existiera la lista (solo traían una modalidad, un nombre y un propósito).
function actividadesDe(tData) {
  tData = tData || {};
  if (Array.isArray(tData.actividades) && tData.actividades.length) return tData.actividades;
  return [{ modalidad: tData.modalidad, nombre: tData.nombreProyecto, duracion: '', proposito: tData.proposito, productos: tData.productos }];
}
const esSecuenciaAct = a => /secuencia/i.test((a && a.modalidad) || '');
function modalidadesDelAnio(d) {
  return [...new Set([d.t1, d.t2, d.t3].flatMap(t => actividadesDe(t).map(a => a && a.modalidad)).filter(Boolean))];
}

function construirHTMLAnalitico(d, ia) {
  const C = '#BDD7EE';
  const th = (txt, w) => `<td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};${w?'width:'+w+';':''}vertical-align:top;">${txt}</td>`;
  const td = (txt, w) => `<td style="border:1px solid #000;padding:5px 8px;vertical-align:top;${w?'width:'+w+';':''}">${txt||''}</td>`;
  const tr = (...celdas) => `<tr>${celdas.join('')}</tr>`;
  const tabla = (filas, extra) => `<table style="width:100%;border-collapse:collapse;margin-bottom:10px;${extra||''}">${filas}</table>`;

  const ctx = d.contexto || {};
  const discs = d.disciplinasDelCampo || [d.disciplina];
  const numDiscs = discs.length;
  const anchoDisc = Math.floor(100/numDiscs) + '%';

  // ── TABLA DOCENTES POR DISCIPLINA ─────────────────────
  const filasDocentes = () => {
    const headerCells = discs.map(disc => th(`Docentes ${disc}`, anchoDisc)).join('');
    const dataCells = discs.map(disc => {
      const val = (d.docentesPorDisc||{})[disc] || (disc === d.disciplina ? d.docente : '');
      return td(val ? val.replace(/\n/g,'<br>') : '&nbsp;', anchoDisc);
    }).join('');
    return tr(headerCells) + tr(dataCells);
  };

  // ── TABLA SESIONES POR TRIMESTRE ─────────────────────
  const tablaSesiones = (numTrim) => {
    const nomTrim = ['Primer trimestre','Segundo trimestre','Tercer trimestre'][numTrim-1];
    const meses = ['Septiembre - Noviembre','Diciembre - Marzo','Abril - Junio 2026'][numTrim-1];
    const tKey = 't'+numTrim;
    const headerCells = discs.map(disc => th(disc, anchoDisc)).join('');
    const dataCells = discs.map(disc => {
      const ses = ((d.sesionesPorDisc||{})[tKey]||{})[disc] || '';
      return td(ses ? `${disc} ${ses}` : '&nbsp;', anchoDisc);
    }).join('');
    return tabla(
      tr(th('Periodo de evaluación','30%'), td(nomTrim,'70%')) +
      tr(th('Mes/año:'), td(`${meses} &nbsp;&nbsp; Ciclo: ${d.cicloEscolar||'2026-2027'}`)) +
      tr(th('Número de sesiones')) +
      tr(headerCells) +
      tr(dataCells)
    );
  };

  // ── TABLA CONTENIDOS POR DISCIPLINA ──────────────────
  const tablaContenidos = (tNum) => {
    const tKey = 't'+tNum;
    const tData = d[tKey] || {};
    const contenidosPrinc = (tData.contenidos||[]).map(x=>`• ${x.titulo}`).join('<br>');
    const pdasPrinc = (tData.contenidos||[]).map(x=>`• ${obtenerPDA(x,d.grado)}`).join('<br>');
    const headerCells = discs.map(disc => th('CONTENIDOS — ' + disc, anchoDisc)).join('');
    const dataCells = discs.map(disc => {
      if(disc === d.disciplina) return td(contenidosPrinc||'&nbsp;', anchoDisc);
      const iaCont = (ia['contenidos_'+disc.toLowerCase().replace(/[^a-z]/g,'')])||'';
      return td(iaCont || '&nbsp;', anchoDisc);
    }).join('');
    const headerPda = discs.map(disc => th('PDA — ' + disc, anchoDisc)).join('');
    const dataPda = discs.map(disc => {
      if(disc === d.disciplina) return td(pdasPrinc||'&nbsp;', anchoDisc);
      const iaPda = (ia['pda_'+disc.toLowerCase().replace(/[^a-z]/g,'')])||'';
      return td(iaPda || '&nbsp;', anchoDisc);
    }).join('');
    return tabla(tr(headerCells) + tr(dataCells) + tr(headerPda) + tr(dataPda));
  };

  // ── TABLA PRODUCTOS POR DISCIPLINA ────────────────────
  const tablaProductos = (tNum, nomTrim) => {
    const tKey = 't'+tNum;
    const tData = d[tKey] || {};
    const headerCells = discs.map(disc => th(disc, anchoDisc)).join('');
    const dataCells = discs.map(disc => {
      if(disc === d.disciplina) { const ps = actividadesDe(tData).map(a => a && a.productos).filter(Boolean); return td(ps.length > 1 ? ps.map(x => '• ' + x).join('<br>') : (ps[0] || '&nbsp;'), anchoDisc); }
      const iaProd = (ia['productos_'+disc.toLowerCase().replace(/[^a-z]/g,'')+'_t'+tNum])||'';
      return td(iaProd || '&nbsp;', anchoDisc);
    }).join('');
    return tabla(
      tr(th(`Productos o entregables / evidencias — ${nomTrim.toUpperCase()}`, '100%')) +
      tr(headerCells) +
      tr(dataCells)
    );
  };

  // ── TABLA INSTRUMENTO EVALUACIÓN ─────────────────────
  const tablaInstrumento = () => {
    const headerCells = discs.map(disc => th(disc, anchoDisc)).join('');
    const dataCells = discs.map(disc => {
      const instr = (d.instrumentosPorDisc||{})[disc] || 'Escala estimativa';
      return td(instr, anchoDisc);
    }).join('');
    return tabla(
      tr(th('Instrumento de evaluación', '100%')) +
      tr(headerCells) +
      tr(dataCells)
    );
  };

  // ── MODALIDAD(ES) DIDÁCTICA(S) DEL TRIMESTRE ──────────
  // Una sola: formato de siempre. Varias: lista general (modalidad, nombre, duración y propósito de cada una).
  const bloqueModalidad = (tData, iaT) => {
    const acts = actividadesDe(tData);
    const hayProyecto = acts.some(a => !esSecuenciaAct(a));
    const prob = `<strong>Problematización de la realidad:</strong><br>${iaT.problematizacion||''}`;
    if (acts.length === 1) {
      const a = acts[0] || {}, sec = esSecuenciaAct(a);
      return tabla(
        tr(th(`Modalidad didáctica: ${a.modalidad||'Proyectos comunitarios'}`)) +
        (sec ? '' : tr(td(`<strong>Tipo de proyecto:</strong> ${iaT.tipo||'ABP'}`))) +
        tr(td(`<strong>${sec ? 'Nombre de la secuencia didáctica' : 'Nombre del proyecto'}:</strong> ${a.nombre||''}`)) +
        (a.duracion ? tr(td(`<strong>Duración aproximada:</strong> ${a.duracion}`)) : '') +
        tr(td(prob)) +
        tr(td(`<strong>${sec ? 'Propósito' : 'Propósitos del proyecto'}:</strong><br>${a.proposito||''}`))
      );
    }
    const nSec = acts.filter(esSecuenciaAct).length, nPro = acts.length - nSec;
    const resumen = [nPro ? `${nPro} proyecto${nPro > 1 ? 's' : ''}` : '', nSec ? `${nSec} secuencia${nSec > 1 ? 's' : ''} didáctica${nSec > 1 ? 's' : ''}` : ''].filter(Boolean).join(' y ');
    const cel = (txt, w, extra) => `<td style="border:1px solid #000;padding:5px 8px;vertical-align:top;width:${w};${extra||''}">${txt||'&nbsp;'}</td>`;
    const ths = (txt, w) => `<td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};vertical-align:top;width:${w};">${txt}</td>`;
    const ancho = ['22%', '26%', '12%', '40%'];
    return tabla(
      `<tr><td colspan="4" style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};">Modalidades didácticas del trimestre: ${resumen}</td></tr>` +
      tr(ths('Modalidad', ancho[0]), ths('Nombre del proyecto o de la secuencia', ancho[1]), ths('Duración aproximada', ancho[2]), ths('Propósito', ancho[3])) +
      acts.map(a => tr(cel(a.modalidad || 'Proyectos comunitarios', ancho[0]), cel(a.nombre, ancho[1]), cel(a.duracion, ancho[2]), cel(a.proposito, ancho[3]))).join('') +
      (hayProyecto ? `<tr><td colspan="4" style="border:1px solid #000;padding:5px 8px;"><strong>Tipo de proyecto:</strong> ${iaT.tipo||'ABP'}</td></tr>` : '') +
      `<tr><td colspan="4" style="border:1px solid #000;padding:5px 8px;">${prob}</td></tr>`
    );
  };

  // ── BLOQUE TRIMESTRE COMPLETO ─────────────────────────
  const bloqueTrimestre = (tNum) => {
    const nomTrim = ['Primer trimestre','Segundo trimestre','Tercer trimestre'][tNum-1];
    const tKey = 't'+tNum;
    const tData = d[tKey] || {};
    const iaT = ia['t'+tNum] || {};
    // Usar ejes y perfil del maestro si los seleccionó; si no, los de la IA
    const ejesDoc = d.ejesSeleccionados || iaT.ejes || '';
    const perfilDoc = d.perfilSeleccionado || iaT.perfil || '';
    return `
<p style="font-weight:bold;">${nomTrim.toUpperCase()}</p>
${tablaSesiones(tNum)}
${bloqueModalidad(tData, iaT)}
${tablaContenidos(tNum)}
<p style="font-weight:bold;">ELEMENTOS QUE SE DESARROLLAN CON EL CONTENIDO ABORDADO:</p>
<p style="font-weight:bold;">PERFIL DE EGRESO:</p>
<p>${perfilDoc.replace(/\n/g,'<br><br>')}</p>
<p style="font-weight:bold;">EJES ARTICULADORES: ${ejesDoc}</p>
<p style="font-weight:bold;">FINALIDADES DEL CAMPO FORMATIVO:</p>
<p>${iaT.finalidades||''}</p>
<p style="font-weight:bold;">ESPECIFICIDAD DEL CAMPO FORMATIVO:</p>
<p>${iaT.especificidad||''}</p>
${tablaProductos(tNum, nomTrim)}`;
  };

  // ── DOCUMENTO COMPLETO ────────────────────────────────
  return `
<h2 style="text-align:center;font-weight:bold;">Programa Analítico</h2>
<h3 style="text-align:center;">${d.grado}° grado</h3>
${tabla(
  tr(th('Escuela:','30%'), td(`<strong>${d.escuela}</strong>`,'70%')) +
  tr(th('Turno/horario:'), td(`<strong>${d.turno||'Matutino'}</strong>`)) +
  tr(th('Campo formativo:'), td(`<strong>${d.campo}</strong>`)) +
  tr(th('Asignatura/Disciplina:'), td(`<strong>${discs.join(', ')}</strong>`)) +
  tr(th('Grado:'), td(`<strong>${d.grado}°</strong>`)) +
  tr(th('Problemática/Situación de aprendizaje:'), td(ia.situacion||d.problematica||'')) +
  tr(th('Metodología:'), td(modalidadesDelAnio(d).join(' · ') || 'Proyectos comunitarios')) +
  tr(th('Curso escolar:'), td(d.cicloEscolar||'2026-2027'))
)}

${tabla(filasDocentes())}

<p style="font-weight:bold;font-size:12pt;">PLANO UNO: Análisis del contexto socioeducativo de la Escuela</p>
<p style="font-weight:bold;">Contexto Socioeconómico:</p>

${ctx.c1 ? `<p><strong>• Datos de identificación:</strong></p><p>${ctx.c1}</p>` : ''}
${ctx.c2 ? `<p>Descripción del contexto escolar</p><p>${ctx.c2}</p>` : ''}
${ctx.c3 ? `<p>Características del contexto familiar, sociocultural y lingüístico del centro escolar: ${ctx.c3}</p>` : ''}
${ctx.c4 ? `<p><strong>• Características y necesidades de los alumnos del centro escolar</strong></p><p>${ctx.c4}</p>` : ''}
${ctx.c5 ? `<p><strong>• Características de los ambientes de aprendizaje</strong></p><p>${ctx.c5}</p>` : ''}
${ctx.c6 ? `<p style="font-weight:bold;">Resultados académicos:</p><p><strong>• Resultados de las evaluaciones internas y externas</strong></p><p>${ctx.c6}</p>` : ''}

<p style="font-weight:bold;">Problemática detectada y jerarquizada:</p>
${ctx.c7 ? tabla(tr(td(ctx.c7.replace(/\n/g,'<br>')))) : tabla(tr(td(d.problematica||'')))}

<p style="font-weight:bold;font-size:12pt;">SEGUNDO PLANO: CONTEXTUALIZACIÓN.</p>

${bloqueTrimestre(1)}
${bloqueTrimestre(2)}
${bloqueTrimestre(3)}

${tablaInstrumento()}
`;
}

// ============================================================
// PROMPT ANALÍTICO — Solo pide contenido curricular, NO contexto
// El contexto lo escribe el maestro en el formulario
// ============================================================
function buildPromptAnalitico(d) {
  const resumir = (arr) => arr.map(c=>c.titulo).join(' | ');
  // Si el trimestre combina proyectos y secuencias, la IA lo sabe para redactar una problematización que sirva a todos
  const modsTxt = t => { const a = actividadesDe(t).filter(x => x && (x.nombre || x.modalidad)); return a.length > 1 ? `\n   (modalidades del trimestre: ${a.map(x => (x.modalidad||'') + (x.nombre ? ': ' + x.nombre : '')).join(' / ')})` : ''; };
  const discs = d.disciplinasDelCampo || [d.disciplina];
  return `Eres experto en currículum NEM México. Genera contenido pedagógico para un Programa Analítico.
Responde SOLO con JSON válido, sin markdown ni texto extra.
Lenguaje: español formal, humanista, Plan 2022 NEM.

Campo: ${d.campo} | Disciplina: ${d.disciplina} | Grado: ${d.grado}°
T1: ${resumir(d.t1?.contenidos||[])}${modsTxt(d.t1)}
T2: ${resumir(d.t2?.contenidos||[])}${modsTxt(d.t2)}
T3: ${resumir(d.t3?.contenidos||[])}${modsTxt(d.t3)}

JSON requerido:
{
  "situacion": "situación de aprendizaje del ciclo para ${d.disciplina} (1 oración)",
  "t1": {
    "tipo": "ABP",
    "problematizacion": "problematización pedagógica real para T1 de ${d.disciplina}, 2-3 oraciones",
    "perfil": "Rasgos del perfil de egreso NEM Plan 2022 para T1. Escribe párrafos completos con número: 1. Reconocen que son ciudadanas... 5. Desarrollan una forma de pensar propia...",
    "ejes": "Ejes articuladores NEM pertinentes: Inclusión, Pensamiento crítico, Igualdad de género, etc.",
    "finalidades": "2-3 finalidades del campo ${d.campo} para T1, estilo NEM",
    "especificidad": "Especificidad del campo para T1, 1 párrafo"
  },
  "t2": {
    "tipo": "ABP",
    "problematizacion": "problematización pedagógica para T2",
    "perfil": "Rasgos del perfil de egreso NEM para T2",
    "ejes": "Ejes articuladores para T2",
    "finalidades": "Finalidades del campo para T2",
    "especificidad": "Especificidad del campo para T2"
  },
  "t3": {
    "tipo": "ABP",
    "problematizacion": "problematización pedagógica para T3",
    "perfil": "Rasgos del perfil de egreso NEM para T3",
    "ejes": "Ejes articuladores para T3",
    "finalidades": "Finalidades del campo para T3",
    "especificidad": "Especificidad del campo para T3"
  }
}`;
}

// ── Progreso mientras la IA genera: mensaje + segundos transcurridos ──
// iaProgreso('id-del-mensaje', 'Generando…', 'suele tardar 1–2 minutos') → { poner(titulo, detalle), parar() }
function iaProgreso(idMsg, titulo, detalle) {
  const el = document.getElementById(idMsg), t0 = Date.now(); let tit = titulo, det = detalle || '', timer = null;
  const pintar = () => {
    if (!el) return;
    const seg = Math.round((Date.now() - t0) / 1000), m = Math.floor(seg / 60), tx = m ? `${m} min ${String(seg % 60).padStart(2, '0')} s` : `${seg} s`;
    // Aviso fijo para que nadie piense que se trabó y cancele: los documentos largos tardan de 2 a 3 minutos
    const largo = !/segundos/i.test(det);
    const aviso = largo ? `<div style="margin:12px auto 0;max-width:430px;background:#fffbeb;border:1px solid #fde68a;color:#92400e;border-radius:8px;padding:9px 12px;font-size:13px;line-height:1.4;">⏳ <b>Puede tardar de 2 a 3 minutos.</b><br>Es normal. <b>No cierres ni recargues la página</b>: la app sigue trabajando y tu documento aparecerá aquí.</div>` : '';
    const extra = seg > 200 ? '<br>Ya casi: la IA sigue trabajando. Si pasa de 5 minutos, vuelve a intentar.' : '';
    el.innerHTML = `${tit}<br><small>${det ? det + ' · ' : ''}Llevas <b>${tx}</b>${extra}</small>${aviso}`;
  };
  pintar(); timer = setInterval(pintar, 1000);
  return { poner(a, b) { tit = a; det = b || ''; pintar(); }, parar() { if (timer) { clearInterval(timer); timer = null; } } };
}

// ============================================================
// GENERADOR 1 — FUNCIÓN PRINCIPAL
// ============================================================
async function generarAnalitico(d) {
  const prompt = buildPromptAnalitico(d);
  const respuesta = await llamarGemini(prompt, 'analitico');
  const ia = parsearJSON(respuesta);
  return construirHTMLAnalitico(d, ia);
}

// ============================================================
// CONSTRUCTOR HTML — PLANO DIDÁCTICO
// ============================================================
function construirHTMLPlanDidactico(d, ia) {
  const C = '#BDD7EE';
  const th = (txt, w) => `<td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};${w?'width:'+w+';':''}vertical-align:top;">${txt}</td>`;
  const td = (txt) => `<td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${txt||''}</td>`;
  const tr = (...c) => `<tr>${c.join('')}</tr>`;
  const tabla = (filas) => `<table style="width:100%;border-collapse:collapse;margin-bottom:10px;">${filas}</table>`;
  const thC = '#E2EFDA';

  const filasInterdisciplina = d.contenidos.map(c => `<tr>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;vertical-align:top;">Tu Disciplina — ${d.disciplina}</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${c.titulo}</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${obtenerPDA(c,d.grado)}</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${ia.productos?.[c.titulo]||'Producto parcial'}</td>
  </tr>`).join('');

  const trimestreNombre = d.trimestre==='1'?'PRIMER':d.trimestre==='2'?'SEGUNDO':'TERCER';

  return `
<h2 style="text-align:center;font-weight:bold;">Plano didáctico</h2>
<p><strong>ESCUELA:</strong> ${d.escuela}, CCT ${d.cct||''}, CICLO ${d.cicloEscolar||'2026-2027'}</p>
<p><strong>CAMPO FORMATIVO:</strong> ${d.campo} &nbsp;&nbsp; <strong>DISCIPLINA:</strong> ${d.disciplina}</p>
<p><strong>GRADO Y GRUPO:</strong> ${d.grado}° ${d.grupo||'A, B, C'} &nbsp;&nbsp; <strong>DOCENTE(S):</strong> ${d.docente}</p>
<p><strong>PERIODO:</strong> ${trimestreNombre} TRIMESTRE &nbsp;&nbsp; <strong>MODALIDAD:</strong> ${d.modalidad||'Proyectos comunitarios'}</p>
${(typeof fpTexto==='function' && fpTexto(1, parseInt(d.numSesiones,10)||1)) ? '<p><strong>FECHA DE INICIO Y TÉRMINO:</strong> '+fpTexto(1, parseInt(d.numSesiones,10)||1)+'</p>' : ''}
<p><strong>NOMBRE DEL PROYECTO:</strong> ${d.nombreProyecto}</p>

${tabla(
  tr(th('Problematización de la realidad','35%'), td(d.problematizacion)) +
  tr(th('Propósito u Objetivo'), td(d.proposito)) +
  tr(th('Perfil de egreso al cual contribuye'), td(ia.perfil||'')) +
  tr(th('Finalidades del campo formativo'), td(ia.finalidades||'')) +
  tr(th('Especificidades del campo formativo'), td(ia.especificidad||'')) +
  tr(th('Ejes Articuladores'), td('Inclusión | Pensamiento crítico | Interculturalidad crítica | Igualdad de género | Vida saludable | Apropiación de las culturas a través de la lectura y la escritura | Artes y Experiencias estéticas'))
)}

<table style="width:100%;border-collapse:collapse;margin-bottom:10px;">
  <tr>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};text-align:center;">Interdisciplinariedad</td>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};text-align:center;">CONTENIDOS</td>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};text-align:center;">PDAs</td>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};text-align:center;">PRODUCTO parcial o final</td>
  </tr>
  ${filasInterdisciplina}
  <tr><td colspan="4" style="border:1px solid #000;padding:5px 8px;font-weight:bold;text-align:center;">PRODUCTO INTEGRADOR: ${d.productoIntegrador||ia.productoIntegrador||''}</td></tr>
</table>

<table style="width:100%;border-collapse:collapse;margin-bottom:10px;">
  <tr>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};width:20%;text-align:center;">FASES / MOMENTOS</td>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};width:8%;text-align:center;">SESIONES</td>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};width:44%;text-align:center;">Actividades</td>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};width:14%;text-align:center;">Materiales</td>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};width:14%;text-align:center;">Evaluación formativa</td>
  </tr>
  <tr>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;"><strong>F1. Planeación</strong><br>M1. Identificación<br>M2. Recuperación<br>M3. Planificación</td>
    <td style="border:1px solid #000;padding:5px 8px;text-align:center;vertical-align:top;"><strong>${d.sesionesF1||'3'} sesiones</strong></td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${ia.f1actividades||''}</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${ia.f1materiales||'Libreta, bolígrafo'}</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${ia.f1evidencias||'Participación, diagnóstico'}</td>
  </tr>
  <tr>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;"><strong>F2. Acción</strong><br>M4. Acercamiento<br>M5. Comprensión<br>M6. Reconocimiento<br>M7. Concreción</td>
    <td style="border:1px solid #000;padding:5px 8px;text-align:center;vertical-align:top;"><strong>${d.sesionesF2||'4'} sesiones</strong></td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${ia.f2actividades||''}</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${ia.f2materiales||'Libreta, materiales de trabajo'}</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${ia.f2evidencias||'Producción parcial, participación'}</td>
  </tr>
  <tr>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;"><strong>F3. Intervención</strong><br>M8. Integración<br>M9. Difusión<br>M10. Consideraciones<br>M11. Avances</td>
    <td style="border:1px solid #000;padding:5px 8px;text-align:center;vertical-align:top;"><strong>${d.sesionesF3||'4'} sesiones</strong></td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${ia.f3actividades||''}</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${ia.f3materiales||'Lista de cotejo, trabajos'}</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${ia.f3evidencias||'Producto final, coevaluación'}</td>
  </tr>
</table>

${tabla(tr(th('Observaciones y/o Ajustes razonables','30%'), td(ia.observaciones||'De acuerdo a las necesidades de los alumnos podrá haber ajustes.')))}

<table style="width:100%;border-collapse:collapse;margin-bottom:6px;">
  <tr><td colspan="5" style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};text-align:center;">EVALUACIÓN SUMATIVA</td></tr>
  <tr><td colspan="5" style="border:1px solid #000;padding:5px 8px;font-weight:bold;text-align:center;">CRITERIOS DE EVALUACIÓN Y PONDERACIÓN</td></tr>
  <tr>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${thC};text-align:center;">Proceso (60%)</td>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${thC};text-align:center;">Modalidad</td>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${thC};text-align:center;">Técnica/Instrumento</td>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${thC};text-align:center;">Producto (40%)</td>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${thC};text-align:center;">Técnica/Instrumento</td>
  </tr>
  <tr>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${ia.criteriosProceso||'Actividades 30%, Participación 10%, Investigaciones 5%, Libreta 5%, Portafolio 5%, Examen parcial 5%'}</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">El maestro<br>El alumno<br>Autoevaluación<br>Coevaluación<br>Heteroevaluación</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">Observación<br>Desempeño del alumno<br>Análisis del desempeño<br>Interrogatorio</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${ia.criteriosProducto||'1. Evidencia entregable 20%<br>2. Examen final 20%'}</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${ia.tecnicaProducto||'Lista de cotejo<br>Prueba escrita'}</td>
  </tr>
</table>

<p style="font-weight:bold;">Guía de Evaluación.</p>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
  <tr>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};text-align:center;">Agente y Modalidades</td>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};text-align:center;">Técnicas</td>
    <td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};text-align:center;">Instrumentos de evaluación</td>
  </tr>
  <tr>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">El maestro<br>El alumno<br>Autoevaluación<br>Coevaluación<br>Heteroevaluación</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">Observación.</td>
    <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">- Guía de observación<br>- Escala de actitudes</td>
  </tr>
  <tr>
    <td style="border:1px solid #000;padding:5px 8px;"></td>
    <td style="border:1px solid #000;padding:5px 8px;">Desempeño del alumno.</td>
    <td style="border:1px solid #000;padding:5px 8px;">Preguntas sobre procedimiento<br>Cuadernos de los alumnos<br>Organizadores gráficos</td>
  </tr>
  <tr>
    <td style="border:1px solid #000;padding:5px 8px;"></td>
    <td style="border:1px solid #000;padding:5px 8px;">Análisis del desempeño.</td>
    <td style="border:1px solid #000;padding:5px 8px;">- Escala estimativa<br>- Lista de cotejo</td>
  </tr>
  <tr>
    <td style="border:1px solid #000;padding:5px 8px;"></td>
    <td style="border:1px solid #000;padding:5px 8px;">Interrogatorio</td>
    <td style="border:1px solid #000;padding:5px 8px;">- Pruebas escritas<br>- ${ia.tiposTextuales||'Tipos textuales de la disciplina'}</td>
  </tr>
</table>
`;
}

// ============================================================
// GENERADOR 2: PLANO DIDÁCTICO — PROMPT CORTO → JSON
// ============================================================
function buildPromptPlanDidacticoTrimestre(d) {
  const contenidosTexto = d.contenidos.map(c=>
    `- Contenido: ${c.titulo} | PDA: ${obtenerPDA(c,d.grado)}`
  ).join('\n');
  const trimestreNombre = d.trimestre==='1'?'Primer':d.trimestre==='2'?'Segundo':'Tercer';

  return `Eres experto en NEM México. Genera contenido para un Plano Didáctico de secundaria.
Responde SOLO con JSON válido, sin texto adicional ni markdown.

DATOS:
- Disciplina: ${d.disciplina}, Grado: ${d.grado}°, ${trimestreNombre} trimestre
- Proyecto: "${d.nombreProyecto}"
- Modalidad: ${d.modalidad||'Proyectos comunitarios'}
- Sesiones totales: ${d.numSesiones||'11'} (F1:${d.sesionesF1||3}, F2:${d.sesionesF2||4}, F3:${d.sesionesF3||4})
- Contenidos y PDAs:
${contenidosTexto}

Genera este JSON (texto en español, lenguaje NEM):
{
  "perfil": "4-5 rasgos completos del perfil de egreso NEM relevantes para ${d.disciplina}",
  "finalidades": "2 finalidades del campo formativo ${d.campo} para esta disciplina",
  "especificidad": "especificidad del campo para ${d.disciplina}, 2 oraciones",
  "productoIntegrador": "producto integrador que articule todos los contenidos",
  "productos": {
    "TITULO_CONTENIDO_1": "producto parcial o final para ese contenido"
  },
  "f1actividades": "Descripción de ${d.sesionesF1||3} clases de F1. Para cada una: Clase #N — Inicio (10min): ... — Desarrollo (30min): ... — Cierre (10min): ...",
  "f1materiales": "materiales para F1",
  "f1evidencias": "evidencias de aprendizaje F1",
  "f2actividades": "Descripción de ${d.sesionesF2||4} clases de F2 con formato Inicio/Desarrollo/Cierre",
  "f2materiales": "materiales para F2",
  "f2evidencias": "evidencias F2",
  "f3actividades": "Descripción de ${d.sesionesF3||4} clases de F3 con formato Inicio/Desarrollo/Cierre",
  "f3materiales": "materiales para F3",
  "f3evidencias": "evidencias F3",
  "observaciones": "ajustes razonables según necesidades y contexto",
  "criteriosProceso": "lista de actividades evaluativas con porcentajes que sumen 60%",
  "criteriosProducto": "1-2 productos con porcentajes que sumen 40%",
  "tecnicaProducto": "técnica e instrumento para el producto final",
  "tiposTextuales": "tipos textuales específicos de ${d.disciplina}"
}`;
}

// ============================================================
// GENERADOR 2 — FUNCIÓN PRINCIPAL
// ============================================================
async function generarPlanDidacticoTrimestre(d) {
  const prompt = buildPromptPlanDidacticoTrimestre(d);
  const respuesta = await llamarGemini(prompt, 'plano');
  const ia = parsearJSON(respuesta);
  d.iaEvid = { f1: ia.f1evidencias, f2: ia.f2evidencias, f3: ia.f3evidencias, integrador: ia.productoIntegrador };   // para crear actividades de evaluación desde el Historial
  return construirHTMLPlanDidactico(d, ia);
}

// ============================================================
// FORMATO 2 del plano: «Plan de clase o secuencia didáctica» (sin ruta metodológica: la IA redacta los 11 momentos)
// ============================================================
function buildPromptPlanSEP(d) {
  const contenidosTexto = d.contenidos.map(c => `- Contenido: ${c.titulo} | PDA: ${obtenerPDA(c, d.grado)}`).join('\n');
  const nombres = SEP_MOMENTOS_ABPC.reduce((a, f) => a.concat(f[1]), []);
  const trimestreNombre = d.trimestre === '1' ? 'Primer' : d.trimestre === '2' ? 'Segundo' : 'Tercer';
  return `Eres experto en la Nueva Escuela Mexicana. Redacta la secuencia didáctica de un plano didáctico de secundaria.
Responde SOLO con JSON válido, sin texto adicional ni markdown.

DATOS:
- Disciplina: ${d.disciplina}, Grado: ${d.grado}°, ${trimestreNombre} trimestre, campo formativo ${d.campo}
- Proyecto: "${d.nombreProyecto}" (${d.modalidad || 'Aprendizaje basado en proyectos comunitarios'})
- Problematización: ${d.problematizacion || 'la del contexto de la escuela'}
- Producto integrador: ${d.productoIntegrador || 'el que corresponda a los contenidos'}
- Sesiones totales: ${d.numSesiones || '11'} de ${d.duracionSesion || '50'} minutos
- Contenidos y PDA:
${contenidosTexto}

Redacta los 11 momentos EN ESTE ORDEN: ${nombres.join(' | ')}.
Cada momento: 2 a 3 actividades en tercera persona y tiempo futuro ("Se presentará…", "Los alumnos leerán…", "En equipos elaborarán…"), concretas y propias de ${d.disciplina}, que lleven al producto, y 1 a 3 recursos breves (por ejemplo "Libreta de apuntes", "Lista de asistencia", "Fotocopias", "Libro de texto", "Internet").

JSON requerido:
{
  "momentos": [ { "actividades": ["…","…"], "recursos": ["…"] } ],
  "producto": "nombre breve del producto final",
  "criterios": [ { "c": "criterio de evaluación", "p": 36 } ],
  "observaciones": "una oración sobre cómo se revisan las actividades y los ajustes razonables",
  "enfoque": "enfoque didáctico de ${d.disciplina}, 2 oraciones",
  "cotejo": ["indicador observable 1","indicador 2"]
}
Reglas: "momentos" debe tener exactamente 11 elementos. "criterios": 4 a 6, los porcentajes ("p") son números enteros que SUMAN 100 e incluyen el producto, la participación y las actitudes y valores. "cotejo": 5 a 8 indicadores para evaluar el producto, redactados como afirmaciones que se responden Sí o No.`;
}

function datosSEPDesdeIA(d, ia) {
  ia = ia || {};
  const N = Math.max(1, parseInt(d.numSesiones, 10) || 11);
  const lista = x => (Array.isArray(x) ? x : (x ? [x] : [])).map(t => String(t || '').trim()).filter(Boolean);
  const moms = Array.isArray(ia.momentos) ? ia.momentos : [];
  let i = 0;
  const fases = SEP_MOMENTOS_ABPC.map(([fn, nombres]) => ({
    n: fn,
    mom: nombres.map(n => {
      const m = moms[i] || {};
      const a = Math.floor(i * N / 11) + 1, b = Math.max(a, Math.floor((i + 1) * N / 11));
      i++;
      const ses = a === b ? 'Sesión ' + a : 'Sesiones ' + a + '–' + b, ft = (typeof fpTexto === 'function') ? fpTexto(a, b) : '';
      return { n, acts: lista(m.actividades || m.acts), rec: lista(m.recursos || m.rec), fecha: ft ? ft + '<br><small>' + ses + '</small>' : ses };
    }),
  }));
  const producto = String(ia.producto || d.productoIntegrador || '').trim();
  return {
    fases, producto, evaluacion: 'Formativa',
    criterios: ia.criterios, observaciones: String(ia.observaciones || '').trim(),
    enfoque: String(ia.enfoque || '').trim(),
    tipoProyecto: d.modalidad || 'Aprendizaje basado en proyectos comunitarios',
    sesionesTxt: N + ' sesiones de ' + (d.duracionSesion || '50') + ' minutos', fechaTxt: (typeof fpTexto === 'function') ? fpTexto(1, N) : '',
    cotejoTitulo: 'LISTA DE COTEJO PARA EVALUAR ' + (producto ? producto.toUpperCase() : 'EL PRODUCTO'),
    cotejo: lista(ia.cotejo),
  };
}

// Punto de entrada: con ruta metodológica revisada sale al instante; sin ruta, una sola llamada a la IA
async function generarPlanoSEP(d) {
  if (typeof rutaActual !== 'undefined' && rutaActual && rutaActual.usar) {
    if (typeof rutaSincronizarCampos === 'function') rutaSincronizarCampos();
    rutaActual.proyecto = Object.assign({}, rutaActual.proyecto, { nombre: d.nombreProyecto, producto: d.productoIntegrador });
    return construirHTMLPlanoSEP(d, datosSEPDesdeRuta(d, rutaActual, rutaActual.comp || {}));
  }
  const ia = parsearJSON(await llamarGeminiJSON(buildPromptPlanSEP(d), 'plano'));
  const dt = datosSEPDesdeIA(d, ia);
  if (!dt.fases.some(f => f.mom.some(m => m.acts.length))) throw new Error('La IA no devolvió las actividades. Intenta de nuevo.');
  d.iaEvid = { f1: '', f2: '', f3: '', integrador: dt.producto };
  return construirHTMLPlanoSEP(d, dt);
}

// ============================================================
// GENERADOR 3: PLANO SEMANAL (simplificado, texto plano)
// ============================================================
function buildPromptPlanDidacticoSemanal(d, semana, sesionesEnSemana) {
  const contenidosTexto = d.contenidos.map(c=>
    `- ${c.titulo} — PDA: ${obtenerPDA(c,d.grado)}`
  ).join('\n');
  const numSes = sesionesEnSemana.length;
  return `Responde SOLO con JSON valido sin texto extra ni markdown. Genera actividades para semana ${semana} de ${d.disciplina} ${d.grado} grado de secundaria. Proyecto: ${d.nombreProyecto}. Sesiones: ${numSes}. Contenidos: ${contenidosTexto}. Devuelve exactamente este JSON con ${numSes} sesiones: {"sesiones":[{"num":1,"titulo":"titulo breve","inicio":"actividad inicio 10min","desarrollo":"actividad desarrollo 30min","cierre":"actividad cierre 10min","materiales":"materiales"}]}`;
}

// ============================================================
// DESCARGA EN WORD — CONTENIDO HTML CON TABLAS
// CRÍTICO: NO SE ESCAPA EL HTML (sin .replace para &lt;)
// ============================================================
// ============================================================
// PAGINADO: que ninguna tabla quede cortada entre dos hojas
// Word no «sabe» de tablas completas al abrir un .doc hecho de HTML, así que se le indica:
//  • una fila nunca se parte entre dos hojas;
//  • si la tabla cabe en una hoja, se mantiene entera (si no cabe en lo que queda, pasa a la siguiente);
//  • si es más larga que una hoja, solo se evita dejar el encabezado solo al final de una hoja;
//  • el título que va justo antes de una tabla se queda con ella.
// «Mantener con el siguiente» (keep with next) se expresa en HTML como page-break-after: avoid.
// ============================================================
const PAG_ALTO_UTIL_PX = 640;   // alto aprovechable de una hoja Carta horizontal con márgenes de 1.3 cm (538 pt ≈ 717 px), con holgura porque Word usa otra tipografía
function paginarTablas(htmlContenido) {
  let doc;
  try { doc = new DOMParser().parseFromString('<!doctype html><body><div id="raiz">' + htmlContenido + '</div></body>', 'text/html'); }
  catch (e) { return htmlContenido; }
  const raiz = doc.getElementById('raiz'); if (!raiz) return htmlContenido;
  const BLOQUES = 'p,div,ul,ol,table,h1,h2,h3,h4,h5,h6';
  const unir = (el, css) => { const a = (el.getAttribute('style') || '').trim(); el.setAttribute('style', (a && !/;\s*$/.test(a) ? a + ';' : a) + css); };
  // Medición: se dibuja el contenido con el ancho útil de la hoja (Carta horizontal menos márgenes ≈ 718 pt ≈ 957 px)
  let medir = null;
  try {
    medir = document.createElement('div');
    medir.style.cssText = 'position:absolute;left:-10000px;top:0;width:957px;font:10pt Calibri,Arial,sans-serif;line-height:1.3;visibility:hidden';
    medir.innerHTML = '<style>table{border-collapse:collapse;width:100%}td,th{border:1px solid #000;padding:4px 6px;font-size:10pt;vertical-align:top}p{margin:3px 0}</style>' + raiz.innerHTML;
    document.body.appendChild(medir);
  } catch (e) { medir = null; }
  const altos = medir ? [...medir.querySelectorAll('table')].map(t => t.offsetHeight) : [];
  const todas = [...raiz.querySelectorAll('table')];
  todas.forEach((t, idx) => {
    const filas = [...t.rows]; if (!filas.length) return;
    filas.forEach(f => unir(f, 'page-break-inside:avoid;'));                       // fila indivisible
    const cabe = altos[idx] != null && altos[idx] > 0 && altos[idx] <= PAG_ALTO_UTIL_PX;
    // Cuántas filas se «pegan» con la siguiente: todas menos la última si cabe; solo el encabezado (1.ª fila) si es larga
    const hasta = cabe ? filas.length - 1 : Math.min(1, filas.length - 1);
    for (let i = 0; i < hasta; i++) {
      [...filas[i].cells].forEach(c => {
        if (c.querySelector(BLOQUES)) c.querySelectorAll('p,div,li,h1,h2,h3,h4,h5,h6').forEach(x => unir(x, 'page-break-after:avoid;'));
        else c.innerHTML = '<p style="margin:0;page-break-after:avoid;">' + c.innerHTML + '</p>';
      });
    }
    // el título de la tabla (párrafo o encabezado corto inmediatamente antes) se queda con ella
    let prev = t.previousElementSibling;
    if (prev && /^(P|H[1-6]|DIV)$/.test(prev.tagName) && !prev.querySelector('table') && (prev.textContent || '').trim().length < 160) unir(prev, 'page-break-after:avoid;');
  });
  if (medir) medir.remove();
  return raiz.innerHTML;
}

function armarHTMLWord(htmlContenido, opc) {
  const vertical = !!(opc && opc.vertical);   // exámenes: carta vertical (lo demás sale horizontal)
  try { htmlContenido = paginarTablas(htmlContenido); } catch (e) { console.warn('No se pudo ajustar el paginado:', e); }
  // Marca de agua con datos del maestro para identificar el documento
  const usr = (typeof getUsuario === 'function') ? getUsuario() : null;
  const nombreMaestro = usr ? usr.nombre : '';
  const curpMaestro = usr ? (usr.curp || '') : '';
  const fechaGen = new Date().toLocaleDateString('es-MX', {day:'2-digit',month:'long',year:'numeric'});
  
  const marcaAgua = nombreMaestro ? `
<div style="text-align:right;font-size:8pt;color:#888;border-top:1px solid #ddd;padding-top:4px;margin-top:12px;">
  Documento generado para: <strong>${nombreMaestro}</strong> · ${fechaGen} · Realizado por Planeador Docente NEM · Contacto: planeador.nem.docente@gmail.com
</div>` : '';

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word"
    xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<style>
  body {
    font-family: Calibri, Arial, sans-serif;
    font-size: 10pt;
    margin: 0;
    line-height: 1.3;
    color: #000;
  }
  table { border-collapse: collapse; width: 100%; margin: 4px 0; }
  tr { page-break-inside: avoid; }
  td, th { border: 1px solid #000; padding: 4px 6px; font-size: 10pt; vertical-align: top; }
  p { margin: 3px 0; }
  h2, h3 { margin: 6px 0 3px 0; }
  @page {
    size: ${vertical ? 'portrait' : 'landscape'};
    margin: ${vertical ? '1.5cm 1.5cm' : '1.3cm 1.3cm'};
  }
  @page Section1 {
    size: ${vertical ? '612pt 792pt' : '792pt 612pt'};
    mso-page-orientation: ${vertical ? 'portrait' : 'landscape'};
    margin: ${vertical ? '1.5cm 1.5cm' : '1.3cm 1.3cm'};
  }
  div.Section1 { page: Section1; }
</style>
</head>
<body>
<div class="Section1">
${htmlContenido}
${marcaAgua}
</div>
</body>
</html>`;
  return html;
}
function descargarWord(htmlContenido, nombreArchivo, opc) {
  if (typeof licBloqueaDescarga === 'function' && licBloqueaDescarga()) return;   // en la prueba gratis no se descarga
  const html = armarHTMLWord(htmlContenido, opc);
  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}

// La secuencia didáctica (inicio · desarrollo · cierre, varias por trimestre) vive en secuencias.js
