const pool = require('../../config/mysql2/connectionPool')
const { UserDto } = require('../../dto/UserDto')

async function getUser(userEmail) {
    try {
        const sql =
            `select 
            user.*, 
            subject.name as currentSubject, 
            chapter.name as currentChapter, 
            section.name as currentSection 
        from user 
        left join subject on user.subject_id = subject.id 
        left join chapter on  user.chapter_id = chapter.id
        left join section on user.section_id = section.id 
        where email = ?`
        const [rows] = await pool.query(sql, [userEmail])
        return rows
    } catch (err) {
        throw new Error(`getUser: ${err.message}`)
    }
}

async function validateUser(userEmail, userPasswd) {
    //code -1 means user is not existed, code n means nth param dismatch
    try {
        const result = await this.getUser(userEmail)
        if (result) {
            if (result[0].password == userPasswd) {
                const user = new UserDto(result[0].id, result[0].email, result[0].subject_id, result[0].chapter_id, result[0].section_id, result[0].currentSubject, result[0].currentChapter, result[0].currentSection, result[0].role)
                return { user: user, code: 0 }
            } else {
                return { user: null, code: 2 }
            }
        } else {
            return { user: null, code: -1 }
        }
    } catch (err) {
        throw new Error(`validateUser: ${err}`)
    }
}

async function saveUserChoice(userId, questionId, userOption, isChoiceCorrect) {
    const sql = 'insert into useranswer (user_id, question_id, choice_options, choice_correct) values(?, ?, ?, ?)'
    try {
        const [result] = await pool.query(sql,
            [
                userId,
                questionId,
                JSON.stringify(userOption),
                isChoiceCorrect ? 1 : 0
            ]
        )
        return result.insertId == -1 ? false : true
    } catch (err) {
        throw new Error(`saveUserChoice: ${err.code}`)
    }
}

async function modifyUserStudyPath(userId, newSubject, newChapter, newSection) {
    const [subjectId, chapterId, sectionId] = await getStudyPathIdByName(newSubject, newChapter, newSection)
    const sql = `
    update user 
    set 
        subject_id = ?, 
        chapter_id = ?, 
        section_id = ? 
    where id = ?`
    try {
        const [result] = await pool.query(sql,
            [
                subjectId,
                chapterId,
                sectionId,
                userId
            ]
        )
        if (result.affectedRows == 0) {
            throw new Error(`modifyUserStudyPath: User with ID ${userId} not found`)
        }

        return [subjectId, chapterId, sectionId]
    } catch (err) {
        throw new Error(`modifyUserStudyPath: ${err}`)
    }
}

async function getStudyPathIdByName(subjectName, chapterName, sectionName) {
    let sql =
        `select id from subject where name = ?`

    try {
        let result
        result = await pool.query(sql,
            [
                subjectName
            ]
        )
        if (result[0].length == 0) {
            throw new Error(`not found subjectId by ${subjectName}`)
        }
        const subjectId = result[0][0].id
        sql =
            `select id from chapter where subject_id = ? and name = ?`
        result = await pool.query(sql,
            [
                subjectId,
                chapterName
            ]
        )
        if (result[0].length == 0) {
            throw new Error(`not found chapterId by ${chapterName}`)
        }
        const chapterId = result[0][0].id
        sql =
            `select id from section where chapter_id = ? and name = ?`
            result = await pool.query(sql,
                [
                    chapterId,
                    sectionName
                ]
            )
        if (result[0].length == 0) {
            throw new Error(`not found sectionId by ${sectionName}`)
        }
        const sectionId = result[0][0].id
        return [subjectId, chapterId, sectionId]
    } catch (err) {
        console.dir(err)
        throw new Error(`getStudyPathIdByName: ${err}`)
    }
}

module.exports = {
    validateUser,
    getUser,
    saveUserChoice,
    modifyUserStudyPath
}