'use strict'
const chalk = require('chalk')
const inquirer = require('inquirer')
const StellarSdk = require('stellar-sdk')
const StellarBase = require('stellar-base')

const server = new StellarSdk.Server('https://horizon.stellar.org')
StellarSdk.Network.usePublicNetwork()

console.log(chalk.green('-----------------------------------------------'))
console.log(chalk.green('Stellar Wallet'), chalk.yellow('Set Inflation Pool'))
console.log(chalk.green('-----------------------------------------------'), '\n')

const setInflationPool = (secret, pool) => {
  const sourceKeypair = StellarSdk.Keypair.fromSecret(secret)
  server.loadAccount(sourceKeypair.publicKey())
    .then((account) => {
      const tx = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.setOptions({
          inflationDest: pool
        })).build()
      tx.sign(sourceKeypair)

      console.log('Please wait...')
      return server.submitTransaction(tx)
    })
    .then(() => {
      console.log('OK')
      process.exit(0)
    })
    .catch(fail)
}

const fail = (message) => {
  console.error(chalk.red(message.name), '\n')
  process.exit(1)
}

const questions = [
  {
    type: 'input',
    name: 'pool',
    message: 'Enter pool address:',
    validate: (value) => StellarBase.StrKey.isValidEd25519PublicKey(value) ? true : 'Please enter a valid address'
  },
  {
    type: 'input',
    name: 'sourceSecret',
    message: 'Enter wallet secret:',
    validate: (value) => StellarBase.StrKey.isValidEd25519SecretSeed(value) ? true : 'Invalid secret'
  }
]

inquirer.prompt(questions).then((answers) => {
  console.log()
  setInflationPool(answers.sourceSecret, answers.pool)
})