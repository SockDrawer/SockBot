# Plugin Creation

SockBot incorporates a plugin architecture to add functionality, some plugins are built in but any number of
other plugins can be created and loaded into SockBot to add additional functionality.

## Plugin Format

SockBot plugins are node modules that export a certain set of functions. A minimal set would be:
```
exports.prepare = function prepare(pluginConfig, sockBotConfig, events, browser) {};

exports.start = function start() {};

exports.stop = function stop() {};
```

Plugins are activated by having their require path included as a key in the configuration `plugins` key. 
Bundled plugins and plugins installed via NPM may omit the path as node.js will find them correctly on the 
bare name, other plugins should be specified by absolute path.

### Function `prepare(pluginConfig, sockBotConfig, events, browser)`

This function is the initial entry point for plugins, it is called when SockBot has read the configuration
for the bot and before it has logged in to discourse. The provided parameters give the plugin the configuration
state of SockBot as well as the [EventEmitter] used for communication within the bot, and a [browser] for 
communicating with discourse.

This function is assumed to be synchronous and *should not* set up any periodic or delayed actions. Any such 
actions desired should be initiated in `start()`.

#### Parameter `pluginConfig`

This parameter will be the value that was stored in the configuration file for the plugin. The format of this
object is to be determined by each individual plugin, however all plugins *should* accept the value `true`
to use the plugin with the plugins default configuration.

#### Parameter `sockBotConfig`

This parameter will be the complete [configuration] object for SockBot, including core and plugin 
configuration. Once SockBot has logged into discourse this object will be populated with current user 
information.

#### Parameter `events`

This parameter will be an [EventEmitter], augmented with several methods specific to SockBot. Events 
originating within Discourse will be emitted by this object, allowing plugins to respond to Discourse 
notifications and other events.

#### Parameter `browser`

This parameter will be a [browser] that is set up to communicate with Discourse. At the time of the 
prepare() call the browser will not have yet authenticated with discourse.

[EventEmitter]: ../api/external/events#module_SockEvents
[browser]: ../api/lib/browser#module_browser
[configuration]: ../api/lib/config

### Function `start()`

This function is called after SockBot has successfully authenticated to Discourse. At the point of this call
the current user information has been stored in the `sockBotConfig` provided earlier in the `prepare()` call.
Additionally the earlier provided browser object has been authenticated with discourse and is fully ready.

Any periodic or automatic actions *should* be initiated by this function. These periodic or automatic actions
*must* be cancellable by a call to `stop()`.

No arguments are provided when this function is called.

### Function `stop()`

This function is called before SockBot stops, either for a configuration reload or for termination. Any 
periodic or deferred actions created by the plugin *must* be canceled by this function. The plugin *must* 
assume that the bot is stopping for termination. 

If the bot is merely reloading configuration the new configuration will be communicated to the plugin by a
call to `prepare()` followed by a call to `start()` when the new configuration is ready to be used.

No arguments are provided when this function is called.
