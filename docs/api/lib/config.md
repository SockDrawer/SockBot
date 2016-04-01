## Members

<dl>
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
</dl>

## Constants

<dl>
<dt><a href="#defaultConfig">defaultConfig</a> : <code>object</code></dt>
<dd><p>Default configuration options</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#readYaml">readYaml(filePath, callback)</a> ⇒ <code>Promise.&lt;*&gt;</code></dt>
<dd><p>Read and parse configuration file from disc</p>
</dd>
<dt><a href="#load">load(filePath)</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Load configuration from disc</p>
</dd>
<dt><a href="#validateConfig">validateConfig(config)</a></dt>
<dd><p>Validate a configuration entry</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#configComplete">configComplete</a></dt>
<dd><p>Configuration Loaded Callback</p>
</dd>
</dl>

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
<a name="defaultConfig.plugins"></a>

### defaultConfig.plugins : <code>object</code>
Plugin configuration.

See `Plugin Configuration` for details

**Kind**: static property of <code>[defaultConfig](#defaultConfig)</code>  
<a name="readYaml"></a>

## readYaml(filePath, callback) ⇒ <code>Promise.&lt;\*&gt;</code>
Read and parse configuration file from disc

**Kind**: global function  
**Returns**: <code>Promise.&lt;\*&gt;</code> - Resolves tyo YAML parsed configuration file  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | Path of file to read |
| callback | <code>[configComplete](#configComplete)</code> | Completion callback |

<a name="load"></a>

## load(filePath) ⇒ <code>Promise.&lt;Array&gt;</code>
Load configuration from disc

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Resolves to an array of valid configuration entries  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | Configuration file path |

<a name="validateConfig"></a>

## validateConfig(config)
Validate a configuration entry

**Kind**: global function  
**Throws**:

- <code>Error</code> `username`, `password`, or `owner` is not a string of at least length 1


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | Configuration entry to validate |

<a name="configComplete"></a>

## configComplete
Configuration Loaded Callback

**Kind**: global typedef  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Exception</code> | <code></code> | Error encountered processing request |
| config | <code>Object</code> |  | Loaded Configuration |

