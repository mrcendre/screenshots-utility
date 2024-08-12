const photoshop = require('photoshop');
const fs = require('uxp').storage.localFileSystem;

const { batchPlay } = require('./execution');

// Shows a file picker dialog and returns the picked file's data as a string
const openFile = async () => {
    const file = await fs.getFileForOpening({ allowMultiple: false });
    const data = await file.read();
    return data;
};

// Shows a folder picker dialog and returns the picked folder.
// Used to select a location to save the exported screenshots.
const getDestinationFolder = async () => {

    return await fs.getFolder();

}


const createGuide = async (orientation, position) => {

    const command = {
        "_obj": "make",
        "_target": [
            {
                "_ref": "good"
            }
        ],
        "guideTarget": {
            "_enum": "guideTarget",
            "_value": "guideTargetCanvas"
        },
        "new": {
            "$GdCA": 0,
            "$GdCB": 0,
            "$GdCG": 0,
            "$GdCR": 255,
            "_obj": "good",
            "_target": [
                {
                    "_id": photoshop.app.activeDocument.id,
                    "_ref": "document"
                },
                {
                    "_index": 9,
                    "_ref": "good"
                }
            ],
            "kind": {
                "_enum": "kind",
                "_value": "document"
            },
            "orientation": {
                "_enum": "orientation",
                "_value": orientation
            },
            "position": {
                "_unit": "pixelsUnit",
                "_value": position
            }
        }
    };

    await batchPlay([command], {});

}


// Horizontally crops the document at a given index of the total amount of screenshots
const crop = async (index, total) => {

    const document = photoshop.app.activeDocument;

    const documentWidth = document.width,
        documentHeight = document.height;

    const screenshotWidth = documentWidth / total;

    const left = index * screenshotWidth;

    const bounds = {
        left: left,
        top: 0,
        right: left + screenshotWidth,
        bottom: documentHeight
    };

    // console.warn('Cropping document with bounds:');
    // console.warn(JSON.stringify(bounds));

    try {
        await photoshop.core.executeAsModal(async () => {
            try {
                await document.crop(bounds, 0, screenshotWidth, documentHeight);
            } catch (error) {
                console.error('Failed to crop document:');
                console.error(error);
            }

        });
    } catch (error) {
        console.error('Failed to crop document:');
        console.error(error);
    }

    return;

}

const saveAs = async (screenshotIndex, locale, folder) => {

    try {

        const document = photoshop.app.activeDocument;

        var filename = `screenshot_${screenshotIndex + 1}.jpg`;

        // If the locale is set, we'll use this instead as a prefix for the filename
        if (locale) filename = `${locale.toUpperCase()}_${screenshotIndex + 1}.jpg`;

        const entry = await folder.createEntry(filename, { overwrite: true });

        await photoshop.core.executeAsModal(async () => {
            try {
                await document.saveAs.jpg(entry, { quality: 12 });
            } catch (error) {
                console.error('Failed to save document:');
                console.error(error);
            }
        });

    } catch (error) {
        console.error('Failed to save document:');
        console.error(error);
    }

    return;

}

module.exports = { openFile, getDestinationFolder, createGuide, crop, saveAs };