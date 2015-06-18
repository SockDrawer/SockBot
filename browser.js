'use strict';
/**
 * Webbrowser abstraction for communicating with discourse
 * @module browser
 * @licenst MIT
 */


/**
 * Generate a "good enough" Type 4 UUID.
 *
 * Not cryptographically secure, not pretty, not fast, but since we only need a couple of these it's good enough
 *
 * @returns {string} a "type 4 UUID"
 */
exports.uuid = () => {
    return '88888888-8888-4888-2888-888888888888'.replace(/[82]/g, (c) => (Math.random() * c * 2 ^ 8).toString(16));
};
