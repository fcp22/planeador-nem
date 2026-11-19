// ============================================================
// BITÁCORA — Reportes de incidencia escolar
// El maestro llena el formulario y la app genera el reporte con el
// formato oficial (para imprimir / guardar como PDF o bajar en Word).
// Encabezado con los datos de la escuela del propio maestro (Mis grupos → Mi escuela).
// Los datos se guardan solo en este dispositivo (G.data.incidencias).
// ============================================================

const BIT_TIPOS = [
  'Conflicto o pelea entre alumnos', 'Agresión física', 'Agresión verbal o burlas',
  'Acoso escolar o en redes', 'Accidente o lesión', 'Amenaza o reto viral',
  'Objeto peligroso', 'Posible consumo de sustancias', 'Riesgo emocional o autolesión',
  'Señales de violencia o descuido en casa', 'Ausentismo o abandono'
];
const BIT_EVID = ['Fotografía', 'Captura de pantalla', 'Objeto', 'Escrito o dibujo', 'Ninguna'];
const BIT_PARTIC = ['Afectado(a)', 'Presunto(a) responsable', 'Testigo', 'Otro'];
const BIT_AVISO = 'Documento confidencial de uso exclusivo del personal escolar. Entregar el original a Dirección con copia a Trabajo Social; el docente conserva una copia con acuse de recibido.';

G.bit = { vista: 'lista', borrador: null };

function bitLista() { if (!G.data.incidencias) G.data.incidencias = []; return G.data.incidencias; }
function bitNuevo() {
  const d = new Date();
  return { id: gId(), fecha: gHoy(), hora: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'),
    lugar: '', turno: '', grupo: (gGrupo() && gGrupo().nombre) || '', asignatura: (gGrupo() && gGrupo().materia) || '',
    alumnos: [{ nombre: '', grupo: '', partic: '' }], tipos: [], otroTipo: '', hechos: '', testigos: '',
    evid: [], evidDesc: '', accion: '', avisoDir: '', avisoHora: '', avisoPersona: '', creado: Date.now() };
}

