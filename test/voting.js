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
   /* it("Owner created a vote, the counter is increased", function(){
        let candidates="[]";
        await myVotingContract.connect(accounts[0]).addVoting(candidates, 180);

    });*/

    
});
