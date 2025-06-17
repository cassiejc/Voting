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

  try {
    const total = await instance.getTotalParticipants.call();
    console.log("Total participants:", total.toString());

    $("#participant-list").empty();

    for (let i = 0; i < total; i++) {
      const p = await instance.getParticipant.call(i);
      console.log("Participant", i, p);
      const card = `
        <div class="card">
          <h3>${p[0]}</h3>
          <p>${p[3]} years old</p>
          <p>${p[1]}</p>
          <p>${p[2]}</p>
          <p>Votes: ${p[4]}</p>
          <button class="vote-btn" data-id="${i}">Vote</button>
        </div>
      `;
      $("#participant-list").append(card);
    }

    $(".vote-btn").off("click").on("click", async function () {
      const index = $(this).data("id");
      await instance.vote(index, {
        from: App.account,
        value: web3.utils.toWei("0.01", "ether"),
        gas: 300000,
      });
      alert("Voted successfully!");
      App.render(); // refresh
    });
  } catch (error) {
    console.error("Error while rendering participants:", error);
  }
}


};

$(function () {
  App.init();
});
