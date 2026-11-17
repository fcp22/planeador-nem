// ============================================================
// LICENCIA E IA — llamadas al servidor de IA, «Mi licencia» y
// panel de administración de códigos.
// Depende de: auth.js (AUTH, getUsuario), firebase-config.js
// ============================================================

const LIC = { estado: null, cargando: false, adminKey: '' };

function workerUrl() { return String((window.NEM_CONFIG && window.NEM_CONFIG.workerUrl) || '').replace(/\/+$/, ''); }
async function idToken() { const u = AUTH && AUTH.auth && AUTH.auth.currentUser; return u ? await u.getIdToken() : null; }
const esperar = ms => new Promise(r => setTimeout(r, ms));

// Llamada genérica al servidor
async function workerFetch(ruta, { metodo = 'GET', body, admin } = {}) {
  const base = workerUrl();
  if (!base) { const e = new Error('La IA todavía no está conectada (falta «workerUrl» en firebase-config.js).'); e.codigo = 'config'; throw e; }
  const headers = {};
  if (admin) headers['X-Admin-Key'] = admin;
  else { const t = await idToken(); if (!t) { const e = new Error('Inicia sesión para continuar.'); e.codigo = 'sin_sesion'; throw e; } headers.Authorization = 'Bearer ' + t; }
  if (body) headers['Content-Type'] = 'application/json';
  let res;
  try { res = await fetch(base + ruta, { method: metodo, headers, body: body ? JSON.stringify(body) : undefined }); }
  catch (e) { const er = new Error('No hay conexión con el servidor. Revisa tu internet.'); er.codigo = 'red'; er.reintentar = true; throw er; }
  let data = null; try { data = await res.json(); } catch (e) { /* sin cuerpo */ }
  if (!res.ok) {
    const m = (data && data.error) || {};
    const er = new Error(m.message || `Error ${res.status}`); er.codigo = m.codigo || 'http_' + res.status; er.status = res.status; er.reintentar = !!m.reintentar; throw er;
  }
  return data;
}

// Mensaje + a dónde ir cuando el problema es de licencia
const LIC_CODIGOS = ['sin_licencia', 'vencida', 'cuota', 'tipo_prueba', 'revocada', 'correo_sin_verificar'];
function licMensajeIA(e) {
  if (LIC_CODIGOS.includes(e.codigo)) return e.message + ' (Menú → «Mi licencia»)';
  return e.message;
}

// Pide texto a la IA. json=true pide formato JSON.
async function llamarIA(prompt, { json = false, tipo } = {}) {
  let ultimo;
  // El servidor ya reintenta y cambia de modelo por su cuenta; aquí solo se da una segunda oportunidad a fallos de red o de saturación.
  for (let intento = 0; intento < 2; intento++) {
    try {
      const data = await workerFetch('/v1/generar', { metodo: 'POST', body: { prompt, json, tipo } });
      if (data.cuota) { LIC.estado = Object.assign(LIC.estado || {}, { limite: data.cuota.limite, usadas: data.cuota.usadas, restantes: data.cuota.restantes, activa: true }); licPintarChip(); }
      const texto = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!texto) throw new Error('Respuesta vacía del servicio de IA');
      return texto;
    } catch (e) {
      ultimo = e;
      if (e.reintentar && intento < 1) { await esperar(3000); continue; }   // solo se reintenta lo que no es de licencia/cuota
      break;
    }
  }
  if (['sin_licencia', 'vencida', 'revocada'].includes(ultimo.codigo) && !licEsAdminCuenta()) licCargar().then(e => { if (e && !e.activa) licPuertaBloquear(e); });
  const err = new Error(licMensajeIA(ultimo)); err.codigo = ultimo.codigo; throw err;
}

// ── Estado de la licencia ─────────────────────────────────
function licPintarChip() {
  licPintarCandados();
  const c = document.getElementById('h-cuota'); if (!c) return;
  const e = LIC.estado;
  if (!e || !workerUrl()) { c.style.display = 'none'; return; }
  c.style.display = 'inline-block';
  const pocos = e.restantes <= Math.max(1, Math.round(e.limite * 0.1));
  // Plan de pago: la IA está incluida (el tope mensual es solo de «uso justo» y no se muestra hasta que se acerca). La prueba sí muestra su contador.
  c.textContent = !e.activa ? 'IA sin licencia' : e.prueba ? `IA ${e.usadas}/${e.limite}` : `IA: te quedan ${e.restantes}`;
  c.style.background = e.activa ? (pocos ? '#f59e0b' : 'rgba(255,255,255,.18)') : '#dc2626';
}
async function licCargar() {
  if (!workerUrl()) return null;
  try { LIC.estado = await workerFetch('/v1/estado'); LIC.error = ''; }
  catch (e) { LIC.estado = null; LIC.error = e.message; }
  licPintarChip(); return LIC.estado;
}
function licReiniciar() { LIC.estado = null; LIC.error = ''; licPintarChip(); }

