// ============================================================
// METODOLOGÍAS SOCIOCRÍTICAS NEM — DATOS Y LÓGICA
// Fuente: «Sugerencias metodológicas para el desarrollo de los
// proyectos educativos» (Curso ATP, 13 nov 2026) y formatos de
// Plano Didáctico por campo formativo (SEGEY, Zona Escolar).
// Indicadores: Observación de la Intervención Didáctica, Guía para
// el análisis del Programa Analítico y Revisión del Plano Didáctico.
// ============================================================

// Marcadores en los textos:  {PROB} problemática · {DIS} disciplina · {PROD} producto
// Etiquetas "obs" = indicadores de Observación de la Intervención Didáctica que ese momento atiende
//   G4 plan didáctico · G6 contenido/PDA en pizarrón · G7 saberes previos
//   D1.x Implementación del currículo · D2.x Ambiente · D3.x Estrategias · D4.x Evaluación

// M(nombre, % del tiempo, acciones, docente, alumnado, recursos, evidencia, organización, "técnica|instrumento|modalidad", obs, retroalimentación?)
const M = (n, pct, acc, doc, alu, rec, evi, org, eva, obs, retro) => {
  const [tec, inst, mod] = eva.split('|');
  return { n, pct, acc, doc, alu, rec, evi, org, eva: { tec, inst, mod }, obs, retro: !!retro };
};

