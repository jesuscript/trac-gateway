var _ = require("lodash");
    

describe("Trac Gateway", function(){
  before(function(done){
    this.timeout(7000);
    _.extend(process.env, require("./vars.json"));
    
    require("../lib/contracts").deploy("antifraud", function(addr){
      process.env.ANTIFRAUD_ADDR = addr;
      done();
    });
  });

  require("./ownership");
});




