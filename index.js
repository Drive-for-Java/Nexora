require("dotenv").config();

const {
Client,
GatewayIntentBits,
SlashCommandBuilder,
Routes,
REST,
PermissionsBitField,
ChannelType
} = require("discord.js");

const fs=require("fs");


const client=new Client({

intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]

});


// WARN DATABASE

if(!fs.existsSync("warns.json"))
fs.writeFileSync("warns.json","{}");



function log(text){

let ch=client.channels.cache.get(process.env.LOG_CHANNEL);

if(ch) ch.send(text);

}



// READY

client.once("ready",()=>{

console.log("🛡️ Nexora v2 Online");

});



// WELCOME + AUTOROLE

client.on("guildMemberAdd",member=>{

let ch=client.channels.cache.get(process.env.WELCOME_CHANNEL);

if(ch)

ch.send(`🎉 Welcome ${member}

Enjoy your stay!`);



if(process.env.AUTOROLE_ID){

member.roles.add(process.env.AUTOROLE_ID);

}



log(`➕ ${member.user.tag} joined`);

});



client.on("guildMemberRemove",member=>{

log(`➖ ${member.user.tag} left`);

});



// COMMANDS

client.on("interactionCreate",async i=>{

if(!i.isChatInputCommand()) return;

let cmd=i.commandName;



// BAN

if(cmd==="ban"){

if(!i.member.permissions.has(PermissionsBitField.Flags.BanMembers))

return i.reply({content:"❌ Mods only",ephemeral:true});


let user=i.options.getUser("user");

let reason=i.options.getString("reason")||"No reason";

let m=i.guild.members.cache.get(user.id);

if(!m) return i.reply("User not found");


await m.ban({reason});

i.reply(`🔨 ${user.tag} banned`);

log(`🔨 ${user.tag} banned`);

}



// KICK

if(cmd==="kick"){

if(!i.member.permissions.has(PermissionsBitField.Flags.KickMembers))

return i.reply({content:"❌ Mods only",ephemeral:true});


let user=i.options.getUser("user");

let m=i.guild.members.cache.get(user.id);

if(!m) return i.reply("User not found");


await m.kick();

i.reply(`👢 ${user.tag} kicked`);

log(`👢 ${user.tag} kicked`);

}



// MUTE

if(cmd==="mute"){

if(!i.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))

return i.reply({content:"❌ Mods only",ephemeral:true});


let user=i.options.getUser("user");

let m=i.guild.members.cache.get(user.id);

await m.timeout(600000);

i.reply(`🔇 ${user.tag} muted`);

log(`🔇 ${user.tag} muted`);

}



// CLEAR

if(cmd==="clear"){

if(!i.member.permissions.has(PermissionsBitField.Flags.ManageMessages))

return i.reply({content:"❌ Mods only",ephemeral:true});


let a=i.options.getInteger("amount");

await i.channel.bulkDelete(a);

i.reply({content:`🧹 ${a} deleted`,ephemeral:true});

log(`🧹 ${a} messages deleted`);

}



// WARN

if(cmd==="warn"){

if(!i.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))

return i.reply({content:"❌ Mods only",ephemeral:true});


let user=i.options.getUser("user");

let data=JSON.parse(fs.readFileSync("warns.json"));

if(!data[user.id]) data[user.id]=0;

data[user.id]++;

fs.writeFileSync("warns.json",JSON.stringify(data));

i.reply(`⚠️ ${user.tag} warned`);

log(`⚠️ ${user.tag} warned`);

}



// WARNINGS

if(cmd==="warnings"){

let user=i.options.getUser("user");

let data=JSON.parse(fs.readFileSync("warns.json"));

let w=data[user.id]||0;

i.reply(`⚠️ ${user.tag}

Warnings: ${w}`);

}



// RESETWARN

if(cmd==="resetwarn"){

if(!i.member.permissions.has(PermissionsBitField.Flags.Administrator))

return i.reply({content:"❌ Admin only",ephemeral:true});


let user=i.options.getUser("user");

let data=JSON.parse(fs.readFileSync("warns.json"));

data[user.id]=0;

fs.writeFileSync("warns.json",JSON.stringify(data));

i.reply("Warnings reset");

}



// TICKET

if(cmd==="ticket"){

let channel=await i.guild.channels.create({

name:`ticket-${i.user.username}`,

type:ChannelType.GuildText,

parent:process.env.TICKET_CATEGORY

});

channel.send(`🎫 ${i.user}

Support will help you`);

i.reply("Ticket created");

}



// PING

if(cmd==="ping"){

i.reply(`🏓 ${client.ws.ping}ms`);

}


});



// SLASH COMMANDS

const commands=[

new SlashCommandBuilder()

.setName("ban")

.setDescription("Ban")

.addUserOption(o=>o.setName("user").setRequired(true))

.addStringOption(o=>o.setName("reason")),



new SlashCommandBuilder()

.setName("kick")

.setDescription("Kick")

.addUserOption(o=>o.setName("user").setRequired(true)),



new SlashCommandBuilder()

.setName("mute")

.setDescription("Mute")

.addUserOption(o=>o.setName("user").setRequired(true)),



new SlashCommandBuilder()

.setName("clear")

.setDescription("Clear")

.addIntegerOption(o=>o.setName("amount").setRequired(true)),



new SlashCommandBuilder()

.setName("warn")

.setDescription("Warn")

.addUserOption(o=>o.setName("user").setRequired(true)),



new SlashCommandBuilder()

.setName("warnings")

.setDescription("See warnings")

.addUserOption(o=>o.setName("user").setRequired(true)),



new SlashCommandBuilder()

.setName("resetwarn")

.setDescription("Reset warnings")

.addUserOption(o=>o.setName("user").setRequired(true)),



new SlashCommandBuilder()

.setName("ticket")

.setDescription("Create ticket"),



new SlashCommandBuilder()

.setName("ping")

.setDescription("Ping")

].map(c=>c.toJSON());



const rest=new REST({version:"10"}).setToken(process.env.TOKEN);



(async()=>{

await rest.put(

Routes.applicationCommands(process.env.CLIENT_ID),

{body:commands}

);

console.log("Commands loaded");

})();



client.login(process.env.TOKEN);
