<a name="module_commands"></a>
## commands
Command Parser for SockBot2.0

**Author:** Accalia  
**License**: MIT  

* [commands](#module_commands)
    * _static_
        * [.prepare(events, callback)](#module_commands.prepare)
        * [.start()](#module_commands.start)
        * [.parseCommands(post, topic, callback)](#module_commands.parseCommands)
    * _inner_
        * [~parseShortCommand(line)](#module_commands..parseShortCommand) ⇒ <code>command</code>
        * [~parseMentionCommand(line)](#module_commands..parseMentionCommand) ⇒ <code>command</code>
        * [~getCommandHelps()](#module_commands..getCommandHelps) ⇒ <code>string</code>
        * [~cmdError(command)](#module_commands..cmdError)
        * [~shutdown()](#module_commands..shutdown)
        * [~cmdShutUp(command)](#module_commands..cmdShutUp)
        * [~cmdHelp(command)](#module_commands..cmdHelp)
        * [~registerCommand(command, helpstring, handler, callback)](#module_commands..registerCommand) ⇒ <code>undefined</code>
        * [~registerHelp(command, helptext, callback)](#module_commands..registerHelp) ⇒ <code>undefined</code>
        * [~commandProtect(event, handler)](#module_commands..commandProtect) ⇒ <code>boolean</code>
        * [~command](#module_commands..command) : <code>object</code>
        * [~completedCallback](#module_commands..completedCallback)
        * [~parseCallback](#module_commands..parseCallback)
        * [~commandHandler](#module_commands..commandHandler)

<a name="module_commands.prepare"></a>
### commands.prepare(events, callback)
Perpare the command parser

Needs to be called to set the internals of the parser after reading config file.

**Kind**: static method of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| events | <code>EventEmitter</code> | EventEmitter that will be core comms for SockBot |
| callback | <code>completedCallback</code> | Completion callback |

<a name="module_commands.start"></a>
### commands.start()
Start the command parser after bot login

**Kind**: static method of <code>[commands](#module_commands)</code>  
<a name="module_commands.parseCommands"></a>
### commands.parseCommands(post, topic, callback)
Parse commands from post and emit command events

**Kind**: static method of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>external.posts.CleanedPost</code> | Post to parse commands from |
| topic | <code>external.topics.Topic</code> | Topic comamnd belongs to |
| callback | <code>parseCallback</code> | CompletionCallback |

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

<a name="module_commands..getCommandHelps"></a>
### commands~getCommandHelps() ⇒ <code>string</code>
Get a list of commands that are registered withg the bot

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>string</code> - command list for posting  
<a name="module_commands..cmdError"></a>
### commands~cmdError(command)
Replies on unhandled command with helptext

**Kind**: inner method of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>command</code> | Unhandled command |

<a name="module_commands..shutdown"></a>
### commands~shutdown()
Actually perform the bot termination. Do not terminate process, just bot.

**Kind**: inner method of <code>[commands](#module_commands)</code>  
<a name="module_commands..cmdShutUp"></a>
### commands~cmdShutUp(command)
Shut the bot up until manually restarted

**Kind**: inner method of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>command</code> | the shut up command |

<a name="module_commands..cmdHelp"></a>
### commands~cmdHelp(command)
Reply with help to the command !help

**Kind**: inner method of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>command</code> | help command |

<a name="module_commands..registerCommand"></a>
### commands~registerCommand(command, helpstring, handler, callback) ⇒ <code>undefined</code>
Register a command

will be added to core EventEmitter as .onCommand()

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>undefined</code> - No return value  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | Command to handle |
| helpstring | <code>string</code> | One line helpstring describing command |
| handler | <code>commandHandler</code> | Function to handle the command |
| callback | <code>completedCallback</code> | Completion callback |

<a name="module_commands..registerHelp"></a>
### commands~registerHelp(command, helptext, callback) ⇒ <code>undefined</code>
Register extended help

will be added to core EventEmitter as .registerHelp()

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>undefined</code> - No return value  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | Command or topic to register help for |
| helptext | <code>string</code> | Extended help text |
| callback | <code>completedCallback</code> | Completion callback |

<a name="module_commands..commandProtect"></a>
### commands~commandProtect(event, handler) ⇒ <code>boolean</code>
Watch for unauthorized commands and reject them

**Kind**: inner method of <code>[commands](#module_commands)</code>  
**Returns**: <code>boolean</code> - Flag wether event was of intrest to function  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event that is registered |
| handler | <code>function</code> | Event Handler |

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
| post | <code>external.posts.CleanedPost</code> | Post that triggered the command |

<a name="module_commands..completedCallback"></a>
### commands~completedCallback
Completion Callback

**Kind**: inner typedef of <code>[commands](#module_commands)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Exception</code> | <code></code> | Error encountered processing request |

<a name="module_commands..parseCallback"></a>
### commands~parseCallback
Parse Completion Callback

**Kind**: inner typedef of <code>[commands](#module_commands)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Exception</code> | <code></code> | Error encountered processing request |
| commands | <code>Array.&lt;command&gt;</code> |  | Parsed Commands |

<a name="module_commands..commandHandler"></a>
### commands~commandHandler
Command handler

**Kind**: inner typedef of <code>[commands](#module_commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>command</code> | Command to handle |

