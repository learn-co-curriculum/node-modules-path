var fs = require('fs')
var path = require('path')
var customers = fs.readFileSync(path.join('data','customers.csv'), {encoding: 'utf8'})
console.log(customers, process.env.PWD)
