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
                Array.isArray(item[1]) &&
                item[1].length > 0 &&
                item[1].every(ans => Array.isArray(ans) )
                )
            },
            message: 'qa must be an array of [ObjectId, Array] tuples'
        }
    }
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
})

module.exports = mongoose.model('HistoryAnswer', historyAnswerSchema, 'historyanswer')