function licFecha(iso) { return iso ? new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'; }

// ── PUERTA DE ACCESO: sin licencia vigente, la app NO se abre ──────────────
// Se revisa al entrar, cada 20 minutos y al volver a la pestaña. Mientras la licencia no esté vigente solo se
// ve la pantalla de bloqueo (canjear un código, descargar el respaldo o cerrar sesión).
// Las cuentas de administrador (adminEmails) nunca se bloquean, para poder generar códigos.
// Nota: la app es una página estática; esta puerta frena el uso normal. La verificación fuerte de la IA sigue en el servidor.
const LIC_PUERTA = { ultimo: 0, timer: null, activa: false };
function licEsAdminCuenta() {
  const u = (typeof getUsuario === 'function') ? getUsuario() : null; const em = String((u && u.email) || '').toLowerCase();
  return !!em && ((window.NEM_CONFIG && window.NEM_CONFIG.adminEmails) || []).map(x => String(x).toLowerCase()).includes(em);
}
function licCacheKey() { const u = (typeof getUsuario === 'function') ? getUsuario() : null; return 'nem_lic_ok_' + ((u && (u.uid || u.email)) || 'anon'); }
function licCacheGuardar(vence) { try { localStorage.setItem(licCacheKey(), vence || ''); } catch (e) { /* sin almacenamiento */ } }
function licCacheVigente() { try { const v = localStorage.getItem(licCacheKey()); return !!v && Date.parse(v) > Date.now(); } catch (e) { return false; } }
function licPuertaEl() {
  let el = document.getElementById('lic-puerta');
  if (!el) { el = document.createElement('div'); el.id = 'lic-puerta'; el.style.cssText = 'position:fixed;inset:0;z-index:100000;background:linear-gradient(160deg,#1e3a5f,#0f2744);display:none;align-items:center;justify-content:center;padding:16px;overflow:auto;'; document.body.appendChild(el); }
  return el;
}
const LIC_TARJETA = 'background:#fff;border-radius:16px;max-width:460px;width:100%;padding:26px 24px;box-shadow:0 20px 60px rgba(0,0,0,.35);text-align:center;font-family:inherit;color:#1e293b;';
function licPuertaAbrir(texto) {
  const el = licPuertaEl(); el.style.display = 'flex';
  el.innerHTML = `<div style="${LIC_TARJETA}"><div style="font-size:34px">🔑</div><p style="margin:10px 0 0;font-size:15px">${texto || 'Verificando tu licencia…'}</p></div>`;
  const app = document.getElementById('app'); if (app) app.setAttribute('inert', '');
}
function licPuertaCerrar() {
  const el = document.getElementById('lic-puerta'); if (el) el.style.display = 'none';
  const app = document.getElementById('app'); if (app) app.removeAttribute('inert');
  LIC_PUERTA.activa = true;
}
function licPuertaBloquear(e, errRed) {
  LIC_PUERTA.activa = false;
  const el = licPuertaEl(); el.style.display = 'flex';
  const app = document.getElementById('app'); if (app) app.setAttribute('inert', '');
  const u = (typeof getUsuario === 'function') ? getUsuario() : null;
  let titulo, msg;
  if (errRed) { titulo = 'No pudimos verificar tu licencia'; msg = 'Revisa tu conexión a internet e inténtalo de nuevo.'; }
  else if (e && e.prueba) { titulo = 'Tu prueba gratis terminó'; msg = 'Para seguir usando el Planeador necesitas una licencia. Canjea tu código para continuar.'; }
  else if (e && e.vence && Date.parse(e.vence) > Date.now()) { titulo = 'Tu licencia está desactivada'; msg = 'Contacta a quien te la vendió para reactivarla.'; }
  else if (e && e.vence) { titulo = 'Tu licencia venció'; msg = `Venció el ${licFecha(e.vence)}. Canjea un código de renovación para seguir usando el Planeador.`; }
  else { titulo = 'Aún no tienes una licencia'; msg = 'Tu prueba gratis ya se usó. Canjea tu código para usar el Planeador.'; }
  const contacto = window.NEM_CONFIG && window.NEM_CONFIG.contacto;
  el.innerHTML = `<div style="${LIC_TARJETA}">
    <div style="font-size:38px">🔒</div>
    <h2 style="margin:8px 0 6px;font-size:20px;color:#1e3a5f">${titulo}</h2>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#475569">${msg}</p>
    ${errRed ? '' : `<input id="lp-codigo" placeholder="NEM-XXXX-XXXX-XXXX" maxlength="16" oninput="this.value=this.value.toUpperCase()" style="width:100%;box-sizing:border-box;padding:12px;font-size:16px;letter-spacing:.05em;text-align:center;border:1.5px solid #cbd5e1;border-radius:10px;margin-bottom:10px">
    <div id="lp-err" style="display:none;color:#b91c1c;font-size:13px;margin-bottom:10px"></div>`}
    <button id="lp-btn" onclick="${errRed ? 'licPuertaReintentar()' : 'licPuertaCanjear()'}" style="width:100%;padding:12px;font-size:15px;font-weight:700;border:0;border-radius:10px;background:#1e3a5f;color:#fff;cursor:pointer">${errRed ? 'Reintentar' : 'Activar y entrar'}</button>
    <p style="font-size:12.5px;color:#64748b;margin:14px 0 0">¿Aún no tienes código? ${contacto ? gEsc(contacto) + ' · ' : ''}<a href="suscripcion.html" target="_blank" rel="noopener" style="color:#1d4ed8;font-weight:600">Ver planes</a></p>
    <p style="font-size:12px;color:#64748b;margin:14px 0 0">Tus datos (grupos, calificaciones) siguen guardados en este dispositivo.</p>
    <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      ${typeof gRespaldar === 'function' && typeof G !== 'undefined' && G.data ? '<button onclick="gRespaldar()" style="padding:8px 14px;border:1.5px solid #cbd5e1;border-radius:8px;background:#fff;cursor:pointer;font-size:13px">⬇ Descargar mi respaldo</button>' : ''}
      <button onclick="licPuertaSalir()" style="padding:8px 14px;border:1.5px solid #cbd5e1;border-radius:8px;background:#fff;cursor:pointer;font-size:13px">Cerrar sesión</button>
    </div>
    <p style="font-size:11px;color:#94a3b8;margin:12px 0 0">Cuenta: ${gEsc((u && u.email) || '')}</p>
  </div>`;
}
function licPuertaSalir() { const el = document.getElementById('lic-puerta'); if (el) el.style.display = 'none'; const app = document.getElementById('app'); if (app) app.removeAttribute('inert'); if (typeof doLogout === 'function') doLogout(); }
async function licPuertaCanjear() {
  const c = (document.getElementById('lp-codigo').value || '').trim(), err = document.getElementById('lp-err'), b = document.getElementById('lp-btn');
  err.style.display = 'none';
  if (!c) { err.textContent = 'Escribe tu código.'; err.style.display = 'block'; return; }
  b.disabled = true; b.textContent = 'Activando…';
  try { LIC.estado = await workerFetch('/v1/activar', { metodo: 'POST', body: { codigo: c } }); await licPuertaVerificar(); }
  catch (e) { err.textContent = e.message; err.style.display = 'block'; b.disabled = false; b.textContent = 'Activar y entrar'; }
}
function licPuertaReintentar() { licPuertaVerificar(); }
// Verifica la licencia y abre o cierra la puerta. Devuelve true si la app puede usarse.
async function licPuertaVerificar() {
  if (!workerUrl() || licEsAdminCuenta()) { licPuertaCerrar(); licCargar(); return true; }
  licPuertaAbrir();
  const e = await licCargar(); LIC_PUERTA.ultimo = Date.now();
  if (e && e.activa) { licCacheGuardar(e.vence); licPuertaCerrar(); if (typeof G !== 'undefined' && G.tab === 'inicio' && typeof gRender === 'function') gRender(); return true; }
  if (e) { licPuertaBloquear(e); return false; }
  if (licCacheVigente()) { licPuertaCerrar(); return true; }   // sin conexión: se permite mientras la última licencia verificada siga vigente
  licPuertaBloquear(null, true); return false;
}
// Revisión silenciosa mientras la app está abierta
async function licPuertaRevisar() {
  if (!workerUrl() || licEsAdminCuenta() || !(typeof getUsuario === 'function' && getUsuario())) return;
  const e = await licCargar(); LIC_PUERTA.ultimo = Date.now();
  if (e && e.activa) { licCacheGuardar(e.vence); return; }
  if (e) licPuertaBloquear(e);
}
function licPuertaVigilar() {
  clearInterval(LIC_PUERTA.timer); LIC_PUERTA.timer = setInterval(licPuertaRevisar, 20 * 60 * 1000);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && LIC_PUERTA.activa && Date.now() - LIC_PUERTA.ultimo > 10 * 60 * 1000) licPuertaRevisar(); });

