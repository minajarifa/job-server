const express = require('express');
const cors = require('cors'); 
const app = express();
const port = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('job are falling are the sky');
});

app.listen(port, () => {
    console.log(`job is waiting: ${port}`);
});