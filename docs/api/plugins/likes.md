<a name="module_likes"></a>
## likes
Auto-like module.

Watches threads for new posts and likes them, includes "binge" functionality to catch up with likes on older posts

**Author:** Accalia  
**License**: MIT  

* [likes](#module_likes)
  * _static_
    * [.prepare(plugConfig, config, events, browser)](#module_likes.prepare)
    * [.start()](#module_likes.start)
    * [.stop()](#module_likes.stop)
    * [.messageHandler(data, topic, post)](#module_likes.messageHandler)
    * [.binge()](#module_likes.binge)
    * [.handlePost(post, callback)](#module_likes.handlePost)
  * _inner_
    * [~defaultConfig](#module_likes..defaultConfig) : <code>object</code>
      * [.binge](#module_likes..defaultConfig.binge) : <code>boolean</code>
      * [.bingeCap](#module_likes..defaultConfig.bingeCap) : <code>number</code>
      * [.bingeHour](#module_likes..defaultConfig.bingeHour) : <code>number</code>
      * [.bingeMinute](#module_likes..defaultConfig.bingeMinute) : <code>number</code>
      * [.topics](#module_likes..defaultConfig.topics) : <code>Array.&lt;number&gt;</code>
      * [.delay](#module_likes..defaultConfig.delay) : <code>number</code>
      * [.scatter](#module_likes..defaultConfig.scatter) : <code>number</code>
    * [~internals](#module_likes..internals) : <code>object</code>
      * [.browser](#module_likes..internals.browser) : <code>Browser</code>
      * [.config](#module_likes..internals.config) : <code>object</code>
      * [.bingeInterval](#module_likes..internals.bingeInterval) : <code>\*</code>
      * [.likeCount](#module_likes..internals.likeCount) : <code>number</code>
      * [.events](#module_likes..internals.events) : <code>externals.events.SockEvents</code>
    * [~completionCallback](#module_likes..completionCallback)

<a name="module_likes.prepare"></a>
### likes.prepare(plugConfig, config, events, browser)
Prepare plugin prior to login

**Kind**: static method of <code>[likes](#module_likes)</code>  

| Param | Type | Description |
| --- | --- | --- |
| plugConfig | <code>\*</code> | Plugin specific configuration |
| config | <code>Config</code> | Overall Bot Configuration |
| events | <code>externals.events.SockEvents</code> | EventEmitter used for the bot |
| browser | <code>Browser</code> | Web browser for communicating with discourse |

<a name="module_likes.start"></a>
### likes.start()
Start the plugin after login

**Kind**: static method of <code>[likes](#module_likes)</code>  
<a name="module_likes.stop"></a>
### likes.stop()
Stop the plugin prior to exit or reload

**Kind**: static method of <code>[likes](#module_likes)</code>  
<a name="module_likes.messageHandler"></a>
### likes.messageHandler(data, topic, post)
Handle topic message

**Kind**: static method of <code>[likes](#module_likes)</code>  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>external.notifications.notification</code> | Notification data |
| topic | <code>external.topics.Topic</code> | Topic containing post generating notification |
| post | <code>external.posts.CleanedPost</code> | Post that generated notification |

<a name="module_likes.binge"></a>
### likes.binge()
Perform a like binge

**Kind**: static method of <code>[likes](#module_likes)</code>  
<a name="module_likes.handlePost"></a>
### likes.handlePost(post, callback)
Handle a post in a like binge

**Kind**: static method of <code>[likes](#module_likes)</code>  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>external.posts.CleanedPost</code> | Post to handle |
| callback | <code>completionCallback</code> | Completion Callback |

<a name="module_likes..defaultConfig"></a>
### likes~defaultConfig : <code>object</code>
Default configuration settings

**Kind**: inner typedef of <code>[likes](#module_likes)</code>  

  * [~defaultConfig](#module_likes..defaultConfig) : <code>object</code>
    * [.binge](#module_likes..defaultConfig.binge) : <code>boolean</code>
    * [.bingeCap](#module_likes..defaultConfig.bingeCap) : <code>number</code>
    * [.bingeHour](#module_likes..defaultConfig.bingeHour) : <code>number</code>
    * [.bingeMinute](#module_likes..defaultConfig.bingeMinute) : <code>number</code>
    * [.topics](#module_likes..defaultConfig.topics) : <code>Array.&lt;number&gt;</code>
    * [.delay](#module_likes..defaultConfig.delay) : <code>number</code>
    * [.scatter](#module_likes..defaultConfig.scatter) : <code>number</code>

<a name="module_likes..defaultConfig.binge"></a>
#### defaultConfig.binge : <code>boolean</code>
Whether like binges should be performed

**Kind**: static property of <code>[defaultConfig](#module_likes..defaultConfig)</code>  
**Default**: <code>false</code>  
<a name="module_likes..defaultConfig.bingeCap"></a>
#### defaultConfig.bingeCap : <code>number</code>
Maximum number of likes to hand out as part of a like binge

**Kind**: static property of <code>[defaultConfig](#module_likes..defaultConfig)</code>  
**Default**: <code>500</code>  
<a name="module_likes..defaultConfig.bingeHour"></a>
#### defaultConfig.bingeHour : <code>number</code>
The hour of the day to go on a like binge in UTC (0-23)

**Kind**: static property of <code>[defaultConfig](#module_likes..defaultConfig)</code>  
**Default**: <code>0</code>  
<a name="module_likes..defaultConfig.bingeMinute"></a>
#### defaultConfig.bingeMinute : <code>number</code>
The minute of the hour to go on a like binge in UTC (0-59)

**Kind**: static property of <code>[defaultConfig](#module_likes..defaultConfig)</code>  
**Default**: <code>0</code>  
<a name="module_likes..defaultConfig.topics"></a>
#### defaultConfig.topics : <code>Array.&lt;number&gt;</code>
Topics to hand out likes in

**Kind**: static property of <code>[defaultConfig](#module_likes..defaultConfig)</code>  
**Default**: <code>[1000]</code>  
<a name="module_likes..defaultConfig.delay"></a>
#### defaultConfig.delay : <code>number</code>
Time to delay liking post as posts are streamed in

**Kind**: static property of <code>[defaultConfig](#module_likes..defaultConfig)</code>  
<a name="module_likes..defaultConfig.scatter"></a>
#### defaultConfig.scatter : <code>number</code>
Amount of time to scatter likes by

**Kind**: static property of <code>[defaultConfig](#module_likes..defaultConfig)</code>  
<a name="module_likes..internals"></a>
### likes~internals : <code>object</code>
Internal status store

**Kind**: inner typedef of <code>[likes](#module_likes)</code>  

  * [~internals](#module_likes..internals) : <code>object</code>
    * [.browser](#module_likes..internals.browser) : <code>Browser</code>
    * [.config](#module_likes..internals.config) : <code>object</code>
    * [.bingeInterval](#module_likes..internals.bingeInterval) : <code>\*</code>
    * [.likeCount](#module_likes..internals.likeCount) : <code>number</code>
    * [.events](#module_likes..internals.events) : <code>externals.events.SockEvents</code>

<a name="module_likes..internals.browser"></a>
#### internals.browser : <code>Browser</code>
Browser to use for communication with discourse

**Kind**: static property of <code>[internals](#module_likes..internals)</code>  
<a name="module_likes..internals.config"></a>
#### internals.config : <code>object</code>
Instance configuration

**Kind**: static property of <code>[internals](#module_likes..internals)</code>  
<a name="module_likes..internals.bingeInterval"></a>
#### internals.bingeInterval : <code>\*</code>
Interval token for like binges

**Kind**: static property of <code>[internals](#module_likes..internals)</code>  
<a name="module_likes..internals.likeCount"></a>
#### internals.likeCount : <code>number</code>
Count of likes handed out during latest binge

**Kind**: static property of <code>[internals](#module_likes..internals)</code>  
<a name="module_likes..internals.events"></a>
#### internals.events : <code>externals.events.SockEvents</code>
EventEmitter used for internal communication

**Kind**: static property of <code>[internals](#module_likes..internals)</code>  
<a name="module_likes..completionCallback"></a>
### likes~completionCallback
Completion callback

**Kind**: inner typedef of <code>[likes](#module_likes)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Error</code> | <code></code> | Error encountered before completion |

