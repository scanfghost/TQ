const ObjectId = require('mongoose').Types.ObjectId
const service = require('../service/service')
const createTitleService = require('../service/titleService')
const createUserService = require('../service/userService')
const {getTitleModel} = require('../model/Title')
const userAnswerModel = require('../model/userAnswer')
const subjectModel = require('../model/Subject')
const chapterModel = require('../model/Chapter')
const userModel = require('../model/User')
const historyAnswerModel = require('../model/HistoryAnswer')
const {createFormatRes} = require('../common/formatRes')

const titleService = createTitleService({getTitleModel, userAnswerModel, historyAnswerModel, subjectModel, chapterModel})
const userService = createUserService({userModel, userAnswerModel, ObjectId }) 

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

async function removeUserAnswer(req, res) {
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const sectionRef = await titleService.getSectionRef(subjectName, chapterName, sectionName)
    await service.deleteDoc('useranswer', { fcollection: sectionRef, fuseremail: req.session.user.userEmail })
    res.end()
}

async function modifyUserSubject(req, res) {
    const subject = req.body.subject
    const chapter = req.body.chapter
    const section = req.body.section
    const result = await userService.modifyUserSubject(req.session.user.userEmail, subject, chapter, section)
    req.session.user = result
    res.json({ success: 1 })
}

async function saveHistoryAnswer(req, res) {
    var formatRes = createFormatRes()
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const sectionRef = await titleService.getSectionRef(subjectName, chapterName, sectionName)
    const [code, message] = await titleService.saveHistoryAnswer(req.session.user.userEmail, sectionRef)

    if (code != 1) {
        formatRes.errMsg = message
        res.status(403).json(formatRes)
        return
    }
    formatRes.data.message = message
    res.json(formatRes)
}



module.exports = {
    getIndexPage,
    removeUserAnswer,
    modifyUserSubject,
    loginUser,
    saveHistoryAnswer
}