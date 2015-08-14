<a name="external.module_users"></a>
## users
Documentation for discourse JSON objects

**License**: MIT  

* [users](#external.module_users)
  * [.UserActionType](#external.module_users.UserActionType)
  * [.UserSummary](#external.module_users.UserSummary) : <code>object</code>
  * [.UserActionSummary](#external.module_users.UserActionSummary) : <code>object</code>
  * [.UserGroup](#external.module_users.UserGroup) : <code>object</code>
  * [.User](#external.module_users.User) : <code>object</code>
  * [.UserProfile](#external.module_users.UserProfile) : <code>object</code>

<a name="external.module_users.UserActionType"></a>
### users.UserActionType
Discourse User Action Type Enum

**Kind**: static enum property of <code>[users](#external.module_users)</code>  
**Read only**: true  
**Properties**

| Name | Default | Description |
| --- | --- | --- |
| like | <code>1</code> | User liked a post |
| was_liked | <code>2</code> | User's post was liked |
| bookmark | <code>3</code> | User bookmarked a post |
| new_topic | <code>4</code> | User started a topic |
| reply | <code>5</code> | User replied to a post |
| response | <code>6</code> | User's post was replied to |
| mention | <code>7</code> | User was mentioned |
| quote | <code>9</code> | User was quoted |
| edit | <code>11</code> | User edited a post |
| new_private_message | <code>12</code> | User sent a new private message |
| got_private_message | <code>13</code> | User received a new private message |
| pending | <code>14</code> | User's post was put onto approvals queue (anti-spam measure) |

<a name="external.module_users.UserSummary"></a>
### users.UserSummary : <code>object</code>
Discourse User Summary

**Kind**: static typedef of <code>[users](#external.module_users)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [id] | <code>number</code> | User id |
| username | <code>string</code> | Username of the summarized user |
| avatar_template | <code>string</code> | URL template for summarized users avatar |
| uploaded_avatar_id | <code>number</code> | ID of the summarized users avatar |

<a name="external.module_users.UserActionSummary"></a>
### users.UserActionSummary : <code>object</code>
User Action Summary

**Kind**: static typedef of <code>[users](#external.module_users)</code>  

| Param | Type | Description |
| --- | --- | --- |
| action_type | <code>external.posts.UserActionType</code> | UserActionType being summarized |
| count | <code>number</code> | Number of times user has performed action |
| id | <code>\*</code> | Unknown, appears to always be null |

<a name="external.module_users.UserGroup"></a>
### users.UserGroup : <code>object</code>
User Group

**Kind**: static typedef of <code>[users](#external.module_users)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | User Group Id |
| automatic | <code>boolean</code> | Is the group automatically applied? |
| name | <code>string</code> | Group Name |
| user_count | <code>number</code> | Number of users in group |
| alias_level | <code>\*</code> | Unknown |
| visible | <code>boolean</code> | Is group Visible? |
| automatic_membership_email_domains | <code>Array.&lt;string&gt;</code> | Email domains that automatically give membership |
| automatic_membership_retroactive | <code>boolean</code> | Does the automatic membership apply retroactively? |
| primary_group | <code>boolean</code> | Is this a primary group? |
| title | <code>\*</code> | Unsure. Group title? can be used as user title? |

<a name="external.module_users.User"></a>
### users.User : <code>object</code>
Discourse User

**Kind**: static typedef of <code>[users](#external.module_users)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | User Id |
| username | <code>string</code> | Username |
| uploaded_avatar_id | <code>number</code> | ID of the users avatar |
| avatar_template | <code>string</code> | URL template for users avatar |
| name | <code>string</code> | Users long name |
| [email] | <code>string</code> | User Email |
| last_posted_at | <code>string</code> | ISO formatted datetime of last post by user |
| last_seen_at | <code>string</code> | ISO formatted datetime of last user interaction |
| bio_raw | <code>string</code> | Uncooked user bio |
| bio_cooked | <code>string</code> | Cooked user bio |
| created_at | <code>string</code> | ISO formatted datetime of account creation |
| website | <code>string</code> | User website |
| profile_background | <code>string</code> | File path of profile background |
| card_background | <code>string</code> | File path of user background |
| can_edit | <code>boolean</code> | Can logged in user edit this user? |
| can_edit_username | <code>boolean</code> | Can logged in user edit this users username? |
| can_edit_email | <code>boolean</code> | Can logged in user edit this users email? |
| can_edit_name | <code>boolean</code> | Can logged in user edit this users name? |
| stats | <code>Array.&lt;UserActionSummary&gt;</code> | User post action summary |
| can_send_private_messages | <code>boolean</code> | Can this user send private messages? |
| can_send_private_message_to_user | <code>boolean</code> | Can the current user send a private message to this user? |
| bio_excerpt | <code>string</code> | Short exerpt from user bio |
| trust_level | <code>number</code> | This user's trust level |
| moderator | <code>boolean</code> | Is this user a moderator? |
| admin | <code>boolean</code> | Is this user an admin? |
| title | <code>string</code> | User's title |
| badge_count | <code>number</code> | Number of unique badge types this user has |
| notification_count | <code>number</code> | Number of notifications this user has |
| has_title_badges | <code>boolean</code> | Does user have badges that can be set as title? |
| edit_history_public | <code>boolean</code> | Does user have public edit history? |
| custom_fields | <code>object</code> | Unsure, needs explanation |
| (Object.<number,string>) |  | ´user_fields´ Custom site specific user fields |
| pending_count | <code>number</code> | Number of posts pending moderator approval? |
| locale | <code>string</code> | User set locale |
| email_digests | <code>boolean</code> | User receives email digests? |
| email_private_messages | <code>boolean</code> | User receives email notifications for private messages? |
| email_direct | <code>boolean</code> | Unsure. User can be emailded direct? |
| email_always | <code>boolean</code> | Does the user wish to be emailed regardless of activity? |
| digest_after_days | <code>number</code> | Frequency to sent email digest out after |
| mailing_list_mode | <code>boolean</code> | Unknown purpose. what is this field for? |
| auto_track_topics_after_msecs | <code>number</code> | Time user must spend reading topic before topic is tracked |
| new_topic_duration_minutes | <code>number</code> | Time topics are considered new for |
| external_links_in_new_tab | <code>boolean</code> | User opens external links in new tab? |
| dynamic_favicon | <code>boolean</code> | User uses the dynamic favicon? |
| enable_quoting | <code>boolean</code> | User has enabled quote reply on highlighted text? |
| muted_category_ids | <code>Array.&lt;number&gt;</code> | Ids of categories use auto-mutes topics in |
| tracked_category_ids | <code>Array.&lt;number&gt;</code> | Ids of categories user auto-tracks topics in |
| watched_category_ids | <code>Array.&lt;number&gt;</code> | Ids of categories user auto-watches topics in |
| private_messages_stats | <code>object</code> | Counts of private messages |
| private_messages_stats.all | <code>number</code> | Count of all private messages for user |
| private_messages_stats.mine | <code>number</code> | Count of all private messages created by user |
| private_messages_stats.unread | <code>number</code> | Count of unread private messages for user |
| disable_jump_reply | <code>boolean</code> | User has disabled jump to new post on reply. |
| gravatar_avatar_upload_id | <code>number</code> | Id of uploaded gravatar. Why is this a thing? |
| custom_avatar_uplaod_id | <code>number</code> | Id of uploaded custom avatar |
| muted_usernames | <code>Array.&lt;string&gt;</code> | List of username that user has vlocked from sending notifications |
| invited_by | <code>string</code> | User that invited this user to the forum |
| custom_groups | <code>Array.&lt;UserGroup&gt;</code> | Custom groups user belongs to |
| featured_user_badge_ids | <code>Array.&lt;number&gt;</code> | Badge Ids that are featured on the usercard |
| card_badge | <code>external.badges.Badge</code> | User selected badge to be displayed on user card |

<a name="external.module_users.UserProfile"></a>
### users.UserProfile : <code>object</code>
User Profile Data

**Kind**: static typedef of <code>[users](#external.module_users)</code>  

| Param | Type | Description |
| --- | --- | --- |
| user_badges | <code>Array.&lt;external.badges.UserBadge&gt;</code> | User Badge info for fatured badges |
| badges | <code>Array.&lt;external.badges.Badge&gt;</code> | Badge info for featured badges |
| badge_types | <code>Array.&lt;external.badges.BadgeType&gt;</code> | Badge type info for featured badges |
| users | <code>Array.&lt;UserSummary&gt;</code> | User summary information for referenced users |
| user | <code>User</code> | User Data |

