'use strict';
var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    nodehun = require('nodehun'),
    spellchecker = require('nodehun-sentences');
var discourse,
    configuration,
    dictionary,
    spellcheckerActive = false;

exports.description = 'Automaticly trak adn corect speling misteaks';

exports.configuration = {
    enabled: false,
    baseDictLocation: 'dictionaries',
    baseDictName: 'en_US',
    extraDictLocation: 'dictionaries',
    extraDictNames: [],
};

exports.name = 'Spellar';

exports.priority = undefined;

exports.version = '0.1.0';

exports.begin = function begin(browser, config) {
    discourse = browser;
    configuration = config.modules[exports.name];

    if (configuration.enabled) {
        initialiseDictionary();
    }
};

function initialiseDictionary() {
    fs.readFile(path.join(configuration.baseDictLocation, configuration.baseDictName + '.aff'), function (err, data) {
        if (err) {
            discourse.error(err);
            return;
        }
        var aff = data;
        fs.readFile(path.join(configuration.baseDictLocation, configuration.baseDictName + '.dic'), function (err, data) {
            if (err) {
                discourse.error(err);
                return;
            }
            var dic = data;
            nodehun.createNewNodehun(aff, dic, function (err, dict) {
                if (err) {
                    discourse.error(err);
                    return;
                }
                dictionary = dict;
                spellcheckerActive = true;
                discourse.log("Spellar iz aktiv");
            });
        });
    });
}