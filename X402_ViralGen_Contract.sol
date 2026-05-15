// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ViralGenX402
 * @dev Implementation of the x402 Paid API Protocol for AI Video Script Generation.
 * This contract handles USDC payments for API calls on Base Network.
 */

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ViralGenX402 {
    address public owner;
    address public immutable usdcToken; // Base USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
    uint256 public pricePerGeneration;
    
    event PaymentReceived(address indexed user, uint256 amount, string action);
    event Withdrawal(address indexed to, uint256 amount);

    constructor(address _usdcToken, uint256 _initialPrice) {
        owner = msg.sender;
        usdcToken = _usdcToken;
        pricePerGeneration = _initialPrice; // e.g., 100000 (0.1 USDC, since USDC has 6 decimals)
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /**
     * @dev Process payment for AI Generation. 
     * The x402 client (Bankr) will call this before triggered the backend API.
     */
    function requestGeneration(uint256 amount) external {
        require(amount >= pricePerGeneration, "Insufficient payment amount");
        require(IERC20(usdcToken).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        emit PaymentReceived(msg.sender, amount, "viral_gen");
    }

    /**
     * @dev Buy Credits in Bulk (Credit Store Logic)
     */
    function buyCredits(uint256 amount, uint256 totalCost) external {
        require(totalCost > 0, "Cost must be > 0");
        require(IERC20(usdcToken).transferFrom(msg.sender, address(this), totalCost), "Transfer failed");
        
        emit PaymentReceived(msg.sender, totalCost, "buy_credits");
    }

    function setPrice(uint256 _newPrice) external onlyOwner {
        pricePerGeneration = _newPrice;
    }

    function withdraw() external onlyOwner {
        uint256 balance = IERC20(usdcToken).balanceOf(address(this));
        require(balance > 0, "Nothing to withdraw");
        require(IERC20(usdcToken).transferFrom(address(this), owner, balance), "Withdrawal failed");
        
        emit Withdrawal(owner, balance);
    }

    // Support for potential native ETH (if needed)
    receive() external payable {}
}
