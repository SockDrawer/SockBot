# Anonymize Plugin

The anonymize plugin is intended to allow a user
to reply under an alternative identity, typically a bot account.

## Usage
Send a private message to the bot with a quote that specifies
both the topic ID and the post number to reply to.

Example usage:
```
[quote="username, post:x, topic:y, full:true"]
Content inside the quote
[/quote]
Content outside the quote
```
Replace `x` with the post number and `y` with the topic ID;
the bot will then echo the message in its entirely in the desired topic.

The `username` and `full:true` can be omitted as desired.

Note: Bot must have permission to post in the topic specified.

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
  anonymize: true
```

*JSON*
```
{
  "core": {
    "username": "someBotAccount",
    "password": "someBotPassword",
  },
  "plugins": {
    "anonymize": true
  }
}
```
