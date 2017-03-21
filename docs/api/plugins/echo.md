<a name="module_echo"></a>

## echo
Example plugin, echos your words back at you.

**Author**: Accalia  
**License**: MIT  

* [echo](#module_echo)
    * [.plugin(forum)](#module_echo.plugin) ⇒ <code>Plugin</code>
        * [~echo(command)](#module_echo.plugin..echo) ⇒ <code>Promise</code>
        * [~activate()](#module_echo.plugin..activate) ⇒ <code>Promise</code>

<a name="module_echo.plugin"></a>

### echo.plugin(forum) ⇒ <code>Plugin</code>
Plugin generation function.

Returns a plugin object bound to the provided forum provider

**Kind**: static method of <code>[echo](#module_echo)</code>  
**Returns**: <code>Plugin</code> - An instance of the Echo plugin  

| Param | Type | Description |
| --- | --- | --- |
| forum | <code>Provider</code> | Active forum Provider |


* [.plugin(forum)](#module_echo.plugin) ⇒ <code>Plugin</code>
    * [~echo(command)](#module_echo.plugin..echo) ⇒ <code>Promise</code>
    * [~activate()](#module_echo.plugin..activate) ⇒ <code>Promise</code>

<a name="module_echo.plugin..echo"></a>

#### plugin~echo(command) ⇒ <code>Promise</code>
Echo the command contents back to the user

**Kind**: inner method of <code>[plugin](#module_echo.plugin)</code>  
**Returns**: <code>Promise</code> - Resolves when processing is complete  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>Command</code> | The command that contains the `!echo` command |

<a name="module_echo.plugin..activate"></a>

#### plugin~activate() ⇒ <code>Promise</code>
Activate the plugin.

Register the command `echo` to the forum instance this plugin is bound to

**Kind**: inner method of <code>[plugin](#module_echo.plugin)</code>  
**Returns**: <code>Promise</code> - Resolves when plugin is fully activated  
