# Autoreader Plugin

The autoreader plugin is intended to automate reading all posts older than a certain cut-off;
this is useful for marking outdated posts the user will never read as read,
and also to help maintain trust levels and attendance records during a period of absence.

## Usage
Once configured no interaction is required to use this plugin.
The plugin will, once a day, automatically read posts older than the configured age.

## Configuration Options

| Option   | Type   | Default                  |
|----------|--------|--------------------------|
| `minAge` | Number | `259200000` (three days) |
| `hour`   | Number | `0`                      |
| `minute` | Number | `0`                      |

## `minAge`
How old a post must be to be automatically read; value is in milliseconds.

## `hour`
This sets the hour of the day in which to begin reading posts.
Use this setting to schedule the autoreader during a quiet time of day.
Note: The time is in UTC.

## `minute`
This sets the minute in the hour at which to begin reading posts.
Use this setting to schedule the autoreader during a quiet time of day.
Note: The time is in UTC.

## `randomize`
This randomizes the time of day to start reading posts.
If set, this setting overrides both `hour` and `minute`.

## Example Configuration
*YAML*
```
---
core:
  username: someBotAccount
  password: someBotPassword
plugins:
  autoreader: 
    minAge: 259200000
    hour: 2
    minute: 30
    randomize: false
```

*JSON*
```
{
  "core": {
    "username": "someBotAccount",
    "password": "someBotPassword"
  },
  "plugins": {
    "autoreader": {
      "minAge": 259200000,
      "hour": 2,
      "minute": 30,
      "randomize": false
    }
  }
}
```