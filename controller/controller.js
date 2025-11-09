var service = require('../service/service')
const ejs = require('ejs')
var userSettingService = require('../service/userSettingService')
var path = require('path')

const templateDir = path.join(__dirname, '../views')

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
    const { user, code } = await service.validateUser(req.body.userEmail, req.body.userPasswd)
    if (user) {
        req.session.userEmail = req.body.userEmail
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
    const result = await service.getAllTitleWithRecord()
    console.dir(result)
    const userSetting = await userSettingService.getUserSetting(req.session.userEmail)
    const [subjectName, chapterName, sectionName] = service.getCurrentSubject()
    if (userSetting.instantJudge) {
        const explanation = await service.getExplanationById(result[0]._id)
        res.render('TQ', { titles: result, title: result[0], titleSize: result.length, No: 1, userSetting, subjectName, chapterName, sectionName, explanation })
    } else {
        res.render('TQ', { titles: result, title: result[0], titleSize: result.length, No: 1, userSetting, subjectName, chapterName, sectionName })
    }
}

async function getTitle(req, res) {
    var formatRes = createFormatRes()
    const titleDoc = await service.getTitleById(req.params._id)
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
    const sectionRef = await service.getSectionRef(req.body.subjectName, req.body.chapterName, req.body.sectionName)
    var result = await service.saveUserChoice(sectionRef, req.body._id, req.body.selected)
    userSetting = await userSettingService.getUserSetting(req.session.userEmail)
    try {
        if (userSetting.instantJudge) {
            const explanation = await service.getExplanationById(req.body._id)
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
    const sectionRef = await service.getSectionRef(req.params.subjectName, req.params.chapterName, req.params.sectionName)
    await service.deleteDoc('userAnswer', { fcollection: sectionRef })
    res.end()
}

async function submitSubjectForm(req, res) {
    const subjectNames = await service.getSubjectNames()
    res.render('./partials/switchSubjectContent', { subjectNames })
}

async function getChapterNames(req, res) {
    var formatRes = createFormatRes()
    const chapterNames = await service.getChapterNames(req.query.subjectName)
    formatRes.data.chapterNames = chapterNames
    res.json(formatRes)
}

async function getSectionNames(req, res) {
    var formatRes = createFormatRes()
    const sectionNames = await service.getSectionNames(req.query.chapterName)
    formatRes.data.sectionNames = sectionNames
    res.json(formatRes)
}

async function modifySubject(req, res) {
    const sectionRef = await service.getSectionRef(req.params.subjectName, req.params.chapterName, req.params.sectionName)
    service.switchSubject(req.session.userEmail, req.params.subjectName, req.params.chapterName, req.params.sectionName, sectionRef)
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
    modifySubject,
    loginUser
}