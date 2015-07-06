<a name="module_commands"></a>
## commands
Command Parser for SockBot2.0

**Author:** Accalia  
**License**: MIT  

* [commands](#module_commands)
  * _static_
    * [.prepareParser(callback)](#module_commands.prepareParser)
  * _inner_
    * [~parseShortCommand(line)](#module_commands..parseShortCommand) ⇒ <code>command</code>
    * [~parseMentionCommand(line)](#module_commands..parseMentionCommand) ⇒ <code>command</code>
    * [~completedCallback([err])](#module_commands..completedCallback)
    * [~command](#module_commands..command) : <code>object</code>

<a name="module_commands.prepareParser"></a>
### commands.prepareParser(callback)
Perpare the command parser

Needs to be called to set the internals of the parser after reading config file.

**Kind**: static method of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>completedCallback</code> | Completion callback |

<a name="module_commands..parseShortCommand"></a>
### commands~parseShortCommand(line) ⇒ <code>command</code>
Parse a short command from input line

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>command</code> - Parsed command  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>string</code> | Input line to parse |

<a name="module_commands..parseMentionCommand"></a>
### commands~parseMentionCommand(line) ⇒ <code>command</code>
Parse a mention command from input line

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>command</code> - Parsed command  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>string</code> | Input line to parse |

<a name="module_commands..completedCallback"></a>
### commands~completedCallback([err])
Completion Callback

**Kind**: inner method of <code>[commands](#module_commands)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Exception</code> | <code></code> | Error encountered processing request |

<a name="module_commands..command"></a>
### commands~command : <code>object</code>
Parsed Command Data

**Kind**: inner typedef of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | Raw Command Input |
| command | <code>string</code> | Command name |
| args | <code>Array.&lt;string&gt;</code> | Command arguments |
| mention | <code>string</code> | Mention text that was included in command |

