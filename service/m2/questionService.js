const pool = require('../../config/mysql2/connectionPool')
const { QuestionDto, createBasicChoice, createBasicUserAnswer } = require('../../dto/QuestionDto')
const m2ImageService = require('./imageService')

async function getQuestionCountByStudyPath(subjectId, chapterId, sectionId) {
    const sql = 'select count(*) as count from question where subject_id = ? and chapter_id = ? and section_id = ?'
    try {
        const [rows] = await pool.query(sql,
            [
                subjectId,
                chapterId,
                sectionId
            ]
        )

        return rows[0].count
    } catch (err) {
        throw new Error(`getQuestionCount: ${err}`)
    }
}

async function getUserAnswerCountByStudyPath(userId, subjectId, chapterId, sectionId) {
    const sql =
        `select 
        count(*) as count 
    from useranswer 
    inner join question on  question.id = useranswer.question_id
    where question.subject_id = ? and question.chapter_id = ? and question.section_id = ? and useranswer.user_id = ?`
    try {
        const [result] = await pool.query(sql,
            [
                subjectId,
                chapterId,
                sectionId,
                userId
            ]
        )

        if (result.length == 0) {
            throw new Error(`not found by ${subjectId}-${chapterId}-${sectionId}-userId_${userId}`)
        }

        return result[0].count
    } catch (err) {
        throw new Error(`getUserAnswerCountByStudyPath: ${err}`)
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

        const titleImageDtoList = await m2ImageService.getAllTypeImageByQuestionId(questionId, "title")
        const explanImageDtoList = await m2ImageService.getAllTypeImageByQuestionId(questionId, "explanation")

        let questionDto = new QuestionDto(
            result[0].id,
            result[0].type,
            result[0].title,
            createBasicChoice(
                result[0].option_type,
                result[0].shared_options,
                result[0].individual_options,
                result[0].right_option),
            result[0].explanation,
            result[0].subject_id,
            result[0].chapter_id,
            result[0].section_id,
            result[0].serial
        )

        if (titleImageDtoList) {
            questionDto.insertTitleImages(titleImageDtoList)
        }

        if (explanImageDtoList) {
            questionDto.insertExplanImages(explanImageDtoList)
        }

        return questionDto
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

        const titleImageDtoList = await m2ImageService.getAllTypeImageByQuestionId(questionId, "title")
        const explanImageDtoList = await m2ImageService.getAllTypeImageByQuestionId(questionId, "explanation")

        const questionDto = new QuestionDto(
            result[0].id,
            result[0].type,
            result[0].title,
            createBasicChoice(
                result[0].option_type,
                result[0].shared_options,
                result[0].individual_options,
                result[0].right_option),
            result[0].explanation,
            result[0].subject_id,
            result[0].chapter_id,
            result[0].section_id,
            result[0].serial
        )

        questionDto.insertChoiceUserAnswer(createBasicUserAnswer(result[0].userOption, result[0].isCorrect))
        
        if (titleImageDtoList) {
            questionDto.insertTitleImages(titleImageDtoList)
        }

        if (explanImageDtoList) {
            questionDto.insertExplanImages(explanImageDtoList)
        }
        
        return questionDto
    } catch (err) {
        throw new Error(`getQuestionUserAnswerById: ${err}`)
    }
}

