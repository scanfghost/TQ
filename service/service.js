var mongoose = require('mongoose')
var { getModel, addModel, getByModel } = require('../model/Title')
const UserAnswer = require('../model/userAnswer')
const Subject = require('../model/Subject')
const Chapter = require('../model/Chapter')
const User = require('../model/User')

var Title = undefined

async function validateUser(userEmail, userPasswd) {
    //code -1 means user is not existed, code n means nth param dismatch
    const result = await getUser(userEmail)
    if (result) {
        if (result.userPasswd == userPasswd) {
            await loadUserContext(result)
            return { user: result }
        } else {
            return { user: null, code: 2 }
        }
    } else {
        return { user: null, code: -1 }
    }
}

async function loadUserContext(user) {
    Title = getModel(user.currentSubject, user.currentChapter, user.currentSection)
    if (!Title) {
        const sectionRef = await getSectionRef(user.currentSubject, user.currentChapter, user.currentSection)
        Title = addModel(user.currentSubject, user.currentChapter, user.currentSection, sectionRef)
    }
}

async function getUser(userEmail) {
    const result = await User.findOne({ userEmail })
    return result
}

async function getAllTitleWithRecord() {
    try {
        return await Title.aggregate([
            {
                $lookup: {
                    from: UserAnswer.collection.collectionName,
                    localField: "_id",
                    foreignField: "fid",
                    as: "userAnswers"
                }
            },
            {
                $addFields: {
                    userAnswer: {
                        $first: "$userAnswers"
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    choice: 1,
                    rightIndex: 1,
                    userAnswer: 1
                }
            }
        ])
    } catch (err) {
        console.log('find all titles err: ' + err)
    }
}

async function getTitleById(_id) {
    try {
        const [titleDoc, userAnswerDoc] = await Promise.all([
            Title.findById(_id),
            UserAnswer.findOne({ fid: _id })
        ])
        titleDoc.userAnswer = userAnswerDoc
        return titleDoc
    } catch (err) {
        console.log('find one title err: ' + err)
    }
}

async function getExplanationById(_id) {
    try {
        const result = await Title.findById(_id).select('explanation').lean()
        return result.explanation
    } catch (err) {
        console.log('getExplanationById err: ' + err)
    }
}

async function saveUserChoice(sectionRef, _id, selected) {
    const newfld = new mongoose.Types.ObjectId(_id)
    try {
        await UserAnswer.findOneAndUpdate(
            { fid: newfld },
            {
                $set: {
                    fcollection: sectionRef,
                    answerIndex: selected
                }
            },
            {
                upsert: true,
                new: true
            }
        )
    } catch (err) {
        console.log("save userAnswer err: " + err)
    }

    try {
        const result = await Title.findById(_id)
        return result.rightIndex == selected ? "right" : "wrong"
    } catch (err) {
        console.log('find choice err: ' + err)
    }

}

async function getSectionRef(subjectName, chapterName, sectionName) {
    const subject = await Subject.findOne({ subject: subjectName }).lean()
    const chapter = await Chapter.findOne({_id: subject.chapters[chapterName]}).lean()
    return chapter.sections[sectionName]
}

async function deleteDoc(collectionName, filter) {
    try {
        console.dir(filter)
        const collection = mongoose.connection.collection(collectionName)
        const result = await collection.deleteMany(filter)
        console.log(result)
    } catch (err) {
        console.log(`delete doc in ${collectionName} filtered by ${filter} err: ` + err)
    }
}

async function getSubjectNames() {
    try {
        const result = await Subject.find({}).select('subject').lean()
        return result.map(doc => doc.subject)
    } catch (err) {
        console.log('getSubjectNames err: ' + err)
    }
}

async function getChapterNames(subjectName) {
    try {
        const result = await Subject.findOne({subject: subjectName}).lean()
        return Object.keys(result.chapters)
    } catch (err) {
        console.log('getChapterNames err: ' + err)
    }
}

async function getSectionNames(chapterName) {
    try {
        const result = await Chapter.findOne({chapter: chapterName})
        return Array.from(result.sections.keys())
    } catch (err) {
        console.log('getSectionNames err: ' + err)
    }
}

async function switchSubject(userEmail, subjectName, chapterName, sectionName, sectionRef) {
    const model = getModel(subjectName, chapterName, sectionName)
    if (model == undefined || model == null) {
        const newModel = addModel(subjectName, chapterName, sectionName, sectionRef)
        if (newModel) {
            const result = await User.updateOne(
                { userEmail },
                { currentSubject: subjectName, currentChapter: chapterName , currentSection: sectionName}
            )
            if (result.modifiedCount <= 0) {
                console.log('switchSubject err: cannot synchronously modify user' + result.matchedCount == 1 ? ', matched but no need to rewrite' : '')
                return
            }
            console.log('switchSubject: newModel created by addModel')
            Title = newModel
            return
        } else {
            console.log('switchSubject err: newModel created by addModel is null')
            return
        }
    }
    Title = model
}

function getCurrentSubject() {
    const [subjectName, chapterName, sectionName] = getByModel(Title).split(':')
    return [subjectName, chapterName, sectionName]
}

module.exports = {
    getAllTitleWithRecord,
    getTitleById,
    saveUserChoice,
    getSectionRef,
    deleteDoc,
    getChapterNames,
    switchSubject,
    getCurrentSubject,
    validateUser,
    getExplanationById,
    getSubjectNames,
    getSectionNames
}