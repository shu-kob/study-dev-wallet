const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);
const wif = require('wif');
const { ECPairFactory } = require('ecpair');
const ECPair = ECPairFactory(ecc);

const { xpub1, xpub2, xpub3 } = require('./xpubs.json');

const MAINNET = bitcoin.networks.bitcoin;
const TESTNET = bitcoin.networks.testnet;

let bitcoinNetwork = TESTNET; // MAINNET or TESTNET

const { xpriv1 } = require('./xpriv1.json');
const { xpriv2 } = require('./xpriv2.json');
const { xpriv3 } = require('./xpriv3.json');

let addressIndex = 0;

function getPrivkeyFromXpriv(xpriv, addressIndex) {
    const privkeyNode = bip32.fromBase58(xpriv, bitcoinNetwork);
    const privateKey_wif = privkeyNode.derive(0).derive(addressIndex).toWIF();
    console.log("privateKey_wif:\n" + privateKey_wif);
    const obj = wif.decode(privateKey_wif);
    const privkey = ECPair.fromPrivateKey(obj.privateKey);
    return privkey;
}

const privkey1 = getPrivkeyFromXpriv(xpriv1, addressIndex);
const privkey2 = getPrivkeyFromXpriv(xpriv2, addressIndex);
const privkey3 = getPrivkeyFromXpriv(xpriv3, addressIndex);

function getPubkeyFromXpub(xpub, addressIndex) {
    const pubkeyNode = bip32.fromBase58(xpub, bitcoinNetwork);
    const pubkey = pubkeyNode.derive(0).derive(addressIndex).publicKey;
    return pubkey;
}

const pubkey1 = getPubkeyFromXpub(xpub1, addressIndex);
const pubkey2 = getPubkeyFromXpub(xpub2, addressIndex);
const pubkey3 = getPubkeyFromXpub(xpub3, addressIndex);

const p2ms = bitcoin.payments.p2ms({
    m: 2, pubkeys: [
      Buffer.from(pubkey1, 'hex'),
      Buffer.from(pubkey2, 'hex'),
      Buffer.from(pubkey3, 'hex'),
    ], network: bitcoinNetwork})

const p2wsh = bitcoin.payments.p2wsh({redeem: p2ms, network: bitcoinNetwork})
console.log('P2WSH address:\n' + p2wsh.address);

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });
psbt.addInput({
    hash: 'cb47a1e79354cdc3c13431dc7cfe28c385a607998bba0753fba39883152b6560',
    index: 0,
    witnessScript: p2wsh.redeem.output,
    witnessUtxo: {
    script: Buffer.from('0020' + bitcoin.crypto.sha256(p2ms.output).toString('hex'), 'hex'),
    value: 800000,
    },
});
psbt.addOutput({
    address: "2NBPXBLomYz2oL1FjDHKARybjwGvmcBPCgz",
    value: 700000,
});
psbt.addOutput({
    address: "tb1q7a80dmxkvtl7wnkjc72cs2wkjw5vg8y6uxt9qcaty8mpvewrehzscyspqp",
    value: 99810,
});

psbt.signInput(0, privkey1)
psbt.signInput(0, privkey2);

const validator1 = (
    pubkey1,
    msghash,
    signature,
  ) => ECPair.fromPublicKey(pubkey1).verify(msghash, signature);

const validator2 = (
    pubkey2,
    msghash,
    signature,
  ) => ECPair.fromPublicKey(pubkey2).verify(msghash, signature);

const validator3 = (
    pubkey3,
    msghash,
    signature,
  ) => ECPair.fromPublicKey(pubkey3).verify(msghash, signature);

psbt.validateSignaturesOfInput(0, validator1);
psbt.validateSignaturesOfInput(0, validator2);

psbt.finalizeAllInputs();

const txHex = psbt.extractTransaction().toHex();

console.log("RawTx:\n" + txHex);
