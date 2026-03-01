require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("./models/Order");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        const orders = await Order.find().sort({ createdAt: -1 }).limit(1);
        console.log(JSON.stringify(orders[0].items, null, 2));
        process.exit(0);
    })
    .catch(err => console.error(err));
