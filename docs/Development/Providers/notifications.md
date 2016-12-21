# Notifications

Notifications are the bread and butter of Sockbot. They represent an incoming alert or message of some kind. This can be an event through a websocket, a notification email, or any alert that something has changed and needs to be processed. 

## Notification

All providers should offer a Notification object. A single Notification should represent a single Event.

### Types

The following types of notification are well defined and assumed to exist:

- `notification`: Any notification.
- `notification:reply`: A reply to a message the bot has sent
- `notification:mention`: A mention of the bot's username
- `notification:message`: A message the bot cares about for some reason, such as a "watched" thread

Other types may exist depending on the provider.

*Important note:* Notification is responsible for handling the Commands object in order to support Command-type plugins. When a notification is spawned, a new Commands instance *must* be created. See [the Command docs](#http://sockbot.readthedocs.io/en/latest/api/lib/commands/#sockbot.lib.module_commands) for more information.

### Notification object: Properties

The following properties are assumed to exist, either as plain object properties or via getters:

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

### Static: activate

A static method should be provided to begin listening for notifications. When called, it should begin sending Notifications through the Forum's eventEmitter.

The usual method of activation is to create a Parse method and listen for incoming messages or notification events emitted by the underlying connection to the forum. When an event occurs, the following should happen:

- The incoming message is parsed into a Notification object 
- The forum should be asked to emit a `notification` event with the Notification attached
- The forum should be asked to emit any of the applicable events: 
   - `notification:notification`
   - `notification:mention` if the notification was caused by the bot being mentioned
   - `notification:group_mention` if the notification was caused by a group the bot is in being mentioned, such as `@moderators` on a forum, or a mechanism that notifies the entire channel in a chat-like provider
   - `notification:reply` if the notification was caused by a reply to a post the bot made
   - Any custom notification type specific to the provider, such as `notification:privmsg` for IRC
- A new Command object should be created for each command the notification's associated post contains. This can be achieved by calling [Commands.get](http://sockbot.readthedocs.io/en/latest/api/lib/commands/#sockbot.lib.module_commands..Commands.get)
- The Command object should be executed, calling the handlers for any commands that were detected. This can be achieved by calling [Command.execute](http://sockbot.readthedocs.io/en/latest/api/lib/commands/#sockbot.lib.module_commands..Command+execute)

### Static: deactivate

A static method should be provided to stop listening for notifications. When called, it should cease sending notification events or processing commands.