const photoshop = require('photoshop');

// DOM identifiers of user interation components
const components = ['load-strings-button', 'localize-button', 'language-picker', 'screenshots-amount-input', 'crop-save-button', 'create-guides-button'];

// Disables the UI elements to prevent user interaction
// @param {{ except? : array }} options - The identifier of the component to exclude from the disabling process
const disable = (options) => {
    components.forEach(component => {
        if (options && options.except && options.except.includes(component)) return;
        // console.log('Disabling', component);
        document.getElementById(component).setAttribute('disabled', true);
    })
}

// Enables the UI elements that were disabled
const enable = () => {
    components.forEach(component => {
        // console.log('Enabling', component);
        document.getElementById(component).removeAttribute('disabled');
    })
}


// Returns the currently selected language to work with
const getCurrentLocale = () => {

    var selected;

    document.getElementById('language-picker').children.item(0).children.forEach(item => {
        if (item.selected) {
            selected = item;
        }
    });

    return selected.value;
}

// Returns the currently selected language to work with
const getCurrentNumberOfScreenshots = () => {
    return parseInt(document.getElementById('screenshots-amount-input').value);
}

// Updates the text value indication the final size of the screenshots
const updateMeasurements = () => {

    const compositionWidth = photoshop.app.activeDocument.width,
        compositionHeight = photoshop.app.activeDocument.height;

    const total = getCurrentNumberOfScreenshots();

    if (total && isRoundInteger(total)) {
        document.getElementById('final-size').innerHTML = `<strong>${compositionWidth / total}</strong> × <strong>${compositionHeight}</strong> px`;
    } else {
        document.getElementById('final-size').textContent = '-';
    }

    document.getElementById('composition-size').innerHTML = `<strong>${compositionWidth}</strong> × <strong>${compositionHeight}</strong> px`;

};

// Checks whether a value is an integer
const isRoundInteger = (value) => {
    // Helper function to determine if a value is an integer
    function isInteger(num) {
        return Number.isInteger(num);
    }

    // Check if the value is a number and is an integer
    if (typeof value === 'number') {
        return isInteger(value);
    }

    // Check if the value is a string and try to parse it as an integer
    if (typeof value === 'string') {
        const parsedValue = parseInt(value, 10);
        // Check if parsing was successful and if the parsed value is an integer
        return !isNaN(parsedValue) && isInteger(parsedValue);
    }

    // If the value is neither a number nor a string, return false
    return false;
}

module.exports = { enable, disable, getCurrentLocale, getCurrentNumberOfScreenshots, updateMeasurements };