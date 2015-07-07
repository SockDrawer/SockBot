<a name="eliza.module_Elizabot"></a>
## Elizabot
elizabot.js v.1.1 - ELIZA JS library (N.Landsteiner 2005)
  Eliza is a mock Rogerian psychotherapist.
  Original program by Joseph Weizenbaum in MAD-SLIP for "Project MAC" at MIT.
  cf: Weizenbaum, Joseph "ELIZA - A Computer Program For the Study of Natural Language
      Communication Between Man and Machine"
      in: Communications of the ACM; Volume 9 , Issue 1 (January 1966): p 36-45.
  JavaScript implementation by Norbert Landsteiner 2005; <http://www.masserk.at>

  synopsis:

         new ElizaBot( <random-choice-disable-flag> )
         ElizaBot.prototype.transform( <inputstring> )
         ElizaBot.prototype.getInitial()
         ElizaBot.prototype.getFinal()
         ElizaBot.prototype.reset()

  usage: var eliza = new ElizaBot();
         var initial = eliza.getInitial();
         var reply = eliza.transform(inputstring);
         if (eliza.quit) {
             // last user input was a quit phrase
         }

         // method `transform()' returns a final phrase in case of a quit phrase
         // but you can also get a final phrase with:
         var final = eliza.getFinal();

         // other methods: reset memory and internal state
         eliza.reset();

         // to set the internal memory size override property `memSize':
         eliza.memSize = 100; // (default: 20)

         // to reproduce the example conversation given by J. Weizenbaum
         // initialize with the optional random-choice-disable flag
         var originalEliza = new ElizaBot(true);

  `ElizaBot' is also a general chatbot engine that can be supplied with any rule set.
  (for required data structures cf. "elizadata.js" and/or see the documentation.)
  data is parsed and transformed for internal use at the creation time of the
  first instance of the `ElizaBot' constructor.

  vers 1.1: lambda functions in RegExps are currently a problem with too many browsers.
            changed code to work around.


