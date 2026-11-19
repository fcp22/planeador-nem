// ============================================================
// SUGERENCIAS AUTOMÁTICAS EN EL PLANO DIDÁCTICO Y EN EL PROGRAMA ANALÍTICO
//
// Al elegir los contenidos, la app propone (sin gastar IA y siempre editable) los ejes articuladores, los rasgos
// del perfil de egreso, el propósito, la interdisciplinariedad, el nombre del proyecto, la problematización y el
// producto integrador. Todo queda marcado como «(sugerido)». Si el docente escribe o marca algo, ya no se le pisa.
//
// Depende de: ruta-ui.js (rEl, rVal, sugMarcar, sugPoner, SUG_IDS, modalidadAMetodologia, listaSugerida,
//             propositoSugerido, primeraProblematica), metodologias.js (PROY_GENERAL, sustituir, probCorta,
//             minuscula1), curriculum.js (CAMPOS_POR_GRADO, obtenerPDA), index.html (cD, cA, modalidadD).
// ============================================================

let SUGP_OCUPADO = false;       // true mientras la app marca casillas (para no confundirlo con un clic del docente)
let sugpIdx = 0;                // «Sugerir otro»: cuál de las propuestas toca
SUG_IDS.push('d-prop', 'd-prob', 'd-inter');

const SUGP_EJES = {
  'Vida saludable': /salud|aliment|nutri|cuerpo|sexual|adicci|alcohol|droga|ejercicio|deport|higiene|bienestar|emoci|ambient|sustent|consumo/i,
  'Igualdad de género': /g[eé]nero|mujer|hombre|equidad|igualdad|estereotip|violencia|machis/i,
  'Interculturalidad crítica': /intercultural|maya|ind[ií]gena|lengua|diversidad|cultur|pueblo|identidad|tradici|patrimonio/i,
  'Inclusión': /inclus|discapac|barrera|derechos|discrimin|equidad/i,
  'Apropiación de las culturas a través de la lectura y la escritura': /lect|escrit|texto|redact|leer|narr|poes|literar|ortograf|comprensi|noticia|cuento/i,
  'Artes y experiencias estéticas': /arte|art[ií]stic|m[uú]sic|danza|teatr|pintur|expresi[oó]n|est[eé]tic|dibujo|imagen|cultura visual/i,
};
const SUGP_CAMPO_EJES = [
  [/lenguaje/i, { 'Apropiación de las culturas a través de la lectura y la escritura': 2, 'Interculturalidad crítica': 1 }],
  [/saberes|cient/i, { 'Vida saludable': 1, 'Inclusión': 1 }],
  [/[eé]tica|naturaleza|sociedades/i, { 'Interculturalidad crítica': 2, 'Igualdad de género': 1 }],
  [/humano|comunitario/i, { 'Vida saludable': 2, 'Inclusión': 1, 'Artes y experiencias estéticas': 1 }],
];
const SUGP_EJE_RASGOS = {
  'Inclusión': [3, 8], 'Pensamiento crítico': [5, 10], 'Interculturalidad crítica': [2, 9], 'Igualdad de género': [3, 1],
  'Vida saludable': [6, 4], 'Apropiación de las culturas a través de la lectura y la escritura': [9, 5], 'Artes y experiencias estéticas': [9, 4],
};
const SUGP_CAMPO_RASGOS = [[/lenguaje/i, [9]], [/saberes|cient/i, [7]], [/[eé]tica|naturaleza|sociedades/i, [2, 10]], [/humano|comunitario/i, [4, 8]]];

const sugpLimpio = t => String(t || '').trim().replace(/[.\s]+$/, '');

// Ejes: pensamiento crítico siempre; el resto según el campo y las palabras de los contenidos, sus PDA y la problemática
function sugpEjes(campo, conts, grado, prob) {
  const txt = conts.map(c => c.titulo + ' ' + (typeof obtenerPDA === 'function' ? obtenerPDA(c, grado) : '')).join(' ') + ' ' + prob;
  const pts = {}; EJES_ARTICULADORES.forEach(e => { pts[e] = 0; });
  pts['Pensamiento crítico'] = 1;
  SUGP_CAMPO_EJES.forEach(([re, m]) => { if (re.test(campo)) Object.keys(m).forEach(e => { pts[e] += m[e]; }); });
  Object.keys(SUGP_EJES).forEach(e => { const n = (txt.match(new RegExp(SUGP_EJES[e].source, 'gi')) || []).length; if (n) pts[e] += Math.min(3, n); });
  return EJES_ARTICULADORES.filter(e => pts[e] > 0).sort((a, b) => pts[b] - pts[a]).slice(0, 3);
}
// Perfil de egreso: los rasgos que más se relacionan con esos ejes y con el campo formativo (hasta 4)
function sugpPerfil(campo, ejes) {
  const n = [];
  const poner = x => { if (x && !n.includes(x)) n.push(x); };
  ejes.forEach(e => poner((SUGP_EJE_RASGOS[e] || [])[0]));
  SUGP_CAMPO_RASGOS.forEach(([re, r]) => { if (re.test(campo)) r.forEach(poner); });
  ejes.forEach(e => poner((SUGP_EJE_RASGOS[e] || [])[1]));
  return n.slice(0, 4).sort((a, b) => a - b);
}

