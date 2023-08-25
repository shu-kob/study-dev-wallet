const bip39 = require('bip39');
const fs = require("fs");

function getMnemonic() {
    const mnemonic = bip39.generateMnemonic(256);
    return mnemonic;
}

const mnemonic = getMnemonic();

const data = `{\n  "mnemonic": "${mnemonic}"\n}`

fs.writeFile("mnemonic.json", data, (err) => {
    if (err) throw err;
    console.log("mnemonic:\n" + mnemonic);
});
