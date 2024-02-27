import editors from './editors.js';
import events from './events.js';
import translator from './../core/translator.js';
import {
    uniqueId,
    hasObjKey,
    inArray,
    createElement
} from './utils.js';

class Toolbar {
    constructor(id, el, config) {
        this.id = id;
        this.el = el; // toolbar element
        this.width = null; // toolbar element width
        this.height = null; // toolbar element height
        this.x = 0; // toolbar element last x
        this.y = 0; // toolbar element last y
        this.config = config;
        this.items = {}; // toolbar added items such as buttons
        this.isOpen = false;
        this.keepOpenWhileWriting = false;
        this.init();
    }
    
    /**
     * Returns the selected text and element
     */
    init() {
        this.el.classList.add('editor-toolbar');
        this.el.setAttribute('data-editor-toolbar-id', this.id);
        this.el.setAttribute('data-editor-type', 'toolbar');
        this.close();
        document.body.appendChild(this.el);
    }
    
    /**
     * Keep open while writing
     */
    keepOpen(keepOpen = true) {
        this.keepOpenWhileWriting = keepOpen;
    }
    
    /**
     * Opens the toolbar.
     */
    open(setActive = true, eventFire = true) {
        this.isOpen = true;
        toolbars.openId = this.id;

        if (toolbars.lastId === null) {
            toolbars.lastId = this.id;
        }

        this.el.classList.add('etb-active');

        if (setActive) {
            this.setActive(editors.getActive().selection.getTagnames(), 'tagname');
        }

        if (eventFire) {
            events.fire('toolbar.opened', [this]);
        }
    }
    
    /**
     * Closes the toolbar.
     */
    close(eventFire = true) {
        this.el.classList.remove('etb-active');

        if (toolbars.openId === this.id) {
            toolbars.lastId = this.id;
        }
        
        if (this.isOpen && eventFire) {
            events.fire('toolbar.closed', [this]);
        }
        
        this.isOpen = false;
    }
    
    /**
     * Creates an element.
     */
    create(item) {
        const element = createElement(item);

        if (hasObjKey(item, 'key') === false) {
            item.key = uniqueId();
        }
        
        element.setAttribute('data-item-key', item.key);

        if (! hasObjKey(item, 'build_default')) {
            element.build_default = true;
        }

        if (hasObjKey(item, 'title')) {
            element.title = translator.trans(item.title);
        }

        if (hasObjKey(item, 'click')) {
            element.addEventListener('click', (e) => {
                item.click(e, item, this, editors.getActive());
            });
        }
        
        if (hasObjKey(item, 'change')) {
            element.addEventListener('change', (e) => {
                item.change(e, item, this, editors.getActive());
            });
        }

        if (hasObjKey(item, 'keyup')) {
            // Listen for keyup event.
            let globalTimeout = null; 

            element.addEventListener('keyup', (e) => {
                if (globalTimeout != null) {
                    clearTimeout(globalTimeout);
                }
                globalTimeout = setTimeout(() => {
                    globalTimeout = null;
                    item.keyup(e, item, this, editors.getActive());
                }, 200);
            });
        }

        if (hasObjKey(item, 'command')) {
            element.addEventListener('click', (e) => {
                const editor = editors.getActive();

                if (item.command !== null &&
                    item.command.constructor === Array &&
                    typeof item.command[0] !== 'undefined')
                {
                    item.buttonEl = e.currentTarget;
                    this.execItemCommand(item, editor);
                    this.setActive(editor.selection.getTagnames(), 'tagname');
                }
            });
        }

        return element;
    }
    
    /**
     * Adds an item to the toolbar.
     */
    add(item) {
        item.el = this.create(item);
        item.toolbarId = this.id;
        this.items[item.key] = item;

        if (hasObjKey(item, 'append')) {
            if (typeof item.append === 'string') {
                const appendItem = this.get(item.append);

                if (appendItem !== null) {
                    appendItem.el.parentNode.insertBefore(item.el, appendItem.el.nextSibling);
                }
            } else if (typeof item.append === 'object') {
                item.append.appendChild(item.el);
            }

            return this.items[item.key];
        }

        this.el.appendChild(item.el);

        return this.items[item.key];
    }
    
