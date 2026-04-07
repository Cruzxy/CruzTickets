const fs = require('fs');
const path = require('path');

const globalConfigPath = path.join(__dirname, '../config.json');
const guildsDir = path.join(__dirname, '../guilds');

function ensureGuildsDir() {
  if (!fs.existsSync(guildsDir)) fs.mkdirSync(guildsDir);
}

function getGlobalConfig() {
  delete require.cache[require.resolve(globalConfigPath)];
  return require(globalConfigPath);
}

function getGuildConfig(guildId) {
  ensureGuildsDir();
  const filePath = path.join(guildsDir, `${guildId}.json`);
  if (fs.existsSync(filePath)) {
    delete require.cache[require.resolve(filePath)];
    return require(filePath);
  }

  const globalCfg = getGlobalConfig();
  const defaultCats = globalCfg.categorias || {};
  const cfg = {
    categorias: defaultCats,
    logChannel: null,
    ticketChannel: null,
    whitelistRoles: [],
  };
  fs.writeFileSync(filePath, JSON.stringify(cfg, null, 2));
  return cfg;
}

function saveGuildConfig(guildId, cfg) {
  ensureGuildsDir();
  const filePath = path.join(guildsDir, `${guildId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(cfg, null, 2));
}

function addCategory(guildId, category) {
  const cfg = getGuildConfig(guildId);
  cfg.categorias = cfg.categorias || {};
  cfg.categorias[category.value] = category;
  saveGuildConfig(guildId, cfg);
  return cfg;
}

function removeCategory(guildId, value) {
  const cfg = getGuildConfig(guildId);
  cfg.categorias = cfg.categorias || {};
  if (cfg.categorias[value]) delete cfg.categorias[value];
  saveGuildConfig(guildId, cfg);
  return cfg;
}

function setWhitelistRoles(guildId, rolesArray) {
  const cfg = getGuildConfig(guildId);
  cfg.whitelistRoles = Array.isArray(rolesArray) ? rolesArray : [];
  saveGuildConfig(guildId, cfg);
  return cfg;
}

module.exports = {
  getGlobalConfig,
  getGuildConfig,
  saveGuildConfig,
  addCategory,
  removeCategory,
  setWhitelistRoles,
};
