const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");

describe("Rock, paper scissors game", function () {
    let accounts;
    let token;
    let game;

    const ROCK = 1;
    const PAPER = 2;
    const SCISSORS = 3;

    beforeEach("Deploy contracts", async () => {
        accounts = await ethers.getSigners();

        const WagerToken = await ethers.getContractFactory("WagerToken");
        token = await WagerToken.deploy();
        await token.deployed();

        token.connect(accounts[0]).mint(5);
        token.connect(accounts[1]).mint(5);

        const RockPaperScissors = await ethers.getContractFactory(
            "RockPaperScissors"
        );

        game = await RockPaperScissors.deploy(
            accounts[0].address,
            accounts[1].address,
            token.address,
            5
        );
        await game.deployed();
    });

    const submitMove = async (move, from) => {
        const iv = crypto.randomBytes(16);

        // https://docs.ethers.io/v5/api/utils/hashing/
        const move_hash = ethers.utils.soliditySha256(
            ["uint8", "uint128"],
            [move, iv]
        );

        await token.connect(from).approve(game.address, 5);
        await game.connect(from).submitMove(move_hash, 5);

        return { move_hash, iv };
    };

    it("Test submit move", async function () {
        const { move_hash, iv } = await submitMove(ROCK, accounts[0]);

        expect(await game.p1_hashed_move()).to.equal(move_hash);
    });

    it("Test fail submit move with invalid parameters", async function () {
        await expect(
            game.submitMove(ethers.utils.soliditySha256(["string"], ["0"]), 0)
        ).to.be.revertedWith("submitMove: wager amount too small.");

        await expect(
            game
                .connect(accounts[2])
                .submitMove(ethers.utils.soliditySha256(["string"], ["0"]), 5)
        ).to.be.revertedWith("submitMove: not a player.");
    });

    it("Test reveal move", async function () {
        const { h, iv } = await submitMove(ROCK, accounts[0]);

        await game.connect(accounts[0]).revealMove(ROCK, iv);

        expect(await game.p1_move()).to.equal(ROCK);
    });

    it("Test fail reveal move with invalid parameters", async function () {
        const { h, iv } = await submitMove(ROCK, accounts[0]);

        await expect(
            game.connect(accounts[2]).revealMove(ROCK, iv)
        ).to.be.revertedWith("revealMove: invalid sender.");

        await expect(
            game.connect(accounts[0]).revealMove(0, iv)
        ).to.be.revertedWith("revealMove: invalid move.");

        await expect(
            game.connect(accounts[0]).revealMove(ROCK, 0)
        ).to.be.revertedWith("revealMove: move does not match hash.");
    });

    it("Test fail submit move after reveal", async function () {
        const { h, iv } = await submitMove(ROCK, accounts[0]);

        await game.connect(accounts[0]).revealMove(ROCK, iv);

        await expect(submitMove(ROCK, accounts[1])).to.be.revertedWith(
            "submitMove: p1 already revealed submitted move."
        );
    });

    it("Test fail reveal move twice", async function () {
        const { h, iv } = await submitMove(ROCK, accounts[0]);

        await game.connect(accounts[0]).revealMove(ROCK, iv);
        await expect(
            game.connect(accounts[0]).revealMove(ROCK, iv)
        ).to.be.revertedWith("revealMove: p1 already revealed move.");
    });

    it("Test correct winner", async function () {
        const move1 = await submitMove(ROCK, accounts[0]);
        const move2 = await submitMove(SCISSORS, accounts[1]);

        await game.connect(accounts[0]).revealMove(ROCK, move1.iv);
        await game.connect(accounts[1]).revealMove(SCISSORS, move2.iv);

        expect(await game.getWinner()).to.equal(accounts[0].address);

        const balance1 = await token.balanceOf(accounts[0].address);
        expect(balance1).to.equal(10);

        const balance2 = await token.balanceOf(accounts[1].address);
        expect(balance2).to.equal(0);
    });

    it("Test fail winner not all moves revealed", async function () {
        const move1 = await submitMove(ROCK, accounts[0]);
        const move2 = await submitMove(SCISSORS, accounts[1]);

        await game.connect(accounts[0]).revealMove(ROCK, move1.iv);

        await expect(game.getWinner()).to.be.revertedWith(
            "getWinner: moves not revealed."
        );
    });

    it("Test winner draw equal", async function () {
        const move1 = await submitMove(ROCK, accounts[0]);
        const move2 = await submitMove(ROCK, accounts[1]);

        await game.connect(accounts[0]).revealMove(ROCK, move1.iv);
        await game.connect(accounts[1]).revealMove(ROCK, move2.iv);

        expect(await game.getWinner()).to.equal(ethers.constants.AddressZero);

        const balance1 = await token.balanceOf(accounts[0].address);
        expect(balance1).to.equal(5);

        const balance2 = await token.balanceOf(accounts[1].address);
        expect(balance2).to.equal(5);
    });
});
