## Functions

<dl>
<dt><a href="#urlForPost">urlForPost(postId)</a> ⇒ <code>string</code></dt>
<dd><p>Generate a permalink for a post</p>
</dd>
<dt><a href="#urlForTopic">urlForTopic(topicId, [topicSlug], [postIndex])</a> ⇒ <code>string</code></dt>
<dd><p>Generate a link for a topic</p>
</dd>
<dt><a href="#quoteText">quoteText(text, [quotedUser], [contextUrl], [contextTitle])</a> ⇒ <code>string</code></dt>
<dd><p>Turn input text into a forum quote</p>
</dd>
</dl>

<a name="urlForPost"></a>

## urlForPost(postId) ⇒ <code>string</code>
Generate a permalink for a post

**Kind**: global function  
**Returns**: <code>string</code> - Absolute URL for post  

| Param | Type | Description |
| --- | --- | --- |
| postId | <code>number</code> | Id or the post to url |

<a name="urlForTopic"></a>

## urlForTopic(topicId, [topicSlug], [postIndex]) ⇒ <code>string</code>
Generate a link for a topic

**Kind**: global function  
**Returns**: <code>string</code> - Absolute URL for topic  

| Param | Type | Description |
| --- | --- | --- |
| topicId | <code>number</code> | Id of the topic to url |
| [topicSlug] | <code>string</code> | Slug of the topic to url |
| [postIndex] | <code>number</code> | Index of the post to url to in topic |

<a name="quoteText"></a>

## quoteText(text, [quotedUser], [contextUrl], [contextTitle]) ⇒ <code>string</code>
Turn input text into a forum quote

**Kind**: global function  
**Returns**: <code>string</code> - quoted text, with attribution if username provided  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Text to quote |
| [quotedUser] | <code>string</code> | User who said the quote |
| [contextUrl] | <code>string</code> | Url to the quoted post |
| [contextTitle] | <code>string</code> | Title of the quote context link |

