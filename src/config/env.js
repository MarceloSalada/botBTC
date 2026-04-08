const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function parseBoolean(value, defaultValue = false) {
  if (value === undefined) return defaultValue;
  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
}

function parseNumber(value, defaultValue) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

const config = {
  apiUrl: process.env.BINANCE_API_URL || "https://testnet.binance.vision",
  apiKey: process.env.BINANCE_API_KEY || "",
  secretKey: process.env.BINANCE_SECRET_KEY || "",
  symbol: process.env.BOT_SYMBOL || "BTCUSDT",
  quantity: process.env.BOT_QUANTITY || "0.001",
  intervalMs: parseNumber(process.env.BOT_INTERVAL_MS, 30000),
  timeframe: process.env.BOT_TIMEFRAME || "15m",
  smaPeriod: parseNumber(process.env.BOT_SMA_PERIOD, 20),
  dryRun: parseBoolean(process.env.DRY_RUN, true),
  logToFile: parseBoolean(process.env.LOG_TO_FILE, true),
};

function validateConfig() {
  const missing = [];

  if (!config.apiUrl) missing.push("BINANCE_API_URL");
  if (!config.symbol) missing.push("BOT_SYMBOL");
  if (!config.quantity) missing.push("BOT_QUANTITY");

  if (!config.apiKey) missing.push("BINANCE_API_KEY");
  if (!config.secretKey) missing.push("BINANCE_SECRET_KEY");

  if (missing.length > 0) {
    throw new Error(`Configuração ausente: ${missing.join(", ")}`);
  }
}

module.exports = {
  config,
  validateConfig,
};
