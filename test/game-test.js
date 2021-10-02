const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Rock, paper scissors game", function () {
    let accounts;
    let token;
    let game;

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

    it("Test submit move", async function () {
        const move = 1; // Rock
        const iv = 12345; // fixme: safe randomize

        // https://docs.ethers.io/v5/api/utils/hashing/
        const move_hash = ethers.utils.soliditySha256(
            ["uint8", "uint32"],
            [move, iv]
        );

        await token.approve(game.address, 5);
        await game.submitMove(move_hash, 5);

        expect(await game.p1_hashed_move()).to.equal(move_hash);
    });

    it("Test submit move invalid parameters", async function () {});

    it("Test reveal move", async function () {});

    it("Test submit move after reveal", async function () {});

    it("Test reveal move after reveal", async function () {});

    it("Test winner", async function () {});

    it("Test winner draw", async function () {});
});
