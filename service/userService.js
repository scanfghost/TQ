const ObjectId = require('mongoose').Types.ObjectId
const userDao = require('../dao/UserDao')
const userAnswerDao = require('../dao/UserAnswerDao')

async function getUser(userEmail) {
    try {
        const result = await userDao.findOne({ userEmail })
        return result
    } catch (err) {
        throw new Error(`getUser: ${err}`)
    }
}

async function saveUserChoice(userEmail, collectionName, _id, userOption, isChoiceCorrect) {
    const newfld = new ObjectId(_id)
    try {
        await userAnswerDao.findOneAndUpdate(
            {
                ftitleid: newfld,
                fuseremail: userEmail
            },
            {
                $set: {
                    fcollection: collectionName,
                    userOption: userOption,
                    isChoiceCorrect: isChoiceCorrect
                }
            },
            {
                upsert: true,
                new: true
            }
        )
    } catch (err) {
        throw new Error(`saveUserChoice: ${err}`)
    }
}

async function validateUser(userEmail, userPasswd) {
    //code -1 means user is not existed, code n means nth param dismatch
    const result = await this.getUser(userEmail)
    if (result) {
        if (result.userPasswd == userPasswd) {
            return { user: result }
        } else {
            return { user: null, code: 2 }
        }
    } else {
        return { user: null, code: -1 }
    }
}

async function modifyUserSubject(userEmail, newSubject, newChapter, newSection) {
    try {
        const result = await userDao.findOneAndUpdate(
            { userEmail: userEmail },
            {
                currentSubject: newSubject,
                currentChapter: newChapter,
                currentSection: newSection
            },
            {
                new: true,
                lean: true,
                select: "-userPasswd"
            }
        )

        if (!result) {
            throw new Error(`modifyUserSubject: cannot find user with ${userEmail}`)
        }

        return result
    } catch (err) {
        throw new Error(`modifyUserSubject: ${err}`)
    }
}

module.exports = {
    getUser,
    saveUserChoice,
    validateUser,
    modifyUserSubject
}