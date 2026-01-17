const {getTitleModel} = require('../dao/TitleDao')

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

module.exports = {
    modifyImgOfTitle,
    modifyImgOfExplan
}