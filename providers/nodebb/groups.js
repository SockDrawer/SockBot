'use strict';

const utils = require('../../lib/utils');

/**
 * Create a ChatRoom class and bind it to a forum instance
 *
 * @param {Provider} forum A forum instance to bind to constructed ChatRoom class
 * @returns {User} A ChatRoomPo class bound to the provided `forum` instance
 */
exports.bindGroup = function bindGroup(forum) {
    /**
     * Message Group
     *
     * Represents a forum group
     *
     * @public
     */
    class Group {
        constructor(payload) {
            payload = utils.parseJSON(payload);
            const values = {
                'name': payload.name
            };
            utils.mapSet(this, values);
        }
        get id() {
            return utils.mapGet(this, 'name');
        }
        get name() {
            return utils.mapGet(this, 'name');
        }

        getMembers() {
            return new Promise((resolve, reject) => {
                let idx = -1;
                const members = [];
                const iterate = () => forum._emit('groups.loadMoreMembers', {
                    groupName: this.name,
                    after: idx
                }).then((results) => {
                    if (!results.users || !results.users.length) {
                        return resolve(this);
                    }
                    idx = results.nextStart;
                    results.users.forEach((user) => members.push(forum.Users.parse(user)));
                    return process.nextTick(iterate);
                }).catch((err) => reject(err));
                iterate();
            });
        }

        static get(groupName) {
            const lcase = (name) => (name || '').toLowerCase();
            groupName = lcase(groupName);
            const query = {
                query: groupName
            };
            return forum._emit('groups.search', query)
                .then((result) => (result || []).filter((group) => lcase(group.name) === groupName)[0])
                .then(Group.parse);
        }

        static parse(payload) {
            if (!payload) {
                throw new Error('E_GROUP_NOT_FOUND');
            }
            return new Group(payload);
        }
    }

    return Group;
};

