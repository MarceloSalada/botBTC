# botBTC

Bot modular em Node.js para Binance Spot Testnet.

## O que já faz

- lê candles e ticker do BTCUSDT
- calcula SMA em candle fechado
- gera sinal BUY / SELL / HOLD
- valida quantidade pelo `LOT_SIZE`
- valida notional mínimo antes da ordem
- persiste estado em `data/state.json`
- grava logs em `logs/bot.log`
- roda em `DRY_RUN=true` por padrão

## Estrutura

```bash
src/
  config/
    env.js
  services/
    binance.js
  state/
    store.js
  strategy/
    smaCross.js
  utils/
    logger.js
    trading.js
  index.js
```

## Instalação

```bash
npm install
cp .env.example .env
```

## Execução

```bash
npm start
```

## Segurança

- não suba o `.env` para o GitHub
- não compartilhe API Key nem Secret Key
- teste primeiro com `DRY_RUN=true`
