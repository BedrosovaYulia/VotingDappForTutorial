const { expect } = require("chai");
const { ethers } = require("hardhat");
let accounts;
let myVotingContract;
const provider = ethers.provider;

describe("VotingContract", function () {
    it("Contract should be successfully deployed, account0 is owner", async function () {
        accounts = await ethers.getSigners();
        VotingContract = await ethers.getContractFactory("VotingContract");
        myVotingContract = await VotingContract.deploy(1000, 5);
        await myVotingContract.deployed();
        expect(await myVotingContract.owner()).to.equal(accounts[0].address);
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
    it("Account 1 voted for Account 3", async function () {
        const amount = new ethers.BigNumber.from(10).pow(18).mul(1);
        await myVotingContract.connect(accounts[1]).takePartInVoting(0, accounts[3].address, { value: amount });
        const votingInfo = await myVotingContract.getVotingInfo(0);
        console.log(votingInfo);
        expect(votingInfo[4]).to.equal(accounts[3].address);
    });
    it("Account 2 and 4 voted for Account 5", async function () {
        const amount = new ethers.BigNumber.from(10).pow(18).mul(1);
        await myVotingContract.connect(accounts[2]).takePartInVoting(0, accounts[5].address, { value: amount });
        await myVotingContract.connect(accounts[2]).takePartInVoting(0, accounts[5].address, { value: amount });
        const votingInfo = await myVotingContract.getVotingInfo(0);
        console.log(votingInfo);
        expect(votingInfo[4]).to.equal(accounts[5].address);
    });
});
