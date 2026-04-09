# 🎫 CruzTickets

<div align="center">
  <img src="imgs/logo.jpeg" alt="CruzTickets Logo" width="300" style="border-radius: 10px; margin: 20px 0;">
</div>

Um bot Discord moderno e eficiente para gerenciar sistemas de tickets em servidores. Perfeito para suporte, recrutamento, atendimento ao cliente e muito mais!

> ⚠️ **Status**: Este projeto está em desenvolvimento ativo. Novos recursos e melhorias estão sendo adicionados regularmente.

---

## 📋 Sobre

CruzTickets é um bot Discord baseado em [Discord.js 14](https://discord.js.org/) que permite criar e gerenciar um sistema robusto de suporte através de tickets. Os usuários podem abrir tickets para diferentes categorias e receber suporte dedicado de forma organizada.

O bot utiliza **Components V2** (Containers) do Discord para criar painéis visuais modernos e interativos.

---

## ✨ Recursos

### 🎫 Sistema de Tickets
- Criação automática de canais privados por categoria
- Painel público com select menu para usuários abrirem tickets
- Verificação de ticket duplicado (1 ticket por usuário)
- Fechamento com confirmação e contagem regressiva de 10 segundos

### 🛠️ Painel Staff (Admin)
- Botão exclusivo para administradores dentro de cada ticket
- **Notificar Autor** — Envia DM ao criador do ticket avisando que a equipe aguarda resposta
- **Adicionar Usuário** — Select menu visual para adicionar membros ao ticket
- **Remover Usuário** — Select menu visual para remover membros do ticket

### ⚙️ Configurações por Servidor
- **Categorias** — Adicionar, editar e remover categorias com nome, emoji e descrição
- **Canal de Logs** — Configura onde os transcripts dos tickets fechados serão salvos
- **Canal de Notificações** — Recebe alerta automático quando um novo ticket é aberto
- **Cargos de Notificação** — Cargos mencionados (@) nas notificações de novos tickets

### 📋 Transcripts
- Geração automática de transcript HTML ao fechar um ticket
- Enviado para o canal de logs configurado
- Histórico completo da conversa para auditoria

### 📊 Painel Administrativo
- Comando `/ticket` exibe painel ephemeral (visível só para o admin)
- Status completo das configurações do servidor
- Ajuda integrada com guia de uso

---

## 🛠️ Requisitos

- **Node.js** v18+ ([Download aqui](https://nodejs.org/))
- **npm** (incluído com Node.js)
- Um **bot Discord** criado no [Discord Developer Portal](https://discord.com/developers/applications)
- Permissões de administrador no servidor

---

## 📦 Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/Cruzxy/CruzTickets.git
cd CruzTickets
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar o bot

Crie um arquivo `config.json` na raiz do projeto:

```json
{
  "token": "SEU_TOKEN_DO_BOT_AQUI",
  "clientId": "SEU_CLIENT_ID_AQUI"
}
```

**Como obter essas informações:**
- `token`: [Discord Developer Portal](https://discord.com/developers/applications) → Sua aplicação → Bot → Token
- `clientId`: Na mesma página, copie o "Application ID"
- `guildId`: No Discord, ative "Modo Desenvolvedor" (Configurações → Avançado) e clique direito no servidor para copiar o ID

### 4. Iniciar o bot

```bash
node .
```

---

## 🚀 Como Usar

### Configuração Inicial

1. Use `/ticket` para abrir o painel administrativo
2. Vá em **Gerenciar Categorias** e crie pelo menos uma categoria (nome, emoji e descrição)
3. Configure o **Canal de Logs** para salvar transcripts
4. Configure o **Canal de Notificações** para alertas de novos tickets
5. Adicione **Cargos de Notificação** para mencionar sua equipe
6. Clique em **Enviar Painel** no canal desejado para publicar o painel público

### Fluxo do Ticket

1. O usuário seleciona uma categoria no painel público
2. Um canal privado é criado automaticamente
3. O usuário descreve seu problema
4. Admins usam o **Painel Staff** para gerenciar o ticket
5. Ao fechar, o transcript é salvo e o canal é deletado após 10 segundos

---

## 📝 Comandos

| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/ticket` | Abre o painel administrativo de tickets | Administrador |

---

## 📁 Estrutura do Projeto

```
CruzTickets/
├── index.js                  # Arquivo principal do bot
├── config.json               # Configurações (token, IDs)
├── package.json              # Dependências do projeto
├── commands/
│   └── utility/
│       └── ticket.js         # Comando /ticket (painel admin)
├── events/
│   ├── interactionCreate.js  # Gerencia todas as interações
│   └── ready.js              # Evento de inicialização
├── guilds/                   # Configurações salvas por servidor
└── utils/
    └── configManager.js      # Gerenciador de configs por guild
```

---

## 🔧 Dependências

| Pacote | Descrição |
|--------|-----------|
| [discord.js](https://discord.js.org/) | Framework para bots Discord (v14) |
| [discord-html-transcripts](https://github.com/ItzDerock/discord-html-transcripts) | Geração de transcripts HTML |

---

## 🤝 Contribuindo

Se você tem sugestões ou encontrou bugs:
- Abra uma [issue](https://github.com/Cruzxy/CruzTickets/issues)
- Faça um [pull request](https://github.com/Cruzxy/CruzTickets/pulls)

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Suporte

Tem dúvidas ou problemas? Abra uma [issue no GitHub](https://github.com/Cruzxy/CruzTickets/issues) descrevendo seu problema com detalhes.
