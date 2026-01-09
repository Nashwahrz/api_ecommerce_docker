const express = require('express');
const cors = require('cors');
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
// Agar bisa membaca input JSON (raw JSON di Postman)
app.use(express.json()); 
// Agar bisa membaca input FORM (x-www-form-urlencoded di Postman)
app.use(express.urlencoded({ extended: true })); 

/* ===============================
    MODEL
================================ */
const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  }
});

/* ===============================
    RESPONSE HELPER
================================ */
const success = (res, message, data = null) => {
  return res.status(200).json({
    success: true,
    message,
    data
  });
};

const error = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message
  });
};

/* ===============================
    ROUTES
================================ */

// GET ALL PRODUCTS
app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    success(res, 'Products retrieved successfully', products);
  } catch (err) {
    console.error('GET /products error:', err);
    error(res, 500, 'Failed to retrieve products');
  }
});

// GET PRODUCT BY ID
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 404, 'Product not found');

    success(res, 'Product retrieved successfully', product);
  } catch (err) {
    console.error(err);
    error(res, 500, 'Failed to retrieve product');
  }
});

// CREATE PRODUCT (Sudah bisa diisi via Form Postman)
app.post('/products', async (req, res) => {
  try {
    const { name, price, description } = req.body;

    // Logging untuk memantau data yang masuk ke terminal
    console.log("Data diterima dari body:", req.body);

    // Validasi: Pastikan name dan price ada dan valid
    if (!name || name.trim() === "") {
      return error(res, 400, 'Name is required');
    }
    if (price === undefined || price === "" || isNaN(price)) {
      return error(res, 400, 'Valid price is required');
    }

    const product = await Product.create({ 
      name, 
      price: parseFloat(price), 
      description 
    });
    
    success(res, 'Product created successfully', product);
  } catch (err) {
    console.error("Kesalahan saat membuat produk:", err);
    error(res, 500, 'Failed to create product');
  }
});

// UPDATE PRODUCT
app.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 404, 'Product not found');

    // Menangani update data
    const { name, price, description } = req.body;
    await product.update({
      name: name || product.name,
      price: price ? parseFloat(price) : product.price,
      description: description !== undefined ? description : product.description
    });

    success(res, 'Product updated successfully', product);
  } catch (err) {
    console.error(err);
    error(res, 500, 'Failed to update product');
  }
});

// DELETE PRODUCT
app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 404, 'Product not found');

    await product.destroy();
    success(res, 'Product deleted successfully');
  } catch (err) {
    console.error(err);
    error(res, 500, 'Failed to delete product');
  }
});

/* ===============================
    START SERVER
================================ */
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Memastikan koneksi ke MySQL berhasil
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected');

    // Sinkronisasi model dengan database (membuat tabel jika belum ada)
    await sequelize.sync({ alter: true });
    console.log('✅ MySQL Database synced');

    app.listen(PORT, () => {
      console.log(`🚀 Product service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();