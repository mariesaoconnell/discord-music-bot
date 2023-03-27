// IMPORT ENVIRONMENT VARIABLES
require('dotenv').config();

// IMPORT LIBRARIES
const { REST } = require("@discordjs/rest");
const { Routes } = require('discord-api-types');
const { Client, Intents, Collection } = require('discord.js');
const { Player } = require('discord-player');

// RESPONSIBLE FOR LOADING COMMANDS FROM COMMAND CENTER
const fs = require('node:fs');
const path = require('node:path');

// CREATE CLIENT
const client = new Client({

  // GIVE INTENTS THAT THE BOT WILL BE USING
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILDS_MESSAGES,
    Intents.FLAGS.GUILDS_VOICE_STATES,
  ]
});

// LOAD ALL THE COMMANDS
const commands = [];
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for(const file of commandFiles){
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  client.commands.set(command.data.name, command);
  commands.push(command)
}

// CREATE PLAYER
client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25
  }
});


// REGISTER COMMANDS
client.on("ready", () => {
  const guild_ids = client.guilds.cache.map(guild => guild.id);

  const rest = new REST({version: "9"}).setToken(process.env.TOKEN);

  for(const guildId of guild_ids){
    rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), {
      body: commands
    })
    .then(() => console.log(`Added commands to ${guildId}`))
    .catch(console.error);
  }
})


// EXECUTE COMMANDS WHEN USER TYPES IN
client.on("interactionCreate", async interaction => {
  if(!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if(!command) return


  try {
    await command.execute({client, interaction});
  } catch(err) {
    console.error(err)
    await interaction.reply("An error occurred while executing that command.")
  }
});

// LOG INTO BOT
client.login(process.env.TOKEN)
