# Posts and Post-like Objects

The below are the basic Post and Post-like objects that make up a Provider. All Providers should offer a Post at the very least. Forum-like providers are likely to offer at least a Topic if not a Category. Chat-like providers may offer a "Topic" as a container for Posts that is analogous to a "Room" on IRC.

## Post

All providers should offer a Post object, but the semantic meaning of what a Post is depends on the provider. In general, a "post" is a single entry into the system by a single user. In a chatlike provider, it will be a single message.

### Post object: Properties

The following properties are assumed to exist, either as plain objects or via getters:

- `authorId`: the userId of the author of the post
- `content`: the content of the post
- `posted`: the dateTime in which the post was made
- `id`: some identifier for the post
- `topicId`: some identifier for the topic that this post belongs to, or undefined if that does not apply

### Post object: Expensive properties

The following methods each return a Promise for the property that they encapsulate. They should reject if no such property can exist.

- `markup`: The raw form of the post, including any HTML tags or control codes
- `url`: the url to view this post on the web

### Post object: actions

The following actions are assumed to be available to be performed on a Post. Each should act upon the actual post in the system, and return a Promise that will resolve if the action completes or reject if it does not.

- `reply`: Submit a new Post as a reply to the current Post. Takes one argument: the text of the reply. Resolves to the new Post object.
- `edit`: Edit the post. Takes up to two arguments: the text to submit as the new text, and the reason for the edit (for systems that use edit reasons). Should reject if the post cannot be edited, or resolve to the edited Post.
- `append`: Edit the post by appending new content.  akes up to two arguments: the text to append, and the reason for the edit (for systems that use edit reasons). Should reject if the post cannot be edited, or resolve to the edited Post.
- `delete`: Delete the post. Takes no arguments. Should reject if the post cannot be deleted, or resolve to the deleted Post.
- `undelete`: Undelete the post. Takes no arguments. Should reject if the post cannot be undeleted, or resolve to the deleted Post.
- `upvote`: Upvote the post. Takes no arguments. Should reject if the post cannot be upvoted, or resolve to the upvoted Post.
- `downvote`: Downvote the post. Takes no arguments. Should reject if the post cannot be downvoted, or resolve to the downvoted Post.
- `bookmark`: Delete the post. Takes no arguments. Should reject if the post cannot be deleted, or resolve to the deleted Post.
- `unbookmark`: Undelete the post. Takes no arguments. Should reject if the post cannot be undeleted, or resolve to the deleted Post.


### Static: reply

A static method should be provided to allow for replying to arbitrary posts. It will be given three arguments: the topic ID to reply to (if any), the post ID to reply to (if any), and the content to submit. One or both of topic ID and post ID will be supplied.

This method should return a promise that will resolve to the newly created Post object.

### Static: get

A static method should be provided to allow for retrieving arbitrary posts. It will be given one arguments: the primary identifier for the post.

This method should return a promise that will resolve to the requested Post object.

### Static: parse

A static method should be provided to allow for parsing arbitrary posts. It will be given one arguments: the raw payload retrieved from the API for the forum.

This method should return a promise that will resolve to the requested Post object.

### Static: preview

A static method should be provided to allow for previewing post content. It will be given one arguments: the content intended to be submitted as a new post.

This method should return a promise that will resolve to a string that will include any modifications done by the server upon submit.

## Topic

Many providers offer a Topic object; like the Post, the semantic meaning of what a Topic is depends on the provider. In general, a "topic" is a collection of posts by potentially a multitude of users.

### Topic object: Properties

The following properties are assumed to exist, either as plain objects or via getters:

- `authorId`: the userId of the author of the Topic
- `title`: the title or subject of the Topic
- `posted`: the dateTime in which the topic was made
- `lastPosted`: the dateTime of the most recent post in the Topic
- `id`: some identifier for the topic
- `mainPostId`: the Post identifier for the first post in the Topic, sometimes called the OP
- `postcount`: the number of Posts in this topic

### Topic object: Expensive properties

