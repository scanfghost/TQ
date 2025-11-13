
function createTitleService({ getTitleModel, userAnswerModel, historyAnswerModel, subjectModel, chapterModel }) {
    return {
        async getSizeOfAllTitle(Title) {
            try {
                return await Title.countDocuments()
            } catch (err) {
                throw new Error(`getSizeOfAllTitle: ${err}`)
            }
        },

        async getTitleById(titleModel, _id, excludeFields = []) {
            const excludeStr = excludeFields.length
                ? '-' + excludeFields.join(' -')
                : ''

            try {
                const [titleDoc, userAnswerDoc] = await Promise.all([
                    titleModel.findById(_id).select(excludeStr).lean(),
                    userAnswerModel.findOne({ ftitleid: _id }).lean()
                ])

                if (!titleDoc) {
                    throw new Error(`题目不存在`)
                }

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
                const result = await subjectModel.findOne({ subject: subjectName }).lean()
                return Object.keys(result.chapters)
            } catch (err) {
                throw new Error(`getChapterNames: ${err}`)
            }
        },

        async getSectionNames(chapterName) {
            try {
                const result = await chapterModel.findOne({ chapter: chapterName })
                return Array.from(result.sections.keys())
            } catch (err) {
                throw new Error(`getSectionNames: ${err}`)
            }
        },

        async getSectionRef(subjectName, chapterName, sectionName) {
            const subject = await subjectModel.findOne({ subject: subjectName }).lean()
            const chapter = await chapterModel.findOne({ _id: subject.chapters[chapterName] }).lean()
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

        async getTitleModel(subjectName, chapterName, sectionName) {
            const sectionRef = await this.getSectionRef(subjectName, chapterName, sectionName)
            const titleModel = getTitleModel(sectionRef)
            return { titleModel, sectionRef }
        },

        async saveHistoryAnswer(userEmail, sectionRef) {
            try {
                const filter = {
                    fuseremail: userEmail,
                    fcollection: sectionRef
                }

                const titleModel = getTitleModel(sectionRef)
                const [result, total] = await Promise.all([
                    userAnswerModel.find(filter).select('ftitleid answerIndex -_id').lean(),
                    titleModel.countDocuments()
                ])

                if (result.length < total) {
                    return [-1, "还有题目未完成"]
                }

                const sortedResult = result.sort((a, b) => {
                    if (typeof a.ftitleid == 'string' && typeof b.ftitleid == 'string') {
                        return a.ftitleid.localeCompare(b.ftitleid)
                    }
                    return a.ftitleid - b.ftitleid
                })

                const qaArray = sortedResult.map(item => [item.ftitleid, item.answerIndex])

                const exists = await historyAnswerModel.findOne({
                    fuseremail: userEmail,
                    fcollection: sectionRef,
                    qa: { $eq: qaArray }
                }).select('_id').lean()

                //code 1: insert success, 0: dulpulate, -1: fail
                if (exists) {
                    return [0, "已存在和现在答题情况相同版本"]
                }

                const historyData = {
                    fcollection: sectionRef,
                    fuseremail: userEmail,
                    qa: qaArray
                }

                await historyAnswerModel.create(historyData)

                return [1, "提交成功"]
            } catch (err) {
                throw new Error(`saveHistoryAnswer: ${err}`)
            }
        },

        async modifyImgOfTitle(titleModel, _id, imgName) {
            try {
                const result = await titleModel.findOneAndUpdate(
                    { _id },
                    { img: imgName }
                ).lean()
                return result
            } catch (err) {
                throw new Error(`modifyImgOfTitle: ${err}`)
            }
        }
    }
}

module.exports = createTitleService