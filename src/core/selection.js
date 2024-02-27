import {
    hasObjKey
} from './utils.js';

export default class Selection {
    constructor(el) {
        this.el = el;  // the selection element
        this.markerEL = null;  // the marker element if saved.
        this.savedSel = { text: "", element: null, tagName: null };
    }
    
    /**
     * Returns the selected text and element
     */
    get(parameter = null) {
        let text = '',
            element = null,
            tagName = '',
            data,
            sel = window.getSelection();

        if (sel.rangeCount) {
            const node = sel.getRangeAt(0).commonAncestorContainer;
            element = node.nodeType == 1 ? node : node.parentNode;
            text = sel.toString();
            tagName = element.tagName.toLowerCase();
        }

        data = {
            text: text,
            element: element,
            tagName: tagName
        };

        if (typeof parameter === 'string' && hasObjKey(data, parameter)) {
            return data[parameter];
        }

        return data;
    }
    
    /**
     * Returns the selected tagnames from the current selection.
     */
    getTagnames() {
        const sel = this.get();
        const selectedTagnames = [];

        if (sel.element !== null) {
            let a = sel.element;

            while (a) {
                if (a === this.el) { break; }
                if (typeof a.tagName !== 'undefined') {
                    selectedTagnames.unshift(a.tagName.toLowerCase());
                }

                a = a.parentNode;

                if (a === this.el) { break; }
            }
        }

        return selectedTagnames;
    }
    
    /**
     * Saves the current selection by unwrapping a HTML <span> marker.
     */
    save(mark = true) {
        if (mark === false) {
            this.savedSel = this.get();
            return;
        }

        const sel = this.get();
        this.savedSel.text = sel.text;
        this.savedSel.tagName = 'span';
        document.execCommand("insertHTML", false, "<span data-marker='editor'>"+ window.getSelection()+"</span>");
        this.savedSel.element = this.el.querySelector('[data-marker]');
    }
    
    /**
     * Returns the saved selection.
     */
    getSaved() {
        return this.savedSel;
    }
    
    /**
     * Sets saved selection.
     */
    setSaved(el, text = '') {
        this.savedSel.element = el;
        this.savedSel.text = text;
        this.savedSel.tagName = el.tagName.toLowerCase();
    }
    
    /**
     * Clears the selection. Removes the marker if any.
     */
    clear() {
        const markerEl = this.el.querySelector('[data-marker]');
                
        if (markerEl === null) {
            return;
        }
        
        if (markerEl.attributes.length <= 1) {
            markerEl.outerHTML = markerEl.innerText;
        }
        
        markerEl.removeAttribute('data-marker');
    }
    
    replaceNode(node) {
        
        //const sel = this.get();
        
        //console.log(sel);
        //const strongElement = document.createElement("p");
        const userSelection = window.getSelection();
        const selectedTextRange = userSelection.getRangeAt(0);
        selectedTextRange.surroundContents(node);
        //console.log(selectedTextRange);
    }
    
    /**
     * Replaces the selection marker with the node.
     */
    replace(node) {
        const markerEl = this.el.querySelector('[data-marker]');

        if (markerEl !== null) {
            markerEl.parentNode.replaceChild(node, markerEl);
        }
    }
    
    /**
     * insertReplace
     */
    insertReplace(sel, el) {
        if (sel.element.hasAttribute('data-editor-id')) {
            return;
        }

        sel.element.parentNode.replaceChild(el, sel.element);
    }
    
    /**
     * insertAfter
     */
    insertAfter(sel, el) {
        if (sel.element.hasAttribute('data-editor-id')) {
            return;
        }

        sel.element.parentNode.insertBefore(el, sel.element.nextSibling);
    }
}