-- =============================================================================
-- CYBERVERSE 3D GAME STORE - SEED DATA (DATOS INICIALES DE PRUEBA)
-- =============================================================================

-- 1. USUARIOS
INSERT INTO usuarios (id, nombre_completo, email, password_hash, telefono, rol, estado) VALUES
('usr-uuid-0001', 'Juan Pérez', 'juan.perez@cyberverse.com', '$2b$12$eImiTXuWVxfM37uY4JANjO...hash', '+57 300 123 4567', 'CLIENTE', 'ACTIVO'),
('usr-uuid-0002', 'Alex CyberGamer', 'alex.gamer@cyberverse.com', '$2b$12$eImiTXuWVxfM37uY4JANjO...hash', '+57 311 987 6543', 'CLIENTE', 'ACTIVO'),
('usr-uuid-0003', 'Valeria VR', 'valeria.vr@cyberverse.com', '$2b$12$eImiTXuWVxfM37uY4JANjO...hash', '+57 320 555 1212', 'CLIENTE', 'ACTIVO'),
('usr-uuid-0000', 'Admin CyberVerse', 'admin@cyberverse.com', '$2b$12$eImiTXuWVxfM37uY4JANjO...hash', '+57 300 000 0000', 'ADMIN', 'ACTIVO');

-- 2. CATEGORÍAS (GÉNEROS)
INSERT INTO categorias (id, codigo, nombre, descripcion) VALUES
(1, 'accion', 'Acción 3D', 'Juegos de alta velocidad, combate neón y batallas futuristas en 3D.'),
(2, 'terror', 'Terror / Survival 3D VR', 'Experiencias de inmersión total en 3D y realidad virtual que pondrán a prueba tus nervios.'),
(3, 'pensamiento', 'Pensamiento / Puzzles 3D', 'Desafíos de lógica tridimensional, portales espaciales y físicas gravitacionales.'),
(4, 'aventura', 'Aventura / RPG 3D', 'Exploración de mundos abiertos masivos con narrativas envolventes.');

-- 3. PLATAFORMAS
INSERT INTO plataformas (id, codigo, nombre, icono_class) VALUES
(1, 'PC', 'PC Windows', 'fa-desktop'),
(2, 'PS5', 'PlayStation 5', 'fa-playstation'),
(3, 'XBOX_SERIES', 'Xbox Series X/S', 'fa-xbox'),
(4, 'SWITCH', 'Nintendo Switch', 'fa-gamepad'),
(5, 'VR', 'Realidad Virtual (VR)', 'fa-vr-cardboard');

