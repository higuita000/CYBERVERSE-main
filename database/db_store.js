/* ==========================================================================
   CYBERVERSE 3D GAMING STORE - RELATIONAL DATABASE INTEGRATION MODULE (JS)
   Este módulo expone la estructura relacional y simula la persistencia
   y operaciones relacionales (Módulo de Compras, Pasarela, Órdenes y Licencias)
   ========================================================================== */

const DB_RELATIONAL_SCHEMA = {
    tables: [
        'usuarios',
        'direcciones_facturacion',
        'categorias',
        'plataformas',
        'productos',
        'producto_plataformas',
        'licencias_digitales',
        'cupones',
        'carritos',
        'carrito_items',
        'metodos_pago',
        'ordenes',
        'orden_detalles',
        'transacciones_pago',
        'detalles_pago_tarjeta',
        'detalles_pago_alternativo',
        'reseñas',
        'auditoria_estados_orden'
    ]
};

// Simulación de Estado Relacional en Memoria / LocalStorage
class CyberverseRelationalDB {
    constructor() {
        this.initTables();
    }

    initTables() {
        if (!localStorage.getItem('cyberverse_relational_initialized')) {
            const seedData = {
                metodos_pago: [
                    { id: 1, codigo: 'CREDIT_DEBIT_CARD', nombre: 'Tarjeta Crédito/Débito', icono_class: 'fa-credit-card' },
                    { id: 2, codigo: 'PAYPAL', nombre: 'PayPal', icono_class: 'fa-paypal' },
                    { id: 3, codigo: 'CRYPTO', nombre: 'Criptomonedas', icono_class: 'fa-bitcoin' },
                    { id: 4, codigo: 'PSE_NEQUI_OXXO', nombre: 'PSE / Nequi / OXXO / Efectivo', icono_class: 'fa-money-bill-transfer' },
                    { id: 5, codigo: 'APPLE_PAY', nombre: 'Apple Pay', icono_class: 'fa-apple' }
                ],
                ordenes: [
                    {
                        id: 'ord-uuid-98721',
                        codigo_referencia: 'CYBER-2026-98721',
                        usuario_id: 'usr-uuid-0001',
                        total_cop: 180000,
                        moneda_compra: 'COP',
                        estado: 'COMPLETADA',
                        fecha_creacion: new Date().toISOString()
                    }
                ],
                transacciones_pago: [
                    {
                        id: 'trx-uuid-453289',
                        orden_id: 'ord-uuid-98721',
                        metodo_pago_id: 1,
                        referencia_pasarela: 'GATEWAY-VISA-4532890123456789',
                        monto: 180000,
                        estado_transaccion: 'APROBADA'
                    }
                ],
                detalles_pago_tarjeta: [
                    {
                        id: 1,
                        transaccion_id: 'trx-uuid-453289',
                        nombre_titular: 'Juan Pérez',
                        marca_tarjeta: 'VISA',
                        ultimos_cuatro: '6789',
                        mes_expiracion: '12',
                        anio_expiracion: '2028'
                    }
                ]
            };

            localStorage.setItem('cyberverse_db_data', JSON.stringify(seedData));
            localStorage.setItem('cyberverse_relational_initialized', 'true');
        }
    }

    getDatabaseState() {
        return JSON.parse(localStorage.getItem('cyberverse_db_data') || '{}');
    }

    /**
     * Registra una compra simulando la transacción relacional
     */
    registrarCompraRelacional(orderData) {
        const db = this.getDatabaseState();
        const newOrderId = 'ord-uuid-' + Math.floor(100000 + Math.random() * 900000);
        const refCode = 'CYBER-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
        
        // 1. Crear Orden (Encabezado)
        const nuevaOrden = {
            id: newOrderId,
            codigo_referencia: refCode,
            usuario_id: orderData.usuario_id || 'usr-uuid-guest',
            subtotal_cop: orderData.total_cop,
            descuento_cop: orderData.descuento || 0,
            total_cop: orderData.total_cop,
            moneda_compra: orderData.moneda || 'COP',
            estado: 'COMPLETADA',
            fecha_creacion: new Date().toISOString()
        };

        // 2. Crear Transacción de Pago
        const newTrxId = 'trx-uuid-' + Math.floor(100000 + Math.random() * 900000);
        const nuevaTrx = {
            id: newTrxId,
            orden_id: newOrderId,
            metodo_pago_id: orderData.metodo_pago_id || 1,
            referencia_pasarela: 'GATEWAY-REF-' + Date.now(),
            monto: orderData.total_cop,
            moneda: orderData.moneda || 'COP',
            estado_transaccion: 'APROBADA',
            fecha_transaccion: new Date().toISOString()
        };

        // 3. Registrar detalles de pago según la pasarela
        if (orderData.tarjeta) {
            db.detalles_pago_tarjeta = db.detalles_pago_tarjeta || [];
            db.detalles_pago_tarjeta.push({
                id: db.detalles_pago_tarjeta.length + 1,
                transaccion_id: newTrxId,
                nombre_titular: orderData.tarjeta.titular || 'GAMER PRO',
                marca_tarjeta: orderData.tarjeta.marca || 'VISA',
                ultimos_cuatro: (orderData.tarjeta.numero || '6789').slice(-4),
                mes_expiracion: orderData.tarjeta.exp_mes || '12',
                anio_expiracion: orderData.tarjeta.exp_anio || '28'
            });
        }

        db.ordenes.push(nuevaOrden);
        db.transacciones_pago.push(nuevaTrx);

        localStorage.setItem('cyberverse_db_data', JSON.stringify(db));
        return { orden: nuevaOrden, transaccion: nuevaTrx };
    }
}

window.CyberverseDB = new CyberverseRelationalDB();
