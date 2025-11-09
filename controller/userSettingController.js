var userSettingService = require('../service/userSettingService')

async function modifyUserSetting(req, res){
    userSettingService.modifyInstantJudge(req.session.userEmail, req.body.instantJudge)
    res.end()
}

module.exports = {
    modifyUserSetting
}