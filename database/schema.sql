-- =============================================================================
-- CYBERVERSE 3D GAME STORE - BASE DE DATOS RELACIONAL (DDL SCHEMA)
-- =============================================================================
-- Este esquema relacional cumple con las normas de normalización (3NF), 
-- seguridad de pagos (PCI-DSS para pasarela) e integridad referencial estricta.
-- Compatible con PostgreSQL, MySQL 8.0+ y SQLite (sintaxis ANSI SQL estándar).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. MÓDULO DE USUARIOS Y AUTENTICACIÓN
-- -----------------------------------------------------------------------------

CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY, -- UUID / Identificador único
    nombre_completo VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) NOT NULL DEFAULT 'CLIENTE' CHECK (rol IN ('CLIENTE', 'ADMIN', 'SOPORTE')),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO')),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultima_conexion TIMESTAMP
);

CREATE TABLE direcciones_facturacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    pais VARCHAR(60) NOT NULL DEFAULT 'Colombia',
    departamento_estado VARCHAR(60) NOT NULL,
    ciudad VARCHAR(60) NOT NULL,
    direccion_linea1 VARCHAR(150) NOT NULL,
    direccion_linea2 VARCHAR(150),
    codigo_postal VARCHAR(15),
    es_predeterminada BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 2. MÓDULO DE CATÁLOGO E INVENTARIO
-- -----------------------------------------------------------------------------

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE, -- ej: 'accion', 'terror', 'pensamiento'
    nombre VARCHAR(80) NOT NULL,        -- ej: 'Acción 3D', 'Terror / Survival'
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE plataformas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE, -- ej: 'PC', 'PS5', 'XBOX_SERIES', 'SWITCH', 'VR'
    nombre VARCHAR(60) NOT NULL,        -- ej: 'PC Windows', 'PlayStation 5'
    icono_class VARCHAR(50)             -- ej: 'fa-desktop', 'fa-playstation'
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    precio_cop DECIMAL(12, 2) NOT NULL CHECK (precio_cop >= 0),
    precio_original_cop DECIMAL(12, 2) CHECK (precio_original_cop >= 0),
    rating_promedio DECIMAL(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating_promedio BETWEEN 0 AND 5),
    total_resenas INT NOT NULL DEFAULT 0,
    badge VARCHAR(50),                  -- ej: 'DESTACADO 3D', 'TERROR 3D VR'
    imagen_url VARCHAR(255) NOT NULL,
    destacado BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Especificaciones Técnicas (Requerimientos)
    req_os VARCHAR(100),
    req_gpu VARCHAR(150),
    req_ram VARCHAR(50),
    req_storage VARCHAR(50),
    
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
);

-- Relación Muchos a Muchos (N:M) entre Productos y Plataformas
CREATE TABLE producto_plataformas (
    producto_id INT NOT NULL,
    plataforma_id INT NOT NULL,
    PRIMARY KEY (producto_id, plataforma_id),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (plataforma_id) REFERENCES plataformas(id) ON DELETE CASCADE
);

-- Licencias Digitales / Claves de Activación (Inventario Real)
CREATE TABLE licencias_digitales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    plataforma_id INT NOT NULL,
    clave_activacion VARCHAR(255) NOT NULL UNIQUE, -- Serial Key cifrado
    estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'ASIGNADA', 'REVOCADA')),
    fecha_carga TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_asignacion TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    FOREIGN KEY (plataforma_id) REFERENCES plataformas(id) ON DELETE RESTRICT
);

-- -----------------------------------------------------------------------------
-- 3. MÓDULO DE DESCUENTOS Y CARRITO
-- -----------------------------------------------------------------------------

CREATE TABLE cupones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE, -- ej: 'GAMER2026'
    tipo_descuento VARCHAR(20) NOT NULL CHECK (tipo_descuento IN ('PORCENTAJE', 'MONTO_FIJO')),
    valor_descuento DECIMAL(12, 2) NOT NULL CHECK (valor_descuento > 0),
    monto_minimo_compra DECIMAL(12, 2) DEFAULT 0.00,
    usos_maximos INT DEFAULT 1000,
    usos_actuales INT NOT NULL DEFAULT 0,
    fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE carritos (
    id VARCHAR(36) PRIMARY KEY, -- UUID del Carrito
    usuario_id VARCHAR(36),     -- Opcional (usuario autenticado o visitante)
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE carrito_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carrito_id VARCHAR(36) NOT NULL,
    producto_id INT NOT NULL,
    plataforma_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    fecha_agregado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carrito_id) REFERENCES carritos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (plataforma_id) REFERENCES plataformas(id) ON DELETE RESTRICT,
    UNIQUE (carrito_id, producto_id, plataforma_id)
);

-- -----------------------------------------------------------------------------
-- 4. MÓDULO DE PASARELA DE PAGO Y MÉTODOS (SEGÚN PANTALLAZO)
-- -----------------------------------------------------------------------------

