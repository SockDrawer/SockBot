<a name="module_trust"></a>
## trust
Trust level report generation module


* [trust](#module_trust)
  * _static_
    * [.name](#module_trust.name) : <code>String</code>
    * [.version](#module_trust.version) : <code>String</code>
    * [.description](#module_trust.description) : <code>String</code>
    * [.configuration](#module_trust.configuration) : <code>Object</code>
      * [.enabled](#module_trust.configuration.enabled) : <code>Boolean</code>
    * [.begin(browser, config)](#module_trust.begin)
    * [.onNotify(type, notification, topic, post, callback)](#module_trust.onNotify)
  * _inner_
    * [~promotionTable](#module_trust..promotionTable) : <code>Object</code>
    * [~formatReport(user)](#module_trust..formatReport) ⇒ <code>String</code>
    * [~getReportBase(user)](#module_trust..getReportBase) ⇒ <code>String</code>
    * [~promotionAnalysis(user)](#module_trust..promotionAnalysis) ⇒ <code>String</code>

<a name="module_trust.name"></a>
### trust.name : <code>String</code>
The name of the sockbot module

**Kind**: static property of <code>[trust](#module_trust)</code>  
<a name="module_trust.version"></a>
### trust.version : <code>String</code>
The version of this sockbot module

**Kind**: static property of <code>[trust](#module_trust)</code>  
<a name="module_trust.description"></a>
### trust.description : <code>String</code>
Description of the module, for help text

**Kind**: static property of <code>[trust](#module_trust)</code>  
<a name="module_trust.configuration"></a>
### trust.configuration : <code>Object</code>
Configuration options

**Kind**: static property of <code>[trust](#module_trust)</code>  
<a name="module_trust.configuration.enabled"></a>
#### configuration.enabled : <code>Boolean</code>
Is the module enabled?

**Kind**: static property of <code>[configuration](#module_trust.configuration)</code>  
<a name="module_trust.begin"></a>
### trust.begin(browser, config)
Bootstrap the module

**Kind**: static method of <code>[trust](#module_trust)</code>  

| Param | Type | Description |
| --- | --- | --- |
| browser | <code>string</code> | discourse. |
| config | <code>object</code> | The configuration to use |

<a name="module_trust.onNotify"></a>
### trust.onNotify(type, notification, topic, post, callback)
Runs on notification. Only responds to private_message, mention, or reply.
This also only replies to requests for your own report unless you're TL4 or higher.

**Kind**: static method of <code>[trust](#module_trust)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of event. |
| notification | <code>string</code> | The notification to respond to |
| topic | <code>string</code> | Unused. |
| post | <code>string</code> | The post the notification was for |
| callback | <code>function</code> | The callback to notify when processing is complete. |

<a name="module_trust..promotionTable"></a>
### trust~promotionTable : <code>Object</code>
List of description text for a given promotion table

**Kind**: inner property of <code>[trust](#module_trust)</code>  
<a name="module_trust..formatReport"></a>
### trust~formatReport(user) ⇒ <code>String</code>
Format the report to send out.

**Kind**: inner method of <code>[trust](#module_trust)</code>  
**Returns**: <code>String</code> - The report text, formatted pretty  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | The user whose report this is for |

<a name="module_trust..getReportBase"></a>
### trust~getReportBase(user) ⇒ <code>String</code>
Get the basic report information for the user

**Kind**: inner method of <code>[trust](#module_trust)</code>  
**Returns**: <code>String</code> - The information about the user  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | Basic info about the user |

<a name="module_trust..promotionAnalysis"></a>
### trust~promotionAnalysis(user) ⇒ <code>String</code>
Get information about the trust level for the user

**Kind**: inner method of <code>[trust](#module_trust)</code>  
**Returns**: <code>String</code> - The promotion text for that user.  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | The user to get information about |

