'use strict';
/**
 * Documentation for discourse JSON objects
 * @module external.posts
 * @license MIT
 */

/**
 * Discourse Post Type Enum
 * 
 * @readonly
 * @enum
 */
exports.PostType = {
    /** Represents a regular forum post */
    'regular': 1,
    /** Represents a post that is the result of a moderator action */
    'moderator_action': 2
};

/**
 * Discourse Post Action Type Enum
 * 
 * @readonly
 * @enum
 */
exports.PostActionType = {
    /** Bookmark Action */
    'bookmark': 1,
    /** Like Action */
    'like': 2,
    /** Flag Post as Off Topic */
    'off_topic': 3,
    /** Flag Post as Inappropriate */
    'inappropriate': 4,
    /** Vote in a poll */
    'vote': 5,
    /** Send the post owner a message */
    'notify_user': 6,
    /** Flag for moderator attention with custom message */
    'notify_moderators': 7,
    /** Flag post as Spam */
    'spam': 8
};

/**
 * Discourse User Summary
 * 
 * @typedef {object}
 * @param {string} username username of the summarized user
 * @param {string} avatar_template URL template for summarized user's avatar
 * @param {number} uploaded_avatar_id ID of the summarized user's avatar
 */
exports.UserSummary = {};

/**
 * Discourse Post Action Summary
 * 
 * @typedef {object}
 * @param {PostActionType} id ActionSummary Id
 * @param {number} count Number of applied actions
 * @param {boolean} hidden Is this action type hidden?
 * @param {boolean} can_act Can currently logged in user perform this action?
 * @param {boolean} [can_defer_flags] Can the currently logged in user defer these flags?
 */
exports.ActionSummary = {};

/**
 * Discourse Post Object
 * 
 * Can be retrieved directly at `/posts/<postid>.json`
 * 
 * @typedef {object}
 * @param {number} id Post Id of the post. this number will not change 
 * @param {string} name Long name of the post owner
 * @param {string} user_name Username of the post owner
 * @param {string} avatar_template URL template for post owner's avatar
 * @param {number} uploaded_avatar_id ID of the post owner's avatar
 * @param {string} created_at ISO formatted post creation time
 * @param {string} cooked HTMLified version of `raw` suitable for placing in a web page
 * @param {number} post_number Ordinal of the post in topic. Can change.
 * @param {PostType} post_type Type of the post
 * @param {string} updated_at ISO formatted post last updates time
 * @param {number} like_count Count of likes the post has
 * @param {number} reply_count Count of direct replies to this post
 * @param {number} reply_to_post_number The post_number this post is a reply to
 * @param {number} quote_count Count of posts containing quotes from this post
 * @param {number|null} avg_time Unclear, Believe this is the average read time for this post
 * @param {number} incoming_link_count Count of incoming links to this post
 * @param {number} reads Count of the number of users that have read this post
 * @param {number} score Unclear, Believe this is used to determine if post is to be included in topic summary
 * @param {boolean} yours Flag whether this post is owned by the logged in user
 * @param {number} topic_id Topic Id that the post belongs to
 * @param {string} topic_slug URL slug of the topic
 * @param {string|null} display_username Display name of the post owner
 * @param {string|null} primary_group_name Primary Group for the post owner
 * @param {number} version Revision version of the post. Does not count ninja edits.
 * @param {boolean} can_edit Flag whether this post can be edited by the logged in user
 * @param {boolean} can_delete Flag whether this post can be deleted by the logged in user
 * @param {boolean} can_recover Flag whether this post can be undeleted by the logged in user
 * @param {string|null} user_title User title of the post owner
 * @param {string} raw Raw text of the post before being processed into `cooked`
 * @param {boolean} moderator Flags whether post owner has moderator powers
 * @param {boolean} admin Flags whether post owner has admin powers
 * @param {boolean} staff Flags whether post owner has staff powers
 * @param {number} user_id Discourse user id of the post owner
 * @param {boolean} hidden Flag whether the post is hiden
 * @param {number|null} hidden_reason_id Reason the post is hidden
 * @param {number} trust_level Trust level of the post owner
 * @param {string|null} deleted_at Time post was deleted at in ISO format
 * @param {boolean} user_deleted Unclear, Believe flags the deletion status of the post user
 * @param {string|null} edit_reason Reason for most recent post edit
 * @param {boolean} can_view_edit_history Can the logged in user view post edit history of this post?
 * @param {boolean} wiki Is this post a wiki post?
 * @param {UserSummary|null} reply_to_user User that the post is in reply to
 * @param {ActionSummary[]} actions_summary Actions summaries for this post
 */
exports.Post = {};

/**
 * Cleaned Discourse Post
 * 
 * @augments {external.module_posts.Post}
 * @typedef {object}
 * @param {string} cleaned The value of `raw` after being processed to remove code and quotes
 */
exports.CleanedPost = {};