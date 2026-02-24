require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
  ChannelType,
  EmbedBuilder
} = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});


if (!fs.existsSync("warns.json")) fs.writeFileSync("warns.json", "{}");


function logEmbed(title, description, color = 0x0099ff) {
  const ch = client.channels.cache.get(process.env.LOG_CHANNEL);
  if (!ch) return;
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
  ch.send({ embeds: [embed] });
}


client.once("ready", () => {
  console.log("🛡️ Nexora v2 Online");
});


client.on("guildMemberAdd", member => {
  const ch = client.channels.cache.get(process.env.WELCOME_CHANNEL);
  if (ch) {
    const embed = new EmbedBuilder()
      .setTitle("🎉 New Member!")
      .setDescription(`Welcome ${member.user}!\nEnjoy your stay!`)
      .setColor(0x00ff00)
      .setTimestamp();
    ch.send({ embeds: [embed] });
  }

  if (process.env.AUTOROLE_ID) member.roles.add(process.env.AUTOROLE_ID);

  logEmbed("Member Joined", `➕ ${member.user.tag}`, 0x00ff00);
});

client.on("guildMemberRemove", member => {
  logEmbed("Member Left", `➖ ${member.user.tag}`, 0xff0000);
});


client.on("interactionCreate", async i => {
  if (!i.isChatInputCommand()) return;
  const cmd = i.commandName;


  const isOwner = i.user.id === process.env.OWNER_ID;


  if (cmd === "ban") {
    if (!isOwner) return i.reply({ content: "❌ Only the bot owner can use this command!", ephemeral: true });

    const user = i.options.getUser("user");
    const reason = i.options.getString("reason") || "No reason";
    const m = i.guild.members.cache.get(user.id);
    if (!m) return i.reply({ content: "User not found", ephemeral: true });

    await m.ban({ reason });

    const embed = new EmbedBuilder()
      .setTitle("🔨 User Banned")
      .setDescription(`${user.tag} banned by ${i.user.tag}\nReason: ${reason}`)
      .setColor(0xff0000)
      .setTimestamp();

    logEmbed("Ban", `${user.tag} banned by ${i.user.tag}\nReason: ${reason}`, 0xff0000);
    i.reply({ embeds: [embed] });
  }


  if (cmd === "kick") {
    if (!isOwner) return i.reply({ content: "❌ Only the bot owner can use this command!", ephemeral: true });

    const user = i.options.getUser("user");
    const reason = i.options.getString("reason") || "No reason";
    const m = i.guild.members.cache.get(user.id);
    if (!m) return i.reply({ content: "User not found", ephemeral: true });

    await m.kick(reason);

    const embed = new EmbedBuilder()
      .setTitle("👢 User Kicked")
      .setDescription(`${user.tag} kicked by ${i.user.tag}\nReason: ${reason}`)
      .setColor(0xffa500)
      .setTimestamp();

    logEmbed("Kick", `${user.tag} kicked by ${i.user.tag}\nReason: ${reason}`, 0xffa500);
    i.reply({ embeds: [embed] });
  }


  if (cmd === "mute") {
    if (!isOwner) return i.reply({ content: "❌ Only the bot owner can use this command!", ephemeral: true });

    const user = i.options.getUser("user");
    const m = i.guild.members.cache.get(user.id);
    if (!m) return i.reply({ content: "User not found", ephemeral: true });

    await m.timeout(600000); // 10 minutes, May this work

    const embed = new EmbedBuilder()
      .setTitle("🔇 User Muted")
      .setDescription(`${user.tag} muted by ${i.user.tag} for 10 minutes`)
      .setColor(0xffff00)
      .setTimestamp();

    logEmbed("Mute", `${user.tag} muted by ${i.user.tag} for 10 minutes`, 0xffff00);
    i.reply({ embeds: [embed] });
  }


  if (cmd === "clear") {
    if (!isOwner) return i.reply({ content: "❌ Only the bot owner can use this command!", ephemeral: true });

    const a = i.options.getInteger("amount");
    await i.channel.bulkDelete(a);

    const embed = new EmbedBuilder()
      .setTitle("🧹 Messages Deleted")
      .setDescription(`${a} messages deleted by ${i.user.tag}`)
      .setColor(0x00ff00)
      .setTimestamp();

    logEmbed("Clear", `${a} messages deleted by ${i.user.tag}`, 0x00ff00);
    i.reply({ embeds: [embed], ephemeral: true });
  }


  if (cmd === "warn") {
    if (!isOwner) return i.reply({ content: "❌ Only the bot owner can use this command!", ephemeral: true });

    const user = i.options.getUser("user");
    const data = JSON.parse(fs.readFileSync("warns.json"));
    if (!data[user.id]) data[user.id] = 0;
    data[user.id]++;
    fs.writeFileSync("warns.json", JSON.stringify(data));

    const embed = new EmbedBuilder()
      .setTitle("⚠️ User Warned")
      .setDescription(`${user.tag} warned by ${i.user.tag}\nTotal warnings: ${data[user.id]}`)
      .setColor(0xff9900)
      .setTimestamp();

    logEmbed("Warn", `${user.tag} warned by ${i.user.tag}\nTotal warnings: ${data[user.id]}`, 0xff9900);
    i.reply({ embeds: [embed] });
  }


  if (cmd === "warnings") {
    const user = i.options.getUser("user");
    const data = JSON.parse(fs.readFileSync("warns.json"));
    const w = data[user.id] || 0;

    const embed = new EmbedBuilder()
      .setTitle("⚠️ User Warnings")
      .setDescription(`${user.tag} has ${w} warning(s)`)
      .setColor(0xffff00)
      .setTimestamp();

    i.reply({ embeds: [embed], ephemeral: true });
  }


  if (cmd === "resetwarn") {
    if (!isOwner) return i.reply({ content: "❌ Only the bot owner can use this command!", ephemeral: true });

    const user = i.options.getUser("user");
    const data = JSON.parse(fs.readFileSync("warns.json"));
    data[user.id] = 0;
    fs.writeFileSync("warns.json", JSON.stringify(data));

    const embed = new EmbedBuilder()
      .setTitle("⚠️ Warnings Reset")
      .setDescription(`Warnings for ${user.tag} have been reset`)
      .setColor(0x00ff99)
      .setTimestamp();

    logEmbed("ResetWarn", `Warnings reset for ${user.tag}`, 0x00ff99);
    i.reply({ embeds: [embed] });
  }


  if (cmd === "ticket") {
    const channel = await i.guild.channels.create({
      name: `ticket-${i.user.username}`,
      type: ChannelType.GuildText,
      parent: process.env.TICKET_CATEGORY
    });

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket Created")
      .setDescription(`Support will assist ${i.user}`)
      .setColor(0x00ccff)
      .setTimestamp();

    channel.send({ embeds: [embed] });
    i.reply({ content: "Ticket created", ephemeral: true });
  }


  if (cmd === "ping") {
    const embed = new EmbedBuilder()
      .setTitle("🏓 Pong!")
      .setDescription(`Latency: ${client.ws.ping}ms`)
      .setColor(0x00ffff)
      .setTimestamp();
    i.reply({ embeds: [embed], ephemeral: true });
  }
});


