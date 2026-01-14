import { VNode, TagType } from "./MeR.js";
export class WIframe {
    constructor(options) {
        // 状态
        this.mounted = false
        this.isMaximized = false;
        this.originalRect = {
            width: 800,
            height: 600,
            left: 100,
            top: 100
        };
        this.overlayElement = null;
        this.options = {
            width: 800,
            height: 600,
            left: 100,
            top: 100,
            headerHeight: 48,
            ...options
        };
        this.originalRect = {
            width: options.width ?? 800,
            height: options.height ?? 600,
            left: options.left ?? 100,
            top: options.top ?? 100
        };
        // 创建 iframe
        this.iframeNode = VNode.createElement(TagType.IFRAME, {
            src: this.options.src,
            title: this.options.title,
            sandbox: "allow-same-origin allow-scripts allow-forms allow-popups",
            referrerpolicy: "no-referrer",
            ...this.options.iframeProps
        });
        // 创建 overlay 遮罩层（初始隐藏）
        const overlayNode = VNode.createElement(TagType.DIV, {
            class: "window-overlay",
            style: `
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        z-index: 1003;
        pointer-events: auto;
    `
        });
        // 内容区：必须设为 relative，让 overlay 能 absolute 定位
        this.contentNode = VNode.createElement(TagType.DIV, {
            class: "window-content",
            style: "position: relative; width: 100%; height: 100%;"
        }, [this.iframeNode, overlayNode]); // ✅ 把 overlay 放在 iframe 之后（渲染在上方）
        // 控制按钮
        const controls = VNode.createElement(TagType.DIV, { class: "window-controls" }, [
            VNode.createElement(TagType.BUTTON, {
                class: "window-btn minimize-btn",
                onclick: () => this.minimize()
            }).setText("−"),
            VNode.createElement(TagType.BUTTON, {
                class: "window-btn maximize-btn",
                onclick: () => this.maximize()
            }).setText("□"),
            VNode.createElement(TagType.BUTTON, {
                class: "window-btn close-btn",
                onclick: () => this.destroy()
            }).setText("×")
        ]);
        // 标题栏
        const header = VNode.createElement(TagType.DIV, { class: "window-header" }, [
            VNode.createElement(TagType.DIV, { class: "window-title" }).setText(this.options.title),
            controls
        ]);
        // 主窗口
        this.windowNode = VNode.createElement(TagType.DIV, {
            id: this.options.id,
            class: "iframe-window",
            style: `left: ${this.options.left}px; top: ${this.options.top}px; width: ${this.options.width}px; height: ${this.options.height}px;`
        }, [header, this.contentNode]);

    }
    /**
     * 获取 VNode（用于挂载）
     */
    getNode() {
        return this.windowNode;
    }
    /**
     * 挂载到 DOM 并初始化交互
     */
    mount(mountPoint) {
        this.windowNode.mount(mountPoint);
        this._initInteractions();
        this.mounted = true
    }
    _initInteractions() {
        const winEl = document.getElementById(this.options.id);
        if (!winEl)
            return;
        const headerEl = winEl.querySelector('.window-header');
        this.overlayElement = winEl.querySelector('.window-overlay');
        // 双击最大化
        headerEl?.addEventListener('dblclick', () => this.maximize());
        // 拖拽
        headerEl?.addEventListener('mousedown', (e) => {
            WIframe.dragState = {
                isDragging: true,
                element: winEl,
                offsetX: e.clientX - winEl.offsetLeft,
                offsetY: e.clientY - winEl.offsetTop
            };
            this._setActive();
            e.preventDefault();
        });
    }
    // 全局鼠标事件（需在应用初始化时绑定一次）
    static initGlobalEvents() {
        if (WIframe._globalEventsInitialized)
            return;
        WIframe._globalEventsInitialized = true;
        document.addEventListener('mousemove', (e) => {
            // 拖拽
            if (WIframe.dragState?.isDragging) {
                const { element, offsetX, offsetY } = WIframe.dragState;
                element.style.left = (e.clientX - offsetX) + 'px';
                element.style.top = (e.clientY - offsetY) + 'px';
            }
        });
        document.addEventListener('mouseup', () => {
            WIframe.dragState = null;
        });
    }
    _setActive() {
        // 断言为 HTMLElement[]
        const windows = document.querySelectorAll('.iframe-window');
        windows.forEach(w => w.classList.remove('active'));
        const win = document.getElementById(this.options.id);
        if (win) {
            win.classList.add('active');
            win.style.zIndex = '1000';
            windows.forEach(w => {
                if (w.id !== this.options.id) {
                    w.style.zIndex = '999';
                }
            });
        }
    }
    requestOverlay() {
        console.log('aa')
        if (this.overlayElement) {
            this.overlayElement.style.display = 'block';
        }
    }
    cancelOverlay() {
        if (this.overlayElement) {
            this.overlayElement.style.display = 'none';
        }
    }
    close() {
        const win = document.getElementById(this.options.id);
        if (win)
            win.style.display = 'none';
    }
    emerge() {
        const win = document.getElementById(this.options.id);
        if (win)
            win.style.display = 'block';
    }
    exist(){
        return this.windowNode != null
    }
    destroy() {
        const win = document.getElementById(this.options.id);
        if (win) {
            // 可选：清空 iframe 内容以释放资源（尤其在跨域或复杂应用时有用）
            const iframe = win.querySelector('iframe');
            if (iframe) {
                iframe.src = 'about:blank';
                // 如果你后续还需要访问 iframe 内容，可省略上一行
            }
            // 从 DOM 中彻底移除
            this.mounted = false
            win.remove();
        }
        // 可选：清除内部引用（帮助 GC，尤其在长期运行应用中）
        this.windowNode = null;
        this.contentNode = null;
        this.iframeNode = null;
    }
    minimize() {
        const win = document.getElementById(this.options.id);
        if (!win)
            return;
        const isMinimized = win.classList.contains('minimized');
        if (isMinimized) {
            // 还原
            win.classList.remove('minimized');
            win.style.height = this.originalRect.height + 'px';
            win.style.maxHeight = `0px`;
            win.style.minHeight = `420px`;
        }
        else {
            // 最小化：只保留标题栏
            this.originalRect.height = win.offsetHeight; // 保存当前高度
            win.classList.add('minimized');
            win.style.minHeight = `${this.options.headerHeight}px`;
            win.style.maxHeight = `${this.options.headerHeight}px`;
        }
    }
    maximize() {
        const win = document.getElementById(this.options.id);
        if (!win)
            return;
        if (this.isMaximized) {
            // 恢复
            win.style.width = this.originalRect.width + 'px';
            win.style.height = this.originalRect.height + 'px';
            win.style.left = this.originalRect.left + 'px';
            win.style.top = this.originalRect.top + 'px';
            win.style.borderRadius = '8px';
            win.classList.remove('maximized');
            this.isMaximized = false;
        }
        else {
            // 最大化
            this.originalRect = {
                width: win.offsetWidth,
                height: win.offsetHeight,
                left: win.offsetLeft,
                top: win.offsetTop
            };
            win.style.width = 'calc(100vw - 40px)';
            win.style.height = 'calc(100vh - 40px)';
            win.style.left = '20px';
            win.style.top = '20px';
            win.style.borderRadius = '0';
            win.classList.add('maximized');
            this.isMaximized = true;
        }
    }
    reset() {
        const win = document.getElementById(this.options.id);
        if (!win)
            return;
        win.style.display = 'block';
        win.style.width = this.originalRect.width + 'px';
        win.style.height = this.originalRect.height + 'px';
        win.style.left = this.originalRect.left + 'px';
        win.style.top = this.originalRect.top + 'px';
        win.style.borderRadius = '8px';
        win.classList.remove('maximized');
        this.isMaximized = false;
        const content = win.querySelector('.window-content');
        if (content)
            content.style.display = 'block';
    }
    refresh() {
        const iframe = document.getElementById(`iframe-${this.options.id}`);
        if (iframe) {
            const src = iframe.src;
            iframe.src = '';
            setTimeout(() => iframe.src = src, 100);
        }
    }
}
// 全局拖拽/缩放状态（简化实现）
WIframe.dragState = null;
WIframe._globalEventsInitialized = false;