// Marca en una cuadrícula (ejes o perfil) las casillas sugeridas, salvo que el docente ya haya elegido las suyas
function sugpGrid(gridId, quiere, forzar) {
  const grid = rEl(gridId); if (!grid) return false;
  if (grid.querySelectorAll('input:checked').length && grid.dataset.sug !== '1') {
    if (!forzar || !confirm('Ya marcaste casillas en «' + (grid.closest('.campo').querySelector('label').firstChild.textContent || '').trim() + '». ¿Quieres reemplazarlas por la sugerencia?')) return false;
  }
  SUGP_OCUPADO = true;
  try {
    grid.querySelectorAll('label').forEach(lab => {
      const chk = lab.querySelector('input'); if (!chk) return;
      const want = quiere(chk.value);
      if (chk.checked !== want) lab.click();
    });
  } finally { SUGP_OCUPADO = false; }
  sugMarcar(gridId, true);
  return true;
}
// En cuanto el docente marca o desmarca una casilla, la cuadrícula deja de ser «sugerida»
document.addEventListener('change', ev => {
  if (SUGP_OCUPADO || !ev.target || !ev.target.closest) return;
  const g = ev.target.closest('#d-ejes-grid,#d-perfil-grid,#a-ejes-grid,#a-perfil-grid');
  if (g && g.dataset.sug === '1') sugMarcar(g.id, false);
});

// ── Textos del proyecto ─────────────────────────────────────
function sugpProblematica() { return primeraProblematica(rVal('r-prob') || rVal('ctx-7')); }
function sugpProyecto(g, cam, dis, conts, met, esc, prob, k) {
  let lista = [];
  if (prob.length >= 5) lista = listaSugerida(met, prob, esc);
  else {
    const libro = (typeof obtenerProyectosSugeridos === 'function' ? obtenerProyectosSugeridos(g, cam, dis, conts.map(c => c.id)) : []) || [];
    const prodGen = PROY_GENERAL[met] || PROY_GENERAL.abpc || [];
    lista = libro.slice(0, 5).map((p, i) => ({ nombre: p.nombre, producto: sustituir((prodGen[i % Math.max(1, prodGen.length)] || ['', 'Producto integrador'])[1], { prob: '', dis, prod: '' }) }));
    if (!lista.length) lista = listaSugerida(met, '', esc);
  }
  return lista.length ? lista[k % lista.length] : null;
}
function sugpProblematizacion(dis, conts, nombre, prob, g) {
  const tit = conts.slice(0, 2).map(c => '«' + sugpLimpio(c.titulo) + '»').join(' y ');
  if (prob) return 'En el grupo de ' + g + '° se identificó la siguiente problemática: ' + prob + '. A partir de los contenidos de ' + dis + ' (' + tit + '), se plantea ' + (nombre ? 'el proyecto «' + nombre + '»' : 'un proyecto') + ' para comprenderla y atenderla desde el aula, la escuela o la comunidad.';
  return 'A partir de los contenidos de ' + dis + ' (' + tit + '), se plantea una situación real del aula, la escuela o la comunidad: ¿cómo podemos aplicar lo aprendido para comprenderla y mejorarla?';
}
function sugpInter(g, cam, dis, conts, producto) {
  const otras = ((CAMPOS_POR_GRADO[g] || {})[cam] || []).filter(x => x !== dis).slice(0, 2);
  if (!otras.length || !conts.length) return '';
  const tit = sugpLimpio(conts[0].titulo);
  return otras.map(o => o + ': se vincula con el contenido «' + tit + '» para que el alumnado aplique y comunique lo aprendido en ' + o + (producto ? ', a través de: ' + minuscula1(sugpLimpio(producto)) : '') + '.').join('\n');
}

