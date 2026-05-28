// ============================================================
// USUARIOS Y AUTENTICACIÓN - PLANEADOR NEM
// ============================================================

const USUARIOS_DB = [
  { usuario: 'admin',      password: 'admin2025',  nombre: 'Administrador',           rol: 'admin',   escuela: 'Sec. Felipe Carrillo Puerto' },
  { usuario: 'maestra01',  password: '123456',     nombre: 'Maestra 01',              rol: 'docente', escuela: 'Sec. Felipe Carrillo Puerto' },
  { usuario: 'maestro02',  password: '123456',     nombre: 'Maestro 02',              rol: 'docente', escuela: 'Sec. Felipe Carrillo Puerto' },
  { usuario: 'maestra03',  password: '123456',     nombre: 'Maestra 03',              rol: 'docente', escuela: 'Sec. Felipe Carrillo Puerto' },
  // ── AGREGAR AQUÍ LOS 45 DOCENTES ──────────────────────────
  // { usuario: 'maestra04', password: '123456', nombre: 'Nombre Apellido', rol: 'docente', escuela: 'Sec. Felipe Carrillo Puerto' },
];

let usuarioActivo = null;

function autenticar(usuario, password) {
  const u = USUARIOS_DB.find(x => x.usuario === usuario && x.password === password);
  if (u) { usuarioActivo = u; return true; }
  return false;
}

function cerrarSesion() { usuarioActivo = null; }
function esAdmin() { return usuarioActivo?.rol === 'admin'; }
function getUsuario() { return usuarioActivo; }
