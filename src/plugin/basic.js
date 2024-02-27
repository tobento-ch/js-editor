import editors from './../core/editors.js';
import toolbars from './../core/toolbars.js';
import {hasObjKey, createElement} from './../core/utils.js';

const basic = {
    name: "basic",
    items: {
        "p": {
            title: "Paragraph",
            command: ["formatblock", "<p>"],
            text: "&#182;",
            tagname: "p"
        },
        "h1": {
            title: "H1",
            command: ["formatblock", "<h1>"],
            text: "<b>H<sub>1</sub></b>",
            tagname: "h1",
            undo: ["formatblock", "<p>"]
        },
        "h2": {
            title: "H2",
            command: ["formatblock", "<h2>"],
            text: "<b>H<sub>2</sub></b>",
            tagname: "h2",
            undo: ["formatblock", "<p>"]
        },
        "h3": {
            title: "H3",
            command: ["formatblock", "<h3>"],
            text: "<b>H<sub>3</sub></b>",
            tagname: "h3",
            undo: ["formatblock", "<p>"]
        },
        "h4": {
            title: "H4",
            command: ["formatblock", "<h4>"],
            text: "<b>H<sub>4</sub></b>",
            tagname: "h4",
            undo: ["formatblock", "<p>"]
        },
        "h5": {
            title: "H5",
            command: ["formatblock", "<h5>"],
            text: "<b>H<sub>5</sub></b>",
            tagname: "h5",
            undo: ["formatblock", "<p>"]
        },
        "h6": {
            title: "H6",
            command: ["formatblock", "<h6>"],
            text: "<b>H<sub>6</sub></b>",
            tagname: "h6",
            undo: ["formatblock", "<p>"]
        },
        "bold": {
            title: "Bold",
            command: ["bold"],
            text: "<b>B</b>",
            tagname: "b",
            "undo": null
        },
        "italic": {
            title: "Italic",
            command: ["italic"],
            text: "<i>I</i>",
            tagname: "i",
            undo: null
        },
        "underline": {
            title: "Underline",
            command: ["underline"],
            text: "<u>U</u>",
            tagname: "u",
            undo: null
        },
        "strike": {
            title: "Strike through",
            command: ["strikeThrough"],
            text: "<s>S</s>",
            tagname: "s",
            undo: null
        },
        "ol": {
            title: "Numbered list",
            command: ["insertorderedlist"],
            text: "&#35;",
            tagname: "ol"
        },
        "ul": {
            title: "Dotted list",
            command: ["insertunorderedlist"],
            text: "&#8226;",
            tagname: "ul"
        },
        "quote": {
            title: "Quote",
            command: ["formatblock", "blockquote"],
            text: "&#10077;",
            tagname: "blockquote",
            undo: ["outdent"]
        },
        "pre": {
            title: "Preformatted",
            command: ["formatblock", "<pre>"],
            text: "&lt;pre&gt;",
            tagname: "pre",
            undo: ["formatblock", "<p>"]
        },
        "code": {
            title: "Code",
            command: null,
            text: "&lt;code&gt;",
            tagname: "code"
        },                            
        "undo": {
            title: "Undo",
            command: ["undo"],
            text: "&#8617;"
        }, 
        "redo": {
            title: "Redo",
            command: ["redo"],
            text: "&#8618;"
        },
        "|": {
            element: "span",
            text: "<!-- -->",
            classes: ["etb-sv"]
        },
        "||": {
            element: "span",
            text: "<!-- -->",
            classes: ["etb-sv-space"]
        },
        "_": {
            element: "span",
            text: "<!-- -->",
            classes: ["etb-sh"]
        },
        "__": {
            element: "span",
            text: "<!-- -->",
            classes: ["etb-sh-space"]
        },
        "back": {
            build_default: false,
            text: "&#8592;", // back
            click: (event, item, toolbar, editor) => {
                toolbars.open(toolbars.lastId);
                toolbar.close(); // call it after open
                editor.selection.clear();
            }
        }
    },
    events: {
        "editors.init": () => {
            const items = basic.items;
            for (const key in items) {
                items[key]['key'] = key;
                toolbars.addItem(items[key]);
            }
            
            const toolbar = toolbars.create({id: "headings"});
            
            toolbar.build(['back', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
            toolbars.addItem({
                key: "headings",
                title: "Headings",
                text: "<b>H</b>",
                tagname: "span",
                build_default: false,
                click: (event, item, toolbar, editor) => {
                    const htoolbar = toolbars.get('headings');
                    editor.selection.save();
                    htoolbar.open();
                    htoolbar.positioning(null, null, null, true);
                    toolbars.close([htoolbar.id]);
                }
            });
        },
        "editor.mouseup": (event, editor) => {
            editor.selection.getTagnames().forEach(tagname => {
                if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].indexOf(tagname) >= 0) {
                    editor.toolbar.setActiveItem('headings');
                    return;
                }
            });
        }
    }
};

const html = {
    name: "html",
    events: {
        "editors.init": () => {
            toolbars.addItem({
                key: "sourcecode",
                title: "Sourcecode",
                text: "&lt;/&gt;",
                click: (event, item, toolbar, editor) => {
                    if (editor.isHtmlMode === false) {
                        // switch to html
                        const contentTextNode = document.createTextNode(editor.el.innerHTML);
                        const preEl = document.createElement('pre');

                        editor.el.innerHTML = '';
                        editor.el.contentEditable = false;
                        preEl.className = 'editor-html-mode';
                        preEl.onblur = editor.el.onblur;
                        preEl.contentEditable = true;
                        preEl.appendChild(contentTextNode);
                        editor.el.appendChild(preEl);
                        editor.isHtmlMode = true;
                        toolbar.close();
                        toolbar.disableExcept(['sourcecode']);
                    } else {
                        // switch back
                        editor.el.innerHTML = editor.extractText(editor.el);
                        editor.el.contentEditable = true;                
                        editor.isHtmlMode = false;
                        toolbar.close();
                        toolbar.enableExcept([]);
                    }
                }
            });
        },
        "editor.mouseup": (event, editor) => {
            if (editor.isHtmlMode === true) {
                editor.toolbar.setActive('sourcecode');
            }
        }
    }
};

