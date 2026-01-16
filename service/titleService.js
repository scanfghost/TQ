const {getTitleModel} = require('../dao/TitleDao')
const userAnswerDao = require('../dao/UserAnswerDao')
const historyAnswerDao = require('../dao/HistoryAnswerDao')
const subjectDao = require('../dao/SubjectDao')
const chapterDao = require('../dao/ChapterDao')
const {TitleDto} = require('../dto/TitleDto')
const favoriteTitleDao = require('../dao/FavoriteTitleDao')
const {FavoriteTitleDto} = require('../dto/FavoriteTitleDto')

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
    isChoiceCorrect,
    saveHistoryAnswer,
    modifyImgOfTitle,
    modifyImgOfExplan,
    addFavoriteTitle,
    editTitle
}