<a name="sockbot.providers.module_nodebb"></a>

## nodebb
NodeBB provider module

**Author:** Accalia  
**License**: MIT  

* [nodebb](#sockbot.providers.module_nodebb)
    * [~Forum](#sockbot.providers.module_nodebb..Forum)
        * [new Forum(config, useragent)](#new_sockbot.providers.module_nodebb..Forum_new)
        * [.config](#sockbot.providers.module_nodebb..Forum+config) : <code>object</code>
        * [.useragent](#sockbot.providers.module_nodebb..Forum+useragent) : <code>string</code>
        * [.url](#sockbot.providers.module_nodebb..Forum+url) : <code>string</code>
        * [.username](#sockbot.providers.module_nodebb..Forum+username)
        * [.user](#sockbot.providers.module_nodebb..Forum+user) : <code>User</code>
        * [.owner](#sockbot.providers.module_nodebb..Forum+owner) : <code>User</code>
        * [.Commands](#sockbot.providers.module_nodebb..Forum+Commands) : <code>Commands</code>
        * [.login()](#sockbot.providers.module_nodebb..Forum+login) ⇒ <code>Promise.&lt;Forum&gt;</code>
        * [.connectWebsocket()](#sockbot.providers.module_nodebb..Forum+connectWebsocket) ⇒ <code>Promise.&lt;Forum&gt;</code>
        * [.addPlugin(fnPlugin, pluginConfig)](#sockbot.providers.module_nodebb..Forum+addPlugin) ⇒ <code>Promise</code>
        * [.activate()](#sockbot.providers.module_nodebb..Forum+activate) ⇒ <code>Promise</code>
        * [.deactivate()](#sockbot.providers.module_nodebb..Forum+deactivate) ⇒ <code>Promise</code>
        * [.fetchObject(func, id, parser)](#sockbot.providers.module_nodebb..Forum+fetchObject) ⇒ <code>Promise.&lt;T&gt;</code>

<a name="sockbot.providers.module_nodebb..Forum"></a>

### nodebb~Forum
Forum connector

Connects to a NodeBB foru

**Kind**: inner class of <code>[nodebb](#sockbot.providers.module_nodebb)</code>  

* [~Forum](#sockbot.providers.module_nodebb..Forum)
    * [new Forum(config, useragent)](#new_sockbot.providers.module_nodebb..Forum_new)
    * [.config](#sockbot.providers.module_nodebb..Forum+config) : <code>object</code>
    * [.useragent](#sockbot.providers.module_nodebb..Forum+useragent) : <code>string</code>
    * [.url](#sockbot.providers.module_nodebb..Forum+url) : <code>string</code>
    * [.username](#sockbot.providers.module_nodebb..Forum+username)
    * [.user](#sockbot.providers.module_nodebb..Forum+user) : <code>User</code>
    * [.owner](#sockbot.providers.module_nodebb..Forum+owner) : <code>User</code>
    * [.Commands](#sockbot.providers.module_nodebb..Forum+Commands) : <code>Commands</code>
    * [.login()](#sockbot.providers.module_nodebb..Forum+login) ⇒ <code>Promise.&lt;Forum&gt;</code>
    * [.connectWebsocket()](#sockbot.providers.module_nodebb..Forum+connectWebsocket) ⇒ <code>Promise.&lt;Forum&gt;</code>
    * [.addPlugin(fnPlugin, pluginConfig)](#sockbot.providers.module_nodebb..Forum+addPlugin) ⇒ <code>Promise</code>
    * [.activate()](#sockbot.providers.module_nodebb..Forum+activate) ⇒ <code>Promise</code>
    * [.deactivate()](#sockbot.providers.module_nodebb..Forum+deactivate) ⇒ <code>Promise</code>
    * [.fetchObject(func, id, parser)](#sockbot.providers.module_nodebb..Forum+fetchObject) ⇒ <code>Promise.&lt;T&gt;</code>

<a name="new_sockbot.providers.module_nodebb..Forum_new"></a>

#### new Forum(config, useragent)
Create a forum connector instance


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | Bot configuration data |
| useragent | <code>string</code> | Useragentto use for all requests |

<a name="sockbot.providers.module_nodebb..Forum+config"></a>

#### forum.config : <code>object</code>
Bot instance configuration

**Kind**: instance property of <code>[Forum](#sockbot.providers.module_nodebb..Forum)</code>  
**Access:** public  
<a name="sockbot.providers.module_nodebb..Forum+useragent"></a>

#### forum.useragent : <code>string</code>
Useragent used by the instance

**Kind**: instance property of <code>[Forum](#sockbot.providers.module_nodebb..Forum)</code>  
**Access:** public  
<a name="sockbot.providers.module_nodebb..Forum+url"></a>

#### forum.url : <code>string</code>
Base URL for the forum

**Kind**: instance property of <code>[Forum](#sockbot.providers.module_nodebb..Forum)</code>  
**Access:** public  
<a name="sockbot.providers.module_nodebb..Forum+username"></a>

#### forum.username
Username bot will log in as

**Kind**: instance property of <code>[Forum](#sockbot.providers.module_nodebb..Forum)</code>  
**Access:** public  
**Type{string}**:   
<a name="sockbot.providers.module_nodebb..Forum+user"></a>

#### forum.user : <code>User</code>
Logged in Bot Username

**Kind**: instance property of <code>[Forum](#sockbot.providers.module_nodebb..Forum)</code>  
**Access:** public  
<a name="sockbot.providers.module_nodebb..Forum+owner"></a>

#### forum.owner : <code>User</code>
Bot instance Owner user

**Kind**: instance property of <code>[Forum](#sockbot.providers.module_nodebb..Forum)</code>  
**Access:** public  
<a name="sockbot.providers.module_nodebb..Forum+Commands"></a>

#### forum.Commands : <code>Commands</code>
Get Commands object bound to this instance

**Kind**: instance property of <code>[Forum](#sockbot.providers.module_nodebb..Forum)</code>  
**Access:** public  
<a name="sockbot.providers.module_nodebb..Forum+login"></a>

#### forum.login() ⇒ <code>Promise.&lt;Forum&gt;</code>
Login to forum instance

**Kind**: instance method of <code>[Forum](#sockbot.providers.module_nodebb..Forum)</code>  
**Returns**: <code>Promise.&lt;Forum&gt;</code> - Resolves to logged in forum  
**Promise**:   
**Fulfill**: <code>Forum</code> Logged in forum  
<a name="sockbot.providers.module_nodebb..Forum+connectWebsocket"></a>

#### forum.connectWebsocket() ⇒ <code>Promise.&lt;Forum&gt;</code>
Connect to remote websocket

**Kind**: instance method of <code>[Forum](#sockbot.providers.module_nodebb..Forum)</code>  
**Returns**: <code>Promise.&lt;Forum&gt;</code> - Resolves to connected forum  
**Access:** public  
**Promise**:   
**Resolves**: <code>Forum</code> Connected forum  
<a name="sockbot.providers.module_nodebb..Forum+addPlugin"></a>

#### forum.addPlugin(fnPlugin, pluginConfig) ⇒ <code>Promise</code>
Add a plugin to this forum instance

**Kind**: instance method of <code>[Forum](#sockbot.providers.module_nodebb..Forum)</code>  
**Returns**: <code>Promise</code> - Resolves on completion  
**Access:** public  
**Promise**:   
**Fulfill**: <code>\*</code> Plugin addedd successfully  
**Reject**: <code>Error</code> Generated plugin is invalid  

| Param | Type | Description |
| --- | --- | --- |
| fnPlugin | <code>PluginFn</code> &#124; <code>PluginGenerator</code> | Plugin Generator |
| pluginConfig | <code>object</code> | Plugin configuration |

<a name="sockbot.providers.module_nodebb..Forum+activate"></a>

#### forum.activate() ⇒ <code>Promise</code>
Activate forum and plugins

**Kind**: instance method of <code>[Forum](#sockbot.providers.module_nodebb..Forum)</code>  
**Returns**: <code>Promise</code> - Resolves when all plugins have been enabled  
<a name="sockbot.providers.module_nodebb..Forum+deactivate"></a>

#### forum.deactivate() ⇒ <code>Promise</code>
Deactivate forum and plugins

**Kind**: instance method of <code>[Forum](#sockbot.providers.module_nodebb..Forum)</code>  
**Returns**: <code>Promise</code> - Resolves when all plugins have been disabled  
<a name="sockbot.providers.module_nodebb..Forum+fetchObject"></a>

#### forum.fetchObject(func, id, parser) ⇒ <code>Promise.&lt;T&gt;</code>
Retrieve and parse an object

**Kind**: instance method of <code>[Forum](#sockbot.providers.module_nodebb..Forum)</code>  
**Returns**: <code>Promise.&lt;T&gt;</code> - Resolves to retrieved and parsed object  
**Access:** public  
**Promise**:   
**Fullfil**: <code>T</code> Retrieved and parsed object  

| Param | Type | Description |
| --- | --- | --- |
| func | <code>string</code> | Websocket function to retrieve object from |
| id | <code>\*</code> | Id parameter to websocket function |
| parser | <code>ParserFunction.&lt;T&gt;</code> | Parse function to apply to retrieved data |

