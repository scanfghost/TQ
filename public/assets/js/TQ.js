$(document).ready(() => {
    $(document).on('click', '.table-content ul li', function () {
        const i = this.id.replace('No', '');
        const text = $(this).text().trim()
        $.ajax({
            type: 'GET',
            url: '/title/' + i + "?No=" + encodeURIComponent(text),
            success: (res) => {
                $('.explanation-content').html('') 
                if (res.html.explanationContent) {
                    $('.explanation-content').html(res.html.explanationContent)
                } 
                $('.title-content').html(res.html.titleContent)
            },
            error: (xhr, status, err) => {
                const errorData = JSON.parse(xhr.responseText);
                console.log('服务端错误信息:', errorData.errMsg);
            }
        })
    })

    $(document).on('click', '.choice ul li', function () {
        const _id = $('.title')[0].id
        const relavantLi = $(`#No${_id}`)
        const selected = this.id.replace('choice', '')
        const subjectName = $('#subjectName').text().trim()
        const chapterName = $('#chapterName').text().trim()
        const sectionName = $('#sectionName').text().trim()

        if (relavantLi.hasClass('answered')) {
            return
        }

        $(this).addClass('selected')

        relavantLi.removeClass('right')
        relavantLi.removeClass('wrong')

        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ selected, _id, subjectName, chapterName, sectionName}),
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
                const errorData = JSON.parse(xhr.responseText);
                console.log('服务端错误信息:', errorData.errMsg);
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
        const subjectName = $('#subjectName').text().trim()
        const chapterName = $('#chapterName').text().trim()

        console.log(subjectName + " : " + chapterName)

        $.ajax({
            type: 'DELETE',
            url: '/restartAnswer' + "/" + encodeURIComponent(subjectName) + "/" + encodeURIComponent(chapterName),
            success: () => {
                location.reload()
            }
        })
    })

    $('#selectSubject').on('click', function () {
        const switchSubject = $('.switchSubject-content')
        $.ajax({
            type: "GET",
            url: 'subjectForm',
            success: (result) => {
                switchSubject.addClass('active')
                switchSubject.html(result)
                $('.shadow-cover').addClass('active')
            }
        })
    })

    $('#setting').on('click', function () {
        $('.setting-content').addClass('active')
        $('.shadow-cover').addClass('active')
    })

    $('.shadow-cover').on('click', function () {
        $('.switchSubject-content').removeClass('active');
        $('.switchSubject-content').html('')
        $('.setting-content').removeClass('active')
        $('.shadow-cover').removeClass('active')
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

        const subjectName = $('#selectForSubject').val().trim()
        const chapterName = $('#selectForChapter').val().trim()
        const sectionName = $('#selectForSection').val().trim()

        $.ajax({
            type: 'GET',
            url: '/modifySubject' + "/" + encodeURIComponent(subjectName) + "/" + encodeURIComponent(chapterName)+ "/" + encodeURIComponent(sectionName),
            success: (result) => {
                if (result.success == 1) {
                    location.reload()
                } else {
                    $('.switchSubject-content').removeClass('active');
                    $('.switchSubject-content').html('')
                    $('.shadow-cover').removeClass('active')
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
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: '/modifyUserSetting/',
            data: JSON.stringify({
                instantJudge: instantJudge
            }),
            success: () => {
                location.reload()
            }
        })
    })
})