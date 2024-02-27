export default class Eventer {
    constructor() {
        this.listeners = {};
    }

    /**
     * Register event listeners.
     *
     * @param {Object} listeners The event listeners. {"eventName": "listener", ...}
     */
    register(listeners) {
        for (const eventName in listeners) {
            this.listen(eventName, listeners[eventName]);
        }
    }
    
    /**
     * Register an event listener.
     *
     * @param {String} eventName The event name such as 'editor.created'
     * @param {Function} listener
     */
    listen(eventName, listener) {
        if (typeof this.listeners[eventName] === 'undefined') {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName].push(listener);
    }
    
    /**
     * Fires an event.
     *
     * @param {String} eventName The event name such as 'editor.created'
     * @param {Array|Object} parameters The parameters to bind to the callback.
     * @return {Array|Object} The paramaters
     */
    fire(eventName, parameters) {
        if (typeof this.listeners[eventName] === 'object') {
            this.listeners[eventName].forEach(listener => {
                if (typeof listener === 'function') {
                    if (parameters instanceof Array) {
                        listener(...parameters);
                    } else if (parameters instanceof Object) {
                        listener(parameters);
                    }
                }
            });
        }

        return parameters;
    }    
}