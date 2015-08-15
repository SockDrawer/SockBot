'use strict';
/*eslint-disable camelcase */
/**
 * Documentation for discourse JSON objects
 * @module external.users
 * @license MIT
 */

/**
 * User Badge Data
 *
 * @typedef {object}
 * @param {number} id Badge instance Id
 * @param {string} granted_at ISO formate badge grant datetime
 * @param {number} badge_id Badge type Id
 * @param {number} user_id User Id badge was granted to
 * @param {number} granted_by_id User Id that granted the badge
 */
exports.UserBadge = {};

/**
 * Badge Data
 *
 * @typedef {object}
 * @param {number} id Badge Id
 * @param {string} name Badge Name
 * @param {string} description Badge Description
 * @param {number} grant_count Number of times this badge has been awarded to all users
 * @param {boolean} allow_title Can badge be used as user title?
 * @param {boolean} multiple_grant Can badge be granted multiple times to one user?
 * @param {string} icon Badge Icon (FontAwesome character name?)
 * @param {string} image Badge Image (FontAwesome character name?)
 * @param {boolean} listable Unknown
 * @param {boolean} enabled Is badge enabled?
 * @param {number} badge_grouping_id Group the badge belongs to
 * @param {boolean} system Is this a builtin badge?
 * @param {number} badge_type_id Defines the type of the badge
 */
exports.Badge = {};

/**
 * Badge Types
 *
 * @typedef {object}
 * @param {number} id Badge Type Id
 * @param {string} name Badge Type Name
 * @param {number} sort_order Badge Type Sort Order
 */
exports.BadgeType = {};
