# Summoner Plugin

The summoner plugin responds to @mentions with a randomly selected canned phrase. This has been used to
implement celebrity personalities, such as [@zoidberg].

[@zoidberg]: https://what.thedailywtf.com/users/zoidberg/activity

## Usage
Once configured interaction is required to activate this plugin. The bot account must be summoned via an
@mention. Upon being summoned the bot will reply with one of the preconfigured phrases, afterwhich the bot
will automatically place the topic on cooldown, to prevent abuse of the bot.

## Phrase Replacements
Configured catch phrases can include portions of the discourse post that summoned the bot. The text
replacements are pulled from the [discourse Post][post] object.

Text replacements are of the form `%key%`, and will be replaced with the value of the relative key in the 
[post] that triggers the bot.

For example, if the bot is summoned by user @joeRandom and the reply 
`'@%username% has summoned me, and so I appear.'` is selected the text `%username%` will be replaced with
the value of the `username` key in the post, resulting in the reply text of: 
`'@joeRandom has summoned me, and so I appear.'`

[post]: ../api/external/posts/#external.module_posts.Post

## Configuration Options

| Option     | Type           | Default                          |
|------------|----------------|----------------------------------|
| `cooldown` | Number         | `60,000`                         |
| `messages` | List of String | See example configurations below |

### `cooldown`

This sets the amount of time (in miliseconds) that topics will be on cooldown before the bot will respond to
another summon from a topic that the bot has already been summoned to. The default value is one minute.

### `messages`

This sets the list of messages that the bot will draw from when summoned. Each message may include 
replacement tokens as described in the `Phrase Replacements` section above.

If the provided configuration is an array instead of an object, it will be interpreted as a list of messages,
and treated as this configuration option.

## Example Configuration
*YAML*
```
---
  core: 
    username: "someBotAccount"
    password: "someBotPassword"
  plugins: 
    summoner: 
      cooldown: 60000
      messages: 
        - "@%username% has summoned me, and so I appear."
        - "Yes master %name%, I shall appear as summoned."
        - "Yes mistress %name%, I shall appear as summoned."
```

*JSON*
```
{
    "core": {
        "username": "someBotAccount",
        "password": "someBotPassword"
    },
    "plugins": {
        "summoner": {
            "cooldown": 60000,
            "messages": [
                "@%username% has summoned me, and so I appear.",
                "Yes master %name%, I shall appear as summoned.",
                "Yes mistress %name%, I shall appear as summoned."
            ]
        }
    }
}
```

Optionally only the messages list may be specified, accepting the default value of `cooldown`

*YAML*
```
---
  core: 
    username: "someBotAccount"
    password: "someBotPassword"
  plugins: 
    summoner: 
      - "@%username% has summoned me, and so I appear."
      - "Yes master %name%, I shall appear as summoned."
      - "Yes mistress %name%, I shall appear as summoned."
```

*JSON*
```
{
    "core": {
        "username": "someBotAccount",
        "password": "someBotPassword"
    },
    "plugins": {
        "summoner": [
            "@%username% has summoned me, and so I appear.",
            "Yes master %name%, I shall appear as summoned.",
            "Yes mistress %name%, I shall appear as summoned."
        ]
    }
}
```