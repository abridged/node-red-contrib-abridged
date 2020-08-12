const { toBN } = require('eth-sdk');

const blockchainUtils = {
  toBN(amount, multiplier) {
    return toBN(amount).mul(toBN(multiplier)).toString();
  }
};

module.exports = blockchainUtils;
