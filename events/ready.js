module.exports = {
  name: 'ready',
  async execute(client) {
    console.log('Bot Online!')
    console.log('Bot Dev Sayrix');
    const oniChan = client.channels.cache.get(client.config.ticketChannel)
    const { MessageEmbed } = require('discord.js');
    function sendTicketMSG() {
      const embed = new MessageEmbed()
        .setColor('ff0000')
        .setAuthor('LSRP.tr Ticket', client.user.avatarURL())
        .setDescription('LSRP.tr Ticket Sistemine hoş geldin\n\nİki adet ticket departmanı bulunuyor. Bunu aşağıdaki tuşa bastıktan sonra seçeceksin. Ticket açmak için, aşağıdaki butona bas.\nGenel\nHerhangi bir konu hakkında yetkililer ile iletişime geçebilirsin.\nDestek Talebi\nDiscord sunucusu ile ilgili her türlü sorunlar.')
        .setFooter(client.config.footerText, client.user.avatarURL())
      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('open-ticket')
          .setLabel('Ticket Oluştur')
          .setEmoji('🎫')
          .setStyle('PRIMARY'),
        );

      oniChan.send({
        embeds: [embed],
        components: [row]
      })
    }

    const toDelete = 10000;

    async function fetchMore(channel, limit) {
      if (!channel) {
        throw new Error(`Kanal created ${typeof channel}.`);
      }
      if (limit <= 100) {
        return channel.messages.fetch({
          limit
        });
      }

      let collection = [];
      let lastId = null;
      let options = {};
      let remaining = limit;

      while (remaining > 0) {
        options.limit = remaining > 100 ? 100 : remaining;
        remaining = remaining > 100 ? remaining - 100 : 0;

        if (lastId) {
          options.before = lastId;
        }

        let messages = await channel.messages.fetch(options);

        if (!messages.last()) {
          break;
        }

        collection = collection.concat(messages);
        lastId = messages.last().id;
      }
      collection.remaining = remaining;

      return collection;
    }

    const list = await fetchMore(oniChan, toDelete);

    let i = 1;

    list.forEach(underList => {
      underList.forEach(msg => {
        i++;
        if (i < toDelete) {
          setTimeout(function () {
            msg.delete()
          }, 1000 * i)
        }
      })
    })

    setTimeout(() => {
      sendTicketMSG()
    }, i);
  },
};
