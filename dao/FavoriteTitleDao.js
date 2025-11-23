const mongoose = require('mongoose')

const favoriteTitleSchema = new mongoose.Schema({
    fuseremail: String,
    ftitleid: mongoose.Schema.Types.ObjectId,
    subject: String,
    chapter: String,
    section: String,
    comment: String,
    keywords: [String]
})

module.exports = mongoose.model('FavoriteTitle', favoriteTitleSchema, 'favoritetitle')
