
function createUserService({ userModel, userAnswerModel, ObjectId }) {
    return {
        async getUser(userEmail) {
            try {
                const result = await userModel.findOne({ userEmail })
                return result
            } catch (err) {
                throw new Error(`getUser: ${err}`)
            }
        },

        async saveUserChoice(userEmail, sectionRef, _id, userOption) {
            const newfld = new ObjectId(_id)
            try {
                await userAnswerModel.findOneAndUpdate(
                    {
                        ftitleid: newfld,
                        fuseremail: userEmail
                    },
                    {
                        $set: {
                            fcollection: sectionRef,
                            userOption: userOption
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
        },

        async validateUser(userEmail, userPasswd) {
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
        },

        loadUserContext(user) {

        },

        async modifyUserSubject(userEmail, newSubject, newChapter, newSection) {
            try {
                const result = await userModel.findOneAndUpdate(
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
    }
}

module.exports = createUserService