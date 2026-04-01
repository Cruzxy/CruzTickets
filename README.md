# 🎫 CruzTickets

<div align="center">
  <img src="imgs/logo.jpeg" alt="CruzTickets Logo" width="300" style="border-radius: 10px; margin: 20px 0;">
</div>

Um bot Discord moderno e eficiente para gerenciar sistemas de tickets em servidores. Perfeito para suporte, recrutamento, atendimento ao cliente e muito mais!

> ⚠️ **Status**: Este projeto está em desenvolvimento ativo. Novos recursos e melhorias estão sendo adicionados regularmente.

---

## 📋 Sobre

CruzTickets é um bot Discord baseado em [Discord.js 14](https://discord.js.org/) que permite criar e gerenciar um sistema robusto de suporte através de tickets. Os usuários podem abrir tickets para diferentes categorias e receber suporte dedicado de forma organizada.

**Desenvolvido**: 20 de junho de 2025

---

## ✨ Recursos

- 🎫 Sistema completo de criação e gestão de tickets
- 💬 Comandos slash (/) modernos
- 📝 Transcrições em HTML dos tickets
- 🎯 Suporte a múltiplas categorias
- ⚙️ Fácil configuração

---

## 🛠️ Requisitos

Antes de começar, certifique-se de ter:

- **Node.js** v18+ instalado ([Download aqui](https://nodejs.org/))
- **npm** (geralmente incluído com Node.js)
- Um **bot Discord** criado no [Discord Developer Portal](https://discord.com/developers/applications)
- Permissões adequadas no servidor para adicionar o bot

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
  "clientId": "SEU_CLIENT_ID_AQUI",
  "guildId": "ID_DO_SEU_SERVIDOR"
}
```

**Como obter essas informações:**
- `token`: Acesse [Discord Developer Portal](https://discord.com/developers/applications) → Sua aplicação → Bot → Token (clique em "Copy")
- `clientId`: Na mesma página, encontre "APPLICATION ID" ou "Client ID"
- `guildId`: No Discord, ative "Modo Desenvolvedor" (Configurações → Avançado) e clique direito no servidor para copiar o ID

### 4. Iniciar o bot

```bash
node .
```

ou

```bash
node index.js
```

Você verá no console uma mensagem confirmando que os comandos foram carregados com sucesso.

---

## 🚀 Como Usar

Assim que o bot estiver funcionando, você pode:

1. **Convidar o bot para seu servidor**: Use a URL de convite do [Discord Developer Portal](https://discord.com/developers/applications)
2. **Usar os comandos**: Digite `/` no chat para ver todos os comandos disponíveis
3. **Gerenciar tickets**: Use os comandos para criar, fechar e gerenciar tickets

---

## 📁 Estrutura do Projeto

```
CruzTickets/
├── index.js                 # Arquivo principal do bot
├── config.json             # Configurações (criado por você)
├── package.json            # Dependências do projeto
├── commands/
│   └── utility/
│       └── ticket.js       # Comando de tickets
└── events/
    ├── interactionCreate.js  # Gerencia interações
    └── ready.js              # Evento quando bot inicia
```

---

## 🔧 Dependências

- **discord.js** - Framework para criar bots Discord
- **discord-html-transcripts** - Gera transcrições em HTML dos tickets

---

## 📝 Comandos

Os comandos estão organizados em pastas dentro de `commands/`. Novos comandos podem ser adicionados criando um arquivo `.js` com a estrutura correta.

---

## 🤝 Contribuindo

Se você tem sugestões ou encontrou bugs, sinta-se à vontade para:
- Abrir uma [issue](https://github.com/Cruzxy/CruzTickets/issues)
- Fazer um [pull request](https://github.com/Cruzxy/CruzTickets/pulls)

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes completos.

---

## 📞 Suporte

Tem dúvidas ou problemas? Abra uma [issue no GitHub](https://github.com/Cruzxy/CruzTickets/issues) descrevendo seu problema com detalhes.
