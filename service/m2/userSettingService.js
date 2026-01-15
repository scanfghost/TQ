const pool = require('../../config/mysql2/connectionPool')
const { UserSettingDto } = require('../../dto/UserSettingDto')

async function getUserSetting(userId) {
    const sql = 'select * from usersetting where user_id = ?'
    try {
        const [result] = await pool.query(sql, userId)
        if (result.length == 0) {
            throw new Error(`getUserSetting: no result`)
        }
        const userSettingDto = new UserSettingDto(result[0].user_id, result[0].instant_judge)
        return userSettingDto
    } catch (err) {
        throw new Error(`getUserSetting: ${err.message}`)
    }
}

async function modifyInstantJudge(userId, instantJudge) {
    const sql = 'update usersetting set instant_judge = ? where user_id = ?'
    if (typeof(instantJudge) == 'boolean') {
        instantJudge = instantJudge == true ? 1 : 0
    }
    try {
        const [result] = await pool.query(sql, 
            [
                instantJudge,
                userId
            ]
        )
        if (result.affectedRows == 0) {
            throw new Error(`modifyInstantJudge: User with ID ${userId} not found`)
        }
        return result.affectedRows == 1 ? true : false
    } catch (err) {
        throw new Error(`modifyInstantJudge: ${err.code}`)
    }
}

module.exports = {
    getUserSetting,
    modifyInstantJudge
}