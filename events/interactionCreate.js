const { Events, MessageFlags, ChannelType, SectionBuilder, SeparatorSpacingSize, SeparatorBuilder, ThumbnailBuilder ,ButtonBuilder, ActionRowBuilder, PermissionsBitField, ContainerBuilder, TextDisplayBuilder, ButtonStyle } = require('discord.js');

const config = require("../config.json")

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

            if (interaction.customId === 'close') {
              await interaction.reply({ content: 'Canal vai ser apagado em 10 segundos!', flags: MessageFlags.Ephemeral });
                setTimeout(async () => {
                  try {
                      await interaction.channel.delete();
                  } catch (e) {
                      console.error('Erro:', e);
                  }
              }, 10000);
          }

            if (interaction.customId === 'paineladmin') {

              const guildIcon = interaction.guild.iconURL();

              const container = new ContainerBuilder()
                .setAccentColor(0x57f287)

                .addSectionComponents(
                  new SectionBuilder()
                    .addTextDisplayComponents(
                      new TextDisplayBuilder().setContent('## Painel Administrativo'),
                      new TextDisplayBuilder().setContent(
                        'Seja muito bem-vindo(a) ao Painel Administrativo! Este é o seu ambiente de controle, onde você pode gerenciar o atendimento atual. Caso tenha alguma dúvida sobre o funcionamento, entre em contato com a equipe responsável.',
                      )
                    )
                    .setThumbnailAccessory(new ThumbnailBuilder().setURL(guildIcon).setDescription('Ícone do servidor'))
                )

                .addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                )

                .addSectionComponents(
                  new SectionBuilder()
                    .addTextDisplayComponents(
                      new TextDisplayBuilder().setContent('• **Adicionar Usuário(s)**'),
                      new TextDisplayBuilder().setContent('Nesta opção você pode adicionar usuários ao atendimento.')
                    )
                    .setButtonAccessory(
                      new ButtonBuilder()
                        .setCustomId('add_users')
                        .setLabel('Adicionar')
                        .setEmoji('➕')
                        .setStyle(ButtonStyle.Success)
                    )
                )
                .addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                )

                .addSectionComponents(
                  new SectionBuilder()
                    .addTextDisplayComponents(
                      new TextDisplayBuilder().setContent('• **Remover Usuário(s)**'),
                      new TextDisplayBuilder().setContent('Nesta opção você pode remover usuários do atendimento.')
                    )
                    .setButtonAccessory(
                      new ButtonBuilder()
                        .setCustomId('remove_users')
                        .setLabel('Remover')
                        .setEmoji('➖')
                        .setStyle(ButtonStyle.Danger)
                    )
                )
                .addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                )

                .addSectionComponents(
                  new SectionBuilder()
                    .addTextDisplayComponents(
                      new TextDisplayBuilder().setContent('• **Notificar Autor**'),
                      new TextDisplayBuilder().setContent('Nesta opção será enviada uma mensagem no privado do autor do atendimento.')
                    )
                    .setButtonAccessory(
                      new ButtonBuilder()
                        .setCustomId('notify_author')
                        .setLabel('Notificar')
                        .setEmoji('🔔')
                        .setStyle(ButtonStyle.Primary)
                    )
                );

              await interaction.reply({
                components: [container],
                flags: [MessageFlags.IsComponentsV2,MessageFlags.Ephemeral],
              });
            }
            
        } else if (interaction.isModalSubmit()) {


        } else if (interaction.isStringSelectMenu()) { 
          
        if (interaction.customId === 'categorias') {
    
        const channels = interaction.guild.channels.cache.find(c => c.topic === `${interaction.user.id}`);

        if (channels) return interaction.reply({
                components: [
                    new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                        .setContent(`<@${interaction.user.id}>, você já tem um ticket aberto.`)
                    )
                ],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
                }).then(msg => {
                setTimeout(() => msg.delete(), 10000);
            });

            interaction.message.edit()

            const selectedCategory = interaction.values[0]

            let categoryEmoji = config.categorias[selectedCategory].emoji

            interaction.guild.channels.create({
                name: `${categoryEmoji}・${interaction.user.username}`,
                parent: selectedCategory.id,
                topic: `${interaction.user.id}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    }
                ],
            }).then(async canal => {
            
            await interaction.reply({
                components: [
                    new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                        .setContent(`**<@${interaction.user.id}>**, seu ticket foi criado no canal <#${canal.id}>. Acesse para iniciar o processo.`)
                    )
                    .addActionRowComponents(
                        new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setURL(`https://discord.com/channels/${interaction.guild.id}/${canal.id}`)
                            .setLabel('Acessar Ticket')
                            .setStyle(ButtonStyle.Link)
                        )
                    )
                ],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
                }).then(msg => {
                setTimeout(() => msg.delete(), 10000);
            });

                const container = new ContainerBuilder()
                .setAccentColor(0x2b2d31) 
                .addSectionComponents(
                    new SectionBuilder()
                    .addTextDisplayComponents(
                        text => text.setContent(`**Atendimento - ${interaction.guild.name}**`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                        .setURL(interaction.guild.iconURL() || '')
                        .setDescription('Ícone do servidor')
                    )
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                    .setContent('TESTE')
                )
                .addActionRowComponents(
                    new ActionRowBuilder().addComponents(
                        
                    new ButtonBuilder()
                        .setCustomId('close')
                        .setLabel('Fechar Ticket')
                        .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                        .setCustomId('paineladmin')
                        .setLabel('Painel Admin')
                        .setStyle(ButtonStyle.Secondary)
                    )
                );

                canal.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2
                });

            })
        }

        }

    },
};