export function toggleResponseTip(tip, lastTime) {
    lastTime = lastTime || 3000
    $('.response-tip').addClass('active')
    $('.response-tip').html(tip)
    setTimeout(() => {
        $('.response-tip').removeClass('active')
    }, lastTime)
}