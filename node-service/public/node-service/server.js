const express =
    require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('welcome to node Crud service');
});

app.get('/health', (req, res) => {
    res.send('node service is working');
});

app.listen(port, () => {
    console.log(`node service is running at http://localhost:${port}`);
});
