<a name="module_utils"></a>
## utils
Core Utilities for Sockbot

**License**: MIT  

* [utils](#module_utils)
    * _static_
        * [.uuid()](#module_utils.uuid) ⇒ <code>string</code>
        * [.log(message)](#module_utils.log)
        * [.warn(message)](#module_utils.warn)
        * [.error(message)](#module_utils.error)
        * [.cloneData(original)](#module_utils.cloneData) ⇒ <code>\*</code>
        * [.mergeObjects([mergeArrays], ...mixin)](#module_utils.mergeObjects) ⇒ <code>object</code>
        * [.filterIgnoredOnPost(post, callback)](#module_utils.filterIgnoredOnPost) ⇒ <code>null</code>
        * [.filterIgnoredOnTopic(topic, callback)](#module_utils.filterIgnoredOnTopic) ⇒ <code>null</code>
        * [.filterIgnored(topic, post, callback)](#module_utils.filterIgnored)
    * _inner_
        * [~addTimestamp(message)](#module_utils..addTimestamp) ⇒ <code>string</code>
        * [~mergeInner(base, mixin, [mergeArrays])](#module_utils..mergeInner)

<a name="module_utils.uuid"></a>
### utils.uuid() ⇒ <code>string</code>
Generate a "good enough" Type 4 UUID.

Not cryptographically secure, not pretty, not fast, but since we only need a couple of these it's good enough

**Kind**: static method of <code>[utils](#module_utils)</code>  
**Returns**: <code>string</code> - a "type 4 UUID"  
<a name="module_utils.log"></a>
### utils.log(message)
Log a message to the console

**Kind**: static method of <code>[utils](#module_utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>\*</code> | Message to log |

<a name="module_utils.warn"></a>
### utils.warn(message)
Log a warning to the console

**Kind**: static method of <code>[utils](#module_utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>\*</code> | Warning to log |

<a name="module_utils.error"></a>
### utils.error(message)
Log an error to the console

**Kind**: static method of <code>[utils](#module_utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>\*</code> | Error to log |

<a name="module_utils.cloneData"></a>
### utils.cloneData(original) ⇒ <code>\*</code>
Clone object

**Kind**: static method of <code>[utils](#module_utils)</code>  
**Returns**: <code>\*</code> - Cloned `original` data  

| Param | Type | Description |
| --- | --- | --- |
| original | <code>\*</code> | Data to clone |

<a name="module_utils.mergeObjects"></a>
### utils.mergeObjects([mergeArrays], ...mixin) ⇒ <code>object</code>
Merge multiple objects into one object

Later objects override earlier objects

**Kind**: static method of <code>[utils](#module_utils)</code>  
**Returns**: <code>object</code> - object constructed by merging `mixin`s from left to right  

| Param | Type | Description |
| --- | --- | --- |
| [mergeArrays] | <code>boolean</code> | Merge arrays instead of concatenating them |
| ...mixin | <code>object</code> | Objects to merge |

<a name="module_utils.filterIgnoredOnPost"></a>
### utils.filterIgnoredOnPost(post, callback) ⇒ <code>null</code>
Proccess post for ignore contitions

**Kind**: static method of <code>[utils](#module_utils)</code>  
**Returns**: <code>null</code> - No return value  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>externals.posts.CleanedPost</code> | Post to filter |
| callback | <code>filterCallback</code> | Completion Callback |

<a name="module_utils.filterIgnoredOnTopic"></a>
### utils.filterIgnoredOnTopic(topic, callback) ⇒ <code>null</code>
Proccess topic for ignore contitions

**Kind**: static method of <code>[utils](#module_utils)</code>  
**Returns**: <code>null</code> - No return value  

| Param | Type | Description |
| --- | --- | --- |
| topic | <code>externals.topics.Topic</code> | Topic to filter |
| callback | <code>filterCallback</code> | Completion Callback |

<a name="module_utils.filterIgnored"></a>
### utils.filterIgnored(topic, post, callback)
Filter post/topic for ignore conditions

**Kind**: static method of <code>[utils](#module_utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| topic | <code>externals.topics.Topic</code> | Topic to filter |
| post | <code>externals.posts.CleanedPost</code> | Post to filter |
| callback | <code>completionCallback</code> | Completion Callback |

<a name="module_utils..addTimestamp"></a>
### utils~addTimestamp(message) ⇒ <code>string</code>
Add timestamp to message.

**Kind**: inner method of <code>[utils](#module_utils)</code>  
**Returns**: <code>string</code> - timestamped input message  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>\*</code> | Message to timestamp |

<a name="module_utils..mergeInner"></a>
### utils~mergeInner(base, mixin, [mergeArrays])
Recursively merge objects

**Kind**: inner method of <code>[utils](#module_utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| base | <code>object</code> | Base object to merge `mixin` into |
| mixin | <code>object</code> | Mixin object to merge into `base` |
| [mergeArrays] | <code>boolean</code> | Merge arrays instead of concatenating them |