The following methods each return a Promise for the property that they encapsulate. They should reject if no such property can exist.

- `url`: the url to view this post on the web

### Topic object: iterator functions

The following methods each take a function that shall be applied to the relevant Post objects inside the Topic, and return a Promise that resolves when the iteration is done. 

- `getAllPosts`: Perform the function on all posts in the Topic
- `getLatestPosts`: Perform the function on the "latest" posts in the Topic, defined according to the Provider implementation

Static versions of each of these functions should also exist. Each of them take a topic identifier as well as the function for iteration.

### Topic object: actions

The following actions are assumed to be available to be performed on a Post. Each should act upon the actual post in the system, and return a Promise that will resolve if the action completes or reject if it does not.

- `reply`: Submit a new post to the topic. Takes one argument: the content to post. 
- `markRead`: Mark all posts read up to a given post. Takes one argument: the identifier for the last post to mark read.
- `watch`: Mark the topic as "watched" or "followed" (whatever the terminology). This typically results in an increase in notifications for the topic, often one per post in the topic.
- `unwatch`: Mark the topic as no longer "watched" or "followed" (whatever the terminology). This typically results in a decrease in notifications for the topic.
- `mute`: Mark the topic as "ignored" or "muted" (whatever the terminology). This typically silences all notifications from that topic.
- `unmute`: Undoes the "mute" action. This may or may not put the topic into the same state as the "unwatch" function would (some normal, inbetween state).

### Static: get

A static method should be provided to allow for retrieving arbitrary topics. It will be given one argument: the primary identifier for the topic.

This method should return a promise that will resolve to the requested Topic object.

### Static: parse

A static method should be provided to allow for parsing arbitrary topics. It will be given one arguments: the raw payload retrieved from the API.

This method should return a promise that will resolve to the requested Topic object.

## Category

A Category is an optional third level of organization; a Category contains Topics the way a Topic contains Posts. A Category may optionally also contain other Categories.

### Category object: Properties

The following properties are assumed to exist, either as plain objects or via getters:

- `name`: the name of the Category
- `id`: some identifier for the Category
- `parentId`: some identifier for the Category's parent, if any
- `description`: the description assigned to the Category
- `postCount`: the number of Posts in this Category
- `topicCount`: the number of Topics in this Category
- `recentPosts`: Recently made posts, provider-defined.

### Category object: Expensive properties

The following methods each return a Promise for the property that they encapsulate. They should reject if no such property can exist.

- `url`: the url to view this Category on the web

### Category object: iterator functions

The following methods each take a function that shall be applied to the relevant Post objects inside the Topic, and return a Promise that resolves when the iteration is done. 

- `getAllTopics`: Perform the function on all Topics in the Category
- `getRecentTopics`: Perform the function on the "latest" Topics in the Category, defined according to the Provider implementation

Static versions of each of these functions should also exist. Each of them take a Category identifier as well as the function for iteration.

### Topic object: actions

The following actions are assumed to be available to be performed on a Post. Each should act upon the actual post in the system, and return a Promise that will resolve if the action completes or reject if it does not.

- `watch`: Mark the Category as "watched" or "followed" (whatever the terminology). This typically results in an increase in notifications for the Category, often one per post in the Category.
- `unwatch`: Mark the Category as no longer "watched" or "followed" (whatever the terminology). This typically results in a decrease in notifications for the Category.
- `mute`: Mark the Category as "ignored" or "muted" (whatever the terminology). This typically silences all notifications from that Category.
- `unmute`: Undoes the "mute" action. This may or may not put the Category into the same state as the "unwatch" function would (some normal, inbetween state).

### Static: get

A static method should be provided to allow for retrieving arbitrary Categories. It will be given one argument: the primary identifier for the Category.

This method should return a promise that will resolve to the requested Category object.

### Static: parse

A static method should be provided to allow for parsing arbitrary Categories. It will be given one arguments: the raw payload retrieved from the API.

This method should return a promise that will resolve to the requested Category object.
