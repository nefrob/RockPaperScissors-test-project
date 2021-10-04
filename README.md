# RockPaperScissors test project

This project implements a simple smart contract named `RockPaperScissors` that allows Alice and Bob to play the classic game of rock, paper, scissors using an ERC20 (of their choosing).

-   A _Game_ is created by deploying an instance of the contract.
-   _Alice_ and _Bob_ can submit moves by depositing the correct wager amount with their hashed move.
-   Once both players have submitted a move (up to them to know so), moves can be revealed by submitting the hash inverse (move & secret).
-   On reveal of the second move the winner is determined and the wager from both players is given to the winner. On draw the wager is returned to both players.

### Setup & Tests

Install dependencies via: `npm install`.

Run the tests via: `npx hardhat test`.

<!-- ## Stretch Goals
Nice to have, but not necessary.
- Make it a utility whereby any 2 people can decide to play against each other.
- Reduce gas costs as much as possible.
- Let players bet their previous winnings.
- How can you entice players to play, knowing that they may have their funds stuck in the contract if they face an uncooperative player?
- Include any tests using Hardhat.

Now fork this repo and do it!

When you're done, please send an email to zak@slingshot.finance (if you're not applying through Homerun) with a link to your fork or join the [Slingshot Discord channel](https://discord.gg/JNUnqYjwmV) and let us know.

Happy hacking! -->
<!--
Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
``` -->
