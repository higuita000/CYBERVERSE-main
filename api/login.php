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

$email = trim(strtolower($data['email'] ?? ''));
$password = $data['password'] ?? '';
$ip_cliente = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Por favor ingresa tu correo y contraseña.']);
    exit;
}

// Buscar usuario en la base de datos
$stmt = $mysqli->prepare("SELECT id, nombre_completo, email, password_hash, rol, estado FROM usuarios WHERE email = ? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    // Registrar intento fallido (Usuario No Encontrado)
    $log_stmt = $mysqli->prepare("INSERT INTO sesiones_log (usuario_id, email_ingresado, ip_cliente, resultado, mensaje) VALUES (NULL, ?, ?, 'USUARIO_NO_ENCONTRADO', 'El correo ingresado no existe')");
    $log_stmt->bind_param("ss", $email, $ip_cliente);
    $log_stmt->execute();

    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No existe ninguna cuenta registrada con este correo electrónico.']);
    exit;
}

$usuario = $res->fetch_assoc();

if ($usuario['estado'] !== 'ACTIVO') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Esta cuenta se encuentra suspendida o inactiva.']);
    exit;
}

// Verificar la contraseña ingresada contra el hash seguro almacenado
if (!password_verify($password, $usuario['password_hash'])) {
    // Registrar intento fallido (Contraseña Incorrecta) en sesiones_log
    $log_stmt = $mysqli->prepare("INSERT INTO sesiones_log (usuario_id, email_ingresado, ip_cliente, resultado, mensaje) VALUES (?, ?, ?, 'CONTRASENA_INCORRECTA', 'Contraseña incorrecta ingresada')");
    $log_stmt->bind_param("sss", $usuario['id'], $email, $ip_cliente);
    $log_stmt->execute();

    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta. Por favor inténtalo de nuevo.']);
    exit;
}

// Login Exitoso: Actualizar última conexión y guardar log
$upd_stmt = $mysqli->prepare("UPDATE usuarios SET ultima_conexion = NOW() WHERE id = ?");
$upd_stmt->bind_param("s", $usuario['id']);
$upd_stmt->execute();

$log_stmt = $mysqli->prepare("INSERT INTO sesiones_log (usuario_id, email_ingresado, ip_cliente, resultado, mensaje) VALUES (?, ?, ?, 'EXITOSO', 'Inicio de sesión exitoso')");
$log_stmt->bind_param("sss", $usuario['id'], $email, $ip_cliente);
$log_stmt->execute();

echo json_encode([
    'success' => true,
    'message' => '¡Inicio de sesión exitoso! Bienvenido de nuevo, ' . $usuario['nombre_completo'] . '.',
    'user' => [
        'id' => $usuario['id'],
        'nombre_completo' => $usuario['nombre_completo'],
        'email' => $usuario['email'],
        'rol' => $usuario['rol']
    ]
]);
