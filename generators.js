// ============================================================
// GENERADORES DE PROMPTS PARA GEMINI
// Genera Programa Analítico y Plano Didáctico
// en el formato exacto de la Escuela Felipe Carrillo Puerto
// ============================================================

// ── GEMINI CONFIG ─────────────────────────────────────────
const GEMINI_KEY = 'AIzaSyCnFdgyoTpOh6g6SU2Mn5s0GTvxiFJylu0';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

async function llamarGemini(prompt) {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `Error HTTP ${res.status}`);
  }
  const data = await res.json();
  const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) throw new Error('Respuesta vacía de Gemini');
  return texto;
}

// ============================================================
// GENERADOR 1: PROGRAMA ANALÍTICO
// ============================================================
function buildPromptAnalitico(d) {
  const contenidosTexto = (arr) => arr.map(c => `• ${c.titulo}`).join('\n');
  const pdasTexto = (arr, grado) => arr.map(c => `• ${obtenerPDA(c, grado)}`).join('\n');

  return `Eres un experto en la Nueva Escuela Mexicana (NEM) de México. Genera un PROGRAMA ANALÍTICO completo, profesional y listo para usar, exactamente en este formato:

═══════════════════════════════════════════════════════════════
                    PROGRAMA ANALÍTICO
              NUEVA ESCUELA MEXICANA — FASE 6
═══════════════════════════════════════════════════════════════

PLANO UNO: ANÁLISIS DEL CONTEXTO SOCIOEDUCATIVO

Escuela: ${d.escuela}
CCT: ${d.cct || 'Por especificar'}
Turno: ${d.turno || 'Matutino'}
Campo formativo: ${d.campo}
Asignatura/Disciplina: ${d.disciplina}
Grado: ${d.grado}° de Secundaria
Docente(s): ${d.docente}
Curso escolar: ${d.cicloEscolar || '2025-2026'}

CONTEXTO SOCIOECONÓMICO
───────────────────────────────────────────────────────────────
[Genera una descripción del contexto socioeconómico típico de una escuela secundaria en ${d.municipio || 'Yucatán, México'}, incluyendo: datos de identificación, características del centro escolar, contexto familiar y sociocultural, características y necesidades de los alumnos, y ambientes de aprendizaje. Usa lenguaje NEM humanista y comunitario. Máximo 3 párrafos.]

RESULTADOS ACADÉMICOS
[Describe brevemente los resultados académicos esperados y áreas de oportunidad en ${d.disciplina} para ${d.grado}° de secundaria.]

PROBLEMÁTICA DETECTADA Y JERARQUIZADA:
${d.problematica || '[Genera 2 problemáticas relevantes para estudiantes de secundaria en el contexto descrito, relacionadas con la disciplina de ' + d.disciplina + ']'}

═══════════════════════════════════════════════════════════════
SEGUNDO PLANO: CONTEXTUALIZACIÓN

PRIMER TRIMESTRE (Septiembre - Noviembre)
───────────────────────────────────────────────────────────────
Modalidad didáctica: ${d.t1?.modalidad || 'Proyecto comunitario'}
Tipo de proyecto: ${d.t1?.tipoProyecto || 'ABP'}
Nombre del proyecto: ${d.t1?.nombreProyecto || '[Genera un nombre de proyecto pertinente para los contenidos del primer trimestre]'}
Número de sesiones: ${d.t1?.sesiones || 'Por determinar'}

Problematización de la realidad:
${d.t1?.problematizacion || '[Genera una problematización de la realidad pertinente para el contexto escolar y los contenidos del trimestre]'}

Propósitos del proyecto:
${d.t1?.proposito || '[Genera propósitos claros y medibles alineados a la NEM]'}

CONTENIDOS — PRIMER TRIMESTRE:
${contenidosTexto(d.t1?.contenidos || [])}

PDAs — PRIMER TRIMESTRE:
${pdasTexto(d.t1?.contenidos || [], d.grado)}

ELEMENTOS QUE SE DESARROLLAN CON EL CONTENIDO ABORDADO:

PERFIL DE EGRESO:
${d.t1?.perfilEgreso || '[Selecciona 3-4 elementos del perfil de egreso pertinentes a los contenidos del trimestre]'}

EJES ARTICULADORES: ${d.t1?.ejes || 'Inclusión, Pensamiento crítico, Interculturalidad crítica, Igualdad de género, Vida saludable, Apropiación de las culturas a través de la lectura y la escritura, Artes y experiencias estéticas'}

FINALIDADES DEL CAMPO FORMATIVO:
[Describe 2-3 finalidades del campo formativo ${d.campo} relacionadas con los contenidos del trimestre]

ESPECIFICIDAD DEL CAMPO FORMATIVO:
[Describe la especificidad del campo formativo ${d.campo} para ${d.disciplina}]

PRODUCTOS O ENTREGABLES / EVIDENCIAS — PRIMER TRIMESTRE:
${d.t1?.productos || '[Genera 2-3 productos o evidencias concretas y evaluables para el trimestre]'}

INSTRUMENTO DE EVALUACIÓN: ${d.t1?.instrumento || 'Escala estimativa'}

───────────────────────────────────────────────────────────────
SEGUNDO TRIMESTRE (Diciembre - Marzo)
───────────────────────────────────────────────────────────────
Modalidad didáctica: ${d.t2?.modalidad || 'Proyecto comunitario'}
Tipo de proyecto: ${d.t2?.tipoProyecto || 'ABP'}
Nombre del proyecto: ${d.t2?.nombreProyecto || '[Genera un nombre de proyecto pertinente para los contenidos del segundo trimestre]'}
Número de sesiones: ${d.t2?.sesiones || 'Por determinar'}

Problematización de la realidad:
${d.t2?.problematizacion || '[Genera una problematización pertinente]'}

Propósitos del proyecto:
${d.t2?.proposito || '[Genera propósitos claros y medibles]'}

CONTENIDOS — SEGUNDO TRIMESTRE:
${contenidosTexto(d.t2?.contenidos || [])}

PDAs — SEGUNDO TRIMESTRE:
${pdasTexto(d.t2?.contenidos || [], d.grado)}

PERFIL DE EGRESO:
[Selecciona 3-4 elementos del perfil de egreso pertinentes]

EJES ARTICULADORES: ${d.t2?.ejes || 'Inclusión, Igualdad de género, Apropiación de las culturas a través de la lectura y la escritura, Artes y experiencias estéticas'}

FINALIDADES DEL CAMPO FORMATIVO:
[Describe 2-3 finalidades relacionadas con los contenidos del segundo trimestre]

ESPECIFICIDAD DEL CAMPO FORMATIVO:
[Describe la especificidad para este trimestre]

PRODUCTOS O ENTREGABLES / EVIDENCIAS — SEGUNDO TRIMESTRE:
${d.t2?.productos || '[Genera 2-3 productos o evidencias concretas]'}

INSTRUMENTO DE EVALUACIÓN: ${d.t2?.instrumento || 'Escala estimativa'}

───────────────────────────────────────────────────────────────
TERCER TRIMESTRE (Abril - Junio)
───────────────────────────────────────────────────────────────
Modalidad didáctica: ${d.t3?.modalidad || 'Proyecto comunitario'}
Tipo de proyecto: ${d.t3?.tipoProyecto || 'ABP'}
Nombre del proyecto: ${d.t3?.nombreProyecto || '[Genera un nombre de proyecto pertinente para el tercer trimestre]'}
Número de sesiones: ${d.t3?.sesiones || 'Por determinar'}

Problematización de la realidad:
${d.t3?.problematizacion || '[Genera una problematización pertinente]'}

Propósitos del proyecto:
${d.t3?.proposito || '[Genera propósitos claros y medibles]'}

CONTENIDOS — TERCER TRIMESTRE:
${contenidosTexto(d.t3?.contenidos || [])}

PDAs — TERCER TRIMESTRE:
${pdasTexto(d.t3?.contenidos || [], d.grado)}

PERFIL DE EGRESO:
[Selecciona 3-4 elementos del perfil de egreso pertinentes]

EJES ARTICULADORES: ${d.t3?.ejes || 'Inclusión, Vida saludable, Pensamiento crítico, Igualdad de género'}

FINALIDADES DEL CAMPO FORMATIVO:
[Describe 2-3 finalidades relacionadas con los contenidos del tercer trimestre]

ESPECIFICIDAD DEL CAMPO FORMATIVO:
[Describe la especificidad para este trimestre]

PRODUCTOS O ENTREGABLES / EVIDENCIAS — TERCER TRIMESTRE:
${d.t3?.productos || '[Genera 2-3 productos o evidencias concretas]'}

INSTRUMENTO DE EVALUACIÓN: ${d.t3?.instrumento || 'Escala estimativa'}

═══════════════════════════════════════════════════════════════
Elaboró: ${d.docente}
Escuela: ${d.escuela}
Ciclo escolar: ${d.cicloEscolar || '2025-2026'}
═══════════════════════════════════════════════════════════════

INSTRUCCIONES: Completa TODO el contenido con información pedagógica real, específica y aplicable a la Nueva Escuela Mexicana. NO uses corchetes en el resultado — rellena con contenido concreto. El lenguaje debe ser claro, práctico, humanista y comunitario, alineado a la filosofía NEM. Usa el formato exacto mostrado arriba.`;
}