// ── Lista de reportes ────────────────────────────────────
function gRenderBitacora() {
  if (!G.data) gCargar();
  if (G.bit.vista === 'form' && G.bit.borrador) return bitRenderForm();
  const L = bitLista().slice().sort((a, b) => (b.fecha + (b.hora || '')).localeCompare(a.fecha + (a.hora || '')));
  let h = `<div class="sec-title">Bitácora e incidencias</div><div class="sec-sub">Reporte de incidencia escolar: llénalo aquí y la app lo genera listo para imprimir o guardar en PDF, con los datos de tu escuela.</div>
  <div class="g-aviso" style="font-size:12.5px">🔒 <b>Información confidencial.</b> Los reportes se guardan <b>solo en este dispositivo</b> (no en nuestros servidores) y van en tu respaldo de «Mis grupos». Contienen datos de menores: protege tu equipo con contraseña.</div>
  <div style="margin-bottom:14px"><button class="g-btn" onclick="bitAbrir()">＋ Nuevo reporte de incidencia</button></div>`;
  h += `<div class="card" style="margin-bottom:14px"><div class="card-title">📘 Protocolos</div>
    <div style="font-size:13px;margin-bottom:6px"><b>Protocolo docente de prevención, reporte y canalización</b><div style="color:var(--gris);font-size:12.5px;margin:2px 0 8px">Qué hacer, qué no hacer y la ruta de reporte. Sale con el encabezado de tu escuela, listo para imprimir y firmar el acuse de conocimiento.</div>
      <button class="g-btn" onclick="bitProto()">📖 Ver / imprimir</button> <button class="g-btn g-btn-s" onclick="bitProtoWord()">⬇ Word</button></div>
    <div style="font-size:13px;border-top:1px solid var(--borde);padding-top:10px;margin-top:6px"><b>Protocolo de actuación ante el acoso escolar — SEGEY (Yucatán)</b><div style="color:var(--gris);font-size:12.5px;margin:2px 0 8px">Documento oficial de la Secretaría de Educación de Yucatán (56 páginas). Si tu escuela es de otro estado, consulta el protocolo de tu entidad.</div>
      <button class="g-btn" onclick="gAbrirVentana('docs/protocolo-acoso-escolar-segey-yucatan.pdf')">📄 Abrir PDF</button></div></div>`;
  if (!gPerfil().escuela) h += `<div class="g-aviso" style="background:#fffbeb;border-color:#fde68a;color:#92400e">Para que el reporte lleve el encabezado de tu escuela, captura tus datos en <a href="#" onclick="gIrA('grupos');return false">Mis grupos → Mi escuela</a>.</div>`;
  if (!L.length) h += `<div class="card" style="text-align:center;color:var(--gris)">Aún no hay reportes. Pulsa «Nuevo reporte de incidencia» para crear el primero.</div>`;
  L.forEach(r => {
    const al = r.alumnos.filter(a => a.nombre).map(a => gEsc(a.nombre)).join(', ') || '—';
    const tp = r.tipos.concat(r.otroTipo ? [r.otroTipo] : []).join(' · ') || '—';
    h += `<div class="card" style="margin-bottom:12px">
      <div style="margin-bottom:6px"><b>${gFechaBonita(r.fecha)}</b>${r.hora ? ' <span style="color:var(--gris);font-size:13px">· ' + gEsc(r.hora) + '</span>' : ''}${r.lugar ? ' <span style="color:var(--gris);font-size:13px">· ' + gEsc(r.lugar) + '</span>' : ''}</div>
      <div style="font-size:13px;margin-bottom:4px"><b>Situación:</b> ${gEsc(tp)}</div>
      <div style="font-size:13px;margin-bottom:10px"><b>Alumnos:</b> ${al}</div>
      <button class="g-btn" onclick="bitPDF('${r.id}')">🖨️ Imprimir / PDF</button>
      <button class="g-btn g-btn-s" onclick="bitAbrir('${r.id}')">✏️ Editar</button>
      <button class="g-btn g-btn-s" onclick="bitWord('${r.id}')">⬇ Word</button>
      <button class="g-btn g-btn-s" style="color:#dc2626" onclick="bitBorrar('${r.id}')">🗑 Borrar</button></div>`;
  });
  h += `<div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-top:6px">Próximamente en esta sección: diario de cada sesión con evidencias fotográficas.</div>`;
  gPanel().innerHTML = h;
}
function bitAbrir(id) {
  const r = id ? bitLista().find(x => x.id === id) : null;
  G.bit.borrador = r ? JSON.parse(JSON.stringify(r)) : bitNuevo();
  G.bit.vista = 'form'; gRenderBitacora(); window.scrollTo(0, 0);
}
function bitCancelar() {
  if (!confirm('¿Salir sin guardar los cambios de este reporte?')) return;
  G.bit.vista = 'lista'; G.bit.borrador = null; gRenderBitacora();
}
function bitBorrar(id) {
  if (!confirm('¿Borrar este reporte? No se puede deshacer.')) return;
  G.data.incidencias = bitLista().filter(x => x.id !== id); gGuardar(); gRenderBitacora();
}

