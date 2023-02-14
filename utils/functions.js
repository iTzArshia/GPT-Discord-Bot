module.exports = {

    numberWithCommas: function (number) { // 1000 to 1,000
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    userInfo: function (user) {
        return `${user} | ${user.tag} | ${user.id}`;
    },

    channelInfo: function (channelRoleEmoji) {
        return `${channelRoleEmoji} | ${channelRoleEmoji.name} | ${channelRoleEmoji.id}`;
    },

    timestamp: function (ms) {
        return `<t:${Math.trunc(ms / 1000)}:D> | <t:${Math.trunc(ms / 1000)}:R>`;
    },
        
    flagCheck: function (object) {

        let Sexual = false;
        let Hate = false;
        let Violence = false;
        let SelfHarm = false;

        if (object['sexual'] || object['sexual/minors']) Sexual = true;
        if (object['hate'] || object['hate/threatening']) Hate = true;
        if (object['violence'] || object['violence/graphic']) Violence = true;
        if (object['self-harm']) SelfHarm = true;

        const flags = {
            "Sexual": Sexual,
            "Hate": Hate,
            "Violence": Violence,
            "Self-Harm": SelfHarm,
        };
        const allFlags = Object.keys(flags).map(key => flags[key] ? `${key}: ✅` : `${key}: ❌`).join("\n");
        const trueFlags = Object.keys(flags).filter(key => flags[key]).join(", ");

        return {
            flags: flags,
            allFlags: allFlags,
            trueFlags: trueFlags
        };

    },

};