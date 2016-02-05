## Members

<dl>
<dt><a href="#core">core</a></dt>
<dd><p>Current core configuration</p>
<p>Set by internals. Do not edit</p>
</dd>
<dt><a href="#plugins">plugins</a></dt>
<dd><p>Current plugin configuration</p>
<p>Set by internals. Do not edit</p>
</dd>
<dt><a href="#basePath">basePath</a> : <code>string</code></dt>
<dd><p>Base Path of the active config file</p>
<p>Set by internals. Do not edit</p>
</dd>
<dt><a href="#mergeObjects">mergeObjects</a> ⇒ <code>object</code></dt>
<dd><p>Merge multiple objects into one object</p>
<p>Later objects override earlier objects</p>
<p>This is simply a reference to the function of the same name in <code>utils</code>,
exposed to allow plugins to call it without <code>require</code>ing <code>utils</code> itself</p>
</dd>
<dt><a href="#user">user</a></dt>
<dd><p>Current logged in user</p>
<p>Set by internals. Do not edit</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#defaultConfig">defaultConfig</a> : <code>object</code></dt>
<dd><p>Default configuration options</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#readFile">readFile(filePath, callback)</a></dt>
<dd><p>Read and parse configuration file from disc</p>
</dd>
<dt><a href="#loadConfiguration">loadConfiguration(filePath, callback)</a></dt>
<dd><p>Load configuration from disc</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#configComplete">configComplete</a></dt>
<dd><p>Configuration Loaded Callback</p>
</dd>
</dl>

<a name="core"></a>
## core
Current core configuration

Set by internals. Do not edit

**Kind**: global variable  
**Read only**: true  
<a name="plugins"></a>
## plugins
Current plugin configuration

Set by internals. Do not edit

**Kind**: global variable  
**Read only**: true  
<a name="basePath"></a>
## basePath : <code>string</code>
Base Path of the active config file

Set by internals. Do not edit

**Kind**: global variable  
**Read only**: true  
<a name="mergeObjects"></a>
## mergeObjects ⇒ <code>object</code>
Merge multiple objects into one object

Later objects override earlier objects

This is simply a reference to the function of the same name in `utils`,
exposed to allow plugins to call it without `require`ing `utils` itself

**Kind**: global variable  
**Returns**: <code>object</code> - object constructed by merging `mixin`s from left to right  

| Param | Type | Description |
| --- | --- | --- |
| [mergeArrays] | <code>boolean</code> | Merge arrays instead of concatenating them |
| ...mixin | <code>object</code> | Objects to merge |

<a name="user"></a>
## user
Current logged in user

Set by internals. Do not edit

**Kind**: global variable  
**Read only**: true  
<a name="defaultConfig"></a>
## defaultConfig : <code>object</code>
Default configuration options

**Kind**: global constant  
**Read only**: true  

