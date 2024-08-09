const { batchPlay } = require('./execution');

const ui = require('./ui');
const strings = require('./strings');

// Recursively checks all layers of the group to find text layers.
// When encoutering one, checks if the layer name is a defined localization
// key for the current language, surrounded by square brackets.
// If so, replaces the text layer's content with the localization.
const localizeGroup = async (group) => {

    const locale = ui.getCurrentLocale();

    for (var i = 0; i < group.layers.length; i++) {

        const layer = group.layers[i];

        if (layer.kind === 'group') {
            await localizeGroup(layer);
        } else if (layer.kind === 'text' && layer.visible) {

            if (layer.name.startsWith('[') && layer.name.endsWith(']')) {

                const keyName = layer.name.substring(1, layer.name.length - 1);

                if (strings.get(locale, keyName)) {

                    try {
                        // console.warn(`Localizing layer "${keyName}"" to "${strings.get(locale, keyName)}"`);
                        // console.warn(`Existing contents = "${layer.textItem.contents}"`);

                        // Store the original position and size
                        var originalBounds = layer.bounds;

                        // Get the matching localization
                        const localization = strings.get(locale, keyName);

                        // Update the layer's text with the rich localization
                        await setRichTextForLayer(localization, layer);

                        // Restore the original bounds (position and size)
                        layer.bounds = originalBounds;

                    } catch (error) {
                        console.error(error);
                        ui.enable();
                    }
                }
            }
        }
    }
};

// Returns the layer's properties using batchPlay
const getPropertiesForLayer = async (layer) => {

    let command = {
        _obj: "multiGet",
        _target: [{
            _ref: "textLayer",
            _id: layer.id
        }],
        extendedReference: [
            ["antiAlias", "boundingBox", "bounds", "kerningRange", "orientation", "paragraphStyleRange", "textGridding", "textKey", "textShape", "textStyleRange", "warp"]
        ],
        options: {
            failOnMissingProperty: false,
            failOnMissingElement: false
        }
    };

    try {
        const result = await batchPlay([command], {
            synchronousExecution: true
        });
        return result[0];
    } catch (error) {
        console.error('Failed to get properties:');
        console.error(error);
        ui.enable();
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
        _obj: "set",
        _target: [{
            _ref: "textLayer",
            _id: layer.id
        }],
        to: properties
    };

    // console.warn('Executing command:');
    // console.warn(JSON.stringify(command));

    try {
        await batchPlay([command], {});
    } catch (error) {
        console.error('Failed to set rich text :');
        console.error(error);
        ui.enable();
    }
}

module.exports = { localizeGroup };