const {
  SlashCommandBuilder
} = require('@discordjs/builders');
const db = require('quick.db');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('cikar')
    .setDescription('Tickettan bir üyeyi çıkar.')
    .addUserOption(option =>
      option.setName('cikarilacakuye')
      .setDescription('Tickettan bir üye çıkarır.')
      .setRequired(true)),
  async execute(interaction, client) {
    const chan = client.channels.cache.get(interaction.channelId);
    const user = interaction.options.getUser('cikarilacakuye');

    if (chan.name.includes('ticket')) {
      chan.edit({
        permissionOverwrites: [{
          id: user,
          deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
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
          content: `<@${user.id}> tickettan çıkarıldı.`
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
