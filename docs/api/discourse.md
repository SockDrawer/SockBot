<a name="module_discourse"></a>
## discourse
Used for communicating to discourse and the web.

**Author:** Accalia  
**License**: MIT  

* [discourse](#module_discourse)
  * _static_
    * [.uuid()](#module_discourse.uuid) ⇒ <code>string</code>
    * [.sleep(until)](#module_discourse.sleep) ⇒ <code>number</code>
    * [.version()](#module_discourse.version) ⇒ <code>Version</code>
    * [.log(message)](#module_discourse.log)
    * [.warn(message)](#module_discourse.warn)
    * [.error(message)](#module_discourse.error)
    * [.saveFile(url, filename, callback)](#module_discourse.saveFile)
    * [.login(callback)](#module_discourse.login)
    * [.reply(post, raw, callback)](#module_discourse.reply)
    * [.createPrivateMessage(to, title, raw, callback)](#module_discourse.createPrivateMessage)
    * [.editPost(postId, raw, [editReason], callback)](#module_discourse.editPost)
    * [.deletePost(postId, callback)](#module_discourse.deletePost)
    * [.postAction(action, postId, [message], callback)](#module_discourse.postAction)
    * [.deletePostAction(action, postId, [message], callback)](#module_discourse.deletePostAction)
    * [.readPosts(topicId, posts, callback)](#module_discourse.readPosts)
    * [.getPost(postId, callback)](#module_discourse.getPost)
    * [.getTopic(topicId, callback)](#module_discourse.getTopic)
    * [.getLastPosts(topicId, eachPost, callback)](#module_discourse.getLastPosts)
    * [.getAllPosts(topicId, eachChunk, callback)](#module_discourse.getAllPosts)
    * [.getAllTopics(eachChunk, callback)](#module_discourse.getAllTopics)
    * [.getMessageBus(channels, callback)](#module_discourse.getMessageBus)
    * [.getNotifications(callback)](#module_discourse.getNotifications)
    * [.getUserData(username, callback)](#module_discourse.getUserData)
  * _inner_
    * [~dGet(url, callback, [delayAfter])](#module_discourse..dGet)
    * [~dPost(url, form, callback, [delayAfter])](#module_discourse..dPost)
    * [~dPut(url, form, callback, [delayAfter])](#module_discourse..dPut)
    * [~dDelete(url, form, callback, [delayAfter])](#module_discourse..dDelete)
    * [~addTimestamp(message)](#module_discourse..addTimestamp) ⇒ <code>string</code>
    * [~cleanPost(post)](#module_discourse..cleanPost) ⇒ <code>CleanedPost</code>
    * [~schedule(task, [delayGroup])](#module_discourse..schedule)
    * [~createPost(topic, [replyTo], raw, callback, [nomute])](#module_discourse..createPost)

<a name="module_discourse.uuid"></a>
### discourse.uuid() ⇒ <code>string</code>
Generate a type 4 UUID.

I don't understand how this does what it does, but it works.
It's a lot slower than using node-uuid but i only need one
of these so its good enough
Source: http://jsperf.com/node-uuid-performance/19

**Kind**: static method of <code>[discourse](#module_discourse)</code>  
**Returns**: <code>string</code> - A type 4 UUID  
<a name="module_discourse.sleep"></a>
### discourse.sleep(until) ⇒ <code>number</code>
Set the bot to muted status until a time or query sleep status.

Most actions that would create a post will fail with error 'Muted' if bot is
asleep

**Kind**: static method of <code>[discourse](#module_discourse)</code>  
**Returns**: <code>number</code> - current timestamp the bot is set to sleep until  

| Param | Type | Description |
| --- | --- | --- |
| until | <code>number</code> | Unix Timestamp representing time for the bot to unmute |

<a name="module_discourse.version"></a>
### discourse.version() ⇒ <code>Version</code>
Get the current version information

**Kind**: static method of <code>[discourse](#module_discourse)</code>  
**Returns**: <code>Version</code> - Active Version module  
<a name="module_discourse.log"></a>
### discourse.log(message)
Log a message to the console

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>\*</code> | Message to log |

<a name="module_discourse.warn"></a>
### discourse.warn(message)
Log a warning to the console

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>\*</code> | Warning to log |

<a name="module_discourse.error"></a>
### discourse.error(message)
Log an error to the console

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>\*</code> | Error to log |

<a name="module_discourse.saveFile"></a>
### discourse.saveFile(url, filename, callback)
Issue a GET request and save result to filesystem

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Url to fetch |
| filename | <code>string</code> | Filename to save to |
| callback |  | Completion callback |

<a name="module_discourse.login"></a>
### discourse.login(callback)
Log into Discourse

Uses `username` and `password` configuration settings to login to discourse

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>[request](#discourse..request)</code> | Completion callback |

<a name="module_discourse.reply"></a>
### discourse.reply(post, raw, callback)
Reply to a post.

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>Post</code> | Post object to reply to |
| raw | <code>string</code> | Raw post data |
| callback | <code>[request](#discourse..request)</code> | Completion callback |

<a name="module_discourse.createPrivateMessage"></a>
### discourse.createPrivateMessage(to, title, raw, callback)
Create a new private message.

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>string</code> &#124; <code>Array.&lt;string&gt;</code> | Username or names to create PM to |
| title | <code>string</code> | Title of the Private Message |
| raw | <code>string</code> | Raw post data |
| callback | <code>[request](#discourse..request)</code> | Completion callback |

<a name="module_discourse.editPost"></a>
### discourse.editPost(postId, raw, [editReason], callback)
Edit an existing post.

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| postId | <code>number</code> | Id number of the post to edit |
| raw | <code>string</code> | New raw post data |
| [editReason] | <code>string</code> | Optional Edit Reason that no one ever uses |
| callback | <code>[request](#discourse..request)</code> | Completion callback |

<a name="module_discourse.deletePost"></a>
### discourse.deletePost(postId, callback)
Delete an existing post.

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| postId | <code>number</code> | Id of the post to delete |
| callback | <code>[request](#discourse..request)</code> | Completion callback |

<a name="module_discourse.postAction"></a>
### discourse.postAction(action, postId, [message], callback)
Perform a post action on a post

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>PostAction</code> | Action to perform |
| postId | <code>number</code> | Id of the post to act on |
| [message] | <code>string</code> | Content of any applicable moderation message |
| callback | <code>[request](#discourse..request)</code> | Completion callback |

<a name="module_discourse.deletePostAction"></a>
### discourse.deletePostAction(action, postId, [message], callback)
Remove a post action from a post

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>PostAction</code> | Action to perform |
| postId | <code>number</code> | Id of the post to act on |
| [message] | <code>string</code> | Content of any applicable moderation message |
| callback | <code>[request](#discourse..request)</code> | Completion callback |

<a name="module_discourse.readPosts"></a>
### discourse.readPosts(topicId, posts, callback)
Read a lists of posts from a topic

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>number</code> | The topic the posts are from |
| posts | <code>Array.&lt;number&gt;</code> | List of post_number fields from posts to read |
| callback | <code>[request](#discourse..request)</code> | Completion callback |

<a name="module_discourse.getPost"></a>
### discourse.getPost(postId, callback)
Get a specific post

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| postId | <code>number</code> | Id of the post to retrieve |
| callback | <code>[request](#discourse..request)</code> | Completion callback |

<a name="module_discourse.getTopic"></a>
### discourse.getTopic(topicId, callback)
Get topic information

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>number</code> | Id of topic to get information about |
| callback | <code>[request](#discourse..request)</code> | Completion callback |

<a name="module_discourse.getLastPosts"></a>
### discourse.getLastPosts(topicId, eachPost, callback)
Get the last page of a topic.

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>number</code> | Id of topic to get information about |
| eachPost | <code>[singleenumeration](#discourse..singleenumeration)</code> | Callback to handle each post |
| callback | <code>function</code> | Completion callback |

<a name="module_discourse.getAllPosts"></a>
### discourse.getAllPosts(topicId, eachChunk, callback)
Get all posts in a topic

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>number</code> | Id of topic to get information about |
| eachChunk | <code>[enumeration](#discourse..enumeration)</code> | Callback to handle each chunk |
| callback | <code>function</code> | Completion callback |

<a name="module_discourse.getAllTopics"></a>
### discourse.getAllTopics(eachChunk, callback)
Get all topics visible to current user from /latest

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| eachChunk | <code>[enumeration](#discourse..enumeration)</code> | Callback to handle each chunk |
| callback | <code>function</code> | Completion callback |

<a name="module_discourse.getMessageBus"></a>
### discourse.getMessageBus(channels, callback)
Poll message-bus for messages

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channels | <code>Object.&lt;string, number&gt;</code> | Channels of interest |
| callback | <code>[request](#discourse..request)</code> | Completion callback |

<a name="module_discourse.getNotifications"></a>
### discourse.getNotifications(callback)
Poll for notifications

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>[request](#discourse..request)</code> | Completion callback |

<a name="module_discourse.getUserData"></a>
### discourse.getUserData(username, callback)
Get user data for an arbitrary user. Will fail if bot is not at least
moderator status

**Kind**: static method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | Target Username |
| callback | <code>[request](#discourse..request)</code> | Completion callback |

<a name="module_discourse..dGet"></a>
### discourse~dGet(url, callback, [delayAfter])
Schedule a GET request to discourse

**Kind**: inner method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  | Site relative URL to fetch |
| callback | <code>[request](#discourse..request)</code> |  | Response callback |
| [delayAfter] | <code>number</code> | <code>0</code> | Apply this rate limiting to requests |

<a name="module_discourse..dPost"></a>
### discourse~dPost(url, form, callback, [delayAfter])
Schedule a POST request to discourse

**Kind**: inner method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  | Site relative URL to post to |
| form | <code>Object</code> |  | Form to post |
| callback | <code>[request](#discourse..request)</code> |  | Response callback |
| [delayAfter] | <code>number</code> | <code>0</code> | Apply this rate limiting to requests |

<a name="module_discourse..dPut"></a>
### discourse~dPut(url, form, callback, [delayAfter])
Schedule a POST request to discourse

**Kind**: inner method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  | Site relative URL to post to |
| form | <code>Object</code> |  | Form to post |
| callback | <code>[request](#discourse..request)</code> |  | Response callback |
| [delayAfter] | <code>number</code> | <code>0</code> | Apply this rate limiting to requests |

<a name="module_discourse..dDelete"></a>
### discourse~dDelete(url, form, callback, [delayAfter])
Schedule a DELETE request to discourse

**Kind**: inner method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  | Site relative URL to post to |
| form | <code>Object</code> |  | Form to post |
| callback | <code>[request](#discourse..request)</code> |  | Response callback |
| [delayAfter] | <code>number</code> | <code>0</code> | Apply this rate limiting to requests |

<a name="module_discourse..addTimestamp"></a>
### discourse~addTimestamp(message) ⇒ <code>string</code>
Add timestamp to message.

if `datestamp` configuration setting is truthy add UTC date and time, else
if `timestamp` configuration setting is truthy add UTC time, else
return message unaltered

**Kind**: inner method of <code>[discourse](#module_discourse)</code>  
**Returns**: <code>string</code> - timestamped input message  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>\*</code> | Message to timestamp |

<a name="module_discourse..cleanPost"></a>
### discourse~cleanPost(post) ⇒ <code>CleanedPost</code>
Apply normalization to a post.

Add `cleaned` key that contains post raw with bbcode quotes removed
Alter trust_level key as follows:<br/>
<br/>
* If poster matches `admin.owner` configuration setting set TL to 9<br/>
* Else if poster is an admin set TL to 8<br/>
* Else if poster is a moderator set TL to 7<br/>
* Else if poster is a staff member set TL to 6<br/>
* Else if poster is a member of `admin.ignore` configuration list set TL to 0
<br/><br/>
add `url` and `reply_to` keys to the post

**Kind**: inner method of <code>[discourse](#module_discourse)</code>  
**Returns**: <code>CleanedPost</code> - Cleaned Discourse Post Object  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>Post</code> | Discourse Post Object |

<a name="module_discourse..schedule"></a>
### discourse~schedule(task, [delayGroup])
Schedule a task

if `delayGroup` is provided will schedule such that tasks with the same value
for `delayGroup` will be executed at most once per `delayGroup` milliseconds

**Kind**: inner method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| task | <code>function</code> | Task to schedule |
| [delayGroup] | <code>number</code> | Ensure task is rate limited to this rate |

<a name="module_discourse..createPost"></a>
### discourse~createPost(topic, [replyTo], raw, callback, [nomute])
Create a post.

**Kind**: inner method of <code>[discourse](#module_discourse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topic | <code>number</code> | Id of the topic to reply to |
| [replyTo] | <code>number</code> | Post_number of the post replyied to |
| raw | <code>string</code> | Raw post data |
| callback | <code>[request](#discourse..request)</code> | Completion callback |
| [nomute] | <code>boolean</code> | INTERNAL USE ONLY. Do not set! |

