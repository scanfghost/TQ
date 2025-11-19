var mongoose = require('mongoose')
var historyAnswerSchema = new mongoose.Schema({
    fcollection: String,
    fuseremail: String,
    qa: {
        type: mongoose.Schema.Types.Mixed,
        validate: {
            validator: function (v) {
                if(!Array.isArray(v)) return false
                return v.every(item => Array.isArray(item) && 
                item.length == 2 && 
                mongoose.Types.ObjectId.isValid(item[0]) && 
                typeof item[1] === 'number'
                )
            },
            message: 'qa must be an array of [ObjectId, Number] tuples'
        }
    }
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
})

module.exports = mongoose.model('HistoryAnswer', historyAnswerSchema, 'historyanswer')