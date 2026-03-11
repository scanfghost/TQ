const path = require('path')
const fs = require('fs').promises
const { createFormatRes } = require('../common/formatRes')
const m2QuestionService = require('../service/m2/questionService')
const m2UserSettingService = require('../service/m2/userSettingService')
const m2UserService = require('../service/m2/userService')
const m2StudyPathService = require('../service/m2/studyPathService')
const m2ImageService = require('../service/m2/imageService')

async function getTQPage(req, res) {
    const user = req.session.user
    const userSetting = await m2UserSettingService.getUserSetting(user.id)
    const questionCount = await m2QuestionService.getQuestionCountByStudyPath(user.subjectId, user.chapterId, user.sectionId)
    res.json({
        data: {
            userSetting,
            user: req.session.user,
            questionCount
        }
    })
}

async function getTQTable(req, res) {
    const resultList = await m2QuestionService.getIdSerialUserAnswerByStudyPath(req.session.user)
    if (resultList.length == 0) {
        res.status(404).json({ errMsg: 'No questions found' })
        return
    }
    const userSetting = await m2UserSettingService.getUserSetting(req.session.user.id)
    res.json({
        data: {
            pageList: resultList,
            instantJudge: userSetting.instantJudge
        }
    })
}

async function getQuestion(req, res) {
    let formatRes = createFormatRes()
    try {
        const questionDto = await m2QuestionService.getQuestionUserAnswerById(req.params.id, req.session.user)
        formatRes.data.questionDto = questionDto
    } catch (err) {
        console.log(`getQuestion: ${err}`)
        res.status(403)
        formatRes.errMsg = 'getQuestion ' + err
        res.json(formatRes)
        return
    }
    res.json(formatRes)
}

async function getQuestionDto(req, res) {
    let formatRes = createFormatRes()
    const question = await m2QuestionService.getQuestionById(req.params.id)
    formatRes.data.questionDto = question
    res.json(formatRes)
}

async function editImage(req, res) {
    let formatRes = createFormatRes()
    console.log(req.body)
    try {
        switch (req.body.serialType) {
            case 'append':
            case 'replace':
            case 'priorInsert':
                try {
                    await fs.access(req.file.path)
                } catch (err) {
                    res.status(400)
                    formatRes.errMsg = 'editImage: req.file.path is empty'
                    res.json(formatRes)
                    return
                }
                let newFileName
                newFileName = m2ImageService.getUUIDFileName(req.file.filename)
                switch (req.body.serialType) {
                    case 'append':
                        await m2ImageService.appendImageByQuestionId(req.body._id, newFileName, req.body.type)
                        break;
                    case 'replace':
                        await m2ImageService.replaceImageByQuestionId(req.body._id, newFileName, req.body.imageAnchorName)
                        break;
                    case 'priorInsert':
                        await m2ImageService.priorInsertImageByQuestionId(req.body._id, newFileName, req.body.type, req.body.imageAnchorName)
                        break;
                }
                const newFilePath = path.join(process.env.imgStoreFolder, newFileName)
                await fs.rename(req.file.path, newFilePath)
                break
            case 'remove':
                if (typeof req.body.fileNameList == 'string') {
                    req.body.fileNameList = [req.body.fileNameList]
                }
                //软删除，文件还在
                await m2ImageService.removeImageByNames(req.body._id, req.body.fileNameList)
                break
            default:
                throw new Error('serialType is not one of ["append", "replace", "priorInsert", "remove"]')
        }
    } catch (err) {
        console.log(`editImage: ${err.message}`)
        res.status(400)
        formatRes.errMsg = err.message
    }
    res.json(formatRes)
}

async function getSubjectNames(req, res) {
    let formatRes = createFormatRes()
    const result = await m2StudyPathService.getAllSubject()
    const subjectNames = result.map(item => item.name)
    formatRes.data.subjectNames = subjectNames
    res.json(formatRes)
}

async function getChapterNames(req, res) {
    let formatRes = createFormatRes()
    const result = await m2StudyPathService.getChapterBySubjectName(req.query.subjectName)
    const chapterNames = result.map(item => item.name)
    formatRes.data.chapterNames = chapterNames
    res.json(formatRes)
}

async function getSectionNames(req, res) {
    let formatRes = createFormatRes()
    const result = await m2StudyPathService.getSectionByChapterName(req.query.chapterName)
    const sectionNames = result.map(item => item.name)
    formatRes.data.sectionNames = sectionNames
    res.json(formatRes)
}

