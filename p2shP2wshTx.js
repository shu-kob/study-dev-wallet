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

const p2wsh =  bitcoin.payments.p2wsh({
        redeem: bitcoin.payments.p2ms({ m: 2, pubkeys, network: bitcoinNetwork, })
})

const p2sh = bitcoin.payments.p2sh({
    redeem: p2wsh
});

console.log('P2SH-P2WSH address:\n' + p2sh.address);

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });

const previousRawTx = '0200000000010160652b158398a3fb5307ba8b9907a685c328fe7cdc3134c1c3cd5493e7a147cb0000000000ffffffff0260ae0a000000000017a914c703f11caaa9cf0fe6a863a44a45c994198eb45b87e285010000000000220020f74ef6ecd662ffe74ed2c7958829d693a8c41c9ae1965063ab21f61665c3cdc50400473044022010434bf96016dc2057f402cac180d80692e052ea8dec0fd34ab1c7c947a9ffe202204fab4d6ba85c31103052f8477405ef37fafa252ddb2ea3dcad009be2848f11d5014730440220364e91298cf76c59bd2693ca48062c56629ff2805d036c172ada27b18d43843702201573827162773dabca420338cfa7ba0533e8b9ce6ee1ce98eb3723450adf6e0d0169522103bfec84b4c44d0118eeeb600d17fb19a7c540c0f943407bf71ff2058f8f28a9db21021f79ffa10fa4d661e52cb813f88057f2d926ba5792ffbfb649553f9870c2bcaa2102d830a67a1ea75e47c0bd58482c155119e584510ea89021f61c4cdfd24d157e5c53ae00000000';

psbt.addInput({
    hash: '0d32c8f6cfbdbd14e4f46733e274e5d007e258716d9351ddad963b25909f06a5',
    index: 0,
    redeemScript: p2wsh.output,
    witnessScript: p2wsh.redeem.output,
    nonWitnessUtxo: Buffer.from(previousRawTx, 'hex'),
});
psbt.addOutput({
    address: "2Mth6qa3tSHh6Cu9mBvvoY1W7MPX1vCvtpJ",
    value: 500000,
});
psbt.addOutput({
    address: "2MxRTeRMDerpaVucBu9C5UJL8S8Cm7Bj4D7",
    value: 100000,
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
