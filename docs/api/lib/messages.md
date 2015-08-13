<a name="module_messages"></a>
## messages
message-bus handler for SockBot2.0

**Author:** Accalia  
**License**: MIT  

* [messages](#module_messages)
  * [~processTopicMessage(message)](#module_messages..processTopicMessage)
  * [~updateChannelPositions(messages)](#module_messages..updateChannelPositions)
  * [~resetChannelPositions()](#module_messages..resetChannelPositions)
  * [~statusChannelHandler(message)](#module_messages..statusChannelHandler)
  * [~onChannel(channel, handler)](#module_messages..onChannel) ⇒ <code>EventEmitter</code>
  * [~onTopic(topicId, handler)](#module_messages..onTopic) ⇒ <code>EventEmitter</code>
  * [~removeChannel(channel, handler)](#module_messages..removeChannel) ⇒ <code>EventEmitter</code>
  * [~removeTopic(topicId, handler)](#module_messages..removeTopic) ⇒ <code>EventEmitter</code>
  * [~onMessageAdd(event)](#module_messages..onMessageAdd) ⇒ <code>boolean</code>
  * [~onMessageRemove(event,)](#module_messages..onMessageRemove) ⇒ <code>boolean</code>
  * [~completionCallback](#module_messages..completionCallback)
  * [~filterCallback](#module_messages..filterCallback)
  * [~messageHandler](#module_messages..messageHandler)
  * [~topicMessageHandler](#module_messages..topicMessageHandler)

<a name="module_messages..processTopicMessage"></a>
### messages~processTopicMessage(message)
Process a message that is from a `/topic/*` channel

**Kind**: inner method of <code>[messages](#module_messages)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>externals.messageBus.message</code> | Message to process |

<a name="module_messages..updateChannelPositions"></a>
### messages~updateChannelPositions(messages)
Update channel position for polled messages.

**Kind**: inner method of <code>[messages](#module_messages)</code>  

| Param | Type | Description |
| --- | --- | --- |
| messages | <code>Array.&lt;externals.messageBus.message&gt;</code> | Messages that were polled |

<a name="module_messages..resetChannelPositions"></a>
### messages~resetChannelPositions()
Reset all channels to position -1.

This is to reset message-bus after poll failure or after software version update

**Kind**: inner method of <code>[messages](#module_messages)</code>  
<a name="module_messages..statusChannelHandler"></a>
### messages~statusChannelHandler(message)
Message handler for the `/__status` message channel

**Kind**: inner method of <code>[messages](#module_messages)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Object.&lt;string, number&gt;</code> | New channel positions |

<a name="module_messages..onChannel"></a>
### messages~onChannel(channel, handler) ⇒ <code>EventEmitter</code>
Add message-bus non-topic channel listener

**Kind**: inner method of <code>[messages](#module_messages)</code>  
**Returns**: <code>EventEmitter</code> - Returns emitter, so calls can be chained.  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>string</code> | Channel to listen to |
| handler | <code>messageHandler</code> | Message handler to add |

<a name="module_messages..onTopic"></a>
### messages~onTopic(topicId, handler) ⇒ <code>EventEmitter</code>
Add message-bus topic channel listener

**Kind**: inner method of <code>[messages](#module_messages)</code>  
**Returns**: <code>EventEmitter</code> - Returns emitter, so calls can be chained.  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>string</code> | Topic to listen to |
| handler | <code>topicMessageHandler</code> | Message handler to add |

<a name="module_messages..removeChannel"></a>
### messages~removeChannel(channel, handler) ⇒ <code>EventEmitter</code>
Remove message-bus non-topic channel listener

**Kind**: inner method of <code>[messages](#module_messages)</code>  
**Returns**: <code>EventEmitter</code> - Returns emitter, so calls can be chained.  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>string</code> | Channel to remove listener from |
| handler | <code>messageHandler</code> | Message handler to remove |

<a name="module_messages..removeTopic"></a>
### messages~removeTopic(topicId, handler) ⇒ <code>EventEmitter</code>
Remove message-bus topic channel listener

**Kind**: inner method of <code>[messages](#module_messages)</code>  
**Returns**: <code>EventEmitter</code> - Returns emitter, so calls can be chained.  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>string</code> | Topic to remove listener from |
| handler | <code>topicMessageHandler</code> | Message handler to remove |

<a name="module_messages..onMessageAdd"></a>
### messages~onMessageAdd(event) ⇒ <code>boolean</code>
Listen for new message-bus channels

**Kind**: inner method of <code>[messages](#module_messages)</code>  
**Returns**: <code>boolean</code> - True if event was a message-bus channel, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event that's been registered |

<a name="module_messages..onMessageRemove"></a>
### messages~onMessageRemove(event,) ⇒ <code>boolean</code>
Listen for parting message-bus channels

**Kind**: inner method of <code>[messages](#module_messages)</code>  
**Returns**: <code>boolean</code> - True if event was a message-bus channel, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| event, | <code>string</code> | event that has unregistered a handler |

<a name="module_messages..completionCallback"></a>
### messages~completionCallback
Completion Callback

**Kind**: inner typedef of <code>[messages](#module_messages)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> &#124; <code>Error</code> | Filter Error state |

<a name="module_messages..filterCallback"></a>
### messages~filterCallback
Filter Callback

**Kind**: inner typedef of <code>[messages](#module_messages)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> &#124; <code>Error</code> | Filter Error state |
| reason | <code>string</code> | Filter Reason |

<a name="module_messages..messageHandler"></a>
### messages~messageHandler
Message-bus Message Handler

**Kind**: inner typedef of <code>[messages](#module_messages)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>externals.messageBus.message</code> | Message Recieved |

<a name="module_messages..topicMessageHandler"></a>
### messages~topicMessageHandler
Message-bus Topic Message Handler

**Kind**: inner typedef of <code>[messages](#module_messages)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>externals.messageBus.postMessage</code> | Payload of message |
| topic | <code>externals.topics.Topic</code> | Topic containing post |
| post | <code>externals.posts.CleanedPost</code> | Post that triggered the message |

