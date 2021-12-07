const mongoose = require('mongoose');
const message = new mongoose.Schema({

    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    message: { type: String, required: true }

}, { timestamps: true });

module.exports = mongoose.model('message', message);