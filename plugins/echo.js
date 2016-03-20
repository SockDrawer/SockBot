'use strict';
/**
 * Example plugin, echos your words back at you.
 * @module echo
 * @author Accalia
 * @license MIT
 */

exports.plugin = function plugin(forum, config) {
    function echo(command) {
        return Promise.all([
            command.getPost(),
            command.getUser()
        ]).then((data) => {
            const post = data[0];
            const user = data[1];
            const content = post.content.split('\n').map((line) => `> ${line}`);
            content.unshift(`@${user.username} said:`);
            command.reply(content.join('\n'));
            return Promise.resolve();
        });
    }
    return {
        activate: () => forum.Commands.add('echo', 'Simple testing command', echo),
        deactivate: () => {}
    };
};
