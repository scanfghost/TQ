const m2UserSettingService = require('../service/m2/userSettingService')
const { createFormatRes } = require('../common/formatRes')

async function modifyUserSetting(req, res) {
    let formatRes = createFormatRes()
    try {
        await m2UserSettingService.modifyInstantJudge(req.session.user.id, req.body.instantJudge)
        formatRes.data.success = true
    } catch (err) {
        res.status(500)
        formatRes.errMsg = `${err.message}`
        console.dir(err)
    }
    res.json(formatRes)
}

async function fetchUserSetting(req, res) {
    let formatRes = createFormatRes()
    formatRes.data.settings = await m2UserSettingService.getUserSetting(req.session.user.id)
    res.json(formatRes)
}

module.exports = {
    modifyUserSetting,
    fetchUserSetting
}