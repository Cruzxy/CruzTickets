const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {

  client.user.setActivity('https://github.com/Cruzxy/CruzTickets', {
    type: ActivityType.Competing
  });

  },
};