var UserSetting = require('../model/UserSetting')

async function getUserSetting(userEmail) {
    try {
        const result = await UserSetting.findOne({userEmail: userEmail})
        return result
    } catch (err) {
        console.log('getUserSetting err: ' + err)
    }
}

function modifyInstantJudge(userEmail, instantJudge) {
    UserSetting.findOneAndUpdate(
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