const { config, validateConfig } = require("./config/env");
const logger = require("./utils/logger");
const { loadState, saveState } = require("./state/store");
const {
  getKlines,
  getExchangeInfo,
  getTickerPrice,
  getAccountInfo,
  placeMarketOrder,
} = require("./services/binance");
const { buildSignal } = require("./strategy/smaCross");
const { normalizeQuantity, validateNotional, extractBalances } = require("./utils/trading");

let isProcessing = false;
let exchangeInfoCache = null;

async function bootstrap() {
  validateConfig();
  exchangeInfoCache = await getExchangeInfo(config.symbol);
  const tickerPrice = await getTickerPrice(config.symbol);
  const balances = extractBalances(await getAccountInfo(), [exchangeInfoCache.baseAsset, exchangeInfoCache.quoteAsset]);

  logger.info("Bot inicializado", {
    symbol: config.symbol,
    timeframe: config.timeframe,
    intervalMs: config.intervalMs,
    smaPeriod: config.smaPeriod,
    dryRun: config.dryRun,
    forceSignal: config.forceSignal,
    forceSignalOnce: config.forceSignalOnce,
    currentTickerPrice: tickerPrice,
    baseAsset: exchangeInfoCache.baseAsset,
    quoteAsset: exchangeInfoCache.quoteAsset,
    balances,
    lotSizeFilter: exchangeInfoCache?.filters?.find((item) => item.filterType === "LOT_SIZE") || null,
    notionalFilter:
      exchangeInfoCache?.filters?.find((item) => item.filterType === "NOTIONAL") ||
      exchangeInfoCache?.filters?.find((item) => item.filterType === "MIN_NOTIONAL") ||
      null,
  });
}

function applyForcedSignal(signal, state) {
  if (config.forceSignal === "NONE") {
    if (state.forceSignalConsumed) state.forceSignalConsumed = false;
    return signal;
  }

  if (config.forceSignalOnce && state.forceSignalConsumed) {
    return signal;
  }

  return {
    ...signal,
    action: config.forceSignal,
    reason: `Sinal forçado manualmente via .env (${config.forceSignal}).`,
    forced: true,
  };
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
    const tickerPrice = await getTickerPrice(config.symbol);
    const baseSignal = buildSignal({ klines, smaPeriod: config.smaPeriod, inPosition: state.inPosition });
    const signal = applyForcedSignal(baseSignal, state);
    const candleAlreadyProcessed = state.lastCandleTime === signal.latestCloseTime;
    const normalized = normalizeQuantity(config.quantity, exchangeInfoCache);
    const notionalCheck = validateNotional(signal.latestClose, normalized.quantityNumber, exchangeInfoCache);

    logger.info("Leitura de mercado", {
      tickerPrice,
      latestClose: signal.latestClose,
      previousClose: signal.previousClose,
      currentSma: Number(signal.currentSma.toFixed(2)),
      previousSma: Number(signal.previousSma.toFixed(2)),
      action: signal.action,
      reason: signal.reason,
      forced: Boolean(signal.forced),
      inPosition: state.inPosition,
      candleAlreadyProcessed,
      requestedQuantity: config.quantity,
      normalizedQuantity: normalized.quantity,
      estimatedNotional: Number(notionalCheck.notional.toFixed(2)),
      minNotionalRequired: Number(notionalCheck.minNotional.toFixed(2)),
    });

    if (candleAlreadyProcessed && !signal.forced) return;

    state.lastCandleTime = signal.latestCloseTime;
    state.lastPrice = signal.latestClose;
    state.lastSignal = signal.action;

    if (signal.action === "HOLD") {
      saveState(state);
      return;
    }

    if (!notionalCheck.isValid) {
      logger.warn("Sinal encontrado, mas a ordem foi bloqueada por notional insuficiente.", {
        action: signal.action,
        estimatedNotional: notionalCheck.notional,
        minNotionalRequired: notionalCheck.minNotional,
        normalizedQuantity: normalized.quantity,
      });
      saveState(state);
      return;
    }

    if (config.dryRun) {
      logger.warn("DRY_RUN ativo: nenhuma ordem real foi enviada.", {
        intendedAction: signal.action,
        forced: Boolean(signal.forced),
        symbol: config.symbol,
        requestedQuantity: config.quantity,
        normalizedQuantity: normalized.quantity,
        estimatedNotional: Number(notionalCheck.notional.toFixed(2)),
        referencePrice: signal.latestClose,
      });
    } else {
      const side = signal.action === "BUY" ? "BUY" : "SELL";
      const order = await placeMarketOrder(config.symbol, normalized.quantity, side);
      logger.info("Ordem executada", {
        orderId: order.orderId,
        side: order.side,
        status: order.status,
        executedQty: order.executedQty,
        transactTime: order.transactTime,
        forced: Boolean(signal.forced),
      });
    }

    state.inPosition = signal.action === "BUY";
    state.lastSide = signal.action;
    state.lastOrderAt = new Date().toISOString();
    state.lastQuantity = normalized.quantity;
    state.lastNotional = Number(notionalCheck.notional.toFixed(2));
    if (signal.forced && config.forceSignalOnce) state.forceSignalConsumed = true;
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
