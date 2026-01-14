import { WIframe } from './WIframe.js';
import { VNode, TagType } from "./MeR.js";
import { SetUp } from "./Extension.js";

$(document).ready(() => {
    // 注入样式（你的 globalCSS + setStyle）
    VNode.createElement(TagType.DIV).setCSS('/assets/css/AIConsultant.css');

    // 初始化全局交互
    WIframe.initGlobalEvents();

    function newWIframe() {
        return new WIframe({
            id: 'window1',
            title: 'AI Consultant',
            src: 'https://chat.baidu.com/search?isShowHello=1&pd=csaitab&setype=csaitab&extParamsJson=%7B%22enter_type%22%3A%22home_tab%22%7D', // 确保可访问
            width: 600,
            height: 420,
            left: 100,
            top: 100
        });
    }

    // 创建窗口
    let win1 = newWIframe()
    let visable = false

    $('#AIConsultant').on('click', function () {
        if (!win1.exist()) {
            const win1 = newWIframe()
            win1.mount({ selector: 'body' });
            visable = true
            const ediv = document.querySelector("#window1")
            SetUp(ediv, win1.requestOverlay.bind(win1), win1.cancelOverlay.bind(win1))
        } else {
            if (!win1.mounted) {
                win1.mount({ selector: 'body' });
                visable = true
                const ediv = document.querySelector("#window1")
                SetUp(ediv, win1.requestOverlay.bind(win1), win1.cancelOverlay.bind(win1))
            } else if (visable) {
                win1.close()
                visable = false
            } else {
                win1.emerge()
                visable = true
            }
        }
    })



})