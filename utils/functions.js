const tiktoken = require('@dqbd/tiktoken');
const encoder = tiktoken.get_encoding('cl100k_base');

module.exports = {

    numberWithCommas: function (number) {
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

    delay: function (ms) {
        return new Promise(resolve => {
            setTimeout(() => resolve(), ms);
        });
    },

    flagCheck: function (object) {

        let Sexual = false;
        let Hate = false;
        let Harassment = false;
        let SelfHarm = false;
        let Violence = false;

        if (object['sexual'] || object['sexual/minors']) Sexual = true;
        if (object['hate'] || object['hate/threatening']) Hate = true;
        if (object['harassment'] || object['harassment/threatening']) Harassment = true;
        if (object['self-harm'] || object['self-harm/intent'] || object['self-harm/instructions']) SelfHarm = true;
        if (object['violence'] || object['violence/graphic']) Violence = true;

        const flags = {
            "Sexual": Sexual,
            "Hate": Hate,
            "Harassment": Harassment,
            "Self-Harm": SelfHarm,
            "Violence": Violence
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

        let tokensPerMessage;
        let nameAdjustment;

        if (model === 'gpt-4') {
            tokensPerMessage = 3;
            nameAdjustment = 1;
        } else {
            tokensPerMessage = 4;
            nameAdjustment = -1;
        }

        const messagesTokenCounts = prompt.map((messages) => {

            const propertyTokenCounts = Object.entries(messages).map(([key, value]) => {
                const numTokens = encoder.encode(value).length;
                const adjustment = (key === 'name') ? nameAdjustment : 0;
                return numTokens + adjustment;
            });

            return propertyTokenCounts.reduce((a, b) => a + b, tokensPerMessage);

        });

        const messagesTokens = messagesTokenCounts.reduce((a, b) => a + b, 0) + 2;

        let maxTokens;
        if (model === 'gpt-3.5') maxTokens = 4097
        else if (model === 'gpt-4') maxTokens = 8192

        return {
            tokens: messagesTokens,
            maxTokens: maxTokens - messagesTokens
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
        else if (model === 'gpt-3.5') cost = number * (0.002 / 1000);
        else if (model === 'gpt-4') cost = number * (0.060 / 1000);

        return `$${Number(cost.toFixed(4))}`;

    },

};