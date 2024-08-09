const photoshop = require('photoshop');

// Modally executes a batchPlay command with the given commands and options
const batchPlay = async (commands, options) => {

    try {
        const result = await photoshop.core.executeAsModal(async () => {
            try {
                const result = await photoshop.action.batchPlay(commands, options);
                return result;
            } catch (error) {
                console.error('Failed to execute batch action:');
                console.error(error);
            }
        });

        return result;

    } catch (error) {
        console.error('Failed to execute batch action:');
        console.error(error);
    }

    return;

};

module.exports = { batchPlay };