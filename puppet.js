var async = require('async'),
    request = require('request'),
    $ = require('cheerio'),
    jar = request.jar(),
    browser = request.defaults({jar:jar,headers:{'X-Requested-With':'XMLHttpRequest','User-Agent':'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.103 Safari/537.36'}});


function auth(request, callback){
    request.get('http://what.thedailywtf.com/session/csrf?_'+(new Date()*1),function(a,b,c){
        console.log(c);
        var obj = JSON.parse(c);
        request.post('http://what.thedailywtf.com/session', {headers:{'X-CSRF-Token':obj.csrf},form:{login:'sockbot',password:'sockbotsockbot'}}, function(){
            request.post('http://what.thedailywtf.com/login', {form:{username:'sockbot',password:'sockbotsockbot',redirect:'http://what.thedailywtf.com/'}}, function(){
                //request('http://what.thedailywtf.com/users/sockbot/activity.json',function(a,b,c){
                //    console.log(c);
                //});
                callback();
            });
        });
    });
}
auth(browser,function(){});