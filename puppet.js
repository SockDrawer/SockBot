var async = require('async'),
    phantom = require('phantom');


/*
phantom.create('--disk-cache=true', '--ignore-ssl-errors=true',
    '--load-images=false','--max-disk-cache-size=512',
    function (ph){
    ph.createPage(function(page){
        page.open('http://what.thedailywtf.com/',function(status){
            console.log(arguments);
            ph.exit();
        });
    });
})
*/

function create(cb){
    phantom.create('--disk-cache=true', '--ignore-ssl-errors=true',
        '--load-images=false','--max-disk-cache-size=512', cb);

}

function auth(page, username, password, cb){
    async.series([
        function(cb){
            page.open('http://what.thedailywtf.com/',function(){cb();});
        },function(cb){
            console.log(4);
            page.evaluate(function(username, password){
                $('button.login-button').click();
                $('#login-account-name').focus().val(username).blur().change();
                $('#login-account-password').focus().val(password).blur().change();
                $('div.modal-footer button.btn-primary').click();
            }, function(val){cb(null,val)}, username, password);
        },function(cb){
            console.log(5);
                setTimeout(function() {page.evaluate(function(){
                    $('div#current-username').click();
                    return document.querySelector('ul.user-dropdown-links a.user-activity-link').href
                },function(val){console.log(val);
                page.render('page.png','PNG',cb);
                });
            }, 3000);
        }],
        function(){
            console.log(6);

            (cb || function(){})()
        });
}

function post(page, url, text){
    //http://what.thedailywtf.com/t/signature-dev-guy-bot-thread/3031/49
}

create(function(ph){
    console.log(1);
    ph.createPage(function(page){
        console.log(2);
        auth(page, 'sockbot', 'sockbotsockbot', function(){
            ph.exit()
        })

    });
})
