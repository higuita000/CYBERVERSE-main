// POST /api/register  { nombre_completo|nombre, email, password }
// Replica api/register.php pero contra Supabase Postgres.
const bcrypt = require('bcryptjs');
const { getSupabase, cors } = require('./_supabase');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método no permitido' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const nombre = (body.nombre_completo || body.nombre || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!nombre || !email || !password) {
      return res.status(400).json({ success: false, message: 'Completa Nombre, Email y Contraseña.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Correo no válido.' });
    }

    const supabase = getSupabase();

    const { data: existing } = await supabase.from('usuarios').select('id').eq('email', email).limit(1).maybeSingle();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Ya existe una cuenta con este correo.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const usuario_id = 'usr-uuid-' + Math.floor(10000 + Math.random() * 89999);

    const { error } = await supabase.from('usuarios').insert({
      id: usuario_id, nombre_completo: nombre, email,
      password_hash, rol: 'CLIENTE', estado: 'ACTIVO'
    });
    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: '¡Cuenta creada! Bienvenido a CyberVerse.',
      user: { id: usuario_id, nombre_completo: nombre, email, rol: 'CLIENTE' }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Error en registro: ' + e.message });
  }
};
