/*jslint node: true, indent: 4, unparam: true  */
(function () {
    'use strict';
    var def = {
        username: 'sockbot',
        password: 'sockbotsockbot',
        notifications: true,
        modules: {},
        errors: [
            "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn",
            "+++Mr. Jelly! Mr. Jelly!+++ ",
            "+++Error At Address: 14, Treacle Mine Road, Ankh-Morpork+++",
            "+++Divide By Cucumber Error. Please Reinstall Universe And Reboot +++",
            "+++Whoops! Here Comes The Cheese! +++",
            "Divided the universe by zero.",
            "Does not Compute.",
            "All your base are belong to us!",
            "What do you get when you multiply six by nine?",
            "Iyeeeeeeeee!!! A segmentation fault has occurred. Have a fluffy day.",
            "Error: Success.",
            "No keyboard detected. Press F1 to continue.",
            "No user detected. Press the any key to continue.",
            "No user detected. Press any other key to continue.",
            "Error 119: 2.88MB floppy installed but not supported by the floppy controller.",
            "Operation completed successfully.",
            "FILE_NOT_FOUND",
            "An exception has occurred. Please press <kdb>Alt</kbd>+<kbd>F4</kbd> to retry.",
            "Hard disk fluid reservoir empty.",
            "Expected success, but found success instead.",
            "I saw a squirrel out the window and forgot what you asked.",
            "I'm too sexy for this shirt.",
            "Contraceptives not found",
            "Sperm production overload, emergency overflow measures activated.",
            "/dev/null full",
            "I used to be a bot like you, then I took an exception in the knee.",
            "Here I am, brain the size of a planet, and they ask me to roll some dice.",
            "An erro of type 2094 has occured"
        ]
    };


    function mergeInner(a, b) {
        var name;
        for (name in b) {
            if (b.hasOwnProperty(name)) {
                if (typeof b[name] === 'object' && !Array.isArray(b[name])) {
                    a[name] = mergeInner((a[name] || {}), b[name]);
                } else {
                    a[name] = b[name];
                }
            }
        }
        return a;
    }

    function merge() {
        var args = Array.prototype.slice.apply(arguments),
            res = {},
            obj;
        while (true) {
            obj = args.shift();
            if (!obj) {
                break;
            }
            mergeInner(res, obj);
        }
        return res;
    }

    function getConfig(file) {
        try {
            return require(file);
        } catch (e) {
            console.warn('Configuration file (`' + file + '`) not found: ' + e);
            return {};
        }
    }

    exports.loadConfiguration = function loadConfiguration(modules) {
        var userconf = getConfig('./SockBot.conf.json'),
            hiddenconf = getConfig('./.SockBot.conf.json');
        def.modules = {};
        modules.forEach(function (m) {
            def.modules[m.name] = m.configuration;
        });
        exports.configuration = merge(def, userconf, hiddenconf);
        return exports.configuration;
    };
}());
