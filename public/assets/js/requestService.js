function fetchTitle(_id) {
    return $.ajax({
        type: 'GET',
        url: '/title/' + _id
    })
}

function submitChoice(_id, userOption) {
    return $.ajax({
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ userOption, _id }),
        url: '/choice'
    })
}

function deleteAnswer() {
    return $.ajax({
        type: 'DELETE',
        url: '/restartAnswer',
    })
}

function saveHistoryAnswer() {
    return $.ajax({
        type: 'POST',
        url: '/saveHistoryAnswer',
    })
}

function editImage(formData) {
    return $.ajax({
        type: 'POST',
        contentType: false,
        url: '/editImage',
        data: formData,
        processData: false
    })
}

function modifyUserSetting(instantJudge) {
    return $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: '/modifyUserSetting/',
        data: JSON.stringify({
            instantJudge
        }),
    })
}

function modifyUserSubject(subject, chapter, section) {
    return $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: '/modifyUserSubject',
        data: JSON.stringify({
            subject, chapter, section
        }),
    })
}

function fetchSubjectForm() {
    return $.ajax({
        type: "GET",
        url: '/subjectForm',
    })
}

function fetchChapterNames(subject) {
    return $.ajax({
        type: "GET",
        url: '/chapterNames' + '?subjectName=' + subject,
    })
}

function fetchSectionNames(chapterName) {
    return $.ajax({
        type: "GET",
        url: '/sectionNames' + '?chapterName=' + chapterName,
    })
}

function addFavoriteTitle(titleid, comment, keywords) {
    return $.ajax({
        type: "POST",
        contentType: 'application/json',
        url: '/addFavoriteTitle',
        data: JSON.stringify({
            titleid, comment, keywords
        }),
    })
}

function fetchTitleDto(_id) {
    return $.ajax({
        type: "GET",
        url: '/titleDto/' + _id,
    })
}



function editTitle(_id, title, explanation) {
    return $.ajax({
        type: "POST",
        contentType: 'application/json',
        url: '/editTitle',
        data: JSON.stringify({
            _id, title, explanation
        }),
    })
}

function fetchAllTypeImage(questionId, type) {
    return $.ajax({
        type: "GET",
        url: "/fetchAllTypeImage/" + questionId +"/" + type
    })
}

export default {
    fetchTitle,
    submitChoice,
    deleteAnswer,
    saveHistoryAnswer,
    editImage,
    modifyUserSetting,
    modifyUserSubject,
    fetchSubjectForm,
    fetchChapterNames,
    fetchSectionNames,
    addFavoriteTitle,
    fetchTitleDto,
    editTitle,
    fetchAllTypeImage
}