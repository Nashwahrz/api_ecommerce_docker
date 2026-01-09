const { Pool } = require('pg');

// Konfigurasi koneksi ke PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
});

// Fungsi untuk memastikan tabel users ada
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
        `);
        console.log("Database initialized successfully");
    } catch (err) {
        console.error("Error initializing database", err);
    }
};

module.exports = { pool, initDb };