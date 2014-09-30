/*jslint node: true, indent: 4, unparam: true  */
(function () {
    'use strict';
    var async = require('async'),
        config = require('./configuration').configuration,
        notify_time = config.queuestart,
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

    function begin(browser) {
        async.forever(function (next) {
            browser.getContent('/notifications', function (a, b, c) {
                var next_notify = Date.parse(c[0].created_at) + 1;
                process_notifications(browser, c, function () {
                    notify_time = next_notify;
                    setTimeout(next, 5 * 1000);
                });
            });
        });
    }
    exports.begin = begin;

    function process_notifications(browser, notifications, callback) {
        async.eachSeries(notifications.filter(function (n) {
            return Date.parse(n.created_at) >= notify_time;
        }), function (notify, cb) {
            var handlers = config.behavior[notify_types[notify.notification_type]];
            if (!handlers) {
                cb();
            } else {
                async.eachSeries(handlers, function (h, cb2) {
                    if (!h.handle(notify)) {
                        cb2();
                        return;
                    }
                    h.action(browser, notify, cb2);
                }, cb);
            }
        }, callback);
    }



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