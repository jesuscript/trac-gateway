var router = require("express").Router(),
    web3 = require("../web3");


router.get("/:hash", function(req, res){
  if(! req.params.hash) res.send(400, "no transaction hash provided");
  
  web3.eth.getTransaction(req.params.hash, function(err, tx){
    if(!tx) return res.json({state: "rejected"});

    res.json({
      state: tx.blockNumber ? "accepted" : "pending",
      txData: tx
    });
  });
});

module.exports = router;
