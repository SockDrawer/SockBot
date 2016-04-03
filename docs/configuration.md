# Configuration

SockBot is configured via a JSON or YAML configuration file. The configuration consists of two dictionaries, 
one core configuration dictionary and one plugin configuration dictionary.

Core configuration options are fixed and can be found described in the API documentation for [defaultConfig]. 
Plugin configuration options are determined by the individual plugins and will vary from plugin to plugin;
consult each plugins' documentation for more details.

[defaultConfig]: ./api/lib/config.md#defaultConfig

## Core Configuration
Core configuration sets options for the entire bot, such as username/password to login as and what forum to 
log in to. The following options are recognized by sockbot as core configuration:

| Option               | Type           | Required | Default                          |
|----------------------|----------------|----------|----------------------------------|
| `username`           | Text           | Yes      |                                  |
| `password`           | Text           | Yes      |                                  |
| `owner`              | Text           | Yes      |                                  |
| `forum`              | Text           | No       | `'https://what.thedailywtf.com'` |
| `provider`           | Text           | No       | `'nodebb'`                       |

### username
This option sets the username the bot will identify itself as. It needs to 
be specified in the configuration.

### password
This option sets the password the bot will use to authenticate itself with. It
needs to be specified in the configuration.

### owner
This option sets the username that the bot will consider its owner. The owner user will be considered ultimately
privileged by the bot. It needs to be specified in the configuration.

### forum
This option sets the url of the forum the bot will interact with. The default value connects the bot to [TheDailyWTF]

### provider
This option sets the forum provider type for the bot.

[TheDailyWTF]: https://what.thedailywtf.com


## Plugin Configuration
Plugin configuration sets which plugins to load and the options for the loaded plugins. This configuration section 
takes the form of a dictionary of plugin names paired with configuration options for the plugins. 

The key for this dictionary should be the plugin name as would be needed to pass to node.js's `require()` function.
Plugins that are bundled in the plugins folder may omit the `'./plugins/'` prefix for simplicity.

The values for this dictionary should be a dictionary of configuration options specific to the plugin or the value
`true` to accept the default configuration for the plugin.

## Running multiple bots from the same process
It is possible to run multiple independent bots from within the same process. In order to enable this functionality 
the chosen config file must be an array of valid configurations, each configuration in the array will be loaded and 
run within a single process.

## Example Configuration Files

Below are example configuration files that enable the bundled `echo` plugin.

`exampleConfig.yml`
```
---
core:
  username: someBotAccount
  password: someBotPassword
  owner: botOwnerUsername
plugins:
  echo: true
```

`exampleConfig.json`
```
{
  "core": {
    "username": "someBotAccount",
    "password": "someBotPassword",
    "owner": "botOwnerUsername"
  },
  "plugins": {
    "echo": true
  }
}
```

These multiball configurations specify two different logins with different plugin configurations.

`multiball.yml`
```
---
  - 
    core: 
      username: "someBotAccount"
      password: "someBotPassword"
      owner: "botOwnerUsername"
    plugins: 
      echo: true
  - 
    core: 
      username: "someOtherBotAccount"
      password: "someOtherBotPassword"
      owner: "botOwnerUsername"
    plugins: 
      summoner: true

```

`multiball.json`
```
[{
    "core": {
        "username": "someBotAccount",
        "password": "someBotPassword",
        "owner": "botOwnerUsername"
    },
    "plugins": {
        "echo": true
    }
}, {
    "core": {
        "username": "someOtherBotAccount",
        "password": "someOtherBotPassword",
        "owner": "botOwnerUsername"
    },
    "plugins": {
        "summoner": true
    }
}]
```
