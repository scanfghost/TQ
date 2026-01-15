class UserSettingDto {
    constructor(userId, instantJudge) {
        this.userId = userId
        this.instantJudge = instantJudge == 1 ? true : false
    }
}

module.exports = {
    UserSettingDto
}