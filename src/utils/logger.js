const fs = require("fs");
const path = require("path");
const { config } = require("../config/env");

const logsDir = path.resolve(process.cwd(), "logs");
const logFilePath = path.join(logsDir, "bot.log");

function ensureLogsDir() {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

function formatMeta(meta) {
  if (!meta) return "";
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return " [meta_unserializable]";
  }
}

function write(level, message, meta) {
  const line = `[${new Date().toISOString()}] [${level}] ${message}${formatMeta(meta)}`;
  console.log(line);

  if (config.logToFile) {
    ensureLogsDir();
    fs.appendFileSync(logFilePath, line + "\n", "utf-8");
  }
}

module.exports = {
  info(message, meta) {
    write("INFO", message, meta);
  },
  warn(message, meta) {
    write("WARN", message, meta);
  },
  error(message, meta) {
    write("ERROR", message, meta);
  },
};
