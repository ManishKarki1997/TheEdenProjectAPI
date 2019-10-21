const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
    const actualFilePath = path.join(path.join(path.dirname(require.main.filename), 'uploads'), filePath);
    fs.unlink(actualFilePath, (err) => {
        if (err) {
            throw (err);
        }
    })
}

module.exports = deleteFile;