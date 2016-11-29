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
<dt><a href="#link">link(url, linkText)</a> ⇒ <code>string</code></dt>
<dd><p>Generate a hyperlink</p>
</dd>
<dt><a href="#image">image(url, titleText)</a> ⇒ <code>string</code></dt>
<dd><p>Generate an image</p>
</dd>
<dt><a href="#spoiler">spoiler(body, title)</a> ⇒ <code>string</code></dt>
<dd><p>Spoiler something</p>
</dd>
<dt><a href="#bold">bold(text)</a> ⇒ <code>string</code></dt>
<dd><p>Format text as bold.</p>
</dd>
<dt><a href="#italic">italic(text)</a> ⇒ <code>string</code></dt>
<dd><p>Format text as italic.</p>
</dd>
<dt><a href="#bolditalic">bolditalic(text)</a> ⇒ <code>string</code></dt>
<dd><p>Format text as bold italic.</p>
</dd>
<dt><a href="#header1">header1(text)</a> ⇒ <code>string</code></dt>
<dd><p>Format text as a first level header.</p>
</dd>
<dt><a href="#header2">header2(text)</a> ⇒ <code>string</code></dt>
<dd><p>Format text as a second level header.</p>
</dd>
<dt><a href="#header3">header3(text)</a> ⇒ <code>string</code></dt>
<dd><p>Format text as a third level header.</p>
</dd>
<dt><a href="#header4">header4(text)</a> ⇒ <code>string</code></dt>
<dd><p>Format text as a fourth level header.</p>
</dd>
<dt><a href="#header5">header5(text)</a> ⇒ <code>string</code></dt>
<dd><p>Format text as a fifth level header.</p>
</dd>
<dt><a href="#header6">header6(text)</a> ⇒ <code>string</code></dt>
<dd><p>Format text as a sixth level header.</p>
</dd>
<dt><a href="#preformat">preformat(text)</a> ⇒ <code>string</code></dt>
<dd><p>Format text as a preformatted block</p>
</dd>
<dt><a href="#strikethrough">strikethrough(text)</a> ⇒ <code>string</code></dt>
<dd><p>Format text with a strikethrough effect</p>
</dd>
<dt><a href="#list">list(items)</a> ⇒ <code>string</code></dt>
<dd><p>Format text as a list of items</p>
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

<a name="link"></a>

## link(url, linkText) ⇒ <code>string</code>
Generate a hyperlink

**Kind**: global function  
**Returns**: <code>string</code> - Linkified url  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | URL to link to |
| linkText | <code>string</code> | Link Text to display |

<a name="image"></a>

## image(url, titleText) ⇒ <code>string</code>
Generate an image

**Kind**: global function  
**Returns**: <code>string</code> - Image incantation  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Image URL |
| titleText | <code>string</code> | Title text to display |

<a name="spoiler"></a>

## spoiler(body, title) ⇒ <code>string</code>
Spoiler something

**Kind**: global function  
**Returns**: <code>string</code> - spoilered text  

| Param | Type | Description |
| --- | --- | --- |
| body | <code>string</code> | Spoiler body |
| title | <code>string</code> | spoiler title to display |

<a name="bold"></a>

## bold(text) ⇒ <code>string</code>
Format text as bold.

**Kind**: global function  
**Returns**: <code>string</code> - Bolded Text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Input text |

<a name="italic"></a>

## italic(text) ⇒ <code>string</code>
Format text as italic.

**Kind**: global function  
**Returns**: <code>string</code> - Italiced Text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Input text |

<a name="bolditalic"></a>

## bolditalic(text) ⇒ <code>string</code>
Format text as bold italic.

**Kind**: global function  
**Returns**: <code>string</code> - Bolded and italiced Text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Input text |

<a name="header1"></a>

## header1(text) ⇒ <code>string</code>
Format text as a first level header.

**Kind**: global function  
**Returns**: <code>string</code> - Headered Text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Header text |

<a name="header2"></a>

## header2(text) ⇒ <code>string</code>
Format text as a second level header.

**Kind**: global function  
**Returns**: <code>string</code> - Headered Text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Header text |

<a name="header3"></a>

## header3(text) ⇒ <code>string</code>
Format text as a third level header.

**Kind**: global function  
**Returns**: <code>string</code> - Headered Text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Header text |

<a name="header4"></a>

## header4(text) ⇒ <code>string</code>
Format text as a fourth level header.

**Kind**: global function  
**Returns**: <code>string</code> - Headered Text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Header text |

<a name="header5"></a>

## header5(text) ⇒ <code>string</code>
Format text as a fifth level header.

**Kind**: global function  
**Returns**: <code>string</code> - Headered Text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Header text |

<a name="header6"></a>

## header6(text) ⇒ <code>string</code>
Format text as a sixth level header.

**Kind**: global function  
**Returns**: <code>string</code> - Headered Text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Header text |

<a name="preformat"></a>

## preformat(text) ⇒ <code>string</code>
Format text as a preformatted block

**Kind**: global function  
**Returns**: <code>string</code> - Text in a preformat block  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text |

<a name="strikethrough"></a>

## strikethrough(text) ⇒ <code>string</code>
Format text with a strikethrough effect

**Kind**: global function  
**Returns**: <code>string</code> - The stricken text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text to strike out |

<a name="list"></a>

## list(items) ⇒ <code>string</code>
Format text as a list of items

**Kind**: global function  
**Returns**: <code>string</code> - The list  

| Param | Type | Description |
| --- | --- | --- |
| items | <code>string</code> | An array of strings to format as a list |

