// GET /api/my_orders?usuario_id=xxx&email=yyy
// Replica api/my_orders.php pero contra Supabase Postgres.
const { getSupabase, cors } = require('./_supabase');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const usuario_id = req.query.usuario_id || req.body?.usuario_id || '';
    const email = req.query.email || req.body?.email || '';
    if (!usuario_id && !email) {
      return res.status(400).json({ success: false, message: 'Usuario no especificado.' });
    }

    const supabase = getSupabase();

    // 1. Resolver usuario
    let user = null;
    if (usuario_id) {
      const { data } = await supabase.from('usuarios').select('id,email').eq('id', usuario_id).maybeSingle();
      if (data) user = data;
    }
    if (!user && email) {
      const { data } = await supabase.from('usuarios').select('id,email').eq('email', String(email).toLowerCase()).maybeSingle();
      if (data) user = data;
    }
    if (!user) return res.status(200).json({ success: true, total: 0, compras: [] });

    // 2. Órdenes + detalles (joins manuales, simple y compatible)
    const { data: ordenes, error } = await supabase.from('ordenes').select('*').eq('usuario_id', user.id).order('fecha_creacion', { ascending: false });
    if (error) throw error;

    const compras = [];
    for (const o of (ordenes || [])) {
      const { data: detalles } = await supabase.from('orden_detalles').select('*').eq('orden_id', o.id);
      for (const d of (detalles || [])) {
        const [{ data: prod }, { data: lic }] = await Promise.all([
          supabase.from('productos').select('titulo,imagen_url').eq('id', d.producto_id).maybeSingle(),
          d.licencia_id ? supabase.from('licencias_digitales').select('clave_activacion').eq('id', d.licencia_id).maybeSingle() : Promise.resolve({ data: null })
        ]);
        compras.push({
          orden_id: o.id,
          codigo_referencia: o.codigo_referencia,
          total_cop: o.total_cop,
          moneda_compra: o.moneda_compra,
          estado_orden: o.estado,
          fecha_creacion: o.fecha_creacion,
          videojuego: prod?.titulo || ('Juego #' + d.producto_id),
          imagen_url: prod?.imagen_url || null,
          cantidad: d.cantidad,
          precio_unitario_cop: d.precio_unitario_cop,
          clave_activacion: lic?.clave_activacion || 'CLAVE-DIGITAL-ASIGNADA'
        });
      }
    }

    return res.status(200).json({ success: true, total: compras.length, compras });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Error al cargar órdenes: ' + e.message });
  }
};
