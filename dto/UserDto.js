class UserDto {
    constructor(id, email, subject_id, chapter_id, section_id, currentSubject, currentChapter, currentSection, role) {
        this.id = id
        this.userEmail = email
        this.subjectId = subject_id
        this.chapterId = chapter_id
        this.sectionId = section_id
        this.currentSubject = currentSubject
        this.currentChapter = currentChapter
        this.currentSection = currentSection
        this.role = role
    }
}

module.exports = {
    UserDto
}