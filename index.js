require("dotenv").config();

const {
Client,
GatewayIntentBits,
SlashCommandBuilder,
Routes,
REST,
PermissionsBitField
} = require("discord.js");

const client = new Client({
 intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers
 ]
});


client.once("ready", () => {

 console.log("🛡️ Nexora Online");

});


client.on("interactionCreate", async interaction => {

 if (!interaction.isChatInputCommand()) return;

 const cmd = interaction.commandName;



 // BAN COMMAND

 if (cmd === "ban") {

 if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))

 return interaction.reply({
 content:"❌ You are not allowed to use this command",
 ephemeral:true
 });


 const user = interaction.options.getUser("user");
 const reason = interaction.options.getString("reason") || "No reason";

 const member = interaction.guild.members.cache.get(user.id);

 if (!member)
 return interaction.reply("❌ User not found");


 await member.ban({reason});

 interaction.reply(`🔨 ${user.tag} banned\nReason: ${reason}`);

 }




 // KICK COMMAND

 if (cmd === "kick") {

 if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))

 return interaction.reply({
 content:"❌ You are not allowed",
 ephemeral:true
 });


 const user = interaction.options.getUser("user");
 const reason = interaction.options.getString("reason") || "No reason";

 const member = interaction.guild.members.cache.get(user.id);

 if (!member)
 return interaction.reply("❌ User not found");


 await member.kick(reason);

 interaction.reply(`👢 ${user.tag} kicked\nReason: ${reason}`);

 }




 // MUTE COMMAND

 if (cmd === "mute") {

 if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))

 return interaction.reply({
 content:"❌ You are not allowed",
 ephemeral:true
 });


 const user = interaction.options.getUser("user");

 const member = interaction.guild.members.cache.get(user.id);

 if (!member)
 return interaction.reply("❌ User not found");


 await member.timeout(600000);

 interaction.reply(`🔇 ${user.tag} muted for 10 minutes`);

 }




 // CLEAR COMMAND

 if (cmd === "clear") {

 if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages))

 return interaction.reply({
 content:"❌ You are not allowed",
 ephemeral:true
 });


 const amount = interaction.options.getInteger("amount");

 await interaction.channel.bulkDelete(amount);

 interaction.reply({
 content:`🧹 Deleted ${amount} messages`,
 ephemeral:true
 });

 }



 // PING

 if (cmd === "ping") {

 interaction.reply(`🏓 Pong\n${client.ws.ping}ms`);

 }




 // USERINFO

 if (cmd === "userinfo") {

 const user = interaction.options.getUser("user") || interaction.user;

 const member = interaction.guild.members.cache.get(user.id);

 interaction.reply(

 `👤 User Info

Name: ${user.username}

Joined: ${member.joinedAt.toDateString()}

ID: ${user.id}`

 );

 }




});




const commands = [

new SlashCommandBuilder()

.setName("ban")

.setDescription("Ban user")

.addUserOption(o=>o.setName("user").setRequired(true).setDescription("User"))

.addStringOption(o=>o.setName("reason").setDescription("Reason")),



new SlashCommandBuilder()

.setName("kick")

.setDescription("Kick user")

.addUserOption(o=>o.setName("user").setRequired(true).setDescription("User"))

.addStringOption(o=>o.setName("reason").setDescription("Reason")),



new SlashCommandBuilder()

.setName("mute")

.setDescription("Mute user")

.addUserOption(o=>o.setName("user").setRequired(true).setDescription("User")),



new SlashCommandBuilder()

.setName("clear")

.setDescription("Delete messages")

.addIntegerOption(o=>o.setName("amount").setRequired(true).setDescription("Number")),



new SlashCommandBuilder()

.setName("ping")

.setDescription("Bot ping"),



new SlashCommandBuilder()

.setName("userinfo")

.setDescription("User info")

.addUserOption(o=>o.setName("user").setDescription("User"))

].map(c=>c.toJSON());



const rest=new REST({version:"10"}).setToken(process.env.TOKEN);



(async()=>{

await rest.put(

Routes.applicationCommands(process.env.CLIENT_ID),

{body:commands}

);

console.log("Commands Loaded");

})();



client.login(process.env.TOKEN);
