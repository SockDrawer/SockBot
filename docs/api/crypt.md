<a name="module_crypt"></a>
## crypt
Crypt module. Does various encryption things


* [crypt](#module_crypt)
  * _static_
    * [.description](#module_crypt.description) : <code>String</code>
    * [.configuration](#module_crypt.configuration) : <code>Object</code>
      * [.enabled](#module_crypt.configuration.enabled) : <code>Boolean</code>
    * [.name](#module_crypt.name) : <code>String</code>
    * [.priority](#module_crypt.priority) : <code>Number</code>
    * [.version](#module_crypt.version) : <code>String</code>
    * [.commands](#module_crypt.commands) : <code>Object</code>
      * [.rot13](#module_crypt.commands.rot13) : <code>Object</code>
      * [.reverse](#module_crypt.commands.reverse) : <code>Object</code>
      * [.xorbc](#module_crypt.commands.xorbc) : <code>Object</code>
      * [.rxorbc](#module_crypt.commands.rxorbc) : <code>Object</code>
      * [.random](#module_crypt.commands.random) : <code>Object</code>
    * [.onNotify(type, notification, topic, post, callback)](#module_crypt.onNotify)
    * [.begin(browser, config)](#module_crypt.begin)
  * _inner_
    * [~cryptCmd(handler)](#module_crypt..cryptCmd) ⇒ <code>function</code>
    * [~xorbc(decrypt)](#module_crypt..xorbc)
    * [~toCharCodes(s)](#module_crypt..toCharCodes) ⇒ <code>Array</code>
    * [~zeroArray(l)](#module_crypt..zeroArray) ⇒ <code>Array</code>

<a name="module_crypt.description"></a>
### crypt.description : <code>String</code>
Description, for help text.

**Kind**: static property of <code>[crypt](#module_crypt)</code>  
<a name="module_crypt.configuration"></a>
### crypt.configuration : <code>Object</code>
The config for the module

**Kind**: static property of <code>[crypt](#module_crypt)</code>  
<a name="module_crypt.configuration.enabled"></a>
#### configuration.enabled : <code>Boolean</code>
Should the module be enabled?

**Kind**: static property of <code>[configuration](#module_crypt.configuration)</code>  
<a name="module_crypt.name"></a>
### crypt.name : <code>String</code>
The name of this sock module

**Kind**: static property of <code>[crypt](#module_crypt)</code>  
<a name="module_crypt.priority"></a>
### crypt.priority : <code>Number</code>
The priority of the sock module

**Kind**: static property of <code>[crypt](#module_crypt)</code>  
<a name="module_crypt.version"></a>
### crypt.version : <code>String</code>
The version of this module

**Kind**: static property of <code>[crypt](#module_crypt)</code>  
<a name="module_crypt.commands"></a>
### crypt.commands : <code>Object</code>
Each command is an encryption mechanism and has the following properties:
- handler:        The encryption function.
- defaults:       Default values of parameters
- params:         Named parameters for this function
- randomPickable: If true, random encryption can select this function.
                  NOTE: random currently does not support parameters.
- description:    A description of this function for the help

**Kind**: static property of <code>[crypt](#module_crypt)</code>  

  * [.commands](#module_crypt.commands) : <code>Object</code>
    * [.rot13](#module_crypt.commands.rot13) : <code>Object</code>
    * [.reverse](#module_crypt.commands.reverse) : <code>Object</code>
    * [.xorbc](#module_crypt.commands.xorbc) : <code>Object</code>
    * [.rxorbc](#module_crypt.commands.rxorbc) : <code>Object</code>
    * [.random](#module_crypt.commands.random) : <code>Object</code>

<a name="module_crypt.commands.rot13"></a>
#### commands.rot13 : <code>Object</code>
ROT13 "encryption"

**Kind**: static property of <code>[commands](#module_crypt.commands)</code>  
<a name="module_crypt.commands.reverse"></a>
#### commands.reverse : <code>Object</code>
Reverse the string

**Kind**: static property of <code>[commands](#module_crypt.commands)</code>  
<a name="module_crypt.commands.xorbc"></a>
#### commands.xorbc : <code>Object</code>
XOR with block chaining

**Kind**: static property of <code>[commands](#module_crypt.commands)</code>  
<a name="module_crypt.commands.rxorbc"></a>
#### commands.rxorbc : <code>Object</code>
Reverse XOR with block chaining

**Kind**: static property of <code>[commands](#module_crypt.commands)</code>  
<a name="module_crypt.commands.random"></a>
#### commands.random : <code>Object</code>
Random other command

**Kind**: static property of <code>[commands](#module_crypt.commands)</code>  
<a name="module_crypt.onNotify"></a>
### crypt.onNotify(type, notification, topic, post, callback)
Use a random encryption when PMed/mentioned/replied without command

**Kind**: static method of <code>[crypt](#module_crypt)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of event. Only responds if this is 'mentioned' |
| notification | <code>string</code> | The notification to respond to |
| topic | <code>string</code> | Unused. |
| post | <code>string</code> | The post the notification was for |
| callback | <code>function</code> | The callback to notify when processing is complete. |

<a name="module_crypt.begin"></a>
### crypt.begin(browser, config)
Bootstrap the module

**Kind**: static method of <code>[crypt](#module_crypt)</code>  

| Param | Type | Description |
| --- | --- | --- |
| browser | <code>string</code> | discourse. |
| config | <code>object</code> | The configuration to use |

<a name="module_crypt..cryptCmd"></a>
### crypt~cryptCmd(handler) ⇒ <code>function</code>
Helper to chain encryptions

**Kind**: inner method of <code>[crypt](#module_crypt)</code>  
**Returns**: <code>function</code> - A curried version of that handler, assuming this author is using the word "curried" correctly  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | The handler |

<a name="module_crypt..xorbc"></a>
### crypt~xorbc(decrypt)
xorbc implementatioon. Homegrown and weak as shit but who cares

**Kind**: inner method of <code>[crypt](#module_crypt)</code>  

| Param | Type | Description |
| --- | --- | --- |
| decrypt | <code>boolean</code> | Whether this should be decrypted or not |

<a name="module_crypt..toCharCodes"></a>
### crypt~toCharCodes(s) ⇒ <code>Array</code>
Convert string to array of character codes

**Kind**: inner method of <code>[crypt](#module_crypt)</code>  
**Returns**: <code>Array</code> - an array of character codes  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>string</code> | The string |

<a name="module_crypt..zeroArray"></a>
### crypt~zeroArray(l) ⇒ <code>Array</code>
Create array with constant value

**Kind**: inner method of <code>[crypt](#module_crypt)</code>  
**Returns**: <code>Array</code> - an array of all 0s  

| Param | Type | Description |
| --- | --- | --- |
| l | <code>Number</code> | The length of the array to make |

