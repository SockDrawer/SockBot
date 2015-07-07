<a name="module_eliza"></a>
## eliza
Elizabot - a virtual therapist.


* [eliza](#module_eliza)
  * [.description](#module_eliza.description)
  * [.configuration](#module_eliza.configuration)
    * [.enabled](#module_eliza.configuration.enabled) : <code>Boolean</code>
    * [.autoTimeout](#module_eliza.configuration.autoTimeout) : <code>Number</code>
    * [.userTimeout](#module_eliza.configuration.userTimeout) : <code>Number</code>
    * [.waitTime](#module_eliza.configuration.waitTime) : <code>Number</code>
    * [.probability](#module_eliza.configuration.probability) : <code>Number</code>
    * [.vocabulary](#module_eliza.configuration.vocabulary) : <code>String</code>
  * [.name](#module_eliza.name)
  * [.priority](#module_eliza.priority)
  * [.version](#module_eliza.version)
  * [.onNotify(type, notification, topic, post, callback)](#module_eliza.onNotify)
  * [.begin(browser, config)](#module_eliza.begin)

<a name="module_eliza.description"></a>
### eliza.description
Brief description of this module for Help Docs

**Kind**: static property of <code>[eliza](#module_eliza)</code>  
<a name="module_eliza.configuration"></a>
### eliza.configuration
Default Configuration settings for this sock_module

**Kind**: static property of <code>[eliza](#module_eliza)</code>  

* [.configuration](#module_eliza.configuration)
  * [.enabled](#module_eliza.configuration.enabled) : <code>Boolean</code>
  * [.autoTimeout](#module_eliza.configuration.autoTimeout) : <code>Number</code>
  * [.userTimeout](#module_eliza.configuration.userTimeout) : <code>Number</code>
  * [.waitTime](#module_eliza.configuration.waitTime) : <code>Number</code>
  * [.probability](#module_eliza.configuration.probability) : <code>Number</code>
  * [.vocabulary](#module_eliza.configuration.vocabulary) : <code>String</code>

<a name="module_eliza.configuration.enabled"></a>
#### configuration.enabled : <code>Boolean</code>
Whether to enable this bot

**Kind**: static property of <code>[configuration](#module_eliza.configuration)</code>  
<a name="module_eliza.configuration.autoTimeout"></a>
#### configuration.autoTimeout : <code>Number</code>
The default timeout

**Kind**: static property of <code>[configuration](#module_eliza.configuration)</code>  
<a name="module_eliza.configuration.userTimeout"></a>
#### configuration.userTimeout : <code>Number</code>
Timeout per user

**Kind**: static property of <code>[configuration](#module_eliza.configuration)</code>  
<a name="module_eliza.configuration.waitTime"></a>
#### configuration.waitTime : <code>Number</code>
WAit time for a reply

**Kind**: static property of <code>[configuration](#module_eliza.configuration)</code>  
<a name="module_eliza.configuration.probability"></a>
#### configuration.probability : <code>Number</code>
Probability of answering, from 0 to 1

**Kind**: static property of <code>[configuration](#module_eliza.configuration)</code>  
<a name="module_eliza.configuration.vocabulary"></a>
#### configuration.vocabulary : <code>String</code>
Vocabulary file is loaded via require() in elizabot.js. This implies
 the path is  relative to 'sock_modules/eliza' :(
 TODO: load data in a better way.

**Kind**: static property of <code>[configuration](#module_eliza.configuration)</code>  
<a name="module_eliza.name"></a>
### eliza.name
The name of this sock_module

**Kind**: static property of <code>[eliza](#module_eliza)</code>  
<a name="module_eliza.priority"></a>
### eliza.priority
If defined by a sock_module it is the priority
of the module with respect to other modules.

sock_modules **should not** define modules with negative permissions.
Default value is 50 with lower numbers being higher priority.

**Kind**: static property of <code>[eliza](#module_eliza)</code>  
<a name="module_eliza.version"></a>
### eliza.version
The version of this sock_module

**Kind**: static property of <code>[eliza](#module_eliza)</code>  
<a name="module_eliza.onNotify"></a>
### eliza.onNotify(type, notification, topic, post, callback)
Runs on notification. Uses a random chance of appearing to determine if it should appear or not, 
controlled by the module configuration.

**Kind**: static method of <code>[eliza](#module_eliza)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of event. Only responds if this is 'mentioned', PM, or reply |
| notification | <code>string</code> | The notification to respond to |
| topic | <code>string</code> | Unused. |
| post | <code>string</code> | The post the notification was for |
| callback | <code>function</code> | The callback to notify when processing is complete. |

<a name="module_eliza.begin"></a>
### eliza.begin(browser, config)
Bootstrap the module.

**Kind**: static method of <code>[eliza](#module_eliza)</code>  

| Param | Type | Description |
| --- | --- | --- |
| browser | <code>object</code> | The Discourse interface object |
| config | <code>object</code> | The SockBot config object |

