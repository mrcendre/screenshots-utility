const photoshop = require('photoshop');
const app = photoshop.app;

const { entrypoints } = require('uxp');

// Load the modules that contain the functions we need
const localizer = require('./scripts/localizer');
const ui = require('./scripts/ui');
const strings = require('./scripts/strings');
const snapshot = require('./scripts/snapshot');
const { getDestinationFolder, createGuide, crop, saveAs } = require('./scripts/document');

entrypoints.setup({
    panels: {
        vanilla: {
            show(node) { }
        }
    }
});

// The action to perform when the user clicks the 'Create Guides' button
const createGuides = async () => {

    await createGuide('horizontal', 0);
    await createGuide('horizontal', app.activeDocument.height);

    const total = ui.getCurrentNumberOfScreenshots();

    const screenshotWidth = app.activeDocument.width / total;

    for (var i = 0; i < total + 1; i++) {

        await createGuide('vertical', i * screenshotWidth);

    }
}

// The action to perform when the user clicks the 'Localize' button
const localize = async () => {

    ui.disable();

    await localizer.localizeGroup(app.activeDocument);

    ui.enable();

}

// The action to perform when the user clicks the 'Crop & Save' button
const cropAndSave = async () => {

    const folder = await getDestinationFolder();

    // If the user cancels the folder picker, abort the process
    if (!folder) return;

    // Otherwise we can start the process and disable the UI
    ui.disable();

    const initialSnapshotName = 'initialState';

    await snapshot.make(initialSnapshotName);

    const total = ui.getCurrentNumberOfScreenshots();

    console.log(`Starting to process ${total} screenshots...`);

    for (var i = 0; i < total; i++) {

        const index = i + 1;

        // console.log(`Processing screenshot ${index}...`);

        await crop(i, total);

        // console.log(`Cropped ${index}, saving...`);

        await saveAs(i, ui.getCurrentLocale(), folder);

        // console.log(`Saved ${index}, reverting document...`);

        await snapshot.revertTo(initialSnapshotName);

        // console.warn(`Successfully processed screenshot ${index}`);
        console.info(`${index / total * 100}% done`);

    }

    await snapshot.remove(initialSnapshotName);

    // Re-enable back the UI
    ui.enable();

}

document.getElementById('create-guides-button').addEventListener('click', createGuides);
document.getElementById('load-strings-button').addEventListener('click', strings.load);
document.getElementById('localize-button').addEventListener('click', localize);
document.getElementById('crop-save-button').addEventListener('click', cropAndSave);

// Update the screenshot size when the user changes the amount
document.getElementById('screenshots-amount-input').addEventListener('input', () => {
    ui.updateMeasurements();
});

// ... and update its initial state.
ui.updateMeasurements();

ui.disable({ except: ['load-strings-button', 'screenshots-amount-input', 'create-guides-button', 'crop-save-button'] });

// Adds a notification listener to update the measurements when the history state changes
var _onHistoryStateChanged = (e, d) => { ui.updateMeasurements(); }

photoshop.action.addNotificationListener([{ event: "historyStateChanged" }], _onHistoryStateChanged);

// Adds a global event listener to see what actions are being performed at low-level
// photoshop.action.addNotificationListener(['all'], (event, descriptor) => { console.warn('Event:' + event + ' Descriptor: ' + JSON.stringify(descriptor)) });