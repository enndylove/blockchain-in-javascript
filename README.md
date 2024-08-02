# Blockchain in Javascript. Blockchain Implementation <img src="https://img.shields.io/static/v1?label=✨ Javascript&message=Blockchain 🔑📈&color=ffffff" />
##### This project provides a simple implementation of a blockchain using JavaScript. The implementation includes basic functionalities such as creating transactions, mining blocks, and validating the chain.

![](https://i.ibb.co/WyBPTqz/300x300-logo.png)

## Getting Started

### Prerequisites

###### To run this project, you need to have Node.js installed on your machine. You can download and install Node.js from [here](https://nodejs.org/en).

### Installation
1. Clone the repository:
```shell
git clone https://github.com/enndylove/blockchain-in-javascript.git
```
2. Navigate to the project directory:
```shell
cd blockchain-in-javascript
```
3. Install the required dependencies:
```shell
npm install elliptic crypto-js
```

## Usage
### Generating Keys `keygenerator.js`

To generate a new pair of public and private keys, run the following script:
```javascript
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log();
console.log('Private key:', privateKey);

console.log();
console.log('Public key:', publicKey);
```

### Running the Blockchain `main.js`
1. Create a file named `main.js` and add the following code:
```javascript
const { Blockchain, Transactions } = require("./blockchain");

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('b318061d2816e272de3bede908a754003e536bcafa200c0fe32126e3239445cd');
const myWalletAddress = myKey.getPublic('hex');

let savjeeCoin = new Blockchain();

const tx1 = new Transactions(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey)
savjeeCoin.addTransaction(tx1)

console.log("\nStarting the miner...");
savjeeCoin.minePendingTransaction(myWalletAddress);

console.log("\nBalance of xavier is", savjeeCoin.getAddressOfBalance(myWalletAddress));

savjeeCoin.chain[1].transactions[0].amount = 1

console.log('Is chain valid?', savjeeCoin.isChainValid());
```
2. Run the script(if you on src folder):
```shell
node main.js
```
or
```shell
node ./main.js
```

## Blockchain and Transactions Implementation
###### The blockchain and transactions are implemented in the `blockchain.js` file. Here is the overview of the classes and their methods:
### Transactions
```javascript
class Transactions {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey) {
        if(signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}
```
### Block
```javascript
class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }

    hasValidTransactions() {
        for(const tx of this.transactions) {
            if(!tx.isValid()) return false;
        }

        return true;
    }
}
```

### Blockchain
```javascript
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.mimingReward = 100;
    }

    createGenesisBlock() {
        return new Block(0, "02/10/2018", "GenesisBlock", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransaction(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log('Block successful mined!');
        this.chain.push(block);

        this.pendingTransactions = [
            new Transactions(null, miningRewardAddress, this.mimingReward)
        ]
    }

    addTransaction(transactions) {

        if(!transactions.fromAddress || !transactions.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if(!transactions.isValid()) {
            throw new Error('Cannot and invalid transaction to chain');
        }

        this.pendingTransactions.push(transactions);
    }

    getAddressOfBalance(address) {
        let balance = 0

        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                if(trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid() {
        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidTransactions()) {
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transactions = Transactions;
```

## License
#### This project is licensed under the [MIT License](https://github.com/enndylove/blockchain-in-javascript/blob/main/LICENSE).

### Delicious coffee to you friends ☕
