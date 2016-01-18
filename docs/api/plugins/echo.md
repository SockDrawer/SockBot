<a name="module_echo"></a>
## echo
Example plugin, echos your words back at you.

**Author:** Accalia  
**License**: MIT  

* [echo](#module_echo)
    * [.extendedHelp](#module_echo.extendedHelp)
    * [.prepare(plugConfig, config, events, browser)](#module_echo.prepare)
    * [.start()](#module_echo.start)
    * [.stop()](#module_echo.stop)
    * [.handler(notification, topic, post)](#module_echo.handler)

<a name="module_echo.extendedHelp"></a>
### echo.extendedHelp
Extended help message

**Kind**: static property of <code>[echo](#module_echo)</code>  
<a name="module_echo.prepare"></a>
### echo.prepare(plugConfig, config, events, browser)
Prepare Plugin prior to login

**Kind**: static method of <code>[echo](#module_echo)</code>  

| Param | Type | Description |
| --- | --- | --- |
| plugConfig | <code>\*</code> | Plugin specific configuration |
| config | <code>Config</code> | Overall Bot Configuration |
| events | <code>externals.events.SockEvents</code> | EventEmitter used for the bot |
| browser | <code>Browser</code> | Web browser for communicating with discourse |

<a name="module_echo.start"></a>
### echo.start()
Start the plugin after login

**Kind**: static method of <code>[echo](#module_echo)</code>  
<a name="module_echo.stop"></a>
### echo.stop()
Stop the plugin prior to exit or reload

**Kind**: static method of <code>[echo](#module_echo)</code>  
<a name="module_echo.handler"></a>
### echo.handler(notification, topic, post)
Handle notifications

**Kind**: static method of <code>[echo](#module_echo)</code>  

| Param | Type | Description |
| --- | --- | --- |
| notification | <code>external.notifications.Notification</code> | Notification recieved |
| topic | <code>external.topics.Topic</code> | Topic trigger post belongs to |
| post | <code>external.posts.CleanedPost</code> | Post that triggered notification |

