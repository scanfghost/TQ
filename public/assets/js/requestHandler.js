import { activeModalCard, idleModalCard } from './modalCard.js'
import { toggleResponseTip } from './responseTip.js'
import rs from './requestService.js'

function singleChoice() {
    // 单空单选
    const _id = $('.title')[0].id.replace(/^question/, '')
    const relavantLi = $(`#serial${_id}`)

    if (relavantLi.hasClass('right') || relavantLi.hasClass('wrong')) {
        return
    }

    // 移除其他选中项
    $(this).siblings().removeClass('selected')
    // 添加当前选中项
    $(this).addClass('selected')

    const selected = this.id.replace('choice', '')
    let userOption = [[selected]]

    rs.submitChoice(_id, userOption)
        .done(res => {
            $('.explanation-content').html(res.html.explanationContent)
            const answer = res.data.answer
            if (answer == 'answered') {
                relavantLi.addClass('answered')
            } else {
                relavantLi.addClass('answered')
                if (answer == 'right') {
                    relavantLi.addClass('right')
                } else if (answer == 'wrong') {
                    relavantLi.addClass('wrong')
                }
            }
        })
        .fail((xhr, status, err) => {
            const errorData = JSON.parse(xhr.responseText)
            console.log('服务端错误信息:', errorData.errMsg)
        })
}

function singleMultipleChoice() {
    // 单空多选
    // 切换选中状态
    $(this).toggleClass('selected')

    const _id = $('.title')[0].id
    const relavantLi = $(`#No${_id}`)

    if (relavantLi.hasClass('answered')) {
        return
    }

    // 获取所有选中的选项
    const selectedOptions = []
    $(this).parent().find('li.selected').each(function () {
        selectedOptions.push(this.id.replace('choice', ''))
    })

    relavantLi.removeClass('right')
    relavantLi.removeClass('wrong')

    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ userOption: selectedOptions, _id: _id }),
        url: '/choice',
        success: function (res) {
            $('.explanation-content').html(res.html.explanationContent)
            const answer = res.data.answer
            if (answer == 'answered') {
                relavantLi.addClass('answered')
            } else {
                relavantLi.addClass('answered')
                if (answer == 'right') {
                    relavantLi.addClass('right')
                } else if (answer == 'wrong') {
                    relavantLi.addClass('wrong')
                }
            }
        },
        error: function (xhr, status, error) {
            const errorData = JSON.parse(xhr.responseText)
            console.log('服务端错误信息:', errorData.errMsg)
        }
    })
}

function multipleSingleChoice() {
    // 多空单选

    const _id = $('.title')[0].id
    const relavantLi = $(`#No${_id}`)

    if (relavantLi.hasClass('right') || relavantLi.hasClass('wrong')) {
        return
    }

    // 移除其他选中项
    $(this).siblings().removeClass('selected')
    // 添加当前选中项
    $(this).addClass('selected')

    const groupSize = $('.choice .individual-group').length;
    const userOption = []
    var selectedSize = 0

    // 检查是否所有组都已选择
    let allGroupsSelected = true;
    for (let i = 0; i < groupSize; i++) {
        userOption[i] = []
        $(`.choice .individual-group:eq(${i}) ul li[id^="choice${i}_"]`).each(function () {
            if ($(this).hasClass('selected')) {
                userOption[i].push(this.id.replace('choice' + i + '_', ''))
                selectedSize++
            }
        })
    }
    if (selectedSize !== groupSize) {
        allGroupsSelected = false
    }

    // 如果所有组都已选择，才提交答案
    if (allGroupsSelected) {
        rs.submitChoice(_id, userOption)
            .done(res => {
                $('.explanation-content').html(res.html.explanationContent)
                const answer = res.data.answer
                if (answer == 'answered') {
                    relavantLi.addClass('answered')
                } else {
                    relavantLi.addClass('answered')
                    if (answer == 'right') {
                        relavantLi.addClass('right')
                    } else if (answer == 'wrong') {
                        relavantLi.addClass('wrong')
                    }
                }
            })
            .fail((xhr, status, err) => {
                const errorData = JSON.parse(xhr.responseText)
                toggleResponseTip(errorData.errMsg, 4000)
                console.log('服务端错误信息:', errorData.errMsg)
            })
    }
}

