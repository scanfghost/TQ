var express = require('express')
var router = express.Router()
var controller = require('../controller/controller')
const titleController = require('../controller/titleController')
var userSettingController = require('../controller/userSettingController')
const {imgUpload} = require('../middleware/upload')

router.get('/authCheck',controller.authCheck)

router.get('/TQ{/:_id/:No}', titleController.getTQPage)

router.get('/', controller.getIndexPage)

router.post('/title', titleController.getTitle)

router.get('/subjectForm', titleController.submitSubjectForm)

router.get('/chapterNames', titleController.getChapterNames)

router.get('/sectionNames', titleController.getSectionNames)

router.post('/fetchUserPreference', userSettingController.fetchUserSetting)

router.post('/modifyUserSubject', controller.modifyUserStudyPath)

router.post('/login', controller.loginUser)

router.post('/logout', controller.logoutUser)

router.post('/choice', titleController.submitChoice)

router.post('/modifyUserSetting', userSettingController.modifyUserSetting)

router.post('/saveHistoryAnswer', controller.saveHistoryAnswer)

router.post('/uploadPictureOfTitle', imgUpload.single('picture'), titleController.uploadPictureOfTitle)

router.post('/uploadPictureOfExplan', imgUpload.single('picture'), titleController.uploadPictureOfExplan)
 
router.post('/addFavoriteTitle', titleController.addFavoriteTitle)

router.get('/titleDto/:_id', titleController.getTitleDto)

router.post('/editTitle', titleController.editTitle)

router.delete('/restartAnswer', controller.removeUserAnswer)

module.exports = router