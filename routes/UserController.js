const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserValidation = require('../validation/UserValidation');
const deleteFile = require('../utils/deleteFile')

const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname); //apparently windows doesnt like files that includes ':' in their name
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/gif"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter
});

const UserModel = require("../models/User");
const ProjectModel = require("../models/Project");

const Router = express.Router();

Router.get("/:username", async (req, res) => {
    try {
        const users = await UserModel.findOne({
            username: req.params.username
        });
        return res.send({
            error: false,
            users
        });
    } catch (error) {
        return res.send({
            error: true,
            message: "Something unexpected happened"
        });
    }
});

Router.post("/", upload.single("avatar"), async (req, res) => {
    try {
        const {
            name,
            username,
            email,
            password,
            bio
        } = req.body;

        // Todo: delete saved image if signup fails

        const {
            error
        } = UserValidation(req.body);
        if (error) {
            return res.send({
                error: true,
                message: error.details[0].message
            })
        };


        // Check for duplicate email
        const existingEmail = await UserModel.findOne({
            email
        });
        if (existingEmail) {
            deleteFile(req.file.filename);
            return res.send({
                error: true,
                message: "User with that email already exists"
            });
        }

        // Check for duplicate username
        const existingUsername = await UserModel.findOne({
            username
        });
        if (existingUsername) {
            deleteFile(req.file.filename);

            return res.send({
                error: true,
                message: "User with that username already exists"
            });
        }

        const saltRounds = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new UserModel({
            name,
            username,
            email,
            password: hashedPassword,
            avatar: req.file.filename,
            bio
        });

        const result = await user.save();

        // Todo: fix dotenv config not working  process.env.JWT_TOKEN_SECRET
        const jwtToken = jwt.sign({
            id: result._id
        }, 'randomjsonwebtokenfornow999');

        return res.send({
            jwtToken,
            user: result
        });
    } catch (error) {
        return res.send({
            error: true,
            message: error
        });
    }
});

Router.post('/login', async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;
        const user = await UserModel.findOne({
            username
        });

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (passwordMatches) {
            const jwtToken = jwt.sign({
                id: user._id
            }, 'randomjsonwebtokenfornow999');
            return res.send({
                jwtToken
            });
        } else {
            return res.send({
                error: true,
                message: "Invalid Credentials."
            })
        }

    } catch (error) {
        return res.send({
            error: true,
            message: "Something went wrong while logging in. Please try again later."
        })
    }
})

module.exports = Router;