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
    return privateKey_wif;
}

const privateKey_wif = getPrivKey(xpriv, 0);

console.log("privateKey_wif:");
console.log(privateKey_wif);

function getPubkeyFromXpub(xpub, addressIndex) {
    const pubkeyNode = bip32.fromBase58(xpub, bitcoinNetwork);
    const pubkey = pubkeyNode.derive(0).derive(addressIndex).publicKey;
    return pubkey;
}

const pubkey = getPubkeyFromXpub(xpub, 0);

const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: pubkey, network: bitcoinNetwork, });

console.log('Witness script:\n' + p2wpkh.output.toString('hex'))

console.log('P2WPKH address:\n' + p2wpkh.address);

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });

psbt.addInput({
    hash: '59cf46411dc54dabaecd8720301405d856c30fa8f2dee7fe4ea9d83ed1cf9a9f',
    index: 0,
    sequence: 0xffffffff,
    witnessUtxo: {
    script: Buffer.from(p2wpkh.output.toString('hex'),'hex',),
    value: 1000000,
    },
});
psbt.addOutput({
    address: "tb1qnhk2l32ycfepurcx0jly8nzjx9mqxhgfuy8wg55l7hzvgg8sm7fqxazuem",
    value: 800000,
});
psbt.addOutput({
    address: "tb1qamjmmvewkj9z400r8mny6tfd3hrcklwzsgjafh",
    value: 199847,
});

const obj = wif.decode(privateKey_wif);
console.log(obj)
const privKey = ECPair.fromPrivateKey(obj.privateKey);
console.log(privKey)
psbt.signInput(0, privKey);

const validator = (
    pubkey,
    msghash,
    signature,
  ) => ECPair.fromPublicKey(pubkey).verify(msghash, signature);  

psbt.validateSignaturesOfInput(0, validator);
psbt.finalizeAllInputs();
const txHex = psbt.extractTransaction().toHex();

const txByteSize = txHex.length / 2;

console.log("RawTx:\n" + txHex);

console.log("byteLength:\n" + txByteSize);
