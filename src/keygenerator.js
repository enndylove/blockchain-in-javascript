/**
 * Generate a new key pair using the secp256k1 elliptic curve.
 *
 * @returns {Object} - An object containing the public and private keys in hexadecimal format.
 *
 * @example
 * const keys = generateKeyPair();
 * console.log(keys.publicKey); // Output: a public key in hexadecimal format
 * console.log(keys.privateKey); // Output: a private key in hexadecimal format
 */
function generateKeyPair() {
    const EC = require('elliptic').ec; // Import the elliptic library for creating elliptic curve cryptography
    const ec = new EC('secp256k1'); // Create an instance of elliptic curve cryptography using the secp256k1 curve

    const key = ec.genKeyPair(); // Generate a new key pair (public and private keys)
    const publicKey = key.getPublic('hex'); // Get the public key in hexadecimal format
    const privateKey = key.getPrivate('hex'); // Get the private key in hexadecimal format

    return { publicKey, privateKey };
}

// Example usage:
const keys = generateKeyPair();
console.log('Private key:', keys.privateKey); // Print the private key to the console
console.log('Public key:', keys.publicKey); // Print the public key to the console