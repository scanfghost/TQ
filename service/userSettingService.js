var UserSettingDao = require('../dao/UserSettingDao')

async function getUserSetting(userEmail) {
    try {
        const result = await UserSettingDao.findOne({userEmail: userEmail})
        return result
    } catch (err) {
        console.log('getUserSetting err: ' + err)
    }
}

function modifyInstantJudge(userEmail, instantJudge) {
    UserSettingDao.findOneAndUpdate(
        {userEmail: userEmail},
        {instantJudge: instantJudge}
    )
    .catch((err)=> {
        console.log('modifyInstantJudge err: ' + err)
    })
}

module.exports = {
    getUserSetting,
    modifyInstantJudge
}