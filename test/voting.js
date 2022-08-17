const { expect } = require("chai");
const { ethers } = require("hardhat");
let accounts;
let myVotingContract;
const provider = ethers.provider;

describe("VotingContract", function () {
    it("Contract should be successfully deployed, account0 is owner", async function () {
        accounts = await ethers.getSigners();
        VotingContract = await ethers.getContractFactory("VotingContract");
        myVotingContract = await VotingContract.deploy(50, 5);
        await myVotingContract.deployed();
        expect(await myVotingContract.owner()).to.equal(accounts[0].address);
    });
    it("Owner try to create voting with too many candidates", async function () {
        let candidates = new Array();
        for (i = 1; i < 100; i++) candidates.push(accounts[i].address);
        await expect(
            myVotingContract.connect(accounts[0]).addVoting(180, candidates)
        ).to.be.revertedWith("Too many candidates!");    
    });
    it("Owner created a vote, the counter is increased", async function(){
        const counter_before = await myVotingContract.counter();
        let candidates= new Array();
        for (i = 1; i < 10; i++) candidates.push(accounts[i].address);
        await myVotingContract.connect(accounts[0]).addVoting(180, candidates);
        const counter_after = await myVotingContract.counter();
        expect(counter_after-counter_before).to.equal(1);
        const is_candidate1 = await myVotingContract.checkCandidate(counter_before, accounts[1].address);
        expect(is_candidate1).to.equal(true);
    });
    it("Candidate3 deleted", async function () {
        await myVotingContract.connect(accounts[0]).deleteCandidate(0, accounts[3].address);
        const is_candidate3 = await myVotingContract.checkCandidate(0, accounts[3].address);
        expect(is_candidate3).to.equal(false);
    });
    it("Candidate3 added again", async function () {
        await myVotingContract.connect(accounts[0]).addCandidate(0, accounts[3].address);
        const is_candidate3 = await myVotingContract.checkCandidate(0, accounts[3].address);
        expect(is_candidate3).to.equal(true);
    });
    it("Candidate3 not deleted - only owner can delete him", async function () {
        await expect(
            myVotingContract.connect(accounts[1]).deleteCandidate(0, accounts[3].address)
        ).to.be.revertedWith("Error! You're not the smart contract owner!");
    });
    it("Owner changed voting period", async function () {
        await myVotingContract.connect(accounts[0]).editVotingPeriod(0,190);
        const votingInfo = await myVotingContract.getVotingInfo(0);
        //console.log(votingInfo);
        expect(votingInfo[2]).to.equal(190);
    });
    it("Nobody can't vote before start", async function () {
        const amount = new ethers.BigNumber.from(10).pow(18).mul(1);
        await expect(
            myVotingContract.connect(accounts[1]).takePartInVoting(0, accounts[3].address, { value: amount })
        ).to.be.revertedWith("Voting not started yet");
    });
    it("Voting started", async function () {
        await myVotingContract.connect(accounts[0]).startVoting(0);
        const votingInfo = await myVotingContract.getVotingInfo(0);
        //console.log(votingInfo);
        expect(votingInfo[0]).to.equal(true);
    });
    it("Candidate3 can not be deleted after voting start", async function () {
        await expect(
            myVotingContract.connect(accounts[0]).deleteCandidate(0, accounts[3].address)
        ).to.be.revertedWith("Voting has already begun!");
    });
    it("Period can not be changed after voting start", async function () {
        await expect(
            myVotingContract.connect(accounts[0]).editVotingPeriod(0, 190)
        ).to.be.revertedWith("Voting has already begun!");
    });
    it("Voting for candidate that not exist in this voting", async function () {
        const amount = new ethers.BigNumber.from(10).pow(18).mul(1);
        await expect(
            myVotingContract.connect(accounts[1]).takePartInVoting(0, accounts[11].address, { value: amount })
        ).to.be.revertedWith("Candidate does not exist on this voting");
    });
    it("Account 1 voted for Account 3", async function () {
        const amount = new ethers.BigNumber.from(10).pow(18).mul(1);
        await myVotingContract.connect(accounts[1]).takePartInVoting(0, accounts[3].address, { value: amount });
        const votingInfo = await myVotingContract.getVotingInfo(0);
        //console.log(votingInfo);
        expect(votingInfo[5]).to.equal(accounts[3].address);
    });
    it("Account 2 and 4 voted for Account 5", async function () {
        const amount = new ethers.BigNumber.from(10).pow(18).mul(1);
        await myVotingContract.connect(accounts[2]).takePartInVoting(0, accounts[5].address, { value: amount });
        await myVotingContract.connect(accounts[2]).takePartInVoting(0, accounts[5].address, { value: amount });
        const votingInfo = await myVotingContract.getVotingInfo(0);
        //console.log(votingInfo);
        expect(votingInfo[5]).to.equal(accounts[5].address);
    });
    it("Account 5 try to withdrow", async function () {
        await expect(
            myVotingContract.connect(accounts[5]).WithdrowMyPrize(0)
        ).to.be.revertedWith("Voting is not over yet!");
    });
    it("Account 4 try to withdrow after time", async function () {
        await network.provider.send("evm_increaseTime", [200]);
        await network.provider.send("evm_mine");
        await expect(
            myVotingContract.connect(accounts[4]).WithdrowMyPrize(0)
        ).to.be.revertedWith("You are not a winner!");
    });
    it("Nobody can't vote after finish", async function () {
        const amount = new ethers.BigNumber.from(10).pow(18).mul(1);
        await expect(
            myVotingContract.connect(accounts[1]).takePartInVoting(0, accounts[3].address, { value: amount })
        ).to.be.revertedWith("Voting is ended");
    });
    it("Account 5 got withdrow", async function () {
        const balanceH2Before = await provider.getBalance(accounts[5].address);
        await myVotingContract.connect(accounts[5]).WithdrowMyPrize(0);
        const balanceH2After = await provider.getBalance(accounts[5].address);
        //console.log(balanceH2After);
        const balanceDif = balanceH2After - balanceH2Before;
        expect(balanceDif).greaterThan(0);
    });
    it("Account 5 can't withdrow 2nd time", async function () {
        await expect(
            myVotingContract.connect(accounts[5]).WithdrowMyPrize(0)
        ).to.be.revertedWith("You have already received your prize!");
    });
    it("Owner can change MaxCandidatesNum for futher votings", async function () {
        await myVotingContract.connect(accounts[0]).setMaxCandidatesNum(1500);
        let maxnum = await myVotingContract.maxCandidatesNum();
        //console.log(maxnum);
        expect(maxnum).to.equal(1500);
    });
});
