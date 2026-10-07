const mysql = require('mysql2/promise');

async function setupDatabase() {
    try {
        // 1. Connect to MySQL without choosing a database first
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        console.log('Connected to MySQL server.');

        // 2. Create the ecommerce database if it does not exist
        await connection.query('CREATE DATABASE IF NOT EXISTS ecommerce');
        console.log('Database "ecommerce" checked/created.');

        // 3. Switch to the ecommerce database
        await connection.query('USE ecommerce');

        // 4. Create the products table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL
      )
    `);
        console.log('Products table checked/created.');

        // 5. Create the cart table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS cart (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT DEFAULT 1,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
        console.log('Cart table checked/created.');

        // 6. Insert a seed item if table is empty
        const [rows] = await connection.query('SELECT * FROM products LIMIT 1');
        if (rows.length === 0) {
            await connection.query("INSERT INTO products (name, price) VALUES ('Test Item', 19.99)");
            console.log('Dummy product inserted.');
        }

        await connection.end();
        console.log('Database setup complete successfully!');
    } catch (error) {
        console.error('Error setting up database:', error);
    }
}

setupDatabase();
