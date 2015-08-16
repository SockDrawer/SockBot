# Installation

SockBot is written entirely in JavaScript using ES6 syntax. As such it is compatible with Node.js >= 0.11 and 
io.js >= 1.7. Sockbot is tested on Linux against several versions of each environment and should function 
correctly on Windows and Mac as well.

## Environment setup

Sockbot requires a recent version of either io.js or Node.js with working `npm` to function.

Required software:

* Node.js version 0.11 or greater (version 0.12.5 or greater recommended)

*or*

* io.js version 1.7 or greater (version 2.4 or greater recommended)

## Installation

Basic installation of SockBot can be accomplished by cloning our [repository] from GitHub or by downloading 
one of our [releases]. SockBot can also be installed via installing our [npm package][npm]

### Cloning our repository
Cloning our repository is a quick way to get started with SockBot. 

Execute the following command in a terminal to clone SockBot to your machine.
```
git clone https://github.com/SockDrawer/SockBot.git
```

To update an existing clone to the latest version of SockBot execute the following command in the same folder
that SockBot was cloned into.
```
git pull
```

### Downloading a release
If you don't have access to Git you can visit our [releases] page on GitHub and download one of our releases.
After downloading a release extract the archive to a folder on your machine to complete installation.

### Installing via npm
SockBot can also be installed via npm, for integration with another project or to install SockBot globally
for a machine.

To install sockbot via npm execute the following command in your terminal located in the folder you wish to 
install SockBot into.
```
npm install sockbot
```

[npm]: https://www.npmjs.com/package/sockbot
[repository]: https://github.com/SockDrawer/SockBot
[releases]: https://github.com/SockDrawer/SockBot/releases

## Post Install Setup

If you installed via npm skip this step as npm has already installed all necessary dependencies.

Otherwise you will need to instruct npm to install the SockBot dependencies. From a terminal in the folder
that SockBot was installed to execute the following command.
```
npm install
```

Once this command completes all dependencies of SockBot have been installed.

If you wish you may execute the unit tests for SockBot by executing the following command.
```
npm test
```

## Configuration

Once installed SockBot will require a [Configuration File][config] to work properly. This is a JSON or YAML
formatted file, the full details of which can be found in the [configuration][config] documentation.

Below is a sample configuration that sets the minimum core configuration and activates the echo module which
replies to messages with the contents on the message received and is useful for testing.

```
---
core:
  username: someBotAccount
  password: someBotPassword
plugins:
  echo: true
```

[config]: ./configuration/

## Running the bot

Once a configuration file has been created it's time to start the bot! For this section we will assume that
the configuration file is named `config.yml` and is placed in the same folder as SockBot proper.

A npm script has been created to run SockBot. In order to use this method execute the following command in 
the folder SockBot is installed to.
```
npm start config.yml
```

SockBot can also be started directly from the command line without using npm. To start SockBot this way
execute the appropriate command below in the folder that SockBot is installed to.

For Node.js
```
node --harmony SockBot.js config.yml
```

For io.js
```
iojs --harmony_arrow_functions SockBot.js config.yml
```

Note: On some platforms e.g. Ubuntu, the `node` binary may installed as `nodejs`; this to avoid clashing with
an older `node` package that existed in the repositories before Node.js was added.

At this point the bot should start and connect to Discourse. If all goes well SockBot should produce output
similar to the example below.
```
accalia@sockdrawer:~/workspace/SockBot $ npm start config.yml

> sockbot@2.0.0 start /home/ubuntu/workspace/SockBot
> node --harmony --harmony_arrow_functions SockBot.js "config.yml"

[17:22:38] Command Registered: help: print command help listing
[17:22:38] Plugin `echo` Loaded
[17:22:39] SockBot `SockAdept` Started
[17:22:39] Polling Messages
[17:22:39] Polling Notifications
[17:22:42] Polling Messages
```

Proper function can be tested by sending a message to the bot account or by mentioning the bot account.
SockBot should reply to such a summons by replying with the text of the post used to summon it. 

Once function has been verified more complex behaviors can be enabled by crafting the appropriate 
configuration file that activates and configures the appropriate plugins.
