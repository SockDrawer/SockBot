'use strict';

const fs = require('fs');

const validateMessage = require('validate-commit-msg');

const messageLocation = './.git/COMMIT_EDITMSG';

fs.readFile(messageLocation, (_, buffer) => {
    let message = buffer.toString();

    // Alias `feature` => `feat`
    if (/^feature[:\(]/i.test(message)) {
        message = message.replace(/^feature/i, 'feat');
    }

    // Alias `performance` => `perf`
    if (/^performance[:\(]/i.test(message)) {
        message = message.replace(/^performance/i, 'perf');
    }

    // Lowercase the message type
    message = message.replace(/^[a-z]+/i, (type) => type.toLowerCase());

    fs.writeFile(messageLocation, message, 'utf8', () => {
        const result = validateMessage(message);
        process.exit(result ? 0 : 1);
    });
});
