const fetch = require('node-fetch');
const WebSocket = require('ws');
const constants = require('../utils/constants');
const { toBN, toWei } = require('eth-sdk');

const { createRinkebySdk, NotificationTypes } = require('abridged');

class AbridgedService {
  constructor(network, queryProviderEndpoint, privateKey) {
    if (network === constants.NETWORK.RINKEBY) {
      this.sdk = createRinkebySdk({
        authKeyModule: {
          privateKey
        },
        queryProviderEndpoint,
        fetch,
        WebSocket
      });
    } else {
      throw `Error: SDK init to-do for ${network}`
    }
  }

  async init() {
    console.log('AbridgedService: init with kchannel');
    const account = await this.sdk.createAccount();
    const kChannelAuth = await this.sdk.kChannelsAuthenticate();
    const kChannel = await this.sdk.kChannelsCreate();
    const privateKey = await this.sdk.exportPrivateKey();
    console.log('AbridgedService: init done with kchannel');
    return {
      account,
      kChannelAuth,
      kChannel,
      privateKey
    }
  }

  // async connect() {
  //   const result = await this.sdk.createAccount();
  //   return result;
  // }

  async resetSdk() {
    await this.sdk.resetAccount();
  }

  async sendKChannelsTransaction(recipient, value, tokenAddress = null) {
    const options = {
      recipient,
      tokenAddress,
      value,
      forceExternalTransaction: false,
      subtractFeesFromValue: false,
      searchByDepositAddress: true,
      channelUUID: null,
      channelDefinitionVersion: null,
      zoneClientEndpoint: null,
    };

    return this.sdk.kChannelsTransact(options);
  }

  async sendKChannelsDeposit(recipient, value, tokenAddress = null) {
    const options = {
      recipient, // if not set, will send to KChannels Contract
      value: toBN(value),
      data: '0x',
    };

    const result = await this.sdk.kChannelsDeposit(options);
    return result;
    // return result;
    // return new Promise((resolve, reject) => {
    //   const subscription = this.sdk.state$.notification$.subscribe(
    //     (notification) => {
    //       if (notification === null) {
    //         return;
    //       }
    //       if (
    //         notification.type === NotificationTypes.KChannelsTransaction

    //         && notification.payload.transaction_status === 'Completed'
    //       ) {
    //         resolve(true);
    //         // subscription.unsubscribe();
    //       }
    //     },
    //   );
    // });

  }

  async resolveTransaction(recipient, value, tokenAddress = null) {
    const transactionResult = await this.sendKChannelsTransaction(recipient, value, tokenAddress);
    const requestUUID = transactionResult[0].request_uuid;

    return new Promise((resolve, reject) => {
      const subscription = this.sdk.state$.notification$.subscribe(
        (notification) => {
          if (notification === null) {
            return;
          }
          if (
            notification.type === NotificationTypes.KChannelsTransaction
            && notification.payload.transaction.request_uuid === requestUUID
            && notification.payload.transaction_status === 'Completed'
          ) {
            resolve(true);
            subscription.unsubscribe();
          }
        },
      );
    });
  }

  async getBalance(address, token) {
    const options = {
      address,
      token // optional
    };
    const balance = await this.sdk.getBalance(options);
    return balance;
  }
}
module.exports = AbridgedService;