//429["groups.loadMore",{"sort":"alpha","after":"15"}]
//439[null,{"groups":[{"name":"secret PM club","slug":"secret-pm-club","createtime":1458419662822,"userTitle":"secret PM club","description":"","memberCount":5,"deleted":0,"hidden":false,"system":false,"private":true,"disableJoinRequests":false,"ownerUid":1,"icon":"","labelColor":"#000000","userTitleEnabled":false,"nameEncoded":"secret%20PM%20club","displayName":"secret PM club","createtimeISO":"2016-03-19T20:34:22.822Z","cover:url":"/images/cover-default.png","cover:thumb:url":"/images/cover-default.png","cover:position":"50% 50%","members":[{"username":"error","userslug":"error","picture":"/uploads/default/1768/a9bf99e0767b3b11.png","uid":23,"icon:text":"E","icon:bgColor":"#33691e"},{"username":"Tsaukpaetra","userslug":"tsaukpaetra","picture":"/uploads/default/4289/1432602866adac08.png","uid":897,"icon:text":"T","icon:bgColor":"#827717"},{"username":"cloak15","userslug":"cloak15","picture":"/uploads/default/14215/74b6147e7be50cc4.png","uid":1727,"icon:text":"C","icon:bgColor":"#33691e"},{"username":"Yamikuronue","userslug":"yamikuronue","picture":"/uploads/profile/731-profileimg-1470696195044.png","uid":731,"icon:text":"Y","icon:bgColor":"#e91e63"}],"truncated":false},{"name":"sockdevs","slug":"sockdevs","createtime":1461695098338,"userTitle":"sockdevs","description":"","memberCount":4,"deleted":0,"hidden":false,"system":false,"private":true,"disableJoinRequests":false,"ownerUid":1,"icon":"fa-spinner","labelColor":"#ff29ff","userTitleEnabled":true,"nameEncoded":"sockdevs","displayName":"sockdevs","createtimeISO":"2016-04-26T18:24:58.338Z","cover:url":"/images/cover-default.png","cover:thumb:url":"/images/cover-default.png","cover:position":"50% 50%","members":[{"username":"error","userslug":"error","picture":"/uploads/default/1768/a9bf99e0767b3b11.png","uid":23,"icon:text":"E","icon:bgColor":"#33691e"},{"username":"Onyx","userslug":"onyx","picture":"/uploads/profile/572-profileimg.png","uid":572,"icon:text":"O","icon:bgColor":"#e65100"},{"username":"Yamikuronue","userslug":"yamikuronue","picture":"/uploads/profile/731-profileimg-1470696195044.png","uid":731,"icon:text":"Y","icon:bgColor":"#e91e63"},{"username":"accalia","userslug":"accalia","picture":"/uploads/profile/650-profileimg-1470596378545.png","uid":650,"icon:text":"A","icon:bgColor":"#9c27b0"}],"truncated":false},{"name":"TDWTF NodeBB Development","slug":"tdwtf-nodebb-development","createtime":1460043741743,"userTitle":"TDWTF NodeBB Development","description":"People interested in developing and testing NodeBB enhancements, bug fixes and plugins.","memberCount":9,"deleted":0,"hidden":false,"system":false,"private":false,"disableJoinRequests":false,"ownerUid":14,"icon":"fa-bomb","labelColor":"#000000","userTitleEnabled":false,"nameEncoded":"TDWTF%20NodeBB%20Development","displayName":"TDWTF NodeBB Development","createtimeISO":"2016-04-07T15:42:21.743Z","cover:url":"/images/cover-default.png","cover:thumb:url":"/images/cover-default.png","cover:position":"50% 50%","members":[{"username":"error","userslug":"error","picture":"/uploads/default/1768/a9bf99e0767b3b11.png","uid":23,"icon:text":"E","icon:bgColor":"#33691e"},{"username":"sloosecannon","userslug":"sloosecannon","picture":"https://www.gravatar.com/avatar/f6b954032e00ec5aab21f6d66eeecae1?size=192&d=retro","uid":1179,"icon:text":"S","icon:bgColor":"#e65100"},{"username":"loopback0","userslug":"loopback0","picture":"/uploads/profile/598-profileimg.jpg","uid":598,"icon:text":"L","icon:bgColor":"#827717"},{"username":"Weng","userslug":"weng","picture":"/uploads/default/10825/7bb63600c289a640.png","uid":39,"icon:text":"W","icon:bgColor":"#827717"}],"truncated":true},{"name":"trust_level_3","slug":"trust_level_3","createtime":1391427228425,"userTitle":"Regular","description":"no description available","memberCount":135,"deleted":0,"hidden":false,"system":false,"private":true,"disableJoinRequests":false,"_imported_gid":13,"_imported_name":"trust_level_3","_imported_ownerUid":"","_imported_path":"","_imported_slug":"","_imported_description":"","icon":"","labelColor":"#000000","userTitleEnabled":false,"nameEncoded":"trust_level_3","displayName":"trust_level_3","createtimeISO":"2014-02-03T11:33:48.425Z","cover:url":"/images/cover-default.png","cover:thumb:url":"/images/cover-default.png","cover:position":"50% 50%","members":[{"username":"Lathun","userslug":"lathun","picture":"/uploads/profile/141401-profileimg.jpg","uid":141401,"icon:text":"L","icon:bgColor":"#3f51b5"},{"username":"djls45","userslug":"djls45","picture":"","uid":95285,"icon:text":"D","icon:bgColor":"#9c27b0"},{"username":"candlejack1","userslug":"candlejack1","picture":"/uploads/default/original/3X/0/5/0507382758a3da5a944d5ea74e460a33327df333.jpg","uid":140925,"icon:text":"C","icon:bgColor":"#827717"},{"username":"all_users","userslug":"all_users","picture":"/uploads/profile/141504-profileimg.png","uid":141504,"icon:text":"A","icon:bgColor":"#3f51b5"}],"truncated":true},{"name":"trust_level_4","slug":"trust_level_4","createtime":1391427228435,"userTitle":"Leader","description":"no description available","memberCount":6,"deleted":0,"hidden":false,"system":false,"private":true,"disableJoinRequests":true,"_imported_gid":14,"_imported_name":"trust_level_4","_imported_ownerUid":"","_imported_path":"","_imported_slug":"","_imported_description":"","icon":"","labelColor":"#000000","userTitleEnabled":false,"cover:url":"/uploads/files/1466614177655-groupcover.jpeg","cover:thumb:url":"/uploads/files/1466614178223-groupcoverthumb.jpeg","cover:position":"50.0342% 27.6742%","nameEncoded":"trust_level_4","displayName":"trust_level_4","createtimeISO":"2014-02-03T11:33:48.435Z","members":[{"username":"PJH_4","userslug":"pjh_4","picture":"/uploads/default/14341/ceb48edb19c61fdb.png","uid":925,"icon:text":"P","icon:bgColor":"#827717"},{"username":"PJH_MOD","userslug":"pjh_mod","picture":"/uploads/default/14342/bb634fb6506642df.png","uid":923,"icon:text":"P","icon:bgColor":"#607d8b"},{"username":"aliceif","userslug":"aliceif","picture":"/uploads/profile/834-profileimg.png","uid":834,"icon:text":"A","icon:bgColor":"#673ab7"},{"username":"Yamikuronue","userslug":"yamikuronue","picture":"/uploads/profile/731-profileimg-1470696195044.png","uid":731,"icon:text":"Y","icon:bgColor":"#e91e63"}],"truncated":true}],"allowGroupCreation":false,"nextStart":24}]

