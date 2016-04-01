'use strict';
/**
 * Example plugin, echos your words back at you.
 * @module echo
 * @author Accalia
 * @license MIT
 */

/**
 * Plugin generation function.
 *
 * Returns a plugin object bound to the provided forum provider
 *
 * @param {Provider} forum Active forum Provider
 * @returns {Plugin} An instance of the Echo plugin
 */
exports.plugin = function plugin(forum) {
    /**
     * Echo the command contents back to the user
     *
     * @param {Command} command The command that contains the `!echo` command
     * @returns {Promise} Resolves when processing is complete
     */
    function echo(command) {
        return Promise.all([
            command.getPost(),
            command.getUser()
        ]).then((data) => {
            const post = data[0];
            const user = data[1];
            const content = (post.content || '').split('\n').map((line) => `> ${line}`);
            content.unshift(`@${user.username} said:`);
            command.reply(content.join('\n'));
        });
    }

    /**
     * Activate the plugin.
     *
     * Register the command `echo` to the forum instance this plugin is bound to
     *
     * @returns {Promise} Resolves when plugin is fully activated     *
     */
    function activate() {
        return forum.Commands.add('echo', 'Simple testing command', echo);
    }

    return {
        activate: activate,
        deactivate: () => {},
        _echo: echo // for testing!
    };
};
