require('dotenv').config();
const express = require('express');
const cors = require('cors');
const database = require('./database');
const ProductTransaction = require('./models/ProductTransaction');

process.env.SERVER_PORT = process.env.SERVER_PORT ?? 8080;
const SERVER_URL = `http://localhost:${process.env.SERVER_PORT}`;
const SEED_URL = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/seed', async (req, res) => {
    try {
        console.log(`Fetching data from ${SEED_URL}`);
        let responseData = await (await fetch(SEED_URL)).json();
        console.log("Fetched success fully");
        console.log(`Count: ${responseData.length}`);
        console.log("Saving data in database");
        let insertResult = await ProductTransaction.insertMany(responseData);
        console.log("Seed data in database completed");
        res.send({ result: "success", message: "Seed data in database completed" });
    }
    catch (err) {
        console.error("Error occured:");
        console.error(err);
        res.status(401).send({ result: "failure", error: err.message });
    }
});

app.get('/api/transactions', (req, res) => {
    res.send({});
});

app.get('/api/statistics', (req, res) => {
    res.send({});
});

app.get('/api/item_range', (req, res) => {
    res.send({});
});

app.get('/api/category_items', (req, res) => {
    res.send({});
});

app.get('/api/combined', (req, res) => {
    res.send({});
});

database.connect().then(() => {
    console.log("connected to mongo");
    app.listen(process.env.SERVER_PORT, () => {
        console.log(`Started express on port ${process.env.SERVER_PORT}`)
    });
});