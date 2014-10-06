/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var m_browser,
        m_config;
    exports.name = "NotifyPrint 0.0.0";
    exports.onNotify = function (type, notification, post, callback) {
        if (m_browser && m_config) {
            console.log('Notification ' + type + ' from ' + notification.data.display_username + ' in "' + notification.data.topic_title + '"');
            if (post && post.raw){
                console.log('\t' + (post.raw || '').split('\n')[0]);
            }
        }
        callback();
    };
    exports.begin = function begin(browser, config) {
        m_browser = browser;
        m_config = config;
    };
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
    /*{
    "id": 100441,
    "name": "Accalia Elementia",
    "username": "accalia",
    "avatar_template": "/user_avatar/what.thedailywtf.com/accalia/{size}/7069.png",
    "uploaded_avatar_id": 7069,
    "created_at": "2014-10-01T08:54:45.019-04:00",
    "cooked": "<p>Attemtping to summon <a class=\"mention\" href=\"/users/sockbot\">@sockbot</a>. <a class=\"mention\" href=\"/users/sockbot\">@sockbot</a> are you there?</p>",
    "post_number": 1,
    "post_type": 1,
    "updated_at": "2014-10-01T08:54:45.019-04:00",
    "reply_count": 1,
    "reply_to_post_number": null,
    "quote_count": 0,
    "avg_time": 16,
    "incoming_link_count": 0,
    "reads": 64,
    "score": 18.6,
    "yours": true,
    "topic_slug": "sockbot-et-al-needs-lessons-in-ed-k-t",
    "topic_id": 3591,
    "display_username": "Accalia Elementia",
    "primary_group_name": null,
    "version": 5,
    "can_edit": false,
    "can_delete": false,
    "can_recover": false,
    "user_title": null,
    "raw": "Attemtping to summon @sockbot. @sockbot are you there?",
    "actions_summary": [{
        "id": 2,
        "count": 0,
        "hidden": false,
        "can_act": false
    }, {
        "id": 3,
        "count": 0,
        "hidden": false,
        "can_act": true,
        "can_defer_flags": false
    }, {
        "id": 4,
        "count": 0,
        "hidden": false,
        "can_act": true,
        "can_defer_flags": false
    }, {
        "id": 5,
        "count": 0,
        "hidden": true,
        "can_act": true,
        "can_defer_flags": false
    }, {
        "id": 6,
        "count": 0,
        "hidden": false,
        "can_act": false
    }, {
        "id": 7,
        "count": 0,
        "hidden": false,
        "can_act": true,
        "can_defer_flags": false
    }, {
        "id": 8,
        "count": 0,
        "hidden": false,
        "can_act": true,
        "can_defer_flags": false
    }],
    "moderator": false,
    "admin": false,
    "staff": false,
    "user_id": 671,
    "hidden": false,
    "hidden_reason_id": null,
    "trust_level": 2,
    "deleted_at": null,
    "user_deleted": false,
    "edit_reason": null,
    "can_view_edit_history": true,
    "wiki": false
}*/
}());