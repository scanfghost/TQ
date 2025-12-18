const {getTitleModel} = require('../dao/TitleDao')
const userAnswerDao = require('../dao/UserAnswerDao')
const historyAnswerDao = require('../dao/HistoryAnswerDao')
const subjectDao = require('../dao/SubjectDao')
const chapterDao = require('../dao/ChapterDao')
const {TitleDto} = require('../dto/TitleDto')
const favoriteTitleDao = require('../dao/FavoriteTitleDao')
const {FavoriteTitleDto} = require('../dto/FavoriteTitleDto')

async function getSizeOfAllTitle(collectionName) {
    try {
        const titleDao = getTitleModel(collectionName)
        return await titleDao.countDocuments()
    } catch (err) {
        throw new Error(`getSizeOfAllTitle: ${err}`)
    }
}

async function getTitleById(collectionName, _id) {
    try {
        const titleDao = getTitleModel(collectionName)
        const [titleDoc, userAnswerDoc] = await Promise.all([
            titleDao.findById(_id).lean(),
            userAnswerDao.findOne({ ftitleid: _id }).lean()
        ])

        if (!titleDoc) {
            throw new Error(`题目不存在`)
        }

        titleDoc.userAnswer = userAnswerDoc
        return new TitleDto(titleDoc)
    } catch (err) {
        throw new Error(`getTitleById: ${err}`)
    }
}

/**
 * 检查选择题答案是否正确
 * @param {Array<Array<Number>>} pending - 待检查的用户答案
 * @param {Array<Array<Number>>} correct - 正确答案
 * @returns {Boolean} - 是否正确
 */
function isChoiceCorrect(pending, correct){
    if (!Array.isArray(pending) || pending.length != correct.length) {
        return false
    }
    
    for (let i = 0; i < correct.length; i++) {
        if (pending[i].length != correct[i].length) {
            return false
        }
        for (let j = 0; j < correct[i].length; j++) {
            if (pending[i][j] != correct[i][j]) {
                return false
            }
        }
    }
    return true
}

async function getSubjectNames() {
    try {
        const result = await subjectDao.find({}).select('subject').lean()
        return result.map(doc => doc.subject)
    } catch (err) {
        throw new Error(`getSubjectNames: ${err}`)
    }
}

async function getChapterNames(subjectName) {
    try {
        const result = await subjectDao.findOne({ subject: subjectName }).lean()
        return Object.keys(result.chapters)
    } catch (err) {
        throw new Error(`getChapterNames: ${err}`)
    }
}

async function getSectionNames(chapterName) {
    try {
        const result = await chapterDao.findOne({ chapter: chapterName })
        return Array.from(result.sections.keys())
    } catch (err) {
        throw new Error(`getSectionNames: ${err}`)
    }
}

async function getSectionRef(subjectName, chapterName, sectionName) {
    const subject = await subjectDao.findOne({ subject: subjectName }).lean()
    const chapter = await chapterDao.findOne({ _id: subject.chapters[chapterName] }).lean()
    return chapter.sections[sectionName]
}

async function getExplanationById(collectionName, _id) {
    // try {
    //     const titleDao = getTitleModel(collectionName)
    //     const result = await titleDao.findById(_id).select('explanation').lean()
    //     return result.explanation
    // } catch (err) {
    //     throw new Error(`getExplanationById: ${err}`)
    // }
}

