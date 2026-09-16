-- =============================================================================
-- CYBERVERSE - SEED DATA PARA SUPABASE (Postgres)
-- Pégalo en SQL Editor DESPUÉS de schema.sql
-- =============================================================================

-- Categorías
insert into categorias (id, codigo, nombre, descripcion) values
(1, 'accion', 'Acción 3D', 'Juegos de alta velocidad, combate neón y batallas futuristas en 3D.'),
(2, 'terror', 'Terror / Survival 3D VR', 'Experiencias de inmersión total en 3D y VR.'),
(3, 'pensamiento', 'Pensamiento / Puzzles 3D', 'Desafíos de lógica tridimensional y portales.'),
(4, 'aventura', 'Aventura / RPG 3D', 'Exploración de mundos abiertos masivos.'),
(5, 'rpg', 'RPG / Fantasía', 'RPG de fantasía oscura y acción.'),
(6, 'scifi', 'Sci-Fi / Estrategia', 'Estrategia espacial y ciencia ficción.')
on conflict (id) do nothing;

-- Plataformas
insert into plataformas (id, codigo, nombre, icono_class) values
(1, 'PC', 'PC Windows', 'fa-desktop'),
(2, 'PS5', 'PlayStation 5', 'fa-playstation'),
(3, 'XBOX_SERIES', 'Xbox Series X/S', 'fa-xbox'),
(4, 'SWITCH', 'Nintendo Switch', 'fa-gamepad'),
(5, 'VR', 'Realidad Virtual (VR)', 'fa-vr-cardboard')
on conflict (id) do nothing;

-- Reinicia las secuencias de identity para que los siguientes inserts no choquen
select setval(pg_get_serial_sequence('categorias','id'), coalesce(max(id),1)) from categorias;
select setval(pg_get_serial_sequence('plataformas','id'), coalesce(max(id),1)) from plataformas;

