## Members
<dl>
<dt><a href="#config">config</a></dt>
<dd><p>Current configuration</p>
<p>Set by ineternals. Do not edit</p>
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
<dt><a href="#readFile">readFile(path, callback)</a></dt>
<dd><p>Read and parse configuration File from disc</p>
</dd>
<dt><a href="#loadConfiguration">loadConfiguration(path, callback)</a></dt>
<dd><p>Load configuration from disc</p>
</dd>
<dt><a href="#configComplete">configComplete([err], config)</a></dt>
<dd><p>Configuration Loaded Callback</p>
</dd>
</dl>
<a name="config"></a>
## config
Current configuration

Set by ineternals. Do not edit

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
  * [.plugins](#defaultConfig.plugins) : <code>object</code>

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
**Default**: <code>&quot;accalia&quot;</code>  
<a name="defaultConfig.core.forum"></a>
#### core.forum : <code>string</code>
Base URL for the discourse instance to log into

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
**Default**: <code>36000000</code>  
<a name="defaultConfig.plugins"></a>
### defaultConfig.plugins : <code>object</code>
Plugin configuration.

See `Plugin Configuration` for details

**Kind**: static property of <code>[defaultConfig](#defaultConfig)</code>  
<a name="readFile"></a>
## readFile(path, callback)
Read and parse configuration File from disc

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Path of file to read |
| callback | <code>[configComplete](#configComplete)</code> | Completion callback |

<a name="loadConfiguration"></a>
## loadConfiguration(path, callback)
Load configuration from disc

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Configuration file path |
| callback | <code>[configComplete](#configComplete)</code> | Completion callback |

<a name="configComplete"></a>
## configComplete([err], config)
Configuration Loaded Callback

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Exception</code> | <code></code> | Error encountered processing request |
| config | <code>Object</code> |  | Loaded Configuration |

