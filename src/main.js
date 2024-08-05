/**
 * Import the Blockchain and Transactions classes from the blockchain module.
 */
const { Blockchain, Transactions } = require("./blockchain");

/**
 * Import the elliptic library for creating elliptic curve cryptography.
 */
const EC = require('elliptic').ec;

/**
 * Create an instance of elliptic curve cryptography using the secp256k1 curve.
 */
const ec = new EC('secp256k1');

/**
 * Create a key pair from a private key.
 * @param {string} privateKey - The private key to create the key pair from.
 * @returns {KeyPair} The created key pair.
 */
const myKey = ec.keyFromPrivate('b318061d2816e272de3bede908a754003e536bcafa200c0fe32126e3239445cd');

/**
 * Get the public key in hexadecimal format.
 * @returns {string} The public key in hexadecimal format.
 */
const myWalletAddress = myKey.getPublic('hex');

/**
 * Create a new instance of the Blockchain.
 */
let savjeeCoin = new Blockchain();

/**
 * Create a new transaction and sign it with the private key.
 * @param {string} fromAddress - The address of the sender.
 * @param {string} toAddress - The address of the recipient.
 * @param {number} amount - The amount to be transferred.
 */
const tx1 = new Transactions(myWalletAddress, 'public key goes here', 10);

/**
 * Sign the transaction with the private key.
 * @param {KeyPair} keyPair - The key pair to sign the transaction with.
 */
tx1.signTransaction(myKey);

/**
 * Add the transaction to the blockchain.
 * @param {Transaction} transaction - The transaction to be added.
 */
savjeeCoin.addTransaction(tx1);

console.log("\nStarting the miner...");

/**
 * Mine pending transactions and reward the miner.
 * @param {string} minerAddress - The address of the miner.
 */
savjeeCoin.minePendingTransaction(myWalletAddress);

console.log("\nBalance of xavier is", savjeeCoin.getAddressOfBalance(myWalletAddress));

// Attempt to tamper with the blockchain
savjeeCoin.chain[1].transactions[0].amount = 1;

console.log('Is chain valid?', savjeeCoin.isChainValid());

/**
 * Check if the blockchain is valid.
 * @returns {boolean} True if the blockchain is valid, false otherwise.
 */