// ── Formulario (mismas secciones que el formato impreso) ──
function bitRenderForm() {
  const b = G.bit.borrador, todos = [];
  (G.data.grupos || []).forEach(g => g.alumnos.forEach(a => todos.push(a.nombre)));
  const campo = (lbl, inner, ayuda) => `<div class="campo"><label>${lbl}</label>${inner}${ayuda ? `<div class="ayuda">${ayuda}</div>` : ''}</div>`;
  const grid = inner => `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">${inner}</div>`;
  const chk = (cls, v, on) => `<label style="display:flex;gap:8px;align-items:flex-start;font-size:13.5px;cursor:pointer"><input type="checkbox" class="${cls}" value="${gEsc(v)}"${on ? ' checked' : ''} style="margin-top:3px"> ${gEsc(v)}</label>`;
  const ci = 'padding:9px;border:1.5px solid var(--borde);border-radius:8px;min-width:0';
  gPanel().innerHTML = `<div class="sec-title">${bitLista().some(r => r.id === b.id) ? 'Editar' : 'Nuevo'} reporte de incidencia escolar</div>
  <div class="sec-sub">Lo que dejes vacío saldrá en blanco para completarlo a mano al imprimir. El folio lo asigna Dirección.</div>

  <div class="card"><div class="card-title">1. Datos generales</div>
    ${grid(campo('Fecha del hecho', `<input type="date" id="bi-fecha" value="${gEsc(b.fecha)}">`) + campo('Hora', `<input type="time" id="bi-hora" value="${gEsc(b.hora)}">`) + campo('Lugar', `<input id="bi-lugar" value="${gEsc(b.lugar)}" placeholder="Ej. Patio, aula, baños">`) +
      campo('Turno', `<select id="bi-turno"><option value="">—</option>${['Matutino', 'Vespertino'].map(t => `<option${b.turno === t ? ' selected' : ''}>${t}</option>`).join('')}</select>`) +
      campo('Grado y grupo', `<input id="bi-grupo" value="${gEsc(b.grupo)}" placeholder="Ej. 2° B">`) + campo('Asignatura o actividad', `<input id="bi-asig" value="${gEsc(b.asignatura)}">`))}
  </div>

  <div class="card"><div class="card-title">2. Alumnos involucrados</div>
    <datalist id="bi-dl">${todos.map(n => `<option value="${gEsc(n)}">`).join('')}</datalist>
    ${b.alumnos.map((a, i) => `<div class="bi-al" style="display:grid;grid-template-columns:2fr 1fr 2fr auto;gap:8px;margin-bottom:8px;align-items:center">
      <input class="bi-al-n" list="bi-dl" value="${gEsc(a.nombre)}" placeholder="Nombre del alumno o alumna" onchange="bitAlumnoSel(this)" style="${ci}">
      <input class="bi-al-g" value="${gEsc(a.grupo)}" placeholder="Grado y grupo" style="${ci}">
      <select class="bi-al-p" style="${ci}"><option value="">Participación…</option>${BIT_PARTIC.map(r => `<option${r === a.partic ? ' selected' : ''}>${r}</option>`).join('')}</select>
      <button class="g-btn g-btn-s" onclick="bitQuitarAl(${i})" title="Quitar" style="margin:0">✕</button></div>`).join('')}
    <button class="g-btn g-btn-s" onclick="bitAgregarAl()">＋ Agregar alumno</button>
    <div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-top:6px">Al escribir te sugiere los alumnos de tus grupos y llena su grupo; también puedes escribir cualquier nombre.</div>
  </div>

  <div class="card"><div class="card-title">3. Tipo de situación <span style="font-weight:400;font-size:12px;color:var(--gris)">(marca las que apliquen)</span></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:6px 14px;margin-bottom:12px">${BIT_TIPOS.map(t => chk('bi-tipo', t, b.tipos.includes(t))).join('')}</div>
    ${campo('Otro (especifica)', `<input id="bi-otro" value="${gEsc(b.otroTipo)}">`)}
    <div class="g-aviso" style="font-size:12px;margin:10px 0 0">⚠️ <b>Si sospechas abuso o violencia grave:</b> avisa de inmediato a la dirección y sigue el protocolo de tu entidad. No interrogues ni investigues por tu cuenta al alumno.</div>
  </div>

  <div class="card"><div class="card-title">4. Descripción de los hechos</div>
    ${campo('', `<textarea id="bi-hechos" rows="7">${gEsc(b.hechos)}</textarea>`, 'Escribe solo lo que observaste o lo que te dijeron, con las palabras textuales del alumno. Sin opiniones ni diagnósticos.')}
  </div>

  <div class="card"><div class="card-title">5. Testigos</div>
    ${campo('', `<textarea id="bi-testigos" rows="3">${gEsc(b.testigos)}</textarea>`, 'Nombre y función de quienes presenciaron el hecho.')}
  </div>

  <div class="card"><div class="card-title">6. Evidencia conservada</div>
    <div style="display:flex;gap:6px 18px;flex-wrap:wrap;margin-bottom:12px">${BIT_EVID.map(t => chk('bi-evid', t, b.evid.includes(t))).join('')}</div>
    ${campo('Descripción y dónde se resguarda', `<input id="bi-evdesc" value="${gEsc(b.evidDesc)}">`)}
  </div>

  <div class="card"><div class="card-title">7. Acción inmediata del docente</div>
    ${campo('', `<textarea id="bi-accion" rows="5">${gEsc(b.accion)}</textarea>`, 'Qué hiciste en el momento para proteger al alumno o controlar la situación.')}
    ${grid(campo('¿Se avisó de inmediato a Dirección?', `<select id="bi-avdir"><option value="">—</option>${['Sí', 'No'].map(t => `<option${b.avisoDir === t ? ' selected' : ''}>${t}</option>`).join('')}</select>`) +
      campo('Hora del aviso', `<input type="time" id="bi-avhora" value="${gEsc(b.avisoHora)}">`) + campo('Persona que recibió el aviso', `<input id="bi-avper" value="${gEsc(b.avisoPersona)}">`))}
  </div>

  <div style="margin:14px 0 30px"><button class="g-btn" onclick="bitGuardar()">💾 Guardar reporte</button>
    <button class="g-btn" onclick="bitGuardar('pdf')">🖨️ Guardar e imprimir / PDF</button>
    <button class="g-btn g-btn-s" onclick="bitCancelar()">Cancelar</button></div>`;
}
// Pasa lo escrito en pantalla al borrador (para poder redibujar sin perder nada)
function bitLeer() {
  const b = G.bit.borrador; if (!b || !document.getElementById('bi-fecha')) return;
  const v = id => { const e = document.getElementById(id); return e ? e.value : ''; };
  b.fecha = v('bi-fecha'); b.hora = v('bi-hora'); b.lugar = v('bi-lugar'); b.turno = v('bi-turno'); b.grupo = v('bi-grupo'); b.asignatura = v('bi-asig');
  b.alumnos = [...document.querySelectorAll('.bi-al')].map(r => ({ nombre: r.querySelector('.bi-al-n').value, grupo: r.querySelector('.bi-al-g').value, partic: r.querySelector('.bi-al-p').value }));
  b.tipos = [...document.querySelectorAll('.bi-tipo:checked')].map(e => e.value); b.otroTipo = v('bi-otro');
  b.hechos = v('bi-hechos'); b.testigos = v('bi-testigos');
  b.evid = [...document.querySelectorAll('.bi-evid:checked')].map(e => e.value); b.evidDesc = v('bi-evdesc');
  b.accion = v('bi-accion'); b.avisoDir = v('bi-avdir'); b.avisoHora = v('bi-avhora'); b.avisoPersona = v('bi-avper');
}
function bitAgregarAl() { bitLeer(); G.bit.borrador.alumnos.push({ nombre: '', grupo: '', partic: '' }); bitRenderForm(); }
function bitQuitarAl(i) { bitLeer(); const a = G.bit.borrador.alumnos; a.splice(i, 1); if (!a.length) a.push({ nombre: '', grupo: '', partic: '' }); bitRenderForm(); }
function bitAlumnoSel(el) {
  const nom = el.value.trim().toLowerCase(); let enc = null;
  (G.data.grupos || []).forEach(g => g.alumnos.forEach(a => { if (!enc && a.nombre.trim().toLowerCase() === nom) enc = g.nombre; }));
  const fila = el.closest('.bi-al'), gi = fila && fila.querySelector('.bi-al-g');
  if (enc && gi && !gi.value.trim()) gi.value = enc;
}
function bitGuardar(luego) {
  bitLeer(); const b = G.bit.borrador;
  b.alumnos = b.alumnos.filter(a => a.nombre.trim() || a.grupo.trim() || a.partic);
  ['lugar', 'grupo', 'asignatura', 'otroTipo', 'hechos', 'testigos', 'evidDesc', 'accion', 'avisoPersona'].forEach(k => b[k] = String(b[k] || '').trim());
  if (!b.fecha) return gAviso('Escribe la fecha del hecho.');
  if (!b.hechos) return gAviso('Describe brevemente qué pasó en «Descripción de los hechos».');
  const L = bitLista(), i = L.findIndex(r => r.id === b.id);
  if (i >= 0) L[i] = b; else L.push(b);
  gGuardar(); G.bit.vista = 'lista'; G.bit.borrador = null; gRenderBitacora(); window.scrollTo(0, 0);
  if (luego === 'pdf') bitPDF(b.id);
}

