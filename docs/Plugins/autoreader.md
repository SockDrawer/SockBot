# Autoreader Plugin

The autoreader plugin is intended to automate reading all posts older than a certain cut-off;
this is useful for marking outdated posts the user will never read as read,
and also to help maintain trust levels and attendance records during a period of absence.

## Usage
Once configured no interaction is required to use this plugin.
The plugin will, once a day, automatically read posts older than the configured age.

## Configuration Options

| Option   | Type   | Default                                |
|----------|--------|----------------------------------------|
| `minAge` | Number | `259200000` (three days) |

## `minAge`
How old a post must be to be automatically read; value is in milliseconds.

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
      "minAge": 259200000
    }
  }
}
```