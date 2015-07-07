<a name="module_dice"></a>
## dice
Dice module. Responsible for rolling dice in PMs.


* [dice](#module_dice)
  * [.description](#module_dice.description)
  * [.configuration](#module_dice.configuration)
  * [.name](#module_dice.name)
  * [.priority](#module_dice.priority)
  * [.version](#module_dice.version)
  * [.commands](#module_dice.commands) : <code>Object</code>
  * [.roll()](#module_dice.roll)
  * [.prerollDice(num, sides)](#module_dice.prerollDice) ⇒ <code>number</code>
  * [.rollWolfDice(match, callback)](#module_dice.rollWolfDice)
  * [.rollFudgeDice(match, callback)](#module_dice.rollFudgeDice)
  * [.rollXDice(match, callback)](#module_dice.rollXDice)
  * [.parser(input, each, complete)](#module_dice.parser)
  * [.handleInput(input, callback)](#module_dice.handleInput)
  * [.rollDice(match, callback)](#module_dice.rollDice)
  * [.begin(browser, config)](#module_dice.begin)
  * [.getError()](#module_dice.getError) ⇒ <code>string</code>

<a name="module_dice.description"></a>
### dice.description
Brief description of this module for Help Docs

**Kind**: static property of <code>[dice](#module_dice)</code>  
<a name="module_dice.configuration"></a>
### dice.configuration
Default Configuration settings for this sock_module

**Kind**: static property of <code>[dice](#module_dice)</code>  
<a name="module_dice.name"></a>
### dice.name
The name of this sock_module

**Kind**: static property of <code>[dice](#module_dice)</code>  
<a name="module_dice.priority"></a>
### dice.priority
If defined by a sock_module it is the priority of
the module with respect to other modules.

sock_modules **should not** define modules with negative permissions.
Default value is 50 with lower numbers being higher priority.

**Kind**: static property of <code>[dice](#module_dice)</code>  
<a name="module_dice.version"></a>
### dice.version
The version of this sock_module

**Kind**: static property of <code>[dice](#module_dice)</code>  
<a name="module_dice.commands"></a>
### dice.commands : <code>Object</code>
Each command has the following properties:
- handler:        The handler function.
- defaults:       Default values of parameters
- params:         Named parameters for this function
- description:    A description of this function for the help

**Kind**: static property of <code>[dice](#module_dice)</code>  
<a name="module_dice.roll"></a>
### dice.roll()
Roll the actual dice. Uses random.org as a source of random numbers.
Calls back with the following parameters:
 - sum: the total sum of dice rolled
 - results: the array of arrays of dice rolled (int[][])

**Kind**: static method of <code>[dice](#module_dice)</code>  
<a name="module_dice.prerollDice"></a>
### dice.prerollDice(num, sides) ⇒ <code>number</code>
Pre-roll dice. To get bad streaks out early :)

**Kind**: static method of <code>[dice](#module_dice)</code>  
**Returns**: <code>number</code> - How many rolls were performed  

| Param | Type | Description |
| --- | --- | --- |
| num | <code>number</code> | The number of dice to roll |
| sides | <code>number</code> | The size of dice to roll |

<a name="module_dice.rollWolfDice"></a>
### dice.rollWolfDice(match, callback)
Roll White Wolf-style dice

**Kind**: static method of <code>[dice](#module_dice)</code>  

| Param | Type | Description |
| --- | --- | --- |
| match | <code>object</code> | Information about how to match |
| match.reroll | <code>string</code> | Whether to reroll 10s (exploding dice) |
| match.num | <code>number</code> | How many dice to roll. Defaults to ten. |
| match.target | <code>number</code> | The target number for the roll |
| match.preroll | <code>string</code> | Whether to preroll |
| match.bonus | <code>number</code> | The bonus to add |
| callback | <code>function</code> | The callback to call when complete Will receive the following parameters: - Result: the string response to return |

<a name="module_dice.rollFudgeDice"></a>
### dice.rollFudgeDice(match, callback)
Roll Fudge dice

**Kind**: static method of <code>[dice](#module_dice)</code>  

| Param | Type | Description |
| --- | --- | --- |
| match | <code>object</code> | Information about how to match |
| match.num | <code>number</code> | How many dice to roll. Defaults to four |
| callback | <code>function</code> | The callback to call when complete |

<a name="module_dice.rollXDice"></a>
### dice.rollXDice(match, callback)
Roll arbitrary d20-style dice

**Kind**: static method of <code>[dice](#module_dice)</code>  

| Param | Type | Description |
| --- | --- | --- |
| match | <code>object</code> | Information about how to match |
| match.sides | <code>number</code> | What size dice to roll |
| match.num | <code>number</code> | How many dice to roll |
| callback | <code>function</code> | The callback to call when complete |

<a name="module_dice.parser"></a>
### dice.parser(input, each, complete)
Parse the command to determine how many and of what type of dice to roll

**Kind**: static method of <code>[dice](#module_dice)</code>  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | The input for the dice roll command |
| each | <code>dice~each</code> | The function to execute for each match found |
| complete | <code>function</code> | The callback to call when complete |

<a name="module_dice.handleInput"></a>
### dice.handleInput(input, callback)
Roll as many dice as can be parsed.

**Kind**: static method of <code>[dice](#module_dice)</code>  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | The input string to parse |
| callback | <code>function</code> | The callback to call when complete |

<a name="module_dice.rollDice"></a>
### dice.rollDice(match, callback)
Determine what dice to roll and outsource the logic

**Kind**: static method of <code>[dice](#module_dice)</code>  

| Param | Type | Description |
| --- | --- | --- |
| match | <code>object</code> | Information about how to roll |
| match.method | <code>string</code> | What method to use to roll dice |
| callback | <code>function</code> | The callback to call when complete. |

<a name="module_dice.begin"></a>
### dice.begin(browser, config)
Bootstrap the module

**Kind**: static method of <code>[dice](#module_dice)</code>  

| Param | Type | Description |
| --- | --- | --- |
| browser | <code>string</code> | discourse. |
| config | <code>object</code> | The configuration to use |

<a name="module_dice.getError"></a>
### dice.getError() ⇒ <code>string</code>
Get a random error message. Adds quirkiness to the bot.

**Kind**: static method of <code>[dice](#module_dice)</code>  
**Returns**: <code>string</code> - The error string.  
