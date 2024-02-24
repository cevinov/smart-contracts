// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract hello {
    function greeting(string memory _name) public pure returns (string memory) {
        bytes memory concatenatedBytes = abi.encodePacked(
            "Hello, my name is ",
            _name
        );
        return string(concatenatedBytes);
    }
}