-- 4. PRODUCTOS (JUEGOS CATÁLOGO 3D)
INSERT INTO productos (id, categoria_id, titulo, slug, descripcion, precio_cop, precio_original_cop, rating_promedio, total_resenas, badge, imagen_url, destacado, req_os, req_gpu, req_ram, req_storage) VALUES
(1, 1, 'Cyberpunk 2088: Neon Genesis', 'cyberpunk-2088-neon-genesis', 'Sumérgete en la ciudad neón de Neo-Verdia. Un RPG de acción y combate en 3D hiperrealista con trazado de rayos (Ray Tracing) y gráficos de última generación.', 240000.00, 320000.00, 4.90, 1420, 'DESTACADO 3D', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', TRUE, 'Windows 11 64-bit', 'Nvidia RTX 4070 / AMD RX 7800 XT', '16 GB RAM', '85 GB SSD'),

(2, 2, 'Silent Abyss: Nightmare Entity', 'silent-abyss-nightmare-entity', 'Una experiencia de terror psicológico en 3D en las profundidades de un hospital psiquiátrico abandonado en la Antártida. Compatible con VR para inmersión total.', 180000.00, 200000.00, 4.80, 890, 'TERROR 3D VR', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', TRUE, 'Windows 10/11', 'Nvidia RTX 3060', '16 GB RAM', '45 GB SSD'),

(3, 3, 'Quantum Enigma: Mind Matrix', 'quantum-enigma-mind-matrix', 'Desafía las leyes de la física y la lógica con acertijos espaciales 3D, manipulación del tiempo y portales tridimensionales que pondrán a prueba tu intelecto.', 120000.00, 160000.00, 4.95, 650, 'MEJOR PUZZLE GOTY', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', FALSE, 'Windows 10/11', 'GTX 1660 Super', '8 GB RAM', '25 GB SSD'),

(4, 1, 'Neon Overdrive: Cyber Drift', 'neon-overdrive-cyber-drift', 'Velocidad vertiginosa en pistas 3D suspendidas sobre rascacielos futuristas. Personaliza tu bólido antigravedad con luces neón y siente la adrenalina pura.', 150000.00, 190000.00, 4.75, 530, 'CARRERAS 3D', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', FALSE, 'Windows 10/11', 'Nvidia RTX 3070', '16 GB RAM', '35 GB SSD'),

(5, 1, 'Apex Warzone: 3D Protocol', 'apex-warzone-3d-protocol', 'Shooter táctico multijugador en arenas tridimensionales con gravedad cero. Compite en torneos eSports mundiales con físicas hiperrealistas.', 210000.00, 250000.00, 4.88, 2100, 'ESPORTS 3D', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80', TRUE, 'Windows 11', 'Nvidia RTX 4080', '32 GB RAM', '60 GB SSD'),

(6, 4, 'Chrono Sentinel: Time Odyssey', 'chrono-sentinel-time-odyssey', 'Viaja a través de diferentes eras del tiempo en una épica aventura de rol 3D. Cambia el pasado para alterar el futuro en tiempo real.', 260000.00, 300000.00, 4.92, 780, 'RPG ESPACIAL 3D', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', FALSE, 'Windows 10/11', 'Nvidia RTX 4060', '16 GB RAM', '90 GB SSD');

-- 5. RELACIÓN PRODUCTO - PLATAFORMAS (N:M)
INSERT INTO producto_plataformas (producto_id, plataforma_id) VALUES
(1, 1), (1, 2), (1, 3), -- Cyberpunk: PC, PS5, Xbox
(2, 1), (2, 2), (2, 5), -- Silent Abyss: PC, PS5, VR
(3, 1), (3, 4),         -- Quantum Enigma: PC, Switch
(4, 1), (4, 2), (4, 3), -- Neon Overdrive: PC, PS5, Xbox
(5, 1), (5, 2), (5, 3), -- Apex Warzone: PC, PS5, Xbox
(6, 1), (6, 2), (6, 3), (6, 4); -- Chrono Sentinel: PC, PS5, Xbox, Switch

-- 6. LICENCIAS DIGITALES (STOCK DISPONIBLE)
INSERT INTO licencias_digitales (id, producto_id, plataforma_id, clave_activacion, estado) VALUES
(101, 2, 1, 'SILENT-ABYSS-VR-KEY-9988-7766', 'ASIGNADA'), -- Asignada a la orden de Juan Pérez
(102, 2, 1, 'SILENT-ABYSS-VR-KEY-1122-3344', 'DISPONIBLE'),
(103, 1, 1, 'CYBER-2088-KEY-AAAA-BBBB', 'DISPONIBLE'),
(104, 1, 2, 'CYBER-2088-PS5-CCCC-DDDD', 'DISPONIBLE'),
(105, 3, 4, 'QUANTUM-SWITCH-KEY-5566-7788', 'DISPONIBLE');

-- 7. CUPONES DE DESCUENTO
INSERT INTO cupones (id, codigo, tipo_descuento, valor_descuento, monto_minimo_compra, usos_maximos, usos_actuales, fecha_inicio, fecha_expiracion, activo) VALUES
(1, 'GAMER2026', 'PORCENTAJE', 10.00, 100000.00, 1000, 12, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE),
(2, 'CYBER50', 'MONTO_FIJO', 50000.00, 200000.00, 500, 5, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE);

-- 8. MÉTODOS DE PAGO (PANTALLAZO DE PASARELA)
INSERT INTO metodos_pago (id, codigo, nombre, descripcion, icono_class, activo) VALUES
(1, 'CREDIT_DEBIT_CARD', 'Tarjeta Crédito/Débito', 'Pago seguro instantáneo con VISA, MasterCard o American Express', 'fa-credit-card', TRUE),
(2, 'PAYPAL', 'PayPal', 'Pago global seguro con tu cuenta de PayPal', 'fa-paypal', TRUE),
(3, 'CRYPTO', 'Criptomonedas', 'Pago descentralizado con Bitcoin (BTC), Ethereum (ETH) o USDT', 'fa-bitcoin', TRUE),
(4, 'PSE_NEQUI_OXXO', 'PSE / Nequi / OXXO / Efectivo', 'Transferencia bancaria PSE, billetera Nequi o pago en efectivo OXXO', 'fa-money-bill-transfer', TRUE),
(5, 'APPLE_PAY', 'Apple Pay', 'Pago biométrico rápido en dispositivos Apple', 'fa-apple', TRUE);

-- 9. ORDEN DE COMPRA DE EJEMPLO (Basada exactamente en el pantallazo de $180.000 COP)
INSERT INTO ordenes (
    id, codigo_referencia, usuario_id, cupon_id, 
    subtotal_cop, descuento_cop, impuesto_cop, total_cop, 
    moneda_compra, total_moneda_original, tasa_cambio, estado
) VALUES (
    'ord-uuid-98721', 'CYBER-2026-98721', 'usr-uuid-0001', NULL,
    180000.00, 0.00, 0.00, 180000.00,
    'COP', 180000.00, 1.0000, 'COMPLETADA'
);

-- Detalle de la Orden (Silent Abyss: Nightmare Entity por $180.000 COP)
INSERT INTO orden_detalles (orden_id, producto_id, plataforma_id, licencia_id, cantidad, precio_unitario_cop, subtotal_cop) VALUES
('ord-uuid-98721', 2, 1, 101, 1, 180000.00, 180000.00);

-- Transacción de Pago correspondiente (Aprobada en la pasarela)
INSERT INTO transacciones_pago (
    id, orden_id, metodo_pago_id, referencia_pasarela, 
    monto, moneda, estado_transaccion, codigo_respuesta, mensaje_respuesta, ip_cliente
) VALUES (
    'trx-uuid-453289', 'ord-uuid-98721', 1, 'GATEWAY-VISA-4532890123456789',
    180000.00, 'COP', 'APROBADA', '00_SUCCESS', 'Transacción Aprobada Exitosamente', '190.157.42.10'
);

-- Registro Seguro PCI-DSS de la Tarjeta (Titular: GAMER PRO / Juan Pérez, VISA, **** 6789, expira 12/28)
INSERT INTO detalles_pago_tarjeta (
    transaccion_id, nombre_titular, marca_tarjeta, ultimos_cuatro, mes_expiracion, anio_expiracion, token_transaccion
) VALUES (
    'trx-uuid-453289', 'Juan Pérez', 'VISA', '6789', '12', '2028', 'tok_sec_4532_8901_2345_6789_v1'
);

-- 10. RESEÑAS VERIFICADAS
INSERT INTO reseñas (producto_id, usuario_id, calificacion, comentario, compra_verificada) VALUES
(1, 'usr-uuid-0002', 5, '¡Gráficos 3D deslumbrantes! El trazado de rayos en las calles neón se ve increíble a 4K.', TRUE),
(2, 'usr-uuid-0001', 5, 'Jugarlo con cascos VR y audio 3D es aterrador. La compra con la pasarela fue súper rápida.', TRUE),
(3, 'usr-uuid-0003', 5, 'Los puzles tridimensionales están muy bien diseñados. ¡Recomendado 100%!', TRUE);

-- 11. REGISTRO DE AUDITORÍA
INSERT INTO auditoria_estados_orden (orden_id, estado_anterior, estado_nuevo, usuario_modificador_id, motivo) VALUES
('ord-uuid-98721', 'PENDIENTE', 'PAGADA', 'usr-uuid-0001', 'Pago con tarjeta VISA procesado en pasarela'),
('ord-uuid-98721', 'PAGADA', 'COMPLETADA', 'usr-uuid-0000', 'Licencia asignada e inventario actualizado');
