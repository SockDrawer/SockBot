# Likes Plugin

The likes plugin is intended to automate a popular forum game of "like every post in this topic". This module
is capable of playing this game in multiple threads simultaneously and can play catchup as well as like new
posts as they are made.

## Usage
Once configured no interaction is required to use this plugin. The plugin will automatically like new posts
in the watched threads and if configured perform the catchup runs as well.

## Configuration Options

| Option           | Type           | Default  |
|------------------|----------------|----------|
| `binge`          | True/False     | `false`  |
| `bingeHour`      | Number         | `0`      | 
| `bingeMinute`    | Number         | `0`      | 
| `bingeRandomize` | Boolean        | `true`   | 
| `bingeCap`       | Number         | `500`    | 
| `topics`         | List of Number | `[1000]` | 
| `delay`          | Number         | `15000`  | 
| `scatter`        | Number         | `5000`   | 

## `binge`
This switch activates or deactivates catchup mode. If set to true the bot will automatically look for unliked
posts in the target threads and like them, up to a maximum daily limit or until an error is received from 
the host forum.

## `bingeHour`
This sets the hour of the day in which to begin a like binge.
Use this setting to schedule a binge during a quiet time of day.
Note: The time is in UTC.

## `bingeMinute`
This sets the minute in the hour at which to begin a like binge.
Use this setting to schedule a binge during a quiet time of day.
Note: The time is in UTC.

## `bingeRandomize`
This randomizes the time of day the likes binge starts.
If set, this setting overrides both `bingeHour` and `bingeMinute`.

## `bingeCap`
This sets the maximum number of posts to like in any one catchup binge. This is useful if starting the plugin
when there is already a large number of posts in a thread that need to be caught up on. This cap cannot be 
disabled, instead to use up all available likes when playing catch up set this number to be higher than the 
daily like limit for the host forum.

## `topics`
This option controls the list of topics that the bot will watch for new posts to like and also sets the order
of topics that the bot will check for unliked posts when in catchup mode. Any number of topic ids can be 
listed in this option, allowing participation in multiple topics.

## `delay`
This option sets the delay time the bot will wait between a new post being made and actually liking it. This
is implemented to allow humans a chance to get the first like on any such post. To disable this feature, set
this to the value of `0`

## `scatter`
This option controls the amount of time the bot will scatter the likes by waiting an additional period of 
time. A random number between 0 and this value is selected as an additional delay. To disable this option set
it to the value `0`

## Example Configuration
*YAML*
```
---
core:
  username: someBotAccount
  password: someBotPassword
plugins:
  likes: 
    binge: true
    bingeHour: 2
    bingeMinute: 30
    randomize: false
    bingeCap: 500
    topics:
      - 1000
    delay: 15000
    scatter: 5000
```

*JSON*
```
{
  "core": {
    "username": "someBotAccount",
    "password": "someBotPassword"
  },
  "plugins": {
    "likes": {
      "binge": true,
      "bingeHour": 2,
      "bingeMinute": 30,
      "randomize": false,
      "bingeCap": 500,
      "topics": [1000],
      "delay": 15000,
      "scatter": 5000
    }
  }
}
```
