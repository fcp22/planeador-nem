// ══════════════════════════════════════════════════════════
// FECHAS DEL PLANO
// El maestro dice cuándo piensa empezar (y, si quiere, cuándo termina) y qué días da la clase
// (la app los toma de su horario). Con eso se calcula la fecha de cada sesión y se pone sola
// en la secuencia didáctica y en el plano, para que no tenga que escribirlas a mano.
// ══════════════════════════════════════════════════════════
const FP_DIAS = [[1, 'L', 'lunes'], [2, 'M', 'martes'], [3, 'X', 'miércoles'], [4, 'J', 'jueves'], [5, 'V', 'viernes']];
const FP = { fechas: [], slots: {}, error: '', finManual: false, sesOrig: null };   // fechas: AAAA-MM-DD, una por sesión
const fpEl = id => document.getElementById(id);

const fpIso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const fpDate = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const fpMas = (iso, n) => { const d = fpDate(iso); d.setDate(d.getDate() + n); return fpIso(d); };
const fpMes = d => d.toLocaleDateString('es-MX', { month: 'long' });

// «Días sin clase»: fechas sueltas o rangos («21/12/2026 al 01/01/2027»), separados por coma, punto y coma o renglón
function fpParseSin(txt, anioBase) {
  const sin = new Set();
  const reF = /(\d{4})-(\d{1,2})-(\d{1,2})|(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/g;
  String(txt || '').split(/[;,\n]+/).forEach(tok => {
    const f = [];
    let m; reF.lastIndex = 0;
    while ((m = reF.exec(tok))) {
      let y, mo, d;
      if (m[1]) { y = +m[1]; mo = +m[2]; d = +m[3]; }
      else { d = +m[4]; mo = +m[5]; y = m[6] ? +m[6] : anioBase; if (y < 100) y += 2000; }
      if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) f.push(y + '-' + String(mo).padStart(2, '0') + '-' + String(d).padStart(2, '0'));
    }
    if (f.length === 1) sin.add(f[0]);
    else if (f.length >= 2) { let a = f[0]; const b = f[1]; let g = 0; while (a <= b && g++ < 400) { sin.add(a); a = fpMas(a, 1); } }
  });
  return sin;
}

// ── Días de clase según el horario del maestro ───────────────
// Devuelve { 'etiqueta del grupo': { díaDeLaSemana(1-5): bloques } } con lo que coincide con el grado y la disciplina del formulario.
function fpHorarioGrupos() {
  try {
    if (typeof G === 'undefined' || !G.data || typeof gHorario !== 'function') return {};
    const H = gHorario(), dis = (fpEl('d-dis') || {}).value || '', gra = (fpEl('d-gra') || {}).value || '';
    if (!dis || !gra || !H.c) return {};
    const nd = gNorm(dis).slice(0, 8);
    const coincide = txt => {
      const g = gHorarioGrupo(txt);
      if (g) { const gm = gNorm(g.materia); return String(g.grado) === String(gra) && (gm.includes(nd) || nd.includes(gm.slice(0, 8))); }
      return gNorm(txt).includes(nd) && new RegExp('(^|[^0-9])' + gra + '(?![0-9])').test(txt);
    };
    const out = {};
    for (let wd = 0; wd < 5; wd++) {
      let ult = null;   // bloque anterior (módulos seguidos de lo mismo cuentan como una sola clase)
      H.mods.forEach((m, i) => {
        if (m[2] === 'rec') { ult = null; return; }
        const t = H.c[i + '-' + wd];
        if (!t || !coincide(t)) { ult = null; return; }
        if (ult && ult.t === t && ult.i === i - 1) { ult.i = i; return; }
        ult = { t, i };
        const g = gHorarioGrupo(t), et = g ? (new RegExp('^' + g.grado).test(String(g.nombre).trim()) ? String(g.nombre).trim() : g.grado + '° ' + g.nombre) : String(t).trim();
        ((out[et] = out[et] || {})[wd + 1] = out[et][wd + 1] || 0);
        out[et][wd + 1]++;
      });
    }
    return out;
  } catch (e) { return {}; }
}
function fpRefrescarHorario() {
  const box = fpEl('fp-hor-box'), sel = fpEl('fp-hor'); if (!box || !sel) return;
  const gs = fpHorarioGrupos(), claves = Object.keys(gs);
  const previo = sel.value;
  box.classList.toggle('hidden', !claves.length);
  sel.innerHTML = claves.map(k => `<option value="${k.replace(/"/g, '&quot;')}">${k.replace(/</g, '&lt;')} — ${Object.keys(gs[k]).map(d => FP_DIAS[d - 1][2]).join(', ')}</option>`).join('');
  if (claves.includes(previo)) sel.value = previo;
  FP._gs = gs;
  if (claves.length) fpUsarHorario(); else { FP.slots = {}; fpCalcular(); }
}
function fpUsarHorario(sinCalcular) {
  const sel = fpEl('fp-hor'), gs = FP._gs || {}, h = gs[sel && sel.value];
  if (h) {
    FP.slots = h;
    FP_DIAS.forEach(([n]) => { const c = fpEl('fp-d' + n); if (c) c.checked = !!h[n]; });
  }
  if (!sinCalcular) fpCalcular();
}
function fpDiaManual() { FP.slots = {}; fpCalcular(); }   // si el maestro marca los días a mano, cada día vale una clase

