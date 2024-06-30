const EC = require('elliptic').ec; // Import the elliptic library for creating elliptic curve cryptography
const ec = new EC('secp256k1'); // Create an instance of elliptic curve cryptography using the secp256k1 curve

const key = ec.genKeyPair(); // Generate a new key pair (public and private keys)
const publicKey = key.getPublic('hex'); // Get the public key in hexadecimal format
const privateKey = key.getPrivate('hex'); // Get the private key in hexadecimal format

console.log();
console.log('Private key:', privateKey); // Print the private key to the console

console.log();
console.log('Public key:', publicKey); // Print the public key to the console
