// POST /api/process_payment  { usuario_id, metodo, nombre, email, totalCOP, descuentoCOP, items[], tarjeta{} }
// Replica api/process_payment.php pero contra Supabase Postgres.
const { getSupabase, cors } = require('./_supabase');

const METODO_MAP = {
  'Tarjeta de Crédito': 1, 'Tarjeta Crédito/Débito': 1,
  'PayPal': 2, 'Criptomonedas': 3,
  'PSE / Nequi / Efectivo': 4, 'PSE / Nequi / OXXO / Efectivo': 4,
  'Apple/Google Pay': 5, 'Apple Pay': 5
};

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método no permitido' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    let items = body.items || [];
    if (typeof items === 'string') { try { items = JSON.parse(items); } catch { items = []; } }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Carrito vacío.' });
    }

    const supabase = getSupabase();
    const tarjeta = body.tarjeta || {};
    const nombre = (body.nombre || tarjeta.nombre || 'Cliente Gamer').trim();
    let email = (body.email || '').trim().toLowerCase();
    if (!email) {
      const clean = nombre.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || ('cliente' + Math.floor(Math.random() * 900 + 100));
      email = `${clean}@cyberverse.com`;
    }

    // 1. Usuario: buscar por id, si no por email, si no crear
    let usuario_id = body.usuario_id || null;
    if (usuario_id) {
      const { data } = await supabase.from('usuarios').select('id').eq('id', usuario_id).maybeSingle();
      if (!data) usuario_id = null;
    }
    if (!usuario_id) {
      const { data } = await supabase.from('usuarios').select('id,nombre_completo').eq('email', email).maybeSingle();
      if (data) {
        usuario_id = data.id;
        await supabase.from('usuarios').update({ nombre_completo: nombre }).eq('id', usuario_id);
      } else {
        usuario_id = 'usr-uuid-' + Math.floor(1000 + Math.random() * 8999);
        const bcrypt = require('bcryptjs');
        const password_hash = await bcrypt.hash('cliente2026', 10);
        const { error } = await supabase.from('usuarios').insert({ id: usuario_id, nombre_completo: nombre, email, password_hash, rol: 'CLIENTE', estado: 'ACTIVO' });
        if (error) throw error;
      }
    }

    // 2. Orden
    const orden_id = 'ord-uuid-' + Math.floor(100000 + Math.random() * 899999);
    const codigo_ref = 'CYBER-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 89999);
    const total_cop = Number(body.totalCOP || 0);
    const descuento_cop = Number(body.descuentoCOP || 0);
    const subtotal_cop = total_cop + descuento_cop;

    const { error: errOrd } = await supabase.from('ordenes').insert({
      id: orden_id, codigo_referencia: codigo_ref, usuario_id,
      subtotal_cop, descuento_cop, total_cop,
      moneda_compra: 'COP', total_moneda_original: total_cop, estado: 'COMPLETADA'
    });
    if (errOrd) throw errOrd;

    const metodo_nombre = body.metodo || 'Tarjeta Crédito/Débito';
    const metodo_id = METODO_MAP[metodo_nombre] || 1;

    // 3. Detalles + licencias
    for (const item of items) {
      const producto_id = parseInt(item.id);
      const cantidad = parseInt(item.quantity || 1);
      const precio = Number(item.priceCOP || 0);

      // auto-crear producto si no existe (igual que el PHP)
      const { data: prod } = await supabase.from('productos').select('id').eq('id', producto_id).maybeSingle();
      if (!prod) {
        await supabase.from('productos').insert({
          id: producto_id, categoria_id: 1,
          titulo: item.title || ('Juego 3D #' + producto_id),
          slug: 'juego-' + producto_id + '-' + Math.floor(Math.random() * 900 + 100),
          descripcion: 'Videojuego 3D de alta definición.',
          precio_cop: precio, imagen_url: item.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e'
        });
      }

      let licencia_id = null;
      const { data: lic } = await supabase.from('licencias_digitales')
        .select('id').eq('producto_id', producto_id).eq('estado', 'DISPONIBLE').limit(1).maybeSingle();
      if (lic) {
        licencia_id = lic.id;
        await supabase.from('licencias_digitales').update({ estado: 'ASIGNADA', fecha_asignacion: new Date().toISOString() }).eq('id', licencia_id);
      }

      const { error } = await supabase.from('orden_detalles').insert({
        orden_id, producto_id, plataforma_id: 1, licencia_id,
        cantidad, precio_unitario_cop: precio, subtotal_cop: precio * cantidad
      });
      if (error) throw error;
    }

    // 4. Transacción
    const trx_id = 'trx-uuid-' + Math.floor(100000 + Math.random() * 899999);
    const ref_pasarela = 'GATEWAY-' + require('crypto').randomBytes(8).toString('hex').toUpperCase();
    const { error: errTrx } = await supabase.from('transacciones_pago').insert({
      id: trx_id, orden_id, metodo_pago_id: metodo_id,
      referencia_pasarela: ref_pasarela, monto: total_cop, moneda: 'COP',
      estado_transaccion: 'APROBADA', codigo_respuesta: '00_SUCCESS', mensaje_respuesta: 'Transacción aprobada'
    });
    if (errTrx) throw errTrx;

    if (metodo_id === 1) {
      const num = (tarjeta.numero || '4532890123456789').replace(/\s+/g, '');
      const ultimos = num.slice(-4).padStart(4, '0');
      const exp = (tarjeta.exp || '12/28').split('/');
      const mes = (exp[0] || '12').padStart(2, '0');
      const anio = exp[1] ? (exp[1].length === 2 ? '20' + exp[1] : exp[1]) : '2028';
      await supabase.from('detalles_pago_tarjeta').insert({
        transaccion_id: trx_id, nombre_titular: nombre, marca_tarjeta: 'VISA',
        ultimos_cuatro: ultimos, mes_expiracion: mes, anio_expiracion: anio,
        token_transaccion: 'tok_sec_' + require('crypto').randomBytes(8).toString('hex')
      });
    } else {
      await supabase.from('detalles_pago_alternativo').insert({
        transaccion_id: trx_id, proveedor: metodo_nombre, identificador_cuenta: metodo_nombre
      });
    }

    await supabase.from('auditoria_estados_orden').insert({
      orden_id, estado_anterior: 'PENDIENTE', estado_nuevo: 'COMPLETADA',
      usuario_modificador_id: usuario_id, motivo: 'Compra desde tienda web (Supabase)'
    });

    return res.status(200).json({
      success: true, codigo_referencia: codigo_ref, orden_id,
      usuario_id, cliente: nombre, email, total: total_cop,
      message: 'Venta registrada en Supabase'
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Error al registrar venta: ' + e.message });
  }
};
