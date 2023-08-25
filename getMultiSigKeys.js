const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
const bip32 = BIP32Factory(ecc)
const bip39 = require('bip39');
const fs = require("fs");
const { mnemonic1 } = require('./mnemonic1.json');
const { mnemonic2 } = require('./mnemonic2.json');
const { mnemonic3 } = require('./mnemonic3.json');
const MAINNET = bitcoin.networks.bitcoin;
const TESTNET = bitcoin.networks.testnet;

let bitcoinNetwork = TESTNET; // MAINNET, TESTNET

let purpose = "84" // 44: Legacy, 49: Nested Segwit, 84: Native Segeit

let coinType = "0"; // Mainnet

if (bitcoinNetwork == TESTNET) {
    coinType = "1";
}

let account = "0"

const path = `m/${purpose}'/${coinType}'/${account}'`

console.log("path:\n" + path);

function getXprivXpubfromMnemonic(mnemonic) {
    console.log("mnemonic: " + mnemonic);
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const node = bip32.fromSeed(seed, bitcoinNetwork);
    const xpriv = node.derivePath(path).toBase58();
    const xpub = node.derivePath(path).neutered().toBase58();
    return { xpriv, xpub };
}

const key1 = getXprivXpubfromMnemonic(mnemonic1);
const xpriv1 = key1.xpriv;
const xpub1 = key1.xpub;
const key2 = getXprivXpubfromMnemonic(mnemonic2);
const xpriv2 = key2.xpriv;
const xpub2 = key2.xpub;
const key3 = getXprivXpubfromMnemonic(mnemonic3);
const xpriv3 = key3.xpriv;
const xpub3 = key3.xpub;

const xpriv1Data = `{\n  "xpriv1": "${xpriv1}"\n}`

fs.writeFile("xpriv1.json", xpriv1Data, (err) => {
    if (err) throw err;
    console.log("xpriv1:\n" + xpriv1);
});

const xpriv2Data = `{\n  "xpriv2": "${xpriv2}"\n}`

fs.writeFile("xpriv2.json", xpriv2Data, (err) => {
    if (err) throw err;
    console.log("xpriv2:\n" + xpriv2);
});

const xpriv3Data = `{\n  "xpriv3": "${xpriv3}"\n}`

fs.writeFile("xpriv3.json", xpriv3Data, (err) => {
    if (err) throw err;
    console.log("xpriv3:\n" + xpriv3);
});

const xpubData = `{\n  "xpub1": "${xpub1}",\n  "xpub2": "${xpub2}",\n  "xpub3": "${xpub3}"\n}`

fs.writeFile("xpubs.json", xpubData, (err) => {
    if (err) throw err;
    console.log("xpub1:\n" + xpub1);
    console.log("xpub2:\n" + xpub2);
    console.log("xpub3:\n" + xpub3);
});
