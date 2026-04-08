function getFilter(exchangeInfo, filterType) {
  return exchangeInfo?.filters?.find((item) => item.filterType === filterType) || null;
}

function countDecimals(value) {
  const normalized = String(value);
  if (!normalized.includes(".")) return 0;
  return normalized.split(".")[1].replace(/0+$/, "").length;
}

function normalizeQuantity(rawQuantity, exchangeInfo) {
  const lotSize = getFilter(exchangeInfo, "LOT_SIZE");
  if (!lotSize) {
    return { quantity: String(rawQuantity), quantityNumber: Number(rawQuantity), lotSize: null };
  }

  const stepSize = Number(lotSize.stepSize);
  const minQty = Number(lotSize.minQty);
  const maxQty = Number(lotSize.maxQty);
  const requested = Number(rawQuantity);
  const decimals = countDecimals(lotSize.stepSize);
  const floored = Math.floor(requested / stepSize) * stepSize;
  const bounded = Math.max(minQty, Math.min(maxQty, floored));
  const quantityNumber = Number(bounded.toFixed(decimals));

  return {
    quantity: quantityNumber.toFixed(decimals),
    quantityNumber,
    lotSize,
  };
}

function validateNotional(price, quantityNumber, exchangeInfo) {
  const notionalFilter = getFilter(exchangeInfo, "NOTIONAL") || getFilter(exchangeInfo, "MIN_NOTIONAL");
  const notional = Number(price) * Number(quantityNumber);
  const minNotional = notionalFilter ? Number(notionalFilter.minNotional || notionalFilter.notional || 0) : 0;

  return {
    isValid: notional >= minNotional,
    notional,
    minNotional,
    notionalFilter,
  };
}

function extractBalances(accountInfo, assets = []) {
  const map = new Map((accountInfo?.balances || []).map((item) => [item.asset, item]));
  return assets.map((asset) => {
    const balance = map.get(asset) || { asset, free: "0.00000000", locked: "0.00000000" };
    return { asset: balance.asset, free: balance.free, locked: balance.locked };
  });
}

module.exports = { getFilter, normalizeQuantity, validateNotional, extractBalances };
