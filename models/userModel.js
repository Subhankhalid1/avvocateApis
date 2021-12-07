const mongoose = require('mongoose');
const user = new mongoose.Schema({

    name: { type: String },
    surname: { type: String },
    email: { type: String },
    dob: { type: String },
    password: { type: String },
    role: { type: String, default: "user" },
    socialId: { type: String },
    isBan: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('user', user);