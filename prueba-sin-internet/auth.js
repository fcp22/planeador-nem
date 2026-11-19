// ============================================================
// ACCESO CON CORREO — Google, Apple o correo + contraseña
// (Firebase Authentication). Rechaza correos temporales.
// Depende de: firebase-config.js, correos-temporales.js y de
// index.html (entrarApp, salirApp, showAuthTab…).
// ============================================================

const AUTH = { auth: null, listo: false, perfilPendiente: null };
let usuarioActivo = null;

function getUsuario() { return usuarioActivo; }
function esAdmin() { return !!(usuarioActivo && usuarioActivo.rol === 'admin'); }
function cfgFirebase() { return (window.NEM_CONFIG && window.NEM_CONFIG.firebase) || {}; }
function authConfigurado() { const c = cfgFirebase(); return !!(c.apiKey && c.authDomain && c.projectId); }

const FB_VERSION = '10.12.2';
function cargarScript(src) {
  return new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => mal(new Error('No se pudo cargar ' + src)); document.head.appendChild(s); });
}

function authMensaje(e) {
  const c = (e && e.code) || '';
  const m = {
    'auth/email-already-in-use': 'Ya existe una cuenta con ese correo. Usa «Entrar» o «¿Olvidaste tu contraseña?».',
    'auth/invalid-email': 'El correo no es válido.',
    'auth/weak-password': 'La contraseña es muy corta: usa al menos 6 caracteres.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos. Recuerda: la contraseña de esta aplicación NO es la de tu correo (Gmail, Hotmail…). Si te registraste con Google, usa «Continuar con Google»; si no la recuerdas o nunca la creaste, toca «¿Olvidaste tu contraseña?» y crea una nueva.',
    'auth/wrong-password': 'Correo o contraseña incorrectos. Recuerda: la contraseña de esta aplicación NO es la de tu correo (Gmail, Hotmail…). Si te registraste con Google, usa «Continuar con Google»; si no la recuerdas o nunca la creaste, toca «¿Olvidaste tu contraseña?» y crea una nueva.',
    'auth/user-not-found': 'Correo o contraseña incorrectos. Recuerda: la contraseña de esta aplicación NO es la de tu correo (Gmail, Hotmail…). Si te registraste con Google, usa «Continuar con Google»; si no la recuerdas o nunca la creaste, toca «¿Olvidaste tu contraseña?» y crea una nueva.',
    'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
    'auth/network-request-failed': 'No hay conexión. Revisa tu internet e inténtalo de nuevo.',
    'auth/popup-closed-by-user': '',
    'auth/cancelled-popup-request': '',
    'auth/account-exists-with-different-credential': 'Ese correo ya se registró con otro método (Google, Apple o contraseña). Entra con el método original.',
    'auth/operation-not-allowed': 'Ese método de acceso todavía no está activado en el sistema.',
    'auth/unauthorized-domain': 'Este sitio no está autorizado para iniciar sesión (falta agregarlo en Firebase → Authentication → Dominios autorizados).',
    'auth/user-disabled': 'Esta cuenta fue desactivada.',
  };
  if (c in m) return m[c];
  return (e && e.message) ? e.message : 'No se pudo completar. Inténtalo de nuevo.';
}
function authError(id, e) {
  const el = document.getElementById(id); if (!el) return;
  const msg = typeof e === 'string' ? e : authMensaje(e);
  el.textContent = msg; el.style.display = msg ? 'block' : 'none';
}
function authOcupado(idBtn, on, texto) { const b = document.getElementById(idBtn); if (!b) return; if (on) { b.dataset.t = b.textContent; b.textContent = texto || 'Un momento…'; b.disabled = true; } else { b.textContent = b.dataset.t || b.textContent; b.disabled = false; } }

