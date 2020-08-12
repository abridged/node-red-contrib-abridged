
const constants = require('../utils/constants');
const BlockchainUtils = require('../utils/blockchainUtils');
const AbridgedService = require('../services/abridgedService');

module.exports = function (RED) {
  function AbridgedSdkNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on("input", data => {
      input(RED, node, data, config);
    });
  }
  RED.nodes.registerType("abridged-sdk", AbridgedSdkNode);
}

async function input(RED, node, data, config) {
  // console.log('inside input', RED, node, data, config);
  try {
    node.status({ fill: "green", shape: "dot", text: "Initializing..." });
    const { network, queryProviderEndpoint, privateKey, action } = data.payload
    if (network === undefined || queryProviderEndpoint === undefined || privateKey === undefined) {
      throw `Missing required params network: ${network} queryProviderEndpoint: ${queryProviderEndpoint} privateKey: ${privateKey}`
    }
    this.abridgedService = new AbridgedService(network, queryProviderEndpoint, privateKey);
    switch (action) {
      case "init_with_kchannel":
        node.status({ fill: "green", shape: "dot", text: "connected..." });
        result = await this.abridgedService.init();
        data.payload.account = result;
        this.abridgedService.resetSdk();
        // await _sendTip(recipient, 0.5)
        node.status({});
        break;
      case "tip":
        // call abridged service sendKChannelsTransaction
        await this.abridgedService.init();
        node.status({ fill: "green", shape: "dot", text: "Sending Tip..." });
        const { recipient, amount } = data.payload;
        result = await _sendTip(recipient, amount);
        data.payload.result = result;
        this.abridgedService.resetSdk();
        node.status({});
        break;
      case "connect":
        const account = await this.abridgedService.connect();
        node.status({ fill: "green", shape: "dot", text: "connected..." });
        data.payload.account = account;
        this.abridgedService.resetSdk();
        node.status({});
        break;
    }
    return node.send([data, null]);
  } catch (error) {
    node.status({});
    console.log("Error", error)
    data.payload.error = error;
    return node.send([null, data]);
  }
}

async function _sendTip(recipient, tipAmount) {
  if (!recipient || !recipient.accountAddress || !recipient.channelUUID) {
    throw 'Invalid recipient argument';
  }
  if (!tipAmount) {
    throw 'Invalid tip amount';
  }
  const amount = BlockchainUtils.toBN(tipAmount, 1);
  await this.abridgedService.resolveTransaction(recipient.accountAddress, amount,);// toChecksumAddress(process.env.ABRIDGED_MOON_CONTRACT_ADDRESS));
  return true;
}
