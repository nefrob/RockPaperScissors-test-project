const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Wager token tests", function () {
    it("Mint new tokens", async function () {
        const accounts = await ethers.getSigners();

        const WagerToken = await ethers.getContractFactory("WagerToken");
        const token = await WagerToken.deploy();
        await token.deployed();

        let supply = await token.totalSupply();
        expect(supply).to.equal(0);

        await token.connect(accounts[0]).mint(10);
        let balance1 = await token.balanceOf(accounts[0].address);
        supply = await token.totalSupply();

        expect(balance1).to.equal(10);
        expect(supply).to.equal(10);

        await token.connect(accounts[1]).mint(20);
        balance1 = await token.balanceOf(accounts[0].address);
        let balance2 = await token.balanceOf(accounts[1].address);
        supply = await token.totalSupply();

        expect(balance1).to.equal(10);
        expect(balance2).to.equal(20);
        expect(supply).to.equal(30);
    });
});
