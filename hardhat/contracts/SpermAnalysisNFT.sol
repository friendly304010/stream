// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SpermAnalysisNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping to store analysis results
    mapping(uint256 => AnalysisResult) public analysisResults;

    struct AnalysisResult {
        uint256 averageCount;
        uint256 normalizedMotilityScore;  // Store as percentage
        string grade;
    }

    constructor() ERC721("SpermAnalysisNFT", "SPERM") {}

    function mintNFT(
        address recipient,
        uint256 averageCount,
        uint256 normalizedMotilityScore
    ) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        string memory grade = determineGrade(normalizedMotilityScore);
        
        analysisResults[newTokenId] = AnalysisResult(
            averageCount,
            normalizedMotilityScore,
            grade
        );

        _mint(recipient, newTokenId);
        return newTokenId;
    }

    function determineGrade(uint256 normalizedMotilityScore) private pure returns (string memory) {
        if (normalizedMotilityScore >= 70) {
            return "Gold";
        } else if (normalizedMotilityScore >= 40) {
            return "Silver";
        } else {
            return "Bronze";
        }
    }
} 