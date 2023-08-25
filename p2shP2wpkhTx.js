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

const p2wpkh0 = bitcoin.payments.p2wpkh({ pubkey: pubkey0, network: bitcoinNetwork, });
const p2wpkh1 = bitcoin.payments.p2wpkh({ pubkey: pubkey1, network: bitcoinNetwork, });
const p2wpkh2 = bitcoin.payments.p2wpkh({ pubkey: pubkey2, network: bitcoinNetwork, });

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });

const previousRawTx0 = '02000000000101a5069f90253b96addd51936d7158e207d0e574e23367f4e414bdbdcff6c8320d00000000232200209decafc544c2721e0f067cbe43cc523176035d09e10ee4529ff5c4c420f0df92ffffffff0220a107000000000017a9140fdcf8da300da6ce9be82604e97591068ed75d1387a08601000000000017a91438c83073d82e5d7721b0532bfda74ca96ed8df7e870400483045022100f6153b0e06b12bd9984ed255db865cc9cd05d9dffac3398a76ea6a02f56a8b1e0220247a5b595e9a705118fe85c767d4a9f4a25e0c4abcd40dbf51873d98c381e3dd0147304402206f9eb161644d81204328ed9e1002cc552ead2d2f3b5570b342bdd0dca50a5ebf02200987dc30164d52f6b9180b2fd19239c0f0f350a02fd9eddf12cdbc5edae40b3a0169522103bfec84b4c44d0118eeeb600d17fb19a7c540c0f943407bf71ff2058f8f28a9db21021f79ffa10fa4d661e52cb813f88057f2d926ba5792ffbfb649553f9870c2bcaa2102d830a67a1ea75e47c0bd58482c155119e584510ea89021f61c4cdfd24d157e5c53ae00000000';
/*
const previousRawTx1 = '02000000000101d03f1761db9435e7850869cfb3ea88bbe61739b38e9c414e8c7da7e184f45bd80000000000feffffff02a08601000000000017a9148790ebefb4f0aa206513790325ca08a7ce2f239a87683f2c0000000000160014af8b9968894a2bc669abcaa6c70d3b7f52ff70e202473044022052bd7ea37ae47f7daae4cbf59c68114e3c96460833d5005731ddc77b7024918602205f368b42b6fe032207a9b7d68ae00657bdde688caf68dce317b9a871fdd73e44012103d41d10a07fb9b54f76b5300adbebb46ded4d5b45ab7431fc230bb165a80416862ce10000'
const previousRawTx2 = '020000000001010e002f708a6f48b2fba0345e6b30884c46e042eb7804272af24feb6ab5f184560000000000feffffff02683f2c0000000000160014ba1b55a3ad0b8d834583fb6645623724cee7f240a08601000000000017a9148176744ed5882a31998eb114ba4ed94903afcc78870247304402205bee371a3a6d29239d4e5d7d832394e5b96e1200f3578c9bb189b62aed04d23f0220029381e9ef194f23cd055ea6e0c1c6cd6397c99e6fc7534773c71e15c4f3da27012103fb083aeeedd05e33f338181efbd2a8776810a0fd893716950290a81138d9b488f2e00000'
*/

psbt.addInput({
    hash: '99d936936ac190a15fda795eccf38d433e84c5cb43e8e7fd25b4a6a408b5764d',
    index: 0,
    redeemScript: p2wpkh0.output,
    nonWitnessUtxo: Buffer.from(previousRawTx0, 'hex'),
});
/*
psbt.addInput({
    hash: 'fc7761613d70ae9f5aadc345cf6da9af8759470879599a173febb05de7af9b68',
    index: 0,
    redeemScript: p2wpkh1.output,
    nonWitnessUtxo: Buffer.from(previousRawTx1, 'hex'),
});
psbt.addInput({
    hash: '7d96a28f00d91ee0d9959a309e21e367ed29414af534671f6daf70d7c7f62925',
    index: 1,
    redeemScript: p2wpkh2.output,
    nonWitnessUtxo: Buffer.from(previousRawTx2, 'hex'),
});
*/
psbt.addOutput({
    address: "mpiJxfKewBymtZNXKZ2zCcjoEyWxo9FwGL",
    value: 400000,
});
psbt.addOutput({
    address: "2N3WHyW2numAaSzN9bRrWt36kFMcMtLw1YZ",
    value: 99832,
});

psbt.signInput(0, privkey0);
//psbt.signInput(1, privkey1);
//psbt.signInput(2, privkey2);

const validator = (
    pubkey,
    msghash,
    signature,
  ) => ECPair.fromPublicKey(pubkey).verify(msghash, signature);

psbt.validateSignaturesOfInput(0, validator);
//psbt.validateSignaturesOfInput(1, validator);
//psbt.validateSignaturesOfInput(2, validator);

psbt.finalizeAllInputs();
const txHex = psbt.extractTransaction().toHex();

console.log("RawTx:\n" + txHex);
