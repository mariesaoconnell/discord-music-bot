const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()

		// PLAY COMMAND .. USER TYPES: '/PLAY'
		.setName('play')
		.setDescription('Plays a song.')

		// SEARCH SUBCOMMAND
		.addSubcommand((subcommand) => {
			subcommand
				.setName('search')
				.setDescription('Searches for a song.')
				.addStringOption((option) => {
					option
						.setName('searchterms')
						.setDescription('search keywords.')
						.setRequired(true);
				});
		})

		// PLAYLIST SUBCOMMAND
		.addSubcommand((subcommand) => {
			subcommand
				.setName('playlist')
				.setDescription('Plays playlist from YT.')
				.addStringOption((option) => {
					option
						.setName('url')
						.setDescription('Playlist URL')
						.setRequired(true);
				});
		})

		// SONG SUBCOMMAND
		.addSubcommand((subcommand) => {
			subcommand
				.setName('song')
				.setDescription('Plays song from YT')
				.addStringOption((option) => {
					option
						.setName('url')
						.setDescription('url of the song')
						.setRequired(true);
				});
		}),

	// EXECUTE COMMAND
	execute: async ({ client, interaction }) => {
		// CHECK IF USER IS IN VC
		if (!interaction.member.voice.channel) {
			await interaction.reply(
				'You must be in a voice channel to use this command.'
			);
			return;
		}

		// START QUEUE AND BOT JOIN VC
		const queue = await client.player.createQueue(interaction.guild);
		if (!queue.connection)
			await queue.connect(interaction.member.voice.channel);

		// CREATE EMBED MESSAGE
		let embed = new MessageEmbed();

		// CHECK SUBCOMMAND

		// SONG SUBCOMMAND
		if (interaction.options.getSubcommand() === 'song') {
			let url = interaction.options.getString('url');

			const result = await client.player.search(url, {
				requestedBy: interaction.user,
				searchEngine: QueryType.YOUTUBE_VIDEO,
			});

			if (result.tracks.length <= 0) {
				await interaction.reply('No results found.');
				return;
			}

			const song = result.tracks[0];
			await queue.addTrack(song);

			embed
				.setDescription(`Added **[${song.title}](${song.url})** to the queue.`)
				.setThumbnail(song.thumbnail)
				.setFooter({ text: `Duration: ${song.duration}` });
		}

		// PLAYLIST SUBCOMMAND
		else if (interaction.options.getSubcommand() === 'playlist') {
			let url = interaction.options.getString('url');

			const result = await client.player.search(url, {
				requestedBy: interaction.user,
				searchEngine: QueryType.YOUTUBE_PLAYLIST,
			});

			if (result.tracks.length <= 0) {
				await interaction.reply('No playlist found.');
				return;
			}

			const playlist = result.playlist[0];
			await queue.addTracks(playlist);

			embed
				.setDescription(
					`Added **[${playlist.title}](${playlist.url})** to the queue.`
				)
				.setThumbnail(playlist.thumbnail)
				.setFooter({ text: `Duration: ${playlist.duration}` });
		}

		// SEARCHTERMS SUBCOMMAND
		else if (interaction.options.getSubcommand() === 'song') {
			let url = interaction.options.getString('searchterms');

			const result = await client.player.search(url, {
				requestedBy: interaction.user,
				searchEngine: QueryType.AUTO,
			});

			if (result.tracks.length <= 0) {
				await interaction.reply('No results found.');
				return;
			}

			const song = result.tracks[0];
			await queue.addTrack(song);

			embed
				.setDescription(`Added **[${song.title}](${song.url})** to the queue.`)
				.setThumbnail(song.thumbnail)
				.setFooter({ text: `Duration: ${song.duration}` });
		}

		// CHECK IF QUEUE IS PLAYING AND THEN PLAY
		if(!queue.playing) await queue.play();

		await interaction.reply({
			embeds: [embed]
		})
	}
};
