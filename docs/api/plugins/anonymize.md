<a name="module_anonymizer"></a>
## anonymizer
Anonymizer plugin

**Author:** RaceProUK  
**License**: MIT  

* [anonymizer](#module_anonymizer)
  * [.prepare(plugConfig, config, events, browser)](#module_anonymizer.prepare)
  * [.start()](#module_anonymizer.start)
  * [.stop()](#module_anonymizer.stop)
  * [.handler(notification, topic, post)](#module_anonymizer.handler)

<a name="module_anonymizer.prepare"></a>
### anonymizer.prepare(plugConfig, config, events, browser)
Prepare Plugin prior to login

**Kind**: static method of <code>[anonymizer](#module_anonymizer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| plugConfig | <code>\*</code> | Plugin specific configuration |
| config | <code>Config</code> | Overall Bot Configuration |
| events | <code>externals.events.SockEvents</code> | EventEmitter used for the bot |
| browser | <code>Browser</code> | Web browser for communicating with discourse |

<a name="module_anonymizer.start"></a>
### anonymizer.start()
Start the plugin after login

**Kind**: static method of <code>[anonymizer](#module_anonymizer)</code>  
<a name="module_anonymizer.stop"></a>
### anonymizer.stop()
Stop the plugin prior to exit or reload

**Kind**: static method of <code>[anonymizer](#module_anonymizer)</code>  
<a name="module_anonymizer.handler"></a>
### anonymizer.handler(notification, topic, post)
Handle notifications

**Kind**: static method of <code>[anonymizer](#module_anonymizer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| notification | <code>external.notifications.Notification</code> | Notification recieved |
| topic | <code>external.topics.Topic</code> | Topic trigger post belongs to |
| post | <code>external.posts.CleanedPost</code> | Post that triggered notification |

