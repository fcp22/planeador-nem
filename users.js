// ============================================================
// USUARIOS Y AUTENTICACIÓN - PLANEADOR NEM
// Sistema híbrido: Admin local + Maestros en Firebase con CURP
// ============================================================

const FIREBASE_URL = 'https://planeador-nem-fcp-default-rtdb.firebaseio.com';

// ── ADMIN LOCAL (nunca va a Firebase para su contraseña) ──
const ADMIN_DB = [
  { curp: 'ADMIN', password: 'admin2025', nombre: 'Mtro. Manuel Uitzil', rol: 'admin', escuela: 'Sec. Felipe Carrillo Puerto' },
];

let usuarioActivo = null;

// ── FIREBASE: LEER USUARIO ────────────────────────────────
async function fbGetUsuario(curp) {
  try {
    const key = curp.replace(/[^A-Z0-9]/g, '');
    const res = await fetch(`${FIREBASE_URL}/usuarios/${key}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) { return null; }
}

// ── FIREBASE: ESCRIBIR/ACTUALIZAR USUARIO ─────────────────
async function fbSetUsuario(curp, datos) {
  try {
    const key = curp.replace(/[^A-Z0-9]/g, '');
    await fetch(`${FIREBASE_URL}/usuarios/${key}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
  } catch (e) { console.warn('Firebase no disponible:', e); }
}

// ── FIREBASE: TODOS LOS USUARIOS ─────────────────────────
async function fbGetTodosUsuarios() {
  try {
    const res = await fetch(`${FIREBASE_URL}/usuarios.json`);
    if (!res.ok) return {};
    return await res.json() || {};
  } catch (e) { return {}; }
}

// ── FIREBASE: REGISTRAR DOCUMENTO ────────────────────────
async function fbRegistrarDocumento(curp, tipoDoc) {
  const trim = obtenerTrimestreActual();
  const estado = await fbGetUsuario(curp) || {};
  const key = `${trim}_docs`;
  await fbSetUsuario(curp, {
    [key]: (estado[key] || 0) + 1,
    ultimo_acceso: new Date().toISOString(),
    ultimo_doc: tipoDoc
  });
}

// ── UTILIDAD ─────────────────────────────────────────────
function obtenerTrimestreActual() {
  const mes = new Date().getMonth() + 1;
  if (mes >= 9 && mes <= 11) return 't1_2025';
  if (mes >= 12 || mes <= 3) return 't2_2025';
  return 't3_2026';
}

// ── AUTENTICACIÓN PRINCIPAL ───────────────────────────────
async function autenticar(curp, password) {

  // 1. ¿Es admin local?
  const admin = ADMIN_DB.find(x => x.curp === curp && x.password === password);
  if (admin) {
    usuarioActivo = admin;
    await fbSetUsuario('ADMIN', { ultimo_acceso: new Date().toISOString(), rol: 'admin', nombre: admin.nombre });
    return { ok: true };
  }

  // 2. Buscar en Firebase por CURP
  const datos = await fbGetUsuario(curp);

  if (!datos) {
    return { ok: false, mensaje: 'CURP no registrada. ¿Ya creaste tu cuenta?' };
  }

  // 3. Verificar contraseña
  if (datos.password !== password) {
    return { ok: false, mensaje: 'Contraseña incorrecta.' };
  }

  // 4. Verificar si está activo
  if (datos.activo === false) {
    return { ok: false, mensaje: 'Tu cuenta está desactivada. Contacta al director.' };
  }

  // 5. Login exitoso
  usuarioActivo = {
    curp: curp,
    nombre: datos.nombre,
    rol: datos.rol || 'docente',
    escuela: datos.escuela || 'Sec. Felipe Carrillo Puerto'
  };
  await fbSetUsuario(curp, { ultimo_acceso: new Date().toISOString() });
  return { ok: true };
}

// ── CONTROL ADMIN ─────────────────────────────────────────
async function bloquearUsuario(curp) {
  await fbSetUsuario(curp, { activo: false });
}
async function desbloquearUsuario(curp) {
  await fbSetUsuario(curp, { activo: true });
}

// ── GETTERS ───────────────────────────────────────────────
function cerrarSesion() { usuarioActivo = null; }
function esAdmin() { return usuarioActivo?.rol === 'admin'; }
function getUsuario() { return usuarioActivo; }
