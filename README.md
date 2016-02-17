# Paths, Folders and Modules

## Overview


Consider the code in which we read a file on Mac OS X. The file is in a `data` folder relative to our script:

```js
var fs = require('fs')
var customers = fs.readFileSync('data/customers.csv', {encoding: 'utf8'})
console.log(customers)
```

Unfortunately, this code will break on Windows because of different path syntax (`data\customers.csv`). That's why we use `path.join()`. This example is in the file `customers.js`:

```js
var fs = require('fs')
var path = require('path')
var customers = fs.readFileSync(path.join('data','customers.csv'), {encoding: 'utf8'})
console.log(customers)
```

However, if we attempt to run the `customers.js` file from a parent folder with `node node-modules-path/customers.js`, the code will produce an error:

```
Error: ENOENT: no such file or directory, open 'data/customers.csv'
```

Note: If you're wondering why the heck run it from a parent folder, let us tell you: your application need to be robust, versatile and flexible enough so anyone can run it from anywhere, parent or any other folder. Think about deploying your app to AWS. The Ubuntu script will need to run your app from its location! Another example would be a CLI tool like grunt/gulp/webpack. Developers run them in any location.

The error tells us that there's no such directory and in fact that's true. Our data folder is in `node-modules-path`, and not in its parent folder. One option is to edit the file to reflect the change:

```
var fs = require('fs')
var path = require('path')
var customers = fs.readFileSync(path.join('node-modules-path', 'data', 'customers.csv'), {encoding: 'utf8'})
console.log(customers)
```

The script will work from the parent folder now, but I think you see the problem with this approach. Every time we change the folder from which we launch our Node script, we have to modify the source code. 

How about hard-coding an absolute path? Will work for now, but there's a potential problems with with hard-coded paths when you deploy an app. The absolute path on your computer will be very different from the production absolute path. This will cause issues.

This is not a good way to write programs. A better way is to use a dynamic absolute path, but how do we get it? 

To get an absolute path, there are is method `process.cwd()`, and two properties `__dirname` `process.env.PWD`. They a slightly different. We start with the property `__dirname`, because that's what we need to solve this problem. 

This lesson will cover how to work with paths, use them when importing modules. We'll also show a code organization technique where you can import folders.

## Objectives

1. Work with folders objects and methods such as `__dirname`, `process.cwd()` and `process.env.PWD`
1. Import folders (and describe why they'd need to)


## Working with __dirname

`__dirname` returns the global path to the location of the code being executed. Our problem is fixed by changing relative path to the CSV file to an absolute one:

```
var fs = require('fs')
var path = require('path')
var customers = fs.readFileSync(path.join(__dirname, 'data', 'customers.csv'), {encoding: 'utf8'})
console.log(customers)
```

Yay! Try to run this code on your own from different locations like:

```
node customers.js
node node-modules-path/customers.js
```

## Using process.cwd() 

When it comes to `process.cwd()` we get the current working directory of the process. In other words, it's an absolute path to the location from which we launch our script (the script which has the `process.cwd()`). 

In some cases, `process.cwd()` is the same as `__dirname`. It's when we launch the script from the folder in which the script is located, e.g., with `node customers.js` the value returned by `cwd()` is **the same** as the value of `__dirname`. 

In any other location, the `cwd()` will be different from the `__dirname` value, e.g., with `node node-modules-path/node customers.js`, the value returned by `cwd()` is **different** from the value of `__dirname`.

Knowing the difference between `cwd()` and `__dirname`, which one to choice when? The best rule of thumb is:

* Use `__dirname` when working with resources (files, modules, folders) when they are related to your script (e.g., one module), and you know that the relative path from your script is not going to change. For example, if you are creating a module, and you want to include a file in that module, you know the relative path to the file will stay the same because you're the creator of the module. Typically developers use `__dirname` when they write applications, and dependency modules.
* Use `process.cwd()` when working with a directory unrelated to your code. For example, if you are creating a command-line tool which generates a boilerplate code, you'll want to be able to use the tool in any directory to create new directories and files relative to the location in which you launch the tool and not in the location of the tool. Typically developers use `process.cwd()` for command-line tools.

Let's cover the very close relative to `cwd`, the `process.env.PWD`.

## Understanding process.env.PWD

The `process.env.PWD` is similar to the `process.cwd()` in the value of the absolute path. It will return the value of the directory from which you launched the Node process. PWD stands for Print Working Directory. For example, with `node node-modules-path/node customers`, the `PWD` variable will be ` /Users/azat/Documents/Code/learn-co` the same as the value of `process.cwd().


However, there are a few differences between `PWD` and `cwd()`. `PWD` is an environment variable and not a function. `PWD` is a call to the command on Unix-like systems:

```
pwd
```

You can also print the environment variable from the command line with `echo`:

```
echo $PWD
```

Another difference is that `PWD` can be changed with an assignment, just like any environment variable, while the current working directory can be changed with `process.chdir()`. Changing `PWD` won't affect the value of `cwd()`.

Also, the `PWD` env var is a POSIX (Unix, Linux, Mac OS X) variable which mean it won't work on Windows. The `process.cwd()` will work on Windows.

The `PWD` might be useful on POSIX systems (Unix, Linux, Mac OS X) to get the original value of the current working directory of the process. 


## Importing a Folder 

Sometime you need to import a few related files. Let's say you are working with accounts and you have modules to add, delete, update and read accounts:

```
add-accounts-.js
read-accounts.js
update-accounts.js
delete-accounts.js
```

In your main file you can import them one by one with `require(FILEPATH)`:

```js
var addAccounts = require('add-accounts.js')
var readAccounts = require('read-accounts.js')
var updateAccounts = require('update-accounts.js')
var deleteAccounts = require('delete-accounts.js')
addAccounts()
readAccounts()
...
```

Now let's imagine you have two more files in which you need to use the account functionality. You would repeat the four lines in those files. That's okay until it's not okay. What if instead of requiring four files, the new requirement is to add 10 more files. You need to add 10 more lines to each of those three "main" files which import the modules. Or maybe you want to initialize the accounts with some constructor code before performing the action like add, create, delete or update.

You can import the directory like this `var accounts = require('accounts')`. It's not a real directory import, but rather the import of an `index.js` file inside of that directory. So move the account files into a new directory `accounts`, and create `index.js`:

```js
// Code to initialize accounts
// will be executed when this module is required
module.exports = {
  addAccounts: require('add-accounts.js'),
  readAcccounts: require('read-accounts.js'),
  updateAccounts: require('update-accounts.js'),
  deleteAccounts: require('delete-accounts.js'),
}
```

Now change the code in importing files to this:

```js
var accounts = require('accounts')
accounts.addAccounts()
accounts.readAccounts()
```

This folder pattern is used in npm modules. If you require an npm module, you usually require a folder which has `index.js`. The folder name is the same as the module name. For example, the `chai` module is in the `chai` folder and when you require `chai`, Node take the code from `chai/index.js`. 

We hope know you know a bit more how Node imports modules (it does so by importing folders!). That's a good trivial question for your next JavaScript meetup.


## Resources

1. [Navigating Directories:The CWD, PWD, and CDUP commands](http://www.cs.cf.ac.uk/Dave/Internet/node122.html)
1. [process.cwd() official documentation](https://nodejs.org/api/process.html#process_process_cwd)
1. [__dirname official documentation](https://nodejs.org/docs/latest/api/globals.html#globals_dirname)


---

<a href='https://learn.co/lessons/node-modules-path' data-visibility='hidden'>View this lesson on Learn.co</a>