    /**
     * Builds the toolbar with the items.
     *
     * @param {Array} items The item keys ['bold', '|', ...]
     * @param {Object} The shared item parameters. {"editorId": "key"}
     */
    build(items, params = {}) {
        const eventResponse = events.fire('toolbar.build', {toolbar: this, toolbars: toolbars, items: items, params: params});
        items = eventResponse.items;
        params = eventResponse.params;

        if (typeof items === 'undefined' || items.constructor !== Array) {

            items = Object.keys(toolbars.items).filter(function(key) {

                if (toolbars.items[key]['build_default'] === false) {
                    return false;
                }

                if (typeof toolbars.items[key]['element'] === 'undefined') {
                    return true;
                }

                return toolbars.items[key]['element'] === 'button'
                    || toolbars.items[key]['element'] === 'select';
            });
        }
        
        items.forEach(key => {
            if (hasObjKey(toolbars.items, key)) {
                // important copy item and assign params.
                const item = Object.assign({}, toolbars.items[key], params);
                item.key = key;
                this.add(item);
            }
        });
    }
    
    /**
     * Has a toolbar item.
     */
    has(key) {
        return (typeof this.items[key] === 'undefined') ? false : true;
    }
    
    /**
     * Gets a toolbar item.
     */
    get(key) {
        return typeof this.items[key] !== 'undefined' ? this.items[key] : null;
    }
    
    /**
     * Disables a toolbar item.
     */
    disable(key, hide = true) {
        const item = this.get(key);

        if (item !== null) {
            item.el.setAttribute('disabled', true);

            if (hide) {
                item.el.style.display = 'none';
            }
        }
    }
    
    /**
     * Enables a toolbar item.
     */
    enable(key) {
        const item = this.get(key);

        if (item !== null) {
            item.el.style.removeProperty('display');
            item.el.removeAttribute('disabled');
        }
    }
    
    /**
     * Disables toolbar items except those specified.
     *
     * @param {Array} keys ['h1']
     * @param {Boolean} hide
     */
    disableExcept(keys = [], hide = true) {
        for (const key in this.items) {
            if (! inArray(keys, key)) {
                this.disable(key);
            }
        }

        if (hide) {
            //this.positioning(null, null, null, true);
        }
    }
    
    /**
     * Enables toolbar items except those specified.
     *
     * @param {Array} keys ['h1']
     */
    enableExcept(keys = []) {
        for (const key in this.items) {
            if (! inArray(keys, key)) {
                this.enable(key);
            }
        }

        //this.positioning(null, null, null, true);
    }
    
    /**
     * Sets an item(s) active.
     *
     * @param {Array|String} The active keys.
     * @param {String} itemKey The item key to be used for setting the active.
     * @param {Boolean} inactivateOthers True inactivates all others.
     */
    setActive(activeKeys, itemKey = 'key', inactivateOthers = true) {
        if (typeof activeKeys === 'string') {
            activeKeys = [activeKeys];
        }

        if (activeKeys.constructor !== Array) {
            return;
        }

        for (const key in this.items) {
            const item = this.items[key];

            if (inArray(activeKeys, item[itemKey])) {
                item.active = true;
                item.el.classList.add('active');
                item.el.setAttribute('data-active', 'true');
            } else if (inactivateOthers === true) {
                item.active = false;
                item.el.classList.remove('active');
                item.el.setAttribute('data-active', 'false');
            }
        }
    }
    
    setActiveItem(key) {
        const item = this.get(key);
        
        if (item !== null) {
            item.active = true;
            item.el.classList.add('active');
            item.el.setAttribute('data-active', 'true');
        }
    }
    
    /**
     * Positioning the toolbar.
     *
     * @param {null|Event} event
     * @param {null|Number} x
     * @param {null|Number} y
     * @param {Boolean} lastPos If to use last toolbar position
     */
    positioning(event = null, x = null, y = null, lastPos = false) {
        const pos = {x:0, y:0};
        let left = 10;
        let tbWidth = 0;

        // get toolbar actual width and height if not exists.
        // this will solve diplay: none; problem and resizing max-width
        if (this.width === null) {
            this.width = this.el.offsetWidth;
        }
        if (this.height === null) {
            this.height = this.el.offsetHeight;
        }

        tbWidth = this.width;
        
        const selRect = this.getSelectionRect();
        
        if (event !== null) {
            pos.x = event.pageX;
            pos.y = event.pageY;
        } else {
            if (selRect !== null) {
                pos.x = selRect.x;
                pos.y = selRect.y+5;
            }
        }
        
        if (selRect !== null) {
            pos.y = pos.y+selRect.height;
        } else {
            pos.y = pos.y+20;
        }
        
        if (x !== null) { pos.x = x; }
        if (y !== null) { pos.y = y; }
        
        if (x !== null) {
            left = pos.x;
        } else {
            left = (pos.x-(tbWidth/2));
        }

        if (lastPos === true) {
            const lastCenterX = toolbars.lastX+(toolbars.lastWidth/2);
            left = lastCenterX-(tbWidth/2);
            pos.y = toolbars.lastY;
        }

        // left limit.
        if (left < 10) { left = 10; }

        // right offset adjustment
        const clientWidth = document.documentElement.clientWidth;

        if (pos.x+(tbWidth/2) > clientWidth) {
            left = clientWidth-tbWidth-10;
        }

        this.x = left;
        this.y = pos.y;

        toolbars.lastWidth = tbWidth;
        toolbars.lastX = left;
        toolbars.lastY = pos.y;

        this.el.style.left = left+'px';
        this.el.style.top = pos.y+'px';
    }
    