async function submitChoice(req, res) {
    let formatRes = createFormatRes()
    const user = req.session.user
    try {
        const questionDto = await m2QuestionService.getQuestionUserAnswerById(req.body._id, user)
        const isCorrect = m2QuestionService.equalChoice(req.body.userOption, questionDto['choice'].rightOption)
        await m2UserService.saveUserChoice(user.id, req.body._id, req.body.userOption, isCorrect)
        const userSetting = await m2UserSettingService.getUserSetting(user.id)
        if (userSetting.instantJudge) {
            formatRes.data.answer = isCorrect ? "right" : "wrong"
            formatRes.data.questionDto = questionDto
        } else {
            formatRes.data.answer = "answered"
        }
    } catch (err) {
        console.log(err)
        res.status(400)
        formatRes.errMsg = 'submitChoice: ' + err
        res.json(formatRes)
        return
    }
    res.json(formatRes)
}

async function addFavoriteTitle(req, res) {
    let formatRes = createFormatRes()
    try {
        await m2QuestionService.addFavoriteQuestion(req.session.user.id, req.body.titleid, req.body.keywords, req.body.comment)
    } catch (err) {
        res.status(400)
        formatRes.errMsg = err.message
        res.json(formatRes)
        return
    }
    res.json(formatRes)
}

async function editChoiceQuestion(req, res) {
    let formatRes = createFormatRes()
    try {
        await m2QuestionService.editChoiceQuestion(req.body._id, req.body.title, req.body.explanation)
    } catch (err) {
        res.status(400)
        formatRes.errMsg = 'editTitle: ' + err
        res.json(formatRes)
        return
    }
    res.json(formatRes)
}

async function saveHistoryAnswerByStudyPath(req, res) {
    let formatRes = createFormatRes()
    const user = req.session.user
    try {
        await m2QuestionService.saveHistoryAnswerByStudyPath(user.id, user.subjectId, user.chapterId, user.sectionId)
        formatRes.data.message = '历史作答版本提交成功'
        res.json(formatRes)
    } catch (err) {
        formatRes.errMsg = '保存历史作答版本失败: ' + err.message
        res.status(400).json(formatRes)
    }
}

async function getAllTitleImage(req, res) {
    let formatRes = createFormatRes()
    try {
        const imageDtoList = await m2ImageService.getAllTypeImageByQuestionId(req.params.id, req.params.type)
        formatRes.data.imageDtoList = imageDtoList
    } catch (err) {
        console.log(`getAllTitleImage: ${err.message}`)
        formatRes.errMsg = err.message
        res.status(400)
    }
    res.json(formatRes)
}

async function removeUserAnswerByStudyPath(req, res) {
    let formatRes = createFormatRes()
    const user = req.session.user

    try {
        const rows = await m2QuestionService.removeUserAnswerByStudyPath(user.id, user.subjectId, user.chapterId, user.sectionId)
        formatRes.data.message = `共移除 ${rows} 作答记录`
    } catch (err) {
        res.status(400)
        formatRes.errMsg = err.message
    }
    res.json(formatRes)
}

async function getProcessSerialByStudyPath (req, res){
    const user = req.session.user
    let formatRes = createFormatRes()

    try {
        const result = await m2QuestionService.getProcessSerialByStudyPath(user.id, user.subjectId, user.chapterId, user.sectionId)
        formatRes.data.serial = result
    } catch (err) {
        res.status(404)
        formatRes.errMsg = err.message
    }
    res.json(formatRes)
}

async function updateProcessSerialByStudyPath (req, res){
    const user = req.session.user
    let formatRes = createFormatRes()

    try {
        const result = await m2QuestionService.updateProcessSerialByStudyPath(user.id, user.subjectId, user.chapterId, user.sectionId, req.body.serial)
    } catch (err) {
        res.status(500)
        formatRes.errMsg = err.message
    }
    res.json(formatRes)
}

async function getQuestionIdBySerialAndPath(req, res) {
    let formatRes = createFormatRes()
    const user = req.session.user
    const {serial} = req.query
    try {
        const currentQuestionId = await m2QuestionService.getQuestionIdBySerialAndPath(user.subjectId, user.chapterId, user.sectionId, serial)
        formatRes.data.currentQuestionId = currentQuestionId
    } catch (err) {
        res.status(500)
        console.dir(err)
        formatRes.errMsg = err.message
    }
    res.json(formatRes)
}

module.exports = {
    submitChoice,
    getTQPage,
    getTQTable,
    getQuestion,
    getChapterNames,
    getSectionNames,
    getSubjectNames,
    editImage,
    addFavoriteTitle,
    getQuestionDto,
    editChoiceQuestion,
    saveHistoryAnswerByStudyPath,
    getAllTitleImage,
    removeUserAnswerByStudyPath,
    getProcessSerialByStudyPath,
    updateProcessSerialByStudyPath,
    getQuestionIdBySerialAndPath
}