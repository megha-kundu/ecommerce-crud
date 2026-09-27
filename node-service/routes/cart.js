// node-service/routes/cart.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. ADD ITEM TO CART (Diagnostic tracking version)
router.post('/add', async (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
        return res.status(400).json({ error: "Missing required fields in request payload" });
    }

    try {
        // Check if products table can be reached safely
        const [prodCheck] = await db.execute('SELECT * FROM products WHERE id = ?', [product_id]);

        if (prodCheck.length === 0) {
            await db.execute(
                'INSERT IGNORE INTO products (id, name, price) VALUES (?, ?, ?)',
                [product_id, product_id == 1 ? "Premium Leather Jacket" : product_id == 2 ? "Casual Canvas Sneakers" : "Designer Summer Dress", product_id == 1 ? 129.99 : product_id == 2 ? 59.99 : 79.99]
            );
        }

        // Check existing rows
        const [existing] = await db.execute(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );

        if (existing.length > 0) {
            await db.execute(
                'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [quantity, user_id, product_id]
            );
            return res.status(200).json({ message: "Quantity updated in cart! 🛒" });
        } else {
            await db.execute(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [user_id, product_id, quantity]
            );
            return res.status(201).json({ message: "Item added to your cart! 🛒" });
        }
    } catch (error) {
        // This will force the exact SQL/Node crash error description to go straight back to Chrome
        console.log("CRASH LOGGED:", error.message);
        return res.status(500).json({
            error: "Internal Server Crash Details",
            message: error.message,
            stack: error.stack
        });
    }
});

// 2. FETCH ALL ITEMS IN A USER'S CART
router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const [cartItems] = await db.execute(
            `SELECT cart.id AS cart_id, cart.product_id, cart.quantity, 
              products.name, products.price 
       FROM cart 
       LEFT JOIN products ON cart.product_id = products.id 
       WHERE cart.user_id = ?`,
            [user_id]
        );
        return res.status(200).json(cartItems);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// 3. REMOVE AN ITEM FROM CART
router.delete('/remove', async (req, res) => {
    const { user_id, product_id } = req.body;
    try {
        await db.execute('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [user_id, product_id]);
        return res.status(200).json({ message: "Item removed from cart" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
