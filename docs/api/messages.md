<a name="module_commands"></a>
## commands
message-bus handler for SockBot2.0

**Author:** Accalia  
**License**: MIT  

* [commands](#module_commands)
  * [~statusChannelHandler(message)](#module_commands..statusChannelHandler)
  * [~onChannel(channel, handler)](#module_commands..onChannel) ⇒ <code>EventEmitter</code>
  * [~onTopic(topicId, handler)](#module_commands..onTopic) ⇒ <code>EventEmitter</code>
  * [~removeChannel(channel, handler)](#module_commands..removeChannel) ⇒ <code>EventEmitter</code>
  * [~removeTopic(topicId, handler)](#module_commands..removeTopic) ⇒ <code>EventEmitter</code>
  * [~onMessageAdd(event)](#module_commands..onMessageAdd) ⇒ <code>boolean</code>
  * [~onMessageRemove(event,)](#module_commands..onMessageRemove) ⇒ <code>boolean</code>
  * [~messageHandler](#module_commands..messageHandler)

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

<a name="module_commands..messageHandler"></a>
### commands~messageHandler
Message-bus Message Handler

**Kind**: inner typedef of <code>[commands](#module_commands)</code>  
