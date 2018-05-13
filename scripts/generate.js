'use strict'
const chalk = require('chalk')
const StellarSdk = require('stellar-sdk')
const config = require('./config.json')

console.log(chalk.green('-----------------------------------------------'))
console.log(chalk.green('Stellar Wallet'), chalk.yellow('Generate Wallet'))
console.log(chalk.green('-----------------------------------------------'), '\n')

const account = StellarSdk.Keypair.random()

console.log('  Public address:', chalk.yellow(account.publicKey()))
console.log('  Wallet secret:', chalk.yellow(account.secret()), '\n')

console.log(chalk.red('  Print this wallet and make sure to store it somewhere safe!'), '\n')
console.log(`  Note: You need to put at least ${config.minimumAccountBalance} ${config.currency} on this key for it to be an active account\n`)

