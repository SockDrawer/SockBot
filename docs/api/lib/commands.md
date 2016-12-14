<a name="sockbot.lib.module_commands"></a>

## commands
NodeBB provider module User class

**Author:** Accalia  
**License**: MIT  

* [commands](#sockbot.lib.module_commands)
    * _static_
        * [.bindCommands(forum)](#sockbot.lib.module_commands.bindCommands) ⇒ <code>Commands</code>
            * [~handlers](#sockbot.lib.module_commands.bindCommands..handlers)
            * [~shadowHandlers](#sockbot.lib.module_commands.bindCommands..shadowHandlers)
            * [~forbiddenCmds](#sockbot.lib.module_commands.bindCommands..forbiddenCmds)
            * [~helpTopics](#sockbot.lib.module_commands.bindCommands..helpTopics)
            * [~checkAvailable(map, command, logType, logMsg)](#sockbot.lib.module_commands.bindCommands..checkAvailable) ⇒ <code>boolean</code>
    * _inner_
        * [~Command](#sockbot.lib.module_commands..Command)
            * [new Command(definition, parent)](#new_sockbot.lib.module_commands..Command_new)
            * [.line](#sockbot.lib.module_commands..Command+line) : <code>string</code>
            * [.command](#sockbot.lib.module_commands..Command+command) : <code>string</code>
            * [.commandText](#sockbot.lib.module_commands..Command+commandText) : <code>string</code>
            * [.mention](#sockbot.lib.module_commands..Command+mention) : <code>boolean</code>
            * [.args](#sockbot.lib.module_commands..Command+args) : <code>Array.&lt;string&gt;</code>
            * [.parent](#sockbot.lib.module_commands..Command+parent) : <code>Commands</code>
            * [.replyText](#sockbot.lib.module_commands..Command+replyText) : <code>string</code>
            * [.executable](#sockbot.lib.module_commands..Command+executable) : <code>boolean</code>
            * [.execute()](#sockbot.lib.module_commands..Command+execute) ⇒ <code>Promise</code>
            * [.getPost()](#sockbot.lib.module_commands..Command+getPost) ⇒ <code>Promise.&lt;Post&gt;</code>
            * [.getTopic()](#sockbot.lib.module_commands..Command+getTopic) ⇒ <code>Promise.&lt;Topic&gt;</code>
            * [.getUser()](#sockbot.lib.module_commands..Command+getUser) ⇒ <code>Promise.&lt;User&gt;</code>
            * [.getPM()](#sockbot.lib.module_commands..Command+getPM) ⇒ <code>Promise.&lt;PrivateMessage&gt;</code>
            * [.reply(content)](#sockbot.lib.module_commands..Command+reply)
            * [.appendReply(content)](#sockbot.lib.module_commands..Command+appendReply)
        * [~Commands](#sockbot.lib.module_commands..Commands)
            * [new Commands(ids, postBody, handler)](#new_sockbot.lib.module_commands..Commands_new)
            * _instance_
                * [.ids](#sockbot.lib.module_commands..Commands+ids) : <code>Ids</code>
                * [.commands](#sockbot.lib.module_commands..Commands+commands) : <code>Array.&lt;Command&gt;</code>
                * [.text](#sockbot.lib.module_commands..Commands+text) : <code>string</code>
                * [.getPost()](#sockbot.lib.module_commands..Commands+getPost) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.setPost(post)](#sockbot.lib.module_commands..Commands+setPost)
                * [.getTopic()](#sockbot.lib.module_commands..Commands+getTopic) ⇒ <code>Promise.&lt;Topic&gt;</code>
                * [.setTopic(topic)](#sockbot.lib.module_commands..Commands+setTopic)
                * [.getPM()](#sockbot.lib.module_commands..Commands+getPM) ⇒ <code>Promise.&lt;ChatRoom&gt;</code>
                * [.setPM(pm)](#sockbot.lib.module_commands..Commands+setPM)
                * [.getUser()](#sockbot.lib.module_commands..Commands+getUser) ⇒ <code>Promise.&lt;User&gt;</code>
                * [.setUser(user)](#sockbot.lib.module_commands..Commands+setUser)
                * [.execute()](#sockbot.lib.module_commands..Commands+execute) ⇒ <code>Promise.&lt;Commands&gt;</code>
            * _static_
                * [.get(notification, postBody, handler)](#sockbot.lib.module_commands..Commands.get) ⇒ <code>Promise.&lt;Commands&gt;</code>
                * [.add(command, helpText, handler)](#sockbot.lib.module_commands..Commands.add) ⇒ <code>Promise</code>
                * [.addAlias(command, handler)](#sockbot.lib.module_commands..Commands.addAlias) ⇒ <code>Promise</code>
                * [.addExtendedHelp(command, text)](#sockbot.lib.module_commands..Commands.addExtendedHelp) ⇒ <code>Promise</code>
                * [.forbidCommand(command)](#sockbot.lib.module_commands..Commands.forbidCommand) ⇒ <code>boolean</code>

<a name="sockbot.lib.module_commands.bindCommands"></a>

### commands.bindCommands(forum) ⇒ <code>Commands</code>
Create a Commands class and bind it to a forum instance.

**Kind**: static method of <code>[commands](#sockbot.lib.module_commands)</code>  
**Returns**: <code>Commands</code> - A Commands class bound to the provided `forum` instance  

| Param | Type | Description |
| --- | --- | --- |
| forum | <code>Provider</code> | A forum Provider instance to bind to constructed Commands class |


* [.bindCommands(forum)](#sockbot.lib.module_commands.bindCommands) ⇒ <code>Commands</code>
    * [~handlers](#sockbot.lib.module_commands.bindCommands..handlers)
    * [~shadowHandlers](#sockbot.lib.module_commands.bindCommands..shadowHandlers)
    * [~forbiddenCmds](#sockbot.lib.module_commands.bindCommands..forbiddenCmds)
    * [~helpTopics](#sockbot.lib.module_commands.bindCommands..helpTopics)
    * [~checkAvailable(map, command, logType, logMsg)](#sockbot.lib.module_commands.bindCommands..checkAvailable) ⇒ <code>boolean</code>

<a name="sockbot.lib.module_commands.bindCommands..handlers"></a>

#### bindCommands~handlers
Command Handlers

**Kind**: inner constant of <code>[bindCommands](#sockbot.lib.module_commands.bindCommands)</code>  
**Default**: <code>{&quot;help&quot;:&quot;&quot;}</code>  
<a name="sockbot.lib.module_commands.bindCommands..shadowHandlers"></a>

#### bindCommands~shadowHandlers
Shadow Command Handlers

**Kind**: inner constant of <code>[bindCommands](#sockbot.lib.module_commands.bindCommands)</code>  
**Default**: <code>{}</code>  
<a name="sockbot.lib.module_commands.bindCommands..forbiddenCmds"></a>

#### bindCommands~forbiddenCmds
Commands forbidden by the forum provider

**Kind**: inner constant of <code>[bindCommands](#sockbot.lib.module_commands.bindCommands)</code>  
**Default**: <code>{}</code>  
<a name="sockbot.lib.module_commands.bindCommands..helpTopics"></a>

#### bindCommands~helpTopics
Extended help topics

**Kind**: inner constant of <code>[bindCommands](#sockbot.lib.module_commands.bindCommands)</code>  
<a name="sockbot.lib.module_commands.bindCommands..checkAvailable"></a>

#### bindCommands~checkAvailable(map, command, logType, logMsg) ⇒ <code>boolean</code>
Check the availability of a command

**Kind**: inner method of <code>[bindCommands](#sockbot.lib.module_commands.bindCommands)</code>  
**Returns**: <code>boolean</code> - True if available, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| map | <code>object</code> | A map of commands to check availability against |
| command | <code>string</code> | Name of command to check |
| logType | <code>string</code> | Type of log to log if command isn't available |
| logMsg | <code>string</code> | Message to log if command is not available |

<a name="sockbot.lib.module_commands..Command"></a>

### commands~Command
Command Class. Represents a single command within a post

**Kind**: inner class of <code>[commands](#sockbot.lib.module_commands)</code>  

* [~Command](#sockbot.lib.module_commands..Command)
    * [new Command(definition, parent)](#new_sockbot.lib.module_commands..Command_new)
    * [.line](#sockbot.lib.module_commands..Command+line) : <code>string</code>
    * [.command](#sockbot.lib.module_commands..Command+command) : <code>string</code>
    * [.commandText](#sockbot.lib.module_commands..Command+commandText) : <code>string</code>
    * [.mention](#sockbot.lib.module_commands..Command+mention) : <code>boolean</code>
    * [.args](#sockbot.lib.module_commands..Command+args) : <code>Array.&lt;string&gt;</code>
    * [.parent](#sockbot.lib.module_commands..Command+parent) : <code>Commands</code>
    * [.replyText](#sockbot.lib.module_commands..Command+replyText) : <code>string</code>
    * [.executable](#sockbot.lib.module_commands..Command+executable) : <code>boolean</code>
    * [.execute()](#sockbot.lib.module_commands..Command+execute) ⇒ <code>Promise</code>
    * [.getPost()](#sockbot.lib.module_commands..Command+getPost) ⇒ <code>Promise.&lt;Post&gt;</code>
    * [.getTopic()](#sockbot.lib.module_commands..Command+getTopic) ⇒ <code>Promise.&lt;Topic&gt;</code>
    * [.getUser()](#sockbot.lib.module_commands..Command+getUser) ⇒ <code>Promise.&lt;User&gt;</code>
    * [.getPM()](#sockbot.lib.module_commands..Command+getPM) ⇒ <code>Promise.&lt;PrivateMessage&gt;</code>
    * [.reply(content)](#sockbot.lib.module_commands..Command+reply)
    * [.appendReply(content)](#sockbot.lib.module_commands..Command+appendReply)

<a name="new_sockbot.lib.module_commands..Command_new"></a>

#### new Command(definition, parent)
Create a Command from a defintiton


| Param | Type | Description |
| --- | --- | --- |
| definition | <code>object</code> | Parsed Command defintition |
| parent | <code>Commands</code> | Commands instnace that created this Command |

<a name="sockbot.lib.module_commands..Command+line"></a>

#### command.line : <code>string</code>
Full Command line definition

**Kind**: instance property of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Access:** public  
<a name="sockbot.lib.module_commands..Command+command"></a>

#### command.command : <code>string</code>
Normalized command name

**Kind**: instance property of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Access:** public  
<a name="sockbot.lib.module_commands..Command+commandText"></a>

#### command.commandText : <code>string</code>
Unnormalized command name

**Kind**: instance property of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Access:** public  
<a name="sockbot.lib.module_commands..Command+mention"></a>

#### command.mention : <code>boolean</code>
Is Command a mention command?

**Kind**: instance property of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Access:** public  
<a name="sockbot.lib.module_commands..Command+args"></a>

#### command.args : <code>Array.&lt;string&gt;</code>
Command arguments

**Kind**: instance property of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Access:** public  
<a name="sockbot.lib.module_commands..Command+parent"></a>

#### command.parent : <code>Commands</code>
Parent Commands object

**Kind**: instance property of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Access:** public  
<a name="sockbot.lib.module_commands..Command+replyText"></a>

#### command.replyText : <code>string</code>
Text to post as a reply to the command

**Kind**: instance property of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Access:** public  
<a name="sockbot.lib.module_commands..Command+executable"></a>

#### command.executable : <code>boolean</code>
Indicates if this command will execute any handler

**Kind**: instance property of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Access:** public  
<a name="sockbot.lib.module_commands..Command+execute"></a>

#### command.execute() ⇒ <code>Promise</code>
Execute the command handler for this command

**Kind**: instance method of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Returns**: <code>Promise</code> - Resolves when command has fully executed  
**Access:** public  
<a name="sockbot.lib.module_commands..Command+getPost"></a>

#### command.getPost() ⇒ <code>Promise.&lt;Post&gt;</code>
Get Full Post the command refers to

**Kind**: instance method of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to retrieved Post  
**Access:** public  
<a name="sockbot.lib.module_commands..Command+getTopic"></a>

#### command.getTopic() ⇒ <code>Promise.&lt;Topic&gt;</code>
Get Topic command was posted to

**Kind**: instance method of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Returns**: <code>Promise.&lt;Topic&gt;</code> - Resolves to retrieved Topic  
**Access:** public  
<a name="sockbot.lib.module_commands..Command+getUser"></a>

#### command.getUser() ⇒ <code>Promise.&lt;User&gt;</code>
Get User who posted the command

**Kind**: instance method of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Returns**: <code>Promise.&lt;User&gt;</code> - Resolved to retrieved User  
**Access:** public  
<a name="sockbot.lib.module_commands..Command+getPM"></a>

#### command.getPM() ⇒ <code>Promise.&lt;PrivateMessage&gt;</code>
Get PrivateMessage who posted the command

**Kind**: instance method of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Returns**: <code>Promise.&lt;PrivateMessage&gt;</code> - Resolved to retrieved PrivateMessage  
**Access:** public  
<a name="sockbot.lib.module_commands..Command+reply"></a>

#### command.reply(content)
Reply to command with content

**Kind**: instance method of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Content to reply with |

<a name="sockbot.lib.module_commands..Command+appendReply"></a>

#### command.appendReply(content)
Append content to the reply of command

**Kind**: instance method of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Content to append to reply |

<a name="sockbot.lib.module_commands..Commands"></a>

### commands~Commands
Commands class. Represents all commands for a Notification

**Kind**: inner class of <code>[commands](#sockbot.lib.module_commands)</code>  
**Access:** public  

* [~Commands](#sockbot.lib.module_commands..Commands)
    * [new Commands(ids, postBody, handler)](#new_sockbot.lib.module_commands..Commands_new)
    * _instance_
        * [.ids](#sockbot.lib.module_commands..Commands+ids) : <code>Ids</code>
        * [.commands](#sockbot.lib.module_commands..Commands+commands) : <code>Array.&lt;Command&gt;</code>
        * [.text](#sockbot.lib.module_commands..Commands+text) : <code>string</code>
        * [.getPost()](#sockbot.lib.module_commands..Commands+getPost) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.setPost(post)](#sockbot.lib.module_commands..Commands+setPost)
        * [.getTopic()](#sockbot.lib.module_commands..Commands+getTopic) ⇒ <code>Promise.&lt;Topic&gt;</code>
        * [.setTopic(topic)](#sockbot.lib.module_commands..Commands+setTopic)
        * [.getPM()](#sockbot.lib.module_commands..Commands+getPM) ⇒ <code>Promise.&lt;ChatRoom&gt;</code>
        * [.setPM(pm)](#sockbot.lib.module_commands..Commands+setPM)
        * [.getUser()](#sockbot.lib.module_commands..Commands+getUser) ⇒ <code>Promise.&lt;User&gt;</code>
        * [.setUser(user)](#sockbot.lib.module_commands..Commands+setUser)
        * [.execute()](#sockbot.lib.module_commands..Commands+execute) ⇒ <code>Promise.&lt;Commands&gt;</code>
    * _static_
        * [.get(notification, postBody, handler)](#sockbot.lib.module_commands..Commands.get) ⇒ <code>Promise.&lt;Commands&gt;</code>
        * [.add(command, helpText, handler)](#sockbot.lib.module_commands..Commands.add) ⇒ <code>Promise</code>
        * [.addAlias(command, handler)](#sockbot.lib.module_commands..Commands.addAlias) ⇒ <code>Promise</code>
        * [.addExtendedHelp(command, text)](#sockbot.lib.module_commands..Commands.addExtendedHelp) ⇒ <code>Promise</code>
        * [.forbidCommand(command)](#sockbot.lib.module_commands..Commands.forbidCommand) ⇒ <code>boolean</code>

<a name="new_sockbot.lib.module_commands..Commands_new"></a>

#### new Commands(ids, postBody, handler)
Construct a Commands object from notification


| Param | Type | Description |
| --- | --- | --- |
| ids | <code>Ids</code> | Useful Ids |
| postBody | <code>string</code> | Raw Content of post containing commands |
| handler | <code>ReplyHandler</code> | Reply handler |

<a name="sockbot.lib.module_commands..Commands+ids"></a>

#### commands.ids : <code>Ids</code>
Ids relevant to this Commands object

**Kind**: instance property of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands+commands"></a>

#### commands.commands : <code>Array.&lt;Command&gt;</code>
Commands contained in this Commands object

**Kind**: instance property of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands+text"></a>

#### commands.text : <code>string</code>
Text this Commands object parsed

**Kind**: instance property of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands+getPost"></a>

#### commands.getPost() ⇒ <code>Promise.&lt;Post&gt;</code>
Get the Post this Commands object referrs to

**Kind**: instance method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the retrieved Post  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands+setPost"></a>

#### commands.setPost(post)
Set the Post this Commands object refers to

**Kind**: instance method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>Post</code> | The Post to cache |

<a name="sockbot.lib.module_commands..Commands+getTopic"></a>

#### commands.getTopic() ⇒ <code>Promise.&lt;Topic&gt;</code>
Get the Topic this Commands object referrs to

**Kind**: instance method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise.&lt;Topic&gt;</code> - Resolves to the retrieved Topic  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands+setTopic"></a>

#### commands.setTopic(topic)
Set the Topic this Commands object refers to

**Kind**: instance method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| topic | <code>Topic</code> | The Topic to cache |

<a name="sockbot.lib.module_commands..Commands+getPM"></a>

#### commands.getPM() ⇒ <code>Promise.&lt;ChatRoom&gt;</code>
Get the PrivateMessage this Commands object referrs to

**Kind**: instance method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise.&lt;ChatRoom&gt;</code> - Resolves to the retrieved ChatRoom  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands+setPM"></a>

#### commands.setPM(pm)
Set the PrivateMessage this Commands object refers to

**Kind**: instance method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| pm | <code>PrivateMessage</code> | The pm to cache |

<a name="sockbot.lib.module_commands..Commands+getUser"></a>

#### commands.getUser() ⇒ <code>Promise.&lt;User&gt;</code>
Get the user who sent these commands

**Kind**: instance method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise.&lt;User&gt;</code> - Resolved to the retrieved User  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands+setUser"></a>

#### commands.setUser(user)
Set the User this Commands object refers to

**Kind**: instance method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>User</code> | The User to cache |

<a name="sockbot.lib.module_commands..Commands+execute"></a>

#### commands.execute() ⇒ <code>Promise.&lt;Commands&gt;</code>
Execute the commands this object contains

**Kind**: instance method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise.&lt;Commands&gt;</code> - Resolves to self when all commands have been processed  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands.get"></a>

#### Commands.get(notification, postBody, handler) ⇒ <code>Promise.&lt;Commands&gt;</code>
Get Commands from a notification

**Kind**: static method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise.&lt;Commands&gt;</code> - Resolves to parsed commands  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| notification | <code>Notification</code> | Notification to get commands for |
| postBody | <code>string</code> | Post Body to parse for commands |
| handler | <code>ReplyHandler</code> | Reply function for commands |

<a name="sockbot.lib.module_commands..Commands.add"></a>

#### Commands.add(command, helpText, handler) ⇒ <code>Promise</code>
Add a command to this forum instance

**Kind**: static method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise</code> - Resolves when command has been added  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | Command to be added |
| helpText | <code>string</code> | Short help text for command |
| handler | <code>CommandHandler</code> | Function to handle the command |

<a name="sockbot.lib.module_commands..Commands.addAlias"></a>

#### Commands.addAlias(command, handler) ⇒ <code>Promise</code>
Add a command alias to this forum instance

**Kind**: static method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise</code> - Resolves when command has been added  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | Command alias to be added |
| handler | <code>CommandHandler</code> | Function to handle the command |

<a name="sockbot.lib.module_commands..Commands.addExtendedHelp"></a>

#### Commands.addExtendedHelp(command, text) ⇒ <code>Promise</code>
Add an extended help message for a command

**Kind**: static method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise</code> - Resolves when help message has been added  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | The command to add help text to |
| text | <code>string</code> | The help text to add for a command |

<a name="sockbot.lib.module_commands..Commands.forbidCommand"></a>

#### Commands.forbidCommand(command) ⇒ <code>boolean</code>
Forbid a command from being registered.

This is to allow a provider the ability to prevent commands from being registered or triggered that
would be problematic or prone to being accidentally triggered on the target system.

**Kind**: static method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>boolean</code> - True if the command was already forbidden, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | The forbidden command |

