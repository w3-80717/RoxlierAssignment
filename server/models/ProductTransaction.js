const mongoose = require('mongoose');
const productTransactionSchema = new mongoose.Schema({
    id: {
        type: BigInt,
        required: true,
        unique: true,
        index:true
    },
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    sold: Boolean,
    dateOfSale: Date
});

module.exports = mongoose.model('ProductTransaction', productTransactionSchema);