// ── Documento ─────────────────────────────────────────────
// Encabezado con los datos de la escuela del propio maestro (Mis grupos → Mi escuela)
function bitEnc() {
  const p = gPerfil(), C = '#233b6e', est = (p.estado || '').trim();
  const linea1 = 'SECRETARÍA DE EDUCACIÓN' + (est ? ' DEL GOBIERNO DEL ESTADO DE ' + gEsc(est.toUpperCase()) : '');
  const datos = [p.cct ? 'CCT ' + gEsc(p.cct) : '', p.zona ? 'Zona Escolar ' + gEsc(p.zona) : '', p.municipio ? gEsc(p.municipio) + (est ? ', ' + gEsc(est) : '') : ''].filter(Boolean).join(' · ');
  return `<p style="text-align:center;margin:0;font-size:9pt;color:#444">${linea1}</p>
  <p style="text-align:center;margin:0;font-size:13pt;font-weight:bold;color:${C}">${gEsc((gEscuela() || 'ESCUELA SECUNDARIA').toUpperCase())}</p>
  <p style="text-align:center;margin:0;font-size:9.5pt">${datos}</p>
  <p style="text-align:center;margin:0 0 6px;font-size:9.5pt">Ciclo escolar ${G_LIBROS_CICLO}-${G_LIBROS_CICLO + 1}</p>
  <hr style="border:0;border-top:3px solid ${C};margin:6px 0 10px">`;
}
// Documento (mismo diseño que el formato oficial)
function bitHTML(r) {
  const box = x => x ? '☒' : '☐', C = '#233b6e';
  const br = s => gEsc(s || '').replace(/\n/g, '<br>');
  const bd = 'border:1px solid #6b7280', T = 'width:100%;border-collapse:collapse;margin:0 0 12px';
  const bar = t => `<tr><td colspan="9" style="background:${C};color:#fff;font-weight:bold;font-size:10.5pt;padding:5px 8px">${t}</td></tr>`;
  const lbl = t => `<b style="font-size:9.5pt">${t}</b>`;
  const c = (inner, ex) => `<td style="${bd};padding:5px 8px;vertical-align:top;font-size:10pt;${ex || ''}">${inner}</td>`;
  const hint = t => `<div style="font-size:9pt;color:#555;font-style:italic;margin-bottom:4px">${t}</div>`;
  const aviso = `<p style="font-size:8pt;color:#555;font-style:italic;text-align:center;margin:0 0 8px">${BIT_AVISO}</p>`;
  // Datos generales
  const t1 = `<table style="${T}">${bar('1. Datos generales')}
    <tr>${c(lbl('Fecha del hecho') + '<br>' + (r.fecha ? gFechaBonita(r.fecha) : ''), 'width:33%;height:38px')}${c(lbl('Hora') + '<br>' + gEsc(r.hora), 'width:33%')}${c(lbl('Lugar') + '<br>' + gEsc(r.lugar))}</tr>
    <tr>${c(lbl('Turno') + '<br>' + box(r.turno === 'Matutino') + ' Matutino &nbsp; ' + box(r.turno === 'Vespertino') + ' Vespertino', 'height:38px')}${c(lbl('Grado y grupo') + '<br>' + gEsc(r.grupo))}${c(lbl('Asignatura o actividad') + '<br>' + gEsc(r.asignatura))}</tr></table>`;
  // Alumnos (mínimo 4 filas)
  const al = r.alumnos.slice(); while (al.length < 4) al.push({ nombre: '', grupo: '', partic: '' });
  const hd = (t, ex) => `<td style="${bd};background:#dbe4f3;font-weight:bold;font-size:9.5pt;padding:5px 8px;${ex || ''}">${t}</td>`;
  const t2 = `<table style="${T}">${bar('2. Alumnos involucrados')}
    <tr>${hd('Nombre del alumno o alumna', 'width:50%')}${hd('Grado y grupo', 'width:16%')}${hd('Participación (afectado, presunto responsable, testigo)')}</tr>
    ${al.map(a => `<tr>${c(gEsc(a.nombre), 'height:22px')}${c(gEsc(a.grupo))}${c(gEsc(a.partic))}</tr>`).join('')}</table>`;
  // Tipo de situación (3 columnas, "Otro" al final)
  const tipos = BIT_TIPOS.map(t => box(r.tipos.includes(t)) + ' ' + t).concat([box(!!r.otroTipo) + ' Otro: ' + (r.otroTipo ? gEsc(r.otroTipo) : '______________')]);
  let filas = ''; for (let i = 0; i < tipos.length; i += 3) filas += `<tr>${[0, 1, 2].map(j => `<td style="padding:3px 8px;font-size:10pt;vertical-align:top;width:33%">${tipos[i + j] || ''}</td>`).join('')}</tr>`;
  const t3 = `<table style="${T}">${bar('3. Tipo de situación (marque las que apliquen)')}${filas}</table>`;
  const caja = (n, tit, h, val, alto) => `<table style="${T}">${bar(n + '. ' + tit)}<tr>${c(hint(h) + br(val), `height:${alto}px;border-color:#6b7280`)}</tr></table>`;
  const t4 = caja(4, 'Descripción de los hechos', 'Escriba solo lo que observó o lo que le dijeron, con las palabras textuales del alumno. Sin opiniones ni diagnósticos.', r.hechos, 190);
  const t5 = caja(5, 'Testigos', 'Nombre y función de quienes presenciaron el hecho.', r.testigos, 90);
  const t6 = `<table style="${T}">${bar('6. Evidencia conservada')}<tr>${c(BIT_EVID.map(t => box(r.evid.includes(t)) + ' ' + t).join(' &nbsp;&nbsp; ') + '<br>' + lbl('Descripción y dónde se resguarda:') + ' ' + gEsc(r.evidDesc), 'height:48px')}</tr></table>`;
  const t7 = caja(7, 'Acción inmediata del docente', 'Qué hizo en el momento para proteger al alumno o controlar la situación.', r.accion, 120);
  const t8 = `<table style="${T}"><tr>${c(lbl('¿Se avisó de inmediato a Dirección?') + ' &nbsp;' + box(r.avisoDir === 'Sí') + ' Sí &nbsp;' + box(r.avisoDir === 'No') + ' No &nbsp;&nbsp; Hora del aviso: ' + (r.avisoHora ? gEsc(r.avisoHora) : '____________') + '<br>Persona que recibió el aviso: ' + (r.avisoPersona ? gEsc(r.avisoPersona) : '______________________________________________'))}</tr></table>`;
  const firma = (t, s) => `<td style="width:33%;text-align:center;padding:44px 14px 0;vertical-align:bottom"><div style="border-top:2px solid #000;padding-top:3px"><b style="font-size:10pt">${t}</b><br><span style="font-size:8.5pt;color:#555">${s}</span></div></td>`;
  const t9 = `<table style="width:100%;border-collapse:collapse;page-break-inside:avoid"><tr>${firma('Docente que reporta', 'Nombre y firma')}${firma('Recibió Dirección', 'Nombre, firma, fecha y hora')}${firma('Recibió Trabajo Social', 'Nombre, firma, fecha y hora')}</tr></table>`;
  return `${aviso}
  ${bitEnc()}
  <table style="width:100%;border-collapse:collapse;margin-bottom:12px"><tr><td style="font-size:15pt;font-weight:bold;color:${C};vertical-align:middle">REPORTE DE INCIDENCIA ESCOLAR</td>
    <td style="width:30%;border:1px solid #6b7280;padding:5px 8px;font-size:9.5pt;height:42px;vertical-align:top"><b>Folio (lo asigna Dirección)</b></td></tr></table>
  ${t1}${t2}${t3}${t4}${t5}${t6}${t7}${t8}${t9}
  <p style="font-size:8pt;color:#555;font-style:italic;text-align:center;margin:18px 0 0">${BIT_AVISO}</p>`;
}
function bitDe(id) { return bitLista().find(r => r.id === id); }
function bitWord(id) {
  const r = bitDe(id); if (!r) return;
  descargarWord(bitHTML(r), 'Reporte_incidencia_' + r.fecha + '_' + (r.alumnos[0] && r.alumnos[0].nombre ? r.alumnos[0].nombre.replace(/\W+/g, '_') : 'sin_nombre') + '.doc');
}
function bitVentana(titulo, html) {
  const w = window.open('', '_blank', 'width=900,height=900,resizable=yes,scrollbars=yes');
  if (!w) return gAviso('Tu navegador bloqueó la ventana. Permite las ventanas emergentes de este sitio e inténtalo otra vez.');
  w.document.open();
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${gEsc(titulo)}</title>
  <style>@page{size:Letter;margin:1.3cm}body{font-family:Arial,Helvetica,sans-serif;color:#000;margin:0;padding:16px 22px;max-width:19cm}
  .bar{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:13px}
  .bar button{padding:8px 16px;border:0;border-radius:8px;background:#1d4ed8;color:#fff;font-weight:bold;cursor:pointer;margin-right:8px;font-size:13px}
  table{page-break-inside:auto}tr{page-break-inside:avoid}
  @media print{.bar{display:none}body{padding:0;max-width:none}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>
  <div class="bar"><button onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button><button onclick="window.close()" style="background:#64748b">Cerrar</button><br><span>Para guardar en PDF, en la ventana de impresión elige «Guardar como PDF» como destino.</span></div>
  ${html}</body></html>`);
  w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 500);
}
function bitPDF(id) {
  const r = bitDe(id); if (!r) return;
  if (typeof licBloqueaDescarga === 'function' && licBloqueaDescarga()) return;   // en la prueba gratis no se imprime ni descarga
  bitVentana('Reporte de incidencia escolar', bitHTML(r));
}

// ── Protocolo docente de prevención, reporte y canalización (texto general, con el encabezado de TU escuela) ──
function bitProtoHTML() {
  const C = '#233b6e', H = t => `<p style="margin:14px 0 4px;font-size:12pt;font-weight:bold;color:${C};border-bottom:1px solid ${C}">${t}</p>`;
  const P = t => `<p style="margin:5px 0;font-size:10.5pt;line-height:1.4;text-align:justify">${t}</p>`;
  const UL = a => `<ul style="margin:4px 0 4px 18px;padding:0">${a.map(x => `<li style="font-size:10.5pt;line-height:1.4;margin:2px 0">${x}</li>`).join('')}</ul>`;
  const OL = a => `<ol style="margin:4px 0 4px 18px;padding:0">${a.map(x => `<li style="font-size:10.5pt;line-height:1.4;margin:4px 0">${x}</li>`).join('')}</ol>`;
  const paso = (n, t, d, col) => `<tr><td style="width:34px;text-align:center;background:${col || C};color:#fff;font-weight:bold;font-size:11pt;border:1px solid #fff">${n}</td><td style="border:1px solid #9ca3af;padding:6px 10px;font-size:10.5pt"><b>${t}</b>${d ? '<br><span style="font-size:9.5pt;color:#444">' + d + '</span>' : ''}</td></tr>`;
  const fila = '<tr>' + [1, 2, 3, 4].map(() => '<td style="border:1px solid #6b7280;height:28px"></td>').join('') + '</tr>';
  return `${bitEnc()}
  <p style="font-size:15pt;font-weight:bold;color:${C};margin:0 0 4px">Protocolo docente de prevención, reporte y canalización</p>
  ${H('Propósito')}
  ${P('Todo docente debe detectar, registrar y reportar por escrito, el mismo día, cualquier situación que ponga en riesgo a un alumno, por pequeña que parezca.')}
  ${P('Este protocolo tiene dos fines. El primero es proteger a nuestros alumnos y atender a tiempo lo que puede convertirse en un accidente o un hecho de violencia. El segundo es dejar constancia de que la escuela actuó con diligencia.')}
  ${P('Un reporte por sí solo no protege a nadie. Lo que respalda al docente y a la escuela es poder demostrar cuatro cosas: que detectó, que avisó a tiempo, que protegió al alumno y que siguió el protocolo oficial. Un expediente con reportes sin acciones posteriores puede probar que la escuela sabía y no actuó.')}
  ${H('Acciones obligatorias del docente')}
  ${OL(['<b>Observar y registrar a diario.</b> Anotar en la bitácora del grupo, con fecha, hora, lugar y testigos, todo hecho fuera de lo normal: peleas, burlas repetidas, golpes visibles, aislamiento, cambios bruscos de conducta, objetos peligrosos o comentarios de amenaza. Solo hechos, sin opiniones ni diagnósticos.',
    '<b>Reportar por escrito el mismo día</b> a Dirección y a Trabajo Social, con acuse de recibido (firma o correo institucional). Un aviso verbal en el pasillo no deja constancia.',
    '<b>Proteger primero, investigar después.</b> Si hay riesgo inmediato, separar al alumno del peligro, no dejarlo solo y avisar de inmediato a Dirección. No se esperan pruebas para actuar.',
    '<b>Tomar en serio toda amenaza</b>, aunque se diga «de broma»: mensajes, retos virales, dibujos o frases sobre armas o sobre hacerse daño. Se reporta y se conserva la evidencia (captura, objeto, nombre de quien lo vio).',
    '<b>Informar a la familia a través de Dirección</b>, nunca por cuenta propia, con minuta firmada de cada reunión.',
    '<b>Dar seguimiento.</b> Preguntar qué se hizo con el reporte y anotar la respuesta. Si no la hay, volver a reportar por escrito.',
    '<b>Conocer y aplicar el protocolo oficial de tu entidad</b> (Secretaría de Educación estatal). Actuar fuera del protocolo es lo que más expone a un docente.'])}
  ${H('Alumnos en situación especial')}
  ${P('El docente no diagnostica ni da terapia: describe lo que observa y lo canaliza a Trabajo Social u Orientación, que deciden la atención y la derivación (DIF, sector salud, USAER). Señales que deben reportarse para canalización:')}
  ${UL(['Tristeza persistente, llanto frecuente o aislamiento del grupo', 'Marcas o comentarios sobre lastimarse a sí mismo', 'Indicios de consumo de alcohol, tabaco, vapeadores u otras sustancias', 'Señales de violencia, descuido o abandono en casa', 'Conducta agresiva repetida hacia compañeros o maestros', 'Faltas frecuentes sin justificar o caída brusca del rendimiento', 'Discapacidad o necesidad de apoyo sin atención', 'Ser blanco repetido de burlas, exclusión o acoso, incluso en redes sociales'])}
  ${P('Ante riesgo de que el alumno se haga daño o lo haga a otros, el aviso a Dirección es <b>inmediato</b>, no al final del día.')}
  ${H('Lo que el docente no debe hacer')}
  ${UL(['No interrogar al alumno ni pedirle que repita su relato varias veces. Escuchar y anotar sus palabras exactas.', 'No confrontar al presunto agresor ni reunir a las partes por cuenta propia.', 'No prometer guardar un secreto. Explicar con calma que se pedirá ayuda a quien puede protegerlo.', 'No investigar, revisar celulares ni hacer careos. Eso corresponde a la autoridad.', 'No comentar el caso en pasillos, con otros alumnos ni en grupos de WhatsApp.', 'No minimizar («son cosas de muchachos») ni dejar el reporte para después.', 'No resolver solo una situación grave aunque parezca controlada.'])}
  ${H('Ruta de reporte')}
  <table style="width:100%;border-collapse:collapse;margin:6px 0;page-break-inside:avoid">
    ${paso(1, 'Detecta la situación', '')}
    ${paso(2, '¿Riesgo inmediato?', '<b>Sí:</b> proteger al alumno y avisar de inmediato a Dirección. &nbsp; <b>No:</b> registrar en bitácora.', '#b45309')}
    ${paso(3, 'Reporte escrito el mismo día, con acuse', 'A Dirección y a Trabajo Social (formato «Reporte de incidencia escolar»).')}
    ${paso(4, 'Dirección activa el protocolo oficial', 'Informa a la familia y canaliza con Trabajo Social (DIF, salud, USAER).', '#1d4ed8')}
    ${paso(5, 'El docente da seguimiento', 'Anota la respuesta recibida; si no la hay, reporta de nuevo por escrito.')}
  </table>
  ${P('Aun cuando hay riesgo inmediato y se avisa de palabra, después se entrega el reporte escrito. Sin papel no hay constancia.')}
  ${H('Formato de reporte de incidencia')}
  ${P('Usa el formato «Reporte de incidencia escolar» de esta misma sección. Cada docente debe llenar uno por cada hecho y entregarlo a Dirección con copia a Trabajo Social, conservando una copia con el acuse de recibido.')}
  ${H('Marco normativo')}
  ${UL(['<b>Ley General de los Derechos de Niñas, Niños y Adolescentes:</b> toda persona, y en especial todo servidor público, que conozca una posible vulneración de derechos de un menor debe avisar de inmediato a la autoridad competente. No reportar también genera responsabilidad.', '<b>Protocolo oficial de actuación ante el acoso escolar y la violencia</b> de la Secretaría de Educación de tu entidad.'])}
  ${P('Ante casos concretos con posibles consecuencias legales, consultar al área jurídica de la Secretaría de Educación de tu entidad. Este material es de apoyo y no sustituye el protocolo oficial vigente.')}
  <div style="page-break-inside:avoid">${H('Acuse de conocimiento')}
  ${P('El personal firmante declara haber recibido y leído este protocolo, y se compromete a aplicarlo.')}
  <table style="width:100%;border-collapse:collapse;margin-top:6px"><tr>${['Nombre', 'Función', 'Firma', 'Fecha'].map(t => `<td style="border:1px solid #6b7280;background:#dbe4f3;font-weight:bold;font-size:9.5pt;padding:5px 8px">${t}</td>`).join('')}</tr>${fila.repeat(8)}</table>
  <p style="margin:14px 0 0;font-size:10pt;text-align:center">Atentamente.<br><b>La Dirección de la escuela</b></p></div>`;
}
function bitProto() { bitVentana('Protocolo docente de prevención, reporte y canalización', bitProtoHTML()); }
function bitProtoWord() { descargarWord(bitProtoHTML(), 'Protocolo_docente_prevencion_reporte_canalizacion.doc'); }
