const fs = require("fs");
const path = require("path");

const dataDir = path.resolve(process.cwd(), "data");
const stateFilePath = path.join(dataDir, "state.json");

const defaultState = {
  inPosition: false,
  lastSide: null,
  lastOrderAt: null,
  lastPrice: null,
  lastSignal: null,
  lastCandleTime: null,
};

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadState() {
  ensureDataDir();

  if (!fs.existsSync(stateFilePath)) {
    fs.writeFileSync(stateFilePath, JSON.stringify(defaultState, null, 2), "utf-8");
    return { ...defaultState };
  }

  try {
    const raw = fs.readFileSync(stateFilePath, "utf-8");
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    fs.writeFileSync(stateFilePath, JSON.stringify(defaultState, null, 2), "utf-8");
    return { ...defaultState };
  }
}

function saveState(state) {
  ensureDataDir();
  fs.writeFileSync(stateFilePath, JSON.stringify({ ...defaultState, ...state }, null, 2), "utf-8");
}

module.exports = {
  loadState,
  saveState,
  stateFilePath,
};