//4211["groups.loadMoreMembers",{"groupName":"Mafia - Club Ded","after":"20"}]
//4319[null,{"users":[{"username":"Matches","userslug":"matches","joindate":1403107764604,"lastonline":1469824247010,"picture":"/uploads/default/6691/994d24a9356fcd6e.PNG","reputation":5721,"postcount":4503,"banned":false,"status":"offline","uid":757,"email:confirmed":false,"flags":null,"icon:text":"M","icon:bgColor":"#827717","joindateISO":"2014-06-18T16:09:24.604Z","administrator":false,"lastonlineISO":"2016-07-29T20:30:47.010Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"Yamikuronue","userslug":"yamikuronue","joindate":1402591976913,"lastonline":1470696143937,"picture":"/uploads/profile/731-profileimg-1470696195044.png","reputation":24411,"postcount":11620,"banned":false,"status":"offline","uid":731,"email:confirmed":false,"flags":0,"icon:text":"Y","icon:bgColor":"#e91e63","joindateISO":"2014-06-12T16:52:56.913Z","administrator":false,"lastonlineISO":"2016-08-08T22:42:23.937Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"Kuro","userslug":"kuro","joindate":1402584291925,"lastonline":1470695285916,"picture":"/uploads/files/1459717072542-1459711193720-kuro.png","reputation":5684,"postcount":2639,"banned":false,"status":"offline","uid":729,"email:confirmed":false,"flags":null,"icon:text":"K","icon:bgColor":"#ff5722","joindateISO":"2014-06-12T14:44:51.925Z","administrator":false,"lastonlineISO":"2016-08-08T22:28:05.916Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"Arantor","userslug":"arantor","joindate":1402458252034,"lastonline":1470685979612,"picture":"/uploads/default/8523/46ef4e97f6769a6c.png","reputation":111014,"postcount":15251,"banned":false,"status":"offline","uid":720,"email:confirmed":false,"flags":null,"icon:text":"A","icon:bgColor":"#607d8b","joindateISO":"2014-06-11T03:44:12.034Z","administrator":false,"lastonlineISO":"2016-08-08T19:52:59.612Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"redwizard","userslug":"redwizard","joindate":1401616858252,"lastonline":1459460535820,"picture":"/uploads/default/1944/baf42d8d8e1e37b6.jpg","reputation":13634,"postcount":1888,"banned":false,"status":"offline","uid":666,"email:confirmed":false,"flags":null,"icon:text":"R","icon:bgColor":"#009688","joindateISO":"2014-06-01T10:00:58.252Z","administrator":false,"lastonlineISO":"2016-03-31T21:42:15.820Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"accalia","userslug":"accalia","joindate":1401483968981,"lastonline":1470700147023,"picture":"/uploads/profile/650-profileimg-1470596378545.png","reputation":102685,"postcount":32069,"banned":false,"status":"online","uid":650,"email:confirmed":false,"flags":0,"icon:text":"A","icon:bgColor":"#9c27b0","joindateISO":"2014-05-30T21:06:08.981Z","administrator":false,"lastonlineISO":"2016-08-08T23:49:07.023Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"Keith","userslug":"keith","joindate":1400859307347,"lastonline":1469953507597,"picture":"/uploads/default/1069/bbf481e31e6a2bc6.png","reputation":5786,"postcount":2684,"banned":false,"status":"offline","uid":606,"email:confirmed":false,"flags":null,"icon:text":"K","icon:bgColor":"#ff5722","joindateISO":"2014-05-23T15:35:07.347Z","administrator":false,"lastonlineISO":"2016-07-31T08:25:07.597Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"loopback0","userslug":"loopback0","joindate":1400788159740,"lastonline":1463604803754,"picture":"/uploads/profile/598-profileimg.jpg","reputation":104527,"postcount":17769,"banned":false,"status":"offline","uid":598,"email:confirmed":false,"flags":null,"icon:text":"L","icon:bgColor":"#827717","joindateISO":"2014-05-22T19:49:19.740Z","administrator":false,"lastonlineISO":"2016-05-18T20:53:23.754Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"abarker","userslug":"abarker","joindate":1400781061681,"lastonline":1470697263548,"picture":"/uploads/profile/595-profileimg.png","reputation":249713,"postcount":22770,"banned":false,"status":"offline","uid":595,"email:confirmed":false,"flags":null,"icon:text":"A","icon:bgColor":"#f44336","joindateISO":"2014-05-22T17:51:01.681Z","administrator":false,"lastonlineISO":"2016-08-08T23:01:03.548Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"ChaosTheEternal","userslug":"chaostheeternal","joindate":1400680228507,"lastonline":1470699833913,"picture":"/uploads/profile/582-profileimg.png","reputation":60048,"postcount":4211,"banned":false,"status":"offline","uid":582,"email:confirmed":false,"flags":null,"icon:text":"C","icon:bgColor":"#f44336","joindateISO":"2014-05-21T13:50:28.507Z","administrator":false,"lastonlineISO":"2016-08-08T23:43:53.913Z","banned_until":0,"banned_until_readable":"Not Banned"}],"nextStart":30}]

