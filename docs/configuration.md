# Configuration

SockBot is configured via a JSON or YAML configuration file. The configuration consists of two dictionaries, 
one core configuration dictionary and one plugin configuration dictionary.

Core configuration options are fixed and can be found described in the API codumentation for [defaultConfig]. 
Plugin configuration options are determined by the individual plugins and will vary from plugin to plugin.

[defaultConfig]: api/config/#defaultConfig

## Core Configuration
Core configuration sets options for the entire bot, such as username/password to login as and what forum to 
log in to. The following options are recognized by sockbot as core configuriation:

| Option               | Type           | Required | Default                          |
|----------------------|----------------|----------|----------------------------------|
| `username`           | Text           | Yes      | `''`                             |
| `password`           | Text           | Yes      | `''`                             |
| `owner`              | Text           | No       | `'accalia'`                      |
| `forum`              | Text           | No       | `'https://what.thedailywtf.com'` |
| `ignoreUsers`        | List of Text   | No       | `['blakeyrat', 'PaulaBean']`     |
| `ignoreCategories`   | List of Number | No       | `[8, 23]`                        |
| `cooldownPeriod`     | Number         | No       | `3600000`                        |
| `handleActedMessage` | True/False     | No       | `false`                          |
| `pollMessages`       | True/False     | No       | `true`                           |
| `pollNotifications`  | True/False     | No       | `true`                           |

### username
This option sets the username the bot will identify itself as. As the default value is blank it will need to 
be specified in configuration.

### password
This option sets the password the bot will use to authenticate istelf with. As the default value is blank it
will need to be specified in configuration.

### owner
This option sets the username that the bot will consider its owner. The owner user will be considered ultimately
privileged by the bot. The default owner is "accalia"

### forum
This option sets the url of the forum the bot will interact with. The default value connects the bot to [TheDailyWTF]

[TheDailyWTF]: https://what.thedailywtf.com

### ignoreUsers
This option sets a set of usernames that the bot will ignore. Ignored users cannot interact with the bot and the bot
will be prevented from interacting with the ignored users topics unless the interaction is initiated by forum staff

This option was added to prevent users from being able to hijack the bot to harass other users. 

By default the bot ignores `blakeyrat`, a user on [TheDailyWTF], and `PaulaBean`, another bot account responsible for posting the daily article discussion threads on [TheDailyWTF]

Usernames are case sensitive.

### ignoreCategories
This option sets the category ids that the bot will ignore. Within ignored categories only forum staff can interact with the bot.

This option was created to prevent users from polluting the daily article discussion threads with bot chatter.

By default the bot will ignore category `8`, Articles, and category `23`, The Lounge. Usage of the bot on forums 
other than [TheDailyWTF] will likely want to override this list to map onto their categories.

### cooldownPeriod
This option sets the period of time in miliseconds that trust level 1 users will be prevented from interacing with
the bot after an initial interaction. This limits possible bot abuse from low trust users. This cooldown can be 
disabled by setting this value to `0` if desired.

### handleActedMessage
This option determines whether the bot will respond to any acted messages. These messages are created when any post 
is interacted with and are rarely of interest to any plugin. Therefore by default these messages are ignored to 
reduce the load the pot puts on the host forum.

### pollMessages
This options controls whether the bot will poll the discourse message-bus. Most bots will want to leave this active
as the bot will not get any messages from discourse unless a plugin manually polls for messages.

### pollNotifications
This option controlls whether the bot will poll for notifications from discourse. This is useful to disable if one is
running a bot on an actual user account and wishes to still take care of their own notifications.

## Plugin Configuration
Plugin configuration sets which plugins to load and the options for the loaded plugins. This configuration section 
takes the form of a dictionary of plugin names paired with configuration options for the plugins. 

The key for this dictionary should be the plugin name as would be needed to pass to node.js's `require()` function.
Plugins that are bundled in the plugins folder may omit the `'./plugins/'` prefix for simplicity.

The values for this dictionary should be a dictionary of configuration options specific to the plugin or the value
`true` to accept the default configuration for the plugin.

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
