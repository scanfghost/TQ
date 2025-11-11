var mongoose = require('mongoose')

var userAnswerSchema = new mongoose.Schema({
    fcollection: String,
    fuseremail: String,
    ftitleid: mongoose.Schema.Types.ObjectId,
    answerIndex: Number
})

module.exports = mongoose.model('UserAnwser', userAnswerSchema, 'useranswer')