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

module.exports = { enable, disable, getCurrentLocale, getCurrentNumberOfScreenshots };