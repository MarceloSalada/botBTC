# Setup do botBTC

## Como atualizar do GitHub

```bash
cd ~/botBTC
git fetch --all
rm -rf src
mkdir -p src

git reset --hard origin/main
npm install
```

## Como configurar

1. Copie .env.example para .env
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

## Rodar

```bash
npm start
```

## Teste forçado

```env
FORCE_SIGNAL=BUY
FORCE_SIGNAL_ONCE=true
DRY_RUN=true
```

Depois do teste, volte para:

```env
FORCE_SIGNAL=NONE
```
