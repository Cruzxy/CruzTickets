const { SlashCommandBuilder, PermissionsBitField, ContainerBuilder, MessageFlags, ActionRowBuilder, TextDisplayBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Envia a messagem de ticket no canal atual.'),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Você Não tem permissão de utilizar o comando.', flags: MessageFlags.Ephemeral });
        }

        const container = new ContainerBuilder()

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
                .addOptions(
                    new StringSelectMenuOptionBuilder().setLabel('Categoria 1').setValue('categoria1'),
                    new StringSelectMenuOptionBuilder().setLabel('Categoria 2').setValue('categoria2'),
                    new StringSelectMenuOptionBuilder().setLabel('Categoria 3').setValue('categoria3')
                )
            )
        );

        await interaction.reply({ components: [container], flags: [MessageFlags.IsComponentsV2] });
    }
};