// ── Plano Didáctico ─────────────────────────────────────────
// otro = true: el docente pidió «Sugerir otro» (reemplaza lo sugerido; pregunta antes de pisar algo propio)
function sugpPlanoD(otro, forzar) {
  const g = rVal('d-gra'), cam = rVal('d-cam'), dis = rVal('d-dis');
  const conts = typeof cD !== 'undefined' ? cD : [];
  if (!g || !cam || !dis || !conts.length) { if (otro) alert('Primero elige grado, campo, disciplina y al menos un contenido.'); return; }
  const prob = sugpProblematica(), m = modalidadAMetodologia(rVal('d-mod'));
  const ejes = sugpEjes(cam, conts, g, prob), rasgos = sugpPerfil(cam, ejes);
  sugpGrid('d-ejes-grid', v => ejes.includes(v), forzar);
  sugpGrid('d-perfil-grid', v => rasgos.includes(parseInt(v, 10)), forzar);
  if (otro) sugpIdx++;
  const s = sugpProyecto(g, cam, dis, conts, m.met, m.esc, prob, sugpIdx);
  const nombre = s ? s.nombre : '', producto = s ? s.producto : '';
  if (otro) {
    const e = rEl('d-proy');
    if (e && e.value.trim() && e.dataset.sug !== '1' && !confirm('Ya escribiste un nombre de proyecto. ¿Quieres reemplazarlo por esta sugerencia?')) { sugpIdx--; return; }
    if (s) { rEl('d-proy').value = nombre; sugMarcar('d-proy', true); rEl('d-prod').value = producto; sugMarcar('d-prod', true); }
  } else if (s) { sugPoner('d-proy', nombre); sugPoner('d-prod', producto); }
  const nom = rVal('d-proy') || nombre, prod = rVal('d-prod') || producto;
  const secuencia = typeof modalidadD !== 'undefined' && modalidadD === 'secuencia';
  sugPoner('d-prob', sugpProblematizacion(dis, conts, nom, prob, g));
  sugPoner('d-prop', secuencia
    ? 'Que las y los estudiantes desarrollen los aprendizajes de ' + dis + ' de los contenidos seleccionados, mediante secuencias didácticas con inicio, desarrollo y cierre, y muestren lo aprendido en las evidencias de cada secuencia.'
    : propositoSugerido(m.met, nom, prod, prob));
  sugPoner('d-inter', sugpInter(g, cam, dis, conts, prod));
}

// ── Programa Analítico: ejes y perfil de todo el año ────────
function sugpPlanoA(forzar) {
  const g = rVal('a-gra'), cam = rVal('a-cam');
  const conts = (typeof cA !== 'undefined') ? [].concat(cA.t1, cA.t2, cA.t3) : [];
  if (!g || !cam || !conts.length) { if (forzar === true) alert('Primero elige grado, campo y los contenidos de cada trimestre.'); return; }
  const ejes = sugpEjes(cam, conts, g, primeraProblematica(rVal('ctx-7'))), rasgos = sugpPerfil(cam, ejes);
  sugpGrid('a-ejes-grid', v => ejes.includes(v), forzar === true);
  sugpGrid('a-perfil-grid', v => rasgos.includes(parseInt(v, 10)), forzar === true);
}

// ── Disparadores ────────────────────────────────────────────
let sugpTimer = null;
const sugpPronto = fn => { clearTimeout(sugpTimer); sugpTimer = setTimeout(() => { try { fn(); } catch (e) { console.warn('Sugerencias:', e); } }, 250); };
document.addEventListener('click', ev => {
  const it = ev.target && ev.target.closest && ev.target.closest('.cnt-item'); if (!it) return;
  if (it.closest('#d-cnt-lista')) sugpPronto(() => sugpPlanoD(false));
  else if (it.closest('#at1,#at2,#at3')) sugpPronto(() => sugpPlanoA());
});
document.addEventListener('change', ev => { if (ev.target && ev.target.id === 'd-mod') sugpPronto(() => sugpPlanoD(false)); });
let sugpTimerProb = null;
document.addEventListener('input', ev => {
  if (!ev.target || (ev.target.id !== 'ctx-7' && ev.target.id !== 'r-prob')) return;
  clearTimeout(sugpTimerProb); sugpTimerProb = setTimeout(() => { sugpIdx = 0; try { sugpPlanoD(false); sugpPlanoA(); } catch (e) { /* aún no hay contenidos */ } }, 1000);
});