// ── Inicio ────────────────────────────────────────────────
async function authInit() {
  const pv = (window.NEM_CONFIG && window.NEM_CONFIG.proveedores) || {};
  document.querySelectorAll('.btn-social').forEach(b => { const apple = b.classList.contains('btn-apple'); if ((apple && !pv.apple) || (!apple && pv.google === false)) b.style.display = 'none'; });
  if (!pv.apple && pv.google === false) { const s = document.querySelector('.auth-sep'); if (s) s.style.display = 'none'; }
  if (!authConfigurado()) { authError('auth-aviso', 'La app aún no está conectada al sistema de cuentas. (Falta llenar app/firebase-config.js — ver guía de instalación.)'); document.querySelectorAll('#panel-social button, #pantalla-login .btn-p').forEach(b => b.disabled = true); return; }
  try {
    if (!window.firebase) {
      await cargarScript(`https://www.gstatic.com/firebasejs/${FB_VERSION}/firebase-app-compat.js`);
      await cargarScript(`https://www.gstatic.com/firebasejs/${FB_VERSION}/firebase-auth-compat.js`);
    }
    if (!firebase.apps.length) firebase.initializeApp(cfgFirebase());
    AUTH.auth = firebase.auth();
    try { AUTH.auth.languageCode = 'es'; } catch (e) { /* no crítico */ }
  } catch (e) { authError('auth-aviso', 'No se pudo cargar el sistema de cuentas. Revisa tu internet y recarga la página.'); return; }
  AUTH.auth.onAuthStateChanged(authCambio);
  // Si el navegador regresó de un acceso por redirección, se resuelve solo en onAuthStateChanged
}

// Cada vez que cambia la sesión
async function authCambio(u) {
  AUTH.listo = true;
  if (!u) { if (typeof salirApp === 'function') salirApp(); return; }
  const correo = String(u.email || '').toLowerCase();
  if (!correo) { await authSalirConMensaje('Tu cuenta no tiene correo electrónico. Entra con Google, Apple o un correo.'); return; }
  if (esCorreoTemporal(correo)) { await authSalirConMensaje('No se aceptan correos temporales. Usa tu correo personal, Google o Apple.'); try { await u.delete(); } catch (e) { /* ignorar */ } return; }
  if (!u.emailVerified) { mostrarVerificar(correo); return; }
  const admins = ((window.NEM_CONFIG && window.NEM_CONFIG.adminEmails) || []).map(x => String(x).toLowerCase());
  const pend = authPerfilPendiente(u.uid);
  usuarioActivo = {
    curp: u.uid, uid: u.uid, email: correo,                       // «curp» se conserva como clave interna de almacenamiento
    nombre: u.displayName || pend.nombre || correo.split('@')[0],
    rol: admins.includes(correo) ? 'admin' : 'docente',
    escuela: pend.escuela || '', cct: pend.cct || '', municipio: pend.municipio || '',
  };
  if (typeof entrarApp === 'function') entrarApp();
}
async function authSalirConMensaje(msg) {
  try { await AUTH.auth.signOut(); } catch (e) { /* ignorar */ }
  if (typeof showAuthTab === 'function') showAuthTab('login');
  authError('auth-aviso', msg);
}
function authPerfilPendiente(uid) { try { return JSON.parse(localStorage.getItem('nem_perfil_pend_' + uid) || '{}'); } catch (e) { return {}; } }

// ── Google y Apple ────────────────────────────────────────
async function authSocial(tipo) {
  authError('auth-aviso', '');
  if (!AUTH.auth) return authError('auth-aviso', 'El sistema de cuentas no está listo.');
  const prov = tipo === 'apple' ? new firebase.auth.OAuthProvider('apple.com') : new firebase.auth.GoogleAuthProvider();
  if (tipo === 'apple') { prov.addScope('email'); prov.addScope('name'); }
  else prov.setCustomParameters({ prompt: 'select_account' });
  try { await AUTH.auth.signInWithPopup(prov); }
  catch (e) {
    if (e && e.code === 'auth/popup-blocked') { try { await AUTH.auth.signInWithRedirect(prov); return; } catch (e2) { e = e2; } }
    authError('auth-aviso', e);
  }
}
function authGoogle() { return authSocial('google'); }
function authApple() { return authSocial('apple'); }

