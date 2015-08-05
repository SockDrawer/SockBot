<a name="module_browser"></a>
## browser
Webbrowser abstraction for communicating with discourse

**License**: MIT  

* [browser](#module_browser)
  * [~trustLevels](#module_browser..trustLevels)
  * [~postActions](#module_browser..postActions)
  * [~queueWorker(task, callback)](#module_browser..queueWorker)
  * [~createPost(topicId, [replyTo], content, callback)](#module_browser..createPost)
  * [~createPrivateMessage(to, title, content, callback)](#module_browser..createPrivateMessage)
  * [~editPost(postId, content, [editReason], callback)](#module_browser..editPost)
  * [~readPosts(topicId, postIds, callback)](#module_browser..readPosts)
  * [~getPost(postId, callback)](#module_browser..getPost)
  * [~getPosts(topicId, eachPost, complete)](#module_browser..getPosts)
  * [~getTopics(eachTopic, complete)](#module_browser..getTopics)
  * [~postAction(action, postId, message, callback)](#module_browser..postAction)
  * [~getTopic(topicId, callback)](#module_browser..getTopic)
  * [~getCSRF(delay, queue, callback)](#module_browser..getCSRF)
  * [~doLogin(delay, queue, callback)](#module_browser..doLogin)
  * [~login(callback)](#module_browser..login)
  * [~messageBus(channels, clientId, callback)](#module_browser..messageBus)
  * [~getNotifications(callback)](#module_browser..getNotifications)
  * [~setPostUrl(post)](#module_browser..setPostUrl) ⇒ <code>external.module_posts.CleanedPost</code>
  * [~setTrustLevel(post)](#module_browser..setTrustLevel) ⇒ <code>external.module_posts.CleanedPost</code>
  * [~cleanPostRaw(post)](#module_browser..cleanPostRaw) ⇒ <code>external.module_posts.CleanedPost</code>
  * [~cleanPost(post)](#module_browser..cleanPost) ⇒ <code>external.posts.CleanedPost</code>
  * [~requestComplete](#module_browser..requestComplete)
  * [~postedCallback](#module_browser..postedCallback)
  * [~topicCallback](#module_browser..topicCallback)
  * [~completedCallback](#module_browser..completedCallback)
  * [~loginCallback](#module_browser..loginCallback)
  * [~messageBusCallback](#module_browser..messageBusCallback)
  * [~notificationsCallback](#module_browser..notificationsCallback)
  * [~eachTopicCallback](#module_browser..eachTopicCallback)
  * [~eachPostCallback](#module_browser..eachPostCallback)

<a name="module_browser..trustLevels"></a>
### browser~trustLevels
SockBot Virtual Trust Levels

**Kind**: inner constant of <code>[browser](#module_browser)</code>  
**Read only**: true  
**Properties**

| Name | Default | Description |
| --- | --- | --- |
| owner | <code>9</code> | Bot Owner Trust Level |
| admin | <code>8</code> | Forum Admin Trust Level |
| moderator | <code>7</code> | Forum Moderator Trust Level |
| staff | <code>6</code> | Forum Staff Trust Level |
| tl4 | <code>4</code> | Discourst trust_level 4 Trust Level |
| tl3 | <code>3</code> | Discourst trust_level 3 Trust Level |
| tl2 | <code>2</code> | Discourst trust_level 2 Trust Level |
| tl1 | <code>1</code> | Discourst trust_level 1 Trust Level |
| tl0 | <code>0</code> | Discourst trust_level 0 Trust Level |
| ignored | <code>0</code> | Ignored User Trust Level |

<a name="module_browser..postActions"></a>
### browser~postActions
Discourse Post Actions

**Kind**: inner constant of <code>[browser](#module_browser)</code>  
**Read only**: true  
**Properties**

| Name | Default |
| --- | --- |
| bookmark | <code>1</code> | 
| like | <code>2</code> | 
| off_topic | <code>3</code> | 
| inappropriate | <code>4</code> | 
| vote | <code>5</code> | 
| notify_user | <code>6</code> | 
| notify_moderators | <code>7</code> | 
| spam | <code>8</code> | 

<a name="module_browser..queueWorker"></a>
### browser~queueWorker(task, callback)
Process browser tasks with rate limiting

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| task | <code>object</code> |  | Task configuration |
| [task.method] | <code>string</code> | <code>&quot;GET&quot;</code> | HTTP method to request |
| task.url | <code>string</code> |  | Site relative URL to request |
| [task.form] | <code>object</code> |  | HTTP form to use in HTTP request |
| [task.callback] | <code>browser~requestComplete</code> |  | Callback toprovide request results to |
| [task.delay] | <code>Number</code> | <code>0</code> | Seconds to delay callback after request for additional rate limiting |
| callback | <code>function</code> |  | Queue task complete callback |

<a name="module_browser..createPost"></a>
### browser~createPost(topicId, [replyTo], content, callback)
Post content to an existing topic

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>number</code> | Topic to post to |
| [replyTo] | <code>number</code> | Post Number in topic that this post is in reply to |
| content | <code>string</code> | Post Contents to post |
| callback | <code>postedCallback</code> | Completion callback |

<a name="module_browser..createPrivateMessage"></a>
### browser~createPrivateMessage(to, title, content, callback)
Create a new private message.

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>string</code> &#124; <code>Array.&lt;string&gt;</code> | Username or names to create PM to |
| title | <code>string</code> | Title of the Private Message |
| content | <code>string</code> | Private Message contents |
| callback | <code>postedCallback</code> | Completion callback |

<a name="module_browser..editPost"></a>
### browser~editPost(postId, content, [editReason], callback)
Edit an existing post.

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| postId | <code>number</code> | Id number of the post to edit |
| content | <code>string</code> | New post content |
| [editReason] | <code>string</code> | Optional Edit Reason that no one ever uses |
| callback | <code>postedCallback</code> | Completion callback |

<a name="module_browser..readPosts"></a>
### browser~readPosts(topicId, postIds, callback)
Read post

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>number</code> | Id of topic to read |
| postIds | <code>Array.&lt;number&gt;</code> | Ids of posts to read |
| callback | <code>postedCallback</code> | Completion callback |

<a name="module_browser..getPost"></a>
### browser~getPost(postId, callback)
Get post details

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| postId | <code>number</code> | Id of post to retrieve |
| callback | <code>postedCallback</code> | Completion callback |

<a name="module_browser..getPosts"></a>
### browser~getPosts(topicId, eachPost, complete)
Get all posts from a topic

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>number</code> | Topic to get posts from |
| eachPost | <code>eachPostCallback</code> | Callback to process individual posts |
| complete | <code>completionCallback</code> | Completion callback |

<a name="module_browser..getTopics"></a>
### browser~getTopics(eachTopic, complete)
Get all topics visible from `/latest`

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| eachTopic | <code>eachTopicCallback</code> | Callback to process individual topics |
| complete | <code>completionCallback</code> | Completion callback |

<a name="module_browser..postAction"></a>
### browser~postAction(action, postId, message, callback)
Perform a post action

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>postActions</code> | Action to perform |
| postId | <code>number</code> | Id of post to act on |
| message | <code>string</code> | Message to leave as part of post action |
| callback | <code>completionCallback</code> | Completion callback |

<a name="module_browser..getTopic"></a>
### browser~getTopic(topicId, callback)
Get topic details

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>number</code> | Id of topic to retrieve |
| callback | <code>topicCallback</code> | Completion callback |

<a name="module_browser..getCSRF"></a>
### browser~getCSRF(delay, queue, callback)
get a CSRF token from discourse

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| delay | <code>number</code> | Delay completion by this many ms |
| queue | <code>async.queue</code> | Task Queue |
| callback | <code>completedCallback</code> | Completion callback |

<a name="module_browser..doLogin"></a>
### browser~doLogin(delay, queue, callback)
Perform a login to discourse

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| delay | <code>number</code> | Delay completion by this many ms |
| queue | <code>async.queue</code> | Task Queue |
| callback | <code>loginCallback</code> | Completion callback |

<a name="module_browser..login"></a>
### browser~login(callback)
Login to discourse

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>loginCallback</code> | Completion callback |

<a name="module_browser..messageBus"></a>
### browser~messageBus(channels, clientId, callback)
poll message-bus for messages

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channels | <code>Object.&lt;string, number&gt;</code> | Channels of interest |
| clientId | <code>string</code> | Id of the client for message-bus |
| callback | <code>messageBusCallback</code> | Completion callback |

<a name="module_browser..getNotifications"></a>
### browser~getNotifications(callback)
Poll for notifications

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>notificationsCallback</code> | Completion callback |

<a name="module_browser..setPostUrl"></a>
### browser~setPostUrl(post) ⇒ <code>external.module_posts.CleanedPost</code>
construct direct post link and direct in reply to link

**Kind**: inner method of <code>[browser](#module_browser)</code>  
**Returns**: <code>external.module_posts.CleanedPost</code> - input post with urls set  
**See**

- [Post](../external/posts/#external.module_posts.Post)
- [CleanedPost](../external/posts/#external.module_posts.CleanedPost)


| Param | Type | Description |
| --- | --- | --- |
| post | <code>external.module_posts.Post</code> | Post to generate links for |
| post.topic_id | <code>number</code> | Topic Id that the input post belongs to |
| post.topic_slug | <code>string</code> | URL slug of the topic |
| post.post_number | <code>number</code> | Ordinal of the input post in topic. |
| post.reply_to_post_number | <code>number</code> | The post_number the input post is a reply to |

<a name="module_browser..setTrustLevel"></a>
### browser~setTrustLevel(post) ⇒ <code>external.module_posts.CleanedPost</code>
Normalize discourse trust level to SockBot Virtual Trust Level

**Kind**: inner method of <code>[browser](#module_browser)</code>  
**Returns**: <code>external.module_posts.CleanedPost</code> - input post with normalized trust_level  
**See**

- [Post](../external/posts/#external.module_posts.Post)
- [CleanedPost](../external/posts/#external.module_posts.CleanedPost)


| Param | Type | Description |
| --- | --- | --- |
| post | <code>external.module_posts.Post</code> | Post to normalize trust levels on |
| post.username | <code>string</code> | Username of the post owner |
| post.trust_level | <code>Number</code> | Trust level of the post owner |
| post.moderator | <code>boolean</code> | Flags whether post owner has moderator powers |
| post.admin | <code>boolean</code> | Flags whether post owner has admin powers |
| post.staff | <code>boolean</code> | Flags whether post owner has staff powers |

<a name="module_browser..cleanPostRaw"></a>
### browser~cleanPostRaw(post) ⇒ <code>external.module_posts.CleanedPost</code>
Clean post raw

Provided and commented by flabdablet

**Kind**: inner method of <code>[browser](#module_browser)</code>  
**Returns**: <code>external.module_posts.CleanedPost</code> - input post with cleaned raw  
**See**: [CleanedPost](../external/posts/#external.module_posts.CleanedPost)  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>external.module_posts.Post</code> | Post to clean |
| post.raw | <code>string</code> | Raw text of the post to clean |

<a name="module_browser..cleanPost"></a>
### browser~cleanPost(post) ⇒ <code>external.posts.CleanedPost</code>
Clean discourse post for processing

**Kind**: inner method of <code>[browser](#module_browser)</code>  
**Returns**: <code>external.posts.CleanedPost</code> - Cleaned Post  
**See**

- [Post](../external/posts/#external.module_posts.Post)
- [CleanedPost](../external/posts/#external.module_posts.CleanedPost)


| Param | Type | Description |
| --- | --- | --- |
| post | <code>external.posts.Post</code> | Input Post |

<a name="module_browser..requestComplete"></a>
### browser~requestComplete
Browser Request Callback

**Kind**: inner typedef of <code>[browser](#module_browser)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Exception</code> | <code></code> | Error encountered processing request |
| body | <code>Object</code> |  | JSON parsed response body. If invalid JSON will be `undefined` |

<a name="module_browser..postedCallback"></a>
### browser~postedCallback
Post Request Callback

**Kind**: inner typedef of <code>[browser](#module_browser)</code>  
**See**: [CleanedPost](../external/posts/#external.module_posts.CleanedPost)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Exception</code> | <code></code> | Error encountered processing request |
| post | <code>external.posts.CleanedPost</code> |  | Cleaned post |

<a name="module_browser..topicCallback"></a>
### browser~topicCallback
Topic Request Callback

**Kind**: inner typedef of <code>[browser](#module_browser)</code>  
**See**: [Topic](../external/topics/#external.module_topic.Topic)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Exception</code> | <code></code> | Error encountered processing request |
| topic | <code>external.topics.Topic</code> |  | RetrievedTopic |

<a name="module_browser..completedCallback"></a>
### browser~completedCallback
Completion Callback

**Kind**: inner typedef of <code>[browser](#module_browser)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Exception</code> | <code></code> | Error encountered |

<a name="module_browser..loginCallback"></a>
### browser~loginCallback
Login Completion Callback

**Kind**: inner typedef of <code>[browser](#module_browser)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Exception</code> | <code></code> | Error encountered processing request |
| user | <code>extermal.users.User</code> |  | Logged in User information |

<a name="module_browser..messageBusCallback"></a>
### browser~messageBusCallback
MessageBus Completion Callback

**Kind**: inner typedef of <code>[browser](#module_browser)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Excption</code> | <code></code> | Error encountered processing request |
| messages | <code>Array.&lt;external.messageBus.message&gt;</code> |  | Messages found. |

<a name="module_browser..notificationsCallback"></a>
### browser~notificationsCallback
Notifications Completion Callback

**Kind**: inner typedef of <code>[browser](#module_browser)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Excption</code> | <code></code> | Error encountered processing request |
| notifications | <code>external.notifications.notifications</code> |  | Notifications found. |

<a name="module_browser..eachTopicCallback"></a>
### browser~eachTopicCallback
Each Topic Callback

**Kind**: inner typedef of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topic | <code>external.topics.Topic</code> | Topic to process |
| callback | <code>completedCallback</code> | Completion callback |

<a name="module_browser..eachPostCallback"></a>
### browser~eachPostCallback
Each Post Callback

**Kind**: inner typedef of <code>[browser](#module_browser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>external.posts.CleanedPost</code> | Post to process |
| callback | <code>completedCallback</code> | Completion callback |

