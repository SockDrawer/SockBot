## Classes

<dl>
<dt><a href="#Message">Message</a></dt>
<dd><p>Message Class</p>
<p>Represents a message in a chatroom</p>
</dd>
<dt><a href="#ChatRoom">ChatRoom</a></dt>
<dd><p>ChatRoom Class</p>
<p>Represents a chat room</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#bindChat">bindChat(forum)</a> ⇒ <code>User</code></dt>
<dd><p>Create a ChatRoom class and bind it to a forum instance</p>
</dd>
</dl>

<a name="Message"></a>

## Message
Message Class

Represents a message in a chatroom

**Kind**: global class  
**Access:** public  

* [Message](#Message)
    * [new Message(payload)](#new_Message_new)
    * _instance_
        * [.id](#Message+id) ⇒ <code>number</code>
        * [.room](#Message+room) ⇒ <code>number</code>
        * [.from](#Message+from) ⇒ <code>User</code>
        * [.self](#Message+self) ⇒ <code>boolean</code>
        * [.content](#Message+content) ⇒ <code>string</code>
        * [.sent](#Message+sent) ⇒ <code>Date</code>
        * [.markup()](#Message+markup) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.reply(content)](#Message+reply) ⇒ <code>Promise</code>
    * _static_
        * [.parse(payload)](#Message.parse) ⇒ <code>[Message](#Message)</code>

<a name="new_Message_new"></a>

### new Message(payload)
Construct a Message object from payload

This constructor is intended to be private use only, if you need to construct a chat message from payload
data use `Message.parse()` instead


| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | Payload to construct the Message object out of |

<a name="Message+id"></a>

### message.id ⇒ <code>number</code>
Chat message id

**Kind**: instance property of <code>[Message](#Message)</code>  
**Returns**: <code>number</code> - Id of the chat message  
**Access:** public  
<a name="Message+room"></a>

### message.room ⇒ <code>number</code>
Id of the chatroom this message belongs to

**Kind**: instance property of <code>[Message](#Message)</code>  
**Returns**: <code>number</code> - Id of the ChatRoom this message belongs to  
**Access:** public  
<a name="Message+from"></a>

### message.from ⇒ <code>User</code>
User who sent this message

**Kind**: instance property of <code>[Message](#Message)</code>  
**Returns**: <code>User</code> - User who authored this chat message  
**Access:** public  
<a name="Message+self"></a>

### message.self ⇒ <code>boolean</code>
Identify if this message was created by current user

**Kind**: instance property of <code>[Message](#Message)</code>  
**Returns**: <code>boolean</code> - True if message was sent by current user  
**Access:** public  
<a name="Message+content"></a>

### message.content ⇒ <code>string</code>
Text content of message

**Kind**: instance property of <code>[Message](#Message)</code>  
**Returns**: <code>string</code> - Content of the message with formatting and quotes removed  
**Access:** public  
<a name="Message+sent"></a>

### message.sent ⇒ <code>Date</code>
DateTime the message was sent

**Kind**: instance property of <code>[Message](#Message)</code>  
**Returns**: <code>Date</code> - datetime the message was sent  
**Access:** public  
<a name="Message+markup"></a>

### message.markup() ⇒ <code>Promise.&lt;string&gt;</code>
Message markup

**Kind**: instance method of <code>[Message](#Message)</code>  
**Returns**: <code>Promise.&lt;string&gt;</code> - Resolves to the HTML markup of the chat message  
**Access:** public  
<a name="Message+reply"></a>

### message.reply(content) ⇒ <code>Promise</code>
Reply to the chat message

**Kind**: instance method of <code>[Message](#Message)</code>  
**Returns**: <code>Promise</code> - Resolves once message has been sent  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Message to reply with |

<a name="Message.parse"></a>

### Message.parse(payload) ⇒ <code>[Message](#Message)</code>
Parse a Message from a given payload

**Kind**: static method of <code>[Message](#Message)</code>  
**Returns**: <code>[Message](#Message)</code> - parsed Message  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>string</code> &#124; <code>object</code> | Data to parse as a Message |

<a name="ChatRoom"></a>

## ChatRoom
ChatRoom Class

Represents a chat room

**Kind**: global class  
**Access:** public  

* [ChatRoom](#ChatRoom)
    * [new ChatRoom(payload)](#new_ChatRoom_new)
    * _instance_
        * [.id](#ChatRoom+id) ⇒ <code>number</code>
        * [.name](#ChatRoom+name) ⇒ <code>string</code>
        * [.users](#ChatRoom+users) ⇒ <code>Array.&lt;User&gt;</code>
        * [.participants](#ChatRoom+participants) ⇒ <code>number</code>
        * [.owner](#ChatRoom+owner) ⇒ <code>User</code>
        * [.url()](#ChatRoom+url) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.send(content)](#ChatRoom+send) ⇒ <code>Promise</code>
        * [.addUsers(users)](#ChatRoom+addUsers) ⇒ <code>Promise</code>
        * [.removeUsers(users)](#ChatRoom+removeUsers) ⇒ <code>Promsie</code>
        * [.leave()](#ChatRoom+leave) ⇒ <code>Promise</code>
        * [.rename(newName)](#ChatRoom+rename) ⇒ <code>Promise</code>
    * _static_
        * [.create(users, message, [title])](#ChatRoom.create) ⇒ <code>Promise</code>
        * [.activate()](#ChatRoom.activate)
        * [.deactivate()](#ChatRoom.deactivate)
        * [.get(roomId)](#ChatRoom.get) ⇒ <code>[Promise.&lt;ChatRoom&gt;](#ChatRoom)</code>
        * [.parse(payload)](#ChatRoom.parse) ⇒ <code>[ChatRoom](#ChatRoom)</code>

<a name="new_ChatRoom_new"></a>

### new ChatRoom(payload)
Construct a ChatroomObject from payload

This constructor is intended to be private use only, if you need to construct a chatroom from payload
data use `ChatRoom.parse()` instead


| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | Payload to construct the ChatRoom object out of |

<a name="ChatRoom+id"></a>

### chatRoom.id ⇒ <code>number</code>
Get the chatroom id

**Kind**: instance property of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>number</code> - Id of the chatroom  
**Access:** public  
<a name="ChatRoom+name"></a>

### chatRoom.name ⇒ <code>string</code>
Get the chatroom name

**Kind**: instance property of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>string</code> - Name of the chatroom  
**Access:** public  
<a name="ChatRoom+users"></a>

### chatRoom.users ⇒ <code>Array.&lt;User&gt;</code>
Get the users in the chatroom

**Kind**: instance property of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>Array.&lt;User&gt;</code> - The users that were in teh chatroom when the room was retrieved  
**Access:** public  
<a name="ChatRoom+participants"></a>

### chatRoom.participants ⇒ <code>number</code>
Get the number of users in the chatroom

**Kind**: instance property of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>number</code> - Number of users in the chatroom  
**Access:** public  
<a name="ChatRoom+owner"></a>

### chatRoom.owner ⇒ <code>User</code>
Get the owner of the chatroom

**Kind**: instance property of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>User</code> - Owning user for the chatroom  
**Access:** public  
<a name="ChatRoom+url"></a>

### chatRoom.url() ⇒ <code>Promise.&lt;string&gt;</code>
Retrieve the weblink for the Chatroom

**Kind**: instance method of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>Promise.&lt;string&gt;</code> - Resolves to the URL web link to the chatroom  
**Access:** public  
<a name="ChatRoom+send"></a>

### chatRoom.send(content) ⇒ <code>Promise</code>
Send a message to the chatroom

**Kind**: instance method of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>Promise</code> - Resolves when message has been sent  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Message to send to the chatroom |

<a name="ChatRoom+addUsers"></a>

### chatRoom.addUsers(users) ⇒ <code>Promise</code>
Add a list of users to the chatroom

**Kind**: instance method of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>Promise</code> - Resolves when all users have been added to the chatroom  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| users | <code>User</code> &#124; <code>Array.&lt;User&gt;</code> | User or Users to add to the chatroom |

<a name="ChatRoom+removeUsers"></a>

### chatRoom.removeUsers(users) ⇒ <code>Promsie</code>
Remove a list of users from the chatroom

**Kind**: instance method of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>Promsie</code> - Resos when users have been removed from the chatroom  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| users | <code>User</code> &#124; <code>Array.&lt;User&gt;</code> | User or Users to remove from the chatroom |

<a name="ChatRoom+leave"></a>

### chatRoom.leave() ⇒ <code>Promise</code>
Leave the chatroom

This will remove current user from the chat.

**Kind**: instance method of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>Promise</code> - Resolves when chatroom has been left  
**Access:** public  
<a name="ChatRoom+rename"></a>

### chatRoom.rename(newName) ⇒ <code>Promise</code>
Rename the chat room

**Kind**: instance method of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>Promise</code> - Resolves when rename is complete  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| newName | <code>string</code> | Name to set the chatroom to |

<a name="ChatRoom.create"></a>

### ChatRoom.create(users, message, [title]) ⇒ <code>Promise</code>
Create a new chatroom, add a list of users to it and send a message.

**Kind**: static method of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>Promise</code> - Resolves once message has been sent  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| users | <code>User</code> &#124; <code>Array.&lt;User&gt;</code> | User or users to add to the chatroom |
| message | <code>string</code> | Message to send to the new chat room |
| [title] | <code>string</code> | Optional: Set the title of the chat message to this value |

<a name="ChatRoom.activate"></a>

### ChatRoom.activate()
Activate chat features. newly received chat messages will be processed

**Kind**: static method of <code>[ChatRoom](#ChatRoom)</code>  
**Access:** public  
<a name="ChatRoom.deactivate"></a>

### ChatRoom.deactivate()
Deactivate the Chat features. This will stop new chat messages from being processed

**Kind**: static method of <code>[ChatRoom](#ChatRoom)</code>  
**Access:** public  
<a name="ChatRoom.get"></a>

### ChatRoom.get(roomId) ⇒ <code>[Promise.&lt;ChatRoom&gt;](#ChatRoom)</code>
Retrieve a ChatRoom by a given ID

**Kind**: static method of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>[Promise.&lt;ChatRoom&gt;](#ChatRoom)</code> - Resolves to the chatroom requested  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| roomId | <code>number</code> | Id of the chatroom to retrieve |

<a name="ChatRoom.parse"></a>

### ChatRoom.parse(payload) ⇒ <code>[ChatRoom](#ChatRoom)</code>
Parse a Chatroom object from payload

**Kind**: static method of <code>[ChatRoom](#ChatRoom)</code>  
**Returns**: <code>[ChatRoom](#ChatRoom)</code> - Parsed Chatroom  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>string</code> &#124; <code>object</code> | ChatRoom Payload |

<a name="bindChat"></a>

## bindChat(forum) ⇒ <code>User</code>
Create a ChatRoom class and bind it to a forum instance

**Kind**: global function  
**Returns**: <code>User</code> - A ChatRoomPo class bound to the provided `forum` instance  

| Param | Type | Description |
| --- | --- | --- |
| forum | <code>Provider</code> | A forum instance to bind to constructed ChatRoom class |


* [bindChat(forum)](#bindChat) ⇒ <code>User</code>
    * [~sendChat(roomId, content)](#bindChat..sendChat) ⇒ <code>Promise</code>
    * [~retryAction(fn, trials)](#bindChat..retryAction) ⇒ <code>Promise</code>

<a name="bindChat..sendChat"></a>

### bindChat~sendChat(roomId, content) ⇒ <code>Promise</code>
Send a message to the chatroom

**Kind**: inner method of <code>[bindChat](#bindChat)</code>  
**Returns**: <code>Promise</code> - Resolves when message has been sent  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| roomId | <code>number</code> | Chatroom to speak to |
| content | <code>string</code> | Message to send to the chatroom |

<a name="bindChat..retryAction"></a>

### bindChat~retryAction(fn, trials) ⇒ <code>Promise</code>
**Kind**: inner method of <code>[bindChat](#bindChat)</code>  
**Returns**: <code>Promise</code> - Resolves when  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Promise returning function to possibly retry |
| trials | <code>number</code> | Number or times to retry |

