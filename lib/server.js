var express = require('express');
var app = express();

var port = process.env.PORT || 3000;


module.exports = function(cb){
  app.use(require("body-parser").json());

  app.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    next();
  });
  
  app.get('/', function(req, res) {
    res.send('Trac Gateway\n');
  });

  app.use("/ownership", require("./routers/ownership"));
  app.use("/tx", require("./routers/tx"));

  var server = app.listen(port , function(){
    console.log("Listening on port",port);
    if(cb) cb(server);
  });
};
