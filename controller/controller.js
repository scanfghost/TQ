const path = require('path')
const ejs = require('ejs')
const ObjectId = require('mongoose').Types.ObjectId
var service = require('../service/service')
const createTitleService = require('../service/titleService')
const createUserService = require('../service/userService')
var userSettingService = require('../service/userSettingService')
const {getTitleModel} = require('../model/Title')
const userAnswerModel = require('../model/userAnswer')
const subjectModel = require('../model/Subject')
const chapterModel = require('../model/Chapter')
const userModel = require('../model/User')

const templateDir = path.join(__dirname, '../views')

const titleService = createTitleService({getTitleModel, userAnswerModel, subjectModel, chapterModel})
const userService = createUserService({userModel, userAnswerModel, ObjectId }) 

function createFormatRes() {
    return {
        html: {},
        data: {},
        errMsg: ""
    }
}

function getIndexPage(req, res) {
    res.render('index', { session: req.session })
}

async function loginUser(req, res) {
    var formatRes = createFormatRes()
    const { user, code } = await userService.validateUser(req.body.userEmail, req.body.userPasswd)
    if (user) {
        userService.loadUserContext(user)
        req.session.user = user
        formatRes.data.loginSuccess = true
        formatRes.data.url = '/TQ'
    } else {
        if (code == -1) {
            formatRes.errMsg = `用户${req.body.userEmail}不存在`
        } else if(code == 2){
            formatRes.errMsg = '密码错误'
        }
        formatRes.data.loginSuccess = false
    }
    res.json(formatRes)
}

async function getTQPage(req, res) {
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const {titleModel, sectionRef} = await titleService.getTitleModel(subjectName, chapterName, sectionName)
    const result = await titleService.getUserAnswerOfAllTitle(titleModel, req.session.user.userEmail, sectionRef)
    const userSetting = await userSettingService.getUserSetting(req.session.user.userEmail)
    const firstTitle = await titleService.getTitleById(titleModel, result[0]._id)
    if (userSetting.instantJudge) {
        const explanation = firstTitle.explanation
        res.render('TQ', { titles: result, title: firstTitle, titleSize: result.length, No: 1, userSetting, subjectName, chapterName, sectionName, explanation })
    } else {
        res.render('TQ', { titles: result, title: firstTitle, titleSize: result.length, No: 1, userSetting, subjectName, chapterName, sectionName })
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
        formatRes.html.titleContent = await ejs.renderFile(templateDir + '/partials/titleContent.ejs', { title: titleDoc, No: req.query.No })
        if (titleDoc.userAnswer) {
            const userSetting = await userSettingService.getUserSetting(req.session.userEmail)
            if (userSetting.instantJudge) {
                // const explanation = await service.getExplanationById(req.params._id)
                formatRes.html.explanationContent = await ejs.renderFile(templateDir + '/partials/explanationContent.ejs', { explanation: titleDoc.explanation })
            }
        }
    } catch (err) {
        res.status(500)
        formatRes.errMsg = 'getTitle: ' + err
        res.json(formatRes)
        return
    }
    res.json(formatRes)
}

async function submitChoice(req, res) {
    var formatRes = createFormatRes()
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const {titleModel, sectionRef} = await titleService.getTitleModel(subjectName, chapterName, sectionName)
    var result = await userService.saveUserChoice(titleModel, req.session.user.userEmail, sectionRef, req.body._id, req.body.selected)
    const userSetting = await userSettingService.getUserSetting(req.session.user.userEmail)
    try {
        if (userSetting.instantJudge) {
            const explanation = await titleService.getExplanationById(titleModel, req.body._id)
            formatRes.html.explanationContent = await ejs.renderFile(templateDir + '/partials/explanationContent.ejs', { explanation })
            formatRes.data.answer = result
        } else {
            formatRes.data.answer = "answered"
        }
    } catch (err) {
        res.status(500)
        formatRes.errMsg = 'getTitle: ' + err
        res.json(formatRes)
        return
    }
    res.json(formatRes)
}

async function removeUserAnswer(req, res) {
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const sectionRef = await titleService.getSectionRef(subjectName, chapterName, sectionName)
    await service.deleteDoc('useranswer', { fcollection: sectionRef, fuseremail: req.session.user.userEmail })
    res.end()
}

async function submitSubjectForm(req, res) {
    const subjectNames = await titleService.getSubjectNames()
    res.render('./partials/switchSubjectContent', { subjectNames })
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

async function modifyUserSubject(req, res) {
    const subject = req.body.subject
    const chapter = req.body.chapter
    const section = req.body.section
    await userService.modifyUserSubject(req.session.user.userEmail, subject, chapter, section)
    res.json({ success: 1 })
}

module.exports = {
    getIndexPage,
    getTQPage,
    getTitle,
    getChapterNames,
    getSectionNames,
    submitChoice,
    submitSubjectForm,
    removeUserAnswer,
    modifyUserSubject,
    loginUser
}