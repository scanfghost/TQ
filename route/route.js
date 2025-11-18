var express = require('express')
var router = express.Router()
var controller = require('../controller/controller')
const titleController = require('../controller/titleController')
var userSettingController = require('../controller/userSettingController')
const {imgUpload} = require('../middleware/upload')

router.get('/TQ{/:_id/:No}', titleController.getTQPage)

router.get('/', controller.getIndexPage)

router.get('/title/:_id', titleController.getTitle)

router.get('/subjectForm', titleController.submitSubjectForm)

router.get('/chapterNames', titleController.getChapterNames)

router.get('/sectionNames', titleController.getSectionNames)

router.post('/modifyUserSubject', controller.modifyUserSubject)

router.post('/login', controller.loginUser)

router.post('/choice', titleController.submitChoice)

router.post('/modifyUserSetting', userSettingController.modifyUserSetting)

router.post('/saveHistoryAnswer', controller.saveHistoryAnswer)

router.post('/uploadPictureOfTitle', imgUpload.single('picture'), titleController.uploadPictureOfTitle)

router.delete('/restartAnswer', controller.removeUserAnswer)

module.exports = router