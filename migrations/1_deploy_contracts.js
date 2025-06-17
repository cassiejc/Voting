const FashionVoting = artifacts.require("FashionVoting");

module.exports = function (deployer) {
  deployer.deploy(FashionVoting);
};
