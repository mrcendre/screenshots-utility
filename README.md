# Introduction

This plugin's goal is to automate a lot of redundant work when manually localizing, cropping and saving multiple screenshots from a single Photoshop composition.

# Usage

## Localizing

Localizations must be written in a JSON file, with the following structure:

```json
{
  "en": {
    "key_1": "Hello world"
    ...
  },
  "fr": {
    "key_1": "Bonjour tout le monde"
  }
}
```

The file with the appropriate localizations must be loaded from the extension's panel using the "Load strings" button.

Finally, the text layers to localize must be named with the key name, surrounded with square brackets, eg. `[key1]` to use the localization from the above example.

## Cropping and saving

The composition's width must be a multiple of the final screenshot's expected width, since the plugin will perform a simple division to crop the screenshots.

Type in the number of screenshots to output (eg. 5 screenshots from a 5000px wide composition will result in 1000px wide screenshots).

Click "Crop & Save", and watch the magic happen. You screenshots will be saved at the same level as the PSD project.

## Compatibility

This plugin was developed and tested on Photoshop 2024 (version 23.0.0).

## Documentation

* Read more about creating and debugging plugins using the UDT application [here](https://developer.adobe.com/photoshop/uxp/2022/guides/devtool/udt-walkthrough/). 
* We build on this starter template and show you how to [edit a document](https://developer.adobe.com/photoshop/uxp/2022/guides/getting-started/editing-the-document/) and [write a file](https://developer.adobe.com/photoshop/uxp/2022/guides/getting-started/writing-a-file/) using UXP. 
