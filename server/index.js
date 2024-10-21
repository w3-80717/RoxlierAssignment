require('dotenv').config();
const express = require('express');
const cors = require('cors');
const database = require('./database');
const ProductTransaction = require('./models/ProductTransaction');

process.env.SERVER_PORT = process.env.SERVER_PORT ?? 8080;
const SERVER_URL = `http://localhost:${process.env.SERVER_PORT}`;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/seed', (req, res) => {
    res.ok({});
});

app.get('/api/transactions', (req, res) => {
    res.ok({});
});

app.get('/api/statistics', (req, res) => {
    res.ok({});
});

app.get('/api/item_range', (req, res) => {
    res.ok({});
});

app.get('/api/category_items', (req, res) => {
    res.ok({});
});

app.get('/api/combined', (req, res) => {
    res.ok({});
});

database.connect().then(() => {
    console.log("connected to mongo");
    app.listen(process.env.SERVER_PORT, () => {
        console.log(`Started express on port ${process.env.SERVER_PORT}`)
    });
});