function fetchTitle() {
    let _id = this.id.replace(/^serial/, '')

    rs.fetchTitle(_id)
        .done(res => {
            $('.explanation-content').html('')
            if (res.html.explanationContent) {
                $('.explanation-content').html(res.html.explanationContent)
            }
            $('.title-content').html(res.html.titleChoiceContent)
            updateTitleInUrl(_id)
        })
        .fail((xhr, status, err) => {
            const errorData = JSON.parse(xhr.responseText)
            toggleResponseTip(`服务端错误信息: ${errorData.errMsg}`)
            console.log('服务端错误信息:', errorData.errMsg)
        })
}

function deleteAnswer() {
    if (!confirm("重新做题不保留记录，是否继续?")) {
        return
    }
    rs.deleteAnswer()
        .done(() => {
            location.reload()
        })
        .fail((xhr, status, err) => {
            const errorData = JSON.parse(xhr.responseText)
            toggleResponseTip(errorData.errMsg, 4000)
            console.log('服务端错误信息:', errorData.errMsg)
        })
}

function saveHistoryAnswer() {
    rs.saveHistoryAnswer()
        .done((res) => {
            toggleResponseTip(res.data.message, 4000)
        })
        .fail((xhr, status, err) => {
            const errorData = JSON.parse(xhr.responseText)
            toggleResponseTip(errorData.errMsg, 4000)
        })
}

function uploadPictureOfTitle() {
    let [_id, title_no] = get_idNo()

    const formData = new FormData(this)
    formData.append('_id', _id)

    rs.uploadPictureOfTitle(formData)
        .done(() => {
            toggleResponseTip('上传成功, 即将刷新页面', 3000)
            idleModalCard()
            setTimeout(() => {
                window.location.href = `/TQ/${_id}/${title_no}`
            }, 4000);
        })
        .fail((xhr, status, err) => {
            const formatRes = JSON.parse(xhr.responseText)
            toggleResponseTip(`上传失败: ${formatRes.errMsg}`, 4000)
        })
}

function uploadPictureOfExplan() {
    let [_id, title_no] = get_idNo()

    const formData = new FormData(this)
    formData.append('_id', _id)

    rs.uploadPictureOfExplan(formData)
        .done(() => {
            toggleResponseTip('上传成功, 即将刷新页面', 3000)
            idleModalCard()
            setTimeout(() => {
                window.location.href = `/TQ/${_id}/${title_no}`
            }, 4000);
        })
        .fail((xhr, status, err) => {
            const formatRes = JSON.parse(xhr.responseText)
            toggleResponseTip(`上传失败: ${formatRes.errMsg}`, 4000)
        })
}



function fetchSubjectForm() {
    const switchSubject = $('.switchSubject-content')
    rs.fetchSubjectForm()
        .done((res) => {
            switchSubject.html(res.html.switchSubjectContent)
            activeModalCard('.switchSubject-content')
        })
        .fail((xhr, status, err) => {
            const formatRes = JSON.parse(xhr.responseText)
            toggleResponseTip(formatRes.errMsg, 4000)
        })
}

function fetchChapterNames() {
    const selectedValue = $(this).val().trim()
    const chapterSelect = $('#selectForChapter')

    chapterSelect.empty().append('<option value="">- 请选择 -</option>');

    rs.fetchChapterNames(selectedValue)
        .done((res) => {
            res.data.chapterNames.forEach(chapterName => {
                chapterSelect.append(`<option value="${chapterName}">${chapterName}</option>`)
            })
        })
        .fail((xhr, status, err) => {
            const formatRes = JSON.parse(xhr.responseText)
            toggleResponseTip(formatRes.errMsg, 4000)
        })
}

