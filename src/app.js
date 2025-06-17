// app.js
App = {
  web3Provider: null,
  contracts: {},
  account: null,

  init: async function () {
    await $.getJSON('../participants.json', function (data) {
      var participantsRow = $('#participantsRow');
      var participantTemplate = $('#participantTemplate');

      for (let i = 0; i < data.length; i++) {
        var card = $(participantTemplate.html());

        card.find('[data-id="participant-image"]').attr('src', data[i].picture);
        card.find('[data-id="participant-name"]').text(data[i].name);
        card.find('[data-id="participant-age"]').text(`${data[i].age} years old`);
        card.find('[data-id="participant-style"]').text(data[i].style || "Casual");
        card.find('[data-id="participant-location"]').text(data[i].location);
        card.find('.vote-btn').attr('data-id', data[i].id);

        participantsRow.append(card);
      }
    });
    return App.initWeb3();
  },

  initWeb3: async function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error("User denied account access");
      }
    } else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON('build/contracts/FashionVoting.json', function (data) {
      var VotingArtifact = data;
      App.contracts.FashionVoting = TruffleContract(VotingArtifact);
      App.contracts.FashionVoting.setProvider(App.web3Provider);

      return App.bindEvents();
    });
  },

  bindEvents: function () {
    $(document).on('click', '.vote-btn', App.handleVote);
  },

  handleVote: function (event) {
    event.preventDefault();
    var participantId = parseInt($(event.target).data('id'));

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.error(error);
      }
      App.account = accounts[0];

      App.contracts.FashionVoting.deployed().then(function (instance) {
        return instance.vote(participantId, { from: App.account });
      }).then(function () {
        App.displayStatus("Vote successful!");
      }).catch(function (err) {
        console.error(err.message);
        App.displayStatus("Vote failed. " + err.message);
      });
    });
  },

  displayStatus: function (message) {
    var statusDiv = $('#status');
    statusDiv.text(message).removeClass('hidden').addClass('block');
    setTimeout(() => {
      statusDiv.removeClass('block').addClass('hidden');
    }, 5000);
  }
};

$(function () {
  App.init();
});
