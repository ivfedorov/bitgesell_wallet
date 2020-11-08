const __btcCryptoJS = require('../../jsbgl/src/btc_crypto.js');
const constants = require('../../jsbgl/src/constants.js');
const tools = require('../../jsbgl/src/functions/tools.js');
const opcodes = require('../../jsbgl/src/opcodes.js');
const hash = require('../../jsbgl/src/functions/hash.js');
const encoders = require('../../jsbgl/src/functions/encoders.js');
const shamirSecret = require('../../jsbgl/src/functions/shamir_secret_sharing.js');
const mnemonicWordlist = require('../../jsbgl/src/bip39_wordlist.js');
const mnemonic = require('../../jsbgl/src/functions/bip39_mnemonic.js');
const key = require('../../jsbgl/src/functions/key.js');
const address = require('../../jsbgl/src/functions/address.js');
const bip32 = require('../../jsbgl/src/functions/bip32.js');
const script = require('../../jsbgl/src/functions/script.js');
const Address = require('../../jsbgl/src/classes/address.js');
const Transation = require('../../jsbgl/src/classes/transaction.js');
const Wallet = require('../../jsbgl/src/classes/wallet.js');

module.exports = {
    __initTask: null,
    asyncInit: async function (scope) {
        if (this.__initTask === null) {
            this.__initTask = await this.__asyncInit(scope);
        } else {
            if (this.__initTask !== "completed") {
                await this.__initTask;
            }
        }
    },
    __asyncInit: async function (scope) {
        if (scope === undefined) scope = this;
        tools(scope);
        constants(scope);
        opcodes(scope);
        scope.__bitcoin_core_crypto = await this.__initCryptoModule();
        hash(scope);
        encoders(scope);
        mnemonic(scope);
        mnemonicWordlist(scope);
        shamirSecret(scope);

        scope.secp256k1PrecompContextSign = scope.__bitcoin_core_crypto.module._secp256k1_context_create(scope.SECP256K1_CONTEXT_SIGN);
        scope.secp256k1PrecompContextVerify = scope.__bitcoin_core_crypto.module._secp256k1_context_create(scope.SECP256K1_CONTEXT_VERIFY);
        let seed = scope.generateEntropy({'hex': false});
        let seedPointer = scope.__bitcoin_core_crypto.module._malloc(seed.length);
        scope.__bitcoin_core_crypto.module.HEAPU8.set(seed, seedPointer);
        scope.__bitcoin_core_crypto.module._secp256k1_context_randomize(scope.secp256k1PrecompContextSign, seedPointer);

        key(scope);
        address(scope);
        bip32(scope);
        script(scope);
        Address(scope);
        Transation(scope);
        Wallet(scope);

        this.__initTask = "completed";
    },
    __initCryptoModule: () => {
        return new Promise(function (resolve) {
            __btcCryptoJS().then((module) => {
                resolve({module});
            });
        });
    },
};






