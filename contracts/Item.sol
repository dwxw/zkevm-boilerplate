pragma solidity ^0.8.0;

import '@imtbl/zkevm-contracts/contracts/token/erc721/preset/ImmutableERC721PermissionedMintable.sol';

contract Item is ImmutableERC721PermissionedMintable {
    constructor(
        address owner,
        string memory name,
        string memory symbol,
        string memory baseURI,
        string memory contractURI,
        address receiver, 
        uint96 feeNumerator
    )
        ImmutableERC721PermissionedMintable(
            owner,
            name,
            symbol,
            baseURI,
            contractURI,
            receiver, 
            feeNumerator
        )
    {}

    // define an event to be emitted with all of the forging details
    event ItemForged(
        address owner,
        uint256 tokenId1,
        uint256 tokenId2,
        uint256 newTokenId
    );

    /**
      * @dev Public function that allows a user to forge two items into a new item.
      *
      * @return uint256 The newly minted token id.
      */
    function forgeItems(uint256 tokenId1, uint256 tokenId2)
        public
        returns (uint256)
    {
        // require that the tokens are not the same
        require(
            tokenId1 != tokenId2,
            "forgeItems: Token IDs must be different"
        );

        // require that the caller owns both tokens to be forged
        require(
            ownerOf(tokenId1) == msg.sender && ownerOf(tokenId2) == msg.sender,
            "forgeItems: Caller does not own both tokens"
        );

        // burn the tokens
        _burn(tokenId1);
        _burn(tokenId2);

        // mint the new forged token
        uint256 newTokenId = _mintNextToken(msg.sender);

        // emit an ItemForged event
        emit ItemForged(msg.sender, tokenId1, tokenId2, newTokenId);

        // return the new token id
        return newTokenId;
    }
}