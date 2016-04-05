<a name="module_summoner"></a>

## summoner
Example plugin, replies to mentions with random quips.

**Author:** Accalia  
**License**: MIT  

* [summoner](#module_summoner)
    * [module.exports(forum, config)](#exp_module_summoner--module.exports) ⇒ <code>Plugin</code> ⏏
        * [~handler(notification)](#module_summoner--module.exports..handler) ⇒ <code>Promise</code>
        * [~activate()](#module_summoner--module.exports..activate)
        * [~deactivate()](#module_summoner--module.exports..deactivate)

<a name="exp_module_summoner--module.exports"></a>

### module.exports(forum, config) ⇒ <code>Plugin</code> ⏏
Plugin generation function.

Returns a plugin object bound to the provided forum provider

**Kind**: Exported function  
**Returns**: <code>Plugin</code> - An instance of the Summoner plugin  

| Param | Type | Description |
| --- | --- | --- |
| forum | <code>Provider</code> | Active forum Provider |
| config | <code>object</code> &#124; <code>Array</code> | Plugin configuration |

<a name="module_summoner--module.exports..handler"></a>

#### module.exports~handler(notification) ⇒ <code>Promise</code>
Handle a mention notification.

Choose a random message and reply with it

**Kind**: inner method of <code>[module.exports](#exp_module_summoner--module.exports)</code>  
**Returns**: <code>Promise</code> - Resolves when event is processed  

| Param | Type | Description |
| --- | --- | --- |
| notification | <code>Notification</code> | Notification event to handle |

<a name="module_summoner--module.exports..activate"></a>

#### module.exports~activate()
Activate the plugin

**Kind**: inner method of <code>[module.exports](#exp_module_summoner--module.exports)</code>  
<a name="module_summoner--module.exports..deactivate"></a>

#### module.exports~deactivate()
Deactivate the plugin

**Kind**: inner method of <code>[module.exports](#exp_module_summoner--module.exports)</code>  
