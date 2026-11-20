// ============================================================
// AVISO DE PRIVACIDAD — Planeador Docente NEM
//  • Se muestra UNA vez al abrir la app (hay que aceptarlo) y de nuevo solo si cambia la versión.
//  • Queda siempre disponible en el menú («Aviso de privacidad», antes de «Mi licencia») para leerlo las veces que se necesite.
// Para cambiar el texto: edita privSecciones() y sube PRIV_VERSION (así se vuelve a pedir la aceptación).
// ============================================================
const PRIV_VERSION = '2026-11-19';
const PRIV_FECHA = '19 de noviembre de 2026';
const PRIV_CONTACTO = 'planeador.nem.docente@gmail.com';

function privSecciones() {
  return [
    ['1. Qué es el Planeador y quién lo ofrece', `<p><b>Planeador Docente NEM</b> es una herramienta de apoyo para docentes de secundaria (planeaciones, pase de lista, libreta de trabajos, calificaciones, exámenes, incidencias y reportes). Lo ofrece su titular, <b>Planeador Docente NEM</b>, contacto: <b>${PRIV_CONTACTO}</b>.</p>
      <p>Este aviso explica qué datos se usan, dónde se guardan, cuáles viajan por internet y <b>qué te corresponde a ti como docente</b>.</p>`],
    ['2. Tus datos como usuario (docente)', `<p>Para crear tu cuenta y darte el servicio tratamos: tu <b>nombre</b>, <b>correo electrónico</b>, los datos de tu <b>escuela</b> que decidas capturar (nombre, CCT, municipio, director), tu <b>licencia</b> (código canjeado, fechas) y tu <b>consumo</b> de funciones con inteligencia artificial (solo cuántos documentos usaste).</p>
      <p><b>Para qué se usan:</b> identificarte, verificar tu licencia, controlar el uso justo, dar soporte y evitar abusos (por ejemplo, correos temporales). No los vendemos ni los usamos para publicidad ni para perfilarte.</p>`],
    ['3. Datos de tus alumnos y de tu grupo: se quedan contigo', `<p>Los datos de tus alumnos (nombres, listas, asistencia, calificaciones, libreta de trabajos, incidencias o bitácora, seguimiento de rezago, y cualquier nota que escribas) <b>se guardan únicamente en tu dispositivo</b>: en el navegador de tu equipo o, en la versión local, en una carpeta de tu computadora. <b>No se suben a nuestros servidores ni a la nube</b>.</p>
      <p>Algunos de esos datos pueden ser <b>personales de menores de edad</b> y, según lo que tú escribas (por ejemplo, observaciones de conducta, de salud o de su situación familiar), <b>datos sensibles</b>. Por eso, la decisión de qué capturar y cómo cuidarlo es tuya.</p>`],
    ['4. Lo que sí cruza internet, y solo de forma temporal', `<p>Aunque tus datos de grupo son locales, algunas funciones necesitan internet. Siempre viaja con <b>conexión cifrada (HTTPS)</b>:</p>
      <ul><li><b>Inicio de sesión:</b> tu correo, nombre y contraseña los maneja el servicio de cuentas de Google (Firebase Authentication). Si entras con Google o Apple, esas empresas te identifican.</li>
      <li><b>Licencia y cuota:</b> tu correo, tu código y el conteo de usos pasan por nuestro servidor (Cloudflare) para validar que tu licencia esté vigente.</li>
      <li><b>Funciones con inteligencia artificial</b> (planeaciones, exámenes, secuencias, escáner de exámenes, lectura de la foto de tu horario): el <b>texto de tu solicitud</b> (grado, materia, temas e instrucciones que escribas) y, cuando usas esas funciones, la <b>foto de la hoja del examen</b> (escáner) o la <b>foto de tu horario</b> (que puede traer el nombre del alumno) se envían a nuestro servidor, que los reenvía a un proveedor de inteligencia artificial para obtener la respuesta. <b>No guardamos el contenido de tus solicitudes ni las fotos</b>; el proveedor los procesa solo para responderte, conforme a sus propias políticas.</li></ul>
      <p><b>Recomendación importante:</b> no escribas en las solicitudes de IA nombres completos ni datos sensibles de alumnos que no sean necesarios. Para el escáner, usa fotos que no incluyan datos que no quieras compartir (por ejemplo, tapa apellidos si no los necesitas).</p>`],
    ['5. Tu responsabilidad como docente', `<p>Al usar el Planeador aceptas que <b>tú (y, en su caso, tu escuela) eres quien decide y responde por el tratamiento de los datos de tus alumnos</b>, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, a la normatividad de la SEP y de tu entidad, y a los lineamientos de tu escuela. En concreto, te comprometes a:</p>
      <ul><li>Capturar <b>solo los datos necesarios</b> para tu trabajo docente y evitar datos sensibles innecesarios.</li>
      <li>Contar con las <b>facultades o autorizaciones</b> que tu escuela o la autoridad educativa requieran para llevar esos registros.</li>
      <li><b>Proteger tu dispositivo</b> (contraseña o bloqueo de pantalla, actualizaciones, cifrado del disco si es posible) y no dejar la sesión abierta en equipos compartidos.</li>
      <li><b>Hacer y cuidar tus respaldos</b> (Mis grupos → Respaldo): el archivo que descargas contiene datos de tus alumnos; guárdalo en un lugar seguro y no lo envíes por medios abiertos.</li>
      <li><b>No compartir tu cuenta</b> ni tu licencia, y no subir información que no te corresponda.</li>
      <li>Atender las solicitudes de padres, madres o tutores sobre los datos de sus hijos <b>a través de tu escuela</b>, como corresponde.</li></ul>`],
    ['6. Cómo cuidamos lo que sí manejamos', `<p>Usamos conexiones cifradas, las llaves de la inteligencia artificial permanecen en el servidor (nunca en tu navegador), limitamos el ritmo de uso y la licencia se valida en el servidor. Ningún sistema es infalible: si detectáramos una vulneración que afecte tus datos de cuenta, te avisaremos por tu correo.</p>`],
    ['7. Terceros que participan', `<p>Para dar el servicio intervienen: <b>Google</b> (cuentas y, si lo eliges, inicio con Google), <b>Apple</b> (solo si entras con Apple), <b>Cloudflare</b> (servidor que valida licencias y conecta con la IA) y un <b>proveedor de inteligencia artificial</b>. Cada uno trata los datos según sus propias políticas de privacidad.</p>`],
    ['8. Tus derechos (acceso, rectificación, cancelación y oposición)', `<p>Puedes pedir en cualquier momento <b>acceder, corregir, cancelar</b> tus datos de cuenta u <b>oponerte</b> a su uso, escribiendo a <b>${PRIV_CONTACTO}</b> desde el correo de tu cuenta. Si quieres que cancelemos tu cuenta, lo hacemos y dejamos de tratar tus datos de cuenta, salvo lo que debamos conservar por obligación legal.</p>
      <p>Los datos de tus alumnos <b>no los tenemos</b>: están en tu dispositivo. Para borrarlos, usa las opciones de la app o borra los datos del navegador (o la carpeta «datos» en la versión local). Antes de hacerlo, haz un respaldo si lo necesitas.</p>`],
    ['9. Cuánto tiempo conservamos tus datos de cuenta', `<p>Mientras tu cuenta esté activa y el tiempo necesario para atender temas de licencias, soporte o responsabilidades legales. Los datos de tus alumnos duran en tu dispositivo el tiempo que tú decidas.</p>`],
    ['10. Cambios a este aviso', `<p>Si este aviso cambia de forma importante, te lo mostraremos de nuevo para que lo leas y lo aceptes. Siempre podrás consultarlo en el menú, en <b>«Aviso de privacidad»</b>, justo antes de «Mi licencia».</p>
      <p style="color:#64748b;font-size:12.5px">Versión ${PRIV_VERSION} · Última actualización: ${PRIV_FECHA}.</p>`],
  ];
}
function privCuerpoHTML() {
  return privSecciones().map(([t, h]) => `<h3 style="margin:16px 0 6px;font-size:15px;color:#1e3a5f">${t}</h3><div class="priv-txt">${h}</div>`).join('');
}

