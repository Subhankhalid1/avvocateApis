const express = require('express');
const cors = require('cors');
const DB = require('./config/db');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });
const messageModel = require('./models/messageModel');
const userModel = require('./models/userModel');

// Cors
app.use(cors());

// BodyParser
app.use(express.json({ extended: false }));

// DataBase
DB();

// Routes
app.get('/', (req, res) => {
    res.json('Server Running Successfully');
});
app.use("/api", require('./routes/userRoute'));

// get message
app.post("/api/messages", async (req, res) => {
    const _admin = await userModel.findOne({ role: 'admin' });
    const { userId } = req.body;
    const user1 = userId;
    const user2 = _admin._id;
    try {
        const newMessage = await messageModel.find({
            $or: [{ sender: user1, receiver: user2 },
            { sender: user2, receiver: user1 }]
        });
        return res.status(200).json(newMessage);
    } catch (error) {
        console.log(error);
    }
});

app.get("/api/messages/all", async (req, res) => {
    messageModel.find()
        .exec((err, data) => {
            if (data) {
                return res.status(200).json(data);
            }
        });
});

// Socket
io.on('connection', socket => {
    socket.on('join', (userId) => {
        socket.join(userId);
        socket.emit('join', { msg: "user joioned..!" })
    });

    socket.on('message', async ({ sender, message }) => {
        const _admin = await userModel.findOne({ role: 'admin' });
        if (_admin) {
            const _message = new messageModel({ sender, receiver: _admin._id, message });
            _message.save((err, data) => {
                if (data) {
                    io.to(sender).emit('message', data);
                    io.to(receiver).emit('message', data);
                }
            });
        }
    });

    socket.on('adminMessage', async ({ sender, receiver, message }) => {
        const _message = new messageModel({ sender, receiver, message });
        _message.save((err, data) => {
            if (data) {
                io.to(sender).emit('message', data);
                io.to(receiver).emit('message', data);
            }
        });
    });

    socket.on('disconnects', function () {
        socket.emit('notConnect', { msg: "user disconnected" });
    });

});

// Listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`App Listening on port ${PORT}`);
});