#! /usr/bin/env node
const chalk = require('chalk')

if (process.version.match(/v(\d+)\./)[1] < 6) {

  console.error('stellar-wallet-cli: Node v6 or greater is required.')

} else {

  switch (process.argv[2]) {
    case 'generate':
    case 'balance':
    case 'pay':
    case 'set-inflation-pool':
      require(`../scripts/${process.argv[2]}.js`)
      break
    default:
      console.log('\n ', 'Usage: ' + chalk.green('stellar-wallet-cli') + ' ' + chalk.yellow('[command]') + '', '\n')
      console.log('  Available commands:', '\n')
      console.log(chalk.yellow('  generate'), '\t\t', 'to generate a new wallet address + secret (works offline)')
      console.log(chalk.yellow('  balance'), '\t\t', 'to check the available funds on a given Stellar address')
      console.log(chalk.yellow('  pay'), '\t\t\t', 'to move funds from one address to another')
      console.log(chalk.yellow('  set-inflation-pool'), '\t', 'to set an inflation pool for a given wallet', '\n')
      process.exit(-1)
      break
  }

}
