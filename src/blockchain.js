const SHA256 = require("crypto-js/sha256"); // Import the SHA256 hashing function from crypto-js

const EC = require('elliptic').ec; // Import the elliptic library for creating elliptic curve cryptography
const ec = new EC('secp256k1'); // Create an instance of elliptic curve cryptography using the secp256k1 curve

/**
 * Represents a transaction in the blockchain.
 */
class Transactions {
    /**
     * Creates a new transaction.
     * @param {string} fromAddress - The address sending the transaction.
     * @param {string} toAddress - The address receiving the transaction.
     * @param {number} amount - The amount being transferred.
     */
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress; // Address sending the transaction
        this.toAddress = toAddress; // Address receiving the transaction
        this.amount = amount; // Amount being transferred
    }

    /**
     * Calculates the SHA256 hash of the transaction details.
     * @returns {string} The hash of the transaction.
     * @example
     * const tx = new Transactions('sender', 'eceiver', 10);
     * console.log(tx.calculateHash()); // Output: a SHA256 hash string
     */
    calculateHash() {
        // Calculate the SHA256 hash of the transaction details
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    /**
     * Signs the transaction with a private key.
     * @param {object} signingKey - The private key used for signing.
     * @throws {Error} If the signing key does not correspond to the sender's address.
     * @example
     * const tx = new Transactions('sender', 'eceiver', 10);
     * const privateKey = ec.keyFromPrivate('privateKeyHex');
     * tx.signTransaction(privateKey);
     */
    signTransaction(signingKey) {
        // Ensure the signing key corresponds to the sender's address
        if(signingKey.getPublic('hex')!== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        // Calculate the hash of the transaction and sign it
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex'); // Store the signature
    }

    /**
     * Verifies the transaction's signature.
     * @returns {boolean} True if the transaction is valid, false otherwise.
     * @example
     * const tx = new Transactions('sender', 'eceiver', 10);
     * console.log(tx.isValid()); // Output: true or false
     */
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

/**
 * Represents a block in the blockchain.
 */
class Block {
    /**
     * Creates a new block.
     * @param {number} timestamp - The time when the block was created.
     * @param {array} transactions - The list of transactions in the block.
     * @param {string} previousHash - The hash of the previous block.
     */
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp; // Time when the block was created
        this.transactions = transactions; // List of transactions in the block
        this.previousHash = previousHash; // Hash of the previous block
        this.hash = this.calculateHash(); // Hash of the current block
        this.nonce = 0; // Nonce for mining
    }

    /**
     * Calculates the SHA256 hash of the block details.
     * @returns {string} The hash of the block.
     * @example
     * const block = new Block(1643723400, [new Transactions('sender', 'eceiver', 10)]);
     * console.log(block.calculateHash()); // Output: a SHA256 hash string
     */
    calculateHash() {
        // Calculate the SHA256 hash of the block details
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    /**
     * Mines the block by finding a hash that matches the difficulty.
     * @param {number} difficulty - The mining difficulty.
     * @example
     * const block = new Block(1643723400, [new Transactions('sender', 'eceiver', 10)]);
     * block.mineBlock(2);
     */
    mineBlock(difficulty) {
        // Mine the block by finding a hash that matches the difficulty
        while(this.hash.substring(0, difficulty)!== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }

    /**
     * Checks if all transactions in the block are valid.
     * @returns {boolean} True if all transactions are valid, false otherwise.
     * @example
     * const block = new Block(1643723400, [new Transactions('sender', 'eceiver', 10)]);
     * console.log(block.hasValidTransactions()); // Output: true or false
     */
    hasValidTransactions() {
        // Check if all transactions in the block are valid
        for(const tx of this.transactions) {
            if(!tx.isValid()) return false;
        }
        return true;
    }
}

/**
 * Represents the blockchain.
 */
class Blockchain {
    /**
     * Creates a new blockchain.
     */
    constructor() {
        this.chain = [this.createGenesisBlock()]; // Initialize the chain with the genesis block
        this.difficulty = 2; // Set the mining difficulty
        this.pendingTransactions = []; // List of pending transactions
        this.mimingReward = 100; // Reward for mining a block
    }

    /**
     * Creates the genesis block (first block in the chain).
     * @returns {Block} The genesis block.
     */
    createGenesisBlock() {
        // Create the genesis block (first block in the chain)
        return new Block(0, "02/10/2018", "GenesisBlock", "0");
    }

    /**
     * Gets the latest block in the chain.
     * @returns {Block} The latest block.
     * @example
     * const blockchain = new Blockchain();
     * console.log(blockchain.getLatestBlock()); // Output: the latest block
     */
    getLatestBlock() {
        // Get the latest block in the chain
        return this.chain[this.chain.length - 1];
    }

    /**
     * Mines the pending transactions and creates a new block.
     * @param {string} miningRewardAddress - The address receiving the mining reward.
     * @example
     * const blockchain = new Blockchain();
     * blockchain.minePendingTransaction('minerAddress');
     */
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

    /**
     * Adds a transaction to the blockchain.
     * @param {Transactions} transaction - The transaction to be added.
     * @throws {Error} If the transaction is invalid.
     * @example
     * const blockchain = new Blockchain();
     * const tx = new Transactions('sender', 'eceiver', 10);
     * blockchain.addTransaction(tx);
     */
    addTransaction(transaction) {
        // Ensure the transaction has from and to addresses
        if(!transaction.fromAddress ||!transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        // Ensure the transaction is valid
        if(!transaction.isValid()) {
            throw new Error('Cannot add an invalid transaction to the chain');
        }

        this.pendingTransactions.push(transaction); // Add the transaction to the list of pending transactions
    }

    /**
     * Gets the balance of an address.
     * @param {string} address - The address to get the balance for.
     * @returns {number} The balance of the address.
     * @example
     * const blockchain = new Blockchain();
     * console.log(blockchain.getAddressOfBalance('address')); // Output: the balance
     */
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

    /**
     * Checks if the blockchain is valid.
     * @returns {boolean} True if the blockchain is valid, false otherwise.
     * @example
     * const blockchain = new Blockchain();
     * console.log(blockchain.isChainValid()); // Output: true or false
     */
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
            if(currentBlock.hash!== currentBlock.calculateHash()) {
                return false;
            }

            // Ensure the block points to the correct previous block
            if(currentBlock.previousHash!== previousBlock.hash) {
                return false;
            }
        }

        return true; // The chain is valid
    }
}

module.exports.Blockchain = Blockchain; // Export the Blockchain class
module.exports.Transactions = Transactions; // Export the Transactions class