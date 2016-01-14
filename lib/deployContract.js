var RawProvider = require("web3-raw-provider"),
    Web3 = require("web3"),
    ethUtils = require("ethereumjs-util");

module.exports = function(contractName, modCb){
  var pk = new Buffer(process.env.PRIV_KEY || exit("PRIV_KEY not set"), "hex");

  var web3 = new Web3(new RawProvider(process.env.RPC_ADDR || exit("RPC_ADDR not set"),pk));


  var address = ethUtils.privateToAddress(pk).toString("hex");

  var contractMeta = require("./contracts/"+contractName);

  var contract = web3.eth.contract(contractMeta.abi).new({
    from: "0x" + address,
    data: contractMeta.code,
    gas: 9000000,
    gasPrice: web3.eth.gasPrice
  }, function(err, contract){
    if (err) exit(err);
    if(contract.address) modCb(contract.address);
  });

  function exit(err){
    if(err) throw new Error(err);

    process.exit();
  }
};
