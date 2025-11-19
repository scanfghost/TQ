var mongoose = require('mongoose')

var userAnswerSchema = new mongoose.Schema({
    fcollection: String,
    fuseremail: String,
    ftitleid: mongoose.Schema.Types.ObjectId,
    type: {
        type: String,
        enum: ["choice", "fill", "answer"],
        required: true
    },
    userOption: [[Number]],
    isChoiceCorrect: Boolean
})

module.exports = mongoose.model('UserAnwser', userAnswerSchema, 'useranswer')