const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// 1. Enable CORS so the browser frontend pages can talk to your backend safely
app.use(cors());

// 2. Middleware to parse incoming JSON request payloads
app.use(express.json());

// 3. Serve the standalone frontend 'js' folder publicly
app.use('/js', express.static(path.join(__dirname, 'js')));

// 4. Serve your teammate's HTML/CSS layout files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// 5. Import and register your backend cart endpoints
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);

// Base health endpoints
app.get('/health', (req, res) => {
    res.send('node service is working');
});

app.listen(port, () => {
    console.log(`node service is running at http://localhost:${port}`);
});
