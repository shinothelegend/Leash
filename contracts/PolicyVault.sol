// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/// @title PolicyVault
/// @notice Holds funds for an autonomous AI agent and enforces spending policy.
///         In-policy payments settle immediately. Out-of-policy payments are
///         escalated and require the human owner (Ledger-signed) to release them.
contract PolicyVault {
    address public owner;
    address public agent;
    AggregatorV3Interface public priceFeed;

    uint256 public dailyCapUsdCents;
    uint256 public perTxCapUsdCents;
    mapping(address => bool) public vendorAllowlist;

    uint256 public spentTodayUsdCents;
    uint256 public dayStart;

    enum Status { None, Approved, Escalated, Rejected, Released }

    struct Payment {
        address vendor;
        uint256 amountWei;
        uint256 amountUsdCents;
        Status status;
        uint256 timestamp;
        string resource;
    }

    Payment[] public payments;

    event PaymentApproved(uint256 indexed id, address indexed vendor, uint256 amountWei, uint256 amountUsdCents, string resource);
    event PaymentEscalated(uint256 indexed id, address indexed vendor, uint256 amountWei, uint256 amountUsdCents, string resource, string reason);
    event PaymentRejected(uint256 indexed id, address indexed vendor, string reason);
    event PaymentReleased(uint256 indexed id, address indexed vendor, uint256 amountWei);
    event PolicyUpdated(uint256 dailyCapUsdCents, uint256 perTxCapUsdCents);

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }
    modifier onlyAgent() { require(msg.sender == agent, "not agent"); _; }

    constructor(address _agent, address _priceFeed, uint256 _dailyCapUsdCents, uint256 _perTxCapUsdCents) {
        owner = msg.sender;
        agent = _agent;
        priceFeed = AggregatorV3Interface(_priceFeed);
        dailyCapUsdCents = _dailyCapUsdCents;
        perTxCapUsdCents = _perTxCapUsdCents;
        dayStart = block.timestamp;
    }

    receive() external payable {}

    function setPolicy(uint256 _dailyCapUsdCents, uint256 _perTxCapUsdCents) external onlyOwner {
        dailyCapUsdCents = _dailyCapUsdCents;
        perTxCapUsdCents = _perTxCapUsdCents;
        emit PolicyUpdated(_dailyCapUsdCents, _perTxCapUsdCents);
    }

    function setVendorAllowed(address vendor, bool allowed) external onlyOwner {
        vendorAllowlist[vendor] = allowed;
    }

    function _usdCents(uint256 weiAmount) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "bad price");
        uint8 dec = priceFeed.decimals();
        return (weiAmount * uint256(price) * 100) / (10 ** dec) / 1e18;
    }

    function _rolloverDay() internal {
        if (block.timestamp >= dayStart + 1 days) {
            dayStart = block.timestamp;
            spentTodayUsdCents = 0;
        }
    }

    function requestPayment(address payable vendor, uint256 amountWei, string calldata resource)
        external onlyAgent returns (uint256 id)
    {
        _rolloverDay();
        uint256 usdCents = _usdCents(amountWei);
        id = payments.length;

        if (address(this).balance < amountWei) {
            payments.push(Payment(vendor, amountWei, usdCents, Status.Rejected, block.timestamp, resource));
            emit PaymentRejected(id, vendor, "insufficient balance");
            return id;
        }

        bool overPerTx = usdCents > perTxCapUsdCents;
        bool overDaily = spentTodayUsdCents + usdCents > dailyCapUsdCents;
        bool vendorNotAllowed = !vendorAllowlist[vendor];

        if (overPerTx || overDaily || vendorNotAllowed) {
            payments.push(Payment(vendor, amountWei, usdCents, Status.Escalated, block.timestamp, resource));
            string memory reason = vendorNotAllowed ? "vendor not allowlisted" : (overPerTx ? "exceeds per-tx cap" : "exceeds daily cap");
            emit PaymentEscalated(id, vendor, amountWei, usdCents, resource, reason);
            return id;
        }

        spentTodayUsdCents += usdCents;
        payments.push(Payment(vendor, amountWei, usdCents, Status.Approved, block.timestamp, resource));
        (bool ok, ) = vendor.call{value: amountWei}("");
        require(ok, "transfer failed");
        emit PaymentApproved(id, vendor, amountWei, usdCents, resource);
    }

    /// @dev Call only after the human owner has confirmed on a Ledger device (Clear Signing).
    function releasePayment(uint256 id) external onlyOwner {
        Payment storage p = payments[id];
        require(p.status == Status.Escalated, "not escalated");
        require(address(this).balance >= p.amountWei, "insufficient balance");
        p.status = Status.Released;
        spentTodayUsdCents += p.amountUsdCents;
        (bool ok, ) = payable(p.vendor).call{value: p.amountWei}("");
        require(ok, "transfer failed");
        emit PaymentReleased(id, p.vendor, p.amountWei);
    }

    function rejectPayment(uint256 id, string calldata reason) external onlyOwner {
        Payment storage p = payments[id];
        require(p.status == Status.Escalated, "not escalated");
        p.status = Status.Rejected;
        emit PaymentRejected(id, p.vendor, reason);
    }

    function paymentsCount() external view returns (uint256) { return payments.length; }
}
