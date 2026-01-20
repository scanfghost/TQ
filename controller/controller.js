const { createFormatRes } = require('../common/formatRes')
const m2UserService = require('../service/m2/userService')
function getIndexPage(req, res) {
    res.render('index', { session: req.session })
}

async function loginUser(req, res) {
    let formatRes = createFormatRes()
    try {
        const { user, code } = await m2UserService.validateUser(req.body.userEmail, req.body.userPasswd)
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
        console.log(`loginUser: ${err.message}`)
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

async function modifyUserStudyPath(req, res) {
    let formatRes = createFormatRes()
    try {
        const user = req.session.user
        const subject = req.body.subject
        const chapter = req.body.chapter
        const section = req.body.section
        const [subjectId, chapterId, sectionId] = await m2UserService.modifyUserStudyPath(user.id, subject, chapter, section)
        user.subjectId = subjectId
        user.chapterId = chapterId
        user.sectionId = sectionId
        user.currentSubject = subject
        user.currentChapter = chapter
        user.currentSection = section
        await new Promise((resolve, reject) => {
            req.session.save(err => err ? reject(err) : resolve());
        });
        formatRes.data.success = true
        res.json(formatRes)
    } catch (err) {
        formatRes.errMsg = '修改用户科目信息失败: ' + err.message
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
    modifyUserStudyPath,
    loginUser,
    authCheck,
    logoutUser
}