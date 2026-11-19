// ============================================================
// VERSIÓN LOCAL — guarda en la carpeta «datos» de la computadora todo lo que la app guarda en el navegador.
// Así, aunque se borre el navegador (historial, datos de sitios, otro navegador…), al abrir la app los datos regresan solos.
// Va PRIMERO en index.html (antes que cualquier otro script). Si el servidor local no responde, no hace nada y la app funciona normal.
// ============================================================
(function () {
  'use strict';
  var LS = window.localStorage, setOrig = Storage.prototype.setItem, delOrig = Storage.prototype.removeItem;
  var H = { 'X-Planeador': '1' };
  function esNem(k) { return typeof k === 'string' && k.indexOf('nem_') === 0; }
  function pedir(m, u, cuerpo, enc) { var x = new XMLHttpRequest(); x.open(m, u, false); x.setRequestHeader('X-Planeador', '1'); if (enc) x.setRequestHeader('Content-Type', 'application/json'); x.send(cuerpo || null); return x; }

  // 1) Arranque: el servidor es la fuente de verdad. Si el navegador tiene algo que el servidor no, se le manda.
  var srv;
  try { var r = pedir('GET', '/api/datos'); if (r.status !== 200) return; srv = JSON.parse(r.responseText).kv || {}; } catch (e) { return; }
  window.NEM_LOCAL = { activo: true, errores: 0, ultimoGuardado: null };
  var subir = {}, haySubir = false, restauradas = 0;
  Object.keys(srv).forEach(function (k) { if (LS.getItem(k) !== srv[k]) { setOrig.call(LS, k, srv[k]); restauradas++; } });
  for (var i = 0; i < LS.length; i++) { var k = LS.key(i); if (esNem(k) && !(k in srv)) { subir[k] = LS.getItem(k); haySubir = true; } }
  window.NEM_LOCAL.restauradas = restauradas;
  if (haySubir) { try { pedir('POST', '/api/kv', JSON.stringify({ set: subir }), true); subir = {}; haySubir = false; } catch (e) { /* se reintenta con el siguiente guardado */ } }

  // 2) Espejo: cada guardado en el navegador se manda también a la carpeta de datos
  var cola = { set: {}, del: {} }, timer = null;
  function enviar() {
    timer = null; var paq = { set: cola.set, del: Object.keys(cola.del) }; cola = { set: {}, del: {} };
    if (!Object.keys(paq.set).length && !paq.del.length) return;
    fetch('/api/kv', { method: 'POST', headers: { 'X-Planeador': '1', 'Content-Type': 'application/json' }, body: JSON.stringify(paq) })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); window.NEM_LOCAL.ultimoGuardado = Date.now(); })
      .catch(function () { window.NEM_LOCAL.errores++; Object.keys(paq.set).forEach(function (k) { if (!(k in cola.set) && !(k in cola.del)) cola.set[k] = paq.set[k]; }); if (!timer) timer = setTimeout(enviar, 3000); });   // el servidor no respondió: se reintenta
  }
  function programar() { if (!timer) timer = setTimeout(enviar, 250); }
  Storage.prototype.setItem = function (k, v) {
    setOrig.call(this, k, v);
    if (this === LS && esNem(k)) { cola.set[k] = String(v); delete cola.del[k]; programar(); }
  };
  Storage.prototype.removeItem = function (k) {
    delOrig.call(this, k);
    if (this === LS && esNem(k)) { cola.del[k] = 1; delete cola.set[k]; programar(); }
  };
  function volcar() { if (timer) { clearTimeout(timer); enviar(); } }
  addEventListener('pagehide', volcar); document.addEventListener('visibilitychange', function () { if (document.hidden) volcar(); });

  // 3) Archivos subidos (calendario, horario…): se guardan en datos/archivos y regresan si se borra el navegador
  var ARCH = { listo: false };
  function b64(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))); }
  async function listaServidor() { var r = await fetch('/api/archivos', { headers: H }); return (await r.json()).archivos || []; }
  async function idbTodos() { var db = await gIdb(); return await new Promise(function (ok) { var q = db.transaction('cal').objectStore('cal').getAll(); q.onsuccess = function () { ok(q.result || []); }; q.onerror = function () { ok([]); }; }); }
  async function hidratarArchivos() {
    try {
      var lista = await listaServidor(), locales = await idbTodos(), tengo = {}; locales.forEach(function (x) { tengo[x.id] = 1; });
      for (var i = 0; i < lista.length; i++) {
        var a = lista[i]; if (tengo[a.id]) continue;
        var r = await fetch('/api/archivo?id=' + encodeURIComponent(a.id), { headers: H }); if (!r.ok) continue;
        await window.gCalPoner.__orig({ id: a.id, cuenta: a.cuenta, cat: a.cat, nombre: a.nombre, tipo: a.tipo, mime: a.mime, blob: await r.blob(), t: a.t });
      }
      ARCH.listo = true; await reconciliar();
    } catch (e) { /* sin archivos que restaurar */ }
  }
  async function reconciliar() {   // lo que hay en el navegador se refleja en la carpeta de datos (altas y bajas)
    if (!ARCH.listo) return;
    try {
      var lista = await listaServidor(), locales = await idbTodos(), enSrv = {}, enLoc = {};
      lista.forEach(function (x) { enSrv[x.id] = x; }); locales.forEach(function (x) { enLoc[x.id] = x; });
      for (var i = 0; i < locales.length; i++) { var x = locales[i]; if (enSrv[x.id]) continue;
        await fetch('/api/archivo?id=' + encodeURIComponent(x.id), { method: 'PUT', headers: { 'X-Planeador': '1', 'X-Meta': b64({ cuenta: x.cuenta, cat: x.cat, nombre: x.nombre, tipo: x.tipo, mime: x.mime, t: x.t }) }, body: x.blob }); }
      var cta = (typeof G !== 'undefined' && G.key) || null;
      for (var j = 0; j < lista.length; j++) { var s = lista[j]; if (cta && s.cuenta === cta && !enLoc[s.id]) await fetch('/api/archivo?id=' + encodeURIComponent(s.id), { method: 'DELETE', headers: H }); }
    } catch (e) { /* se reintenta en el siguiente cambio */ }
  }
  // 4) Actualizaciones de la app: el servidor local las descarga solo; aquí se le avisa al maestro
  var vCargada = null, pidioBuscar = 0;
  function cuandoHayBody(f) { if (document.body) f(); else document.addEventListener('DOMContentLoaded', f); }
  function aviso(html, botones) {
    cuandoHayBody(function () {
      var e = document.getElementById('nem-aviso-version');
      if (!e) { e = document.createElement('div'); e.id = 'nem-aviso-version'; e.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:100002;max-width:min(560px,94vw);background:#065f46;color:#fff;border-radius:14px;padding:14px 18px;box-shadow:0 10px 30px rgba(0,0,0,.35);font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center;text-align:center'; document.body.appendChild(e); }
      e.innerHTML = '<span>' + html + '</span>';
      (botones || []).forEach(function (b) { var x = document.createElement('button'); x.textContent = b[0]; x.style.cssText = 'border:0;border-radius:9px;padding:8px 14px;font-weight:700;cursor:pointer;background:#fff;color:#065f46;font-size:14px'; x.onclick = b[1]; e.appendChild(x); });
      e.style.display = 'flex';
    });
  }
  function cerrarAviso() { var e = document.getElementById('nem-aviso-version'); if (e) e.style.display = 'none'; }
  function marcarVisto() { fetch('/api/version-visto', { method: 'POST', headers: H }).catch(function () {}); cerrarAviso(); }
  function consultarVersion() {
    fetch('/api/version', { headers: H }).then(function (r) { return r.json(); }).then(function (d) {
      if (vCargada === null) vCargada = d.version;
      if (d.version !== vCargada) { aviso('✅ <b>La versión ha sido actualizada.</b> Recarga para usar la versión nueva (tus datos no se tocan).', [['Recargar ahora', function () { location.reload(); }]]); return; }
      if (d.aviso && d.aviso.version === d.version) { aviso('✅ <b>La versión ha sido actualizada.</b> Ya estás usando la versión nueva.', [['Entendido', marcarVisto]]); return; }
      if (d.necesitaReinstalar) aviso('🔄 Hay una versión nueva que necesita el <b>paquete de instalación nuevo</b>. Pídelo por correo a planeador.nem.docente@gmail.com.', [['Entendido', cerrarAviso]]);
    }).catch(function () { /* sin servidor: no pasa nada */ });
  }
  function buscarYConsultar() { if (Date.now() - pidioBuscar > 10 * 60 * 1000 && navigator.onLine) { pidioBuscar = Date.now(); fetch('/api/buscar-actualizacion', { method: 'POST', headers: H }).catch(function () {}); } consultarVersion(); }
  addEventListener('load', function () { setTimeout(buscarYConsultar, 1500); setTimeout(consultarVersion, 20000); setTimeout(consultarVersion, 60000); setInterval(buscarYConsultar, 5 * 60 * 1000); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) buscarYConsultar(); });

  addEventListener('load', function () {
    if (typeof gCalPoner !== 'function' || typeof gIdb !== 'function') return;
    var po = window.gCalPoner, qo = window.gCalQuitarArchivo;
    window.gCalPoner = async function (rec) { var r = await po.apply(this, arguments); setTimeout(reconciliar, 300); return r; }; window.gCalPoner.__orig = po;
    if (typeof qo === 'function') window.gCalQuitarArchivo = async function () { var r = await qo.apply(this, arguments); setTimeout(reconciliar, 1500); return r; };
    hidratarArchivos();
  });
})();
