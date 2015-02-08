'use strict';

exports.name = 'TrustCheck';
exports.version = '0.5.0';
exports.description = 'Provide reports of trust levels';
exports.configuration = {
    enabled: false
};

var discourse,
    trigger;

exports.begin = function begin(browser, c) {
    discourse = browser;
    trigger = new RegExp('@' + c.username + '\\s+trust', 'ig');
};

exports.onNotify = function (type, notification, topic, post, callback) {
    if (['private_message', 'mentioned', 'replied'].indexOf(type) < 0) {
        return callback();
    }
    var isRequest = trigger.test(post.cleaned);
    if (!isRequest) {
        console.log(trigger);
        console.log(post.cleaned);
        console.log('aborting');
        return callback();
    }
    discourse.getUserData(post.username, function (err, user) {
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

function formatReport(user) {
    var txt = getReportBase(user);
    txt = txt.replace('%USERNAME%', user.username);
    txt = txt.replace('%TRUST%', user.trust_level);
    txt = txt.replace('%TRUST_LOCK%', user.trust_level_locked ? 'LOCKED' :
        'UNLOCKED');
    if (user.tl3_requirements) {
        for (var key in user.tl3_requirements) {
            txt = txt.replace('%' + key + '%', user.tl3_requirements[key]);
        }
    }
    return txt;
}

function getReportBase(user) {
    var base = '```text\n' +
        'username: %USERNAME%\n' +
        'trust level: %TRUST% (%TRUST_LOCK%)\n';
    if (!user.tl3_requirements) {
        base += '\n-- no trust level 3 requirements info--\n';
    } else {
        base += '\nIn the last %time_period%:\n' +
            'Visits: %days_visited%/%min_days_visited%\n' +
            'Topics Replied To: %num_topics_replied_to%/' +
            '%min_topics_replied_to%\n' +
            'Topics Viewed: %topics_viewed%/%min_topics_viewed%\n' +
            'Topics Viewed (all time): %topics_viewed_all_time%/' +
            '%min_topics_viewed_all_time%\n' +
            'Posts Read: %posts_read%/%min_posts_read%\n' +
            'Posts Read (all time): %posts_read_all_time%/' +
            '%min_posts_read_all_time%\n' +
            'Flagged: %num_flagged_posts%/%max_flagged_posts% (max)\n' +
            'Flagged By: %num_flagged_by_users%/' +
            '%max_flagged_by_users% (max)\n' +
            'Likes Given: %num_likes_given%/%min_likes_given%\n' +
            'Likes Received: %num_likes_received%/%min_likes_received%\n' +
            'Liked on Days: %num_likes_received_days%/' +
            '%min_likes_received_days%\n' +
            'Liked by users: %num_likes_received_users%/' +
            '%min_likes_received_users%\n';
    }
    base += '```\n';
    return base;
}