// ============================================================
// GENERADOR 2: PLANO DIDÁCTICO — POR TRIMESTRE
// ============================================================
function buildPromptPlanDidacticoTrimestre(d) {
  const contenidosTexto = d.contenidos.map(c =>
    `• Contenido: ${c.titulo}\n  PDA: ${obtenerPDA(c, d.grado)}`
  ).join('\n\n');

  return `Eres un experto en la Nueva Escuela Mexicana (NEM) de México. Genera un PLANO DIDÁCTICO COMPLETO del trimestre, exactamente en el formato que usan los docentes de la Secundaria General "Felipe Carrillo Puerto", Yucatán.

═══════════════════════════════════════════════════════════════
                         PLANO DIDÁCTICO
═══════════════════════════════════════════════════════════════

ESCUELA SECUNDARIA GENERAL: "${d.escuela}"
CCT: ${d.cct || 'Por especificar'}
CICLO ESCOLAR: ${d.cicloEscolar || '2025-2026'}

CAMPO FORMATIVO: ${d.campo}
DISCIPLINA: ${d.disciplina}
GRADO Y GRUPO: ${d.grado}° ${d.grupo || 'A, B, C'}
DOCENTE(S): ${d.docente}
PERIODO: ${d.trimestre === '1' ? 'PRIMER' : d.trimestre === '2' ? 'SEGUNDO' : 'TERCER'} TRIMESTRE

MODALIDAD Y/O METODOLOGÍA: ${d.modalidad || 'Aprendizaje en proyectos comunitarios'}
NOMBRE DEL PROYECTO: ${d.nombreProyecto}

───────────────────────────────────────────────────────────────
DATOS GENERALES DEL PLANO
───────────────────────────────────────────────────────────────

| CONCEPTO | DESCRIPCIÓN |
|---|---|
| Problematización de la realidad o tema de interés | ${d.problematizacion} |
| Propósito u objetivo | ${d.proposito} |
| Finalidades del campo formativo | [Genera las finalidades del campo formativo ${d.campo} para ${d.disciplina} relacionadas con los contenidos] |
| Especificidades del campo formativo | [Genera la especificidad del campo formativo para este plano] |
| Ejes articuladores | ${d.ejes || 'Inclusión, Pensamiento crítico, Interculturalidad crítica, Igualdad de género, Vida saludable, Apropiación de las culturas a través de la lectura y la escritura, Artes y Experiencias estéticas'} |

PERFIL DE EGRESO AL CUAL CONTRIBUYE:
[Selecciona y redacta completos 4-5 elementos del perfil de egreso NEM pertinentes a los contenidos y disciplina]

───────────────────────────────────────────────────────────────
INTERDISCIPLINARIEDAD — CONTENIDOS Y PDAs
───────────────────────────────────────────────────────────────

${contenidosTexto}

${d.disciplinasAdicionales ? `INTERDISCIPLINARIEDAD CON OTRAS DISCIPLINAS:
${d.disciplinasAdicionales}` : ''}

PRODUCTO INTEGRADOR: ${d.productoIntegrador || '[Genera el producto integrador que articule todos los contenidos y PDAs del plano]'}

───────────────────────────────────────────────────────────────
SECUENCIA DE ACTIVIDADES
───────────────────────────────────────────────────────────────

Genera la secuencia completa de actividades para ${d.numSesiones || 'todas las sesiones del trimestre'} sesiones de ${d.duracionSesion || '50'} minutos cada una.

Para CADA SESIÓN usa exactamente este formato:

F[N]. [FASE — Planeación/Acción/Intervención]
(Descripción breve de la fase y sus momentos)

Clase #[N]
INICIO: ([X] minutos)
[Actividad de inicio detallada — bienvenida, pase de lista, recuperación de conocimientos previos, motivación]

DESARROLLO: ([X] minutos)
[Actividad de desarrollo detallada — explicación, práctica, trabajo individual o en equipos, uso de materiales]

CIERRE: ([X] minutos)
[Actividad de cierre — síntesis, reflexión, producto parcial, tarea si aplica]

Materiales y recursos didácticos: [Lista de materiales]
Evaluación formativa / Evidencia de aprendizaje: [Evidencia concreta]

DISTRIBUCIÓN DE FASES:
• F1. Planeación (Momentos 1-3): Identificación, Recuperación, Planificación — ${d.sesionesF1 || '3 sesiones'}
• F2. Acción (Momentos 4-7): Acercamiento, Comprensión y producción, Reconocimiento, Concreción — ${d.sesionesF2 || '4 sesiones'}
• F3. Intervención (Momentos 8-11): Integración, Difusión, Consideraciones, Avances — ${d.sesionesF3 || '4 sesiones'}

───────────────────────────────────────────────────────────────
OBSERVACIONES Y/O AJUSTES RAZONABLES
───────────────────────────────────────────────────────────────
[Genera observaciones pertinentes sobre ajustes posibles según necesidades de los alumnos y el contexto]

───────────────────────────────────────────────────────────────
EVALUACIÓN SUMATIVA
───────────────────────────────────────────────────────────────

CRITERIOS DE EVALUACIÓN Y PONDERACIÓN:

PROCESO (40%):
1. Actividades evaluativas (tareas) — 30%
   (Actividad 1 a 8 según el plano)
2. Participaciones — 10%
3. Investigaciones realizadas — 5%
4. Valoración de actitudes y valores — 5%
5. Libreta — 5%
6. Portafolio de evidencias — 5%
7. Exámenes parciales — ${d.ponderacionExParcial || '20'}%

PRODUCTO (20%):
1. Evidencia entregable — 20%
2. Examen final — 20%

MODALIDAD: El maestro, El alumno, Autoevaluación, Coevaluación, Heteroevaluación

───────────────────────────────────────────────────────────────
GUÍA DE EVALUACIÓN
───────────────────────────────────────────────────────────────

| AGENTE Y MODALIDADES | TÉCNICAS | INSTRUMENTOS DE EVALUACIÓN |
|---|---|---|
| El maestro / El alumno / Autoevaluación / Coevaluación / Heteroevaluación | Observación | Guía de observación, Escala de actitudes |
| | Desempeño del alumno | Preguntas sobre procedimiento, Cuadernos, Organizadores gráficos |
| | Análisis del desempeño | Escala estimativa, Lista de cotejo |
| | Interrogatorio | Pruebas escritas, ${d.tipoTextual || 'Tipos textuales pertinentes al contenido'} |

═══════════════════════════════════════════════════════════════
Elaboró: ${d.docente}
Escuela: ${d.escuela}
Período: ${d.trimestre === '1' ? 'Primer' : d.trimestre === '2' ? 'Segundo' : 'Tercer'} Trimestre
Ciclo escolar: ${d.cicloEscolar || '2025-2026'}
═══════════════════════════════════════════════════════════════

INSTRUCCIONES: Completa TODO con contenido pedagógico real y específico para ${d.disciplina}, ${d.grado}° de secundaria, alineado a la NEM. NO uses corchetes en el resultado final — rellena con contenido concreto. El lenguaje debe ser claro, práctico y aplicable en el aula. Genera actividades concretas, creativas y contextualizadas. Usa el formato exacto mostrado.`;
}

