const express = require('express');
const app = express();

//Dummy data produk
const products = [
    { id: 1, name: 'Iphone 17', price: 100, Description: 'This is Iphone 17' },
    { id: 2, name: 'Microwave', price: 150, Description: 'This is Microwave' },
    { id: 3, name: 'Laptop Macbook', price: 200, Description: 'This is Laptop Macbook' }
];

//Endpoit untuk menddapatkan daftar produk
app.get('/products', (req, res) => {
    res.json(products);
});

//Endpoint untuk mendapatkan detail produk berdasarkan id
app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Product not found');
    }
});

//Menjalankan server pada port 3000
const PORT = process.env.PORT || 3000; // <--- BENAR
app.listen(PORT, () => {
    console.log(`Product service is running on port ${PORT}`);
});

//cara kedua
// app.listen(3000, () => console.log('Product service running on port 3000'));