const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require("../config/keys");
const passwordHash = require('password-hash');
const nodemailer = require('nodemailer');
const auth = require("../Middleware/Middleware");
require("dotenv").config()
exports.create = async (req, res) => {
    const { name, surname, email, dob, password, role } = req.body;
    userModel.findOne({ email: email })
        .exec((error, user) => {
            if (error) return res.status(400).json(error.message);
            if (user) {
                return res.status(400).json({ message: 'User already exist' });
            }
            if (!user) {
                const hashedPassword = passwordHash.generate(password);
                const _user = new userModel({
                    name, surname, email, dob, password: hashedPassword, role
                });

                _user.save((error, user) => {
                    if (error) return res.status(400).json(error.message);
                    if (user) {
                        const token = jwt.sign({
                            data: user._id
                        }, jwtSecret, { expiresIn: '1d' });
                        return res.status(200).json({ user, token });
                    }
                });
            }
        });
}

exports.signin = (req, res) => {
    userModel.findOne({ email: req.body.email })
        .exec((error, user) => {
            if (error) return res.status(400).json(error.message);
            if (!user) return res.status(400).json({
                message: "invalid Credentials",
            });
            if (user) {
                let isMatch = passwordHash.verify(req.body.password, user.password); // true
                if (isMatch) {
                    let token = jwt.sign({
                        data: user._id
                    }, jwtSecret, { expiresIn: '1d' });
                    return res.status(200).json({
                        token,
                        user,
                    });
                }
                if (!isMatch) {
                    return res.status(400).json({
                        message: "invalid Credentials"
                    });
                }
            }
        });
}

exports.update = (req, res) => {
    const _decode = auth(req, res);
    if (_decode) {
        const { userId, name, surname, email, dob, password } = req.body;
        let ModifyObj = {};
        if (name) { ModifyObj.name = name };
        if (surname) { ModifyObj.surname = surname };
        if (email) { ModifyObj.email = email };
        if (dob) { ModifyObj.dob = dob };
        if (password) { ModifyObj.password = password };

        userModel.findOneAndUpdate(
            { _id: userId },
            { $set: ModifyObj },
            { new: true }
        )
            .exec((error, user) => {
                if (error) return res.status(400).json(error.message);
                if (user) return res.status(200).json({ user, token: req.headers.token });
            });
    }
}

exports.sendEmail = (req, res) => {
    const _decode = auth(req, res);
    if (_decode) {
        const { name, surname, email, message } = req.body;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true, // true for 465, false for other ports
            logger: true,
            debug: true,
            secureConnection: false,
            auth: {
                user: 'rsubhankhalid@gmail.com',
                pass: 'vsrcvbvivlannbbt'
                // user: process.env.AUTH_EMAIL,
                // pass: process.env.AUTH_PASS
            },
            tls: {
                rejectUnAuthorized: true
            }

        });

        const mailOptions = {
            from: email,
            to: 'rsubhankhalid@gmail.com',
            subject: 'Email by Avvaocato user',
            html: `
            <p>Name: ${name}</p>
            <p>Surname: ${surname}</p>
            <p>message: ${message}</p>
            `
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.status(400).json(error.message);
            }
            if (info.response) {
                return res.status(200).json({ message: 'Email send successfully' });
            }
        });
    }
}

exports.consultant = (req, res) => {
    const _decode = auth(req, res);
    if (_decode) {

        const { name, surname, email, message } = req.body;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'myavvocatoapp@gmail.com',
                pass: 'mlimohwboxhcfffo'
            }
        });

        const mailOptions = {
            from: email,
            to: 'myavvocatoapp@gmail.com',
            subject: 'Email by Avvaocato Consultant Services',
            html: `
            <p>Name: ${name}</p>
            <p>Surname: ${surname}</p>
            <p>message: ${message}</p>
            `
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.status(400).json(error.message);
            }
            if (info.response) {
                return res.status(200).json({ message: 'Send request successfully' });
            }
        });
    }
}

exports.socialMedia = (req, res) => {
    const { name, email, id } = req.body;
    userModel.findOne({ socialId: id })
        .exec((error, user) => {
            if (error) return res.status(400).json(error.message);
            if (user) {
                let socialObj = {};
                if (name) { socialObj.name = name };
                if (email) { socialObj.email = email };
                userModel.findOneAndUpdate(
                    { socialId: id },
                    { $set: socialObj },
                    { new: true }
                ).exec((error, user) => {
                    if (error) return res.status(400).json(error.message);
                    if (user) {
                        const token = jwt.sign({
                            data: user._id
                        }, jwtSecret, { expiresIn: '1d' });
                        return res.status(200).json({ user, token });
                    }
                });
            }
            if (!user) {
                const _user = new userModel({
                    name, email, socialId: id
                });

                _user.save((error, user) => {
                    if (error) return res.status(400).json(error.message);
                    if (user) {
                        const token = jwt.sign({
                            data: user._id
                        }, jwtSecret, { expiresIn: '1d' });
                        return res.status(200).json({ user, token });
                    }
                });
            }
        });
}

exports.Refresh = (req, res) => {
    const _decode = auth(req, res);
    userModel.findOne({ _id: _decode })
        .exec((error, user) => {
            if (error) return res.status(400).json(error.message);
            if (user) {
                return res.status(200).json({ user });
            }
        })
}

exports.getAllUsers = (req, res) => {
    userModel.find({ role: 'user' }).sort({ createdAt: -1 })
        .exec((error, user) => {
            if (error) return res.status(400).json(error.message);
            if (user) {
                return res.status(200).json(user);
            }
        })
}

exports.userBan = (req, res) => {
    userModel.findOneAndUpdate({ _id: req.body.id }, { $set: { isBan: true } })
        .exec((error, user) => {
            if (error) return res.status(400).json(error.message);
            if (user) {
                return res.status(200).json({ success: 'User Banned' });
            }
        })
}

exports.userUnBan = (req, res) => {
    userModel.findOneAndUpdate({ _id: req.body.id }, { $set: { isBan: false } })
        .exec((error, user) => {
            if (error) return res.status(400).json(error.message);
            if (user) {
                return res.status(200).json({ success: 'User UnBanned' });
            }
        })
}

exports.GetEmail = (req, res) => {
    userModel.findOne({ email: req.body.email })
        .exec((error, data) => {
            if (error) return res.status(400).json(error.message);
            if (data) {
                return res.status(200).json({ success: true });
            }
            if (!data) {
                return res.status(200).json({ success: false });
            }
        })
}

exports.updatePassword = (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = passwordHash.generate(password);
    let ModifyObj = {};
    if (password) { ModifyObj.password = hashedPassword };

    userModel.findOneAndUpdate(
        { email: email },
        { $set: ModifyObj },
        { new: true }
    )
        .exec((error, user) => {
            if (error) return res.status(400).json(error.message);
            if (user) return res.status(200).json({ message: 'Password Update Successfully' });
        });
}