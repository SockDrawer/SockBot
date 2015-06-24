<a name="external.module_topics"></a>
## topics
Documentation for discourse JSON objects

**License**: MIT  

* [topics](#external.module_topics)
  * [.NotificationLevel](#external.module_topics.NotificationLevel)
  * [.NotificationReason](#external.module_topics.NotificationReason)
  * [.Archetype](#external.module_topics.Archetype)
  * [.Participant](#external.module_topics.Participant) ⇐ <code>external.users.UserSummary</code>
  * [.PostStream](#external.module_topics.PostStream) : <code>object</code>
  * [.TopicSummary](#external.module_topics.TopicSummary) : <code>object</code>
  * [.Link](#external.module_topics.Link) : <code>object</code>
  * [.TopicDetails](#external.module_topics.TopicDetails) : <code>object</code>
  * [.Topic](#external.module_topics.Topic) : <code>object</code>

<a name="external.module_topics.NotificationLevel"></a>
### topics.NotificationLevel
Discourse Topic Notification Levels

**Kind**: static enum property of <code>[topics](#external.module_topics)</code>  
**Read only**: true  
**Properties**

| Name | Default | Description |
| --- | --- | --- |
| muted | <code>0</code> | Topic is Muted, no notifications will be generated |
| regular | <code>1</code> | Topic has no special notification status |
| tracking | <code>2</code> | New posts/read position are tracked but new post notifications aren't generated |
| watching | <code>3</code> | New Posts trigger notifications |

<a name="external.module_topics.NotificationReason"></a>
### topics.NotificationReason
Discourse Topic Notification Reasons

**Kind**: static enum property of <code>[topics](#external.module_topics)</code>  
**Read only**: true  
**Properties**

| Name | Default | Description |
| --- | --- | --- |
| created_topic | <code>1</code> | User created the topic |
| user_changed | <code>2</code> | User set the notification type themselves |
| user_interacted | <code>3</code> | Notification status was set by user interaction |
| created_post | <code>4</code> | Notification status was set because user posted in topic |
| auto_watch | <code>5</code> | Notification was set because user has autowatch set |
| auto_watch_category | <code>6</code> | Notification was set because user has autowatch set for category |
| auto_mute_category | <code>7</code> | Notification was set because user has automute set for category |
| auto_track_category | <code>8</code> | Notification was set because user has autotrack set for category |
| plugin_changed | <code>9</code> | Notification was set by plugin |

<a name="external.module_topics.Archetype"></a>
### topics.Archetype
Discourse Archetype

**Kind**: static enum property of <code>[topics](#external.module_topics)</code>  
**Read only**: true  
**Properties**

| Name | Default | Description |
| --- | --- | --- |
| regular | <code>regular</code> | Regular Archetype |
| private_message | <code>private_message</code> | Private Message Archetype |

<a name="external.module_topics.Participant"></a>
### topics.Participant ⇐ <code>external.users.UserSummary</code>
Discourse Topic Participant

**Kind**: static property of <code>[topics](#external.module_topics)</code>  
**Extends:** <code>external.users.UserSummary</code>  

| Param | Type | Description |
| --- | --- | --- |
| post_count | <code>number</code> | Number of posts user has made in topic |

<a name="external.module_topics.PostStream"></a>
### topics.PostStream : <code>object</code>
Stream of posts

**Kind**: static typedef of <code>[topics](#external.module_topics)</code>  

| Param | Type | Description |
| --- | --- | --- |
| posts | <code>Array.&lt;external.posts.Post&gt;</code> | A single chunk of posts from thread |
| stream | <code>Array.&lt;number&gt;</code> | Post Ids for all posts in thread |

<a name="external.module_topics.TopicSummary"></a>
### topics.TopicSummary : <code>object</code>
Discourse Topic Summary

**Kind**: static typedef of <code>[topics](#external.module_topics)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | Topic Id. |
| title | <code>string</code> | Topic Title |
| fancy_title | <code>string</code> | HTML encoded title |
| slug | <code>string</code> | URL safe slug of topic title |
| posts_count | <code>number</code> | Count of posts in topic |
| reply_count | <code>number</code> | Count of replies to Topic OP |
| highest_post_number | <code>number</code> | Post Number of the most recent post |
| image_url | <code>string</code> &#124; <code>null</code> | Unsure, appears to always be null |
| created_at | <code>string</code> | ISO formatted creation datetime |
| last_posted_at | <code>string</code> | ISO formatted datetime of latest post |
| bumped | <code>boolean</code> | Topic has been bumped (what does this mean?) |
| bumped_at | <code>string</code> | ISO formatted datetime of last bump |
| unseen | <code>boolean</code> | Has topic been seen by current user? |
| last_read_post_number | <code>number</code> | Post Number of last read post by current user |
| unread | <code>number</code> | Number of posts that have not been read that were created before last visit to topic |
| new_posts | <code>number</code> | Number of posts created since last visit to topic |
| pinned | <code>boolean</code> | Is topic pinned? |
| unpinned | <code>\*</code> | Unknown, appears to always be null |
| visible | <code>boolean</code> | Is topic visible? |
| closed | <code>boolean</code> | Is topic closed? |
| archived | <code>boolean</code> | Is topic archived? |
| bookmarked | <code>boolean</code> | Are there any bookmarks in the topic? |
| liked | <code>boolean</code> | Has topic been liked by current user? |
| like_count | <code>number</code> | Count of likes in the topic |
| views | <code>number</code> | Count of topic views |
| category_id | <code>number</code> | Id of the category the post belongs to |
| notification_level | <code>NotificationLevel</code> | Topic notification level |
| archetype | <code>Archetype</code> | Topic Archetype |

<a name="external.module_topics.Link"></a>
### topics.Link : <code>object</code>
Discourse Topic Link

**Kind**: static typedef of <code>[topics](#external.module_topics)</code>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Url of the link |
| title | <code>string</code> | Title of the link (may be scraped from the linked page) |
| fancy_title | <code>string</code> | HTML safe title |
| internal | <code>boolean</code> | Is link internal to this discourse instance? |
| attachment | <code>boolean</code> | Is this link an attachment? |
| reflection | <code>boolean</code> | Unsure, seems to be always false |
| clicks | <code>number</code> | Number of times link has been visited |
| user_id | <code>number</code> | Use Id of the posting user |
| domain | <code>string</code> | Domain of the link |

<a name="external.module_topics.TopicDetails"></a>
### topics.TopicDetails : <code>object</code>
Discourse Topic Details

**Kind**: static typedef of <code>[topics](#external.module_topics)</code>  

| Param | Type | Description |
| --- | --- | --- |
| auto_close_at | <code>string</code> &#124; <code>null</code> | ISO formatted time that topic will autoclose at |
| auto_close_hours | <code>\*</code> | Unsure, seems to always be null |
| auto_close_based_on_last_post | <code>boolean</code> | Unsure, seems to always be false |
| created_by | <code>external.users.UserSummary</code> | User that created topic |
| last_poster | <code>external.users.UserSummary</code> | User that created last post |
| participants | <code>Array.&lt;Participant&gt;</code> | Topic Top Participants |
| suggested_topics | <code>Array.&lt;TopicSummary&gt;</code> | Suggested topics for this topic |
| links | <code>Array.&lt;Link&gt;</code> | Links posted within the topic |
| notification_level | <code>NotificationLevel</code> | Topic notification level |
| notification_reason_id | <code>NotificationReason</code> | Reason for value of   notification_level` |
| can_edit | <code>boolean</code> | Can current user edit topic title? |
| can_invite_to | <code>boolean</code> | Can current user issue invitations to topic? |
| can_create_post | <code>boolean</code> | Can current user reply to topic? |
| can_reply_as_new_topic | <code>boolean</code> | Can current user reply as new topic? |
| can_flag_topic | <code>boolean</code> | Can current user issue flags against topic? |

<a name="external.module_topics.Topic"></a>
### topics.Topic : <code>object</code>
Discourse Topic

Available at `/t/slug/<topic id>/<post number>.json`

**Kind**: static typedef of <code>[topics](#external.module_topics)</code>  

| Param | Type | Description |
| --- | --- | --- |
| post_stream | <code>PostStream</code> | Stream of posts that were loaded for this request |
| id | <code>number</code> | Topic Id. |
| title | <code>string</code> | Topic Title |
| fancy_title | <code>string</code> | HTML encoded title |
| posts_count | <code>number</code> | Count of posts in topic |
| created_at | <code>string</code> | ISO formatted creation datetime |
| views | <code>number</code> | Count of topic views |
| reply_count | <code>number</code> | Count of replies to Topic OP |
| participant_count | <code>number</code> | Count of unique users that participate in this topic |
| has_summary | <code>boolean</code> | Does the topic have a summary? |
| word_count | <code>number</code> | Unsure, Word count of what? |
| deleted_at | <code>strung</code> &#124; <code>null</code> | ISO formatted datetime the topic was deleted |
| pending_posts_count | <code>number</code> | Unsure, seems to always be zero |
| user_id | <code>number</code> | User Id of the Topic Owner |
| draft | <code>string</code> &#124; <code>null</code> | Raw of in progress draft |
| draft_key | <code>string</code> | Key to use when composing draft |
| draft_sequence | <code>number</code> | Unsure, seems to be ordinal for number of drafts in topic |
| posted | <code>boolean</code> | Unsure, seems to always be true |
| unpinned | <code>\*</code> | Unknown, appears to always be null |
| pinned_globally | <code>boolean</code> | Has topic been pinned globally? |
| pinned | <code>boolean</code> | Is topic pinned? |
| pinned_at | <code>string</code> &#124; <code>null</code> | ISO formatted datetime topic was pinned |
| details | <code>TopicDetails</code> | Details about this topic |
| deleted_by | <code>string</code> &#124; <code>null</code> | Username of the deleting user |
| actions_summary | <code>Array.&lt;external.posts.ActionSummary&gt;</code> | Summary of actions on Topic |
| chunk_size | <code>number</code> | Number of posts that belon in each chunk of postsx |

