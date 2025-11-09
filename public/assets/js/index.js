$(document).ready(() => {
    $('#loginButton').on('click', function () {
        $('.login-content').addClass('active')
        $('.shadow-cover').addClass('active')
    })

    $('.shadow-cover').on('click', function () {
        $('.shadow-cover').removeClass('active')
        $('.login-content').removeClass('active')
    })

    $('.login-content').on('submit', function (e) {
        e.preventDefault()
        var userEmail = $('input[name="userEmail"]', this).val()
        var userPasswd = $('input[name="userPasswd"]', this).val()
        console.log(userEmail + " " + userPasswd)

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
                    $('.response-tip').html("登录成功，3秒后跳转...")
                    $('.response-tip').addClass('active')
                    $('.shadow-cover').removeClass('active')
                    $('.login-content').removeClass('active')
                    setTimeout(function () {
                        $('.response-tip').removeClass('active')
                    }, 2000)
                    setTimeout(() => {
                        window.location.href = res.data.url
                    }, 3000);
                } else {
                    $('.response-tip').html("登录失败: " + res.errMsg)
                    $('.response-tip').addClass('active')
                    setTimeout(() => {
                        $('.response-tip').removeClass('active')
                    }, 2000);
                }
            }
        })
    })

    $('.enterTQ').on('click', function (e) {
        if ($('#loginButton').length > 0) {
            e.preventDefault()
            $('.response-tip').html("请先登录")
            $('.response-tip').addClass('active')
            setTimeout(() => {
                $('.response-tip').removeClass('active')
            }, 2000);
        }
    })
})