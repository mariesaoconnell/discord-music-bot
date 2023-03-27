const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Shows the first 10 songs in the queue'),
  execute: async ({client, interaction}) => {
    const queue = client.player.getQueue(interaction.guild);

    if(!queue || !queue.playing){
      await interaction.reply('There is no song playing.')
      return;
    }

    // ITERATES OVER THE QUEUE AND RETURNS # / SONG DURATION / SONG TITLE / WHO REQUESTED THE SONG
    const queueString = queue.tracks.slice(0, 10).map((song, i) => {
      return `${ i+1 } [${song.duration}]\` ${song.title} - <@${song.requestedBy.id}>`
    }).join("\n");
  }
}
