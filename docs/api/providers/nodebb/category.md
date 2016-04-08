<a name="sockbot.providers.nodebb.module_Category"></a>

## Category
NodeBB provider module Category class

**Author:** Accalia  
**License**: MIT  

* [Category](#sockbot.providers.nodebb.module_Category)
    * _static_
        * [.bindCategory(forum)](#sockbot.providers.nodebb.module_Category.bindCategory) ⇒ <code>Category</code>
    * _inner_
        * [~Category](#sockbot.providers.nodebb.module_Category..Category)
            * [new Category(payload)](#new_sockbot.providers.nodebb.module_Category..Category_new)
            * _instance_
                * [.id](#sockbot.providers.nodebb.module_Category..Category+id) : <code>number</code>
                * [.name](#sockbot.providers.nodebb.module_Category..Category+name) : <code>string</code>
                * [.description](#sockbot.providers.nodebb.module_Category..Category+description) : <code>string</code>
                * [.parentId](#sockbot.providers.nodebb.module_Category..Category+parentId) : <code>number</code>
                * [.topicCount](#sockbot.providers.nodebb.module_Category..Category+topicCount) : <code>number</code>
                * [.postCount](#sockbot.providers.nodebb.module_Category..Category+postCount) : <code>number</code>
                * [.recentPosts](#sockbot.providers.nodebb.module_Category..Category+recentPosts) : <code>number</code>
                * [.url()](#sockbot.providers.nodebb.module_Category..Category+url) ⇒ <code>Promise.&lt;string&gt;</code>
                * [.getAllTopics(eachTopic)](#sockbot.providers.nodebb.module_Category..Category+getAllTopics) ⇒ <code>Promise</code>
                * [.getRecentTopics(eachTopic)](#sockbot.providers.nodebb.module_Category..Category+getRecentTopics) ⇒ <code>Promise</code>
                * [.watch()](#sockbot.providers.nodebb.module_Category..Category+watch) ⇒ <code>Promise.&lt;Category&gt;</code>
                * [.unwatch()](#sockbot.providers.nodebb.module_Category..Category+unwatch) ⇒ <code>Promise.&lt;Category&gt;</code>
                * [.mute()](#sockbot.providers.nodebb.module_Category..Category+mute) ⇒ <code>Promise.&lt;Category&gt;</code>
                * [.unmute()](#sockbot.providers.nodebb.module_Category..Category+unmute) ⇒ <code>Promise.&lt;Category&gt;</code>
            * _static_
                * [.get(categoryId)](#sockbot.providers.nodebb.module_Category..Category.get) ⇒ <code>Promise.&lt;Category&gt;</code>
                * [.parse(payload)](#sockbot.providers.nodebb.module_Category..Category.parse) ⇒ <code>Category</code>

<a name="sockbot.providers.nodebb.module_Category.bindCategory"></a>

### Category.bindCategory(forum) ⇒ <code>Category</code>
Create a Category class and bind it to a forum instance

**Kind**: static method of <code>[Category](#sockbot.providers.nodebb.module_Category)</code>  
**Returns**: <code>Category</code> - A Category class bound to the provided `forum` instance  

| Param | Type | Description |
| --- | --- | --- |
| forum | <code>Provider</code> | A forum instance to bind to constructed Category class |

<a name="sockbot.providers.nodebb.module_Category..Category"></a>

### Category~Category
Category Class

Represents a forum category.

**Kind**: inner class of <code>[Category](#sockbot.providers.nodebb.module_Category)</code>  
**Access:** public  

* [~Category](#sockbot.providers.nodebb.module_Category..Category)
    * [new Category(payload)](#new_sockbot.providers.nodebb.module_Category..Category_new)
    * _instance_
        * [.id](#sockbot.providers.nodebb.module_Category..Category+id) : <code>number</code>
        * [.name](#sockbot.providers.nodebb.module_Category..Category+name) : <code>string</code>
        * [.description](#sockbot.providers.nodebb.module_Category..Category+description) : <code>string</code>
        * [.parentId](#sockbot.providers.nodebb.module_Category..Category+parentId) : <code>number</code>
        * [.topicCount](#sockbot.providers.nodebb.module_Category..Category+topicCount) : <code>number</code>
        * [.postCount](#sockbot.providers.nodebb.module_Category..Category+postCount) : <code>number</code>
        * [.recentPosts](#sockbot.providers.nodebb.module_Category..Category+recentPosts) : <code>number</code>
        * [.url()](#sockbot.providers.nodebb.module_Category..Category+url) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.getAllTopics(eachTopic)](#sockbot.providers.nodebb.module_Category..Category+getAllTopics) ⇒ <code>Promise</code>
        * [.getRecentTopics(eachTopic)](#sockbot.providers.nodebb.module_Category..Category+getRecentTopics) ⇒ <code>Promise</code>
        * [.watch()](#sockbot.providers.nodebb.module_Category..Category+watch) ⇒ <code>Promise.&lt;Category&gt;</code>
        * [.unwatch()](#sockbot.providers.nodebb.module_Category..Category+unwatch) ⇒ <code>Promise.&lt;Category&gt;</code>
        * [.mute()](#sockbot.providers.nodebb.module_Category..Category+mute) ⇒ <code>Promise.&lt;Category&gt;</code>
        * [.unmute()](#sockbot.providers.nodebb.module_Category..Category+unmute) ⇒ <code>Promise.&lt;Category&gt;</code>
    * _static_
        * [.get(categoryId)](#sockbot.providers.nodebb.module_Category..Category.get) ⇒ <code>Promise.&lt;Category&gt;</code>
        * [.parse(payload)](#sockbot.providers.nodebb.module_Category..Category.parse) ⇒ <code>Category</code>

<a name="new_sockbot.providers.nodebb.module_Category..Category_new"></a>

#### new Category(payload)
Construct a category object from a provided payload.

This constructor is intended for private use only, if you need top construct a category from payload data use
`Category.parse()` instead.


| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | Payload to construct the Category object out of |

<a name="sockbot.providers.nodebb.module_Category..Category+id"></a>

#### category.id : <code>number</code>
Category Id

**Kind**: instance property of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Category..Category+name"></a>

#### category.name : <code>string</code>
Category Name

**Kind**: instance property of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Category..Category+description"></a>

#### category.description : <code>string</code>
Category description

**Kind**: instance property of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Category..Category+parentId"></a>

#### category.parentId : <code>number</code>
Parent Category Id

**Kind**: instance property of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Category..Category+topicCount"></a>

#### category.topicCount : <code>number</code>
Number of topics in this category

**Kind**: instance property of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Category..Category+postCount"></a>

#### category.postCount : <code>number</code>
Number of posts in this category

**Kind**: instance property of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Category..Category+recentPosts"></a>

#### category.recentPosts : <code>number</code>
Number of "recent" posts in this category

**Kind**: instance property of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Category..Category+url"></a>

#### category.url() ⇒ <code>Promise.&lt;string&gt;</code>
The web URL of the category

**Kind**: instance method of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Returns**: <code>Promise.&lt;string&gt;</code> - Resolves to the web URL         *  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Category..Category+getAllTopics"></a>

#### category.getAllTopics(eachTopic) ⇒ <code>Promise</code>
Get all Topics in the category

**Kind**: instance method of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Returns**: <code>Promise</code> - Resolves when all topics have been processed  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| eachTopic | <code>TopicProcessor</code> | A function to process each topic |

<a name="sockbot.providers.nodebb.module_Category..Category+getRecentTopics"></a>

#### category.getRecentTopics(eachTopic) ⇒ <code>Promise</code>
Get all recently active Topics in the category

**Kind**: instance method of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Returns**: <code>Promise</code> - Resolves when all topics have been processed  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| eachTopic | <code>TopicProcessor</code> | A function to process each topic |

<a name="sockbot.providers.nodebb.module_Category..Category+watch"></a>

#### category.watch() ⇒ <code>Promise.&lt;Category&gt;</code>
Watch this category for new activity

**Kind**: instance method of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Returns**: <code>Promise.&lt;Category&gt;</code> - Resolves to self on completion  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Category..Category+unwatch"></a>

#### category.unwatch() ⇒ <code>Promise.&lt;Category&gt;</code>
Stop watching this category for new activity

**Kind**: instance method of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Returns**: <code>Promise.&lt;Category&gt;</code> - Resolves to self on completion  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Category..Category+mute"></a>

#### category.mute() ⇒ <code>Promise.&lt;Category&gt;</code>
Prevent this category from generating any notifications

This is not currently supported by NodeBB and is a noop

**Kind**: instance method of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Returns**: <code>Promise.&lt;Category&gt;</code> - Resolves to self on completion  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Category..Category+unmute"></a>

#### category.unmute() ⇒ <code>Promise.&lt;Category&gt;</code>
Allow this category to generate notifications

This is not currently supported by NodeBB and is a noop

**Kind**: instance method of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Returns**: <code>Promise.&lt;Category&gt;</code> - Resolves to self on completion  
**Access:** public  
<a name="sockbot.providers.nodebb.module_Category..Category.get"></a>

#### Category.get(categoryId) ⇒ <code>Promise.&lt;Category&gt;</code>
retrieve a category by Id

**Kind**: static method of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Returns**: <code>Promise.&lt;Category&gt;</code> - Resolves to retrieved category  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| categoryId | <code>number</code> | Id of the category to retrieve |

<a name="sockbot.providers.nodebb.module_Category..Category.parse"></a>

#### Category.parse(payload) ⇒ <code>Category</code>
Parse a category from payload data

**Kind**: static method of <code>[Category](#sockbot.providers.nodebb.module_Category..Category)</code>  
**Returns**: <code>Category</code> - Parsed category  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>\*</code> | Data to parse as category |

