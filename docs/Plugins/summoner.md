# Summoner Plugin

The summoner plugin responds to @mentions with a randomly selected canned phrase. This has been used to
implement celebrity personalities, such as [@zoidberg].

[@zoidberg]: https://what.thedailywtf.com/users/zoidberg/activity

## Usage
Once configured interaction is required to activate this plugin. The bot account must be summoned via an
@mention. Upon being summoned the bot will reply with one of the preconfigured phrases, after which the bot
will automatically place the topic on cooldown, to prevent abuse of the bot.

## Phrase Replacements
Configured catch phrases can include portions of the discourse post that summoned the bot. The text
replacements are pulled from the user data of the user that triggers this plugin.

Text replacements are of the form `%key%`, and will be replaced with the value of the relative key from the 
user data that triggers the bot.

For example, if the bot is summoned by user @joeRandom and the reply 
`'@%username% has summoned me, and so I appear.'` is selected the text `%username%` will be replaced with
the value of the `username` key in the post, resulting in the reply text of: 
`'@joeRandom has summoned me, and so I appear.'`


## Configuration Options

| Option     | Type           | Default                          |
|------------|----------------|----------------------------------|
| `messages` | List of String | See example configurations below |

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
    owner: "yourUsername"
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
        "password": "someBotPassword",
        "owner": "yourUsername"
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
    owner: "yourUsername"
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
        "password": "someBotPassword",
        "owner": "yourUsername"
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
