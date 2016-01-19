var _ = require("lodash");
    

describe("Trac Gateway", function(){
  before(function(done){
    this.timeout(7000);
    _.extend(process.env, require("./vars.json"));

    console.log("deploying antifraud");
    require("../lib/contracts").deploy("antifraud", {force: true},function(addr){
      console.log("deployed at", addr);
      process.env.ANTIFRAUD_ADDR = addr;
      done();
    });
  });

  require("./ownership");
});




