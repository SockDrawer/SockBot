<a name="sockbot.providers.nodebb.module_Notification"></a>

## Notification
NodeBB provider module Notification class

**Author:** Accalia  
**License**: MIT  

* [Notification](#sockbot.providers.nodebb.module_Notification)
    * [.bindNotification(forum)](#sockbot.providers.nodebb.module_Notification.bindNotification) ⇒ <code>Notification</code>
        * [~notificationType](#sockbot.providers.nodebb.module_Notification.bindNotification..notificationType)

<a name="sockbot.providers.nodebb.module_Notification.bindNotification"></a>

### Notification.bindNotification(forum) ⇒ <code>Notification</code>
Create a Notification class and bind it to a forum instance

**Kind**: static method of <code>[Notification](#sockbot.providers.nodebb.module_Notification)</code>  
**Returns**: <code>Notification</code> - A Notification class bound to the provided `forum` instance  

| Param | Type | Description |
| --- | --- | --- |
| forum | <code>Provider</code> | A forum instance to bind to constructed Notification class |

<a name="sockbot.providers.nodebb.module_Notification.bindNotification..notificationType"></a>

#### bindNotification~notificationType
Notification types enum

**Kind**: inner constant of <code>[bindNotification](#sockbot.providers.nodebb.module_Notification.bindNotification)</code>  
**Read only**: true  
**Properties**

| Name | Default |
| --- | --- |
| notification | <code>notification</code> | 
| reply | <code>reply</code> | 
| mention | <code>mention</code> | 

