<a name="sockbot.providers.nodebb.module_User"></a>

## User
NodeBB provider module User class

**Author**: Accalia  
**License**: MIT  

* [User](#sockbot.providers.nodebb.module_User)
    * _static_
        * [.bindUser(forum)](#sockbot.providers.nodebb.module_User.bindUser) ⇒ <code>User</code>
    * _inner_
        * [~User](#sockbot.providers.nodebb.module_User..User)
            * [new User(payload)](#new_sockbot.providers.nodebb.module_User..User_new)
            * _instance_
                * [.id](#sockbot.providers.nodebb.module_User..User+id) : <code>number</code>
                * [.name](#sockbot.providers.nodebb.module_User..User+name) : <code>string</code>
                * [.username](#sockbot.providers.nodebb.module_User..User+username) : <code>string</code>
                * [.email](#sockbot.providers.nodebb.module_User..User+email) : <code>string</code>
                * [.avatar](#sockbot.providers.nodebb.module_User..User+avatar) : <code>string</code>
                * [.postCount](#sockbot.providers.nodebb.module_User..User+postCount) : <code>number</code>
                * [.topicCount](#sockbot.providers.nodebb.module_User..User+topicCount) : <code>number</code>
                * [.reputation](#sockbot.providers.nodebb.module_User..User+reputation) : <code>number</code>
                * [.lastPosted](#sockbot.providers.nodebb.module_User..User+lastPosted) : <code>Date</code>
                * [.lastSeen](#sockbot.providers.nodebb.module_User..User+lastSeen) : <code>Date</code>
                * [.url()](#sockbot.providers.nodebb.module_User..User+url) ⇒ <code>Promise.&lt;string&gt;</code>
                * [.follow()](#sockbot.providers.nodebb.module_User..User+follow) ⇒ <code>Promise.&lt;User&gt;</code>
                * [.unfollow()](#sockbot.providers.nodebb.module_User..User+unfollow) ⇒ <code>Promise.&lt;user&gt;</code>
                * [.whisper(message, [title])](#sockbot.providers.nodebb.module_User..User+whisper) ⇒ <code>Promise</code>
                * [.uploadAvatar(imageData, mimeType)](#sockbot.providers.nodebb.module_User..User+uploadAvatar) ⇒ <code>Promise.&lt;string&gt;</code>
            * _static_
                * [.get(userId)](#sockbot.providers.nodebb.module_User..User.get) ⇒ <code>Promise.&lt;User&gt;</code>
                * [.getByName(username)](#sockbot.providers.nodebb.module_User..User.getByName) ⇒ <code>Promise.&lt;User&gt;</code>
                * [.parse(payload)](#sockbot.providers.nodebb.module_User..User.parse) ⇒ <code>Promise.&lt;User&gt;</code>

<a name="sockbot.providers.nodebb.module_User.bindUser"></a>

### User.bindUser(forum) ⇒ <code>User</code>
Create a User class and bind it to a forum instance

**Kind**: static method of <code>[User](#sockbot.providers.nodebb.module_User)</code>  
**Returns**: <code>User</code> - A User class bound to the provided `forum` instance  

| Param | Type | Description |
| --- | --- | --- |
| forum | <code>Provider</code> | A forum instance to bind to constructed User class |

<a name="sockbot.providers.nodebb.module_User..User"></a>

### User~User
User Class

Represents a forum user

**Kind**: inner class of <code>[User](#sockbot.providers.nodebb.module_User)</code>  
**Access**: public  

* [~User](#sockbot.providers.nodebb.module_User..User)
    * [new User(payload)](#new_sockbot.providers.nodebb.module_User..User_new)
    * _instance_
        * [.id](#sockbot.providers.nodebb.module_User..User+id) : <code>number</code>
        * [.name](#sockbot.providers.nodebb.module_User..User+name) : <code>string</code>
        * [.username](#sockbot.providers.nodebb.module_User..User+username) : <code>string</code>
        * [.email](#sockbot.providers.nodebb.module_User..User+email) : <code>string</code>
        * [.avatar](#sockbot.providers.nodebb.module_User..User+avatar) : <code>string</code>
        * [.postCount](#sockbot.providers.nodebb.module_User..User+postCount) : <code>number</code>
        * [.topicCount](#sockbot.providers.nodebb.module_User..User+topicCount) : <code>number</code>
        * [.reputation](#sockbot.providers.nodebb.module_User..User+reputation) : <code>number</code>
        * [.lastPosted](#sockbot.providers.nodebb.module_User..User+lastPosted) : <code>Date</code>
        * [.lastSeen](#sockbot.providers.nodebb.module_User..User+lastSeen) : <code>Date</code>
        * [.url()](#sockbot.providers.nodebb.module_User..User+url) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.follow()](#sockbot.providers.nodebb.module_User..User+follow) ⇒ <code>Promise.&lt;User&gt;</code>
        * [.unfollow()](#sockbot.providers.nodebb.module_User..User+unfollow) ⇒ <code>Promise.&lt;user&gt;</code>
        * [.whisper(message, [title])](#sockbot.providers.nodebb.module_User..User+whisper) ⇒ <code>Promise</code>
        * [.uploadAvatar(imageData, mimeType)](#sockbot.providers.nodebb.module_User..User+uploadAvatar) ⇒ <code>Promise.&lt;string&gt;</code>
    * _static_
        * [.get(userId)](#sockbot.providers.nodebb.module_User..User.get) ⇒ <code>Promise.&lt;User&gt;</code>
        * [.getByName(username)](#sockbot.providers.nodebb.module_User..User.getByName) ⇒ <code>Promise.&lt;User&gt;</code>
        * [.parse(payload)](#sockbot.providers.nodebb.module_User..User.parse) ⇒ <code>Promise.&lt;User&gt;</code>

<a name="new_sockbot.providers.nodebb.module_User..User_new"></a>

#### new User(payload)
Construct a User object from payload

This constructor is intended to be private use only, if you need to construct a user from payload data use
`User.parse()` instead


| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | Payload to construct the User object out of |

<a name="sockbot.providers.nodebb.module_User..User+id"></a>

#### user.id : <code>number</code>
Forum Specific User Id

**Kind**: instance property of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Access**: public  
<a name="sockbot.providers.nodebb.module_User..User+name"></a>

#### user.name : <code>string</code>
Descriptive name of the User

**Kind**: instance property of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Access**: public  
<a name="sockbot.providers.nodebb.module_User..User+username"></a>

#### user.username : <code>string</code>
Username of the User

**Kind**: instance property of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Access**: public  
<a name="sockbot.providers.nodebb.module_User..User+email"></a>

#### user.email : <code>string</code>
Email address of the User

May be blank if active login does not have sufficient rights to read email address

**Kind**: instance property of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Access**: public  
<a name="sockbot.providers.nodebb.module_User..User+avatar"></a>

#### user.avatar : <code>string</code>
Link to avatar image for user

**Kind**: instance property of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Access**: public  
<a name="sockbot.providers.nodebb.module_User..User+postCount"></a>

#### user.postCount : <code>number</code>
Number of posts User has made at time of retrieval

**Kind**: instance property of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Access**: public  
<a name="sockbot.providers.nodebb.module_User..User+topicCount"></a>

#### user.topicCount : <code>number</code>
Number of topics User has created at time of retrieval

**Kind**: instance property of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Access**: public  
<a name="sockbot.providers.nodebb.module_User..User+reputation"></a>

#### user.reputation : <code>number</code>
User reputation at time of retrieval

**Kind**: instance property of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Access**: public  
<a name="sockbot.providers.nodebb.module_User..User+lastPosted"></a>

#### user.lastPosted : <code>Date</code>
Datetime User last made a publically visible post

**Kind**: instance property of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Access**: public  
<a name="sockbot.providers.nodebb.module_User..User+lastSeen"></a>

#### user.lastSeen : <code>Date</code>
Datetime User was last seen online

**Kind**: instance property of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Access**: public  
<a name="sockbot.providers.nodebb.module_User..User+url"></a>

#### user.url() ⇒ <code>Promise.&lt;string&gt;</code>
Url to User profile

**Kind**: instance method of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Returns**: <code>Promise.&lt;string&gt;</code> - A promise that resolves to the desired URL  
**Access**: public  
**Promise**:   
**Fulfill**: <code>string</code> The desired Url  
**Reject**: <code>Error</code> An Error that occured while determining URL  
<a name="sockbot.providers.nodebb.module_User..User+follow"></a>

#### user.follow() ⇒ <code>Promise.&lt;User&gt;</code>
Follow the User

**Kind**: instance method of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Returns**: <code>Promise.&lt;User&gt;</code> - Resolves on completion to followed User  
**Access**: public  
**Promise**:   
**Fulfill**: <code>User</code> The followed User  
**Reject**: <code>Error</code> An Error that occured while processing  
<a name="sockbot.providers.nodebb.module_User..User+unfollow"></a>

#### user.unfollow() ⇒ <code>Promise.&lt;user&gt;</code>
Unfollow the User

**Kind**: instance method of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Returns**: <code>Promise.&lt;user&gt;</code> - Resolves to the unfollowed User  
**Access**: public  
**Promise**:   
**Fulfill**: <code>User</code> The unfollowed User  
**Reject**: <code>Error</code> An Error that occured while processing  
<a name="sockbot.providers.nodebb.module_User..User+whisper"></a>

#### user.whisper(message, [title]) ⇒ <code>Promise</code>
Communicate privately with the user

**Kind**: instance method of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Returns**: <code>Promise</code> - Resolve when communication has occured, rejects if attempt fails or is unsupported  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Message to communicate with the user |
| [title] | <code>string</code> | Optional: Title of the message to communicate |

<a name="sockbot.providers.nodebb.module_User..User+uploadAvatar"></a>

#### user.uploadAvatar(imageData, mimeType) ⇒ <code>Promise.&lt;string&gt;</code>
Upload avatar and set as current avatar

**Kind**: instance method of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Returns**: <code>Promise.&lt;string&gt;</code> - Resolves to the url of the avatar that is uploaded  
**Access**: public  
**Promise**:   
**Fulfill**: <code>string</code> The url of the uploaded image  
**Reject**: <code>Error</code> An Error that occured while processing  

| Param | Type | Description |
| --- | --- | --- |
| imageData | <code>Buffer</code> | Image File Data to be uploaded |
| mimeType | <code>string</code> | Mime type of the image data. E.g. 'image/jpeg' |

<a name="sockbot.providers.nodebb.module_User..User.get"></a>

#### User.get(userId) ⇒ <code>Promise.&lt;User&gt;</code>
Get User by Id

**Kind**: static method of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Returns**: <code>Promise.&lt;User&gt;</code> - Resolves to the retrieved User  
**Access**: public  
**Promise**:   
**Fulfill**: <code>User</code> The retrieved User  
**Reject**: <code>Error</code> An Error that occured while processing  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>number</code> | ID of the user to retrieve |

<a name="sockbot.providers.nodebb.module_User..User.getByName"></a>

#### User.getByName(username) ⇒ <code>Promise.&lt;User&gt;</code>
Get User by username

**Kind**: static method of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Returns**: <code>Promise.&lt;User&gt;</code> - Resolves to the retrieved User  
**Access**: public  
**Promise**:   
**Fulfill**: <code>User</code> The retrieved User  
**Reject**: <code>Error</code> An Error that occured while processing  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | Username of the user to retrieve |

<a name="sockbot.providers.nodebb.module_User..User.parse"></a>

#### User.parse(payload) ⇒ <code>Promise.&lt;User&gt;</code>
Parse user from retrieved payload

**Kind**: static method of <code>[User](#sockbot.providers.nodebb.module_User..User)</code>  
**Returns**: <code>Promise.&lt;User&gt;</code> - Resolves to the parsed User  
**Access**: public  
**Promise**:   
**Fulfill**: <code>User</code> The parsed User  
**Reject**: <code>Error</code> An Error that occured while processing  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | Data to parse as a User object |

