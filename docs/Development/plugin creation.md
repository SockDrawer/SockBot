# Plugin Creation

Coming soon: Plugin creation instructions for Sockbot 3.0! 


## Topic: Cross-Platform Support

When creating a plugin that can work across platforms, it can be helpful to use the `Forum.supports()` function to query for specific capabilities your plugin needs.

A plugin should refuse to activate on a platform that does not support key functionalty. If extra functionality is unsupported, it can be disabled at activation time. Plugins should use the `Formatting` capability key to determine what sort of output to produce and adjust to the platform.

### Known Capabilities

- Chats
- PMs
- Users
    - Avatars
    - Follow
    - URL
    - Seen
    - PostCount
- Posts
    - Edit
    - Delete
    - Bookmark
    - Vote
    - URL
- Topics
    - URL
    - Watch
    - Mute
- Categories
    - Management
- Notifications
    - URL
- Formatting
    - Markup
        - Markdown
        - BBCode
        - HTML
    - Multiline
    - Colors
    - Links
    - Images
    - Spoilers