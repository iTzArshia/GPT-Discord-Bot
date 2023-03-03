const encoder = require('./encoder/encoder');

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

    tokenizer: function (model, prompt) {

        if (model === 'chatgpt') {

            let encodedLength = 0;
            for (const message of prompt) {
                const encoded = encoder.encode(message.content);
                encodedLength = encodedLength + encoded.length + 4;
            };
            const tokens = encodedLength + 2;
            const maxTokens = 4096 - tokens;
            return {
                tokens: tokens,
                maxTokens: maxTokens
            };

        } else {

            const encoded = encoder.encode(prompt);
            const tokens = encoded.length;
            let maxTokens;
            if (model === 'davinci') maxTokens = 4096 - tokens;
            else maxTokens = 2048 - tokens;
            return {
                tokens: tokens,
                maxTokens: maxTokens
            };

        };

    },

    pricing: function (model, number, resolution) {

        let cost = 0.0;
        if (model === 'dall.e') {
            let pricing = {
                '1024x1024': 0.020,
                '512x512': 0.018,
                '256x256': 0.016
            };
            cost = number * pricing[resolution];
        }
        else if (model === 'chatgpt') cost = number * (0.0020 / 1000);
        else if (model === 'davinci') cost = number * (0.0200 / 1000);
        else if (model === 'curie') cost = number * (0.0020 / 1000);
        else if (model === 'babbage') cost = number * (0.0005 / 1000);
        else if (model === 'ada') cost = number * (0.0004 / 1000);
        return `$${Number(cost.toFixed(4))}`;

    },

};