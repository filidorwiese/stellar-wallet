'use strict'
const chalk = require('chalk')
const inquirer = require('inquirer')
const StellarSdk = require('stellar-sdk')
const StellarBase = require('stellar-base')

const server = new StellarSdk.Server('https://horizon.stellar.org')
StellarSdk.Network.usePublicNetwork()

console.log(chalk.green('-----------------------------------------------'))
console.log(chalk.green('Stellar Wallet'), chalk.yellow('Balance Check'))
console.log(chalk.green('-----------------------------------------------'), '\n')

const getBalance = (address) => {
  server.loadAccount(address).then((account) => {
    account.balances.forEach((balance) => {
      if (balance.balance > 0) {
        console.log('  ' + chalk.green(balance.balance, balance.asset_code || 'XLM'))
      }
    })
    console.log("\n", chalk.yellow('Inflation pool'), account.inflation_destination || 'not set', "\n")
    process.exit(0)
  }).catch(fail)
}

const fail = (message) => {
  console.error(chalk.red(message.name), '\n')
  process.exit(1)
}

if (process.argv[3] && StellarBase.StrKey.isValidEd25519PublicKey(process.argv[3])) {

  getBalance(process.argv[3])

} else {

  const questions = [
    {
      type: 'input',
      name: 'wallet',
      message: 'Enter wallet address:',
      validate: (value) => StellarBase.StrKey.isValidEd25519PublicKey(value) ? true : 'Please enter a valid address'
    }
  ]

  inquirer.prompt(questions).then((answers) => {
    console.log()
    getBalance(answers.wallet)
  })

}
