const multer = require('multer')
const path = require('path')

const imgUploadPath = path.join(process.env.rootUploadFolder, 'img')
const ALLOWED_IMGS = ['.jpg', '.jpeg', '.png']

const imgStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,  imgUploadPath)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const tempName = `temp_${Date.now()}_${Math.round(Math.random() * 10000)}${ext}`
        cb(null, tempName)
    }
})

const imgUpload = multer({
    storage: imgStorage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)

        if (!ALLOWED_IMGS.includes(ext)) {
            return cb(new Error(`格式不支持: ${ext}. 仅支持: ${ALLOWED_IMGS.join(', ')}`))
        }

        cb(null, true);
    }
})

module.exports = {
    imgUpload
}