var async = require("async"),
    should = require("should"),
    crypto = require("crypto"),
    _ = require("lodash"),
    request = require("request");

describe("ownership", function(){
  var server,
      responses;

  var serial = "xyz123",
      secret = "secret",
      newSecret = "newSecret",
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
            address: ownerAddress,
            secretHash: crypto.createHash("sha256").update(secret).digest("hex")
          }
        }),
        getTX: ["postOwnership", function(cb, ress){
          ress.postOwnership[0].statusCode.should.be.equal(200);
          
          waitUntilConfirmed(ress.postOwnership[0].body.txHash, cb);
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

  var newOwnerAddress = "0x0000000000000000000000000000000000000053";

  it("can be transferred if the recepient knows the secret", function(done){
    async.auto({
      put: function(cb){
        request.put({
          url: "/ownership/" + serial,
          json: {
            address: newOwnerAddress,
            secret: secret,
            newSecretHash: crypto.createHash("sha256").update("new secret").digest("hex")
          }
        }, function(err, res, body){
          res.statusCode.should.be.equal(200);
          cb(err, res);
        });
      }, 
      wait: ["put",function(cb, ress){
        waitUntilConfirmed(ress.put.body.txHash, cb);
      }],
      get: ["wait", _.partial(request.get, {
        url: "/ownership/" + serial,
        json: true
      })]
    }, function(err,results){
      if(err) throw err;

      results.get[0].body.address.should.be.equal(newOwnerAddress);

      done();
    });
  });

  it("connot be transferred if the recepient doesn't know the secret", function(){
    
  });

  function waitUntilConfirmed(txHash, cb){
    async.retry({times: 5, interval: 1000}, function(cb){
      if(!txHash) throw new Error("no tx hash!");
      
      request.get({
        url: "/tx/"+txHash,
        json: true
      }, function(err, res, body){
        if(err) throw err;

        if(body.state == "rejected") throw new Error("transaction rejected");

        cb((body.state == "accepted") ? null: "Unconfirmed transaction", res);
      });
    }, cb);
  }
});
