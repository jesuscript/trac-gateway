var web3 = require("../web3");

module.exports = {
  deploy: function(contractName, opt, modCb){
    var contractMeta = require("./"+contractName);

    var contract = web3.eth.contract(contractMeta.abi).new({
      data: contractMeta.code,
      gas: 9000000
    }, function(err, contract){
      if (err) throw new Error(err);
      if(contract.address) modCb(contract.address);
    });
  },
  contract: function(name){
    console.log("warn: contracts.contract is hardcoded to return antifraud only");

    if(!process.env.ANTIFRAUD_ADDR) throw new Error("ANTIFRAUD_ADDR is not defined");
    
    var meta = require("./antifraud");
    
    return web3.eth.contract(meta.abi).at(process.env.ANTIFRAUD_ADDR);
  }
};

