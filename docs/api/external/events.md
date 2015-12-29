<a name="module_SockEvents"></a>
## SockEvents ⇐ <code>EventEmitter</code>
SockEvents object

All methods from core EventEmitter are preserved, refer to the [core api](https://nodejs.org/api/events.html)
for details.

**Extends:** <code>EventEmitter</code>  
**Author:** Accalia  
**License**: MIT  

* [SockEvents](#module_SockEvents) ⇐ <code>EventEmitter</code>
    * [~onChannel(channel, handler)](#module_SockEvents..onChannel) ⇒ <code>SockEvents</code>
    * [~removeChannel(channel, handler)](#module_SockEvents..removeChannel) ⇒ <code>SockEvents</code>
    * [~removeTopic(topicId, handler)](#module_SockEvents..removeTopic) ⇒ <code>SockEvents</code>
    * [~onNotification(type, handler)](#module_SockEvents..onNotification) ⇒ <code>SockEvents</code>
    * [~removeNotification(type, handler)](#module_SockEvents..removeNotification) ⇒ <code>SockEvents</code>
    * [~onCommand(type, helpstring, handler)](#module_SockEvents..onCommand) ⇒ <code>SockEvents</code>
    * [~removeCommand(command, handler)](#module_SockEvents..removeCommand) ⇒ <code>SockEvents</code>
    * [~command](#module_SockEvents..command) : <code>object</code>
    * [~messageHandler](#module_SockEvents..messageHandler)
    * [~topicMessageHandler](#module_SockEvents..topicMessageHandler)
    * [~notificationHandler](#module_SockEvents..notificationHandler)
    * [~commandHandler](#module_SockEvents..commandHandler)

<a name="module_SockEvents..onChannel"></a>
### SockEvents~onChannel(channel, handler) ⇒ <code>SockEvents</code>
Register a message-bus channel listener

**Kind**: inner method of <code>[SockEvents](#module_SockEvents)</code>  
**Returns**: <code>SockEvents</code> - SockEvents for chaining calls  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>string</code> | Message-bus channel to subscribe to |
| handler | <code>messageHandler</code> | Event Handler |

<a name="module_SockEvents..removeChannel"></a>
### SockEvents~removeChannel(channel, handler) ⇒ <code>SockEvents</code>
Unregister a message-bus channel listener

**Kind**: inner method of <code>[SockEvents](#module_SockEvents)</code>  
**Returns**: <code>SockEvents</code> - SockEvents for chaining calls  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>string</code> | Message-bus channel to subscribe to |
| handler | <code>messageHandler</code> | Event Handler |

<a name="module_SockEvents..removeTopic"></a>
### SockEvents~removeTopic(topicId, handler) ⇒ <code>SockEvents</code>
Unregister a message-bus topic listener

**Kind**: inner method of <code>[SockEvents](#module_SockEvents)</code>  
**Returns**: <code>SockEvents</code> - SockEvents for chaining calls  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>Number</code> | Numerical ID of topic to subscribe to |
| handler | <code>topicMessageHandler</code> | Event Handler |

<a name="module_SockEvents..onNotification"></a>
### SockEvents~onNotification(type, handler) ⇒ <code>SockEvents</code>
Add a notification listener

**Kind**: inner method of <code>[SockEvents](#module_SockEvents)</code>  
**Returns**: <code>SockEvents</code> - SockEvents for chaining calls  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Notification type |
| handler | <code>notificationHandler</code> | Notification handler |

<a name="module_SockEvents..removeNotification"></a>
### SockEvents~removeNotification(type, handler) ⇒ <code>SockEvents</code>
Remove a notification listener

**Kind**: inner method of <code>[SockEvents](#module_SockEvents)</code>  
**Returns**: <code>SockEvents</code> - SockEvents for chaining calls  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Notification type |
| handler | <code>notificationHandler</code> | Notification handler |

<a name="module_SockEvents..onCommand"></a>
### SockEvents~onCommand(type, helpstring, handler) ⇒ <code>SockEvents</code>
Add a notification listener

**Kind**: inner method of <code>[SockEvents](#module_SockEvents)</code>  
**Returns**: <code>SockEvents</code> - SockEvents for chaining calls  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Command name |
| helpstring | <code>string</code> | Short help text for command |
| handler | <code>commandHandler</code> | Command handler |

<a name="module_SockEvents..removeCommand"></a>
### SockEvents~removeCommand(command, handler) ⇒ <code>SockEvents</code>
Remove a command listener

**Kind**: inner method of <code>[SockEvents](#module_SockEvents)</code>  
**Returns**: <code>SockEvents</code> - SockEvents for chaining calls  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | Command type |
| handler | <code>commandHandler</code> | Command handler |

<a name="module_SockEvents..command"></a>
### SockEvents~command : <code>object</code>
Parsed Command Data

**Kind**: inner typedef of <code>[SockEvents](#module_SockEvents)</code>  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | Raw Command Input |
| command | <code>string</code> | Command name |
| args | <code>Array.&lt;string&gt;</code> | Command arguments |
| mention | <code>string</code> | Mention text that was included in command |
| post | <code>external.posts.CleanedPost</code> | Post that triggered the command |

<a name="module_SockEvents..messageHandler"></a>
### SockEvents~messageHandler
Discourse message-bus channel message handler

**Kind**: inner typedef of <code>[SockEvents](#module_SockEvents)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>externals.messageBus.message</code> | Message to handle |

<a name="module_SockEvents..topicMessageHandler"></a>
### SockEvents~topicMessageHandler
Discourse message-bus topic message handler

**Kind**: inner typedef of <code>[SockEvents](#module_SockEvents)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>externals.messageBus.postMessage</code> | Payload of message |
| topic | <code>externals.topics.Topic</code> | Topic containing post |
| post | <code>externals.posts.CleanedPost</code> | Post that triggered the message |

<a name="module_SockEvents..notificationHandler"></a>
### SockEvents~notificationHandler
Notification Handler

**Kind**: inner typedef of <code>[SockEvents](#module_SockEvents)</code>  

| Param | Type | Description |
| --- | --- | --- |
| notification | <code>external.notifications.notification</code> | Received notification |
| [topic] | <code>external.topics.Topic</code> | Topic data for received notification |
| [post] | <code>external.posts.CleanedPost</code> | Post data for recieved notification |

<a name="module_SockEvents..commandHandler"></a>
### SockEvents~commandHandler
Command handler

**Kind**: inner typedef of <code>[SockEvents](#module_SockEvents)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>command</code> | Triggering Command |

