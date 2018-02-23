TrufflePig 🍄🐷
==============

[![Greenkeeper badge](https://badges.greenkeeper.io/JoinColony/trufflepig.svg?token=b94b73132757a3fad08c00bed439c04e32d424ebda92025aec686b3297b1d0fa&ts=1518714748864)](https://greenkeeper.io/)

TrufflePig is a development tool that provides a simple HTTP API to find and read from [Truffle](http://truffleframework.com/)-generated contract files, for use during local development.

![The pig in action!](https://github.com/JoinColony/trufflepig/raw/master/docs/ui.png)

Installation
------------
Install globally:

```shell
$ yarn global add trufflepig
```

Or as a devDependency to your truffle project:

```shell
$ yarn add trufflepig --dev
```


Prerequisites
-------------
* A Truffle framework project with built contract json files
* Some means of making HTTP requests and parsing the JSON results


Usage
-----

Just run

```shell
$ trufflepig
```

from your truffle project and access your contracts under

```
http://localhost:3030/contracts?name=MyContractName
```

and look like this:

```json
{
  "contractName": "MyContractName",
  "abi": {},
  ...
}
```

The contracts will be queried by the `contractName` property in the truffle .json output. Once contract files are changed, trufflepig picks it up and serves the changed version of it.

Serving accounts data from ganache or geth / parity
---------------------------------------------------

Trufflepig not only helps you to access those delicious truffles but also to easily access the set up addresses in ganache, geth or parity. These will be available under

```
http://localhost:3030/accounts
```

and look like this:

```json
{
  "0x57bb04b8a56c4530ea75ded0a8a0632987d7ec44":"0xd4f10bbe0e132a0d7a7aea3d92e68791f548b67dc5d1dac8ad56edfbc5038ba5",
  "0x241b5d67f21f23d03dec3ffc50504472f265745f":"0xb526e1b11956eb45c3c306a9fef1775b44e22c5e6aec30e103d7d973c6b29189",
  ...
}
```

#### Usage with [ganache](https://github.com/trufflesuite/ganache-cli)

Start ganache using

```
$ ganache-cli --acctKeys ganache-accounts.json
```

This will create a `ganache-accounts.json` in the directory you run ganache from (preferably your project directory)

Then run trufflepig using

```
$ trufflepig --ganacheKeyFile ganache-accounts.json
```

#### Usage with [keystore files](https://medium.com/@julien.m./what-is-an-ethereum-keystore-file-86c8c5917b97)

You can run your prefered ethereum development node with some accounts set up. In [parity](https://github.com/paritytech/parity) run

```shell
$ parity --keys-path YOUR_PREFERRED_KEYPATH
```

and in [geth](https://github.com/ethereum/go-ethereum/wiki/geth)

```shell
$ geth --keystore YOUR_PREFERRED_KEYPATH
```

to define the directory for accounts to use when starting the node. This directory has to contain one or more keystore files in json format.

Trufflepig can conveniently serve those, too! Just start it with

```shell
$ trufflepig --keystoreDir YOUR_PREFERRED_KEYPATH [--keystorePassword KEYSTORE_PASSWORD]
```

Use the `--keystorePassword` option to provide a password in case your keyfiles ar encrypted.

API
---

#### Command line usage

```
$ trufflepig --help
Options:
  --help                  Show help [boolean]
  --version               Show version number [boolean]
  -p, --port              Port to serve the contracts from [number] [default: 3030]
  -v, --verbose           Be extra chatty [boolean] [default: false]
  -c, --contractDir       Directory to read contracts from [string] [default: "./build/contracts"]
  -g, --ganacheKeyFile    Ganache accounts file (.json), will serve accounts under /accounts [string]
  -k, --keystoreDir       Directory for keystore files, will serve accounts under /accounts [string]
  -s, --keystorePassword  Password to decrypt keystore files [string]
```

#### Programmatic usage

```JavaScript
const TrufflePig = require('trufflepig');

const pig = new TrufflePig({
    // These are the defaults
    contractDir: './build/contracts',
    port: 3030,
    verbose: true,
    ganacheKeyFile: '',
    keystoreDir: '',
    keystorePassword: '',
});

pig.start();
```

**That's it!** Have a lot of fun truffleing!
