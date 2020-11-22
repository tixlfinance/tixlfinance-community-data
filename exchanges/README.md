# Collaborate by adding or updating exchange information

## How to add an exchange?

1. Fork the repository and create a branch named `add-<exchange-domain>`. For example, a branch for adding Binance should be named `add-binance.com`.

2. To add a new exchange, add a sub-folder below `/exchanges`. The folder should be named by using the domain of the exchange. Examples: `binance.com` or `coinbase.com`.

3. In that directory, create a file named `info.json`. The file should be structured like the schema defined in [this schema](./0-schema/exchange.schema.ts).

4. Optionally, add a logo of the exchange in PNG format and with the name `logo.png` to the directory next to the `info.json` file.

## Exchange Score Documentation

The exchange score is calculated by using different factors. It is a subjective but transparent rating.

- Decentralization

  - 50: Fully decentralized (no centralized dependencies e.g. Infura)
  - 40: Almost fully decentralized (no custody, exchange trough decentralized protocol)
  - 20: Semi-decentralized
  - 0: Centralized

- Regulated Exchange

  - 50: Licence in top tier countries (US, Western Europe)
  - 30: Licence in another country (Malta, Georgia, Asia)
  - 20: Licence in low reputation country
  - 0: no licence

- Adoption
  - 50: 5 star crypto exchange
  - 40: 4 star crypto exchange
  - 30: 3 star crypto exchange
  - 20: 2 star crypto exchange
  - 10: 1 star crypto exchange
  - 0: 0 star crypto exchange
- Wash Trading Score

  - 30: Almost only wash trading. A lot of volume but bad liquidity.
  - 20: Medium fake volume.
  - 10: Some trading bots, but pretty good liquidity as well.
  - 0: Only real volume

- Total Score

Sum of the previous values minus wash_trading_score. The total score has a maximum of 10.
