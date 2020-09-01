const { ethers } = require('ethers');


async function getERC20TokenBalance(walletAddress, tokenAddress, network) {
    // assert.ok(symbol);
    // const tokenInfo = getTokenInfo(symbol);
    // if (tokenInfo === undefined) {
    //     throw new Error(`Can NOT find ERC20 contract address of ${symbol}`);
    // }
    // if (detectPlatformFromAddress(address) !== 'ERC20') {
    //     throw new Error(`${address} is NOT a valid ETH address`);
    // }

    const contractAbiFragment = [
        {
            name: 'balanceOf',
            type: 'function',
            inputs: [
                {
                    name: '_owner',
                    type: 'address',
                },
            ],
            outputs: [
                {
                    name: 'balance',
                    type: 'uint256',
                },
            ],
            constant: true,
            payable: false,
        },
    ];

    const provider = ethers.getDefaultProvider(network);
    const contract = new Contract(tokenAddress, contractAbiFragment, provider);
    const decimals = await contract.decimals();
    const balance = await contract.balanceOf(walletAddress);

    return parseFloat(ethers.utils.formatUnits(balance, decimals));
}

