/**
 * 标签枚举值
 */
var TagType;
(function (TagType) {
    TagType["DIV"] = "div";
    TagType["SPAN"] = "span";
    TagType["INPUT"] = "input";
    TagType["IFRAME"] = "iframe";
    TagType["BUTTON"] = "button";
    TagType["CANVAS"] = "canvas";
})(TagType || (TagType = {}));
/**
 * 虚拟节点
 */
class VNode {
    constructor(tag, children = []) {
        this.element = {
            tag: tag,
            props: {}
        };
        this.children = children;
        this.mounted = false;
    }
    /**
     * 创建元素节点（工厂方法）
     * @param tag - 元素标签
     * @param props - 元素属性（可选）
     * @param children - 子节点（可选）
     */
    static createElement(tag, props, children) {
        const node = new VNode(tag, children || []);
        if (props) {
            node.setProps(props);
        }
        return node;
    }
    /**
     * 转换为真实DOM
     */
    toRealDOM() {
        // 创建元素
        const el = document.createElement(this.element.tag);
        // 设置属性
        if (this.element.props) {
            Object.entries(this.element.props).forEach(([key, value]) => {
                if (value === undefined || value === null) {
                    return; // 跳过 undefined 和 null 值
                }
                // 处理特殊属性
                switch (key) {
                    case 'className':
                        // React风格的className
                        el.className = String(value);
                        break;
                    case 'class':
                        // HTML class
                        el.className = String(value);
                        break;
                    case 'style':
                        // 处理样式
                        if (typeof value === 'string') {
                            el.style.cssText = value;
                        }
                        else if (typeof value === 'object') {
                            Object.assign(el.style, value);
                        }
                        break;
                    case 'onclick':
                        // onclick 事件处理
                        if (typeof value === 'function') {
                            el.onclick = value;
                        }
                        else if (typeof value === 'string') {
                            // 如果是字符串，可以执行
                            el.onclick = () => {
                                try {
                                    eval(value);
                                }
                                catch (e) {
                                    console.error('Error executing onclick:', e);
                                }
                            };
                        }
                        break;
                    default:
                        // 处理其他事件（on开头的事件）
                        if (key.startsWith('on') && typeof value === 'function') {
                            const eventName = key.slice(2).toLowerCase();
                            el.addEventListener(eventName, value);
                        }
                        else {
                            // 普通属性
                            el.setAttribute(key, String(value));
                        }
                }
            });
        }
        this.children.forEach(child => {
            if (child == null) {
                // 跳过 null 或 undefined
                return;
            }
            if (typeof child === 'string' || typeof child === 'number') {
                el.appendChild(document.createTextNode(String(child)));
            }
            else if (child instanceof VNode) {
                el.appendChild(child.toRealDOM());
            }
            // 可选：如果还有其他合法类型（如 number），也可处理
        });
        return el;
    }
    /**
     * 挂载到DOM
     * @param mountPoint - 挂载点配置
     */
    mount(mountPoint) {
        const container = document.querySelector(mountPoint.selector);
        if (!container) {
            throw new Error(`无法找到选择器: ${mountPoint.selector}`);
        }
        const realDOM = this.toRealDOM();
        container.appendChild(realDOM);
        this.mounted = true;
        return realDOM;
    }
    /**
     * 设置元素属性
     * @param props - 属性对象
     */
    setProps(props) {
        this.element.props = { ...this.element.props, ...props };
        return this;
    }
    /**
    * 设置指定索引位置的子节点为文本
    * @param text - 要设置的文本内容
    * @param index - 子节点数组中的索引位置，默认为 0
    */
    setText(text, index = 0) {
        if (index < 0) {
            throw new Error('Index must be non-negative');
        }
        if (index >= this.children.length) {
            // 越界：直接追加到末尾
            this.children.push(text);
        }
        else {
            // 在指定位置插入（不替换）
            this.children.splice(index, 0, text);
        }
        return this;
    }
    /**
 * 将 CSS 字符串注入到 <head> 中的 <style> 标签
 * @param cssText - 要注入的 CSS 文本（可包含选择器）
 * @private
 */
    _injectStyleToHead(cssText) {
        const head = document.head;
        if (!head) {
            console.warn('No <head> found, cannot inject style');
            return;
        }
        const style = document.createElement('style');
        style.textContent = cssText;
        head.appendChild(style);
    }
    /**
     * 设置样式
     * @param styleString - CSS 字符串
     * @param mode - 应用模式
     *   - 'inline': 设置为当前元素的行内样式（props.style）
     *   - 'header': 注入到 <head> 中的 <style> 标签
     */
    setStyle(styleString, mode = 'inline') {
        if (mode === 'inline') {
            this.setProps({ style: styleString });
        }
        else if (mode === 'header') {
            this._injectStyleToHead(styleString);
        }
        return this;
    }
    /**
     * 加载 CSS 文件并注入到 <head>
     * @param path - CSS 文件路径
     */
    async setCSS(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load CSS: ${response.status}`);
            }
            const cssText = await response.text();
            this._injectStyleToHead(cssText);
        }
        catch (error) {
            console.error(`Error loading CSS from ${path}:`, error);
        }
        return this;
    }
}
export { VNode, TagType };
