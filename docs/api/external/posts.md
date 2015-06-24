<a name="external.module_posts"></a>
## posts
Documentation for discourse JSON objects

**License**: MIT  

* [posts](#external.module_posts)
  * [.PostType](#external.module_posts.PostType)
  * [.UserSummary](#external.module_posts.UserSummary) : <code>object</code>
  * [.ActionSummary](#external.module_posts.ActionSummary) : <code>object</code>
  * [.Post](#external.module_posts.Post) : <code>object</code>
  * [.CleanedPost](#external.module_posts.CleanedPost) : <code>object</code>

<a name="external.module_posts.PostType"></a>
### posts.PostType
Discourse Post Type Enum

**Kind**: static enum property of <code>[posts](#external.module_posts)</code>  
**Read only**: true  
**Properties**

| Name | Default | Description |
| --- | --- | --- |
| regular | <code>1</code> | Represents a regular forum post |
| moderator_action | <code>2</code> | Represents a post that is the result of a moderator action |

<a name="external.module_posts.UserSummary"></a>
### posts.UserSummary : <code>object</code>
Discourse User Summary

**Kind**: static typedef of <code>[posts](#external.module_posts)</code>  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | username of the summarized user |
| avatar_template | <code>string</code> | URL template for summarized user's avatar |
| uploaded_avatar_id | <code>number</code> | ID of the summarized user's avatar |

<a name="external.module_posts.ActionSummary"></a>
### posts.ActionSummary : <code>object</code>
Discourse Post Action Summary

**Kind**: static typedef of <code>[posts](#external.module_posts)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | ActionSummary Id |
| count | <code>number</code> | Number of applied actions |
| hidden | <code>boolean</code> | Is this action type hidden? |
| can_act | <code>boolean</code> | Can currently logged in user perform this action? |
| [can_defer_flags] | <code>boolean</code> | Can the currently logged in user defer these flags? |

<a name="external.module_posts.Post"></a>
### posts.Post : <code>object</code>
Discourse Post Object

Can be retrieved directly at `/posts/<postid>.json`

**Kind**: static typedef of <code>[posts](#external.module_posts)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | Post Id of the post. this number will not change |
| name | <code>string</code> | Long name of the post owner |
| user_name | <code>string</code> | Username of the post owner |
| avatar_template | <code>string</code> | URL template for post owner's avatar |
| uploaded_avatar_id | <code>number</code> | ID of the post owner's avatar |
| created_at | <code>string</code> | ISO formatted post creation time |
| cooked | <code>string</code> | HTMLified version of `raw` suitable for placing in a web page |
| post_number | <code>number</code> | Ordinal of the post in topic. Can change. |
| post_type | <code>PostType</code> | Type of the post |
| updated_at | <code>string</code> | ISO formatted post last updates time |
| like_count | <code>number</code> | Count of likes the post has |
| reply_count | <code>number</code> | Count of direct replies to this post |
| reply_to_post_number | <code>number</code> | The post_number this post is a reply to |
| quote_count | <code>number</code> | Count of posts containing quotes from this post |
| avg_time | <code>number</code> &#124; <code>null</code> | Unclear, Believe this is the average read time for this post |
| incoming_link_count | <code>number</code> | Count of incoming links to this post |
| reads | <code>number</code> | Count of the number of users that have read this post |
| score | <code>number</code> | Unclear, Believe this is used to determine if post is to be included in topic summary |
| yours | <code>boolean</code> | Flag whether this post is owned by the logged in user |
| topic_id | <code>number</code> | Topic Id that the post belongs to |
| topic_slug | <code>string</code> | URL slug of the topic |
| display_username | <code>string</code> &#124; <code>null</code> | Display name of the post owner |
| primary_group_name | <code>string</code> &#124; <code>null</code> | Primary Group for the post owner |
| version | <code>number</code> | Revision version of the post. Does not count ninja edits. |
| can_edit | <code>boolean</code> | Flag whether this post can be edited by the logged in user |
| can_delete | <code>boolean</code> | Flag whether this post can be deleted by the logged in user |
| can_recover | <code>boolean</code> | Flag whether this post can be undeleted by the logged in user |
| user_title | <code>string</code> &#124; <code>null</code> | User title of the post owner |
| raw | <code>string</code> | Raw text of the post before being processed into `cooked` |
| moderator | <code>boolean</code> | Flags whether post owner has moderator powers |
| admin | <code>boolean</code> | Flags whether post owner has admin powers |
| staff | <code>boolean</code> | Flags whether post owner has staff powers |
| user_id | <code>number</code> | Discourse user id of the post owner |
| hidden | <code>boolean</code> | Flag whether the post is hiden |
| hidden_reason_id | <code>number</code> &#124; <code>null</code> | Reason the post is hidden |
| trust_level | <code>number</code> | Trust level of the post owner |
| deleted_at | <code>string</code> &#124; <code>null</code> | Time post was deleted at in ISO format |
| user_deleted | <code>boolean</code> | Unclear, Believe flags the deletion status of the post user |
| edit_reason | <code>string</code> &#124; <code>null</code> | Reason for most recent post edit |
| can_view_edit_history | <code>boolean</code> | Can the logged in user view post edit history of this post? |
| wiki | <code>boolean</code> | Is this post a wiki post? |
| reply_to_user | <code>UserSummary</code> &#124; <code>null</code> | User that the post is in reply to |
| actions_summary | <code>Array.&lt;ActionSummary&gt;</code> | Actions summaries for this post |

<a name="external.module_posts.CleanedPost"></a>
### posts.CleanedPost : <code>object</code>
Cleaned Discourse Post

**Kind**: static typedef of <code>[posts](#external.module_posts)</code>  
**Extends:** <code>external.module_posts.Post</code>  

| Param | Type | Description |
| --- | --- | --- |
| cleaned | <code>string</code> | The value of `raw` after being processed to remove code and quotes |

