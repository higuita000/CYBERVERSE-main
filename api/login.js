// POST /api/login  { email, password }
// Replica api/login.php pero contra Supabase Postgres.
const bcrypt = require('bcryptjs');
const { getSupabase, cors } = require('./_supabase');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método no permitido' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'vercel';

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Ingresa correo y contraseña.' });
    }

    const supabase = getSupabase();
    const { data: usuario, error } = await supabase.from('usuarios').select('*').eq('email', email).limit(1).maybeSingle();
    if (error) throw error;

    if (!usuario) {
      await supabase.from('sesiones_log').insert({ email_ingresado: email, ip_cliente: String(ip).slice(0, 45), resultado: 'USUARIO_NO_ENCONTRADO', mensaje: 'Correo no existe' });
      return res.status(401).json({ success: false, message: 'No existe cuenta con este correo.' });
    }
    if (usuario.estado !== 'ACTIVO') {
      return res.status(403).json({ success: false, message: 'Cuenta suspendida o inactiva.' });
    }

    const ok = await bcrypt.compare(password, usuario.password_hash);
    if (!ok) {
      await supabase.from('sesiones_log').insert({ usuario_id: usuario.id, email_ingresado: email, ip_cliente: String(ip).slice(0, 45), resultado: 'CONTRASENA_INCORRECTA', mensaje: 'Contraseña incorrecta' });
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
    }

    await supabase.from('usuarios').update({ ultima_conexion: new Date().toISOString() }).eq('id', usuario.id);
    await supabase.from('sesiones_log').insert({ usuario_id: usuario.id, email_ingresado: email, ip_cliente: String(ip).slice(0, 45), resultado: 'EXITOSO', mensaje: 'Login exitoso' });

    return res.status(200).json({
      success: true,
      message: '¡Bienvenido de nuevo, ' + usuario.nombre_completo + '!',
      user: { id: usuario.id, nombre_completo: usuario.nombre_completo, email: usuario.email, rol: usuario.rol }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Error en login: ' + e.message });
  }
};
