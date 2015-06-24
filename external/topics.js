'use strict';
/**
 * Documentation for discourse JSON objects
 * @module external.topics
 * @license MIT
 */

/**
 * Discourse Topic Notification Levels
 * 
 * @readonly
 * @enum
 */
exports.NotificationLevel = {
    /** Topic is Muted, no notifications will be generated*/
    muted: 0,
    /** Topic has no special notification status */
    regular: 1,
    /** New posts/read position are tracked but new post notifications aren't generated */
    tracking: 2,
    /** New Posts trigger notifications */
    watching: 3
};

/**
 * Discourse Topic Notification Reasons
 * 
 * @readonly
 * @enum
 */
exports.NotificationReason = {
    /** User created the topic */
    created_topic: 1,
    /** User set the notification type themselves */
    user_changed: 2,
    /** Notification status was set by user interaction */
    user_interacted: 3,
    /** Notification status was set because user posted in topic */
    created_post: 4,
    /** Notification was set because user has autowatch set */
    auto_watch: 5,
    /** Notification was set because user has autowatch set for category */
    auto_watch_category: 6,
    /** Notification was set because user has automute set for category */
    auto_mute_category: 7,
    /** Notification was set because user has autotrack set for category */
    auto_track_category: 8,
    /** Notification was set by plugin */
    plugin_changed: 9
};

/**
 * Discourse Archetype
 * 
 * @readonly
 * @enum
 */
exports.Archetype = {
    /** Regular Archetype */
    regular: 'regular',
    /** Private Message Archetype */
    private_message: 'private_message'
};

/**
 * Stream of posts
 * 
 * @typedef {object}
 * @param {external.posts.Post[]} posts A single chunk of posts from thread
 * @param {number[]} stream Post Ids for all posts in thread
 */
exports.PostStream = {};

/**
 * Discourse Topic Summary
 * 
 * @typedef {object}
 * @param {number} id Topic Id.
 * @param {string} title Topic Title
 * @param {string} fancy_title HTML encoded title
 * @param {string} slug URL safe slug of topic title
 * @param {number} posts_count Count of posts in topic
 * @param {number} reply_count Count of replies to Topic OP
 * @param {number} highest_post_number Post Number of the most recent post
 * @param {string|null} image_url Unsure, appears to always be null
 * @param {string} created_at ISO formatted creation datetime
 * @param {string} last_posted_at ISO formatted datetime of latest post
 * @param {boolean} bumped Topic has been bumped (what does this mean?)
 * @param {string} bumped_at ISO formatted datetime of last bump
 * @param {boolean} unseen Has topic been seen by current user?
 * @param {number} last_read_post_number Post Number of last read post by current user
 * @param {number} unread Number of posts that have not been read that were created before last visit to topic
 * @param {number} new_posts Number of posts created since last visit to topic
 * @param {boolean} pinned Is topic pinned?
 * @param {*} unpinned Unknown, appears to always be null
 * @param {boolean} visible Is topic visible?
 * @param {boolean} closed Is topic closed?
 * @param {boolean} archived Is topic archived?
 * @param {boolean} bookmarked Are there any bookmarks in the topic?
 * @param {boolean} liked Has topic been liked by current user?
 * @param {number} like_count Count of likes in the topic
 * @param {number} views Count of topic views
 * @param {number} category_id Id of the category the post belongs to 
 * @param {NotificationLevel} notification_level Topic notification level
 * @param {Archetype} archetype Topic Archetype
 */
exports.TopicSummary = {};

/**
 * Discourse Topic Participant
 * 
 * @augments {external.users.UserSummary}
 * @param {number} post_count Number of posts user has made in topic
 */
exports.Participant = {};

/**
 * Discourse Topic Link
 * 
 * @typedef {object}
 * @param {string} url Url of the link
 * @param {string} title Title of the link (may be scraped from the linked page)
 * @param {string} fancy_title HTML safe title
 * @param {boolean} internal Is link internal to this discourse instance?
 * @param {boolean} attachment Is this link an attachment?
 * @param {boolean} reflection Unsure, seems to be always false
 * @param {number} clicks Number of times link has been visited
 * @param {number} user_id Use Id of the posting user
 * @param {string} domain Domain of the link
 */
exports.Link = {};

/**
 * Discourse Topic Details
 * 
 * @typedef {object}
 * @param {string|null} auto_close_at ISO formatted time that topic will autoclose at
 * @param {*} auto_close_hours Unsure, seems to always be null
 * @param {boolean} auto_close_based_on_last_post Unsure, seems to always be false
 * @param {external.users.UserSummary} created_by User that created topic
 * @param {external.users.UserSummary} last_poster User that created last post
 * @param {Participant[]} participants Topic Top Participants
 * @param {TopicSummary[]} suggested_topics Suggested topics for this topic
 * @param {Link[]} links Links posted within the topic
 * @param {NotificationLevel} notification_level Topic notification level
 * @param {NotificationReason} notification_reason_id Reason for value of   notification_level`
 * @param {boolean} can_edit Can current user edit topic title?
 * @param {boolean} can_invite_to Can current user issue invitations to topic?
 * @param {boolean} can_create_post Can current user reply to topic?
 * @param {boolean} can_reply_as_new_topic Can current user reply as new topic?
 * @param {boolean} can_flag_topic Can current user issue flags against topic?
 */
exports.TopicDetails = {};

/**
 * Discourse Topic
 * 
 * Available at `/t/slug/<topic id>/<post number>.json`
 * 
 * @typedef {object}
 * @param {PostStream} post_stream Stream of posts that were loaded for this request
 * @param {number} id Topic Id.
 * @param {string} title Topic Title
 * @param {string} fancy_title HTML encoded title
 * @param {number} posts_count Count of posts in topic
 * @param {string} created_at ISO formatted creation datetime
 * @param {number} views Count of topic views
 * @param {number} reply_count Count of replies to Topic OP
 * @param {number} participant_count Count of unique users that participate in this topic
 * @param {boolean} has_summary Does the topic have a summary?
 * @param {number} word_count Unsure, Word count of what?
 * @param {strung|null} deleted_at ISO formatted datetime the topic was deleted
 * @param {number} pending_posts_count Unsure, seems to always be zero
 * @param {number} user_id User Id of the Topic Owner
 * @param {string|null} draft Raw of in progress draft
 * @param {string} draft_key Key to use when composing draft
 * @param {number} draft_sequence Unsure, seems to be ordinal for number of drafts in topic
 * @param {boolean} posted Unsure, seems to always be true
 * @param {*} unpinned Unknown, appears to always be null
 * @param {boolean} pinned_globally Has topic been pinned globally?
 * @param {boolean} pinned Is topic pinned?
 * @param {string|null} pinned_at ISO formatted datetime topic was pinned
 * @param {TopicDetails} details Details about this topic
 * @param {string|null} deleted_by Username of the deleting user
 * @param {external.posts.ActionSummary[]} actions_summary Summary of actions on Topic
 * @param {number} chunk_size Number of posts that belon in each chunk of postsx
 */
exports.Topic = {};