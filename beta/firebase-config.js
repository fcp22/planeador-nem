// ============================================================
// CONFIGURACIÓN DE LA APP (rellena estos datos una sola vez)
// Guía paso a paso: worker-ia/README.md
// ============================================================
window.NEM_CONFIG = {
  // Firebase → Configuración del proyecto → «Tus apps» → app Web → firebaseConfig
  // (estos valores NO son secretos: están pensados para ir en la página)
  firebase: {
    apiKey: 'AIzaSyBza5MAQOIFn6mPlmdqWXDlaHj_lQxE2SY',
    authDomain: 'planeador-docente-nem.firebaseapp.com',
    projectId: 'planeador-docente-nem',
    appId: '1:333802288937:web:048e151fca1194ef5c6938',
  },
  // Métodos de acceso que ya activaste en Firebase → Authentication.
  // Apple exige cuenta de desarrollador de Apple (de paga); déjalo en false hasta tenerla.
  proveedores: { google: true, apple: false },
  // Dirección de tu Worker de Cloudflare (sin diagonal al final), por ejemplo:
  // 'https://planeador-nem-ia.tu-usuario.workers.dev'
  workerUrl: 'https://planeador-nem-ia.planeador-nem-docente.workers.dev',
  // Correos que ven el panel «Licencias» (administrador). El poder real lo da
  // la clave ADMIN_SECRET del Worker, así que esto solo muestra u oculta el menú.
  adminEmails: ['planeador.nem.docente@gmail.com'],
  // Cómo conseguir un código de licencia (se muestra en «Mi licencia»)
  contacto: 'Escribe a planeador.nem.docente@gmail.com',
};
