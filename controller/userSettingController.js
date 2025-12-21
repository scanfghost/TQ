var userSettingService = require('../service/userSettingService')
const { createFormatRes } = require('../common/formatRes')

async function modifyUserSetting(req, res){
    userSettingService.modifyInstantJudge(req.session.user.userEmail, req.body.instantJudge)
    res.end()
}

async function fetchUserSetting(req, res) {
    let formatRes = createFormatRes()
    console.log("userData:")
    console.dir(req.body)
    formatRes.data.userPreference = await userSettingService.getUserSetting(req.body.userEmail)
    res.json(formatRes)
}

module.exports = {
    modifyUserSetting,
    fetchUserSetting
}