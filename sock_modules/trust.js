'use strict';
/**
 * Trust level report generation module
 * @module trust
 */


var XRegExp = require('xregexp').XRegExp;

/*eslint camelcase:0, max-len: [1, 90, 4] */

/**
 * The name of the sockbot module
 * @type {String}
 */
exports.name = 'TrustCheck';

/**
 * The version of this sockbot module
 * @type {String}
 */
exports.version = '0.5.0';

/**
 * Description of the module, for help text
 * @type {String}
 */
exports.description = 'Provide reports of trust levels';

/**
 * Configuration options
 * @type {Object}
 */
exports.configuration = {
    /**
     * Is the module enabled?
     * @type {Boolean}
     */
    enabled: false
};

var discourse,
    trigger;
 /**
 * Bootstrap the module
 * @param  {string} browser - discourse.
 * @param  {object} config - The configuration to use
 */
exports.begin = function begin(browser, c) {
    discourse = browser;
    trigger = new XRegExp('@' + c.username + '\\s+trust(?<args>(\\s+(\\S+))*)');
};

/**
 * Runs on notification. Only responds to private_message, mention, or reply.
 * This also only replies to requests for your own report unless you're TL4 or higher. 
 * @param {string} type - The type of event.
 * @param {string} notification - The notification to respond to
 * @param {string} topic - Unused.
 * @param {string} post - The post the notification was for
 * @param {function} callback - The callback to notify when processing is complete.
 */
exports.onNotify = function (type, notification, topic, post, callback) {
    if (['private_message', 'mentioned', 'replied'].indexOf(type) < 0) {
        return callback();
    }
    var username = post.username;
    var parts = trigger.xexec(post.cleaned);
    if (!parts) {
        return callback();
    }
    if (post.trust_level >= 4 && parts.args) {
        parts.args = parts.args.trim().split(' ');
        if (parts.args.length > 0) {
            username = parts.args[0];
        }
    }
    discourse.getUserData(username, function (err, user) {
        if (err) {
            return callback();
        }
        discourse.createPost(notification.topic_id,
            notification.post_number, formatReport(user),
            function () {
                callback(true);
            });
    });
};

/**
 * Format the report to send out.
 * @param  {Object} user The user whose report this is for
 * @return {String} The report text, formatted pretty
 */
function formatReport(user) {
    var txt = getReportBase(user);
    txt = txt.replace('%USERNAME%', user.username);
    txt = txt.replace('%TRUST%', user.trust_level);
    txt = txt.replace('%TRUST_LOCK%', user.trust_level_locked ? 'LOCKED' :
        'Not locked');
    if (user.tl3_requirements) {
        for (var key in user.tl3_requirements) {
            txt = txt.replace('%' + key + '%', user.tl3_requirements[key]);
        }
        txt = txt.replace('%analysis%', promotionAnalysis(user));
    }
    return txt;
}

/**
 * Get the basic report information for the user
 * @param  {Object} user Basic info about the user
 * @return {String} The information about the user
 */
function getReportBase(user) {
    var base = '```text\n' +
        'username: %USERNAME%\n' +
        'trust level: %TRUST% (%TRUST_LOCK%)\n';
    if (user.admin) {
        base += 'Administrator\n';
    }
    if (user.moderator) {
        base += 'Moderator\n';
    }
    if (!user.tl3_requirements) {
        base += '\n-- no trust level 3 requirements info--\n';
    } else {
        base += '\nIn the last %time_period%:\n' +
            'Visits:              %days_visited%/%min_days_visited%\n' +
            'Topics Replied To:   %num_topics_replied_to%/' +
            '%min_topics_replied_to%\n' +
            'Topics Viewed:       %topics_viewed%/%min_topics_viewed%\n' +
            'Total Topics Viewed: %topics_viewed_all_time%/' +
            '%min_topics_viewed_all_time%\n' +
            'Posts Read:          %posts_read%/%min_posts_read%\n' +
            'Total Posts Read:    %posts_read_all_time%/' +
            '%min_posts_read_all_time%\n' +
            'Flagged Posts:       %num_flagged_posts%/%max_flagged_posts% (max)\n' +
            'Flagged By:          %num_flagged_by_users%/' +
            '%max_flagged_by_users% (max)\n' +
            'Likes Given:         %num_likes_given%/%min_likes_given%\n' +
            'Likes Received:      %num_likes_received%/%min_likes_received%\n' +
            'Liked on Days:       %num_likes_received_days%/' +
            '%min_likes_received_days%\n' +
            'Liked by users:      %num_likes_received_users%/' +
            '%min_likes_received_users%\n' +
            '\n' +
            'Status:  %analysis%\n';
    }
    base += '```\n';
    return base;
}

/**
 * List of description text for a given promotion table
 * @type {Object}
 */
var promotionTable = {
    locked: 'Trust level is locked, promotion disabled.',
    tl0: 'Analysis not available for Trust Level 0.',
    tl1: 'Analysis not available for Trust Level 1.',
    tl4: 'Trust level is 4.',
    grace_period: {
        below: 'Not being demoted due to grace period.',
        middle: 'Above low water mark. (also on grace period)',
        above: 'Above requirements. (also on grace period)'
    },
    tl2: {
        below: 'Below requirements.',
        middle: 'Within 90% of requirements, may be promoted soon!',
        above: 'Met requirements, should be promoted soon!'
    },
    tl3: {
        below: 'Below requirements, should be demoted soon!',
        middle: 'Above low water mark. In danger of demotion!',
        above: 'Above requirements.'
    }
};

/**
 * Get information about the trust level for the user
 * @param  {Object} user The user to get information about
 * @return {String} The promotion text for that user.
 */
function promotionAnalysis(user) {
    if (user.trust_level_locked) {
        return promotionTable.locked;
    }
    if (user.trust_level < 2 || user.trust_level === 4) {
        switch (user.trust_level) {
            case 0:
                return promotionTable.tl0;
            case 1:
                return promotionTable.tl1;
            case 4:
                return promotionTable.tl4;
        }
    }

    var subTable;

    if (user.trust_level === 3 && user.tl3_requirements.on_grace_period) {
        subTable = promotionTable.grace_period;
    } else if (user.trust_level === 3) {
        subTable = promotionTable.tl3;
    } else if (user.trust_level === 2) {
        subTable = promotionTable.tl2;
    }

    if (user.tl3_requirements.requirements_lost) {
        return subTable.below;
    } else if (user.tl3_requirements.requirements_met) {
        return subTable.above;
    } else {
        return subTable.middle;
    }
}
