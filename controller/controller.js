const service = require('../service/service')
const titleService = require('../service/titleService')
const userService = require('../service/userService')
const { createFormatRes } = require('../common/formatRes')

function getIndexPage(req, res) {
    res.render('index', { session: req.session })
}

async function loginUser(req, res) {
    let formatRes = createFormatRes()
    try {
        const { user, code } = await userService.validateUser(req.body.userEmail, req.body.userPasswd)
        if (user) {
            req.session.user = user
            formatRes.data.loginSuccess = true
            //test
            formatRes.data.userEmail = user.userEmail
            formatRes.data.avatar = "/avatar.png"
        } else {
            if (code == -1) {
                formatRes.errMsg = `用户${req.body.userEmail}不存在`
            } else if (code == 2) {
                formatRes.errMsg = '密码错误'
            }
            formatRes.data.loginSuccess = false
        }
    } catch (err) {
        formatRes.data.loginSuccess = false
        formatRes.errMsg = '服务器出错'
    }
    res.json(formatRes)
}

function logoutUser(req, res) {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log('登出异常:', err)
                throw err
            } else {
                console.log('Session 销毁成功')
            }
        })
    } catch (err) {
        console.log('登出异常:', err?.message)
        res.end()
    }
}

async function removeUserAnswer(req, res) {
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const collectionName = await titleService.getSectionRef(subjectName, chapterName, sectionName)
    await service.deleteDoc('useranswer', { fcollection: collectionName, fuseremail: req.session.user.userEmail })
    res.json({ success: true })
}

async function modifyUserSubject(req, res) {
    let formatRes = createFormatRes()
    try {
        const subject = req.body.subject
        const chapter = req.body.chapter
        const section = req.body.section
        const result = await userService.modifyUserSubject(req.session.user.userEmail, subject, chapter, section)
        req.session.user = result
        formatRes.data.success = true
        res.json(formatRes)
    } catch (err) {
        formatRes.errMsg = '修改用户科目信息失败: ' + err.message
        res.status(400).json(formatRes)
    }
}

async function saveHistoryAnswer(req, res) {
    let formatRes = createFormatRes()
    try {
        const subjectName = req.session.user.currentSubject
        const chapterName = req.session.user.currentChapter
        const sectionName = req.session.user.currentSection
        const collectionName = await titleService.getSectionRef(subjectName, chapterName, sectionName)
        const [code, message] = await titleService.saveHistoryAnswer(req.session.user.userEmail, collectionName)

        if (code != 1) {
            formatRes.errMsg = message
            res.status(403).json(formatRes)
            return
        }
        formatRes.data.message = message
        formatRes.data.success = true
        res.json(formatRes)
    } catch (err) {
        formatRes.errMsg = '保存历史答案失败: ' + err.message
        res.status(400).json(formatRes)
    }
}

function authCheck(req, res) { 
    let formatRes = createFormatRes()
    if (req.session.user) {
        formatRes.data.logined = true
        formatRes.data.user = req.session.user
    } else {
        formatRes.data.logined = false
    }
    res.json(formatRes)
 }

 

module.exports = {
    getIndexPage,
    removeUserAnswer,
    modifyUserSubject,
    loginUser,
    saveHistoryAnswer,
    authCheck,
    logoutUser
}