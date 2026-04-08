function calcSMA(closes, period) {
  if (closes.length < period) {
    throw new Error(`Dados insuficientes para SMA ${period}`);
  }
  const slice = closes.slice(-period);
  const sum = slice.reduce((acc, value) => acc + value, 0);
  return sum / slice.length;
}

function getClosedCandleData(klines) {
  if (!Array.isArray(klines) || klines.length < 3) {
    throw new Error("Candles insuficientes para gerar sinal.");
  }
  const previousClosed = klines[klines.length - 3];
  const latestClosed = klines[klines.length - 2];
  return { previousClosed, latestClosed };
}

function buildSignal({ klines, smaPeriod, inPosition }) {
  const closes = klines.map((candle) => Number(candle[4]));
  const currentSma = calcSMA(closes.slice(0, -1), smaPeriod);
  const previousSma = calcSMA(closes.slice(0, -2), smaPeriod);
  const { previousClosed, latestClosed } = getClosedCandleData(klines);
  const previousClose = Number(previousClosed[4]);
  const latestClose = Number(latestClosed[4]);
  const latestCloseTime = Number(latestClosed[6]);

  const crossedUp = previousClose <= previousSma && latestClose > currentSma;
  const crossedDown = previousClose >= previousSma && latestClose < currentSma;

  let action = "HOLD";
  let reason = "Sem cruzamento válido.";

  if (!inPosition && crossedUp) {
    action = "BUY";
    reason = "Preço cruzou acima da SMA no candle fechado.";
  } else if (inPosition && crossedDown) {
    action = "SELL";
    reason = "Preço cruzou abaixo da SMA no candle fechado.";
  }

  return { action, reason, latestClose, previousClose, currentSma, previousSma, latestCloseTime };
}

module.exports = { calcSMA, buildSignal };
