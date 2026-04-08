# Setup do botBTC

## O que este projeto faz

Este projeto é um bot modular em Node.js para Binance Testnet.

- usa `.env` para configuração
- roda com `DRY_RUN=true` por padrão
- persiste o estado local em `data/state.json`
- grava logs em `logs/bot.log`
- usa cruzamento de preço com SMA em candle fechado
- permite forçar BUY/SELL para teste controlado
- valida quantidade pelo `stepSize`
- valida notional mínimo antes da ordem
- mostra ticker atual no startup

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
FORCE_SIGNAL=NONE
FORCE_SIGNAL_ONCE=true
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
- valida filtros
- mas não manda ordem real

## Teste forçado

Para forçar um BUY controlado:

```env
FORCE_SIGNAL=BUY
FORCE_SIGNAL_ONCE=true
DRY_RUN=true
```

Para forçar um SELL controlado:

```env
FORCE_SIGNAL=SELL
FORCE_SIGNAL_ONCE=true
DRY_RUN=true
```

Depois do teste, volte para:

```env
FORCE_SIGNAL=NONE
```

## Quando quiser enviar ordem real na testnet

Troque no `.env`:

```env
DRY_RUN=false
```

## Observações importantes

- o bot foi preparado para **Testnet**
- o estado local não vai para o GitHub
- o último candle já em formação não é usado como gatilho
- o bot evita reprocessar o mesmo candle fechado
- o preço usado pelo bot é o preço dinâmico do mercado, não um valor fixo no código

## Próximos passos possíveis

- validar saldo antes da ordem
- adicionar stop loss e take profit
- trocar polling por websocket
- adicionar backtest simples
