var Direction;
(function (Direction) {
    Direction["TTB"] = "top to bottom";
    Direction["BTT"] = "bottom to top";
    Direction["RTL"] = "right to left";
    Direction["LTR"] = "left to right";
    Direction["NONE"] = "none";
})(Direction || (Direction = {}));
var Border;
(function (Border) {
    Border["BOTTOM"] = "bottom";
    Border["LEFT"] = "left";
    Border["RIGHT"] = "right";
    Border["NONE"] = "none";
})(Border || (Border = {}));
function resize(elemDiv, border, direction, dt) {
    // 获取当前尺寸（转为数字，单位 px）
    const computedStyle = window.getComputedStyle(elemDiv);
    const currentWidth = parseInt(computedStyle.width);
    const currentHeight = parseInt(computedStyle.height);
    switch (border) {
        case Border.BOTTOM:
            if (direction == Direction.TTB) {
                elemDiv.style.height = (currentHeight + dt) + 'px';
            }
            else if (direction == Direction.BTT) {
                elemDiv.style.height = (currentHeight - dt) + 'px';
            }
            break;
        case Border.LEFT:
            const currentLeft = elemDiv.getBoundingClientRect().left;
            if (direction == Direction.LTR) {
                elemDiv.style.left = (currentLeft + dt) + 'px';
                elemDiv.style.width = (currentWidth - dt) + 'px';
            }
            else if (direction == Direction.RTL) {
                if (currentLeft - dt <= 0) {
                    elemDiv.style.left = (0) + 'px';
                }
                else {
                    elemDiv.style.left = (currentLeft - dt) + 'px';
                }
                elemDiv.style.width = (currentWidth + dt) + 'px';
            }
            break;
        case Border.RIGHT:
            if (direction == Direction.LTR) {
                elemDiv.style.width = (currentWidth + dt) + 'px';
            }
            else if (direction == Direction.RTL) {
                elemDiv.style.width = (currentWidth - dt) + 'px';
            }
            break;
        default:
            break;
    }
}
export { Direction, resize };
