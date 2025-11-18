const path = require('path')
const ejs = require('ejs')
const fs = require('fs').promises
const ObjectId = require('mongoose').Types.ObjectId
const {createFormatRes} = require('../common/formatRes')
const {getTitleModel} = require('../model/Title')
const userModel = require('../model/User')
const subjectModel = require('../model/Subject')
const chapterModel = require('../model/Chapter')
const historyAnswerModel = require('../model/HistoryAnswer')
const userAnswerModel = require('../model/userAnswer')
const createTitleService = require('../service/titleService')
const createUserService = require('../service/userService')
const userSettingService = require('../service/userSettingService')
const {md5} = require('../common/md5')

const templateDir = path.join(__dirname, '../views')
const userService = createUserService({userModel, userAnswerModel, ObjectId }) 
const titleService = createTitleService({getTitleModel, userAnswerModel, historyAnswerModel, subjectModel, chapterModel})

async function getTQPage(req, res) {
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const {titleModel, sectionRef} = await titleService.getTitleModel(subjectName, chapterName, sectionName)
    const result = await titleService.getUserAnswerOfAllTitle(titleModel, req.session.user.userEmail, sectionRef)
    const userSetting = await userSettingService.getUserSetting(req.session.user.userEmail)
    let title, No
    if (req.params._id) {
        title = await titleService.getTitleById(titleModel, req.params._id)
        No = req.params.No
    } else {
        title = await titleService.getTitleById(titleModel, result[0]._id)
        No = 1
    }
    const rightOption = title[title.type].rightOption
    if (userSetting.instantJudge) {
        const explanation = title[title.type].explanation
        if (title.userAnswer && title.type == "choice") {
            title.isChoiceCorrect = titleService.isChoiceCorrect(title.userAnswer.userOption, title.choice.rightOption)
        }
        res.render('TQ', { titles: result, title, titleSize: result.length, No, userSetting, subjectName, chapterName, sectionName, explanation, rightOption})
    } else {
        res.render('TQ', { titles: result, title, titleSize: result.length, No, userSetting, subjectName, chapterName, sectionName, rightOption})
    }
}

async function getTitle(req, res) {
    var formatRes = createFormatRes()
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const {titleModel, sectionRef} = await titleService.getTitleModel(subjectName, chapterName, sectionName)
    const titleDoc = await titleService.getTitleById(titleModel, req.params._id)
    try {
        const rightOption = titleDoc[titleDoc.type].rightOption
        formatRes.html.titleChoiceContent = await ejs.renderFile(templateDir + '/partials/titleChoiceContent.ejs', { title: titleDoc, No: req.query.No , rightOption})
        if (titleDoc.userAnswer) {
            const userSetting = await userSettingService.getUserSetting(req.session.user.userEmail)
            if (userSetting.instantJudge) {
                formatRes.html.explanationContent = await ejs.renderFile(templateDir + '/partials/explanationContent.ejs', { explanation: titleDoc[titleDoc.type].explanation })
            }
        }
    } catch (err) {
        res.status(403)
        formatRes.errMsg = 'getTitle: ' + err
        res.json(formatRes)
        return
    }
    res.json(formatRes)
}

async function uploadPictureOfTitle(req, res) {
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const {titleModel, sectionRef} = await titleService.getTitleModel(subjectName, chapterName, sectionName)
    const result = await titleService.getTitleById(titleModel, req.body._id)
    const hashInput = JSON.stringify(result[result.type])
    const ext = path.extname(req.file.filename)
    const hash = md5(hashInput, 12)
    const newFilename = `${hash}${ext}`
    const newFilePath = path.join(process.env.imgStoreFolder, newFilename)
    await fs.rename(req.file.path, newFilePath)
    titleService.modifyImgOfTitle(titleModel, req.body._id, newFilename)
    res.end()
}

async function submitSubjectForm(req, res) {
    var formatRes = createFormatRes()
    const subjectNames = await titleService.getSubjectNames()
    formatRes.html.switchSubjectContent = await ejs.renderFile(templateDir + '/partials/switchSubjectContent.ejs', { subjectNames })
    res.json(formatRes) 
}

async function getChapterNames(req, res) {
    var formatRes = createFormatRes()
    const chapterNames = await titleService.getChapterNames(req.query.subjectName)
    formatRes.data.chapterNames = chapterNames
    res.json(formatRes)
}

async function getSectionNames(req, res) {
    var formatRes = createFormatRes()
    const sectionNames = await titleService.getSectionNames(req.query.chapterName)
    formatRes.data.sectionNames = sectionNames
    res.json(formatRes)
}

async function submitChoice(req, res) {
    var formatRes = createFormatRes()
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const {titleModel, sectionRef} = await titleService.getTitleModel(subjectName, chapterName, sectionName)
    await userService.saveUserChoice(req.session.user.userEmail, sectionRef, req.body._id, req.body.userOption)
    const userSetting = await userSettingService.getUserSetting(req.session.user.userEmail)
    try {
        if (userSetting.instantJudge) {
            const explanation = await titleService.getExplanationById(titleModel, req.body._id)
            formatRes.html.explanationContent = await ejs.renderFile(templateDir + '/partials/explanationContent.ejs', { explanation })
            const result = await titleService.getTitleById(titleModel, req.body._id)
            if (titleService.isChoiceCorrect(req.body.userOption, result.choice.rightOption)) {
                formatRes.data.answer = "right"
            }else{
                formatRes.data.answer = "wrong"
            }
            
        } else {
            formatRes.data.answer = "answered"
        }
    } catch (err) {
        res.status(403)
        formatRes.errMsg = 'getTitle: ' + err
        res.json(formatRes)
        return
    }
    res.json(formatRes)
}

module.exports = {
    submitChoice,
    getTQPage,
    getTitle,
    getChapterNames,
    getSectionNames,
    submitSubjectForm,
    uploadPictureOfTitle
}