// ── Aceptación (una sola vez por cuenta y versión) ──────────
function privClave() { const u = (typeof getUsuario === 'function') ? getUsuario() : null; return 'nem_priv_' + ((u && (u.uid || u.email)) || 'anon'); }
function privAceptado() { try { const v = JSON.parse(localStorage.getItem(privClave()) || 'null'); return !!v && v.v === PRIV_VERSION; } catch (e) { return false; } }
function privGuardar() { try { localStorage.setItem(privClave(), JSON.stringify({ v: PRIV_VERSION, t: new Date().toISOString() })); } catch (e) { /* sin almacenamiento */ } }

const PRIV_TARJETA = 'background:#fff;border-radius:16px;max-width:680px;width:100%;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.4);font-family:inherit;color:#1e293b;';
function privModalEl() {
  let el = document.getElementById('priv-modal');
  if (!el) { el = document.createElement('div'); el.id = 'priv-modal'; el.style.cssText = 'position:fixed;inset:0;z-index:100001;background:rgba(15,39,68,.72);display:none;align-items:center;justify-content:center;padding:14px;'; document.body.appendChild(el); }
  return el;
}
// soloLeer=true: se puede cerrar sin aceptar (para consultarlo, por ejemplo desde el registro); false: hay que aceptarlo para continuar
function privAbrir(soloLeer) {
  const el = privModalEl(); el.style.display = 'flex';
  el.innerHTML = `<div style="${PRIV_TARJETA}" role="dialog" aria-modal="true" aria-label="Aviso de privacidad">
    <div style="padding:18px 22px 10px;border-bottom:1px solid #e2e8f0"><div style="font-size:26px">🔒</div><h2 style="margin:4px 0 2px;font-size:19px;color:#1e3a5f">Aviso de privacidad</h2>
      <div style="font-size:12.5px;color:#64748b">${soloLeer ? 'Léelo con calma; puedes consultarlo cuando quieras en el menú.' : 'Antes de empezar, lee este aviso. Solo se te pedirá una vez.'}</div></div>
    <div id="priv-scroll" style="padding:4px 22px 12px;overflow:auto;font-size:13.5px;line-height:1.55;flex:1">${privCuerpoHTML()}</div>
    <div style="padding:12px 22px 16px;border-top:1px solid #e2e8f0">${soloLeer
      ? `<button onclick="privCerrar()" style="width:100%;padding:12px;font-size:15px;font-weight:700;border:0;border-radius:10px;background:#1e3a5f;color:#fff;cursor:pointer">Cerrar</button>`
      : `<label style="display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.4;margin-bottom:10px;cursor:pointer"><input type="checkbox" id="priv-ok" onchange="var b=document.getElementById('priv-btn');b.disabled=!this.checked;b.style.opacity=this.checked?'1':'.55'" style="width:18px;height:18px;margin-top:1px;flex:none"><span>He leído este aviso. Entiendo que <b>los datos de mis alumnos se guardan en mi dispositivo y que yo soy responsable de su cuidado</b>, y acepto el uso de mis datos de cuenta como se describe.</span></label>
         <button id="priv-btn" disabled onclick="privAceptar()" style="width:100%;padding:12px;font-size:15px;font-weight:700;border:0;border-radius:10px;background:#1e3a5f;color:#fff;cursor:pointer;opacity:.55">Aceptar y continuar</button>
         <button onclick="privRechazar()" style="width:100%;margin-top:8px;padding:9px;font-size:13px;border:1.5px solid #cbd5e1;border-radius:10px;background:#fff;cursor:pointer">No acepto (cerrar sesión)</button>`}
    </div></div>`;
}
function privCerrar() { const el = document.getElementById('priv-modal'); if (el) el.style.display = 'none'; }
function privAceptar() { privGuardar(); privCerrar(); }
function privRechazar() { privCerrar(); if (typeof doLogout === 'function') doLogout(); }
// Al entrar a la app: si esta cuenta aún no ha aceptado esta versión, se muestra
function privVerificar() { if (!privAceptado()) privAbrir(false); }

// ── Pantalla del menú («Aviso de privacidad») ───────────────
function privRender() {
  const p = document.getElementById('g-privacidad'); if (!p) return;
  const ac = (() => { try { return JSON.parse(localStorage.getItem(privClave()) || 'null'); } catch (e) { return null; } })();
  p.innerHTML = `<div class="sec-title">Aviso de privacidad</div><div class="sec-sub">Cómo se cuidan los datos en el Planeador y qué te corresponde como docente.</div>
    <div class="card" style="max-width:860px;font-size:14px;line-height:1.6">
      <div class="g-aviso" style="margin-bottom:6px;font-size:13px">🔒 <b>Resumen:</b> los datos de tus alumnos viven <b>solo en tu dispositivo</b>. Lo que cruza internet (tu cuenta, tu licencia y las solicitudes a la IA) va cifrado y de forma temporal. <b>Tú eres responsable de los datos que captures y de tus respaldos.</b></div>
      ${privCuerpoHTML()}
      <p style="margin-top:16px;font-size:12.5px;color:var(--gris)">${ac && ac.t ? '✓ Lo aceptaste el ' + new Date(ac.t).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) + '.' : ''}</p>
    </div>`;
}
