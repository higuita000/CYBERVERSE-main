<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

$usuario_id = $_GET['usuario_id'] ?? $_POST['usuario_id'] ?? '';
$email = $_GET['email'] ?? $_POST['email'] ?? '';

if (empty($usuario_id) && empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Usuario no especificado.']);
    exit;
}

// Consultar compras del usuario
$query = "
    SELECT 
        o.id AS orden_id,
        o.codigo_referencia,
        o.total_cop,
        o.moneda_compra,
        o.estado AS estado_orden,
        o.fecha_creacion,
        p.titulo AS videojuego,
        p.imagen_url,
        od.cantidad,
        od.precio_unitario_cop,
        COALESCE(ld.clave_activacion, 'CLAVE-DIGITAL-ASIGNADA') AS clave_activacion,
        mp.nombre AS metodo_pago
    FROM ordenes o
    JOIN usuarios u ON o.usuario_id = u.id
    JOIN orden_detalles od ON o.id = od.orden_id
    JOIN productos p ON od.producto_id = p.id
    LEFT JOIN licencias_digitales ld ON od.licencia_id = ld.id
    LEFT JOIN transacciones_pago tp ON o.id = tp.orden_id
    LEFT JOIN metodos_pago mp ON tp.metodo_pago_id = mp.id
    WHERE u.id = ? OR u.email = ?
    ORDER BY o.fecha_creacion DESC
";

$stmt = $mysqli->prepare($query);
$stmt->bind_param("ss", $usuario_id, $email);
$stmt->execute();
$res = $stmt->get_result();

$compras = [];
while ($row = $res->fetch_assoc()) {
    $compras[] = $row;
}

echo json_encode([
    'success' => true,
    'total' => count($compras),
    'compras' => $compras
]);
