# Echo Plugin

The echo plugin is a testing plugin that responds to Messages, @mentions, and replies with the contents of
the post that messaged, mentioned or replied to the bot. While this functionality is not the most useful for 
day to day use it is useful for testing purposes.

## Usage
To use this plugin simply Message, @mention, or reply to a post by the bot account. The bot will then echo
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
plugins:
  echo: true
```

*JSON*
```
{
  "core": {
    "username": "someBotAccount",
    "password": "someBotPassword",
  },
  "plugins": {
    "echo": true
  }
}
```