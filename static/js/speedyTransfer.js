(function() {
    if (!("TextEncoder" in window)) return missingFeatureAlert("TextEncoder");
    if (!("TextDecoder" in window)) return missingFeatureAlert("TextDecoder");
    if (!window.crypto || !window.crypto.subtle) return missingFeatureAlert("Web Cryptography API");

    function missingFeatureAlert(missingFeature) {
        alert("Your browser does not support " + missingFeature + ". SpeedyTransfer requires the latest browser features.");
    }

    window.speedyTransfer = {
        generateRandomBits: function() {
            return window.crypto.getRandomValues(new Uint32Array(4)).buffer;
        },
        myKeys: async function() {
            const jwkKeys = JSON.parse(localStorage.STKeys)
            return { privateKey: await this.importDHKey(jwkKeys.privateKey), publicKey: await this.importDHKey(jwkKeys.publicKey) };
        },
        importDHKey: function(jwkKey) {
            return window.crypto.subtle.importKey("jwk", jwkKey, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey"]);
        },
        exportDHKey: function(key) {
            return window.crypto.subtle.exportKey("jwk", key);
        },
        generateDHKey: function() {
            return window.crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey"]);
        },
        bitsFromString: function(str) {
            return new TextEncoder("utf-8").encode(str).buffer;
        },
        stringFromBits: function(bits) {
            return new TextDecoder("utf-8").decode(bits);
        },
        buildAesKey: function(myPrivateKey, theirPublicKey) {
            return window.crypto.subtle.deriveKey({ name: "ECDH", namedCurve: "P-256", public: theirPublicKey }, 
            myPrivateKey, { name: "AES-CBC", length: 256 }, false, ["encrypt", "decrypt"]);
        },
        aesEncrypt: function(message, iv, key) {
            return window.crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, this.bitsFromString(message));
        },
        aesDecrypt: function(encrypted, iv, key) {
            return window.crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, encrypted);
        },
        encryptMessage: async function(message, myPrivateKey, theirPublicKey) {
            const iv = await this.generateRandomBits(16);
            const aesKey = await this.buildAesKey(myPrivateKey, theirPublicKey);
            const encryptedMessage = await this.aesEncrypt(message, iv, aesKey);
            
            return { iv: this.stringFromBits(iv), encryptedMessage: this.stringFromBits(encryptedMessage) };
        },
        decryptMessage: async function(encryptedMessage, iv, myPrivateKey, theirPublicKey) {
            const aesKey = await this.buildAesKey(myPrivateKey, theirPublicKey);
            return await this.aesDecrypt(encryptedMessage, iv, aesKey);
        }
    };
})();