// ── PRUEBA GRATIS: qué incluye y qué queda para quien tiene licencia ──────────
// Incluye: 2 documentos con IA (uno de cada tipo; el examen de hasta 5 reactivos y 1 sola secuencia), verlos en pantalla,
// crear grupos y generar el examen. NO incluye: descargar Word/PDF/Excel, subir listas desde archivo, pase de lista,
// calificaciones ni seguimiento de rezago (eso se abre con la licencia). El tope de documentos lo hace cumplir el servidor.
const LIC_TABS_CON_LICENCIA = { lista: 'Pase de lista', calif: 'Calificaciones y promedios', rezago: 'Seguimiento de rezago', recup: 'Recuperativos', bitacora: 'Bitácora e incidencias', escaner: 'Escanear examen' };
// Botón «Ver planes y precios» (página de suscripción, en ventana aparte para no cerrar la app)
const LIC_BTN_PLANES = (est) => `<button type="button" onclick="var a=document.getElementById('lic-aviso-prueba');if(a)a.style.display='none';gIrA('planes')" style="${est || 'display:block;width:100%;text-align:center;margin-top:8px;padding:11px;font-size:14.5px;font-weight:700;border:2px solid #1e3a5f;border-radius:10px;background:#fff;color:#1e3a5f;cursor:pointer'}">💳 Ver planes y precios</button>`;
function licEsPrueba() { const e = LIC.estado; return !!(e && e.prueba && e.activa) && !licEsAdminCuenta(); }
function licTabBloqueada(id) { return !!LIC_TABS_CON_LICENCIA[id] && licEsPrueba(); }
function licHTMLBloqueo(id) {
  return `<div class="card pronto-box"><div class="pi">🔒</div><h2>${LIC_TABS_CON_LICENCIA[id]}</h2>
    <p>Esta herramienta se abre con tu licencia: subir tu lista de alumnos desde Excel, pasar lista, calificaciones, promedios, detección de rezago y reportes de incidencia con sus protocolos y escáner de exámenes.</p>
    <p style="font-size:12.5px;color:var(--gris)">En tu prueba gratis puedes crear 2 documentos con IA (un plano o analítico y un examen) y verlos en pantalla.</p>
    <button class="g-btn" style="margin-top:14px" onclick="gIrA('licencia')">Activar mi licencia</button>
    <div style="max-width:320px;margin:8px auto 0">${LIC_BTN_PLANES()}</div></div>`;
}
function licAvisoPrueba(que) {
  let el = document.getElementById('lic-aviso-prueba');
  if (!el) { el = document.createElement('div'); el.id = 'lic-aviso-prueba'; el.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,39,68,.6);display:flex;align-items:center;justify-content:center;padding:16px;'; document.body.appendChild(el); }
  el.style.display = 'flex';
  el.innerHTML = `<div style="${LIC_TARJETA}"><div style="font-size:34px">🔒</div>
    <h2 style="margin:8px 0 6px;font-size:19px;color:#1e3a5f">Disponible con tu licencia</h2>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#475569">${que || 'Descargar el documento'} está disponible con tu licencia. En la prueba gratis puedes ver tu documento completo en pantalla.</p>
    <button onclick="document.getElementById('lic-aviso-prueba').style.display='none';gIrA('licencia')" style="width:100%;padding:12px;font-size:15px;font-weight:700;border:0;border-radius:10px;background:#1e3a5f;color:#fff;cursor:pointer">Activar mi licencia</button>
    ${LIC_BTN_PLANES()}
    <button onclick="document.getElementById('lic-aviso-prueba').style.display='none'" style="width:100%;margin-top:8px;padding:10px;font-size:14px;border:1.5px solid #cbd5e1;border-radius:10px;background:#fff;cursor:pointer">Seguir viendo</button></div>`;
}
// true = en la prueba: no se descarga (y avisa)
// Pone (o quita) el candado en las opciones del menú que solo abre la licencia
function licPintarCandados() {
  document.querySelectorAll('.nav-tab').forEach(btn => {
    const m = (btn.getAttribute('onclick') || '').match(/showTab\('(\w+)'/); if (!m || !LIC_TABS_CON_LICENCIA[m[1]]) return;
    const hay = btn.querySelector('.sb-candado');
    if (licTabBloqueada(m[1])) { if (!hay) { const sp = document.createElement('span'); sp.className = 'sb-pronto sb-candado'; sp.title = 'Disponible con licencia'; sp.textContent = '🔒'; btn.appendChild(sp); } }
    else if (hay) hay.remove();
  });
}
function licBloqueaDescarga() { if (!licEsPrueba()) return false; licAvisoPrueba('Descargar el documento'); return true; }

// ── Pantalla «Mi licencia» ────────────────────────────────
async function licRender() {
  const p = document.getElementById('g-licencia'); if (!p) return;
  const u = getUsuario();
  p.innerHTML = `<div class="sec-title">Mi licencia</div><div class="sec-sub">Tu acceso al Planeador: planeaciones y exámenes con IA, descarga en Word y las herramientas de grupo (lista, calificaciones, rezago).</div><div class="card"><p style="color:var(--gris)">Consultando tu licencia…</p></div>`;
  const e = await licCargar();
  let h = `<div class="sec-title">Mi licencia</div><div class="sec-sub">Tu acceso al Planeador: planeaciones y exámenes con IA, descarga en Word y las herramientas de grupo (lista, calificaciones, rezago).</div>`;
  if (!workerUrl()) h += `<div class="g-aviso" style="background:#fffbeb;border-color:#fde68a;color:#92400e">La IA aún no está conectada a un servidor (falta «workerUrl» en <code>firebase-config.js</code>).</div>`;
  else if (!e) h += `<div class="g-aviso" style="background:#fef2f2;border-color:#fecaca;color:#991b1b">${gEsc(LIC.error || 'No se pudo consultar tu licencia.')} <button class="g-btn g-btn-s" onclick="licRender()">Reintentar</button></div>`;
  else {
    const pct = e.limite ? Math.min(100, Math.round(e.usadas * 100 / e.limite)) : 0;
    const color = !e.activa ? '#dc2626' : pct >= 90 ? '#f59e0b' : '#16a34a';
    h += `<div class="card"><div class="card-title">🔑 ${e.prueba ? 'Prueba gratis' : (e.plan ? 'Plan ' + gEsc(e.plan) : 'Licencia')} <span class="g-tag" style="margin-left:auto;background:${color}">${e.activa ? 'Activa' : (e.limite ? 'Vencida' : 'Sin licencia')}</span></div>
      <div style="font-size:13px;margin-bottom:12px"><b>Cuenta:</b> ${gEsc(e.correo || (u && u.email) || '')}</div>
      ${e.limite ? `<div style="font-size:13px;margin-bottom:6px"><b>Documentos con IA ${e.prueba ? 'de la prueba' : 'este mes'}:</b> ${e.usadas} de ${e.limite} usados · <b>te quedan ${e.restantes}</b>${e.prueba ? '' : ' <span style="color:var(--gris)">(se renuevan el día 1 de cada mes)</span>'}</div>
      <div style="height:10px;background:var(--gris-claro);border-radius:6px;overflow:hidden;margin-bottom:12px"><div style="height:100%;width:${pct}%;background:${color}"></div></div>` + `
      <div style="font-size:13px"><b>${e.activa ? 'Vigente hasta' : 'Venció el'}:</b> ${licFecha(e.vence)}</div>${e.prueba && e.activa ? `<div class="g-aviso" style="margin-top:12px;font-size:12.5px;line-height:1.5"><b>Tu prueba incluye:</b> ${e.limite} documentos con IA (uno de cada tipo: analítico o plano, secuencia y examen de hasta 5 reactivos), verlos completos en pantalla y crear tus grupos.<br><b>Con la licencia se abre:</b> descargar en Word, subir tu lista desde Excel, pase de lista, calificaciones y promedios, seguimiento de rezago, reportes de incidencia (PDF) con protocolos y la IA incluida en tu plan.</div><div style="max-width:320px">${LIC_BTN_PLANES()}</div>` : ''}` : `<p style="color:var(--gris)">Tu prueba gratis ya se usó. Canjea un código para seguir usando la IA.</p>`}
    </div>`;
  }
  h += `<div class="card"><div class="card-title">🎟️ Canjear un código</div>
    <div class="campo"><label>Código de licencia</label><input id="lic-codigo" placeholder="NEM-XXXX-XXXX-XXXX" maxlength="16" oninput="this.value=this.value.toUpperCase()" style="max-width:320px;letter-spacing:.05em"></div>
    <div class="l-err" id="lic-err" style="margin:0 0 12px"></div><div class="l-ok" id="lic-ok" style="margin:0 0 12px"></div>
    <button class="g-btn" id="lic-btn" onclick="licCanjear()">Canjear código</button>
    <div class="ayuda" style="font-size:12px;color:var(--gris);margin-top:10px">¿Aún no tienes código? ${window.NEM_CONFIG && window.NEM_CONFIG.contacto ? gEsc(window.NEM_CONFIG.contacto) + ' · ' : ''}<a href="suscripcion.html" target="_blank" rel="noopener">Ver planes</a></div>
    <div class="ayuda" style="font-size:12px;color:var(--gris);margin-top:10px">Si ya tienes una licencia vigente, el nuevo código <b>suma</b> el tiempo. La licencia es de tu cuenta: sirve en tu celular y en tu computadora.</div></div>
    <div class="card"><div class="card-title">👤 Mi cuenta</div><div style="font-size:13px;margin-bottom:10px">${gEsc((u && u.email) || '')}</div><button class="g-btn g-btn-s" onclick="doLogout()">Cerrar sesión</button></div>`;
  p.innerHTML = h;
}
async function licCanjear() {
  const cod = document.getElementById('lic-codigo').value.trim(); const err = document.getElementById('lic-err'), ok = document.getElementById('lic-ok');
  err.style.display = ok.style.display = 'none';
  if (!cod) { err.textContent = 'Escribe tu código.'; err.style.display = 'block'; return; }
  const b = document.getElementById('lic-btn'); b.disabled = true; b.textContent = 'Canjeando…';
  try { LIC.estado = await workerFetch('/v1/activar', { metodo: 'POST', body: { codigo: cod } }); await licRender(); const o = document.getElementById('lic-ok'); o.textContent = '✓ Listo. Tu licencia está activa.'; o.style.display = 'block'; }
  catch (e) { err.textContent = e.message; err.style.display = 'block'; b.disabled = false; b.textContent = 'Canjear código'; }
}

// ── Panel de administración de licencias ──────────────────
function licAdminRender() {
  const p = document.getElementById('g-licadmin'); if (!p) return;
  p.innerHTML = `<div class="sec-title">Licencias (administrador)</div><div class="sec-sub">Genera códigos para vender, revisa quién los usó y bloquea correos temporales.</div>
  <div class="card"><div class="card-title">🛡️ Clave de administrador</div>
    <div class="campo" style="max-width:340px"><label>Clave (ADMIN_SECRET del servidor)</label><input id="la-clave" type="password" autocomplete="off" value="${gEsc(LIC.adminKey)}" onchange="LIC.adminKey=this.value"></div>
    <div class="ayuda" style="font-size:11px;color:var(--gris)">No se guarda: tendrás que escribirla otra vez al recargar la página.</div></div>
  <div class="card"><div class="card-title">➕ Generar códigos</div>
    <div class="f3"><div class="campo"><label>Cantidad</label><input id="la-cant" type="number" min="1" max="100" value="1"></div>
    <div class="campo"><label>Vigencia</label><select id="la-vig"><option value="m1">1 mes</option><option value="m3">3 meses</option><option value="m6">6 meses</option><option value="m12">12 meses</option><option value="d1">1 día (para probar el vencimiento)</option><option value="d5">5 días (cupón de cortesía)</option></select></div>
    <div class="campo"><label>Tope de uso justo al mes (documentos)</label><input id="la-cuota" type="number" min="1" max="2000" value="60"><div class="ayuda" style="font-size:11px;color:var(--gris)">Es lo que el maestro ve en «Mi licencia»: «tu plan incluye hasta N documentos con IA al mes». Un uso normal es de 30 a 60 al mes; con 200 no se le acaba. Para la prueba del ATP usa 100.</div></div></div>
    <div class="f2"><div class="campo"><label>Plan (etiqueta)</label><input id="la-plan" placeholder="Ej. Trimestral"></div><div class="campo"><label>Nota (para ti)</label><input id="la-nota" placeholder="Ej. Prof. Pérez / escuela X"></div></div>
    <div class="l-err" id="la-err" style="margin:0 0 12px"></div>
    <button class="g-btn" onclick="licAdminGenerar()">Generar códigos</button>
    <div id="la-salida" style="margin-top:14px"></div></div>
  <div class="card"><div class="card-title">📋 Códigos y uso</div><button class="g-btn g-btn-s" onclick="licAdminListar()">Actualizar lista</button><div id="la-lista" style="margin-top:12px"></div></div>
  <div class="card"><div class="card-title">💳 Créditos de IA</div>
    <div class="ayuda" style="font-size:12.5px;color:var(--gris);margin-bottom:10px">Cuánto has gastado de la IA y cuánto te queda, para recargar a tiempo. Es una <b>estimación</b> con lo que gastan los maestros; el saldo exacto lo ves siempre en la consola de tu proveedor.</div>
    <button class="g-btn" id="la-cred-btn" onclick="licAdminCreditos()">Ver cómo voy</button>
    <div id="la-cred" style="margin-top:12px"></div></div>
  <div class="card"><div class="card-title">🩺 Probar la IA</div>
    <div class="ayuda" style="font-size:12px;color:var(--gris);margin-bottom:10px">Hace una generación real de prueba (no descuenta documentos a nadie) y te dice si la llave, el saldo y el modelo funcionan. Úsala antes de vender y cuando alguien reporte un error.</div>
    <div class="campo" style="max-width:340px"><label>Modelo (opcional, para probar uno en particular)</label><input id="la-modelo" placeholder="Vacío = el configurado en el servidor"></div>
    <button class="g-btn" id="la-prb" onclick="licAdminProbar()">Probar ahora</button>
    <div id="la-prb-out" style="margin-top:12px"></div></div>
  <div class="card"><div class="card-title">🚫 Bloquear un dominio de correo</div>
    <div class="campo" style="max-width:340px"><label>Dominio</label><input id="la-dom" placeholder="ejemplo-temporal.com"></div>
    <button class="g-btn g-btn-s" onclick="licAdminBloquear(false)">Bloquear</button> <button class="g-btn g-btn-s" onclick="licAdminBloquear(true)">Quitar bloqueo</button>
    <div class="l-ok" id="la-dom-ok" style="margin-top:10px"></div></div>`;
}
function licAdminClave() { const k = document.getElementById('la-clave').value; LIC.adminKey = k; return k; }
function licAdminErr(msg) { const e = document.getElementById('la-err'); if (e) { e.textContent = msg || ''; e.style.display = msg ? 'block' : 'none'; } }
async function licAdminGenerar() {
  licAdminErr('');
  const k = licAdminClave(); if (!k) return licAdminErr('Escribe la clave de administrador.');
  const vig = document.getElementById('la-vig').value; const body = { cantidad: +document.getElementById('la-cant').value || 1, cuota: +document.getElementById('la-cuota').value || 200, plan: document.getElementById('la-plan').value, nota: document.getElementById('la-nota').value };
  if (vig[0] === 'm') body.meses = +vig.slice(1); else body.dias = +vig.slice(1);
  try {
    const r = await workerFetch('/admin/codigos', { metodo: 'POST', body, admin: k });
    LIC.ultimos = r.codigos;
    document.getElementById('la-salida').innerHTML = `<div class="g-aviso" style="font-family:monospace;font-size:14px;line-height:1.9">${r.codigos.map(c => gEsc(c)).join('<br>')}</div>
      <button class="g-btn g-btn-s" onclick="licCopiar(this)">Copiar todos</button>`;
    licAdminListar();
  } catch (e) { licAdminErr(e.message); }
}
async function licAdminListar() {
  licAdminErr(''); const k = licAdminClave(); if (!k) return licAdminErr('Escribe la clave de administrador.');
  try {
    const r = await workerFetch('/admin/codigos', { admin: k });
    const filas = r.codigos.sort((a, b) => String(b.creado).localeCompare(String(a.creado)));
    document.getElementById('la-lista').innerHTML = filas.length ? `<div class="g-tabla-w"><table class="g-tabla"><thead><tr><th>Código</th><th>Estado</th><th>Cuenta</th><th>Plan / nota</th><th>Uso</th><th>Vence</th><th></th></tr></thead><tbody>` +
      filas.map(c => `<tr><td style="font-family:monospace;white-space:nowrap">${gEsc(c.codigo)}</td><td>${c.revocada || c.estado === 'revocado' ? '<span class="g-mal">Revocado</span>' : c.estado === 'activado' ? 'Canjeado' : 'Sin canjear'}</td><td>${gEsc(c.correo || '—')}</td><td>${gEsc([c.plan, c.nota].filter(Boolean).join(' · '))}</td><td>${c.usadas != null ? c.usadas + '/' + c.cuota : '—'}</td><td>${c.vence ? licFecha(c.vence) : (c.meses ? c.meses + ' m' : c.dias + ' d')}</td><td style="white-space:nowrap">${c.estado !== 'revocado' ? `<button class="g-x" title="Revocar" onclick="licAdminAccion('revocar','${c.codigo}')">🚫</button>` : ''}${c.estado === 'activado' ? `<button class="g-x" title="Ampliar" onclick="licAdminAccion('ampliar','${c.codigo}')">➕</button>` : ''}</td></tr>`).join('') + '</tbody></table></div>' : '<p style="color:var(--gris)">Aún no hay códigos.</p>';
  } catch (e) { licAdminErr(e.message); }
}
async function licAdminAccion(accion, codigo) {
  const k = licAdminClave(); let body = { codigo };
  if (accion === 'revocar') { if (!confirm('¿Revocar ' + codigo + '? La persona perderá el acceso a la IA.')) return; }
  else { const c = prompt('Nueva cuota mensual de documentos (deja vacío para no cambiarla):', ''); const m = prompt('Meses a sumar a la vigencia (0 para no cambiarla):', '0'); if (c) body.cuota = +c; if (+m) body.mesesMas = +m; }
  try { await workerFetch('/admin/' + accion, { metodo: 'POST', body, admin: k }); licAdminListar(); } catch (e) { licAdminErr(e.message); }
}
async function licAdminProbar() {
  licAdminErr(''); const k = licAdminClave(); if (!k) return licAdminErr('Escribe la clave de administrador.');
  const b = document.getElementById('la-prb'), o = document.getElementById('la-prb-out'); b.disabled = true; b.textContent = 'Probando… (puede tardar hasta un minuto)'; o.innerHTML = '';
  try {
    const r = await workerFetch('/admin/probar', { metodo: 'POST', body: { modelo: document.getElementById('la-modelo').value.trim() }, admin: k });
    const fila = (t, v) => `<tr><td style="padding:3px 10px 3px 0;color:var(--gris)">${t}</td><td>${v}</td></tr>`;
    const inten = (r.intentos || []).map(i => `<li><code>${gEsc(i.modelo)}</code> → ${gEsc(String(i.estado))} · ${gEsc(i.detalle || '')}</li>`).join('');
    const u = r.uso ? `${r.uso.input_tokens || '?'} entrada / ${r.uso.output_tokens || '?'} salida` : '—';
    const ult = r.ultimoProblema ? `<div style="font-size:12px;margin-top:10px;color:var(--gris)"><b>Último problema registrado${r.ultimoProblema.recuperado ? ' (se recuperó solo)' : ''}:</b> ${gEsc(r.ultimoProblema.hora ? new Date(r.ultimoProblema.hora).toLocaleString('es-MX') : '')}<ul style="margin:4px 0 0 18px">${(r.ultimoProblema.bitacora || []).map(i => `<li><code>${gEsc(i.modelo)}</code> → ${gEsc(String(i.estado))} · ${gEsc(i.detalle || '')}</li>`).join('')}</ul></div>` : '';
    o.innerHTML = `<div class="g-aviso" style="${r.ok ? '' : 'background:#fef2f2;border-color:#fecaca;color:#991b1b'}"><b>${r.ok ? '✓ La IA funciona' : '✗ La IA NO está funcionando'}</b>${r.ok && r.respaldo ? ' — <b>pero usó el modelo de respaldo</b>: revisa por qué falló el principal.' : ''}${!r.ok ? '<br>' + gEsc(r.mensaje || '') : ''}</div>
      <table style="font-size:13px;margin-top:8px">${fila('Servicio', gEsc(r.config.proveedor))}${fila('Modelos (principal → respaldo)', r.config.modelos.map(gEsc).join(' → '))}${r.ok ? fila('Respondió', '<code>' + gEsc(r.modelo) + '</code> en ' + (r.ms / 1000).toFixed(1) + ' s') : ''}${fila('Tokens', u)}${fila('Tope de respuesta', r.config.maxTokens + ' tokens')}</table>
      ${inten ? `<div style="font-size:12px;margin-top:8px"><b>Intentos fallidos en esta prueba:</b><ul style="margin:4px 0 0 18px">${inten}</ul></div>` : ''}${ult}
      ${r.ok && r.muestra ? `<details style="margin-top:8px"><summary style="cursor:pointer;font-size:12px">Ver la respuesta de prueba</summary><pre style="white-space:pre-wrap;font-size:11px">${gEsc(r.muestra)}</pre></details>` : ''}`;
  } catch (e) { licAdminErr(e.message); }
  b.disabled = false; b.textContent = 'Probar ahora';
}
// ── Cuadro «Créditos de IA» (estimación con los tokens que ha gastado el servidor) ──
const LIC_CONSOLAS = {
  'api.anthropic.com': ['Anthropic', 'https://console.anthropic.com/settings/billing'],
  'api.openai.com': ['OpenAI', 'https://platform.openai.com/settings/organization/billing/overview'],
  'api.groq.com': ['Groq', 'https://console.groq.com/settings/billing'],
};
async function licAdminCreditos() {
  licAdminErr(''); const k = licAdminClave(); if (!k) return licAdminErr('Escribe la clave de administrador.');
  const o = document.getElementById('la-cred'); o.textContent = 'Cargando…';
  try { LIC.ia = await workerFetch('/admin/ia', { admin: k }); licAdminCreditosPintar(); }
  catch (e) { o.innerHTML = ''; licAdminErr(e.status === 404 ? 'El servidor todavía no tiene el cuadro de créditos: pega el nuevo worker.js en Cloudflare (Edit code → Deploy).' : e.message); }
}
function licAdminCreditosPintar() {
  const d = LIC.ia, o = document.getElementById('la-cred'); if (!d || !o) return;
  const c = d.config || {}, cons = d.consumo || { docs: 0, tin: 0, tout: 0, desde: null }, m = d.mes || { docs: 0, tin: 0, tout: 0 };
  const usd = n => 'US$ ' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nf = n => (n || 0).toLocaleString('es-MX');
  const consola = LIC_CONSOLAS[d.proveedor];
  const precios = typeof c.pin === 'number' && typeof c.pout === 'number';
  const credito = typeof c.credito === 'number' && c.credito > 0 ? c.credito : null;
  const gasto = precios ? (cons.tin * c.pin + cons.tout * c.pout) / 1e6 : null;
  const resta = gasto != null && credito != null ? credito - gasto : null;
  const alerta = typeof c.alerta === 'number' ? c.alerta : (credito != null ? credito * 0.2 : 0);
  const porDoc = gasto != null && cons.docs > 0 ? gasto / cons.docs : null;
  const dias = cons.desde ? Math.max(1, (Date.now() - new Date(cons.desde).getTime()) / 86400000) : null;
  const ritmo = gasto != null && dias ? gasto / dias : null;
  const diasRest = resta != null && ritmo > 0 ? resta / ritmo : null;
  const nivel = d.sinSaldo || (resta != null && resta <= 0) ? 'rojo' : (resta != null && (resta <= alerta || (diasRest != null && diasRest < 7)) ? 'ambar' : 'verde');
  const col = { rojo: ['#fef2f2', '#fecaca', '#991b1b', '#dc2626'], ambar: ['#fffbeb', '#fcd34d', '#92400e', '#f59e0b'], verde: ['#f0fdf4', '#bbf7d0', '#166534', '#16a34a'] }[nivel];
  const enlace = consola ? `<a href="${consola[1]}" target="_blank" rel="noopener" style="font-weight:700">Abrir la consola de ${consola[0]} para recargar</a>` : 'Recarga en la consola de tu proveedor (' + gEsc(d.proveedor) + ').';
  let h = '';
  if (d.sinSaldo) h += `<div style="background:#fef2f2;border:2px solid #dc2626;color:#991b1b;border-radius:10px;padding:12px 14px;margin-bottom:12px"><b>⛔ La IA se quedó SIN SALDO</b> (${gEsc(new Date(d.sinSaldo.hora).toLocaleString('es-MX'))}). Los maestros no pueden generar documentos hasta que recargues.<br>${enlace}</div>`;
  else if (resta != null) h += `<div style="background:${col[0]};border:1.5px solid ${col[1]};color:${col[2]};border-radius:10px;padding:12px 14px;margin-bottom:12px"><b>${nivel === 'rojo' ? '⛔ Se acabó el crédito estimado' : nivel === 'ambar' ? '⚠️ Te está quedando poco: recarga pronto' : '✓ Crédito suficiente por ahora'}</b> — quedan aprox. <b>${usd(Math.max(0, resta))}</b> de ${usd(credito)}${diasRest != null ? ` · a este ritmo alcanzan unos <b>${diasRest < 1 ? 'menos de 1 día' : Math.floor(diasRest) + ' días'}</b>` : ''}.
    <div style="height:10px;background:rgba(0,0,0,.1);border-radius:6px;overflow:hidden;margin:8px 0 6px"><div style="height:100%;width:${Math.max(0, Math.min(100, resta / credito * 100))}%;background:${col[3]}"></div></div>${nivel !== 'verde' ? enlace : ''}</div>`;
  else h += `<div class="g-aviso" style="margin-bottom:12px">Para ver cuánto te queda, captura abajo tu saldo actual y los precios de tu proveedor, y pulsa <b>Guardar</b>. ${enlace}</div>`;
  const fila = (t, v) => `<tr><td style="padding:3px 14px 3px 0;color:var(--gris)">${t}</td><td>${v}</td></tr>`;
  h += `<table style="font-size:13px;margin-bottom:12px">${fila('Servicio / modelos', gEsc(d.proveedor) + ' · ' + (d.modelos || []).map(gEsc).join(' → '))}
    ${fila('Documentos con IA este mes (' + gEsc(d.mesClave || '') + ')', '<b>' + nf(m.docs) + '</b> · ' + nf(m.tin + m.tout) + ' tokens')}
    ${fila('Desde tu última recarga' + (cons.desde ? ' (' + gEsc(new Date(cons.desde).toLocaleDateString('es-MX')) + ')' : ''), '<b>' + nf(cons.docs) + '</b> documentos · ' + nf(cons.tin) + ' tokens de entrada / ' + nf(cons.tout) + ' de salida')}
    ${gasto != null ? fila('Gasto estimado desde la recarga', '<b>' + usd(gasto) + '</b>') : ''}${porDoc != null ? fila('Costo promedio por documento', '<b>' + usd(porDoc) + '</b>') : ''}</table>`;
  h += `<div class="f2"><div class="campo"><label>Saldo que muestra tu proveedor ahora (US$)</label><input id="la-ia-credito" type="number" min="0" step="0.01" value="${credito != null ? credito : ''}"></div>
    <div class="campo"><label>Avisarme cuando queden menos de (US$)</label><input id="la-ia-alerta" type="number" min="0" step="0.01" value="${typeof c.alerta === 'number' ? c.alerta : ''}" placeholder="${credito != null ? (credito * 0.2).toFixed(2) + ' (20 %)' : ''}"></div></div>
    <div class="f2"><div class="campo"><label>Precio por millón de tokens de ENTRADA (US$)</label><input id="la-ia-pin" type="number" min="0" step="0.01" value="${typeof c.pin === 'number' ? c.pin : ''}"></div>
    <div class="campo"><label>Precio por millón de tokens de SALIDA (US$)</label><input id="la-ia-pout" type="number" min="0" step="0.01" value="${typeof c.pout === 'number' ? c.pout : ''}"></div></div>
    <div class="ayuda" style="font-size:11.5px;color:var(--gris);margin-bottom:10px">Los precios los ves en la página de precios de tu proveedor, para el modelo que usas. Sin ellos no se puede convertir tokens a dinero.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="g-btn" onclick="licAdminCreditosGuardar(false)">Guardar</button>
    <button class="g-btn g-btn-s" onclick="licAdminCreditosGuardar(true)">Ya recargué: empezar a contar de nuevo</button></div>`;
  if (porDoc != null) h += `<div style="margin-top:16px;border-top:1px solid var(--borde);padding-top:12px"><b style="font-size:13.5px">🧮 ¿Cuánto necesito recargar?</b>
    <div class="f2" style="margin-top:8px"><div class="campo"><label>Maestros con licencia</label><input id="la-calc-m" type="number" min="1" value="50" oninput="licAdminCalc()"></div><div class="campo"><label>Documentos con IA por maestro al mes</label><input id="la-calc-d" type="number" min="1" value="30" oninput="licAdminCalc()"></div></div>
    <div id="la-calc-r" style="font-size:13.5px"></div></div>`;
  o.innerHTML = h; licAdminCalc();
}
function licAdminCalc() {
  const d = LIC.ia, r = document.getElementById('la-calc-r'); if (!d || !r) return;
  const c = d.config || {}, cons = d.consumo || {}; if (!(cons.docs > 0) || typeof c.pin !== 'number' || typeof c.pout !== 'number') return;
  const porDoc = (cons.tin * c.pin + cons.tout * c.pout) / 1e6 / cons.docs;
  const mae = +document.getElementById('la-calc-m').value || 0, dm = +document.getElementById('la-calc-d').value || 0;
  const mes = mae * dm * porDoc;
  r.innerHTML = `${mae} maestros × ${dm} documentos = <b>${mae * dm}</b> documentos al mes ≈ <b>US$ ${mes.toFixed(2)}</b> al mes (a US$ ${porDoc.toFixed(3)} por documento). Para tener tranquilidad, recarga al menos <b>US$ ${(mes * 1.5).toFixed(2)}</b> (un mes y medio).`;
}
async function licAdminCreditosGuardar(nueva) {
  licAdminErr(''); const k = licAdminClave(); if (!k) return licAdminErr('Escribe la clave de administrador.');
  if (nueva && !confirm('Esto reinicia el conteo de gasto desde hoy. Úsalo solo cuando YA hayas recargado y capturado tu saldo nuevo. ¿Continuar?')) return;
  const body = { nuevaRecarga: !!nueva };
  for (const [id, k2] of [['la-ia-credito', 'credito'], ['la-ia-alerta', 'alerta'], ['la-ia-pin', 'pin'], ['la-ia-pout', 'pout']]) { const v = document.getElementById(id).value; if (v !== '') body[k2] = +v; }
  try { await workerFetch('/admin/ia-config', { metodo: 'POST', body, admin: k }); await licAdminCreditos(); } catch (e) { licAdminErr(e.message); }
}
async function licAdminBloquear(quitar) {
  const k = licAdminClave(); const d = document.getElementById('la-dom').value; const ok = document.getElementById('la-dom-ok'); ok.style.display = 'none'; licAdminErr('');
  try { const r = await workerFetch('/admin/bloquear', { metodo: 'POST', body: { dominio: d, quitar }, admin: k }); ok.textContent = r.bloqueado ? '✓ Dominio bloqueado: ' + r.dominio : '✓ Bloqueo quitado: ' + r.dominio; ok.style.display = 'block'; }
  catch (e) { licAdminErr(e.message); }
}

function licCopiar(btn) { navigator.clipboard.writeText((LIC.ultimos || []).join('\n')).then(() => { btn.textContent = '✓ Copiados'; }); }

// Enrutado desde el menú
function licOnTab(id) { if (id === 'licencia') { licRender(); return true; } if (id === 'licadmin') { licAdminRender(); return true; } return false; }
