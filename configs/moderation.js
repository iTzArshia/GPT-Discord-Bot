module.exports.moderation = {
    // true: Enable the Moderation model.
    // false: Disable the Moderation model.
    State: false,
    // A list of channel IDs that the bot ignores messages from.
    IgnoredChannels: [
        "0000000000000000000",
        "1111111111111111111",
        "2222222222222222222"
    ],
    // A list of user IDs that the bot ignores messages from.
    IgnoredUsers: [
        "0000000000000000000",
        "1111111111111111111",
        "2222222222222222222"
    ],
    // Log's channel ID. It could be a text, announcement, voice, thread or post channel ID.
    LogChannel: "0000000000000000000",
    // Log's embed color. It could be a #HexCode or resolvable text like: "Red", "Blue", "Purple", "Green", "Yellow"
    LogColor: "Red",
    // A list of roles that can use moderation buttons without having permissions.
    AdminRoles: [
        "0000000000000000000",
        "1111111111111111111",
        "2222222222222222222"
    ],
    // A list of users that can use moderation buttons without having permissions.
    AdminUsers: [
        "0000000000000000000",
        "1111111111111111111",
        "2222222222222222222"
    ],
    // true: Deletes Flagged Messages automatically.
    // false: Doesn't delete flagged messages automatically.
    AutoDelete: {
        "Sexual": false,
        "Hate": false,
        "Harassment": false,
        "Self-Harm": false,
        "Violence": false
    },
    // true: Punishes flagged messages' authors automatically.
    // false: Doesn't punish flagged messages' authors automatically.
    AutoPunish: {
        "Sexual": false,
        "Hate": false,
        "Harassment": false,
        "Self-Harm": false,
        "Violence": false
    },
    // Valid punishment types for flagged messages' authors if "AutoPunish" is enabled: "Timeout", "Kick", "Ban"
    // Note: If more than 1 flag is enabled, the priority will be as follows: 1. Ban 2. Kick. 3. Timeout.
    AutoPunishType: {
        "Sexual": "Timeout",
        "Hate": "Timeout",
        "Harassment": "Timeout",
        "Self-Harm": "Timeout",
        "Violence": "Timeout"
    },
    // For timeouts it will be the timeout's duration.
    // For bans, it will be the number of days from which it will purge the message history.
    // For kick it doesn't do anything.
    // Valid timeout duration: 1 Minute - 28 Days
    // Valid ban delete messages duration: 0 Seconds - 7 Days
    // Note: If more than 1 flag is enabled, it'll check for the longest duration.
    // Eexamples: 
    // Second: 1s / 10sec / 30secs / 60second / 120seconds
    // Minute: 1m / 10min / 30mins / 60minute / 120minutes
    // Hour: 1h / 2hr / 3hrs / 4hour / 5hours
    // Day: 1d / 2day / 3days
    // Week: 1w / 2week / 3weeks
    AutoPunishDuration: {
        "Sexual": "1d",
        "Hate": "1d",
        "Harassment": "1d",
        "Self-Harm": "1d",
        "Violence": "1d"
    },
};