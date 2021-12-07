const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/keys');

const decodeUser = (req, res) => {
    const { token } = req.headers;
    try {
        var decoded = jwt.verify(token, jwtSecret);
        return decoded.data;
    } catch (err) {
        res.status(400).json(err.message);
    }
}

module.exports = decodeUser;