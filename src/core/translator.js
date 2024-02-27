const translator = {  
    currentLocale: 'en',
    fallbacks: {},
    translations: {}, // {"de-CH": {"Message": "Translated"}}

    /**
     * Set locale.
     *
     * @param {String} locale
     */
    locale: function(locale) {
        this.currentLocale = locale;
    },
    
    /**
     * Set locale fallbacks.
     *
     * @param {Object} fallbacks {"de-CH": "en"}
     */
    localeFallbacks: function(fallbacks) {
        this.fallbacks = fallbacks;
    },    
    
    /**
     * Translate message.
     *
     * @param {String} message
     * @return {String}
     */
    trans: function(message) {
        return this.translate(message, this.currentLocale);
    },
    
    /**
     * Translate message.
     *
     * @param {String} message
     * @param {String} locale
     * @return {String}
     */
    translate: function(message, locale) {
        if (typeof this.translations[locale] !== 'undefined') {
            if (typeof this.translations[locale][message] !== 'undefined') {
                return this.translations[locale][message];
            }
        }
        
        if (typeof this.fallbacks[locale] !== 'undefined') {
            return this.translate(message, this.fallbacks[locale]);
        }
        
        return message;
    },

    /**
     * Add translations for the specified locale.
     *
     * @param {String} locale
     * @param {Object} translations {"Message": "Translated"}
     */
    add: function(locale, translations) {
        let translated = {};
        
        if (typeof this.translations[locale] !== 'undefined') {
            translated = this.translations[locale];
        }
        
        this.translations[locale] = Object.assign(translated, translations);
    }
};

export default translator;