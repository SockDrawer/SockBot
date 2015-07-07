<a name="module_mathematriculator"></a>
## mathematriculator
Mathematriculator module. Responsible for automatically performing mathematical operations and unit conversions


* [mathematriculator](#module_mathematriculator)
  * _static_
    * [.name](#module_mathematriculator.name)
    * [.version](#module_mathematriculator.version)
    * [.description](#module_mathematriculator.description)
    * [.configuration](#module_mathematriculator.configuration)
    * [.onCommand(command, args, callback)](#module_mathematriculator.onCommand)
    * [.begin(config)](#module_mathematriculator.begin)
  * _inner_
    * [~calc(args, callback)](#module_mathematriculator..calc)

<a name="module_mathematriculator.name"></a>
### mathematriculator.name
Name of the module

**Kind**: static property of <code>[mathematriculator](#module_mathematriculator)</code>  
<a name="module_mathematriculator.version"></a>
### mathematriculator.version
Module version

**Kind**: static property of <code>[mathematriculator](#module_mathematriculator)</code>  
<a name="module_mathematriculator.description"></a>
### mathematriculator.description
Description of the module

**Kind**: static property of <code>[mathematriculator](#module_mathematriculator)</code>  
<a name="module_mathematriculator.configuration"></a>
### mathematriculator.configuration
Configuration properties.

**Kind**: static property of <code>[mathematriculator](#module_mathematriculator)</code>  
**Properties**

| Name | Description |
| --- | --- |
| enabled | Whether to use Markov or not. Defaults to false. |

<a name="module_mathematriculator.onCommand"></a>
### mathematriculator.onCommand(command, args, callback)
Respond to commands.

**Kind**: static method of <code>[mathematriculator](#module_mathematriculator)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | The command issued |
| args | <code>array</code> | A list of arguments for the command |
| callback | <code>function</code> | The callback to use once the action is complete |

<a name="module_mathematriculator.begin"></a>
### mathematriculator.begin(config)
Bootstrap the module.

**Kind**: static method of <code>[mathematriculator](#module_mathematriculator)</code>  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The SockBot config object |

<a name="module_mathematriculator..calc"></a>
### mathematriculator~calc(args, callback)
Bootstrap the module.

**Kind**: inner method of <code>[mathematriculator](#module_mathematriculator)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>array</code> | A list of arguments to combine into an evaluateable expression |
| callback | <code>function</code> | The callback to use once the action is complete |

