'use strict';
/*eslint-disable camelcase */
/**
 * Documentation for discourse JSON objects
 * @module external.users
 * @license MIT
 */

/**
 * Discourse User Summary
 *
 * @typedef {object}
 * @param {number} [id] user id
 * @param {string} username username of the summarized user
 * @param {string} avatar_template URL template for summarized user's avatar
 * @param {number} uploaded_avatar_id ID of the summarized user's avatar
 */
exports.UserSummary = {};

/**
 * Discourse User Action Type Enum
 *
 * @readonly
 * @enum
 */
exports.UserActionType = {
    /** User liked a post */
    'like': 1,
    /** User's post was liked */
    'was_liked': 2,
    /** User bookmarked a post */
    'bookmark': 3,
    /** User started a topic */
    'new_topic': 4,
    /** User replied to a post */
    'reply': 5,
    /** User's post was replied to */
    'response': 6,
    /** User was mentioned */
    'mention': 7,
    /** User was quoted */
    'quote': 9,
    /** User edited a post */
    'edit': 11,
    /** User sent a new private message */
    'new_private_message': 12,
    /** User received a new private message */
    'got_private_message': 13,
    /** User queued a post */
    'pending': 14
};

/**
 * User Action Summary
 *
 * @typedef {object}
 * @param {external.posts.UserActionType} action_type UserActionType being summarized
 * @param {number} count Number of times user has performed action
 * @param {*} id Unknown, appears to always be null
 */
exports.UserActionSummary = {};

/**
 * User Group
 *
 * @typedef {object}
 * @param {number} id User Group Id
 * @param {boolean} automatic Is the group automatically applied?
 * @param {string} name Group Name
 * @param {number} user_count Number of users in group
 * @param {*} alias_level Unknown
 * @param {boolean} visible Is group Visible?
 * @param {string[]} automatic_membership_email_domains email domains that automatically give membership
 * @param {boolean} automatic_membership_retroactive Does the automatic membership apply retroactively?
 * @param {boolean} primary_group Is this a primary group?
 * @param {*} title Unsure. Group title? can be used as user title?
 */
exports.UserGroup = {};


/**
 * Discourse User
 *
 * @typedef {object}
 * @param {number} id User Id
 * @param {string} username Username
 * @param {number} uploaded_avatar_id ID of the user's avatar
 * @param {string} avatar_template URL template for user's avatar
 * @param {string} name User's long name
 * @param {string} [email] User Email
 * @param {string} last_posted_at ISO formatted datetime of last post by user
 * @param {string} last_seen_at ISO formatted datetime of last user interaction
 * @param {string} bio_raw Uncooked user bio
 * @param {string} bio_cooked Cooked user bio
 * @param {string} created_at ISO formatted datetime of account creation
 * @param {string} website User website
 * @param {string} profile_background File path of profile background
 * @param {string} card_background File path of user background
 * @param {boolean} can_edit Can logged in user edit this user?
 * @param {boolean} can_edit_username Can logged in user edit this users username?
 * @param {boolean} can_edit_email Can logged in user edit this users email?
 * @param {boolean} can_edit_name Can logged in user edit this users name?
 * @param {UserActionSummary[]} stats User post action summary
 * @param {boolean} can_send_private_messages Can this user send private messages?
 * @param {boolean} can_send_private_message_to_user Can the current user send a private message to this user?
 * @param {string} bio_excerpt Short exertp from user bio
 * @param {number} trust_level This user's trust level
 * @param {boolean} moderator Is this user a moderator?
 * @param {boolean} admin Is this user an admin?
 * @param {string} title User's title
 * @param {number} badge_count Number of unique badge types this user has
 * @param {number} notification_count NUmber of notifications this user has
 * @param {boolean} has_title_badges Does user have badges that can be set as title?
 * @param {boolean} edit_history_public Does user have public edit history?
 * @param {object} custom_fields Unsure, needs explanation
 * @param (Object.<number,string>) user_fields Custom site specific user fields
 * @param {number} pending_count Number of posts pending moderator approval?
 * @param {string} locale User set locale
 * @param {boolean} email_digests User receives email digests?
 * @param {boolean} email_private_messages User receives email notifications for private messages?
 * @param {boolean} email_direct Unsure. User can be emailded direct?
 * @param {boolean} email_always Does the user wish to be emailed regardless of activity?
 * @param {number} digest_after_days Frequency to sent email digest out after
 * @param {boolean} mailing_list_mode Unknown purpose. what is this field for?
 * @param {number} auto_track_topics_after_msecs Time use must spend reading topic before topic is tracked
 * @param {number} new_topic_duration_minutes Time topics are considered new for
 * @param {boolean} external_links_in_new_tab User opens external links in new tab?
 * @param {boolean} dynamic_favicon User uses the dynamic favicon?
 * @param {boolean} enable_quoting User has enabled quote reply on highlighted text?
 * @param {number[]} muted_category_ids Ids of categories use auto-mutes topics in
 * @param {number[]} tracked_category_ids Ids of categories user auto-tracks topics in
 * @param {number[]} watched_category_ids Ids of categories user auto-watches topics in
 * @param {object} private_messages_stats Counts of private messages
 * @param {number} private_messages_stats.all Count of all private messages for user
 * @param {number} private_messages_stats.mine Count of all private messages created by user
 * @param {number} private_messages_stats.unread Count of unread private messages for user
 * @param {boolean} disable_jump_reply User has disabled jump to new post on reply.
 * @param {number} gravatar_avatar_upload_id Id of uploaded gravatar. Why is this a thing?
 * @param {number} custom_avatar_uplaod_id Id of uploaded custom avatar
 * @param {string[]} muted_usernames List of username that user has vlocked from sending notifications
 * @param {string} invited_by User that invited this user to the forum
 * @param {UserGroup[]} custom_groups Custom groups user belongs to
 * @param {number[]} featured_user_badge_ids Badge Ids that are featured on the usercard
 * @param {external.badges.Badge} card_badge User selected badge to be displayed on user card
 */
exports.User = {};

/**
 * User Profile Data
 *
 * @typedef {object}
 * @param {external.badges.UserBadge[]} user_badges User Badge info for fatured badges
 * @param {external.badges.Badge[]} badges Badge info for featured badges
 * @param {external.badges.BadgeType[]} badge_types Badge type info for featured badges
 * @param {UserSummary[]} users User summary information for referenced users
 * @param {User} user User Data
 */
exports.UserProfile = {};
