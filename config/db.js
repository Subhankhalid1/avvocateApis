const mongoose = require("mongoose");
const { mongoURI } = require("./keys");

const mongoConnect = () => {
    try {
        mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected Successfully");
    } catch (err) {
        console.log("Error while DB connection");
    }
}

module.exports = mongoConnect;