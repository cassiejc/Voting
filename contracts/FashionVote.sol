// SPDX-License-Identifier: MIT
//pragma solidity ^0.8.0;
pragma solidity >=0.7.0 <0.9.0;

contract FashionVote {
    struct Participant {
        string name;
        uint voteCount;
    }

    address public admin;
    bool public votingOpen;

    Participant[] public participants;
    mapping(address => bool) public hasVoted;

    constructor() {
        admin = msg.sender;
        votingOpen = false;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this.");
        _;
    }

    function addParticipant(string memory _name) public onlyAdmin {
        participants.push(Participant(_name, 0));
    }

    function startVoting() public onlyAdmin {
        votingOpen = true;
    }

    function endVoting() public onlyAdmin {
        votingOpen = false;
    }

    function vote(uint index) public {
        require(votingOpen, "Voting is not open.");
        require(!hasVoted[msg.sender], "You have already voted.");
        require(index < participants.length, "Invalid participant.");

        hasVoted[msg.sender] = true;
        participants[index].voteCount++;
    }

    function getParticipants() public view returns (Participant[] memory) {
        return participants;
    }

    function getWinner() public view returns (string memory winnerName) {
        uint maxVotes = 0;
        uint winnerIndex = 0;

        for (uint i = 0; i < participants.length; i++) {
            if (participants[i].voteCount > maxVotes) {
                maxVotes = participants[i].voteCount;
                winnerIndex = i;
            }
        }

        return participants[winnerIndex].name;
    }
}
