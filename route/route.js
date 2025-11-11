var express = require('express')
var router = express.Router()
var controller = require('../controller/controller')
var userSettingController = require('../controller/userSettingController')

router.get('/TQ', controller.getTQPage)

router.get('/', controller.getIndexPage)

router.get('/title/:_id', controller.getTitle)

router.get('/subjectForm', controller.submitSubjectForm)

router.get('/chapterNames', controller.getChapterNames)

router.get('/sectionNames', controller.getSectionNames)

router.post('/modifyUserSubject', controller.modifyUserSubject)

router.post('/login', controller.loginUser)

router.post('/choice', controller.submitChoice)

router.post('/modifyUserSetting', userSettingController.modifyUserSetting)

router.delete('/restartAnswer', controller.removeUserAnswer)

module.exports = router