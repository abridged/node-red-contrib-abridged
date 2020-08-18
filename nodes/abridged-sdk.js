
const constants = require('../utils/constants');
const BlockchainUtils = require('../utils/blockchainUtils');
const AbridgedService = require('../services/abridgedService');
const { toHex, toNumber, toWei, toBN, Units, toEth } = require('eth-sdk');
const { ethers } = require('ethers');

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
        break;
      case "tip":
        if (!privateKey) {
          throw 'Missing privateKey'
        }
        // also add for isValid eth address
        // if (data.payload.token) {
        this.abridgedService = new AbridgedService(network, queryProviderEndpoint, privateKey);
        await this.abridgedService.init();
        node.status({ fill: "green", shape: "dot", text: "Sending Tip..." });
        let tokenAddress = data.payload.token;
        if (!data.payload.token || data.payload.token.toLowerCase() === 'eth') {
          tokenAddress = null;
        }
        const ethBalance = await this.abridgedService.getBalance(null, null);
        data.payload.sender = {
          'ethBalance': ethBalance.toString(),
        }
        if (tokenAddress) {
          const tokenBalance = await this.abridgedService.getBalance(null, tokenAddress);
          data.payload.sender.tokenAddress = tokenAddress;
          data.payload.sender.tokenBalance = tokenBalance.toString();
        }
        result = await _sendTip(data.payload.recipient, data.payload.amount, tokenAddress);
        data.payload.result = result;
        this.abridgedService.resetSdk();
        // } else {
        //   throw 'Missing token as (eth) or address'
        // }

        break;
      case "kChannelsDeposit":
        if (!privateKey) {
          throw 'Missing privateKey'
        }
        const { amount, token } = data.payload;
        if (!data.payload.amount) {
          // only supports eth
          throw `Amount is not specified ${amount}`
        } else {
          this.abridgedService = new AbridgedService(network, queryProviderEndpoint, privateKey);
          await this.abridgedService.init();
          node.status({ fill: "green", shape: "dot", text: "Sending Deposit To kChanne..." });
          if (token === 'eth') {
            // deposit eth
            console.log('kChannelsDeposit ETH');
            const inWei = toWei(amount.toString())
            result = await this.abridgedService.sendKChannelsDeposit(null, inWei.toString());
            data.payload.result = result;
          } else {
            console.log('kChannelsDeposit', token);
            // deposit token
            const kChannelVerifyingContract = '0x6cd7e721D9D13707D3D447235A30DACFDe2e9fe5'
            result = await _depositTokenInkChannel(this.abridgedService, token, kChannelVerifyingContract, amount);
            data.payload.result = result;
          }
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

async function _depositTokenInkChannel(abridgedService, tokenAddress, kChannelVerifyingContract, amount) {
  // chck if have enough tokens to deposit into kchannel

  const tokenBalance = await abridgedService.getBalance(null, tokenAddress);
  if (tokenBalance.lt(toWei(amount.toString()))) {
    throw `Insufficient token balance. Balance ${tokenBalance}, trying todeposit ${toWei(amount.toString())} `;
  }

  // kChannel rinkeby verifying contract
  const args = [kChannelVerifyingContract, toWei(amount.toString()).toString()];
  const abi = [
    "function transfer(address to, uint value)"
  ];
  let iface = new ethers.utils.Interface(abi);
  const data = iface.encodeFunctionData("transfer", args);
  console.log(data);
  // token deposit
  result = await abridgedService.sendKChannelsDeposit(tokenAddress, toBN('0x0'), data);
  return result;
}

async function _sendTip(recipient, tipAmount, tokenAddress = null) {
  if (!recipient || !recipient.accountAddress || !recipient.channelUUID) {
    throw 'Invalid recipient argument';
  }
  if (!tipAmount) {
    throw 'Invalid tip amount';
  }
  const inWei = toWei(tipAmount);
  const amount = inWei.toString();
  await this.abridgedService.resolveTransaction(recipient.accountAddress, amount, tokenAddress);// toChecksumAddress(process.env.ABRIDGED_MOON_CONTRACT_ADDRESS));
  return true;
}