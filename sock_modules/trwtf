/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var discourse,
        summons = {},
        configuration;

    /**
     * @var {string} description Brief description of this module for Help Docs
     */
    exports.description = 'Allow Summoning of bot to play in certain threads';

    /**
     * @var {object} configuration Default Configuration settings for this
     * sock_module
     */
    exports.configuration = {
        enabled: false,
        autoTimeout: 60 * 1000,
        userTimeout: 60 * 60 * 1000,
        probability: 1,
        message: "`username` is TRWTF"
    };

    /**
     * @var {string} name The name of this sock_module
     */
    exports.name = 'TRWTF';

    /**
     * @var {number} priority If defined by a sock_module it is the priority
     * of the module with respect to other modules.
     *
     * sock_modules **should not** define modules with negative permissions.
     * Default value is 50 with lower numbers being higher priority.
     */
    exports.priority = 1000;

    /**
     * @var {string} version The version of this sock_module
     */
    exports.version = '0.9.5';

    function purgeMemory() {
        var lastHour = (new Date().getTime()) - 60 * 60 * 1000, // an hour ago;
            k; //key
        for (k in summons) {
            if (summons.hasOwnProperty(k) && summons[k] < lastHour) {
                delete summons[k];
            }
        }
    }
    var replyOptions = {
    	amirite: false,
    	newb: false,
    	bold: false,
    	ahref: null
    };
    
    function resetReplyOptions()
    {
    	replyOptions.amirite=false;
    	replyOptions.newb=false;
    	replyOptions.bold=false;
    	replyOptions.ahref=null;
    }
    
    function checkForMentionInReply(replyText){
    	var mention=/\@trwtfbot.*/g
        var found=replyText.match(mention)
        if(found!=null)
        {
        	discourse.log("[sloosecannon.trwtfbot.checkForMentionInReply]Found @mention in reply, activating TRWTFbot module");
        	return true;
        }
        else 
        {
        	discourse.log("[sloosecannon.trwtfbot.checkForMentionInReply]No @mentions, ignoring reply.");
        	discourse.log("[sloosecannon.trwtfbot.checkForMentionInReply]Reply text was: "+replyText);
        	return false;
        }
    }
    
    function processOptions(postRaw)
    {
    	//First, process and remove hrefs...
	var hrefRegex=/(-ah) .* ?/g;
    	var hrefCommand=postRaw.match(hrefRegex);
    	replyOptions.ahref=(hrefCommand+"").replace(/(-ah) /g,"");
    	//remove href
    	postRaw=postRaw.replace(hrefRegex,"");
    	
    	//next, process any remaining commands...
    	var commandStringRegex=/(-[nba]+)/g
    	var commandString=postRaw.match(commandStringRegex)
    	if(commandString!=null)
    	{
    		commandString=commandString+"";
    		replyOptions.amirite=(commandString.search(/a/g)!=-1)
 		replyOptions.newb=(commandString.search(/n/g)!=-1)
 		replyOptions.bold=(commandString.search(/b/g)!=-1)
    	}
    	discourse.log("[sloosecannon.trwtfbot.processOptions]Options processing complete... Options were: ")
      	discourse.log("[sloosecannon.trwtfbot.processOptions]amirite: "+replyOptions.amirite)
      	discourse.log("[sloosecannon.trwtfbot.processOptions]newbmode: "+replyOptions.newb)
      	discourse.log("[sloosecannon.trwtfbot.processOptions]bold: "+replyOptions.bold)
      	discourse.log("[sloosecannon.trwtfbot.processOptions]ahref: "+replyOptions.ahref)
    }

    exports.onNotify = function onNotify(type, notification, topic,
        post, callback) {
        var customOptions=false;
        discourse.log(type, notification.slug);
        if (type === 'mentioned' || ((post+"" != "null") && (post.raw+"" != "null") && (checkForMentionInReply(post.raw)))) {
            var now = (new Date().getTime()),
                s = configuration.message;
            if (summons[notification.topic_id] &&
                now < summons[notification.topic_id]) {
                return callback();
            }
            discourse.log("[sloosecannon.trwtfbot.onNotify]"+notification.data.display_username +
                ' summoned me to play in ' + notification.slug);
            s = s.replace(/%__(\w+)__%/g, function (m, key) {
                if (post.hasOwnProperty(key)) {
                    return post[key];
                }
                return m;
            });
            var search=/\@trwtfbot.*/g
            var username=post.raw.match(search)
            discourse.log('[sloosecannon.trwtfbot.onNotify]Found '+username);
            
            
            if(username!=null){
                username=username+"";
                username=username.replace(/\@trwtfbot /g,"");
                username=username+"";
                discourse.log('[sloosecannon.trwtfbot.onNotify]Username is '+username);
            }
            else{
                username="YOU";
                s=s.replace(/ is /g," are ");
            }
            if(username.search(/(-[nba]+)/g)!=-1||username.search(/(-ah) .* ?/g)!=-1)
            {
            	customOptions=true;
                discourse.log('[sloosecannon.trwtfbot.onNotify]Found optional parameters, processing');
            	processOptions(post.raw);
		username=username.replace(/(-ah) .* ?/g,"")+"";
            	username=(username.replace(/(-[nba]+)/g,"")+"");
            }
	    if(customOptions==true)
	    {
	    	if(replyOptions.amirite)
	    	{
	    		s=s+", amirite?";
	    	}
	    	if(replyOptions.newb)
	    	{
	    		s=s.replace(/TRWTF/g,"<abbr title=\"The Real WTF\">TRWTF</abbr>");
	    	}
	    	if(replyOptions.bold)
	    	{
	    		username="<strong>"+username+"</strong>";
	    	}
	    	if(replyOptions.ahref+""!="null")
	    	{
	    		username="<a href=\""+replyOptions.ahref+"\" class=\"mention\">"+username+"</a>";
	    	}
	    	discourse.log("[sloosecannon.trwtfbot.onNotify]After custom options, username is: "+username)
	    }
            s = s.replace(/`username`/g,username);

            summons[notification.topic_id] = now + configuration.autoTimeout;
            discourse.createPost(notification.topic_id,
                notification.post_number, s,
                function () {
                    callback(true);
                });
        } else {
            callback();
        }
    };
    exports.begin = function begin(browser, config) {
        configuration = config.modules[exports.name];
        discourse = browser;
        setInterval(purgeMemory, 30 * 60 * 1000);
    };
}());
