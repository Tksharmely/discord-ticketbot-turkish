const {
    SlashCommandBuilder
  } = require('@discordjs/builders');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('sustur')
      .setDescription('Bir üyeyi sustur.')
      .addUserOption(option =>
        option.setName('hedef')
        .setDescription('Üyeyi sustur')
        .setRequired(true))
      .addStringOption(option =>
        option.setName('sebep')
        .setDescription('Susturma sebebi')
        .setRequired(false)),
    async execute(interaction, client) {
      const user = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.options.getUser('hedef').id);
      const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);
  
      if (!executer.permissions.has(client.discord.Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({
        content: 'Yetkin yok.',
        ephemeral: true
      });
  
      if (user.roles.highest.rawPosition > executer.roles.highest.rawPosition) return interaction.reply({
        content: 'Bu kişiyi susturmazsın.',
        ephemeral: true
      });
  
      if (!user.bannable) return interaction.reply({
        content: 'Bu üyeyi susturamam.',
        ephemeral: true
      });
  
      if (interaction.options.getString('sebep')) {
        user.mute({
          reason: interaction.options.getString('Sebep'),
          minutes: 60
        });
        interaction.reply({
          content: `**${user.user.tag}** susturuldu!`
        });
      } else {
        user.mute({
          minutes: 60
        });
        interaction.reply({
          content: `**${user.user.tag}** susturuldu!`
        });
      };
    },
  };