<a name="sockbot.providers.nodebb.module_User"></a>

## User
NodeBB provider module User class

**Author:** Accalia  
**License**: MIT  

* [User](#sockbot.providers.nodebb.module_User)
    * _static_
        * [.bindPost(forum)](#sockbot.providers.nodebb.module_User.bindPost) ⇒ <code>User</code>
    * _inner_
        * [~Post](#sockbot.providers.nodebb.module_User..Post)
            * [new Post(payload)](#new_sockbot.providers.nodebb.module_User..Post_new)
            * _instance_
                * [.authorId](#sockbot.providers.nodebb.module_User..Post+authorId) : <code>number</code>
                * [.content](#sockbot.providers.nodebb.module_User..Post+content) : <code>string</code>
                * [.posted](#sockbot.providers.nodebb.module_User..Post+posted) : <code>Date</code>
                * [.id](#sockbot.providers.nodebb.module_User..Post+id) : <code>number</code>
                * [.topicId](#sockbot.providers.nodebb.module_User..Post+topicId) : <code>number</code>
                * [.markup()](#sockbot.providers.nodebb.module_User..Post+markup) ⇒ <code>Promise.&lt;string&gt;</code>
                * [.url()](#sockbot.providers.nodebb.module_User..Post+url) ⇒ <code>Promise.&lt;string&gt;</code>
                * [.reply(content)](#sockbot.providers.nodebb.module_User..Post+reply) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.edit(newContent, [reason])](#sockbot.providers.nodebb.module_User..Post+edit) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.append(newContent, [reason])](#sockbot.providers.nodebb.module_User..Post+append) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.delete()](#sockbot.providers.nodebb.module_User..Post+delete) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.undelete()](#sockbot.providers.nodebb.module_User..Post+undelete) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.upvote()](#sockbot.providers.nodebb.module_User..Post+upvote) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.downvote()](#sockbot.providers.nodebb.module_User..Post+downvote) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.unvote()](#sockbot.providers.nodebb.module_User..Post+unvote) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.bookmark()](#sockbot.providers.nodebb.module_User..Post+bookmark) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.unbookmark()](#sockbot.providers.nodebb.module_User..Post+unbookmark) ⇒ <code>Promise.&lt;Post&gt;</code>
            * _static_
                * [.reply(topicId, postId, content)](#sockbot.providers.nodebb.module_User..Post.reply) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.get(postId)](#sockbot.providers.nodebb.module_User..Post.get) ⇒ <code>Promise.&lt;Post&gt;</code>
                * [.parse(payload)](#sockbot.providers.nodebb.module_User..Post.parse) ⇒ <code>Post</code>
                * [.preview(content)](#sockbot.providers.nodebb.module_User..Post.preview) ⇒ <code>Promise.&lt;String&gt;</code>

<a name="sockbot.providers.nodebb.module_User.bindPost"></a>

### User.bindPost(forum) ⇒ <code>User</code>
Create a Post class and bind it to a forum instance

**Kind**: static method of <code>[User](#sockbot.providers.nodebb.module_User)</code>  
**Returns**: <code>User</code> - A Post class bound to the provided `forum` instance  

| Param | Type | Description |
| --- | --- | --- |
| forum | <code>Provider</code> | A forum instance to bind to constructed Post class |

<a name="sockbot.providers.nodebb.module_User..Post"></a>

### User~Post
Post Class

Represents a forum post

**Kind**: inner class of <code>[User](#sockbot.providers.nodebb.module_User)</code>  
**Access:** public  

* [~Post](#sockbot.providers.nodebb.module_User..Post)
    * [new Post(payload)](#new_sockbot.providers.nodebb.module_User..Post_new)
    * _instance_
        * [.authorId](#sockbot.providers.nodebb.module_User..Post+authorId) : <code>number</code>
        * [.content](#sockbot.providers.nodebb.module_User..Post+content) : <code>string</code>
        * [.posted](#sockbot.providers.nodebb.module_User..Post+posted) : <code>Date</code>
        * [.id](#sockbot.providers.nodebb.module_User..Post+id) : <code>number</code>
        * [.topicId](#sockbot.providers.nodebb.module_User..Post+topicId) : <code>number</code>
        * [.markup()](#sockbot.providers.nodebb.module_User..Post+markup) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.url()](#sockbot.providers.nodebb.module_User..Post+url) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.reply(content)](#sockbot.providers.nodebb.module_User..Post+reply) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.edit(newContent, [reason])](#sockbot.providers.nodebb.module_User..Post+edit) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.append(newContent, [reason])](#sockbot.providers.nodebb.module_User..Post+append) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.delete()](#sockbot.providers.nodebb.module_User..Post+delete) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.undelete()](#sockbot.providers.nodebb.module_User..Post+undelete) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.upvote()](#sockbot.providers.nodebb.module_User..Post+upvote) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.downvote()](#sockbot.providers.nodebb.module_User..Post+downvote) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.unvote()](#sockbot.providers.nodebb.module_User..Post+unvote) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.bookmark()](#sockbot.providers.nodebb.module_User..Post+bookmark) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.unbookmark()](#sockbot.providers.nodebb.module_User..Post+unbookmark) ⇒ <code>Promise.&lt;Post&gt;</code>
    * _static_
        * [.reply(topicId, postId, content)](#sockbot.providers.nodebb.module_User..Post.reply) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.get(postId)](#sockbot.providers.nodebb.module_User..Post.get) ⇒ <code>Promise.&lt;Post&gt;</code>
        * [.parse(payload)](#sockbot.providers.nodebb.module_User..Post.parse) ⇒ <code>Post</code>
        * [.preview(content)](#sockbot.providers.nodebb.module_User..Post.preview) ⇒ <code>Promise.&lt;String&gt;</code>

<a name="new_sockbot.providers.nodebb.module_User..Post_new"></a>

#### new Post(payload)
Construct a Post object from payload

This constructor is intended to be private use only, if you need to construct a post from payload data use
`User.parse()` instead


| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | Payload to construct the Post object out of |

<a name="sockbot.providers.nodebb.module_User..Post+authorId"></a>

#### post.authorId : <code>number</code>
ID of the post author

**Kind**: instance property of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_User..Post+content"></a>

#### post.content : <code>string</code>
Raw content of the post, before any HTML transformation has been applied

**Kind**: instance property of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_User..Post+posted"></a>

#### post.posted : <code>Date</code>
DateTime that the post was posted

**Kind**: instance property of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_User..Post+id"></a>

#### post.id : <code>number</code>
ID of the post

**Kind**: instance property of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_User..Post+topicId"></a>

#### post.topicId : <code>number</code>
ID of the topic that contains this post

**Kind**: instance property of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_User..Post+markup"></a>

#### post.markup() ⇒ <code>Promise.&lt;string&gt;</code>
Retrieve the HTML representation of the raw content of the post

**Kind**: instance method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;string&gt;</code> - Resolves to the HTML markup for the post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>string</code> The HTML markup for this post  
**Reject**: <code>Error</code> An Error that occured while deleting  
<a name="sockbot.providers.nodebb.module_User..Post+url"></a>

#### post.url() ⇒ <code>Promise.&lt;string&gt;</code>
Retrieve the direct URL for this post

**Kind**: instance method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;string&gt;</code> - Resolves to the web URL for this post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>string</code> The web URL for this post  
**Reject**: <code>Error</code> An Error that occured while retreiving post URL  
<a name="sockbot.providers.nodebb.module_User..Post+reply"></a>

#### post.reply(content) ⇒ <code>Promise.&lt;Post&gt;</code>
Reply to this post with the given content

**Kind**: instance method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the newly created Post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Post</code> The newly created Post  
**Reject**: <code>Error</code> An Error that occured while posting  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Post content |

<a name="sockbot.providers.nodebb.module_User..Post+edit"></a>

#### post.edit(newContent, [reason]) ⇒ <code>Promise.&lt;Post&gt;</code>
Edit this post to contain new content

**Kind**: instance method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the edited Post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Post</code> The edited Post  
**Reject**: <code>Error</code> An Error that occured while editing  

| Param | Type | Description |
| --- | --- | --- |
| newContent | <code>string</code> | New post content |
| [reason] | <code>string</code> | Post edit reason |

<a name="sockbot.providers.nodebb.module_User..Post+append"></a>

#### post.append(newContent, [reason]) ⇒ <code>Promise.&lt;Post&gt;</code>
Append new content to this post

**Kind**: instance method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the edited post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Post</code> The edited Post  
**Reject**: <code>Error</code> An Error that occured while editing  

| Param | Type | Description |
| --- | --- | --- |
| newContent | <code>string</code> | New post content |
| [reason] | <code>string</code> | Post edit reason |

<a name="sockbot.providers.nodebb.module_User..Post+delete"></a>

#### post.delete() ⇒ <code>Promise.&lt;Post&gt;</code>
Delete this post

**Kind**: instance method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the deleted post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Post</code> The deleted Post  
**Reject**: <code>Error</code> An Error that occured while deleting  
<a name="sockbot.providers.nodebb.module_User..Post+undelete"></a>

#### post.undelete() ⇒ <code>Promise.&lt;Post&gt;</code>
Undelete this post

**Kind**: instance method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the undeleted post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Post</code> The undeleted Post  
**Reject**: <code>Error</code> An Error that occured while deleting  
<a name="sockbot.providers.nodebb.module_User..Post+upvote"></a>

#### post.upvote() ⇒ <code>Promise.&lt;Post&gt;</code>
Upvote this post

**Kind**: instance method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the upvoted post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Post</code> The upvoted Post  
**Reject**: <code>Error</code> An Error that occured while upvoting  
<a name="sockbot.providers.nodebb.module_User..Post+downvote"></a>

#### post.downvote() ⇒ <code>Promise.&lt;Post&gt;</code>
Downvote this post

**Kind**: instance method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the downvoted post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Post</code> The downvoted Post  
**Reject**: <code>Error</code> An Error that occured while downvoting  
<a name="sockbot.providers.nodebb.module_User..Post+unvote"></a>

#### post.unvote() ⇒ <code>Promise.&lt;Post&gt;</code>
Unvote this post

**Kind**: instance method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the unvoted post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Post</code> The unvoted Post  
**Reject**: <code>Error</code> An Error that occured while downvoting  
<a name="sockbot.providers.nodebb.module_User..Post+bookmark"></a>

#### post.bookmark() ⇒ <code>Promise.&lt;Post&gt;</code>
Bookmark this post

**Kind**: instance method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the bookmarked post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Post</code> The bookmarked post  
**Reject**: <code>Error</code> An Error that occured while bookmarking  
<a name="sockbot.providers.nodebb.module_User..Post+unbookmark"></a>

#### post.unbookmark() ⇒ <code>Promise.&lt;Post&gt;</code>
Remove a bookmark from this post

**Kind**: instance method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the unbookmarked post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Post</code> The unbookmarked post  
**Reject**: <code>Error</code> An Error that occured while unbookmarking  
<a name="sockbot.providers.nodebb.module_User..Post.reply"></a>

#### Post.reply(topicId, postId, content) ⇒ <code>Promise.&lt;Post&gt;</code>
Post a reply to a post with the given content

**Kind**: static method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the newly created Post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Post</code> The newly created Post  
**Reject**: <code>Error</code> An Error that occured while posting  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>string</code> | Topic Id to reply to |
| postId | <code>string</code> | Post Id to reply to |
| content | <code>string</code> | Post content |

<a name="sockbot.providers.nodebb.module_User..Post.get"></a>

#### Post.get(postId) ⇒ <code>Promise.&lt;Post&gt;</code>
Retrieve a post identified by postId

**Kind**: static method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;Post&gt;</code> - Resolves to the retrieved post  
**Access:** public  
**Promise**:   
**Fulfill**: <code>Post</code> The retrieved Post  
**Reject**: <code>Error</code> An Error that occured retrieving the post  

| Param | Type | Description |
| --- | --- | --- |
| postId | <code>\*</code> | Forum specific post id to retrieve |

<a name="sockbot.providers.nodebb.module_User..Post.parse"></a>

#### Post.parse(payload) ⇒ <code>Post</code>
Construct a post object from a previously retrieved payload

**Kind**: static method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Post</code> - the deserialized Post object  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | Serialized post representation retrieved from forum |

<a name="sockbot.providers.nodebb.module_User..Post.preview"></a>

#### Post.preview(content) ⇒ <code>Promise.&lt;String&gt;</code>
Render the content to HTML as it would be rendered for a post

**Kind**: static method of <code>[Post](#sockbot.providers.nodebb.module_User..Post)</code>  
**Returns**: <code>Promise.&lt;String&gt;</code> - Resolves to the rendered HTML  
**Access:** public  
**Promise**:   
**Fulfill**: <code>string</code> Rendered HTML for `content`  
**Reject**: <code>Error</code> Any error that occurred rendering HTML for `content`  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Content to render HTML PReview for |