* [Elizabot](#eliza.module_Elizabot)
  * [~ElizaBot](#eliza.module_Elizabot..ElizaBot)
    * [new ElizaBot(datapath, noRandomFlag)](#new_eliza.module_Elizabot..ElizaBot_new)
    * [._dataParsed](#eliza.module_Elizabot..ElizaBot+_dataParsed) : <code>Boolean</code>
    * [.reset()](#eliza.module_Elizabot..ElizaBot+reset)
    * [._init()](#eliza.module_Elizabot..ElizaBot+_init)
    * [._sortKeywords(a, b)](#eliza.module_Elizabot..ElizaBot+_sortKeywords) ⇒ <code>Number</code>
    * [.transform(text)](#eliza.module_Elizabot..ElizaBot+transform) ⇒ <code>String</code>
    * [._execRule(k)](#eliza.module_Elizabot..ElizaBot+_execRule) ⇒ <code>String</code>
    * [._postTransform(s)](#eliza.module_Elizabot..ElizaBot+_postTransform) ⇒ <code>String</code>
    * [._getRuleIndexByKey(key)](#eliza.module_Elizabot..ElizaBot+_getRuleIndexByKey) ⇒ <code>Number</code>
    * [._memSave(t)](#eliza.module_Elizabot..ElizaBot+_memSave)
    * [._memGet()](#eliza.module_Elizabot..ElizaBot+_memGet) ⇒ <code>String</code>
    * [.getFinal()](#eliza.module_Elizabot..ElizaBot+getFinal) ⇒ <code>String</code>
    * [.getInitial()](#eliza.module_Elizabot..ElizaBot+getInitial) ⇒ <code>String</code>

<a name="eliza.module_Elizabot..ElizaBot"></a>
### Elizabot~ElizaBot
**Kind**: inner class of <code>[Elizabot](#eliza.module_Elizabot)</code>  

* [~ElizaBot](#eliza.module_Elizabot..ElizaBot)
  * [new ElizaBot(datapath, noRandomFlag)](#new_eliza.module_Elizabot..ElizaBot_new)
  * [._dataParsed](#eliza.module_Elizabot..ElizaBot+_dataParsed) : <code>Boolean</code>
  * [.reset()](#eliza.module_Elizabot..ElizaBot+reset)
  * [._init()](#eliza.module_Elizabot..ElizaBot+_init)
  * [._sortKeywords(a, b)](#eliza.module_Elizabot..ElizaBot+_sortKeywords) ⇒ <code>Number</code>
  * [.transform(text)](#eliza.module_Elizabot..ElizaBot+transform) ⇒ <code>String</code>
  * [._execRule(k)](#eliza.module_Elizabot..ElizaBot+_execRule) ⇒ <code>String</code>
  * [._postTransform(s)](#eliza.module_Elizabot..ElizaBot+_postTransform) ⇒ <code>String</code>
  * [._getRuleIndexByKey(key)](#eliza.module_Elizabot..ElizaBot+_getRuleIndexByKey) ⇒ <code>Number</code>
  * [._memSave(t)](#eliza.module_Elizabot..ElizaBot+_memSave)
  * [._memGet()](#eliza.module_Elizabot..ElizaBot+_memGet) ⇒ <code>String</code>
  * [.getFinal()](#eliza.module_Elizabot..ElizaBot+getFinal) ⇒ <code>String</code>
  * [.getInitial()](#eliza.module_Elizabot..ElizaBot+getInitial) ⇒ <code>String</code>

<a name="new_eliza.module_Elizabot..ElizaBot_new"></a>
#### new ElizaBot(datapath, noRandomFlag)
The logic class behind the Eliza module


| Param | Type | Description |
| --- | --- | --- |
| datapath | <code>String</code> | The path to Elizabot's data |
| noRandomFlag | <code>boolean</code> | True if you don't want to be random. False if not. |

<a name="eliza.module_Elizabot..ElizaBot+_dataParsed"></a>
#### elizaBot._dataParsed : <code>Boolean</code>
Whether the data files have been parsed yet.

**Kind**: instance property of <code>[ElizaBot](#eliza.module_Elizabot..ElizaBot)</code>  
<a name="eliza.module_Elizabot..ElizaBot+reset"></a>
#### elizaBot.reset()
Reset Elizabot, making her forget what she's already said.

**Kind**: instance method of <code>[ElizaBot](#eliza.module_Elizabot..ElizaBot)</code>  
<a name="eliza.module_Elizabot..ElizaBot+_init"></a>
#### elizaBot._init()
Initialize the bot

**Kind**: instance method of <code>[ElizaBot](#eliza.module_Elizabot..ElizaBot)</code>  
<a name="eliza.module_Elizabot..ElizaBot+_sortKeywords"></a>
#### elizaBot._sortKeywords(a, b) ⇒ <code>Number</code>
Sort keywords by rank or original index (tiebreaker)

**Kind**: instance method of <code>[ElizaBot](#eliza.module_Elizabot..ElizaBot)</code>  
**Returns**: <code>Number</code> - As per sorting algorithm  

| Param | Type | Description |
| --- | --- | --- |
| a | <code>Object</code> | Keyword 1 |
| b | <code>Object</code> | Keyword 2 |

<a name="eliza.module_Elizabot..ElizaBot+transform"></a>
#### elizaBot.transform(text) ⇒ <code>String</code>
This would appear to be the main function that takes in a sentence and comes up with a reply

**Kind**: instance method of <code>[ElizaBot](#eliza.module_Elizabot..ElizaBot)</code>  
**Returns**: <code>String</code> - The reply from Eliza  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>String</code> | The input |

<a name="eliza.module_Elizabot..ElizaBot+_execRule"></a>
#### elizaBot._execRule(k) ⇒ <code>String</code>
Execute a rule

**Kind**: instance method of <code>[ElizaBot](#eliza.module_Elizabot..ElizaBot)</code>  
**Returns**: <code>String</code> - The reply for that rule  

| Param | Type | Description |
| --- | --- | --- |
| k | <code>Number</code> | The rule to execute |

<a name="eliza.module_Elizabot..ElizaBot+_postTransform"></a>
#### elizaBot._postTransform(s) ⇒ <code>String</code>
Clean up after transforming.

**Kind**: instance method of <code>[ElizaBot](#eliza.module_Elizabot..ElizaBot)</code>  
**Returns**: <code>String</code> - s but more transformy  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>String</code> | I think the reply stream? |

<a name="eliza.module_Elizabot..ElizaBot+_getRuleIndexByKey"></a>
#### elizaBot._getRuleIndexByKey(key) ⇒ <code>Number</code>
Find the index of a rule from the key. Converts from object lookup to array lookup.

**Kind**: instance method of <code>[ElizaBot](#eliza.module_Elizabot..ElizaBot)</code>  
**Returns**: <code>Number</code> - The index  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | the key |

<a name="eliza.module_Elizabot..ElizaBot+_memSave"></a>
#### elizaBot._memSave(t)
Save into memory

**Kind**: instance method of <code>[ElizaBot](#eliza.module_Elizabot..ElizaBot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| t | <code>String</code> | The item to save |

<a name="eliza.module_Elizabot..ElizaBot+_memGet"></a>
#### elizaBot._memGet() ⇒ <code>String</code>
Get from memory

**Kind**: instance method of <code>[ElizaBot](#eliza.module_Elizabot..ElizaBot)</code>  
**Returns**: <code>String</code> - the item  
<a name="eliza.module_Elizabot..ElizaBot+getFinal"></a>
#### elizaBot.getFinal() ⇒ <code>String</code>
Get a random signoff used when ending a conversation

**Kind**: instance method of <code>[ElizaBot](#eliza.module_Elizabot..ElizaBot)</code>  
**Returns**: <code>String</code> - The signoff  
<a name="eliza.module_Elizabot..ElizaBot+getInitial"></a>
#### elizaBot.getInitial() ⇒ <code>String</code>
Get a greeting used when starting a conversation

**Kind**: instance method of <code>[ElizaBot](#eliza.module_Elizabot..ElizaBot)</code>  
**Returns**: <code>String</code> - The greeting  
