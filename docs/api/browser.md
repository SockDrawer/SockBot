<a name="module_browser"></a>
## browser
Webbrowser abstraction for communicating with discourse

**License**: MIT  

* [browser](#module_browser)
  * [~rQuote](#module_browser..rQuote)
  * [~queueWorker(task, callback)](#module_browser..queueWorker)
  * [~stripQuotes(input)](#module_browser..stripQuotes) ⇒ <code>string</code>
  * [~stripCode(input)](#module_browser..stripCode) ⇒ <code>string</code>
  * [~cleanPost(post)](#module_browser..cleanPost) ⇒ <code>external.module_posts.CleanedPost</code>
  * [~requestComplete([err], body)](#module_browser..requestComplete)

<a name="module_browser..rQuote"></a>
### browser~rQuote
BBcode Quote Tag Parsing/Stripping Regexp

Contributed by Flabdablet

A BBCode quote tag is like
    [quote]
or
    [quote=anything-that-isn't-a-closing-bracket]

and the regex uses (=[^\]]*)? to deal with the difference. The section that matches the closing tag \[\/quote] is
straightforward.

The regex is supposed to match only the innermost of any nested BBCode quotes, so between the matching parts for
opening and closing tags, it matches only text that doesn't contain the sequence [quote= or [quote].

This is done by a *? lazy-repeat match on

(        a group containing

[^\[]    anything that isn't a [
|        or
    (        a group containing
    \[       an opening square bracket followed by
    [^q]     anything that isn't a q
    |        or
        (        a group containing
        q        a q followed by
        [^u]     anything that isn't a u
...

The net effect is to match on text made of chunks that can be [quote as long as that isn't part of [quote= or
[quote], or [quot that isn't part of [quote, or [quo that isn't part of [quot, and so on all the way back to single
characters that aren't [.

And just for icing on the line noise cake, all groups are specified as non-capturing (?: for speed.

**Kind**: inner constant of <code>[browser](#module_browser)</code>  
<a name="module_browser..queueWorker"></a>
### browser~queueWorker(task, callback)
Process browser tasks with rate limiting

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| task | <code>object</code> |  | Task configuration |
| [task.method] | <code>string</code> | <code>&quot;GET&quot;</code> | HTTP method to request |
| task.url | <code>string</code> |  | Site relative URL to request |
| [task.form] | <code>object</code> |  | HTTP form to use in HTTP request |
| [task.callback] | <code>browser~requestComplete</code> |  | Callback toprovide request results to |
| [task.delay] | <code>Number</code> | <code>0</code> | Seconds to delay callback after request for additional rate limiting |
| callback | <code>function</code> |  | Queue task complete callback |

<a name="module_browser..stripQuotes"></a>
### browser~stripQuotes(input) ⇒ <code>string</code>
Strip [quote] tags from input

**Kind**: inner method of <code>[browser](#module_browser)</code>  
**Returns**: <code>string</code> - Input after stripping [quote] tags  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | Input string to strip |

<a name="module_browser..stripCode"></a>
### browser~stripCode(input) ⇒ <code>string</code>
Strip GFM fenced code blocks from input

**Kind**: inner method of <code>[browser](#module_browser)</code>  
**Returns**: <code>string</code> - Input after stripping GFM code blocks tags  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | Input string to strip |

<a name="module_browser..cleanPost"></a>
### browser~cleanPost(post) ⇒ <code>external.module_posts.CleanedPost</code>
Clean post raw

**Kind**: inner method of <code>[browser](#module_browser)</code>  
**Returns**: <code>external.module_posts.CleanedPost</code> - input post with cleaned raw  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>external.module_posts.Post</code> | Post to clean |
| post.raw | <code>string</code> | Raw text of the post to clean |

<a name="module_browser..requestComplete"></a>
### browser~requestComplete([err], body)
Browser Request Callback

**Kind**: inner method of <code>[browser](#module_browser)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Exception</code> | <code></code> | Error encountered processing request |
| body | <code>Object</code> |  | JSON parsed response body. If invalid JSON will be `undefined` |

