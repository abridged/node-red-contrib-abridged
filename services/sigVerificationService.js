const ethUtil = require("ethereumjs-util");
const sigUtil = require("eth-sig-util");

class SigVerificationService {
    constructor() {

    }

    verifySignature(signature, msg) {
        // const msg = JSON.parse(paramsJsonStr);
        // console.log("Ecrecover", msg, signature);

        if (!signature) {
            throw { type: "error", message: "Invalid params" };
        }

        // ecrecover signature
        const recovered = sigUtil.recoverTypedSignature_v4({
            data: formatData(msg.message),
            sig: signature,
        });
        if (
            ethUtil.toChecksumAddress(recovered) !==
            ethUtil.toChecksumAddress(msg.message.from)
        ) {
            throw { type: "error", message: "Signature verification failed" };
        }
    }
}

const formatData = (message) => ({
    domain: {
        chainId: 1,
        name: "Collab.land",
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
        version: "1",
    },
    primaryType: "Verify",
    message,
    types: {
        EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
        ],
        Verify: [
            { name: "from", type: "address" },
            { name: "id", type: "string" },
            { name: "callbackURL", type: "string" },
        ],
    },
});

module.exports = SigVerificationService;