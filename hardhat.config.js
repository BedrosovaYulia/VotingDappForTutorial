const { block } = require("near-web3-provider/src/hydrate");
const { blockObj } = require("near-web3-provider/src/near_to_eth_objects");

require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.15",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      blockGasLimit: 30000,
      accounts: {
        count:100
      }
    }
  }
};

