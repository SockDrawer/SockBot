<a name="module_summoner"></a>
## summoner
Summoner plugin

Watches for @mentions and replies with a canned response

**Author:** Accalia  
**License**: MIT  

* [summoner](#module_summoner)
    * [.defaultConfig](#module_summoner.defaultConfig)
        * [.cooldown](#module_summoner.defaultConfig.cooldown) : <code>Number</code>
        * [.messages](#module_summoner.defaultConfig.messages) : <code>Array.&lt;string&gt;</code>
        * [.extendedHelp](#module_summoner.defaultConfig.extendedHelp)
    * [.mentionHandler(_, topic, post)](#module_summoner.mentionHandler)
    * [.prepare(plugConfig, config, events, browser)](#module_summoner.prepare)
    * [.start()](#module_summoner.start)
    * [.stop()](#module_summoner.stop)

<a name="module_summoner.defaultConfig"></a>
### summoner.defaultConfig
Default plugin configuration

**Kind**: static property of <code>[summoner](#module_summoner)</code>  

* [.defaultConfig](#module_summoner.defaultConfig)
    * [.cooldown](#module_summoner.defaultConfig.cooldown) : <code>Number</code>
    * [.messages](#module_summoner.defaultConfig.messages) : <code>Array.&lt;string&gt;</code>
    * [.extendedHelp](#module_summoner.defaultConfig.extendedHelp)

<a name="module_summoner.defaultConfig.cooldown"></a>
#### defaultConfig.cooldown : <code>Number</code>
Required delay before posting another reply in the same topic.

**Kind**: static property of <code>[defaultConfig](#module_summoner.defaultConfig)</code>  
<a name="module_summoner.defaultConfig.messages"></a>
#### defaultConfig.messages : <code>Array.&lt;string&gt;</code>
Messages to select reply from.

**Kind**: static property of <code>[defaultConfig](#module_summoner.defaultConfig)</code>  
**Default**: <code>[&quot;@%username% has summoned me, and so I appear.&quot;,&quot;Yes master %name%, I shall appear as summoned.&quot;,&quot;Yes mistress %name%, I shall appear as summoned.&quot;]</code>  
<a name="module_summoner.defaultConfig.extendedHelp"></a>
#### defaultConfig.extendedHelp
Extended help message

**Kind**: static property of <code>[defaultConfig](#module_summoner.defaultConfig)</code>  
<a name="module_summoner.mentionHandler"></a>
### summoner.mentionHandler(_, topic, post)
Respond to @mentions

**Kind**: static method of <code>[summoner](#module_summoner)</code>  

| Param | Type | Description |
| --- | --- | --- |
| _ | <code>external.notifications.Notification</code> | Notification recieved (ignored) |
| topic | <code>external.topics.Topic</code> | Topic trigger post belongs to |
| post | <code>external.posts.CleanedPost</code> | Post that triggered notification |

<a name="module_summoner.prepare"></a>
### summoner.prepare(plugConfig, config, events, browser)
Prepare Plugin prior to login

**Kind**: static method of <code>[summoner](#module_summoner)</code>  

| Param | Type | Description |
| --- | --- | --- |
| plugConfig | <code>\*</code> | Plugin specific configuration |
| config | <code>Config</code> | Overall Bot Configuration |
| events | <code>externals.events.SockEvents</code> | EventEmitter used for the bot |
| browser | <code>Browser</code> | Web browser for communicating with discourse |

<a name="module_summoner.start"></a>
### summoner.start()
Start the plugin after login

**Kind**: static method of <code>[summoner](#module_summoner)</code>  
<a name="module_summoner.stop"></a>
### summoner.stop()
Stop the plugin prior to exit or reload

**Kind**: static method of <code>[summoner](#module_summoner)</code>  
