<a name="module_spellar"></a>
## spellar
Spellar module. Responsible for automatically correcting spelling errors


* [spellar](#module_spellar)
  * _static_
    * [.description](#module_spellar.description)
    * [.configuration](#module_spellar.configuration)
    * [.name](#module_spellar.name)
    * [.priority](#module_spellar.priority)
    * [.version](#module_spellar.version)
    * [.begin(browser, config)](#module_spellar.begin)
    * [.registerListeners(callback)](#module_spellar.registerListeners)
    * [.onMessage(message, post, callback)](#module_spellar.onMessage)
  * _inner_
    * [~initialiseDictionary()](#module_spellar..initialiseDictionary)
    * [~loadAddtitionalDictionaries()](#module_spellar..loadAddtitionalDictionaries)
    * [~spellCheckPost(post, callback)](#module_spellar..spellCheckPost)

<a name="module_spellar.description"></a>
### spellar.description
Description of the module

**Kind**: static property of <code>[spellar](#module_spellar)</code>  
<a name="module_spellar.configuration"></a>
### spellar.configuration
Configuration properties.

**Kind**: static property of <code>[spellar](#module_spellar)</code>  
**Properties**

| Name | Description |
| --- | --- |
| enabled | Whether to use Spellar or not. Defaults to false. |
| checkOwnPosts | Whether to use check the user's own posts or not. Defaults to false. |
| baseDictLocation | The directory containing the base dictionary. Defaults to dictionaries. |
| baseDictLocation | The name of the base dictionary. Defaults to en_US. |
| baseDictLocation | The directory containing extra dictionaries. Defaults to dictionaries. |
| baseDictLocation | An array of names of extra dictionaries. Defaults to an empty array. |

<a name="module_spellar.name"></a>
### spellar.name
Name of the module

**Kind**: static property of <code>[spellar](#module_spellar)</code>  
<a name="module_spellar.priority"></a>
### spellar.priority
Priority of the module

**Kind**: static property of <code>[spellar](#module_spellar)</code>  
<a name="module_spellar.version"></a>
### spellar.version
Module version

**Kind**: static property of <code>[spellar](#module_spellar)</code>  
<a name="module_spellar.begin"></a>
### spellar.begin(browser, config)
Bootstrap the module.

**Kind**: static method of <code>[spellar](#module_spellar)</code>  

| Param | Type | Description |
| --- | --- | --- |
| browser | <code>object</code> | The Discourse interface object |
| config | <code>object</code> | The SockBot config object |

<a name="module_spellar.registerListeners"></a>
### spellar.registerListeners(callback)
Register the required listeners.

**Kind**: static method of <code>[spellar](#module_spellar)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The callback to use once the action is complete |

<a name="module_spellar.onMessage"></a>
### spellar.onMessage(message, post, callback)
Handle received messages.

**Kind**: static method of <code>[spellar](#module_spellar)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | An object representing the message that was received |
| post | <code>object</code> | An object representing the post that the message was about |
| callback | <code>function</code> | The callback to use once the action is complete |

<a name="module_spellar..initialiseDictionary"></a>
### spellar~initialiseDictionary()
Initialise the dictionary.

**Kind**: inner method of <code>[spellar](#module_spellar)</code>  
<a name="module_spellar..loadAddtitionalDictionaries"></a>
### spellar~loadAddtitionalDictionaries()
Load additional dictionaries, if provided.

**Kind**: inner method of <code>[spellar](#module_spellar)</code>  
<a name="module_spellar..spellCheckPost"></a>
### spellar~spellCheckPost(post, callback)
Spell-check the post, sending an edit if anything has been changed

**Kind**: inner method of <code>[spellar](#module_spellar)</code>  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>object</code> | An object representing the post |
| callback | <code>function</code> | The callback to use once the action is complete |

