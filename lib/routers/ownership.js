var router = require("express").Router(),
    web3 = require("../web3"),
    antifraud = require("../contracts").contract("antifraud");

router.get("/",function(req,res){
  res.json({
    address: antifraud.registry.call(req.body.serial)
  });
}).post("/",function(req,res,body){
  var count = 0;
  
  var claim = function(){
    antifraud.claim(req.body.address, req.body.serial, function(err, txHash){
      if(claim++ > 10) return res.send(500);
      
      if(web3.eth.getTransaction(txHash)){
        res.json({
          txHash: txHash,
          address: req.body.address,
          serial: req.body.serial
        });
      } else  {
        console.log("claim tx failed, retrying");
        claim();
      }
    });
  };

  claim();
});


module.exports = router;
