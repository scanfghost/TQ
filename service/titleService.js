const {getTitleModel} = require('../dao/TitleDao')
const favoriteTitleDao = require('../dao/FavoriteTitleDao')
const {FavoriteTitleDto} = require('../dto/FavoriteTitleDto')

async function modifyImgOfTitle(collectionName, _id, imgName) {
    try {
        const titleDao = getTitleModel(collectionName)
        const result = await titleDao.findOneAndUpdate(
            { _id },
            { 'choice.img': imgName }
        ).lean()
        return result
    } catch (err) {
        throw new Error(`modifyImgOfTitle: ${err}`)
    }
}

async function modifyImgOfExplan(collectionName, _id, explanImgName) {
    try {
        const titleDao = getTitleModel(collectionName)
        const result = await titleDao.findOneAndUpdate(
            { _id },
            { 'choice.explanImg': explanImgName }
        ).lean()
        return result
    } catch (err) {
        throw new Error(`modifyImgOfExplan: ${err}`)
    }
}

async function addFavoriteTitle(user, titleid, comment, keywords) {
    try {
        if(!Array.isArray(keywords)){
            throw new Error(`keywords must be an array`)
        }
        //check if the title is already favorited
        const exists = await favoriteTitleDao.findOne({
            fuseremail: user.userEmail,
            ftitleid: titleid,
            comment: comment,
            keywords: {$all: keywords}
        }).select('_id').lean()
        if(exists){
            throw new Error(`the title is already favorited`)
        }
        const favoriteTitleDto = new FavoriteTitleDto({
            fuseremail: user.userEmail,
            ftitleid: titleid,
            subject: user.currentSubject,
            chapter: user.currentChapter,
            section: user.currentSection,
            comment: comment,
            keywords: keywords
        })
        const result = await favoriteTitleDao.create(favoriteTitleDto)
        return result
    } catch (err) {
        throw new Error(`addFavoriteTitle: ${err}`)
    }
}

module.exports = {
    modifyImgOfTitle,
    modifyImgOfExplan,
    addFavoriteTitle,
}