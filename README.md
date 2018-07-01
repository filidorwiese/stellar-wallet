# Stellar Wallet

A lightweight command-line Stellar client built with node and the official [js-stellar-sdk](https://stellar.github.io/js-stellar-sdk/) package.

Runs on Linux, Window and MacOSX

![Network diagram](screenshot.png)

### Functionalities
- Generating a new wallet (works offline)
- Checking the balance of an existing wallet
- Making a payment from your existing wallet to another
- Setting the inflation pool for your wallet

### Installation
1. Make sure you have the current [Node LTS](https://nodejs.org/en/) release (or higher) installed on your system
2. Run `npm install -g stellar-wallet-cli` to install as a global dependency
3. Run `stellar-wallet-cli` to use

Update with `npm update -g stellar-wallet-cli`

---

### Usage:

#### Generating a new wallet

Pull the internet cord out of your computer (or disable wifi) and run the following command:

`$ stellar-wallet-cli generate`

#### Checking the balance of an existing wallet

To check the balance on your wallet, run:

`$ stellar-wallet-cli balance`

You'll be asked for the public address to check, or you can provide it directly on the command line:

`$ stellar-wallet-cli balance GDBQN3B6R2TZGWH6YPH4BOLWIEPA7WR3WRVFPUMDRJGPVSEWZPGEB6JI`

The output will also show if an inflation destination is set for this account and the last 10 transactions.
To see more transactions, you can up the limit:

`$ stellar-wallet-cli balance GDBQN3B6R2TZGWH6YPH4BOLWIEPA7WR3WRVFPUMDRJGPVSEWZPGEB6JI --limit [number]`

#### Making a payment from your existing wallet to another

To make a payment from a wallet you control to another address, run:

`$ stellar-wallet-cli pay`

You'll be asked for the XLM amount to send, the destination address, the sender address and finally the sender secret.

Alternatively, you can provide these params on the command line:

`$ stellar-wallet-cli pay --amount [number] --to [account] --memo [string|number]`

#### Setting the inflation pool for your wallet

To set an inflation destination for your account, run:

`$ stellar-wallet-cli set-inflation-pool`

And provide the pool address and your secret key to continue. When complete you can verify if the pool is correctly set by running `stellar-wallet-cli balance`.

Inflation is explained here: https://www.stellar.org/developers/guides/concepts/inflation.html
My personal favorite pool: https://lumenaut.net/