function fetchSectionNames() {
    const selectedValue = $(this).val().trim()
    const sectionSelect = $('#selectForSection')

    sectionSelect.empty().append('<option value="">- 请选择 -</option>');

    rs.fetchSectionNames(selectedValue)
        .done((res) => {
            res.data.sectionNames.forEach(sectionName => {
                sectionSelect.append(`<option value="${sectionName}">${sectionName}</option>`)
            })
        })
        .fail((xhr, status, err) => {
            const formatRes = JSON.parse(xhr.responseText)
            toggleResponseTip(formatRes.errMsg, 4000)
        })
}

function modifyUserSubject() {
    const subject = $('#selectForSubject').val()
    const chapter = $('#selectForChapter').val()
    const section = $('#selectForSection').val()

    let [_id, title_no] = get_idNo()

    rs.modifyUserSubject(subject, chapter, section)
        .done((res) => {
            if (res.data.success == 1) {
                window.location.href = `/TQ`
            } else {
                $('.switchSubject-content').html('')
                console.log('here')
                idleModalCard()
            }
        })
        .fail((xhr, status, err) => {
            const formatRes = JSON.parse(xhr.responseText)
            toggleResponseTip(formatRes.errMsg, 4000)
        })
}

function modifyUserSetting() {
    const instantJudge = $('#toggleSwitch').prop('checked')

    let [_id, _] = get_idNo()

    rs.modifyUserSetting(instantJudge)
        .done(() => {
            window.location.href = `/TQ/${_id}`
        })
        .fail((xhr, status, err) => {
            const formatRes = JSON.parse(xhr.responseText)
            toggleResponseTip(`设置变更失败: ${formatRes.errMsg}`, 4000)
        })
}

function get_idNo() {
    let _id, title_no
    try {
        title_no = +($('#title_no').text().trim().replace(/\.$/, ''))
        _id = $(`.table-content ul li:nth-child(${title_no})`).attr('id').replace('serial', '')
    } catch (err) {
        console.log(`get_idNo err: ${err}`)
    }
    return [_id, title_no]
}

function updateTitleInUrl(newid) {
    const newPath = `/TQ/${newid}`
    history.replaceState({}, '', newPath)
}

function addFavoriteTitle() {
    const [titleid, _] = get_idNo()
    const comment = $('#inputComment').val().trim()
    const keywords = $('#inputKeywords').val().trim().split(/[,，]/).map(keyword => keyword.trim())

    rs.addFavoriteTitle(titleid, comment, keywords)
        .done((res) => {
            toggleResponseTip('加入收藏成功', 3000)
            idleModalCard()
        })
        .fail((xhr, status, err) => {
            const formatRes = JSON.parse(xhr.responseText)
            toggleResponseTip(formatRes.errMsg, 4000)
        })
}

function editTitle() {
    const title_no = $('#title_no').text().trim().replace(/\.$/, '')
    const p = $('.editTitle-content')
    p.find('form').find('div').first().html(`编辑第 ${title_no} 题`)
    const [_id, _] = get_idNo()
    const titleInput = $('#inputTitle')
    const explanInput = $('#inputExplanation')
    rs.fetchTitleDto(_id)
        .done((res) => {
            titleInput.val(res.data.questionDto.title)
            explanInput.val(res.data.questionDto.explantion)
            activeModalCard('.editTitle-content')
        })
}

function submitTitle() {
    const [_id, _] = get_idNo()
    const title = $('#inputTitle').val().trim()
    const explanation = $('#inputExplanation').val().trim()
    rs.editTitle(_id, title, explanation)
        .done((res) => {
            toggleResponseTip('编辑成功, 3秒后刷新页面', 3000)
            idleModalCard()
            setTimeout(() => {
                location.reload()
            }, 3500)
        })
        .fail((xhr, status, err) => {
            const formatRes = JSON.parse(xhr.responseText)
            toggleResponseTip(formatRes.errMsg, 4000)
        })
}

export default {
    singleChoice,
    fetchTitle,
    singleMultipleChoice,
    multipleSingleChoice,
    deleteAnswer,
    saveHistoryAnswer,
    uploadPictureOfTitle,
    uploadPictureOfExplan,
    fetchSubjectForm,
    fetchChapterNames,
    fetchSectionNames,
    modifyUserSubject,
    modifyUserSetting,
    updateTitleInUrl,
    addFavoriteTitle,
    editTitle,
    submitTitle,
}