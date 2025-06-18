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
    bool public votingOpen;

    constructor() {
        owner = msg.sender;
        votingOpen = true;

        participants.push(Participant("Boni", "Casual", "Jakarta", 22, 0));
        participants.push(Participant("Ciko", "Streetwear", "Bandung", 24, 0));
        participants.push(Participant("Dodo", "Korean", "Surabaya", 21, 0));
        participants.push(Participant("Echa", "Chic", "Yogyakarta", 23, 0));
    }

    function getParticipant(uint index) public view returns (
        string memory, string memory, string memory, uint, uint
    ) {
        Participant memory p = participants[index];
        return (p.name, p.style, p.location, p.age, p.voteCount);
    }

    function getTotalParticipants() public view returns (uint) {
        return participants.length;
    }

    function vote(uint index) public payable {
        require(votingOpen, "Voting is closed");
        require(!hasVoted[msg.sender], "You already voted");
        require(msg.value == 0.01 ether, "Voting costs 0.01 ETH");
        require(index < participants.length, "Invalid index");

        participants[index].voteCount += 1;
        hasVoted[msg.sender] = true;
    }

    function getWinnerIndex() internal view returns (uint) {
        uint highest = 0;
        uint winnerIndex = 0;
        for (uint i = 0; i < participants.length; i++) {
            if (participants[i].voteCount > highest) {
                highest = participants[i].voteCount;
                winnerIndex = i;
            }
        }
        return winnerIndex;
    }

    function closeVotingAndSendReward(address payable winnerAddress) public {
        require(msg.sender == owner, "Only owner can close voting");
        require(votingOpen, "Voting already closed");
        votingOpen = false;

        require(address(this).balance >= 10 ether, "Insufficient balance");
        winnerAddress.transfer(10 ether);
    }

    function isVotingOpen() public view returns (bool) {
        return votingOpen;
    }

    receive() external payable {}
}
