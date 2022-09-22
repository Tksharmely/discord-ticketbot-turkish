const {
  SlashCommandBuilder
} = require('@discordjs/builders');
const { Message } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ekle')
    .setDescription('Ticketa bir üye ekle.')
    .addUserOption(option =>
      option.setName('eklenecekuye')
      .setDescription('Ticketa bir üye ekler.')
      .setRequired(true)),
  async execute(interaction, client) {
    const chan = client.channels.cache.get(interaction.channelId);
    const user = interaction.options.getUser('eklenecekuye');

    if (chan.name.includes('ticket')) {
      chan.edit({
        permissionOverwrites: [{
          id: user,
          allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
        },
        {
          id: interaction.options.getMember.id,
          allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
        },
        {
          id: interaction.guild.roles.everyone,
          deny: ['VIEW_CHANNEL'],
        },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
      ],
      }).then(async () => {
        interaction.reply({
          content: `<@${user.id}> ticketa eklendi.`
        });
      });
    } else {
      interaction.reply({
        content: 'Bir ticketın yok!',
        ephemeral: true
      });
    };
  },
};
