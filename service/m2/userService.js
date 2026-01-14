const pool = require('../../config/mysql2/connectionPool')

async function getUser(userEmail) {
    try {
        const sql = 'select * from user where email = ?'
        const [rows] = await pool.query(sql, [userEmail])
        return rows
    } catch (err) {
        throw new Error(`getUser: ${err.message}`)
    }
}

async function validateUser(userEmail, userPasswd) {
    //code -1 means user is not existed, code n means nth param dismatch
    const result = await this.getUser(userEmail)
    if (result) {
        const user = result[0]
        if (user.password == userPasswd) {
            return { user: user, code: 0 }
        } else {
            return { user: null, code: 2 }
        }
    } else {
        return { user: null, code: -1 }
    }
}

async function saveUserChoice(userId, questionId, userOption, isChoiceCorrect) {
    const sql = 'insert into useranswer (user_id, question_id, choice_options, choice_correct) values(?, ?, ?, ?)'
    try {
        const [result] = await pool.query(sql,
            [
                userId,
                questionId,
                userOption,
                isChoiceCorrect ? 1 : 0
            ]
        )
        return result.insertId == -1 ? false : true
    } catch (err) {
        throw new Error(`saveUserChoice: ${err.code}`)
    }
}

async function modifyUserStudyPath(userId, newSubject, newChapter, newSection) {
    const sql = 'update user set currentSubject = ?, currentChapter = ?, currentSection = ? where id = ?'
    try {
        const [result] = await pool.query(sql,
            [
                newSubject,
                newChapter,
                newSection,
                userId
            ]
        )
        if (result.affectedRows == 0) {
            throw new Error(`modifyUserStudyPath: User with ID ${userId} not found`)
        }
        return result.affectedRows == 1 ? true : false
    } catch (err) {
        throw new Error(`modifyUserStudyPath: ${err}`)
    }
}

module.exports = {
    validateUser,
    getUser,
    saveUserChoice,
    modifyUserStudyPath
}