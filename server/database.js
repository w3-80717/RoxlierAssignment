const mongoose = require('mongoose');
exports.connect = () => {
    return mongoose.connect(process.env.MONGO_URI, {
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASS,
        dbName: "RoxlierAssignment"
    });
}