
function createTitleService({getTitleModel, userAnswerModel, subjectModel, chapterModel}) {
    return {
        async  getSizeOfAllTitle(Title) {
            try {
                return await Title.countDocuments()
            } catch (err) {
                throw new Error(`getSizeOfAllTitle: ${err}`)
            }
        },

        async getTitleById(titleModel, _id) {
            try {
                const [titleDoc, userAnswerDoc] = await Promise.all([
                    titleModel.findById(_id),
                    userAnswerModel.findOne({ ftitleid: _id })
                ])
                titleDoc.userAnswer = userAnswerDoc
                return titleDoc
            } catch (err) {
                throw new Error(`getTitleById: ${err}`)
            }
        },

        async getSubjectNames() {
            try {
                const result = await subjectModel.find({}).select('subject').lean()
                return result.map(doc => doc.subject)
            } catch (err) {
                throw new Error(`getSubjectNames: ${err}`)
            }
        },
        
        async getChapterNames(subjectName) {
            try {
                const result = await subjectModel.findOne({subject: subjectName}).lean()
                return Object.keys(result.chapters)
            } catch (err) {
                throw new Error(`getChapterNames: ${err}`)
            }
        },
        
        async getSectionNames(chapterName) {
            try {
                const result = await chapterModel.findOne({chapter: chapterName})
                return Array.from(result.sections.keys())
            } catch (err) {
                throw new Error(`getSectionNames: ${err}`)
            }
        },

        async  getSectionRef(subjectName, chapterName, sectionName) {
            const subject = await subjectModel.findOne({ subject: subjectName }).lean()
            const chapter = await chapterModel.findOne({_id: subject.chapters[chapterName]}).lean()
            return chapter.sections[sectionName]
        },

        async getExplanationById(titleModel, _id) {
            try {
                const result = await titleModel.findById(_id).select('explanation').lean()
                return result.explanation
            } catch (err) {
                throw new Error(`getExplanationById: ${err}`)
            }
        },

        async getUserAnswerOfAllTitle(titleModel, userEmail, sectionRef) {
            try {
                var result = await titleModel.aggregate([
                    {
                      $lookup: {
                        from: userAnswerModel.collection.collectionName,
                        let: { titleId: "$_id" },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $and: [
                                    { $eq: ["$fcollection", sectionRef] },
                                  { $eq: ["$ftitleid", "$$titleId"] },
                                  { $eq: ["$fuseremail", userEmail] }
                                ]
                              }
                            }
                          }
                        ],
                        as: "userAnswer"
                      }
                    },
                    {
                      $project: {
                        _id: 1,
                        rightIndex: 1,
                        userAnswer: { $arrayElemAt: ["$userAnswer", 0] }
                      }
                    }
                  ])
                  if (result.length == 0) {
                    console.log(`getUserAnswerOfAllTitle: cannot find by collection of ${sectionRef}`)
                  }

                  return result
            } catch (err) {
                throw new Error(`getUserAnswerOfAllTitle: ${err}`)
            }
        },

        async getTitleModel(subjectName, chapterName, sectionName){
            const sectionRef = await this.getSectionRef(subjectName, chapterName, sectionName)
            const titleModel = getTitleModel(sectionRef)
            return {titleModel, sectionRef}
        }
    }
}

module.exports = createTitleService