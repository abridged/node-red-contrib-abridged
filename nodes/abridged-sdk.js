
const constants = require('../utils/constants');
const BlockchainUtils = require('../utils/blockchainUtils');
const AbridgedService = require('../services/abridgedService');
const { toHex, toNumber, toWei, toBN, Units, toEth } = require('eth-sdk');

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
    if (network === undefined || queryProviderEndpoint === undefined) {
      throw `Missing required params network: ${network} queryProviderEndpoint: ${queryProviderEndpoint}`
    }
    switch (action) {
      case "init_with_kchannel":
        this.abridgedService = new AbridgedService(network, queryProviderEndpoint, privateKey);
        result = await this.abridgedService.init();
        data.payload.sdk = result;
        this.abridgedService.resetSdk();
        // await _sendTip(recipient, 0.5)
        break;
      case "tip":
        if (!privateKey) {
          throw 'Missing privateKey'
        }
        if (data.payload.tokenSymbol !== 'eth') {
          throw 'Only ETH tipping is supported.'
        }
        this.abridgedService = new AbridgedService(network, queryProviderEndpoint, privateKey);
        await this.abridgedService.init();
        node.status({ fill: "green", shape: "dot", text: "Sending Tip..." });
        result = await _sendTip(data.payload.recipient, data.payload.amount);
        data.payload.result = result;
        this.abridgedService.resetSdk();
        break;
      case "kChannelsDeposit":
        if (!privateKey) {
          throw 'Missing privateKey'
        }
        this.abridgedService = new AbridgedService(network, queryProviderEndpoint, privateKey);
        await this.abridgedService.init();
        node.status({ fill: "green", shape: "dot", text: "Sending Deposit To kChanne..." });
        const { amount, token } = data.payload;
        if (token !== constants.TOKENS.ETH || !data.payload.amount) {
          // only supports eth
          throw `Unsupported token ${token} or Amount ${amount}`
        } else {
          const inWei = toWei(amount.toString())
          result = await this.abridgedService.sendKChannelsDeposit(null, inWei.toString());
          data.payload.result = result;
          this.abridgedService.resetSdk();
        }
        break;
      // case "getBalance":
      //   await this.abridgedService.init();
      //   node.status({ fill: "green", shape: "dot", text: "Getting Balance..." });
      //   result = await this.abridgedService.getBalance();
      //   data.payload.result = result;
      //   this.abridgedService.resetSdk();
      //   break;
    }
    node.status({});
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
  const inWei = toWei(tipAmount);
  const amount = inWei.toString();
  await this.abridgedService.resolveTransaction(recipient.accountAddress, amount,);// toChecksumAddress(process.env.ABRIDGED_MOON_CONTRACT_ADDRESS));
  return true;
}
