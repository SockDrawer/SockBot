<a name="external.module_messageBus"></a>
## messageBus
Documentation for message-bus JSON objects

**License**: MIT  

* [messageBus](#external.module_messageBus)
  * [~message](#external.module_messageBus..message) : <code>object</code>
  * [~postMessage](#external.module_messageBus..postMessage) : <code>object</code>
  * [~topicMessage](#external.module_messageBus..topicMessage) : <code>object</code>
  * [~topicTrackingState](#external.module_messageBus..topicTrackingState) : <code>object</code>
  * [~notificationsMessage](#external.module_messageBus..notificationsMessage) : <code>object</code>

<a name="external.module_messageBus..message"></a>
### messageBus~message : <code>object</code>
Message-bus message

**Kind**: inner typedef of <code>[messageBus](#external.module_messageBus)</code>  

| Param | Type | Description |
| --- | --- | --- |
| global_id | <code>number</code> | Global Message Id |
| message_id | <code>number</code> | Message id. This is clearly different than global_id, but why? is there significance? |
| channel | <code>string</code> | Channel message relates to |
| data | <code>object</code> | Message data |

<a name="external.module_messageBus..postMessage"></a>
### messageBus~postMessage : <code>object</code>
Message relating to a post

**Kind**: inner typedef of <code>[messageBus](#external.module_messageBus)</code>  

| Param | Type | Description |
| --- | --- | --- |
| (number) |  | id Post id of post message relates to |
| post_number | <code>number</code> | Sequence in the topic of the post |
| updated_at | <code>string</code> | ISO formatted date time of the post action |
| type | <code>string</code> | Message Type |

<a name="external.module_messageBus..topicMessage"></a>
### messageBus~topicMessage : <code>object</code>
Message relating to a topic

**Kind**: inner typedef of <code>[messageBus](#external.module_messageBus)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topic_id | <code>number</code> | Id of topic |
| message_type | <code>string</code> | Message Type |
| payload | <code>topicTrackingState</code> | Topic Information |

<a name="external.module_messageBus..topicTrackingState"></a>
### messageBus~topicTrackingState : <code>object</code>
Topic Tracking State

**Kind**: inner typedef of <code>[messageBus](#external.module_messageBus)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topic_id | <code>number</code> | Topic Id |
| highest_post_number | <code>number</code> | Highest Post Number that's been read in topic |
| last_read_post_number | <code>number</code> | Last read Post Number in topic |
| created_at | <code>string</code> | ISO formatted datetime of topic creation |
| category_id | <code>number</code> | Category ID of the topic |
| notification_level | <code>external.topics.NotificationLevel</code> | Notification level of the topic |

<a name="external.module_messageBus..notificationsMessage"></a>
### messageBus~notificationsMessage : <code>object</code>
Message relating to notifications

**Kind**: inner typedef of <code>[messageBus](#external.module_messageBus)</code>  

| Param | Type | Description |
| --- | --- | --- |
| unread_notifications | <code>number</code> | Number of unread notifications |
| unread_private_messages | <code>number</code> | Number of unread Message notifcations |

