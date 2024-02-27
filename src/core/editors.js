import Selection from './selection.js';
import toolbars from './toolbars.js';
import translator from './translator.js';
import events from './events.js';
import Eventer from './eventer.js';
import {
    uniqueId,
    hasObjKey,
    getData,
    createElement
} from './utils.js';

const editors = (function(window, document) {
    'use strict';
    
    class Editor {
        constructor(id, el, config) {
            this.id = id;
            this.el = el;
            this.config = config;
            this.selection = new Selection(el);
            this.toolbar = this.createToolbar();
            this.isHtmlMode = false;
            this.inputEl = null;
            this.wrapAfterEmpty = 'p'; //if editor is empty and add new char wraps it into the element set.
            this.events = new Eventer();
            this.init();
        }
        init() {        
            // If textarea, we need to change it.
            if (this.el.tagName.toLowerCase() === 'textarea') {
                const editableEl = createElement({
                    element: "div",
                    classes: ["editor-textarea"]
                });
                
                editableEl.innerHTML = this.el.value;
                
                this.inputEl = createElement({
                    element: "input",
                    name: this.el.name,
                    type: "hidden"
                });
                
                this.inputEl.value = this.el.value;
                this.el.parentNode.insertBefore(this.inputEl, this.el.nextSibling);
                this.el.replaceWith(editableEl);
                this.el = editableEl;
            }
            
            // set attributes:
            this.el.setAttribute('data-editor-id', this.id);
            this.el.setAttribute('data-editor-type', 'editor');
            this.el.setAttribute('data-placeholder', translator.trans('Start typing something...'));
            this.el.setAttribute('spellcheck', 'false');
            //this.el.setAttribute('autocorrect', 'false');
            this.el.setAttribute('role', 'textbox');
            this.el.setAttribute('aria-multiline', 'true');
            this.el.setAttribute('aria-label', translator.trans('Start typing something...'));
            this.el.contentEditable = true; // make it editable.
            
            // register config events:
            if (hasObjKey(this.config, 'events')) {
                this.events.register(this.config.events);
            }
            
            // events:
            this.el.addEventListener('mousedown', (e) => {
                editors.setActive(this.id);
                toolbars.close();
                events.fire('editor.mousedown', [e, this]);
                this.events.fire('mousedown', [e, this]);
            });
            
            this.el.addEventListener('mouseup', (e) => {
                if (this.selection.get('text') != '') {
                    this.toolbar.open();
                    this.toolbar.positioning(e);
                }
                
                events.fire('editor.mouseup', [e, this]);
                this.events.fire('mouseup', [e, this]);
            });
            
            this.el.addEventListener('click', (e) => {
                editors.setActive(this.id);
                events.fire('editor.click', [e, this]);
                this.events.fire('click', [e, this]);
            });

            this.el.addEventListener('keydown', (e) => {
                // unwrap with tag, if editable area was empty.
                const html = this.el.innerHTML;
                
                if (e.which !== 8 && html.trim().length === 0) {
                    const newEl = document.createElement(this.wrapAfterEmpty);
                    newEl.innerHTML = '&#x200b';
                    this.el.appendChild(newEl);
                    window.getSelection().collapse(this.el.firstElementChild, 0);
                }
                
                toolbars.close();
                events.fire('editor.keydown', [e, this]);
                this.events.fire('keydown', [e, this]);
            });

            this.el.addEventListener('keypress', (e) => {
                // prevent newline if set on config
                if (hasObjKey(this.config, 'newline') && this.config.newline === 'false' && e.which === 13) {
                    if (e.shiftKey === false) {
                        e.preventDefault();
                    }
                }
                
                events.fire('editor.keypress', [e, this]);
                this.events.fire('keypress', [e, this]);
            });

            this.el.addEventListener('keyup', (e) => {
                events.fire('editor.keyup', [e, this]);
                this.events.fire('keyup', [e, this]);
            });
            
            this.el.addEventListener('blur', (e) => {
                if (this.inputEl !== null) {
                    this.inputEl.value = this.code();
                }
                events.fire('editor.blur', [e, this]);
                this.events.fire('blur', [e, this]);
            });
            
            this.el.addEventListener('focus', (e) => {
                events.fire('editor.focus', [e, this]);
                this.events.fire('focus', [e, this]);
            });
            
            // fire event
            events.fire('editor.created', [this]);
            this.events.fire('created', [this]);
        }
        code() {
            return this.el.isHtmlMode ? this.extractText(this.el) : this.el.innerHTML;
        }
        config(key, defaultValue = null) {
            return getData(this.config, key, defaultValue);
        }
        createToolbar() {
            const toolbar = toolbars.create({id: this.id});
            toolbar.build(this.config.toolbar, {editorId: this.id});
            return toolbar;
        }
        extractText(editableEl) {
            if (editableEl.innerText) { return editableEl.innerText; }
            
            const content = document.createRange();
            content.selectNodeContents(editableEl.firstChild);
            return content.toString();
        }
    }

    const editors = {
        items: {},
        plugins: {},
        activeEditor: null,
        init: function() {
            events.fire('editors.init', [this]);

            // clicked event for closing toolbars and set the active toolbar inactive.
            document.body.addEventListener('click', (e) => {
                if (e.target.closest('[data-editor-type]') === null) {
                    toolbars.close();
                    this.clearActive();
                }
            });
        },
        register: function() {
            document.querySelectorAll('[data-editor]').forEach(el => {
                let config = {};
                
                try {
                    config = JSON.parse(el.getAttribute('data-editor'));
                    config.registered = true;
                } catch (e) {
                    // ingore
                }
                
                el.removeAttribute('data-editor');
                this.create(el, config);
            });
            
            events.fire('editors.registered', [this]);
        },
        create: function(el, config = {}) {
            if (!el) {
                return;
            }
            
            if (typeof config['id'] === 'undefined') {
                if (el.tagName.toLowerCase() === 'textarea' && el.name !== '') {
                    config['id'] = el.name;
                } else {
                    config['id'] = uniqueId();
                }
            }

            if (! this.has(config['id'])) {
                this.items[config['id']] = new Editor(config['id'], el, config);
            }
            
            return this.items[config['id']];
        },
        get: function(id) {
            return this.items[id];
        },
        has: function(id) {
            return (typeof this.items[id] === 'undefined') ? false : true;
        },
        all: function() {
            return this.items;
        },
        setActive: function(id) {
            if (this.has(id)) {
                this.activeEditor = this.get(id);
            }
        },
        getActive: function() {
            return this.activeEditor;
        },
        hasActive: function() {
            return (this.activeEditor === null) ? false : true;
        },
        clearActive: function() {
            this.activeEditor = null;
        },
        
        /**
         * Register a plugin.
         *
         * @param {Object} plugin
         */
        plugin: function(plugin) {
            if (!hasObjKey(plugin, 'name')) {
                return;
            }
            
            this.plugins[plugin.name] = plugin;

            if (hasObjKey(plugin, 'init')) {
                plugin.init();
            }
            
            if (hasObjKey(plugin, 'events')) {
                events.register(plugin.events);
            }
        },
        
        /**
         * Register plugins.
         *
         * @param {Array} plugins
         */
        plugins: function(plugins) {
            plugins.forEach((plugin) => this.plugin(plugin));
        }
    };
    
    return editors;
    
})(window, document);

export default editors;