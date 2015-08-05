<a name="classes.module_PostBuffer"></a>
## PostBuffer
Data structure to manage post merging to prevent spamming

**License**: MIT  

* [PostBuffer](#classes.module_PostBuffer)
  * [~PostBuffer(delay, callback)](#classes.module_PostBuffer..PostBuffer)
    * [.add](#classes.module_PostBuffer..PostBuffer+add)
  * [~postBufferCallback](#classes.module_PostBuffer..postBufferCallback)

<a name="classes.module_PostBuffer..PostBuffer"></a>
### PostBuffer~PostBuffer(delay, callback)
Create a new PostBuffer

**Kind**: inner method of <code>[PostBuffer](#classes.module_PostBuffer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| delay | <code>number</code> | Buffering time before posting |
| callback | <code>postBufferCallback</code> | Buffer delay expiry callback |

<a name="classes.module_PostBuffer..PostBuffer+add"></a>
#### postBuffer.add
Add details of a post to buffer

**Kind**: instance property of <code>[PostBuffer](#classes.module_PostBuffer..PostBuffer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>number</code> | Topic to post to |
| [replyTo] | <code>number</code> | Post Number in topic that this post is in reply to |
| content | <code>string</code> | Post Contents to post |
| callback | <code>postedCallback</code> | Completion callback |

<a name="classes.module_PostBuffer..postBufferCallback"></a>
### PostBuffer~postBufferCallback
PostBuffer Callback

**Kind**: inner typedef of <code>[PostBuffer](#classes.module_PostBuffer)</code>  
**See**: [`add`](#classes.module_PostBuffer..PostBuffer+add) for more information about the members of key and values  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>Object</code> | Contains the members `topicId` and `replyTo` |
| values | <code>Object</code> | Array of objects with the members `content` and `callback` |