* [defaultConfig](#defaultConfig) : <code>object</code>
    * [.core](#defaultConfig.core) : <code>object</code>
        * [.username](#defaultConfig.core.username) : <code>string</code>
        * [.password](#defaultConfig.core.password) : <code>string</code>
        * [.owner](#defaultConfig.core.owner) : <code>string</code>
        * [.forum](#defaultConfig.core.forum) : <code>string</code>
        * [.ignoreUsers](#defaultConfig.core.ignoreUsers) : <code>Array.&lt;string&gt;</code>
        * [.ignoreCategories](#defaultConfig.core.ignoreCategories) : <code>Array.&lt;Number&gt;</code>
        * [.cooldownPeriod](#defaultConfig.core.cooldownPeriod) : <code>Number</code>
        * [.handleActedMessage](#defaultConfig.core.handleActedMessage) : <code>boolean</code>
        * [.pollMessages](#defaultConfig.core.pollMessages) : <code>boolean</code>
        * [.pollNotifications](#defaultConfig.core.pollNotifications) : <code>boolean</code>
    * [.plugins](#defaultConfig.plugins) : <code>object</code>
    * [.basePath](#defaultConfig.basePath) : <code>string</code>

<a name="defaultConfig.core"></a>
### defaultConfig.core : <code>object</code>
Core configuration options

**Kind**: static property of <code>[defaultConfig](#defaultConfig)</code>  

* [.core](#defaultConfig.core) : <code>object</code>
    * [.username](#defaultConfig.core.username) : <code>string</code>
    * [.password](#defaultConfig.core.password) : <code>string</code>
    * [.owner](#defaultConfig.core.owner) : <code>string</code>
    * [.forum](#defaultConfig.core.forum) : <code>string</code>
    * [.ignoreUsers](#defaultConfig.core.ignoreUsers) : <code>Array.&lt;string&gt;</code>
    * [.ignoreCategories](#defaultConfig.core.ignoreCategories) : <code>Array.&lt;Number&gt;</code>
    * [.cooldownPeriod](#defaultConfig.core.cooldownPeriod) : <code>Number</code>
    * [.handleActedMessage](#defaultConfig.core.handleActedMessage) : <code>boolean</code>
    * [.pollMessages](#defaultConfig.core.pollMessages) : <code>boolean</code>
    * [.pollNotifications](#defaultConfig.core.pollNotifications) : <code>boolean</code>

<a name="defaultConfig.core.username"></a>
#### core.username : <code>string</code>
Username the bot will log in as

**Kind**: static property of <code>[core](#defaultConfig.core)</code>  
**Default**: <code>&quot;&quot;</code>  
<a name="defaultConfig.core.password"></a>
#### core.password : <code>string</code>
Password the bot will log in with

**Kind**: static property of <code>[core](#defaultConfig.core)</code>  
**Default**: <code>&quot;&quot;</code>  
<a name="defaultConfig.core.owner"></a>
#### core.owner : <code>string</code>
User the bot will consider owner

Owner promotes the user to virtual trust level 9 (above forum admins)

**Kind**: static property of <code>[core](#defaultConfig.core)</code>  
**Default**: <code>&quot;&quot;</code>  
<a name="defaultConfig.core.forum"></a>
#### core.forum : <code>string</code>
Base URL for the discourse instance to log into

Is case sensitive

**Kind**: static property of <code>[core](#defaultConfig.core)</code>  
**Default**: <code>&quot;https://what.thedailywtf.com&quot;</code>  
<a name="defaultConfig.core.ignoreUsers"></a>
#### core.ignoreUsers : <code>Array.&lt;string&gt;</code>
Users to ignore.

Ignoring users demotes them internally to virtual trust level 0. Forum staff cannot be ignored.

**Kind**: static property of <code>[core](#defaultConfig.core)</code>  
**Default**: <code>[&quot;blakeyrat&quot;,&quot;PaulaBean&quot;]</code>  
<a name="defaultConfig.core.ignoreCategories"></a>
#### core.ignoreCategories : <code>Array.&lt;Number&gt;</code>
Discourse categories to ignore

Posts from ignored categories will not trigger bot.

**Kind**: static property of <code>[core](#defaultConfig.core)</code>  
**Default**: <code>[8,23]</code>  
<a name="defaultConfig.core.cooldownPeriod"></a>
#### core.cooldownPeriod : <code>Number</code>
Cooldown timer for users that map to virtual trust level 1 or lower

**Kind**: static property of <code>[core](#defaultConfig.core)</code>  
**Default**: <code>3600000</code>  
<a name="defaultConfig.core.handleActedMessage"></a>
#### core.handleActedMessage : <code>boolean</code>
Switch to handle `acted` type channel messages.

This type of message is often not needed for bot operation and generates a fair bit of traffic.
Disabling reduces load on the host forum.

**Kind**: static property of <code>[core](#defaultConfig.core)</code>  
**Default**: <code>false</code>  
<a name="defaultConfig.core.pollMessages"></a>
#### core.pollMessages : <code>boolean</code>
Set whether to poll for messages.

If the bot only needs to handle notifications, set this to `false` to reduce load on the host forum.

Note: Setting this to `false` will cause notifications to be polled less frequently;
leave `true` if you want a more responsive bot

**Kind**: static property of <code>[core](#defaultConfig.core)</code>  
**Default**: <code>true</code>  
<a name="defaultConfig.core.pollNotifications"></a>
#### core.pollNotifications : <code>boolean</code>
Set whether to poll for notifications.

For bots, this will normally be left `true`.
For cyberparts, set this to `false` to stop the bot marking notifications as read.

**Kind**: static property of <code>[core](#defaultConfig.core)</code>  
**Default**: <code>true</code>  
<a name="defaultConfig.plugins"></a>
### defaultConfig.plugins : <code>object</code>
Plugin configuration.

See `Plugin Configuration` for details

**Kind**: static property of <code>[defaultConfig](#defaultConfig)</code>  
<a name="defaultConfig.basePath"></a>
### defaultConfig.basePath : <code>string</code>
Base Path of the active config file

**Kind**: static property of <code>[defaultConfig](#defaultConfig)</code>  
<a name="readFile"></a>
## readFile(filePath, callback)
Read and parse configuration file from disc

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | Path of file to read |
| callback | <code>[configComplete](#configComplete)</code> | Completion callback |

<a name="loadConfiguration"></a>
## loadConfiguration(filePath, callback)
Load configuration from disc

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | Configuration file path |
| callback | <code>[configComplete](#configComplete)</code> | Completion callback |

<a name="configComplete"></a>
## configComplete
Configuration Loaded Callback

**Kind**: global typedef  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Exception</code> | <code></code> | Error encountered processing request |
| config | <code>Object</code> |  | Loaded Configuration |

