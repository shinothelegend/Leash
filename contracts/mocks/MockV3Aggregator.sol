// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract MockV3Aggregator is AggregatorV3Interface {
    uint8 public override decimals = 8;
    int256 public answer;
    constructor(int256 _initialAnswer) { answer = _initialAnswer; }
    function description() external pure override returns (string memory) { return "Mock HBAR/USD"; }
    function version() external pure override returns (uint256) { return 1; }
    function updateAnswer(int256 _answer) external { answer = _answer; }
    function getRoundData(uint80) external view override returns (uint80, int256, uint256, uint256, uint80) {
        return (0, answer, block.timestamp, block.timestamp, 0);
    }
    function latestRoundData() external view override returns (uint80, int256, uint256, uint256, uint80) {
        return (0, answer, block.timestamp, block.timestamp, 0);
    }
}