function equalChoice(userOption, rightOption) {
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

async function editChoiceQuestion(questionId, newTitle, newexplanation) {
    const sql =
        `update question
    set
        title = ?,
        explanation = ?
    where id = ?`
    try {
        const [result] = await pool.query(sql,
            [
                newTitle,
                newexplanation,
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

async function saveHistoryAnswerByStudyPath(userId, subjectId, chapterId, sectionId) {
    let connection
    try {
        const finishedCount = await getUserAnswerCountByStudyPath(userId, subjectId, chapterId, sectionId)
        const questionCount = await getQuestionCountByStudyPath(subjectId, chapterId, sectionId)

        connection = await pool.getConnection()

        //细节获取连接在抛出异常前，保证回滚正常
        if (finishedCount < questionCount) {
            throw new Error('还有题目未完成')
        }
        
        await connection.beginTransaction()

        let entireSame = true

        let sql = 
        `select id from question where subject_id = ? and chapter_id = ? and section_id = ?`

        const [questionIds] = await pool.query(sql, 
            [
                subjectId,
                chapterId,
                sectionId
            ]
        )

        for(let item of questionIds){
            const qid = item.id
            sql = 
            `select choice_options, choice_correct from useranswer where user_id = ? and question_id = ?`
            const [useranswers] = await pool.query(sql,
                [
                    userId,
                    qid
                ]
            )

            if (useranswers.length == 0) {
                continue
            }

            const {choice_options, choice_correct} = useranswers[0]

            sql = 
            `select * from historyanswer where user_id = ? and question_id = ?`

            const [historyanswers] = await pool.query(sql,
                [
                    userId,
                    qid
                ]
            )

            let maxAttempNumber = 0, existing = false
            for(let item of historyanswers){
                if (maxAttempNumber < item.attemp_number) {
                    maxAttempNumber = item.attemp_number
                }
                if (equalChoice(item.choice_options, choice_options)) {
                    existing = true
                    break
                }
            }

            if (existing == false) {
                entireSame = false
                sql = 
                `insert into historyanswer (user_id, question_id, choice_options, choice_correct, attemp_number) values(?, ?, ?, ?, ?)`
                const [rows] = await pool.query(sql, 
                    [
                        userId,
                        qid,
                        JSON.stringify(choice_options),
                        choice_correct,
                        maxAttempNumber + 1
                    ]
                )
                if(rows.affectedRows == 0){
                    throw new Error(`insert historyanswer failed`)
                }
            }
            
        }

        if (entireSame) {
            throw new Error('已存在和现在答题情况相同版本')
        }

        await connection.commit()
    } catch (err) {
        await connection.rollback()
        console.log(`saveHistoryAnswerByStudyPath: ${err}`)
        throw new Error(`${err.message}`)
    }
}

async function addFavoriteQuestion(userId, questionId, keywords, comment) {
    if(!Array.isArray(keywords)){
        throw new Error(`keywords must be an array`)
    }
    if (typeof comment === 'string' && comment.length > 300) {
        throw new Error('评论内容不能超过 300 个字符')
    }
    try {
        let sql = 
        `select count(*) as count from favoritequestion where user_id = ? and question_id = ?`

        const [existedCount] = await pool.query(sql,
            [
                userId,
                questionId
            ]
        )

        if (existedCount[0].count > 0) {
            throw new Error(`the question is already favorited`)
        }

        sql = 
        `insert into favoritequestion (user_id, question_id, keywords, comment) values(?, ?, ?, ?)`

        const [result] = await pool.query(sql,
            [
                userId,
                questionId,
                JSON.stringify(keywords),
                comment
            ]
        )

        if (result.affectedRows == 0) {
            throw new Error(`add favorite question failed by database`)
        }
    } catch (err) {
        console.log(`addFavoriteTitle: ${err}`)
        throw new Error(`${err}`)
    }
}

async function removeUserAnswerByStudyPath(userId, subjectId, chapterId, sectionId) {
    const sql = 
    `delete ua
    from useranswer ua
    inner join question q on  ua.question_id = q.id
    where q.subject_id = ? and q.chapter_id = ? and q.section_id = ? and ua.user_id = ?`

    try {
        const [result] = await pool.query(sql,
            [
                subjectId,
                chapterId,
                sectionId,
                userId
            ]
        )

        return result.affectedRows
    } catch (err) {
        console.log(`removeUserAnswerByStudyPath: ${err}`)
        throw new Error(`${err.message}`)
    }
}


module.exports = {
    getQuestionCountByStudyPath,
    getQuestionById,
    getIdSerialUserAnswerByStudyPath,
    getQuestionUserAnswerById,
    equalChoice,
    editChoiceQuestion,
    saveHistoryAnswerByStudyPath,
    addFavoriteQuestion,
    removeUserAnswerByStudyPath
}