-- Productos (mismo catálogo que products.js, 9 juegos)
insert into productos (id, categoria_id, titulo, slug, descripcion, precio_cop, precio_original_cop, rating_promedio, total_resenas, badge, imagen_url, destacado, req_os, req_gpu, req_ram, req_storage) values
(1, 1, 'Cyberpunk 2088: Neon Genesis', 'cyberpunk-2088-neon-genesis', 'RPG de acción y combate en 3D hiperrealista con Ray Tracing.', 240000, 320000, 4.90, 1420, 'DESTACADO 3D', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', true, 'Windows 11 64-bit', 'Nvidia RTX 4070 / AMD RX 7800 XT', '16 GB RAM', '85 GB SSD'),
(2, 2, 'Silent Abyss: Nightmare Entity', 'silent-abyss-nightmare-entity', 'Terror psicológico en 3D en hospital abandonado. Compatible VR.', 180000, 200000, 4.80, 890, 'TERROR 3D VR', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', true, 'Windows 10/11', 'Nvidia RTX 3060', '16 GB RAM', '45 GB SSD'),
(3, 3, 'Quantum Enigma: Mind Matrix', 'quantum-enigma-mind-matrix', 'Acertijos espaciales 3D y portales tridimensionales.', 120000, 160000, 4.95, 650, 'MEJOR PUZZLE GOTY', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', false, 'Windows 10/11', 'GTX 1660 Super', '8 GB RAM', '15 GB'),
(4, 4, 'Uncharted Horizon: Odyssey of Ancients', 'uncharted-horizon-odyssey', 'Explora ruinas alienígenas en islas flotantes 3D.', 280000, 280000, 4.90, 2300, 'GOTY CANDIDATE', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', false, 'Windows 11', 'RTX 3080', '32 GB RAM', '110 GB NVMe'),
(5, 2, 'Biohazard Protocol: Outbreak Z', 'biohazard-protocol-outbreak-z', 'Sobrevive a plaga mutante en estación espacial 3D sin gravedad.', 160000, 220000, 4.70, 1100, 'SUPERVIVENCIA 3D', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80', false, 'Windows 11', 'RTX 3070', '16 GB RAM', '60 GB SSD'),
(6, 1, 'Mech Warfare 3D: Iron Vanguard', 'mech-warfare-3d-iron-vanguard', 'Pilota mechas gigantes en batallas con destrucción masiva.', 200000, 240000, 4.85, 1750, 'COMBATE MECHA 3D', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80', false, 'Windows 10/11', 'RTX 4060', '16 GB RAM', '70 GB SSD'),
(7, 3, 'Portal Dimension: Construct 3D', 'portal-dimension-construct-3d', 'Geometría imposible estilo Escher en lienzo 3D.', 100000, 120000, 4.90, 940, 'INNOVACIÓN PUZZLE', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', false, 'Windows 10/11', 'GTX 1060', '8 GB RAM', '10 GB'),
(8, 5, 'Eldritch Realm: Souls of Chaos', 'eldritch-realm-souls-of-chaos', 'RPG de acción oscura, jefes colosales y combate milimétrico.', 260000, 280000, 4.98, 3800, 'OBRA MAESTRA', 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80', true, 'Windows 11', 'RTX 3070 Ti', '16 GB RAM', '90 GB SSD'),
(9, 6, 'Galaxy Command: Interstellar 3D', 'galaxy-command-interstellar-3d', 'Comanda flotas en combates espaciales 360 grados.', 220000, 220000, 4.88, 1540, 'ESTRATEGIA 3D', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', false, 'Windows 11', 'RTX 3060 Ti', '32 GB RAM', '50 GB SSD')
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('productos','id'), coalesce(max(id),1)) from productos;

insert into producto_plataformas (producto_id, plataforma_id) values
(1,1),(1,2),(1,3),
(2,1),(2,2),(2,5),
(3,1),(3,4),
(4,2),(4,1),
(5,1),(5,2),(5,3),
(6,1),(6,3),
(7,1),(7,5),(7,4),
(8,1),(8,2),(8,3),
(9,1)
on conflict do nothing;

insert into licencias_digitales (producto_id, plataforma_id, clave_activacion, estado) values
(2, 1, 'SILENT-ABYSS-VR-KEY-9988-7766', 'DISPONIBLE'),
(2, 1, 'SILENT-ABYSS-VR-KEY-1122-3344', 'DISPONIBLE'),
(1, 1, 'CYBER-2088-KEY-AAAA-BBBB', 'DISPONIBLE'),
(1, 2, 'CYBER-2088-PS5-CCCC-DDDD', 'DISPONIBLE'),
(3, 4, 'QUANTUM-SWITCH-KEY-5566-7788', 'DISPONIBLE')
on conflict (clave_activacion) do nothing;

insert into cupones (codigo, tipo_descuento, valor_descuento, monto_minimo_compra, usos_maximos, fecha_expiracion, activo) values
('GAMER2026', 'PORCENTAJE', 20.00, 0, 1000, '2026-12-31 23:59:59+00', true),
('CYBER50', 'MONTO_FIJO', 50000.00, 200000.00, 500, '2026-12-31 23:59:59+00', true)
on conflict (codigo) do nothing;

insert into metodos_pago (id, codigo, nombre, descripcion, icono_class, activo) values
(1, 'CREDIT_DEBIT_CARD', 'Tarjeta Crédito/Débito', 'VISA, MasterCard o AMEX', 'fa-credit-card', true),
(2, 'PAYPAL', 'PayPal', 'Cuenta PayPal', 'fa-paypal', true),
(3, 'CRYPTO', 'Criptomonedas', 'BTC, ETH o USDT', 'fa-bitcoin', true),
(4, 'PSE_NEQUI_OXXO', 'PSE / Nequi / OXXO / Efectivo', 'PSE, Nequi u OXXO', 'fa-money-bill-transfer', true),
(5, 'APPLE_PAY', 'Apple Pay', 'Pago biométrico Apple', 'fa-apple', true)
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('metodos_pago','id'), coalesce(max(id),1)) from metodos_pago;
