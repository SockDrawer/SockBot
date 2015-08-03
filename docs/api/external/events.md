<a name="module_events"></a>
## events
SockEvents for SockBot2.0

**Author:** Accalia  
**License**: MIT  

* [events](#module_events)
  * [~SockEvents](#module_events..SockEvents) : <code>object</code>
  * [~command](#module_events..command) : <code>object</code>
  * [~messageHandler](#module_events..messageHandler)
  * [~topicMessageHandler](#module_events..topicMessageHandler)
  * [~notificationHandler](#module_events..notificationHandler)
  * [~commandHandler](#module_events..commandHandler)

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

