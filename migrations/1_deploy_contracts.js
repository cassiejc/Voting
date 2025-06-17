const FashionVote = artifacts.require("FashionVote");

module.exports = function (deployer) {
  deployer.deploy(FashionVote);
};
