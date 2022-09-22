const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bir üyeyi banlar.')
    .addUserOption(option =>
      option.setName('hedef')
      .setDescription('Banlanacak üye')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
      .setDescription('Ban sebebi')
      .setRequired(false)),
  async execute(interaction, client) {
    const user = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.options.getUser('hedef').id);
    const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);

    if (!executer.permissions.has(client.discord.Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({
      content: 'Yetkin yok.',
      ephemeral: true
    });

    if (user.roles.highest.rawPosition > executer.roles.highest.rawPosition) return interaction.reply({
      content: 'Bu kişiyi banlayamazsın.',
      ephemeral: true
    });

    if (!user.bannable) return interaction.reply({
      content: 'Bu kişiyi banlayamam.',
      ephemeral: true
    });

    if (interaction.options.getString('sebep')) {
      user.ban({
        reason: interaction.options.getString('sebep'),
        days: 1
      });
      interaction.reply({
        content: `**${user.user.tag}** banlandı.`
      });
    } else {
      user.ban({
        days: 1
      });
      interaction.reply({
        content: `**${user.user.tag}** banlandı.`
      });
    };
  },
};