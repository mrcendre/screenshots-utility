const { batchPlay } = require('./execution');

// Makes a snapshot of the document, naming the snapshot with the given name.
const make = async (name) => {
    const result = await batchPlay(
        [{
            _obj: "make",
            _target: [{
                _ref: "snapshotClass",
            },],
            from: {
                _ref: "historyState",
                _property: "currentHistoryState",
            },
            name: name,
            using: {
                _enum: "historyState",
                _value: "fullDocument",
            },
            _isCommand: true,
            _options: {},
        },], {
        synchronousExecution: true,
    }
    );

    return result;
};

// Reverts the document to the snapshot with the given name.
const revertTo = async (name) => {
    const result = await batchPlay(
        [{
            _obj: "select",
            _target: [{
                _ref: "snapshotClass",
                _name: name,
            },],
            _isCommand: true,
            _options: {
                dialogOptions: "dontDisplay",
            },
        },], {
        synchronousExecution: true,
    }
    );

    return result;
}

const remove = async (name) => {
    const result = await batchPlay(
        [{
            _obj: "delete",
            _target: [{
                _ref: "snapshotClass",
                _name: name,
            },],
            _isCommand: true,
            _options: {},
        },], {
        synchronousExecution: true,
    }
    );

    return result;
}

module.exports = { make, revertTo, remove };