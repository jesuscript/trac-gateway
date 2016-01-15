var Web3 = require("web3"),
    RawProvider = require("web3-raw-provider"),
    ethUtils = require("ethereumjs-util");

var pk, rpcAddr;

if(! (pk = process.env.PRIV_KEY)) throw new Error("PRIV_KEY not set");
if(! (rpcAddr = process.env.RPC_ADDR)) throw new Error("RPC_ADDR not set");

var bufPk = new Buffer(pk, "hex");

var web3 = new Web3(new RawProvider(rpcAddr, bufPk));

web3.eth.defaultAccount = ethUtils.privateToAddress(bufPk).toString("hex");

module.exports = web3;

