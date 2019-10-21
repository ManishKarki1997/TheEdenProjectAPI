const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    technology: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technology'
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    posted_date: {
        type: Date,
        default: Date.now()
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    likes: {
        type: Number,
        default: 0
    },
    likers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
})

ProjectSchema.index({
    technology: 'text',
    title: 'text'
});


module.exports = mongoose.model('Project', ProjectSchema);