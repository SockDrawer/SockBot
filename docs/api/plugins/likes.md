## Functions
<dl>
<dt><a href="#prepare">prepare(plugConfig, config, events, browser)</a></dt>
<dd><p>Prepare plugin prior to login</p>
</dd>
<dt><a href="#start">start()</a></dt>
<dd><p>Start the plugin after login</p>
</dd>
<dt><a href="#stop">stop()</a></dt>
<dd><p>Stop the plugin prior to exit or reload</p>
</dd>
<dt><a href="#messageHandler">messageHandler(data, topic, post)</a></dt>
<dd><p>Handle topic message</p>
</dd>
<dt><a href="#binge">binge()</a></dt>
<dd><p>Perform a like binge</p>
</dd>
<dt><a href="#handlePost">handlePost(post, callback)</a></dt>
<dd><p>Handle a post in a like binge</p>
</dd>
</dl>
## Typedefs
<dl>
<dt><a href="#defaultConfig">defaultConfig</a> : <code>object</code></dt>
<dd><p>Default configuration settings</p>
</dd>
<dt><a href="#internals">internals</a> : <code>object</code></dt>
<dd><p>Internal status store</p>
</dd>
<dt><a href="#completionCallback">completionCallback</a></dt>
<dd><p>Completion callback</p>
</dd>
</dl>
<a name="prepare"></a>
## prepare(plugConfig, config, events, browser)
Prepare plugin prior to login

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| plugConfig | <code>\*</code> | Plugin specific configuration |
| config | <code>Config</code> | Overall Bot Configuration |
| events | <code>externals.events.SockEvents</code> | EventEmitter used for the bot |
| browser | <code>Browser</code> | Web browser for communicating with discourse |

<a name="start"></a>
## start()
Start the plugin after login

**Kind**: global function  
<a name="stop"></a>
## stop()
Stop the plugin prior to exit or reload

**Kind**: global function  
<a name="messageHandler"></a>
## messageHandler(data, topic, post)
Handle topic message

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>external.notifications.notification</code> | Notification data |
| topic | <code>external.topics.Topic</code> | Topic containing post generating notification |
| post | <code>external.posts.CleanedPost</code> | Post that generated notification |

<a name="binge"></a>
## binge()
Perform a like binge

**Kind**: global function  
<a name="handlePost"></a>
## handlePost(post, callback)
Handle a post in a like binge

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>external.posts.CleanedPost</code> | Post to handle |
| callback | <code>[completionCallback](#completionCallback)</code> | Completion Callback |

<a name="defaultConfig"></a>
## defaultConfig : <code>object</code>
Default configuration settings

**Kind**: global typedef  

* [defaultConfig](#defaultConfig) : <code>object</code>
  * [.binge](#defaultConfig.binge) : <code>boolean</code>
  * [.bingeCap](#defaultConfig.bingeCap) : <code>number</code>
  * [.topics](#defaultConfig.topics) : <code>Array.&lt;number&gt;</code>
  * [.delay](#defaultConfig.delay) : <code>number</code>
  * [.scatter](#defaultConfig.scatter) : <code>number</code>

<a name="defaultConfig.binge"></a>
### defaultConfig.binge : <code>boolean</code>
Whether like binges should be performed

**Kind**: static property of <code>[defaultConfig](#defaultConfig)</code>  
<a name="defaultConfig.bingeCap"></a>
### defaultConfig.bingeCap : <code>number</code>
Maximum number of likes to hand out as part of a like binge

**Kind**: static property of <code>[defaultConfig](#defaultConfig)</code>  
<a name="defaultConfig.topics"></a>
### defaultConfig.topics : <code>Array.&lt;number&gt;</code>
Topics to hand out likes in

**Kind**: static property of <code>[defaultConfig](#defaultConfig)</code>  
<a name="defaultConfig.delay"></a>
### defaultConfig.delay : <code>number</code>
Time to delay liking post as posts are streamed in

**Kind**: static property of <code>[defaultConfig](#defaultConfig)</code>  
<a name="defaultConfig.scatter"></a>
### defaultConfig.scatter : <code>number</code>
Amount of time to scatter likes by

**Kind**: static property of <code>[defaultConfig](#defaultConfig)</code>  
<a name="internals"></a>
## internals : <code>object</code>
Internal status store

**Kind**: global typedef  

* [internals](#internals) : <code>object</code>
  * [.browser](#internals.browser) : <code>Browser</code>
  * [.config](#internals.config) : <code>object</code>
  * [.bingeInterval](#internals.bingeInterval) : <code>\*</code>
  * [.likeCount](#internals.likeCount) : <code>number</code>

<a name="internals.browser"></a>
### internals.browser : <code>Browser</code>
Browser to use for communication with discourse

**Kind**: static property of <code>[internals](#internals)</code>  
<a name="internals.config"></a>
### internals.config : <code>object</code>
Instance configuration

**Kind**: static property of <code>[internals](#internals)</code>  
<a name="internals.bingeInterval"></a>
### internals.bingeInterval : <code>\*</code>
Interval token for like binges

**Kind**: static property of <code>[internals](#internals)</code>  
<a name="internals.likeCount"></a>
### internals.likeCount : <code>number</code>
Count of likes handed out durring latest binge

**Kind**: static property of <code>[internals](#internals)</code>  
<a name="completionCallback"></a>
## completionCallback
Completion callback

**Kind**: global typedef  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Error</code> | <code></code> | Error encountered before completion |

