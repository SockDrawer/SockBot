## Functions

<dl>
<dt><a href="#getVersion">getVersion()</a> ⇒ <code>string</code></dt>
<dd><p>Get current version information, using latest commit sha1 as a fallback if detected version is semantic release 
placeholder.</p>
</dd>
<dt><a href="#getUserAgent">getUserAgent(cfg, provider)</a> ⇒ <code>string</code></dt>
<dd><p>Construct a useragent for sockbot to use</p>
</dd>
<dt><a href="#_buildMessage">_buildMessage(args)</a> ⇒ <code>string</code></dt>
<dd><p>Construct a stringified message to log</p>
</dd>
<dt><a href="#log">log(...message)</a></dt>
<dd><p>Log a message to stdout</p>
</dd>
<dt><a href="#error">error(...message)</a></dt>
<dd><p>Log a message to stderr</p>
</dd>
<dt><a href="#relativeRequire">relativeRequire(relativePath, module, requireIt)</a> ⇒ <code>object</code> | <code>function</code></dt>
<dd><p>Load a module relative to a local path, or relative to loaded config file</p>
</dd>
<dt><a href="#loadPlugins">loadPlugins(forumInstance, botConfig)</a> ⇒ <code>Promise</code></dt>
<dd><p>Load plugins for forum instance</p>
</dd>
<dt><a href="#activateConfig">activateConfig(botConfig)</a> ⇒ <code>Promise</code></dt>
<dd><p>Activate a loaded configuration.</p>
</dd>
</dl>

<a name="getVersion"></a>

## getVersion() ⇒ <code>string</code>
Get current version information, using latest commit sha1 as a fallback if detected version is semantic release 
placeholder.

**Kind**: global function  
**Returns**: <code>string</code> - Version information  
<a name="getUserAgent"></a>

## getUserAgent(cfg, provider) ⇒ <code>string</code>
Construct a useragent for sockbot to use

**Kind**: global function  
**Returns**: <code>string</code> - User-Agent to use for a forum instance  

| Param | Type | Description |
| --- | --- | --- |
| cfg | <code>object</code> | Instance Configuration to construct User Agent for |
| provider | <code>Forum</code> | Forum Provider class to construct User Agent for |

<a name="_buildMessage"></a>

## _buildMessage(args) ⇒ <code>string</code>
Construct a stringified message to log

**Kind**: global function  
**Returns**: <code>string</code> - stringified message  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Array.&lt;\*&gt;</code> | Item to stringify and log |

<a name="log"></a>

## log(...message)
Log a message to stdout

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ...message | <code>\*</code> | Message to log to stdout |

<a name="error"></a>

## error(...message)
Log a message to stderr

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ...message | <code>\*</code> | Message to log to stderr |

<a name="relativeRequire"></a>

## relativeRequire(relativePath, module, requireIt) ⇒ <code>object</code> &#124; <code>function</code>
Load a module relative to a local path, or relative to loaded config file

**Kind**: global function  
**Returns**: <code>object</code> &#124; <code>function</code> - Loaded module  

| Param | Type | Description |
| --- | --- | --- |
| relativePath | <code>string</code> | Local path to use |
| module | <code>string</code> | Module to load |
| requireIt | <code>function</code> | Function to use to load module |

<a name="loadPlugins"></a>

## loadPlugins(forumInstance, botConfig) ⇒ <code>Promise</code>
Load plugins for forum instance

**Kind**: global function  
**Returns**: <code>Promise</code> - Resolves when plugins have been loaded  

| Param | Type | Description |
| --- | --- | --- |
| forumInstance | <code>Provider</code> | Provider instance to load plugins into |
| botConfig | <code>object</code> | Bot configuration to load plugins with |

<a name="activateConfig"></a>

## activateConfig(botConfig) ⇒ <code>Promise</code>
Activate a loaded configuration.

**Kind**: global function  
**Returns**: <code>Promise</code> - Resolves when configuration is fully activated  

| Param | Type | Description |
| --- | --- | --- |
| botConfig | <code>object</code> | Configuration to activate |