const METODOLOGIAS = {

  // ── LENGUAJES ─────────────────────────────────────────────
  abpc: {
    id: 'abpc', siglas: 'ABPC', campo: 'Lenguajes',
    nombre: 'Aprendizaje basado en proyectos comunitarios',
    modalidadPlano: 'Proyecto comunitario',
    resumen: 'Los estudiantes identifican un problema real, negocian una ruta de acción, producen algo que lo atienda y lo difunden para mejorarlo.',
    fases: [
      { n: 'Fase 1 · Planeación', lema: 'Se identifica un problema y se negocia una ruta de acción', color: '#2563a8', mom: [
        M('Momento 1 · Identificación', 6,
          ['Proponer planteamientos genuinos (una situación real, no forzada) para dialogar sobre escenarios áulicos, escolares y comunitarios.',
           'Identificar la problemática general y los aspectos específicos a investigar en el aula.',
           'Presentar un insumo inicial (producto, material, objeto o texto) que muestre qué se hará en el proyecto.'],
          ['Escribe en el pizarrón el contenido, el PDA y el propósito; explica la metodología y sus fases.',
           'Presenta la situación real «{PROB}» con un insumo detonante (texto, imagen, video u objeto).',
           'Acuerda con el grupo las normas de convivencia para el proyecto.'],
          ['Dialogan en plenaria: ¿qué vemos?, ¿a quién afecta?, ¿por qué importa?',
           'Nombran la problemática con sus palabras y proponen aspectos a investigar.'],
          ['Insumo inicial (lectura, imagen o video)', 'Pizarrón y cuaderno de proyecto'],
          'Redacción grupal de la problemática', 'Plenaria',
          'Interrogatorio|Registro de participación|Heteroevaluación',
          ['G6', 'D1.1', 'D1.3', 'D1.4', 'D1.5', 'D2.1', 'D2.2', 'D3.1', 'D3.2']),
        M('Momento 2 · Recuperación', 6,
          ['Vincular conocimientos previos sobre el contenido a desarrollar.',
           'Proponer planteamientos genuinos que generen disonancia por las diferentes ideas que surjan.'],
          ['Aplica una dinámica de saberes previos (lluvia de ideas o cuadro SQA: lo que sé / quiero saber / aprendí).',
           'Plantea preguntas que provocan duda: «¿todos lo viven igual?», «¿y si fuera al revés?».'],
          ['Comparten lo que saben y cómo lo saben; contrastan ideas en binas.',
           'Registran dudas y preguntas en el cuaderno de proyecto.'],
          ['Organizador SQA', 'Tarjetas o notas adhesivas'],
          'Cuadro SQA de saberes previos', 'Binas',
          'Observación|Lista de cotejo|Autoevaluación',
          ['G7', 'D3.3', 'D3.5', 'D3.6', 'D3.8']),
        M('Momento 3 · Planificación', 8,
          ['Negociar con los estudiantes las producciones necesarias para llegar al final del proceso.',
           'Acordar los tiempos y el tipo de acciones; definir el alcance (aula, escuela o comunidad).',
           'Dar a conocer y acordar los criterios e instrumentos de evaluación y su ponderación.'],
          ['Guía la negociación del plan de trabajo (producciones, fechas y responsables).',
           'Socializa la rúbrica y los criterios de evaluación (proceso 70 %, producto 30 %).',
           'Organiza comunidades de aprendizaje de 4 integrantes con roles rotativos.'],
          ['Proponen y votan producciones, fechas y responsables.',
           'Forman equipos y asignan roles: coordinador, relator, vocero y controlador del tiempo.'],
          ['Cronograma del proyecto', 'Rúbrica y criterios de evaluación', 'Formato de roles'],
          'Plan de trabajo y cronograma', 'Equipos de 4 con roles',
          'Análisis del desempeño|Plan de trabajo con lista de cotejo|Heteroevaluación',
          ['D3.2', 'D3.4', 'D3.5', 'D4.1']),
      ] },
      { n: 'Fase 2 · Acción', lema: 'Se realizan producciones que permiten atender el problema', color: '#16a34a', mom: [
        M('Momento 4 · Acercamiento', 8,
          ['Explorar el problema desde distintas facetas: describir, comparar, identificar aspectos sobresalientes y explicarlo, según la finalidad del proyecto.'],
          ['Presenta fuentes diversas (textos, entrevistas, datos de la comunidad) sobre «{PROB}».',
           'Modela una estrategia de lectura y análisis crítico de fuentes.'],
          ['Exploran fuentes, describen y comparan datos; entrevistan a familiares o vecinos.',
           'Anotan en un organizador qué hallaron y qué falta saber.'],
          ['Fuentes impresas y digitales', 'Guion de entrevista', 'Organizador gráfico'],
          'Organizador gráfico de hallazgos', 'Equipos',
          'Observación|Registro anecdótico|Coevaluación',
          ['D1.6', 'D3.6', 'D3.7', 'D3.8', 'D3.10']),
        M('Momento 5 · Comprensión y producción', 24,
          ['Comprender y analizar los aspectos necesarios para elaborar las producciones que concretan el proyecto.',
           'En paralelo, realizar las producciones necesarias con las experimentaciones y revisiones pertinentes.'],
          ['Imparte minilecciones de {DIS} vinculadas con el PDA y verifica la comprensión.',
           'Recorre todos los equipos, aclara dudas y retroalimenta de inmediato.',
           'Ofrece actividades diferenciadas para ritmos y estilos de aprendizaje (visual, auditivo, kinestésico).'],
          ['Elaboran borradores de los subproductos acordados.',
           'Se explican entre pares cómo resolvieron cada parte (metacognición).',
           'Corrigen con base en la retroalimentación recibida.'],
          ['Libro de texto y fichas de trabajo', 'Dispositivos o computadora (si hay)', 'Papelería y materiales del producto'],
          'Subproductos y cuaderno de proyecto', 'Equipos, binas e individual',
          'Análisis del desempeño|Rúbrica de subproductos|Coevaluación',
          ['D1.2', 'D2.5', 'D2.8', 'D3.4', 'D3.6', 'D3.7', 'D3.9', 'D3.10', 'D4.2', 'D4.3', 'D4.5'], true),
        M('Momento 6 · Reconocimiento', 6,
          ['Identificar los avances y las dificultades del proceso.',
           'Ajustar (en la medida de lo posible): decidir cómo atender lo anterior y llevarlo a cabo.'],
          ['Conduce una revisión de avances con la lista de cotejo del proyecto.',
           'Guía el análisis del error: ¿qué pasó?, ¿por qué?, ¿cómo lo corregimos?'],
          ['Se autoevalúan con la rúbrica y registran avances y dificultades.',
           'Acuerdan los ajustes al plan y al producto.'],
          ['Lista de cotejo', 'Formato de autoevaluación'],
          'Autoevaluación y plan de ajustes', 'Equipos',
          'Observación|Escala estimativa|Autoevaluación',
          ['D4.2', 'D4.4', 'D4.5', 'D4.6'], true),
        M('Momento 7 · Concreción', 12,
          ['Generar una primera versión del producto planteado en los momentos 1 y 3.'],
          ['Supervisa la integración de los subproductos en el producto.',
           'Verifica que el producto responda a la problemática y a los criterios acordados.'],
          ['Ensamblan la primera versión de «{PROD}».',
           'Ensayan y revisan en equipo antes de mostrarla.'],
          ['Materiales del producto', 'Rúbrica de producto'],
          'Primera versión del producto', 'Equipos',
          'Desempeño del alumno|Rúbrica de producto|Heteroevaluación',
          ['D2.8', 'D3.4', 'D3.7', 'D4.2']),
      ] },
      { n: 'Fase 3 · Intervención', lema: 'Se difunden las producciones, se da seguimiento y se plantea cómo mejorar', color: '#d97706', mom: [
        M('Momento 8 · Integración', 8,
          ['Exposición, explicación y exposición de soluciones o recomendaciones: intercambiar producciones, explicar lo que hicieron y recibir retroalimentación.',
           'Modificación: revisar y actuar sobre los cambios sugeridos.'],
          ['Organiza una ronda de revisión entre equipos (galería).',
           'Modela cómo retroalimentar con respeto: «dos estrellas y un deseo».'],
          ['Intercambian sus producciones, explican su proceso y reciben retroalimentación de otro equipo.',
           'Modifican el producto con los cambios sugeridos.'],
          ['Formato «dos estrellas y un deseo»', 'Producto en borrador'],
          'Producto ajustado y hojas de retroalimentación entre pares', 'Equipos en rotación',
          'Observación|Lista de cotejo|Coevaluación',
          ['D2.2', 'D3.9', 'D4.2', 'D4.3'], true),
        M('Momento 9 · Difusión', 10,
          ['Mostrar el producto final al aula (y a la escuela o la comunidad, según el alcance) para dar cuenta de cómo se atendió la problemática.'],
          ['Organiza la presentación e invita a familias, autoridades u otros grupos.',
           'Registra el desempeño con la rúbrica de producto.'],
          ['Presentan «{PROD}» y explican cómo atiende la problemática.',
           'Responden preguntas de la audiencia.'],
          ['Espacio de presentación (aula, patio o biblioteca)', 'Proyector o equipo de sonido', 'Invitaciones'],
          'Producto final presentado', 'Equipos y plenaria con público',
          'Desempeño del alumno|Rúbrica de producto|Heteroevaluación',
          ['D1.6', 'D3.7', 'D4.1', 'D4.5']),
        M('Momento 10 · Consideraciones', 6,
          ['Seguimiento y retroalimentación: recibir opiniones sobre cómo el producto impactó los escenarios áulicos, escolares y comunitarios.'],
          ['Recoge opiniones de la audiencia (encuesta breve o buzón).',
           'Facilita el diálogo sobre el impacto observado.'],
          ['Analizan las opiniones recibidas y registran el impacto.',
           'Comentan fortalezas y áreas de oportunidad.'],
          ['Encuesta o buzón de opiniones', 'Registro de impacto'],
          'Registro de opiniones e impacto', 'Plenaria',
          'Interrogatorio|Cuestionario|Heteroevaluación',
          ['D1.6', 'D2.2', 'D3.8', 'D4.2']),
        M('Momento 11 · Avances', 6,
          ['Toma de decisiones: analizar la retroalimentación recibida y emplearla para mejorar y consolidar los procesos en proyectos subsecuentes.'],
          ['Conduce la reflexión metacognitiva: ¿qué aprendí?, ¿cómo lo aprendí?, ¿para qué me sirve?',
           'Cierra el proyecto con la retroalimentación final y los resultados de la evaluación.'],
          ['Responden la autoevaluación final y comparten en parejas lo que aprendieron.',
           'Proponen mejoras para el siguiente proyecto.'],
          ['Formato de autoevaluación final', 'Portafolio de evidencias'],
          'Autoevaluación final y portafolio', 'Binas e individual',
          'Análisis del desempeño|Portafolio con rúbrica|Autoevaluación',
          ['D3.9', 'D4.2', 'D4.4', 'D4.5', 'D4.6'], true),
      ] },
    ],
  },

  // ── SABERES Y PENSAMIENTO CIENTÍFICO ──────────────────────
  steam: {
    id: 'steam', siglas: 'STEAM', campo: 'Saberes y Pensamiento Científico',
    nombre: 'Aprendizaje basado en indagación (enfoque STEAM)',
    modalidadPlano: 'Aprendizaje basado en la indagación: enfoque STEAM',
    resumen: 'Los estudiantes se preguntan, indagan con método, organizan sus respuestas, presentan resultados, proponen acciones y reflexionan sobre su proceso.',
    nota: 'Si el producto es un objeto o instrumento tecnológico, aplica el Proceso de Diseño de Ingeniería dentro de la Fase 2 o 4: diseño del prototipo, creación, puesta a prueba y evaluación, y mejora del prototipo.',
    fases: [
      { n: 'Fase 1 · Introducción al tema', lema: 'Se atrae la atención, se recuperan saberes previos y se identifica la problemática', color: '#2563a8', mom: [
        M('Introducción al tema', 6,
          ['Seleccionar, identificar o negociar el tema.',
           'Realizar planteamientos para que los estudiantes se introduzcan al tema que se abordará.'],
          ['Escribe en el pizarrón el contenido, el PDA y el propósito; explica las fases de la indagación.',
           'Presenta un fenómeno o hecho relacionado con «{PROB}» (video, noticia local, objeto o dato).',
           'Acuerda las normas de convivencia para el trabajo en equipo.'],
          ['Observan, describen lo que ven y formulan sus primeras preguntas.',
           'Comparten qué les llama la atención y por qué.'],
          ['Video, noticia local u objeto detonante', 'Pizarrón y cuaderno de indagación'],
          'Preguntas iniciales del grupo', 'Plenaria',
          'Interrogatorio|Registro de participación|Heteroevaluación',
          ['G6', 'D1.1', 'D1.3', 'D1.4', 'D2.1', 'D2.2', 'D3.1', 'D3.2']),
        M('Uso de conocimientos previos', 6,
          ['Reconocer y vincular los conocimientos previos: qué sabe y cómo lo sabe.',
           'Generar disonancia con las diferentes ideas que surjan y orientarlas para aprender más.'],
          ['Aplica un organizador de saberes previos (SQA o mapa mental inicial).',
           'Contrasta ideas del grupo y señala vacíos que la indagación ayudará a llenar.'],
          ['Explican lo que saben del tema y de dónde lo saben; contrastan ideas en binas.',
           'Registran sus ideas iniciales para compararlas al final.'],
          ['Organizador SQA', 'Cuaderno de indagación'],
          'Organizador de saberes previos', 'Binas',
          'Observación|Lista de cotejo|Autoevaluación',
          ['G7', 'D1.5', 'D3.3', 'D3.5', 'D3.6', 'D3.8']),
        M('Identificación de la problemática', 8,
          ['Identificar y seleccionar la problemática general a indagar, vinculada con problemas sociales de la comunidad.',
           'Establecer las preguntas específicas que orientarán la indagación.',
           'Especificar pertinencia y relevancia; identificar contenidos, PDA y eje articulador.'],
          ['Ayuda a delimitar «{PROB}» y a formular preguntas indagables (qué, cómo, por qué, cuánto).',
           'Vincula la problemática con los contenidos y el PDA de {DIS} y con el eje articulador.'],
          ['Eligen la problemática y redactan preguntas específicas de indagación.',
           'Justifican por qué es relevante para su comunidad.'],
          ['Tarjetas de preguntas', 'Programa sintético (contenidos y PDA)'],
          'Problemática y preguntas de indagación', 'Plenaria y equipos',
          'Análisis del desempeño|Lista de cotejo|Coevaluación',
          ['D1.2', 'D1.4', 'D1.6', 'D3.8', 'D3.10']),
      ] },
      { n: 'Fase 2 · Diseño y desarrollo de la indagación', lema: 'Se acuerda qué, quién, cómo, cuándo y se recaba la información', color: '#16a34a', mom: [
        M('Diseño de investigación', 12,
          ['Formar equipos y definir el producto final (exposición, maqueta, instrumento tecnológico, etc.).',
           'Acordar para cada pregunta: qué se hará, quién, cómo, cuándo, dónde, para qué y con qué.',
           'Establecer compromisos; explicitar y socializar criterios e instrumentos de evaluación y su ponderación; elaborar el plan de trabajo.'],
          ['Organiza comunidades de aprendizaje de 4 integrantes con roles.',
           'Orienta la elaboración del plan de trabajo y socializa la rúbrica (proceso 70 %, producto 30 %).'],
          ['Eligen el producto final y redactan su plan de trabajo con responsables y fechas.',
           'Firman sus compromisos de equipo.'],
          ['Formato de plan de trabajo', 'Rúbrica de proceso y de producto', 'Formato de roles'],
          'Plan de indagación', 'Equipos de 4 con roles',
          'Análisis del desempeño|Plan de trabajo con lista de cotejo|Heteroevaluación',
          ['D3.2', 'D3.4', 'D3.5', 'D4.1']),
        M('Desarrollo de la indagación', 18,
          ['Poner en marcha la investigación para recabar la información que responda las preguntas: describir, comparar, identificar cambios y estabilidad, patrones o regularidades, y explicaciones.'],
          ['Recorre todos los equipos, aclara dudas y plantea contrapreguntas que fomentan el pensamiento crítico.',
           'Proporciona materiales y fuentes; diferencia actividades por ritmo y estilo de aprendizaje.',
           'Si hay prototipo: guía el diseño, la creación, la prueba y la mejora.'],
          ['Recaban datos (observación, medición, experimento, entrevista o consulta documental).',
           'Se explican entre pares qué hicieron y por qué (metacognición).',
           'Registran en su bitácora de indagación.'],
          ['Material de laboratorio o de campo', 'Instrumentos de medición', 'Bitácora de indagación', 'Fuentes confiables'],
          'Bitácora y datos recabados', 'Equipos y binas',
          'Análisis del desempeño|Rúbrica de bitácora|Coevaluación',
          ['D1.2', 'D2.5', 'D2.8', 'D3.4', 'D3.6', 'D3.7', 'D3.8', 'D3.9', 'D3.10', 'D4.2', 'D4.3', 'D4.5'], true),
      ] },
      { n: 'Fase 3 · Organización de las respuestas', lema: 'Se establecen conclusiones sobre la problemática general', color: '#7c3aed', mom: [
        M('Organización y estructuración de las respuestas', 20,
          ['Analizar la información investigada; organizarla para responder las preguntas de indagación.',
           'Sintetizar ideas, clarificar conceptos y explicaciones y establecer conclusiones relacionadas con la problemática general.'],
          ['Enseña a organizar e interpretar datos (tablas, gráficas, esquemas).',
           'Guía el análisis del error: ¿qué dato falló?, ¿qué explicación cambió?, ¿cómo lo corregimos?'],
          ['Organizan e interpretan sus datos; elaboran tablas, gráficas o esquemas.',
           'Redactan conclusiones y comparan con sus ideas iniciales.',
           'Coevalúan en parejas la claridad de sus conclusiones.'],
          ['Hojas de cálculo o papel milimétrico', 'Organizadores gráficos'],
          'Conclusiones de la indagación', 'Equipos y binas',
          'Análisis del desempeño|Rúbrica de conclusiones|Coevaluación',
          ['D1.2', 'D3.5', 'D3.8', 'D3.9', 'D4.2', 'D4.3', 'D4.5', 'D4.6'], true),
      ] },
      { n: 'Fase 4 · Presentación y aplicación', lema: 'Se presentan resultados y se elaboran propuestas de acción', color: '#d97706', mom: [
        M('Presentación de los resultados de indagación', 10,
          ['Exponer los resultados de la investigación.'],
          ['Organiza la exposición y registra el desempeño con la rúbrica de producto.'],
          ['Exponen sus resultados y responden preguntas de sus compañeros y de la audiencia.'],
          ['Cartel, maqueta, presentación digital o prototipo', 'Rúbrica de producto'],
          'Exposición de resultados', 'Equipos y plenaria',
          'Desempeño del alumno|Rúbrica de producto|Heteroevaluación',
          ['D1.6', 'D3.7', 'D4.1', 'D4.5']),
        M('Aplicación', 10,
          ['Elaborar propuestas de acción para resolver la problemática general identificada (producto final) y, en la medida de lo posible, ponerlas en marcha.'],
          ['Orienta la formulación de propuestas viables para atender «{PROB}».',
           'Gestiona espacios o apoyos para aplicarlas en el aula, la escuela o la comunidad.'],
          ['Elaboran «{PROD}» con propuestas de acción.',
           'Ponen en marcha lo que sea posible y registran el resultado.'],
          ['Materiales del producto', 'Espacio de aplicación', 'Autorización de familias si se sale del plantel'],
          'Producto final con propuestas de acción', 'Equipos',
          'Desempeño del alumno|Rúbrica de producto|Heteroevaluación',
          ['D1.6', 'D3.7', 'D3.10', 'D4.5']),
      ] },
      { n: 'Fase 5 · Metacognición', lema: 'Se reflexiona sobre todo lo realizado', color: '#be185d', mom: [
        M('Metacognición', 10,
          ['Evaluar y reflexionar sobre la experiencia: planes de trabajo, actuaciones personales y grupales, procedimientos, instrumentos.',
           'Identificar logros, dificultades y fracasos.',
           'Retroalimentación.'],
          ['Conduce la reflexión: ¿qué aprendí?, ¿cómo lo aprendí?, ¿qué haría distinto?',
           'Entrega la retroalimentación final y los resultados de la evaluación.'],
          ['Responden la autoevaluación final y comparten en parejas lo aprendido.',
           'Identifican logros y dificultades y proponen mejoras.'],
          ['Formato de autoevaluación', 'Portafolio de evidencias'],
          'Autoevaluación final y portafolio', 'Binas e individual',
          'Análisis del desempeño|Portafolio con rúbrica|Autoevaluación',
          ['D3.9', 'D4.2', 'D4.4', 'D4.5', 'D4.6'], true),
      ] },
    ],
  },

  // ── ÉTICA, NATURALEZA Y SOCIEDADES ────────────────────────
  abp: {
    id: 'abp', siglas: 'ABP', campo: 'Ética, Naturaleza y Sociedades',
    nombre: 'Aprendizaje basado en problemas (ABP)',
    modalidadPlano: 'Proyecto ABP',
    resumen: 'Los estudiantes parten de un problema, lo formulan con claridad, organizan una ruta de indagación, viven la experiencia y divulgan resultados.',
    fases: [
      { n: 'Fase 1 · Presentemos', lema: 'Reflexión inicial: situamos a los alumnos en el escenario del problema', color: '#2563a8', mom: [
        M('Presentemos', 8,
          ['Promover la reflexión inicial: observarnos en lo individual y lo colectivo en torno al contenido, el diálogo y los ejes articuladores.',
           'Detonante: una imagen o lectura breve con preguntas que sitúen el escenario en el contexto cotidiano.',
           'Planteamiento de la problemática o tema.'],
          ['Escribe en el pizarrón el contenido, el PDA y el propósito; explica las fases del ABP.',
           'Presenta el detonante sobre «{PROB}» con preguntas para reflexionar.',
           'Acuerda las normas de convivencia para el diálogo.'],
          ['Observan el detonante y comparten qué piensan y sienten.',
           'Relacionan la situación con su vida cotidiana y su comunidad.'],
          ['Imagen, lectura breve o video', 'Pizarrón'],
          'Reflexión inicial escrita', 'Plenaria',
          'Interrogatorio|Registro de participación|Heteroevaluación',
          ['G6', 'D1.1', 'D1.3', 'D1.4', 'D1.5', 'D2.1', 'D2.2', 'D3.1', 'D3.2']),
      ] },
      { n: 'Fase 2 · Recolectemos', lema: 'Exploramos y evaluamos los saberes sociales y escolares que poseen los alumnos', color: '#0891b2', mom: [
        M('Recolectemos', 12,
          ['Recuperar saberes, experiencias y conocimientos previos mediante técnicas didácticas.',
           'Plantear preguntas generadoras; definir términos y construir conceptos (selección de contenidos y PDA).',
           'Identificar los factores que inciden en el problema (causas, factores).'],
          ['Aplica una técnica de saberes previos (lluvia de ideas, SQA o mapa de causas).',
           'Formula preguntas generadoras y ayuda a aclarar términos y conceptos de {DIS}.'],
          ['Comparten lo que saben y lo organizan en un mapa de causas y factores.',
           'Definen con sus palabras los conceptos clave.'],
          ['Organizador SQA o mapa de causas', 'Glosario del proyecto'],
          'Mapa de causas y glosario', 'Binas y equipos',
          'Observación|Lista de cotejo|Autoevaluación',
          ['G7', 'D1.2', 'D3.3', 'D3.5', 'D3.6', 'D3.8']),
      ] },
      { n: 'Fase 3 · Formulemos el problema', lema: 'Determinamos con claridad el problema sobre el que se trabajará', color: '#16a34a', mom: [
        M('Formulemos el problema', 10,
          ['Clarificar la pertinencia y relevancia (justificar).',
           'Delimitar el problema, considerando las inquietudes y curiosidades de los alumnos.'],
          ['Guía la redacción de la pregunta-problema a partir de «{PROB}».',
           'Pide justificar su pertinencia y relevancia para el grupo y la comunidad.'],
          ['Redactan y delimitan la pregunta-problema.',
           'Justifican por qué vale la pena resolverla.'],
          ['Formato de pregunta-problema', 'Rúbrica de formulación'],
          'Pregunta-problema delimitada y justificada', 'Equipos y plenaria',
          'Análisis del desempeño|Lista de cotejo|Coevaluación',
          ['D1.4', 'D1.6', 'D3.8', 'D3.10', 'D4.3']),
      ] },
      { n: 'Fase 4 · Organicemos la experiencia', lema: 'Trazamos la ruta de trabajo para la indagación', color: '#7c3aed', mom: [
        M('Organicemos la experiencia', 15,
          ['Planificar las acciones a realizar (ruta de indagación: objetivos, medios, tiempos y responsables).',
           'Organizar al grupo y asignar roles y funciones.',
           'Definir técnicas, instrumentos y recursos a utilizar.',
           'Dar a conocer los criterios e instrumentos de evaluación y su ponderación.'],
          ['Orienta la ruta de trabajo: fuentes, entrevistas, observación, libros, videos.',
           'Organiza comunidades de aprendizaje con roles y socializa la rúbrica (proceso 70 %, producto 30 %).'],
          ['Elaboran su ruta de indagación con responsables y fechas.',
           'Asumen roles: coordinador, relator, vocero y controlador del tiempo.'],
          ['Formato de ruta de indagación', 'Rúbrica de proceso y de producto', 'Formato de roles'],
          'Ruta de indagación', 'Equipos de 4 con roles',
          'Análisis del desempeño|Plan de trabajo con lista de cotejo|Heteroevaluación',
          ['D3.2', 'D3.4', 'D3.5', 'D4.1']),
      ] },
      { n: 'Fase 5 · Vivamos la experiencia', lema: 'Indagamos de forma documental o vivencial para comprender y transformar el problema', color: '#d97706', mom: [
        M('Vivamos la experiencia', 35,
          ['Buscar y procesar información (documental o vivencial) para proponer posibles soluciones al problema.',
           'Acordar las formas de dar a conocer los resultados (productos, evidencias, entregables).'],
          ['Recorre todos los equipos, aclara dudas y plantea contrapreguntas que fomentan el pensamiento crítico.',
           'Ofrece actividades diferenciadas para ritmos y estilos de aprendizaje; imparte minilecciones de {DIS} según el PDA.',
           'Guía el análisis del error en los borradores.'],
          ['Consultan fuentes, entrevistan, observan y registran información sobre «{PROB}».',
           'Se explican entre pares cómo procesan la información (metacognición).',
           'Elaboran los subproductos y proponen soluciones.'],
          ['Libros, revistas y fuentes digitales', 'Guion de entrevista', 'Bitácora', 'Materiales del producto'],
          'Subproductos y propuestas de solución', 'Equipos y binas',
          'Análisis del desempeño|Rúbrica de subproductos|Coevaluación',
          ['D1.2', 'D1.6', 'D2.5', 'D2.8', 'D3.4', 'D3.6', 'D3.7', 'D3.8', 'D3.9', 'D3.10', 'D4.2', 'D4.3', 'D4.5', 'D4.6'], true),
      ] },
      { n: 'Fase 6 · Resultados y análisis', lema: 'Visualizamos los resultados y los divulgamos', color: '#be185d', mom: [
        M('Divulgación de los resultados', 20,
          ['Presentar los productos y las propuestas de solución elaboradas.',
           'Socializar la información.',
           'Retroalimentación; identificar problemas nuevos si es necesario.'],
          ['Organiza la presentación (aula, escuela o comunidad) y registra el desempeño con la rúbrica de producto.',
           'Conduce la reflexión: ¿qué aprendimos?, ¿cómo lo aprendimos?, ¿qué problema nuevo apareció?'],
          ['Presentan «{PROD}» y sus propuestas de solución.',
           'Reciben retroalimentación, se autoevalúan y comparten en parejas lo aprendido.'],
          ['Espacio de presentación', 'Rúbrica de producto', 'Formato de autoevaluación', 'Portafolio de evidencias'],
          'Producto final, autoevaluación y portafolio', 'Equipos, plenaria y binas',
          'Desempeño del alumno|Rúbrica de producto y portafolio|Heteroevaluación, coevaluación y autoevaluación',
          ['D1.6', 'D2.2', 'D3.7', 'D3.9', 'D4.1', 'D4.2', 'D4.3', 'D4.4', 'D4.5', 'D4.6'], true),
      ] },
    ],
  },

  // ── DE LO HUMANO Y LO COMUNITARIO ─────────────────────────
  as: {
    id: 'as', siglas: 'AS', campo: 'De lo Humano y lo Comunitario',
    nombre: 'Aprendizaje servicio',
    modalidadPlano: 'Proyecto AS (Aprendizaje servicio)',
    resumen: 'Los estudiantes detectan una necesidad social, diseñan un servicio como respuesta y desarrollan los aprendizajes necesarios para llevarlo a la práctica.',
    fases: [
      { n: 'Etapa 1 · Punto de partida', lema: 'Detección de una necesidad social', color: '#2563a8', mom: [
        M('Punto de partida', 15,
          ['Identificar los intereses de los estudiantes respecto de las problemáticas susceptibles de ser abordadas.',
           'Sensibilizar sobre la pertinencia y relevancia de la problemática; involucrar a aliados (comunidad escolar y familias).',
           'Determinar el escenario del proyecto: aula, escuela o comunidad.'],
          ['Escribe en el pizarrón el contenido, el PDA y el propósito; explica las etapas del Aprendizaje servicio.',
           'Sensibiliza con testimonios, imágenes o visitas sobre «{PROB}».',
           'Acuerda las normas de convivencia y identifica posibles aliados.'],
          ['Expresan sus intereses y las necesidades que observan en su entorno.',
           'Eligen la necesidad a atender y el escenario del proyecto.'],
          ['Testimonios, imágenes o video', 'Pizarrón y cuaderno de proyecto'],
          'Necesidad social identificada', 'Plenaria',
          'Interrogatorio|Registro de participación|Heteroevaluación',
          ['G6', 'D1.1', 'D1.3', 'D1.4', 'D1.5', 'D1.6', 'D2.1', 'D2.2', 'D3.1', 'D3.2']),
      ] },
      { n: 'Etapa 2 · Lo que sé y lo que quiero saber', lema: 'Se clarifica la realidad con un diagnóstico participativo', color: '#0891b2', mom: [
        M('Lo que sé y lo que quiero saber', 20,
          ['Reconocer y rescatar los conocimientos previos del alumnado.',
           'Elaborar un diagnóstico participativo.',
           'Identificar los recursos con los que se cuenta (o que hay que gestionar) y la posible vinculación con familias y comunidad.',
           'Realizar los ajustes necesarios y proponer posibles soluciones.'],
          ['Aplica un organizador de saberes previos y guía el diagnóstico participativo (encuesta, entrevista, observación).',
           'Plantea preguntas que fomentan el análisis crítico de la información obtenida.'],
          ['Comparten lo que saben y diseñan sus instrumentos de diagnóstico.',
           'Aplican el diagnóstico, analizan los resultados y proponen posibles soluciones.'],
          ['Guion de encuesta o entrevista', 'Organizador SQA', 'Hoja de cálculo o papel milimétrico'],
          'Diagnóstico participativo', 'Equipos y binas',
          'Análisis del desempeño|Rúbrica de diagnóstico|Coevaluación',
          ['G7', 'D1.6', 'D3.3', 'D3.5', 'D3.6', 'D3.8', 'D3.10', 'D4.2']),
      ] },
      { n: 'Etapa 3 · Organicemos las actividades', lema: 'Diseño de un servicio como respuesta', color: '#7c3aed', mom: [
        M('Organicemos las actividades', 15,
          ['Describir las acciones a realizar (recursos, tiempos, responsables) que articulen la intencionalidad pedagógica con la del servicio, respondiendo: ¿qué?, ¿por qué?, ¿para qué?, ¿a quiénes?, ¿cómo?, ¿cuándo?, ¿con qué?, ¿con quiénes?',
           'Dar a conocer los criterios e instrumentos de evaluación y su ponderación.'],
          ['Guía el diseño del plan de servicio con las preguntas clave.',
           'Organiza comunidades de aprendizaje con roles y socializa la rúbrica (proceso 70 %, producto 30 %).'],
          ['Elaboran su plan de servicio: acciones, recursos, fechas y responsables.',
           'Asumen roles y gestionan recursos y permisos con apoyo de sus familias.'],
          ['Formato de plan de servicio', 'Rúbrica de proceso y de producto', 'Carta de autorización para familias'],
          'Plan de servicio', 'Equipos de 4 con roles',
          'Análisis del desempeño|Plan de servicio con lista de cotejo|Heteroevaluación',
          ['D1.6', 'D3.2', 'D3.4', 'D3.5', 'D4.1']),
      ] },
      { n: 'Etapa 4 · Creatividad en marcha', lema: 'Desarrollo de los aprendizajes necesarios para su puesta en práctica', color: '#d97706', mom: [
        M('Creatividad en marcha', 35,
          ['Llevar a la práctica todo lo planificado.',
           'Monitorear y dar seguimiento a las actividades, espacios, tiempos y responsables, tanto de los contenidos curriculares como del servicio.'],
          ['Recorre todos los espacios y equipos, aclara dudas y verifica el avance del servicio.',
           'Imparte minilecciones de {DIS} ligadas al PDA y ofrece actividades diferenciadas por ritmo y estilo de aprendizaje.',
           'Guía el análisis del error cuando algo no sale como se planeó.'],
          ['Realizan el servicio y registran en su bitácora lo que hacen y aprenden.',
           'Se explican entre pares qué aprendieron y cómo (metacognición).',
           'Elaboran «{PROD}» como evidencia del servicio.'],
          ['Materiales y recursos del servicio', 'Bitácora de servicio', 'Cámara o cuaderno para evidencias'],
          'Bitácora y evidencias del servicio', 'Equipos y binas',
          'Análisis del desempeño|Rúbrica de bitácora y servicio|Coevaluación',
          ['D1.2', 'D1.6', 'D2.5', 'D2.8', 'D3.4', 'D3.6', 'D3.7', 'D3.8', 'D3.9', 'D3.10', 'D4.2', 'D4.3', 'D4.5', 'D4.6'], true),
      ] },
      { n: 'Etapa 5 · Compartimos y evaluamos lo aprendido', lema: 'Evaluación final de resultados y continuidad de la experiencia', color: '#be185d', mom: [
        M('Compartimos y evaluamos lo aprendido', 15,
          ['Evaluar los resultados del servicio y los aprendizajes logrados.',
           'Autoevaluación del grado de protagonismo.',
           'Retroalimentación.',
           'Replantear posibilidades: continuar o iniciar algo nuevo.'],
          ['Conduce la evaluación final con la comunidad aliada y entrega retroalimentación.',
           'Guía la reflexión: ¿qué aprendimos?, ¿cómo servimos?, ¿qué sigue?'],
          ['Presentan los resultados del servicio y reciben retroalimentación de la comunidad.',
           'Se autoevalúan y comentan en parejas lo aprendido; deciden si continúan o inician algo nuevo.'],
          ['Formato de autoevaluación', 'Portafolio de evidencias', 'Encuesta de satisfacción a la comunidad'],
          'Evaluación final, autoevaluación y portafolio', 'Plenaria y binas',
          'Análisis del desempeño|Rúbrica de producto y portafolio|Heteroevaluación, coevaluación y autoevaluación',
          ['D1.6', 'D2.2', 'D3.9', 'D4.1', 'D4.2', 'D4.3', 'D4.4', 'D4.5', 'D4.6'], true),
      ] },
    ],
  },
};

