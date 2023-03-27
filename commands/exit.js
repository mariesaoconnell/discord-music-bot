const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('exit')
		.setDescription('Exits the Voice Channel.'),
	execute: async ({ client, interaction }) => {
		const queue = client.player.getQueue(interaction.guild);

		if (!queue) {
			await interaction.reply('There is no song playing.');
			return;
		}
		const currentSong = queue.current;

		queue.destroy();

		await interaction.reply('Thanks for listening! 👉😎👉');
	},
};
