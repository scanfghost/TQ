import { activeModalCard, idleModalCard } from './modalCard.js'

import rh from './requestHandler.js'

$(document).ready(() => {
    $(document).on('click', '.table-content ul li', function () {
        rh.fetchTitle.call(this)
    })

    $(document).on('click', '.choice ul li', function () {
        const blankType = $('.title').data('blank-type')

        if (blankType === 'single') {
            // 单空单选
            rh.singleChoice.call(this)
        } else if (blankType === 'singlemultiple') {
            // 单空多选
            rh.singleMultipleChoice.call(this)
        } else if (blankType === 'multiplesingle') {
            // 多空单选
            rh.multipleSingleChoice.call(this)
        }
    })

    $('.float-btn').on('click', function () {
        $('.panel').toggleClass('active');
    });

    $('#restartAnswer').on('click', function () {
        rh.deleteAnswer.call(this)
    })

    $('#saveAnswer').on('click', function () {
        rh.saveHistoryAnswer.call(this)
    })

    $('#uploadPictureOfTitle').on('click', function () {
        rh.fetchAllTitleImage.call(this)
    })

    $('.uploadPictureOfTitle-content form').on('submit', function (e) {
        e.preventDefault()
        rh.uploadPictureOfTitle.call(this)
    })

    $('#uploadPictureOfExplan').on('click', function () {
        const title_no = $('#title_no').text().trim().replace(/\.$/, '')
        const p = $('.uploadPictureOfExplan-content')
        p.find('form').find('div').first().html(`为第 ${title_no} 题添加解释图片`)
        activeModalCard('.uploadPictureOfExplan-content')
    })

    $('.uploadPictureOfExplan-content form').on('submit', function (e) {
        e.preventDefault()
        rh.uploadPictureOfExplan.call(this)
    })

    $('#selectSubject').on('click', function () {
        rh.fetchSubjectForm.call(this)
    })

    $(document).on('change', '#selectForSubject', function () {
        rh.fetchChapterNames.call(this)
    })

    $(document).on('change', '#selectForChapter', function () {
        rh.fetchSectionNames.call(this)
    })

    $(document).on('submit', '#switchSubjectForm', function (e) {
        e.preventDefault()
        rh.modifyUserSubject.call(this)
    })

    $(document).on('click', '#modifyUserSettingButton', function () {
        if (!confirm('设置变更将自动刷新页面，是否继续?')) {
            return
        }
        rh.modifyUserSetting.call(this)
    })

    $('#setting').on('click', function () {
        activeModalCard('.setting-content')
    })

    $('#addFavoriteTitle').on('click', function () {
        const title_no = $('#title_no').text().trim().replace(/\.$/, '')
        const p = $('.addFavoriteTitle-content')
        p.find('form').find('div').first().html(`收藏第 ${title_no} 题`)
        $('#inputKeywords').val('')
        $('#inputComment').val('')
        activeModalCard('.addFavoriteTitle-content')
    })

    $('.addFavoriteTitle-content form').on('submit', function (e) {
        e.preventDefault()
        rh.addFavoriteTitle.call(this)
    })

    $('#editTitle').on('click', function () {
        rh.editTitle.call(this)
    })

    $('.editTitle-content form').on('submit', function (e) {
        e.preventDefault()
        rh.submitTitle.call(this)
        idleModalCard()
    })

    $('.uploadPictureOfTitle-content .imageQueue').on('click', '.image-queue-item', function () {
        rh.selectImageQueueItem.call(this)
    });

    $('.uploadPictureOfTitle-content .selectSerialType').on('click', function () {
        rh.selectSerialTypeItem.call(this)
    });
})