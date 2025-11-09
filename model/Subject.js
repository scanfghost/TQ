var mongoose = require('mongoose')

var subjectSchema = new mongoose.Schema({
    subject: String,
    chapters: {
        type: Map,
        of: mongoose.Schema.Types.ObjectId
    }
})

module.exports = mongoose.model('Subject', subjectSchema, 'subject')