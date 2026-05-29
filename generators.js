// ============================================================
// GENERADORES DE PROMPTS — PLANEADOR NEM
// Estrategia: IA devuelve JSON con contenido, JS arma las tablas
// Esto mantiene el prompt corto (< 5000 tokens)
// ============================================================

// ── GROQ CONFIG ───────────────────────────────────────────
const GROQ_KEY = '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';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function llamarGemini(prompt) {
  let intentos = 0;
  const maxIntentos = 3;
  while (intentos < maxIntentos) {
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 4096
        })
      });
      if (res.status === 429) {
        intentos++;
        if (intentos < maxIntentos) { await new Promise(r => setTimeout(r, 3000 * intentos)); continue; }
        throw new Error('El servicio está ocupado. Por favor espera unos segundos e intenta de nuevo.');
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `Error HTTP ${res.status}`);
      }
      const data = await res.json();
      const texto = data.choices?.[0]?.message?.content;
      if (!texto) throw new Error('Respuesta vacía del servicio de IA');
      return texto;
    } catch (e) {
      if (intentos >= maxIntentos - 1) throw e;
      intentos++;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// ============================================================
// HELPER — CONVIERTE TEXTO IA EN JSON SEGURO
// ============================================================
function parsearJSON(texto) {
  const limpio = texto.replace(/```json/g,'').replace(/```/g,'').trim();
  return JSON.parse(limpio);
}

// ============================================================
// CONSTRUCTOR HTML — PROGRAMA ANALÍTICO
// Recibe datos del docente + JSON generado por IA
// Arma las tablas sin depender de la IA para el HTML
// ============================================================
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
      tr(th('Mes/año:'), td(`${meses} &nbsp;&nbsp; Ciclo: ${d.cicloEscolar||'2025-2026'}`)) +
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
      if(disc === d.disciplina) return td(tData.productos||'&nbsp;', anchoDisc);
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

  // ── BLOQUE TRIMESTRE COMPLETO ─────────────────────────
  const bloqueTrimestre = (tNum) => {
    const nomTrim = ['Primer trimestre','Segundo trimestre','Tercer trimestre'][tNum-1];
    const tKey = 't'+tNum;
    const tData = d[tKey] || {};
    const iaT = ia['t'+tNum] || {};
    return `
<p style="font-weight:bold;">${nomTrim.toUpperCase()}</p>
${tablaSesiones(tNum)}
${tabla(
  tr(th(`Modalidad didáctica: ${tData.modalidad||'Proyectos comunitarios'}`)) +
  tr(td(`<strong>Tipo de proyecto:</strong> ${iaT.tipo||'ABP'}`)) +
  tr(td(`<strong>Nombre del proyecto:</strong> ${tData.nombreProyecto||''}`)) +
  tr(td(`<strong>Problematización de la realidad:</strong><br>${iaT.problematizacion||''}`)) +
  tr(td(`<strong>Propósitos del proyecto:</strong><br>${tData.proposito||''}`))
)}
${tablaContenidos(tNum)}
<p style="font-weight:bold;">ELEMENTOS QUE SE DESARROLLAN CON EL CONTENIDO ABORDADO:</p>
<p style="font-weight:bold;">PERFIL DE EGRESO:</p>
<p>${iaT.perfil||''}</p>
<p style="font-weight:bold;">EJES ARTICULADORES: ${iaT.ejes||''}</p>
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
  tr(th('Metodología:'), td('ABP')) +
  tr(th('Curso escolar:'), td(d.cicloEscolar||'2025-2026'))
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
  const discs = d.disciplinasDelCampo || [d.disciplina];
  return `Eres experto en currículum NEM México. Genera contenido pedagógico para un Programa Analítico.
Responde SOLO con JSON válido, sin markdown ni texto extra.
Lenguaje: español formal, humanista, Plan 2022 NEM.

Campo: ${d.campo} | Disciplina: ${d.disciplina} | Grado: ${d.grado}°
T1: ${resumir(d.t1?.contenidos||[])}
T2: ${resumir(d.t2?.contenidos||[])}
T3: ${resumir(d.t3?.contenidos||[])}

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

// ============================================================
// GENERADOR 1 — FUNCIÓN PRINCIPAL
// ============================================================
async function generarAnalitico(d) {
  const prompt = buildPromptAnalitico(d);
  const respuesta = await llamarGemini(prompt);
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
<p><strong>ESCUELA:</strong> ${d.escuela}, CCT ${d.cct||'31DES0008B'}, CICLO ${d.cicloEscolar||'2025-2026'}</p>
<p><strong>CAMPO FORMATIVO:</strong> ${d.campo} &nbsp;&nbsp; <strong>DISCIPLINA:</strong> ${d.disciplina}</p>
<p><strong>GRADO Y GRUPO:</strong> ${d.grado}° ${d.grupo||'A, B, C'} &nbsp;&nbsp; <strong>DOCENTE(S):</strong> ${d.docente}</p>
<p><strong>PERIODO:</strong> ${trimestreNombre} TRIMESTRE &nbsp;&nbsp; <strong>MODALIDAD:</strong> ${d.modalidad||'Proyectos comunitarios'}</p>
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
  const respuesta = await llamarGemini(prompt);
  const ia = parsearJSON(respuesta);
  return construirHTMLPlanDidactico(d, ia);
}

// ============================================================
// GENERADOR 3: PLANO SEMANAL (simplificado, texto plano)
// ============================================================
function buildPromptPlanDidacticoSemanal(d, semana, sesionesEnSemana) {
  const contenidosTexto = d.contenidos.map(c=>
    `• ${c.titulo} — PDA: ${obtenerPDA(c,d.grado)}`
  ).join('\n');
  return `Genera actividades para semana ${semana} de ${d.disciplina} ${d.grado}° de secundaria.
Proyecto: "${d.nombreProyecto}". Sesiones esta semana: ${sesionesEnSemana.length}.
Contenidos: ${contenidosTexto}
Para cada sesión: CLASE #N — INICIO (10min): ... DESARROLLO (30min): ... CIERRE (10min): ...
Lenguaje NEM, actividades concretas y aplicables.`;
}

const LOGO_B64 = 'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAJKAaoDASIAAhEBAxEB/8QAHQABAAEFAQEBAAAAAAAAAAAAAAECBQYHCAMECf/EAGAQAAEDAwEEBQYIBg0HCQgDAAEAAgMEBREGBxIhMQgTQVGBIjJhcZHRFBUWQpKTobEXI1JUssEYJDM3U1VicoKj0uHwNENEY3WDoic1VmRzdJSzwiU2RUaEtOLxJmXD/8QAHAEBAAEFAQEAAAAAAAAAAAAAAAYBAgMEBQcI/8QAQBEAAQMCAwUFBQUGBgMBAAAAAQACAwQRBSExBhIUQVETMmFxkRUWIlKBU5KhscEjMzVC0eFUYnKC8PEkNLJD/9oADAMBAAIRAxEAPwDjJEREREREREREREREREREREREREREREREREREREREREREREREREREVUbHyPDGNLnHkFM8UsEpimjdG8c2uGCrtpygkmbVVzgepp4nNzjg5zhgD7c59XeviuY3fg8Z85kXleLnOH2EKl87IvjREVURERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERfXaKCe53CKjpx5bzxOODR2lfItl7JrYyls9y1LVRB8MEZAznyjnDG/0n8PBEWa7LtHW3VF8j0RC9/wABp6cz3OWPgS75rd718T7FiGp7JpWhoamjub6hl9oqp8DBv4hfExzg4OwMiTO7jjjBPNbw6JdrjornqWaRwkqesjjmkxzeRvO8Mn7FrTpK2ylse1u8U1XADRXeNlZDJjjFIRjeHiCCPSo/T4gX4jJDfKwt+q3X0+7A160hWQCGQFhJieMsJ+0H0j/HNeCz3WehLnp6KKGpLKiGqYJqGqjzuTAgHyfTxAI78diwJdyORsjd5putMgjVERFkVERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERFLQXODWgkk4AHath6MNVcLnQ2CGV5tlO5tVWNxhpdE1zjk9ow049JWEUkbw9sMUZdUSkNHozjAHpOVuLVNgbs6pLZRxSP8AhVfa5nVLh86Y+Tw7t1rnALXmnaxwj5uusjI3OaX8gtwdE9z59J3O6zEl1ZcXvLu/ACs/TQsBrdM2vVMLMy0E5p5iB/m38WnwcPtV/wCjTTGm2U0TMYMjnS/SJwfZhZrr6zN1ToS82NwBNTSPZGSOUgG8w+0BefOq+wxYyct6300UjbT9pR28FpjZGyh2n7BK7StXuuvVic51ESfKGQSzwIBZ4Bc36kpHU1e55YWb7iHA9jx5w/X4+hZvsD1XNofafRVFQ50dNPJ8ErWfyXHGf6LsFZP0ntI/FOtKirpYsUl2b8Lh3RwEnzm/fj+cFMoP/GqzH/K/MefNcZ7e0hDuY1WjURF11ooiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIvamYM9a9u81hH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';
const INSTITUCION = {
  nombre: 'Escuela Secundaria General "Felipe Carrillo Puerto"',
  cct: '31DES0008B',
  municipio: 'Ticul, Yucatán',
  subsistema: 'Secundarias Generales — SEP',
  ciclo: '2025-2026',
  director: '',
  sello: '© Documento generado por el Planeador Docente NEM — Uso exclusivo FCP Ticul'
};

// ============================================================
// DESCARGA EN WORD — CONTENIDO HTML CON TABLAS
// CRÍTICO: NO SE ESCAPA EL HTML (sin .replace para &lt;)
// ============================================================
function descargarWord(htmlContenido, nombreArchivo) {
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
  td, th { border: 1px solid #000; padding: 4px 6px; font-size: 10pt; vertical-align: top; }
  p { margin: 3px 0; }
  h2, h3 { margin: 6px 0 3px 0; }
  @page {
    size: landscape;
    margin: 1.5cm 1.5cm;
  }
  @page Section1 {
    size: 841.9pt 595.3pt;
    mso-page-orientation: landscape;
    margin: 1.5cm 1.5cm;
  }
  div.Section1 { page: Section1; }
</style>
</head>
<body>
<div class="Section1">
${htmlContenido}
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// GENERADOR: SECUENCIA DIDÁCTICA COMPLETA CON INICIO/DESARROLLO/CIERRE
// ============================================================
function buildPromptSecuenciaDidactica(d) {
  const contenidosTexto = d.contenidos.map(c =>
    `- Contenido: ${c.titulo}\n  PDA: ${obtenerPDA(c, d.grado)}`
  ).join('\n');
  const trimNom = d.trimestre==='1'?'Primer':d.trimestre==='2'?'Segundo':'Tercer';
  const numSes = parseInt(d.numSesiones)||11;
  const durMin = parseInt(d.duracionSesion)||50;
  const esSesDoble = durMin >= 90;
  const durInicio = 10;
  const durDesarrollo = esSesDoble ? 80 : 30;
  const durCierre = 10;

  return `Eres experto en didáctica NEM México. Diseña una Secuencia Didáctica completa para secundaria.
Responde SOLO con JSON válido, sin markdown ni texto extra.
Lenguaje: español formal, humanista, Plan 2022 NEM.

DATOS:
- Disciplina: ${d.disciplina} | Campo: ${d.campo} | Grado: ${d.grado}° | ${trimNom} trimestre
- Docente: ${d.docente} | Escuela: ${d.escuela}
- Número de sesiones: ${numSes} | Duración por sesión: ${durMin} minutos
- Propósito: ${d.proposito || 'desarrollar las competencias del contenido'}
- Evidencia esperada: ${d.productoIntegrador || 'por determinar'}
- Contexto: ${d.problematizacion || ''}

CONTENIDOS Y PDAs A TRABAJAR:
${contenidosTexto}

ESTRUCTURA DE CADA SESIÓN (${durMin} min):
- Inicio: ${durInicio} min (recuperación, motivación, presentación del propósito)
- Desarrollo: ${durDesarrollo} min (actividad central, trabajo con contenido)
- Cierre: ${durCierre} min (sistematización, retroalimentación, tarea si aplica)

Genera este JSON:
{
  "perfil": "Párrafos completos de rasgos del perfil de egreso NEM Plan 2022 relevantes, con número: 1. Reconocen que... 5. Desarrollan...",
  "finalidades": "2-3 finalidades del campo ${d.campo} para ${d.disciplina}",
  "especificidad": "Especificidad del campo para esta secuencia, 1 párrafo",
  "situacion": "Situación o problematización de aprendizaje que da origen a la secuencia, 2-3 oraciones",
  "sesiones": [
    {
      "num": 1,
      "titulo": "título breve de la sesión",
      "inicio": "Descripción detallada del Inicio (${durInicio} min): qué hace el docente, qué hacen los alumnos",
      "desarrollo": "Descripción detallada del Desarrollo (${durDesarrollo} min): actividad central paso a paso",
      "cierre": "Descripción detallada del Cierre (${durCierre} min): cómo se sistematiza y qué se pide para la siguiente",
      "materiales": "Lista de materiales y recursos necesarios",
      "evaluacion_formativa": "Qué se observa o registra en esta sesión como evidencia de aprendizaje"
    }
  ],
  "observaciones": "Ajustes razonables para alumnos con NEE o barreras de aprendizaje",
  "rubrica": [
    {
      "criterio": "nombre del criterio de evaluación",
      "ponderacion": "porcentaje (todos deben sumar 100%)",
      "excelente": "descripción nivel 4 — excelente",
      "satisfactorio": "descripción nivel 3 — satisfactorio",
      "suficiente": "descripción nivel 2 — suficiente",
      "insuficiente": "descripción nivel 1 — insuficiente"
    }
  ]
}

IMPORTANTE: Genera exactamente ${numSes} sesiones en el arreglo "sesiones". La rúbrica debe tener entre 4 y 6 criterios con ponderaciones que sumen 100%.`;
}

// ── CONSTRUCTOR HTML SECUENCIA DIDÁCTICA ─────────────────
function construirHTMLSecuenciaDidactica(d, ia) {
  const C = '#BDD7EE';
  const CG = '#E2EFDA';
  const CV = '#E2EFDA';
  const th = (txt, w, bg) => `<td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${bg||C};${w?'width:'+w+';':''}vertical-align:top;">${txt}</td>`;
  const td = (txt, w, bg) => `<td style="border:1px solid #000;padding:5px 8px;vertical-align:top;${w?'width:'+w+';':''}${bg?'background:'+bg+';':''}">${txt||'&nbsp;'}</td>`;
  const tr = (...c) => `<tr>${c.join('')}</tr>`;
  const tabla = (filas) => `<table style="width:100%;border-collapse:collapse;margin-bottom:10px;">${filas}</table>`;

  const trimNom = d.trimestre==='1'?'Primer trimestre':d.trimestre==='2'?'Segundo trimestre':'Tercer trimestre';
  const periodoMes = d.trimestre==='1'?'Septiembre - Noviembre':d.trimestre==='2'?'Diciembre - Marzo':'Abril - Junio 2026';

  // Tabla de sesiones con Inicio/Desarrollo/Cierre
  const sesionesHTML = (ia.sesiones||[]).map((s,i) => `
<p style="font-weight:bold;margin-top:10px;">Sesión ${s.num||i+1}${s.titulo ? ' — '+s.titulo : ''}</p>
${tabla(
  tr(th('INICIO (10 min)','15%','#FFF3CD'), td(s.inicio||'','85%')) +
  tr(th('DESARROLLO','15%','#D4EDDA'), td(s.desarrollo||'','85%')) +
  tr(th('CIERRE (10 min)','15%','#D1ECF1'), td(s.cierre||'','85%')) +
  tr(th('Materiales','15%'), td(s.materiales||'','85%')) +
  tr(th('Evaluación formativa','15%'), td(s.evaluacion_formativa||'','85%'))
)}`).join('');

  // Rúbrica
  const rubricaHTML = () => {
    if(!ia.rubrica||!ia.rubrica.length) return '';
    const encabezado = tr(
      th('Criterio','20%'), th('Ponderación','8%'),
      th('Nivel 4 — Excelente','18%',CG), th('Nivel 3 — Satisfactorio','18%','#FFF3CD'),
      th('Nivel 2 — Suficiente','18%','#FFE5B4'), th('Nivel 1 — Insuficiente','18%','#F8D7DA')
    );
    const filas = ia.rubrica.map(r =>
      tr(td(r.criterio,'20%'), td(r.ponderacion,'8%'),
         td(r.excelente,'18%'), td(r.satisfactorio,'18%'),
         td(r.suficiente,'18%'), td(r.insuficiente,'18%'))
    ).join('');
    return `<p style="font-weight:bold;font-size:12pt;margin-top:16px;">RÚBRICA DE EVALUACIÓN</p>
${tabla(encabezado + filas)}`;
  };

  return `
<h2 style="text-align:center;font-weight:bold;">Plano Didáctico — Secuencia Didáctica</h2>
<h3 style="text-align:center;">${d.grado}° grado · ${trimNom}</h3>

${tabla(
  tr(th('Escuela:','30%'), td(`<strong>${d.escuela||''}</strong>`)) +
  tr(th('CCT:'), td(d.cct||'')) +
  tr(th('Ciclo escolar:'), td(d.cicloEscolar||'2025-2026')) +
  tr(th('Campo formativo:'), td(d.campo||'')) +
  tr(th('Disciplina:'), td(d.disciplina||'')) +
  tr(th('Grado y grupo:'), td(d.grupo||'')) +
  tr(th('Docente(s):'), td(d.docente||'')) +
  tr(th('Periodo:'), td(periodoMes)) +
  tr(th('Modalidad:'), td('Secuencia Didáctica')) +
  tr(th('Número de sesiones:'), td(d.numSesiones||'')) +
  tr(th('Duración por sesión:'), td((d.duracionSesion||50)+' minutos'))
)}

${tabla(
  tr(th('Situación de aprendizaje / Problematización'), td(ia.situacion||d.problematizacion||'')) +
  tr(th('Propósito u Objetivo'), td(d.proposito||'')) +
  tr(th('Perfil de egreso'), td(ia.perfil||'')) +
  tr(th('Finalidades del campo formativo'), td(ia.finalidades||'')) +
  tr(th('Especificidades del campo formativo'), td(ia.especificidad||'')) +
  tr(th('Ejes Articuladores'), td(d.ejes||''))
)}

${d.disciplinasAdicionales ? `
<p style="font-weight:bold;">INTERDISCIPLINARIEDAD</p>
${tabla(tr(td(d.disciplinasAdicionales)))}` : ''}

<p style="font-weight:bold;font-size:12pt;margin-top:16px;">SECUENCIA DE SESIONES</p>
<p style="font-size:12px;color:#555;">Total: ${d.numSesiones} sesiones · ${d.duracionSesion} minutos cada una</p>
${sesionesHTML}

${ia.observaciones ? `
<p style="font-weight:bold;">Observaciones y/o Ajustes razonables</p>
${tabla(tr(td(ia.observaciones)))}` : ''}

<p style="font-weight:bold;font-size:12pt;margin-top:16px;">EVALUACIÓN SUMATIVA</p>
${tabla(
  tr(th('Evidencia / Producto esperado'), td(d.productoIntegrador||'')) +
  tr(th('Contenidos trabajados'), td((ia.sesiones||[]).length + ' sesiones — ' + d.contenidos.map(c=>c.titulo).join(', ')))
)}

${rubricaHTML()}
`;
}

// ── FUNCIÓN PRINCIPAL SECUENCIA ──────────────────────────
async function generarSecuenciaDidactica(d) {
  const prompt = buildPromptSecuenciaDidactica(d);
  const respuesta = await llamarGemini(prompt);
  const ia = parsearJSON(respuesta);
  return construirHTMLSecuenciaDidactica(d, ia);
}