    /**
     * Gets the caret selection DomRect.
     *
     * @return {null|Object}
     */
    getSelectionRect() {
        const sel = window.getSelection();
        let rect = {x:0, y:0, width:0, height:0, top:0, right:0, bottom:0, left:0};

        if (sel.rangeCount) {
            rect = sel.getRangeAt(0).getClientRects()[0];

            if (typeof rect === 'undefined') {
                // happens on empty selection
                return null;
            }
        }

        return rect;
    }
    execItemCommand(item, editor) {
        if (item.buttonEl.getAttribute('data-active') === 'true') {
            if (hasObjKey(item, 'undo')) {
                if (item.undo === null)    {
                    // delete element.
                    const sel = editor.selection.get();

                    if (sel.text == '') {
                        // no text selected.
                        sel.element.insertAdjacentHTML("afterend", sel.element.innerHTML);
                        sel.element.parentNode.removeChild(sel.element);
                    } else {
                        // text selected, format browser standard.
                        this.execCommand(editor.el, item.command[0], item.command[1] || false);
                    }
                } else {
                    if (item.undo.constructor === Array && typeof item.undo[0] !== 'undefined') {
                        this.execCommand(editor.el, item.undo[0], item.undo[1] || false);
                    }
                }
            } else {
                this.execCommand(editor.el, item.command[0], item.command[1] || false);
            }
        } else {
            this.execCommand(editor.el, item.command[0], item.command[1] || false);
        }
    }
    execCommand(editableEl, commandName, value) {        
        document.execCommand(commandName, false, value);
        editableEl.focus();
    }
}

const toolbars = {  
    toolbars: {}, // the toolbars
    items: {},
    openId: null, // the open toolbar id
    lastId: null, // the last opened toolbar id
    lastWidth: null,
    lastX: null,
    lastY: null,

    /**
     * Creates a toolbar.
     *
     * @param {Object} config The config data. {"id": "mytoolbar", ...}
     * @param {Object} The toolbar created.
     */
    create: function(config) {
        if (typeof config['id'] === 'undefined') {
            config['id'] = uniqueId();
        }

        const obj = new Toolbar(config['id'], document.createElement('div'), config);
        this.toolbars[config['id']] = obj;
        return obj;
    },

    /**
     * Gets the toolbars object by id.
     *
     * @param {String|Number} id The id.
     * @return {Object}
     */
    get: function(id) {
        return this.toolbars[id];
    },

    /**
     * If toolbar object exists.
     *
     * @param {String|Number} id The id.
     * @return {Boolean} True on success, false on failure.
     */    
    has: function(id) {
        return (typeof this.toolbars[id] === 'undefined') ? false : true;
    },

    /**
     * Opens the toolbar.
     *
     * @param {String|Number} id The toolbar id to open
     */    
    open: function(id) {
        if (this.has(id)) {
            this.get(id).open();
        }
    },

    /**
     * Closes all toolbars except those specified.
     *
     * @param {Array} except The toolbars not to close. ["links"]
     * @param {Boolean} clearKeepOpen Clear keep open toolbar
     */
    close: function(except = [], clearKeepOpen = false) {
        for (const key in this.toolbars) {
            const toolbar = this.toolbars[key];

            if (clearKeepOpen) {
                toolbar.keepOpen(false);
            }

            if (
                inArray(except, toolbar.id) === false
                && toolbar.keepOpenWhileWriting === false
            ){
                toolbar.close();
            }
        }
    },

    /**
     * Add an item for reusage.
     *
     * @param {Object} item
     */
    addItem: function(item) {
        events.fire('toolbars.item', [item]);
        this.items[item.key] = item;
    }
};

export default toolbars;