const METODOLOGIA_POR_CAMPO = {
  'Lenguajes': 'abpc',
  'Saberes y Pensamiento Científico': 'steam',
  'Ética, Naturaleza y Sociedades': 'abp',
  'De lo Humano y lo Comunitario': 'as',
};

// ── RUTINA DE CADA SESIÓN (lo que el observador revisa en clase) ──
const RUTINA_SESION = [
  { t: 'Inicio · 10 min', items: [
    'Llegar puntual, iniciar a tiempo y pasar lista.',
    'Llevar impreso el plano didáctico y revisar la tarea.',
    'Escribir en el pizarrón el contenido, el PDA y el propósito de la clase.',
    'Recuperar saberes previos y vincularlos con el contenido y el PDA.',
    'Recordar los acuerdos de convivencia.' ] },
  { t: 'Desarrollo · 30 min', items: [
    'Trabajar por comunidades de aprendizaje y con materiales variados.',
    'Recorrer todos los espacios del aula, supervisar y resolver dudas.',
    'Respetar ritmos, evitar la discriminación y mediar los conflictos con diálogo.',
    'Plantear preguntas que desarrollen el pensamiento crítico.' ] },
  { t: 'Cierre · 10 min', items: [
    'Metacognición entre pares: ¿qué aprendí?, ¿cómo?, ¿para qué me sirve?',
    'Retroalimentar el avance y analizar el sentido del error.',
    'Dejar la tarea y concluir en el horario establecido.' ] },
];

