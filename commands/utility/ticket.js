const { SlashCommandBuilder, PermissionsBitField, ContainerBuilder, MessageFlags, ActionRowBuilder, TextDisplayBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

const config = require("../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Envia a messagem de ticket no canal atual.'),
    async execute(interaction) {

        console.log(config)

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Você Não tem permissão de utilizar o comando.', flags: MessageFlags.Ephemeral });
        }

        const options = Object.keys(config.categorias).map(key => {
            const category = config.categorias[key];
            return {
                label: `Ticket ${category.nome.charAt(0).toUpperCase() + category.nome.slice(1)}`,
                emoji: category.emoji,
                value: category.value,
                description: `Tickets relacionados a ${category.nome}.`,
            };
        });


        const container = new ContainerBuilder()
        .setAccentColor(0x0099FF)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
            .setContent(
                "**ATENDIMENTO**\n\n" +
                "Seja bem-vindo(a) ao sistema de atendimento. Através do atendimento, você pode falar diretamente com nossa equipe.\n\n" +
                "- Iniciar um atendimento sem um motivo coerente poderá resultar em punições.\n" +
                "- Forneça o motivo e o máximo de informações possível para agilizar seu atendimento.\n" +
                "- Não chame membros da equipe no privado."
            )
        )
        .addActionRowComponents(
            new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('categorias')
                .setPlaceholder('➡ Selecione sua categoria aqui')
                .addOptions(options)
            )
        );

        await interaction.reply({ components: [container], flags: [MessageFlags.IsComponentsV2] });
    }
};