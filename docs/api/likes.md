<a name="module_likes"></a>
## likes
Likes module. The  autoliker


* [likes](#module_likes)
  * _static_
    * [.description](#module_likes.description)
    * [.configuration](#module_likes.configuration) : <code>Object</code>
      * [.enabled](#module_likes.configuration.enabled) : <code>Boolean</code>
      * [.follow](#module_likes.configuration.follow) : <code>Boolean</code>
      * [.binge](#module_likes.configuration.binge) : <code>Boolean</code>
      * [.bingeHour](#module_likes.configuration.bingeHour) : <code>Number</code>
      * [.bingeMinute](#module_likes.configuration.bingeMinute) : <code>Number</code>
      * [.bingeCap](#module_likes.configuration.bingeCap) : <code>Number</code>
      * [.topic](#module_likes.configuration.topic) : <code>Number</code>
      * [.cyborgDelay](#module_likes.configuration.cyborgDelay) : <code>Number</code>
    * [.name](#module_likes.name)
    * [.priority](#module_likes.priority)
    * [.version](#module_likes.version)
    * [.onMessage(message, post, callback)](#module_likes.onMessage)
    * [.registerListeners(callback)](#module_likes.registerListeners)
    * [.begin(browser, config)](#module_likes.begin)
  * _inner_
    * [~format(str, dict)](#module_likes..format) ⇒ <code>String</code>
    * [~binge(callback)](#module_likes..binge)
    * [~innerBinge(topic, callback)](#module_likes..innerBinge)
    * [~scheduleBinges()](#module_likes..scheduleBinges)

<a name="module_likes.description"></a>
### likes.description
Brief description of this module for Help Docs

**Kind**: static property of <code>[likes](#module_likes)</code>  
<a name="module_likes.configuration"></a>
### likes.configuration : <code>Object</code>
Default Configuration settings for this sock_module

**Kind**: static property of <code>[likes](#module_likes)</code>  

  * [.configuration](#module_likes.configuration) : <code>Object</code>
    * [.enabled](#module_likes.configuration.enabled) : <code>Boolean</code>
    * [.follow](#module_likes.configuration.follow) : <code>Boolean</code>
    * [.binge](#module_likes.configuration.binge) : <code>Boolean</code>
    * [.bingeHour](#module_likes.configuration.bingeHour) : <code>Number</code>
    * [.bingeMinute](#module_likes.configuration.bingeMinute) : <code>Number</code>
    * [.bingeCap](#module_likes.configuration.bingeCap) : <code>Number</code>
    * [.topic](#module_likes.configuration.topic) : <code>Number</code>
    * [.cyborgDelay](#module_likes.configuration.cyborgDelay) : <code>Number</code>

<a name="module_likes.configuration.enabled"></a>
#### configuration.enabled : <code>Boolean</code>
Whether this module should be enabled

**Kind**: static property of <code>[configuration](#module_likes.configuration)</code>  
<a name="module_likes.configuration.follow"></a>
#### configuration.follow : <code>Boolean</code>
Whether this should... something involving following. Imprint on mother ducks?

**Kind**: static property of <code>[configuration](#module_likes.configuration)</code>  
<a name="module_likes.configuration.binge"></a>
#### configuration.binge : <code>Boolean</code>
Whether this module should binge-like to catch up on things you didn't like while it was down

**Kind**: static property of <code>[configuration](#module_likes.configuration)</code>  
<a name="module_likes.configuration.bingeHour"></a>
#### configuration.bingeHour : <code>Number</code>
The hour at which to binge-like

**Kind**: static property of <code>[configuration](#module_likes.configuration)</code>  
<a name="module_likes.configuration.bingeMinute"></a>
#### configuration.bingeMinute : <code>Number</code>
The minute at which to binge-like

**Kind**: static property of <code>[configuration](#module_likes.configuration)</code>  
<a name="module_likes.configuration.bingeCap"></a>
#### configuration.bingeCap : <code>Number</code>
Maximum amout of posts to like while binging

**Kind**: static property of <code>[configuration](#module_likes.configuration)</code>  
<a name="module_likes.configuration.topic"></a>
#### configuration.topic : <code>Number</code>
The topic to auto-like. Defaults to /t/1000

**Kind**: static property of <code>[configuration](#module_likes.configuration)</code>  
<a name="module_likes.configuration.cyborgDelay"></a>
#### configuration.cyborgDelay : <code>Number</code>
How long to delay before liking in cyborg mode.

**Kind**: static property of <code>[configuration](#module_likes.configuration)</code>  
<a name="module_likes.name"></a>
### likes.name
The name of this sock_module

**Kind**: static property of <code>[likes](#module_likes)</code>  
<a name="module_likes.priority"></a>
### likes.priority
If defined by a sock_module it is the priority
of the module with respect to other modules.

sock_modules **should not** define modules with negative permissions.
Default value is 50 with lower numbers being higher priority.

**Kind**: static property of <code>[likes](#module_likes)</code>  
<a name="module_likes.version"></a>
### likes.version
The version of this sock_module

**Kind**: static property of <code>[likes](#module_likes)</code>  
<a name="module_likes.onMessage"></a>
### likes.onMessage(message, post, callback)
Handler for when a message is received. If it is a new post creation message in the correct thread, 
the module will like it.

**Kind**: static method of <code>[likes](#module_likes)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Object</code> | The message that was received |
| post | <code>Object</code> | The post information for that message |
| callback | <code>function</code> | The callback to call when done |

<a name="module_likes.registerListeners"></a>
### likes.registerListeners(callback)
Register listeners that do the following if we are in follow mode

**Kind**: static method of <code>[likes](#module_likes)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | the callback to call when complete |

<a name="module_likes.begin"></a>
### likes.begin(browser, config)
Bootstrap the module

**Kind**: static method of <code>[likes](#module_likes)</code>  

| Param | Type | Description |
| --- | --- | --- |
| browser | <code>string</code> | discourse. |
| config | <code>object</code> | The configuration to use |

<a name="module_likes..format"></a>
### likes~format(str, dict) ⇒ <code>String</code>
Replaces variables in formatting strings, kind of like printf

**Kind**: inner method of <code>[likes](#module_likes)</code>  
**Returns**: <code>String</code> - the message after replacement  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>String</code> | The string to format |
| dict | <code>Array</code> | The variables to format into the string |

<a name="module_likes..binge"></a>
### likes~binge(callback)
Wrapper that standardizes parameters for innerBinge. Will binge on either one topic or many.

**Kind**: inner method of <code>[likes](#module_likes)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The callback to call when done binging |

<a name="module_likes..innerBinge"></a>
### likes~innerBinge(topic, callback)
Perform a binge-liking.

**Kind**: inner method of <code>[likes](#module_likes)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topic | <code>Number</code> | The topic number to binge-like on |
| callback | <code>function</code> | the callback to call when done binging |

<a name="module_likes..scheduleBinges"></a>
### likes~scheduleBinges()
Schedule new binges according to configuration

**Kind**: inner method of <code>[likes](#module_likes)</code>  
