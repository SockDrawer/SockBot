/*jslint node: true, indent: 4, unparam: true  */
'use strict';
var fs = require('fs'),
    yml = require('js-yaml');
var def = {
    username: 'username',
    password: 'passwordpassword',
    notifications: true,
    verbose: true,
    timestamp: true,
    datestamp: false,
    processActed: false,
    TL1Cooldown: 10 * 60 * 60 * 1000,
    modules: {},
    admin: {
        owner: 'accalia',
        ignore: ['blakeyrat', 'PaulaBean']
    },
    errors: [
        'Response confused me :-( error), please try again',
        'Ph\'nglui mglw\'nafh Cthulhu R\'lyeh wgah\'nagl fhtagn',
        '+++Mr. Jelly! Mr. Jelly!+++ ',
        '+++Error At Address: 14, Treacle Mine Road, Ankh-Morpork+++',
        '+++Divide By Cucumber Error. Please Reinstall Universe' +
        ' And Reboot +++',
        '+++Whoops! Here Comes The Cheese! +++',
        'Divided the universe by zero.',
        'Does not Compute.',
        'All your base are belong to us!',
        'What do you get when you multiply six by nine?',
        'Iyeeeeeeeee!!! A segmentation fault has occurred. ' +
        'Have a fluffy day.',
        'Error: Success.',
        'No keyboard detected. Press F1 to continue.',
        'No user detected. Press the any key to continue.',
        'No user detected. Press any other key to continue.',
        'Error 119: 2.88MB floppy installed but not supported by ' +
        'the floppy controller.',
        'Operation completed successfully.',
        'FILE_NOT_FOUND',
        'An exception has occurred. Please press <kdb>Alt</kbd>' +
        '+<kbd>F4</kbd> to retry.',
        'Hard disk fluid reservoir empty.',
        'Expected success, but found success instead.',
        'I saw a squirrel out the window and forgot what you asked.',
        'I\'m too sexy for this shirt.',
        'Contraceptives not found',
        'Sperm production overload, emergency overflow measures activated.',
        '/dev/null full',
        'I used to be a bot like you, then I took an ' +
        'exception in the knee.',
        'Here I am, brain the size of a planet, and they ask' +
        ' me to roll some dice.',
        'An error of type 2094 has occured'
    ]
};


function mergeInner(a, b) {
    var name;
    for (name in b) {
        if (b.hasOwnProperty(name)) {
            if (typeof b[name] === 'object' && !Array.isArray(b[name])) {
                var c = a[name] || {};
                a[name] = mergeInner(c, b[name]);
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
        obj = args.shift();
    while (obj) {
        mergeInner(res, obj);
        obj = args.shift();
    }
    return res;
}

function getConfig(file) {
    try {
        //Protect against stupid Windows programs being stupid and putting
        //stupid UTF-8 BOM marks at the stupid beginning of the stupid file
        var contents = fs.readFileSync(file);
        if (contents.length >= 3 && contents[0] === 0xef &&
            contents[1] === 0xbb && contents[2] === 0xbf) {
            contents = contents.slice(3);
        }
        return yml.safeLoad(contents);
    } catch (e) {
        /* eslint-disable no-console */
        console.warn('Configuration file (`' + file + '`) not found: ' + e);
        /* eslint-enable no-console */
        return {};
    }
}

exports.loadConfiguration =
    function loadConfiguration(modules, admin, configuration) {
        var userconf;
        if (!configuration) {
            /* eslint-disable no-console */
            console.error('No user configuration file specified. ' +
                'Sockbot will likely not work!');
            /* eslint-enable no-console */
            userconf = {};
        } else {
            if (configuration[0] !== '/') {
                configuration = './' + configuration;
            }
            userconf = getConfig(configuration);
        }
        def.modules = {};
        modules.forEach(function (m) {
            def.modules[m.name] = m.configuration;
        });
        def.admin.modules = admin.getConfig();
        exports.configuration = merge(def, userconf);
        return exports.configuration;
    };
