<a name="Post"></a>
## Post
**Kind**: global class  

* [Post](#Post)
    * [new Post(payload)](#new_Post_new)
    * _instance_
        * [.authorId](#Post+authorId) : <code>\*</code>
        * [.raw](#Post+raw) : <code>string</code>
        * [.cleaned](#Post+cleaned) : <code>string</code>
        * [.posted](#Post+posted) : <code>Date</code>
        * [.id](#Post+id) : <code>\*</code>
        * [.topicId](#Post+topicId) : <code>\*</code>
        * [.url()](#Post+url) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.reply(content)](#Post+reply) ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
        * [.edit(newContent, [reason])](#Post+edit) ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
        * [.append(newContent, [reason])](#Post+append) ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
        * [.delete()](#Post+delete) ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
        * [.upvote()](#Post+upvote) ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
        * [.downvote()](#Post+downvote) ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
        * [.bookmark()](#Post+bookmark) ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
        * [.unbookmark()](#Post+unbookmark) ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
    * _static_
        * [.get(postId)](#Post.get) ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
        * [.parse(payload)](#Post.parse) ⇒ <code>[Post](#Post)</code>

<a name="new_Post_new"></a>
### new Post(payload)
Construct a post object from a previously retrieved payload

**Returns**: <code>[Post](#Post)</code> - the deserialized Post object  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | Serialized post representation retrieved from forum |

<a name="Post+authorId"></a>
### post.authorId : <code>\*</code>
authorId

Forum specific ID for post author

**Kind**: instance property of <code>[Post](#Post)</code>  
<a name="Post+raw"></a>
### post.raw : <code>string</code>
Raw content of the post, before any HTML transformation has been applied

**Kind**: instance property of <code>[Post](#Post)</code>  
<a name="Post+cleaned"></a>
### post.cleaned : <code>string</code>
Cleaned content of the post, removing quotes and code blocks from the raw content. suitible for parsing for bots
of all ages.

**Kind**: instance property of <code>[Post](#Post)</code>  
<a name="Post+posted"></a>
### post.posted : <code>Date</code>
DateTime that the post was posted

**Kind**: instance property of <code>[Post](#Post)</code>  
<a name="Post+id"></a>
### post.id : <code>\*</code>
Forum specific ID for post

**Kind**: instance property of <code>[Post](#Post)</code>  
<a name="Post+topicId"></a>
### post.topicId : <code>\*</code>
Forum specific ID for topic that contains this post

**Kind**: instance property of <code>[Post](#Post)</code>  
<a name="Post+url"></a>
### post.url() ⇒ <code>Promise.&lt;string&gt;</code>
Retrieve the direct URL for this post

**Kind**: instance method of <code>[Post](#Post)</code>  
**Promise**:   
**Fulfill**: <code>string</code> The web URL for this post  
**Reject**: <code>Error</code> An Error that occured while retreiving post URL  
<a name="Post+reply"></a>
### post.reply(content) ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
Reply to this post with the given content

**Kind**: instance method of <code>[Post](#Post)</code>  
**Promise**:   
**Fulfill**: <code>[Post](#Post)</code> The newly created Post  
**Reject**: <code>Error</code> An Error that occured while posting  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Post content |

<a name="Post+edit"></a>
### post.edit(newContent, [reason]) ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
Edit this post to contain new content

**Kind**: instance method of <code>[Post](#Post)</code>  
**Promise**:   
**Fulfill**: <code>[Post](#Post)</code> The edited Post  
**Reject**: <code>Error</code> An Error that occured while editing  

| Param | Type | Description |
| --- | --- | --- |
| newContent | <code>string</code> | New post content |
| [reason] | <code>string</code> | Post edit reason |

<a name="Post+append"></a>
### post.append(newContent, [reason]) ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
Append new content to this post

**Kind**: instance method of <code>[Post](#Post)</code>  
**Promise**:   
**Fulfill**: <code>[Post](#Post)</code> The edited Post  
**Reject**: <code>Error</code> An Error that occured while editing  

| Param | Type | Description |
| --- | --- | --- |
| newContent | <code>string</code> | New post content |
| [reason] | <code>string</code> | Post edit reason |

<a name="Post+delete"></a>
### post.delete() ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
Delete this post

**Kind**: instance method of <code>[Post](#Post)</code>  
**Promise**:   
**Fulfill**: <code>[Post](#Post)</code> The deleted Post  
**Reject**: <code>Error</code> An Error that occured while deleting  
<a name="Post+upvote"></a>
### post.upvote() ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
Upvote this post

**Kind**: instance method of <code>[Post](#Post)</code>  
**Promise**:   
**Fulfill**: <code>[Post](#Post)</code> The upvoted Post  
**Reject**: <code>Error</code> An Error that occured while upvoting  
<a name="Post+downvote"></a>
### post.downvote() ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
Downvote this post

**Kind**: instance method of <code>[Post](#Post)</code>  
**Promise**:   
**Fulfill**: <code>[Post](#Post)</code> The downvoted Post  
**Reject**: <code>Error</code> An Error that occured while downvoting  
<a name="Post+bookmark"></a>
### post.bookmark() ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
Bookmark this post

**Kind**: instance method of <code>[Post](#Post)</code>  
**Promise**:   
**Fulfill**: <code>[Post](#Post)</code> The bookmarked post  
**Reject**: <code>Error</code> An Error that occured while bookmarking  
<a name="Post+unbookmark"></a>
### post.unbookmark() ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
Remove a bookmark from this post

**Kind**: instance method of <code>[Post](#Post)</code>  
**Promise**:   
**Fulfill**: <code>[Post](#Post)</code> The unbookmarked post  
**Reject**: <code>Error</code> An Error that occured while unbookmarking  
<a name="Post.get"></a>
### Post.get(postId) ⇒ <code>[Promise.&lt;Post&gt;](#Post)</code>
Retrieve a post identified by postId

**Kind**: static method of <code>[Post](#Post)</code>  
**Promise**:   
**Fulfill**: <code>[Post](#Post)</code> The retrieved Post  
**Reject**: <code>Error</code> An Error that occured retrieving the post  

| Param | Type | Description |
| --- | --- | --- |
| postId | <code>\*</code> | Forum specific post id to retrieve |

<a name="Post.parse"></a>
### Post.parse(payload) ⇒ <code>[Post](#Post)</code>
Construct a post object from a previously retrieved payload

**Kind**: static method of <code>[Post](#Post)</code>  
**Returns**: <code>[Post](#Post)</code> - the deserialized Post object  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | Serialized post representation retrieved from forum |

