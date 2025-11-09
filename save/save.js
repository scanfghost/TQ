var chapter01 = require('./chapter01')
var OSChapter02 = require('./OSChapter02')
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/NEMTQ')

var titleSchema = new mongoose.Schema({
    title: String,
    choice: [String],
    rightIndex: Number
})

var Title = mongoose.model('Title', titleSchema, 'OSChapter02')

OSChapter02.forEach(title => {
    Title(title).save()
        .then(doc => {
            console.log(doc)
        })
        .catch(err => {
            console.log('save err: ' + err)
        })
});