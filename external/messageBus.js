'use strict';
/*eslint-disable camelcase */
/**
 * Documentation for message-bus JSON objects
 * @module external.messageBus
 * @license MIT
 */

/**
 * Message-bus message
 * 
 * @typedef {object}
 * @name message
 * @param {number} global_id Global Message Id
 * @param {number} message_id Message id. This is clearly different than global_id, but why? is there significance?
 * @param {string} channel Channel message relates to
 * @param {object} data Message data
 */

/**
 * Message relating to a post
 * 
 * @typedef {object}
 * @name postMessage
 * @param (number) id Post id of post message relates to
 * @param {number} post_number Sequence in the topic of the post
 * @param {string} updated_at ISO formatted date time of the post action
 * @param {string} type Message Type
 */

/**
 * Message relating to a topic
 * 
 * @typedef {object}
 * @name topicMessage
 * @param {number} topic_id Id of topic
 * @param {string} message_type Message Type
 * @param {topicTrackingState} payload Topic Information
 */
 
 /**
  * Topic Tracking State
  * 
  * @typedef {object}
  * @name topicTrackingState
  * @param {number} topic_id Topic Id
  * @param {number} highest_post_number Highest Post Number that's been read in topic
  * @param {number} last_read_post_number Last read Post Number in topic
  * @param {string} created_at ISO formatted datetime of topic creation
  * @param {number} category_id Category ID of the topic
  * @param {external.topics.NotificationLevel} notification_level Notification level of the topic
  */
  