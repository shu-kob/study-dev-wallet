const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);
const wif = require('wif');
const { ECPairFactory } = require('ecpair');
const ECPair = ECPairFactory(ecc);

const { xpub } = require('./xpub.json');

const MAINNET = bitcoin.networks.bitcoin;
const TESTNET = bitcoin.networks.testnet;

let bitcoinNetwork = TESTNET; // MAINNET or TESTNET

const { xpriv } = require('./xpriv.json');

function getPrivKey(xpriv, addressIndex){
    const privkeyNode = bip32.fromBase58(xpriv, bitcoinNetwork);
    const privateKey_wif = privkeyNode.derive(0).derive(addressIndex).toWIF();
    console.log("privateKey_wif:\n" + privateKey_wif);
    const obj = wif.decode(privateKey_wif);
    const privkey = ECPair.fromPrivateKey(obj.privateKey);
    return privkey;
}

const privkey0 = getPrivKey(xpriv, 0);
const privkey1 = getPrivKey(xpriv, 1);
const privkey2 = getPrivKey(xpriv, 2);

function getPubkeyFromXpub(xpub, addressIndex) {
    const pubkeyNode = bip32.fromBase58(xpub, bitcoinNetwork);
    const pubkey = pubkeyNode.derive(0).derive(addressIndex).publicKey;
    return pubkey;
}

const pubkey0 = getPubkeyFromXpub(xpub, 0);
const pubkey1 = getPubkeyFromXpub(xpub, 1);
const pubkey2 = getPubkeyFromXpub(xpub, 2);

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });

const previousRawTx = '020000000001014d76b508a4a6b425fde7e843cbc5843e438df3cc5e79da5fa190c16a9336d999000000001716001464def55cc61f747e4216adacf8bb1ac58093d45cffffffff02801a0600000000001976a91464def55cc61f747e4216adacf8bb1ac58093d45c88acf88501000000000017a914708ad3355be408a5594e652100db95ff78e5fde08702483045022100f9f5a4d6431156cd40f425715f73232ccf1d537def5c8c1ffc8d4ea5c73b63bc022071aba82c9dae8e147da5ff528caf26482921be16803e2b90987aaf7e2f3852b201210338d92d2f6d960fbaa84e6119f1633cf4a8d30dcd67b513515f92e724f3b964f200000000';

psbt.addInput({
    hash: '976d1d5c99e5dde83073eb3f52e8e3f309727057185dec759a649119f9e567d3',
    index: 0,
    nonWitnessUtxo: Buffer.from(previousRawTx, 'hex'),
});
/*
psbt.addInput({
    hash: '900b72ca70b8fea9cea4dd8fa0cbb3650da0a4a5ac04f18f1c5048d2c853cd8d',
    index: 1,
    nonWitnessUtxo: Buffer.from(previousRawTx, 'hex'),
});
psbt.addInput({
    hash: '900b72ca70b8fea9cea4dd8fa0cbb3650da0a4a5ac04f18f1c5048d2c853cd8d',
    index: 2,
    nonWitnessUtxo: Buffer.from(previousRawTx, 'hex'),
});
*/
psbt.addOutput({
    address: "2NAtV1H3Ccjhs1S1LwzeKEke78YqTA7BCoi",
    value: 350000,
});
psbt.addOutput({
    address: "2MusJ8aXfGS1CuihQqBgcJojEotEc6Zb5Tq",
    value: 49776,
});

psbt.signInput(0, privkey0);
// psbt.signInput(1, privkey1);
// psbt.signInput(2, privkey2);


const validator = (
    pubkey,
    msghash,
    signature,
  ) => ECPair.fromPublicKey(pubkey).verify(msghash, signature);

psbt.validateSignaturesOfInput(0, validator);

psbt.finalizeAllInputs();
const txHex = psbt.extractTransaction().toHex();

console.log("RawTx:\n" + txHex);
