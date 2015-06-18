<a name="module_utils"></a>
## utils
Core Utilities for Sockbot

**License**: MIT  

* [utils](#module_utils)
  * _static_
    * [.uuid()](#module_utils.uuid) ⇒ <code>string</code>
    * [.log(message)](#module_utils.log)
    * [.warn(message)](#module_utils.warn)
    * [.error(message)](#module_utils.error)
  * _inner_
    * [~addTimestamp(message)](#module_utils..addTimestamp) ⇒ <code>string</code>

<a name="module_utils.uuid"></a>
### utils.uuid() ⇒ <code>string</code>
Generate a "good enough" Type 4 UUID.

Not cryptographically secure, not pretty, not fast, but since we only need a couple of these it's good enough

**Kind**: static method of <code>[utils](#module_utils)</code>  
**Returns**: <code>string</code> - a "type 4 UUID"  
<a name="module_utils.log"></a>
### utils.log(message)
Log a message to the console

**Kind**: static method of <code>[utils](#module_utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>\*</code> | Message to log |

<a name="module_utils.warn"></a>
### utils.warn(message)
Log a warning to the console

**Kind**: static method of <code>[utils](#module_utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>\*</code> | Warning to log |

<a name="module_utils.error"></a>
### utils.error(message)
Log an error to the console

**Kind**: static method of <code>[utils](#module_utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>\*</code> | Error to log |

<a name="module_utils..addTimestamp"></a>
### utils~addTimestamp(message) ⇒ <code>string</code>
Add timestamp to message.

if `datestamp` configuration setting is truthy add UTC date and time, else
if `timestamp` configuration setting is truthy add UTC time, else
return message unaltered

**Kind**: inner method of <code>[utils](#module_utils)</code>  
**Returns**: <code>string</code> - timestamped input message  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>\*</code> | Message to timestamp |

