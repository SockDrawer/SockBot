<a name="sockbot.lib.module_commands"></a>

## commands
NodeBB provider module User class

**Author:** Accalia  
**License**: MIT  

* [commands](#sockbot.lib.module_commands)
    * _static_
        * [.bindCommands(forum)](#sockbot.lib.module_commands.bindCommands) ⇒ <code>Commands</code>
            * [~handlers](#sockbot.lib.module_commands.bindCommands..handlers)
            * [~helpTopics](#sockbot.lib.module_commands.bindCommands..helpTopics)
    * _inner_
        * [~Command](#sockbot.lib.module_commands..Command)
            * [new Command(definition, parent)](#new_sockbot.lib.module_commands..Command_new)
            * [.line](#sockbot.lib.module_commands..Command+line) : <code>string</code>
            * [.command](#sockbot.lib.module_commands..Command+command) : <code>string</code>
            * [.mention](#sockbot.lib.module_commands..Command+mention) : <code>boolean</code>
            * [.args](#sockbot.lib.module_commands..Command+args) : <code>Array.&lt;string&gt;</code>
            * [.parent](#sockbot.lib.module_commands..Command+parent) : <code>Commands</code>
            * [.replyText](#sockbot.lib.module_commands..Command+replyText) : <code>string</code>
            * [.execute()](#sockbot.lib.module_commands..Command+execute) ⇒ <code>Promise</code>
            * [.getPost()](#sockbot.lib.module_commands..Command+getPost) ⇒ <code>Promise.&lt;Post&gt;</code>
            * [.getTopic()](#sockbot.lib.module_commands..Command+getTopic) ⇒ <code>Promise.&lt;Topic&gt;</code>
            * [.getUser()](#sockbot.lib.module_commands..Command+getUser) ⇒ <code>Promise.&lt;User&gt;</code>
            * [.reply(content)](#sockbot.lib.module_commands..Command+reply)
        * [~Commands](#sockbot.lib.module_commands..Commands)
            * [new Commands(notification, postBody)](#new_sockbot.lib.module_commands..Commands_new)
            * _instance_
                * [.notification](#sockbot.lib.module_commands..Commands+notification) : <code>Notification</code>
                * [.commands](#sockbot.lib.module_commands..Commands+commands) : <code>Array.&lt;Command&gt;</code>
                * [.getPost()](#sockbot.lib.module_commands..Commands+getPost) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.getTopic()](#sockbot.lib.module_commands..Commands+getTopic) ⇒ <code>Promise.&lt;Topic&gt;</code>
                * [.getUser()](#sockbot.lib.module_commands..Commands+getUser) ⇒ <code>Promise.&lt;User&gt;</code>
                * [.execute()](#sockbot.lib.module_commands..Commands+execute) ⇒ <code>Promise.&lt;Commands&gt;</code>
            * _static_
                * [.get(notification)](#sockbot.lib.module_commands..Commands.get) ⇒ <code>Promise.&lt;Commands&gt;</code>
                * [.add(command, helpText, handler)](#sockbot.lib.module_commands..Commands.add) ⇒ <code>Promise</code>

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
    * [~helpTopics](#sockbot.lib.module_commands.bindCommands..helpTopics)

<a name="sockbot.lib.module_commands.bindCommands..handlers"></a>

#### bindCommands~handlers
Command Handlers

**Kind**: inner constant of <code>[bindCommands](#sockbot.lib.module_commands.bindCommands)</code>  
**Default**: <code>{&quot;help&quot;:&quot;&quot;}</code>  
<a name="sockbot.lib.module_commands.bindCommands..helpTopics"></a>

#### bindCommands~helpTopics
Extended help topics

**Kind**: inner constant of <code>[bindCommands](#sockbot.lib.module_commands.bindCommands)</code>  
<a name="sockbot.lib.module_commands..Command"></a>

### commands~Command
Command Class. Represents a single command within a post

**Kind**: inner class of <code>[commands](#sockbot.lib.module_commands)</code>  

* [~Command](#sockbot.lib.module_commands..Command)
    * [new Command(definition, parent)](#new_sockbot.lib.module_commands..Command_new)
    * [.line](#sockbot.lib.module_commands..Command+line) : <code>string</code>
    * [.command](#sockbot.lib.module_commands..Command+command) : <code>string</code>
    * [.mention](#sockbot.lib.module_commands..Command+mention) : <code>boolean</code>
    * [.args](#sockbot.lib.module_commands..Command+args) : <code>Array.&lt;string&gt;</code>
    * [.parent](#sockbot.lib.module_commands..Command+parent) : <code>Commands</code>
    * [.replyText](#sockbot.lib.module_commands..Command+replyText) : <code>string</code>
    * [.execute()](#sockbot.lib.module_commands..Command+execute) ⇒ <code>Promise</code>
    * [.getPost()](#sockbot.lib.module_commands..Command+getPost) ⇒ <code>Promise.&lt;Post&gt;</code>
    * [.getTopic()](#sockbot.lib.module_commands..Command+getTopic) ⇒ <code>Promise.&lt;Topic&gt;</code>
    * [.getUser()](#sockbot.lib.module_commands..Command+getUser) ⇒ <code>Promise.&lt;User&gt;</code>
    * [.reply(content)](#sockbot.lib.module_commands..Command+reply)

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
Command name

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
<a name="sockbot.lib.module_commands..Command+reply"></a>

#### command.reply(content)
Reply to command with content

**Kind**: instance method of <code>[Command](#sockbot.lib.module_commands..Command)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Content to reply with |

<a name="sockbot.lib.module_commands..Commands"></a>

### commands~Commands
Commands class. Represents all commands for a Notification

**Kind**: inner class of <code>[commands](#sockbot.lib.module_commands)</code>  
**Access:** public  

* [~Commands](#sockbot.lib.module_commands..Commands)
    * [new Commands(notification, postBody)](#new_sockbot.lib.module_commands..Commands_new)
    * _instance_
        * [.notification](#sockbot.lib.module_commands..Commands+notification) : <code>Notification</code>
        * [.commands](#sockbot.lib.module_commands..Commands+commands) : <code>Array.&lt;Command&gt;</code>
        * [.getPost()](#sockbot.lib.module_commands..Commands+getPost) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.getTopic()](#sockbot.lib.module_commands..Commands+getTopic) ⇒ <code>Promise.&lt;Topic&gt;</code>
        * [.getUser()](#sockbot.lib.module_commands..Commands+getUser) ⇒ <code>Promise.&lt;User&gt;</code>
        * [.execute()](#sockbot.lib.module_commands..Commands+execute) ⇒ <code>Promise.&lt;Commands&gt;</code>
    * _static_
        * [.get(notification)](#sockbot.lib.module_commands..Commands.get) ⇒ <code>Promise.&lt;Commands&gt;</code>
        * [.add(command, helpText, handler)](#sockbot.lib.module_commands..Commands.add) ⇒ <code>Promise</code>

<a name="new_sockbot.lib.module_commands..Commands_new"></a>

#### new Commands(notification, postBody)
Construct a Commands object from notification


| Param | Type | Description |
| --- | --- | --- |
| notification | <code>Notification</code> | Notification that contains commands |
| postBody | <code>string</code> | Raw Content of post containing commands |

<a name="sockbot.lib.module_commands..Commands+notification"></a>

#### commands.notification : <code>Notification</code>
Notification that created this Commands object

**Kind**: instance property of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands+commands"></a>

#### commands.commands : <code>Array.&lt;Command&gt;</code>
Commands contained in this Commands object

**Kind**: instance property of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands+getPost"></a>

#### commands.getPost() ⇒ <code>Promise.&lt;Post&gt;</code>
Get the Post this Commands object referrs to

**Kind**: instance method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the retrieved Post  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands+getTopic"></a>

#### commands.getTopic() ⇒ <code>Promise.&lt;Topic&gt;</code>
Get the Topic this Commands object referrs to

**Kind**: instance method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise.&lt;Topic&gt;</code> - Resolves to the retrieved Topic  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands+getUser"></a>

#### commands.getUser() ⇒ <code>Promise.&lt;User&gt;</code>
Get the user who sent these commands

**Kind**: instance method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise.&lt;User&gt;</code> - Resolved to the retrieved User  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands+execute"></a>

#### commands.execute() ⇒ <code>Promise.&lt;Commands&gt;</code>
Execute the commands this object contains

**Kind**: instance method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise.&lt;Commands&gt;</code> - Resolves to self when all commands have been processed  
**Access:** public  
<a name="sockbot.lib.module_commands..Commands.get"></a>

#### Commands.get(notification) ⇒ <code>Promise.&lt;Commands&gt;</code>
Get Commands from a notification

**Kind**: static method of <code>[Commands](#sockbot.lib.module_commands..Commands)</code>  
**Returns**: <code>Promise.&lt;Commands&gt;</code> - Resolves to parsed commands  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| notification | <code>Notification</code> | Notification to get commands for |

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

