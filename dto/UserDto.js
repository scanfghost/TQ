class UserDto {
    constructor(id, email, currentSubject, currentChapter, currentSection, role) {
        this.id = id
        this.userEmail = email
        this.currentSubject = currentSubject
        this.currentChapter = currentChapter
        this.currentSection = currentSection
        this.role = role
    }
}

module.exports = {
    UserDto
}