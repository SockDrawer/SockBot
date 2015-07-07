<a name="module_sumon"></a>
## sumon
Sumon module. Summons the bot.


* [sumon](#module_sumon)
  * [.description](#module_sumon.description)
  * [.configuration](#module_sumon.configuration) : <code>Object</code>
    * [.enabled](#module_sumon.configuration.enabled) : <code>Boolean</code>
    * [.autoTimeout](#module_sumon.configuration.autoTimeout) : <code>Number</code>
    * [.userTimeout](#module_sumon.configuration.userTimeout) : <code>Number</code>
    * [.probability](#module_sumon.configuration.probability) : <code>Number</code>
    * [.messages](#module_sumon.configuration.messages) : <code>Array</code>
  * [.name](#module_sumon.name)
  * [.priority](#module_sumon.priority)
  * [.version](#module_sumon.version)
  * [.onNotify(type, notification, topic, post, callback)](#module_sumon.onNotify)
  * [.begin(browser, config)](#module_sumon.begin)

<a name="module_sumon.description"></a>
### sumon.description
Brief description of this module for Help Docs

**Kind**: static property of <code>[sumon](#module_sumon)</code>  
<a name="module_sumon.configuration"></a>
### sumon.configuration : <code>Object</code>
Default Configuration settings for this sock_module

**Kind**: static property of <code>[sumon](#module_sumon)</code>  

* [.configuration](#module_sumon.configuration) : <code>Object</code>
  * [.enabled](#module_sumon.configuration.enabled) : <code>Boolean</code>
  * [.autoTimeout](#module_sumon.configuration.autoTimeout) : <code>Number</code>
  * [.userTimeout](#module_sumon.configuration.userTimeout) : <code>Number</code>
  * [.probability](#module_sumon.configuration.probability) : <code>Number</code>
  * [.messages](#module_sumon.configuration.messages) : <code>Array</code>

<a name="module_sumon.configuration.enabled"></a>
#### configuration.enabled : <code>Boolean</code>
Is the module enabled?

**Kind**: static property of <code>[configuration](#module_sumon.configuration)</code>  
<a name="module_sumon.configuration.autoTimeout"></a>
#### configuration.autoTimeout : <code>Number</code>
What's the timeout for backfilling old summons

**Kind**: static property of <code>[configuration](#module_sumon.configuration)</code>  
<a name="module_sumon.configuration.userTimeout"></a>
#### configuration.userTimeout : <code>Number</code>
Unused

**Kind**: static property of <code>[configuration](#module_sumon.configuration)</code>  
<a name="module_sumon.configuration.probability"></a>
#### configuration.probability : <code>Number</code>
How likely it is that the bot will respond to summons. 
Probability is between 0 and 1

**Kind**: static property of <code>[configuration](#module_sumon.configuration)</code>  
<a name="module_sumon.configuration.messages"></a>
#### configuration.messages : <code>Array</code>
Messages to use when being summoned.

**Kind**: static property of <code>[configuration](#module_sumon.configuration)</code>  
<a name="module_sumon.name"></a>
### sumon.name
The name of this sock_module

**Kind**: static property of <code>[sumon](#module_sumon)</code>  
<a name="module_sumon.priority"></a>
### sumon.priority
If defined by a sock_module it is the priority
of the module with respect to other modules.

sock_modules **should not** define modules with negative permissions.
Default value is 50 with lower numbers being higher priority.

**Kind**: static property of <code>[sumon](#module_sumon)</code>  
<a name="module_sumon.version"></a>
### sumon.version
The version of this sock_module

**Kind**: static property of <code>[sumon](#module_sumon)</code>  
<a name="module_sumon.onNotify"></a>
### sumon.onNotify(type, notification, topic, post, callback)
Runs on notification. Uses a random chance of appearing to determine if it should appear or not, 
controlled by the module configuration.

**Kind**: static method of <code>[sumon](#module_sumon)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of event. Only responds if this is 'mentioned' |
| notification | <code>string</code> | The notification to respond to |
| topic | <code>string</code> | Unused. |
| post | <code>string</code> | The post the notification was for |
| callback | <code>function</code> | The callback to notify when processing is complete. |

<a name="module_sumon.begin"></a>
### sumon.begin(browser, config)
Bootstrap the module

**Kind**: static method of <code>[sumon](#module_sumon)</code>  

| Param | Type | Description |
| --- | --- | --- |
| browser | <code>string</code> | discourse. |
| config | <code>object</code> | The configuration to use |

