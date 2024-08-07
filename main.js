const { entrypoints } = require("uxp");

const fs = require('uxp').storage.localFileSystem;
const fileTypes = require('uxp').storage.fileTypes;

const app = require("photoshop").app;

var strings = {};

entrypoints.setup({
  panels: {
    vanilla: {
      show(node) {
      }
    }
  }
});

const openFile = async () => {
  const file = await fs.getFileForOpening({allowMultiple: false});
  const data = await file.read();
  return data;
};

const loadStrings = async () => {
  var data = await openFile();
  strings = JSON.parse(data);
}

const getCurrentLocale = () => {
  
  return document.getElementById('language-picker').value;

};

const localizeGroup = (group) => {

  const locale = getCurrentLocale();

  for (var i = 0; i < group.layers.length; i++) {

    const layer = group.layers[i];

    if (layer.kind === 'group') {
      localizeGroup(layer);
    } else if (layer.kind === 'text' && layer.visible) {

      if (layer.name.startsWith('[') && layer.name.endsWith(']')) {

        const keyName = layer.name.substring(1, layer.name.length - 1);

        if (Object.keys(strings[locale]).includes(keyName)) {

          try {

            console.warn(`Localizing layer "${keyName}"" to "${strings[locale][keyName]}"`);
            console.warn(`Existing contents = "${layer.textItem}"`);

            // TODO: Change text contents
            // layer.textItem.contents = strings[locale][keyName];

            var textItem = layer.textItem;

            // Store the original position and size
            var originalBounds = layer.bounds;

            // TODO: Dynamically build the dictionary based on '**' characters !!! 

            const localization = strings[locale][keyName];

            var texts = [];

            var components = localization.split('**');

            for (var j = 0; j < components.length; j++) {

              const isBold = localization.startsWith('**') ? j % 2 == 0 : j % 2 != 0;

              texts.push({
                text: components[j],
                font: isBold ? 'SF Pro Display Bold' : 'SF Pro Display Regular'
              })

            }

            //var texts = [{
            //  'text': strings[locale][keyName],
            //  'font': 'SF Pro Display'
            //}];

            // Create a single string from the text pieces
            var fullText = texts.map(style => style.text).join("");

            // Apply the full text
            textItem.contents = fullText;

            // Apply styles to specific ranges
            var currentIndex = 0;
            for (var j = 0; j < texts.length; j++) {
                var style = texts[j];
                var length = style.text.length;

                //var textRange = textItem.range(currentIndex, currentIndex + length);
                //console.warn('textRange = ', textRange);
                textItem.
                textRange.characterAttributes.textFont = app.textFonts.getByName(style.font);

                currentIndex += length;
            }

            // Restore the original bounds (position and size)
            layer.bounds = originalBounds;

          } catch (error) {
            console.error(error);
          }

        }

      }

    }

  // TODO: If text, check the layer name - does it start with [ and ends with ]

  // TODO: If so, extract the key name and lookup the appropriate localization among `strings`

  }

};

const localize = () => {

  require('photoshop').core.executeAsModal(function() {

    localizeGroup(app.activeDocument);

  });


  // const allLayerNames = allLayers.map(layer => layer.name);
  // const sortedNames = allLayerNames.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  // document.getElementById("layers").innerHTML = `
  //   <ul>${
  //     sortedNames.map(name => `<li>${name}</li>`).join("")
  //   }</ul>`;
}

document.getElementById("load-strings-button").addEventListener("click", loadStrings);
document.getElementById("localize-button").addEventListener("click", localize);
