const express = require('express');
const bcrypt = require('bcryptjs');
const { pool, initDb } = require('./database');

const app = express();

/** * PERBAIKAN UTAMA:
 * Menambahkan middleware agar Express bisa membaca body dari Postman
 */
app.use(express.json()); // Untuk membaca raw JSON
app.use(express.urlencoded({ extended: true })); // Untuk membaca x-www-form-urlencoded

// Inisialisasi tabel saat aplikasi berjalan
initDb();

// 1. GET ALL USERS
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET USER BY ID
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'User tidak ditemukan' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. POST NEW USER (Menerima input dari Form Postman)
app.post('/users', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validasi sederhana
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Nama, Email, dan Password wajib diisi" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );
        res.status(201).json({
            message: "User berhasil didaftarkan",
            user: result.rows[0]
        });
    } catch (err) {
        // Cek jika email sudah terdaftar (Unique constraint)
        if (err.code === '23505') {
            return res.status(400).json({ error: "Email sudah digunakan" });
        }
        res.status(500).json({ error: err.message });
    }
});

// 4. UPDATE USER
app.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        
        let result;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            result = await pool.query(
                'UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, name, email',
                [name, email, hashedPassword, id]
            );
        } else {
            result = await pool.query(
                'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
                [name, email, id]
            );
        }

        if (result.rows.length > 0) {
            res.json({ message: "Update berhasil", user: result.rows[0] });
        } else {
            res.status(404).json({ message: 'User tidak ditemukan' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. DELETE USER
app.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email', [id]);
        if (result.rows.length > 0) {
            res.json({ message: 'User berhasil dihapus', user: result.rows[0] });
        } else {
            res.status(404).json({ message: 'User tidak ditemukan' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. LOGIN
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email dan Password harus diisi" });

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({ 
                message: 'Login berhasil', 
                user: { id: user.id, name: user.name, email: user.email } 
            });
        } else {
            res.status(401).json({ message: 'Password salah' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
    console.log(`User Service berjalan di port ${PORT}`);
});