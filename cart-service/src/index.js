const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');
// Tambahkan multer untuk menangani Form-Data (Multipart)
const multer = require('multer');
const upload = multer(); 
require('dotenv').config();

const app = express();
// Gunakan 0.0.0.0 agar bisa diakses dari luar container Docker
const HOST = '0.0.0.0'; 
const PORT = process.env.CART_SERVICE_PORT || 6001;

app.use(cors());
app.use(express.json()); // Membaca JSON body
app.use(express.urlencoded({ extended: true })); // Membaca URL-encoded (Form Data biasa)

// --- SETUP REDIS ---
const client = createClient({
    url: `redis://${process.env.REDIS_HOST || 'redis-db'}:${process.env.REDIS_PORT || 6379}`
});

client.on('error', (err) => console.log('❌ Redis Client Error', err));
client.on('connect', () => console.log('✅ Connected to Redis!'));

(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error("Gagal koneksi ke Redis:", err);
    }
})();

// --- ROUTES ---

// 1. Tambah ke Keranjang (Mendukung JSON, URL-Encoded, dan Multipart/Form-Data)
app.post('/cart', upload.none(), async (req, res) => {
    try {
        // Ambil data dari body (Form data atau JSON)
        const { user_id, product_id, product_name, price, quantity } = req.body;
        
        if (!user_id || !product_id) {
            return res.status(400).json({ message: "user_id dan product_id wajib diisi" });
        }

        const cartKey = `cart:${user_id}`;
        const currentCart = await client.get(cartKey);
        let cartItems = currentCart ? JSON.parse(currentCart) : [];

        // Konversi tipe data agar konsisten
        const pId = parseInt(product_id);
        const pPrice = parseInt(price);
        const pQty = parseInt(quantity);

        const existingItemIndex = cartItems.findIndex(item => item.product_id === pId);

        if (existingItemIndex > -1) {
            cartItems[existingItemIndex].quantity += pQty;
        } else {
            cartItems.push({ 
                product_id: pId, 
                product_name, 
                price: pPrice, 
                quantity: pQty 
            });
        }

        await client.set(cartKey, JSON.stringify(cartItems));
        res.json({ message: 'Item added to cart', cart: cartItems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Lihat Keranjang Berdasarkan User ID
app.get('/cart/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const data = await client.get(`cart:${user_id}`);
        res.json({ user_id, items: data ? JSON.parse(data) : [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. ADMIN: Lihat SEMUA Keranjang
app.get('/carts', async (req, res) => {
    try {
        const keys = await client.keys('cart:*');
        const allCarts = [];
        for (const key of keys) {
            const data = await client.get(key);
            allCarts.push({
                user_id: key.replace('cart:', ''),
                items: JSON.parse(data)
            });
        }
        res.json({ total_carts: keys.length, data: allCarts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- JALANKAN SERVER ---
// PENTING: Tambahkan HOST '0.0.0.0' agar Docker bisa meneruskan request ke app ini
app.listen(PORT, HOST, () => {
    console.log(`🛒 Cart Service running on http://${HOST}:${PORT}`);
});