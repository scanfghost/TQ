var mongoose = require('mongoose')

var titleSchema = new mongoose.Schema({
    title: String,
    choice: [String],
    rightIndex: Number,
    explanation: String,
    img: String
})

function getTitleModel(collectionName) {
    return mongoose.model(collectionName, titleSchema, collectionName);
}

module.exports = {
    getTitleModel
}