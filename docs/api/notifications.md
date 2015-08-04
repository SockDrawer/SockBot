<a name="module_notifications"></a>
## notifications
notifications handler for SockBot2.0

**Author:** Accalia  
**License**: MIT  

* [notifications](#module_notifications)
  * _static_
    * [.prepare(events, callback)](#module_notifications.prepare)
    * [.start(events, callback)](#module_notifications.start)
    * [.pollNotifications(callback)](#module_notifications.pollNotifications)
  * _inner_
    * [~handleTopicNotification(notification)](#module_notifications..handleTopicNotification)
    * [~onNotificationMessage(message)](#module_notifications..onNotificationMessage)
    * [~onNotification(type, handler)](#module_notifications..onNotification) ⇒ <code>EventEmitter</code>
    * [~removeNotification(type, handler)](#module_notifications..removeNotification) ⇒ <code>EventEmitter</code>
    * [~completionCallback](#module_notifications..completionCallback)
    * [~notificationCallback](#module_notifications..notificationCallback)

<a name="module_notifications.prepare"></a>
### notifications.prepare(events, callback)
Prepare notifications for bot start

**Kind**: static method of <code>[notifications](#module_notifications)</code>  

| Param | Type | Description |
| --- | --- | --- |
| events | <code>EventEmitter</code> | EventEmitter that will eb used for communication |
| callback | <code>completionCallback</code> | Completion Callback |

<a name="module_notifications.start"></a>
### notifications.start(events, callback)
Prepare notifications for bot start

**Kind**: static method of <code>[notifications](#module_notifications)</code>  

| Param | Type | Description |
| --- | --- | --- |
| events | <code>EventEmitter</code> | EventEmitter that will eb used for communication |
| callback | <code>completionCallback</code> | Completion Callback |

<a name="module_notifications.pollNotifications"></a>
### notifications.pollNotifications(callback)
Poll for notifications

**Kind**: static method of <code>[notifications](#module_notifications)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>completionCallback</code> | Completion callback |

<a name="module_notifications..handleTopicNotification"></a>
### notifications~handleTopicNotification(notification)
Process a notification from a topic

**Kind**: inner method of <code>[notifications](#module_notifications)</code>  

| Param | Type | Description |
| --- | --- | --- |
| notification | <code>external.notifications.notification</code> | Notification to process |

<a name="module_notifications..onNotificationMessage"></a>
### notifications~onNotificationMessage(message)
React to notifications message

**Kind**: inner method of <code>[notifications](#module_notifications)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>external.messageBus.notificationsMessage</code> | Recieved message |

<a name="module_notifications..onNotification"></a>
### notifications~onNotification(type, handler) ⇒ <code>EventEmitter</code>
Add a notification listener

**Kind**: inner method of <code>[notifications](#module_notifications)</code>  
**Returns**: <code>EventEmitter</code> - EventEmitter for chainging calls  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Notification type |
| handler | <code>notificationCallback</code> | Notification handler |

<a name="module_notifications..removeNotification"></a>
### notifications~removeNotification(type, handler) ⇒ <code>EventEmitter</code>
Remove a notification listener

**Kind**: inner method of <code>[notifications](#module_notifications)</code>  
**Returns**: <code>EventEmitter</code> - EventEmitter for chainging calls  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Notification type |
| handler | <code>notificationCallback</code> | Notification handler |

<a name="module_notifications..completionCallback"></a>
### notifications~completionCallback
Completion Callback

**Kind**: inner typedef of <code>[notifications](#module_notifications)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> &#124; <code>Error</code> | Filter Error state |

<a name="module_notifications..notificationCallback"></a>
### notifications~notificationCallback
Notification Callback

**Kind**: inner typedef of <code>[notifications](#module_notifications)</code>  

| Param | Type | Description |
| --- | --- | --- |
| notification | <code>external.notifications.notification</code> | Received notification |
| [topic] | <code>external.topics.Topic</code> | Topic data for received notification |
| [post] | <code>external.posts.CleanedPost</code> | Post data for recieved notification |

