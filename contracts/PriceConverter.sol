// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    // here we make all the functions internal

    // we are going to create a function to get the price of the USD here with the blockchain we are working with
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        // to interact with a contract outside our contract, we are going to need the ABI and Address
        // ETHUSD contract address price feed for goerli testnet  0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e

        // calling the priceFeed of the function latestRoundData from our interface and the price of ETH in USD only
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // price of ETH in USD
        // but then it returns the price in 8 decimal places
        // To return the price to the standard wei value of 1e18
        // return price * 1e10; // 1e10 times the previous 1e8 is equal to the standard value of 1e18
        // converting the above to uint, we do
        return uint256(price * 1e10);
    }

    // we are also going to create a function that gets the conversion rate of the USD
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // calling the the getPrice function with uint256 ethPrice
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUSD = (ethPrice * ethAmount) / 1e18; // here we divide the 36 dp gotten from multiplying the both to give us the standard wei converion
        return ethAmountInUSD;
    }
}
