<a name="module_trwtf"></a>
## trwtf
TRWTF module. Tells people they are TRWTF


* [trwtf](#module_trwtf)
  * [.description](#module_trwtf.description) : <code>String</code>
  * [.configuration](#module_trwtf.configuration) : <code>Object</code>
  * [.name](#module_trwtf.name) : <code>String</code>
  * [.priority](#module_trwtf.priority) : <code>Number</code>
  * [.version](#module_trwtf.version) : <code>String</code>
  * [.onNotify(type, notification, topic, post, callback)](#module_trwtf.onNotify)
  * [.begin(browser, config)](#module_trwtf.begin)

<a name="module_trwtf.description"></a>
### trwtf.description : <code>String</code>
Brief description of this module for Help Docs

**Kind**: static property of <code>[trwtf](#module_trwtf)</code>  
<a name="module_trwtf.configuration"></a>
### trwtf.configuration : <code>Object</code>
Default Configuration settings for this sock_module

**Kind**: static property of <code>[trwtf](#module_trwtf)</code>  
<a name="module_trwtf.name"></a>
### trwtf.name : <code>String</code>
The name of this sock_module

**Kind**: static property of <code>[trwtf](#module_trwtf)</code>  
<a name="module_trwtf.priority"></a>
### trwtf.priority : <code>Number</code>
If defined by a sock_module it is the priority
of the module with respect to other modules.

sock_modules **should not** define modules with negative permissions.
Default value is 50 with lower numbers being higher priority.

**Kind**: static property of <code>[trwtf](#module_trwtf)</code>  
<a name="module_trwtf.version"></a>
### trwtf.version : <code>String</code>
The version of this sock_module

**Kind**: static property of <code>[trwtf](#module_trwtf)</code>  
<a name="module_trwtf.onNotify"></a>
### trwtf.onNotify(type, notification, topic, post, callback)
Runs on notification. If there is a mention of this bot, replies with the canned text.

**Kind**: static method of <code>[trwtf](#module_trwtf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of event. Only responds if this is 'mentioned' |
| notification | <code>string</code> | The notification to respond to |
| topic | <code>string</code> | Unused. |
| post | <code>string</code> | The post the notification was for |
| callback | <code>function</code> | The callback to notify when processing is complete. |

<a name="module_trwtf.begin"></a>
### trwtf.begin(browser, config)
Bootstrap the module

**Kind**: static method of <code>[trwtf](#module_trwtf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| browser | <code>string</code> | discourse. |
| config | <code>object</code> | The configuration to use |

