var mongoose = require('mongoose')

var UserSettingSchema = new mongoose.Schema({
    userEmail: String,
    instantJudge: Boolean
})

module.exports = mongoose.model('UserSetting', UserSettingSchema, 'usersetting')