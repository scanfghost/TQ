export function activeModalCard(specificSelector, callback) {
    const $modal = $(`.modalCard${specificSelector}`)
    const $cover = $(`.shadow-cover`)
    
    if ($modal.length === 0 || $cover.length === 0) {
        console.warn(`未找到带有专属选择器 "${specificSelector}" 的弹窗或遮罩`);
        return;
    }

    $modal.addClass('active');
    $cover.addClass('active');

    if (typeof callback == 'function') {
        callback()
    }
}

export function idleModalCard(callback) {
    $(`.modalCard`).removeClass('active');
    $(`.shadow-cover`).removeClass('active');

    if (typeof callback == 'function') {
        callback()
    }
}

$(document).ready(() => {
    $('.shadow-cover').on('click', function () {
        idleModalCard()
    })
})