// ============================================================
// GENERADOR 3: PLANO DIDÁCTICO — POR SEMANA
// ============================================================
function buildPromptPlanDidacticoSemanal(d, semana, sesionesEnSemana) {
  const contenidosTexto = d.contenidos.map(c =>
    `• ${c.titulo} | PDA: ${obtenerPDA(c, d.grado)}`
  ).join('\n');

  const fase = semana <= 3 ? 'F1. Planeación' : semana <= 7 ? 'F2. Acción' : 'F3. Intervención';
  const momentos = semana <= 3
    ? 'Momentos 1-3: Identificación, Recuperación, Planificación'
    : semana <= 7
    ? 'Momentos 4-7: Acercamiento, Comprensión y producción, Reconocimiento, Concreción'
    : 'Momentos 8-11: Integración, Difusión, Consideraciones, Avances';

  return `Eres un experto en la Nueva Escuela Mexicana (NEM). Genera el PLANO DIDÁCTICO SEMANAL — SEMANA ${semana}, exactamente en el formato de la Secundaria General "Felipe Carrillo Puerto".

═══════════════════════════════════════════════════════════════
              PLANO DIDÁCTICO SEMANAL — SEMANA ${semana}
═══════════════════════════════════════════════════════════════

ESCUELA: ${d.escuela} | CCT: ${d.cct || 'N/A'}
CAMPO FORMATIVO: ${d.campo} | DISCIPLINA: ${d.disciplina}
GRADO Y GRUPO: ${d.grado}° ${d.grupo || 'A-F'} | DOCENTE: ${d.docente}
PERÍODO: ${d.trimestre === '1' ? 'Primer' : d.trimestre === '2' ? 'Segundo' : 'Tercer'} Trimestre
PROYECTO: ${d.nombreProyecto}
SEMANA: ${semana} | SESIONES ESTA SEMANA: ${sesionesEnSemana}
FASE: ${fase} — ${momentos}

CONTENIDO(S) Y PDA(s) DE ESTA SEMANA:
${contenidosTexto}

───────────────────────────────────────────────────────────────
SECUENCIA DIDÁCTICA — SEMANA ${semana}
───────────────────────────────────────────────────────────────

Genera ${sesionesEnSemana} sesión(es) completa(s) para esta semana:

${Array.from({length: sesionesEnSemana}, (_, i) => `
SESIÓN ${i + 1} DE LA SEMANA ${semana}
─────────────────────────────────────

INICIO (10 minutos):
[Actividad de apertura: pase de lista + activación de conocimientos + motivación]

DESARROLLO (30 minutos):
[Actividad principal detallada y aplicable al contenido y PDA]

CIERRE (10 minutos):
[Actividad de cierre: reflexión + producto parcial + retroalimentación]

Materiales y recursos: [Lista específica]
Evaluación formativa: [Evidencia observable y concreta]
Tarea (si aplica): [Actividad breve para casa]
`).join('\n')}

───────────────────────────────────────────────────────────────
OBSERVACIONES DE LA SEMANA ${semana}
[Ajustes razonables, notas sobre el avance y seguimiento]
───────────────────────────────────────────────────────────────

═══════════════════════════════════════════════════════════════
Elaboró: ${d.docente} | Semana ${semana} | ${d.trimestre === '1' ? 'Primer' : d.trimestre === '2' ? 'Segundo' : 'Tercer'} Trimestre
Ciclo escolar: ${d.cicloEscolar || '2025-2026'}
═══════════════════════════════════════════════════════════════

INSTRUCCIONES: Genera actividades reales, concretas y aplicables para ${d.disciplina} ${d.grado}° de secundaria. No uses corchetes en el resultado — rellena con contenido pedagógico específico, creativo y alineado a la NEM.`;
}

// ============================================================
// DESCARGA EN WORD
// ============================================================
function descargarWord(texto, nombreArchivo) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word"
    xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin: 2.5cm; line-height: 1.5; color: #1a1a2e; }
  pre { font-family: Calibri, Arial, sans-serif; font-size: 11pt; white-space: pre-wrap; line-height: 1.6; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; }
  th, td { border: 1px solid #999; padding: 6px 10px; font-size: 10pt; }
  th { background: #d9e1f2; font-weight: bold; }
</style>
</head>
<body><pre>${texto}</pre></body></html>`;

  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}