//4227["groups.join",{"groupName":"Discourse touched me in a no-no place"}]

//4229["groups.leave",{"groupName":"Discourse touched me in a no-no place"}]

//4241["groups.issueInvite",{"toUid":1496,"groupName":"secret PM club"}]
//4229["groups.leave",{"groupName":"Discourse touched me in a no-no place"}]

//4240["user.search",{"query":"kae"}]
//4340[null,{"matchCount":9,"pageCount":1,"timing":"0.03","users":[{"username":"Kaelas","userslug":"kaelas","joindate":1417029848050,"lastonline":1459190895167,"picture":"/uploads/default/10486/560fb853bd0d885e.jpg","reputation":3,"postcount":1,"banned":false,"status":"offline","uid":1496,"email:confirmed":false,"flags":null,"icon:text":"K","icon:bgColor":"#2196f3","joindateISO":"2014-11-26T19:24:08.050Z","administrator":false,"lastonlineISO":"2016-03-28T18:48:15.167Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"kaeruct","userslug":"kaeruct","joindate":1372774849000,"lastonline":1372774849000,"picture":"","reputation":0,"postcount":0,"banned":false,"status":"offline","uid":120124,"email:confirmed":false,"flags":null,"icon:text":"K","icon:bgColor":"#827717","joindateISO":"2013-07-02T14:20:49.000Z","administrator":false,"lastonlineISO":"2013-07-02T14:20:49.000Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"kae458","userslug":"kae458","joindate":1371362419000,"lastonline":1371362419000,"picture":"","reputation":0,"postcount":0,"banned":false,"status":"offline","uid":116357,"email:confirmed":false,"flags":null,"icon:text":"K","icon:bgColor":"#3f51b5","joindateISO":"2013-06-16T06:00:19.000Z","administrator":false,"lastonlineISO":"2013-06-16T06:00:19.000Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"kaeshaparker","userslug":"kaeshaparker","joindate":1334739799000,"lastonline":1334739799000,"picture":"","reputation":0,"postcount":0,"banned":false,"status":"offline","uid":94735,"email:confirmed":false,"flags":null,"icon:text":"K","icon:bgColor":"#009688","joindateISO":"2012-04-18T09:03:19.000Z","administrator":false,"lastonlineISO":"2012-04-18T09:03:19.000Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"kaerast","userslug":"kaerast","joindate":1322623446000,"lastonline":1322623446000,"picture":"","reputation":0,"postcount":0,"banned":false,"status":"offline","uid":92090,"email:confirmed":false,"flags":null,"icon:text":"K","icon:bgColor":"#2196f3","joindateISO":"2011-11-30T03:24:06.000Z","administrator":false,"lastonlineISO":"2011-11-30T03:24:06.000Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"kaetuu89","userslug":"kaetuu89","joindate":1213696039000,"lastonline":1213696039000,"picture":"","reputation":0,"postcount":0,"banned":false,"status":"offline","uid":13491,"email:confirmed":false,"flags":null,"icon:text":"K","icon:bgColor":"#795548","joindateISO":"2008-06-17T09:47:19.000Z","administrator":false,"lastonlineISO":"2008-06-17T09:47:19.000Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"kaekae","userslug":"kaekae","joindate":1179503462000,"lastonline":1179608426827,"picture":"","reputation":0,"postcount":3,"banned":false,"status":"offline","uid":10248,"email:confirmed":false,"flags":null,"icon:text":"K","icon:bgColor":"#33691e","joindateISO":"2007-05-18T15:51:02.000Z","administrator":false,"lastonlineISO":"2007-05-19T21:00:26.827Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"kae","userslug":"kae","joindate":1167594918000,"lastonline":1168921128090,"picture":"/uploads/default/17511/66d69df01d925d28.png","reputation":0,"postcount":2,"banned":false,"status":"offline","uid":8529,"email:confirmed":false,"flags":null,"icon:text":"K","icon:bgColor":"#ff5722","joindateISO":"2006-12-31T19:55:18.000Z","administrator":false,"lastonlineISO":"2007-01-16T04:18:48.090Z","banned_until":0,"banned_until_readable":"Not Banned"},{"username":"kaeli","userslug":"kaeli","joindate":1114533342153,"lastonline":1177615778043,"picture":"","reputation":0,"postcount":0,"banned":false,"status":"offline","uid":2766,"email:confirmed":false,"flags":null,"icon:text":"K","icon:bgColor":"#f44336","joindateISO":"2005-04-26T16:35:42.153Z","administrator":false,"lastonlineISO":"2007-04-26T19:29:38.043Z","banned_until":0,"banned_until_readable":"Not Banned"}],"pagination":{"prev":{"page":1,"active":false},"next":{"page":1,"active":false},"rel":[],"pages":[],"currentPage":1,"pageCount":1},"route_users:undefined":true}]

