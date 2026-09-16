<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Conexión a XAMPP MySQL
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db   = 'cyberverse_db';

$mysqli = new mysqli($host, $user, $pass, $db);
if ($mysqli->connect_errno) {
    echo json_encode(['success' => false, 'message' => 'Error al conectar con MySQL: ' . $mysqli->connect_error]);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    if (!empty($_POST)) {
        $data = $_POST;
    } else if (!empty($_REQUEST)) {
        $data = $_REQUEST;
    }
}

if (is_string($data)) {
    $data = json_decode($data, true);
}

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No se recibieron datos en el servidor.']);
    exit;
}

$items = $data['items'] ?? [];
if (is_string($items)) {
    $items = json_decode($items, true);
}

if (!is_array($items) || count($items) === 0) {
    echo json_encode(['success' => false, 'message' => 'El carrito de compra está vacío.']);
    exit;
}

try {
    $mysqli->begin_transaction();

    // 1. Obtener Datos del Comprador
    $tarjeta = is_string($data['tarjeta'] ?? null) ? json_decode($data['tarjeta'], true) : ($data['tarjeta'] ?? []);
    $nombre_comprador = !empty($data['nombre']) ? trim($data['nombre']) : (!empty($tarjeta['nombre']) ? trim($tarjeta['nombre']) : 'Cliente Gamer');
    
    if (!empty($data['email'])) {
        $email_comprador = trim(strtolower($data['email']));
    } else {
        $clean_name = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', str_replace(' ', '.', $nombre_comprador)));
        if (empty($clean_name)) $clean_name = 'cliente' . rand(100, 999);
        $email_comprador = $clean_name . '@cyberverse.com';
    }

    // Buscar si ya existe el usuario por ID o email
    $usuario_id = !empty($data['usuario_id']) ? $data['usuario_id'] : null;

    if ($usuario_id) {
        $user_stmt = $mysqli->prepare("SELECT id FROM usuarios WHERE id = ? LIMIT 1");
        $user_stmt->bind_param("s", $usuario_id);
        $user_stmt->execute();
        $user_res = $user_stmt->get_result();
        if ($user_res->num_rows === 0) {
            $usuario_id = null;
        }
    }

    if (!$usuario_id) {
        $user_stmt = $mysqli->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
        $user_stmt->bind_param("s", $email_comprador);
        $user_stmt->execute();
        $user_res = $user_stmt->get_result();

        if ($user_row = $user_res->fetch_assoc()) {
            $usuario_id = $user_row['id'];
            $upd_u = $mysqli->prepare("UPDATE usuarios SET nombre_completo = ? WHERE id = ?");
            $upd_u->bind_param("ss", $nombre_comprador, $usuario_id);
            $upd_u->execute();
        } else {
            // Crear nuevo usuario automáticamente en la tabla usuarios
            $usuario_id = 'usr-uuid-' . rand(1000, 9999);
            $pass_hash = password_hash('cliente2026', PASSWORD_DEFAULT);
            $ins_user = $mysqli->prepare("INSERT INTO usuarios (id, nombre_completo, email, password_hash, rol, estado) VALUES (?, ?, ?, ?, 'CLIENTE', 'ACTIVO')");
            $ins_user->bind_param("ssss", $usuario_id, $nombre_comprador, $email_comprador, $pass_hash);
            $ins_user->execute();
        }
    }

    // 2. Generar Identificadores de Orden
    $orden_id = 'ord-uuid-' . rand(100000, 999999);
    $codigo_ref = 'CYBER-' . date('Y') . '-' . rand(10000, 99999);
    $total_cop = floatval($data['totalCOP'] ?? 0);
    $descuento_cop = floatval($data['descuentoCOP'] ?? 0);
    $subtotal_cop = $total_cop + $descuento_cop;

    // Insertar Orden
    $stmt_ord = $mysqli->prepare("INSERT INTO ordenes (id, codigo_referencia, usuario_id, subtotal_cop, descuento_cop, total_cop, moneda_compra, total_moneda_original, estado) VALUES (?, ?, ?, ?, ?, ?, 'COP', ?, 'COMPLETADA')");
    $stmt_ord->bind_param("sssdddd", $orden_id, $codigo_ref, $usuario_id, $subtotal_cop, $descuento_cop, $total_cop, $total_cop);
    $stmt_ord->execute();

    // Mapeo Métodos de Pago
    $metodo_map = [
        'Tarjeta de Crédito' => 1,
        'Tarjeta Crédito/Débito' => 1,
        'PayPal' => 2,
        'Criptomonedas' => 3,
        'PSE / Nequi / Efectivo' => 4,
        'PSE / Nequi / OXXO / Efectivo' => 4,
        'Apple/Google Pay' => 5,
        'Apple Pay' => 5
    ];
    $metodo_nombre = $data['metodo'] ?? 'Tarjeta Crédito/Débito';
    $metodo_id = $metodo_map[$metodo_nombre] ?? 1;

    // 3. Insertar Detalle de Orden (Productos y Licencias)
    foreach ($items as $item) {
        $producto_id = intval($item['id']);
        $plataforma_id = 1; // PC por defecto
        $cantidad = intval($item['quantity'] ?? 1);
        $precio_unitario = floatval($item['priceCOP'] ?? 0);
        $subtotal_linea = $precio_unitario * $cantidad;

        // Verificar que el producto exista en MySQL. Si no existe, crearlo automáticamente.
        $chk_p = $mysqli->prepare("SELECT id FROM productos WHERE id = ? LIMIT 1");
        $chk_p->bind_param("i", $producto_id);
        $chk_p->execute();
        $res_p = $chk_p->get_result();

        if ($res_p->num_rows === 0) {
            $titulo_prod = !empty($item['title']) ? $item['title'] : ('Juego 3D #' . $producto_id);
            $slug_prod = 'juego-' . $producto_id . '-' . rand(100, 999);
            $desc_prod = 'Videojuego 3D de alta definición.';
            $img_prod = !empty($item['image']) ? $item['image'] : 'https://images.unsplash.com/photo-1542751371-adc38448a05e';

            $ins_p = $mysqli->prepare("INSERT INTO productos (id, categoria_id, titulo, slug, descripcion, precio_cop, imagen_url) VALUES (?, 1, ?, ?, ?, ?, ?)");
            $ins_p->bind_param("isssds", $producto_id, $titulo_prod, $slug_prod, $desc_prod, $precio_unitario, $img_prod);
            $ins_p->execute();
        }

        // Buscar clave de activación disponible
        $licencia_id = null;
        $lic_stmt = $mysqli->prepare("SELECT id FROM licencias_digitales WHERE producto_id = ? AND estado = 'DISPONIBLE' LIMIT 1");
        $lic_stmt->bind_param("i", $producto_id);
        $lic_stmt->execute();
        $lic_res = $lic_stmt->get_result();

        if ($row_lic = $lic_res->fetch_assoc()) {
            $licencia_id = intval($row_lic['id']);
            $upd_lic = $mysqli->prepare("UPDATE licencias_digitales SET estado = 'ASIGNADA', fecha_asignacion = NOW() WHERE id = ?");
            $upd_lic->bind_param("i", $licencia_id);
            $upd_lic->execute();
        }

        if ($licencia_id !== null) {
            $stmt_det = $mysqli->prepare("INSERT INTO orden_detalles (orden_id, producto_id, plataforma_id, licencia_id, cantidad, precio_unitario_cop, subtotal_cop) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt_det->bind_param("siiiidd", $orden_id, $producto_id, $plataforma_id, $licencia_id, $cantidad, $precio_unitario, $subtotal_linea);
        } else {
            $stmt_det = $mysqli->prepare("INSERT INTO orden_detalles (orden_id, producto_id, plataforma_id, cantidad, precio_unitario_cop, subtotal_cop) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt_det->bind_param("siiidd", $orden_id, $producto_id, $plataforma_id, $cantidad, $precio_unitario, $subtotal_linea);
        }
        $stmt_det->execute();
    }

    // 4. Registrar Transacción de Pago
    $trx_id = 'trx-uuid-' . rand(100000, 999999);
    $ref_pasarela = 'GATEWAY-' . strtoupper(substr(md5(uniqid()), 0, 16));
    $stmt_trx = $mysqli->prepare("INSERT INTO transacciones_pago (id, orden_id, metodo_pago_id, referencia_pasarela, monto, moneda, estado_transaccion, codigo_respuesta, mensaje_respuesta) VALUES (?, ?, ?, ?, ?, 'COP', 'APROBADA', '00_SUCCESS', 'Transacción aprobada instantáneamente')");
    $stmt_trx->bind_param("ssisd", $trx_id, $orden_id, $metodo_id, $ref_pasarela, $total_cop);
    $stmt_trx->execute();

    // 5. Registrar Detalles del Método de Pago
    if ($metodo_id === 1) {
        $num_tarjeta = !empty($tarjeta['numero']) ? preg_replace('/\s+/', '', $tarjeta['numero']) : '4532890123456789';
        $ultimos_cuatro = substr($num_tarjeta, -4);
        if (strlen($ultimos_cuatro) < 4) $ultimos_cuatro = '6789';

        $exp = !empty($tarjeta['exp']) ? explode('/', $tarjeta['exp']) : ['12', '28'];
        $mes_exp = $exp[0] ?? '12';
        $anio_exp = (isset($exp[1]) && strlen($exp[1]) == 2) ? '20' . $exp[1] : ($exp[1] ?? '2028');
        $token = 'tok_sec_' . md5(uniqid());
        $marca = 'VISA';

        $stmt_card = $mysqli->prepare("INSERT INTO detalles_pago_tarjeta (transaccion_id, nombre_titular, marca_tarjeta, ultimos_cuatro, mes_expiracion, anio_expiracion, token_transaccion) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt_card->bind_param("sssssss", $trx_id, $nombre_comprador, $marca, $ultimos_cuatro, $mes_exp, $anio_exp, $token);
        $stmt_card->execute();
    } else {
        $identificador = $metodo_nombre;
        $stmt_alt = $mysqli->prepare("INSERT INTO detalles_pago_alternativo (transaccion_id, proveedor, identificador_cuenta) VALUES (?, ?, ?)");
        $stmt_alt->bind_param("sss", $trx_id, $metodo_nombre, $identificador);
        $stmt_alt->execute();
    }

    // Auditoría
    $stmt_aud = $mysqli->prepare("INSERT INTO auditoria_estados_orden (orden_id, estado_anterior, estado_nuevo, usuario_modificador_id, motivo) VALUES (?, 'PENDIENTE', 'COMPLETADA', ?, 'Compra procesada desde la tienda web')");
    $stmt_aud->bind_param("ss", $orden_id, $usuario_id);
    $stmt_aud->execute();

    $mysqli->commit();

    echo json_encode([
        'success' => true,
        'codigo_referencia' => $codigo_ref,
        'orden_id' => $orden_id,
        'usuario_id' => $usuario_id,
        'cliente' => $nombre_comprador,
        'email' => $email_comprador,
        'total' => $total_cop,
        'message' => 'Venta registrada exitosamente en MySQL'
    ]);

} catch (Exception $e) {
    $mysqli->rollback();
    echo json_encode(['success' => false, 'message' => 'Error al registrar venta: ' . $e->getMessage()]);
}
