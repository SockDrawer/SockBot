<a name="module_cards"></a>
## cards
Cards module. Responsible for drawing cards


* [cards](#module_cards)
  * [.description](#module_cards.description)
  * [.configuration](#module_cards.configuration)
  * [.name](#module_cards.name)
  * [.priority](#module_cards.priority)
  * [.version](#module_cards.version)
  * [.commands](#module_cards.commands) : <code>Object</code>
  * [.begin(browser, config)](#module_cards.begin)

<a name="module_cards.description"></a>
### cards.description
Brief description of this module for Help Docs

**Kind**: static property of <code>[cards](#module_cards)</code>  
<a name="module_cards.configuration"></a>
### cards.configuration
Default Configuration settings for this sock_module

**Kind**: static property of <code>[cards](#module_cards)</code>  
<a name="module_cards.name"></a>
### cards.name
The name of this sock_module

**Kind**: static property of <code>[cards](#module_cards)</code>  
<a name="module_cards.priority"></a>
### cards.priority
If defined by a sock_module it is the priority of
the module with respect to other modules.

sock_modules **should not** define modules with negative permissions.
Default value is 50 with lower numbers being higher priority.

**Kind**: static property of <code>[cards](#module_cards)</code>  
<a name="module_cards.version"></a>
### cards.version
The version of this sock_module

**Kind**: static property of <code>[cards](#module_cards)</code>  
<a name="module_cards.commands"></a>
### cards.commands : <code>Object</code>
Each command has the following properties:
- handler:        The encryption function.
- defaults:       Default values of parameters
- params:         Named parameters for this function
- randomPickable: If true, random encryption can select this function.
                  NOTE: random currently does not support parameters.
- description:    A description of this function for the help

**Kind**: static property of <code>[cards](#module_cards)</code>  
<a name="module_cards.begin"></a>
### cards.begin(browser, config)
Bootstrap the module

**Kind**: static method of <code>[cards](#module_cards)</code>  

| Param | Type | Description |
| --- | --- | --- |
| browser | <code>string</code> | discourse. |
| config | <code>object</code> | The configuration to use |

