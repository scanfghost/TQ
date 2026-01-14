var Border;
(function (Border) {
    Border["BOTTOM"] = "bottom";
    Border["LEFT"] = "left";
    Border["RIGHT"] = "right";
    Border["NONE"] = "none";
})(Border || (Border = {}));
function InHot(evt, elem, THRESHOLD = 8) {
    const rect = elem.getBoundingClientRect();
    const mouseX = evt.clientX;
    const mouseY = evt.clientY;
    const leftDist = mouseX - rect.left;
    const rightDist = rect.right - mouseX;
    const bottomDist = rect.bottom - mouseY;
    let inHot = false;
    let border = Border.NONE;
    if (leftDist >= 0 && leftDist <= THRESHOLD) {
        inHot = true;
        border = Border.LEFT;
    }
    else if (rightDist >= 0 && rightDist <= THRESHOLD) {
        inHot = true;
        border = Border.RIGHT;
    }
    else if (bottomDist >= 0 && bottomDist <= THRESHOLD) {
        inHot = true;
        border = Border.BOTTOM;
    }
    return [inHot, border];
}
function Stroke(ctx, rect, border, evt, brush = "#ffffff", lineWidth = 5) {
    let customStyle = brush;
    ctx.strokeStyle = customStyle;
    ctx.lineWidth = lineWidth;
    let top = rect.top;
    let right = rect.right;
    let bottom = rect.bottom;
    let left = rect.left;
    let width = right - left;
    let height = bottom - top;
    switch (border) {
        case Border.BOTTOM:
            if (evt.clientY > top) {
                bottom = evt.clientY;
                height = bottom - top;
            }
            else {
                bottom = top;
                height = 0;
            }
            break;
        case Border.LEFT:
            if (evt.clientX < right) {
                left = evt.clientX;
                width = right - evt.clientX;
            }
            else {
                left = right;
                width = 0;
            }
            break;
        case Border.RIGHT:
            if (evt.clientX > left) {
                right = evt.clientX;
                width = evt.clientX - left;
            }
            else {
                right = left;
                width = 0;
            }
            break;
        default:
            break;
    }
    ctx.strokeRect(left, top, width, height);
}
export { InHot, Stroke, Border };
