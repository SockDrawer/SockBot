<a name="module_markov"></a>
## markov
Markov Chain module. Responsible for automatically replying to summons and replies by using a Markov chain to generate content


* [markov](#module_markov)
  * _static_
    * [.name](#module_markov.name)
    * [.priority](#module_markov.priority)
    * [.version](#module_markov.version)
    * [.description](#module_markov.description)
    * [.configuration](#module_markov.configuration)
    * [.begin(browser, config)](#module_markov.begin)
    * [.onNotify(type, notification, topic, post, callback)](#module_markov.onNotify)
  * _inner_
    * [~loadCorpus()](#module_markov..loadCorpus)
    * [~markovPost()](#module_markov..markovPost) ⇒ <code>string</code>
    * [~randomIntFromInterval(min, max)](#module_markov..randomIntFromInterval) ⇒ <code>number</code>

<a name="module_markov.name"></a>
### markov.name
Name of the module

**Kind**: static property of <code>[markov](#module_markov)</code>  
<a name="module_markov.priority"></a>
### markov.priority
Priority of the module

**Kind**: static property of <code>[markov](#module_markov)</code>  
<a name="module_markov.version"></a>
### markov.version
Module version

**Kind**: static property of <code>[markov](#module_markov)</code>  
<a name="module_markov.description"></a>
### markov.description
Description of the module

**Kind**: static property of <code>[markov](#module_markov)</code>  
<a name="module_markov.configuration"></a>
### markov.configuration
Configuration properties.

**Kind**: static property of <code>[markov](#module_markov)</code>  
**Properties**

| Name | Description |
| --- | --- |
| enabled | Whether to use Markov or not. Defaults to false. |
| corpus | The location of the corpus file to use; must be a plan text file. Defaults to markov/corpus.txt; note that this file is part of the GitHub repo, and is liable to be replaced if you pull changes. |

<a name="module_markov.begin"></a>
### markov.begin(browser, config)
Bootstrap the module.

**Kind**: static method of <code>[markov](#module_markov)</code>  

| Param | Type | Description |
| --- | --- | --- |
| browser | <code>object</code> | The Discourse interface object |
| config | <code>object</code> | The SockBot config object |

<a name="module_markov.onNotify"></a>
### markov.onNotify(type, notification, topic, post, callback)
Handle received notifications.

**Kind**: static method of <code>[markov](#module_markov)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>object</code> | The type of notification received |
| notification | <code>object</code> | An object representing the notification that was received |
| topic | <code>object</code> | An object representing the topic that the notification was about |
| post | <code>object</code> | An object representing the post that the notification was about |
| callback | <code>function</code> | The callback to use once the action is complete |

<a name="module_markov..loadCorpus"></a>
### markov~loadCorpus()
Load the corpus to use.

**Kind**: inner method of <code>[markov](#module_markov)</code>  
<a name="module_markov..markovPost"></a>
### markov~markovPost() ⇒ <code>string</code>
Generate post content using the Markov chain.

**Kind**: inner method of <code>[markov](#module_markov)</code>  
**Returns**: <code>string</code> - The post content  
<a name="module_markov..randomIntFromInterval"></a>
### markov~randomIntFromInterval(min, max) ⇒ <code>number</code>
Generate a random number in the specified range.

**Kind**: inner method of <code>[markov](#module_markov)</code>  
**Returns**: <code>number</code> - The generated number  

| Param | Type | Description |
| --- | --- | --- |
| min | <code>number</code> | The lower bound of the range |
| max | <code>number</code> | The upper bound of the range |

