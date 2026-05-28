// ============================================================
// USUARIOS Y AUTENTICACIÓN - PLANEADOR NEM
// Versión con Firebase Realtime Database
// ============================================================

// ── CONFIGURACIÓN FIREBASE ───────────────────────────────
const FIREBASE_URL = 'https://planeador-nem-fcp-default-rtdb.firebaseio.com';

// ── BASE DE USUARIOS LOCAL (credenciales) ────────────────
const USUARIOS_DB = [
  { usuario: 'admin',     password: 'admin2025', nombre: 'Administrador',  rol: 'admin',   escuela: 'Sec. Felipe Carrillo Puerto' },
  { usuario: 'maestra01', password: '123456',    nombre: 'Maestra 01',     rol: 'docente', escuela: 'Sec. Felipe Carrillo Puerto' },
  { usuario: 'maestro02', password: '123456',    nombre: 'Maestro 02',     rol: 'docente', escuela: 'Sec. Felipe Carrillo Puerto' },
  { usuario: 'maestra03', password: '123456',    nombre: 'Maestra 03',     rol: 'docente', escuela: 'Sec. Felipe Carrillo Puerto' },
  // ── AGREGAR AQUÍ LOS 45 DOCENTES ──────────────────────
  // { usuario: 'maestra04', password: '123456', nombre: 'Nombre Apellido', rol: 'docente', escuela: 'Sec. Felipe Carrillo Puerto' },
];

let usuarioActivo = null;

// ── FIREBASE: LEER ESTADO DE USUARIO ────────────────────
async function fbGetUsuario(usuario) {
  try {
    const res = await fetch(`${FIREBASE_URL}/usuarios/${usuario}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

// ── FIREBASE: CREAR/ACTUALIZAR ESTADO DE USUARIO ────────
async function fbSetUsuario(usuario, datos) {
  try {
    await fetch(`${FIREBASE_URL}/usuarios/${usuario}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
  } catch (e) {
    console.warn('Firebase no disponible:', e);
  }
}

// ── FIREBASE: OBTENER TODOS LOS USUARIOS ────────────────
async function fbGetTodosUsuarios() {
  try {
    const res = await fetch(`${FIREBASE_URL}/usuarios.json`);
    if (!res.ok) return {};
    return await res.json() || {};
  } catch (e) {
    return {};
  }
}

// ── FIREBASE: REGISTRAR DOCUMENTO GENERADO ──────────────
async function fbRegistrarDocumento(usuario, tipoDoc) {
  const ahora = new Date();
  const trimestre = obtenerTrimestreActual();
  const key = `${trimestre}_docs`;
  
  // Obtener estado actual
  const estado = await fbGetUsuario(usuario) || {};
  const docsActuales = estado[key] || 0;
  
  await fbSetUsuario(usuario, {
    [key]: docsActuales + 1,
    ultimo_acceso: ahora.toISOString(),
    ultimo_doc: tipoDoc
  });
}

// ── UTILIDAD: TRIMESTRE ACTUAL ───────────────────────────
function obtenerTrimestreActual() {
  const mes = new Date().getMonth() + 1;
  if (mes >= 9 && mes <= 11) return 't1_2025';
  if (mes >= 12 || mes <= 3) return 't2_2025';
  return 't3_2026';
}

// ── AUTENTICACIÓN PRINCIPAL ──────────────────────────────
async function autenticar(usuario, password) {
  // 1. Verificar credenciales locales
  const u = USUARIOS_DB.find(x => x.usuario === usuario && x.password === password);
  if (!u) return { ok: false, mensaje: 'Usuario o contraseña incorrectos.' };

  // 2. Admin siempre pasa sin bloqueo
  if (u.rol === 'admin') {
    usuarioActivo = u;
    await fbSetUsuario(usuario, { ultimo_acceso: new Date().toISOString(), rol: 'admin' });
    return { ok: true };
  }

  // 3. Verificar estado en Firebase
  const estado = await fbGetUsuario(usuario);
  
  if (estado === null) {
    // Primera vez — crear registro en Firebase
    await fbSetUsuario(usuario, {
      nombre: u.nombre,
      rol: u.rol,
      activo: true,
      ultimo_acceso: new Date().toISOString(),
      t1_2025_docs: 0,
      t2_2025_docs: 0,
      t3_2026_docs: 0
    });
    usuarioActivo = u;
    return { ok: true };
  }

  // 4. Verificar si está bloqueado
  if (estado.activo === false) {
    return { 
      ok: false, 
      mensaje: 'Tu cuenta está desactivada. Contacta al administrador.' 
    };
  }

  // 5. Todo bien
  usuarioActivo = u;
  await fbSetUsuario(usuario, { ultimo_acceso: new Date().toISOString() });
  return { ok: true };
}

// ── CONTROL DE USUARIOS (solo admin) ────────────────────
async function bloquearUsuario(usuario) {
  await fbSetUsuario(usuario, { activo: false });
}

async function desbloquearUsuario(usuario) {
  await fbSetUsuario(usuario, { activo: true });
}

// ── GETTERS ──────────────────────────────────────────────
function cerrarSesion() { usuarioActivo = null; }
function esAdmin() { return usuarioActivo?.rol === 'admin'; }
function getUsuario() { return usuarioActivo; }