async function getUserAnswerOfAllChoiceTitle(collectionName, userEmail) {
    try {
        const titleDao = getTitleModel(collectionName)
        var result = await titleDao.aggregate([
            {
                $lookup: {
                    from: userAnswerDao.collection.collectionName,
                    let: { titleId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$fcollection", collectionName] },
                                        { $eq: ["$ftitleid", "$$titleId"] },
                                        { $eq: ["$fuseremail", userEmail] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "userAnswer"
                }
            },
            {
                $project: {
                    _id: 1,
                    choice: {
                        $cond: {
                            if: {$eq: ["$type", "choice"]},
                            then: {
                                rightOption: "$choice.rightOption",
                                optionType: "$choice.optionType"
                            },
                            else: "$$REMOVE"
                        }
                    },
                    userAnswer: { $arrayElemAt: ["$userAnswer", 0] }
                }
            }
        ])
        if (result.length == 0) {
            console.log(`getUserAnswerOfAllChoiceTitle: cannot find by collection of ${collectionName}`)
        }

        return result.map(doc => new TitleDto(doc))
    } catch (err) {
        throw new Error(`getUserAnswerOfAllChoiceTitle: ${err}`)
    }
}

async function saveHistoryAnswer(userEmail, collectionName) {
    try {
        const filter = {
            fuseremail: userEmail,
            fcollection: collectionName
        }

        const titleDao = getTitleModel(collectionName)
        const [result, total] = await Promise.all([
            userAnswerDao.find(filter).select('ftitleid userOption').lean(),
            titleDao.countDocuments()
        ])

        if (result.length < total) {
            return [-1, "还有题目未完成"]
        }

        const sortedResult = result.sort((a, b) => {
            if (typeof a.ftitleid == 'string' && typeof b.ftitleid == 'string') {
                return a.ftitleid.localeCompare(b.ftitleid)
            }
            return a.ftitleid - b.ftitleid
        })

        const qaArray = sortedResult.map(item => [item.ftitleid, item.userOption])

        const exists = await historyAnswerDao.findOne({
            fuseremail: userEmail,
            fcollection: collectionName,
            qa: { $eq: qaArray }
        }).select('_id').lean()

        //code 1: insert success, 0: dulpulate, -1: fail
        if (exists) {
            return [0, "已存在和现在答题情况相同版本"]
        }

        const historyData = {
            fcollection: collectionName,
            fuseremail: userEmail,
            qa: qaArray
        }

        await historyAnswerDao.create(historyData)

        return [1, "提交成功"]
    } catch (err) {
        throw new Error(`saveHistoryAnswer: ${err}`)
    }
}

async function modifyImgOfTitle(collectionName, _id, imgName) {
    try {
        const titleDao = getTitleModel(collectionName)
        const result = await titleDao.findOneAndUpdate(
            { _id },
            { 'choice.img': imgName }
        ).lean()
        return result
    } catch (err) {
        throw new Error(`modifyImgOfTitle: ${err}`)
    }
}

async function modifyImgOfExplan(collectionName, _id, explanImgName) {
    try {
        const titleDao = getTitleModel(collectionName)
        const result = await titleDao.findOneAndUpdate(
            { _id },
            { 'choice.explanImg': explanImgName }
        ).lean()
        return result
    } catch (err) {
        throw new Error(`modifyImgOfExplan: ${err}`)
    }
}

async function addFavoriteTitle(user, titleid, comment, keywords) {
    try {
        if(!Array.isArray(keywords)){
            throw new Error(`keywords must be an array`)
        }
        //check if the title is already favorited
        const exists = await favoriteTitleDao.findOne({
            fuseremail: user.userEmail,
            ftitleid: titleid,
            comment: comment,
            keywords: {$all: keywords}
        }).select('_id').lean()
        if(exists){
            throw new Error(`the title is already favorited`)
        }
        const favoriteTitleDto = new FavoriteTitleDto({
            fuseremail: user.userEmail,
            ftitleid: titleid,
            subject: user.currentSubject,
            chapter: user.currentChapter,
            section: user.currentSection,
            comment: comment,
            keywords: keywords
        })
        const result = await favoriteTitleDao.create(favoriteTitleDto)
        return result
    } catch (err) {
        throw new Error(`addFavoriteTitle: ${err}`)
    }
}

async function editTitle(collectionName, _id, titleType, title, explanation) {
    try {
        const titleDao = getTitleModel(collectionName)
        // 使用点符号语法只更新特定字段，而不是整个嵌套对象
        const updateFields = {}
        if (title !== undefined) {
            updateFields[`${titleType}.title`] = title
        }
        if (explanation !== undefined) {
            updateFields[`${titleType}.explanation`] = explanation
        }
        
        const result = await titleDao.findOneAndUpdate(
            { _id },
            { $set: updateFields }
        ).lean()
        
        return result
    } catch (err) {
        throw new Error(`editTitle: ${err}`)
    }
}

module.exports = {
    getSizeOfAllTitle,
    getTitleById,
    isChoiceCorrect,
    getSubjectNames,
    getChapterNames,
    getSectionNames,
    getSectionRef,
    getExplanationById,
    getUserAnswerOfAllChoiceTitle,
    saveHistoryAnswer,
    modifyImgOfTitle,
    modifyImgOfExplan,
    addFavoriteTitle,
    editTitle
}