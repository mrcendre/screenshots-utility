const { entrypoints } = require('uxp');

const fs = require('uxp').storage.localFileSystem;

const photoshop = require('photoshop');
const action = photoshop.action;
const app = photoshop.app;

// The localizations loaded by the user
var strings = {};

entrypoints.setup({
    panels: {
        vanilla: {
            show(node) { }
        }
    }
});

// Shows a file picker dialog and returns the picked file's data as a string
const openFile = async () => {
    const file = await fs.getFileForOpening({ allowMultiple: false });
    const data = await file.read();
    return data;
};

// Prompts the user to pick a localization file and try to parse its content as JSON.
const loadStrings = async () => {
    try {
        const data = await openFile();
        strings = JSON.parse(data);

        if (Object.keys(strings).length > 0) {

            document.getElementById("localize-button").removeAttribute('disabled');
            document.getElementById("language-picker").removeAttribute('disabled');
            document.getElementById("screenshots-amount-input").removeAttribute('disabled');
            document.getElementById("crop-save-button").removeAttribute('disabled');

            // TODO: Update the language picker with values that are available in the JSON localization file
            //document.getElementById("language-picker").innerHTML = Object.keys(strings).map(locale => `<option value="${locale}">${locale}</option>`).join('');
        }

    } catch (error) {
        alert(`An error occured while trying to parse the data: ${error}`);
    }
}

// Returns the currently selected language to work with
const getCurrentLocale = () => {
    return document.getElementById('language-picker').value;
};

// Returns the currently selected language to work with
const getCurrentNumberOfScreenshots = () => {
    return parseInt(document.getElementById('screenshots-amount-input').value);
};

// Recursively checks all layers of the group to find text layers.
// When encoutering one, checks if the layer name is a defined localization
// key for the current language, surrounded by square brackets.
// If so, replaces the text layer's content with the localization.
const localizeGroup = async (group) => {

    const locale = getCurrentLocale();

    await photoshop.core.executeAsModal(async () => {

        for (var i = 0; i < group.layers.length; i++) {

            const layer = group.layers[i];

            if (layer.kind === 'group') {
                await localizeGroup(layer);
            } else if (layer.kind === 'text' && layer.visible) {

                if (layer.name.startsWith('[') && layer.name.endsWith(']')) {

                    const keyName = layer.name.substring(1, layer.name.length - 1);

                    if (Object.keys(strings[locale]).includes(keyName)) {

                        try {

                            console.warn(`Localizing layer "${keyName}"" to "${strings[locale][keyName]}"`);
                            console.warn(`Existing contents = "${layer.textItem.contents}"`);

                            // Store the original position and size
                            var originalBounds = layer.bounds;

                            // Get the matching localization
                            const localization = strings[locale][keyName];

                            // Update the layer's text with the rich localization
                            await setRichTextForLayer(localization, layer);

                            // TODO: Use batchPlay to set the font in different ranges
                            // Check example here: https://github.com/AdobeDocs/uxp-photoshop-plugin-samples/blob/main/layer-creation-js-sample/index.js 

                            // Restore the original bounds (position and size)
                            layer.bounds = originalBounds;

                        } catch (error) {
                            console.error(error);
                        }

                    }
                }
            }
        }

    });

};

const localize = async () => {

    await photoshop.core.executeAsModal(async () => {

        await localizeGroup(app.activeDocument);

    });

}

// Returns the layer's properties using batchPlay
const getPropertiesForLayer = async (layer) => {

    let command = {
        "_obj": "multiGet",
        "_target": [{
            "_ref": "textLayer",
            "_id": layer.id
        }],
        "extendedReference": [
            ["antiAlias", "boundingBox", "bounds", "kerningRange", "orientation", "paragraphStyleRange", "textGridding", "textKey", "textShape", "textStyleRange", "warp"]
        ],
        "options": {
            "failOnMissingProperty": false,
            "failOnMissingElement": false
        }
    };

    try {
        const result = await action.batchPlay([command], {});

        //console.warn('Properties for layer with id', layer.id, ':');
        //console.warn(JSON.stringify(result));

        return result[0];

    } catch (error) {
        console.error('Failed to execute batch action:');
        console.error(error);
    }

};

