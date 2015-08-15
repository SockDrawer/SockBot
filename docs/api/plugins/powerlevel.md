<a name="module_powerlevel"></a>
## powerlevel
PowerLevel plugin

Attempts to obtain and maintain a trust level

**Author:** Yamikuronue  
**License**: MIT  

* [powerlevel](#module_powerlevel)
  * [.defaultConfig](#module_powerlevel.defaultConfig)
  * [.prepare(config, _, events, browser)](#module_powerlevel.prepare)
  * [.start()](#module_powerlevel.start)
  * [.updateSelf(callback)](#module_powerlevel.updateSelf)
  * [.stop()](#module_powerlevel.stop)

<a name="module_powerlevel.defaultConfig"></a>
### powerlevel.defaultConfig
Default plugin configuration

**Kind**: static property of <code>[powerlevel](#module_powerlevel)</code>  
<a name="module_powerlevel.prepare"></a>
### powerlevel.prepare(config, _, events, browser)
Prepare Plugin prior to login

**Kind**: static method of <code>[powerlevel](#module_powerlevel)</code>  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>\*</code> | Plugin specific configuration |
| _ | <code>Config</code> | Overall Bot Configuration |
| events | <code>externals.events.SockEvents</code> | EventEmitter used for the bot |
| browser | <code>Browser</code> | Web browser for communicating with discourse |

<a name="module_powerlevel.start"></a>
### powerlevel.start()
Start the plugin after login

**Kind**: static method of <code>[powerlevel](#module_powerlevel)</code>  
<a name="module_powerlevel.updateSelf"></a>
### powerlevel.updateSelf(callback)
Update your internal representation of yourself

**Kind**: static method of <code>[powerlevel](#module_powerlevel)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The callback |

<a name="module_powerlevel.stop"></a>
### powerlevel.stop()
Stop the plugin prior to exit or reload

**Kind**: static method of <code>[powerlevel](#module_powerlevel)</code>  
