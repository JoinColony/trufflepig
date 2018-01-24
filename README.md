TrufflePig 🍄🐷
==============

TrufflePig is a development tool that provides a simple HTTP API to find
and read from [Truffle](http://truffleframework.com/)-generated
contract files, for use during local development.

Maintainer: [Colony](https://github.com/JoinColony/) [@joincolony](https://twitter.com/joincolony)


Installation
------------
Install as a devDependency to your project:

```shell
$ yarn add trufflepig --dev
```


Prerequisites
-------------
* A Truffle framework project with built contract json files
* Some means of making HTTP requests and parsing the JSON results


Usage
-----
```JavaScript
import TrufflePig from 'trufflepig';

const trufflePig = new TrufflePig({
    paths: ["src/contracts/{,**/}*.json"],
    port: 31337, // optional
    verbose: true, // optional
});

const API_URL = trufflePig.apiUrl();

console.log(API_URL); // `//127.0.0.1:31337/contracts`

myFaveAjaxLibrary.get(API_URL, {
    name: 'MyContract',
}).then(artifactJson => {/*...*/});
```
