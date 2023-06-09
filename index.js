// IMPORT ENVIRONMENT VARIABLES
require('dotenv').config();

// IMPORT LIBRARIES
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, IntentsBitField, Collection } = require('discord.js');
const { Player } = require('discord-player');

// RESPONSIBLE FOR LOADING COMMANDS FROM COMMAND CENTER
const fs = require('fs');
const path = require('path');

// INTENTS
const myIntents = new IntentsBitField();
myIntents.add(
	IntentsBitField.Flags.Guilds,
	IntentsBitField.Flags.GuildMessages,
	IntentsBitField.Flags.GuildVoiceStates
);

// CREATE CLIENT AND SET INTENTS
const client = new Client({ intents: myIntents });

// LOAD ALL THE COMMANDS
const commands = [];
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands'); // E:\yt\discord bot\js\intro\commands
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	client.commands.set(command.data.name, command);
	commands.push(command.data.toJSON());
}

// CREATE PLAYER
client.player = new Player(client);

// REGISTER COMMANDS
client.on('ready', () => {
	// Get all ids of the servers
	const guild_ids = client.guilds.cache.map((guild) => guild.id);

	const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
	for (const guildId of guild_ids) {
		rest
			.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), {
				body: commands,
			})
			.then(() =>
				console.log('Successfully updated commands for guild ' + guildId)
			)
			.catch(console.error);
	}
});

// EXECUTE COMMANDS WHEN USER TYPES IN
client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute({ client, interaction });
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'There was an error executing this command',
		});
	}
});

// LOG INTO BOT
client.login(process.env.TOKEN);
