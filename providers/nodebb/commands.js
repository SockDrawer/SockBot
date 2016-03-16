'use strict';

const utils = require('./utils');

exports.bindCommands = function bindCommands(forum) {
    const commands = {};
    class Command {
        constructor(definition, post) {
            const values = {
                line: definition.line,
                command: definition.command,
                args: definition.args,
                mention: definition.mention,
                post: post,
                handler: commands[definition.command]
            };
            utils.mapSet(this, values);
        }
        get line(){return utils.mapGet(this,'line');}
        get command(){return utils.mapGet(this,'command');}
        get mention(){return utils.mapGet(this,'mention');}
        get args(){return utils.mapGet(this,'args');}
        get post(){return utils.mapGet(this,'post');}
        static get(postId){
            return forum.Post.get(postId).then(Command.parse);
        }
        static parse(post) {
            return post.cleaned.split('\n')
                .map(parseLine)
                .filter((definition) => !!definition)
                .map((definition) => new Command(definition));
        }
    }

    function parseLine(line) {
        let args;
        if (new RegExp('^@' + forum.username + '\\s\\S{3,}(\\s|$)', 'i').test(line)) {
            args = line.split(/\s+/);
            args.shift();
            return {
                command: args.shift().toLowerCase(),
                args: args,
                line: line,
                mention: true
            };
        } else if (/^!\S{3,}(\s|$)/.test(line)) {
            args = line.split(/\s+/);
            return {
                command: args.shift().substring(1).toLowerCase(),
                args: args,
                line: line,
                mention: false
            };
        }
        return null;
    }

    return Command;
};
