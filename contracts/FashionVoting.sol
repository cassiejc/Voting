// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract FashionVoting {
    struct Participant {
        string name;
        string style;
        string location;
        uint age;
        uint voteCount;
    }

    Participant[] public participants;
    mapping(address => bool) public hasVoted;
    address public owner;

    constructor() {
        owner = msg.sender;

        participants.push(Participant("Boni", "Casual", "Jakarta", 22, 0));
        participants.push(Participant("Ciko", "Streetwear", "Bandung", 24, 0));
        participants.push(Participant("Dodo", "Korean", "Surabaya", 21, 0));
        participants.push(Participant("Echa", "Chic", "Yogyakarta", 23, 0));
    }

    function getParticipant(uint index) public view returns (
        string memory name,
        string memory style,
        string memory location,
        uint age,
        uint voteCount
    ) {
        Participant memory p = participants[index];
        return (p.name, p.style, p.location, p.age, p.voteCount);
    }

    function getTotalParticipants() public view returns (uint) {
        return participants.length;
    }

    function vote(uint index) public payable {
        require(!hasVoted[msg.sender], "You already voted");
        require(msg.value == 0.01 ether, "Voting costs 0.01 ETH");
        require(index < participants.length, "Invalid index");

        participants[index].voteCount += 1;
        hasVoted[msg.sender] = true;
    }

    function getWinner() public view returns (string memory name, uint voteCount) {
        uint highest = 0;
        uint winnerIndex = 0;

        for (uint i = 0; i < participants.length; i++) {
            if (participants[i].voteCount > highest) {
                highest = participants[i].voteCount;
                winnerIndex = i;
            }
        }

        Participant memory winner = participants[winnerIndex];
        return (winner.name, winner.voteCount);
    }

    function sendRewardToWinner() public {
        require(msg.sender == owner, "Only owner can send reward");

        address payable winnerAddress = payable(owner); // dummy, update if ada relasi

        winnerAddress.transfer(address(this).balance);
    }
}
