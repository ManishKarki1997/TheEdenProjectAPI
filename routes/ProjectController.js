const express = require("express");
const deleteFile = require('../utils/deleteFile')
const ProjectValidation = require('../validation/ProjectValidation');
const VerifyToken = require('../middlewares/verifyToken');

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


Router.get('/', async (req, res) => {
    try {
        const pageNumber = parseInt(req.query.pageNumber) || 2;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const projects = await Project.find({})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({
                createdAt: -1
            })
        //   populate later

        return res.send(projects);
    } catch (error) {
        return res.send({
            error: true,
            message: "Oops! Something went wrong."
        })
    }
});

Router.post('/', VerifyToken, upload.single('image'), async (req, res) => {
    try {
        const {
            title,
            description,
            user,
            technology
        } = req.body;

        const {
            error
        } = ProjectValidation(req.body);

        if (error) {
            return res.send({
                error: true,
                message: error.details[0].message
            })
        }

        const project = new ProjectModel({
            title,
            description,
            image: req.file.filename,
            user,
            technology
        });

        const result = await project.save();

        return res.send(result);

    } catch (error) {
        return res.send({
            error: true,
            message: "Oops, Something went wrong!"
        });
    }
});

Router.put('/', VerifyToken, upload.single('image'), async (req, res) => {
    try {
        const {
            title,
            description,
            technology,
            projectId
        } = req.body;
        let originalProject = await ProjectModel.findById(projectId);

        if (req.file.filename) {
            deleteFile(originalProject.image);
            originalProject.image = req.file.filename;
        }
        originalProject.title = title || originalProject.title;
        originalProject.description = description || originalProject.description;
        originalProject.technology = technology || originalProject.technology;

        const result = await originalProject.save();
        return res.send(result);

    } catch (error) {
        return res.send({
            error: true,
            message: "Oops, Something went wrong!"
        })
    }
});

Router.delete('/:projectId', VerifyToken, async (req, res) => {
    try {
        const project = await ProjectModel.findById(req.params.projectId);
        const userId = req.user.id;

        if (project.user != userId) {
            return res.send({
                error: true,
                message: "You do not have the permission to perform this action!"
            })
        };
        deleteFile(project.image);
        await ProjectModel.findByIdAndDelete(req.params.projectId);
        return res.send('Successfully Deleted');


    } catch (error) {
        return res.send({
            error: true,
            message: "Oops, something went wrong!"
        })
    }
})

Router.post('/bookmark', VerifyToken, async (req, res) => {
    try {
        const {
            projectId
        } = req.body;
        const userId = req.user.id;

        const user = await UserModel.findById(userId);
        user.bookmarks.push(projectId);
        await user.save();
        return res.send("Successfully Bookmarked");

    } catch (error) {
        return res.send({
            error: true,
            message: "Oops, Something went wrong. Please try again later."
        })
    }
})

module.exports = Router;