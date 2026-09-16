<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

$query = "
    SELECT 
        sl.id,
        COALESCE(u.nombre_completo, 'Usuario no registrado') AS usuario,
        sl.email_ingresado,
        sl.ip_cliente,
        sl.resultado,
        sl.mensaje,
        sl.fecha_intento
    FROM sesiones_log sl
    LEFT JOIN usuarios u ON sl.usuario_id = u.id
    ORDER BY sl.fecha_intento DESC
    LIMIT 50
";

$res = $mysqli->query($query);
$logs = [];
while ($row = $res->fetch_assoc()) {
    $logs[] = $row;
}

echo json_encode([
    'success' => true,
    'total' => count($logs),
    'logs' => $logs
]);
