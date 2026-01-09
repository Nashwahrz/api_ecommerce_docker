<?php

$router->get('/cart', function () use ($router) {
    return 'Cart Service is running';
});

// Gunakan variabel global atau simpan data dengan struktur yang konsisten
$carts = [
    'items' => [
        ['id' => 1, 'name' => 'Product A', 'quantity' => 2, 'price' => 50.00],
        ['id' => 2, 'name' => 'Product B', 'quantity' => 1, 'price' => 30.00],
        ['id' => 3, 'name' => 'Product C', 'quantity' => 1, 'price' => 50.00]
    ],
    'total' => 130.00
];

// 1. Get all items
$router->get('/carts', function () use ($carts) {
    return response()->json($carts);
});

// 2. Get cart by id
$router->get('/carts/{id}', function ($id) use ($carts) {
    // Cari di dalam array 'items'
    foreach ($carts['items'] as $item) {
        if ($item['id'] == $id) {
            return response()->json($item);
        }
    }
    return response()->json(['message' => 'Item not found'], 404);
});

// 3. Delete item from cart (Perbaikan Logika)
$router->delete('/cart/{id}', function ($id) use ($carts) {
    $cartId = (int) $id;

    // Cari apakah ID ada di dalam $carts['items']
    $foundKey = array_search($cartId, array_column($carts['items'], 'id'));

    if ($foundKey === false) { 
        return response()->json(['message' => 'Item not found'], 404);
    }

    // Jika ini aplikasi asli, di sini Anda akan menghapus data dari DB/Redis
    // unset($carts['items'][$foundKey]); 

    return response()->json([
        'message' => 'Item deleted successfully',
        'deleted_id' => $cartId
    ]);
});