const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
const bip32 = BIP32Factory(ecc)
const { xpub } = require('./xpub.json');
const MAINNET = bitcoin.networks.bitcoin;
const TESTNET = bitcoin.networks.testnet;

let bitcoinNetwork = TESTNET; // MAINNET, TESTNET

let purpose = "84"

let coinType = "0"; // Mainnet

if (bitcoinNetwork == TESTNET) {
    coinType = "1";
}

let account = "0"

let externalAddress = 0;
let changeAddress = 1;

function getPublicKey(xpub, isChange, addressIndex){
    const pubkeyNode = bip32.fromBase58(xpub, bitcoinNetwork);
    const pubkey = pubkeyNode.derive(isChange).derive(addressIndex).publicKey;
    return pubkey
}

function getP2pkhAddress(xpub, isChange, addressIndex){
    const pubkey = getPublicKey(xpub, isChange, addressIndex);
    const address = bitcoin.payments.p2pkh({ pubkey: pubkey, network: bitcoinNetwork, }).address;
    return address;
}

function getP2shP2wpkhAddress(xpub, isChange, addressIndex){
    const pubkey = getPublicKey(xpub, isChange, addressIndex);
    const address = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({ pubkey: pubkey, network: bitcoinNetwork, })
    }).address;
    return address;
}

function getP2wpkhAddress(xpub, isChange, addressIndex){
    const pubkey = getPublicKey(xpub, isChange, addressIndex);
    const address = bitcoin.payments.p2wpkh({ pubkey: pubkey, network: bitcoinNetwork, }).address;
    return address;
}

let isChange = externalAddress;

console.log("External Addresses");

for (let addressIndex = 0; addressIndex < 3; addressIndex++){

    let addressPath = `m/${purpose}'/${coinType}'/${account}'/${isChange}/${addressIndex}`
    console.log("addressPath: " + addressPath);

    const p2pkhAddress = getP2pkhAddress(xpub, isChange, addressIndex);
    console.log("P2PKH:\n" + p2pkhAddress);

    const p2shP2wpkhAddress = getP2shP2wpkhAddress(xpub, isChange, addressIndex);
    console.log("P2SH-P2WPKH:\n" + p2shP2wpkhAddress);

    const p2wpkhAddress = getP2wpkhAddress(xpub, isChange, addressIndex);
    console.log("P2WPKH:\n" + p2wpkhAddress);
}

console.log("\n");

isChange = changeAddress;

console.log("Change Addresses");

for (let addressIndex = 0; addressIndex < 3; addressIndex++){

    let addressPath = `m/${purpose}'/${coinType}'/${account}'/${isChange}/${addressIndex}`
    console.log("addressPath: " + addressPath);

    const p2pkhAddress = getP2pkhAddress(xpub, isChange, addressIndex);
    console.log("P2PKH:\n" + p2pkhAddress);

    const p2shP2wpkhAddress = getP2shP2wpkhAddress(xpub, isChange, addressIndex);
    console.log("P2SH-P2WPKH:\n" + p2shP2wpkhAddress);

    const p2wpkhAddress = getP2wpkhAddress(xpub, isChange, addressIndex);
    console.log("P2WPKH:\n" + p2wpkhAddress);
}
