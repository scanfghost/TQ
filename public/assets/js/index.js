import { toggleResponseTip } from './responseTip.js'
import { activeModalCard, idleModalCard } from './modalCard.js'

$(document).ready(() => {
    $('#loginButton').on('click', function () {
        activeModalCard('.login-content')
    })

    $('.login-content').on('submit', function (e) {
        e.preventDefault()
        var userEmail = $('input[name="userEmail"]', this).val()
        var userPasswd = $('input[name="userPasswd"]', this).val()

        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: '/login',
            data: JSON.stringify({
                userEmail,
                userPasswd
            }),
            success: function (res) {
                if (res.data.loginSuccess) {
                    toggleResponseTip("登录成功，3秒后跳转...", 2000)
                    idleModalCard('.login-content')
                    setTimeout(() => {
                        window.location.href = '/TQ'
                    }, 3000);
                } else {
                    toggleResponseTip("登录失败: " + res.errMsg, 4000)
                }
            },
            error: function (xhr, status, error) {
                const errorMsg = xhr.responseJSON?.errMsg || error
                toggleResponseTip("登录失败: " + errorMsg, 4000)
            }
        })
    })

    $('.enterTQ').on('click', function (e) {
        if ($('#loginButton').length > 0) {
            e.preventDefault()
            toggleResponseTip("请先登录", 2000)
        }
    })
})