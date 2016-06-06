'use strict';

/**
 * stringify a parameter.
 *
 * falsy things become empty string, everything else is toStringed
 *
 * @private
 * @param {*} text thing to stringify
 * @returns {string} stringified text
 */
function stringify(text) {
    return `${text || ''}`;
}

/**
 * Apply a prefix (and suffix) to a text
 *
 * @private
 * @param {string} prefix Prefix to apply
 * @param {*} text Text to wrap
 * @param {string} [suffix=''] Suffix to apply
 * @returns {string} wrapped Text
 */
function prefixifier(prefix, text, suffix) {
    text = stringify(text);
    if (!text) {
        return '';
    }
    suffix = suffix || '';
    return prefix + text.replace(/^\s+|\s+$/g, '') + suffix;
}

/**
 * Generate a permalink for a post
 *
 * @param {!number} postId Id or the post to url
 * @returns {string} Absolute URL for post
 */
exports.urlForPost = function postLink(postId) {
    return prefixifier('/post/', postId);
};

/**
 * Generate a link for a topic
 *
 * @param {!number} topicId Id of the topic to url
 * @param {string} [topicSlug] Slug of the topic to url
 * @param {number} [postIndex] Index of the post to url to in topic
 * @returns {string} Absolute URL for topic
 */
exports.urlForTopic = function linkTopic(topicId, topicSlug, postIndex) {
    if (!topicId || !`${topicId}`) {
        return '';
    }
    if (typeof topicSlug === 'number' && !postIndex) {
        // No slug provided. i can deal with that
        postIndex = topicSlug;
        topicSlug = 'topic';
    }
    if (!postIndex) {
        postIndex = '';
    }
    if (!topicSlug) {
        topicSlug = '';
    }
    const url = `/topic/${topicId}/${topicSlug}/${postIndex}`;
    return url.replace(/\/*$/, '');
};

/**
 * Turn input text into a forum quote
 *
 * @param {!string} text Text to quote
 * @param {string} [quotedUser] User who said the quote
 * @param {string} [contextUrl] Url to the quoted post
 * @param {string} [contextTitle] Title of the quote context link
 * @returns {string} quoted text, with attribution if username provided
 */
exports.quoteText = function quoteText(text, quotedUser, contextUrl, contextTitle) {
    const quote = stringify(text),
        user = stringify(quotedUser),
        url = stringify(contextUrl),
        title = stringify(contextTitle);
    if (!quote) {
        return '';
    }
    const parts = quote.split(/\n/).map((line) => `> ${line}`);
    if (user) {
        let attribution = `@${user}`;
        if (url) {
            if (title) {
                attribution += ` said in [${title}](${url}):`;
            } else {
                attribution += ` [said](${url}):`;
            }
        } else {
            attribution += ' said:';
        }
        parts.unshift(attribution);
    }
    return parts.join('\n');
};

/**
 * Generate a hyperlink
 *
 * @param {!string} url URL to link to
 * @param {string} linkText Link Text to display
 * @returns {string} Linkified url
 */
exports.link = function link(url, linkText) {
    url = stringify(url);
    linkText = stringify(linkText);
    if (!url) {
        return '';
    }
    return `[${linkText || 'Click Me.'}](${url})`;
};

/**
 * Generate an image
 *
 * @param {!string} url Image URL
 * @param {string} titleText Title text to display
 * @returns {string} Image incantation
 */
exports.image = function image(url, titleText) {
    url = stringify(url);
    titleText = stringify(titleText);
    if (!url) {
        return '';
    }
    if (!titleText) {
        const parts = url.split('/');
        titleText = parts[parts.length - 1];
    }
    return `![${titleText}](${url} "${titleText.replace(/"/g, '')}")`;
};

/**
 * Spoiler something
 *
 * @param {!string} body Spoiler body
 * @param {string} title spoiler title to display
 * @returns {string} spoilered text
 */
exports.spoiler = function spoiler(body, title) {
    body = stringify(body);
    title = stringify(title);
    if (!body) {
        return '';
    }
    return `<details><summary>${title || 'SPOILER!'}</summary>${body}</details>`;
};

/**
 * Format text as bold.
 *
 * @param {!string} text Input text
 * @returns {string} Bolded Text
 */

exports.bold = function bold(text) {
    return prefixifier('**', text, '**');
};

/**
 * Format text as italic.
 *
 * @param {!string} text Input text
 * @returns {string} Italiced Text
 */

exports.italic = function italic(text) {
    return prefixifier('*', text, '*');
};

/**
 * Format text as bold italic.
 *
 * @param {!string} text Input text
 * @returns {string} Bolded and italiced Text
 */

exports.bolditalic = function bolditalic(text) {
    return prefixifier('***', text, '***');
};

/**
 * Format text as a first level header.
 *
 * @param {!string} text Header text
 * @returns {string} Headered Text
 */

exports.header1 = function header1(text) {
    return prefixifier('# ', text);
};

/**
 * Format text as a second level header.
 *
 * @param {!string} text Header text
 * @returns {string} Headered Text
 */

exports.header2 = function header2(text) {
    return prefixifier('## ', text);
};

/**
 * Format text as a third level header.
 *
 * @param {!string} text Header text
 * @returns {string} Headered Text
 */

exports.header3 = function header3(text) {
    return prefixifier('### ', text);
};

/**
 * Format text as a fourth level header.
 *
 * @param {!string} text Header text
 * @returns {string} Headered Text
 */

exports.header4 = function header4(text) {
    return prefixifier('#### ', text);
};

/**
 * Format text as a fifth level header.
 *
 * @param {!string} text Header text
 * @returns {string} Headered Text
 */

exports.header5 = function header5(text) {
    return prefixifier('##### ', text);
};

/**
 * Format text as a sixth level header.
 *
 * @param {!string} text Header text
 * @returns {string} Headered Text
 */

exports.header6 = function header6(text) {
    return prefixifier('###### ', text);
};
