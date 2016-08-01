# Users and User-like Objects


## User

All providers should offer a User object. A User ought to represent a single person.

### bindUser
The User file should export a single method, called bindUser. This method takes in a forum object and returns the User class, with specific references to provider functions bound to that instance of the provider. 

### User object: Properties

The following properties are assumed to exist, either as plain objects or via getters:

- `id`: some unique identifier for the user
- `name`: The name the user prefers to go by. For providers which separate short and long names, this is the long name.
- `username`: The name the system identifies the user by. For providers which separate short and long names, this is the short name.
- `email`: The email for the user, if publicly exposed.
- `avatar`: The avatar for the user, if any. This is usually a URL rather than an image.
- `postCount`: For providers that expose total post count, the number of posts the user has made ever.
- `topicCount`: For providers that expose total topic counts, the number of topics the user has ever created.
- `reputation`: for providers that expose a reputation mechanic, this is the current reptutation. This may be identical to postCount in older forums.
- `lastSeen`: The last time the server saw the user, if recorded.
- `lastPosted`: the last time the user posts. May be identical to lastSeen, or empty if not recorded.

### User object: Expensive properties

The following methods each return a Promise for the property that they encapsulate. They should reject if no such property can exist.

- `url`: the url to view this user's profile on the web

### User object: actions

The following actions are assumed to be available to be performed on a Post. Each should act upon the actual post in the system, and return a Promise that will resolve if the action completes or reject if it does not.

- `follow`: "Follow" or "Subscribe" to the user. Typically results in more notifications about their actions.
- `unfollow`: Reverses the above action


### Static: get

A static method should be provided to allow for retrieving arbitrary users. It will be given one arguments: the primary identifier for the user.

This method should return a promise that will resolve to the requested User object.

### Static: getByName

A static method should be provided to allow for retrieving arbitrary users. It will be given one arguments: a string containing the complete username for the User.

This method should return a promise that will resolve to the requested User object.

### Static: parse

A static method should be provided to allow for parsing arbitrary Users. It will be given one arguments: the raw payload retrieved from the API for the forum.

This method should return a promise that will resolve to the requested User object.
