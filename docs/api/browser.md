<a name="module_browser"></a>
## browser
Webbrowser abstraction for communicating with discourse

**License**: MIT  

* [browser](#module_browser)
  * [~queueWorker(task, callback)](#module_browser..queueWorker)
  * [~cleanPostRaw(post)](#module_browser..cleanPostRaw) ⇒ <code>external.module_posts.CleanedPost</code>
  * [~requestComplete([err], body)](#module_browser..requestComplete)

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

