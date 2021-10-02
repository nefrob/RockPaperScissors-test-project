// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WagerToken is ERC20 {
    constructor() ERC20("Wager Token", "WAGER") {}

    function mint(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}
