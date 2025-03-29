module.exports = (client) => {
    const allowedUsers = ["764913672681160736", ]; // Replace with actual user IDs

    client.on("messageCreate", async (message) => {
        if (!message.guild || message.author.bot) return;
        if (!allowedUsers.includes(message.author.id)) return;

        const content = message.content.toLowerCase();

        switch (content) {
            case "ban me":
                if (!message.member.bannable) return message.reply("❌ I cannot ban you.");
                await message.member.ban();
                message.reply("✅ You have been banned.");
                break;

            case "kick me":
                if (!message.member.kickable) return message.reply("❌ I cannot kick you.");
                await message.member.kick();
                message.reply("✅ You have been kicked.");
                break;

            case "mute me":
                await message.member.timeout(10 * 60 * 1000);
                message.reply("✅ You have been muted for 10 minutes.");
                break;

            case "unmute me":
                await message.member.timeout(null);
                message.reply("✅ You have been unmuted.");
                break;

            case "hello bot":
                message.reply("Hello! How can I assist you?");
                break;
        }
    });
};