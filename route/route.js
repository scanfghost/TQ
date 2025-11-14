var express = require('express')
var router = express.Router()
var controller = require('../controller/controller')
var userSettingController = require('../controller/userSettingController')
const {imgUpload} = require('../middleware/upload')

router.get('/TQ{/:_id/:No}', controller.getTQPage)

router.get('/', controller.getIndexPage)

router.get('/title/:_id', controller.getTitle)

router.get('/subjectForm', controller.submitSubjectForm)

router.get('/chapterNames', controller.getChapterNames)

router.get('/sectionNames', controller.getSectionNames)

router.post('/modifyUserSubject', controller.modifyUserSubject)

router.post('/login', controller.loginUser)

router.post('/choice', controller.submitChoice)

router.post('/modifyUserSetting', userSettingController.modifyUserSetting)

router.post('/saveHistoryAnswer', controller.saveHistoryAnswer)

router.post('/uploadPictureOfTitle', imgUpload.single('picture'), controller.uploadPictureOfTitle)

router.delete('/restartAnswer', controller.removeUserAnswer)

module.exports = router