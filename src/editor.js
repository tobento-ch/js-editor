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
/*styles.add({
    key: "style.fonts",
    title: "Font styles",
    options: {
        "Default Font": "",
        "Primary Font": "font-primary",
        "Secondary Font": "font-secondary"
    },
    optionToClass: true
});*/

// add plugins:
editors.plugins([basic, html, clear, links, table, styles]);

// editors:
document.addEventListener('DOMContentLoaded', (e) => {
    // init the editors:
    editors.init();
    
    // you may auto register editors with the data-editor attribute:
    editors.register();
    
    // or you may create it manually:
    editors.create(document.querySelector('#editor'), {
        // options (optional):
        id: 'foo',
        toolbar: ['p', 'bold', 'h'],
    });
});