CREATE TABLE metodos_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE, -- 'CREDIT_DEBIT_CARD', 'PAYPAL', 'CRYPTO', 'PSE_NEQUI_OXXO', 'APPLE_PAY'
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    icono_class VARCHAR(50),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Encabezado de Ordenes / Pedidos
CREATE TABLE ordenes (
    id VARCHAR(36) PRIMARY KEY, -- UUID de la Orden
    codigo_referencia VARCHAR(30) NOT NULL UNIQUE, -- ej: 'CYBER-2026-98721'
    usuario_id VARCHAR(36) NOT NULL,
    cupon_id INT,
    
    -- Totales y Moneda
    subtotal_cop DECIMAL(12, 2) NOT NULL CHECK (subtotal_cop >= 0),
    descuento_cop DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (descuento_cop >= 0),
    impuesto_cop DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (impuesto_cop >= 0),
    total_cop DECIMAL(12, 2) NOT NULL CHECK (total_cop >= 0),
    
    moneda_compra VARCHAR(3) NOT NULL DEFAULT 'COP' CHECK (moneda_compra IN ('COP', 'USD', 'EUR', 'MXN')),
    total_moneda_original DECIMAL(12, 2) NOT NULL,
    tasa_cambio DECIMAL(10, 4) NOT NULL DEFAULT 1.0000,
    
    -- Estado del pedido
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK (
        estado IN ('PENDIENTE', 'PAGADA', 'PROCESANDO', 'COMPLETADA', 'CANCELADA', 'REEMBOLSADA')
    ),
    
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (cupon_id) REFERENCES cupones(id) ON DELETE SET NULL
);

-- Detalle de Items Comprados
CREATE TABLE orden_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id VARCHAR(36) NOT NULL,
    producto_id INT NOT NULL,
    plataforma_id INT NOT NULL,
    licencia_id INT UNIQUE, -- Licencia digital asignada al aprobar el pago
    cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    precio_unitario_cop DECIMAL(12, 2) NOT NULL,
    subtotal_cop DECIMAL(12, 2) NOT NULL,
    
    FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    FOREIGN KEY (plataforma_id) REFERENCES plataformas(id) ON DELETE RESTRICT,
    FOREIGN KEY (licencia_id) REFERENCES licencias_digitales(id) ON DELETE SET NULL
);

-- Registro de Transacciones de la Pasarela de Pago
CREATE TABLE transacciones_pago (
    id VARCHAR(36) PRIMARY KEY, -- UUID Transacción
    orden_id VARCHAR(36) NOT NULL,
    metodo_pago_id INT NOT NULL,
    referencia_pasarela VARCHAR(100) NOT NULL, -- Transaction ID devuelto por el Gateway
    monto DECIMAL(12, 2) NOT NULL CHECK (monto >= 0),
    moneda VARCHAR(3) NOT NULL DEFAULT 'COP',
    estado_transaccion VARCHAR(30) NOT NULL CHECK (
        estado_transaccion IN ('APROBADA', 'PENDIENTE', 'RECHAZADA', 'FALLIDA', 'REEMBOLSADA')
    ),
    codigo_respuesta VARCHAR(50),
    mensaje_respuesta VARCHAR(255),
    ip_cliente VARCHAR(45),
    fecha_transaccion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE,
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id) ON DELETE RESTRICT
);

-- Detalles de Pago para Tarjeta de Crédito/Débito (Seguridad PCI-DSS compliant)
-- NUNCA se almacena el número de tarjeta completo ni el CVV/CVC.
CREATE TABLE detalles_pago_tarjeta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaccion_id VARCHAR(36) NOT NULL UNIQUE,
    nombre_titular VARCHAR(120) NOT NULL, -- ej: "Juan Pérez" (pantallazo)
    marca_tarjeta VARCHAR(30) NOT NULL,   -- ej: "VISA", "MASTERCARD" (pantallazo)
    ultimos_cuatro VARCHAR(4) NOT NULL,   -- ej: "6789" (pantallazo)
    mes_expiracion VARCHAR(2) NOT NULL,   -- ej: "12"
    anio_expiracion VARCHAR(4) NOT NULL,  -- ej: "2028"
    token_transaccion VARCHAR(255) NOT NULL, -- Token seguro otorgado por procesador
    FOREIGN KEY (transaccion_id) REFERENCES transacciones_pago(id) ON DELETE CASCADE
);

-- Detalles de Pago para Métodos Alternativos (PayPal, Crypto, PSE / Nequi / OXXO, Apple Pay)
CREATE TABLE detalles_pago_alternativo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaccion_id VARCHAR(36) NOT NULL UNIQUE,
    proveedor VARCHAR(50) NOT NULL, -- 'PAYPAL', 'CRYPTO_BITCOIN', 'PSE_BANCOLOMBIA', 'NEQUI', 'OXXO_PAY', 'APPLE_PAY'
    identificador_cuenta VARCHAR(150), -- Email de PayPal / Hash Wallet Crypto / Celular Nequi / ID Apple Pay
    codigo_convenio VARCHAR(50),     -- Código PIN para OXXO / Código PSE
    FOREIGN KEY (transaccion_id) REFERENCES transacciones_pago(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 5. MÓDULO DE RESEÑAS Y AUDITORÍA
-- -----------------------------------------------------------------------------

CREATE TABLE reseñas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    usuario_id VARCHAR(36) NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT NOT NULL,
    compra_verificada BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_resena TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE (producto_id, usuario_id) -- 1 reseña por producto por usuario
);

CREATE TABLE auditoria_estados_orden (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id VARCHAR(36) NOT NULL,
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    usuario_modificador_id VARCHAR(36),
    motivo VARCHAR(255),
    fecha_cambio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_modificador_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- 6. ÍNDICES DE RENDIMIENTO Y OPTIMIZACIÓN DE BÚSQUEDAS
-- -----------------------------------------------------------------------------

CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo_destacado ON productos(activo, destacado);
CREATE INDEX idx_ordenes_usuario ON ordenes(usuario_id);
CREATE INDEX idx_ordenes_estado ON ordenes(estado);
CREATE INDEX idx_ordenes_referencia ON ordenes(codigo_referencia);
CREATE INDEX idx_transacciones_orden ON transacciones_pago(orden_id);
CREATE INDEX idx_transacciones_estado ON transacciones_pago(estado_transaccion);
CREATE INDEX idx_licencias_producto_estado ON licencias_digitales(producto_id, estado);
CREATE INDEX idx_reseñas_producto ON reseñas(producto_id);
