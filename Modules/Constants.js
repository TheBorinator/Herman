module.exports = Object.freeze({
	HERMAN_ID: '964835704456757308',
	
	ERROR_COLOUR: '#F54F47',
	ERROR_EMOJI: '<:Error:965283537106374656>',
	
	WARNING_COLOUR: '#FDD006',
	WARNING_EMOJI: '<:Warning:965283585177321502>',

	SUCCESS_COLOUR: '#60B515',
	SUCCESS_EMOJI: '<:Success:965283744439210004>',
	
	INFO_COLOUR: '#49AFD9',
	INFO_EMOJI: '<:Info:965283767738597406>',

	REGULAR_COLOUR: '#F5D547',

	GUILD_BLACKLISTED: 'This server has been blacklisted',
	ERROR_OCCURED: 'An error occured whilst executing the command',
	MODULE_NOT_ENABLED_USER: `This module has not been enabled.\nPlease ask a server admin to enable it.`,
	MODULE_NOT_ENABLED_ADMIN: `This module has not been enabled.\nUse \`/module enable {{module}}\` to enable it.`,

	USER_PROCESSING_ERROR: `An error occured whilst the user's data was processed`,
	USER_LACKING_PERMISSIONS: `You don't have the appropriate permissions to {{action}} this user`,
	BOT_IMMUNITY: `I can't {{action}} bots`,
	BOT_LACKING_PERMISSIONS: `I don't have the appropriate permissions to {{action}} this user`,
	USER_ROLE_IMBALANCE: `I can't {{action}} this user because they have`,
	USER_ROLE_IMBALANCE_SAME_ROLE: `the same role as you`,
	USER_ROLE_IMBALANCE_HIGHER_ROLE: `a higher role than you`,

	INVALID_TIME_RANGE: `I cannot {{action}} a user for`,
	INVALID_TIME_RANGE_TOO_HIGH: `more than 28 days.`,
	INVALID_TIME_RANGE_TOO_LOW: `less than one minute.`,
	REASON_TOO_LONG: `The reason you provide cannot be more than 100 characters`,

	DISRUPTIVE_PUNISHMENT_DM: `You were {{action}} from {{guild}} for {{reason}}`,
	DISRUPTIVE_PUNISHMENT_PUBLIC_MESSAGE: `{{action}} {{user}} for {{reason}}`,
	NONDISRUPTIVE_PUNISHMENT_DM: `You were {{action}} in {{guild}} for {{reason}}`,
	NONDISRUPTIVE_PUNISHMENT_PUBLIC_MESSAGE: `{{action}} {{user}} for {{reason}}`,

	MUTE_PUBLIC_MESSAGE: `{{action}} {{user}} for {{duration}} for {{reason}}`,

	UNMUTE_NOT_MUTED: `{{user}} is not muted`,
	MUTE_ALREADY_MUTED: `{{user}} is already muted, and will be until <t:{{time}}>`,

	PURGE_ERRONEOUS_INPUT: `I cannot delete less than 1 message or more than 100 messages`,
	PURGE_PUBLIC_MESSAGE: `Deleted {{messages}} messages from {{channel}}`,
	PURGE_PUBLIC_MESSAGE_2_WEEK_LIMIT: `Deleted {{messages}} messages from {{channel}}\nI cannot delete messages that are more than 2 weeks old`,

	MODLOG_INVALID_CASENUMBER: `The case number you provided is not an event that involves {{user}}`,
	MODLOG_EDIT_SUCCESS: `Updated case {{case}}'s reason to {{reason}}`,
	MODLOG_REMOVE_SUCCESS: `Removed case {{case}} from {{user}}'s punishment history`,
	MODLOG_CANNOT_ACTION_OWN_LOGS: `You can't {{action}} your own modlogs`,

	USERNAME_CONTAINS_NAME: `We have detected that your username contains a real-life name. If it is your real-life name, we suggest that you consider changing your username to something different. Stay safe, friend.`,

	RANK_INVALID_RANK_NAME: `The rank name you entered is invalid`,
	RANK_GUILD_HAS_NO_RANKS: `This server has no ranks you can join`,
	RANK_MOD_GUILD_HAS_NO_RANKS: `This server has no ranks set up`,
	RANK_MISSING_PREREQUISITE_ROLE: `You need to have {{role}} to get this rank`,
	RANK_ROLE_MISSING: `The role connected to this rank no longer exists`,
	RANK_LACKING_PERMISSIONS: `I don't have the appropriate permissions to manage your roles`,
	RANK_USER_LACKING_PERMISSIONS: `You don't have the appropriate permissions to manage ranks`,
	RANK_ASSIGN_SUCCESS: `You have joined \`{{rank}}\` and received {{role}}`,
	RANK_ROLE_PREVIOUSLY_REMOVED: `You have already left this rank`,
	RANK_REMOVE_SUCCESS: `You have left \`{{rank}}\` and lost {{role}}`,
	RANK_ALREADY_HAS_ROLE: `You are already in this rank`,

	RANK_NAME_ALREADY_IN_USE: `A rank with the name \`{{name}}\` already exists in this server`,
	RANK_ROLE_ALREADY_IN_USE: `The rank \`{{name}}\` already yields {{role}}`,
	RANK_CANNOT_ASSIGN_EVERYONE: `I cannot assign \`@everyone\``,
	RANK_CANNOT_BE_PREREQUISITE: `Your prerequisite cannot be the same as the role you are assigning`,
	RANK_ROLE_IMBALANCE: `I cannot {{action}} this rank because {{role}} is`,
	RANK_ROLE_IMBALANCE_SAME_ROLE: `the highest role you have`,
	RANK_ROLE_IMBALANCE_HIGHER_ROLE: `higher than your highest role`,
	RANK_SELF_ROLE_IMBALANCE_SAME_ROLE: `the highest role I have`,
	RANK_SELF_ROLE_IMBALANCE_HIGHER_ROLE: `higher than my highest role`,
	RANK_ROLE_MANAGED_BY_INTEGRATION: `This role is managed by an existing integration, and therefore cannot be assigned`,
	MAXIMUM_NUMBER_OF_RANKS: 10,
	RANK_PASSED_MAXIMUM_NUMBER_OF_RANKS: `You cannot make more than 10 joinable ranks at the moment`,
	
	RANK_CREATE_SUCCESS: `Created rank \`{{name}}\``,
	RANK_REMOVE_SUCCESS: `Removed rank \`{{name}}\``,
	
	AUTOROLE_GUILD_HAS_NO_AUTOROLES: `You haven't set up any autoroles yet`,
	AUTOROLE_DELAY_RANGE_ERROR: `You cannot set an autorole's delay to be less than 0 seconds or greater than 18000 seconds`,
	AUTOROLE_ROLE_IMBALANCE: `I cannot {{action}} this autorole because {{role}} is`,
	AUTOROLE_ROLE_IMBALANCE_SAME_ROLE: `the highest role you have`,
	AUTOROLE_ROLE_IMBALANCE_HIGHER_ROLE: `higher than your highest role`,
	AUTOROLE_SELF_ROLE_IMBALANCE_SAME_ROLE: `the highest role I have`,
	AUTOROLE_SELF_ROLE_IMBALANCE_HIGHER_ROLE: `higher than my highest role`,
	AUTOROLE_ROLE_MANAGED_BY_INTEGRATION: `This role is managed by an existing integration, and therefore cannot be assigned`,
	AUTOROLE_CANNOT_ASSIGN_EVERYONE: `This role is a Discord system role and therefore cannot be assigned`,
	AUTOROLE_ROLE_ALREADY_IN_USE: `{{role}} is already in use by another autorole\nUse \`/autorole edit @role\` to configure existing autoroles`,
	AUTOROLE_DOES_NOT_EXIST: `{{role}} is not an autorole\nUse \`/autorole create @role\` to create an autorole`,
	MAXIMUM_NUMBER_OF_AUTOROLES: 10,
	AUTOROLE_PASSED_MAXIMUM_NUMBER_OF_AUTOROLES: `You cannot make more than 10 autoroles at the moment`,
	AUTOROLE_CREATE_SUCCESS: `Created autorole {{role}}\nNew members will receive this role after a {{delay}} second delay`,
	AUTOROLE_EDIT_SUCCESS: `Edited autorole {{role}}\nNew members will receive this role after a {{delay}} second delay`,
	AUTOROLE_REMOVE_SUCCESS: `Removed autorole {{role}}\nNew members will no longer receive this role`,

	SELF_LACKING_PERMISSIONS: `I need the \`{{permission}}\` permission to perform this action`,
	USER_LACKING_PERMISSIONS: `You need the \`{{permission}}\` permission to perform this action`,

	BANNED_PHRASE: `{{user}}, that is a banned phrase.`,

	INVALID_BUTTON_USER: `You can't use these buttons because you did not run the command`
});
