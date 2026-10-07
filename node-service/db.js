const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',          // Default XAMPP username
    password: '',          // Default XAMPP password is empty
    database: 'ecommerce', // Change this to your exact MySQL database name
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool.promise();
