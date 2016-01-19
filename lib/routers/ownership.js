var router = require("express").Router(),
    web3 = require("../web3"),
    antifraud = require("../contracts").contract("antifraud");

router.get("/:serial",function(req,res){
  var addr = antifraud.registry.call(req.params.serial);

  if(addr == "0x0000000000000000000000000000000000000000"){
    res.status(404).end();
  }else{
    res.json({
      address: addr
    });
  }
}).post("/",function(req,res){
  antifraud.claim(req.body.address, req.body.serial, req.body.secretHash, {
    gas: 90000000
  } ,function(err, txHash){
    if(err) throw err;
    
    if(!web3.eth.getTransaction(txHash)) return res.status(500).end();

    res.json({
      txHash: txHash,
      address: req.body.address,
      serial: req.body.serial
    });
  });
}).put("/:serial", function(req,res){
  antifraud.transfer(req.params.serial, req.body.address, req.body.secret, req.body.newSecretHash,{
    gas: 9000000
  }, function(err, txHash){
    console.log("txHash:", txHash);
    if(err) throw err;
    
    if(!web3.eth.getTransaction(txHash)) return res.status(500).end();

    res.json({
      txHash: txHash,
      address: req.body.address,
      serial: req.params.serial
    });
  });
});


module.exports = router;
