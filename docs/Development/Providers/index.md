# Provider Creation

## Introduction

In order to function as a provider, certain assumptions are made about the code. Those assumptions form the public API, documented here. Anything not documented here can be assumed to be optional and ignored. 


## Forum

All providers must have a single entry point. This entry point, typically called `index.js`, must export a single class, often called `Forum`. 

The following properties are assumed to exist, either as plain objects or via getters:

- `config`: a json object with the configuration for the forum
- `useragent`: a string containing the desired useragent to be passed when making requests
- `url`: the base URL for the forum
- `username`: the bot's current username
- `userId`: the bot's current userId. Can be identical to username. 
- `owner`: the owner of the bot, to contact if the bot should go rogue

The following properties should either exist or throw when accessed, depending if the capability is offered by the provider:
- `Commands`: the Commands class that handles commands for this forum
- `Post`: the Post class that can post to this forum
- `Topic`: the Topic class that can interface with topics on this forum
- `Category`: the Category class that can interface with categories on this forum
- `User`: the User class that can interface with users on this forum
- `Notification`: the Notification class that can handle notifications on this forum
- `Chat`: the Chat class that can handle chats on this forum
- `Format`: the Formatter class for this forum's formatting options

Take care to ensure that these objects are bound to the specific forum provider instance created. Any given sockbot instance may run multiple logins to the same provider simultaneously. 

The forum class must expose the following methods:

### Constructor
The constructor will be passed the following parameters:

- `config`: a json object with the configuration for the forum
- `useragent`: a string containing the desired useragent to be passed when making requests

### login

A function must be exposed named `login`. This function takes no parameters. It must return a promise that will not resolve until and unless the forum logs in successfully, and that will reject if the login is unsuccessful.

### addPlugin

A function must be exposed named `addPlugin`. This function will be given two parameters: 

- A generator function for the plugin. This will either be a function or an object with a member called `plugin` that is a function. 
- The configuration for the plugin

`addPlugin` must call the generator function with itself as the first argument and the configuration as the second argument. It must return a promise that will resolve if and when the plugin loads successfully, and reject otherwise. 

### activate

A function must be exposed named `activate`. This function will be given no parameters. It should call `activate` on all registered plugins. It must return a promise that will resolve if and when the forum object is succesfully activated.

### deactivate

A function must be exposed named `deactivate`. This function will be given no parameters. It should call `deactivate` on all registered plugins. It must return a promise that will resolve if and when the forum object is succesfully deactivated.

### supports

A function must be exposed named `supports`. This function will be given either a functionality string or an array of functionality strings. It should return true if the forum supports the requested functionality, or false otherwise.

A functionality string is a string that obeys the following rules:
- The string contains up to ten tokens
- These tokens are separated by periods
- Each token is considered a hierarchical list of capabilities; tokens to the right are considered sub-capabilities of tokens to the left

This method must return false if any token in the string is not supported. For example, if the forum supports users but not avatars, it may accept `Users` but must reject `Users.Avatars`.

If an array of functionality strings is supplied, this method must reject if any of them are unsupported.

## Objects

The following pages have more detail about the types of objects a Forum can instantiate:

- [Posts, Topics, and Categories](posts.md)
- [Users and Groups](users.md)
- [Notifications](notifications.md)
- [Chats](chats.md)
- 
## Formatter

Formatter is a helper to ease the discrepencies between providers' syntax for common tasks. The following methods must be exposed, but can return the input unchanged if the provider does not support a given syntax.

### urlForPost

`urlForPost` takes a postID and returns a url pointing to that post.

### urlForTopic

`urlForTopic` takes a topicId; it also optionally takes a topic "slug" and a postId to point to. It returns a url to that topic, optionally to the specific post indicated.

### quoteText

`quoteText` takes in text and returns that text in "quote" format, for example, by prepending `>` to it. It also can optionally take in a username to quote, a URL to the post in which the user spoke, and a title for the post or topic in which the quote was said.

### link

`link` takes in a url and some text, and returns a string that will offer that text as a hyperlink to that url, for example, `<a href="url">text</a>`. He also come to town.

### image

`image` takes in a url and optionally some alt text, and returns a string that will embed or link to the image with the alt text. For example, `<img src="url">`.

### spoiler

`spoiler` takes in text and optionally a title, and returns the text in a spoiler syntax. Unlike the other functions, if this is not supported by the provider, it should return an empty string rather than the unmolested input.

### bold

`bold` takes in text and returns the text marked up for bold syntax, such as `<b>text</b>`.

### italic

`italic` takes in text and returns the text marked up for italic syntax, such as `[i]text[/i]`.

### boldItalic

`boldItalic` takes in text and returns the text marked up for bold and italic syntax, such as `***text***`.

### header[1-6]

`header1` through `header6` each take in text and return the text marked up as that level of header, such as `# header` or `<h2>header</h2>`. 