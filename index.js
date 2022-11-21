import { Spot } from '@binance/connector'
import bigDecimal from 'js-big-decimal';
import { sleep } from './lib/utilities.js'

class Config {
  static apiKey = process.env.API_KEY
  static apiSecret = process.env.API_SECRET
  static baseUrl = 'https://testnet.binance.vision'
  static ticker = 'BTCBUSD'
  static distanceFromMidPrice = "0.01"
  static pricePrecisiion = 2
  static orderQuantity = 0.1
}

const client = new Spot(Config.apiKey, Config.apiSecret, { baseURL: Config.baseUrl })

async function getAccountInformation() {
  const resp = await client.account()
  console.log("Account Balance:")
  resp.data.balances.forEach(balance => {
    console.log(`${balance.asset.padEnd(5)}: ${balance.free}`)
  })
}

let lastPrice
async function subscribe(trade) {
  const callbacks = {
    open: () => {
      client.logger.log('Connection opened; starting to trade...')
      trade()
    },
    close: () => {
      client.logger.log('Connection closed; cancelling all open orders...')
      cancelOpenOrders()
    },
    message: data => {
      // https://binance-docs.github.io/apidocs/spot/en/#trade-streams
      // { "e": "trade", "E": 1669042381366, "s": "BNBBUSD", "t": 184668392, "p": "262.40000000", "q": "0.10000000", "b": 1479208437, "a": 1479208069, "T": 1669042381365, "m": false, "M": true }
      try {
        lastPrice = JSON.parse(data)["p"]
      } catch (err) {
        console.log(err)
      }
    }
  }

  client.tradeWS(Config.ticker, callbacks)
}


async function placeAsk() {
  try {
    const res = await client.newOrder(Config.ticker, 'SELL', 'LIMIT', {
      price: bigDecimal.round(
        bigDecimal.multiply(lastPrice, bigDecimal.add("1", Config.distanceFromMidPrice)),
        Config.pricePrecisiion,
        bigDecimal.RoundingModes.UP),
      quantity: Config.orderQuantity,
      timeInForce: 'GTC'
    })

    const data = res.data

    client.logger.log(`Placed ${data.symbol} ask for ${data.origQty} at ${data.price}`)

  } catch (err) {
    client.logger.error(err)
  }
}

async function placeBid() {
  try {
    const res = await client.newOrder(Config.ticker, 'BUY', 'LIMIT', {
      price: bigDecimal.round(
        bigDecimal.multiply(lastPrice, bigDecimal.subtract("1", Config.distanceFromMidPrice)),
        Config.pricePrecisiion,
        bigDecimal.RoundingModes.UP),
      quantity: Config.orderQuantity,
      timeInForce: 'GTC'
    })

    const data = res.data

    client.logger.log(`Placed ${data.symbol} bid for ${data.origQty} at ${data.price}`)

  } catch (err) {
    client.logger.error(err)
  }
}

async function cancelOpenOrders() {
  try {
    await client.cancelOpenOrders(Config.ticker)
    console.log("Cancelled all open orders")
  } catch (err) {
    console.log(err)
  }
}

async function trade() {
  while (true) {
    if (lastPrice) {
      console.log("-----")
      await cancelOpenOrders()
      placeBid()
      placeAsk()
    }
    await sleep(10000)
  }
}

async function start() {
  await getAccountInformation()
  try {
    subscribe(trade)
  } catch (err) {
    console.log("Something went wrong. Cancelling open orders...")
    console.log(err)
    await cancelOpenOrders()
  }
}

start()
