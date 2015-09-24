<a name="module_SockBot"></a>
## SockBot
Main Module for SockBot2.0

**Author:** Accalia  
**License**: MIT  

* [SockBot](#module_SockBot)
  * _static_
    * [.prepare(configuration, callback)](#module_SockBot.prepare)
    * [.start(callback)](#module_SockBot.start)
    * [.stop(callback)](#module_SockBot.stop)
    * [.logMessage(message)](#module_SockBot.logMessage)
    * [.logWarning(warning)](#module_SockBot.logWarning)
    * [.logError(error)](#module_SockBot.logError)
  * _inner_
    * [~doPluginRequire(module, requireIt)](#module_SockBot..doPluginRequire) ⇒ <code>object</code>
    * [~prepareEvents(callback)](#module_SockBot..prepareEvents)
    * [~loadPlugins()](#module_SockBot..loadPlugins)
    * [~loadConfig(cfg, callback)](#module_SockBot..loadConfig)
    * [~preparedCallback](#module_SockBot..preparedCallback)
    * [~completedCallback](#module_SockBot..completedCallback)

<a name="module_SockBot.prepare"></a>
### SockBot.prepare(configuration, callback)
Prepare the bot for running

**Kind**: static method of <code>[SockBot](#module_SockBot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| configuration | <code>object</code> &#124; <code>string</code> | Configuration to use. If string interpret as file path to read from |
| callback | <code>preparedCallback</code> | Completion callback |

<a name="module_SockBot.start"></a>
### SockBot.start(callback)
Start the bot

**Kind**: static method of <code>[SockBot](#module_SockBot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>completedCallback</code> | Completion Callback |

<a name="module_SockBot.stop"></a>
### SockBot.stop(callback)
Stop the event loop and signal plugins to stop

**Kind**: static method of <code>[SockBot](#module_SockBot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | Completion callback |

<a name="module_SockBot.logMessage"></a>
### SockBot.logMessage(message)
Log a message to console

**Kind**: static method of <code>[SockBot](#module_SockBot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>\*</code> | Message to log |

<a name="module_SockBot.logWarning"></a>
### SockBot.logWarning(warning)
Log a warning to console

**Kind**: static method of <code>[SockBot](#module_SockBot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| warning | <code>\*</code> | Message to log |

<a name="module_SockBot.logError"></a>
### SockBot.logError(error)
Log an error to console

**Kind**: static method of <code>[SockBot](#module_SockBot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>\*</code> | Message to log |

<a name="module_SockBot..doPluginRequire"></a>
### SockBot~doPluginRequire(module, requireIt) ⇒ <code>object</code>
Load module as plugin

**Kind**: inner method of <code>[SockBot](#module_SockBot)</code>  
**Returns**: <code>object</code> - requested module  

| Param | Type | Description |
| --- | --- | --- |
| module | <code>string</code> | Module to require |
| requireIt | <code>function</code> | nodejs core require function (for unti testing purposes is parameter) |

<a name="module_SockBot..prepareEvents"></a>
### SockBot~prepareEvents(callback)
Prepare core EventEmitter as a SockEvents object

**Kind**: inner method of <code>[SockBot](#module_SockBot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>preparedCallback</code> | Completion callback |

<a name="module_SockBot..loadPlugins"></a>
### SockBot~loadPlugins()
Load plugins based on current configuration.

**Kind**: inner method of <code>[SockBot](#module_SockBot)</code>  
<a name="module_SockBot..loadConfig"></a>
### SockBot~loadConfig(cfg, callback)
Load configuration

**Kind**: inner method of <code>[SockBot](#module_SockBot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cfg | <code>string</code> &#124; <code>object</code> | Configuration to use, if string load as filepath to configuration |
| callback | <code>completedCallback</code> | CompletionCallback |

<a name="module_SockBot..preparedCallback"></a>
### SockBot~preparedCallback
Prepared Callback

**Kind**: inner typedef of <code>[SockBot](#module_SockBot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> &#124; <code>Error</code> | Any Error encountered |
| events | <code>external.events.SockEvents</code> | SockBot's internal event emitter with added helper functions |
| pluginBrowser | <code>browser</code> | discourse communication class, will be logged into discourse once bot starts |

<a name="module_SockBot..completedCallback"></a>
### SockBot~completedCallback
Completion Callback

**Kind**: inner typedef of <code>[SockBot](#module_SockBot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> &#124; <code>Error</code> | Any Error encountered |