//427["groups.search",{"query":"Discourse touched me in a no-no place"}]
//437[null,[{"name":"Discourse touched me in a no-no place","slug":"discourse-touched-me-in-a-no-no-place","createtime":1467253147907,"userTitle":"Discourse touched me in a no-no place","description":"","memberCount":21,"deleted":0,"hidden":false,"system":false,"private":false,"disableJoinRequests":false,"ownerUid":1,"icon":"fa-hand-o-right","labelColor":"#c29daf","userTitleEnabled":true,"cover:url":"/uploads/files/1467263849524-groupcover.png","cover:thumb:url":"/uploads/files/1467263849682-groupcoverthumb.png","cover:position":"50.0342% 21.5927%","nameEncoded":"Discourse%20touched%20me%20in%20a%20no-no%20place","displayName":"Discourse touched me in a no-no place","createtimeISO":"2016-06-30T02:19:07.907Z"}]]

//426["groups.update",{"groupName":"sockdevs","values":{"name":"sockdevs","description":"We are the SockDevs","userTitle":"sockdevs","labelColor":"#ff29ff","icon":"fa-spinner","userTitleEnabled":true,"private":true,"disableJoinRequests":false,"hidden":false}}]


/*
get createtime() {
    return utils.mapGet(this, 'createtime');
}
get title() {
    return utils.mapGet(this, 'title');
}
get description() {
    return utils.mapGet(this, 'description');
}
get isDeleted() {
    return utils.mapGet(this, 'deleted');
}
get isHidden() {
    return utils.mapGet(this, 'hidden');
}
get isPrivate() {
    return utils.mapGet(this, 'private');
}
get owner() {
    return forum.User.get(utils.mapGet(this, 'id'));
}

_selfAction(action) {
    return forum._emit(action, {
        groupName: this.name
    }).then(() => this);
}
join() {
    return this._selfAction('groups.join');
}
leave() {
    return this._selfAction('groups.leave');
}
acceptInvite() {
    return this.selfAction('groups.acceptInvite');
}
rejectInvite() {
    return this.selfAction('groups.rejectInvite');
}

_userAction(action, user) {
    return forum._emit(action, {
        groupName: this.name,
        toUid: user.id
    }).then(() => this);
}
issueInvite(toUser) {
    return this._userAction('groups.issueInvite', toUser);
}
rescindInvite(toUser) {
    return this._userAction('groups.rescindInvite', toUser);
}
acceptJoinRequest(fromUser) {
    return this._userAction('groups.accept', fromUser);
}
rejectJoinRequest(fromUser) {
    return this._userAction('groups.reject', fromUser);
}
grantOwnership(toUser) {
    return this._userAction('groups.grant', toUser);
}
revokeOwnership(toUser) {
    return this._userAction('groups.rescind', toUser);
}
kick(user) {
    return this._userAction('groups.kick', user);
}
*/
