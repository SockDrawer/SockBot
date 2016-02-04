<a name="module_namer"></a>
## namer
Change your long name periodically

**Author:** Accalia  
**License**: MIT  

* [namer](#module_namer)
    * _static_
        * [.prepare(plugConfig, config, events, browser)](#module_namer.prepare)
        * [.start()](#module_namer.start)
        * [.stop()](#module_namer.stop)
        * [.setName()](#module_namer.setName)
    * _inner_
        * [~profilePrefix](#module_namer..profilePrefix)
        * [~defaultConfig](#module_namer..defaultConfig) : <code>object</code>
            * [.schedule](#module_namer..defaultConfig.schedule) : <code>string</code>
            * [.names](#module_namer..defaultConfig.names) : <code>Array.&lt;string&gt;</code>
        * [~internals](#module_namer..internals) : <code>object</code>
            * [.profileUrl](#module_namer..internals.profileUrl) : <code>string</code>
            * [.browser](#module_namer..internals.browser) : <code>Browser</code>
            * [.events](#module_namer..internals.events) : <code>externals.events.SockEvents</code>
            * [.config](#module_namer..internals.config) : <code>object</code>
            * [.interval](#module_namer..internals.interval) : <code>\*</code>
            * [.extendedHelp](#module_namer..internals.extendedHelp)

<a name="module_namer.prepare"></a>
### namer.prepare(plugConfig, config, events, browser)
Prepare Plugin prior to login

**Kind**: static method of <code>[namer](#module_namer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| plugConfig | <code>\*</code> | Plugin specific configuration |
| config | <code>Config</code> | Overall Bot Configuration |
| events | <code>externals.events.SockEvents</code> | EventEmitter used for the bot |
| browser | <code>Browser</code> | Web browser for communicating with discourse |

<a name="module_namer.start"></a>
### namer.start()
Start the plugin after login

**Kind**: static method of <code>[namer](#module_namer)</code>  
<a name="module_namer.stop"></a>
### namer.stop()
Stop the plugin prior to exit or reload

**Kind**: static method of <code>[namer](#module_namer)</code>  
<a name="module_namer.setName"></a>
### namer.setName()
Set the new Log name from a list of choices.

**Kind**: static method of <code>[namer](#module_namer)</code>  
<a name="module_namer..profilePrefix"></a>
### namer~profilePrefix
Profile Prefix

**Kind**: inner constant of <code>[namer](#module_namer)</code>  
<a name="module_namer..defaultConfig"></a>
### namer~defaultConfig : <code>object</code>
Default configuration settings

**Kind**: inner typedef of <code>[namer](#module_namer)</code>  

* [~defaultConfig](#module_namer..defaultConfig) : <code>object</code>
    * [.schedule](#module_namer..defaultConfig.schedule) : <code>string</code>
    * [.names](#module_namer..defaultConfig.names) : <code>Array.&lt;string&gt;</code>

<a name="module_namer..defaultConfig.schedule"></a>
#### defaultConfig.schedule : <code>string</code>
Schedule to change name on. Must be a valid `later` text schedule.

See the [parser documentation](https://bunkat.github.io/later/parsers.html#text) for more information

**Kind**: static property of <code>[defaultConfig](#module_namer..defaultConfig)</code>  
**Default**: <code>&quot;at 00:00&quot;</code>  
<a name="module_namer..defaultConfig.names"></a>
#### defaultConfig.names : <code>Array.&lt;string&gt;</code>
Long names to choose from.

**Kind**: static property of <code>[defaultConfig](#module_namer..defaultConfig)</code>  
**Default**: <code>[&quot;The of and to. A in is I. That it, for you, was with on. As have ... but be they.&quot;]</code>  
<a name="module_namer..internals"></a>
### namer~internals : <code>object</code>
Internal status store

**Kind**: inner typedef of <code>[namer](#module_namer)</code>  

* [~internals](#module_namer..internals) : <code>object</code>
    * [.profileUrl](#module_namer..internals.profileUrl) : <code>string</code>
    * [.browser](#module_namer..internals.browser) : <code>Browser</code>
    * [.events](#module_namer..internals.events) : <code>externals.events.SockEvents</code>
    * [.config](#module_namer..internals.config) : <code>object</code>
    * [.interval](#module_namer..internals.interval) : <code>\*</code>
    * [.extendedHelp](#module_namer..internals.extendedHelp)

<a name="module_namer..internals.profileUrl"></a>
#### internals.profileUrl : <code>string</code>
Profile URL

**Kind**: static property of <code>[internals](#module_namer..internals)</code>  
<a name="module_namer..internals.browser"></a>
#### internals.browser : <code>Browser</code>
Browser to use for communication with discourse

**Kind**: static property of <code>[internals](#module_namer..internals)</code>  
<a name="module_namer..internals.events"></a>
#### internals.events : <code>externals.events.SockEvents</code>
EventEmitter used for internal communication

**Kind**: static property of <code>[internals](#module_namer..internals)</code>  
<a name="module_namer..internals.config"></a>
#### internals.config : <code>object</code>
Instance configuration

**Kind**: static property of <code>[internals](#module_namer..internals)</code>  
<a name="module_namer..internals.interval"></a>
#### internals.interval : <code>\*</code>
Interval identifier for schedule

**Kind**: static property of <code>[internals](#module_namer..internals)</code>  
<a name="module_namer..internals.extendedHelp"></a>
#### internals.extendedHelp
Extended help message

**Kind**: static property of <code>[internals](#module_namer..internals)</code>  
