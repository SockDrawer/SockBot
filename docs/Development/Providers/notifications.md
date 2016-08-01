# Notifications

Notifications are the bread and butter of Sockbot. They represent an incoming alert or message of some kind. This can be an event through a websocket, a notification email, or any alert that something has changed and needs to be processed. 

## Notification

All providers should offer a Notification object. A single Notification should represent a single Event. 

### bindNotification
The Notification file should export a single method, called bindNotification. This method takes in a forum object and returns the Notification class, with specific references to provider functions bound to that instance of the provider. 

### Notification object: Properties

The following properties are assumed to exist, either as plain objects or via getters:

- `id`: some unique identifier for the notification
- `topicId`: If applicable, some unique identifier for the Topic that generated the Notification
- `userId`: If applicable, some unique identifier for the User that generated the Notification
- `type`: What type of notification this is. Types include [TBD]
- `subtype`: If applicable, the subtype of notification.
- `read`: Whether the bot user has already read the notification.
- `date`: The datetime the notification was generated. If not returned by the server, the provider may store the datetime the Notification object was generated instead.
- `label`: Any label text that came with the notification
- `body`: The text of the notification

### Notification object: Expensive properties

The following methods each return a Promise for the property that they encapsulate. They should reject if no such property can exist.

- `url`: the url to view this notification on the web
- `getPost`: the Post object that generated this notification
- `getTopic`: the Topic object that generated this notification
- `getUser`: the User object that generated this notification


### Static: get

A static method should be provided to allow for retrieving arbitrary notifications. It will be given one arguments: the primary identifier for the notification.

This method should return a promise that will resolve to the requested Notification object.

### Static: parse

A static method should be provided to allow for parsing arbitrary Notifications. It will be given one arguments: the raw payload retrieved from the API for the forum.

This method should return a promise that will resolve to the requested Notification object.

### Static: activate

A static method should be provided to begin listening for notifications. When called, it should begin sending Notifications through the Forum's eventEmitter.

### Static: deactivate

A static method should be provided to stop listening for notifications. When called, it should cease sending notification events.