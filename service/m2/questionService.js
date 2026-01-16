const pool = require('../../config/mysql2/connectionPool')
const { QuestionDto, createBasicChoice, createBasicUserAnswer } = require('../../dto/QuestionDto')
async function getQuestionCount(subject, chapter, section) {
    const sql = 'select count(*) as count from question where subject_id = ? and chapter_id = ? and section_id = ?'
    try {
        const [rows] = await pool.query(sql, 
            [
                subject,
                chapter,
                section
            ]
        )

        return rows[0].count
    } catch (err) {
        throw new Error(`getQuestionCount: ${err}`)
    }
}

async function getQuestionById(questionId) {
    const sql = 'select * from question where id = ?'
    try {
        const [result] = await pool.query(sql, 
            [
                questionId
            ]
        )
        if (result.length == 0) {
            throw new Error(`题目不存在`)
        }

        return new QuestionDto(
            result[0].id,
            result[0].type,
            result[0].title,
            createBasicChoice(
                result[0].option_type,
                result[0].shared_options,
                result[0].individual_options,
                result[0].right_option),
            result[0].explantion,
            result[0].title_imgs,
            result[0].explan_imgs,
            result[0].subject_id,
            result[0].chapter_id,
            result[0].section_id,
            result[0].serial
        )
    } catch (err) {
        throw new Error(`getQuestionById: ${err.message}`)
    }
}

async function getIdSerialUserAnswerByStudyPath(user) {
    const sql = 
    `select 
        question.id, 
        question.serial,
        useranswer.choice_options as userOption,
        useranswer.choice_correct as isCorrect
    from question 
    left join useranswer on question.id = useranswer.question_id
    where subject_id = ? and chapter_id = ? and section_id = ?`
    try {
        const [result] = await pool.query(sql,
            [
                user.subjectId,
                user.chapterId,
                user.sectionId
            ]
        )

        if (result.affectedRows == 0) {
            throw new Error(`not found by ${user.currentSubject}/${user.currentChapter}/${user.currentSection}`)
        }

        return result
    } catch (err) {
        throw new Error(`getIdSerialByStudyPath: ${err}`)
    }
}

async function getQuestionUserAnswerById(questionId, user) {
    const sql = 
    `select
        question.*, 
        useranswer.choice_options as userOption, 
        useranswer.choice_correct as isCorrect
    from question
    left join useranswer on question.id = useranswer.question_id and useranswer.user_id = ?
    where question.id = ?`

    try {
        const [result] = await pool.query(sql,
            [
                user.id,
                questionId
            ]
        )

        if (result.length == 0) {
            throw new Error(`题目不存在`)
        }

        const questionDto = new QuestionDto(
            result[0].id,
            result[0].type,
            result[0].title,
            createBasicChoice(
                result[0].option_type,
                result[0].shared_options,
                result[0].individual_options,
                result[0].right_option),
            result[0].explantion,
            result[0].title_imgs,
            result[0].explan_imgs,
            result[0].subject_id,
            result[0].chapter_id,
            result[0].section_id,
            result[0].serial
        )
        questionDto.insertChoiceUserAnswer(createBasicUserAnswer(result[0].userOption, result[0].isCorrect))
        return questionDto
    } catch (err) {
        throw new Error(`getQuestionUserAnswerById: ${err}`)
    }
}

function judgeChoice(userOption, rightOption) {
    if (!Array.isArray(userOption) || userOption.length != rightOption.length) {
        return false
    }
    
    for (let i = 0; i < rightOption.length; i++) {
        if (userOption[i].length != rightOption[i].length) {
            return false
        }
        for (let j = 0; j < rightOption[i].length; j++) {
            if (userOption[i][j] != rightOption[i][j]) {
                return false
            }
        }
    }
    return true
}

async function editChoiceQuestion(questionId, newTitle, newExplantion) {
    const sql = 
    `update question
    set
        title = ?,
        explantion = ?
    where id = ?`
    try {
        const [result] = await pool.query(sql,
            [
                newTitle,
                newExplantion,
                questionId
            ]
        )
        if (result.affectedRows == 0) {
            throw new Error(`not found by id_${questionId}`)
        }
    } catch (err) {
        throw new Error(`editChoiceQuestion: ${err}`)
    }
}

module.exports = {
    getQuestionCount,
    getQuestionById,
    getIdSerialUserAnswerByStudyPath,
    getQuestionUserAnswerById,
    judgeChoice,
    editChoiceQuestion
}