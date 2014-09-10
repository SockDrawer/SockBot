var async = require('async'),
    request = require('request'),
    $ = require('cheerio'),
    jar = request.jar(),
    CSRF,
    browser = request.defaults(
    {
        jar: jar,
        headers:
        {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'SockAdept 1.0.0'
        }
    });

function getCSRF(request, callback){
    request.get('http://what.thedailywtf.com/session/csrf.json',function(a,b,c){
        callback(null, JSON.parse(c).csrf);
    });
}

function auth(request, callback){
    getCSRF(request,function(e,csrf){
        request.post('http://what.thedailywtf.com/session', {headers:{'X-CSRF-Token':csrf},form:{login:'sockbot',password:'sockbotsockbot'}}, function(){
            request.post('http://what.thedailywtf.com/login', {form:{username:'sockbot',password:'sockbotsockbot',redirect:'http://what.thedailywtf.com/'}}, function(){
                //request('http://what.thedailywtf.com/users/sockbot/activity.json',function(a,b,c){
                //    console.log(c);
                //});
                callback();
            });
        });
    });
}

function post(request, callback){
    getCSRF(request, function(e, csrf){
        request.post('http://what.thedailywtf.com/posts',{
            headers:{'X-CSRF-Token':csrf}, 
            form:{
                raw:'This is a post from an automated bot performing another test. Did it work?',
                topic_id:3031,
                reply_to_post_number:'',
                category:3,
                archetype:'regular',
                auto_close_time:'' }},
            function(a,b,c){
                console.log(arguments);
                callback();
            })
    })

}

auth(browser,function(){post(browser,function(){})});