module.exports.moderation = {
    // True: Enable the Moderation model
    // False: Disable the Moderation model
    State: false,
    // a list of ignored channels IDs which bot ignore messages there
    IgnoredChannels: ["0000000000000000000", "1111111111111111111", "2222222222222222222"],
    // Log's Channel ID it could be Text/Announcement/Voice/Thread/Post Channel ID
    LogChannel: "0000000000000000000",
    // Log's Embed Color it could be a #HexCode or resolvable text like: "Red"
    LogColor: "Red",
    // a list of roles which can use moderation buttons without having permissions
    AdminRoles: ["0000000000000000000", "1111111111111111111", "2222222222222222222"],
    // a list of users which can use moderation buttons without having permissions
    AdminUsers: ["0000000000000000000", "1111111111111111111", "2222222222222222222"],
    // True: Deletes Flagged Messages automatically
    // False: Don't Delete Flagged Messages automatically
    AutoDelete: {
        "Sexual": false,
        "Hate": false,
        "Violence": false,
        "Self-Harm": false
    },
    // True: Punish Flagged Messages authors automatically
    // False: Don't Punish Flagged Messages authors automatically
    AutoPunish: {
        "Sexual": false,
        "Hate": false,
        "Violence": false,
        "Self-Harm": false
    },
    // Valid Punish Types for Flagged Messages authors if "AutoPunish" enabled: "Timeout", "Kick", "Ban" 
    // note: if more than 1 flag enabled together it will first check for Ban then check for Kick and then check for Timeout
    AutoPunishType: {
        "Sexual": "Timeout",
        "Hate": "Timeout",
        "Violence": "Timeout",
        "Self-Harm": "Timeout"
    },
    // For Timeout it will be "Timeout" duration
    // For Ban it will be Delete Messages in past days duration
    // For Kick it don't do anything
    // Valid Timeout Durations: 1 Minute - 28 Days
    // Valid Ban Delete Messages Durations: 0 seconds - 7 days
    // m / min / minute / minutes 
    // h / hour / hours
    // d / day / days
    // examples: "30m" / "1h" / "1d"  and ...
    // note: if more than 1 flag enabled together it will check for the longest duration
    AutoPunishDuration: {
        "Sexual": "1d",
        "Hate": "1d",
        "Violence": "1d",
        "Self-Harm": "1d"
    },
};