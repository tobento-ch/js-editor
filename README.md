# JS Editor

Simple JavaScript WYSIWYG HTML Editor with inlined toolbar only.

The editor does not style the content by using inline style attributes. Instead it uses classes only. This has multiple advantages:

* easily customize content by its classes
* using strong Content-Security-Policy blocking style-src
* limits user to keep corporate design

You may visit the [**docs.tobento.ch/js-editor**](https://docs.tobento.ch/js-editor) page for demo.

## Table of Contents

- [Getting started](#getting-started)
    - [Browser support](#browser-support)
- [Documentation](#documentation)
    - [Basic Usage](#basic-usage)
    - [Custom Editor](#custom-editor)
    - [Available Plugins](#available-plugins)
        - [Basic Plugins](#basic-plugins)
        - [Table Plugin](#table-plugin)
        - [Styles Plugin](#styles-plugin)
    - [Create Plugin](#create-plugin)
    - [Events](#events)
        - [Global Events](#global-events)
        - [Editor Events](#editor-events)
    - [API](#api)
        - [Editors API](#editors-api)
        - [Editor API](#editor-api)
        - [Events API](#events-api)
        - [Selection API](#selection-api)
        - [Toolbars API](#toolbars-api)
        - [Toolbar API](#toolbar-api)
        - [Translator API](#translator-api)
- [Credits](#credits)
___

# Getting started

## Browser support

Modern browser only.

# Documentation

## Basic Usage

**1. Include JS/CSS**

```html
<link href="editor.css" rel="stylesheet" type="text/css">
<script src="editor.js" type="module"></script>
```

**2. Register**

```html
<!-- using div -->
<div data-editor='{"id": "foo"}'></div>

<!-- using textarea -->
<textarea name="bar" data-editor></textarea>

<!-- with specific toolbar -->
<div data-editor='{"id": "baz", "toolbar": ["bold", "italic"]}'></div>
```

Thats all.

**You may get the HTML code**

Example using the editors:

```html
<script type="module">
    import editors from 'core/editors.js';
    
    document.addEventListener('DOMContentLoaded', (e) => {
        const fooEditorCode = editors.get('foo').code();
        const barEditorCode = editors.get('bar').code();
    });
</script>
```

Example using events:

```html
<script type="module">
    import events from 'core/events.js';

    events.listen('editor.blur', (e, editor) => {
        const code = editor.code();
    });
</script>
```

## Custom Editor

You may create a custom editor:

**1. Create ```custom-editor.js```**

```js
import editors from './core/editors.js';
import translator from './core/translator.js';
import table from './plugin/table.js';
import styles from './plugin/styles.js';
import { basic, html, clear, links } from './plugin/basic.js';

// you may add translations:
translator.locale('de-CH');
// or translator.locale(document.querySelector('html').getAttribute('lang'));
translator.localeFallbacks({"de-CH": "en"});
translator.add('de-CH', {
    "Start typing something...": "Start mit schreiben...",
    "Table": "Tabelle",
    "Add row below": "Zeile danach einfügen",
    "Add row above": "Zeile davor einfügen",
    "Delete row": "Zeile löschen",
    "Add column left": "Spalte links einfügen",
    "Add column right": "Spalte rechts einfügen",
    "Delete column": "Spalte löschen",
    "Delete table": "Tabelle löschen"
});

// you may add styles:
styles.add({
    key: "style.fonts",
    title: "Font styles",
    options: {
        "Default Font": "",
        "Primary Font": "font-primary",
        "Secondary Font": "font-secondary"
    },
    optionToClass: true
});

// add plugins:
editors.plugins([basic, html, clear, links, table, styles]);

// editors:
document.addEventListener('DOMContentLoaded', (e) => {
    // init the editors:
    editors.init();
    
    // you may auto register editors with the data-editor attribute:
    editors.register();
    
    // or you may create it manually:
    const editor = editors.create(document.querySelector('#editor'), {
        // config (optional):
        id: 'foo',
        toolbar: ['p', 'bold', 'headings']
    });
});
```

**2. Replace default editor with custom editor**

```html
<link href="editor.css" rel="stylesheet" type="text/css">
<!--<script src="editor.js" type="module"></script>-->
<script src="custom-editor.js" type="module"></script>
```

## Available Plugins

### Basic Plugins

```js
import editors from './core/editors.js';
import { basic, html, clear, links } from 'plugin/basic.js';

editors.plugins([basic, html, clear, links]);
```

#### Basic Plugin

**The ```basic``` plugin provides the following toolbars:**

```["p", "h1", "h2", "h3", "h4", "h5", "h6", "bold", "italic", "underline", "strike", "ol", "ul", "quote", "pre", "code", "undo", "redo"]```

| KEY | HTML Element | Description |
| --- | --- | --- |
| ```p``` | ```<p>``` | - |
| ```h1``` | ```<h1>``` | - |
| ```h2``` | ```<h2>``` | - |
| ```h3``` | ```<h3>``` | - |
| ```h4``` | ```<h4>``` | - |
| ```h5``` | ```<h5>``` | - |
| ```h6``` | ```<h6>``` | - |
| ```headings``` | - | Opens a toolbar with h1-h6. |
| ```bold``` | ```<b>``` | - |
| ```italic``` | ```<i>``` | - |
| ```underline``` | ```<u>``` | - |
| ```strike``` | ```<s>``` | - |
| ```ol``` | ```<ol>``` | - |
| ```ul``` | ```<ul>``` | - |
| ```quote``` | ```<blockquote>``` | - |
| ```pre``` | ```<pre>``` | - |
| ```code``` | ```<code>``` | - |
| ```undo``` | - | Undo last step |
| ```redo``` | - | Redo last step |
| ```\|``` | - | Horizontal line separator |
| ```\|\|``` | - | Horizontal space separator |
| ```_``` | - | Vertical line separator |
| ```__``` | - | Vertical space separator |
| ```back``` | - | Back to last toolbar |

#### Html Plugin

**The ```html``` plugin provides the following toolbars:**

```["sourcecode"]```

| KEY | HTML Element | Description |
| --- | --- | --- |
| ```sourcecode``` | - | To switch between source code and normal view. |

#### Clear Plugin

**The ```clear``` plugin provides the following toolbars:**

```["clear"]```

| KEY | HTML Element | Description |
| --- | --- | --- |
| ```clear``` | - | To clear the editable area. |

#### Links Plugin

**The ```links``` plugin provides the following toolbars:**

```["link"]```

| KEY | HTML Element | Description |
| --- | --- | --- |
| ```link``` | ```<a>``` | To insert a link. |

**Customize link classes**

```js
import events from './../events.js';

events.listen('toolbars.item', (item) => {
    if (item.key === 'link.class') {
        item.options = {
            "none": "",
            "default": "button",
            "default fit": "button fit"
        };
    }
});
```

### Table Plugin

```js
import editors from './core/editors.js';
import table from 'plugin/table.js';

editors.plugins([table]);
```

**The ```table``` plugin provides the following toolbars:**

```["tables"]```

| KEY | HTML Element | Description |
| --- | --- | --- |
| ```tables``` | ```<table>``` | To add tables. |
    
### Styles Plugin

The styles plugin adds/removes classe(s) to your selected text.

```js
import editors from './core/editors.js';
import styles from 'plugin/styles.js';

// add your styles:
styles.add({
    key: "style.fonts",
    title: "Font styles",
    options: {
        "Default Font": "",
        "Primary Font": "font-primary",
        "Secondary Font": "font-secondary"
    },
    optionToClass: true
});
styles.add({
    key: "style.text.colors",
    title: "Text Colors",
    options: {
        "Default Text Color": "",
        "Text Color Success": "text-success"
    },
    optionToClass: true
});

// add plugin:
editors.plugins([styles]);
```

**Toolbars:**

The style ```key``` will be your toolbar key:

```["style.fonts", "style.text.colors"]```

## Create Plugin

Check out the ```plugin/table.js``` or ```plugin/basic.js``` file to see how a plugin is created.

## Events

### Global Events

You may use the available events for plugin creation e.g.

**Editors Events**

| Event | Callback Parameters | Description |
| --- | --- | --- |
| ```editors.init``` | ```(editors)``` | Triggered when the editors.init() function has been called. |
| ```editors.registered``` | ```(editors)``` | Triggered after the editors.register() function has been called. |

```js
import events from 'core/events.js';

events.listen('editors.init', (editors) => {
    //
});
```

**Editor Events**

| Event | Callback Parameters | Description |
| --- | --- | --- |
| ```editor.blur``` | ```(event, editor)``` | Triggered by the blur event of the editor element (editable area). |
| ```editor.click``` | ```(event, editor)``` | Triggered by the click event of the editor element (editable area). |
| ```editor.created``` | ```(editor)``` | Triggered when the editor has been created. |
| ```editor.focus``` | ```(event, editor)``` | Triggered when the editor is focused. |
| ```editor.mousedown``` | ```(event, editor)``` | Triggered by the mousedown event of the editor element (editable area). |
| ```editor.mouseup``` | ```(event, editor)``` | Triggered by the mouesup event of the editor element (editable area). |
| ```editor.keydown``` | ```(event, editor)``` | Triggered by the keydown event of the editor element (editable area). |
| ```editor.keypress``` | ```(event, editor)``` | Triggered by the keypress event of the editor element (editable area). |
| ```editor.keyup``` | ```(event, editor)``` | Triggered by the keyup event of the editor element (editable area). |

Example:

```js
import events from 'core/events.js';

events.listen('editor.blur', (event, editor) => {
    //
});
```

**Toolbars Events**

| Event | Callback Parameters | Description |
| --- | --- | --- |
| ```toolbars.item``` | ```(item)``` | Triggered when a toolbars item is added. |

Example:

```js
import events from 'core/events.js';

events.listen('toolbars.item', (item) => {
    if (item.key === 'link.class') {
        item.options = {
            "none": "",
            "default": "button",
            "default fit": "button fit"
        };
    }
});
```

**Toolbar Events**

| Event | Callback Parameters | Description |
| --- | --- | --- |
| ```toolbar.build``` | ```(data)``` | Triggered when a toolbar is being build. |
| ```toolbar.opened``` | ```(toolbar)``` | Triggered after toolbar is opened. |
| ```toolbar.closed``` | ```(toolbar)``` | Triggered after toolbar is closed. |

Example:

```js
import events from 'core/events.js';

events.listen('toolbar.build', (data) => {
    // customize link toolbar
    if (toolbar.id === 'link') {
        data.items = [
            'back', 'link.visit', 'link.delete', 'link.insert', '_',
            'link.input', '_',
            'link.window', 'link.windowLabel', '_',
            //'link.class'
        ];
    }
});
```

### Editor Events

| Event | Callback Parameters | Description |
| --- | --- | --- |
| ```blur``` | ```(event, editor)``` | Triggered by the blur event of the editor element (editable area). |
| ```click``` | ```(event, editor)``` | Triggered by the click event of the editor element (editable area). |
| ```created``` | ```(editor)``` | Triggered when the editor has been created. |
| ```focus``` | ```(event, editor)``` | Triggered when the editor is focused. |
| ```mousedown``` | ```(event, editor)``` | Triggered by the mousedown event of the editor element (editable area). |
| ```mouseup``` | ```(event, editor)``` | Triggered by the mouesup event of the editor element (editable area). |
| ```keydown``` | ```(event, editor)``` | Triggered by the keydown event of the editor element (editable area). |
| ```keypress``` | ```(event, editor)``` | Triggered by the keypress event of the editor element (editable area). |
| ```keyup``` | ```(event, editor)``` | Triggered by the keyup event of the editor element (editable area). |

Example:

```js
import editors from './core/editors.js';

document.addEventListener('DOMContentLoaded', (e) => {
    // create
    editors.create(document.querySelector('#editor'), {
        events: {
            click: (event, editor) => {
                //
            }
        }
    });
});
```

## API

### Editors API

```js
import editors from './core/editors.js';
```

**init/register**

```js
// init the editors:
editors.init();

// you may auto register editors with the data-editor attribute:
editors.register();
```

**create**

Creating a new editor.

```js
const editor = editors.create(document.querySelector('#editor'));

// with config:
const editor = editors.create(document.querySelector('#editor'), {
    id: 'foo',
    toolbar: ['p', 'bold', 'headings'],
    events: {
        click: (event, editor) => {
            //
        }
    }
});
```

**has / get / all**

```js
if (editors.has('ID')) {
    const editor = editors.get('ID');
}

const allEditors = editors.all();
```

**plugin / plugins**

```js
editors.plugin({
    name: 'foo',
    init: () => {
        //
    },
    events: {
        //
    }
});

editors.plugins([{name: 'foo'}, {name: 'bar'}]);
```

### Editor API

```js
import editors from './core/editors.js';

const editor = editors.create(document.querySelector('#editor'));
```

**code**

Get the HTML code.

```js
const htmlCode = editor.code();
```

**config**

Get config value with dot notation.

```js
const value = editor.config('foo.bar', 'default');
```

**Misc**

```js
const id = editor.id;
const el = editor.el; // editable area
const selection = editor.selection;
const toolbar = editor.toolbar;
const events = editor.events;
```

* ```selection``` check out the [Selection API](#selection-api) for more information.
* ```toolbar``` check out the [Toolbar API](#toolbar-api) for more information.
* ```events``` check out the [Events API](#events-api) for more information.

### Events API

```js
import events from './core/events.js';
```

**listen / fire**

```js
// with array params:
events.listen('click', (foo, bar) => {});
events.fire('click', ['foo', 'bar']);

// or with object params:
events.listen('click', (obj) => {});
events.fire('click', {});
```

**register**

```js
const listeners = {
    "eventName": () => {
        
    },
};

events.register(listeners);
```

### Selection API

```js
import editors from './core/editors.js';

const editor = editors.create(document.querySelector('#editor'));
const selection = editor.selection;
```

**get**

Get the selected data:

```js
const sel = selection.get();

const text = sel.text;
const element = sel.element;
const tagName = sel.tagName;
```

**getTagnames**

Get the selected tag names:

```js
const tagnames = selection.getTagnames();
```

**Misc**

```js
// Saves the current selection with unwrapping a HTML <span> marker.
selection.save();

// Saves the current selection without unwrapping a HTML <span> marker.
selection.save(false);

// Set saved selection by element.
selection.setSaved(element, '');

// Get the saved selection.
const sel = selection.getSaved();

// Clears the selection. Removes the marker if any.
selection.clear();

// Replaces the selection marker with the node.
selection.replace(node);

// Replaces the sel with the node.
selection.insertReplace(sel, node);

// Inserts the node after the sel.
selection.insertAfter(sel, node);
```

### Toolbars API

```js
import toolbars from './core/toolbars.js';
```

**addItem**

Add an item to be later used to build a toolbar.

Example Button:

```js
toolbars.addItem({
    // required:
    key: "Foo", // a unique key
    text: "Foo",
    command: ["formatblock", "<h2>"],
    undo: ["formatblock", "<p>"], // or null
    tagname: "h2", // used for setting button active
});
```

Example Input:

```js
toolbars.addItem({
    // required:
    key: "email", // a unique key
    // optional:
    element: "input", // HTML element, default "button"
    type: "email",
    id: "foo",
    for: "id",
    name: "foo",
    title: "Type your email",
    placeholder: "Type...",
    classes: ["foo", "bar"],
    // options: {"name": "value"}, // for selection element.
    attributes: {"name": "value"}, // any additonal HTML element attributes
    build_default: false, // if to build on default
    click: (event, item, toolbar, editor) => {
        // do something on click
    },
    keyup: (event, item, toolbar, editor) => {
        // do something on keyup
    }
});
```

**Misc**

```js
const toolbar = toolbars.create({id: 'ID'});

if (toolbars.has('ID')) {
    const toolbar = toolbars.get('ID');
}

// opens the toolbar if exists:
toolbars.open('ID');

// closes all toolbars:
toolbars.close();

// closes all toolbars except those specified:
toolbars.close(["links"]);
```

### Toolbar API

```js
import toolbars from './core/toolbars.js';
```

**build**

Build toolbar with the specified items.

```js
const toolbar = toolbars.create({id: 'ID'});

toolbar.build([
    'back', 'table.delete', '_',
    'table.row.below', 'table.row.above', 'table.row.delete', '_',
    'table.col.left', 'table.col.right', 'table.col.delete'
]);
```

**open / close**

```js
const toolbar = toolbars.get({id: 'ID'});

toolbar.open();
toolbar.close();
```

**Items**

```js
const toolbar = toolbars.get({id: 'ID'});

if (toolbar.has('key')) {
    const item = toolbar.get('key');
}

toolbar.disable('key');
toolbar.disable('key', false); // without hiding
toolbar.disableExcept(['key']);
toolbar.disableExcept(['key'], false); // without hiding
toolbar.enable('key');

toolbar.setActive(['key']);
toolbar.setActive(['a', 'p'], 'tagname'); // based on item tagname
toolbar.setActive(['key', 'key', false]); // without setting others inactive
toolbar.setActiveItem('key'); // set only active.

toolbar.positioning(); // position to selection;
toolbar.positioning(event); // position to event.pageX and event.pageY
toolbar.positioning(null, 100, 200); // position to x: 100, y: 200
toolbar.positioning(null, null, null, true); // position to last position
```

### Translator API

```js
import translator from './core/translator.js';
```

```js
translator.locale('de-CH'); // current locale
translator.localeFallbacks({"de-CH": "en"});

// add translation for the specified locale.
translator.add('de-CH', {
    "Table": "Tabelle"
});

const translated = translator.trans('Table');
```

# Credits

- [Tobias Strub](https://www.tobento.ch)
- [All Contributors](../../contributors)