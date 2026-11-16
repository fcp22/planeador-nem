// ============================================================
// MODO DEMOSTRACIÓN (solo para la vista previa publicada).
// No existe en la carpeta app/ del proyecto. Entra sin cuenta,
// con datos de ejemplo inventados, para ver los menús por dentro.
// ============================================================
(function () {
  const MSG = 'Esto es una demostración: aquí no se crean cuentas ni se conecta con Google o Apple. Usa el botón «Entrar a la demostración».';
  window.authInit = async function () {};
  ['authEntrar', 'authRegistrar', 'authRecuperar', 'authSocial', 'authGoogle', 'authApple'].forEach(n => { window[n] = function () { const e = document.getElementById('auth-aviso'); if (e) { e.textContent = MSG; e.style.display = 'block'; } }; });

  const NOMBRES = ['AGUILAR PECH ANDREA', 'BALAM CHAN DIEGO', 'CAUICH MAY VALERIA', 'CHAN CAUICH LUIS', 'CANUL POOT SOFÍA', 'DZIB UC MATEO', 'EK CHAN CAMILA', 'HAU COCOM JOSÉ', 'KU TUN FERNANDA', 'MAY CANUL ÁNGEL', 'NOH BALAM RENATA', 'POOT EK SANTIAGO', 'TUN MAY ARIADNA', 'UC DZIB EMILIANO'];

  function sembrar() {
    const crit = [['Actitudes y valores', 10], ['Actividades en clase', 20], ['Investigaciones y tareas', 15], ['Portafolio de evidencias', 10], ['Exámenes', 15], ['Producto del proyecto', 30]].map(([nombre, pct]) => ({ id: gId(), nombre, pct }));
    const alumnos = NOMBRES.map(nombre => ({ id: gId(), nombre }));
    const asist = {};
    let f = gHoy(), puestos = 0;
    while (puestos < 6) {
      f = gSumarDias(f, -1);
      const [y, m, d] = f.split('-').map(Number); const dow = new Date(y, m - 1, d).getDay();
      if (dow === 0 || dow === 6) continue;
      asist[f] = {};
      alumnos.forEach((a, i) => { const r = (i * 7 + puestos * 3) % 23; asist[f][a.id] = (i === 1 && puestos % 2 === 0) || (i === 5 && puestos < 3) ? 'F' : r === 0 ? 'F' : r === 5 ? 'R' : r === 11 ? 'J' : 'P'; });
      puestos++;
    }
    const t = gTrimDeFecha(gHoy());
    const mk = (nombre, idxCrit, tipo, max, sem) => {
      const notas = {};
      alumnos.forEach((a, i) => { const v = 5.5 + ((i * 5 + sem * 3) % 10) * 0.45; notas[a.id] = (Math.round(v * max) / 10).toFixed(1).replace(/\.0$/, ''); });
      return { id: gId(), trim: t, criterioId: crit[idxCrit].id, nombre, max, tipo, fecha: gHoy(), notas };
    };
    return { id: gId(), nombre: '2° B', grado: '2', materia: 'Matemáticas', alumnos, asist, criterios: crit,
      actividades: [mk('Ejercicios de fracciones', 1, 'actividad', 10, 1), mk('Investigación: proporcionalidad en mi comunidad', 2, 'actividad', 10, 2), mk('Examen diagnóstico', 4, 'examen', 10, 3), mk('Participación semanal', 0, 'actividad', 10, 4)], plan: {} };
  }

  const gCargarOriginal = window.gCargar;
  window.gCargar = function () {
    gCargarOriginal();
    if (window.NEM_DEMO_ACTIVA && G.data && !G.data.grupos.length) {
      G.data.grupos.push(sembrar());
      G.gid = G.data.grupos[0].id;
    }
  };

  window.entrarDemo = function () {
    window.NEM_DEMO_ACTIVA = true;
    usuarioActivo = { curp: 'demo', uid: 'demo', email: 'demo@ejemplo.com', nombre: 'Maestro Demo', rol: 'admin', escuela: 'Escuela Secundaria (ejemplo)', cct: '', municipio: 'Ticul, Yucatán' };
    entrarApp();
  };

  function montar() {
    const card = document.querySelector('.login-card'); if (!card) return;
    const caja = document.createElement('div'); caja.id = 'demo-caja';
    caja.innerHTML = '<div style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:12px;padding:14px;margin-bottom:14px;text-align:left;font-size:13px;color:#1e3a5f;line-height:1.45"><b>Vista de demostración.</b> Entra sin cuenta para recorrer los menús con un grupo de ejemplo (alumnos inventados). Nada se guarda en internet.</div>' +
      '<button class="btn-p" style="width:100%" onclick="entrarDemo()">Entrar a la demostración</button>' +
      '<div style="text-align:center;margin-top:12px"><a href="#" style="font-size:12.5px;color:#2563a8" onclick="demoVerAcceso();return false">Ver cómo se ve el acceso real (Entrar / Crear cuenta)</a></div>';
    card.querySelector('.login-logo').insertAdjacentElement('afterend', caja);
    ['panel-social', 'auth-tabs', 'panel-login'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    const av = document.getElementById('auth-aviso'); if (av) av.style.display = 'none';
  }
  window.demoVerAcceso = function () {
    document.getElementById('demo-caja').style.display = 'none';
    document.getElementById('panel-social').style.display = 'block';
    document.getElementById('auth-tabs').style.display = 'flex';
    document.querySelectorAll('#panel-social button, #pantalla-login .btn-p').forEach(b => b.disabled = false);
    const ap = document.querySelector('.btn-apple'); if (ap) ap.style.display = 'flex';
    showAuthTab('login');
    const v = document.createElement('div'); v.style.cssText = 'text-align:center;margin-top:12px';
    v.innerHTML = '<a href="#" style="font-size:12.5px;color:#2563a8" onclick="location.reload();return false">← Volver a la demostración</a>';
    document.querySelector('.login-card').appendChild(v);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
