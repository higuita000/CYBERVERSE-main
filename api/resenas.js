// POST /api/resenas  { producto_id, usuario_id, calificacion, comentario }
// GET  /api/resenas?producto_id=1  -> lista reseñas con nombre de usuario
const { getSupabase, cors } = require('./_supabase');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const supabase = getSupabase();

    if (req.method === 'GET') {
      const producto_id = parseInt(req.query.producto_id || '0');
      if (!producto_id) return res.status(400).json({ success: false, message: 'Falta producto_id.' });
      const { data, error } = await supabase
        .from('resenas')
        .select('id,producto_id,calificacion,comentario,compra_verificada,fecha_resena,usuarios(nombre_completo)')
        .eq('producto_id', producto_id)
        .order('fecha_resena', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, resenas: data || [] });
    }

    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método no permitido' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const producto_id = parseInt(body.producto_id);
    const usuario_id = body.usuario_id;
    const calificacion = parseInt(body.calificacion);
    const comentario = (body.comentario || '').trim();

    if (!producto_id || !usuario_id || !calificacion || !comentario) {
      return res.status(400).json({ success: false, message: 'Faltan datos de la reseña.' });
    }
    if (calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ success: false, message: 'Calificación 1-5.' });
    }

    // upsert: 1 reseña por usuario por producto
    const { error } = await supabase.from('resenas').upsert(
      { producto_id, usuario_id, calificacion, comentario, compra_verificada: true },
      { onConflict: 'producto_id,usuario_id' }
    );
    if (error) throw error;

    // Actualizar contador en productos (conteo real)
    const { count } = await supabase.from('resenas').select('*', { count: 'exact', head: true }).eq('producto_id', producto_id);
    if (typeof count === 'number') {
      await supabase.from('productos').update({ total_resenas: count }).eq('id', producto_id);
    }

    return res.status(200).json({ success: true, message: 'Reseña guardada en Supabase.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Error al guardar reseña: ' + e.message });
  }
};
