<a name="module_status"></a>
## status
Notification level commands

**Author:** AccaliaDeElementia  
**License**: MIT  

* [status](#module_status)
    * [.unmute](#module_status.unmute)
    * [.prepare(events, callback)](#module_status.prepare)
    * [.mute(command)](#module_status.mute)
    * [.watch(command)](#module_status.watch)

<a name="module_status.unmute"></a>
### status.unmute
Unwatch the current thread

**Kind**: static property of <code>[status](#module_status)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>command</code> | the unwatch command |

<a name="module_status.prepare"></a>
### status.prepare(events, callback)
Prepare the command parser

Needs to be called to set the internals of the parser after reading config file.

**Kind**: static method of <code>[status](#module_status)</code>  

| Param | Type | Description |
| --- | --- | --- |
| events | <code>EventEmitter</code> | EventEmitter that will be core comms for SockBot |
| callback | <code>completedCallback</code> | Completion callback |

<a name="module_status.mute"></a>
### status.mute(command)
Mute the current Thread

**Kind**: static method of <code>[status](#module_status)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>command</code> | the mute command |

<a name="module_status.watch"></a>
### status.watch(command)
Watch the current thread

**Kind**: static method of <code>[status](#module_status)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>command</code> | the watch command |

