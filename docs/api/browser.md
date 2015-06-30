<a name="module_browser"></a>
## browser
Webbrowser abstraction for communicating with discourse

**License**: MIT  

* [browser](#module_browser)
  * [~trustLevels](#module_browser..trustLevels)
  * [~queueWorker(task, callback)](#module_browser..queueWorker)
  * [~setTrustLevel(post)](#module_browser..setTrustLevel) ⇒ <code>external.module_posts.Post</code>
  * [~cleanPostRaw(post)](#module_browser..cleanPostRaw) ⇒ <code>external.module_posts.CleanedPost</code>
  * [~requestComplete([err], body)](#module_browser..requestComplete)

<a name="module_browser..trustLevels"></a>
### browser~trustLevels
SockBot Virtual Trust Levels

**Kind**: inner constant of <code>[browser](#module_browser)</code>  
**Read only**: true  
**Properties**

| Name | Default | Description |
| --- | --- | --- |
| owner | <code>9</code> | Bot Owner Trust Level |
| admin | <code>8</code> | Forum Admin Trust Level |
| moderator | <code>7</code> | Forum Moderator Trust Level |
| staff | <code>6</code> | Forum Staff Trust Level |
| tl4 | <code>4</code> | Discourst trust_level 4 Trust Level |
| tl3 | <code>3</code> | Discourst trust_level 3 Trust Level |
| tl2 | <code>2</code> | Discourst trust_level 2 Trust Level |
| tl1 | <code>1</code> | Discourst trust_level 1 Trust Level |
| tl0 | <code>0</code> | Discourst trust_level 0 Trust Level |
| ignored | <code>0</code> | Ignored User Trust Level |

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

<a name="module_browser..setTrustLevel"></a>
### browser~setTrustLevel(post) ⇒ <code>external.module_posts.Post</code>
Normalize discourse trust level to SockBot Virtual Trust Level

**Kind**: inner method of <code>[browser](#module_browser)</code>  
**Returns**: <code>external.module_posts.Post</code> - input post with normalized trust_level  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>external.module_posts.Post</code> | Post to normalize trust levels on |
| post.username | <code>string</code> | Username of the post owner |
| post.trust_level | <code>Number</code> | Trust level of the post owner |
| post.moderator | <code>boolean</code> | Flags whether post owner has moderator powers |
| post.admin | <code>boolean</code> | Flags whether post owner has admin powers |
| post.staff | <code>boolean</code> | Flags whether post owner has staff powers |

<a name="module_browser..cleanPostRaw"></a>
### browser~cleanPostRaw(post) ⇒ <code>external.module_posts.CleanedPost</code>
Clean post raw

Provided and commented by flabdablet

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

