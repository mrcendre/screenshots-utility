// const ui = require('./ui');

const { openFile } = require('./document');

// The contents of the last parsed JSON localization file
var all = {};

const localeNames = {
    'ar': 'Arabic',
    'de': 'German',
    'en': 'English',
    'fr': 'French',
    'hi': 'Hindi',
    'id': 'Indonesian',
    'it': 'Italian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'nl': 'Dutch',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'tr': 'Turkish',
    'vi': 'Vietnamese',
    'zh': 'Chinese (simpified)',
};

const get = (locale, key) => {

    return all[locale][key];

}

// Prompts the user to pick a localization file and try to parse its content as JSON.
const load = async () => {
    try {
        const data = await openFile();

        all = JSON.parse(data);

        if (Object.keys(all).length > 0) {

            document.getElementById('localize-button').removeAttribute('disabled');
            document.getElementById('language-picker').removeAttribute('disabled');
            document.getElementById('screenshots-amount-input').removeAttribute('disabled');
            document.getElementById('crop-save-button').removeAttribute('disabled');

            document.getElementById('language-picker').remove();

            var picker = document.createElement('sp-picker');
            picker.setAttribute('id', 'language-picker');

            var menu = document.createElement('sp-menu');
            menu.setAttribute('slot', 'options');

            // Update the language picker with values that are available in the JSON localization file
            Object.keys(all).forEach(locale => {
                const localeName = localeNames[locale] || 'Unknown language';

                const selected = Object.keys(all).indexOf(locale) == 0;

                var item = document.createElement('sp-menu-item');
                item.setAttribute('id', `language-picker-item-${locale}`);
                item.setAttribute('value', locale);
                if (selected) {
                    item.setAttribute('selected', true);
                }

                item.textContent = localeName;

                menu.appendChild(item);

            });

            picker.appendChild(menu);

            document.getElementById('language-picker-container').appendChild(picker);

            // If needed: Setup the event listeners for the language picker items
            // Object.keys(all).forEach(locale => {

            //     const itemLocale = `${locale}`;

            //     // Add an event listener to the item
            //     document.getElementById(`language-picker-item-${itemLocale}`).addEventListener('click', (_) => {
            //         console.log(`Selected locale: ${itemLocale}`);
            //     });
            // });

        }

    } catch (error) {
        console.error(`An error occured while trying to load the localization file: ${error}`);
        alert(`An error occured while trying to parse the data: ${error}`);
    }
}

module.exports = { get, load };