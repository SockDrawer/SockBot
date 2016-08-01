# Provider Creation

## Introduction

Coming soon

## Interface Implementation

In order to function as a provider, certain assumptions are made about the code. Those assumptions form the public API, documented here. Anything not documented here can be assumed to be optional and ignored. 


### Entry Point

All providers must have a single entry point. This entry point, typically called `index.js`, must export a single class, often called `Forum`. That class must expose the following methods:

#### Constructor
The constructor will be passed the following parameters:

- `config`: a json object with the configuration for the forum
- `useragent`: a string containing the desired useragent to be passed when making requests

#### Properties

The following properties are assumed to exist, either as plain objects or via getters:

- `config`: a json object with the configuration for the forum
- `useragent`: a string containing the desired useragent to be passed when making requests
- `url`: the base URL for the forum
- `username`: the bot's current username
- `userId`: the bot's current userId. Can be identical to username. 
- `owner`: the owner of the bot, to contact if the bot should go rogue
- `Commands`: a Commands instance bound to this forum (see below)

#### login

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

