const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
const bip32 = BIP32Factory(ecc)
const bip39 = require('bip39');
const fs = require("fs");
const { mnemonic } = require('./mnemonic.json');
const MAINNET = bitcoin.networks.bitcoin;
const TESTNET = bitcoin.networks.testnet;

let bitcoinNetwork = TESTNET; // MAINNET, TESTNET

let purpose = "84" // 44: Legacy, 49: Nested Segwit, 84: Native Segeit

let coinType = null;

if (bitcoinNetwork == MAINNET) {
    coinType = "0";
}
else if (bitcoinNetwork == TESTNET) {
    coinType = "1";
}

let account = "0"

const path = `m/${purpose}'/${coinType}'/${account}'`

console.log("path:\n" + path);

function getXprivXpubfromMnemonic(mnemonic) {
  let seed = bip39.mnemonicToSeedSync(mnemonic);
  let node = bip32.fromSeed(seed, bitcoinNetwork);
  let xpriv = node.derivePath(path).toBase58();
  let xpub = node.derivePath(path).neutered().toBase58();
  return { xpriv, xpub };
}

let { xpriv, xpub } = getXprivXpubfromMnemonic(mnemonic);

let xprivData = `{\n  "xpriv": "${xpriv}"\n}`

fs.writeFile("xpriv.json", xprivData, (err) => {
  if (err) throw err;
  console.log("xpriv:\n" + xpriv);
});

let xpubData = `{\n  "xpub": "${xpub}"\n}`

fs.writeFile("xpub.json", xpubData, (err) => {
  if (err) throw err;
  console.log("xpub:\n" + xpub);
});
