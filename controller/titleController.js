const path = require('path')
const ejs = require('ejs')
const fs = require('fs').promises
const { createFormatRes } = require('../common/formatRes')
const titleService = require('../service/titleService')
const userService = require('../service/userService')
const userSettingService = require('../service/userSettingService')
const { md5 } = require('../common/md5')

const templateDir = path.join(__dirname, '../views')

async function getTQPage(req, res) {
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const collectionName = await titleService.getSectionRef(subjectName, chapterName, sectionName)
    const titleDtoList = await titleService.getUserAnswerOfAllChoiceTitle(collectionName, req.session.user.userEmail)
    const userSetting = await userSettingService.getUserSetting(req.session.user.userEmail)
    let titleDto, No
    if (req.params._id) {
        titleDto = await titleService.getTitleById(collectionName, req.params._id)
        No = req.params.No
    } else {
        titleDto = await titleService.getTitleById(collectionName, titleDtoList[0]._id)
        No = 1
    }
    if (userSetting.instantJudge) {
        const explanation = titleDto.explanation
        if (titleDto.userAnswer && titleDto.type == "choice") {
            titleDto.isChoiceCorrect = titleService.isChoiceCorrect(titleDto.userAnswer.userOption, titleDto.rightOption)
        }
        res.render('TQ', { titleDtoList, titleDto, No, userSetting, explanation, subjectName, chapterName, sectionName, user: req.session.user })
    } else {
        res.render('TQ', { titleDtoList, titleDto, No, userSetting, subjectName, chapterName, sectionName, user: req.session.user })
    }
}

async function getTitle(req, res) {
    var formatRes = createFormatRes()
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const collectionName = await titleService.getSectionRef(subjectName, chapterName, sectionName)
    const titleDto = await titleService.getTitleById(collectionName, req.params._id)
    try {
        formatRes.html.titleChoiceContent = await ejs.renderFile(templateDir + '/partials/titleChoiceContent.ejs', { titleDto, No: req.query.No })
        if (titleDto.userAnswer) {
            const userSetting = await userSettingService.getUserSetting(req.session.user.userEmail)
            if (userSetting.instantJudge) {
                formatRes.html.explanationContent = await ejs.renderFile(templateDir + '/partials/explanationContent.ejs', { titleDto, explanation: titleDto.explanation })
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

async function getTitleDto(req, res) {
    var formatRes = createFormatRes()
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const collectionName = await titleService.getSectionRef(subjectName, chapterName, sectionName)
    const titleDto = await titleService.getTitleById(collectionName, req.params._id)
    formatRes.data.titleDto = titleDto
    res.json(formatRes)
}

async function uploadPictureOfTitle(req, res) {
    var formatRes = createFormatRes()
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
    var formatRes = createFormatRes()
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
    const collectionName = await titleService.getSectionRef(subjectName, chapterName, sectionName)
    const titleDto = await titleService.getTitleById(collectionName, req.body._id)
    const isChoiceCorrect = titleService.isChoiceCorrect(req.body.userOption, titleDto.rightOption)
    await userService.saveUserChoice(req.session.user.userEmail, collectionName, req.body._id, req.body.userOption, isChoiceCorrect)
    const userSetting = await userSettingService.getUserSetting(req.session.user.userEmail)
    try {
        if (userSetting.instantJudge) {
            const explanation = titleDto.explanation
            formatRes.html.explanationContent = await ejs.renderFile(templateDir + '/partials/explanationContent.ejs', { titleDto, explanation })
            if (isChoiceCorrect) {
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
    var formatRes = createFormatRes()
    try {
        const result = await titleService.addFavoriteTitle(req.session.user, req.body.titleid, req.body.comment, req.body.keywords)
        if(!result){
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

async function editTitle(req, res) {
    var formatRes = createFormatRes()
    const subjectName = req.session.user.currentSubject
    const chapterName = req.session.user.currentChapter
    const sectionName = req.session.user.currentSection
    const collectionName = await titleService.getSectionRef(subjectName, chapterName, sectionName)
    try {
        const result = await titleService.editTitle(collectionName, req.body._id, "choice", req.body.title, req.body.explanation)
        if(!result){
            throw new Error(`编辑题目失败`)
        }
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
    getTitle,
    getChapterNames,
    getSectionNames,
    submitSubjectForm,
    uploadPictureOfTitle,
    uploadPictureOfExplan,
    addFavoriteTitle,
    getTitleDto,
    editTitle,
}