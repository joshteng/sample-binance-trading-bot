# A Sample Market Making / Grid Trading Bot for Binance SPOT

This is a very simple and theoretical example for educational purpose. By default, it only places 1 order on each side of the order book.

![output](/assets/output.png)

### Configuration
```js
class Config {
  static apiKey = process.env.API_KEY
  static apiSecret = process.env.API_SECRET
  static baseUrl = 'https://testnet.binance.vision'
  static ticker = 'BTCBUSD'
  static distanceFromMidPrice = "0.01"
  static pricePrecisiion = 2
  static orderQuantity = 0.1
}
```

### To use this properly, the following situations / features will need to be added / handled:

1. Check when orders are filled and place order accordingly to manage accumulated inventory
2. Since this example uses SPOT market, if you do not have the base asset to be sold first (example BTC), you will need to have a bid filled first
3. Better way to manage desired spread
4. Other ways to determine mid price?
5. Multiple limit orders on both sides of the orderbook
6. Cancel and place new orders with a bit more sophistication? e.g. based on price movements rather than fixed duration

### To run this bot:
1. Have Node version > 19.0.0
2. Install dependencies:
    ```sh
    npm install
    ```
3. Obtain API credentials for testnet: https://testnet.binance.vision/
4. Run it
    ```sh
    API_KEY=<YOUR_APY_KEY> API_SECRET=<YOUR_APY_SECRET> node index.js
    ```

### To run it with your actual account:
1. Change `Config.baseUrl` to `api.binance.com`
2. Use production API Credentials

### Disclaimer
1. This is for educational purpose to demonstrate the use of Binance's official Node SDK
2. Manage your API keys safely! Never include it in your code. Use and manage environment variables safely
3. It's advisable to never have withdrawal permission enabled on your API credentials if not necessary