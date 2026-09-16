-- =============================================================================
-- CYBERVERSE 3D GAMING STORE - BASE DE DATOS RELACIONAL EN MYSQL (8.0+)
-- =============================================================================
-- Script 100% optimizado para MySQL / MariaDB (InnoDB, UTF8MB4, 3NF)
-- Incluye la creación de la BD, Tablas, Restricciones, Índices, Vistas, 
-- Procedimientos Almacenados y Datos Iniciales (Seed Data).
-- =============================================================================

DROP DATABASE IF EXISTS `cyberverse_db`;
CREATE DATABASE `cyberverse_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cyberverse_db`;

-- -----------------------------------------------------------------------------
-- 1. MÓDULO DE USUARIOS Y AUTENTICACIÓN
-- -----------------------------------------------------------------------------

CREATE TABLE `usuarios` (
    `id` VARCHAR(36) NOT NULL,
    `nombre_completo` VARCHAR(120) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(20) DEFAULT NULL,
    `rol` ENUM('CLIENTE', 'ADMIN', 'SOPORTE') NOT NULL DEFAULT 'CLIENTE',
    `estado` ENUM('ACTIVO', 'INACTIVO', 'SUSPENDIDO') NOT NULL DEFAULT 'ACTIVO',
    `fecha_registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ultima_conexion` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_usuarios_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `direcciones_facturacion` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `usuario_id` VARCHAR(36) NOT NULL,
    `pais` VARCHAR(60) NOT NULL DEFAULT 'Colombia',
    `departamento_estado` VARCHAR(60) NOT NULL,
    `ciudad` VARCHAR(60) NOT NULL,
    `direccion_linea1` VARCHAR(150) NOT NULL,
    `direccion_linea2` VARCHAR(150) DEFAULT NULL,
    `codigo_postal` VARCHAR(15) DEFAULT NULL,
    `es_predeterminada` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_direcciones_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. MÓDULO DE CATÁLOGO E INVENTARIO
-- -----------------------------------------------------------------------------

CREATE TABLE `categorias` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `codigo` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `descripcion` TEXT DEFAULT NULL,
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_categorias_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `plataformas` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `codigo` VARCHAR(30) NOT NULL,
    `nombre` VARCHAR(60) NOT NULL,
    `icono_class` VARCHAR(50) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_plataformas_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `productos` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `categoria_id` INT NOT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(160) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `precio_cop` DECIMAL(12, 2) NOT NULL,
    `precio_original_cop` DECIMAL(12, 2) DEFAULT NULL,
    `rating_promedio` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
    `total_resenas` INT NOT NULL DEFAULT 0,
    `badge` VARCHAR(50) DEFAULT NULL,
    `imagen_url` VARCHAR(255) NOT NULL,
    `destacado` TINYINT(1) NOT NULL DEFAULT 0,
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    `req_os` VARCHAR(100) DEFAULT NULL,
    `req_gpu` VARCHAR(150) DEFAULT NULL,
    `req_ram` VARCHAR(50) DEFAULT NULL,
    `req_storage` VARCHAR(50) DEFAULT NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_productos_slug` (`slug`),
    KEY `idx_productos_categoria` (`categoria_id`),
    KEY `idx_productos_activo_destacado` (`activo`, `destacado`),
    CONSTRAINT `fk_productos_categorias` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `chk_precio_positivo` CHECK (`precio_cop` >= 0),
    CONSTRAINT `chk_rating_rango` CHECK (`rating_promedio` BETWEEN 0 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relación N:M Productos y Plataformas
CREATE TABLE `producto_plataformas` (
    `producto_id` INT NOT NULL,
    `plataforma_id` INT NOT NULL,
    PRIMARY KEY (`producto_id`, `plataforma_id`),
    CONSTRAINT `fk_pp_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_pp_plataforma` FOREIGN KEY (`plataforma_id`) REFERENCES `plataformas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Licencias Digitales / Claves de Activación
CREATE TABLE `licencias_digitales` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `producto_id` INT NOT NULL,
    `plataforma_id` INT NOT NULL,
    `clave_activacion` VARCHAR(255) NOT NULL,
    `estado` ENUM('DISPONIBLE', 'ASIGNADA', 'REVOCADA') NOT NULL DEFAULT 'DISPONIBLE',
    `fecha_carga` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_asignacion` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_licencias_clave` (`clave_activacion`),
    KEY `idx_licencias_producto_estado` (`producto_id`, `estado`),
    CONSTRAINT `fk_licencias_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_licencias_plataforma` FOREIGN KEY (`plataforma_id`) REFERENCES `plataformas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. MÓDULO DE DESCUENTOS Y CARRITO
-- -----------------------------------------------------------------------------

CREATE TABLE `cupones` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `codigo` VARCHAR(30) NOT NULL,
    `tipo_descuento` ENUM('PORCENTAJE', 'MONTO_FIJO') NOT NULL,
    `valor_descuento` DECIMAL(12, 2) NOT NULL,
    `monto_minimo_compra` DECIMAL(12, 2) DEFAULT 0.00,
    `usos_maximos` INT DEFAULT 1000,
    `usos_actuales` INT NOT NULL DEFAULT 0,
    `fecha_inicio` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_expiracion` DATETIME NOT NULL,
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_cupones_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `carritos` (
    `id` VARCHAR(36) NOT NULL,
    `usuario_id` VARCHAR(36) DEFAULT NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_carritos_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `carrito_items` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `carrito_id` VARCHAR(36) NOT NULL,
    `producto_id` INT NOT NULL,
    `plataforma_id` INT NOT NULL,
    `cantidad` INT NOT NULL DEFAULT 1,
    `fecha_agregado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_carrito_producto_plataforma` (`carrito_id`, `producto_id`, `plataforma_id`),
    CONSTRAINT `fk_ci_carrito` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_ci_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_ci_plataforma` FOREIGN KEY (`plataforma_id`) REFERENCES `plataformas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `chk_ci_cantidad` CHECK (`cantidad` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. MÓDULO DE PASARELA DE PAGO Y MÉTODOS (SEGÚN PANTALLAZO)
-- -----------------------------------------------------------------------------

CREATE TABLE `metodos_pago` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `codigo` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) DEFAULT NULL,
    `icono_class` VARCHAR(50) DEFAULT NULL,
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_metodos_pago_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ordenes` (
    `id` VARCHAR(36) NOT NULL,
    `codigo_referencia` VARCHAR(30) NOT NULL,
    `usuario_id` VARCHAR(36) NOT NULL,
    `cupon_id` INT DEFAULT NULL,
    `subtotal_cop` DECIMAL(12, 2) NOT NULL,
    `descuento_cop` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `impuesto_cop` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_cop` DECIMAL(12, 2) NOT NULL,
    `moneda_compra` ENUM('COP', 'USD', 'EUR', 'MXN') NOT NULL DEFAULT 'COP',
    `total_moneda_original` DECIMAL(12, 2) NOT NULL,
    `tasa_cambio` DECIMAL(10, 4) NOT NULL DEFAULT 1.0000,
    `estado` ENUM('PENDIENTE', 'PAGADA', 'PROCESANDO', 'COMPLETADA', 'CANCELADA', 'REEMBOLSADA') NOT NULL DEFAULT 'PENDIENTE',
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ordenes_codigo_referencia` (`codigo_referencia`),
    KEY `idx_ordenes_usuario` (`usuario_id`),
    KEY `idx_ordenes_estado` (`estado`),
    CONSTRAINT `fk_ordenes_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_ordenes_cupones` FOREIGN KEY (`cupon_id`) REFERENCES `cupones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orden_detalles` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `orden_id` VARCHAR(36) NOT NULL,
    `producto_id` INT NOT NULL,
    `plataforma_id` INT NOT NULL,
    `licencia_id` INT DEFAULT NULL,
    `cantidad` INT NOT NULL DEFAULT 1,
    `precio_unitario_cop` DECIMAL(12, 2) NOT NULL,
    `subtotal_cop` DECIMAL(12, 2) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_od_licencia` (`licencia_id`),
    KEY `idx_od_orden` (`orden_id`),
    CONSTRAINT `fk_od_orden` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_od_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_od_plataforma` FOREIGN KEY (`plataforma_id`) REFERENCES `plataformas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_od_licencia` FOREIGN KEY (`licencia_id`) REFERENCES `licencias_digitales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `chk_od_cantidad` CHECK (`cantidad` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `transacciones_pago` (
    `id` VARCHAR(36) NOT NULL,
    `orden_id` VARCHAR(36) NOT NULL,
    `metodo_pago_id` INT NOT NULL,
    `referencia_pasarela` VARCHAR(100) NOT NULL,
    `monto` DECIMAL(12, 2) NOT NULL,
    `moneda` VARCHAR(3) NOT NULL DEFAULT 'COP',
    `estado_transaccion` ENUM('APROBADA', 'PENDIENTE', 'RECHAZADA', 'FALLIDA', 'REEMBOLSADA') NOT NULL,
    `codigo_respuesta` VARCHAR(50) DEFAULT NULL,
    `mensaje_respuesta` VARCHAR(255) DEFAULT NULL,
    `ip_cliente` VARCHAR(45) DEFAULT NULL,
    `fecha_transaccion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_tp_orden` (`orden_id`),
    KEY `idx_tp_estado` (`estado_transaccion`),
    CONSTRAINT `fk_tp_orden` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_tp_metodo` FOREIGN KEY (`metodo_pago_id`) REFERENCES `metodos_pago` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tarjeta de Crédito PCI-DSS Compliant (VISA **** 6789 / Juan Pérez)
CREATE TABLE `detalles_pago_tarjeta` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `transaccion_id` VARCHAR(36) NOT NULL,
    `nombre_titular` VARCHAR(120) NOT NULL,
    `marca_tarjeta` VARCHAR(30) NOT NULL,
    `ultimos_cuatro` VARCHAR(4) NOT NULL,
    `mes_expiracion` VARCHAR(2) NOT NULL,
    `anio_expiracion` VARCHAR(4) NOT NULL,
    `token_transaccion` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_dpt_transaccion` (`transaccion_id`),
    CONSTRAINT `fk_dpt_transaccion` FOREIGN KEY (`transaccion_id`) REFERENCES `transacciones_pago` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `detalles_pago_alternativo` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `transaccion_id` VARCHAR(36) NOT NULL,
    `proveedor` VARCHAR(50) NOT NULL,
    `identificador_cuenta` VARCHAR(150) DEFAULT NULL,
    `codigo_convenio` VARCHAR(50) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_dpa_transaccion` (`transaccion_id`),
    CONSTRAINT `fk_dpa_transaccion` FOREIGN KEY (`transaccion_id`) REFERENCES `transacciones_pago` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. MÓDULO DE RESEÑAS Y AUDITORÍA
-- -----------------------------------------------------------------------------

CREATE TABLE `reseñas` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `producto_id` INT NOT NULL,
    `usuario_id` VARCHAR(36) NOT NULL,
    `calificacion` INT NOT NULL,
    `comentario` TEXT NOT NULL,
    `compra_verificada` TINYINT(1) NOT NULL DEFAULT 1,
    `fecha_resena` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_resenas_producto_usuario` (`producto_id`, `usuario_id`),
    CONSTRAINT `fk_resenas_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_resenas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `chk_resenas_calificacion` CHECK (`calificacion` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `auditoria_estados_orden` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `orden_id` VARCHAR(36) NOT NULL,
    `estado_anterior` VARCHAR(30) DEFAULT NULL,
    `estado_nuevo` VARCHAR(30) NOT NULL,
    `usuario_modificador_id` VARCHAR(36) DEFAULT NULL,
    `motivo` VARCHAR(255) DEFAULT NULL,
    `fecha_cambio` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_aeo_orden` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_aeo_usuario` FOREIGN KEY (`usuario_modificador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. DATOS DE PRUEBA (SEED DATA PARA MYSQL)
-- -----------------------------------------------------------------------------

INSERT INTO `usuarios` (`id`, `nombre_completo`, `email`, `password_hash`, `telefono`, `rol`, `estado`) VALUES
('usr-uuid-0001', 'Juan Pérez', 'juan.perez@cyberverse.com', '$2b$12$eImiTXuWVxfM37uY4JANjO...hash', '+57 300 123 4567', 'CLIENTE', 'ACTIVO'),
('usr-uuid-0002', 'Alex CyberGamer', 'alex.gamer@cyberverse.com', '$2b$12$eImiTXuWVxfM37uY4JANjO...hash', '+57 311 987 6543', 'CLIENTE', 'ACTIVO'),
('usr-uuid-0003', 'Valeria VR', 'valeria.vr@cyberverse.com', '$2b$12$eImiTXuWVxfM37uY4JANjO...hash', '+57 320 555 1212', 'CLIENTE', 'ACTIVO'),
('usr-uuid-0000', 'Admin CyberVerse', 'admin@cyberverse.com', '$2b$12$eImiTXuWVxfM37uY4JANjO...hash', '+57 300 000 0000', 'ADMIN', 'ACTIVO');

INSERT INTO `categorias` (`id`, `codigo`, `nombre`, `descripcion`) VALUES
(1, 'accion', 'Acción 3D', 'Juegos de alta velocidad, combate neón y batallas futuristas en 3D.'),
(2, 'terror', 'Terror / Survival 3D VR', 'Experiencias de inmersión total en 3D y realidad virtual que pondrán a prueba tus nervios.'),
(3, 'pensamiento', 'Pensamiento / Puzzles 3D', 'Desafíos de lógica tridimensional, portales espaciales y físicas gravitacionales.'),
(4, 'aventura', 'Aventura / RPG 3D', 'Exploración de mundos abiertos masivos con narrativas envolventes.');

INSERT INTO `plataformas` (`id`, `codigo`, `nombre`, `icono_class`) VALUES
(1, 'PC', 'PC Windows', 'fa-desktop'),
(2, 'PS5', 'PlayStation 5', 'fa-playstation'),
(3, 'XBOX_SERIES', 'Xbox Series X/S', 'fa-xbox'),
(4, 'SWITCH', 'Nintendo Switch', 'fa-gamepad'),
(5, 'VR', 'Realidad Virtual (VR)', 'fa-vr-cardboard');

INSERT INTO `productos` (`id`, `categoria_id`, `titulo`, `slug`, `descripcion`, `precio_cop`, `precio_original_cop`, `rating_promedio`, `total_resenas`, `badge`, `imagen_url`, `destacado`, `req_os`, `req_gpu`, `req_ram`, `req_storage`) VALUES
(1, 1, 'Cyberpunk 2088: Neon Genesis', 'cyberpunk-2088-neon-genesis', 'Sumérgete en la ciudad neón de Neo-Verdia. Un RPG de acción y combate en 3D hiperrealista con trazado de rayos (Ray Tracing) y gráficos de última generación.', 240000.00, 320000.00, 4.90, 1420, 'DESTACADO 3D', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', 1, 'Windows 11 64-bit', 'Nvidia RTX 4070 / AMD RX 7800 XT', '16 GB RAM', '85 GB SSD'),
(2, 2, 'Silent Abyss: Nightmare Entity', 'silent-abyss-nightmare-entity', 'Una experiencia de terror psicológico en 3D en las profundidades de un hospital psiquiátrico abandonado en la Antártida. Compatible con VR para inmersión total.', 180000.00, 200000.00, 4.80, 890, 'TERROR 3D VR', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', 1, 'Windows 10/11', 'Nvidia RTX 3060', '16 GB RAM', '45 GB SSD'),
(3, 3, 'Quantum Enigma: Mind Matrix', 'quantum-enigma-mind-matrix', 'Desafía las leyes de la física y la lógica con acertijos espaciales 3D, manipulación del tiempo y portales tridimensionales que pondrán a prueba tu intelecto.', 120000.00, 160000.00, 4.95, 650, 'MEJOR PUZZLE GOTY', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', 0, 'Windows 10/11', 'GTX 1660 Super', '8 GB RAM', '25 GB SSD'),
(4, 1, 'Neon Overdrive: Cyber Drift', 'neon-overdrive-cyber-drift', 'Velocidad vertiginosa en pistas 3D suspendidas sobre rascacielos futuristas. Personaliza tu bólido antigravedad con luces neón y siente la adrenalina pura.', 150000.00, 190000.00, 4.75, 530, 'CARRERAS 3D', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', 0, 'Windows 10/11', 'Nvidia RTX 3070', '16 GB RAM', '35 GB SSD'),
(5, 1, 'Apex Warzone: 3D Protocol', 'apex-warzone-3d-protocol', 'Shooter táctico multijugador en arenas tridimensionales con gravedad cero. Compite en torneos eSports mundiales con físicas hiperrealistas.', 210000.00, 250000.00, 4.88, 2100, 'ESPORTS 3D', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80', 1, 'Windows 11', 'Nvidia RTX 4080', '32 GB RAM', '60 GB SSD'),
(6, 4, 'Chrono Sentinel: Time Odyssey', 'chrono-sentinel-time-odyssey', 'Viaja a través de diferentes eras del tiempo en una épica aventura de rol 3D. Cambia el pasado para alterar el futuro en tiempo real.', 260000.00, 300000.00, 4.92, 780, 'RPG ESPACIAL 3D', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', 0, 'Windows 10/11', 'Nvidia RTX 4060', '16 GB RAM', '90 GB SSD');

INSERT INTO `producto_plataformas` (`producto_id`, `plataforma_id`) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 5),
(3, 1), (3, 4),
(4, 1), (4, 2), (4, 3),
(5, 1), (5, 2), (5, 3),
(6, 1), (6, 2), (6, 3), (6, 4);

INSERT INTO `licencias_digitales` (`id`, `producto_id`, `plataforma_id`, `clave_activacion`, `estado`) VALUES
(101, 2, 1, 'SILENT-ABYSS-VR-KEY-9988-7766', 'DISPONIBLE'),
(102, 2, 1, 'SILENT-ABYSS-VR-KEY-1122-3344', 'DISPONIBLE'),
(103, 1, 1, 'CYBER-2088-KEY-AAAA-BBBB', 'DISPONIBLE'),
(104, 1, 2, 'CYBER-2088-PS5-CCCC-DDDD', 'DISPONIBLE'),
(105, 3, 4, 'QUANTUM-SWITCH-KEY-5566-7788', 'DISPONIBLE');

INSERT INTO `cupones` (`id`, `codigo`, `tipo_descuento`, `valor_descuento`, `monto_minimo_compra`, `usos_maximos`, `usos_actuales`, `fecha_inicio`, `fecha_expiracion`, `activo`) VALUES
(1, 'GAMER2026', 'PORCENTAJE', 10.00, 100000.00, 1000, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1),
(2, 'CYBER50', 'MONTO_FIJO', 50000.00, 200000.00, 500, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1);

INSERT INTO `metodos_pago` (`id`, `codigo`, `nombre`, `descripcion`, `icono_class`, `activo`) VALUES
(1, 'CREDIT_DEBIT_CARD', 'Tarjeta Crédito/Débito', 'Pago seguro instantáneo con VISA, MasterCard o American Express', 'fa-credit-card', 1),
(2, 'PAYPAL', 'PayPal', 'Pago global seguro con tu cuenta de PayPal', 'fa-paypal', 1),
(3, 'CRYPTO', 'Criptomonedas', 'Pago descentralizado con Bitcoin (BTC), Ethereum (ETH) o USDT', 'fa-bitcoin', 1),
(4, 'PSE_NEQUI_OXXO', 'PSE / Nequi / OXXO / Efectivo', 'Transferencia bancaria PSE, billetera Nequi o pago en efectivo OXXO', 'fa-money-bill-transfer', 1),
(5, 'APPLE_PAY', 'Apple Pay', 'Pago biométrico rápido en dispositivos Apple', 'fa-apple', 1);

-- LAS VENTAS Y TRANSACCIONES QUEDAN LIMPIAS (0 REGISTROS)
-- SOLO SE MOSTRARÁN LAS COMPRAS REALES QUE HAGA EL USUARIO DESDE LA TIENDA WEB.

-- -----------------------------------------------------------------------------
-- 7. VISTAS SQL PARA REPORTES Y DASHBOARD EN MYSQL
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW `vw_resumen_ventas_metodo_pago` AS
SELECT 
    mp.nombre AS metodo_pago,
    COUNT(tp.id) AS total_transacciones,
    SUM(tp.monto) AS total_recaudado_cop
FROM `metodos_pago` mp
JOIN `transacciones_pago` tp ON mp.id = tp.metodo_pago_id
WHERE tp.estado_transaccion = 'APROBADA'
GROUP BY mp.id, mp.nombre;

CREATE OR REPLACE VIEW `vw_detalle_ordenes_completas` AS
SELECT 
    o.codigo_referencia,
    u.nombre_completo AS cliente,
    u.email,
    p.titulo AS videojuego,
    plat.nombre AS plataforma,
    od.precio_unitario_cop,
    ld.clave_activacion AS licencia_entregada,
    mp.nombre AS metodo_pago,
    dpt.marca_tarjeta,
    dpt.ultimos_cuatro,
    o.estado AS estado_orden,
    o.fecha_creacion
FROM `ordenes` o
JOIN `usuarios` u ON o.usuario_id = u.id
JOIN `orden_detalles` od ON o.id = od.orden_id
JOIN `productos` p ON od.producto_id = p.id
JOIN `plataformas` plat ON od.plataforma_id = plat.id
LEFT JOIN `licencias_digitales` ld ON od.licencia_id = ld.id
JOIN `transacciones_pago` tp ON o.id = tp.orden_id
JOIN `metodos_pago` mp ON tp.metodo_pago_id = mp.id
LEFT JOIN `detalles_pago_tarjeta` dpt ON tp.id = dpt.transaccion_id;
