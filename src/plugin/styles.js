import editors from './../core/editors.js';
import toolbars from './../core/toolbars.js';

const styles = {
    name: "styles",
    styles: {},
    add: (style) => {
        styles.styles[style.key] = style;
    },
    events: {
        "editors.init": () => {
            for (const name in styles.styles) {
                const style = styles.styles[name];
                
                toolbars.addItem({
                    key: style.key,
                    title: style.title,
                    element: "select",
                    attributes: {
                        "data-style": true
                    },
                    options: style.options,
                    optionToClass: style.optionToClass,
                    change: (event, item, toolbar, editor) => {
                        onSelectionChange(event, item, toolbar, editor);
                    }
                });
            }
        },
        "toolbar.opened": (toolbar) => {
            const editor = editors.getActive();
            const selEl = editor.selection.get().element;
            
            for (const name in styles.styles) {
                const style = styles.styles[name];
                
                if (toolbar.has(style.key)) {
                    const select = toolbar.get(style.key);

                    Object.values(style.options).forEach(classname => {
                        if (classname !== '' && selEl.classList.contains(classname)) {
                            select.el.value = classname;
                            return;
                        } else if (classname === '') {
                            select.el.value = classname;
                            return;
                        }
                    });
                }                
            }
        }        
    }
};

function getFullyEnclosedElement() {
    const sel = window.getSelection();
    
    if (sel.rangeCount === 0) {
        return null;
    }
    
    const range = sel.getRangeAt(0);
    const { startContainer, startOffset, endContainer, endOffset } = range;
    
    if (sel.isCollapsed) {
        const node = range.commonAncestorContainer;
        return node.nodeType == 1 ? node : node.parentNode;
    }
    
    if (
        startContainer === endContainer
        && startOffset === 0
        && endContainer.nodeType === Node.TEXT_NODE
        && startContainer.textContent.length === endOffset
    ) {
        return startContainer.parentElement;
    }

    if (
        startOffset === 0
        && endContainer.nodeType === Node.TEXT_NODE
        && endContainer.textContent.length === endOffset
        && endContainer.parentElement.nextSibling === null
        && Array.from(startContainer.parentElement.childNodes).indexOf(endContainer.parentElement) !== -1
    ) {
        return startContainer.parentElement;
    }

    return null;
}

function onSelectionChange(event, item, toolbar, editor) {
    const enclosedEl = getFullyEnclosedElement();

    if (enclosedEl) {
        if (item.el.hasAttribute('data-class')) {
            if (event.target.value == '') {
                enclosedEl.classList.remove(item.el.getAttribute('data-class'));

                if (enclosedEl.classList.length === 0) {
                    enclosedEl.removeAttribute('class');

                    if (enclosedEl.tagName.toLowerCase() === 'span') {
                        // Todo: remove span but keep text
                    }
                }
            } else {
                enclosedEl.classList.replace(item.el.getAttribute('data-class'), event.target.value);
            }
        } else {
            enclosedEl.classList.add(event.target.value);
        }
    } else {
        document.execCommand("insertHTML", false, "<span class="+event.target.value+">"+window.getSelection()+"</span>");
    }

    item.el.setAttribute('data-class', event.target.value);
}

export default styles;