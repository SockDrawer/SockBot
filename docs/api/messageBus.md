<a name="module_messageBus"></a>
## messageBus
Used for dealing with long poll notifications from discourse.

**Author:** Accalia  
**License**: MIT  

* [messageBus](#module_messageBus)
  * [~modules](#module_messageBus..modules)
  * [~registrations](#module_messageBus..registrations) : <code>Object.&lt;string, Registration&gt;</code>
  * [~channels](#module_messageBus..channels) : <code>Object.&lt;string, number&gt;</code>
  * [~TL1Timer](#module_messageBus..TL1Timer) : <code>Object.&lt;string, datetime&gt;</code>
  * [~notifyTime](#module_messageBus..notifyTime) : <code>datetime</code>
  * [~notifyTypes](#module_messageBus..notifyTypes) : <code>enum</code>
  * [~messageInfo](#module_messageBus..messageInfo)
    * [.poll](#module_messageBus..messageInfo.poll) : <code>datetime</code>
    * [.message](#module_messageBus..messageInfo.message) : <code>Message</code>
    * [.time](#module_messageBus..messageInfo.time) : <code>datetime</code>
    * [.module](#module_messageBus..messageInfo.module) : <code>string</code>
    * [.moduleTime](#module_messageBus..messageInfo.moduleTime) : <code>datetime</code>
  * [~responsive](#module_messageBus..responsive) : <code>boolean</code>
  * [~notificationTime](#module_messageBus..notificationTime) : <code>datetime</code>
  * [~handleMessage(message, post, callback)](#module_messageBus..handleMessage)
  * [~completed](#module_messageBus..completed) : <code>function</code>
  * [~onMessage](#module_messageBus..onMessage) : <code>function</code>
  * [~Registration](#module_messageBus..Registration) : <code>object</code>

<a name="module_messageBus..modules"></a>
### messageBus~modules
List of active Modules

**Kind**: inner property of <code>[messageBus](#module_messageBus)</code>  
<a name="module_messageBus..registrations"></a>
### messageBus~registrations : <code>Object.&lt;string, Registration&gt;</code>
Channel/Module registrations

**Kind**: inner property of <code>[messageBus](#module_messageBus)</code>  
<a name="module_messageBus..channels"></a>
### messageBus~channels : <code>Object.&lt;string, number&gt;</code>
Channels that message-bus is listenting to

**Kind**: inner property of <code>[messageBus](#module_messageBus)</code>  
<a name="module_messageBus..TL1Timer"></a>
### messageBus~TL1Timer : <code>Object.&lt;string, datetime&gt;</code>
TL1 cooldown timer

**Kind**: inner property of <code>[messageBus](#module_messageBus)</code>  
<a name="module_messageBus..notifyTime"></a>
### messageBus~notifyTime : <code>datetime</code>
Last time Notifications were polled. Used for watchdog.

**Kind**: inner property of <code>[messageBus](#module_messageBus)</code>  
<a name="module_messageBus..notifyTypes"></a>
### messageBus~notifyTypes : <code>enum</code>
Notification type Ids to Names

**Kind**: inner enum property of <code>[messageBus](#module_messageBus)</code>  
**Read only**: true  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| 1 | <code>string</code> | <code>&quot;mentioned&quot;</code> | 
| 2 | <code>string</code> | <code>&quot;replied&quot;</code> | 
| 3 | <code>string</code> | <code>&quot;quoted&quot;</code> | 
| 4 | <code>string</code> | <code>&quot;edited&quot;</code> | 
| 5 | <code>string</code> | <code>&quot;liked&quot;</code> | 
| 6 | <code>string</code> | <code>&quot;private_message&quot;</code> | 
| 7 | <code>string</code> | <code>&quot;invited_to_private_message&quot;</code> | 
| 8 | <code>string</code> | <code>&quot;invitee_accepted&quot;</code> | 
| 9 | <code>string</code> | <code>&quot;posted&quot;</code> | 
| 10 | <code>string</code> | <code>&quot;moved_post&quot;</code> | 
| 11 | <code>string</code> | <code>&quot;linked&quot;</code> | 
| 12 | <code>string</code> | <code>&quot;granted_badge&quot;</code> | 

<a name="module_messageBus..messageInfo"></a>
### messageBus~messageInfo
Information about currently processing message.
Used for watchdog

**Kind**: inner property of <code>[messageBus](#module_messageBus)</code>  

* [~messageInfo](#module_messageBus..messageInfo)
  * [.poll](#module_messageBus..messageInfo.poll) : <code>datetime</code>
  * [.message](#module_messageBus..messageInfo.message) : <code>Message</code>
  * [.time](#module_messageBus..messageInfo.time) : <code>datetime</code>
  * [.module](#module_messageBus..messageInfo.module) : <code>string</code>
  * [.moduleTime](#module_messageBus..messageInfo.moduleTime) : <code>datetime</code>

<a name="module_messageBus..messageInfo.poll"></a>
#### messageInfo.poll : <code>datetime</code>
Time message-bus was polled

**Kind**: static property of <code>[messageInfo](#module_messageBus..messageInfo)</code>  
<a name="module_messageBus..messageInfo.message"></a>
#### messageInfo.message : <code>Message</code>
Message that is being processed

**Kind**: static property of <code>[messageInfo](#module_messageBus..messageInfo)</code>  
<a name="module_messageBus..messageInfo.time"></a>
#### messageInfo.time : <code>datetime</code>
Time message started processing

**Kind**: static property of <code>[messageInfo](#module_messageBus..messageInfo)</code>  
<a name="module_messageBus..messageInfo.module"></a>
#### messageInfo.module : <code>string</code>
Currently processing module name

**Kind**: static property of <code>[messageInfo](#module_messageBus..messageInfo)</code>  
<a name="module_messageBus..messageInfo.moduleTime"></a>
#### messageInfo.moduleTime : <code>datetime</code>
Time module started processing

**Kind**: static property of <code>[messageInfo](#module_messageBus..messageInfo)</code>  
<a name="module_messageBus..responsive"></a>
### messageBus~responsive : <code>boolean</code>
Set to indicate that bot is active. Used by warchdog

**Kind**: inner property of <code>[messageBus](#module_messageBus)</code>  
<a name="module_messageBus..notificationTime"></a>
### messageBus~notificationTime : <code>datetime</code>
Time /notifications was last polled. Used by watchdog

**Kind**: inner property of <code>[messageBus](#module_messageBus)</code>  
<a name="module_messageBus..handleMessage"></a>
### messageBus~handleMessage(message, post, callback)
Handle a message

**Kind**: inner method of <code>[messageBus](#module_messageBus)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to handle |
| post | <code>string</code> | Some sort of post |
| callback | <code>function</code> | The callback to call after the  message has been handled |

<a name="module_messageBus..completed"></a>
### messageBus~completed : <code>function</code>
Completion callback for a message handler

**Kind**: inner typedef of <code>[messageBus](#module_messageBus)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Exception</code> &#124; <code>string</code> | Error encountered in processing |
| handled | <code>boolean</code> | True to stop processing message |

<a name="module_messageBus..onMessage"></a>
### messageBus~onMessage : <code>function</code>
Handle a message Received

**Kind**: inner typedef of <code>[messageBus](#module_messageBus)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Message</code> | Discourse Message Object |
| post | <code>Post</code> | Discourse Post message refers to |
| callback | <code>completed</code> | Completion Callback |

<a name="module_messageBus..Registration"></a>
### messageBus~Registration : <code>object</code>
**Kind**: inner typedef of <code>[messageBus](#module_messageBus)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of registration |
| onMessage | <code>onMessage</code> | Message handler |

