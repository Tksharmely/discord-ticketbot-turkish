const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Bir üyeyi kickler.')
    .addUserOption(option =>
      option.setName('hedef')
      .setDescription('Kick member')
      .setRequired(true))
    .addStringOption(option =>
        option.setName('sebep')
        .setDescription('kick sebebi')
        .setRequired(false)),
  async execute(interaction, client) {
    const user = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.options.getUser('hedef').id);
    const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);

    if (!executer.permissions.has(client.discord.Permissions.FLAGS.KICK_MEMBERS)) return interaction.reply({
      content: 'Yetkin yok!',
      ephemeral: true
    });

    if (user.roles.highest.rawPosition > executer.roles.highest.rawPosition) return interaction.reply({
      content: 'Bu kişiyi kickleyemezsin.',
      ephemeral: true
    });

    if (!user.kickable) return interaction.reply({
      content: 'Bu üyeyi kickleyemem..',
      ephemeral: true
    });

    if (interaction.options.getString('sebep')) {
      user.kick(interaction.options.getString('sebep'))
      interaction.reply({
        content: `**${user.user.tag}** kicklendi!`
      });
    } else {
      user.kick()
      interaction.reply({
        content: `**${user.user.tag}** kicklendi!`
      });
    };
  },
};