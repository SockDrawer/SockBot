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
 * Construct a result consisting of two data points in three parts
 *
 * @private
 * @param {string} before Prefix
 * @param {*} item1 First part
 * @param {string} defaultItem1 Value to use for item1 when item1 is falsy
 * @param {string} middle part to go between item1 and item2
 * @param {*} item2 Second Part
 * @param {string} after Suffix
 * @returns {string} Formatted thing
 */
function threeParts(before, item1, defaultItem1, middle, item2, after) {
    item2 = stringify(item2);
    item1 = stringify(item1);
    if (!item2) {
        return '';
    }
    return before + (item1 || defaultItem1) + middle + item2 + after;
}

/**
 * Generate a hyperlink
 *
 * @param {!string} url URL to link to
 * @param {string} linkText Link Text to display
 * @returns {string} Linkified url
 */
exports.link = function link(url, linkText) {
    return threeParts('[', linkText, 'Click Me.', '](', url, ')');
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
    return threeParts('<details>\n<summary>\n', title, 'SPOILER!', '\n</summary>\n\n', body, '\n\n</details>');
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

/**
 * Format text as a preformatted block
 *
 * @param {!string} text The text
 * @returns {string} Text in a preformat block
 */
/* eslint-disable prefer-template */
exports.preformat = function preformat(text) {
    if (text.indexOf('\n') > -1) {
        return '```\n' + text + '\n```';
    }
    return '`' + text + '`';
};
/* eslint-enable prefer-template */

/**
 * Format text with a strikethrough effect
 *
 * @param {!string} text The text to strike out
 * @returns {string} The stricken text
 */
exports.strikethrough = function strikethrough(text) {
    return prefixifier('~~', text, '~~');
};

/**
 * Format text as a list of items
 *
 * @param {!string} items An array of strings to format as a list
 * @returns {string} The list
 */
exports.list = function list(items) {
    return items.map((item) => `\n- ${item}`).join('');
};
