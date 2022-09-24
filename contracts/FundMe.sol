// SPDX-License-Identifier: MIT
/** This contract was written obeying the solidity style guide */

// pragma
pragma solidity ^0.8.16;

//imports
import "./PriceConverter.sol";

// error codes
error FundMe__NotOwner();

//contracts
contract FundMe {
    // type declarations
    using PriceConverter for uint256;

    // state variables
    uint256 public constant MINIMUM_USD = 10 * 1e18;

    address[] private s_funders; // creating an array for all the funders in our contract...the s_ prefix is a good convention for storage variables
    mapping(address => uint256) private s_addressToAmountFunded; // mapping addresses to the variable...the s_ prefix is a good convention for storage variables

    address private immutable i_owner;

    AggregatorV3Interface private s_priceFeed;

    // modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as our library
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didn't send enough USD!"
        );

        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value; // addressToAmountFunded of the funders is equal to the value of USD sent
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++ // ending index;  funderIndex < funders.length shows that the ending
        ) {
            address funder = s_funders[funderIndex]; // returns an address of a funder according to its index
            s_addressToAmountFunded[funder] = 0; // after withdrawing the funds, this resets it to zero
        }
        // resetting the array
        s_funders = new address[](0);
        // To actually withdraw the funds
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    // Creating a withdrawal function that is much cheaper
    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        // note: mappings can't be in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    // gets the owner address
    function getOwner() public view returns (address) {
        return i_owner;
    }

    // gets the funders from the address array
    function getFunders(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    // gets the addressToAmountFunded
    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    // gets the priceFeed
    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