const clear = {
    name: "clear",
    events: {
        "editors.init": () => {
            toolbars.addItem({
                key: "clear",
                title: "clear",
                text: "clear",
                click: (event, item, toolbar, editor) => {                            
                    editor.el.innerHTML = '';

                    if (typeof editor.inputEl !== 'undefined') {
                        editor.inputEl.value = '';
                    }
                }
            });
        }                
    }
};

const links = {
    name: "links",
    events: {
        "editors.init": () => {
            if (toolbars.has('link') === false) {
                const toolbar = toolbars.create({id: "link"});

                toolbars.addItem({
                    key: "link.insert",
                    text: "&#10004; insert",
                    title: "Insert link",
                    build_default: false,
                    click: (event, item, toolbar, editor) => {
                        const sel = editor.selection.getSaved();
                        let el = sel.element;

                        if (sel.tagName !== 'a') {
                            el = createElement({
                                element: "a",
                                text: sel.text
                            });

                            editor.selection.replace(el);
                        }

                        el.setAttribute('href', toolbar.get('link.input').el.value);

                        if (toolbar.has('link.window') && toolbar.get('link.window').el.checked === true) {
                            el.setAttribute('target', '_blank');
                            el.setAttribute('rel', 'noopener noreferrer');
                        } else {
                            el.removeAttribute('target');
                            el.removeAttribute('rel');
                        }
                        
                        if (toolbar.has('link.class') && toolbar.get('link.class').el.value !== '') {
                            el.setAttribute('class', toolbar.get('link.class').el.value);   
                        } else {
                            el.removeAttribute('class');
                        }

                        toolbar.get('link.input').el.value = '';

                        toolbar.close();
                    }
                });

                toolbars.addItem({
                    key: "link.delete",
                    build_default: false,
                    text: "&#10008;",
                    title: "Unlink",
                    click: (event, item, toolbar, editor) => {
                        const sel = editor.selection.getSaved();
                        sel.element.outerHTML = sel.element.innerText;
                        toolbar.close();
                    }
                });
                
                toolbars.addItem({
                    key: "link.visit",
                    build_default: false,
                    text: "visit",
                    title: "Visit link",
                    click: (event, item, toolbar, editor) => {
                        const inputItem = toolbar.get('link.input');
                        Object.assign(document.createElement('a'), {
                            target: '_blank',
                            rel: 'noopener noreferrer',
                            href: inputItem.el.value,
                        }).click();
                    }
                }); 

                toolbars.addItem({
                    key: "link.input",
                    build_default: false,
                    element: "input",
                    type: "text",
                    placeholder: "Url",
                    classes: ["etb-full-width"]
                });

                toolbars.addItem({
                    key: "link.window",
                    id: "link_window",
                    element: "input",
                    type: "checkbox"
                });

                toolbars.addItem({
                    key: "link.windowLabel",
                    element: "label",
                    for: "link_window",
                    text: "Open on new window"
                });

                toolbars.addItem({
                    key: "link.class",
                    build_default: false,
                    id: "link_class",
                    title: "Link style",
                    element: "select",
                    options: {
                        "none": "",
                        "button default": "button",
                        "button default fit": "button fit",
                        "button primary": "button primary",
                        "button primary fit": "button primary fit",
                        "button secondary": "button secondary",
                        "button secondary fit": "button secondary fit"
                    }
                });

                toolbar.build([
                    'back', 'link.visit', 'link.delete', 'link.insert', '_',
                    'link.input', '_', '__',
                    'link.window', 'link.windowLabel', '__', '_',
                    'link.class'
                ]);
            }

            toolbars.addItem({
                key: "link",
                title: "Link",
                text: "&#128279;",
                tagname: "a",
                click: (event, item, toolbar, editor) => {
                    const linkTb = toolbars.get('link');
                    editor.selection.save();
                    linkTb.open();
                    linkTb.positioning(null, null, null, true);
                    toolbars.close([linkTb.id]);
                    linkTb.get('link.input').el.value = '';
                    linkTb.get('link.input').el.focus();
                    linkTb.get('link.window').el.checked = false;
                    linkTb.disable('link.delete');
                }
            });
        },
        "editor.mouseup": (event, editor) => {
            if (editor.selection.get('tagName') === 'a' && toolbars.has('link')) {
                const ltoolbar = toolbars.get('link');
                const selEl = editor.selection.get('element');
                const inputItem = ltoolbar.get('link.input');
                const classItem = ltoolbar.get('link.class');
                editor.toolbar.close();
                editor.selection.save(false);
                ltoolbar.open(true, false);
                ltoolbar.positioning();
                ltoolbar.enable('link.delete');
                inputItem.el.value = editor.selection.get('element').getAttribute('href');
                inputItem.el.focus();

                if (selEl.hasAttribute('target')) {
                    ltoolbar.get('link.window').el.checked = true;
                } else {
                    ltoolbar.get('link.window').el.checked = false;
                }
                
                // set active class
                //console.log(selEl.classList);
                /*selEl.classList.forEach(classname => {
                    //toolbars.get();
                    
                });*/
            }
        },
        "toolbar.closed": (toolbar) => {
            if (toolbar.id === 'link') {
                const editor = editors.getActive();
                
                if (editor) {
                    editor.selection.clear();
                }
            }
        }
    }
};

export { basic, html, clear, links };