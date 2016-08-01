# Provider Creation

## Introduction

Coming soon

## Interface Implementation

In order to function as a provider, certain assumptions are made about the code. Those assumptions form the public API, documented here. Anything not documented here can be assumed to be optional and ignored. 


### Entry Point

All providers must have a single entry point. This entry point, typically called `index.js`, must export a single class, often called `Forum`. 

The following properties are assumed to exist, either as plain objects or via getters:

- `config`: a json object with the configuration for the forum
- `useragent`: a string containing the desired useragent to be passed when making requests
- `url`: the base URL for the forum
- `username`: the bot's current username
- `userId`: the bot's current userId. Can be identical to username. 
- `owner`: the owner of the bot, to contact if the bot should go rogue

The following properties should either exist or throw when accessed, depending if the capability is offered by the provider:
- `Commands`: a Commands instance bound to this forum (see below)
- `Post`: a Post instance bound to this forum (see below)
- `Topic`: a Topic instance bound to this forum (see below)
- `Category`: a Category instance bound to this forum (see below)
- `User`: a User instance bound to this forum (see below)
- `Notification`: a Notification instance bound to this forum (see below)
- `Chat`: a Chat instance bound to this forum (see below)
- `Format`: a Formatter instance bound to this forum (see below)

The forum class must expose the following methods:

#### Constructor
The constructor will be passed the following parameters:

- `config`: a json object with the configuration for the forum
- `useragent`: a string containing the desired useragent to be passed when making requests

#### login

A function must be exposed named `login`. This function takes no parameters. It must return a promise that will not resolve until and unless the forum logs in successfully, and that will reject if the login is unsuccessful.

#### addPlugin

A function must be exposed named `addPlugin`. This function will be given two parameters: 

- A generator function for the plugin. This will either be a function or an object with a member called `plugin` that is a function. 
- The configuration for the plugin

`addPlugin` must call the generator function with itself as the first argument and the configuration as the second argument. It must return a promise that will resolve if and when the plugin loads successfully, and reject otherwise. 

#### activate

A function must be exposed named `activate`. This function will be given no parameters. It should call `activate` on all registered plugins. It must return a promise that will resolve if and when the forum object is succesfully activated.

#### deactivate

A function must be exposed named `deactivate`. This function will be given no parameters. It should call `deactivate` on all registered plugins. It must return a promise that will resolve if and when the forum object is succesfully deactivated.

### Post

All providers should offer a Post object, but the semantic meaning of what a Post is depends on the provider. In general, a "post" is a single entry into the system by a single user. In a chatlike provider, it will be a single message.

#### bindPost
The Post file should export a single method, called bindPost. This method takes in a forum object and returns the Post class, with specific references to provider functions bound to that instance of the provider. 

#### Post object: Properties

The following properties are assumed to exist, either as plain objects or via getters:

- `authorId`: the userId of the author of the post
- `content`: the content of the post
- `posted`: the dateTime in which the post was made
- `id`: some identifier for the post
- `topicId`: some identifier for the topic that this post belongs to, or undefined if that does not apply

#### Post object: Expensive properties

The following methods each return a Promise for the property that they encapsulate. They should reject if no such property can exist.

- `markup`: The raw form of the post, including any HTML tags or control codes
- `url`: the url to view this post on the web

#### Post object: actions

The following actions are assumed to be available to be performed on a Post. Each should act upon the actual post in the system, and return a Promise that will resolve if the action completes or reject if it does not.

- `reply`: Submit a new Post as a reply to the current Post. Takes one argument: the text of the reply. Resolves to the new Post object.
- `edit`: Edit the post. Takes up to two arguments: the text to submit as the new text, and the reason for the edit (for systems that use edit reasons). Should reject if the post cannot be edited, or resolve to the edited Post.
- `append`: Edit the post by appending new content.  akes up to two arguments: the text to append, and the reason for the edit (for systems that use edit reasons). Should reject if the post cannot be edited, or resolve to the edited Post.
- `delete`: Delete the post. Takes no arguments. Should reject if the post cannot be deleted, or resolve to the deleted Post.
- `undelete`: Undelete the post. Takes no arguments. Should reject if the post cannot be undeleted, or resolve to the deleted Post.
- `upvote`: Upvote the post. Takes no arguments. Should reject if the post cannot be upvoted, or resolve to the upvoted Post.
- `downvote`: Downvote the post. Takes no arguments. Should reject if the post cannot be downvoted, or resolve to the downvoted Post.
- `bookmark`: Delete the post. Takes no arguments. Should reject if the post cannot be deleted, or resolve to the deleted Post.
- `unbookmark`: Undelete the post. Takes no arguments. Should reject if the post cannot be undeleted, or resolve to the deleted Post.


#### Static: reply

A static method should be provided to allow for replying to arbitrary posts. It will be given three arguments: the topic ID to reply to (if any), the post ID to reply to (if any), and the content to submit. One or both of topic ID and post ID will be supplied.

This method should return a promise that will resolve to the newly created Post object.

#### Static: get

A static method should be provided to allow for retrieving arbitrary posts. It will be given one arguments: the primary identifier for the post.

This method should return a promise that will resolve to the requested Post object.

#### Static: parse

A static method should be provided to allow for parsing arbitrary posts. It will be given one arguments: the raw payload retrieved from the API for the forum.

This method should return a promise that will resolve to the requested Post object.

#### Static: preview

A static method should be provided to allow for previewing post content. It will be given one arguments: the content intended to be submitted as a new post.

This method should return a promise that will resolve to a string that will include any modifications done by the server upon submit.