// ── ARGUMENTOS PARA EJES Y PERFIL (nivel «argumenta con solidez») ──
const EJE_ARGUMENTO = {
  'Inclusión': 'Se garantiza la participación de todas y todos, con ajustes razonables ante las BAP identificadas, al abordar «{PROB}».',
  'Pensamiento crítico': 'Los estudiantes analizan fuentes, contrastan ideas y argumentan sus juicios sobre «{PROB}» antes de proponer acciones.',
  'Interculturalidad crítica': 'Se reconocen y valoran los saberes, lenguas y prácticas de la comunidad (incluida la cultura maya) al estudiar «{PROB}».',
  'Igualdad de género': 'Se revisan los roles y estereotipos que influyen en «{PROB}» y se asegura una participación equitativa en los equipos.',
  'Vida saludable': 'Se vincula «{PROB}» con el bienestar físico, emocional y social del estudiantado y su comunidad.',
  'Apropiación de las culturas a través de la lectura y la escritura': 'Se leen y producen textos diversos para comprender y comunicar «{PROB}».',
  'Artes y experiencias estéticas': 'Se emplean lenguajes artísticos para expresar y difundir lo aprendido sobre «{PROB}».',
};
const PERFIL_ARGUMENTO = {
  1: 'al ejercer su derecho a participar, decidir y proponer acciones para mejorar su entorno',
  2: 'al valorar la diversidad cultural y lingüística de su comunidad durante el proyecto',
  3: 'al trabajar en equipos con participación equitativa y libre de discriminación',
  4: 'al reconocer sus capacidades y fortalecerlas con roles y retos graduados',
  5: 'al analizar su realidad y argumentar juicios propios sobre «{PROB}»',
  6: 'al relacionar el problema con el cuidado de su salud y de su entorno natural',
  7: 'al indagar y explicar fenómenos y hechos con datos e información fundamentada',
  8: 'al dialogar y cooperar con respeto a la diversidad en comunidades de aprendizaje',
  9: 'al intercambiar ideas mediante distintos lenguajes y llegar a acuerdos',
  10: 'al valorar críticamente los saberes de las ciencias y las humanidades y la cultura local',
};