// ── Cálculo de las fechas de cada sesión ─────────────────────
function fpNumSesionesForm() {
  const v = parseInt((fpEl('d-ses') || {}).value, 10);
  return isNaN(v) ? 25 : Math.max(1, Math.min(200, v));
}
function fpPonerSesiones(n, restaurar) {
  const sel = fpEl('d-ses'); if (!sel || String(sel.value) === String(n)) return;
  if (!restaurar && FP.sesOrig == null) FP.sesOrig = sel.value;
  if (![...sel.options].some(o => o.value === String(n))) {
    let o = [...sel.options].find(x => x.dataset.custom === '1');
    if (!o) { o = document.createElement('option'); o.dataset.custom = '1'; sel.insertBefore(o, sel.querySelector('option[value="otro"]')); }
    o.value = String(n); o.textContent = `${n} sesiones (según tus fechas)`;
  }
  sel.value = String(n);
  const box = fpEl('d-ses-otro-box'); if (box) box.classList.add('hidden');
  sel.dispatchEvent(new Event('change', { bubbles: true }));   // avisa a la ruta y a las secuencias
}
// Las fechas salen ya calculadas: empieza hoy (o el primer día de clase que sigue) y la app estima el último día con las
// sesiones y los días de clase. El maestro puede cambiar cualquier dato; si pone él el último día, de ahí salen las sesiones.
function fpFinCambio() {
  FP.finManual = !!(fpEl('fp-fin') || {}).value;
  // Si borra el último día, vuelve al número de sesiones que tenía antes de usar sus fechas
  if (!FP.finManual && FP.sesOrig != null) { const o = FP.sesOrig; FP.sesOrig = null; if (o !== 'otro' && /^\d+$/.test(o)) fpPonerSesiones(+o, true); }
  fpCalcular();
}
function fpCalcular() {
  const iniEl = fpEl('fp-ini'), finEl = fpEl('fp-fin'), prev = fpEl('fp-prev');
  if (iniEl && !iniEl.value) iniEl.value = fpIso(new Date());
  const ini = (iniEl || {}).value || '', fin = FP.finManual ? ((finEl || {}).value || '') : '';
  FP.fechas = []; FP.error = '';
  const pinta = (html, malo) => { if (prev) { prev.style.display = html ? 'block' : 'none'; prev.innerHTML = html; prev.style.background = malo ? '#fffbeb' : '#f0fdf4'; prev.style.borderColor = malo ? '#fde68a' : '#bbf7d0'; prev.style.color = malo ? '#92400e' : '#166534'; } };
  if (!ini) { pinta(''); return FP; }
  const dias = FP_DIAS.map(([n]) => n).filter(n => { const c = fpEl('fp-d' + n); return c && c.checked; });
  if (!dias.length) { FP.error = 'Marca al menos un día de clase.'; pinta('⚠ ' + FP.error, true); return FP; }
  if (fin && fin < ini) { FP.error = 'El último día es anterior al primero.'; pinta('⚠ ' + FP.error, true); return FP; }
  const sin = fpParseSin((fpEl('fp-sin') || {}).value, +ini.slice(0, 4));
  const tope = fin ? Infinity : fpNumSesionesForm();
  let f = ini, guard = 0;
  while (FP.fechas.length < tope && guard++ < 800) {
    if (fin && f > fin) break;
    const dw = fpDate(f).getDay();
    if (dias.includes(dw) && !sin.has(f)) for (let k = 0; k < (FP.slots[dw] || 1) && FP.fechas.length < tope; k++) FP.fechas.push(f);
    f = fpMas(f, 1);
  }
  if (!FP.fechas.length) { FP.error = 'En ese periodo no hay clases (revisa los días y las fechas).'; pinta('⚠ ' + FP.error, true); return FP; }
  const n = FP.fechas.length, u = [...new Set(FP.fechas)];
  if (fin) fpPonerSesiones(Math.min(200, n));
  else if (finEl) finEl.value = FP.fechas[n - 1];   // estimado: se ve y se puede cambiar
  const nTemas = (typeof cD !== 'undefined' && cD.length) ? cD.length : 0;
  const porTema = nTemas ? `<br>📚 <b>${nTemas} contenido${nTemas > 1 ? 's' : ''}</b>: te tocan unas <b>${Math.max(1, Math.floor(n / nTemas))} sesion${Math.floor(n / nTemas) > 1 ? 'es' : ''} por tema</b>${n % nTemas ? ' (sobran ' + (n % nTemas) + ')' : ''}.` : '';
  const corta = u.slice(0, 14).map(fpCorta).join(' · ') + (u.length > 14 ? ' …' : '');
  pinta(`📅 ${fin ? '' : '<b>Estimado:</b> '}<b>${n} sesion${n > 1 ? 'es' : ''}</b>, ${fpRango(FP.fechas[0], FP.fechas[n - 1])}.${porTema}<br><small>${corta}</small>` +
    (fin ? '' : '<br><small>Cambia cualquier fecha o día si tu calendario es distinto; el plano usa lo que dejes aquí.</small>'), false);
  return FP;
}

