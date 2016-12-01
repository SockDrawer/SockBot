<a name="sockbot.providers.nodebb.module_Topic"></a>

## Topic
NodeBB provider module Topic class

**Author:** Accalia  
**License**: MIT  

* [Topic](#sockbot.providers.nodebb.module_Topic)
    * _static_
        * [.bindTopic(forum)](#sockbot.providers.nodebb.module_Topic.bindTopic) ⇒ <code>User</code>
    * _inner_
        * [~Topic](#sockbot.providers.nodebb.module_Topic..Topic)
            * [new Topic(payload)](#new_sockbot.providers.nodebb.module_Topic..Topic_new)
            * _instance_
                * [.categoryId](#sockbot.providers.nodebb.module_Topic..Topic+categoryId) : <code>number</code>
                * [.authorId](#sockbot.providers.nodebb.module_Topic..Topic+authorId) : <code>number</code>
                * [.title](#sockbot.providers.nodebb.module_Topic..Topic+title) : <code>string</code>
                * [.posted](#sockbot.providers.nodebb.module_Topic..Topic+posted) : <code>Date</code>
                * [.lastPosted](#sockbot.providers.nodebb.module_Topic..Topic+lastPosted) : <code>Date</code>
                * [.id](#sockbot.providers.nodebb.module_Topic..Topic+id) : <code>number</code>
                * [.mainPostId](#sockbot.providers.nodebb.module_Topic..Topic+mainPostId) : <code>number</code>
                * [.postCount](#sockbot.providers.nodebb.module_Topic..Topic+postCount) : <code>number</code>
                * [.url()](#sockbot.providers.nodebb.module_Topic..Topic+url) ⇒ <code>Promise.&lt;string&gt;</code>
                * [.reply(content)](#sockbot.providers.nodebb.module_Topic..Topic+reply) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.getAllPosts(eachPost)](#sockbot.providers.nodebb.module_Topic..Topic+getAllPosts) ⇒ <code>Promise.&lt;Topic&gt;</code>
                * [.getLatestPosts(eachPost)](#sockbot.providers.nodebb.module_Topic..Topic+getLatestPosts) ⇒ <code>Promise.&lt;Topic&gt;</code>
                * [.markRead([postNumber])](#sockbot.providers.nodebb.module_Topic..Topic+markRead) ⇒ <code>Promise.&lt;Topic&gt;</code>
                * [.watch()](#sockbot.providers.nodebb.module_Topic..Topic+watch) ⇒ <code>Promise.&lt;Topic&gt;</code>
                * [.unwatch()](#sockbot.providers.nodebb.module_Topic..Topic+unwatch) ⇒ <code>Promise.&lt;Topic&gt;</code>
                * [.mute()](#sockbot.providers.nodebb.module_Topic..Topic+mute) ⇒ <code>Promise.&lt;Topic&gt;</code>
                * [.unmute()](#sockbot.providers.nodebb.module_Topic..Topic+unmute) ⇒ <code>Promise.&lt;Topic&gt;</code>
            * _static_
                * [.get(topicId)](#sockbot.providers.nodebb.module_Topic..Topic.get) ⇒ <code>Promise.&lt;Topic&gt;</code>
                * [.parse(payload)](#sockbot.providers.nodebb.module_Topic..Topic.parse) ⇒ <code>Topic</code>
                * [.parseExtended(data)](#sockbot.providers.nodebb.module_Topic..Topic.parseExtended) ⇒ <code>Promise.&lt;TopicExtended&gt;</code>
                * [.getUnreadTopics(eachTopic)](#sockbot.providers.nodebb.module_Topic..Topic.getUnreadTopics) ⇒ <code>Promise</code>
                * [.getRecentTopics(eachTopic)](#sockbot.providers.nodebb.module_Topic..Topic.getRecentTopics) ⇒ <code>Promise</code>

<a name="sockbot.providers.nodebb.module_Topic.bindTopic"></a>

### Topic.bindTopic(forum) ⇒ <code>User</code>
Create a Topic class and bind it to a forum instance

**Kind**: static method of <code>[Topic](#sockbot.providers.nodebb.module_Topic)</code>  
**Returns**: <code>User</code> - A Topic class bound to the provided `forum` instance  

| Param | Type | Description |
| --- | --- | --- |
| forum | <code>Provider</code> | A forum instance to bind to constructed Topic class |

<a name="sockbot.providers.nodebb.module_Topic..Topic"></a>

### Topic~Topic
Topic Class

Represends a forum topic

**Kind**: inner class of <code>[Topic](#sockbot.providers.nodebb.module_Topic)</code>  
**Access:** public  

* [~Topic](#sockbot.providers.nodebb.module_Topic..Topic)
    * [new Topic(payload)](#new_sockbot.providers.nodebb.module_Topic..Topic_new)
    * _instance_
        * [.categoryId](#sockbot.providers.nodebb.module_Topic..Topic+categoryId) : <code>number</code>
        * [.authorId](#sockbot.providers.nodebb.module_Topic..Topic+authorId) : <code>number</code>
        * [.title](#sockbot.providers.nodebb.module_Topic..Topic+title) : <code>string</code>
        * [.posted](#sockbot.providers.nodebb.module_Topic..Topic+posted) : <code>Date</code>
        * [.lastPosted](#sockbot.providers.nodebb.module_Topic..Topic+lastPosted) : <code>Date</code>
        * [.id](#sockbot.providers.nodebb.module_Topic..Topic+id) : <code>number</code>
        * [.mainPostId](#sockbot.providers.nodebb.module_Topic..Topic+mainPostId) : <code>number</code>
        * [.postCount](#sockbot.providers.nodebb.module_Topic..Topic+postCount) : <code>number</code>
        * [.url()](#sockbot.providers.nodebb.module_Topic..Topic+url) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.reply(content)](#sockbot.providers.nodebb.module_Topic..Topic+reply) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.getAllPosts(eachPost)](#sockbot.providers.nodebb.module_Topic..Topic+getAllPosts) ⇒ <code>Promise.&lt;Topic&gt;</code>
        * [.getLatestPosts(eachPost)](#sockbot.providers.nodebb.module_Topic..Topic+getLatestPosts) ⇒ <code>Promise.&lt;Topic&gt;</code>
        * [.markRead([postNumber])](#sockbot.providers.nodebb.module_Topic..Topic+markRead) ⇒ <code>Promise.&lt;Topic&gt;</code>
        * [.watch()](#sockbot.providers.nodebb.module_Topic..Topic+watch) ⇒ <code>Promise.&lt;Topic&gt;</code>
        * [.unwatch()](#sockbot.providers.nodebb.module_Topic..Topic+unwatch) ⇒ <code>Promise.&lt;Topic&gt;</code>
        * [.mute()](#sockbot.providers.nodebb.module_Topic..Topic+mute) ⇒ <code>Promise.&lt;Topic&gt;</code>
        * [.unmute()](#sockbot.providers.nodebb.module_Topic..Topic+unmute) ⇒ <code>Promise.&lt;Topic&gt;</code>
    * _static_
        * [.get(topicId)](#sockbot.providers.nodebb.module_Topic..Topic.get) ⇒ <code>Promise.&lt;Topic&gt;</code>
        * [.parse(payload)](#sockbot.providers.nodebb.module_Topic..Topic.parse) ⇒ <code>Topic</code>
        * [.parseExtended(data)](#sockbot.providers.nodebb.module_Topic..Topic.parseExtended) ⇒ <code>Promise.&lt;TopicExtended&gt;</code>
        * [.getUnreadTopics(eachTopic)](#sockbot.providers.nodebb.module_Topic..Topic.getUnreadTopics) ⇒ <code>Promise</code>
        * [.getRecentTopics(eachTopic)](#sockbot.providers.nodebb.module_Topic..Topic.getRecentTopics) ⇒ <code>Promise</code>

<a name="new_sockbot.providers.nodebb.module_Topic..Topic_new"></a>

#### new Topic(payload)
Construct a topic object from a provided payload.

This constructor is intended for private use only, if you need top construct a topic from payload data use
`Topic.parse()` instead.


| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | Payload to construct the User object out of |

<a name="sockbot.providers.nodebb.module_Topic..Topic+categoryId"></a>

#### topic.categoryId : <code>number</code>
Forum specific ID for topic category

**Kind**: instance property of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Topic..Topic+authorId"></a>

#### topic.authorId : <code>number</code>
Forum specific ID for topic author

**Kind**: instance property of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Topic..Topic+title"></a>

#### topic.title : <code>string</code>
Topic title

**Kind**: instance property of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Topic..Topic+posted"></a>

#### topic.posted : <code>Date</code>
DateTime that the topic was created

**Kind**: instance property of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Topic..Topic+lastPosted"></a>

#### topic.lastPosted : <code>Date</code>
DateTime that the topic was last replied to

**Kind**: instance property of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Topic..Topic+id"></a>

#### topic.id : <code>number</code>
Forum Specific Topic Id

**Kind**: instance property of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Topic..Topic+mainPostId"></a>

#### topic.mainPostId : <code>number</code>
Forum id of the opening post

**Kind**: instance property of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Topic..Topic+postCount"></a>

#### topic.postCount : <code>number</code>
Count of posts in topic

**Kind**: instance property of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Topic..Topic+url"></a>

#### topic.url() ⇒ <code>Promise.&lt;string&gt;</code>
Retrieve the web URL for the topic

**Kind**: instance method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Promise.&lt;string&gt;</code> - Resolves to the web URL for this topic  
**Access:** public  
**Promise**:   
**Fulfill**: <code>string</code> The Web URL for this topic  
**Reject**: <code>Error</code> An Error that occured while retrieving the post URL  
<a name="sockbot.providers.nodebb.module_Topic..Topic+reply"></a>

#### topic.reply(content) ⇒ <code>Promise.&lt;Post&gt;</code>
Reply to this topic with the given content

**Kind**: instance method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the newly created Post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Post</code> The newly created Post  
**Reject**: <code>Error</code> An Error that occured while posting  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Post Content |

<a name="sockbot.providers.nodebb.module_Topic..Topic+getAllPosts"></a>

#### topic.getAllPosts(eachPost) ⇒ <code>Promise.&lt;Topic&gt;</code>
Retrieve all posts from this topic, passing each off to a provided iterator function.

**Kind**: instance method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Promise.&lt;Topic&gt;</code> - Resolves to self on completion  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Topic</code> Source Topic  
**Reject**: <code>Error</code> An Error that occured while posting  

| Param | Type | Description |
| --- | --- | --- |
| eachPost | <code>PostProcessor</code> | A function to process retrieved posts. |

<a name="sockbot.providers.nodebb.module_Topic..Topic+getLatestPosts"></a>

#### topic.getLatestPosts(eachPost) ⇒ <code>Promise.&lt;Topic&gt;</code>
Retrieve most posts from this topic, passing each off to a provided iterator function.

**Kind**: instance method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Promise.&lt;Topic&gt;</code> - Resolves to self on completion  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Topic</code> Source Topic  
**Reject**: <code>Error</code> An Error that occured while posting  

| Param | Type | Description |
| --- | --- | --- |
| eachPost | <code>PostProcessor</code> | A function to process retrieved posts. |

<a name="sockbot.providers.nodebb.module_Topic..Topic+markRead"></a>

#### topic.markRead([postNumber]) ⇒ <code>Promise.&lt;Topic&gt;</code>
Mark the topic read up to a point

**Kind**: instance method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Promise.&lt;Topic&gt;</code> - Resolves to self on completion  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Topic</code> Source Topic  
**Reject**: <code>Error</code> An Error that occured while posting  

| Param | Type | Description |
| --- | --- | --- |
| [postNumber] | <code>number</code> | Last read post. Omit to mark the entire topic read |

<a name="sockbot.providers.nodebb.module_Topic..Topic+watch"></a>

#### topic.watch() ⇒ <code>Promise.&lt;Topic&gt;</code>
Watch the topic for new replies

**Kind**: instance method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Promise.&lt;Topic&gt;</code> - Resolves to self on completion  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Topic</code> Source Topic  
**Reject**: <code>Error</code> An Error that occured while posting  
<a name="sockbot.providers.nodebb.module_Topic..Topic+unwatch"></a>

#### topic.unwatch() ⇒ <code>Promise.&lt;Topic&gt;</code>
Stop watching the tipic for new replies

**Kind**: instance method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Promise.&lt;Topic&gt;</code> - Resolves to self on completion  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Topic</code> Source Topic  
**Reject**: <code>Error</code> An Error that occured while posting  
<a name="sockbot.providers.nodebb.module_Topic..Topic+mute"></a>

#### topic.mute() ⇒ <code>Promise.&lt;Topic&gt;</code>
Mute the topic to suppress notifications

**Kind**: instance method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Promise.&lt;Topic&gt;</code> - Resolves to self on completion  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Topic</code> Source Topic  
**Reject**: <code>Error</code> An Error that occured while posting  
<a name="sockbot.providers.nodebb.module_Topic..Topic+unmute"></a>

#### topic.unmute() ⇒ <code>Promise.&lt;Topic&gt;</code>
Unmute the topic, allowing notifications to be generated again.

**Kind**: instance method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Promise.&lt;Topic&gt;</code> - Resolves to self on completion  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Topic</code> Source Topic  
**Reject**: <code>Error</code> An Error that occured while posting  
<a name="sockbot.providers.nodebb.module_Topic..Topic.get"></a>

#### Topic.get(topicId) ⇒ <code>Promise.&lt;Topic&gt;</code>
Retrieve a topic by topic id

**Kind**: static method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Promise.&lt;Topic&gt;</code> - Retrieved topic  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Topic</code> Retrieved Topic  
**Reject**: <code>Error</code> An Error that occured while posting  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>number</code> | Id of topic to retrieve |

<a name="sockbot.providers.nodebb.module_Topic..Topic.parse"></a>

#### Topic.parse(payload) ⇒ <code>Topic</code>
Parse a topic from retrieved data

**Kind**: static method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Topic</code> - Parsed topic  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | Payload to parse into a topic |

<a name="sockbot.providers.nodebb.module_Topic..Topic.parseExtended"></a>

#### Topic.parseExtended(data) ⇒ <code>Promise.&lt;TopicExtended&gt;</code>
Parse a topic with embedded user and category information into respective objects

**Kind**: static method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Promise.&lt;TopicExtended&gt;</code> - Parsed Results  
**Access:** public  
**Promise**:   
**Fulfill**: <code>TopicExtended</code> Parsed topic data  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>\*</code> | Data to parse into a topic |

<a name="sockbot.providers.nodebb.module_Topic..Topic.getUnreadTopics"></a>

#### Topic.getUnreadTopics(eachTopic) ⇒ <code>Promise</code>
Get All Unread Topics

**Kind**: static method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Promise</code> - A promise that resolves when all topics have been processed  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| eachTopic | <code>TopicProcessor</code> | A function to process each retrieved topic |

<a name="sockbot.providers.nodebb.module_Topic..Topic.getRecentTopics"></a>

#### Topic.getRecentTopics(eachTopic) ⇒ <code>Promise</code>
Get All Topics in order of most recent activity

**Kind**: static method of <code>[Topic](#sockbot.providers.nodebb.module_Topic..Topic)</code>  
**Returns**: <code>Promise</code> - A promise that resolves when all topics have been processed  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| eachTopic | <code>TopicProcessor</code> | A function to process each retrieved topic |

