// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Import this file from hardhat for console.log capabilities
import "hardhat/console.sol";

contract Hello {
    string private name = "cevino";
    function greeting() public view returns (string memory) {
        // Concatenated string
        bytes memory concatenatedBytes = abi.encodePacked(
            "Hello, my name is ",
            name
        );

        console.log("Hello, my name is '%s'", name);
        return string(concatenatedBytes);
    }

    function setName(string memory _name) public {
        name = _name;
        console.log("New name = '%s'", name);
    }
}
