const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require("discord.js");
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ]
});

require("./keep-alive");

require("./no-prefix")(client); // Load no-prefix commands

const prefix = "+";
let logChannelId = null;

// Logging Function
function logAction(action) {
    console.log(`[LOG] ${action}`);
    if (logChannelId) {
        const logChannel = client.channels.cache.get(logChannelId);
        if (logChannel) logChannel.send(`[LOG] ${action}`);
    }
}

// Bot Ready Event
client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    logAction("Bot started and logged in.");
});

// Message Command Handling
client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();
    const target = message.mentions.members.first();

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply("❌ You do not have permission to use this command.");
    }

    switch (command) {
        case "kick":
            if (!target) return message.reply("⚠ Mention a user to kick.");
            if (!target.kickable) return message.reply("❌ I cannot kick this user.");
            await target.kick();
            logAction(`${message.author.tag} kicked ${target.user.tag}.`);
            message.reply(`✅ **${target.user.tag}** has been kicked.`);
            break;

        case "ban":
            if (!target) return message.reply("⚠ Mention a user to ban.");
            if (!target.bannable) return message.reply("❌ I cannot ban this user.");
            await target.ban();
            logAction(`${message.author.tag} banned ${target.user.tag}.`);
            message.reply(`✅ **${target.user.tag}** has been banned.`);
            break;

        case "unban":
            if (!args[0]) return message.reply("⚠ Provide a user ID to unban.");
            try {
                await message.guild.bans.remove(args[0]);
                logAction(`${message.author.tag} unbanned user ID ${args[0]}.`);
                message.reply(`✅ User with ID **${args[0]}** has been unbanned.`);
            } catch (error) {
                message.reply("❌ Could not unban the user. Check if the ID is correct.");
            }
            break;

        case "mute":
            if (!target) return message.reply("⚠ Mention a user to mute.");
            await target.timeout(10 * 60 * 1000);
            logAction(`${message.author.tag} muted ${target.user.tag}.`);
            message.reply(`✅ **${target.user.tag}** has been muted for 10 minutes.`);
            break;

        case "unmute":
            if (!target) return message.reply("⚠ Mention a user to unmute.");
            await target.timeout(null);
            logAction(`${message.author.tag} unmuted ${target.user.tag}.`);
            message.reply(`✅ **${target.user.tag}** has been unmuted.`);
            break;

        case "vc-kick":
            if (!target || !target.voice.channel) return message.reply("⚠ Mention a user in a voice channel.");
            await target.voice.disconnect();
            logAction(`${message.author.tag} kicked ${target.user.tag} from VC.`);
            message.reply(`✅ **${target.user.tag}** has been kicked from voice chat.`);
            break;

        case "vc-mute":
            if (!target || !target.voice.channel) return message.reply("⚠ Mention a user in a voice channel.");
            await target.voice.setMute(true);
            logAction(`${message.author.tag} muted ${target.user.tag} in VC.`);
            message.reply(`✅ **${target.user.tag}** has been muted in voice chat.`);
            break;

        case "vc-unmute":
            if (!target || !target.voice.channel) return message.reply("⚠ Mention a user in a voice channel.");
            await target.voice.setMute(false);
            logAction(`${message.author.tag} unmuted ${target.user.tag} in VC.`);
            message.reply(`✅ **${target.user.tag}** has been unmuted in voice chat.`);
            break;

        case "senddm":
            if (!target || !args.length) return message.reply("⚠ Mention a user and provide a message.");
            const dmMessage = args.join(" ");
            await target.send(dmMessage);
            logAction(`${message.author.tag} sent a DM to ${target.user.tag}: ${dmMessage}`);
            message.reply(`✅ Message sent to **${target.user.tag}**.`);
            break;

        case "logchannel":
            if (!args[0]) return message.reply("⚠ Provide a channel ID.");
            logChannelId = args[0];
            message.reply(`✅ Log channel set to <#${logChannelId}>.`);
            break;

        case "help":
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("📜 Bot Help Menu")
                .setDescription("Here are the available commands:")
                .addFields(
                    { name: "**Admin Commands**", value: "`+ban @user`, `+unban userID`, `+logchannel channelID`" },
                    { name: "**Moderator Commands**", value: "`+kick @user`, `+mute @user`, `+unmute @user`, `+senddm @user text`" },
                    { name: "**Voice Control Commands**", value: "`+vc-kick @user`, `+vc-mute @user`, `+vc-unmute @user`" }
                )
                .setFooter({ text: "Bot by MADARA" });

            return message.reply({ embeds: [embed] });
    }
});

// Login Bot
client.login(process.env.TOKEN);