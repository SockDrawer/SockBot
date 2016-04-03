# Echo Plugin

The echo plugin is a testing plugin that responds the `!echo` command,and replies with the contents of
the post that triggered the command. While this functionality is not the most useful for
day to day use it is useful for testing purposes.

## Usage
To use this plugin issue the `!echo` command to the bot. The bot will then echo
your words back at you.

## Configuration Options
There are no configuration options for this plugin.

## Example Configuration
*YAML*
```
---
core:
  username: someBotAccount
  password: someBotPassword
  owner: yourUsername
plugins:
  echo: true
```

*JSON*
```
{
  "core": {
    "username": "someBotAccount",
    "password": "someBotPassword",
    "owner": "yourUsername"
  },
  "plugins": {
    "echo": true
  }
}
```