const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingContract", function () {
    async function Fixture1() {
        const accounts = await ethers.getSigners();
        VotingContract = await ethers.getContractFactory("VotingContract");
        const myVotingContract = await VotingContract.deploy(50, 5);
        let candidates = new Array();
        for (i = 1; i < 10; i++) candidates.push(accounts[i].address);
        await myVotingContract.connect(accounts[0]).addVoting(180, candidates);
        await myVotingContract.connect(accounts[0]).startVoting(0);
        return { myVotingContract, accounts };
    }

    async function Fixture2() {
        const accounts = await ethers.getSigners();
        VotingContract = await ethers.getContractFactory("VotingContract");
        const myVotingContract = await VotingContract.deploy(50, 5);
        let candidates = new Array();
        for (i = 1; i < 10; i++) candidates.push(accounts[i].address);
        await myVotingContract.connect(accounts[0]).addVoting(180, candidates);
        await myVotingContract.connect(accounts[0]).startVoting(0);
        const amount = new ethers.BigNumber.from(10).pow(18).mul(1);
        await myVotingContract.connect(accounts[1]).takePartInVoting(0, accounts[5].address, { value: amount });
        await myVotingContract.connect(accounts[2]).takePartInVoting(0, accounts[5].address, { value: amount });
        await network.provider.send("evm_increaseTime", [200]);
        await network.provider.send("evm_mine");
        const provider = ethers.provider;
        return { myVotingContract, accounts, provider };
    }

    it("Account 5 is winner", async function () {
        const { myVotingContract, accounts } = await loadFixture(Fixture1);
        const amount = new ethers.BigNumber.from(10).pow(18).mul(1);
        await myVotingContract.connect(accounts[1]).takePartInVoting(0, accounts[5].address, { value: amount });
        await myVotingContract.connect(accounts[2]).takePartInVoting(0, accounts[5].address, { value: amount });
        const votingInfo = await myVotingContract.getVotingInfo(0);
        expect(votingInfo[5]).to.equal(accounts[5].address);
    });

    it("Account 4 is winner", async function () {
        const { myVotingContract, accounts } = await loadFixture(Fixture1);
        const amount = new ethers.BigNumber.from(10).pow(18).mul(1);
        await myVotingContract.connect(accounts[1]).takePartInVoting(0, accounts[5].address, { value: amount });
        await myVotingContract.connect(accounts[2]).takePartInVoting(0, accounts[4].address, { value: amount });
        await myVotingContract.connect(accounts[3]).takePartInVoting(0, accounts[4].address, { value: amount });
        const votingInfo = await myVotingContract.getVotingInfo(0);
        expect(votingInfo[5]).to.equal(accounts[4].address);
    });

    it("Account 4 can't withdrow", async function () {
        const { myVotingContract, accounts, provider } = await loadFixture(Fixture2);
        await expect(
            myVotingContract.connect(accounts[4]).WithdrowMyPrize(0)
        ).to.be.revertedWith("You are not a winner!");
    });

    it("Account 5 can withdrow", async function () {
        const { myVotingContract, accounts, provider } = await loadFixture(Fixture2);
        const balanceH2Before = await provider.getBalance(accounts[5].address);
        await myVotingContract.connect(accounts[5]).WithdrowMyPrize(0);
        const balanceH2After = await provider.getBalance(accounts[5].address);
        const balanceDif = balanceH2After - balanceH2Before;
        expect(balanceDif).greaterThan(0);
    });
    
   });
