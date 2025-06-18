App = {
  web3Provider: null,
  contracts: {},
  account: "",

  init: async function () {
    return App.initWeb3();
  },

  initWeb3: async function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      await ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(App.web3Provider);
    } else {
      alert("Install MetaMask!");
      return;
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("../build/contracts/FashionVoting.json", function (data) {
      App.contracts.FashionVoting = TruffleContract(data);
      App.contracts.FashionVoting.setProvider(App.web3Provider);
      return App.render();
    });
  },

  render: async function () {
    const accounts = await web3.eth.getAccounts();
    App.account = accounts[0];
    $("#account").text("Your account: " + App.account);

    const instance = await App.contracts.FashionVoting.deployed();
    const votingOpen = await instance.isVotingOpen();
    const votingClosed = await instance.isVotingClosed();
    
    // Cek apakah AKUN YANG SEDANG TERHUBUNG sudah vote
    const userHasVoted = await instance.userHasVoted(App.account);
    console.log(`Akun ${App.account} sudah vote: ${userHasVoted}`);

    // Update voting status display
    if (votingClosed) {
      $("#voting-status").html('<span style="color: red; font-weight: bold; font-size: 18px;">🚫 VOTING DITUTUP 🚫</span>');
      
      // Show winner information
      try {
        const winner = await instance.getWinner();
        $("#winner-info").html(`
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <h3 style="color: #155724; margin: 0;">🏆 PEMENANG: ${winner[0]} 🏆</h3>
            <p style="color: #155724; margin: 5px 0;">Selamat! Pemenang mendapat reward 10 ETH!</p>
          </div>
        `);
      } catch (e) {
        console.log("Winner not determined yet");
      }
    } else {
      $("#voting-status").html('<span style="color: green; font-weight: bold;">✅ Voting Terbuka</span>');
      $("#winner-info").empty();
    }

    const total = await instance.getTotalParticipants();
    $("#participant-list").empty();

    for (let i = 0; i < total; i++) {
      const p = await instance.getParticipant(i);
      let voteButton = '';
      
      if (votingClosed) {
        voteButton = '<p style="color: red; font-weight: bold;">❌ Voting Ditutup</p>';
      } else if (userHasVoted) {
        voteButton = '<p style="color: orange; font-weight: bold;">✅ Anda Sudah Vote</p>';
      } else {
        voteButton = `<button class="vote-btn" data-id="${i}">🗳️ Vote</button>`;
      }

      const card = `
        <div class="card">
          <h3>${p[0]}</h3>
          <p>${p[3]} years old</p>
          <p>Style: ${p[1]}</p>
          <p>Location: ${p[2]}</p>
          <p><strong>Votes: ${p[4]}</strong></p>
          ${voteButton}
        </div>`;
      $("#participant-list").append(card);
    }

    // Only attach click event if voting is open and user hasn't voted
    if (votingOpen && !userHasVoted) {
      $(".vote-btn").off("click").on("click", async function () {
        const index = $(this).data("id");
        try {
          await instance.vote(index, {
            from: App.account,
            value: web3.utils.toWei("0.01", "ether"),
            gas: 300000,
          });
          alert("Vote berhasil!");
          App.render();
        } catch (e) {
          alert("Vote gagal: " + e.message);
        }
      });
    }

    // Admin controls
    const adminAddress = "0x55491b57FA3ed81136d288828E1dD4F3d4b2c0eC".toLowerCase();
    if (App.account.toLowerCase() === adminAddress) {
      $("#admin-controls").show();
      
      if (votingOpen) {
        $("#close-btn").show();
        $("#reset-btn").hide();
      } else {
        $("#close-btn").hide();
        $("#reset-btn").show();
      }
    } else {
      $("#admin-controls").hide();
    }

    // Close voting button
    $("#close-btn").off("click").on("click", async function () {
      const winnerAddress = "0xb12B1BC8C53AE4715bacd05d37E1aD68c1A99037";
      try {
        // First, ensure contract has enough balance for the reward
        const contractBalance = await instance.getContractBalance();
        const balanceInEth = web3.utils.fromWei(contractBalance, 'ether');
        
        if (parseFloat(balanceInEth) < 10) {
          alert(`Contract balance (${balanceInEth} ETH) is insufficient for 10 ETH reward!`);
          return;
        }
        
        await instance.closeVotingAndSendReward(winnerAddress, {
          from: App.account,
          gas: 500000,
        });
        alert("Voting ditutup dan reward 10 ETH telah dikirim ke pemenang!");
        App.render();
      } catch (e) {
        alert("Gagal menutup voting: " + e.message);
      }
    });

    // Reset voting button
    $("#reset-btn").off("click").on("click", async function () {
      if (confirm("Apakah Anda yakin ingin mereset semua hasil voting?")) {
        try {
          await instance.resetVoting({
            from: App.account,
            gas: 300000,
          });
          alert("Voting berhasil direset!");
          App.render();
        } catch (e) {
          alert("Gagal mereset voting: " + e.message);
        }
      }
    });

    // Show contract balance for admin
    if (App.account.toLowerCase() === adminAddress) {
      const balance = await instance.getContractBalance();
      const balanceInEth = web3.utils.fromWei(balance, 'ether');
      $("#contract-balance").text(`Contract Balance: ${balanceInEth} ETH`);
    }
  }
};

$(function () {
  App.init();
});