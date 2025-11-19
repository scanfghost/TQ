var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        unique: true,
        trim: true
    },
    userPasswd: String,
    currentSubject: String,
    currentChapter: String,
    currentSection: String,
    role: String
})

module.exports = mongoose.model('User', UserSchema, 'user')