// ── PROYECTOS SUGERIDOS POR TEMA DE LA PROBLEMÁTICA ──────
// [nombre, producto, tipo]   p: { abpc:[..2], steam:[..2], abp:[..2], as:[..2] }
const PROY_TEMAS = [
  { k: 'lectura', lbl: 'Lectura y escritura', re: /lect|escrit|ortograf|redacc|comprens|vocabul|\bleer\b|\blee\b|\bleen\b|texto/i,
    ejes: ['Apropiación de las culturas a través de la lectura y la escritura', 'Pensamiento crítico'],
    p: {
      abpc: [['Círculo comunitario de lectura «Leemos para conocernos»', 'Antología de textos y círculo de lectura abierto a las familias', 'Comunitario'],
             ['Campaña «Palabras que construyen»', 'Carteles, podcast y periódico mural', 'Escolar']],
      steam: [['¿Cómo leemos? Indagación sobre los hábitos de lectura en mi comunidad', 'Informe con gráficas y propuesta de fomento lector', 'Escolar'],
              ['Biblioteca itinerante: diseño de un módulo de lectura', 'Prototipo de biblioteca móvil y manual de uso', 'Escolar']],
      abp: [['¿Por qué leemos poco en mi escuela?', 'Propuesta de solución documentada y foro estudiantil', 'Escolar'],
            ['Palabras que hieren, palabras que cuidan', 'Guía de lenguaje respetuoso y exposición', 'Áulico']],
      as: [['Lectores solidarios: leer cuentos a niñas y niños de primaria', 'Sesiones de lectura en voz alta y cuentos ilustrados', 'Comunitario'],
           ['Taller de escritura con adultos mayores de la comunidad', 'Libro de relatos de vida', 'Comunitario']],
    } },
  { k: 'convivencia', lbl: 'Convivencia y buen trato', re: /conviv|violen|bullying|acoso|respeto|agresi|conflicto|discrimin|pelea/i,
    ejes: ['Inclusión', 'Igualdad de género', 'Pensamiento crítico'],
    p: {
      abpc: [['Campaña «Aquí nos tratamos bien»', 'Mensajes, cortometraje y carteles de buen trato', 'Escolar'],
             ['Voces contra la violencia escolar', 'Podcast con entrevistas y testimonios', 'Escolar']],
      steam: [['Mapa de convivencia: ¿dónde y cuándo ocurren los conflictos?', 'Mapa de la escuela con datos y plan de acción', 'Escolar'],
              ['Medimos el clima escolar', 'Encuesta, gráficas y propuesta de mejora', 'Escolar']],
      abp: [['¿Qué hacemos ante el acoso escolar?', 'Protocolo de actuación estudiantil y foro', 'Escolar'],
            ['Conflictos en mi comunidad: mediar para convivir', 'Propuesta de mediación y presentación', 'Comunitario']],
      as: [['Brigada de mediadores escolares', 'Brigada capacitada y buzón de convivencia', 'Escolar'],
           ['Recreos con buen trato: juegos cooperativos para primaria', 'Jornada de juegos y manual', 'Comunitario']],
    } },
  { k: 'salud', lbl: 'Salud y alimentación', re: /salud|aliment|obesid|nutri|vapeo|adicci|droga|tabaco|alcohol|sueño|sedent|diabet|chatarra/i,
    ejes: ['Vida saludable', 'Pensamiento crítico'],
    p: {
      abpc: [['Recetario y campaña «Comer bien, vivir mejor»', 'Recetario ilustrado y cartel informativo', 'Comunitario'],
             ['Hablemos claro sobre las adicciones', 'Folleto y spots de radio escolar', 'Escolar']],
      steam: [['¿Qué hay en mi lonchera? Indagación sobre alimentación', 'Análisis de datos nutrimentales y menú saludable', 'Escolar'],
              ['Mido mi actividad física: salud y movimiento', 'Registro, gráficas y plan personal y grupal', 'Áulico']],
      abp: [['¿Por qué crece el consumo de comida chatarra en mi comunidad?', 'Propuesta de intervención y feria informativa', 'Comunitario'],
            ['Adicciones: decisiones informadas', 'Guía de prevención y foro', 'Escolar']],
      as: [['Feria de la salud para la comunidad', 'Módulos informativos con acompañamiento docente', 'Comunitario'],
           ['Huerto escolar saludable', 'Huerto y recetas compartidas con las familias', 'Escolar']],
    } },
  { k: 'ambiente', lbl: 'Medio ambiente', re: /basura|residuo|reciclaj|agua|contamin|ambient|plástic|plastic|calor|clima|árbol|arbol|sequía|sequia|ecolog/i,
    ejes: ['Vida saludable', 'Pensamiento crítico'],
    p: {
      abpc: [['Campaña «Mi comunidad limpia»', 'Carteles, infografías y spot de radio', 'Comunitario'],
             ['Crónicas del agua en mi pueblo', 'Crónicas y entrevistas a personas mayores', 'Comunitario']],
      steam: [['¿Cuánta basura producimos? Indagación y propuesta de reducción', 'Datos, gráficas y prototipo de contenedor o compostero', 'Escolar'],
              ['Calidad del agua en mi comunidad', 'Indagación con muestras y propuesta de cuidado', 'Comunitario']],
      abp: [['¿Qué hacemos con la basura de nuestra escuela?', 'Plan de manejo de residuos y foro', 'Escolar'],
            ['Escasez de agua: causas y soluciones', 'Propuesta de acción y presentación', 'Comunitario']],
      as: [['Brigada de reforestación y limpieza', 'Jornada de limpieza o siembra y bitácora', 'Comunitario'],
           ['Centro de acopio escolar', 'Centro de acopio funcionando y registro de impacto', 'Escolar']],
    } },
  { k: 'tecnologia', lbl: 'Tecnología y redes', re: /celular|redes|internet|digital|tecnolog|videojuego|pantalla|ciber|tiktok|whats|facebook/i,
    ejes: ['Pensamiento crítico', 'Vida saludable'],
    p: {
      abpc: [['Uso crítico de las redes sociales', 'Campaña digital y guía de uso responsable', 'Escolar'],
             ['Noticias y memes: ¿cómo saber qué es verdad?', 'Verificador de noticias y cartel', 'Escolar']],
      steam: [['¿Cuánto tiempo pasamos frente a una pantalla?', 'Informe con gráficas y plan de uso equilibrado', 'Áulico'],
              ['Recurso digital para resolver un problema escolar', 'Prototipo funcional y manual de uso', 'Escolar']],
      abp: [['¿Cómo afecta el celular al aprendizaje?', 'Acuerdos de uso y foro', 'Escolar'],
            ['Ciberacoso: ¿qué hacemos?', 'Guía de prevención y exposición', 'Escolar']],
      as: [['Alfabetización digital para madres, padres y personas mayores', 'Talleres impartidos por estudiantes y guías ilustradas', 'Comunitario'],
           ['Taller de seguridad digital para primaria', 'Taller y materiales didácticos', 'Comunitario']],
    } },
  { k: 'cultura', lbl: 'Cultura e identidad local', re: /maya|lengua|tradic|identidad|cultura|patrimonio|costumbre|indígena|indigena|gastronom|fiesta|local/i,
    ejes: ['Interculturalidad crítica', 'Apropiación de las culturas a través de la lectura y la escritura'],
    p: {
      abpc: [['Voces de mi comunidad: tradición oral y lengua maya', 'Antología bilingüe de relatos y leyendas', 'Comunitario'],
             ['Museo vivo de mi pueblo', 'Exposición oral y escrita del patrimonio local', 'Comunitario']],
      steam: [['Saberes mayas y ciencia: ¿qué sabían nuestros abuelos?', 'Indagación y exposición de saberes tradicionales', 'Comunitario'],
              ['Medidas y calendarios tradicionales', 'Maqueta o juego didáctico', 'Escolar']],
      abp: [['¿Se está perdiendo la lengua maya en mi comunidad?', 'Propuesta de revitalización y presentación', 'Comunitario'],
            ['Patrimonio en riesgo', 'Propuesta de difusión y foro', 'Comunitario']],
      as: [['Rescate de recetas y tradiciones con adultos mayores', 'Libro comunitario de recetas y relatos', 'Comunitario'],
           ['Enseñamos maya: minilecciones para la comunidad escolar', 'Lecciones y material bilingüe', 'Escolar']],
    } },
  { k: 'economia', lbl: 'Matemáticas y economía', re: /matem|calcul|razonam|dinero|econom|finanz|ahorro|consumo|presupuesto|operacion|fraccion|reprob/i,
    ejes: ['Pensamiento crítico', 'Vida saludable'],
    p: {
      abpc: [['¿Cuánto cuesta? Textos que explican el dinero', 'Folleto y video explicativo', 'Escolar'],
             ['Contamos historias con números', 'Infografías narradas y exposición', 'Áulico']],
      steam: [['Economía de mi familia: presupuesto y ahorro', 'Modelo de presupuesto con gráficas', 'Áulico'],
              ['Midiendo mi comunidad: estadística de problemas locales', 'Estudio estadístico y exposición', 'Comunitario']],
      abp: [['¿Por qué falta el dinero en casa? Consumo responsable', 'Plan de ahorro y foro', 'Comunitario'],
            ['Reprobación en matemáticas: ¿qué hacemos?', 'Plan de apoyo entre pares y presentación', 'Escolar']],
      as: [['Asesorías entre pares de matemáticas', 'Programa de tutorías y evidencias de avance', 'Escolar'],
           ['Mercadito solidario de la comunidad', 'Mercado escolar con registro contable', 'Escolar']],
    } },
  { k: 'genero', lbl: 'Igualdad e inclusión', re: /género|genero|igualdad|machis|inclusi|discapac|diversidad|equidad|mujer|nee\b/i,
    ejes: ['Igualdad de género', 'Inclusión'],
    p: {
      abpc: [['Voces sin etiquetas', 'Campaña de carteles y minidocumental', 'Escolar'],
             ['Historias de mujeres de mi comunidad', 'Biografías y exposición', 'Comunitario']],
      steam: [['Mujeres y hombres en la ciencia: ¿qué datos tenemos?', 'Indagación y exposición con datos', 'Áulico'],
              ['Accesibilidad de mi escuela', 'Diagnóstico y propuesta de mejoras', 'Escolar']],
      abp: [['¿Hay igualdad en mi escuela?', 'Diagnóstico y propuesta de acciones', 'Escolar'],
            ['¿Qué barreras enfrentan mis compañeros?', 'Propuesta de ajustes y foro', 'Escolar']],
      as: [['Escuela incluyente: apoyo entre compañeros', 'Programa de acompañamiento y bitácora', 'Escolar'],
           ['Taller de igualdad para primaria', 'Taller y juegos cooperativos', 'Comunitario']],
    } },
];

const PROY_GENERAL = {
  abpc: [['Proyecto comunitario de comunicación para atender la problemática de mi contexto', 'Producto de comunicación (campaña, podcast, periódico mural o antología)', 'Comunitario'],
         ['Investigamos y comunicamos la problemática de mi grupo y mi comunidad', 'Folleto, exposición o video informativo', 'Escolar']],
  steam: [['Indagamos las causas de la problemática de mi contexto', 'Informe de indagación con datos y propuesta de acción', 'Escolar'],
          ['Prototipo para atender la problemática de mi contexto', 'Prototipo o maqueta y exposición de resultados', 'Escolar']],
  abp: [['¿Qué hacemos ante la problemática de mi contexto?', 'Propuesta de solución documentada y foro', 'Escolar'],
        ['Análisis de la problemática en mi comunidad', 'Informe y presentación de propuestas', 'Comunitario']],
  as: [['Servicio a la comunidad para atender la problemática de mi contexto', 'Servicio realizado, bitácora y evidencias', 'Comunitario'],
       ['Servicio entre pares para atender la problemática del grupo', 'Programa de apoyo y registro', 'Escolar']],
};

// ── EVALUACIÓN FORMATIVA (estructura de los formatos oficiales) ──
const EVAL_PROCESO_BASE = [
  ['Actividades realizadas en el salón de clase', 20],
  ['Investigaciones realizadas', 15],
  ['Valoración de actitudes y valores', 10],
  ['Portafolio de evidencias', 15],
  ['Examen o prueba escrita', 10],
];
const EVAL_INSTRUMENTOS_PROCESO = 'Registro de actividades · Instrumento de evaluación para los subproductos · Test de actitudes y valores · Instrumento de evaluación para el portafolio de evidencias · Examen';
const EVAL_INSTRUMENTOS_PRODUCTO = 'Listas de cotejo · Escalas estimativas · Rúbricas';

