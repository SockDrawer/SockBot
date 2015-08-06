<a name="module_events"></a>
## events
SockEvents for SockBot2.0

**Author:** Accalia  
**License**: MIT  

* [events](#module_events)
  * [~onChannel(channel, handler)](#module_events..onChannel)
  * [~onTopic(topicId, handler)](#module_events..onTopic)
  * [~removeChannel(channel, handler)](#module_events..removeChannel) ⇒ <code>SockEvents</code>
  * [~removeFunction(topicId, handler)](#module_events..removeFunction) ⇒ <code>SockEvents</code>
  * [~onNotification(type, handler)](#module_events..onNotification) ⇒ <code>SockEvents</code>
  * [~removeNotification(type, handler)](#module_events..removeNotification) ⇒ <code>SockEvents</code>
  * [~onCommand(type, helpstring, handler)](#module_events..onCommand) ⇒ <code>SockEvents</code>
  * [~removeCommand(command, handler)](#module_events..removeCommand) ⇒ <code>SockEvents</code>
  * [~SockEvents](#module_events..SockEvents) : <code>object</code>
  * [~command](#module_events..command) : <code>object</code>
  * [~messageHandler](#module_events..messageHandler)
  * [~topicMessageHandler](#module_events..topicMessageHandler)
  * [~notificationHandler](#module_events..notificationHandler)
  * [~commandHandler](#module_events..commandHandler)

<a name="module_events..onChannel"></a>
### events~onChannel(channel, handler)
Register a message-bus channel listener

**Kind**: inner method of <code>[events](#module_events)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>string</code> | Message-bus channel to subscribe to |
| handler | <code>messageHandler</code> | Event Handler |

<a name="module_events..onTopic"></a>
### events~onTopic(topicId, handler)
Register a message-bus topic listener

**Kind**: inner method of <code>[events](#module_events)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>Number</code> | Numerical ID of topic to subscribe to |
| handler | <code>topicMessageHandler</code> | Event Handler |

<a name="module_events..removeChannel"></a>
### events~removeChannel(channel, handler) ⇒ <code>SockEvents</code>
Unregister a message-bus channel listener

**Kind**: inner method of <code>[events](#module_events)</code>  
**Returns**: <code>SockEvents</code> - SockEvents for chaining calls  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>string</code> | Message-bus channel to subscribe to |
| handler | <code>messageHandler</code> | Event Handler |

<a name="module_events..removeFunction"></a>
### events~removeFunction(topicId, handler) ⇒ <code>SockEvents</code>
Unregister a message-bus topic listener

**Kind**: inner method of <code>[events](#module_events)</code>  
**Returns**: <code>SockEvents</code> - SockEvents for chaining calls  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>Number</code> | Numerical ID of topic to subscribe to |
| handler | <code>topicMessageHandler</code> | Event Handler |

<a name="module_events..onNotification"></a>
### events~onNotification(type, handler) ⇒ <code>SockEvents</code>
Add a notification listener

**Kind**: inner method of <code>[events](#module_events)</code>  
**Returns**: <code>SockEvents</code> - SockEvents for chaining calls  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Notification type |
| handler | <code>notificationHandler</code> | Notification handler |

<a name="module_events..removeNotification"></a>
### events~removeNotification(type, handler) ⇒ <code>SockEvents</code>
Remove a notification listener

**Kind**: inner method of <code>[events](#module_events)</code>  
**Returns**: <code>SockEvents</code> - SockEvents for chaining calls  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Notification type |
| handler | <code>notificationHandler</code> | Notification handler |

<a name="module_events..onCommand"></a>
### events~onCommand(type, helpstring, handler) ⇒ <code>SockEvents</code>
Add a notification listener

**Kind**: inner method of <code>[events](#module_events)</code>  
**Returns**: <code>SockEvents</code> - SockEvents for chaining calls  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Command name |
| helpstring | <code>string</code> | Short help text for command |
| handler | <code>commandHandler</code> | Command handler |

<a name="module_events..removeCommand"></a>
### events~removeCommand(command, handler) ⇒ <code>SockEvents</code>
Remove a command listener

**Kind**: inner method of <code>[events](#module_events)</code>  
**Returns**: <code>SockEvents</code> - SockEvents for chaining calls  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | Command type |
| handler | <code>commandHandler</code> | Command handler |

<a name="module_events..SockEvents"></a>
### events~SockEvents : <code>object</code>
SockEvents object

All methods from core EventEmitter are preserved, refer to the [core api](https://nodejs.org/api/events.html)
for details.

**Kind**: inner typedef of <code>[events](#module_events)</code>  
**Extends:** <code>EventEmitter</code>  
<a name="module_events..command"></a>
### events~command : <code>object</code>
Parsed Command Data

**Kind**: inner typedef of <code>[events](#module_events)</code>  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | Raw Command Input |
| command | <code>string</code> | Command name |
| args | <code>Array.&lt;string&gt;</code> | Command arguments |
| mention | <code>string</code> | Mention text that was included in command |
| post | <code>external.posts.CleanedPost</code> | Post that triggered the command |

<a name="module_events..messageHandler"></a>
### events~messageHandler
Discourse message-bus channel message handler

**Kind**: inner typedef of <code>[events](#module_events)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>externals.messageBus.message</code> | Message to handle |

<a name="module_events..topicMessageHandler"></a>
### events~topicMessageHandler
Discourse message-bus topic message handler

**Kind**: inner typedef of <code>[events](#module_events)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>externals.messageBus.postMessage</code> | Payload of message |
| topic | <code>externals.topics.Topic</code> | Topic containing post |
| post | <code>externals.posts.CleanedPost</code> | Post that triggered the message |

<a name="module_events..notificationHandler"></a>
### events~notificationHandler
Notification Handler

**Kind**: inner typedef of <code>[events](#module_events)</code>  

| Param | Type | Description |
| --- | --- | --- |
| notification | <code>external.notifications.notification</code> | Received notification |
| [topic] | <code>external.topics.Topic</code> | Topic data for received notification |
| [post] | <code>external.posts.CleanedPost</code> | Post data for recieved notification |

<a name="module_events..commandHandler"></a>
### events~commandHandler
Command handler

**Kind**: inner typedef of <code>[events](#module_events)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>command</code> | Triggering Command |

