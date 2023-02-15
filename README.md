<h1 align="center">Chat GPT Discord Bot</h1>

<div align="center">
    <a href="https://github.com/iTzArshia/GPT-Discord-Bot/stargazers"> <img src="https://img.shields.io/github/stars/iTzArshia/GPT-Discord-Bot.svg" alt="GitHub stars"/> </a>
    <a href="https://github.com/iTzArshia/GPT-Discord-Bot/network"> <img src="https://img.shields.io/github/forks/iTzArshia/GPT-Discord-Bot.svg" alt="GitHub forks"/> </a>
    <a href="https://discord.gg/nKrBshQvcK"> <img src="https://badgen.net/discord/members/nKrBshQvcK" alt="iTz Development Discord"/> </a>
    <a href="https://discord.gg/8hr9CRqmfc"> <img src="https://badgen.net/discord/members/8hr9CRqmfc" alt="iTz Club Discord"/> </a>
</div>

GPT Discord Bot is the original Discord AI bot written in **[JavaScript](https://www.javascript.com/)**, using the **[Discord.js V14](discord.js.org/)** library powered by [OpenAI](https://openai.com/)'s models. It has different features such as answering to all of your questions or draw your imaginations and even translate your prompts from any language to any other language you want and also an configurable Auto Moderation system powered by AI which watch all of your server messages (if you want, you can turn it off/on) and report flagged messages to Admins and they can moderate it and other features which you can see example in **[Screenshots](https://github.com/iTzArshia/GPT-Discord-Bot/edit/main/README.md#-screenshots)**!
## 🚧 Requirements
1. Discord Bot Token **[Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)**  
   1.1. Enable "Message Content Intent" and "Server Members Intent" in Discord Developer Portal
2. OpenAI API Key
3. **[Node.js 16.9.0](https://nodejs.org/en/download/)** or higher
# 🚀 Getting Started
## ⚙️ Configuration
Go to `config.json` in `configs` folder and fill out the values:
```json
{
    "Prefix": "Put anything you want as prefix",
    "MainColor": "Put any #HexCode you want for embeds color",
    "ErrorColor": "Put any #HexCode you want for embeds color when there is an error",
    "ClientID": "Put your Bot ID/Client ID here",
    "Token": "Put your Bot Token here",
    "OpenAIapiKey": "Put your Open AI API Key here"
}
```
⚠️ **Note: Never commit or share your token publicly** ⚠️

and if you want to use moderation model fill and config `moderation.js` in `configs` folder (Information on how to configure it is available in the file itself)
## 🧠 installation
Open your terminal and install required packages with
```sh
npm install
```
After installation finishes run `node register.js` to deploy slash commands and then run `node index.js` in terminal to start the bot.
## 💫 Features
`/Ask` / `!Ask` : Answers your questions!

`/Imagine` / `!Imagine` : Draw your imaginations!

`/Translate` / `!Translate` : Translate your texts in any language to any language you want

`Auto Moderation`
## 📸 Screenshots
![Ask](https://user-images.githubusercontent.com/89854127/218874201-c64068e8-708e-49ca-a322-bcb1e4a76646.png)
![imagine](https://user-images.githubusercontent.com/89854127/218997350-d9a98021-33ad-4fed-b0bc-47306eebdd10.png)
![Translate](https://user-images.githubusercontent.com/89854127/218874217-f472fa38-9918-46a3-a0e2-6a4cbfb4c370.png)
![Auto Mod](https://user-images.githubusercontent.com/89854127/218874203-c54283b2-410a-4ab6-a233-1dbbb5f42594.png)
## ❤️ Donations
You can **[support](https://reymit.ir/itz_arshia)** me by donating if you like the project!
> Only available for Iranians :(
#
Made with ❤️ and JavaScript, Don't Forget to ⭐
