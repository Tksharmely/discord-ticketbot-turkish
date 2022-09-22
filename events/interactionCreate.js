let hastebin = require('hastebin');
const { MessageEmbed } = require('discord.js');
module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'Zaten oluşturulmuş bir ticketın var!',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        interaction.reply({
          content: `Ticketın oluşturuldu > <#${c.id}>`,
          ephemeral: true
        });

        const embed = new MessageEmbed()
          .setColor('ff9600')
          .setAuthor('Departman Seçimi Yap', ' ')
          .setDescription('Ticket departmanını seç.')
          .setFooter('LSRP - Ticket Sistemi', ' ')
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Ticket departmanını seç')
            .addOptions([{
                label: 'Genel',
                value: 'Genel',
                emoji: { name: '📑' }
              },
              {
                label: 'Destek',
                value: 'Destek',
                emoji: { name: '❓' }
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 20000
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new MessageEmbed()
                  .setColor('ff9600')
                  .setAuthor('Ticket', ' ')
                  .setDescription(`<@!${interaction.user.id}>, ・ ${i.values[0]} sebebiyle ticket oluşturdu.`)
                  .setFooter('LSRP.tr - Ticket Sistemi', ' ')
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('Ticketı Kapat')
                    .setEmoji('899745362137477181')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
            if (i.values[0] == 'Apply') {
              c.edit({
                parent: client.config.parentApply
              });
            };
            if (i.values[0] == 'Support') {
              c.edit({
                parent: client.config.parentSupport
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Departman seçilmedi, ticket kapatılıyor...`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('Ticketı Kapat')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('İptal Et')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'Ticketı kapatmak istediğinden emin misin?',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `Ticket <@!${interaction.user.id}> tarafından kapatıldı.`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new MessageEmbed()
                .setColor('ff9600')
                .setAuthor('Ticket', ' ')
                .setDescription('```Ticket kaydediliyor```')
                .setFooter('LSRP.tr - Ticket Sistemi', ' ')
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('Ticketı Sil')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'Ticket kapatma iptal edildi!',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Ticket kapatma iptal edildi!',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: 'Ticket kaydediliyor...'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('tr-TR')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Ticketta yazı yazılmadı."
        hastebin.createPaste(a, {
            contentType: 'text/plain',
            server: 'https://hastebin.com'
          }, {})
          .then(function (urlToPaste) {
            const embed = new MessageEmbed()
              .setAuthor('Ticket Logu', ' ')
              .setDescription(`📰 Ticket-Logu \`${chan.name}\`, <@!${chan.topic}> tarafından oluşturuldu ve<@!${interaction.user.id}> tarafından silindi.\n\nLog Kaydı: [**Kaydı görüntülemek için buraya tıkla.**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            const embed2 = new MessageEmbed()
              .setAuthor('Logs Ticket', ' ')
              .setDescription(`📰 Ticketının logu \`${chan.id}\`: [**Kaydı görüntülemek için buraya tıkla.**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            });

            setTimeout(() => {
              chan.delete();
            }, 5000);
          });
      });
    };
  },
};
