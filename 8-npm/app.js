const validator = require('validator');
const chalk = require('chalk');

// console.log(validator.isEmail('jati@gmail.com'));
// console.log(validator.isMobilePhone('0812294392', 'id-ID'));
// console.log(validator.isNumeric('0812294392'));

// console.log(chalk.italic.black.bgBlue(`Hello, World!`));
const pesan = chalk`{bgBlue.bold.red Lorem} ipsum dolor, {bgRed sit amet} consectetur adipisicing {bgGreen.italic elit.} Cumque, {bgRed non.}`;
console.log(pesan);