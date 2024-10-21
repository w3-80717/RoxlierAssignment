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
app.get('/api/transactions', async (req, res) => {
    const { page, limit, search, month } = req.query;
  
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const monthNumber = Number(month);
  
    if (pageNumber && (!Number.isInteger(pageNumber) || pageNumber <= 0)) {
      return res.status(400).send({ error: 'Invalid page number' });
    }
    if (limitNumber && (!Number.isInteger(limitNumber) || limitNumber <= 0 || limitNumber > 50)) {
      return res.status(400).send({ error: 'Invalid limit' });
    }
    if (monthNumber && (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12)) {
      return res.status(400).send({ error: 'Invalid month' });
    }
  
    const currentPage = pageNumber || 1;
    const currentLimit = limitNumber || 10;
  
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
  
    try {
      const transactions = await ProductTransaction.aggregate([
        {
          $match: {
            ...query,
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
          },
        },
        {
          $skip: (currentPage - 1) * currentLimit,
        },
        {
          $limit: currentLimit,
        },
      ]);
      res.send(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  });
app.get('/api/statistics', async (req, res) => {
    let { month } = req.query;
    month = Number(month);
    const salesData = await ProductTransaction.aggregate(
        [
            {
                $match: {
                    $expr: {
                        $eq: [
                            {
                                $month: "$dateOfSale",
                            },
                            month,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total_price: {
                        $sum: "$price",
                    },
                    sold_quantity: {
                        $sum: {
                            $cond: ["$sold", 1, 0],
                        },
                    },
                    not_sold_quantity: {
                        $sum: {
                            $cond: ["$sold", 0, 1],
                        },
                    },
                },
            },
        ]
    );
    res.send(salesData.length ? salesData[0] : { sale: 0, soldQuantity: 0, notSoldQuantity: 0 });
});

app.get('/api/item_range', async (req, res) => {
    const { month } = req.query;
    const monthNumber = Number(month);

    // Validate month input
    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
        return res.status(400).send({ error: 'Invalid month' });
    }

    const ranges = [
        { range: "0-100", min: 0, max: 100 },
        { range: "101-200", min: 101, max: 200 },
        { range: "201-300", min: 201, max: 300 },
        { range: "301-400", min: 301, max: 400 },
        { range: "401-500", min: 401, max: 500 },
        { range: "501-600", min: 501, max: 600 },
        { range: "601-700", min: 601, max: 700 },
        { range: "701-800", min: 701, max: 800 },
        { range: "801-900", min: 801, max: 900 },
        { range: "901-above", min: 901 }
    ];

    const results = await Promise.all(ranges.map(async (r) => {
        const filter = {
            price: { $gte: r.min, $lt: r.max || Infinity },
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] }
        };
        const count = await ProductTransaction.countDocuments(filter);
        return { range: r.range, items: count };
    }));

    res.send(results);
});
app.get('/api/category_items', async (req, res) => {
    let { month } = req.query;
    month = Number(month);
    const categories = await ProductTransaction.aggregate([
        {
            $match: {
                $expr: {
                    $eq: [
                        {
                            $month: "$dateOfSale",
                        },
                        month,
                    ],
                },
            },
        }, { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    console.log(categories);
    const response = {};
    categories.forEach(cat => {
        response[cat._id] = cat.count;
    });
    res.send(response);
});

app.get('/api/combined', async (req, res) => {
    const { month } = req.query;
    try {
        const statisticsResponse = await fetch(`${SERVER_URL}/api/statistics?month=${month}`);
        const statistics = await statisticsResponse.json();

        const itemRangeResponse = await fetch(`${SERVER_URL}/api/item_range?month=${month}`);
        const itemRanges = await itemRangeResponse.json();

        const categoryItemsResponse = await fetch(`${SERVER_URL}/api/category_items?month=${month}`);
        const categoryItems = await categoryItemsResponse.json();

        const combinedResponse = {
            ...statistics,
            ...categoryItems,
            item_ranges: itemRanges
        };
        res.send(combinedResponse);
    } catch (error) {
        console.error("Error fetching combined data:", error);
        res.status(500).send({ error: "Error fetching combined data" });
    }
});


database.connect().then(() => {
    console.log("connected to mongo");
    app.listen(process.env.SERVER_PORT, () => {
        console.log(`Started express on port ${process.env.SERVER_PORT}`)
    });
});