// ============================================================
// SINCRONIZAR MIS APARATOS — computadora ↔ celular, cifrado de punta a punta
// ------------------------------------------------------------
// • Los datos (grupos, alumnos, lista, calificaciones, libreta, exámenes, bitácora, horario, historial de
//   planeaciones y temas) se CIFRAN en el aparato con una llave que solo tienen los aparatos del maestro.
// • Internet (Firestore) es solo un BUZÓN DE PASO: cada aparato deja su paquete cifrado en su casillero; los demás
//   lo bajan, lo abren y lo mezclan. Cuando todos lo bajaron, se borra. Si nadie lo baja, caduca a los 14 días.
// • Un aparato nuevo se vincula pidiendo permiso; el otro aparato pulsa «Aprobar» (intercambio ECDH: la llave
//   viaja cifrada y nunca se escribe ni se ve).
// • Mezcla de tres vías (base común, local, remoto): si cada aparato cambió cosas distintas, se conservan las dos.
// Los archivos subidos (calendario, etc.) NO viajan: pesan mucho; esos van en el respaldo.
// Depende de: auth.js (getUsuario), gestion.js (G, gRender, gGrupo, gTemasClave, gHistClave, gHorarioToast) e index.html
// (histKey, historial, renderHist). Las pruebas usan NUBE.Sinc + NUBE.TrMemoria sin Firebase.
// ============================================================
(function () {
  'use strict';
  const DIA = 86400000, CADUCA = 14 * DIA, ACTIVO = 30 * DIA, VINC_CADUCA = 15 * 60000;
  const MAX_BYTES = 1000000, MAX_ENV = 20, ESPERA = 4000, ESPERA_MAX = 20000;
  const NB = { sinBase: true };   // marca: no hay versión común (primera vez)

  // ── Mezcla de tres vías ──────────────────────────────────
  const esObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const conId = a => Array.isArray(a) && a.every(x => esObj(x) && x.id != null);
  const vacio = x => x === undefined || x === null || x === '';
  function igual(a, b) {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
    return JSON.stringify(a) === JSON.stringify(b);
  }
  function m3(b, l, r) {
    if (igual(l, r)) return l;
    if (b !== NB) {
      if (igual(b, l)) return r;   // solo cambió el remoto (también si lo borró: r undefined)
      if (igual(b, r)) return l;   // solo cambió el local
    }
    if (l === undefined) return r;   // borrado aquí pero cambiado allá (o sin base): se conserva el dato
    if (r === undefined) return l;
    if (esObj(l) && esObj(r)) {
      const bb = b === NB ? NB : (esObj(b) ? b : {}), out = {};
      const claves = Object.keys(l).concat(Object.keys(r).filter(k => !(k in l)));
      for (const k of claves) { const v = m3(bb === NB ? NB : bb[k], l[k], r[k]); if (v !== undefined) out[k] = v; }
      return out;
    }
    if (conId(l) && conId(r) && (l.length || r.length)) {
      const mapa = a => { const m = new Map(); (Array.isArray(a) ? a : []).forEach(x => { if (esObj(x) && x.id != null) m.set(String(x.id), x); }); return m; };
      const bm = b === NB ? null : mapa(b), lm = mapa(l), rm = mapa(r), out = [];
      const ids = [...lm.keys()].concat([...rm.keys()].filter(k => !lm.has(k)));
      for (const id of ids) { const v = m3(bm ? bm.get(id) : NB, lm.get(id), rm.get(id)); if (v !== undefined) out.push(v); }
      return out;
    }
    // Choque de valores simples: si no hay base y uno está vacío, gana el que tiene dato; si no, gana el local
    if (b === NB && vacio(l)) return r;
    return l;
  }
  const claveTema = x => [x && x.grado, x && x.disciplina, x && x.trim, x && x.proyecto].join('|');
  function unirTemas(l, r) {
    const out = [], vistos = new Set();
    (Array.isArray(l) ? l : []).concat(Array.isArray(r) ? r : []).forEach(x => { const k = claveTema(x); if (!vistos.has(k)) { vistos.add(k); out.push(x); } });
    return out.slice(0, 40);
  }
  // Paquete = { d: datos de gestión, h: historial de planeaciones, t: temas, e: exámenes generados con IA }. base null = sin versión común.
  const MAX_EXAM = 50;
  function mezclar(base, l, r) {
    const b = base || null;
    const d = m3(b ? b.d : NB, l.d, r.d);
    let h = r.h === undefined ? l.h : m3(b && b.h !== undefined ? b.h : NB, l.h, r.h);
    if (Array.isArray(h)) h = h.slice().sort((x, y) => (+y.id || 0) - (+x.id || 0)).slice(0, 20);
    let e = r.e === undefined ? l.e : m3(b && b.e !== undefined ? b.e : NB, l.e, r.e);   // por id: un examen borrado en un aparato se borra en el otro
    if (Array.isArray(e)) e = e.slice().sort((x, y) => (+y.ts || 0) - (+x.ts || 0)).slice(0, MAX_EXAM);
    return { d, h: h || [], t: unirTemas(l.t, r.t), e: e || [] };
  }

  // ── Cifrado (WebCrypto) y compresión ─────────────────────
  const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  async function comprimir(str) {
    if (typeof CompressionStream === 'undefined') return { z: 0, u8: new TextEncoder().encode(str) };
    const st = new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'));
    return { z: 1, u8: new Uint8Array(await new Response(st).arrayBuffer()) };
  }
  async function descomprimir(u8, z) {
    if (!z) return new TextDecoder().decode(u8);
    const st = new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(st).text();
  }
  async function cifrar(llave, obj) {
    const { z, u8 } = await comprimir(JSON.stringify(obj));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, llave, u8));
    return { z, iv: b64(iv), ct };
  }
  async function descifrar(llave, m) {
    const pt = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(m.iv) }, llave, m.ct));
    return JSON.parse(await descomprimir(pt, m.z));
  }
  const llaveNueva = () => crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const llaveTexto = async k => b64(new Uint8Array(await crypto.subtle.exportKey('raw', k)));
  const llaveDe = s => crypto.subtle.importKey('raw', unb64(s), { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
  async function kidDe(s) { const h = new Uint8Array(await crypto.subtle.digest('SHA-256', unb64(s))); return b64(h.slice(0, 9)); }
  const parEcdh = () => crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']);
  async function pubTexto(par) { const j = await crypto.subtle.exportKey('jwk', par.publicKey); return JSON.stringify({ kty: j.kty, crv: j.crv, x: j.x, y: j.y }); }
  async function derivar(priv, pubStr) {
    const pub = await crypto.subtle.importKey('jwk', JSON.parse(pubStr), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    return crypto.subtle.deriveKey({ name: 'ECDH', public: pub }, priv, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function codigoDe(pubStr) {   // 4 cifras que se ven en los dos aparatos para confirmar que es el mismo
    const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pubStr)));
    return String(((h[0] << 16) | (h[1] << 8) | h[2]) % 10000).padStart(4, '0');
  }

  // ── El sincronizador (no sabe de pantallas ni de Firebase) ─
  // cfg: { tr (transporte), alm (almacén local), dev, nombre, preguntar(texto)→Promise<bool>, alPedirVinculo(p), alRecibir(de), alCambiar() }
  class Sinc {
    constructor(cfg) {
      Object.assign(this, cfg);
      this.modo = 'cargando'; this.cola = Promise.resolve(); this.gen = 0; this.timer = null; this.desde = 0; this.oyentes = [];
      this.error = ''; this.vinc = null; this.pedidos = []; this.nombres = {};
    }
    _aviso() { try { this.alCambiar && this.alCambiar(this); } catch (e) { /* la pantalla no debe romper la sincronización */ } }
    _serie(fn) { const p = this.cola.then(fn, fn); this.cola = p.catch(() => {}); return p; }
    estado() { return Object.assign({ n: 0, recibidas: {}, sucio: false }, this.alm.estado() || {}); }
    _ponerEstado(e) { this.alm.ponerEstado(e); }

    async iniciar() {
      this.detener(false);
      try {
        const info = await this.tr.info(), txt = this.alm.llave();
        if (info && txt && await kidDe(txt) === info.kid) { this.llave = await llaveDe(txt); await this._encender(); return this.modo; }
        if (info) { if (txt) this.alm.ponerLlave(null); this.modo = 'sin-vincular'; this.kid = info.kid; this._escucharVinculos(); }
        else this.modo = 'apagado';
      } catch (e) { this.modo = 'error'; this.error = this._msgError(e); this.noDisponible = /permission|denied|disabled|not.?found/i.test((e && (e.code || e.message)) || ''); }
      this._aviso(); return this.modo;
    }
    _msgError(e) {
      const c = (e && (e.code || e.message)) || '';
      if (/permission|denied|disabled|not.?found/i.test(c)) return 'La sincronización todavía no está disponible en el sistema.';
      if (/unavailable|network|offline/i.test(c)) return 'Sin conexión. Se sincroniza cuando vuelva el internet.';
      return 'No se pudo sincronizar: ' + (e && e.message ? e.message : c);
    }
    async _encender() {
      this.modo = 'activo'; this.error = '';
      await this.tr.ponerAparato(this.dev, { nombre: this.nombre, visto: Date.now() });
      try { (await this.tr.aparatos()).forEach(a => { this.nombres[a.id] = a.nombre; }); } catch (e) { /* solo es para mostrar nombres */ }
      this.oyentes.push(this.tr.escucharCasilleros(docs => this._serie(() => this._recibir(docs)), e => { this.error = this._msgError(e); this._aviso(); }));
      this._escucharVinculos();
      if (this.estado().sucio) this.programar(0);
      this._aviso();
    }
    detener(avisar = true) {
      this.oyentes.forEach(f => { try { f(); } catch (e) { /* ya estaba cerrado */ } }); this.oyentes = [];
      clearTimeout(this.timer); this.timer = null;
      if (avisar) { this.modo = 'apagado'; this._aviso(); }
    }
    // Primer aparato: crea la llave y empieza
    async activar() {
      if (await this.tr.info()) return this.iniciar();
      const k = await llaveNueva(), txt = await llaveTexto(k);
      await this.tr.ponerInfo(await kidDe(txt));
      this.alm.ponerLlave(txt); this.llave = k;
      const e = this.estado(); e.sucio = true; this._ponerEstado(e);
      await this._encender(); return this.modo;
    }
    // Dejar de sincronizar ESTE aparato (sus datos se quedan en él)
    async desvincular() {
      this.detener(false);
      try { await this.tr.quitarAparato(this.dev); await this.tr.borrarCasillero(this.dev); } catch (e) { /* sin conexión: los demás lo dejan de esperar a los 30 días */ }
      this.alm.ponerLlave(null); this._ponerEstado({ n: 0, recibidas: {}, sucio: false }); this.llave = null;
      return this.iniciar();
    }

    // ── Vincular un aparato nuevo ──
    async pedirVinculo() {
      const par = await parEcdh(), pub = await pubTexto(par), codigo = await codigoDe(pub);
      this.vinc = { par, pub, codigo };
      await this.tr.pedirVinculo(this.dev, { nombre: this.nombre, pub, creado: Date.now(), expira: Date.now() + VINC_CADUCA });
      this.modo = 'esperando'; this._aviso();
      return codigo;
    }
    _escucharVinculos() {
      this.oyentes.push(this.tr.escucharVinculos(docs => this._serie(() => this._vinculos(docs)), () => {}));
    }
    async _vinculos(docs) {
      const ahora = Date.now();
      // Aparato nuevo: ¿ya llegó la respuesta a mi petición?
      const mio = docs.find(d => d.id === this.dev);
      if (this.vinc && mio && mio.resp) {
        try {
          const k = await derivar(this.vinc.par.privateKey, mio.resp.pub);
          const pt = new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(mio.resp.iv) }, k, unb64(mio.resp.ct)));
          const info = await this.tr.info();
          if (!info || await kidDe(pt) !== info.kid) throw new Error('llave distinta');
          this.alm.ponerLlave(pt); this.vinc = null;
          await this.tr.borrarVinculo(this.dev);
          const e = this.estado(); e.recibidas = {}; e.sucio = false; this._ponerEstado(e);   // primero recibe lo del otro aparato
          this.detener(false); this.llave = await llaveDe(pt); await this._encender();
        } catch (e) { this.vinc = null; this.modo = 'sin-vincular'; this.error = 'No se pudo vincular. Inténtalo de nuevo.'; this._aviso(); }
        return;
      }
      if (this.vinc && mio && mio.rechazado) { this.vinc = null; this.modo = 'sin-vincular'; this.error = 'El otro aparato no aprobó la vinculación.'; try { await this.tr.borrarVinculo(this.dev); } catch (e) {} this._aviso(); return; }
      // Aparato ya vinculado: peticiones por aprobar
      if (this.modo !== 'activo') return;
      const pend = [];
      for (const d of docs) {
        if (d.id === this.dev || d.resp || d.rechazado) continue;
        if (d.expira < ahora) { try { await this.tr.borrarVinculo(d.id); } catch (e) {} continue; }
        pend.push({ id: d.id, nombre: d.nombre || 'Otro aparato', pub: d.pub, codigo: await codigoDe(d.pub) });
      }
      this.pedidos = pend;
      pend.forEach(p => { try { this.alPedirVinculo && this.alPedirVinculo(p); } catch (e) {} });
      this._aviso();
    }
    async aprobar(id) {
      const p = this.pedidos.find(x => x.id === id); if (!p || !this.llave) return false;
      const par = await parEcdh(), k = await derivar(par.privateKey, p.pub), iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(this.alm.llave())));
      await this.tr.responderVinculo(id, { pub: await pubTexto(par), iv: b64(iv), ct: b64(ct) });
      this.pedidos = this.pedidos.filter(x => x.id !== id);
      this.cambioLocal(true);   // manda ya mis datos para que el aparato nuevo los reciba
      this._aviso(); return true;
    }
    async rechazar(id) { this.pedidos = this.pedidos.filter(x => x.id !== id); try { await this.tr.rechazarVinculo(id); } catch (e) {} this._aviso(); }

    // ── Enviar ──
    cambioLocal(ya) {
      if (this.modo !== 'activo') return;
      this.gen++;
      const e = this.estado(); if (!e.sucio) { e.sucio = true; this._ponerEstado(e); }
      this.programar(ya ? 0 : (this.espera || ESPERA));
    }
    programar(ms) {
      if (this.modo !== 'activo') return;
      const ahora = Date.now(); if (!this.timer) this.desde = ahora;
      clearTimeout(this.timer);
      const espera = Math.max(0, Math.min(ms, this.desde + (this.esperaMax || ESPERA_MAX) - ahora));
      this.timer = setTimeout(() => { this.timer = null; this._serie(() => this._enviar()).catch(() => {}); }, espera);
    }
    sincronizarYa() { if (this.modo === 'activo') { clearTimeout(this.timer); this.timer = null; return this._serie(() => this._enviar(true)); } return Promise.resolve(); }
    async _enviar(forzar) {
      if (this.modo !== 'activo' || !this.llave) return;
      const e = this.estado(); if (!e.sucio && !forzar) return;
      const gen = this.gen;
      let snap = this.alm.leerSnap(), enc = await cifrar(this.llave, snap);
      if (enc.ct.length > MAX_BYTES) { snap = { d: snap.d, t: snap.t, e: snap.e }; enc = await cifrar(this.llave, snap); }   // sin historial de planeaciones
      if (enc.ct.length > MAX_BYTES) { snap = { d: snap.d, t: snap.t }; enc = await cifrar(this.llave, snap); }   // ni exámenes generados
      if (enc.ct.length > MAX_BYTES) { this.error = 'Tus datos son demasiado grandes para sincronizar. Usa el respaldo.'; this._aviso(); return; }
      const ver = this.dev + '.' + (e.n + 1), ahora = Date.now();
      try {
        await this.tr.ponerCasillero(this.dev, { de: this.dev, ver, base: Object.assign({}, e.recibidas), creado: ahora, expira: ahora + CADUCA, z: enc.z, iv: enc.iv, ct: enc.ct, tomado: [] });
      } catch (err) { this.error = this._msgError(err); this._aviso(); setTimeout(() => this.programar(0), 30000); throw err; }
      try { await this.alm.guardarEnv(ver, snap, MAX_ENV); } catch (err) { /* sin la copia, la próxima mezcla junta todo sin perder nada */ }
      const e2 = this.estado(); e2.n = e.n + 1; e2.ultEnvio = ahora; if (this.gen === gen) e2.sucio = false; this._ponerEstado(e2);
      this.error = ''; this._aviso();
      if (e2.sucio) this.programar(this.espera || ESPERA);
    }

    // ── Recibir ──
    async _recibir(docs) {
      if (this.modo !== 'activo' || !this.llave) return;
      const ahora = Date.now();
      let aps = null;
      for (const doc of docs) {
        if (doc.de === this.dev || doc.id === this.dev) continue;
        if (doc.expira < ahora) { try { await this.tr.borrarCasillero(doc.id); } catch (e) {} continue; }
        if ((doc.tomado || []).includes(this.dev)) continue;
        const e = this.estado();
        if (e.recibidas[doc.de] !== doc.ver) {
          let R;
          try { R = await descifrar(this.llave, doc); } catch (err) { this.error = 'Llegó un paquete que este aparato no puede abrir. Vuelve a vincularlo.'; this._aviso(); continue; }
          if (!R || !R.d || !Array.isArray(R.d.grupos)) continue;
          const L = this.alm.leerSnap(), bv = doc.base && doc.base[this.dev];
          let B = null; if (bv) { try { B = await this.alm.leerEnv(bv); } catch (err) { B = null; } }
          let M;
          if (B) M = mezclar(B, L, R);
          else if (!L.d || !L.d.grupos || !L.d.grupos.length) M = mezclar(null, { d: R.d, h: R.h || L.h, t: L.t, e: R.e || L.e }, R);
          else if (!e.n && !Object.keys(e.recibidas).length) {
            const reemplazar = await this.preguntar(L, R, doc.de);
            M = reemplazar ? { d: R.d, h: R.h || L.h, t: unirTemas(R.t, L.t), e: R.e || L.e } : mezclar(null, L, R);
          } else M = mezclar(null, L, R);
          if (!igual(M, L)) { this.alm.aplicarSnap(M); try { this.alRecibir && this.alRecibir(doc.de, this.nombres[doc.de]); } catch (err) {} }
          const e2 = this.estado(); e2.recibidas[doc.de] = doc.ver; e2.ultRecibo = ahora; this._ponerEstado(e2);
          if (!igual(M.d, R.d) || (R.h !== undefined && !igual(M.h, R.h)) || (R.e !== undefined && !igual(M.e, R.e))) this.cambioLocal();   // tengo cosas que el otro no: se las mando
        }
        try { await this.tr.marcarTomado(doc.id, this.dev); } catch (err) { continue; }
        try {   // ¿ya lo bajaron todos los aparatos activos? entonces se borra del buzón
          if (!aps) aps = await this.tr.aparatos();
          aps.forEach(a => { this.nombres[a.id] = a.nombre; });
          const tomado = new Set([...(doc.tomado || []), this.dev]);
          const faltan = aps.filter(a => a.id !== doc.de && !tomado.has(a.id) && ahora - (a.visto || 0) < ACTIVO);
          if (!faltan.length) await this.tr.borrarCasillero(doc.id);
        } catch (err) { /* lo borrará otro aparato o la caducidad */ }
      }
      this._aviso();
    }
  }

  // ── Transporte en memoria (pruebas): imita a Firestore ──
  function TrMemoria() {
    const st = { info: null, aps: {}, cas: {}, vin: {} }, oyC = new Set(), oyV = new Set();
    const cp = o => o == null ? o : (typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o)));
    const lista = m => Object.keys(m).map(id => Object.assign(cp(m[id]), { id }));
    const emitir = (oy, m) => { const docs = lista(m); oy.forEach(f => setTimeout(() => f(cp(docs)), 0)); };
    const tr = {
      st, caido: false,
      _ok() { if (tr.caido) { const e = new Error('offline'); e.code = 'unavailable'; throw e; } },
      async info() { tr._ok(); return cp(st.info); },
      async ponerInfo(kid) { tr._ok(); st.info = { kid, creado: Date.now() }; },
      async aparatos() { tr._ok(); return lista(st.aps); },
      async ponerAparato(id, d) { tr._ok(); st.aps[id] = Object.assign(st.aps[id] || {}, cp(d)); },
      async quitarAparato(id) { tr._ok(); delete st.aps[id]; },
      async ponerCasillero(id, d) { tr._ok(); st.cas[id] = cp(d); emitir(oyC, st.cas); },
      escucharCasilleros(cb) { oyC.add(cb); setTimeout(() => cb(lista(st.cas)), 0); return () => oyC.delete(cb); },
      async marcarTomado(id, dev) { tr._ok(); const d = st.cas[id]; if (!d) return; if (!d.tomado.includes(dev)) d.tomado.push(dev); emitir(oyC, st.cas); },
      async borrarCasillero(id) { tr._ok(); if (st.cas[id]) { delete st.cas[id]; emitir(oyC, st.cas); } },
      async pedirVinculo(id, d) { tr._ok(); st.vin[id] = cp(d); emitir(oyV, st.vin); },
      escucharVinculos(cb) { oyV.add(cb); setTimeout(() => cb(lista(st.vin)), 0); return () => oyV.delete(cb); },
      async responderVinculo(id, resp) { tr._ok(); if (st.vin[id]) { st.vin[id].resp = cp(resp); emitir(oyV, st.vin); } },
      async rechazarVinculo(id) { tr._ok(); if (st.vin[id]) { st.vin[id].rechazado = true; emitir(oyV, st.vin); } },
      async borrarVinculo(id) { tr._ok(); if (st.vin[id]) { delete st.vin[id]; emitir(oyV, st.vin); } },
    };
    return tr;
  }

  // ── Transporte Firestore ──
  function TrFirestore(db, uid) {
    const fs = firebase.firestore, raiz = db.collection('sync').doc(uid);
    const cas = raiz.collection('casillero'), apa = raiz.collection('aparatos'), vin = raiz.collection('vinculo'), inf = raiz.collection('llave').doc('info');
    const ms = t => (t && typeof t.toMillis === 'function') ? t.toMillis() : (+t || 0);
    return {
      async info() { const s = await inf.get(); return s.exists ? s.data() : null; },
      ponerInfo: kid => inf.set({ kid, creado: Date.now() }),
      async aparatos() { const q = await apa.get(); return q.docs.map(d => Object.assign({ id: d.id }, d.data())); },
      ponerAparato: (id, d) => apa.doc(id).set(d, { merge: true }),
      quitarAparato: id => apa.doc(id).delete(),
      ponerCasillero: (id, d) => cas.doc(id).set(Object.assign({}, d, { ct: fs.Blob.fromUint8Array(d.ct), expira: fs.Timestamp.fromMillis(d.expira) })),
      escucharCasilleros: (cb, err) => cas.onSnapshot(q => cb(q.docs.map(d => { const x = d.data(); return Object.assign({}, x, { id: d.id, ct: x.ct && x.ct.toUint8Array ? x.ct.toUint8Array() : new Uint8Array(0), expira: ms(x.expira) }); })), err),
      marcarTomado: (id, dev) => cas.doc(id).update({ tomado: fs.FieldValue.arrayUnion(dev) }),
      borrarCasillero: id => cas.doc(id).delete(),
      pedirVinculo: (id, d) => vin.doc(id).set(Object.assign({}, d, { expira: fs.Timestamp.fromMillis(d.expira) })),
      escucharVinculos: (cb, err) => vin.onSnapshot(q => cb(q.docs.map(d => { const x = d.data(); return Object.assign({}, x, { id: d.id, expira: ms(x.expira) }); })), err),
      responderVinculo: (id, resp) => vin.doc(id).update({ resp }),
      rechazarVinculo: id => vin.doc(id).update({ rechazado: true }),
      borrarVinculo: id => vin.doc(id).delete(),
    };
  }

  // ── Almacén local de la app (localStorage + IndexedDB) ──
  function uidAct() { const u = typeof getUsuario === 'function' ? getUsuario() : null; return u ? (u.uid || u.curp) : null; }
  const lee = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  function clavesApp() {
    const c = [];
    try { if (typeof G !== 'undefined' && G.key) c.push(G.key); } catch (e) {}
    try { if (typeof histKey === 'function') c.push(histKey()); } catch (e) {}
    try { if (typeof gTemasClave === 'function') c.push(gTemasClave()); } catch (e) {}
    try { if (typeof gHistClave === 'function') c.push(gHistClave()); } catch (e) {}
    return c;
  }
  function idbEnv() {
    return new Promise((ok, mal) => {
      if (!window.indexedDB) return mal(new Error('sin indexedDB'));
      const r = indexedDB.open('nem_nube', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('env', { keyPath: 'id' });
      r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error);
    });
  }
  const AlmApp = {
    llave() { const u = uidAct(); return u ? localStorage.getItem('nem_nube_llave_' + u) : null; },
    ponerLlave(t) { const u = uidAct(); if (!u) return; try { if (t) localStorage.setItem('nem_nube_llave_' + u, t); else localStorage.removeItem('nem_nube_llave_' + u); } catch (e) {} },
    estado() { const u = uidAct(); return u ? lee('nem_nube_est_' + u) : null; },
    ponerEstado(e) { const u = uidAct(); if (u) try { localStorage.setItem('nem_nube_est_' + u, JSON.stringify(e)); } catch (x) {} },
    leerSnap() {
      const d = (typeof G !== 'undefined' && G.key && lee(G.key)) || (typeof G !== 'undefined' && G.data) || { v: 1, grupos: [] };
      return { d, h: (typeof histKey === 'function' ? lee(histKey()) : null) || [], t: (typeof gTemasClave === 'function' ? lee(gTemasClave()) : null) || [],
        e: (typeof gHistClave === 'function' ? lee(gHistClave()) : null) || [] };
    },
    aplicarSnap(s) {
      NUBE.aplicando = true;
      try {
        localStorage.setItem(G.key, JSON.stringify(s.d)); localStorage.setItem(G.key + '_mod', String(Date.now()));
        if (typeof histKey === 'function' && Array.isArray(s.h)) localStorage.setItem(histKey(), JSON.stringify(s.h));
        if (typeof gTemasClave === 'function') localStorage.setItem(gTemasClave(), JSON.stringify(s.t || []));
        if (typeof gHistClave === 'function' && Array.isArray(s.e)) localStorage.setItem(gHistClave(), JSON.stringify(s.e));
      } catch (e) { /* sin espacio: queda lo que se pudo */ }
      finally { NUBE.aplicando = false; }
      G.data = s.d; if (!G.data.grupos.some(g => g.id === G.gid)) G.gid = G.data.grupos[0] ? G.data.grupos[0].id : null;
      try { if (Array.isArray(s.h) && typeof historial !== 'undefined') { historial = s.h; if (document.getElementById('hist-lista') && typeof renderHist === 'function') renderHist(); } } catch (e) {}
      nubeRefrescar();
    },
    async guardarEnv(ver, snap, max) {
      const u = uidAct(), db = await idbEnv(), { z, u8 } = await comprimir(JSON.stringify(snap));
      await new Promise((ok, mal) => { const t = db.transaction('env', 'readwrite'); t.objectStore('env').put({ id: u + '|' + ver, u, t: Date.now(), z, u8 }); t.oncomplete = ok; t.onerror = () => mal(t.error); });
      await new Promise(ok => {   // conserva solo las últimas `max` de esta cuenta
        const t = db.transaction('env', 'readwrite'), s = t.objectStore('env'), q = s.getAll();
        q.onsuccess = () => { (q.result || []).filter(x => x.u === u).sort((a, b) => b.t - a.t).slice(max).forEach(x => s.delete(x.id)); };
        t.oncomplete = ok; t.onerror = ok;
      });
    },
    async leerEnv(ver) {
      const u = uidAct(), db = await idbEnv();
      const x = await new Promise(ok => { const q = db.transaction('env').objectStore('env').get(u + '|' + ver); q.onsuccess = () => ok(q.result || null); q.onerror = () => ok(null); });
      return x ? JSON.parse(await descomprimir(x.u8, x.z)) : null;
    },
  };

  // ── Pantalla ──
  function nombreAparato() {
    const ua = navigator.userAgent || '';
    const so = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'iPad' : /Android/.test(ua) ? (/Mobile/.test(ua) ? 'Celular Android' : 'Tableta Android') : /Macintosh/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Computadora Windows' : 'Computadora';
    const nav = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
    const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? ' (versión local)' : '';
    return so + (nav ? ' · ' + nav : '') + local;
  }
  function idAparato() {
    let d = null; try { d = localStorage.getItem('nem_nube_dev'); } catch (e) {}
    if (!d) { d = 'ap' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); try { localStorage.setItem('nem_nube_dev', d); } catch (e) {} }
    return d;
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function hace(t) {
    if (!t) return 'todavía no';
    const m = Math.round((Date.now() - t) / 60000);
    return m < 1 ? 'hace un momento' : m < 60 ? 'hace ' + m + ' min' : m < 1440 ? 'hace ' + Math.round(m / 60) + ' h' : new Date(t).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  }
  function editando() { const a = document.activeElement; return !!a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && !!a.closest('#app'); }
  // Vuelve a pintar la pantalla de gestión con los datos nuevos, sin interrumpir si el maestro está escribiendo
  function nubeRefrescar() {
    const pintar = () => { try { if (typeof G !== 'undefined' && G.tab && document.getElementById('g-' + G.tab) && typeof gRender === 'function') gRender(); } catch (e) {} };
    if (!editando()) { pintar(); return; }
    if (NUBE.pendiente) return;
    NUBE.pendiente = true;
    const al = () => setTimeout(() => { if (editando()) return; document.removeEventListener('focusout', al, true); NUBE.pendiente = false; pintar(); }, 1500);
    document.addEventListener('focusout', al, true);
  }

  function tarjetaHTML(donde) {
    const s = NUBE.sinc;
    if (donde === 'inicio' && !(s && (s.modo === 'sin-vincular' || s.modo === 'esperando'))) return `<div class="nube-tarjeta" data-donde="inicio" style="display:none"></div>`;
    const caja = (fondo, borde, color, html) => `<div class="card nube-tarjeta"${donde ? ` data-donde="${donde}"` : ''} style="background:${fondo};border:1.5px solid ${borde};color:${color}">${html}</div>`;
    if (!s || s.modo === 'cargando') return `<div class="nube-tarjeta" style="display:none"></div>`;
    const ayuda = `<div style="font-size:12px;margin-top:8px;line-height:1.5;opacity:.9">🔒 Tus datos viajan <b>cifrados</b>: solo tus aparatos tienen la llave; ni Google ni el Planeador pueden leerlos. Internet es solo un buzón de paso: el paquete se borra cuando tu otro aparato lo baja, o solo a los 14 días. No viajan los archivos subidos (calendario, etc.): esos van en el respaldo.</div>`;
    if (s.modo === 'error' && s.noDisponible && !(typeof esAdmin === 'function' && esAdmin())) return `<div class="nube-tarjeta"${donde ? ` data-donde="${donde}"` : ''} style="display:none"></div>`;   // aún no activada en el sistema: no se muestra a los maestros
    if (s.modo === 'error') return caja('#fef2f2', '#fecaca', '#991b1b', `<div class="card-title" style="color:inherit">☁️ Sincronizar mis aparatos</div><div style="font-size:13.5px">${esc(s.error)}</div><button class="g-btn g-btn-s" style="margin:8px 0 0" onclick="nubeIniciar()">Reintentar</button>`);
    if (s.modo === 'apagado') return caja('#eff6ff', '#bfdbfe', '#1e3a8a', `<div class="card-title" style="color:inherit">☁️ Sincroniza tu computadora y tu celular</div>
      <div style="font-size:13.5px;line-height:1.5">Lo que captures en un aparato (lista, calificaciones, exámenes, libreta…) aparece solo en el otro, en los dos sentidos. Entra con la <b>misma cuenta</b> en todos tus aparatos.</div>
      <button class="g-btn" style="margin:10px 0 0" onclick="nubeActivar(this)">Activar en este aparato</button>${ayuda}`);
    if (s.modo === 'sin-vincular') return caja('#fffbeb', '#fde68a', '#92400e', `<div class="card-title" style="color:inherit">📲 Vincula este aparato</div>
      <div style="font-size:13.5px;line-height:1.5">Ya sincronizas tus datos en otro aparato. Para traerlos aquí, pulsa el botón y luego <b>aprueba</b> en tu otro aparato (con la app abierta).</div>
      ${s.error ? `<div style="font-size:12.5px;margin-top:6px;color:#991b1b">${esc(s.error)}</div>` : ''}
      <button class="g-btn" style="margin:10px 0 0" onclick="nubeVincular(this)">Vincular este aparato</button>${ayuda}`);
    if (s.modo === 'esperando') return caja('#fffbeb', '#fde68a', '#92400e', `<div class="card-title" style="color:inherit">⏳ Esperando aprobación…</div>
      <div style="font-size:13.5px;line-height:1.5">Abre el Planeador en tu otro aparato. Te va a preguntar si apruebas a <b>${esc(s.nombre)}</b>. Revisa que el código sea el mismo:</div>
      <div style="font-size:34px;font-weight:800;letter-spacing:8px;margin:8px 0;color:#1e3a8a">${esc(s.vinc ? s.vinc.codigo : '')}</div>
      <div style="font-size:12px">Si tu otro aparato ya tenía la app abierta, recárgala. La petición dura 15 minutos.</div>`);
    const e = s.estado(), nom = Object.keys(s.nombres).filter(id => id !== s.dev).map(id => s.nombres[id]).filter(Boolean);
    return caja('#f0fdf4', '#bbf7d0', '#166534', `<div class="card-title" style="color:inherit">✅ Sincronización activa</div>
      <div style="font-size:13px;line-height:1.6">Este aparato: <b>${esc(s.nombre)}</b>${nom.length ? ' · Vinculado con: <b>' + nom.map(esc).join(', ') + '</b>' : ''}<br>
      Último envío: ${hace(e.ultEnvio)} · Último cambio recibido: ${hace(e.ultRecibo)}${e.sucio ? ' · <b>cambios por enviar</b>' : ''}</div>
      ${s.error ? `<div style="font-size:12.5px;margin-top:6px;color:#991b1b">${esc(s.error)}</div>` : ''}
      <div style="margin-top:8px"><button class="g-btn g-btn-s" style="margin:0" onclick="nubeYa(this)">🔄 Sincronizar ahora</button>
      <button class="g-btn g-btn-s" style="margin:0 0 0 6px;background:transparent" onclick="nubeDesvincular()">Dejar de sincronizar este aparato</button></div>
      <div style="font-size:12px;margin-top:8px;opacity:.9">Para agregar otro aparato: entra con tu cuenta en él, pulsa «Vincular este aparato» y apruébalo aquí.</div>`);
  }
  function pintar() {
    document.querySelectorAll('.nube-tarjeta').forEach(el => { const t = document.createElement('div'); t.innerHTML = tarjetaHTML(el.dataset.donde); el.replaceWith(t.firstElementChild); });
    pintarPedidos();
  }
  function pintarPedidos() {
    const s = NUBE.sinc, p = s && s.pedidos && s.pedidos[0];
    let m = document.getElementById('nube-aprobar');
    if (!p) { if (m) m.remove(); return; }
    if (m && m.dataset.id === p.id) return;
    if (m) m.remove();
    m = document.createElement('div'); m.id = 'nube-aprobar'; m.dataset.id = p.id;
    m.style.cssText = 'position:fixed;inset:0;z-index:99997;background:rgba(15,39,68,.6);display:flex;align-items:center;justify-content:center;padding:16px';
    m.innerHTML = `<div style="background:#fff;border-radius:16px;max-width:420px;width:100%;padding:22px;box-shadow:0 12px 40px rgba(0,0,0,.3);font-size:14.5px;line-height:1.5;color:#0f172a">
      <div style="font-size:18px;font-weight:800;margin-bottom:8px">📲 ¿Aprobar otro aparato?</div>
      <div><b>${esc(p.nombre)}</b> quiere recibir tus grupos, calificaciones y planeaciones.</div>
      <div style="margin:10px 0 4px">Debe mostrar este código:</div>
      <div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#1e3a8a">${esc(p.codigo)}</div>
      <div style="font-size:12.5px;color:#64748b;margin:6px 0 14px">Si no fuiste tú o el código no coincide, pulsa «No aprobar».</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="g-btn" style="margin:0" onclick="nubeAprobar('${esc(p.id)}',this)">Aprobar</button>
      <button class="g-btn g-btn-s" style="margin:0" onclick="nubeRechazar('${esc(p.id)}')">No aprobar</button></div></div>`;
    document.body.appendChild(m);
  }

  // ── Arranque en la app ──
  const NUBE = window.NUBE = { Sinc, TrMemoria, TrFirestore, mezclar, m3, cifrar, descifrar, aplicando: false, sinc: null, tarjetaHTML, nombreAparato, AlmApp };
  const setOrig = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {   // cada guardado de datos sincronizables avisa al sincronizador
    setOrig.call(this, k, v);
    try { if (this === window.localStorage && !NUBE.aplicando && NUBE.sinc && NUBE.sinc.modo === 'activo' && clavesApp().includes(k)) NUBE.sinc.cambioLocal(); } catch (e) {}
  };
  async function cargarFirestore() {
    if (window.firebase && firebase.firestore) return;
    await new Promise((ok, mal) => { const s = document.createElement('script'); s.src = `https://www.gstatic.com/firebasejs/${typeof FB_VERSION !== 'undefined' ? FB_VERSION : '10.12.2'}/firebase-firestore-compat.js`; s.onload = ok; s.onerror = () => mal(new Error('No se pudo cargar la sincronización')); document.head.appendChild(s); });
  }
  async function preguntarReemplazo(L, R) {
    const n = L.d.grupos.length, m = R.d.grupos.length;
    return confirm(`Tu otro aparato tiene ${m} grupo(s) y este tiene ${n}.\n\nAceptar = usar los datos de tu otro aparato (recomendado si este solo tenía pruebas).\nCancelar = juntar los dos (puede repetir grupos).`);
  }
  window.nubeIniciar = async function (tr) {
    if (NUBE.sinc) NUBE.sinc.detener(false);
    const uid = uidAct(); if (!uid) return;
    if (!tr) {
      if (!window.isSecureContext || !window.crypto || !crypto.subtle) return;
      try { await cargarFirestore(); tr = TrFirestore(firebase.firestore(), uid); }
      catch (e) { NUBE.sinc = null; return; }
    }
    NUBE.sinc = new Sinc({
      tr, alm: AlmApp, dev: idAparato(), nombre: nombreAparato(), preguntar: preguntarReemplazo,
      alPedirVinculo: () => pintarPedidos(), alCambiar: () => pintar(),
      alRecibir: (de, nom) => { try { if (typeof gHorarioToast === 'function') gHorarioToast('🔄 Llegaron cambios de ' + (nom ? '<b>' + esc(nom) + '</b>' : 'tu otro aparato') + '.', 3500); } catch (e) {} },
    });
    await NUBE.sinc.iniciar();
    return NUBE.sinc;
  };
  window.nubeDetener = function () { if (NUBE.sinc) NUBE.sinc.detener(false); NUBE.sinc = null; const m = document.getElementById('nube-aprobar'); if (m) m.remove(); };
  window.nubeActivar = async function (b) { if (b) b.disabled = true; try { await NUBE.sinc.activar(); } catch (e) { NUBE.sinc.error = NUBE.sinc._msgError(e); NUBE.sinc.modo = 'error'; pintar(); } };
  window.nubeVincular = async function (b) { if (b) b.disabled = true; try { await NUBE.sinc.pedirVinculo(); } catch (e) { NUBE.sinc.error = NUBE.sinc._msgError(e); pintar(); } };
  window.nubeAprobar = async function (id, b) { if (b) b.disabled = true; try { await NUBE.sinc.aprobar(id); } catch (e) { alert('No se pudo aprobar: ' + (e.message || e)); } pintarPedidos(); };
  window.nubeRechazar = function (id) { NUBE.sinc.rechazar(id).then(pintarPedidos); };
  window.nubeYa = async function (b) { if (b) b.disabled = true; try { await NUBE.sinc.sincronizarYa(); } catch (e) {} pintar(); };
  window.nubeDesvincular = async function () {
    if (!confirm('Este aparato dejará de recibir y enviar cambios. Tus datos se quedan aquí como están. ¿Continuar?')) return;
    await NUBE.sinc.desvincular(); pintar();
  };
  window.nubeTarjetaHTML = tarjetaHTML;
  // Al salir de la app o perder la pantalla (celular), manda lo pendiente de inmediato; al volver el internet, también
  document.addEventListener('visibilitychange', () => { const s = NUBE.sinc; if (s && s.modo === 'activo' && document.visibilityState === 'hidden' && s.estado().sucio) s.programar(0); });
  window.addEventListener('online', () => { const s = NUBE.sinc; if (s && s.modo === 'activo' && s.estado().sucio) s.programar(0); });
})();
