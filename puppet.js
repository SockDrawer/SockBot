var async = require('async'),
    phantom = require('node-phantom');

function create(cb){
    console.log(0);
    phantom.create(cb,{
        'disk-cache': true,
        'ignore-ssl-errors': true,
        'load-images': false,
        'max-disk-cache-size': 512
    })
}

function auth(page, username, password, cb){
    async.series([
        function(cb){
            console.log(3);
            page.open('http://what.thedailywtf.com/',cb);
        },function(cb){
            console.log(4);
            page.evaluate(function(username, password){
                $('button.login-button').click();
                $('#login-account-name').focus().val(username).blur().change();
                $('#login-account-password').focus().val(password).blur().change();
                $('div.modal-footer button.btn-primary').click();
            }, username, password);
            setTimeout(cb,1000);
        },function(cb){
            console.log(5);
            console.log(page.evaluate(function(){
                return document.querySelector('div.current-username').innerText;
            }));
            cb();
        }],
        function(){
            console.log(6);
            (cb || function(){})()
        });
}
create(function(err, ph){
    console.log(1);
    ph.createPage(function(err,page){
        console.log(2);
        auth(page, 'sockbot', 'sockbot', function(){
            ph.exit()
        })
    });
})