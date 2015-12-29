<a name="module_status"></a>
## status
Status command

**Author:** RaceProUK  
**License**: MIT  

* [status](#module_status)
    * _static_
        * [.command](#module_status.command) : <code>string</code>
        * [.helpText](#module_status.helpText) : <code>string</code>
        * [.handler(command)](#module_status.handler)
    * _inner_
        * [~uptime()](#module_status..uptime) ⇒ <code>string</code>
        * [~runtime()](#module_status..runtime) ⇒ <code>string</code>
        * [~platform()](#module_status..platform) ⇒ <code>string</code>
        * [~cpuArch()](#module_status..cpuArch) ⇒ <code>string</code>
        * [~cpuUsage()](#module_status..cpuUsage) ⇒ <code>string</code>
        * [~memoryUsage()](#module_status..memoryUsage) ⇒ <code>string</code>
        * [~socksFolded()](#module_status..socksFolded) ⇒ <code>string</code>
        * [~splinesReticulated()](#module_status..splinesReticulated) ⇒ <code>string</code>
        * [~cogsThrown()](#module_status..cogsThrown) ⇒ <code>string</code>
        * [~holesDarned()](#module_status..holesDarned) ⇒ <code>string</code>
        * [~starsGazed()](#module_status..starsGazed) ⇒ <code>string</code>
        * [~ringsCollected()](#module_status..ringsCollected) ⇒ <code>string</code>
        * [~dangersWarned(username)](#module_status..dangersWarned) ⇒ <code>string</code>
        * [~random(limit)](#module_status..random) ⇒ <code>number</code>

<a name="module_status.command"></a>
### status.command : <code>string</code>
Name of the command

**Kind**: static property of <code>[status](#module_status)</code>  
**Read only**: true  
<a name="module_status.helpText"></a>
### status.helpText : <code>string</code>
Command help string

**Kind**: static property of <code>[status](#module_status)</code>  
**Read only**: true  
<a name="module_status.handler"></a>
### status.handler(command)
Handle the `status` command

**Kind**: static method of <code>[status](#module_status)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>command</code> | The `status` command |

<a name="module_status..uptime"></a>
### status~uptime() ⇒ <code>string</code>
Bot uptime broken down into days, hours, minutes, seconds, and milliseconds

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>string</code> - Bot uptime as a pre-formatted string  
<a name="module_status..runtime"></a>
### status~runtime() ⇒ <code>string</code>
Runtime name and version, and V8 version

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>string</code> - Runtime details as a pre-formatted string  
<a name="module_status..platform"></a>
### status~platform() ⇒ <code>string</code>
Operating system type and version

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>string</code> - OS details as a pre-formatted string  
<a name="module_status..cpuArch"></a>
### status~cpuArch() ⇒ <code>string</code>
CPU architecture and endianness

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>string</code> - CPU details as a pre-formatted string  
<a name="module_status..cpuUsage"></a>
### status~cpuUsage() ⇒ <code>string</code>
CPU usage since system boot

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>string</code> - CPU usage as a pre-formatted string  
<a name="module_status..memoryUsage"></a>
### status~memoryUsage() ⇒ <code>string</code>
Current memory usage

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>string</code> - Memory usage as a pre-formatted string  
<a name="module_status..socksFolded"></a>
### status~socksFolded() ⇒ <code>string</code>
'Socks folded' fun stat; random number between 1 and 1000

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>string</code> - Socks folded as a pre-formatted string  
<a name="module_status..splinesReticulated"></a>
### status~splinesReticulated() ⇒ <code>string</code>
'Splines reticulated' fun stat; random complex number between 1 + 1*i* and 20 + 20*i*

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>string</code> - Splines reticulated as a pre-formatted string  
<a name="module_status..cogsThrown"></a>
### status~cogsThrown() ⇒ <code>string</code>
'Cogs thrown' fun stat; random number between 1 and 50

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>string</code> - Cogs thrown as a pre-formatted string  
<a name="module_status..holesDarned"></a>
### status~holesDarned() ⇒ <code>string</code>
'Holes darned' fun stat; random number between 1 and 500

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>string</code> - Holes darned as a pre-formatted string  
<a name="module_status..starsGazed"></a>
### status~starsGazed() ⇒ <code>string</code>
'Stars gazed' fun stat; lists 1-10 radom star names

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>string</code> - Stars gazed as a pre-formatted string  
<a name="module_status..ringsCollected"></a>
### status~ringsCollected() ⇒ <code>string</code>
'Rings collected' fun stat; random number between 1 and 200

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>string</code> - Rings collected as a pre-formatted string  
<a name="module_status..dangersWarned"></a>
### status~dangersWarned(username) ⇒ <code>string</code>
'Dangers warned' fun stat; claims to have warned the user of danger 1-10 times

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>string</code> - Dangers warned as a pre-formatted string  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | The username |

<a name="module_status..random"></a>
### status~random(limit) ⇒ <code>number</code>
Generate a random integer between 1 and `limit` inclusive

**Kind**: inner method of <code>[status](#module_status)</code>  
**Returns**: <code>number</code> - The integer generated  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>number</code> | The maximum integer |

