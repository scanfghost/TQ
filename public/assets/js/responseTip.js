class responseTip {
    constructor(tip, lastTime) {
        this.tip = tip
        this.lastTime = lastTime
    }
}

let tipQueue = []

function enqueue(tip, lastTime) {
    tipQueue.push(new responseTip(tip, lastTime))
    processQueue()
}

function dequeue() {
    if (tipQueue.length == 0) {
        return null
    }
    return tipQueue.shift()
}

function peek() {
    return tipQueue[0]
}

let isShowing = false

function processQueue() {
    if (isShowing || tipQueue.length == 0) {
        return 
    }

    isShowing = true

    const currentTip = peek()

    $('.response-tip')
        .html(currentTip.tip)
        .addClass('active')

    setTimeout(() => {
        $('.response-tip').removeClass('active')
        isShowing = false
        dequeue()
        processQueue()
    }, currentTip.lastTime);
}

function getLastTimeSum() {
    return tipQueue.reduce((sum, tip) => sum + tip.lastTime, 0)
}

export function toggleResponseTip(tip, lastTime = 3000) {
    const waitTime = getLastTimeSum() + lastTime
    enqueue(tip, lastTime)
    return waitTime
}