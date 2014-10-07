/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var async = require('async'),
        browser = require('./browser'),
        notify_time = (new Date().getTime()),
        sock_modules,
        notify_types = {
            1: 'mentioned',
            2: 'replied',
            3: 'quoted',
            4: 'edited',
            5: 'liked',
            6: 'private_message',
            7: 'invited_to_private_message',
            8: 'invitee_accepted',
            9: 'posted',
            10: 'moved_post',
            11: 'linked',
            12: 'granted_badge'
        };

    function process_notification(notification, post, callback) {
        async.eachSeries(sock_modules,
            function (module, complete) {
                if (typeof module.onNotify === 'function') {
                    module.onNotify(notify_types[notification.notification_type], notification, post, complete);
                } else {
                    complete();
                }
            }, function () {
                if (notification.topic_id && notification.topic_id > 0) {
                    var form = {
                        'topic_id': notification.topic_id,
                        'topic_time': 4242
                    };
                    form['timings[' + notification.post_number + ']'] = 4242;
                    browser.postMessage('topics/timings', form, callback);
                } else {
                    callback();
                }
            });
    }

    function process_notifications(notifications, callback) {
        async.eachSeries(notifications.filter(function (n) {
            return Date.parse(n.created_at) >= notify_time;
        }), function (notify, cb) {
            if (notify.data.original_post_id) {
                browser.getContent('/posts/' + notify.data.original_post_id + '.json', function (err, resp, post) {
                    if (err || resp.statusCode >= 300) {
                        console.error('Error loading post #' + notify.data.original_post_id);
                        post = undefined;
                    }
                    process_notification(notify, post, cb);
                });
            } else {
                process_notification(notify, undefined, cb);
            }
        }, callback);
    }

    function begin(modules) {
        sock_modules = modules;
        async.forever(function (next) {
            browser.getContent('/notifications', function (err, resp, notifications) {
                if (err || resp.statusCode >= 300 || !notifications || typeof notifications !== 'object' || typeof notifications.filter !== 'function') {
                    setTimeout(next, 0.2 * 1000);
                    return;
                }
                var next_notify = Date.parse(notifications[0].created_at) + 1;
                process_notifications(notifications, function () {
                    notify_time = next_notify;
                    setTimeout(next, 0.2 * 1000);
                });
            });
        }, function () {
            console.log('queue ending!');
            console.log(arguments);
        });
    }
    exports.begin = begin;





    /*
      { notification_type: 2,
        read: true,
        created_at: '2014-09-29T19:12:02.600-04:00',
        post_number: 18,
        topic_id: 3496,
        slug: '2-n-queries-for-those-interested',
        data:
         { topic_title: '2^n queries for those interested',
           original_post_id: 99296,
           original_username: 'Matches',
           display_username: 'Matches' } }
    */
}());