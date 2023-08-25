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

const pubkeys = [
    pubkey1,
    pubkey2,
    pubkey3,
].map(Buffer => Buffer);

const p2sh =  bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2ms({ m: 2, pubkeys, network: bitcoinNetwork, })
})

console.log('P2SH address:\n' + p2sh.address);

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });

const previousRawTx = '0200000001d367e5f91991649a75ec5d1857707209f3e3e8523feb7330e8dde5995c1d6d97000000006a4730440220062315f0e157c97b50a2a0a951212da2418bf7a705b2d7e5556e6fc3693b2531022037f4317daa088e890d8fc87ae4c02d2312e823a45ccecf04f8b03ca9b28bcc5b01210338d92d2f6d960fbaa84e6119f1633cf4a8d30dcd67b513515f92e724f3b964f2ffffffff02305705000000000017a914c18610881d96c3143efe5e99b367d03c040611a78770c20000000000001976a914eee5bdb32eb48a2abde33ee64d2d2d8dc78b7dc288ac00000000';

psbt.addInput({
    hash: '9b726b267c6c101957396b8734c54fadf00b6bee280e7250c67a2d3abc2430a0',
    index: 0,
    redeemScript: p2sh.redeem.output,
    nonWitnessUtxo: Buffer.from(previousRawTx, 'hex'),
});
psbt.addOutput({
    address: "tb1qvn002hxxra68ussk4kk03wc6ckqf84zuwg8xaa",
    value: 310000,
});
psbt.addOutput({
    address: "n3J8LPstBcizkz1uU9n2VM4zST9VDYvUh9",
    value: 39628,
});

psbt.signInput(0, privkey2)
psbt.signInput(0, privkey3);

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

psbt.validateSignaturesOfInput(0, validator2);
psbt.validateSignaturesOfInput(0, validator3);

psbt.finalizeAllInputs();
const txHex = psbt.extractTransaction().toHex();

console.log("RawTx:\n" + txHex);
