let idCounter = 0;

function uniqueId(prefix) {
    const id = ++idCounter + '';
    return prefix ? prefix + id : id;
}

function hasObjKey(obj, key) {
    if (obj === undefined) { return false; }
    return (typeof obj[key] === 'undefined') ? false : true;
}

function getData(obj, key, defaultValue = null) {
    if (typeof key === 'string') {
        return getData(obj, key.split('.'), defaultValue);
    } else if (key.length === 0) {
        return obj;
    } else {
        if (typeof obj === 'undefined') { return defaultValue;}
        if (obj == null) { return defaultValue;}
        if (typeof obj[key[0]] === 'undefined') { return defaultValue;}
        return _getData(obj[key[0]], key.slice(1), defaultValue);
    }
}

function inArray(array, search) {
    if (array === undefined) { return false; }
    return (array.indexOf(search) >= 0) ? true : false;
}

function createElement(item) {
    if (!hasObjKey(item, 'element')) {
        item.element = 'button';
    }

    const el = document.createElement(item.element);

    if (hasObjKey(item, 'type')) {
        el.setAttribute('type', item.type);
    }
    if (hasObjKey(item, 'text')) {
        el.innerHTML = item.text;
    }
    if (hasObjKey(item, 'id')) {
        el.setAttribute('id', item.id);
    }
    if (hasObjKey(item, 'name')) {
        el.setAttribute('name', item.name);
    }
    if (hasObjKey(item, 'for')) {
        el.setAttribute('for', item.for);
    }
    if (hasObjKey(item, 'placeholder')) {
        el.setAttribute('placeholder', item.placeholder);
    }
    if (hasObjKey(item, 'classes')) {
        el.classList.add(...item.classes);
    }
    if (hasObjKey(item, 'options')) {
        for (const name in item.options) {
            const option = createElement({
                element: "option",
                text: name
            });
            
            option.value = item.options[name];
            
            if (hasObjKey(item, 'optionToClass')) {
                option.className = item.options[name];
            }
            
            el.add(option);
        }
    }

    if (hasObjKey(item, 'attributes')) {
        for (const name in item.attributes) {
            el.setAttribute(name, item.attributes[name]);
        }
    }

    return el;
}

export {
    uniqueId,
    hasObjKey,
    getData,
    inArray,
    createElement
};