var async = require("async"),
    should = require("should"),
    _ = require("lodash"),
    request = require("request");

describe("ownership", function(){
  var server,
      responses;

  var serial = "xyz123",
      ownerAddress = "0x0000000000000000000000000000000000000042";

  before(function(done){
    this.timeout(10000);
    request = request.defaults({baseUrl: "http://localhost:" + process.env.PORT});
    
    require("../lib/server")(function(s){
      server = s;

      async.auto({
        postOwnership: _.partial(request.post, {
          url: "/ownership",
          json: {
            serial: serial,
            address: ownerAddress
          }
        }),
        getTX: ["postOwnership", function(cb, res){
          async.retry({times: 5, interval: 1000}, function(cb){
            var hash = res.postOwnership[0].body.txHash;
            if(!hash) throw new Error("no tx hash!");
            
            request.get({
              url: "/tx/"+hash,
              json: true
            }, function(err, res, body){
              if(err) throw err;

              if(body.state == "rejected") throw new Error("transaction rejected");

              cb((body.state == "accepted") ? null: "Unconfirmed transaction", res);
            });
          }, cb);
        }],
        getOwnership: ["getTX", _.partial(request.get, {
          url: "/ownership/"+serial,
          json: true
        })]
      },function(err, results){
        responses = results;
        if(err) throw err;

        done();
      });
    });

  });

  after(function(){
    server.close();
  });

  describe("POST /ownership", function(){
    it("responds as expected", function(){
      responses.postOwnership[0].body.should.have.property("txHash");
      responses.postOwnership[0].body.should.have.property("address", ownerAddress);
      responses.postOwnership[0].body.should.have.property("serial", serial);
    });

  });

  describe("GET /tx", function(){
    it("responds as expected", function(){
      responses.getTX.body.should.have.property("txData");
    });
  });

  describe("GET /ownership", function(){
    it("responds as expected", function(){
      console.log("address:", responses.getOwnership[0].body.address);
      responses.getOwnership[0].body.address.should.be.equal(ownerAddress);
    });

    it("returns 404 if the serial has not been registered before", function(done){
      request.get({
        url:"/ownership/"+"some_unknown_seial",
        json: true
      }, function(err, res){
        res.statusCode.should.be.equal(404);
        done();
      });
    });
  });
});