const commands = [
  new SlashCommandBuilder().setName("ban").setDescription("Ban").addUserOption(o => o.setName("user").setRequired(true)).addStringOption(o => o.setName("reason")),
  new SlashCommandBuilder().setName("kick").setDescription("Kick").addUserOption(o => o.setName("user").setRequired(true)),
  new SlashCommandBuilder().setName("mute").setDescription("Mute").addUserOption(o => o.setName("user").setRequired(true)),
  new SlashCommandBuilder().setName("clear").setDescription("Clear").addIntegerOption(o => o.setName("amount").setRequired(true)),
  new SlashCommandBuilder().setName("warn").setDescription("Warn").addUserOption(o => o.setName("user").setRequired(true)),
  new SlashCommandBuilder().setName("warnings").setDescription("See warnings").addUserOption(o => o.setName("user").setRequired(true)),
  new SlashCommandBuilder().setName("resetwarn").setDescription("Reset warnings").addUserOption(o => o.setName("user").setRequired(true)),
  new SlashCommandBuilder().setName("ticket").setDescription("Create ticket"),
  new SlashCommandBuilder().setName("ping").setDescription("Ping")
].map(c => c.toJSON());

// REGISTER SERVER-ONLY COMMANDS
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
(async () => {
  await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
  console.log("✅ Commands loaded for server-only!");
})();

client.login(process.env.TOKEN);
