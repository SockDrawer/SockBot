exports.config = {
    'likeBinge': false,
    'readify': false,
    'queuestart': (new Date().getTime()),
    'behavior': {
        'mentioned': [{
            'handle': function (n) {
                return true;
            },
            'action': function (browser, n, callback) {
                console.log(n.data.display_username + ' mentioned me ' + n.slug);
                var now = (new Date().getTime());
                browser.reply_topic(browser, n.topic_id, n.post_number,
                    '@' + n.data.display_username + ' has summoned me, and so I appear. <t' + n.topic_id + 'd' + now + '>',
                    callback);
            }
        }],
        'replied': [],
        'quoted': [],
        'edited': [],
        'liked': [{
            'handle': function (n) {
                return true;
            },
            'action': function (browser, n, callback) {
                console.log(n.data.display_username + ' liked my post in ' + n.slug);
                callback();
            }
        }],
        'private_message': [],
        'invited_to_private_message': [],
        'invitee_accepted': [],
        'posted': [],
        'moved_post': [],
        'linked': [],
        'granted_badge': []

    }
};