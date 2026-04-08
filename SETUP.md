# Setup do botBTC

## O que este projeto faz

Este projeto é um bot modular em Node.js para Binance Testnet.

- usa `.env` para configuração
- roda com `DRY_RUN=true` por padrão
- persiste o estado local em `data/state.json`
- grava logs em `logs/bot.log`
- usa cruzamento de preço com SMA em candle fechado

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
  index.js
```

## Como instalar

```bash
npm install
```

## Como configurar

1. Copie `.env.example` para `.env`
2. Preencha suas chaves da Binance Testnet
3. Ajuste símbolo, quantidade e intervalo se quiser

Exemplo:

```env
BINANCE_API_URL=https://testnet.binance.vision
BINANCE_API_KEY=SUA_KEY
BINANCE_SECRET_KEY=SUA_SECRET
BOT_SYMBOL=BTCUSDT
BOT_QUANTITY=0.001
BOT_INTERVAL_MS=30000
BOT_TIMEFRAME=15m
BOT_SMA_PERIOD=20
DRY_RUN=true
LOG_TO_FILE=true
```

## Como rodar

```bash
npm start
```

## Primeiro teste recomendado

Use primeiro com:

```env
DRY_RUN=true
```

Assim o bot:
- lê mercado
- gera sinal
- salva estado
- grava log
- mas não manda ordem real

## Quando quiser enviar ordem real

Troque no `.env`:

```env
DRY_RUN=false
```

## Observações importantes

- o bot foi preparado para **Testnet**
- o estado local não vai para o GitHub
- o último candle já em formação não é usado como gatilho
- o bot evita reprocessar o mesmo candle fechado

## Próximos passos possíveis

- validar saldo antes da ordem
- validar filtros de quantidade da Binance
- adicionar stop loss e take profit
- trocar polling por websocket
- adicionar backtest simples
