const SigVerificationService = require('../services/sigVerificationService');

module.exports = function (RED) {
    function SignatureVerificationNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var node = this;
        node.on("input", data => {
            input(RED, node, data, config);
        });
    }
    RED.nodes.registerType("sig-verification", SignatureVerificationNode);
}

async function input(RED, node, data, config) {
    // console.log('Discord TPC', RED, node, data, config);
    try {

        const { id, account, signature, callbackURL } = data.payload;
        // const id = "recId=recPBjlh6Ghjopi71&groupRecId=recNNoCLJhrXP7TUl&platform=telegram&action=tpc";
        // const account = "0x79e0aaCd5DBC8b3F50e0CD9d3F0A94e065a1aAc6";
        // const signature = "0x2e4d6d1d21df8e8dadd9b2f4fe1464469db0e2aec5badd3930313b1e42bc00817cec6a12a7470bd20e03b3f348552ee3a6c9a1f7999fb6c96e64e41216708d401c";
        // const callbackURL = ""

        const msg = {
            message: {
                id,
                callbackURL,
                from: account
            }
        }
        this.sigVerificationService = new SigVerificationService();
        this.sigVerificationService.verifySignature(signature, msg)
        data.payload.verified = true;
        return node.send([data, null]);
    } catch (error) {
        data.payload.verified = false;
        console.log('Error: ', error)
        data.payload.error = error;
        return node.send([null, data]);
    }
}