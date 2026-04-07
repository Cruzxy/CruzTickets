const fs = require('fs');
const path = require('path');
const {
    Events,
    MessageFlags,
    ChannelType,
    PermissionsBitField,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    UserSelectMenuBuilder,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
} = require('discord.js');

const Transcript = require('discord-html-transcripts');

const configManager = require('../utils/configManager');

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
            const config = configManager.getGuildConfig(interaction.guild.id);

            if (interaction.customId === 'staff_panel') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: '❌ Apenas administradores podem acessar o Painel Staff.', flags: MessageFlags.Ephemeral });
                }

                const staffRow1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('notify_author').setLabel('💬 Notificar Autor').setStyle(ButtonStyle.Success),
                );
                const staffRow2 = new ActionRowBuilder().addComponents(
                    new UserSelectMenuBuilder().setCustomId('add_member_select').setPlaceholder('➕ Selecione um usuário para adicionar'),
                );
                const staffRow3 = new ActionRowBuilder().addComponents(
                    new UserSelectMenuBuilder().setCustomId('remove_member_select').setPlaceholder('➖ Selecione um usuário para remover'),
                );

                return interaction.reply({ content: '🛠️ **Painel Staff** — Escolha uma ação:', components: [staffRow1, staffRow2, staffRow3], flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'notify_author') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: '❌ Apenas administradores podem usar esta função.', flags: MessageFlags.Ephemeral });
                }

                const usuario = await interaction.guild.members.fetch(interaction.channel.topic).catch(() => null);
                if (!usuario) {
                    return interaction.reply({ content: 'Não foi possível encontrar o autor do ticket.', flags: MessageFlags.Ephemeral });
                }

                await usuario.send({ content: `Ei <@${interaction.user.id}>, estamos aguardando sua resposta no ticket <#${interaction.channel.id}>` });
                return interaction.reply({ content: 'Autor notificado no privado.', flags: MessageFlags.Ephemeral });
            }



            if (interaction.customId === 'close') {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('realclose').setLabel('✅ Sim, fechar ticket').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('cancel_close').setLabel('❌ Cancelar').setStyle(ButtonStyle.Secondary),
                );
                return interaction.reply({ content: '⚠️ **Deseja realmente FECHAR este ticket?**\n\n📌 O canal será deletado em 10 segundos. Certifique-se de que todas as informações importantes foram salvas!', components: [row], flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'cancel_close') {
                return interaction.reply({ content: '✅ Fechamento cancelado. O ticket continua aberto.', flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'realclose') {
                const logChannel = config.logChannel ? interaction.guild.channels.cache.get(config.logChannel) : null;
                if (logChannel) {
                    try {
                        const transcript = await Transcript.createTranscript(interaction.channel);
                        await logChannel.send({ content: `📋 Transcript do ticket: ${interaction.channel.name}`, files: [transcript] });
                    } catch (error) {
                        console.error('Erro ao enviar transcript:', error);
                    }
                }

                await interaction.reply({ content: '✅ Ticket será fechado em 10 segundos. Obrigado por usar nosso sistema de suporte!', flags: MessageFlags.Ephemeral });
                setTimeout(async () => {
                    try {
                        await interaction.channel.delete();
                    } catch (error) {
                        console.error('Erro ao deletar canal:', error);
                    }
                }, 10000);
                return;
            }

            if (interaction.customId === 'list_cat') {
                const categorias = config.categorias || {};
                const lines = Object.values(categorias).map(c => `${c.emoji || ''} **${c.nome}** (value: ${c.value})`);
                const content = lines.length ? lines.join('\n') : 'Nenhuma categoria cadastrada.';
                return interaction.reply({ content: `Categorias:\n${content}`, flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'add_cat') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: 'Requer permissão de administrador.', flags: MessageFlags.Ephemeral });
                }

                const modal = new ModalBuilder().setCustomId('add_cat_modal').setTitle('Adicionar Categoria');
                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('nome').setLabel('Nome da categoria').setStyle(TextInputStyle.Short).setPlaceholder('Ex: Suporte, Bugs, Dúvidas').setRequired(true),
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('emoji').setLabel('Emoji').setStyle(TextInputStyle.Short).setPlaceholder('Ex: 🛠️ ou 💬').setRequired(true),
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('descricao').setLabel('Descrição (aparece no menu)').setStyle(TextInputStyle.Short).setPlaceholder('Ex: Para problemas técnicos').setRequired(false),
                    ),
                );

                return interaction.showModal(modal);
            }

            if (interaction.customId === 'remove_cat') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: 'Requer permissão de administrador.', flags: MessageFlags.Ephemeral });
                }

                const categorias = config.categorias || {};
                const keys = Object.keys(categorias);
                if (keys.length === 0) {
                    return interaction.reply({ content: '❌ Não há categorias para remover.', flags: MessageFlags.Ephemeral });
                }

                const row = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('remove_cat_select')
                        .setPlaceholder('Selecione a categoria para remover')
                        .addOptions(keys.map(k => ({
                            label: categorias[k].nome,
                            value: k,
                            emoji: categorias[k].emoji || undefined,
                            description: categorias[k].descricao || undefined,
                        })))
                );

                return interaction.reply({ content: '🗑️ Selecione a categoria que deseja **remover**:', components: [row], flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'edit_cat') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: 'Requer permissão de administrador.', flags: MessageFlags.Ephemeral });
                }

                const categorias = config.categorias || {};
                const keys = Object.keys(categorias);
                if (keys.length === 0) {
                    return interaction.reply({ content: '❌ Não há categorias para editar.', flags: MessageFlags.Ephemeral });
                }

                const row = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('edit_cat_select')
                        .setPlaceholder('Selecione a categoria para editar')
                        .addOptions(keys.map(k => ({
                            label: categorias[k].nome,
                            value: k,
                            emoji: categorias[k].emoji || undefined,
                            description: categorias[k].descricao || undefined,
                        })))
                );

                return interaction.reply({ content: '✏️ Selecione a categoria que deseja **editar**:', components: [row], flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'setlog') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: 'Requer permissão de administrador.', flags: MessageFlags.Ephemeral });
                }

                const row = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId('select_log_channel')
                        .setPlaceholder('Selecione o canal de logs')
                        .setChannelTypes([ChannelType.GuildText])
                );

                return interaction.reply({ content: 'Selecione o canal de logs abaixo:', components: [row], ephemeral: true });
            }

            if (interaction.customId === 'set_ticket_channel') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: 'Requer permissão de administrador.', flags: MessageFlags.Ephemeral });
                }

                const row = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId('select_ticket_channel')
                        .setPlaceholder('Selecione o canal para notificações de ticket')
                        .setChannelTypes([ChannelType.GuildText])
                );

                return interaction.reply({ content: 'Selecione o canal para notificações de ticket abaixo:', components: [row], ephemeral: true });
            }

            if (interaction.customId === 'post_panel') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: 'Requer permissão de administrador.', flags: MessageFlags.Ephemeral });
                }

                const cfg = configManager.getGuildConfig(interaction.guild.id);
                const categorias = cfg.categorias || {};

                if (Object.keys(categorias).length === 0) {
                    return interaction.reply({ content: '❌ Não há categorias configuradas. Use o painel de administração para adicionar categorias antes de publicar o painel de tickets.', flags: MessageFlags.Ephemeral });
                }

                const publicContainer = new ContainerBuilder()
                    .setAccentColor(0x00a2ff)
                    .addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent('# 🎫 Abrir um Ticket de Suporte'),
                                new TextDisplayBuilder().setContent('**Bem-vindo ao sistema de suporte!** 👋\n\nSelecione a categoria que melhor se encaixa com seu problema. Um canal privado será criado automaticamente para você!\n\n**Como funciona:**\n1️⃣ Escolha a categoria do seu problema\n2️⃣ Um canal privado será criado instantaneamente\n3️⃣ Descreva seu problema em detalhes\n4️⃣ Aguarde a resposta de nosso time\n\n💡 **Dica:** Quanto mais detalhes você fornecer, melhor poderemos ajudá-lo!'),
                            )
                            .setThumbnailAccessory(new ThumbnailBuilder().setURL(interaction.client.user.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png')),
                    )
                    .addActionRowComponents(
                        new ActionRowBuilder().addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('categorias')
                                .setPlaceholder('🎫 Selecione uma categoria para abrir um ticket')
                                .addOptions(Object.keys(categorias).map(k => ({ label: categorias[k].nome || k, value: k, emoji: categorias[k].emoji || undefined, description: categorias[k].descricao || undefined })))
                        ),
                    );

                try {
                    await interaction.channel.send({ components: [publicContainer], flags: MessageFlags.IsComponentsV2 });
                    return interaction.reply({ content: `✅ Painel publicado com sucesso em <#${interaction.channel.id}>!`, flags: MessageFlags.Ephemeral });
                } catch (err) {
                    console.error('Erro ao publicar painel público:', err);
                    return interaction.reply({ content: '❌ Falha ao publicar painel público. Verifique se há categorias configuradas.', flags: MessageFlags.Ephemeral });
                }
            }

            if (interaction.customId === 'paineladmin') {
                const adminContainer = new ContainerBuilder()
                    .setAccentColor(0x57f287)
                    .addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent('# Painel Administrativo'),
                                new TextDisplayBuilder().setContent('Use os botões abaixo para configurar o sistema de tickets e publicar seu painel.'),
                            )
                    )
                    .addActionRowComponents(
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('add_cat').setLabel('➕ Add categoria').setStyle(ButtonStyle.Primary),
                            new ButtonBuilder().setCustomId('remove_cat').setLabel('➖ Remover categoria').setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId('list_cat').setLabel('📄 Listar categorias').setStyle(ButtonStyle.Success),
                            new ButtonBuilder().setCustomId('setlog').setLabel('📝 Canal log').setStyle(ButtonStyle.Danger),
                        ),
                    );

                return interaction.reply({ components: [adminContainer], flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral] });
            }

            if (interaction.customId === 'show_panel_help') {
                const helpEmbed = new EmbedBuilder()
                    .setColor(0x00a2ff)
                    .setTitle('❓ Ajuda - Painel de Tickets')
                    .setDescription('Guia completo sobre como usar o painel de tickets.')
                    .addFields(
                        { name: '📩 Enviar Painel de Tickets', value: 'Clique em **"Enviar Painel"** para publicar a mensagem que permite aos usuários abrir tickets. Essa mensagem terá um select para escolher a categoria do ticket.' },
                        { name: '⚙️ Configurações do Sistema', value: '**Gerenciar Categorias:** Adicione, remova ou liste as categorias disponíveis.\n**Canal de Logs:** Define o canal onde os transcripts dos tickets fechados serão salvos (para auditoria).\n**Canal de Notificações:** Define o canal onde será enviada uma notificação quando um novo ticket for aberto.\n**Cargos de Notificação:** Cargos que serão mencionados (@) nas notificações de novo ticket.' },
                        { name: '📊 Status', value: 'Visualize todas as configurações atuais do servidor (categorias, canais, cargos).' },
                        { name: '🎫 Abrindo um Ticket (Usuários)', value: 'Os usuários clicam no painel publicado e selecionam uma categoria. Um canal privado é criado instantaneamente para o suporte.' },
                        { name: '🛠️ Dentro do Ticket (Ferramentas)', value: 'No canal do ticket, há botões para:\n• **💬 Notificar Autor:** Envia DM para o usuário que abriu o ticket\n• **➕ Adicionar Usuário:** Adiciona outro membro ao ticket\n• **➖ Remover Usuário:** Remove um membro do ticket\n• **❌ Fechar Ticket:** Fecha e deleta o canal após 10 segundos (salva transcript)' },
                        { name: '📋 Transcripts', value: 'Quando um ticket é fechado, um arquivo HTML completo da conversa é salvo no Canal de Logs. Útil para auditoria e análise.' }
                    )
                    .setFooter({ text: 'Para mais informações, contate o administrador do servidor.' });
                
                return interaction.reply({ embeds: [helpEmbed], flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'show_config_status') {
                const config = configManager.getGuildConfig(interaction.guild.id);
                const categorias = config.categorias || {};
                const notificationRoles = config.notificationRoles || config.whitelistRoles || [];

                const categoriasList = Object.values(categorias).length > 0 
                    ? Object.values(categorias).map(c => `${c.emoji} **${c.nome}** (${c.value})`).join('\n')
                    : '❌ Nenhuma categoria configurada';

                const rolesList = notificationRoles.length > 0 
                    ? notificationRoles.map(r => `<@&${r}>`).join(' ')
                    : '❌ Nenhum cargo configurado';

                const logChannel = config.logChannel 
                    ? `<#${config.logChannel}>` 
                    : '❌ ⚠️ Não configurado';

                const ticketChannel = config.ticketChannel 
                    ? `<#${config.ticketChannel}>` 
                    : '❌ ⚠️ Não configurado';

                const statusEmbed = new EmbedBuilder()
                    .setColor(0x00a2ff)
                    .setTitle('📋 Status - Configurações do Servidor')
                    .setDescription('Visualize todas as configurações atuais do sistema de tickets.')
                    .addFields(
                        { name: '📂 Categorias de Tickets', value: categoriasList, inline: false },
                        { name: '📝 Canal de Logs (Transcripts)', value: logChannel, inline: true },
                        { name: '💬 Canal de Notificações', value: ticketChannel, inline: true },
                        { name: '👥 Cargos de Notificação', value: rolesList, inline: false },
                        { name: '✅ Estatísticas', value: `Total de Categorias: **${Object.keys(categorias).length}**\nCargos Configurados: **${notificationRoles.length}**`, inline: false }
                    )
                    .setFooter({ text: 'Use /ticket para modificar essas configurações' });

                return interaction.reply({ embeds: [statusEmbed], flags: MessageFlags.Ephemeral });
            }

        } else if (interaction.isModalSubmit()) {
            const config = configManager.getGuildConfig(interaction.guild.id);
            const categorias = config.categorias || {};

            if (interaction.customId === 'add_cat_modal') {
                const nome = interaction.fields.getTextInputValue('nome').trim();
                const emoji = interaction.fields.getTextInputValue('emoji').trim();
                const descricao = interaction.fields.getTextInputValue('descricao')?.trim() || '';
                const key = nome.toLowerCase().replace(/\s+/g, '_');

                if (categorias[key]) {
                    return interaction.reply({ content: '❌ Categoria `' + nome + '` já existe.', flags: MessageFlags.Ephemeral });
                }

                categorias[key] = { nome, emoji, value: key, descricao };
                config.categorias = categorias;
                configManager.saveGuildConfig(interaction.guild.id, config);

                return interaction.reply({ content: `✅ Categoria **${emoji} ${nome}** adicionada com sucesso!${descricao ? `\n📝 Descrição: ${descricao}` : ''}`, flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'remove_cat_modal') {
                const nome = interaction.fields.getTextInputValue('nome').toLowerCase();
                if (!categorias[nome]) {
                    return interaction.reply({ content: 'Categoria `' + nome + '` não existe.', flags: MessageFlags.Ephemeral });
                }

                delete categorias[nome];
                config.categorias = categorias;
                configManager.saveGuildConfig(interaction.guild.id, config);

                return interaction.reply({ content: 'Categoria `' + nome + '` removida.', flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId.startsWith('edit_cat_modal:')) {
                const key = interaction.customId.split(':')[1];
                if (!categorias[key]) {
                    return interaction.reply({ content: '❌ Categoria não encontrada.', flags: MessageFlags.Ephemeral });
                }

                const nome = interaction.fields.getTextInputValue('nome').trim();
                const emoji = interaction.fields.getTextInputValue('emoji').trim();
                const descricao = interaction.fields.getTextInputValue('descricao')?.trim() || '';

                categorias[key].nome = nome;
                categorias[key].emoji = emoji;
                categorias[key].descricao = descricao;
                config.categorias = categorias;
                configManager.saveGuildConfig(interaction.guild.id, config);

                return interaction.reply({ content: `✅ Categoria **${emoji} ${nome}** atualizada com sucesso!${descricao ? `\n📝 Descrição: ${descricao}` : ''}`, flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'setlog_modal') {
                const channelId = interaction.fields.getTextInputValue('channelId');
                if (!interaction.guild.channels.cache.has(channelId)) {
                    return interaction.reply({ content: 'Canal inválido.', flags: MessageFlags.Ephemeral });
                }

                config.logChannel = channelId;
                configManager.saveGuildConfig(interaction.guild.id, config);

                return interaction.reply({ content: `Canal de log definido para <#${channelId}>.`, flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'set_ticket_channel_modal') {
                const channelId = interaction.fields.getTextInputValue('channelId');
                if (!interaction.guild.channels.cache.has(channelId)) {
                    return interaction.reply({ content: 'Canal inválido.', flags: MessageFlags.Ephemeral });
                }

                config.ticketChannel = channelId;
                configManager.saveGuildConfig(interaction.guild.id, config);

                return interaction.reply({ content: `Canal de ticket definido para <#${channelId}>.`, flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'add_member_modal') {
                // Legacy fallback - not used anymore
                return interaction.reply({ content: 'Use o Painel Staff para adicionar usuários.', flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'remove_member_modal') {
                // Legacy fallback - not used anymore
                return interaction.reply({ content: 'Use o Painel Staff para remover usuários.', flags: MessageFlags.Ephemeral });
            }


        } else if (interaction.isStringSelectMenu()) {
            // Direct ticket creation when category is selected (no priority selection)
            if (interaction.customId === 'categorias') {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                const config = configManager.getGuildConfig(interaction.guild.id);
                const categories = config.categorias || {};
                const selectedKey = interaction.values[0];
                const category = categories[selectedKey];

                if (!category) {
                    return interaction.editReply({ content: '❌ Categoria inválida.' });
                }

                // Check if user already has an open ticket
                const existing = interaction.guild.channels.cache.find(c => c.topic === interaction.user.id);
                if (existing) {
                    return interaction.editReply({ content: `⚠️ Você já tem um ticket aberto: ${existing}\n\nFeche o ticket anterior antes de abrir um novo.` });
                }

                // Create ticket channel directly
                const sanitized = category.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
                const channelName = `ticket-${sanitized}`;

                try {
                    const ticketChannel = await interaction.guild.channels.create({
                        name: channelName,
                        topic: interaction.user.id,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                            { id: interaction.guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        ],
                    });

                    // Create enhanced ticket container with admin actions
                    const ticketContainer = new ContainerBuilder()
                        .setAccentColor(0x2b2d31)
                        .addSectionComponents(
                            new SectionBuilder()
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder().setContent(`# 🎫 Ticket - ${category.emoji} ${category.nome}`),
                                    new TextDisplayBuilder().setContent(`✅ **Ticket criado com sucesso!**\n\n📋 **Informações do Ticket:**\n• 👤 Criador: <@${interaction.user.id}>\n• 📂 Categoria: ${category.emoji} ${category.nome}\n• 🕐 Data: <t:${Math.floor(Date.now() / 1000)}:f>\n\n⏳ **Próximos passos:**\n1️⃣ Descreva seu problema em detalhes\n2️⃣ Forneça informações relevantes\n3️⃣ Aguarde a resposta de nosso time de suporte\n4️⃣ Use os botões abaixo para gerenciar o ticket\n\n💬 **Dúvidas?** Apenas envie uma mensagem aqui!`),
                                )
                                .setThumbnailAccessory(
                                    new ThumbnailBuilder().setURL(interaction.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png')
                                ),
                        )
                        .addActionRowComponents(
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('close').setLabel('❌ Fechar Ticket').setStyle(ButtonStyle.Danger),
                                new ButtonBuilder().setCustomId('staff_panel').setLabel('🛠️ Painel Staff').setStyle(ButtonStyle.Secondary),
                            ),
                        );

                    // Send the ticket container message
                    await ticketChannel.send({ components: [ticketContainer], flags: MessageFlags.IsComponentsV2 });

                    // Send notification to the configured notification channel if exists
                    if (config.ticketChannel && interaction.guild.channels.cache.has(config.ticketChannel)) {
                        const notifyChannel = interaction.guild.channels.cache.get(config.ticketChannel);
                        const notificationRoles = config.notificationRoles || config.whitelistRoles || [];
                        const mentions = notificationRoles.map(rid => `<@&${rid}>`).join(' ');
                        const mentionText = mentions ? ` ${mentions}` : '';
                        
                        const notificationEmbed = new EmbedBuilder()
                            .setColor(0x00a2ff)
                            .setTitle('🆕 Novo Ticket Aberto')
                            .setDescription(`Um novo ticket foi criado. Verifique se precisa de atenção imediata.`)
                            .addFields(
                                { name: '👤 Usuário', value: `<@${interaction.user.id}>`, inline: true },
                                { name: '📂 Categoria', value: `${category.emoji} ${category.nome}`, inline: true },
                                { name: '🔗 Link do Ticket', value: `<#${ticketChannel.id}>` }
                            )
                            .setTimestamp();

                        await notifyChannel.send({ embeds: [notificationEmbed], content: mentionText || undefined });
                    }

                    return interaction.editReply({ content: `✅ Ticket criado com sucesso em <#${ticketChannel.id}>! Aguarde a resposta do nosso time.` });
                } catch (error) {
                    console.error('Erro ao criar ticket:', error);
                    return interaction.editReply({ content: '❌ Erro ao criar o ticket. Tente novamente mais tarde.' });
                }
            }
            if (interaction.customId === 'painel_main_menu' || interaction.customId === 'painel_config_menu') {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                const selected = interaction.values[0];
                const config = configManager.getGuildConfig(interaction.guild.id);

                let contentText = '⚙️ Opção não definida.';
                let components = [];

                if (selected === 'menu_categorias') {
                    const categorias = config.categorias || {};
                    const catList = Object.values(categorias).length > 0
                        ? Object.values(categorias).map(c => `${c.emoji} **${c.nome}**${c.descricao ? ` — ${c.descricao}` : ''}`).join('\n')
                        : '❌ Nenhuma categoria cadastrada';
                    
                    contentText = `📂 **GERENCIAR CATEGORIAS** (${Object.keys(categorias).length} total)\n\n${catList}`;

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('add_cat').setLabel('➕ Adicionar').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId('edit_cat').setLabel('✏️ Editar').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('remove_cat').setLabel('🗑️ Remover').setStyle(ButtonStyle.Danger),
                    );
                    components = [row];
                } else if (selected === 'menu_logs_ticket') {
                    const logChannelId = config.logChannel;
                    const logStatus = logChannelId ? `<#${logChannelId}>` : '❌ Não configurado';
                    contentText = `📝 **CANAL DE LOGS DE TICKETS**\n\n**Status:** ${logStatus}\n\n**O que faz:**\nEste canal recebe um arquivo HTML de transcrição de cada ticket que é fechado. Útil para manter registros e análises futuras.\n\n**Como funciona:**\n1. Quando um ticket é fechado\n2. Um arquivo HTML é gerado com todo o chat\n3. O arquivo é enviado para este canal`;

                    const row = new ActionRowBuilder().addComponents(
                        new ChannelSelectMenuBuilder()
                            .setCustomId('select_log_channel')
                            .setPlaceholder('🔴 Clique para selecionar o canal de logs')
                            .setChannelTypes([ChannelType.GuildText])
                    );
                    components = [row];
                } else if (selected === 'menu_channel_ticket') {
                    const ticketChannelId = config.ticketChannel;
                    const ticketStatus = ticketChannelId ? `<#${ticketChannelId}>` : '❌ ⚠️ Não configurado';
                    contentText = `💬 **CANAL DE NOTIFICAÇÕES DE TICKETS**\n\n**Status:** ${ticketStatus}\n\n**O que faz:**\nEste canal recebe uma notificação automática toda vez que um novo ticket é aberto. Perfeito para manter seu time informado!\n\n**Como funciona:**\n✅ Um novo ticket é aberto\n✅ Uma notificação é enviada para este canal\n✅ Seu time de suporte recebe o aviso\n\n**Benefícios:**\n• Resposta rápida a novos tickets\n• Distribuição uniforme de carga\n• Histórico de tickets abertos`;

                    const row = new ActionRowBuilder().addComponents(
                        new ChannelSelectMenuBuilder()
                            .setCustomId('select_ticket_channel')
                            .setPlaceholder('🔴 Clique para selecionar o canal de notificações')
                            .setChannelTypes([ChannelType.GuildText])
                    );
                    components = [row];
                } else if (selected === 'menu_roles_notification') {
                    const notificationRoles = config.notificationRoles || config.whitelistRoles || [];
                    const rolesText = notificationRoles.length ? `✅ ${notificationRoles.length} cargo(s): ${notificationRoles.map(r => `<@&${r}>`).join(' ')}` : '❌ Nenhum cargo configurado';
                    contentText = `👥 **CARGOS DE NOTIFICAÇÃO (MENTION ROLES)**\n\n**Status:** ${rolesText}\n\n**O que faz:**\nEsses cargos serão **@mencionados** automaticamente quando um novo ticket for aberto. Perfeito para notificar seu time de suporte instantaneamente!\n\n**Como funciona:**\n✅ Um novo ticket é criado\n✅ Uma notificação é enviada para o canal de notificações\n✅ Os cargos selecionados são mencionados\n✅ Seu time recebe o ping!\n\n**Exemplo:**\n🆕 **Novo Ticket - Bug**\n👤 Usuário: João\n💬 Categoria: Bugs\n**Menciona:** <@&123456> <@&654321>\n\n**Dica:** Selecione cargos que representam seu time de suporte, moderadores ou admins!`;

                    const row = new ActionRowBuilder().addComponents(
                        new RoleSelectMenuBuilder()
                            .setCustomId('select_notification_roles')
                            .setPlaceholder('👥 Clique para selecionar cargos (máx 25)')
                            .setMinValues(0)
                            .setMaxValues(25)
                    );
                    components = [row];
                } else if (selected === 'menu_logs_welcome') {
                    contentText = '🚪 **LOGS DE ENTRADA/SAÍDA**\n\n⏳ Esta funcionalidade está em desenvolvimento.\n\nEm breve você poderá registrar automáticamente quando usuários entram e saem do servidor!';
                }

                const container = new ContainerBuilder()
                    .setAccentColor(0x00a2ff)
                    .addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(contentText),
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder().setURL(interaction.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png')
                            ),
                    );

                if (components.length > 0) {
                    for (const comp of components) {
                        container.addActionRowComponents(comp);
                    }
                }

                await interaction.editReply({ components: [container], flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral] });
                return;
            }

            if (interaction.customId === 'remove_cat_select') {
                const key = interaction.values[0];
                const cfg = configManager.getGuildConfig(interaction.guild.id);
                const categorias = cfg.categorias || {};
                const cat = categorias[key];

                if (!cat) {
                    return interaction.reply({ content: '❌ Categoria não encontrada.', flags: MessageFlags.Ephemeral });
                }

                const catName = `${cat.emoji} ${cat.nome}`;
                delete categorias[key];
                cfg.categorias = categorias;
                configManager.saveGuildConfig(interaction.guild.id, cfg);

                return interaction.reply({ content: `✅ Categoria **${catName}** removida com sucesso!`, flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'edit_cat_select') {
                const key = interaction.values[0];
                const cfg = configManager.getGuildConfig(interaction.guild.id);
                const categorias = cfg.categorias || {};
                const cat = categorias[key];

                if (!cat) {
                    return interaction.reply({ content: '❌ Categoria não encontrada.', flags: MessageFlags.Ephemeral });
                }

                const modal = new ModalBuilder().setCustomId(`edit_cat_modal:${key}`).setTitle(`Editar: ${cat.nome}`);
                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('nome').setLabel('Nome da categoria').setStyle(TextInputStyle.Short).setValue(cat.nome).setRequired(true),
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('emoji').setLabel('Emoji').setStyle(TextInputStyle.Short).setValue(cat.emoji).setRequired(true),
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('descricao').setLabel('Descrição (aparece no menu)').setStyle(TextInputStyle.Short).setValue(cat.descricao || '').setRequired(false),
                    ),
                );

                return interaction.showModal(modal);
            }

            return;
        } else if (interaction.isChannelSelectMenu()) {
            // Handle channel selects for log and ticket channel configuration
            if (interaction.customId === 'select_log_channel') {
                const channelId = interaction.values[0];
                const cfg = configManager.getGuildConfig(interaction.guild.id);
                cfg.logChannel = channelId;
                configManager.saveGuildConfig(interaction.guild.id, cfg);
                return interaction.reply({ content: `Canal de log definido para <#${channelId}>.`, flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'select_ticket_channel') {
                const channelId = interaction.values[0];
                const cfg = configManager.getGuildConfig(interaction.guild.id);
                cfg.ticketChannel = channelId;
                configManager.saveGuildConfig(interaction.guild.id, cfg);
                return interaction.reply({ content: `Canal de ticket definido para <#${channelId}>.`, flags: MessageFlags.Ephemeral });
            }

            return;
        } else if (interaction.isRoleSelectMenu()) {
            if (interaction.customId === 'select_notification_roles' || interaction.customId === 'select_whitelist_roles') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: 'Requer permissão de administrador.', flags: MessageFlags.Ephemeral });
                }

                const selectedRoles = interaction.values || [];
                
                // Update config with new roles
                const cfg = configManager.getGuildConfig(interaction.guild.id);
                cfg.notificationRoles = selectedRoles;
                cfg.whitelistRoles = selectedRoles; // Keep for backward compatibility
                configManager.saveGuildConfig(interaction.guild.id, cfg);

                const rolesList = selectedRoles.length ? selectedRoles.map(r => `<@&${r}>`).join(' ') : 'nenhum';
                return interaction.reply({ content: `✅ **Cargos de Notificação Atualizados!**\n\nCargos selecionados: ${rolesList}\n\n💡 Esses cargos serão mencionados quando um novo ticket for aberto.`, flags: MessageFlags.Ephemeral });
            }

            return;
        } else if (interaction.isUserSelectMenu()) {
            if (interaction.customId === 'add_member_select') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: '❌ Apenas administradores podem usar esta função.', flags: MessageFlags.Ephemeral });
                }

                const userId = interaction.values[0];
                try {
                    const member = await interaction.guild.members.fetch(userId).catch(() => null);
                    if (!member) {
                        return interaction.reply({ content: '❌ Usuário não encontrado.', flags: MessageFlags.Ephemeral });
                    }

                    await interaction.channel.permissionOverwrites.edit(member.id, {
                        ViewChannel: true,
                        SendMessages: true,
                        ReadMessageHistory: true,
                    });

                    return interaction.reply({ content: `✅ <@${member.id}> foi adicionado ao ticket!`, flags: MessageFlags.Ephemeral });
                } catch (error) {
                    console.error('Erro ao adicionar membro:', error);
                    return interaction.reply({ content: '❌ Erro ao adicionar usuário. Tente novamente.', flags: MessageFlags.Ephemeral });
                }
            }

            if (interaction.customId === 'remove_member_select') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: '❌ Apenas administradores podem usar esta função.', flags: MessageFlags.Ephemeral });
                }

                const userId = interaction.values[0];
                try {
                    const member = await interaction.guild.members.fetch(userId).catch(() => null);
                    if (!member) {
                        return interaction.reply({ content: '❌ Usuário não encontrado.', flags: MessageFlags.Ephemeral });
                    }

                    await interaction.channel.permissionOverwrites.delete(member.id);

                    return interaction.reply({ content: `✅ <@${member.id}> foi removido do ticket!`, flags: MessageFlags.Ephemeral });
                } catch (error) {
                    console.error('Erro ao remover membro:', error);
                    return interaction.reply({ content: '❌ Erro ao remover usuário. Tente novamente.', flags: MessageFlags.Ephemeral });
                }
            }

            return;
        }
    },
};