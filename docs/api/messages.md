<a name="module_commands"></a>
## commands
message-bus handler for SockBot2.0

**Author:** Accalia  
**License**: MIT  

* [commands](#module_commands)
  * [~filterIgnoredOnPost(post, topic, callback)](#module_commands..filterIgnoredOnPost) ⇒ <code>null</code>
  * [~filterIgnoredOnTopic(post, topic, callback)](#module_commands..filterIgnoredOnTopic) ⇒ <code>null</code>
  * [~filterIgnored(post, topic, callback)](#module_commands..filterIgnored)
  * [~processTopicMessage(message)](#module_commands..processTopicMessage)
  * [~updateChannelPositions(messages)](#module_commands..updateChannelPositions)
  * [~resetChannelPositions()](#module_commands..resetChannelPositions)
  * [~statusChannelHandler(message)](#module_commands..statusChannelHandler)
  * [~onChannel(channel, handler)](#module_commands..onChannel) ⇒ <code>EventEmitter</code>
  * [~onTopic(topicId, handler)](#module_commands..onTopic) ⇒ <code>EventEmitter</code>
  * [~removeChannel(channel, handler)](#module_commands..removeChannel) ⇒ <code>EventEmitter</code>
  * [~removeTopic(topicId, handler)](#module_commands..removeTopic) ⇒ <code>EventEmitter</code>
  * [~onMessageAdd(event)](#module_commands..onMessageAdd) ⇒ <code>boolean</code>
  * [~onMessageRemove(event,)](#module_commands..onMessageRemove) ⇒ <code>boolean</code>
  * [~completionCallback](#module_commands..completionCallback)
  * [~filterCallback](#module_commands..filterCallback)
  * [~messageHandler](#module_commands..messageHandler)
  * [~topicMessageHandler](#module_commands..topicMessageHandler)

<a name="module_commands..filterIgnoredOnPost"></a>
### commands~filterIgnoredOnPost(post, topic, callback) ⇒ <code>null</code>
Proccess post for ignore contitions

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>null</code> - No return value  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>externals.posts.CleanedPost</code> | Post to filter |
| topic | <code>externals.topics.Topic</code> | Topic `post` belongs to |
| callback | <code>filterCallback</code> | Completion Callback |

<a name="module_commands..filterIgnoredOnTopic"></a>
### commands~filterIgnoredOnTopic(post, topic, callback) ⇒ <code>null</code>
Proccess topic for ignore contitions

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>null</code> - No return value  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>externals.posts.CleanedPost</code> | Triggering post |
| topic | <code>externals.topics.Topic</code> | Topic to filter |
| callback | <code>filterCallback</code> | Completion Callback |

<a name="module_commands..filterIgnored"></a>
### commands~filterIgnored(post, topic, callback)
Filter post/topic for ignore conditions

**Kind**: inner method of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>externals.posts.CleanedPost</code> | Post to filter |
| topic | <code>externals.topics.Topic</code> | Topic to filter |
| callback | <code>completionCallback</code> | Completion Callback |

<a name="module_commands..processTopicMessage"></a>
### commands~processTopicMessage(message)
Process a message that is from a `/topic/*` channel

**Kind**: inner method of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>externals.messageBus.message</code> | Message to process |

<a name="module_commands..updateChannelPositions"></a>
### commands~updateChannelPositions(messages)
Update channel position for polled messages.

**Kind**: inner method of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| messages | <code>Array.&lt;externals.messageBus.message&gt;</code> | Messages that were polled |

<a name="module_commands..resetChannelPositions"></a>
### commands~resetChannelPositions()
Reset all channels to position -1.

This is to reset message-bus after poll failure or after software version update

**Kind**: inner method of <code>[commands](#module_commands)</code>  
<a name="module_commands..statusChannelHandler"></a>
### commands~statusChannelHandler(message)
Message handler for the `/__status` message channel

**Kind**: inner method of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Object.&lt;string, number&gt;</code> | New channel positions |

<a name="module_commands..onChannel"></a>
### commands~onChannel(channel, handler) ⇒ <code>EventEmitter</code>
Add message-bus non-topic channel listener

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>EventEmitter</code> - Returns emitter, so calls can be chained.  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>string</code> | Channel to listen to |
| handler | <code>messageHandler</code> | Message handler to add |

<a name="module_commands..onTopic"></a>
### commands~onTopic(topicId, handler) ⇒ <code>EventEmitter</code>
Add message-bus topic channel listener

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>EventEmitter</code> - Returns emitter, so calls can be chained.  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>string</code> | Topic to listen to |
| handler | <code>messageHandler</code> | Message handler to add |

<a name="module_commands..removeChannel"></a>
### commands~removeChannel(channel, handler) ⇒ <code>EventEmitter</code>
Remove message-bus non-topic channel listener

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>EventEmitter</code> - Returns emitter, so calls can be chained.  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>string</code> | Channel to remove listener from |
| handler | <code>messageHandler</code> | Message handler to remove |

<a name="module_commands..removeTopic"></a>
### commands~removeTopic(topicId, handler) ⇒ <code>EventEmitter</code>
Remove message-bus topic channel listener

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>EventEmitter</code> - Returns emitter, so calls can be chained.  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>string</code> | Topic to remove listener from |
| handler | <code>messageHandler</code> | Message handler to remove |

<a name="module_commands..onMessageAdd"></a>
### commands~onMessageAdd(event) ⇒ <code>boolean</code>
Listen for new message-bus channels

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>boolean</code> - True if event was a message-bus channel, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event that's been registered |

<a name="module_commands..onMessageRemove"></a>
### commands~onMessageRemove(event,) ⇒ <code>boolean</code>
Listen for parting message-bus channels

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>boolean</code> - True if event was a message-bus channel, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| event, | <code>string</code> | event that has unregistered a handler |

<a name="module_commands..completionCallback"></a>
### commands~completionCallback
Completion Callback

**Kind**: inner typedef of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> &#124; <code>Error</code> | Filter Error state |

<a name="module_commands..filterCallback"></a>
### commands~filterCallback
Filter Callback

**Kind**: inner typedef of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> &#124; <code>Error</code> | Filter Error state |
| reason | <code>string</code> | Filter Reason |

<a name="module_commands..messageHandler"></a>
### commands~messageHandler
Message-bus Message Handler

**Kind**: inner typedef of <code>[commands](#module_commands)</code>  
<a name="module_commands..topicMessageHandler"></a>
### commands~topicMessageHandler
Message-bus Topic Message Handler

**Kind**: inner typedef of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>externals.messageBus.postMessage</code> | Payload of message |
| topic | <code>externals.topics.Topic</code> | Topic containing post |
| post | <code>externals.posts.CleanedPost</code> | Post that triggered the message |

