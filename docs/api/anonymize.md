<a name="module_anonymize"></a>
## anonymize
Anonymize module. Responsible for allowing anonymous users to "puppet" the bot, making it speak instead of them.


* [anonymize](#module_anonymize)
  * [.description](#module_anonymize.description)
  * [.configuration](#module_anonymize.configuration)
  * [.name](#module_anonymize.name)
  * [.priority](#module_anonymize.priority)
  * [.version](#module_anonymize.version)
  * [.begin(browser, config)](#module_anonymize.begin)
  * [.onNotify(type, notification, topic, post, callback)](#module_anonymize.onNotify)

<a name="module_anonymize.description"></a>
### anonymize.description
Description of the module

**Kind**: static property of <code>[anonymize](#module_anonymize)</code>  
<a name="module_anonymize.configuration"></a>
### anonymize.configuration
Configuration properties.

**Kind**: static property of <code>[anonymize](#module_anonymize)</code>  
**Properties**

| Name | Description |
| --- | --- |
| enabled | Whether to use anonymizer or not. Defaults to false. |

<a name="module_anonymize.name"></a>
### anonymize.name
Name of the module

**Kind**: static property of <code>[anonymize](#module_anonymize)</code>  
<a name="module_anonymize.priority"></a>
### anonymize.priority
Priority of the module

**Kind**: static property of <code>[anonymize](#module_anonymize)</code>  
<a name="module_anonymize.version"></a>
### anonymize.version
Module version

**Kind**: static property of <code>[anonymize](#module_anonymize)</code>  
<a name="module_anonymize.begin"></a>
### anonymize.begin(browser, config)
Bootstrap the module.

**Kind**: static method of <code>[anonymize](#module_anonymize)</code>  

| Param | Type | Description |
| --- | --- | --- |
| browser | <code>string</code> | The browser I guess? |
| config | <code>object</code> | The config I guess? |

<a name="module_anonymize.onNotify"></a>
### anonymize.onNotify(type, notification, topic, post, callback)
Runs on notification. If the anonymizer is not enabled or there's no quote, 
it early aborts. Otherwise, it sends a post to the quote's topic containing 
the text.

**Kind**: static method of <code>[anonymize](#module_anonymize)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of event. Only responds if this is 'private_message' |
| notification | <code>string</code> | The notification to respond to |
| topic | <code>string</code> | Unused. |
| post | <code>string</code> | The post the notification was for |
| callback | <code>function</code> | The callback to notify when processing is complete. |

