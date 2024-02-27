import editors from './../core/editors.js';
import toolbars from './../core/toolbars.js';
import {hasObjKey, createElement} from './../core/utils.js';

const table = {
    name: "table",
    events: {
        "editors.init": () => {
            toolbars.addItem({
                key: "tables",
                title: "Table",
                text: "&#9638;",
                tagname: "table",
                click: (event, item, toolbar, editor) => {
                    document.execCommand("insertHTML", false, "<table><tr><td>"+window.getSelection()+"</td><td></td></tr></table>");
                    toolbar.close();
                }
            });

            // create table toolbar
            if (toolbars.has('table') === false) {
                const toolbar = toolbars.create({"id": "table"});

                toolbars.addItem({
                    key: "table.row.below",
                    text: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path d=\"M0,0v40h100V0H0ZM90,10v20h-20V10h20ZM60,10v20h-20V10h20ZM30,10v20H10V10h20ZM30.91,74.55h15.27v-30.55h6.36v30.55h16.55l-19.09,25.45-19.09-25.45Z\"/></svg>",
                    title: "Add row below",
                    build_default: false,
                    click: (event, item, toolbar, editor) => {
                        insertRow(editor, false);
                        toolbar.close();
                    }
                });

                toolbars.addItem({
                    key: "table.row.above",
                    text: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path d=\"M100,100v-40H0v40h100ZM10,90v-20h20v20H10ZM40,90v-20h20v20h-20ZM70,90v-20h20v20h-20ZM69.09,25.45h-15.27v30.55h-6.36v-30.55h-16.55L50,0l19.09,25.45Z\"/></svg>",
                    title: "Add row above",
                    build_default: false,
                    click: (event, item, toolbar, editor) => {
                        insertRow(editor, true);
                        toolbar.close();
                    }
                });

                toolbars.addItem({
                    key: "table.row.delete",
                    text: "&#10008;",
                    title: "Delete row",
                    build_default: false,
                    click: (event, item, toolbar, editor) => {
                        const sel = editor.selection.getSaved();    
                        sel.element.parentNode.outerHTML = '';                        
                        toolbar.close();
                    }
                });
                
                toolbars.addItem({
                    key: "table.col.left",
                    text: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path d=\"M100,0h-40v100h40V0ZM90,90h-20v-20h20v20ZM90,60h-20v-20h20v20ZM90,30h-20V10h20v20ZM25.45,30.91v15.27h30.55v6.36h-30.55v16.55L0,50l25.45-19.09Z\"/></svg>",
                    title: "Add row below",
                    title: "Add column left",
                    build_default: false,
                    click: (event, item, toolbar, editor) => {
                        insertCol(editor, 'left');
                        toolbar.close();
                    }
                });

                toolbars.addItem({
                    key: "table.col.right",
                    text: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path d=\"M0,100h40V0H0v100ZM10,10h20v20H10V10ZM10,40h20v20H10v-20ZM10,70h20v20H10v-20ZM74.55,69.09v-15.27h-30.55v-6.36h30.55v-16.55l25.45,19.09-25.45,19.09Z\"/></svg>",
                    title: "Add column right",
                    build_default: false,
                    click: (event, item, toolbar, editor) => {
                        insertCol(editor, 'right');
                        toolbar.close();
                    }
                });

                toolbars.addItem({
                    key: "table.col.delete",
                    text: "&#10008;",
                    title: "Delete column",
                    build_default: false,
                    click: (event, item, toolbar, editor) => {
                        insertCol(editor, 'delete');
                        toolbar.close();
                    }
                });

                toolbars.addItem({
                    key: "table.delete",
                    text: "&#10008; &#9638;",
                    title: "Delete table",
                    build_default: false,
                    click: (event, item, toolbar, editor) => {
                        const sel = editor.selection.getSaved();
                        const tableEl = sel.element.closest('table');
                        tableEl.parentNode.removeChild(tableEl);
                        toolbar.close();
                    }
                });

                toolbar.build([
                    'back', 'table.delete', '_',
                    'table.row.below', 'table.row.above', 'table.row.delete', '_',
                    'table.col.left', 'table.col.right', 'table.col.delete'
                ]);
            }

        },
        // show table toolbar on click.
        "editor.click": (event, editor) => {
            const tagname = event.target.tagName.toLowerCase();

            if (tagname === 'td' && editor.selection.get('text') == '') {
                const tableToolbar = toolbars.get('table');
                const tableEl = event.target.closest('table');

                tableToolbar.open(false);
                tableToolbar.positioning(event);
                editor.selection.save(false);

                const trCount = tableEl.querySelectorAll('tr').length;

                if (trCount <= 1) {
                    tableToolbar.disable('table.row.delete');
                } else {
                    tableToolbar.enable('table.row.delete');
                }

                const tdCount = tableEl.querySelectorAll('tr:first-child td').length;

                if (tdCount <= 1) {
                    tableToolbar.disable('table.col.delete');
                } else {
                    tableToolbar.enable('table.col.delete');
                }                    
            }
        },
        "editor.mouseup": (event, editor) => {
            const selTagnames = editor.selection.getTagnames();

            if (selTagnames.indexOf('table') != -1) {
                editor.toolbar.disable('tables');
            } else {
                if (editor.isHtmlMode === false) {
                    editor.toolbar.enable('tables');
                }
            }
        }

    }
};

const insertRow = function(editor, before = true) {
    const sel = editor.selection.getSaved();   
    const trEl = sel.element.parentNode.outerHTML;
    const count = trEl.split("<td>");
    let newRow = '<tr>';

    for (var i=0;i<count.length-1;i++) {
        newRow += '<td></td>';
    }

    newRow += '</tr>';

    if (before) {
        sel.element.parentNode.outerHTML = newRow+trEl;
    } else {
        sel.element.parentNode.outerHTML = trEl+newRow;
    }
};

const insertCol = function(editor, action = '') {
    const sel = editor.selection.getSaved();
    const tableEl = sel.element.closest('table');
    const tdCellIndex = sel.element.cellIndex;
    const tdElements = tableEl.querySelectorAll('td');

    for (var i=0; i<tdElements.length; i++) {
        if (tdElements[i].cellIndex === tdCellIndex) {
            const tdEl = tdElements[i];

            if (action === 'left') {
                tdEl.parentNode.insertBefore(document.createElement('td'), tdEl);
            } else if (action === 'right') {
                tdEl.parentNode.insertBefore(document.createElement('td'), tdEl.nextSibling);
            } else {
                tdEl.parentNode.removeChild(tdEl);
            }
        }
    }
};

export default table;