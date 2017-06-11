<a name="sockbot.providers.nodebb.module_Notification"></a>

## Notification
NodeBB provider module Notification class

**Author**: Accalia  
**License**: MIT  

* [Notification](#sockbot.providers.nodebb.module_Notification)
    * _static_
        * [.bindNotification(forum)](#sockbot.providers.nodebb.module_Notification.bindNotification) ⇒ <code>Notification</code>
            * [~notificationType](#sockbot.providers.nodebb.module_Notification.bindNotification..notificationType)
    * _inner_
        * [~Notification](#sockbot.providers.nodebb.module_Notification..Notification)
            * [new Notification(payload)](#new_sockbot.providers.nodebb.module_Notification..Notification_new)
            * _instance_
                * [.id](#sockbot.providers.nodebb.module_Notification..Notification+id) : <code>string</code>
                * [.postId](#sockbot.providers.nodebb.module_Notification..Notification+postId) : <code>number</code>
                * [.topicId](#sockbot.providers.nodebb.module_Notification..Notification+topicId) : <code>number</code>
                * [.categoryId](#sockbot.providers.nodebb.module_Notification..Notification+categoryId) : <code>number</code>
                * [.userId](#sockbot.providers.nodebb.module_Notification..Notification+userId) : <code>number</code>
                * [.type](#sockbot.providers.nodebb.module_Notification..Notification+type) : <code>notificationType</code>
                * [.subtype](#sockbot.providers.nodebb.module_Notification..Notification+subtype) : <code>string</code>
                * [.read](#sockbot.providers.nodebb.module_Notification..Notification+read) : <code>boolean</code>
                * [.date](#sockbot.providers.nodebb.module_Notification..Notification+date) : <code>Date</code>
                * [.label](#sockbot.providers.nodebb.module_Notification..Notification+label) : <code>string</code>
                * [.body](#sockbot.providers.nodebb.module_Notification..Notification+body) : <code>string</code>
                * [.getText()](#sockbot.providers.nodebb.module_Notification..Notification+getText) ⇒ <code>Promise.&lt;string&gt;</code>
                * [.url()](#sockbot.providers.nodebb.module_Notification..Notification+url) ⇒ <code>Promise.&lt;string&gt;</code>
                * [.getPost()](#sockbot.providers.nodebb.module_Notification..Notification+getPost) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.getTopic()](#sockbot.providers.nodebb.module_Notification..Notification+getTopic) ⇒ <code>Promise.&lt;Topic&gt;</code>
                * [.getUser()](#sockbot.providers.nodebb.module_Notification..Notification+getUser) ⇒ <code>Promise.&lt;User&gt;</code>
            * _static_
                * [.get(notificationId)](#sockbot.providers.nodebb.module_Notification..Notification.get) ⇒ <code>Promise.&lt;Notification&gt;</code>
                * [.parse(payload)](#sockbot.providers.nodebb.module_Notification..Notification.parse) ⇒ <code>Notification</code>
                * [.getNotifications(eachNotification)](#sockbot.providers.nodebb.module_Notification..Notification.getNotifications) ⇒ <code>Promise</code>
                * [.activate()](#sockbot.providers.nodebb.module_Notification..Notification.activate)
                * [.deactivate()](#sockbot.providers.nodebb.module_Notification..Notification.deactivate)

<a name="sockbot.providers.nodebb.module_Notification.bindNotification"></a>

### Notification.bindNotification(forum) ⇒ <code>Notification</code>
Create a Notification class and bind it to a forum instance

**Kind**: static method of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification)  
**Returns**: <code>Notification</code> - A Notification class bound to the provided `forum` instance  

| Param | Type | Description |
| --- | --- | --- |
| forum | <code>Provider</code> | A forum instance to bind to constructed Notification class |

<a name="sockbot.providers.nodebb.module_Notification.bindNotification..notificationType"></a>

#### bindNotification~notificationType
Notification types enum

**Kind**: inner enum of [<code>bindNotification</code>](#sockbot.providers.nodebb.module_Notification.bindNotification)  
**Read only**: true  
**Properties**

| Name | Default |
| --- | --- |
| notification | <code>notification</code> | 
| reply | <code>reply</code> | 
| mention | <code>mention</code> | 

<a name="sockbot.providers.nodebb.module_Notification..Notification"></a>

### Notification~Notification
Notification Class

Represents a forum notification

**Kind**: inner class of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification)  
**Access**: public  

* [~Notification](#sockbot.providers.nodebb.module_Notification..Notification)
    * [new Notification(payload)](#new_sockbot.providers.nodebb.module_Notification..Notification_new)
    * _instance_
        * [.id](#sockbot.providers.nodebb.module_Notification..Notification+id) : <code>string</code>
        * [.postId](#sockbot.providers.nodebb.module_Notification..Notification+postId) : <code>number</code>
        * [.topicId](#sockbot.providers.nodebb.module_Notification..Notification+topicId) : <code>number</code>
        * [.categoryId](#sockbot.providers.nodebb.module_Notification..Notification+categoryId) : <code>number</code>
        * [.userId](#sockbot.providers.nodebb.module_Notification..Notification+userId) : <code>number</code>
        * [.type](#sockbot.providers.nodebb.module_Notification..Notification+type) : <code>notificationType</code>
        * [.subtype](#sockbot.providers.nodebb.module_Notification..Notification+subtype) : <code>string</code>
        * [.read](#sockbot.providers.nodebb.module_Notification..Notification+read) : <code>boolean</code>
        * [.date](#sockbot.providers.nodebb.module_Notification..Notification+date) : <code>Date</code>
        * [.label](#sockbot.providers.nodebb.module_Notification..Notification+label) : <code>string</code>
        * [.body](#sockbot.providers.nodebb.module_Notification..Notification+body) : <code>string</code>
        * [.getText()](#sockbot.providers.nodebb.module_Notification..Notification+getText) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.url()](#sockbot.providers.nodebb.module_Notification..Notification+url) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.getPost()](#sockbot.providers.nodebb.module_Notification..Notification+getPost) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.getTopic()](#sockbot.providers.nodebb.module_Notification..Notification+getTopic) ⇒ <code>Promise.&lt;Topic&gt;</code>
        * [.getUser()](#sockbot.providers.nodebb.module_Notification..Notification+getUser) ⇒ <code>Promise.&lt;User&gt;</code>
    * _static_
        * [.get(notificationId)](#sockbot.providers.nodebb.module_Notification..Notification.get) ⇒ <code>Promise.&lt;Notification&gt;</code>
        * [.parse(payload)](#sockbot.providers.nodebb.module_Notification..Notification.parse) ⇒ <code>Notification</code>
        * [.getNotifications(eachNotification)](#sockbot.providers.nodebb.module_Notification..Notification.getNotifications) ⇒ <code>Promise</code>
        * [.activate()](#sockbot.providers.nodebb.module_Notification..Notification.activate)
        * [.deactivate()](#sockbot.providers.nodebb.module_Notification..Notification.deactivate)

<a name="new_sockbot.providers.nodebb.module_Notification..Notification_new"></a>

#### new Notification(payload)
Construct a Notification object from payload

This constructor is intended to be private use only, if you need to construct a notification from payload
data use `Notification.parse()` instead


| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | Payload to construct the Notification object out of |

<a name="sockbot.providers.nodebb.module_Notification..Notification+id"></a>

#### notification.id : <code>string</code>
Unique notification id of this notification

**Kind**: instance property of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Access**: public  
<a name="sockbot.providers.nodebb.module_Notification..Notification+postId"></a>

#### notification.postId : <code>number</code>
Post id this notification refers to

**Kind**: instance property of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Access**: public  
<a name="sockbot.providers.nodebb.module_Notification..Notification+topicId"></a>

#### notification.topicId : <code>number</code>
Topic id this post refers to

**Kind**: instance property of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Access**: public  
<a name="sockbot.providers.nodebb.module_Notification..Notification+categoryId"></a>

#### notification.categoryId : <code>number</code>
Category id this post refers to

**Kind**: instance property of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Access**: public  
<a name="sockbot.providers.nodebb.module_Notification..Notification+userId"></a>

#### notification.userId : <code>number</code>
User id that generated this notification

**Kind**: instance property of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Access**: public  
<a name="sockbot.providers.nodebb.module_Notification..Notification+type"></a>

#### notification.type : <code>notificationType</code>
Notification type code

**Kind**: instance property of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Access**: public  
<a name="sockbot.providers.nodebb.module_Notification..Notification+subtype"></a>

#### notification.subtype : <code>string</code>
Notification subtype

**Kind**: instance property of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Access**: public  
<a name="sockbot.providers.nodebb.module_Notification..Notification+read"></a>

#### notification.read : <code>boolean</code>
Is this notification read yet?

**Kind**: instance property of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Access**: public  
<a name="sockbot.providers.nodebb.module_Notification..Notification+date"></a>

#### notification.date : <code>Date</code>
Datetime this notification was generated on

**Kind**: instance property of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Access**: public  
<a name="sockbot.providers.nodebb.module_Notification..Notification+label"></a>

#### notification.label : <code>string</code>
Notification label

**Kind**: instance property of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Access**: public  
<a name="sockbot.providers.nodebb.module_Notification..Notification+body"></a>

#### notification.body : <code>string</code>
Content of notification.

**Kind**: instance property of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Access**: public  
<a name="sockbot.providers.nodebb.module_Notification..Notification+getText"></a>

#### notification.getText() ⇒ <code>Promise.&lt;string&gt;</code>
HTML Markup for this notification body

**Kind**: instance method of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Returns**: <code>Promise.&lt;string&gt;</code> - Resolves to the notification markup  
**Access**: public  
**Promise**:   
**Fulfill**: the Notification markup  
<a name="sockbot.providers.nodebb.module_Notification..Notification+url"></a>

#### notification.url() ⇒ <code>Promise.&lt;string&gt;</code>
URL Link for the notification if available

**Kind**: instance method of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Returns**: <code>Promise.&lt;string&gt;</code> - Resolves to the URL for the post the notification is for  
**Access**: public  
**Promise**:   
**Fullfil**: <code>string</code> The URL for the post the notification is for  
<a name="sockbot.providers.nodebb.module_Notification..Notification+getPost"></a>

#### notification.getPost() ⇒ <code>Promise.&lt;Post&gt;</code>
Get the post this Notification refers to

**Kind**: instance method of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the post the notification refers to  
**Access**: public  
**Promise**:   
**Fulfill**: <code>Post</code> the Post the notification refers to  
<a name="sockbot.providers.nodebb.module_Notification..Notification+getTopic"></a>

#### notification.getTopic() ⇒ <code>Promise.&lt;Topic&gt;</code>
Get the topic this Notification refers to

**Kind**: instance method of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Returns**: <code>Promise.&lt;Topic&gt;</code> - Resolves to the topic the notification refers to  
**Access**: public  
**Promise**:   
**Fulfill**: <code>Topic</code> the Topic the notification refers to  
<a name="sockbot.providers.nodebb.module_Notification..Notification+getUser"></a>

#### notification.getUser() ⇒ <code>Promise.&lt;User&gt;</code>
Get the user who generated this Notification

**Kind**: instance method of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Returns**: <code>Promise.&lt;User&gt;</code> - Resolves to the user who generated this notification  
**Access**: public  
**Promise**:   
**Fulfill**: <code>Post</code> the User who generated this notification  
<a name="sockbot.providers.nodebb.module_Notification..Notification.get"></a>

#### Notification.get(notificationId) ⇒ <code>Promise.&lt;Notification&gt;</code>
Get a notification

**Kind**: static method of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Returns**: <code>Promise.&lt;Notification&gt;</code> - resolves to the retrieved notification  
**Access**: public  
**Promise**:   
**Fulfill**: <code>Notification</code> the retrieved notification  

| Param | Type | Description |
| --- | --- | --- |
| notificationId | <code>string</code> | The id of the notification to get |

<a name="sockbot.providers.nodebb.module_Notification..Notification.parse"></a>

#### Notification.parse(payload) ⇒ <code>Notification</code>
Parse a notification from a given payload

**Kind**: static method of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Returns**: <code>Notification</code> - the parsed notification  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | The notification payload |

<a name="sockbot.providers.nodebb.module_Notification..Notification.getNotifications"></a>

#### Notification.getNotifications(eachNotification) ⇒ <code>Promise</code>
Get all notifications

**Kind**: static method of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
**Returns**: <code>Promise</code> - Fulfills after notifications are processed  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| eachNotification | <code>NotificationProcessor</code> | Function to process notifications |

<a name="sockbot.providers.nodebb.module_Notification..Notification.activate"></a>

#### Notification.activate()
Activate notifications.

Listen for new notifications and process ones that arrive

**Kind**: static method of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
<a name="sockbot.providers.nodebb.module_Notification..Notification.deactivate"></a>

#### Notification.deactivate()
Deactivate notifications

Stop listening for new notifcations.

**Kind**: static method of [<code>Notification</code>](#sockbot.providers.nodebb.module_Notification..Notification)  