// ── Textos para los documentos ──────────────────────────────
function fpCorta(iso) { const d = fpDate(iso); return d.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '') + ' ' + d.getDate() + ' ' + fpMes(d).slice(0, 3); }
function fpRango(a, b) {
  const da = fpDate(a), db = fpDate(b);
  if (a === b) return `${da.getDate()} de ${fpMes(da)}`;
  if (da.getFullYear() !== db.getFullYear()) return `${da.getDate()} de ${fpMes(da)} de ${da.getFullYear()} al ${db.getDate()} de ${fpMes(db)} de ${db.getFullYear()}`;
  if (da.getMonth() === db.getMonth()) return `${da.getDate()} al ${db.getDate()} de ${fpMes(db)}`;
  return `${da.getDate()} de ${fpMes(da)} al ${db.getDate()} de ${fpMes(db)}`;
}
// Fecha(s) de las sesiones sesIni…sesFin (se cuentan desde 1). Si no hay fechas calculadas devuelve ''.
function fpTexto(sesIni, sesFin) {
  const n = FP.fechas.length; if (!n) return '';
  const a = Math.max(1, sesIni), b = Math.min(n, sesFin == null ? sesIni : sesFin);
  if (a > n || b < a) return '';
  return fpRango(FP.fechas[a - 1], FP.fechas[b - 1]);
}
function fpFechaSesion(s) { const n = FP.fechas.length; return (n && s >= 1 && s <= n) ? fpCorta(FP.fechas[s - 1]) : ''; }
function fpDiasTexto() {
  const dias = FP_DIAS.filter(([n]) => { const c = fpEl('fp-d' + n); return c && c.checked; }).map(x => x[2]);
  return dias.join(', ');
}
function fpHayFechas() { return FP.fechas.length > 0; }

// Desde Mis grupos → Proyecto: el proyecto ya trae inicio, días y días sin clase
function fpDesdeProyecto(p) {
  try {
    if (!p || !p.inicio) return;
    fpEl('fp-ini').value = p.inicio; fpEl('fp-fin').value = ''; FP.finManual = false;
    FP_DIAS.forEach(([n]) => { const c = fpEl('fp-d' + n); if (c) c.checked = (p.dias || []).includes(n); });
    fpEl('fp-sin').value = p.sinClase || '';
    FP.slots = {};
    fpCalcular();
  } catch (e) {}
}

document.addEventListener('change', e => {
  const id = e.target && e.target.id;
  if (id === 'd-dis' || id === 'd-gra' || id === 'd-grp') fpRefrescarHorario();
  else if (id === 'd-ses') fpCalcular();
});
document.addEventListener('DOMContentLoaded', () => { try { fpRefrescarHorario(); } catch (e) {} });

// ── Mi trimestre: inicio y fin guardados por trimestre ───────
function fpTrimClave() { return 'nem_trim_fechas_' + ((fpEl('d-tri') || {}).value || '1'); }
function fpTrimCargar() {
  let v = {}; try { v = JSON.parse(localStorage.getItem(fpTrimClave()) || '{}'); } catch (e) {}
  const a = fpEl('fp-tini'), b = fpEl('fp-tfin'); if (a) a.value = v.i || ''; if (b) b.value = v.f || '';
}
function fpTrimGuardar() {
  try { localStorage.setItem(fpTrimClave(), JSON.stringify({ i: (fpEl('fp-tini') || {}).value || '', f: (fpEl('fp-tfin') || {}).value || '' })); } catch (e) {}
}
function fpUsarTrimestre() {
  const a = (fpEl('fp-tini') || {}).value, b = (fpEl('fp-tfin') || {}).value, prev = fpEl('fp-prev');
  if (!a || !b || b < a) { if (prev) { prev.style.display = 'block'; prev.style.background = '#fffbeb'; prev.style.borderColor = '#fde68a'; prev.style.color = '#92400e'; prev.innerHTML = '⚠ Anota cuándo empieza y cuándo termina tu trimestre (el final después del inicio).'; } return; }
  fpTrimGuardar();
  fpEl('fp-ini').value = a; fpEl('fp-fin').value = b; FP.finManual = true; fpCalcular();
}
document.addEventListener('change', e => { if (e.target && e.target.id === 'd-tri') fpTrimCargar(); });
document.addEventListener('DOMContentLoaded', () => { try { fpTrimCargar(); } catch (e) {} });