// ============================================================
// LÓGICA
// ============================================================
function escM(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function probCorta(p) {
  p = (p || '').trim().replace(/\s+/g, ' ');
  if (!p) return 'la problemática de mi contexto';
  const m = p.match(/^[^.!?]+/);
  let s = (m ? m[0] : p).trim();
  if (s.length > 130) s = s.slice(0, 127).replace(/\s+\S*$/, '') + '…';
  return s;
}

function sustituir(txt, ctx) {
  return String(txt)
    .replace(/\{PROB\}/g, ctx.prob)
    .replace(/\{DIS\}/g, ctx.dis || 'la disciplina')
    .replace(/\{PROD\}/g, ctx.prod || 'el producto integrador');
}

function fmtSesiones(units) {
  const ent = Math.floor(units / 2), medio = units % 2;
  if (ent === 0) return '½';
  return ent + (medio ? '½' : '');
}

// Reparte las sesiones (en unidades de media sesión) entre los momentos según su peso.
function distribuirTiempos(fases, totalSes, minSes, sesPorSem) {
  const moms = [];
  fases.forEach(f => f.mom.forEach(m => moms.push(m)));
  const units = Math.max(1, Math.round(totalSes * 2));
  const sumPct = moms.reduce((a, m) => a + m.pct, 0);
  const exacto = moms.map(m => units * m.pct / sumPct);
  const asign = exacto.map(x => Math.max(1, Math.floor(x)));
  let usado = asign.reduce((a, b) => a + b, 0);
  const orden = exacto.map((x, i) => ({ i, r: x - Math.floor(x) })).sort((a, b) => b.r - a.r);
  let k = 0;
  while (usado < units) { asign[orden[k % orden.length].i]++; usado++; k++; }
  // Si los mínimos excedieron el total, quitar de los más grandes (sin bajar de 1)
  while (usado > units) {
    let iMax = -1;
    asign.forEach((a, i) => { if (a > 1 && (iMax < 0 || a > asign[iMax])) iMax = i; });
    if (iMax < 0) break;
    asign[iMax]--; usado--;
  }
  const insuficiente = usado > units;
  let acum = 0;
  const tiempos = asign.map(u => {
    const ini = acum, fin = acum + u; acum = fin;
    const sesIni = Math.floor(ini / 2) + 1, sesFin = Math.max(sesIni, Math.ceil(fin / 2));
    const semIni = Math.ceil(sesIni / sesPorSem), semFin = Math.ceil(sesFin / sesPorSem);
    return { units: u, ses: fmtSesiones(u), min: Math.round(u / 2 * minSes), sesIni, sesFin, semIni, semFin };
  });
  const totalReal = acum / 2;
  return { tiempos, insuficiente, semanas: Math.ceil(Math.max(totalSes, totalReal) / sesPorSem), minSesiones: Math.ceil(moms.length / 2) };
}

function tiempoTexto(t) {
  const ses = t.sesIni === t.sesFin ? `ses. ${t.sesIni}` : `ses. ${t.sesIni}–${t.sesFin}`;
  const sem = t.semIni === t.semFin ? `sem. ${t.semIni}` : `sem. ${t.semIni}–${t.semFin}`;
  return `${t.ses} ses. (${t.min} min) · ${ses} · ${sem}`;
}

// Construye la ruta (copia editable) a partir de la metodología y los datos del docente.
function construirRuta(cfg) {
  const met = METODOLOGIAS[cfg.met];
  const ctx = { prob: probCorta(cfg.prob), dis: cfg.dis, prod: cfg.prod };
  const fases = met.fases.map(f => ({
    n: f.n, lema: f.lema, color: f.color,
    mom: f.mom.map(m => ({
      n: m.n, pct: m.pct, retro: m.retro, obs: m.obs.slice(),
      acc: m.acc.map(x => sustituir(x, ctx)),
      doc: m.doc.map(x => sustituir(x, ctx)),
      alu: m.alu.map(x => sustituir(x, ctx)),
      rec: m.rec.slice(),
      evi: m.evi, org: m.org, eva: { ...m.eva },
    })),
  }));
  const dist = distribuirTiempos(met.fases, cfg.totalSes, cfg.minSes, cfg.sesPorSem);
  let i = 0;
  fases.forEach(f => f.mom.forEach(m => { m.t = dist.tiempos[i++]; }));
  return {
    met: cfg.met, esc: cfg.esc, prob: cfg.prob, dis: cfg.dis, fases,
    totalSes: cfg.totalSes, minSes: cfg.minSes, sesPorSem: cfg.sesPorSem,
    semanas: dist.semanas, insuficiente: dist.insuficiente, minSesiones: dist.minSesiones,
    bap: cfg.bap || '', espacios: cfg.espacios || '', recursosPlantel: cfg.recursosPlantel || '',
    evalProceso: EVAL_PROCESO_BASE.map(([n, p]) => [n, p]),
    comp: null, usar: false,
  };
}

// Recalcula solo los tiempos (sin tocar los textos editados).
function recalcularTiempos(ruta, totalSes, minSes, sesPorSem) {
  const met = METODOLOGIAS[ruta.met];
  const dist = distribuirTiempos(met.fases, totalSes, minSes, sesPorSem);
  let i = 0;
  ruta.fases.forEach(f => f.mom.forEach(m => { m.t = dist.tiempos[i++]; }));
  ruta.totalSes = totalSes; ruta.minSes = minSes; ruta.sesPorSem = sesPorSem;
  ruta.semanas = dist.semanas; ruta.insuficiente = dist.insuficiente; ruta.minSesiones = dist.minSesiones;
}

// Sugiere proyectos según la problemática escrita por el docente.
function sugerirProyectos(metId, problematica, escenario) {
  const texto = (problematica || '');
  const ctx = { prob: probCorta(texto), dis: '', prod: '' };
  const puntaje = PROY_TEMAS.map(t => ({ t, n: (texto.match(new RegExp(t.re.source, 'gi')) || []).length }))
    .filter(x => x.n > 0).sort((a, b) => b.n - a.n);
  const salida = [];
  const push = (tema, arr, lbl, ejes) => arr.forEach(([nombre, producto, tipo]) =>
    salida.push({ nombre: sustituir(nombre, ctx), producto: sustituir(producto, ctx), tipo, tema: lbl, ejes: ejes || [] }));
  if (puntaje[0]) push(puntaje[0].t, puntaje[0].t.p[metId], puntaje[0].t.lbl, puntaje[0].t.ejes);
  if (puntaje[1]) push(puntaje[1].t, puntaje[1].t.p[metId].slice(0, 1), puntaje[1].t.lbl, puntaje[1].t.ejes);
  push(null, PROY_GENERAL[metId].slice(0, puntaje[0] ? 1 : 2), 'Basado en tu problemática', []);
  const pref = { aula: 'Áulico', escuela: 'Escolar', comunidad: 'Comunitario' }[escenario];
  // Primero los que coinciden con el escenario elegido
  salida.sort((a, b) => (b.tipo === pref) - (a.tipo === pref));
  return salida.slice(0, 5);
}

function ajustesSugeridos(bap) {
  const t = (bap || '').toLowerCase();
  const a = [
    'Tiempo: tiempo adicional o actividades fraccionadas en pasos cortos para quien lo requiera.',
    'Organización: agrupamientos flexibles (binas, triadas y equipos) con roles que favorezcan la participación de todas y todos.',
    'Materiales: recursos multisensoriales (visuales, auditivos y táctiles) y textos con apoyo de imágenes.',
    'Evaluación: instrumentos y evidencias alternativas (oral, gráfica o práctica) para valorar el mismo PDA.',
    'Coordinación con USAER, orientación educativa y familias para acordar apoyos y ajustes razonables.',
  ];
  if (/lectur|lectoescr|dislex|escrit|comprens/.test(t)) a.push('Lectura: lectura en voz alta, textos adaptados y organizadores gráficos para estudiantes con dificultades de lectoescritura.');
  if (/atenci|tdah|hiperact|concentr/.test(t)) a.push('Atención: instrucciones breves y secuenciadas, pausas activas y ubicación cercana al docente.');
  if (/maya|lengua|bilingü|bilingu|indígena|indigena/.test(t)) a.push('Lengua: instrucciones y glosario bilingües (español–maya) y apoyo entre pares hablantes.');
  if (/visual|auditiv|motriz|discapac|nee|barrera/.test(t)) a.push('Accesibilidad: adecuar espacios, mobiliario y materiales según las necesidades específicas identificadas.');
  if (/econ|recurso|material|cost|dinero|pobre/.test(t)) a.push('Recursos: materiales de bajo costo o reutilizables y préstamo de materiales del plantel.');
  return a;
}

function espaciosSugeridos(esc, espacios) {
  const base = { aula: 'Aula (trabajo en equipos y plenaria)', escuela: 'Aula, patio, biblioteca y sala de cómputo del plantel', comunidad: 'Aula y espacios de la comunidad (con acompañamiento docente y autorización de madres, padres o tutores)' }[esc] || 'Aula';
  return (espacios && espacios.trim() ? espacios.trim() : base) + '. Se garantiza en todo momento la integridad de las niñas, niños y adolescentes.';
}

// ── AUTOVERIFICACIÓN CONTRA LOS INSTRUMENTOS ──────────────
// ctx: { ruta, prob, ejes[], perfil[], nContenidos, proy, prod, prop, inter, bap, espacios, comp }
function verificarIndicadores(c) {
  const largo = (s, n) => (s || '').trim().length >= n;
  const hay = s => (s || '').trim().length > 0;
  const r = c.ruta;
  const ok = (txt) => ({ txt, e: 'ok' });
  const par = (txt, ayuda) => ({ txt, e: 'parcial', ayuda });
  const no = (txt, ayuda) => ({ txt, e: 'falta', ayuda });
  const ev = (cond, parcialCond, txt, ayuda) => cond ? ok(txt) : (parcialCond ? par(txt, ayuda) : no(txt, ayuda));

  const sesionesOk = r && !r.insuficiente;
  const comp = c.comp || {};

  const pa = [
    ev(largo(c.prob, 80), hay(c.prob), 'Problemática(s) y justificación', 'Descríbela con datos de tu contexto: qué pasa, a quién afecta y por qué importa (mín. 80 caracteres).'),
    ok('Tipo de proyecto: áulico, escolar o comunitario'),
    ev(hay(c.proy), false, 'Nombre del proyecto', 'Elige una sugerencia o escribe el nombre del proyecto.'),
    ev(largo(c.prop, 40), hay(c.prop), 'Propósito del proyecto', 'Redacta qué lograrán los estudiantes (usa «Pasar este proyecto al Plano Didáctico» para precargarlo).'),
    ev(c.perfil.length > 0, false, 'Perfil de egreso', 'Marca los rasgos del perfil de egreso que se desarrollan.'),
    ev(hay(comp.finalidades), false, 'Finalidades del campo formativo', 'Se completan al generar el Plano (o con «Mejorar las actividades con IA»).'),
    ev(hay(comp.especificidad), false, 'Especificidad del campo formativo', 'Se completa al generar el Plano (o con «Mejorar las actividades con IA»).'),
    ev(c.nContenidos > 0, false, 'Mapeo de contenidos y PDA de la disciplina', 'Selecciona los contenidos del trimestre.'),
    ev(sesionesOk, !!r, 'Temporalidad por periodo', 'Con pocas sesiones algunos momentos quedan por debajo de media sesión; aumenta el número de sesiones.'),
    ev(hay(c.inter), false, 'Interdisciplinariedad', 'Describe cómo se vinculan otras disciplinas del campo (campo «Interdisciplinariedad»).'),
    ok('Metodología sociocrítica y proyecto integrador'),
    ev(c.ejes.length > 0, false, 'Ejes articuladores por cada contenido', 'Marca los ejes articuladores que aplican.'),
    ok('Orientaciones y estrategias didácticas generales'),
    ok('Productos o entregables y evidencias'),
    ok('Instrumentos de evaluación'),
  ];

  const pd = {
    'Factor 1 · Contextualización': [
      ev(largo(c.prob, 80), hay(c.prob), 'Describe la problematización de la realidad que da sentido a la intervención', 'Agrega situaciones concretas y datos del contexto; argumenta por qué es relevante.'),
      ev(c.ejes.length > 0, false, 'Enuncia los ejes articuladores y explica por qué los eligió', 'Marca los ejes; la ruta redacta el argumento de cada uno.'),
    ],
    'Factor 2 · Conocimiento del currículo': [
      ev(c.nContenidos > 0, false, 'Especifica los contenidos a trabajar (del programa analítico)', 'Selecciona los contenidos del trimestre.'),
      ev(c.nContenidos > 0, false, 'Especifica los PDA de la disciplina', 'Los PDA se cargan al seleccionar el contenido.'),
      ev(hay(comp.finalidades), false, 'Especifica las finalidades del campo formativo', 'Se completan al generar el Plano (o con «Mejorar las actividades con IA»).'),
      ev(c.perfil.length > 0, false, 'Argumenta los rasgos del perfil de egreso', 'Marca los rasgos; la ruta redacta cómo se contribuye a cada uno.'),
    ],
    'Factor 3 · Estrategias didácticas': [
      ok('Enuncia una metodología sociocrítica propuesta por la NEM y la justifica'),
      ok('Describe actividades congruentes con las fases de la metodología'),
      ev(c.perfil.length > 0, false, 'Describe las actividades que contribuyen al perfil de egreso', 'Marca los rasgos del perfil de egreso.'),
      ev(hay(c.bap), false, 'Ajusta las estrategias a la diversidad del aula', 'Describe las BAP y la diversidad de tu grupo; la ruta propone ajustes.'),
      ev(hay(c.recursosPlantel), true, 'Registra los recursos didácticos (plantel, contexto y comunidad)', 'Anota los recursos con que cuentas; ya hay recursos base por momento.'),
      ev(hay(c.espacios), true, 'Describe espacios para gestionar ambientes de aprendizaje', 'Anota los espacios que usarás; se propone uno según el escenario.'),
      ev(sesionesOk, !!r, 'Especifica la temporalidad de cada fase', 'Aumenta el número de sesiones para que cada momento tenga tiempo suficiente.'),
    ],
    'Factor 4 · Interacciones': [
      ok('Establece y justifica diversas formas de organización grupal'),
      ev(hay(c.bap), false, 'Especifica los ajustes razonables para estudiantes con BAP', 'Describe las BAP de tu grupo para precisar los ajustes.'),
    ],
    'Factor 5 · Evaluación formativa': [
      ok('Establece criterios de evaluación congruentes con contenidos y PDA, tomados de los PDA (proceso 70 % · producto 30 %)'),
      ok('Menciona técnicas e instrumentos para valorar el proceso'),
      ok('Menciona técnicas e instrumentos para valorar el producto'),
      ev(hay(c.bap), true, 'Incluye técnicas e instrumentos que consideran la diversidad', 'Describe las BAP de tu grupo para adecuar la evaluación.'),
      ok('Incluye retroalimentación al término de los temas (momentos marcados en la ruta)'),
    ],
  };

  // Observación de la intervención: cobertura calculada con las etiquetas de la ruta
  const cubre = {};
  if (r) r.fases.forEach(f => f.mom.forEach(m => m.obs.forEach(o => { (cubre[o] = cubre[o] || []).push(m.n.replace(/^Momento \d+ · /, '')); })));
  const OBS = {
    'Dimensión 1 · Implementación del currículo': [
      ['D1.1', 'Demuestra dominio de los principios de la Nueva Escuela Mexicana'],
      ['D1.2', 'Demuestra dominio de contenidos y PDA con estrategias didácticas'],
      ['D1.3', 'Aclara dudas sobre la metodología del proyecto'],
      ['D1.4', 'Adecúa los contenidos al contexto'],
      ['D1.5', 'Conoce las características y necesidades de los estudiantes'],
      ['D1.6', 'Promueve el vínculo comunitario'],
    ],
    'Dimensión 2 · Ambiente para el aprendizaje': [
      ['D2.1', 'Establece acuerdos de convivencia'],
      ['D2.2', 'Propicia diálogo y confianza para expresar emociones y dudas'],
      ['D2.5', 'Respeta el ritmo de aprendizaje'],
      ['D2.8', 'Recorre el salón para supervisar y resolver dudas'],
    ],
    'Dimensión 3 · Estrategias y recursos didácticos': [
      ['D3.1', 'Desarrolla la metodología que aborda la situación problema'],
      ['D3.2', 'Distingue las fases o momentos de la metodología'],
      ['D3.3', 'Rescata los saberes previos'],
      ['D3.4', 'Organiza pequeñas comunidades de aprendizaje'],
      ['D3.5', 'Fomenta herramientas para sistematizar el aprendizaje'],
      ['D3.6', 'Considera los estilos de aprendizaje (visual, auditivo, kinestésico)'],
      ['D3.7', 'Utiliza materiales y recursos didácticos'],
      ['D3.8', 'Favorece el pensamiento crítico'],
      ['D3.9', 'Emplea estrategias entre pares para la metacognición'],
      ['D3.10', 'Emplea estrategias en la solución de situaciones problemáticas'],
    ],
    'Dimensión 4 · Evaluación': [
      ['D4.1', 'Utiliza criterios de evaluación acordes al proyecto'],
      ['D4.2', 'Retroalimenta de manera constante'],
      ['D4.3', 'Propicia la retroalimentación entre pares'],
      ['D4.4', 'Propicia la autoevaluación'],
      ['D4.5', 'Utiliza instrumentos para valorar el avance'],
      ['D4.6', 'Interpreta el sentido del error para intervenir'],
    ],
  };
  const obs = {};
  Object.entries(OBS).forEach(([dim, arr]) => {
    obs[dim] = arr.map(([id, txt]) => {
      const donde = cubre[id];
      if (donde && donde.length) return { txt, e: 'ok', donde: donde.slice(0, 3).join(', ') + (donde.length > 3 ? ` y ${donde.length - 3} más` : '') };
      return { txt, e: 'falta', ayuda: 'Diseña la ruta para ver en qué momentos se atiende.' };
    });
  });
  // D1.4 y D1.5 también dependen de que el docente describa su contexto
  ['D1.4', 'D1.5'].forEach(id => {
    const it = obs['Dimensión 1 · Implementación del currículo'].find(x => x.txt.startsWith(id === 'D1.4' ? 'Adecúa' : 'Conoce'));
    if (it && it.e === 'ok' && !largo(c.prob, 80)) { it.e = 'parcial'; it.ayuda = 'Describe tu problemática con datos del contexto y del grupo para que sea evidente la adecuación.'; }
  });

  return { pa, pd, obs };
}

function resumenVerif(grupo) {
  const items = Array.isArray(grupo) ? grupo : Object.values(grupo).flat();
  const total = items.length;
  const ok = items.filter(x => x.e === 'ok').length;
  const par = items.filter(x => x.e === 'parcial').length;
  return { total, ok, par, falta: total - ok - par };
}

// ── ARGUMENTACIÓN DE EJES Y PERFIL ────────────────────────
function argumentarEjes(ejes, prob) {
  const ctx = { prob: probCorta(prob), dis: '', prod: '' };
  return ejes.map(e => ({ eje: e, arg: sustituir(EJE_ARGUMENTO[e] || 'Se vincula con la problemática del proyecto.', ctx) }));
}
function argumentarPerfil(rasgos, prob) {
  const ctx = { prob: probCorta(prob), dis: '', prod: '' };
  return rasgos.map(txt => {
    const num = parseInt(txt, 10);
    const corto = txt.replace(/^\d+\.\s*/, '');
    const arg = PERFIL_ARGUMENTO[num] ? sustituir(PERFIL_ARGUMENTO[num], ctx) : 'mediante las actividades del proyecto';
    return { rasgo: txt, arg: `Se contribuye ${arg}.`, corto };
  });
}

// ── DOCUMENTO WORD: RUTA / PLANO EN FORMATO OFICIAL ──────
function listaHTML(arr) {
  return '<ul style="margin:0;padding-left:16px;">' + arr.map(x => `<li>${escM(x)}</li>`).join('') + '</ul>';
}

function tablaFasesHTML(ruta) {
  const C = '#BDD7EE';
  const cel = (t, extra) => `<td style="border:1px solid #000;padding:5px 8px;vertical-align:top;${extra || ''}">${t}</td>`;
  let h = '';
  ruta.fases.forEach(f => {
    h += `<table style="width:100%;border-collapse:collapse;margin-top:12px;">
<tr><td colspan="4" style="border:1px solid #000;padding:6px 8px;background:${C};font-weight:bold;">${escM(f.n.toUpperCase())}: ${escM(f.lema)}</td></tr>
<tr>${['Tiempo (didáctico y cronológico)', 'Acciones', 'Actividades (del docente y del alumno)', 'Recursos (del docente y del alumno)']
        .map((t, i) => `<td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:#E2EFDA;width:${['17%', '25%', '38%', '20%'][i]};">${t}</td>`).join('')}</tr>`;
    f.mom.forEach(m => {
      const ev = `<p style="margin:4px 0 0;font-size:90%;"><strong>Evidencia:</strong> ${escM(m.evi)}. <strong>Organización:</strong> ${escM(m.org)}. <strong>Evaluación:</strong> ${escM(m.eva.tec)} · ${escM(m.eva.inst)} · ${escM(m.eva.mod)}.${m.retro ? ' <strong>Retroalimentación:</strong> sí.' : ''}</p>`;
      h += `<tr>
${cel(`<strong>${escM(m.n)}</strong><br>${escM(m.t.ses)} ses. (${m.t.min} min)<br>${m.t.sesIni === m.t.sesFin ? 'Sesión ' + m.t.sesIni : 'Sesiones ' + m.t.sesIni + '–' + m.t.sesFin}<br>${m.t.semIni === m.t.semFin ? 'Semana ' + m.t.semIni : 'Semanas ' + m.t.semIni + '–' + m.t.semFin}`)}
${cel(listaHTML(m.acc))}
${cel(`<strong>Docente:</strong>${listaHTML(m.doc)}<strong>Alumnado:</strong>${listaHTML(m.alu)}${ev}`)}
${cel(listaHTML(m.rec))}
</tr>`;
    });
    h += '</table>';
  });
  return h;
}

function evaluacionHTML(ruta, d) {
  const C = '#BDD7EE';
  const th = (t, w) => `<td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};${w ? 'width:' + w + ';' : ''}vertical-align:top;">${t}</td>`;
  const td = (t) => `<td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${t}</td>`;
  const proc = ruta.evalProceso;
  const sumProc = proc.reduce((a, [, p]) => a + (Number(p) || 0), 0);
  const filasProc = proc.map(([n, p]) => `<tr>${td(escM(n))}${td(p + ' %')}</tr>`).join('');
  const retro = [];
  ruta.fases.forEach(f => f.mom.forEach(m => { if (m.retro) retro.push(`${m.n} (${m.t.sesIni === m.t.sesFin ? 'ses. ' + m.t.sesIni : 'ses. ' + m.t.sesIni + '–' + m.t.sesFin})`); }));
  return `
<h3 style="margin-top:14px;">EVALUACIÓN FORMATIVA</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
<tr>${th('Criterios de evaluación / ponderación (conocimientos, habilidades, destrezas, actitudes, valores)', '30%')}${td(`<strong>Proceso ${sumProc} %</strong> · <strong>Producto ${100 - sumProc} %</strong>` + (d ? listaHTML(criteriosEvaluacion(d, ruta)) : ''))}</tr>
</table>
<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
<tr>${th('Estrategia de evaluación', '14%')}${th('Técnicas', '18%')}${th('Modalidades', '16%')}${th('Actividades evaluativas (solo las ponderadas)', '24%')}${th('Instrumentos de evaluación', '28%')}</tr>
<tr>${td('<strong>Del proceso</strong> (' + sumProc + ' %)')}${td('Observación · Desempeño del alumno · Análisis del desempeño · Interrogatorio')}${td('Autoevaluación · Coevaluación · Heteroevaluación')}
${td('<table style="width:100%;border-collapse:collapse;">' + filasProc + '</table>')}${td(EVAL_INSTRUMENTOS_PROCESO)}</tr>
<tr>${td('<strong>Del producto</strong> (' + (100 - sumProc) + ' %)')}${td('Observación · Desempeño del alumno · Análisis del desempeño · Interrogatorio')}${td('Autoevaluación · Coevaluación · Heteroevaluación')}
${td(escM(ruta.proyecto ? ruta.proyecto.producto : 'Producto integrador'))}${td(EVAL_INSTRUMENTOS_PRODUCTO)}</tr>
</table>
<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
<tr>${th('Momentos de retroalimentación', '30%')}${td(escM(retro.join(' · ')) + '. La retroalimentación es bidireccional (docente–estudiantes y entre pares) y busca que cada estudiante identifique sus avances y áreas de oportunidad.')}</tr>
</table>`;
}

function rutinaHTML() {
  return `<table style="width:100%;border-collapse:collapse;margin-bottom:8px;"><tr>` +
    RUTINA_SESION.map(b => `<td style="border:1px solid #000;padding:5px 8px;vertical-align:top;width:33%;"><strong>${b.t}</strong>${listaHTML(b.items)}</td>`).join('') + '</tr></table>';
}


// ── Textos que la rúbrica pide justificar / argumentar ────
function primeraOracion(t, max) {
  t = String(t || '').replace(/\s+/g, ' ').trim();
  const m = t.match(/^[^.!?]+[.!?]?/);
  let s = (m ? m[0] : t).trim();
  if (s.length > (max || 220)) s = s.slice(0, (max || 220) - 1).replace(/\s+\S*$/, '') + '…';
  return s.replace(/[.!?]+$/, '');
}
function minuscula1(t) { t = String(t || ''); return t.charAt(0).toLowerCase() + t.slice(1); }

function justificarMetodologia(ruta, d) {
  const met = METODOLOGIAS[ruta.met];
  return `${met.resumen} Se elige porque es una metodología sociocrítica propuesta por la NEM para el campo formativo ${d.campo || ''}, centra el aprendizaje en la actividad del estudiante y permite atender la problemática del contexto: «${probCorta(ruta.prob || d.problematizacion)}».`;
}

function organizacionGrupalTexto(ruta) {
  const orgs = [];
  ruta.fases.forEach(f => f.mom.forEach(m => { if (m.org && !orgs.includes(m.org)) orgs.push(m.org); }));
  return `${orgs.join(' · ')}. Justificación: las formas de organización son congruentes con la metodología (${METODOLOGIAS[ruta.met].nombre}); alternar plenaria, equipos y trabajo individual propicia la interacción y la movilidad de los estudiantes, favorece el aprendizaje y la participación, y cuida su bienestar personal.`;
}

function espaciosJustificados(ruta) {
  return espaciosSugeridos(ruta.esc, ruta.espacios) + ' Justificación: son los espacios donde se realizan las actividades de cada fase (trabajo en equipo, búsqueda y análisis de información, elaboración y presentación del producto) y permiten atender la diversidad del grupo.';
}

// Criterios de evaluación congruentes con los contenidos y PDA (Factor 5, reactivo 1)
function criteriosEvaluacion(d, ruta) {
  const items = [];
  (d.contenidos || []).forEach(c => {
    const pda = primeraOracion(typeof obtenerPDA === 'function' ? obtenerPDA(c, d.grado) : '', 230);
    if (pda) items.push(`Conocimientos y habilidades — «${c.titulo}»: demuestra que ${minuscula1(pda)}.`);
  });
  const ejes = (d.ejes || '').split(/\s*[,|]\s*/).filter(Boolean);
  items.push(`Actitudes y valores: participa, colabora y respeta las ideas propias y ajenas durante las actividades${ejes.length ? ', en congruencia con los ejes articuladores (' + ejes.join(', ') + ')' : ''}.`);
  const prod = (ruta.proyecto && ruta.proyecto.producto) || d.productoIntegrador || 'el producto integrador';
  items.push(`Producto — ${prod}: pertinencia con la problemática, calidad del contenido, claridad, creatividad y utilidad para la comunidad.`);
  return items;
}

// Documento completo en el formato oficial del Plano Didáctico.
function construirHTMLPlanoRuta(d, ruta, comp) {
  const C = '#BDD7EE';
  const th = (t, w) => `<td style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};${w ? 'width:' + w + ';' : ''}vertical-align:top;">${t}</td>`;
  const td = (t) => `<td style="border:1px solid #000;padding:5px 8px;vertical-align:top;">${t || '&nbsp;'}</td>`;
  const tr = (...c) => `<tr>${c.join('')}</tr>`;
  const met = METODOLOGIAS[ruta.met];
  comp = comp || {};
  const ejes = (d.ejes || '').split(/\s*[,|]\s*/).filter(Boolean);
  const rasgos = (d.perfil || '').split(/\n\n+/).filter(Boolean);
  const ejesArg = argumentarEjes(ejes, ruta.prob || d.problematizacion);
  const perfilArg = argumentarPerfil(rasgos, ruta.prob || d.problematizacion);
  const trNom = d.trimestre === '1' ? 'PRIMER' : d.trimestre === '2' ? 'SEGUNDO' : 'TERCER';
  const tipo = { aula: 'Áulico', escuela: 'Escolar', comunidad: 'Comunitario' }[ruta.esc] || '';
  const escenarioTxt = { aula: 'Aula', escuela: 'Escuela', comunidad: 'Comunidad' }[ruta.esc] || '';
  const contenidosHTML = (d.contenidos || []).map(c =>
    `<tr>${td('<strong>Contenido:</strong> ' + escM(c.titulo))}${td('<strong>PDA:</strong> ' + escM(obtenerPDA(c, d.grado)))}</tr>`).join('');
  const ajustes = ajustesSugeridos(ruta.bap);
  const espacios = espaciosSugeridos(ruta.esc, ruta.espacios);
  const pr = ruta.proyecto || {};

  return `
${(d.tipoEscuela || '').trim() ? `<p style="text-align:center;margin:0;"><strong>${escM(d.tipoEscuela.trim())}</strong></p>` : ''}
<p style="text-align:center;margin:0;">Supervisión de la Zona Escolar ${escM((d.zona || '').trim() || '____')} &nbsp; Curso escolar: ${escM((d.cicloEscolar || '').trim() || '202__-202__')}</p>
<p style="margin:6px 0 0;"><strong>Escuela secundaria:</strong> ${escM(d.escuela)} &nbsp; <strong>C.C.T.</strong> ${escM(d.cct || '')}</p>
<p style="margin:0;"><strong>Nombre del docente:</strong> ${escM(d.docente)} &nbsp; <strong>Grado:</strong> ${escM(d.grado)}° &nbsp; <strong>Grupo:</strong> ${escM(d.grupo || '')}</p>
<h2 style="text-align:center;font-weight:bold;margin:10px 0;">PLANO DIDÁCTICO</h2>
<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
${tr(th('Campo formativo', '28%'), td(escM(d.campo)))}
${tr(th('Modalidad'), td(escM(met.modalidadPlano) + ' (' + escM(met.nombre) + ') — Proyecto ' + escM(tipo) + '<br><em>Justificación: ' + escM(justificarMetodologia(ruta, d)) + '</em>'))}
${tr(th('Escenario'), td(escM(escenarioTxt)))}
${tr(th('Periodo'), td(trNom + ' TRIMESTRE'))}
${tr(th('Disciplina'), td(escM(d.disciplina)))}
${tr(th('Nombre del proyecto'), td(escM(d.nombreProyecto)))}
${tr(th('Problematización de la realidad'), td(escM(d.problematizacion || ruta.prob)))}
${tr(th('Propósitos generales del proyecto'), td(escM(d.proposito)))}
${tr(th('Propósitos específicos de la disciplina'), td(escM(comp.propositoDisciplina || ('Que el alumnado logre, en ' + (d.disciplina || 'la disciplina') + ', los PDA de los contenidos seleccionados (' + (d.contenidos || []).map(c => c.titulo).join('; ') + ') mediante el proyecto «' + (d.nombreProyecto || '') + '».'))))}
${tr(th('Perfil de egreso al cual se contribuye'), td(perfilArg.length ? perfilArg.map(p => `<p style="margin:0 0 4px;"><strong>${escM(p.rasgo.split('.')[0])}.</strong> ${escM(p.corto)}<br><em>${escM(p.arg)}</em></p>`).join('') : escM(comp.perfil || '')))}
${tr(th('Finalidades del campo formativo'), td(escM(comp.finalidades || '[Escribe aquí las finalidades del campo formativo según el Programa Sintético]')))}
${tr(th('Especificidades del campo formativo'), td(escM(comp.especificidad || '[Escribe aquí las especificidades del campo formativo]')))}
${tr(th('Ejes articuladores'), td(ejesArg.length ? ejesArg.map(e => `<p style="margin:0 0 4px;"><strong>${escM(e.eje)}:</strong> ${escM(e.arg)}</p>`).join('') : ''))}
${tr(th('Interdisciplinariedad'), td(escM(d.disciplinasAdicionales || comp.interdisciplinariedad || '')))}
</table>
<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
<tr><td colspan="2" style="border:1px solid #000;padding:5px 8px;font-weight:bold;background:${C};">CONTENIDOS Y PDA — ${escM(d.disciplina)}</td></tr>
${contenidosHTML}
<tr>${th('Contenidos de codiseño (si fueren necesarios)', '28%')}${td(escM(d.codiseno || 'No se requieren contenidos de codiseño en este periodo.'))}</tr>
<tr>${th('Productos (tangibles o intangibles, entregables)', '28%')}${td('<strong>' + escM(d.disciplina) + ':</strong> ' + escM(pr.producto || d.productoIntegrador || '') + (d.productoSecundario ? '<br><strong>Otro producto:</strong> ' + escM(d.productoSecundario) : ''))}</tr>
</table>
<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
${tr(th('Temporalidad (meses, semanas / número de sesiones)', '28%'), td(`${ruta.totalSes} sesiones de ${ruta.minSes} minutos · ${ruta.semanas} semanas (${ruta.sesPorSem} sesiones por semana)`))}
</table>
<p style="margin:8px 0 2px;"><strong>Rutina de cada sesión</strong> (orientaciones y estrategias didácticas generales)</p>
${rutinaHTML()}
${tablaFasesHTML(ruta)}
${evaluacionHTML(Object.assign({}, ruta, { proyecto: pr }), d)}
<table style="width:100%;border-collapse:collapse;margin-top:8px;">
${tr(th('Organización grupal', '28%'), td(escM(organizacionGrupalTexto(ruta))))}
${tr(th('Espacios para el aprendizaje'), td(escM(espaciosJustificados(ruta))))}
${tr(th('Observaciones'), td(''))}
${tr(th('Ajustes (de tiempo, espacios, organización, materiales y/o recursos, para atender a la diversidad)'), td(listaHTML(ajustes) + (ruta.bap ? `<p style="margin:4px 0 0;"><strong>BAP y diversidad identificadas:</strong> ${escM(ruta.bap)}</p>` : '')))}
</table>`;
}
