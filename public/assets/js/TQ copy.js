import { activeModalCard, idleModalCard } from './modalCard.js'
import { toggleResponseTip } from './responseTip.js'

$(document).ready(() => {
    function updateTitleInUrl(newid, newNo) {
        const newPath = `/TQ/${newid}/${newNo}`
        history.replaceState({ questionNum: newNo }, '', newPath)
    }

    $(document).on('click', '.table-content ul li', function () {
        let _id = this.id.replace('No', '')
        const text = $(this).text().trim()
        $.ajax({
            type: 'GET',
            url: '/title/' + _id + "?No=" + encodeURIComponent(text),
            success: (res) => {
                $('.explanation-content').html('')
                if (res.html.explanationContent) {
                    $('.explanation-content').html(res.html.explanationContent)
                }
                $('.title-content').html(res.html.titleChoiceContent)
                let [newid, newtitle_no] = get_idNo()
                updateTitleInUrl(newid, newtitle_no)
            },
            error: (xhr, status, err) => {
                const errorData = JSON.parse(xhr.responseText)
                toggleResponseTip(`服务端错误信息: errorData.errMsg`)
                console.log('服务端错误信息:', errorData.errMsg)
            }
        })
    })

    $(document).on('click', '.choice ul li', function () {
        const _id = $('.title')[0].id
        const relavantLi = $(`#No${_id}`)

        if (relavantLi.hasClass('answered')) {
            return
        }

        const optionType = $('.choice').data('type')
        const blanks = $('.blank > div')

        
        const selected = this.id.replace('choice', '')

        // 移除同一组的其他选中状态
        $(this).siblings().removeClass('selected')
        
        // 添加选中效果
        $(this).addClass('selected')

        relavantLi.removeClass('right')
        relavantLi.removeClass('wrong')

        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ selected, _id }),
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
    })

    $('.float-btn').on('click', function () {
        $('.panel').toggleClass('active');
    });

    $('#restartAnswer').on('click', function () {
        if (!confirm("重新做题不保留记录，是否继续?")) {
            return
        }

        $.ajax({
            type: 'DELETE',
            url: '/restartAnswer',
            success: () => {
                location.reload()
            }
        })
    })

    $('#saveAnswer').on('click', function () {

        $.ajax({
            type: 'POST',
            url: '/saveHistoryAnswer',
            success: (res) => {
                toggleResponseTip(res.data.message, 4000)
            },
            error: (xhr, status, err) => {
                const errorData = JSON.parse(xhr.responseText)
                toggleResponseTip(errorData.errMsg, 4000)
            }
        })
    })

    $('#uploadPictureOfTitle').on('click', function () {
        const title_no = $('#title_no').text().trim().replace(/\.$/, '')
        const p = $('.uploadPictureOfTitle-content')
        p.find('form').find('div').first().html(`为第 ${title_no} 题添加图片`)
        activeModalCard('.uploadPictureOfTitle-content')
    })

    function get_idNo() {
        let _id, title_no
        try {
            title_no = +($('#title_no').text().trim().replace(/\.$/, ''))
            _id = $(`.table-content ul li:nth-child(${title_no})`).attr('id').replace('No', '')
        } catch (err) {
            console.log(`get_idNo err: ${err}`)
        }
        return [_id, title_no]
    }

    $('.uploadPictureOfTitle-content form').on('submit', function (e) {
        e.preventDefault()
        let [_id, title_no] = get_idNo()

        const formData = new FormData(this)
        formData.append('_id', _id)
        $.ajax({
            type: 'POST',
            contentType: false,
            url: '/uploadPictureOfTitle',
            data: formData,
            processData: false,
            success: function (res) {
                toggleResponseTip('上传成功, 即将刷新页面', 3000)
                idleModalCard()
                setTimeout(() => {
                    window.location.href = `/TQ/${_id}/${title_no}`
                }, 4000);
            },
            error: function (xhr, status, err) {
                const formatRes = JSON.parse(xhr.responseText)
                toggleResponseTip(`上传失败: ${formatRes.errMsg}`, 4000)
            }
        })
    })

    $('#selectSubject').on('click', function () {
        const switchSubject = $('.switchSubject-content')
        $.ajax({
            type: "GET",
            url: '/subjectForm',
            success: (res) => { 
                switchSubject.html(res.html.switchSubjectContent)
                activeModalCard('.switchSubject-content')
            }
        })
    })

    $(document).on('change', '#selectForSubject', function () {
        const selectedValue = $(this).val().trim()
        const chapterSelect = $('#selectForChapter')

        chapterSelect.empty().append('<option value="">- 请选择 -</option>');

        $.ajax({
            type: "GET",
            url: '/chapterNames' + '?subjectName=' + selectedValue,
            success: (res) => {
                res.data.chapterNames.forEach(chapterName => {
                    chapterSelect.append(`<option value="${chapterName}">${chapterName}</option>`)
                })
            }
        })
    })

    $(document).on('change', '#selectForChapter', function () {
        const selectedValue = $(this).val().trim()
        const sectionSelect = $('#selectForSection')

        sectionSelect.empty().append('<option value="">- 请选择 -</option>');

        $.ajax({
            type: "GET",
            url: '/sectionNames' + '?chapterName=' + selectedValue,
            success: (res) => {
                res.data.sectionNames.forEach(sectionName => {
                    sectionSelect.append(`<option value="${sectionName}">${sectionName}</option>`)
                })
            }
        })
    })

    $(document).on('submit', '#switchSubjectForm', function (e) {
        e.preventDefault()

        const subject = $('#selectForSubject').val()
        const chapter = $('#selectForChapter').val()
        const section = $('#selectForSection').val()

        let [_id, title_no] = get_idNo()

        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: '/modifyUserSubject',
            data: JSON.stringify({
                subject, chapter, section
            }),
            success: (result) => {
                if (result.success == 1) {
                    window.location.href = `/TQ`
                } else {
                    $('.switchSubject-content').html('')
                    console.log('here')
                    idleModalCard()
                }
            }
        })
    })

    // $(document).on('change', '#toggleSwitch', function(){
    //     const instantJudge = this.checked
    //     $.ajax({
    //         type: 'POST',
    //         contentType: 'application/json',
    //         url: '/userSetting/modify/instantJudge',
    //         data: JSON.stringify({
    //             instantJudge: instantJudge
    //         }),
    //         success: () => {
    //             console.log('here success')
    //         }
    //     })
    // })

    $(document).on('click', '#modifyUserSettingButton', function () {
        if (!confirm('设置变更将自动刷新页面，是否继续?')) {
            return
        }
        const instantJudge = $('#toggleSwitch').prop('checked')

        let [_id, title_no] = get_idNo()

        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: '/modifyUserSetting/',
            data: JSON.stringify({
                instantJudge: instantJudge
            }),
            success: () => {
                window.location.href = `/TQ/${_id}/${title_no}`
            }
        })
    })

    $('#setting').on('click', function () {
        activeModalCard('.setting-content')
    })
})