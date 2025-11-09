var mongoose = require('mongoose')

var titleSchema = new mongoose.Schema({
    title: String,
    choice: [String],
    rightIndex: Number,
    explanation: String
})
var titleModelMap = new Map()

function getModel(subjectName, chapterName, sectionName) {
    const key = `${subjectName}:${chapterName}:${sectionName}`
    const model = titleModelMap.get(key)
    if (!model) {
        console.log(`getModel by key'${key}' is ` + 'undefined')
    }
    return model
}

function addModel(subjectName, chapterName, sectionName, sectionRef) {
    const key = `${subjectName}:${chapterName}:${sectionName}`;

    if (titleModelMap.has(key)) {
        console.log(`addModel: already exist model relative to key ${key}`)
        return titleModelMap.get(key);
    }
    try {
        var newModel = mongoose.model(sectionRef, titleSchema, sectionRef)
        titleModelMap.set(key, newModel)
        return newModel
    } catch (err) {
        console.log('addModel err: ' + err)
        return null
    }
}

function getByModel(model){
    return Array.from(titleModelMap.entries()).find(([key, val]) => val === model)?.[0];
}

module.exports = {
    getModel,
    addModel,
    getByModel
}