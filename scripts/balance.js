'use strict'
const chalk = require('chalk')
const minimist = require('minimist')
const inquirer = require('inquirer')
const StellarSdk = require('stellar-sdk')
const StellarBase = require('stellar-base')

const server = new StellarSdk.Server('https://horizon.stellar.org')
StellarSdk.Network.usePublicNetwork()

console.log(chalk.green('-----------------------------------------------'))
console.log(chalk.green('Stellar Wallet'), chalk.yellow('Balance Check'))
console.log(chalk.green('-----------------------------------------------'), '\n')

const argv = minimist(process.argv.slice(3))
const limitTransactions = argv.limit || 10

const getBalance = (address) => {
  server.loadAccount(address)
    .then((account) => {
      // Show balances
      console.log(chalk.yellow('Current Balance'))
      account.balances.forEach((balance) => {
        if (balance.balance > 0) {
          console.log(balance.balance, balance.asset_code || config.currency)
        }
      })
      console.log()

      // Show inflation pool if set
      if (account.inflation_destination) {
        console.log(chalk.yellow('Inflation pool'))
        console.log(account.inflation_destination, '\n')
      }

      // Show recent transactions
      server.operations()
        .forAccount(address)
        .order('desc')
        .limit(limitTransactions)
        .call()
        .then((results) => {
          if (results.records && results.records.length) {
            console.log(chalk.yellow(`Last ${limitTransactions} transactions`))
            results.records.forEach(t => displayRecord(t, address))
            console.log()
          }
        })

    }).catch(fail)
}

const displayRecord = (record, address) => {
  switch (record.type) {
    case 'payment':
      const amount = +parseFloat(record.amount).toFixed(5)
      const plusMinus = record.from === address ? '-' : '+'
      const directionArrow = record.from === address ? '→' : '←'
      const currency = record.asset_type === 'native' ? config.currency : p.asset_type
      console.log(`${record.created_at} ${record.type}\t${plusMinus}${amount} ${currency} ${directionArrow} ${record.to}`)
      break
    default:
      console.log(`${record.created_at} ${record.type}`)
      break
  }
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