// Performs a batch action to replace the text content of the given layer
// with a rich text whose bold segments are delimited by '**' markers,
// as in Markdown style.
const setRichTextForLayer = async (text, layer) => {

    var properties = await getPropertiesForLayer(layer);

    var textStyleRanges = [];

    const defaultTextStyle = properties.textKey.textStyleRange[0];

    const components = text.split('**');

    var isBold = text.startsWith('**'),
        offset = 0;

    for (var i = 0; i < components.length; i++) {

        var component = components[i].replaceAll('**', '');

        if (component.length == 0) continue;

        // Perform a deep copy of the default style to avoid modifying the same reference
        var componentStyle = JSON.parse(JSON.stringify(defaultTextStyle));

        componentStyle['_obj'] = "textStyleRange";
        componentStyle['from'] = offset;
        componentStyle['to'] = offset + component.length;

        componentStyle['textStyle'].fontName = "SF Pro Display";
        componentStyle['textStyle'].fontPostScriptName = isBold ? "SFProDisplay-Bold" : "SFProDisplay-Regular";
        componentStyle['textStyle'].fontStyleName = isBold ? "Bold" : "Regular";

        textStyleRanges.push(componentStyle);

        offset += component.length;
        isBold = !isBold;

    }

    properties['_obj'] = 'textLayer';
    properties.textKey = text.replaceAll('**', '');
    properties.textStyleRange = textStyleRanges;

    let command = {
        "_obj": "set",
        "_target": [{
            "_ref": "textLayer",
            "_id": layer.id
        }],
        "to": properties
    };

    console.warn('Executing command:');
    console.warn(JSON.stringify(command));

    try {
        await action.batchPlay([command], {});
    } catch (error) {
        console.error('Failed to execute batch action:');
        console.error(error);
    }
}



const cropDocument = async (screenshotIndex) => {

    const document = photoshop.app.activeDocument;

    const documentWidth = document.width, documentHeight = document.height;

    const screenshotWidth = documentWidth / getCurrentNumberOfScreenshots();

    const bounds = {
        left: screenshotIndex * screenshotWidth,
        top: 0,
        right: ((getCurrentNumberOfScreenshots() - screenshotIndex - 1) * screenshotWidth),
        bottom: 0
    };

    console.warn('Cropping document with bounds:');
    console.warn(JSON.stringify(bounds));

    try {
        await photoshop.core.executeAsModal(async () => {
            await document.crop(bounds, 0, screenshotWidth, documentHeight);
            await (new Promise(resolve => setTimeout(resolve, 2000)));
        });
    } catch (error) {
        console.error('Failed to crop document:');
        console.error(error);
    }

    return;

}

const saveAs = async (screenshotIndex) => {

    // TODO:

    const document = photoshop.app.activeDocument;

    const locale = getCurrentLocale();

    const folder = await fs.getFolder();

    const entry = await folder.createEntry(`${locale}_${screenshotIndex}.jpg`, { overwrite: true });

    await document.saveAs.jpg(entry, { quality: 12 });

    return;

}

const cropAndSave = async () => {

    for (var i = 0; i < getCurrentNumberOfScreenshots(); i++) {

        console.warn('Processing screenshot ' + i);

        await cropDocument(i);
        await saveAs(i);

    }

    console.warn('Finished processing screenshots');

}


document.getElementById("load-strings-button").addEventListener("click", loadStrings);
document.getElementById("localize-button").addEventListener("click", localize);
document.getElementById("crop-save-button").addEventListener("click", cropAndSave);

document.getElementById("localize-button").setAttribute('disabled', true);
document.getElementById("language-picker").setAttribute('disabled', true);
document.getElementById("screenshots-amount-input").setAttribute('disabled', true);
document.getElementById("crop-save-button").setAttribute('disabled', true);


// Adds a global event listener to see what actions are being performed at low-level
// photoshop.action.addNotificationListener(['all'], (event, descriptor) => {console.warn("Event:" + event + " Descriptor: " + JSON.stringify(descriptor))});