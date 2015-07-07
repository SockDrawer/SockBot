<a name="module_emoji"></a>
## emoji
MobileEmoji module. Responsible for automatically replacing emoji with Discourse emoji codes


* [emoji](#module_emoji)
  * [.description](#module_emoji.description)
  * [.configuration](#module_emoji.configuration)
  * [.name](#module_emoji.name)
  * [.priority](#module_emoji.priority)
  * [.version](#module_emoji.version)
  * [.begin(browser, config)](#module_emoji.begin)
  * [.registerListeners(callback)](#module_emoji.registerListeners)
  * [.onMessage(message, post, callback)](#module_emoji.onMessage)

<a name="module_emoji.description"></a>
### emoji.description
Description of the module

**Kind**: static property of <code>[emoji](#module_emoji)</code>  
<a name="module_emoji.configuration"></a>
### emoji.configuration
Configuration properties.

**Kind**: static property of <code>[emoji](#module_emoji)</code>  
**Properties**

| Name | Description |
| --- | --- |
| enabled | Whether to use MobileEmoji or not. Defaults to false. |

<a name="module_emoji.name"></a>
### emoji.name
Name of the module

**Kind**: static property of <code>[emoji](#module_emoji)</code>  
<a name="module_emoji.priority"></a>
### emoji.priority
Priority of the module

**Kind**: static property of <code>[emoji](#module_emoji)</code>  
<a name="module_emoji.version"></a>
### emoji.version
Module version

**Kind**: static property of <code>[emoji](#module_emoji)</code>  
<a name="module_emoji.begin"></a>
### emoji.begin(browser, config)
Bootstrap the module.

**Kind**: static method of <code>[emoji](#module_emoji)</code>  

| Param | Type | Description |
| --- | --- | --- |
| browser | <code>object</code> | The Discourse interface object |
| config | <code>object</code> | The SockBot config object |

<a name="module_emoji.registerListeners"></a>
### emoji.registerListeners(callback)
Register the required listeners.

**Kind**: static method of <code>[emoji](#module_emoji)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The callback to use once the action is complete |

<a name="module_emoji.onMessage"></a>
### emoji.onMessage(message, post, callback)
Handle received messages.

**Kind**: static method of <code>[emoji](#module_emoji)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | An object representing the message that was received |
| post | <code>object</code> | An object representing the post that the message was about |
| callback | <code>function</code> | The callback to use once the action is complete |

