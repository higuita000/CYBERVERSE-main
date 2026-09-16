<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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
    if (!empty($_POST)) $data = $_POST;
    else if (!empty($_REQUEST)) $data = $_REQUEST;
}

$nombre = trim($data['nombre_completo'] ?? $data['nombre'] ?? '');
$email = trim(strtolower($data['email'] ?? ''));
$password = $data['password'] ?? '';

if (empty($nombre) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Por favor completa todos los campos (Nombre, Email y Contraseña).']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'El correo electrónico ingresado no es válido.']);
    exit;
}

// Verificar si el correo ya existe
$stmt_check = $mysqli->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
$stmt_check->bind_param("s", $email);
$stmt_check->execute();
$res_check = $stmt_check->get_result();

if ($res_check->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Ya existe una cuenta registrada con este correo electrónico.']);
    exit;
}

// Hash seguro de la contraseña
$pass_hash = password_hash($password, PASSWORD_DEFAULT);
$usuario_id = 'usr-uuid-' . rand(10000, 99999);
$rol = 'CLIENTE';
$estado = 'ACTIVO';

$stmt_ins = $mysqli->prepare("INSERT INTO usuarios (id, nombre_completo, email, password_hash, rol, estado, fecha_registro, ultima_conexion) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())");
$stmt_ins->bind_param("ssssss", $usuario_id, $nombre, $email, $pass_hash, $rol, $estado);

if ($stmt_ins->execute()) {
    echo json_encode([
        'success' => true,
        'message' => '¡Cuenta creada exitosamente! Bienvenido a CyberVerse.',
        'user' => [
            'id' => $usuario_id,
            'nombre_completo' => $nombre,
            'email' => $email,
            'rol' => $rol
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al crear la cuenta en la base de datos.']);
}
