var mongoose = require('mongoose')

var chapterSchema = new mongoose.Schema({
    chapter: String,
    sections: {
        type: Map,
        of: String
    }
})

module.exports = mongoose.model('Chapter', chapterSchema, 'chapter')