<a name="module_utils"></a>

## utils
Core Utilities for Sockbot

**License**: MIT  

* [utils](#module_utils)
    * _static_
        * [.logExtended(level, message, [data])](#module_utils.logExtended)
        * [.cloneData(original)](#module_utils.cloneData) ⇒ <code>\*</code>
        * [.mergeObjects([mergeArrays], ...mixin)](#module_utils.mergeObjects) ⇒ <code>object</code>
        * [.mapGet(obj, [key])](#module_utils.mapGet) ⇒ <code>\*</code>
        * [.mapSet(obj, key, [value])](#module_utils.mapSet)
        * [.parseJSON(json)](#module_utils.parseJSON) ⇒ <code>object</code>
    * _inner_
        * [~mergeInner(base, mixin, [mergeArrays])](#module_utils..mergeInner)
        * [~mergeHelper(base, mixin, name, [mergeArrays])](#module_utils..mergeHelper)

<a name="module_utils.logExtended"></a>

### utils.logExtended(level, message, [data])
Write an extended log entry

**Kind**: static method of <code>[utils](#module_utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| level | <code>number</code> | Log Level |
| message | <code>string</code> | Log Message |
| [data] | <code>\*</code> | Optional extended log data |

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

<a name="module_utils.mapGet"></a>

### utils.mapGet(obj, [key]) ⇒ <code>\*</code>
Get value from WeakMap store

**Kind**: static method of <code>[utils](#module_utils)</code>  
**Returns**: <code>\*</code> - Stored value  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>\*</code> | Object key for weakmap store |
| [key] | <code>string</code> | Object key to retrieve from stored value |

<a name="module_utils.mapSet"></a>

### utils.mapSet(obj, key, [value])
Store values in weakmap store

If `value` is omitted `key` is stored instead

**Kind**: static method of <code>[utils](#module_utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>\*</code> | Object key for weakmap store |
| key | <code>string</code> &#124; <code>\*</code> | Key to store value under or value object to store |
| [value] | <code>\*</code> | Value to store for `key` |

<a name="module_utils.parseJSON"></a>

### utils.parseJSON(json) ⇒ <code>object</code>
Parse JSON data to object

**Kind**: static method of <code>[utils](#module_utils)</code>  
**Returns**: <code>object</code> - Parsed object  

| Param | Type | Description |
| --- | --- | --- |
| json | <code>string</code> &#124; <code>object</code> | stringified object to parse |

<a name="module_utils..mergeInner"></a>

### utils~mergeInner(base, mixin, [mergeArrays])
Recursively merge objects

**Kind**: inner method of <code>[utils](#module_utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| base | <code>object</code> | Base object to merge `mixin` into |
| mixin | <code>object</code> | Mixin object to merge into `base` |
| [mergeArrays] | <code>boolean</code> | Merge arrays instead of concatenating them |

<a name="module_utils..mergeHelper"></a>

### utils~mergeHelper(base, mixin, name, [mergeArrays])
Merge helper - FOR INTERNAL USE ONLY

**Kind**: inner method of <code>[utils](#module_utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| base | <code>object</code> | Base object to merge `mixin` into |
| mixin | <code>object</code> | Mixin object to merge into `base` |
| name | <code>string</code> | Name of property to merge |
| [mergeArrays] | <code>boolean</code> | Merge arrays instead of concatenating them |

