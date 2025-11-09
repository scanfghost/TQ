var mongoose = require('mongoose')

var userAnswerSchema = new mongoose.Schema({
    fcollection: String,
    fid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Title',
        required: true
    },
    answerIndex: Number
})

module.exports = mongoose.model('UserAnwser', userAnswerSchema, 'useranswer')