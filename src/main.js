const { Blockchain, Transactions } = require("./blockchain"); // Import the Blockchain and Transactions classes from the blockchain module

const EC = require('elliptic').ec; // Import the elliptic library for creating elliptic curve cryptography
const ec = new EC('secp256k1'); // Create an instance of elliptic curve cryptography using the secp256k1 curve

// Create a key pair from a private key
const myKey = ec.keyFromPrivate('b318061d2816e272de3bede908a754003e536bcafa200c0fe32126e3239445cd');
const myWalletAddress = myKey.getPublic('hex'); // Get the public key in hexadecimal format

let savjeeCoin = new Blockchain(); // Create a new instance of the Blockchain

// Create a new transaction and sign it with the private key
const tx1 = new Transactions(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
savjeeCoin.addTransaction(tx1); // Add the transaction to the blockchain

console.log("\nStarting the miner...");
savjeeCoin.minePendingTransaction(myWalletAddress); // Mine pending transactions and reward the miner

console.log("\nBalance of xavier is", savjeeCoin.getAddressOfBalance(myWalletAddress)); // Display the balance of the wallet

// Attempt to tamper with the blockchain
savjeeCoin.chain[1].transactions[0].amount = 1;

console.log('Is chain valid?', savjeeCoin.isChainValid()); // Check if the blockchain is valid
