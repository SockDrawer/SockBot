<a name="module_SockBot"></a>
## SockBot
Main Module for SockBot2.0

**Author:** Accalia  
**License**: MIT  
<a name="module_SockBot..foo"></a>
### SockBot~foo ⇒ <code>number</code>
Set the bot to muted status until a time or query sleep status.

Most actions that would create a post will fail with error 'Muted' if bot is
asleep

**Kind**: inner property of <code>[SockBot](#module_SockBot)</code>  
**Returns**: <code>number</code> - current timestamp the bot is set to sleep until  

| Param | Type | Description |
| --- | --- | --- |
| until | <code>number</code> | Unix Timestamp representing time for the bot to unmute |

