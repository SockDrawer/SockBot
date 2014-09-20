/*jslint node: true, indent: 4, unparam: true  */
(function () {
    'use strict';
    var async = require('async'),
        queue;

    function queueHandler(data, callback) {
        try {
            if (!data || !data.func || !data.func.apply || typeof data.func.apply !== 'function') {
                console.error('Error: task enqueued without handler; discarding');
                callback();
                return;
            }
            if (data.payload === undefined) {
                console.warn('Warning: task enqueued without payload data');
            }
            data.func.call(data.func, data.payload, callback);
        } catch (e) {
            console.error('Error: Exception thrown in processing: ' + e.message);
            callback();
        }
    }
    queue = async.queue(queueHandler, 1);


    function enqueue(handler, data, callback) {
        return queue.push({
            func: handler,
            payload: data
        }, callback);
    }
    exports.enqueue = enqueue;

    function requeue(handler, data, callback) {
        return queue.unshift({
            func: handler,
            payload: data
        }, callback);
    }
    exports.requeue = requeue;

    function schedule(delay, handler, data, callback) {
        setTimeout(function () {
            queue.unshift({
                func: handler,
                payload: data
            }, callback);
        }, delay);
    }
    exports.schedule = schedule;
}());