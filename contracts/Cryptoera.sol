// SPDX-License-Identifier: MIT
pragma solidity  ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Cryptoera is ERC20, Pausable, Ownable {

    uint8 private constant _decimals = 18;
    uint256 public constant lpReserve           = 200_000_000 * (10 ** _decimals);
    uint256 public constant exchangeReserve = 150_000_000 * (10 ** _decimals);
    uint256 public constant treasuryReserve = 150_000_000 * (10 ** _decimals);
    uint256 public constant marketingReserve = 150_000_000 * (10 ** _decimals);
    uint256 public constant teamReserve = 200_000_000 * (10 ** _decimals);
    uint256 public constant developmentReserve = 150_000_000 * (10 ** _decimals);


    bool public firstBuyCompleted = false;
    event FirstBuyDone();

    address public uniswapPool;
    // address public pancakeswapPool;


    address private constant taxWallet = 0xA94C73b5f58ee5d0B4E7Ff2791489F28A3862d5E;
    uint256 public constant buyTax = 3;
    uint256 public constant sellTax = 4;


    constructor() ERC20("Cryptoera", "CRT")  Ownable (msg.sender) {
        
        _mint(0x57Eec8876D36e00C0C0Df1A6946aE0c613cb8ed2, lpReserve);
        _mint(0x4A5592Dbd23e0D37E2BC52F073521d19dE07da7a, exchangeReserve);
        _mint(0xa0DC05431abfF5F247299fbEC776a09357f17C64, treasuryReserve);
        _mint(0xb88D740874ec5dA10DD8FaF64Dee77d90A8eE825, marketingReserve);
        _mint(0xfcEde60058c1c33EE068526F2FB9AEc2558C4D00, teamReserve);
        _mint(0x1DBa38FDd0EDF59AddcE92c799819638ADb43134, developmentReserve);
    }

    function setUniswapPool(address _uniswapPool) external onlyOwner {
        require(_uniswapPool != address(0), "Pool address cannot be zero");
        uniswapPool = _uniswapPool;
    }

//   function setPancakeSwapPool(address _pancakeSwapPool) external onlyOwner {
//         require(_pancakeSwapPool != address(0), "Pool address cannot be zero");
//         pancakeSwapPool = _pancakeSwapPool;
//     }

    function pause () external onlyOwner{
        _pause();
    }

    function unpause () external onlyOwner{
        _unpause();
    }

    function increaseAllowance (address spender, uint256 addedValue) public returns (bool) {
        _approve(_msgSender(), spender, allowance(_msgSender(), spender) + addedValue);
        return true;
    }

    function decreaseAllowance (address spender, uint256 subtractionValue) public returns (bool) {
        uint256 currentAllowance = allowance(_msgSender(), spender);
        require(currentAllowance >= subtractionValue, "ERC20: decreased allowance below zero");
        _approve(_msgSender(), spender, currentAllowance - subtractionValue);
        return true;
    }

    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        if (!firstBuyCompleted && from == uniswapPool && from != address(0)) { 
            require(to == owner(), "First Buy Pending");
            firstBuyCompleted = true;
            emit FirstBuyDone();
        }

        uint256 sendAmount = value;

        if(taxWallet != address(0)) {
            bool isBuy = (from == uniswapPool && uniswapPool != address(0));
            bool isSell = (to == uniswapPool && uniswapPool != address(0));


            if(isBuy || isSell) {
                uint256 taxPercent = isBuy ? buyTax : sellTax;
                uint256 taxAmount = (value * taxPercent) / 100;

                if(taxAmount > 0) {
                    sendAmount = value - taxAmount;
                    super._update(from, taxWallet, taxAmount);
                }
            }            

        }

        super._update(from, to, sendAmount);
    }

}