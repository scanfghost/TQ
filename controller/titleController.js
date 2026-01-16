const path = require('path')
const ejs = require('ejs')
const fs = require('fs').promises
const { createFormatRes } = require('../common/formatRes')
const titleService = require('../service/titleService')
const { md5 } = require('../common/md5')
const m2QuestionService = require('../service/m2/questionService')
const m2UserSettingService = require('../service/m2/userSettingService')
const m2UserService = require('../service/m2/userService')
const m2StudyPathService = require('../service/m2/studyPathService')
const { createBasicUserAnswer } = require('../dto/QuestionDto')

const templateDir = path.join(__dirname, '../views')

async function getTQPage(req, res) {
    const resultList = await m2QuestionService.getIdSerialUserAnswerByStudyPath(req.session.user)
    const userSetting = await m2UserSettingService.getUserSetting(req.session.user.id)
    let questionDto, rawIdSerial
    if (req.params.id) {
        rawIdSerial = resultList.find(item => item.id == req.params.id)
        questionDto = await m2QuestionService.getQuestionById(req.params.id)
        questionDto.insertChoiceUserAnswer(createBasicUserAnswer(rawIdSerial.userOption, rawIdSerial.isCorrect))
    } else {
        rawIdSerial = resultList.find(item => item.serial == 1)
        questionDto = await m2QuestionService.getQuestionById(rawIdSerial.id)
        questionDto.insertChoiceUserAnswer(createBasicUserAnswer(rawIdSerial.userOption, rawIdSerial.isCorrect))
    }
    res.render('TQ', { questionDto, pageList: resultList, userSetting, user: req.session.user })
}

async function getQuestion(req, res) {
    let formatRes = createFormatRes()
    try {
        const questionDto = await m2QuestionService.getQuestionUserAnswerById(req.params.id, req.session.user)
        formatRes.html.titleChoiceContent = await ejs.renderFile(templateDir + '/partials/titleChoiceContent.ejs', { questionDto})
        if (questionDto[questionDto.type].useranswer.userOption) {
            formatRes.html.explanationContent = await ejs.renderFile(templateDir + '/partials/explanationContent.ejs', { questionDto })
        }
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

async function uploadPictureOfTitle(req, res) {
    let formatRes = createFormatRes()
    try {
        await fs.access(req.file.path)
    } catch (err) {
        res.status(400)
        formatRes.errMsg = 'uploadPictureOfTitle: req.file.path is empty'
        res.json(formatRes)
        return
    }
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const collectionName = await titleService.getSectionRef(subjectName, chapterName, sectionName)
    const titleDto = await titleService.getTitleById(collectionName, req.body._id)
    const hashInput = titleDto.title + JSON.stringify(titleDto.options)
    const ext = path.extname(req.file.filename)
    const hash = md5(hashInput, 12)
    const newFilename = `${hash}${ext}`
    const newFilePath = path.join(process.env.imgStoreFolder, newFilename)
    await fs.rename(req.file.path, newFilePath)
    titleService.modifyImgOfTitle(collectionName, req.body._id, newFilename)
    res.json(formatRes)
}

async function uploadPictureOfExplan(req, res) {
    let formatRes = createFormatRes()
    try {
        await fs.access(req.file.path)
    } catch (err) {
        res.status(400)
        formatRes.errMsg = 'uploadPictureOfExplan: req.file.path is empty'
        res.json(formatRes)
        return
    }
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const collectionName = await titleService.getSectionRef(subjectName, chapterName, sectionName)
    const titleDto = await titleService.getTitleById(collectionName, req.body._id)
    const hashInput = titleDto.title + JSON.stringify(titleDto.options)
    const ext = path.extname(req.file.filename)
    const hash = md5(hashInput, 12)
    const newFilename = `explan${hash}${ext}`
    const newFilePath = path.join(process.env.imgStoreFolder, newFilename)
    await fs.rename(req.file.path, newFilePath)
    titleService.modifyImgOfExplan(collectionName, req.body._id, newFilename)
    res.json(formatRes)
}

async function getSubjectNames(req, res) {
    let formatRes = createFormatRes()
    const result = await m2StudyPathService.getAllSubject()
    const subjectNames = result.map(item => item.name)
    formatRes.html.switchSubjectContent = await ejs.renderFile(templateDir + '/partials/switchSubjectContent.ejs', { subjectNames })
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
        const questionDto = await m2QuestionService.getQuestionById(req.body._id)
        const isCorrect = m2QuestionService.judgeChoice(req.body.userOption, questionDto['choice'].rightOption)
        await m2UserService.saveUserChoice(user.id, req.body._id, req.body.userOption, isCorrect)
        const userSetting = await m2UserSettingService.getUserSetting(user.id)
        if (userSetting.instantJudge) {
            formatRes.html.explanationContent = await ejs.renderFile(templateDir + '/partials/explanationContent.ejs', { questionDto })
            if (isCorrect) {
                formatRes.data.answer = "right"
            } else {
                formatRes.data.answer = "wrong"
            }
        } else {
            formatRes.data.answer = "answered"
        }
    } catch (err) {
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
        const result = await titleService.addFavoriteTitle(req.session.user, req.body.titleid, req.body.comment, req.body.keywords)
        if (!result) {
            throw new Error(`添加收藏失败`)
        }
    } catch (err) {
        res.status(400)
        formatRes.errMsg = 'addFavoriteTitle: ' + err
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



module.exports = {
    submitChoice,
    getTQPage,
    getQuestion,
    getChapterNames,
    getSectionNames,
    getSubjectNames,
    uploadPictureOfTitle,
    uploadPictureOfExplan,
    addFavoriteTitle,
    getQuestionDto,
    editChoiceQuestion,
}