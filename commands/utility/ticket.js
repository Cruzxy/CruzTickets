const fs = require('fs');
const path = require('path');
const {
    SlashCommandBuilder,
    PermissionsBitField,
    ContainerBuilder,
    TextDisplayBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    MessageFlags,
} = require('discord.js');

const configManager = require('../../utils/configManager');

function ensureCategorias(guildId) {
    const cfg = configManager.getGuildConfig(guildId);
    if (!cfg.categorias || Object.keys(cfg.categorias).length === 0) {
        cfg.categorias = {};
        configManager.saveGuildConfig(guildId, cfg);
    }
    return cfg.categorias;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Painel de tickets e configurações (Container).'),

    async execute(interaction) {
        const guildConfig = configManager.getGuildConfig(interaction.guild.id);

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Você não tem permissão para usar este comando.', flags: MessageFlags.Ephemeral });
        }

        ensureCategorias(interaction.guild.id);
        const categorias = ensureCategorias(interaction.guild.id);

        // Criar container simples e válido
        const container = new ContainerBuilder()
            .setAccentColor(0x00a2ff)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# 🎟️ Painel de Tickets - Administrativo')
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('**Bem-vindo!** Use as opções abaixo para gerenciar seu sistema de suporte.')
            )
            .addSeparatorComponents(s => s.setDivider(true))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## 📩 Enviar Painel de Tickets\n**Como funciona:** Os usuários selecionam uma categoria e um canal privado é criado automaticamente.')
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('post_panel')
                        .setLabel('📢 Enviar Painel')
                        .setStyle(ButtonStyle.Success)
                )
            )
            .addSeparatorComponents(s => s.setDivider(true))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## ⚙️ Configurações do Sistema\n**Gerencie:** categorias, canais de log, notificações e cargos.')
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('painel_config_menu')
                        .setPlaceholder('⚙️ Escolha uma configuração')
                        .addOptions([
                            { label: '📂 Gerenciar Categorias', value: 'menu_categorias', description: 'Adicionar, remover ou listar categorias de tickets', emoji: '📂' },
                            { label: '📝 Canal de Logs', value: 'menu_logs_ticket', description: 'Define onde os transcripts dos tickets serão salvos', emoji: '📝' },
                            { label: '💬 Canal de Notificações', value: 'menu_channel_ticket', description: 'Canal para notificar sobre novos tickets', emoji: '💬' },
                            { label: '👥 Cargos de Notificação', value: 'menu_roles_notification', description: 'Cargos mencionados nas notificações de novo ticket', emoji: '👥' },
                        ])
                )
            )
            .addSeparatorComponents(s => s.setDivider(true))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## 📊 Informações & Ajuda\n**Visualize** as configurações atuais do servidor.')
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('show_panel_help')
                        .setLabel('❓ Ajuda')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('show_config_status')
                        .setLabel('📋 Status')
                        .setStyle(ButtonStyle.Secondary)
                )
            );

        try {
            await interaction.reply({ components: [container], flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral] });
        } catch (err) {
            console.error('Erro ao enviar container:', err);

            // Fallback simples
            const fallbackEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('🎟️ Painel de Tickets - Administrativo')
                .setDescription('Sistema de gerenciamento de tickets.');

            const fallbackRow1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('post_panel').setLabel('📢 Enviar Painel').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('show_panel_help').setLabel('❓ Ajuda').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('show_config_status').setLabel('📋 Status').setStyle(ButtonStyle.Secondary)
            );

            const fallbackRow2 = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('painel_config_menu')
                    .setPlaceholder('⚙️ Escolha uma configuração')
                    .addOptions([
                        { label: '📂 Gerenciar Categorias', value: 'menu_categorias', description: 'Adicionar, remover ou listar categorias' },
                        { label: '📝 Canal de Logs', value: 'menu_logs_ticket', description: 'Define canal de logs' },
                        { label: '💬 Canal de Notificações', value: 'menu_channel_ticket', description: 'Define canal de notificações' },
                        { label: '👥 Cargos de Notificação', value: 'menu_roles_notification', description: 'Cargos mencionados nas notificações' },
                    ])
            );

            await interaction.reply({ embeds: [fallbackEmbed], components: [fallbackRow1, fallbackRow2], flags: MessageFlags.Ephemeral });
        }
    },
};