const { Events, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            
            if (!command || !command.autocomplete) return;
    
            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(`Erro no autocomplete do comando ${interaction.commandName}:`, error);
            }
            return;
        }

        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Houve um erro ao executar este comando!', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: 'Houve um erro ao executar este comando!', flags: MessageFlags.Ephemeral });
                }
            }
        } else if (interaction.isButton()) {

        } else if (interaction.isModalSubmit()) {

        }
    },
};