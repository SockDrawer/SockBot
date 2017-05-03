[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![NPM Version](https://img.shields.io/npm/v/sockbot.svg)](https://www.npmjs.com/package/sockbot)
[![Docs Status](https://readthedocs.org/projects/sockbot/badge/?version=latest)](http://sockbot.readthedocs.org/)

[![Build Status](https://travis-ci.org/SockDrawer/SockBot.svg)](https://travis-ci.org/SockDrawer/SockBot)
[![Build status](https://ci.appveyor.com/api/projects/status/2aaq3ay3waq5sxi9?svg=true)](https://ci.appveyor.com/project/AccaliaDeElementia/sockbot)
[![bitHound Overall Score](https://www.bithound.io/github/SockDrawer/SockBot/badges/score.svg)](https://www.bithound.io/github/SockDrawer/SockBot)
[![Code Climate](https://codeclimate.com/github/SockDrawer/SockBot/badges/gpa.svg)](https://codeclimate.com/github/SockDrawer/SockBot)
[![Test Coverage](https://codeclimate.com/github/SockDrawer/SockBot/badges/coverage.svg)](https://codeclimate.com/github/SockDrawer/SockBot/coverage)
[![Package Quality](http://npm.packagequality.com/shield/sockbot.svg)](http://packagequality.com/#?package=sockbot)

[![Dependency Status](https://david-dm.org/SockDrawer/SockBot/master.svg)](https://david-dm.org/SockDrawer/SockBot/master)
[![devDependency Status](https://david-dm.org/SockDrawer/SockBot/master/dev-status.svg)](https://david-dm.org/SockDrawer/SockBot/master#info=devDependencies)
[![optionalDependency Status](https://david-dm.org/SockDrawer/SockBot/master/optional-status.svg)](https://david-dm.org/SockDrawer/SockBot/master#info=optionalDependencies)

SockBot
===========

[![Greenkeeper badge](https://badges.greenkeeper.io/SockDrawer/SockBot.svg)](https://greenkeeper.io/)
Sockbot - A sock puppet robot worthy of TheDailyWTF in EcmaScript 6.

So how do I run this thing anyway?
===========
The global method:

1. `npm install -g sockbot`
2. For any plugins you want to use, `npm install -g [plugin]`
3. Create a config.json or config.yml (see samples for formatting)
4. `sockbot /path/to/config.json` (or `sockbot /path/to/config.yml`

The local install method:

1. In a directory you want to install, run `npm init` and answer the prompts
2. `npm install sockbot`
3. For any plugins you want to use, `npm install [plugin]`
4. Create a config.json or config.yml
5. `node_modules/.bin/sockbot config.yml`

Protip: When using the local install method, you can use a module like pm2 to persist the instance and keep track of 
logs.

Developers
==========
SockBot is developed by members of [SockDrawer](https://github.com/SockDrawer)

NOTA BENE
=========

SockBot is designed for educational purposes, and is not intended to be used on typical production forums. It is also
designed as an experiment of what can be automated within Discourse, and later NodeBB, and is generally targeted 
directly at what.thedailywtf.com.

This bot should not be used without the forum owners consent, and any use of this bot should be immediately
discontinued at the request of the forum owners or moderators. SockBot is not intended for any ill purposes, and the
designers of SockBot can not be held liable for abuses of the technology, or any software derived from it.

