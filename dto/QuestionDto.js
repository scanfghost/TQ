const TYPE = ["choice", "fill", "answer"]
const OPTIONTYPE = ["shared", "individual"]

function createBasicChoice(option_type, shared_options, individual_options, right_option) {
    let obj = {}
    if (!OPTIONTYPE.includes(option_type)) {
        throw new Error('createBasicChoice: option_type isnt one of "shared" or "individual"')
    }
    obj.optionType = option_type
    obj.shared = shared_options
    obj.individual = individual_options
    obj.rightOption = right_option
    return obj
}

function createBasicUserAnswer(choice_options, choice_correct) {
    let obj = {}
    obj.userOption = choice_options
    obj.isCorrect = choice_correct == 1 ? true : false
    return obj
}

class QuestionDto {
    constructor(id, type, title, basicChoice, explantion, subject_id, chapter_id, section_id, serial) {
        if (!TYPE.includes(type)) {
            throw new Error('constructor of question: type isnt one of "choice" or "fill" or "answer"')
        }
        this.id = id
        this.type = type
        this.explantion = explantion
        this.subjectId = subject_id 
        this.chapterId = chapter_id
        this.sectionId = section_id
        this.serial = serial

        if (this.type === 'fill') {
            this.processFillData(this.fill)
        } else if (this.type === 'answer') {
            this.processAnswerData(this.answer)
        } else if (this.type === 'choice') {
            this.choice = {}
            this.title = title
            this.processChoiceData(basicChoice)
        }
    }

    insertChoiceUserAnswer(basicUserAnswer){
        this.choice.useranswer = basicUserAnswer
    }

    insertTitleImages(titleImgs){
        if (titleImgs == undefined) {
            throw new Error(`cannot insert undefined title image into questionDto`)
        }
        if (!Array.isArray(titleImgs)) {
            throw new Error(`${titleImgs} is not Array`)
        }
        this.titleImgs = titleImgs
    }

    insertExplanImages(explanImgs){
        if (explanImgs == undefined) {
            throw new Error(`cannot insert undefined explan image into questionDto`)
        }
        if (!Array.isArray(explanImgs)) {
            throw new Error(`${explanImgs} is not Array`)
        }
        this.explanImgs = explanImgs
    }

    processChoiceData(basicChoice) {
        basicChoice.blankSize = basicChoice.rightOption.length || 0
        if (basicChoice.blankSize === 1) {
            if (basicChoice.rightOption[0].length === 1) {
                basicChoice.blankType = 'single';
            } else if (thbasicChoiceis.rightOption[0].length > 1) {
                basicChoice.blankType = 'singlemultiple';
            }
        } else if (basicChoice.blankSize > 1) {
            basicChoice.blankType = 'multiplesingle';
        }
        if (basicChoice.optionType === 'shared') {
            basicChoice.options = basicChoice.shared || [];
        } else if (basicChoice.optionType === 'individual'){
            basicChoice.options = basicChoice.individual || [];
        }
        Object.assign(this.choice, basicChoice)
    }
}

module.exports = {
    QuestionDto,
    createBasicChoice,
    createBasicUserAnswer
}