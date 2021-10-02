//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract RockPaperScissors {
    using SafeMath for uint256;

    address public p1;
    address public p2;
    address public wager_token;
    uint256 public wager_amount;

    enum Move {
        None,
        Rock,
        Paper,
        Scissors
    }

    Move public p1_move;
    bytes32 public p1_hashed_move;

    Move public p2_move;
    bytes32 public p2_hashed_move;

    constructor(
        address _p1,
        address _p2,
        address _wager_token,
        uint256 _wager_amount
    ) {
        require(
            _p1 != address(0) && _p2 != address(0),
            "constructor: invalid player addresses."
        );
        require(
            _wager_token != address(0),
            "constructor: invalid wager token address."
        );

        p1 = _p1;
        p2 = _p2;
        wager_token = _wager_token;
        wager_amount = _wager_amount;

        p1_move = Move.None;
        p2_move = Move.None;
    }

    function submitMove(bytes32 hashed_move, uint256 amount) external {
        require(amount >= wager_amount, "submitMove: wager amount too small.");
        require(
            msg.sender == p1 || msg.sender == p2,
            "submitMove: not a player."
        );

        if (msg.sender == p1) {
            require(
                p2_move == Move.None,
                "submitMove: p2 already revealed submitted move."
            );
            p1_hashed_move = hashed_move;
        } else {
            require(
                p1_move == Move.None,
                "submitMove: p1 already revealed submitted move."
            );
            p2_hashed_move = hashed_move;
        }

        IERC20(wager_token).transferFrom(msg.sender, address(this), amount);
    }

    function revealMove(Move move, uint32 iv) public {
        require(
            msg.sender == p1 || msg.sender == p2,
            "revealMove: invalid sender."
        );
        require(move != Move.None, "revealMove: invalid move.");

        if (msg.sender == p1) {
            require(
                p1_move == Move.None,
                "revealMove: p1 already revealed move."
            );
            require(
                sha256(abi.encodePacked(move, iv)) == p1_hashed_move,
                "revealMove: move does not match hash."
            );
            p1_move = move;
        } else {
            require(
                p2_move == Move.None,
                "revealMove: p1 already revealed move."
            );
            require(
                sha256(abi.encodePacked(move, iv)) == p2_hashed_move,
                "revealMove: move does not match hash."
            );
            p2_move = move;
        }
    }

    function getWinner() external returns (address winner) {
        require(
            p1_move != Move.None && p2_move != Move.None,
            "getWinner: both players did not reveal their moves."
        );

        if (
            (p1_move == Move.Rock && p2_move == Move.Scissors) ||
            (p1_move == Move.Paper && p2_move == Move.Rock) ||
            (p1_move == Move.Scissors && p2_move == Move.Paper)
        ) {
            IERC20(wager_token).transfer(p1, wager_amount.mul(2));
            return p1;
        } else if (
            (p2_move == Move.Rock && p1_move == Move.Scissors) ||
            (p2_move == Move.Paper && p1_move == Move.Rock) ||
            (p2_move == Move.Scissors && p1_move == Move.Paper)
        ) {
            IERC20(wager_token).transfer(p2, wager_amount.mul(2));
            return p2;
        }

        IERC20(wager_token).transfer(p1, wager_amount);
        IERC20(wager_token).transfer(p2, wager_amount);
        return address(0);
    }
}
