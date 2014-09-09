var async = require('async'),
    phantom = require('phantom');

function create(cb){
    phantom.create('--disk-cache=true', '--ignore-ssl-errors=true',
        '--load-images=false','--max-disk-cache-size=512', cb);
}

function auth(page, username, password, cb){
    async.series([
        function(cb){
            page.open('http://what.thedailywtf.com/',function(){cb();});
        },function(cb){
            page.evaluate(function(username, password){
                $('button.login-button').click();
                $('#login-account-name').focus().val(username).blur().change();
                $('#login-account-password').focus().val(password).blur().change();
                $('div.modal-footer button.btn-primary').click();
            }, function(val){cb(null,val)}, username, password);
        },function(cb){
                setTimeout(function() {page.evaluate(function(){
                    $('div#current-username').click();
                    return document.querySelector('ul.user-dropdown-links a.user-activity-link').href
                },function(val){console.log(val);
                page.render('page.png','PNG',cb);
                });
            }, 3000);
        }],
        function(){
            (cb || function(){})();
        });
}

function post(page, url, text, cb){
    async.series([
       function(cb) {
           console.log(4);
           page.open(url, function() {
               console.log(4);
               cb();
           });
       },
       function(cb) {
           console.log(4);
           page.evaluate(function() {
               $('#topic-footer-buttons .btn-primary').click();
           }, function() {
               console.log(6);
               setTimeout(function() {
                   cb()
               }, 100);
           });
       },
       function(cb) {
           console.log(5);
           page.evaluate(function(text) {
               $('#wmd-input').text(text);
               $('.submit-panel .btn-primary').click();
           }, function(val) {
               console.log(val);
               //page.render('page.png', 'PNG', cb);
               cb();
           }, text)
       }
   ],
        function(){
            (cb || function(){})();
        });
}

create(function(ph){
    async.waterfall([
        function(cb){
            console.log(1);
            ph.createPage(function(page){cb(null,page);});
        }, function (page, cb){
            console.log(2);
            auth(page, 'sockbot', 'sockbotsockbot', function(){cb(null,page)});
        }, function(page, cb) {
            console.log(3);
            post(page, 'http://what.thedailywtf.com/t/signature-dev-guy-bot-thread/3031/49', 'This is a sockbot test post.<br /><br /> Hello World!', cb);
        }, function(cb){
            console.log(4);
            ph.exit()
        }
    ]);
})