// ── Correo y contraseña ───────────────────────────────────
async function authEntrar() {
  const correo = document.getElementById('l-correo').value.trim().toLowerCase(), pwd = document.getElementById('l-pwd').value;
  authError('l-err', '');
  if (!correo || !pwd) return authError('l-err', 'Escribe tu correo y tu contraseña.');
  if (esCorreoTemporal(correo)) return authError('l-err', 'No se aceptan correos temporales.');
  authOcupado('btn-login', true, 'Verificando…');
  try { await AUTH.auth.signInWithEmailAndPassword(correo, pwd); } catch (e) { authError('l-err', e); }
  authOcupado('btn-login', false);
}
async function authRegistrar() {
  const v = id => document.getElementById(id).value.trim();
  const nombre = v('r-nom'), escuela = v('r-esc'), correo = v('r-correo').toLowerCase();
  const pwd = document.getElementById('r-pwd').value, pwd2 = document.getElementById('r-pwd2').value;
  authError('r-err', '');
  if (!nombre) return authError('r-err', 'Escribe tu nombre completo.');
  if (!escuela) return authError('r-err', 'Escribe el nombre de tu escuela.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return authError('r-err', 'Escribe un correo válido.');
  if (esCorreoTemporal(correo)) return authError('r-err', 'No se aceptan correos temporales. Usa tu correo personal, Google o Apple.');
  if (pwd.length < 6) return authError('r-err', 'La contraseña debe tener al menos 6 caracteres.');
  if (pwd !== pwd2) return authError('r-err', 'Las contraseñas no coinciden.');
  if (!document.getElementById('r-acepto').checked) return authError('r-err', 'Debes leer y aceptar el aviso de privacidad.');
  authOcupado('btn-reg', true, 'Creando cuenta…');
  try {
    const cred = await AUTH.auth.createUserWithEmailAndPassword(correo, pwd);
    // El perfil de escuela se guarda en el dispositivo (no en internet)
    localStorage.setItem('nem_perfil_pend_' + cred.user.uid, JSON.stringify({ nombre, escuela, cct: v('r-cct'), municipio: v('r-mun') }));
    try { await cred.user.updateProfile({ displayName: nombre }); } catch (e) { /* no crítico */ }
    try { await cred.user.sendEmailVerification(); } catch (e) { /* se puede reenviar */ }
    mostrarVerificar(correo);
  } catch (e) { authError('r-err', e); }
  authOcupado('btn-reg', false);
}
async function authRecuperar() {
  const correo = document.getElementById('rc-correo').value.trim().toLowerCase();
  authError('rc-err', ''); const ok = document.getElementById('rc-ok'); ok.style.display = 'none';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return authError('rc-err', 'Escribe un correo válido.');
  authOcupado('btn-rec', true, 'Enviando…');
  try {
    await AUTH.auth.sendPasswordResetEmail(correo);
    // Mismo mensaje exista o no la cuenta (así no se revela quién está registrado)
    ok.textContent = 'Si ese correo tiene una cuenta, te enviamos un enlace para crear una contraseña nueva de esta aplicación (no cambia la de tu correo). Revisa también «Spam».'; ok.style.display = 'block';
  } catch (e) { if (e && e.code === 'auth/user-not-found') { ok.textContent = 'Si ese correo tiene una cuenta, te enviamos un enlace para crear una contraseña nueva de esta aplicación (no cambia la de tu correo). Revisa también «Spam».'; ok.style.display = 'block'; } else authError('rc-err', e); }
  authOcupado('btn-rec', false);
}

// ── Verificación de correo ────────────────────────────────
function mostrarVerificar(correo) {
  document.getElementById('ver-correo').textContent = correo;
  if (typeof showAuthTab === 'function') showAuthTab('verificar');
}
async function authYaVerifique() {
  authError('ver-err', '');
  const u = AUTH.auth && AUTH.auth.currentUser; if (!u) return showAuthTab('login');
  try { await u.reload(); } catch (e) { return authError('ver-err', e); }
  if (u.emailVerified) { try { await u.getIdToken(true); } catch (e) { /* ignorar */ } authCambio(AUTH.auth.currentUser); }
  else authError('ver-err', 'Todavía no aparece verificado. Abre el enlace del correo que te enviamos y vuelve a tocar este botón.');
}
async function authReenviar() {
  authError('ver-err', ''); const ok = document.getElementById('ver-ok'); ok.style.display = 'none';
  const u = AUTH.auth && AUTH.auth.currentUser; if (!u) return;
  try { await u.sendEmailVerification(); ok.textContent = 'Listo, te enviamos otro correo. Revisa también «Spam».'; ok.style.display = 'block'; } catch (e) { authError('ver-err', e); }
}
async function authSalir() { try { if (AUTH.auth) await AUTH.auth.signOut(); } catch (e) { /* ignorar */ } }
