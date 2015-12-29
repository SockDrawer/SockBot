<a name="external.module_users"></a>
## users
Documentation for discourse JSON objects

**License**: MIT  

* [users](#external.module_users)
    * [.UserBadge](#external.module_users.UserBadge) : <code>object</code>
    * [.Badge](#external.module_users.Badge) : <code>object</code>
    * [.BadgeType](#external.module_users.BadgeType) : <code>object</code>

<a name="external.module_users.UserBadge"></a>
### users.UserBadge : <code>object</code>
User Badge Data

**Kind**: static typedef of <code>[users](#external.module_users)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | Badge instance Id |
| granted_at | <code>string</code> | ISO formate badge grant datetime |
| badge_id | <code>number</code> | Badge type Id |
| user_id | <code>number</code> | User Id badge was granted to |
| granted_by_id | <code>number</code> | User Id that granted the badge |

<a name="external.module_users.Badge"></a>
### users.Badge : <code>object</code>
Badge Data

**Kind**: static typedef of <code>[users](#external.module_users)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | Badge Id |
| name | <code>string</code> | Badge Name |
| description | <code>string</code> | Badge Description |
| grant_count | <code>number</code> | Number of times this badge has been awarded to all users |
| allow_title | <code>boolean</code> | Can badge be used as user title? |
| multiple_grant | <code>boolean</code> | Can badge be granted multiple times to one user? |
| icon | <code>string</code> | Badge Icon (FontAwesome character name?) |
| image | <code>string</code> | Badge Image (FontAwesome character name?) |
| listable | <code>boolean</code> | Unknown |
| enabled | <code>boolean</code> | Is badge enabled? |
| badge_grouping_id | <code>number</code> | Group the badge belongs to |
| system | <code>boolean</code> | Is this a builtin badge? |
| badge_type_id | <code>number</code> | Defines the type of the badge |

<a name="external.module_users.BadgeType"></a>
### users.BadgeType : <code>object</code>
Badge Types

**Kind**: static typedef of <code>[users](#external.module_users)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | Badge Type Id |
| name | <code>string</code> | Badge Type Name |
| sort_order | <code>number</code> | Badge Type Sort Order |

