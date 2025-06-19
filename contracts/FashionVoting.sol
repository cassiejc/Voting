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
    bool public votingClosed;
    uint public winnerIndex;
    bool public hasWinner;
    
    // Keep track of all voters for reset functionality
    address[] public voters;

    event VotingClosed(uint winnerIndex, string winnerName);
    event VotingReset();
    event RewardSent(address winner, uint amount);

    constructor() {
        owner = msg.sender;
        votingOpen = true;
        votingClosed = false;
        hasWinner = false;

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
        voters.push(msg.sender);
    }

    function getWinnerIndex() internal view returns (uint) {
        uint highest = 0;
        uint winner = 0;
        for (uint i = 0; i < participants.length; i++) {
            if (participants[i].voteCount > highest) {
                highest = participants[i].voteCount;
                winner = i;
            }
        }
        return winner;
    }

    function closeVotingAndSendReward(address payable winnerAddress) public payable {
        require(msg.sender == owner, "Only owner can close voting");
        require(votingOpen, "Voting already closed");
        
        votingOpen = false;
        votingClosed = true;
        winnerIndex = getWinnerIndex();
        hasWinner = true;

        // Send 10 ETH reward to winner
        require(address(this).balance >= 10 ether, "Insufficient balance for reward");
        winnerAddress.transfer(10 ether);
        
        emit VotingClosed(winnerIndex, participants[winnerIndex].name);
        emit RewardSent(winnerAddress, 10 ether);
    }

    function resetVoting() public {
        require(msg.sender == owner, "Only owner can reset voting");
        
        // Reset all vote counts
        for (uint i = 0; i < participants.length; i++) {
            participants[i].voteCount = 0;
        }
        
        // Reset voting states
        votingOpen = true;
        votingClosed = false;
        hasWinner = false;
        winnerIndex = 0;
        
        // Clear all voter records
        for (uint i = 0; i < voters.length; i++) {
            hasVoted[voters[i]] = false;
        }
        
        // Clear voters array
        delete voters;
        
        emit VotingReset();
    }

    function isVotingOpen() public view returns (bool) {
        return votingOpen;
    }

    function isVotingClosed() public view returns (bool) {
        return votingClosed;
    }

    function getWinner() public view returns (string memory, uint) {
        require(hasWinner, "No winner determined yet");
        return (participants[winnerIndex].name, winnerIndex);
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    // Function to check if user has voted
    function userHasVoted(address user) public view returns (bool) {
        return hasVoted[user];
    }

    receive() external payable {}
}