var fs = require('fs')
var path = require('path')
var customers = fs.readFileSync(path.join(__dirname, 'data', 'customers.csv'), {encoding: 'utf8'})
process.env.PWD='/'
console.log(customers, process.env.PWD, process.cwd())
