const { config, validateConfig } = require("./config/env");
const logger = require("./utils/logger");
const { loadState, saveState } = require("./state/store");
const { getKlines, getExchangeInfo, placeMarketOrder } = require("./services/binance");
const { buildSignal } = require("./strategy/smaCross");

let isProcessing = false;

async function bootstrap() {
  validateConfig();

  const exchangeInfo = await getExchangeInfo(config.symbol);

  logger.info("Bot inicializado", {
    symbol: config.symbol,
    timeframe: config.timeframe,
    intervalMs: config.intervalMs,
    smaPeriod: config.smaPeriod,
    dryRun: config.dryRun,
    lotSizeFilter: exchangeInfo?.filters?.find((item) => item.filterType === "LOT_SIZE") || null,
  });
}

async function executeCycle() {
  if (isProcessing) {
    logger.warn("Ciclo ignorado porque ainda existe processamento em andamento.");
    return;
  }

  isProcessing = true;

  try {
    const state = loadState();
    const limit = Math.max(config.smaPeriod + 3, 25);
    const klines = await getKlines(config.symbol, config.timeframe, limit);
    const signal = buildSignal({
      klines,
      smaPeriod: config.smaPeriod,
      inPosition: state.inPosition,
    });

    const candleAlreadyProcessed = state.lastCandleTime === signal.latestCloseTime;

    logger.info("Leitura de mercado", {
      latestClose: signal.latestClose,
      previousClose: signal.previousClose,
      currentSma: Number(signal.currentSma.toFixed(2)),
      previousSma: Number(signal.previousSma.toFixed(2)),
      action: signal.action,
      reason: signal.reason,
      inPosition: state.inPosition,
      candleAlreadyProcessed,
    });

    if (candleAlreadyProcessed) {
      return;
    }

    state.lastCandleTime = signal.latestCloseTime;
    state.lastPrice = signal.latestClose;
    state.lastSignal = signal.action;

    if (signal.action === "HOLD") {
      saveState(state);
      return;
    }

    if (config.dryRun) {
      logger.warn("DRY_RUN ativo: nenhuma ordem real foi enviada.", {
        intendedAction: signal.action,
        symbol: config.symbol,
        quantity: config.quantity,
      });
    } else {
      const side = signal.action === "BUY" ? "BUY" : "SELL";
      const order = await placeMarketOrder(config.symbol, config.quantity, side);
      logger.info("Ordem executada", {
        orderId: order.orderId,
        side: order.side,
        status: order.status,
        executedQty: order.executedQty,
      });
    }

    state.inPosition = signal.action === "BUY";
    state.lastSide = signal.action;
    state.lastOrderAt = new Date().toISOString();
    saveState(state);
  } catch (error) {
    logger.error("Erro no ciclo do bot", {
      message: error?.message,
      response: error?.response?.data || null,
      stack: error?.stack,
    });
  } finally {
    isProcessing = false;
  }
}

async function main() {
  try {
    await bootstrap();
    await executeCycle();
    setInterval(executeCycle, config.intervalMs);
  } catch (error) {
    logger.error("Falha ao iniciar o bot", {
      message: error?.message,
      response: error?.response?.data || null,
      stack: error?.stack,
    });
    process.exit(1);
  }
}

main();
