class ImageDto {
    constructor(questionId, name, type, serial) {
        this.questionId = questionId
        this.fileName = name
        this.type = type
        this.serial = serial
    }
}

module.exports = {
    ImageDto
}