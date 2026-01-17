const m2UserSettingService = require('../service/m2/userSettingService')
const { createFormatRes } = require('../common/formatRes')

async function modifyUserSetting(req, res) {
    let formatRes = createFormatRes()
    try {
        await m2UserSettingService.modifyInstantJudge(req.session.user.id, req.body.instantJudge)
    } catch (err) {
        res.status(500)
        formatRes.errMsg = `${err.message}`
    }
    res.end()
}

// async function fetchUserSetting(req, res) {
//     let formatRes = createFormatRes()
//     formatRes.data.userPreference = await userSettingService.getUserSetting(req.body.userEmail)
//     res.json(formatRes)
// }

module.exports = {
    modifyUserSetting
}