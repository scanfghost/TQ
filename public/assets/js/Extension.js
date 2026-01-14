import { InHot, Stroke, Border } from "./Edge.js";
import { Direction, resize } from "./Resize.js";
import { VNode, TagType } from "./MeR.js";
function createCanvas(mountPoint) {
    const previewCanvas = new VNode(TagType.CANVAS).setProps({
        id: "previewCanvas",
        style: `
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none; 
        `
    });
    const canvas = previewCanvas.mount(mountPoint);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Failed to get 2D context');
    }
    return {
        previewCanvas,
        canvas,
        context
    };
}
function resetState() {
    return {
        hot: false,
        border: Border.NONE,
        direction: Direction.NONE,
        drag: false,
        mX_rg: 0,
        mY_rg: 0,
        dt: 0
    };
}
function SetUp(elem, beforeDrag, afterDrag) {
    let _canvas = null;
    if (!_canvas) {
        _canvas = createCanvas({ selector: "body" });
    }
    const body = document.querySelector('body');
    elem.style.position = "absolute !important";
    let state = resetState();
    document.addEventListener('mousemove', function (evt) {
        _canvas.context.clearRect(0, 0, _canvas.canvas.width, _canvas.canvas.height);
        if (!state.drag) {
            [state.hot, state.border] = InHot(evt, elem, 3);
            body.style.cursor = state.hot ? state.border == Border.BOTTOM ? 'row-resize' : 'col-resize' : 'default';
        }
        else {
            const rect = elem.getBoundingClientRect();
            Stroke(_canvas.context, rect, state.border, evt, 'rgba(153, 169, 230, 0.4)', 6);
        }
    });
    elem.addEventListener('mousedown', (evt) => {
        if (state.hot) {
            state.mX_rg = evt.clientX;
            state.mY_rg = evt.clientY;
            state.drag = true;
            beforeDrag()
        }
    });
    document.addEventListener('mouseup', (evt) => {
        if (state.drag) {
            state.drag = false;
            if (state.border == Border.BOTTOM) {
                state.dt = state.mY_rg - evt.clientY;
                if (state.dt < 0) {
                    state.dt = -state.dt;
                    state.direction = Direction.TTB;
                }
                else {
                    state.direction = Direction.BTT;
                }
            }
            else if (state.border == Border.LEFT || state.border == Border.RIGHT) {
                state.dt = state.mX_rg - evt.clientX;
                if (state.dt < 0) {
                    state.dt = -state.dt;
                    state.direction = Direction.LTR;
                }
                else {
                    state.direction = Direction.RTL;
                }
            }
            resize(elem, state.border, state.direction, state.dt);
            afterDrag()
        }
    });
}
export { SetUp };
