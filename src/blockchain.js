const SHA256 = require("crypto-js/sha256"); // Import the SHA256 hashing function from crypto-js

const EC = require('elliptic').ec; // Import the elliptic library for creating elliptic curve cryptography
const ec = new EC('secp256k1'); // Create an instance of elliptic curve cryptography using the secp256k1 curve

class Transactions {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress; // Address sending the transaction
        this.toAddress = toAddress; // Address receiving the transaction
        this.amount = amount; // Amount being transferred
    }

    calculateHash() {
        // Calculate the SHA256 hash of the transaction details
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey) {
        // Ensure the signing key corresponds to the sender's address
        if(signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        // Calculate the hash of the transaction and sign it
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex'); // Store the signature
    }

    isValid() {
        // If the transaction is from the mining reward (no sender), it's valid
        if(this.fromAddress === null) return true;

        // Ensure the transaction has a signature
        if(!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        // Verify the transaction's signature
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp; // Time when the block was created
        this.transactions = transactions; // List of transactions in the block
        this.previousHash = previousHash; // Hash of the previous block
        this.hash = this.calculateHash(); // Hash of the current block
        this.nonce = 0; // Nonce for mining
    }

    calculateHash() {
        // Calculate the SHA256 hash of the block details
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        // Mine the block by finding a hash that matches the difficulty
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }

    hasValidTransactions() {
        // Check if all transactions in the block are valid
        for(const tx of this.transactions) {
            if(!tx.isValid()) return false;
        }
        return true;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()]; // Initialize the chain with the genesis block
        this.difficulty = 2; // Set the mining difficulty
        this.pendingTransactions = []; // List of pending transactions
        this.mimingReward = 100; // Reward for mining a block
    }

    createGenesisBlock() {
        // Create the genesis block (first block in the chain)
        return new Block(0, "02/10/2018", "GenesisBlock", "0");
    }

    getLatestBlock() {
        // Get the latest block in the chain
        return this.chain[this.chain.length - 1];
    }

    minePendingTransaction(miningRewardAddress) {
        // Mine the pending transactions and create a new block
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block); // Add the newly mined block to the chain

        // Reward the miner by creating a new transaction
        this.pendingTransactions = [
            new Transactions(null, miningRewardAddress, this.mimingReward)
        ];
    }

    addTransaction(transactions) {
        // Ensure the transaction has from and to addresses
        if(!transactions.fromAddress || !transactions.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        // Ensure the transaction is valid
        if(!transactions.isValid()) {
            throw new Error('Cannot add an invalid transaction to the chain');
        }

        this.pendingTransactions.push(transactions); // Add the transaction to the list of pending transactions
    }

    getAddressOfBalance(address) {
        // Calculate the balance of an address
        let balance = 0;

        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.fromAddress === address) {
                    balance -= trans.amount; // Subtract amount if the address is the sender
                }
                if(trans.toAddress === address) {
                    balance += trans.amount; // Add amount if the address is the receiver
                }
            }
        }

        return balance; // Return the balance of the address
    }

    isChainValid() {
        // Check if the blockchain is valid
        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Ensure all transactions in the block are valid
            if(!currentBlock.hasValidTransactions()) {
                return false;
            }

            // Ensure the block's hash is correct
            if(currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            // Ensure the block points to the correct previous block
            if(currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true; // The chain is valid
    }
}

module.exports.Blockchain = Blockchain; // Export the Blockchain class
module.exports.Transactions = Transactions; // Export the Transactions class
