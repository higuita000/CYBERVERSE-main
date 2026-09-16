/* ==========================================================================
   CYBERVERSE 3D GAMING STORE - CONFIGURACIÓN DE CONEXIÓN A MYSQL (NODE.JS)
   ==========================================================================
   Uso:
   1. Instalar dependencia: npm install mysql2
   2. Importar en tu servidor: const db = require('./database/mysql_connect');
   ========================================================================== */

const mysql = require('mysql2/promise');

// Configuración de la conexión a MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cyberverse_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear Pool de Conexiones a MySQL
const pool = mysql.createPool(dbConfig);

// Función Helper para probar conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a MySQL DB: cyberverse_db');
        connection.release();
    } catch (error) {
        console.error('❌ Error al conectar a MySQL:', error.message);
    }
}

module.exports = {
    pool,
    testConnection
};
