'use strict';

var fs = require('fs');

const validateMessage = require('validate-commit-msg');

const messageLocation = './.git/COMMIT_EDITMSG';

fs.readFile(messageLocation, function(_, buffer) {
    let message = buffer.toString();

    // Alias `feature` => `feat`
    if (/^feature[:\(]/i.test(message)) {
        message = message.replace(/^feature/i, 'feat');
    }

    // Lowercase the message type
    message = message.replace(/^[a-z]+/i, (m) => m.toLowerCase());

    fs.writeFile(messageLocation, message, 'utf8', () => {
        const result = validateMessage(message);
        process.exit(result ? 0 : 1);
    });
});
