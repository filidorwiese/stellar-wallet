'use strict'
const chalk = require('chalk')
const minimist = require('minimist')
const inquirer = require('inquirer')
const StellarSdk = require('stellar-sdk')
const StellarBase = require('stellar-base')
const config = require('./config.json')

const server = new StellarSdk.Server('https://horizon.stellar.org')

console.log(chalk.green('-----------------------------------------------'))
console.log(chalk.green('Stellar Wallet'), chalk.yellow('Make Payment'))
console.log(chalk.green('-----------------------------------------------'), '\n')

const argv = minimist(process.argv.slice(2))
const currencyType = StellarSdk.Asset.native()

const getBalance = (address) => {
  return server.loadAccount(address).then((account) => {
    let xlmBalance = 0
    account.balances.forEach((balance) => {
      if (balance.asset_type === 'native') xlmBalance += balance.balance
    })
    return +xlmBalance
  }).catch(fail)
}

const waitForBalancesUpdate = (sourceAddress, destinationAddress, origSourceBalance) => {
  Promise.all([
    getBalance(sourceAddress),
    getBalance(destinationAddress)
  ]).then(([sourceBalance, destinationBalance]) => {

    if (sourceBalance < origSourceBalance) {

      console.log('New source balance:', chalk.green(sourceBalance, config.currency))

      console.log('New destination balance:', chalk.green(destinationBalance, config.currency))

      process.exit(0)

    } else {

      setTimeout(() => waitForBalancesUpdate(sourceAddress, destinationAddress, origSourceBalance), 1000)

    }

  })
}

const fail = (message) => {
  console.error(chalk.red(message))
  if (message.response && message.response.data && message.response.data.extras && message.response.data.extras.result_codes && message.response.data.extras.result_codes.operations) {
    const reason = message.response.data.extras.result_codes.operations;
    switch(reason) {
      case 'op_underfunded':
        console.log(chalk.red('reason:', 'Sender account has insufficient funds'));
        break;
      default:
        console.log(chalk.red('reason:', reason))
    }
  }
  process.exit(1)
}

const questions = [
  {
    type: 'input',
    name: 'amount',
    default: argv.amount,
    message: 'Enter ' + config.currency + ' amount to send:',
    validate: (value) => isNaN(parseInt(value)) ? 'Please enter a number' : true
  },
  {
    type: 'input',
    name: 'destinationAddress',
    default: argv.to,
    message: 'Enter destination address:',
    validate: (value) => StellarBase.StrKey.isValidEd25519PublicKey(value) ? true : 'Please enter a valid address'
  },
  {
    type: 'input',
    name: 'memo',
    default: argv.memo,
    message: 'Enter memo (optional):',
    validate: (value) => value && value.length > 26 ? 'Please enter a valid memo' : true,
  },
  {
    type: 'input',
    name: 'sourceSecret',
    message: 'Enter sender secret:',
    validate: (value) => StellarBase.StrKey.isValidEd25519SecretSeed(value) ? true : 'Invalid secret'
  }
]

inquirer.prompt(questions).then((answers) => {
  const sourceKeypair = StellarSdk.Keypair.fromSecret(answers.sourceSecret)
  const sourceAddress = sourceKeypair.publicKey()
  if (sourceAddress === answers.destinationAddress) {
    fail('Sender address should not be the same as the destination address')
  }
  console.log()

  return Promise.all([
    getBalance(sourceAddress),
    getBalance(answers.destinationAddress)
  ]).then(([sourceBalance, destinationBalance]) => {

    console.log('Current destination balance:', chalk.green(destinationBalance, config.currency))
    if (!destinationBalance || destinationBalance + answers.amount < config.minimumAccountBalance) {
      fail(`Send at least ${config.minimumAccountBalance} XLM to create the destination address`)
    }

    console.log('Current sender balance:', chalk.green(sourceBalance, config.currency))
    if (!sourceBalance || sourceBalance - answers.amount < config.minimumAccountBalance) {
      fail(`There should be at least ${config.minimumAccountBalance} XLM remaining at the sender address`)
    }

    inquirer.prompt([
      {
        type: 'confirm',
        name: 'sure',
        default: false,
        message: 'Ready to send?'
      }
    ]).then((confirm) => {
      if (!confirm.sure) {
        process.exit()
      }

      console.log('\nConnecting...')
      server.loadAccount(sourceAddress)
        .then((account) => {

          console.log('Preparing payment transaction...')
          let transaction = new StellarSdk.TransactionBuilder(account, { fee: StellarBase.BASE_FEE, networkPassphrase: StellarBase.Networks.PUBLIC })
            .addOperation(StellarSdk.Operation.payment({
              destination: answers.destinationAddress,
              asset: currencyType,
              amount: String(answers.amount)
            })).setTimeout(1000)

          // Add Memo?
          if (answers.memo) {
            if (String(answers.memo).match(/^[0-9]*$/)) {
              transaction = transaction.addMemo(StellarSdk.Memo.id(answers.memo))
            } else {
              transaction = transaction.addMemo(StellarSdk.Memo.text(answers.memo))
            }
          }

          // Finalize
          transaction = transaction.build()
          transaction.sign(sourceKeypair)

          console.log('Submitting payment...')
          server.submitTransaction(transaction)
            .then((transactionResult) => {
              console.log('\nSuccess! View the transaction at: ')
              console.log(chalk.yellow(transactionResult._links.transaction.href), '\n')

              console.log('Waiting for balance to update (use Ctrl-C to abort)')
              waitForBalancesUpdate(sourceAddress, answers.destinationAddress, sourceBalance)
            })
            .catch(fail)
        })
        .catch(fail)
    })

  })
})
